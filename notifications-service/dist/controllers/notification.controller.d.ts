import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto, MarkAsReadDto } from '../dto/update-notification.dto';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("../entities/notification.entity").Notification>;
    findAll(req: any, filters: NotificationFiltersDto): Promise<{
        notifications: import("../entities/notification.entity").Notification[];
        total: number;
        totalPages: number;
    }>;
    findUnread(req: any): Promise<import("../entities/notification.entity").Notification[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    findOne(id: string, req: any): Promise<import("../entities/notification.entity").Notification>;
    update(id: string, updateNotificationDto: UpdateNotificationDto, req: any): Promise<import("../entities/notification.entity").Notification>;
    markAsRead(id: string, req: any): Promise<import("../entities/notification.entity").Notification>;
    markMultipleAsRead(markAsReadDto: MarkAsReadDto, req: any): Promise<{
        marked: number;
    }>;
    markAllAsRead(req: any): Promise<{
        marked: number;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    cleanupExpired(): Promise<{
        deleted: number;
    }>;
}
