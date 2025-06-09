export declare enum CleanupType {
    CHUNKS = "chunks",
    UPLOADS = "uploads",
    TEMP_FILES = "temp_files",
    STORAGE_MONITORING = "storage_monitoring"
}
export declare enum CleanupStatus {
    SUCCESS = "success",
    PARTIAL = "partial",
    FAILED = "failed"
}
export declare class CleanupLog {
    id: string;
    type: CleanupType;
    status: CleanupStatus;
    itemsProcessed: number;
    itemsDeleted: number;
    spaceFreedBytes: number;
    executionTimeMs: number;
    details?: any;
    errorMessage?: string;
    createdAt: Date;
    get isSuccess(): boolean;
    get spaceFreedMB(): number;
    get executionTimeSeconds(): number;
}
