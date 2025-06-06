import { NotificationType, NotificationPriority, NotificationChannel } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    expiresAt?: Date;
    relatedEntityId?: string;
    relatedEntityType?: string;
}
