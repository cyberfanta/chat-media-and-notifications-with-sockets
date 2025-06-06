import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto, MarkAsReadDto } from '../dto/update-notification.dto';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { RedisConfig } from '../config/redis.config';
export declare class NotificationService {
    private notificationRepository;
    private redisConfig;
    private readonly logger;
    constructor(notificationRepository: Repository<Notification>, redisConfig: RedisConfig);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    findAll(userId: string, filters: NotificationFiltersDto): Promise<{
        notifications: Notification[];
        total: number;
        totalPages: number;
    }>;
    findUnread(userId: string): Promise<Notification[]>;
    findOne(id: string, userId: string): Promise<Notification>;
    update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification>;
    markAsRead(userId: string, markAsReadDto: MarkAsReadDto): Promise<{
        marked: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        marked: number;
    }>;
    remove(id: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    cleanupExpiredNotifications(): Promise<{
        deleted: number;
    }>;
    createWelcomeNotification(userId: string): Promise<Notification>;
    createCommentNotification(userId: string, commentData: any): Promise<Notification>;
    createUploadNotification(userId: string, uploadData: any, success: boolean): Promise<Notification>;
    createBroadcastNotification(notificationData: any): Promise<{
        sent: number;
    }>;
}
