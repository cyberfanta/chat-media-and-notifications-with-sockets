"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const processed_media_entity_1 = require("../entities/processed-media.entity");
const processing_job_entity_1 = require("../entities/processing-job.entity");
let ProcessingService = ProcessingService_1 = class ProcessingService {
    constructor(processedMediaRepository, processingJobRepository, eventEmitter) {
        this.processedMediaRepository = processedMediaRepository;
        this.processingJobRepository = processingJobRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(ProcessingService_1.name);
    }
    async startProcessing(mediaId, uploaderId) {
        this.logger.log(`Iniciando procesamiento para media ${mediaId}`);
        const job = this.processingJobRepository.create({
            queueJobId: `job_${Date.now()}_${mediaId}`,
            queueName: 'media-processing',
            jobType: processing_job_entity_1.JobType.FULL_PROCESSING,
            mediaId: mediaId.toString(),
            uploaderId: uploaderId.toString(),
            inputPath: `/uploads/media_${mediaId}`,
            jobData: { mediaId, uploaderId },
            status: processing_job_entity_1.JobStatus.ACTIVE,
            progress: { percentage: 0, stage: 'iniciando' },
        });
        await this.processingJobRepository.save(job);
        this.simulateProcessing(job);
        return job;
    }
    async simulateProcessing(job) {
        try {
            this.eventEmitter.emit('processing.started', {
                jobId: job.id,
                mediaId: job.mediaId,
                uploaderId: job.uploaderId
            });
            for (let progress = 10; progress <= 100; progress += 10) {
                await this.delay(1000);
                job.progress = { percentage: progress, stage: `procesando ${progress}%` };
                await this.processingJobRepository.save(job);
                this.eventEmitter.emit('processing.progress', {
                    jobId: job.id,
                    mediaId: job.mediaId,
                    uploaderId: job.uploaderId,
                    progress
                });
            }
            const processedMedia = this.processedMediaRepository.create({
                originalMediaId: job.mediaId,
                uploaderId: job.uploaderId,
                mediaType: processed_media_entity_1.MediaType.VIDEO,
                originalPath: job.inputPath,
                originalFilename: `media_${job.mediaId}`,
                originalSize: 5000000,
                originalMimeType: 'video/mp4',
                compressedPath: `/uploads/processed/media_${job.mediaId}_compressed.mp4`,
                compressedSize: Math.floor(Math.random() * 1000000),
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
                status: processed_media_entity_1.ProcessingStatus.COMPLETED,
                processingStartedAt: job.startedAt,
                processingCompletedAt: new Date(),
                processingDurationMs: 10000,
            });
            await this.processedMediaRepository.save(processedMedia);
            job.status = processing_job_entity_1.JobStatus.COMPLETED;
            job.completedAt = new Date();
            await this.processingJobRepository.save(job);
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
                qualityScore: Math.floor(Math.random() * 40) + 60,
                compressionRatio: processedMedia.compressionRatio
            });
        }
        catch (error) {
            this.logger.error(`Error procesando media ${job.mediaId}:`, error);
            job.status = processing_job_entity_1.JobStatus.FAILED;
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getJobStatus(jobId) {
        return this.processingJobRepository.findOne({ where: { id: jobId } });
    }
    async getAllJobs() {
        return this.processingJobRepository.find({
            order: { createdAt: 'DESC' },
            take: 100
        });
    }
    async getProcessedMedia(mediaId) {
        return this.processedMediaRepository.findOne({
            where: { originalMediaId: mediaId }
        });
    }
};
exports.ProcessingService = ProcessingService;
exports.ProcessingService = ProcessingService = ProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(processed_media_entity_1.ProcessedMedia)),
    __param(1, (0, typeorm_1.InjectRepository)(processing_job_entity_1.ProcessingJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], ProcessingService);
//# sourceMappingURL=processing.service.js.map