import { ProcessingService } from './processing.service';
export declare class ProcessingController {
    private readonly processingService;
    private readonly logger;
    constructor(processingService: ProcessingService);
    startProcessing(body: {
        mediaId: number;
        uploaderId: number;
    }): Promise<{
        success: boolean;
        message: string;
        jobId: string;
        data: import("../entities/processing-job.entity").ProcessingJob;
    }>;
    getJobStatus(id: string): Promise<{
        success: boolean;
        data: import("../entities/processing-job.entity").ProcessingJob;
    }>;
    getAllJobs(): Promise<{
        success: boolean;
        data: import("../entities/processing-job.entity").ProcessingJob[];
        total: number;
    }>;
    getProcessedMedia(id: string): Promise<{
        success: boolean;
        data: import("../entities/processed-media.entity").ProcessedMedia;
    }>;
    healthCheck(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        service: string;
        version: string;
    }>;
}
