import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../config/redis.config';
import { NotificationService } from '../services/notification.service';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { MarkAsReadDto } from '../dto/update-notification.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  },
  transports: ['websocket'],
  namespace: '/notifications'
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisConfig: RedisConfig,
    private notificationService: NotificationService,
  ) {
    this.initializeRedisSubscription();
  }

  /** Validar conexión WebSocket con autenticación JWT */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`Cliente conectando: ${client.id}`);
      
      // Extraer token del handshake
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        this.logger.warn(`Conexión sin token - Cliente: ${client.id}`);
        // Permitir conexión sin autenticación para testing
        client.userId = null;
      } else {
        try {
          // Verificar el token JWT
          const payload = await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
          });
          client.userId = payload.sub || payload.id;
        } catch (jwtError) {
          this.logger.error(`Token JWT inválido para cliente ${client.id}:`, jwtError.message);
          client.emit('error', { message: 'Token JWT inválido' });
          client.disconnect();
          return;
        }
      }
      
      // Unir el cliente a una sala específica de su usuario
      await client.join(`user_${client.userId}`);
      
      // Registrar la conexión en Redis
      await this.redisConfig.addUserConnection(client.userId, client.id);
      
      this.logger.log(`Cliente autenticado y conectado: ${client.id} - Usuario: ${client.userId}`);
      
      // Enviar notificaciones no leídas al conectarse
      await this.sendUnreadNotifications(client);
      
    } catch (error) {
      this.logger.error(`Error en la conexión del cliente ${client.id}:`, error.stack);
      client.emit('error', { message: 'Error de autenticación' });
      client.disconnect();
    }
  }

  /** Limpiar datos al desconectar cliente */
  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      await this.redisConfig.removeUserConnection(client.userId, client.id);
      this.logger.log(`Cliente desconectado: ${client.id} - Usuario: ${client.userId}`);
    } else {
      this.logger.log(`Cliente desconectado: ${client.id}`);
    }
  }

  /** Unir cliente a sala de notificaciones del usuario */
  @SubscribeMessage('join_notifications')
  async handleJoinNotifications(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      await client.join(`user_${client.userId}`);
      client.emit('joined_notifications', { status: 'success' });
      
      // Enviar contador de notificaciones no leídas
      const unreadCount = await this.notificationService.getUnreadCount(client.userId);
      client.emit('unread_count', { count: unreadCount });
    }
  }

  /** Obtener notificaciones con filtros */
  @SubscribeMessage('get_notifications')
  async handleGetNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() filters: NotificationFiltersDto
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      const result = await this.notificationService.findAll(client.userId, filters);
      client.emit('notifications', result);
    } catch (error) {
      client.emit('error', { message: 'Error al obtener notificaciones' });
    }
  }

  /** Marcar notificaciones como leídas */
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationIds?: string[] }
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'No autenticado' });
      return;
    }

    try {
      const result = await this.notificationService.markAsRead(client.userId, data);
      client.emit('marked_as_read', { marked: result.marked });
      
      // Enviar nuevo contador
      const unreadCount = await this.notificationService.getUnreadCount(client.userId);
      client.emit('unread_count', { count: unreadCount });
      
    } catch (error) {
      client.emit('error', { message: 'Error al marcar como leída' });
    }
  }

  /** Enviar notificación en tiempo real a usuario específico */
  async sendNotificationToUser(userId: string, notification: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit('new_notification', notification);
    
    // También enviar contador actualizado
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    this.server.to(room).emit('unread_count', { count: unreadCount });
  }

  /** Enviar notificación a múltiples usuarios */
  async sendNotificationToUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
    }
  }

  /** Enviar mensaje broadcast a todos los usuarios conectados */
  async broadcastNotification(notification: any) {
    this.server.emit('broadcast_notification', notification);
  }

  private async sendUnreadNotifications(client: AuthenticatedSocket) {
    if (!client.userId) return;

    try {
      const unreadNotifications = await this.notificationService.findUnread(client.userId);
      const unreadCount = unreadNotifications.length;
      
      client.emit('unread_notifications', unreadNotifications);
      client.emit('unread_count', { count: unreadCount });
      
    } catch (error) {
      this.logger.error(`Error al enviar notificaciones no leídas a ${client.userId}:`, error.stack);
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // Intentar obtener el token del query string
    const tokenFromQuery = client.handshake.query.token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    // Intentar obtener el token del header Authorization
    const authHeader = client.handshake.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : null;
    }

    return null;
  }

  private async initializeRedisSubscription() {
    const subscriber = this.redisConfig.getSubscriber();
    
    // Solo suscribirse a eventos de notificaciones ya creadas
    subscriber.subscribe('notification_created');
    
    subscriber.on('message', async (channel, message) => {
      try {
        this.logger.log(`Gateway recibió evento: ${channel}`);
        const data = JSON.parse(message);
        
        if (channel === 'notification_created') {
          // Enviar la notificación por WebSocket al usuario
          await this.sendNotificationToUser(data.userId, data.notification);
          this.logger.log(`Notificación enviada por WebSocket a usuario: ${data.userId}`);
        }
      } catch (error) {
        this.logger.error('Error procesando mensaje de Redis:', error.stack);
      }
    });
  }
} 