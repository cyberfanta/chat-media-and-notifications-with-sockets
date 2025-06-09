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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("../dashboard/dashboard.service");
let StatsController = class StatsController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSystemStats() {
        const stats = await this.dashboardService.getSystemStats();
        return { stats };
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Estadísticas generales del sistema' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas del sistema de procesamiento',
        schema: {
            type: 'object',
            properties: {
                stats: {
                    type: 'object',
                    properties: {
                        totalJobs: { type: 'number', description: 'Total de trabajos procesados' },
                        activeJobs: { type: 'number', description: 'Trabajos activos en cola' },
                        completedJobs: { type: 'number', description: 'Trabajos completados' },
                        failedJobs: { type: 'number', description: 'Trabajos fallidos' },
                        avgProcessingTime: { type: 'number', description: 'Tiempo promedio de procesamiento (ms)' },
                        systemUptime: { type: 'number', description: 'Tiempo de actividad del sistema (ms)' },
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getSystemStats", null);
exports.StatsController = StatsController = __decorate([
    (0, swagger_1.ApiTags)('stats'),
    (0, common_1.Controller)('api/stats'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map