import { DashboardService } from '../dashboard/dashboard.service';
export declare class NotificationsController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getNotifications(limit?: number, type?: string): Promise<{
        notifications: ({
            type: string;
            mediaId: string;
            uploaderId: string;
            originalFilename: string;
            mediaType: string;
            timestamp: string;
            data: {
                estimatedDurationMs: number;
                jobId: string;
                processingTimeMs?: undefined;
                compressionRatio?: undefined;
                thumbnailCount?: undefined;
                title?: undefined;
                duration?: undefined;
            };
        } | {
            type: string;
            mediaId: string;
            uploaderId: string;
            originalFilename: string;
            mediaType: string;
            timestamp: string;
            data: {
                processingTimeMs: number;
                compressionRatio: number;
                thumbnailCount: number;
                estimatedDurationMs?: undefined;
                jobId?: undefined;
                title?: undefined;
                duration?: undefined;
            };
        } | {
            type: string;
            mediaId: string;
            uploaderId: string;
            originalFilename: string;
            mediaType: string;
            timestamp: string;
            data: {
                title: string;
                duration: number;
                estimatedDurationMs?: undefined;
                jobId?: undefined;
                processingTimeMs?: undefined;
                compressionRatio?: undefined;
                thumbnailCount?: undefined;
            };
        })[];
        total: number;
        unread: number;
    }>;
}
