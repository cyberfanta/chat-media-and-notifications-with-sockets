export declare enum JobType {
    COMPRESS_IMAGE = "compress_image",
    COMPRESS_VIDEO = "compress_video",
    COMPRESS_AUDIO = "compress_audio",
    GENERATE_THUMBNAILS = "generate_thumbnails",
    FULL_PROCESSING = "full_processing"
}
export declare enum JobStatus {
    WAITING = "waiting",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed",
    DELAYED = "delayed",
    PAUSED = "paused"
}
export declare enum JobPriority {
    LOW = 1,
    NORMAL = 5,
    HIGH = 10,
    CRITICAL = 20
}
export interface JobProgress {
    percentage: number;
    stage: string;
    currentStep?: string;
    totalSteps?: number;
    completedSteps?: number;
    estimatedTimeMs?: number;
}
export interface JobResult {
    success: boolean;
    processedMediaId?: string;
    outputPaths?: string[];
    metadata?: any;
    error?: string;
    duration?: number;
}
export declare class ProcessingJob {
    id: string;
    queueJobId: string;
    queueName: string;
    jobType: JobType;
    status: JobStatus;
    priority: JobPriority;
    mediaId: string;
    uploaderId: string;
    inputPath: string;
    outputPath?: string;
    jobData: any;
    progress?: JobProgress;
    result?: JobResult;
    startedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    attempts: number;
    maxAttempts: number;
    delayMs?: number;
    timeoutMs?: number;
    errorMessage?: string;
    errorStack?: string;
    createdAt: Date;
    updatedAt: Date;
    get isActive(): boolean;
    get isCompleted(): boolean;
    get isFailed(): boolean;
    get isWaiting(): boolean;
    get duration(): number | null;
    get progressPercentage(): number;
    get canRetry(): boolean;
}
