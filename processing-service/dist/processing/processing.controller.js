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
var ProcessingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const processing_service_1 = require("./processing.service");
let ProcessingController = ProcessingController_1 = class ProcessingController {
    constructor(processingService) {
        this.processingService = processingService;
        this.logger = new common_1.Logger(ProcessingController_1.name);
    }
    async startProcessing(body) {
        this.logger.log(`Iniciando procesamiento: media=${body.mediaId}, uploader=${body.uploaderId}`);
        const job = await this.processingService.startProcessing(body.mediaId, body.uploaderId);
        return {
            success: true,
            message: 'Procesamiento iniciado',
            jobId: job.id,
            data: job
        };
    }
    async getJobStatus(id) {
        const job = await this.processingService.getJobStatus(id);
        return {
            success: true,
            data: job
        };
    }
    async getAllJobs() {
        const jobs = await this.processingService.getAllJobs();
        return {
            success: true,
            data: jobs,
            total: jobs.length
        };
    }
    async getProcessedMedia(id) {
        const processedMedia = await this.processingService.getProcessedMedia(id);
        return {
            success: true,
            data: processedMedia
        };
    }
    async healthCheck() {
        return {
            success: true,
            message: 'Processing Service está funcionando',
            timestamp: new Date().toISOString(),
            service: 'processing-service',
            version: '1.0.0'
        };
    }
};
exports.ProcessingController = ProcessingController;
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar procesamiento de media' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                mediaId: { type: 'number', description: 'ID del archivo de media' },
                uploaderId: { type: 'number', description: 'ID del usuario que subió el archivo' }
            },
            required: ['mediaId', 'uploaderId']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Procesamiento iniciado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProcessingController.prototype, "startProcessing", null);
__decorate([
    (0, common_1.Get)('job/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estado de un job de procesamiento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado del job' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcessingController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los jobs de procesamiento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de jobs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProcessingController.prototype, "getAllJobs", null);
__decorate([
    (0, common_1.Get)('media/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener información de media procesado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Información del media procesado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcessingController.prototype, "getProcessedMedia", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check del servicio' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Servicio funcionando correctamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProcessingController.prototype, "healthCheck", null);
exports.ProcessingController = ProcessingController = ProcessingController_1 = __decorate([
    (0, swagger_1.ApiTags)('Processing'),
    (0, common_1.Controller)('processing'),
    __metadata("design:paramtypes", [processing_service_1.ProcessingService])
], ProcessingController);
//# sourceMappingURL=processing.controller.js.map