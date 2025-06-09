export declare enum MediaType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio"
}
export declare enum ProcessingStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export interface CompressionMetadata {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: string;
    quality: number;
    format: string;
}
export interface ThumbnailMetadata {
    count: number;
    dimensions: {
        width: number;
        height: number;
    };
    format: string;
    paths: string[];
}
export declare class ProcessedMedia {
    id: string;
    originalMediaId: string;
    uploaderId: string;
    mediaType: MediaType;
    status: ProcessingStatus;
    originalPath: string;
    originalFilename: string;
    originalSize: number;
    originalMimeType: string;
    compressedPath?: string;
    compressedSize?: number;
    compressionMetadata?: CompressionMetadata;
    thumbnailMetadata?: ThumbnailMetadata;
    processingStartedAt?: Date;
    processingCompletedAt?: Date;
    processingDurationMs?: number;
    errorMessage?: string;
    retryCount: number;
    processingQueueJobId?: string;
    createdAt: Date;
    updatedAt: Date;
    get isProcessing(): boolean;
    get isCompleted(): boolean;
    get isFailed(): boolean;
    get compressionRatio(): number | null;
    get thumbnailCount(): number;
}
