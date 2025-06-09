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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessedMedia = exports.ProcessingStatus = exports.MediaType = void 0;
const typeorm_1 = require("typeorm");
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
    MediaType["AUDIO"] = "audio";
})(MediaType || (exports.MediaType = MediaType = {}));
var ProcessingStatus;
(function (ProcessingStatus) {
    ProcessingStatus["PENDING"] = "pending";
    ProcessingStatus["PROCESSING"] = "processing";
    ProcessingStatus["COMPLETED"] = "completed";
    ProcessingStatus["FAILED"] = "failed";
})(ProcessingStatus || (exports.ProcessingStatus = ProcessingStatus = {}));
let ProcessedMedia = class ProcessedMedia {
    get isProcessing() {
        return this.status === ProcessingStatus.PROCESSING;
    }
    get isCompleted() {
        return this.status === ProcessingStatus.COMPLETED;
    }
    get isFailed() {
        return this.status === ProcessingStatus.FAILED;
    }
    get compressionRatio() {
        if (!this.compressionMetadata)
            return null;
        return this.compressionMetadata.compressionRatio;
    }
    get thumbnailCount() {
        if (!this.thumbnailMetadata)
            return 0;
        return this.thumbnailMetadata.count;
    }
};
exports.ProcessedMedia = ProcessedMedia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_media_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "originalMediaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploader_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "uploaderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'media_type',
        type: 'enum',
        enum: MediaType,
    }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "mediaType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: ProcessingStatus,
        default: ProcessingStatus.PENDING,
    }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_path', type: 'text' }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "originalPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_filename', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "originalFilename", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_size', type: 'bigint' }),
    __metadata("design:type", Number)
], ProcessedMedia.prototype, "originalSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_mime_type', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "originalMimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compressed_path', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "compressedPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compressed_size', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ProcessedMedia.prototype, "compressedSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compression_metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ProcessedMedia.prototype, "compressionMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'thumbnail_metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ProcessedMedia.prototype, "thumbnailMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_started_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProcessedMedia.prototype, "processingStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProcessedMedia.prototype, "processingCompletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_duration_ms', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ProcessedMedia.prototype, "processingDurationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retry_count', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ProcessedMedia.prototype, "retryCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processing_queue_job_id', type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], ProcessedMedia.prototype, "processingQueueJobId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProcessedMedia.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProcessedMedia.prototype, "updatedAt", void 0);
exports.ProcessedMedia = ProcessedMedia = __decorate([
    (0, typeorm_1.Entity)('processed_media'),
    (0, typeorm_1.Index)(['originalMediaId', 'status']),
    (0, typeorm_1.Index)(['mediaType', 'status']),
    (0, typeorm_1.Index)(['createdAt'])
], ProcessedMedia);
//# sourceMappingURL=processed-media.entity.js.map