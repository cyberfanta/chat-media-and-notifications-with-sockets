import { Injectable, Logger } from '@nestjs/common';

export enum ProcessingNotificationType {
  PROCESSING_STARTED = 'processing_started',
  PROCESSING_PROGRESS = 'processing_progress', 
  PROCESSING_COMPLETED = 'processing_completed',
  PROCESSING_FAILED = 'processing_failed',
  MEDIA_AVAILABLE_PUBLIC = 'media_available_public',
  MEDIA_QUALITY_ANALYSIS = 'media_quality_analysis',
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
  duration?: number; // Para videos/audios
  tags?: string[];
}

@Injectable()
export class NotificationPublisher {
  private readonly logger = new Logger(NotificationPublisher.name);

  constructor() {
    this.logger.log('NotificationPublisher initialized (simplified mode)');
  }

  async publishProcessingStarted(
    mediaId: string,
    uploaderId: string,
    originalFilename: string,
    mediaType: 'image' | 'video' | 'audio',
    data: any,
  ): Promise<void> {
    const payload: ProcessingNotificationPayload = {
      type: ProcessingNotificationType.PROCESSING_STARTED,
      mediaId,
      uploaderId,
      originalFilename,
      mediaType,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logger.log(`[SIMULATION] Processing started notification for media ${mediaId} to user ${uploaderId}`);
    // En el futuro aquí se conectaría con Redis/WebSocket
  }

  async publishProcessingProgress(
    mediaId: string,
    uploaderId: string,
    originalFilename: string,
    mediaType: 'image' | 'video' | 'audio',
    data: any,
  ): Promise<void> {
    const payload: ProcessingNotificationPayload = {
      type: ProcessingNotificationType.PROCESSING_PROGRESS,
      mediaId,
      uploaderId,
      originalFilename, 
      mediaType,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logger.debug(`[SIMULATION] Processing progress ${data.percentage || 0}% for media ${mediaId}`);
  }

  async publishProcessingCompleted(
    mediaId: string,
    uploaderId: string,
    originalFilename: string,
    mediaType: 'image' | 'video' | 'audio',
    data: any,
  ): Promise<void> {
    const payload: ProcessingNotificationPayload = {
      type: ProcessingNotificationType.PROCESSING_COMPLETED,
      mediaId,
      uploaderId,
      originalFilename,
      mediaType,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logger.log(`[SIMULATION] Processing completed notification for media ${mediaId}`);
  }

  async publishProcessingFailed(
    mediaId: string,
    uploaderId: string,
    originalFilename: string,
    mediaType: 'image' | 'video' | 'audio',
    data: any,
  ): Promise<void> {
    const payload: ProcessingNotificationPayload = {
      type: ProcessingNotificationType.PROCESSING_FAILED,
      mediaId,
      uploaderId,
      originalFilename,
      mediaType,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logger.error(`[SIMULATION] Processing failed notification for media ${mediaId}: ${data.error || 'Unknown error'}`);
  }

  async publishMediaAvailablePublic(
    mediaId: string,
    uploaderId: string,
    originalFilename: string,
    mediaType: 'image' | 'video' | 'audio',
    data?: any,
  ): Promise<void> {
    const payload: ProcessingNotificationPayload = {
      type: ProcessingNotificationType.MEDIA_AVAILABLE_PUBLIC,
      mediaId,
      uploaderId,
      originalFilename,
      mediaType,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logger.log(`[SIMULATION] Media available public notification for media ${mediaId} (broadcast to all users)`);
  }

  async publishMediaQualityAnalysis(
    mediaId: string,
    uploaderId: string,
    originalFilename: string,
    mediaType: 'image' | 'video' | 'audio',
    data: any,
  ): Promise<void> {
    const payload: ProcessingNotificationPayload = {
      type: ProcessingNotificationType.MEDIA_QUALITY_ANALYSIS,
      mediaId,
      uploaderId,
      originalFilename,
      mediaType,
      timestamp: new Date().toISOString(),
      data,
    };

    this.logger.log(`[SIMULATION] Media quality analysis notification for media ${mediaId} to user ${uploaderId}`);
  }
} 