import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class RedisConfig {
  private readonly logger = new Logger(RedisConfig.name);
  
  private redisClient: Redis.RedisClientType;
  private publisher: Redis.RedisClientType;
  private subscriber: Redis.RedisClientType;

  constructor(private configService: ConfigService) {
    this.initializeClients();
  }

  private async initializeClients() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'redis-notifications');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    
    const redisConfig = {
      socket: {
        host: redisHost,
        port: redisPort,
        family: 4, // Forzar IPv4
      },
      password: redisPassword || undefined,
    };
    
    this.redisClient = Redis.createClient(redisConfig);
    this.publisher = Redis.createClient(redisConfig);
    this.subscriber = Redis.createClient(redisConfig);

    await Promise.all([
      this.redisClient.connect(),
      this.publisher.connect(),
      this.subscriber.connect(),
    ]);

    this.logger.log('Redis clients connected successfully');
  }

  getClient(): Redis.RedisClientType {
    return this.redisClient;
  }

  getPublisher(): Redis.RedisClientType {
    return this.publisher;
  }

  getSubscriber(): Redis.RedisClientType {
    return this.subscriber;
  }

  /** Cachear notificaciones no leídas del usuario */
  async cacheUnreadNotifications(userId: string, notifications: Notification[]): Promise<void> {
    const key = `unread_notifications:${userId}`;
    const ttl = 3600;
    
    await this.redisClient.setEx(key, ttl, JSON.stringify(notifications));
  }

  /** Obtener notificaciones no leídas del cache */
  async getUnreadNotifications(userId: string): Promise<Notification[] | null> {
    const key = `unread_notifications:${userId}`;
    const cached = await this.redisClient.get(key);
    
    return cached ? JSON.parse(cached) : null;
  }

  /** Invalidar cache de notificaciones no leídas */
  async invalidateUnreadNotifications(userId: string): Promise<void> {
    const key = `unread_notifications:${userId}`;
    await this.redisClient.del(key);
  }

  /** Publicar evento de notificación entre microservicios */
  async publishNotificationEvent(eventType: string, data: any): Promise<void> {
    await this.publisher.publish(`notification:${eventType}`, JSON.stringify(data));
  }

  /** Suscribirse a eventos de notificaciones */
  async subscribeToNotificationEvents(eventType: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(`notification:${eventType}`, callback);
  }

  /** Agregar conexión WebSocket activa del usuario */
  async addUserConnection(userId: string, socketId: string): Promise<void> {
    const key = `user_connections:${userId}`;
    await this.redisClient.sAdd(key, socketId);
    await this.redisClient.expire(key, 3600);
  }

  /** Remover conexión WebSocket del usuario */
  async removeUserConnection(userId: string, socketId: string): Promise<void> {
    const key = `user_connections:${userId}`;
    await this.redisClient.sRem(key, socketId);
  }

  /** Obtener todas las conexiones activas del usuario */
  async getUserConnections(userId: string): Promise<string[]> {
    const key = `user_connections:${userId}`;
    return await this.redisClient.sMembers(key);
  }

  /** Verificar límite de rate limiting para notificaciones */
  async checkRateLimit(userId: string): Promise<boolean> {
    const key = `rate_limit:${userId}`;
    const current = await this.redisClient.incr(key);
    
    if (current === 1) {
      await this.redisClient.expire(key, 60);
    }
    
    return current <= 10;
  }
} 