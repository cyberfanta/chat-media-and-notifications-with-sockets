import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private configService: ConfigService) {}

  async getSystemStats() {
    // Simulación de estadísticas - en implementación real conectaría a BD y Redis
    return {
      totalJobs: 125,
      activeJobs: 3,
      totalNotifications: 89,
      successRate: 95,
      processingTimeAvg: 45000,
      queueSize: 8,
    };
  }

  async getQueueStatus() {
    // Simulación de estado de cola
    return {
      waiting: 5,
      active: 3,
      completed: 112,
      failed: 5,
      jobs: [
        {
          id: '1',
          filename: 'video_sample.mp4',
          mediaType: 'video',
          status: 'active',
          progress: { percentage: 75, stage: 'Compressing video' },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          filename: 'image_sample.jpg',
          mediaType: 'image',
          status: 'waiting',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          filename: 'audio_sample.mp3',
          mediaType: 'audio',
          status: 'active',
          progress: { percentage: 30, stage: 'Generating thumbnails' },
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  async getRecentNotifications() {
    // Simulación de notificaciones recientes
    return [
      {
        type: 'processing_started',
        mediaId: 'media-123',
        uploaderId: 'user-456',
        originalFilename: 'vacation_video.mp4',
        mediaType: 'video',
        timestamp: new Date().toISOString(),
        data: { estimatedDurationMs: 120000, jobId: 'job-789' },
      },
      {
        type: 'processing_completed',
        mediaId: 'media-124',
        uploaderId: 'user-457',
        originalFilename: 'profile_pic.jpg',
        mediaType: 'image',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        data: { processingTimeMs: 5000, compressionRatio: 0.7, thumbnailCount: 1 },
      },
      {
        type: 'media_available_public',
        mediaId: 'media-125',
        uploaderId: 'user-458',
        originalFilename: 'song.mp3',
        mediaType: 'audio',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        data: { title: 'My Favorite Song', duration: 180 },
      },
    ];
  }
}