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
exports.ProcessingJob = exports.JobPriority = exports.JobStatus = exports.JobType = void 0;
const typeorm_1 = require("typeorm");
var JobType;
(function (JobType) {
    JobType["COMPRESS_IMAGE"] = "compress_image";
    JobType["COMPRESS_VIDEO"] = "compress_video";
    JobType["COMPRESS_AUDIO"] = "compress_audio";
    JobType["GENERATE_THUMBNAILS"] = "generate_thumbnails";
    JobType["FULL_PROCESSING"] = "full_processing";
})(JobType || (exports.JobType = JobType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["WAITING"] = "waiting";
    JobStatus["ACTIVE"] = "active";
    JobStatus["COMPLETED"] = "completed";
    JobStatus["FAILED"] = "failed";
    JobStatus["DELAYED"] = "delayed";
    JobStatus["PAUSED"] = "paused";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var JobPriority;
(function (JobPriority) {
    JobPriority[JobPriority["LOW"] = 1] = "LOW";
    JobPriority[JobPriority["NORMAL"] = 5] = "NORMAL";
    JobPriority[JobPriority["HIGH"] = 10] = "HIGH";
    JobPriority[JobPriority["CRITICAL"] = 20] = "CRITICAL";
})(JobPriority || (exports.JobPriority = JobPriority = {}));
let ProcessingJob = class ProcessingJob {
    get isActive() {
        return this.status === JobStatus.ACTIVE;
    }
    get isCompleted() {
        return this.status === JobStatus.COMPLETED;
    }
    get isFailed() {
        return this.status === JobStatus.FAILED;
    }
    get isWaiting() {
        return this.status === JobStatus.WAITING;
    }
    get duration() {
        if (!this.startedAt || !this.completedAt)
            return null;
        return this.completedAt.getTime() - this.startedAt.getTime();
    }
    get progressPercentage() {
        return this.progress?.percentage || 0;
    }
    get canRetry() {
        return this.attempts < this.maxAttempts && this.isFailed;
    }
};
exports.ProcessingJob = ProcessingJob;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProcessingJob.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'queue_job_id', type: 'varchar', length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProcessingJob.prototype, "queueJobId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'queue_name', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], ProcessingJob.prototype, "queueName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'job_type',
        type: 'enum',
        enum: JobType,
    }),
    __metadata("design:type", String)
], ProcessingJob.prototype, "jobType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: JobStatus,
        default: JobStatus.WAITING,
    }),
    __metadata("design:type", String)
], ProcessingJob.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'priority',
        type: 'enum',
        enum: JobPriority,
        default: JobPriority.NORMAL,
    }),
    __metadata("design:type", Number)
], ProcessingJob.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProcessingJob.prototype, "mediaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uploader_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProcessingJob.prototype, "uploaderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'input_path', type: 'text' }),
    __metadata("design:type", String)
], ProcessingJob.prototype, "inputPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'output_path', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcessingJob.prototype, "outputPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_data', type: 'jsonb' }),
    __metadata("design:type", Object)
], ProcessingJob.prototype, "jobData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'progress', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ProcessingJob.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'result', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ProcessingJob.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'started_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProcessingJob.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProcessingJob.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProcessingJob.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attempts', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ProcessingJob.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_attempts', type: 'integer', default: 3 }),
    __metadata("design:type", Number)
], ProcessingJob.prototype, "maxAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delay_ms', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ProcessingJob.prototype, "delayMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'timeout_ms', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ProcessingJob.prototype, "timeoutMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcessingJob.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_stack', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProcessingJob.prototype, "errorStack", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ProcessingJob.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ProcessingJob.prototype, "updatedAt", void 0);
exports.ProcessingJob = ProcessingJob = __decorate([
    (0, typeorm_1.Entity)('processing_jobs'),
    (0, typeorm_1.Index)(['status', 'priority']),
    (0, typeorm_1.Index)(['mediaId']),
    (0, typeorm_1.Index)(['queueName', 'status']),
    (0, typeorm_1.Index)(['createdAt'])
], ProcessingJob);
//# sourceMappingURL=processing-job.entity.js.map