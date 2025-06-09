import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CleanupLog } from '../entities/cleanup-log.entity';
export declare class CleanupService {
    private cleanupLogRepository;
    private configService;
    private readonly logger;
    constructor(cleanupLogRepository: Repository<CleanupLog>, configService: ConfigService);
    runScheduledCleanup(): Promise<void>;
    cleanupChunks(): Promise<CleanupLog>;
    cleanupUploads(): Promise<CleanupLog>;
    cleanupTempFiles(): Promise<CleanupLog>;
    monitorStorage(): Promise<CleanupLog>;
    getCleanupLogs(limit?: number): Promise<CleanupLog[]>;
    getCleanupStats(): Promise<{
        totalLogs: number;
        totalSpaceFreedMB: number;
        totalItemsDeleted: number;
        lastCleanup: Date;
    }>;
}
