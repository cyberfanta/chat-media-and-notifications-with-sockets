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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const promote_user_dto_1 = require("./dto/promote-user.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const roles_decorator_1 = require("./decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return await this.authService.register(registerDto);
    }
    async login(loginDto) {
        return await this.authService.login(loginDto);
    }
    async getProfile(req) {
        return await this.authService.getProfile(req.user.id);
    }
    async refreshToken(req) {
        return await this.authService.refreshToken(req.user.id);
    }
    async promoteToModerator(promoteUserDto) {
        const user = await this.authService.promoteToModerator(promoteUserDto.userId);
        return {
            message: 'Usuario promovido a moderador exitosamente',
            user,
        };
    }
    healthCheck() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            service: 'Auth Service',
        };
    }
    async validateToken(body) {
        return await this.authService.validateTokenFromOtherService(body.token);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nuevo usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario registrado exitosamente',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'El usuario ya existe',
    }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar sesión' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login exitoso',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Credenciales inválidas',
    }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener perfil del usuario autenticado' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Perfil del usuario',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token inválido o expirado',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Renovar token de acceso' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token renovado exitosamente',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token inválido',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('promote-to-moderator'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Promover usuario a moderador',
        description: 'Solo los administradores pueden promover usuarios a moderadores'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario promovido exitosamente',
        type: user_entity_1.User,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token inválido',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'No tienes permisos para realizar esta acción',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuario no encontrado',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'No se puede modificar el rol de un administrador',
    }),
    (0, swagger_1.ApiBody)({ type: promote_user_dto_1.PromoteUserDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promote_user_dto_1.PromoteUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "promoteToModerator", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar estado del servicio' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Servicio funcionando correctamente',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], AuthController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('validate-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validar token JWT y obtener información del usuario',
        description: 'Endpoint para que otros microservicios validen tokens JWT'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token válido',
        schema: {
            type: 'object',
            properties: {
                valid: { type: 'boolean' },
                sub: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                iat: { type: 'number' },
                exp: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Token inválido o expirado',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string', description: 'JWT token a validar' },
            },
            required: ['token'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Autenticación'),
    (0, common_1.Controller)('auth'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map