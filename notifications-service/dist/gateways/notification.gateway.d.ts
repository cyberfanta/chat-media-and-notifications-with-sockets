import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../config/redis.config';
import { NotificationService } from '../services/notification.service';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
interface AuthenticatedSocket extends Socket {
    userId?: string;
}
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private redisConfig;
    private notificationService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, redisConfig: RedisConfig, notificationService: NotificationService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinNotifications(client: AuthenticatedSocket): Promise<void>;
    handleGetNotifications(client: AuthenticatedSocket, filters: NotificationFiltersDto): Promise<void>;
    handleMarkAsRead(client: AuthenticatedSocket, data: {
        notificationIds?: string[];
    }): Promise<void>;
    sendNotificationToUser(userId: string, notification: any): Promise<void>;
    sendNotificationToUsers(userIds: string[], notification: any): Promise<void>;
    broadcastNotification(notification: any): Promise<void>;
    private sendUnreadNotifications;
    private extractTokenFromHandshake;
    private initializeRedisSubscription;
}
export {};
