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
exports.QueueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("../dashboard/dashboard.service");
let QueueController = class QueueController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getQueueStatus() {
        const queue = await this.dashboardService.getQueueStatus();
        return { queue };
    }
};
exports.QueueController = QueueController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Estado actual de la cola de procesamiento' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estado detallado de la cola de procesamiento',
        schema: {
            type: 'object',
            properties: {
                queue: {
                    type: 'object',
                    properties: {
                        waiting: { type: 'number', description: 'Trabajos en espera' },
                        active: { type: 'number', description: 'Trabajos en proceso' },
                        completed: { type: 'number', description: 'Trabajos completados' },
                        failed: { type: 'number', description: 'Trabajos fallidos' },
                        paused: { type: 'boolean', description: 'Si la cola está pausada' },
                        processing: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    progress: { type: 'number', minimum: 0, maximum: 100 },
                                    startedAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "getQueueStatus", null);
exports.QueueController = QueueController = __decorate([
    (0, swagger_1.ApiTags)('queue'),
    (0, common_1.Controller)('api/queue'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], QueueController);
//# sourceMappingURL=queue.controller.js.map