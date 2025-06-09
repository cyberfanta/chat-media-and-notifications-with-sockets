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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("../dashboard/dashboard.service");
let NotificationsController = class NotificationsController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getNotifications(limit, type) {
        const notifications = await this.dashboardService.getRecentNotifications();
        let filteredNotifications = notifications;
        if (type) {
            filteredNotifications = notifications.filter(n => n.type === type);
        }
        if (limit) {
            filteredNotifications = filteredNotifications.slice(0, limit);
        }
        return {
            notifications: filteredNotifications,
            total: notifications.length,
            unread: filteredNotifications.length
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener notificaciones recientes del sistema' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Número máximo de notificaciones a devolver (por defecto: 50)',
        example: 20
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        type: String,
        description: 'Filtrar por tipo de notificación',
        enum: ['processing_started', 'processing_progress', 'processing_completed', 'processing_failed', 'media_available_public', 'media_quality_analysis']
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de notificaciones del sistema',
        schema: {
            type: 'object',
            properties: {
                notifications: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'ID único de la notificación' },
                            type: { type: 'string', description: 'Tipo de notificación' },
                            title: { type: 'string', description: 'Título de la notificación' },
                            message: { type: 'string', description: 'Mensaje de la notificación' },
                            data: { type: 'object', description: 'Datos adicionales' },
                            isRead: { type: 'boolean', description: 'Si la notificación fue leída' },
                            createdAt: { type: 'string', format: 'date-time', description: 'Fecha de creación' },
                            userId: { type: 'string', description: 'ID del usuario relacionado' }
                        }
                    }
                },
                total: { type: 'number', description: 'Total de notificaciones disponibles' },
                unread: { type: 'number', description: 'Número de notificaciones no leídas' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('api/notifications'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map