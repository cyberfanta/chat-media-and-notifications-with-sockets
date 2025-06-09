import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProcessedMedia } from '../entities/processed-media.entity';
import { ProcessingJob } from '../entities/processing-job.entity';
export declare class ProcessingService {
    private processedMediaRepository;
    private processingJobRepository;
    private eventEmitter;
    private readonly logger;
    constructor(processedMediaRepository: Repository<ProcessedMedia>, processingJobRepository: Repository<ProcessingJob>, eventEmitter: EventEmitter2);
    startProcessing(mediaId: number, uploaderId: number): Promise<ProcessingJob>;
    private simulateProcessing;
    private delay;
    getJobStatus(jobId: string): Promise<ProcessingJob>;
    getAllJobs(): Promise<ProcessingJob[]>;
    getProcessedMedia(mediaId: string): Promise<ProcessedMedia>;
}
