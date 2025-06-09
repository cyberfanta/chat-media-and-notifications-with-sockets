import { ConfigService } from '@nestjs/config';
import * as Redis from 'redis';
import { Notification } from '../entities/notification.entity';
export declare class RedisConfig {
    private configService;
    private readonly logger;
    private redisClient;
    private publisher;
    private subscriber;
    constructor(configService: ConfigService);
    private initializeClients;
    getClient(): Redis.RedisClientType;
    getPublisher(): Redis.RedisClientType;
    getSubscriber(): Redis.RedisClientType;
    cacheUnreadNotifications(userId: string, notifications: Notification[]): Promise<void>;
    getUnreadNotifications(userId: string): Promise<Notification[] | null>;
    invalidateUnreadNotifications(userId: string): Promise<void>;
    publishNotificationEvent(eventType: string, data: any): Promise<void>;
    subscribeToNotificationEvents(eventType: string, callback: (message: string) => void): Promise<void>;
    addUserConnection(userId: string, socketId: string): Promise<void>;
    removeUserConnection(userId: string, socketId: string): Promise<void>;
    getUserConnections(userId: string): Promise<string[]>;
    checkRateLimit(userId: string): Promise<boolean>;
}
