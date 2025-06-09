export declare enum ProcessingNotificationType {
    PROCESSING_STARTED = "processing_started",
    PROCESSING_PROGRESS = "processing_progress",
    PROCESSING_COMPLETED = "processing_completed",
    PROCESSING_FAILED = "processing_failed",
    MEDIA_AVAILABLE_PUBLIC = "media_available_public",
    MEDIA_QUALITY_ANALYSIS = "media_quality_analysis"
}
export interface ProcessingNotificationPayload {
    type: ProcessingNotificationType;
    mediaId: string;
    uploaderId: string;
    originalFilename: string;
    mediaType: 'image' | 'video' | 'audio';
    timestamp: string;
    data?: any;
}
export interface ProcessingStartedData {
    estimatedDurationMs?: number;
    queuePosition?: number;
    jobId: string;
}
export interface ProcessingProgressData {
    percentage: number;
    stage: string;
    currentStep?: string;
    estimatedTimeRemainingMs?: number;
}
export interface ProcessingCompletedData {
    processingTimeMs: number;
    compressedSize: number;
    originalSize: number;
    compressionRatio: number;
    thumbnailCount: number;
    outputPaths: string[];
}
export interface ProcessingFailedData {
    error: string;
    retryCount: number;
    maxRetries: number;
    canRetry: boolean;
}
export interface MediaAvailableData {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: number;
    tags?: string[];
}
export declare class NotificationPublisher {
    private readonly logger;
    constructor();
    publishProcessingStarted(mediaId: string, uploaderId: string, originalFilename: string, mediaType: 'image' | 'video' | 'audio', data: any): Promise<void>;
    publishProcessingProgress(mediaId: string, uploaderId: string, originalFilename: string, mediaType: 'image' | 'video' | 'audio', data: any): Promise<void>;
    publishProcessingCompleted(mediaId: string, uploaderId: string, originalFilename: string, mediaType: 'image' | 'video' | 'audio', data: any): Promise<void>;
    publishProcessingFailed(mediaId: string, uploaderId: string, originalFilename: string, mediaType: 'image' | 'video' | 'audio', data: any): Promise<void>;
    publishMediaAvailablePublic(mediaId: string, uploaderId: string, originalFilename: string, mediaType: 'image' | 'video' | 'audio', data?: any): Promise<void>;
    publishMediaQualityAnalysis(mediaId: string, uploaderId: string, originalFilename: string, mediaType: 'image' | 'video' | 'audio', data: any): Promise<void>;
}
