"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/entities/user.entity");
describe('AuthService', () => {
    let authService;
    let usersService;
    let jwtService;
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
    const mockAdminUser = {
        ...mockUser,
        id: 'admin-id',
        email: 'admin@example.com',
        role: user_entity_1.UserRole.ADMIN,
        isAdmin: true,
        fullName: 'Admin User',
        canModerate: true,
    };
    const mockUsersService = {
        create: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        validatePassword: jest.fn(),
        updateLastLogin: jest.fn(),
        promoteToModerator: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn(),
        decode: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: users_service_1.UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();
        authService = module.get(auth_service_1.AuthService);
        usersService = module.get(users_service_1.UsersService);
        jwtService = module.get(jwt_1.JwtService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(authService).toBeDefined();
        expect(usersService).toBeDefined();
        expect(jwtService).toBeDefined();
    });
    describe('register', () => {
        const registerDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
        };
        it('should register a new user successfully', async () => {
            mockUsersService.create.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');
            mockJwtService.decode.mockReturnValue({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400,
            });
            const result = await authService.register(registerDto);
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('token_type');
            expect(result).toHaveProperty('expires_in');
            expect(result.token_type).toBe('Bearer');
            expect(result.access_token).toBe('mock-jwt-token');
            expect(result.user).toEqual(mockUser);
            expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });
        });
        it('should register user with minimal data', async () => {
            const minimalDto = {
                email: 'minimal@example.com',
                password: 'password123',
            };
            const minimalUser = {
                ...mockUser,
                email: 'minimal@example.com',
                firstName: null,
                lastName: null,
            };
            mockUsersService.create.mockResolvedValue(minimalUser);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');
            mockJwtService.decode.mockReturnValue({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400,
            });
            const result = await authService.register(minimalDto);
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe('minimal@example.com');
            expect(mockUsersService.create).toHaveBeenCalledWith(minimalDto);
        });
        it('should throw ConflictException if user already exists', async () => {
            mockUsersService.create.mockRejectedValue(new common_1.ConflictException('El usuario ya existe'));
            await expect(authService.register(registerDto)).rejects.toThrow(common_1.ConflictException);
            await expect(authService.register(registerDto)).rejects.toThrow('El usuario ya existe');
        });
        it('should throw ConflictException for general errors', async () => {
            mockUsersService.create.mockRejectedValue(new Error('Database error'));
            await expect(authService.register(registerDto)).rejects.toThrow(common_1.ConflictException);
            await expect(authService.register(registerDto)).rejects.toThrow('Error al crear el usuario');
        });
    });
    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'password123',
        };
        it('should login user successfully', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            mockUsersService.validatePassword.mockResolvedValue(true);
            mockUsersService.updateLastLogin.mockResolvedValue(undefined);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');
            mockJwtService.decode.mockReturnValue({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400,
            });
            const result = await authService.login(loginDto);
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('access_token');
            expect(result.token_type).toBe('Bearer');
            expect(result.user).toEqual(mockUser);
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(mockUsersService.validatePassword).toHaveBeenCalledWith(mockUser, loginDto.password);
            expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
        });
        it('should throw UnauthorizedException if user not found', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            await expect(authService.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.login(loginDto)).rejects.toThrow('Credenciales inválidas');
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
            await expect(authService.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.login(loginDto)).rejects.toThrow('Usuario desactivado');
        });
        it('should throw UnauthorizedException for wrong password', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            mockUsersService.validatePassword.mockResolvedValue(false);
            await expect(authService.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.login(loginDto)).rejects.toThrow('Credenciales inválidas');
        });
    });
    describe('validateUser', () => {
        it('should validate user successfully', async () => {
            const payload = {
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            };
            mockUsersService.findById.mockResolvedValue(mockUser);
            const result = await authService.validateUser(payload);
            expect(result).toEqual(mockUser);
            expect(mockUsersService.findById).toHaveBeenCalledWith(payload.sub);
        });
        it('should throw UnauthorizedException for user not found', async () => {
            const payload = {
                sub: 'invalid-id',
                email: 'test@example.com',
                role: user_entity_1.UserRole.USER,
            };
            mockUsersService.findById.mockResolvedValue(null);
            await expect(authService.validateUser(payload)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.validateUser(payload)).rejects.toThrow('Usuario no válido');
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            const payload = {
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            };
            const inactiveUser = { ...mockUser, isActive: false };
            mockUsersService.findById.mockResolvedValue(inactiveUser);
            await expect(authService.validateUser(payload)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.validateUser(payload)).rejects.toThrow('Usuario no válido');
        });
    });
    describe('getProfile', () => {
        it('should get user profile successfully', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            const result = await authService.getProfile(mockUser.id);
            expect(result).toEqual(mockUser);
            expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id);
        });
        it('should throw UnauthorizedException if user not found', async () => {
            mockUsersService.findById.mockResolvedValue(null);
            await expect(authService.getProfile('invalid-id')).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.getProfile('invalid-id')).rejects.toThrow('Usuario no encontrado');
        });
    });
    describe('promoteToModerator', () => {
        it('should promote user to moderator successfully', async () => {
            const promotedUser = { ...mockUser, role: user_entity_1.UserRole.MODERATOR };
            mockUsersService.promoteToModerator.mockResolvedValue(promotedUser);
            const result = await authService.promoteToModerator(mockUser.id);
            expect(result.role).toBe(user_entity_1.UserRole.MODERATOR);
            expect(mockUsersService.promoteToModerator).toHaveBeenCalledWith(mockUser.id);
        });
        it('should handle promotion errors', async () => {
            const error = new Error('Promotion failed');
            mockUsersService.promoteToModerator.mockRejectedValue(error);
            await expect(authService.promoteToModerator(mockUser.id)).rejects.toThrow('Promotion failed');
        });
    });
    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('new-jwt-token');
            mockJwtService.decode.mockReturnValue({
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400,
            });
            const result = await authService.refreshToken(mockUser.id);
            expect(result).toHaveProperty('access_token');
            expect(result.access_token).toBe('new-jwt-token');
            expect(result.user).toEqual(mockUser);
            expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser.id);
        });
        it('should throw UnauthorizedException for invalid user', async () => {
            mockUsersService.findById.mockResolvedValue(null);
            await expect(authService.refreshToken('invalid-id')).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.refreshToken('invalid-id')).rejects.toThrow('Usuario no válido');
        });
        it('should throw UnauthorizedException for inactive user', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            mockUsersService.findById.mockResolvedValue(inactiveUser);
            await expect(authService.refreshToken(mockUser.id)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.refreshToken(mockUser.id)).rejects.toThrow('Usuario no válido');
        });
    });
    describe('generateAuthResponse (private method testing)', () => {
        it('should generate correct auth response structure', async () => {
            mockUsersService.create.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('test-token');
            mockJwtService.decode.mockReturnValue({
                iat: 1640995200,
                exp: 1641081600,
            });
            const result = await authService.register({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result).toEqual({
                user: mockUser,
                access_token: 'test-token',
                token_type: 'Bearer',
                expires_in: 86400,
            });
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map