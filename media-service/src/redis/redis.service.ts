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
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    // Conectar automáticamente
    this.connect();
  }

  private async connect() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.connect();
      await this.client.publish(channel, message);
      this.logger.log(`Published message to ${channel}: ${message}`);
    } catch (error) {
      this.logger.error('Failed to publish message:', error);
    }
  }

  async publishNotificationEvent(event: string, data: any): Promise<void> {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
      service: 'media-service'
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