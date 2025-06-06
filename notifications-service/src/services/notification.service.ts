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

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      // Verificar rate limiting
      const canSend = await this.redisConfig.checkRateLimit(createNotificationDto.userId);
      if (!canSend) {
        throw new BadRequestException('Límite de notificaciones excedido para este usuario');
      }

      // Crear la notificación
      const notification = this.notificationRepository.create({
        ...createNotificationDto,
        priority: createNotificationDto.priority || NotificationPriority.MEDIUM,
        channels: createNotificationDto.channels || [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP],
        sentAt: new Date(),
      });

      const savedNotification = await this.notificationRepository.save(notification);

      // Invalidar cache de notificaciones no leídas
      await this.redisConfig.invalidateUnreadNotifications(createNotificationDto.userId);

      // Publicar evento para envío por WebSocket
      await this.redisConfig.publishNotificationEvent('notification_created', {
        userId: createNotificationDto.userId,
        notification: savedNotification,
      });

      return savedNotification;
    } catch (error) {
      throw new BadRequestException(`Error al crear notificación: ${error.message}`);
    }
  }

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

    // Cache notificaciones no leídas si se piden solo las no leídas
    if (isRead === false) {
      await this.redisConfig.cacheUnreadNotifications(userId, notifications);
    }

    return { notifications, total, totalPages };
  }

  async findUnread(userId: string): Promise<Notification[]> {
    // Intentar obtener del cache primero
    const cached = await this.redisConfig.getUnreadNotifications(userId);
    if (cached) {
      return cached;
    }

    // Si no está en cache, consultar la base de datos
    const notifications = await this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
      take: 50, // Limitar a las 50 más recientes
    });

    // Cachear el resultado
    await this.redisConfig.cacheUnreadNotifications(userId, notifications);

    return notifications;
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }

    return notification;
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    
    if (updateNotificationDto.isRead !== undefined) {
      notification.isRead = updateNotificationDto.isRead;
      notification.readAt = updateNotificationDto.isRead ? new Date() : null;
    }

    const updatedNotification = await this.notificationRepository.save(notification);

    // Invalidar cache si se marcó como leída/no leída
    if (updateNotificationDto.isRead !== undefined) {
      await this.redisConfig.invalidateUnreadNotifications(userId);
    }

    return updatedNotification;
  }

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

    // Invalidar cache
    await this.redisConfig.invalidateUnreadNotifications(userId);

    return { marked: result.affected || 0 };
  }

  async markAllAsRead(userId: string): Promise<{ marked: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Invalidar cache
    await this.redisConfig.invalidateUnreadNotifications(userId);

    return { marked: result.affected || 0 };
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
    
    // Invalidar cache
    await this.redisConfig.invalidateUnreadNotifications(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

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

  // Métodos de utilidad para diferentes tipos de notificaciones
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

  async createBroadcastNotification(notificationData: any): Promise<{ sent: number }> {
    try {
      let sentCount = 0;
      
      // Obtener todos los usuarios únicos de la base de datos
      const uniqueUserIds = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('DISTINCT notification.userId', 'userId')
        .getRawMany();
      
      // Crear notificaciones para todos los usuarios excepto el excluido
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

      // Ejecutar todas las promesas en paralelo
      await Promise.allSettled(batchPromises);
      
      this.logger.log(`Broadcast notification sent to ${sentCount} users`);
      return { sent: sentCount };
      
    } catch (error) {
      this.logger.error('Error creating broadcast notifications:', error);
      throw new BadRequestException(`Error enviando notificación broadcast: ${error.message}`);
    }
  }
} 