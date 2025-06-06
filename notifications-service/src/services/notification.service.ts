import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { Notification, NotificationType, NotificationPriority, NotificationChannel } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto, MarkAsReadDto } from '../dto/update-notification.dto';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { RedisConfig } from '../config/redis.config';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private redisConfig: RedisConfig,
  ) {}

  /** Crear una nueva notificación con validación de rate limiting */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const canSend = await this.redisConfig.checkRateLimit(createNotificationDto.userId);
      if (!canSend) {
        throw new BadRequestException('Límite de notificaciones excedido para este usuario');
      }

      const notification = this.notificationRepository.create({
        ...createNotificationDto,
        priority: createNotificationDto.priority || NotificationPriority.MEDIUM,
        channels: createNotificationDto.channels || [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP],
        sentAt: new Date(),
      });

      const savedNotification = await this.notificationRepository.save(notification);

      await this.redisConfig.invalidateUnreadNotifications(createNotificationDto.userId);

      await this.redisConfig.publishNotificationEvent('notification_created', {
        userId: createNotificationDto.userId,
        notification: savedNotification,
      });

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(`Error al crear notificación: ${error.message}`);
    }
  }

  /** Obtener notificaciones del usuario con filtros y paginación */
  async findAll(userId: string, filters: NotificationFiltersDto): Promise<{ notifications: Notification[], total: number, totalPages: number }> {
    const { page = 1, limit = 20, type, priority, isRead, startDate, endDate } = filters;
    
    const whereConditions: any = { userId };

    if (type) {
      whereConditions.type = type;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    if (typeof isRead === 'boolean') {
      whereConditions.isRead = isRead;
    }

    if (startDate && endDate) {
      whereConditions.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const options: FindManyOptions<Notification> = {
      where: whereConditions,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [notifications, total] = await this.notificationRepository.findAndCount(options);
    const totalPages = Math.ceil(total / limit);

    if (isRead === false) {
      await this.redisConfig.cacheUnreadNotifications(userId, notifications);
    }

    return { notifications, total, totalPages };
  }

  /** Obtener notificaciones no leídas con cache de Redis */
  async findUnread(userId: string): Promise<Notification[]> {
    const cached = await this.redisConfig.getUnreadNotifications(userId);
    if (cached) {
      return cached;
    }

    const notifications = await this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    await this.redisConfig.cacheUnreadNotifications(userId, notifications);

    return notifications;
  }

  /** Obtener una notificación específica del usuario */
  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notification;
  }

  /** Actualizar una notificación (principalmente para marcar como leída) */
  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    
    if (updateNotificationDto.isRead !== undefined) {
      notification.isRead = updateNotificationDto.isRead;
      notification.readAt = updateNotificationDto.isRead ? new Date() : null;
    }

    const updatedNotification = await this.notificationRepository.save(notification);

    if (updateNotificationDto.isRead !== undefined) {
      await this.redisConfig.invalidateUnreadNotifications(userId);
    }

    return updatedNotification;
  }

  /** Marcar múltiples notificaciones como leídas */
  async markAsRead(userId: string, markAsReadDto: MarkAsReadDto): Promise<{ marked: number }> {
    let query = this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where('userId = :userId', { userId })
      .andWhere('isRead = false');

    if (markAsReadDto.notificationIds && markAsReadDto.notificationIds.length > 0) {
      query = query.andWhere('id IN (:...ids)', { ids: markAsReadDto.notificationIds });
    }

    const result = await query.execute();

    await this.redisConfig.invalidateUnreadNotifications(userId);

    return { marked: result.affected || 0 };
  }

  /** Marcar todas las notificaciones del usuario como leídas */
  async markAllAsRead(userId: string): Promise<{ marked: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    await this.redisConfig.invalidateUnreadNotifications(userId);

    return { marked: result.affected || 0 };
  }

  /** Eliminar una notificación específica */
  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
    
    await this.redisConfig.invalidateUnreadNotifications(userId);
  }

  /** Obtener el contador de notificaciones no leídas */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /** Limpiar notificaciones expiradas del sistema */
  async cleanupExpiredNotifications(): Promise<{ deleted: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('expiresAt IS NOT NULL')
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    return { deleted: result.affected || 0 };
  }

  /** Crear notificación de bienvenida para nuevo usuario */
  async createWelcomeNotification(userId: string): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.USER_REGISTERED,
      title: '¡Bienvenido!',
      message: 'Te damos la bienvenida a nuestra plataforma. ¡Esperamos que disfrutes la experiencia!',
      priority: NotificationPriority.HIGH,
      channels: [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  /** Crear notificación de nuevo comentario */
  async createCommentNotification(userId: string, commentData: any): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.NEW_COMMENT,
      title: 'Nuevo comentario',
      message: `${commentData.authorName} ha comentado en tu contenido`,
      data: commentData,
      priority: NotificationPriority.MEDIUM,
      relatedEntityId: commentData.contentId,
      relatedEntityType: 'media',
    });
  }

  /** Crear notificación de estado de subida de archivo */
  async createUploadNotification(userId: string, uploadData: any, success: boolean): Promise<Notification> {
    return this.create({
      userId,
      type: success ? NotificationType.UPLOAD_COMPLETED : NotificationType.UPLOAD_FAILED,
      title: success ? 'Subida completada' : 'Error en subida',
      message: success 
        ? `Tu archivo "${uploadData.filename}" se ha subido correctamente`
        : `Hubo un error al subir "${uploadData.filename}"`,
      data: uploadData,
      priority: success ? NotificationPriority.MEDIUM : NotificationPriority.HIGH,
      relatedEntityId: uploadData.mediaId,
      relatedEntityType: 'media',
    });
  }

  /** Enviar una notificación broadcast a todos los usuarios */
  async createBroadcastNotification(notificationData: any): Promise<{ sent: number }> {
    try {
      let sentCount = 0;
      
      const uniqueUserIds = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('DISTINCT notification.userId', 'userId')
        .getRawMany();
      
      const batchPromises = uniqueUserIds
        .filter(user => user.userId !== notificationData.excludeUserId)
        .map(async (user) => {
          try {
            await this.create({
              userId: user.userId,
              type: notificationData.type,
              title: notificationData.title,
              message: notificationData.message,
              data: notificationData.data,
              priority: notificationData.priority,
              relatedEntityId: notificationData.relatedEntityId,
              relatedEntityType: notificationData.relatedEntityType,
              channels: [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP],
            });
            sentCount++;
          } catch (error) {
            this.logger.error(`Error creating broadcast notification for user ${user.userId}:`, error.message);
          }
        });

      await Promise.allSettled(batchPromises);
      
      this.logger.log(`Broadcast notification sent to ${sentCount} users`);
      return { sent: sentCount };
      
    } catch (error) {
      this.logger.error('Error creating broadcast notifications:', error);
      throw new BadRequestException(`Error enviando notificación broadcast: ${error.message}`);
    }
  }
} 