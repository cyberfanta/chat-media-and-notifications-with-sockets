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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const notification_publisher_service_1 = require("./notification-publisher.service");
let EventsService = EventsService_1 = class EventsService {
    constructor(notificationPublisher) {
        this.notificationPublisher = notificationPublisher;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    async handleProcessingStarted(payload) {
        this.logger.log(`Handling processing started event for media ${payload.mediaId}`);
        await this.notificationPublisher.publishProcessingStarted(payload.mediaId.toString(), payload.uploaderId.toString(), `media_${payload.mediaId}`, 'video', { jobId: payload.jobId });
    }
    async handleProcessingProgress(payload) {
        this.logger.debug(`Handling processing progress event: ${payload.progress}%`);
        await this.notificationPublisher.publishProcessingProgress(payload.mediaId.toString(), payload.uploaderId.toString(), `media_${payload.mediaId}`, 'video', { percentage: payload.progress });
    }
    async handleProcessingCompleted(payload) {
        this.logger.log(`Handling processing completed event for media ${payload.mediaId}`);
        await this.notificationPublisher.publishProcessingCompleted(payload.mediaId.toString(), payload.uploaderId.toString(), `media_${payload.mediaId}`, 'video', { processedMediaId: payload.processedMediaId });
    }
    async handleProcessingFailed(payload) {
        this.logger.error(`Handling processing failed event for media ${payload.mediaId}`);
        await this.notificationPublisher.publishProcessingFailed(payload.mediaId.toString(), payload.uploaderId.toString(), `media_${payload.mediaId}`, 'video', { error: payload.error });
    }
    async handleMediaAvailablePublic(payload) {
        this.logger.log(`Handling media available public event for media ${payload.mediaId}`);
        await this.notificationPublisher.publishMediaAvailablePublic(payload.mediaId.toString(), payload.uploaderId.toString(), `media_${payload.mediaId}`, 'video');
    }
    async handleMediaQualityAnalysis(payload) {
        this.logger.log(`Handling media quality analysis event for media ${payload.mediaId}`);
        await this.notificationPublisher.publishMediaQualityAnalysis(payload.mediaId.toString(), payload.uploaderId.toString(), `media_${payload.mediaId}`, 'video', { qualityScore: payload.qualityScore });
    }
};
exports.EventsService = EventsService;
__decorate([
    (0, event_emitter_1.OnEvent)('processing.started'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsService.prototype, "handleProcessingStarted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('processing.progress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsService.prototype, "handleProcessingProgress", null);
__decorate([
    (0, event_emitter_1.OnEvent)('processing.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsService.prototype, "handleProcessingCompleted", null);
__decorate([
    (0, event_emitter_1.OnEvent)('processing.failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsService.prototype, "handleProcessingFailed", null);
__decorate([
    (0, event_emitter_1.OnEvent)('media.available.public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsService.prototype, "handleMediaAvailablePublic", null);
__decorate([
    (0, event_emitter_1.OnEvent)('media.quality.analysis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsService.prototype, "handleMediaQualityAnalysis", null);
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_publisher_service_1.NotificationPublisher])
], EventsService);
//# sourceMappingURL=events.service.js.map