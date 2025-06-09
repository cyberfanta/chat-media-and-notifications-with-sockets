import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationPublisher } from './notification-publisher.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private notificationPublisher: NotificationPublisher) {}

  @OnEvent('processing.started')
  async handleProcessingStarted(payload: any) {
    this.logger.log(`Handling processing started event for media ${payload.mediaId}`);
    
    await this.notificationPublisher.publishProcessingStarted(
      payload.mediaId.toString(),
      payload.uploaderId.toString(),
      `media_${payload.mediaId}`,
      'video', // Default type
      { jobId: payload.jobId }
    );
  }

  @OnEvent('processing.progress')
  async handleProcessingProgress(payload: any) {
    this.logger.debug(`Handling processing progress event: ${payload.progress}%`);
    
    await this.notificationPublisher.publishProcessingProgress(
      payload.mediaId.toString(),
      payload.uploaderId.toString(),
      `media_${payload.mediaId}`,
      'video',
      { percentage: payload.progress }
    );
  }

  @OnEvent('processing.completed')
  async handleProcessingCompleted(payload: any) {
    this.logger.log(`Handling processing completed event for media ${payload.mediaId}`);
    
    await this.notificationPublisher.publishProcessingCompleted(
      payload.mediaId.toString(),
      payload.uploaderId.toString(),
      `media_${payload.mediaId}`,
      'video',
      { processedMediaId: payload.processedMediaId }
    );
  }

  @OnEvent('processing.failed')
  async handleProcessingFailed(payload: any) {
    this.logger.error(`Handling processing failed event for media ${payload.mediaId}`);
    
    await this.notificationPublisher.publishProcessingFailed(
      payload.mediaId.toString(),
      payload.uploaderId.toString(),
      `media_${payload.mediaId}`,
      'video',
      { error: payload.error }
    );
  }

  @OnEvent('media.available.public')
  async handleMediaAvailablePublic(payload: any) {
    this.logger.log(`Handling media available public event for media ${payload.mediaId}`);
    
    await this.notificationPublisher.publishMediaAvailablePublic(
      payload.mediaId.toString(),
      payload.uploaderId.toString(),
      `media_${payload.mediaId}`,
      'video'
    );
  }

  @OnEvent('media.quality.analysis')
  async handleMediaQualityAnalysis(payload: any) {
    this.logger.log(`Handling media quality analysis event for media ${payload.mediaId}`);
    
    await this.notificationPublisher.publishMediaQualityAnalysis(
      payload.mediaId.toString(),
      payload.uploaderId.toString(),
      `media_${payload.mediaId}`,
      'video',
      { qualityScore: payload.qualityScore }
    );
  }
} 