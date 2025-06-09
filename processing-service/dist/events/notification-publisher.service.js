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
var NotificationPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPublisher = exports.ProcessingNotificationType = void 0;
const common_1 = require("@nestjs/common");
var ProcessingNotificationType;
(function (ProcessingNotificationType) {
    ProcessingNotificationType["PROCESSING_STARTED"] = "processing_started";
    ProcessingNotificationType["PROCESSING_PROGRESS"] = "processing_progress";
    ProcessingNotificationType["PROCESSING_COMPLETED"] = "processing_completed";
    ProcessingNotificationType["PROCESSING_FAILED"] = "processing_failed";
    ProcessingNotificationType["MEDIA_AVAILABLE_PUBLIC"] = "media_available_public";
    ProcessingNotificationType["MEDIA_QUALITY_ANALYSIS"] = "media_quality_analysis";
})(ProcessingNotificationType || (exports.ProcessingNotificationType = ProcessingNotificationType = {}));
let NotificationPublisher = NotificationPublisher_1 = class NotificationPublisher {
    constructor() {
        this.logger = new common_1.Logger(NotificationPublisher_1.name);
        this.logger.log('NotificationPublisher initialized (simplified mode)');
    }
    async publishProcessingStarted(mediaId, uploaderId, originalFilename, mediaType, data) {
        const payload = {
            type: ProcessingNotificationType.PROCESSING_STARTED,
            mediaId,
            uploaderId,
            originalFilename,
            mediaType,
            timestamp: new Date().toISOString(),
            data,
        };
        this.logger.log(`[SIMULATION] Processing started notification for media ${mediaId} to user ${uploaderId}`);
    }
    async publishProcessingProgress(mediaId, uploaderId, originalFilename, mediaType, data) {
        const payload = {
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
    async publishProcessingCompleted(mediaId, uploaderId, originalFilename, mediaType, data) {
        const payload = {
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
    async publishProcessingFailed(mediaId, uploaderId, originalFilename, mediaType, data) {
        const payload = {
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
    async publishMediaAvailablePublic(mediaId, uploaderId, originalFilename, mediaType, data) {
        const payload = {
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
    async publishMediaQualityAnalysis(mediaId, uploaderId, originalFilename, mediaType, data) {
        const payload = {
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
};
exports.NotificationPublisher = NotificationPublisher;
exports.NotificationPublisher = NotificationPublisher = NotificationPublisher_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], NotificationPublisher);
//# sourceMappingURL=notification-publisher.service.js.map