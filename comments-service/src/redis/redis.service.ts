import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://redis-notifications:6379'
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
      // No fallar el servicio por errores de Redis
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    // Conectar automáticamente de forma no bloqueante
    this.connect().catch(err => {
      this.logger.warn('Redis connection failed during startup, will retry later:', err.message);
    });
  }

  private async connect() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch (error) {
      this.logger.warn('Failed to connect to Redis (service will continue without Redis):', error.message);
      // No relanzar el error para que el servicio continúe
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.connect();
      if (this.client.isOpen) {
        await this.client.publish(channel, message);
        this.logger.log(`Published message to ${channel}: ${message}`);
      } else {
        this.logger.warn(`Cannot publish message to ${channel}: Redis not connected`);
      }
    } catch (error) {
      this.logger.warn('Failed to publish message (continuing without Redis):', error.message);
    }
  }

  async publishNotificationEvent(event: string, data: any): Promise<void> {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
      service: 'comments-service'
    });

    await this.publish('notification_events', message);
  }

  async onModuleDestroy() {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }
} 