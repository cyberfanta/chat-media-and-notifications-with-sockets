import { NotificationPublisher } from './notification-publisher.service';
export declare class EventsService {
    private notificationPublisher;
    private readonly logger;
    constructor(notificationPublisher: NotificationPublisher);
    handleProcessingStarted(payload: any): Promise<void>;
    handleProcessingProgress(payload: any): Promise<void>;
    handleProcessingCompleted(payload: any): Promise<void>;
    handleProcessingFailed(payload: any): Promise<void>;
    handleMediaAvailablePublic(payload: any): Promise<void>;
    handleMediaQualityAnalysis(payload: any): Promise<void>;
}
