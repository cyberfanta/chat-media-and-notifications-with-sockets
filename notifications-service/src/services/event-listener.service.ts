import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { NotificationService } from './notification.service';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

@Injectable()
export class EventListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventListenerService.name);
  private subscriber: RedisClientType;

  constructor(private notificationService: NotificationService) {
    this.subscriber = createClient({
      url: process.env.REDIS_URL || 'redis://redis-notifications:6379'
    });

    this.subscriber.on('error', (err) => {
      this.logger.error('Redis Subscriber Error:', err);
    });

    this.subscriber.on('connect', () => {
      this.logger.log('Redis Subscriber connected');
    });
  }

  async onModuleInit() {
    try {
      await this.subscriber.connect();
      await this.subscriber.subscribe('notification_events', (message) => {
        this.handleNotificationEvent(message);
      });
      this.logger.log('Subscribed to notification_events channel');
    } catch (error) {
      this.logger.error('Failed to subscribe to Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.subscriber && this.subscriber.isOpen) {
      await this.subscriber.quit();
      this.logger.log('Redis subscriber connection closed');
    }
  }

  private async handleNotificationEvent(message: string) {
    try {
      const eventData = JSON.parse(message);
      const { event, data, service } = eventData;

      this.logger.log(`Received event: ${event} from ${service}`);

      switch (event) {
        case 'user_registered':
          await this.handleUserRegistered(data);
          break;
        case 'user_login':
          await this.handleUserLogin(data);
          break;
        case 'upload_completed':
          await this.handleUploadCompleted(data);
          break;
        case 'new_comment':
          await this.handleNewComment(data);
          break;
        default:
          this.logger.warn(`Unknown event type: ${event}`);
      }
    } catch (error) {
      this.logger.error('Error handling notification event:', error);
    }
  }

  private async handleUserRegistered(data: any) {
    try {
      await this.notificationService.create({
        userId: data.userId,
        type: NotificationType.USER_REGISTERED,
        title: '¡Bienvenido a la plataforma!',
        message: `Hola ${data.firstName}, tu cuenta ha sido creada exitosamente. ¡Comienza a explorar y subir contenido!`,
        priority: NotificationPriority.HIGH,
        data: {
          registrationDate: data.registrationDate,
          email: data.email
        }
      });
      this.logger.log(`Welcome notification created for user: ${data.userId}`);
    } catch (error) {
      this.logger.error('Error creating welcome notification:', error);
    }
  }

  private async handleUserLogin(data: any) {
    try {
      await this.notificationService.create({
        userId: data.userId,
        type: NotificationType.LOGIN_NEW_DEVICE,
        title: 'Nuevo acceso a tu cuenta',
        message: `Se ha detectado un nuevo acceso a tu cuenta desde un dispositivo. Si no fuiste tú, cambia tu contraseña inmediatamente.`,
        priority: NotificationPriority.MEDIUM,
        data: {
          loginTime: data.loginTime,
          userAgent: data.userAgent,
          email: data.email
        }
      });
      this.logger.log(`Login notification created for user: ${data.userId}`);
    } catch (error) {
      this.logger.error('Error creating login notification:', error);
    }
  }

  private async handleUploadCompleted(data: any) {
    try {
      // 1. Notificación de confirmación para el usuario que subió
      await this.notificationService.create({
        userId: data.userId,
        type: NotificationType.UPLOAD_COMPLETED,
        title: 'Archivo subido exitosamente',
        message: `Tu archivo "${data.fileName}" ha sido procesado y está listo para compartir.`,
        priority: NotificationPriority.MEDIUM,
        data: {
          mediaId: data.mediaId,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mediaType: data.mediaType,
          completedAt: data.completedAt
        },
        relatedEntityId: data.mediaId,
        relatedEntityType: 'media'
      });
      
      this.logger.log(`Upload confirmation sent to user: ${data.userId}, media: ${data.mediaId}`);

      // 2. Notificación de nuevo contenido para todos los usuarios
      await this.notificationService.createBroadcastNotification({
        type: NotificationType.NEW_CONTENT,
        title: '🎬 Nuevo contenido disponible',
        message: `Se ha subido nuevo contenido: "${data.fileName}". ¡Échale un vistazo!`,
        priority: NotificationPriority.LOW,
        data: {
          mediaId: data.mediaId,
          fileName: data.fileName,
          mediaType: data.mediaType,
          uploadedBy: data.userId,
          completedAt: data.completedAt
        },
        relatedEntityId: data.mediaId,
        relatedEntityType: 'media',
        excludeUserId: data.userId // No notificar al usuario que subió
      });

      this.logger.log(`Broadcast notification sent for new content: ${data.mediaId}`);
      
    } catch (error) {
      this.logger.error('Error creating upload notifications:', error);
    }
  }

  private async handleNewComment(data: any) {
    try {
      // Necesitamos obtener el dueño del contenido para enviarle la notificación
      // Por ahora, asumimos que el contentId contiene información del dueño
      // En un sistema real, harías una consulta al media service para obtener el dueño
      
      const title = data.isReply ? 'Nueva respuesta a tu comentario' : 'Nuevo comentario en tu contenido';
      const message = data.isReply 
        ? `${data.authorEmail} respondió a tu comentario: "${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}"`
        : `${data.authorEmail} comentó en tu contenido: "${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}"`;

      // Por ahora, crear notificación para el autor del comentario (para testing)
      // En producción, esto debería ir al dueño del contenido
      await this.notificationService.create({
        userId: data.authorId, // Cambiar por contentOwnerId en producción
        type: data.isReply ? NotificationType.COMMENT_REPLY : NotificationType.NEW_COMMENT,
        title,
        message,
        priority: NotificationPriority.MEDIUM,
        data: {
          commentId: data.commentId,
          contentId: data.contentId,
          authorId: data.authorId,
          authorEmail: data.authorEmail,
          content: data.content,
          parentId: data.parentId,
          isReply: data.isReply,
          createdAt: data.createdAt
        },
        relatedEntityId: data.commentId,
        relatedEntityType: 'comment'
      });
      
      this.logger.log(`Comment notification created for comment: ${data.commentId}`);
    } catch (error) {
      this.logger.error('Error creating comment notification:', error);
    }
  }
} 