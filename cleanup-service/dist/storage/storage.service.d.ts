import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getStorageInfo(): Promise<{
        totalSpaceGB: number;
        usedSpaceGB: number;
        availableSpaceGB: number;
        usagePercentage: number;
        status: string;
        warning: boolean;
        critical: boolean;
    }>;
    checkStorageHealth(): Promise<{
        warning: boolean;
        critical: boolean;
        status: string;
        totalSpaceGB: number;
        usedSpaceGB: number;
        availableSpaceGB: number;
        usagePercentage: number;
    }>;
}
