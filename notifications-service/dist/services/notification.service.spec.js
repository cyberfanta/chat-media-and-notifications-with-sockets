"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const notification_entity_1 = require("../entities/notification.entity");
const redis_config_1 = require("../config/redis.config");
describe('NotificationService', () => {
    let service;
    let repository;
    let redisConfig;
    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
    const mockRedisConfig = {
        checkRateLimit: jest.fn(),
        invalidateUnreadNotifications: jest.fn(),
        publishNotificationEvent: jest.fn(),
        getUnreadNotifications: jest.fn(),
        cacheUnreadNotifications: jest.fn(),
    };
    const mockNotification = {
        id: 'test-id-123',
        userId: 'user-123',
        type: notification_entity_1.NotificationType.USER_REGISTERED,
        title: 'Test Notification',
        message: 'Test message',
        priority: notification_entity_1.NotificationPriority.MEDIUM,
        channels: [notification_entity_1.NotificationChannel.WEBSOCKET],
        isRead: false,
        createdAt: new Date(),
        readAt: null,
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                notification_service_1.NotificationService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(notification_entity_1.Notification),
                    useValue: mockRepository,
                },
                {
                    provide: redis_config_1.RedisConfig,
                    useValue: mockRedisConfig,
                },
            ],
        }).compile();
        service = module.get(notification_service_1.NotificationService);
        repository = module.get((0, typeorm_1.getRepositoryToken)(notification_entity_1.Notification));
        redisConfig = module.get(redis_config_1.RedisConfig);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        const createDto = {
            userId: 'user-123',
            type: notification_entity_1.NotificationType.USER_REGISTERED,
            title: 'Welcome!',
            message: 'Welcome to our platform',
        };
        it('should create a notification successfully', async () => {
            mockRedisConfig.checkRateLimit.mockResolvedValue(true);
            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockResolvedValue(mockNotification);
            const result = await service.create(createDto);
            expect(mockRedisConfig.checkRateLimit).toHaveBeenCalledWith('user-123');
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...createDto,
                priority: notification_entity_1.NotificationPriority.MEDIUM,
                channels: [notification_entity_1.NotificationChannel.WEBSOCKET, notification_entity_1.NotificationChannel.IN_APP],
                sentAt: expect.any(Date),
            });
            expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
            expect(mockRedisConfig.invalidateUnreadNotifications).toHaveBeenCalledWith('user-123');
            expect(mockRedisConfig.publishNotificationEvent).toHaveBeenCalledWith('notification_created', { userId: 'user-123', notification: mockNotification });
            expect(result).toEqual(mockNotification);
        });
        it('should throw BadRequestException when rate limit exceeded', async () => {
            mockRedisConfig.checkRateLimit.mockResolvedValue(false);
            await expect(service.create(createDto)).rejects.toThrow(common_1.BadRequestException);
            expect(mockRedisConfig.checkRateLimit).toHaveBeenCalledWith('user-123');
            expect(mockRepository.create).not.toHaveBeenCalled();
        });
        it('should handle creation errors', async () => {
            mockRedisConfig.checkRateLimit.mockResolvedValue(true);
            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockRejectedValue(new Error('Database error'));
            await expect(service.create(createDto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('findAll', () => {
        const filters = {
            page: 1,
            limit: 10,
            type: notification_entity_1.NotificationType.USER_REGISTERED,
            isRead: false,
        };
        it('should find notifications with filters and pagination', async () => {
            const notifications = [mockNotification, mockNotification];
            mockRepository.findAndCount.mockResolvedValue([notifications, 2]);
            const result = await service.findAll('user-123', filters);
            expect(mockRepository.findAndCount).toHaveBeenCalledWith({
                where: {
                    userId: 'user-123',
                    type: notification_entity_1.NotificationType.USER_REGISTERED,
                    isRead: false,
                },
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10,
            });
            expect(result).toEqual({
                notifications,
                total: 2,
                totalPages: 1,
            });
        });
        it('should cache unread notifications when filtering for unread', async () => {
            const filters = { isRead: false, page: 1, limit: 10 };
            const notifications = [mockNotification];
            mockRepository.findAndCount.mockResolvedValue([notifications, 1]);
            await service.findAll('user-123', filters);
            expect(mockRedisConfig.cacheUnreadNotifications).toHaveBeenCalledWith('user-123', notifications);
        });
    });
    describe('findUnread', () => {
        it('should return cached unread notifications if available', async () => {
            const cachedNotifications = [mockNotification];
            mockRedisConfig.getUnreadNotifications.mockResolvedValue(cachedNotifications);
            const result = await service.findUnread('user-123');
            expect(mockRedisConfig.getUnreadNotifications).toHaveBeenCalledWith('user-123');
            expect(mockRepository.find).not.toHaveBeenCalled();
            expect(result).toEqual(cachedNotifications);
        });
        it('should fetch and cache unread notifications if not cached', async () => {
            const notifications = [mockNotification];
            mockRedisConfig.getUnreadNotifications.mockResolvedValue(null);
            mockRepository.find.mockResolvedValue(notifications);
            const result = await service.findUnread('user-123');
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { userId: 'user-123', isRead: false },
                order: { createdAt: 'DESC' },
                take: 50,
            });
            expect(mockRedisConfig.cacheUnreadNotifications).toHaveBeenCalledWith('user-123', notifications);
            expect(result).toEqual(notifications);
        });
    });
    describe('findOne', () => {
        it('should find and return a notification', async () => {
            mockRepository.findOne.mockResolvedValue(mockNotification);
            const result = await service.findOne('test-id-123', 'user-123');
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'test-id-123', userId: 'user-123' },
            });
            expect(result).toEqual(mockNotification);
        });
        it('should throw NotFoundException when notification not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.findOne('non-existent', 'user-123')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        const updateDto = { isRead: true };
        it('should update notification successfully', async () => {
            const updatedNotification = { ...mockNotification, isRead: true, readAt: new Date() };
            mockRepository.findOne.mockResolvedValue(mockNotification);
            mockRepository.save.mockResolvedValue(updatedNotification);
            const result = await service.update('test-id-123', 'user-123', updateDto);
            expect(mockRepository.save).toHaveBeenCalled();
            expect(mockRedisConfig.invalidateUnreadNotifications).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(updatedNotification);
        });
        it('should throw NotFoundException when notification not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.update('non-existent', 'user-123', updateDto)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('markAsRead', () => {
        const markAsReadDto = {
            notificationIds: ['id1', 'id2'],
        };
        it('should mark multiple notifications as read', async () => {
            const mockQueryBuilder = {
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({ affected: 2 }),
            };
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await service.markAsRead('user-123', markAsReadDto);
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
            expect(mockRedisConfig.invalidateUnreadNotifications).toHaveBeenCalledWith('user-123');
            expect(result).toEqual({ marked: 2 });
        });
        it('should mark all unread notifications when no IDs provided', async () => {
            const mockQueryBuilder = {
                update: jest.fn().mockReturnThis(),
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({ affected: 5 }),
            };
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await service.markAsRead('user-123', {});
            expect(result).toEqual({ marked: 5 });
        });
    });
    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            mockRepository.update.mockResolvedValue({ affected: 3 });
            const result = await service.markAllAsRead('user-123');
            expect(mockRepository.update).toHaveBeenCalledWith({ userId: 'user-123', isRead: false }, { isRead: true, readAt: expect.any(Date) });
            expect(mockRedisConfig.invalidateUnreadNotifications).toHaveBeenCalledWith('user-123');
            expect(result).toEqual({ marked: 3 });
        });
    });
    describe('remove', () => {
        it('should remove notification successfully', async () => {
            mockRepository.findOne.mockResolvedValue(mockNotification);
            mockRepository.remove.mockResolvedValue(mockNotification);
            await service.remove('test-id-123', 'user-123');
            expect(mockRepository.remove).toHaveBeenCalledWith(mockNotification);
            expect(mockRedisConfig.invalidateUnreadNotifications).toHaveBeenCalledWith('user-123');
        });
        it('should throw NotFoundException when notification not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.remove('non-existent', 'user-123')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('getUnreadCount', () => {
        it('should return unread notification count', async () => {
            mockRepository.count.mockResolvedValue(5);
            const result = await service.getUnreadCount('user-123');
            expect(mockRepository.count).toHaveBeenCalledWith({
                where: { userId: 'user-123', isRead: false },
            });
            expect(result).toBe(5);
        });
    });
    describe('cleanupExpiredNotifications', () => {
        it('should delete expired notifications', async () => {
            const mockQueryBuilder = {
                delete: jest.fn().mockReturnThis(),
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue({ affected: 10 }),
            };
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            const result = await service.cleanupExpiredNotifications();
            expect(mockQueryBuilder.execute).toHaveBeenCalled();
            expect(result).toEqual({ deleted: 10 });
        });
    });
    describe('createWelcomeNotification', () => {
        it('should create welcome notification', async () => {
            mockRedisConfig.checkRateLimit.mockResolvedValue(true);
            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockResolvedValue(mockNotification);
            const result = await service.createWelcomeNotification('user-123');
            expect(mockRepository.create).toHaveBeenCalledWith({
                userId: 'user-123',
                type: notification_entity_1.NotificationType.USER_REGISTERED,
                title: '¡Bienvenido!',
                message: 'Te damos la bienvenida a nuestra plataforma. ¡Esperamos que disfrutes la experiencia!',
                priority: notification_entity_1.NotificationPriority.HIGH,
                channels: [notification_entity_1.NotificationChannel.WEBSOCKET, notification_entity_1.NotificationChannel.IN_APP, notification_entity_1.NotificationChannel.EMAIL],
                sentAt: expect.any(Date),
            });
            expect(result).toEqual(mockNotification);
        });
    });
    describe('createCommentNotification', () => {
        const commentData = {
            contentId: 'media-123',
            mediaTitle: 'Test Media',
            authorName: 'John Doe',
        };
        it('should create comment notification', async () => {
            mockRedisConfig.checkRateLimit.mockResolvedValue(true);
            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockResolvedValue(mockNotification);
            const result = await service.createCommentNotification('user-123', commentData);
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'user-123',
                type: notification_entity_1.NotificationType.NEW_COMMENT,
                title: 'Nuevo comentario',
            }));
            expect(result).toEqual(mockNotification);
        });
    });
    describe('createUploadNotification', () => {
        const uploadData = {
            filename: 'test.jpg',
            mediaType: 'image',
            mediaId: 'media-123',
        };
        it('should create successful upload notification', async () => {
            mockRedisConfig.checkRateLimit.mockResolvedValue(true);
            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockResolvedValue(mockNotification);
            const result = await service.createUploadNotification('user-123', uploadData, true);
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'user-123',
                type: notification_entity_1.NotificationType.UPLOAD_COMPLETED,
                title: 'Subida completada',
            }));
            expect(result).toEqual(mockNotification);
        });
        it('should create failed upload notification', async () => {
            mockRedisConfig.checkRateLimit.mockResolvedValue(true);
            mockRepository.create.mockReturnValue(mockNotification);
            mockRepository.save.mockResolvedValue(mockNotification);
            const result = await service.createUploadNotification('user-123', uploadData, false);
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'user-123',
                type: notification_entity_1.NotificationType.UPLOAD_FAILED,
                title: 'Error en subida',
            }));
            expect(result).toEqual(mockNotification);
        });
    });
});
//# sourceMappingURL=notification.service.spec.js.map