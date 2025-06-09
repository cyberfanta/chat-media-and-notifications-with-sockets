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
exports.CleanupLog = exports.CleanupStatus = exports.CleanupType = void 0;
const typeorm_1 = require("typeorm");
var CleanupType;
(function (CleanupType) {
    CleanupType["CHUNKS"] = "chunks";
    CleanupType["UPLOADS"] = "uploads";
    CleanupType["TEMP_FILES"] = "temp_files";
    CleanupType["STORAGE_MONITORING"] = "storage_monitoring";
})(CleanupType || (exports.CleanupType = CleanupType = {}));
var CleanupStatus;
(function (CleanupStatus) {
    CleanupStatus["SUCCESS"] = "success";
    CleanupStatus["PARTIAL"] = "partial";
    CleanupStatus["FAILED"] = "failed";
})(CleanupStatus || (exports.CleanupStatus = CleanupStatus = {}));
let CleanupLog = class CleanupLog {
    get isSuccess() {
        return this.status === CleanupStatus.SUCCESS;
    }
    get spaceFreedMB() {
        return Math.round(this.spaceFreedBytes / 1024 / 1024);
    }
    get executionTimeSeconds() {
        return Math.round(this.executionTimeMs / 1000);
    }
};
exports.CleanupLog = CleanupLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CleanupLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'type',
        type: 'enum',
        enum: CleanupType,
    }),
    __metadata("design:type", String)
], CleanupLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'enum',
        enum: CleanupStatus,
    }),
    __metadata("design:type", String)
], CleanupLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'items_processed', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], CleanupLog.prototype, "itemsProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'items_deleted', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], CleanupLog.prototype, "itemsDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'space_freed_bytes', type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], CleanupLog.prototype, "spaceFreedBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'execution_time_ms', type: 'integer' }),
    __metadata("design:type", Number)
], CleanupLog.prototype, "executionTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'details', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CleanupLog.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CleanupLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CleanupLog.prototype, "createdAt", void 0);
exports.CleanupLog = CleanupLog = __decorate([
    (0, typeorm_1.Entity)('cleanup_logs'),
    (0, typeorm_1.Index)(['type', 'status']),
    (0, typeorm_1.Index)(['createdAt'])
], CleanupLog);
//# sourceMappingURL=cleanup-log.entity.js.map