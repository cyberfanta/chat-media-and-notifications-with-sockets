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
exports.CleanupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cleanup_service_1 = require("./cleanup.service");
let CleanupController = class CleanupController {
    constructor(cleanupService) {
        this.cleanupService = cleanupService;
    }
    async runCleanup() {
        await this.cleanupService.runScheduledCleanup();
        return { message: 'Cleanup tasks executed successfully' };
    }
    async getCleanupLogs() {
        const logs = await this.cleanupService.getCleanupLogs();
        return { logs };
    }
    async getCleanupStats() {
        const stats = await this.cleanupService.getCleanupStats();
        return { stats };
    }
};
exports.CleanupController = CleanupController;
__decorate([
    (0, common_1.Post)('run'),
    (0, swagger_1.ApiOperation)({ summary: 'Ejecutar limpieza manual' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Limpieza ejecutada correctamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "runCleanup", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener logs de limpieza' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de logs de limpieza' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "getCleanupLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estadísticas de limpieza' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estadísticas de limpieza' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CleanupController.prototype, "getCleanupStats", null);
exports.CleanupController = CleanupController = __decorate([
    (0, swagger_1.ApiTags)('cleanup'),
    (0, common_1.Controller)('cleanup'),
    __metadata("design:paramtypes", [cleanup_service_1.CleanupService])
], CleanupController);
//# sourceMappingURL=cleanup.controller.js.map