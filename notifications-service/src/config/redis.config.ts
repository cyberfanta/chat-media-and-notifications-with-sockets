import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  private readonly redisClient: Redis;
  private readonly publisherClient: Redis;
  private readonly subscriberClient: Redis;

  constructor(private configService: ConfigService) {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', undefined),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    // Cliente principal para cache
    this.redisClient = new Redis(redisConfig);
    
    // Cliente para publicar mensajes
    this.publisherClient = new Redis(redisConfig);
    
    // Cliente para suscribirse a mensajes
    this.subscriberClient = new Redis(redisConfig);
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getPublisher(): Redis {
    return this.publisherClient;
  }

  getSubscriber(): Redis {
    return this.subscriberClient;
  }

  // Métodos de utilidad para notificaciones
  async cacheUnreadNotifications(userId: string, notifications: any[]): Promise<void> {
    const key = `unread_notifications:${userId}`;
    await this.redisClient.setex(key, 3600, JSON.stringify(notifications)); // Cache por 1 hora
  }

  async getUnreadNotifications(userId: string): Promise<any[] | null> {
    const key = `unread_notifications:${userId}`;
    const cached = await this.redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateUnreadNotifications(userId: string): Promise<void> {
    const key = `unread_notifications:${userId}`;
    await this.redisClient.del(key);
  }

  // Pub/Sub para comunicación entre microservicios
  async publishNotificationEvent(event: string, data: any): Promise<void> {
    await this.publisherClient.publish('notification_events', JSON.stringify({ event, data }));
  }

  // Publicar evento en canal específico
  async publishEvent(channel: string, data: any): Promise<void> {
    await this.publisherClient.publish(channel, JSON.stringify(data));
  }

  async subscribeToMicroserviceEvents(): Promise<void> {
    await this.subscriberClient.subscribe('auth_events', 'media_events', 'comments_events');
  }

  // Gestión de conexiones WebSocket
  async addUserConnection(userId: string, socketId: string): Promise<void> {
    await this.redisClient.sadd(`user_connections:${userId}`, socketId);
  }

  async removeUserConnection(userId: string, socketId: string): Promise<void> {
    await this.redisClient.srem(`user_connections:${userId}`, socketId);
  }

  async getUserConnections(userId: string): Promise<string[]> {
    return await this.redisClient.smembers(`user_connections:${userId}`);
  }

  // Rate limiting para notificaciones
  async checkRateLimit(userId: string, limit: number = 10, window: number = 60): Promise<boolean> {
    const key = `rate_limit:${userId}`;
    const current = await this.redisClient.incr(key);
    
    if (current === 1) {
      await this.redisClient.expire(key, window);
    }
    
    return current <= limit;
  }
} 