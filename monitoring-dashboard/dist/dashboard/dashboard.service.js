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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    async getSystemStats() {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map