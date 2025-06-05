"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../users/entities/user.entity");
const common_1 = require("@nestjs/common");
describe('AuthController', () => {
    let controller;
    let authService;
    const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: user_entity_1.UserRole.USER,
        isActive: true,
        emailVerified: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        fullName: 'Test User',
        canModerate: false,
        isAdmin: false,
    };
    const mockAuthResponse = {
        user: mockUser,
        access_token: 'mock-jwt-token',
        token_type: 'Bearer',
        expires_in: 86400,
    };
    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        getProfile: jest.fn(),
        refreshToken: jest.fn(),
        promoteToModerator: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                {
                    provide: auth_service_1.AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();
        controller = module.get(auth_controller_1.AuthController);
        authService = module.get(auth_service_1.AuthService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('register', () => {
        const createUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
        };
        it('should register a new user successfully', async () => {
            mockAuthService.register.mockResolvedValue(mockAuthResponse);
            const result = await controller.register(createUserDto);
            expect(result).toEqual(mockAuthResponse);
            expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
        });
        it('should register with minimal data', async () => {
            const minimalDto = {
                email: 'minimal@example.com',
                password: 'password123',
            };
            const minimalResponse = {
                ...mockAuthResponse,
                user: { ...mockUser, email: 'minimal@example.com' },
            };
            mockAuthService.register.mockResolvedValue(minimalResponse);
            const result = await controller.register(minimalDto);
            expect(result).toEqual(minimalResponse);
            expect(mockAuthService.register).toHaveBeenCalledWith(minimalDto);
        });
        it('should handle registration errors', async () => {
            const error = new common_1.ConflictException('El usuario ya existe');
            mockAuthService.register.mockRejectedValue(error);
            await expect(controller.register(createUserDto)).rejects.toThrow(common_1.ConflictException);
            expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
        });
        it('should handle validation errors', async () => {
            const invalidDto = {
                email: 'invalid-email',
                password: '123',
            };
            const error = new common_1.ConflictException('El usuario ya existe');
            mockAuthService.register.mockRejectedValue(error);
            await expect(controller.register(invalidDto)).rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('login', () => {
        const loginUserDto = {
            email: 'test@example.com',
            password: 'password123',
        };
        it('should login user successfully', async () => {
            mockAuthService.login.mockResolvedValue(mockAuthResponse);
            const result = await controller.login(loginUserDto);
            expect(result).toEqual(mockAuthResponse);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
        });
        it('should handle login with different email case', async () => {
            const upperCaseEmailDto = {
                ...loginUserDto,
                email: 'TEST@EXAMPLE.COM',
            };
            mockAuthService.login.mockResolvedValue(mockAuthResponse);
            const result = await controller.login(upperCaseEmailDto);
            expect(result).toEqual(mockAuthResponse);
            expect(mockAuthService.login).toHaveBeenCalledWith(upperCaseEmailDto);
        });
        it('should handle invalid credentials', async () => {
            const error = new common_1.UnauthorizedException('Credenciales inválidas');
            mockAuthService.login.mockRejectedValue(error);
            await expect(controller.login(loginUserDto)).rejects.toThrow(common_1.UnauthorizedException);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
        });
        it('should handle inactive user login', async () => {
            const error = new common_1.UnauthorizedException('Usuario desactivado');
            mockAuthService.login.mockRejectedValue(error);
            await expect(controller.login(loginUserDto)).rejects.toThrow(common_1.UnauthorizedException);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
        });
    });
    describe('getProfile', () => {
        const mockRequest = {
            user: mockUser,
        };
        it('should get user profile successfully', async () => {
            mockAuthService.getProfile.mockResolvedValue(mockUser);
            const result = await controller.getProfile(mockRequest);
            expect(result).toEqual(mockUser);
            expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockUser.id);
        });
        it('should handle profile request for different user types', async () => {
            const adminUser = { ...mockUser, role: user_entity_1.UserRole.ADMIN, isAdmin: true };
            const adminRequest = { user: adminUser };
            mockAuthService.getProfile.mockResolvedValue(adminUser);
            const result = await controller.getProfile(adminRequest);
            expect(result).toEqual(adminUser);
            expect(mockAuthService.getProfile).toHaveBeenCalledWith(adminUser.id);
        });
        it('should handle profile errors', async () => {
            const error = new common_1.UnauthorizedException('Usuario no encontrado');
            mockAuthService.getProfile.mockRejectedValue(error);
            await expect(controller.getProfile(mockRequest)).rejects.toThrow(common_1.UnauthorizedException);
            expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockUser.id);
        });
    });
    describe('refreshToken', () => {
        const mockRequest = {
            user: mockUser,
        };
        it('should refresh token successfully', async () => {
            const refreshResponse = {
                ...mockAuthResponse,
                access_token: 'new-jwt-token',
            };
            mockAuthService.refreshToken.mockResolvedValue(refreshResponse);
            const result = await controller.refreshToken(mockRequest);
            expect(result).toEqual(refreshResponse);
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockUser.id);
        });
        it('should handle refresh token for different user roles', async () => {
            const moderatorUser = { ...mockUser, role: user_entity_1.UserRole.MODERATOR };
            const moderatorRequest = { user: moderatorUser };
            const refreshResponse = {
                ...mockAuthResponse,
                user: moderatorUser,
                access_token: 'new-moderator-jwt-token',
            };
            mockAuthService.refreshToken.mockResolvedValue(refreshResponse);
            const result = await controller.refreshToken(moderatorRequest);
            expect(result).toEqual(refreshResponse);
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith(moderatorUser.id);
        });
        it('should handle refresh token errors', async () => {
            const error = new common_1.UnauthorizedException('Usuario no válido');
            mockAuthService.refreshToken.mockRejectedValue(error);
            await expect(controller.refreshToken(mockRequest)).rejects.toThrow(common_1.UnauthorizedException);
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockUser.id);
        });
    });
    describe('promoteToModerator', () => {
        const promoteUserDto = {
            userId: mockUser.id,
        };
        it('should promote user to moderator successfully', async () => {
            const promotedUser = { ...mockUser, role: user_entity_1.UserRole.MODERATOR };
            mockAuthService.promoteToModerator.mockResolvedValue(promotedUser);
            const result = await controller.promoteToModerator(promoteUserDto);
            expect(result).toEqual({
                message: 'Usuario promovido a moderador exitosamente',
                user: promotedUser,
            });
            expect(mockAuthService.promoteToModerator).toHaveBeenCalledWith(promoteUserDto.userId);
        });
        it('should handle promotion errors', async () => {
            const error = new Error('Error al promover usuario');
            mockAuthService.promoteToModerator.mockRejectedValue(error);
            await expect(controller.promoteToModerator(promoteUserDto)).rejects.toThrow('Error al promover usuario');
            expect(mockAuthService.promoteToModerator).toHaveBeenCalledWith(promoteUserDto.userId);
        });
        it('should handle promotion with invalid user ID', async () => {
            const invalidDto = { userId: 'invalid-uuid' };
            const error = new Error('Usuario no encontrado');
            mockAuthService.promoteToModerator.mockRejectedValue(error);
            await expect(controller.promoteToModerator(invalidDto)).rejects.toThrow('Usuario no encontrado');
        });
    });
    describe('Error handling', () => {
        it('should handle unexpected service errors', async () => {
            const createUserDto = {
                email: 'test@example.com',
                password: 'password123',
            };
            const unexpectedError = new Error('Unexpected error');
            mockAuthService.register.mockRejectedValue(unexpectedError);
            await expect(controller.register(createUserDto)).rejects.toThrow('Unexpected error');
        });
        it('should handle network timeouts', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };
            const timeoutError = new Error('Request timeout');
            mockAuthService.login.mockRejectedValue(timeoutError);
            await expect(controller.login(loginDto)).rejects.toThrow('Request timeout');
        });
    });
    describe('Input validation edge cases', () => {
        it('should handle empty email registration', async () => {
            const emptyEmailDto = {
                email: '',
                password: 'password123',
            };
            const validationError = new Error('Email is required');
            mockAuthService.register.mockRejectedValue(validationError);
            await expect(controller.register(emptyEmailDto)).rejects.toThrow('Email is required');
        });
        it('should handle very long passwords', async () => {
            const longPasswordDto = {
                email: 'test@example.com',
                password: 'a'.repeat(1000),
            };
            mockAuthService.register.mockResolvedValue(mockAuthResponse);
            const result = await controller.register(longPasswordDto);
            expect(result).toEqual(mockAuthResponse);
            expect(mockAuthService.register).toHaveBeenCalledWith(longPasswordDto);
        });
        it('should handle special characters in names', async () => {
            const specialCharsDto = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'José María',
                lastName: 'García-Rodríguez',
            };
            mockAuthService.register.mockResolvedValue({
                ...mockAuthResponse,
                user: {
                    ...mockUser,
                    firstName: 'José María',
                    lastName: 'García-Rodríguez',
                },
            });
            const result = await controller.register(specialCharsDto);
            expect(result.user.firstName).toBe('José María');
            expect(result.user.lastName).toBe('García-Rodríguez');
        });
    });
});
//# sourceMappingURL=auth.controller.spec.js.map