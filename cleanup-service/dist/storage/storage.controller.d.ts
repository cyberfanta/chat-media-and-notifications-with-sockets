import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getStorageInfo(): Promise<{
        storage: {
            totalSpaceGB: number;
            usedSpaceGB: number;
            availableSpaceGB: number;
            usagePercentage: number;
            status: string;
            warning: boolean;
            critical: boolean;
        };
    }>;
    getStorageHealth(): Promise<{
        health: {
            warning: boolean;
            critical: boolean;
            status: string;
            totalSpaceGB: number;
            usedSpaceGB: number;
            availableSpaceGB: number;
            usagePercentage: number;
        };
    }>;
}
