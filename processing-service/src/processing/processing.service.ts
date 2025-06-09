import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ProcessedMedia, ProcessingStatus, MediaType } from '../entities/processed-media.entity';
import { ProcessingJob, JobType, JobStatus } from '../entities/processing-job.entity';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectRepository(ProcessedMedia)
    private processedMediaRepository: Repository<ProcessedMedia>,
    @InjectRepository(ProcessingJob)
    private processingJobRepository: Repository<ProcessingJob>,
    private eventEmitter: EventEmitter2,
  ) {}

  async startProcessing(mediaId: number, uploaderId: number) {
    this.logger.log(`Iniciando procesamiento para media ${mediaId}`);
    
    // Crear job de procesamiento
    const job = this.processingJobRepository.create({
      queueJobId: `job_${Date.now()}_${mediaId}`,
      queueName: 'media-processing',
      jobType: JobType.FULL_PROCESSING,
      mediaId: mediaId.toString(),
      uploaderId: uploaderId.toString(),
      inputPath: `/uploads/media_${mediaId}`,
      jobData: { mediaId, uploaderId },
      status: JobStatus.ACTIVE,
      progress: { percentage: 0, stage: 'iniciando' },
    });
    await this.processingJobRepository.save(job);

    // Simular procesamiento
    this.simulateProcessing(job);
    
    return job;
  }

  private async simulateProcessing(job: ProcessingJob) {
    try {
      // Emitir evento de inicio
      this.eventEmitter.emit('processing.started', { 
        jobId: job.id, 
        mediaId: job.mediaId,
        uploaderId: job.uploaderId 
      });

      // Simular progreso
      for (let progress = 10; progress <= 100; progress += 10) {
        await this.delay(1000); // 1 segundo por cada 10%
        
        job.progress = { percentage: progress, stage: `procesando ${progress}%` };
        await this.processingJobRepository.save(job);
        
        this.eventEmitter.emit('processing.progress', { 
          jobId: job.id, 
          mediaId: job.mediaId,
          uploaderId: job.uploaderId,
          progress 
        });
      }

      // Crear registro de media procesado (simulado)
      const processedMedia = this.processedMediaRepository.create({
        originalMediaId: job.mediaId,
        uploaderId: job.uploaderId,
        mediaType: MediaType.VIDEO,
        originalPath: job.inputPath,
        originalFilename: `media_${job.mediaId}`,
        originalSize: 5000000, // 5MB simulado
        originalMimeType: 'video/mp4',
        compressedPath: `/uploads/processed/media_${job.mediaId}_compressed.mp4`,
        compressedSize: Math.floor(Math.random() * 1000000), // Tamaño simulado
        compressionMetadata: {
          originalSize: 5000000,
          compressedSize: Math.floor(Math.random() * 1000000),
          compressionRatio: Math.random() * 0.8 + 0.2,
          algorithm: 'h264',
          quality: 80,
          format: 'mp4'
        },
        thumbnailMetadata: {
          count: 3,
          dimensions: { width: 1280, height: 720 },
          format: 'jpg',
          paths: [`/thumbnails/thumb_${job.mediaId}_1.jpg`, `/thumbnails/thumb_${job.mediaId}_2.jpg`]
        },
        status: ProcessingStatus.COMPLETED,
        processingStartedAt: job.startedAt,
        processingCompletedAt: new Date(),
        processingDurationMs: 10000, // 10 segundos simulado
      });
      await this.processedMediaRepository.save(processedMedia);

      // Actualizar job como completado
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
      await this.processingJobRepository.save(job);

      // Emitir eventos de finalización
      this.eventEmitter.emit('processing.completed', { 
        jobId: job.id, 
        mediaId: job.mediaId,
        uploaderId: job.uploaderId,
        processedMediaId: processedMedia.id
      });

      this.eventEmitter.emit('media.available.public', { 
        mediaId: job.mediaId,
        processedMediaId: processedMedia.id,
        uploaderId: job.uploaderId
      });

      this.eventEmitter.emit('media.quality.analysis', { 
        mediaId: job.mediaId,
        uploaderId: job.uploaderId,
        qualityScore: Math.floor(Math.random() * 40) + 60, // Score simulado 60-100
        compressionRatio: processedMedia.compressionRatio
      });

    } catch (error) {
      this.logger.error(`Error procesando media ${job.mediaId}:`, error);
      
      job.status = JobStatus.FAILED;
      job.errorMessage = error.message;
      job.attempts = (job.attempts || 0) + 1;
      await this.processingJobRepository.save(job);
      
      this.eventEmitter.emit('processing.failed', { 
        jobId: job.id, 
        mediaId: job.mediaId,
        uploaderId: job.uploaderId,
        error: error.message
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getJobStatus(jobId: string) {
    return this.processingJobRepository.findOne({ where: { id: jobId } });
  }

  async getAllJobs() {
    return this.processingJobRepository.find({
      order: { createdAt: 'DESC' },
      take: 100
    });
  }

  async getProcessedMedia(mediaId: string) {
    return this.processedMediaRepository.findOne({ 
      where: { originalMediaId: mediaId } 
    });
  }
} 