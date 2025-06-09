import { ConfigService } from '@nestjs/config';
export declare class DashboardService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getSystemStats(): Promise<{
        totalJobs: number;
        activeJobs: number;
        totalNotifications: number;
        successRate: number;
        processingTimeAvg: number;
        queueSize: number;
    }>;
    getQueueStatus(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        jobs: ({
            id: string;
            filename: string;
            mediaType: string;
            status: string;
            progress: {
                percentage: number;
                stage: string;
            };
            createdAt: string;
        } | {
            id: string;
            filename: string;
            mediaType: string;
            status: string;
            createdAt: string;
            progress?: undefined;
        })[];
    }>;
    getRecentNotifications(): Promise<({
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
    })[]>;
}
