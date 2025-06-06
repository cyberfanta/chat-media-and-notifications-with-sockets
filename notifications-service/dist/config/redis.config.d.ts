import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisConfig {
    private configService;
    private readonly redisClient;
    private readonly publisherClient;
    private readonly subscriberClient;
    constructor(configService: ConfigService);
    getClient(): Redis;
    getPublisher(): Redis;
    getSubscriber(): Redis;
    cacheUnreadNotifications(userId: string, notifications: any[]): Promise<void>;
    getUnreadNotifications(userId: string): Promise<any[] | null>;
    invalidateUnreadNotifications(userId: string): Promise<void>;
    publishNotificationEvent(event: string, data: any): Promise<void>;
    publishEvent(channel: string, data: any): Promise<void>;
    subscribeToMicroserviceEvents(): Promise<void>;
    addUserConnection(userId: string, socketId: string): Promise<void>;
    removeUserConnection(userId: string, socketId: string): Promise<void>;
    getUserConnections(userId: string): Promise<string[]>;
    checkRateLimit(userId: string, limit?: number, window?: number): Promise<boolean>;
}
