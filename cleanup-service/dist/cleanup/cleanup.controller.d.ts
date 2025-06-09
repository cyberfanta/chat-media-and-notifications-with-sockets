import { CleanupService } from './cleanup.service';
export declare class CleanupController {
    private readonly cleanupService;
    constructor(cleanupService: CleanupService);
    runCleanup(): Promise<{
        message: string;
    }>;
    getCleanupLogs(): Promise<{
        logs: import("../entities/cleanup-log.entity").CleanupLog[];
    }>;
    getCleanupStats(): Promise<{
        stats: {
            totalLogs: number;
            totalSpaceFreedMB: number;
            totalItemsDeleted: number;
            lastCleanup: Date;
        };
    }>;
}
