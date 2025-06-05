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
exports.CommentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const comments_service_1 = require("../services/comments.service");
const create_comment_dto_1 = require("../dto/create-comment.dto");
const update_comment_dto_1 = require("../dto/update-comment.dto");
const moderate_comment_dto_1 = require("../dto/moderate-comment.dto");
const query_comments_dto_1 = require("../dto/query-comments.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const comment_entity_1 = require("../entities/comment.entity");
let CommentsController = class CommentsController {
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    async createComment(contentId, createCommentDto, req) {
        createCommentDto.contentId = contentId;
        return await this.commentsService.create(createCommentDto, req.user.sub, req.user.email);
    }
    async getCommentsByContent(contentId, query) {
        return await this.commentsService.findByContentId(contentId, query);
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'comments-service',
        };
    }
    async getComment(id) {
        return await this.commentsService.findById(id);
    }
    async updateComment(id, updateCommentDto, req) {
        return await this.commentsService.update(id, updateCommentDto, req.user.sub);
    }
    async deleteComment(id, req) {
        await this.commentsService.delete(id, req.user.sub);
    }
    async moderateComment(id, moderateDto, req) {
        return await this.commentsService.moderate(id, moderateDto, req.user.sub);
    }
    async getPendingComments(query) {
        return await this.commentsService.getPendingComments(query);
    }
    async deleteCommentsByContent(contentId) {
        await this.commentsService.deleteByContentId(contentId);
    }
    async getCommentStats(contentId) {
        return await this.commentsService.getCommentStats(contentId);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)('content/:contentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear comentario en contenido multimedia',
        description: 'Permite a un usuario autenticado crear un comentario en un contenido específico',
    }),
    (0, swagger_1.ApiParam)({
        name: 'contentId',
        description: 'ID del contenido multimedia',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Comentario creado exitosamente',
        type: comment_entity_1.Comment,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos inválidos',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token no válido',
    }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_comment_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)('content/:contentId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener comentarios de contenido multimedia',
        description: 'Obtiene todos los comentarios de un contenido específico con paginación',
    }),
    (0, swagger_1.ApiParam)({
        name: 'contentId',
        description: 'ID del contenido multimedia',
        type: 'string',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Número de página',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Elementos por página',
        example: 10,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filtrar por estado',
        enum: ['pending', 'approved', 'rejected', 'flagged'],
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de comentarios con paginación',
        schema: {
            type: 'object',
            properties: {
                comments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Comment' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_comments_dto_1.QueryCommentsDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getCommentsByContent", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check del servicio',
        description: 'Verifica que el servicio de comentarios esté funcionando correctamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Servicio funcionando correctamente',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string' },
                service: { type: 'string', example: 'comments-service' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommentsController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener comentario por ID',
        description: 'Obtiene un comentario específico por su ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del comentario',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comentario encontrado',
        type: comment_entity_1.Comment,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Comentario no encontrado',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getComment", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar comentario',
        description: 'Permite al propietario del comentario actualizarlo',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del comentario',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comentario actualizado exitosamente',
        type: comment_entity_1.Comment,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos inválidos',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Sin permisos para editar este comentario',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Comentario no encontrado',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_comment_dto_1.UpdateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar comentario',
        description: 'Permite al propietario del comentario eliminarlo junto con sus respuestas',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del comentario',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Comentario eliminado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Sin permisos para eliminar este comentario',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Comentario no encontrado',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Put)(':id/moderate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Moderar comentario',
        description: 'Permite a un moderador aprobar, rechazar o marcar un comentario',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del comentario a moderar',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Comentario moderado exitosamente',
        type: comment_entity_1.Comment,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Datos de moderación inválidos',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token no válido',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Sin permisos de moderación',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Comentario no encontrado',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, moderate_comment_dto_1.ModerateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "moderateComment", null);
__decorate([
    (0, common_1.Get)('moderation/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener comentarios pendientes de moderación',
        description: 'Lista todos los comentarios que requieren moderación',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de comentarios pendientes',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_comments_dto_1.QueryCommentsDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getPendingComments", null);
__decorate([
    (0, common_1.Delete)('content/:contentId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar todos los comentarios de un contenido',
        description: 'Elimina todos los comentarios asociados a un contenido multimedia (usado cuando se elimina el contenido)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'contentId',
        description: 'ID del contenido multimedia',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Comentarios eliminados exitosamente',
    }),
    __param(0, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "deleteCommentsByContent", null);
__decorate([
    (0, common_1.Get)('stats/:contentId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener estadísticas de comentarios',
        description: 'Obtiene estadísticas de comentarios para un contenido específico',
    }),
    (0, swagger_1.ApiParam)({
        name: 'contentId',
        description: 'ID del contenido multimedia',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estadísticas de comentarios',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                approved: { type: 'number' },
                pending: { type: 'number' },
                rejected: { type: 'number' },
                contentId: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "getCommentStats", null);
exports.CommentsController = CommentsController = __decorate([
    (0, swagger_1.ApiTags)('Comments'),
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map