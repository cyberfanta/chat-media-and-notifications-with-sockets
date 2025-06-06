import { NotificationType, NotificationPriority } from '../entities/notification.entity';
export declare class NotificationFiltersDto {
    type?: NotificationType;
    priority?: NotificationPriority;
    isRead?: boolean;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}
