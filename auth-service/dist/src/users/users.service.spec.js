"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const users_service_1 = require("./users.service");
const user_entity_1 = require("./entities/user.entity");
const mockedBcrypt = jest.mocked(bcrypt);
describe('UsersService', () => {
    let service;
    let repository;
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
    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        preload: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                users_service_1.UsersService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockRepository,
                },
            ],
        }).compile();
        service = module.get(users_service_1.UsersService);
        repository = module.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        const createUserDto = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
        };
        it('should create a new user successfully', async () => {
            mockedBcrypt.hash.mockResolvedValue('hashedPassword');
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);
            const result = await service.create(createUserDto);
            expect(result).toEqual(mockUser);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
            expect(mockedBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
            expect(mockRepository.create).toHaveBeenCalledWith({
                email: createUserDto.email,
                password: 'hashedPassword',
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
            });
            expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
        });
        it('should create user with minimal data', async () => {
            const minimalDto = {
                email: 'minimal@example.com',
                password: 'password123',
            };
            const minimalUser = {
                ...mockUser,
                email: 'minimal@example.com',
                firstName: undefined,
                lastName: undefined,
            };
            mockedBcrypt.hash.mockResolvedValue('hashedPassword');
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(minimalUser);
            mockRepository.save.mockResolvedValue(minimalUser);
            const result = await service.create(minimalDto);
            expect(result).toEqual(minimalUser);
            expect(mockRepository.create).toHaveBeenCalledWith({
                email: minimalDto.email,
                password: 'hashedPassword',
                firstName: undefined,
                lastName: undefined,
            });
        });
        it('should throw ConflictException if email already exists', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            await expect(service.create(createUserDto)).rejects.toThrow(common_1.ConflictException);
            await expect(service.create(createUserDto)).rejects.toThrow('El usuario ya existe');
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email: createUserDto.email },
            });
            expect(mockRepository.save).not.toHaveBeenCalled();
        });
        it('should handle bcrypt errors', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            mockedBcrypt.hash.mockRejectedValue(new Error('Bcrypt error'));
            await expect(service.create(createUserDto)).rejects.toThrow('Bcrypt error');
        });
        it('should handle database save errors', async () => {
            mockedBcrypt.hash.mockResolvedValue('hashedPassword');
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockRejectedValue(new Error('Database error'));
            await expect(service.create(createUserDto)).rejects.toThrow('Database error');
        });
    });
    describe('findByEmail', () => {
        it('should find user by email successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.findByEmail('test@example.com');
            expect(result).toEqual(mockUser);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });
        it('should return null if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const result = await service.findByEmail('notfound@example.com');
            expect(result).toBeNull();
        });
        it('should handle database errors', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));
            await expect(service.findByEmail('test@example.com')).rejects.toThrow('Database error');
        });
    });
    describe('findById', () => {
        it('should find user by id successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.findById(mockUser.id);
            expect(result).toEqual(mockUser);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockUser.id },
            });
        });
        it('should return null if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const result = await service.findById('invalid-id');
            expect(result).toBeNull();
        });
        it('should handle database errors', async () => {
            mockRepository.findOne.mockRejectedValue(new Error('Database error'));
            await expect(service.findById(mockUser.id)).rejects.toThrow('Database error');
        });
    });
    describe('validatePassword', () => {
        it('should validate password successfully', async () => {
            mockedBcrypt.compare.mockResolvedValue(true);
            const result = await service.validatePassword(mockUser, 'password123');
            expect(result).toBe(true);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
        });
        it('should return false for invalid password', async () => {
            mockedBcrypt.compare.mockResolvedValue(false);
            const result = await service.validatePassword(mockUser, 'wrongpassword');
            expect(result).toBe(false);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
        });
        it('should handle bcrypt errors', async () => {
            mockedBcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));
            await expect(service.validatePassword(mockUser, 'password123')).rejects.toThrow('Bcrypt error');
        });
    });
    describe('updateLastLogin', () => {
        it('should update last login successfully', async () => {
            mockRepository.update.mockResolvedValue({ affected: 1 });
            await service.updateLastLogin(mockUser.id);
            expect(mockRepository.update).toHaveBeenCalledWith(mockUser.id, expect.objectContaining({
                updatedAt: expect.any(Date),
            }));
        });
        it('should handle update errors', async () => {
            mockRepository.update.mockRejectedValue(new Error('Update error'));
            await expect(service.updateLastLogin(mockUser.id)).rejects.toThrow('Update error');
        });
    });
    describe('promoteToModerator', () => {
        it('should promote user to moderator successfully', async () => {
            const promotedUser = { ...mockUser, role: user_entity_1.UserRole.MODERATOR };
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockResolvedValue(promotedUser);
            const result = await service.promoteToModerator(mockUser.id);
            expect(result.role).toBe(user_entity_1.UserRole.MODERATOR);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockUser.id },
            });
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...mockUser,
                role: user_entity_1.UserRole.MODERATOR,
            });
        });
        it('should throw NotFoundException if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.promoteToModerator('invalid-id')).rejects.toThrow(common_1.NotFoundException);
            await expect(service.promoteToModerator('invalid-id')).rejects.toThrow('Usuario no encontrado');
            expect(mockRepository.save).not.toHaveBeenCalled();
        });
        it('should handle already moderator user', async () => {
            const moderatorUser = { ...mockUser, role: user_entity_1.UserRole.MODERATOR };
            mockRepository.findOne.mockResolvedValue(moderatorUser);
            mockRepository.save.mockResolvedValue(moderatorUser);
            const result = await service.promoteToModerator(mockUser.id);
            expect(result.role).toBe(user_entity_1.UserRole.MODERATOR);
            expect(mockRepository.save).toHaveBeenCalled();
        });
        it('should throw ConflictException for admin user', async () => {
            const adminUser = { ...mockUser, role: user_entity_1.UserRole.ADMIN };
            mockRepository.findOne.mockResolvedValue(adminUser);
            await expect(service.promoteToModerator(mockUser.id)).rejects.toThrow(common_1.ConflictException);
            await expect(service.promoteToModerator(mockUser.id)).rejects.toThrow('No se puede modificar el rol de un administrador');
            expect(mockRepository.save).not.toHaveBeenCalled();
        });
        it('should handle database save errors during promotion', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            mockRepository.save.mockRejectedValue(new Error('Save error'));
            await expect(service.promoteToModerator(mockUser.id)).rejects.toThrow('Save error');
        });
    });
    describe('findAll', () => {
        it('should find all users', async () => {
            const users = [mockUser, { ...mockUser, id: 'user2', email: 'user2@example.com' }];
            mockRepository.find.mockResolvedValue(users);
            const result = await service.findAll();
            expect(result).toEqual(users);
            expect(mockRepository.find).toHaveBeenCalledWith({
                select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
            });
        });
        it('should return empty array if no users found', async () => {
            mockRepository.find.mockResolvedValue([]);
            const result = await service.findAll();
            expect(result).toEqual([]);
        });
    });
});
//# sourceMappingURL=users.service.spec.js.map