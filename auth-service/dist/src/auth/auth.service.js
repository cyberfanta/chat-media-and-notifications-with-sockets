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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        try {
            const user = await this.usersService.create(registerDto);
            return this.generateAuthResponse(user);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.ConflictException('Error al crear el usuario');
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Usuario desactivado');
        }
        const isPasswordValid = await this.usersService.validatePassword(user, password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        await this.usersService.updateLastLogin(user.id);
        return this.generateAuthResponse(user);
    }
    async validateUser(payload) {
        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Usuario no válido');
        }
        return user;
    }
    async getProfile(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        return user;
    }
    async promoteToModerator(userId) {
        return await this.usersService.promoteToModerator(userId);
    }
    generateAuthResponse(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const access_token = this.jwtService.sign(payload);
        const decodedToken = this.jwtService.decode(access_token);
        const expires_in = decodedToken.exp - decodedToken.iat;
        return {
            user,
            access_token,
            token_type: 'Bearer',
            expires_in,
        };
    }
    async refreshToken(userId) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Usuario no válido');
        }
        return this.generateAuthResponse(user);
    }
    async validateTokenFromOtherService(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.usersService.findById(payload.sub);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Usuario no válido');
            }
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map