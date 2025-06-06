import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { NotificationService } from './notification.service';
export declare class EventListenerService implements OnModuleInit, OnModuleDestroy {
    private notificationService;
    private readonly logger;
    private subscriber;
    constructor(notificationService: NotificationService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private handleNotificationEvent;
    private handleUserRegistered;
    private handleUserLogin;
    private handleUploadCompleted;
    private handleNewComment;
}
