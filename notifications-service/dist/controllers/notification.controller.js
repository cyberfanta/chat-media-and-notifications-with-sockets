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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("../services/notification.service");
const create_notification_dto_1 = require("../dto/create-notification.dto");
const update_notification_dto_1 = require("../dto/update-notification.dto");
const notification_filters_dto_1 = require("../dto/notification-filters.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async create(createNotificationDto) {
        return await this.notificationService.create(createNotificationDto);
    }
    async findAll(req, filters) {
        const userId = req.user.sub || req.user.id;
        return await this.notificationService.findAll(userId, filters);
    }
    async findUnread(req) {
        const userId = req.user.sub || req.user.id;
        return await this.notificationService.findUnread(userId);
    }
    async getUnreadCount(req) {
        const userId = req.user.sub || req.user.id;
        const count = await this.notificationService.getUnreadCount(userId);
        return { count };
    }
    async findOne(id, req) {
        const userId = req.user.sub || req.user.id;
        return await this.notificationService.findOne(id, userId);
    }
    async update(id, updateNotificationDto, req) {
        const userId = req.user.sub || req.user.id;
        return await this.notificationService.update(id, userId, updateNotificationDto);
    }
    async markAsRead(id, req) {
        const userId = req.user.sub || req.user.id;
        return await this.notificationService.update(id, userId, { isRead: true, readAt: new Date() });
    }
    async markMultipleAsRead(markAsReadDto, req) {
        const userId = req.user.sub || req.user.id;
        return await this.notificationService.markAsRead(userId, markAsReadDto);
    }
    async markAllAsRead(req) {
        const userId = req.user.sub || req.user.id;
        return await this.notificationService.markAllAsRead(userId);
    }
    async remove(id, req) {
        const userId = req.user.sub || req.user.id;
        await this.notificationService.remove(id, userId);
        return { message: 'Notificación eliminada exitosamente' };
    }
    async cleanupExpired() {
        return await this.notificationService.cleanupExpiredNotifications();
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear una nueva notificación',
        description: 'Crea una nueva notificación para un usuario específico. La notificación se enviará automáticamente por WebSocket si está configurado.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Notificación creada exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Datos de entrada inválidos o límite de notificaciones excedido'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener notificaciones del usuario',
        description: 'Obtiene las notificaciones del usuario autenticado con filtros opcionales y paginación.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificaciones obtenidas exitosamente'
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_filters_dto_1.NotificationFiltersDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener notificaciones no leídas',
        description: 'Obtiene todas las notificaciones no leídas del usuario autenticado. Resultado puede venir desde cache para mejor rendimiento.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificaciones no leídas obtenidas exitosamente'
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findUnread", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener contador de notificaciones no leídas',
        description: 'Obtiene el número total de notificaciones no leídas del usuario autenticado.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Contador obtenido exitosamente',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number', example: 5 }
            }
        }
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener notificación específica',
        description: 'Obtiene una notificación específica por su ID. Solo el propietario puede acceder a sus notificaciones.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notificación' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificación encontrada'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Notificación no encontrada'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar notificación',
        description: 'Actualiza una notificación específica. Principalmente usado para marcar como leída/no leída.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notificación' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificación actualizada exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Notificación no encontrada'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_notification_dto_1.UpdateNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/mark-read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Marcar notificación como leída',
        description: 'Marca una notificación específica como leída y actualiza la fecha de lectura.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notificación' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificación marcada como leída'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('mark-read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Marcar múltiples notificaciones como leídas',
        description: 'Marca múltiples notificaciones como leídas en una sola operación. Si no se especifican IDs, marca todas las no leídas.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificaciones marcadas como leídas',
        schema: {
            type: 'object',
            properties: {
                marked: { type: 'number', example: 3 }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_notification_dto_1.MarkAsReadDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markMultipleAsRead", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Marcar todas las notificaciones como leídas',
        description: 'Marca todas las notificaciones no leídas del usuario como leídas.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Todas las notificaciones marcadas como leídas',
        schema: {
            type: 'object',
            properties: {
                marked: { type: 'number', example: 10 }
            }
        }
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar notificación',
        description: 'Elimina una notificación específica. Solo el propietario puede eliminar sus notificaciones.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notificación' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificación eliminada exitosamente'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Notificación no encontrada'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, swagger_1.ApiOperation)({
        summary: 'Limpiar notificaciones expiradas',
        description: 'Elimina todas las notificaciones que han pasado su fecha de expiración. Endpoint administrativo.'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Notificaciones expiradas eliminadas',
        schema: {
            type: 'object',
            properties: {
                deleted: { type: 'number', example: 25 }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "cleanupExpired", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map