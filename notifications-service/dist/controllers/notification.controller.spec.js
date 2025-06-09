"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const notification_controller_1 = require("./notification.controller");
const notification_service_1 = require("../services/notification.service");
const notification_entity_1 = require("../entities/notification.entity");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
describe('NotificationController', () => {
    let controller;
    let service;
    const mockNotificationService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findUnread: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        remove: jest.fn(),
        getUnreadCount: jest.fn(),
        cleanupExpiredNotifications: jest.fn(),
    };
    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
        verifyAsync: jest.fn(),
    };
    const mockConfigService = {
        get: jest.fn(),
    };
    const mockRequest = {
        user: {
            id: 'user-123',
            sub: 'user-123',
        },
    };
    const mockNotification = {
        id: 'notification-123',
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
            controllers: [notification_controller_1.NotificationController],
            providers: [
                {
                    provide: notification_service_1.NotificationService,
                    useValue: mockNotificationService,
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        })
            .overrideGuard(jwt_auth_guard_1.JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();
        controller = module.get(notification_controller_1.NotificationController);
        service = module.get(notification_service_1.NotificationService);
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('create', () => {
        const createDto = {
            userId: 'user-123',
            type: notification_entity_1.NotificationType.USER_REGISTERED,
            title: 'Welcome!',
            message: 'Welcome to our platform',
        };
        it('should create a notification successfully', async () => {
            mockNotificationService.create.mockResolvedValue(mockNotification);
            const result = await controller.create(createDto);
            expect(mockNotificationService.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(mockNotification);
        });
        it('should handle service errors', async () => {
            mockNotificationService.create.mockRejectedValue(new Error('Service error'));
            await expect(controller.create(createDto)).rejects.toThrow('Service error');
        });
    });
    describe('findAll', () => {
        const filters = {
            page: 1,
            limit: 10,
            type: notification_entity_1.NotificationType.USER_REGISTERED,
        };
        const expectedResult = {
            notifications: [mockNotification],
            total: 1,
            totalPages: 1,
        };
        it('should return paginated notifications', async () => {
            mockNotificationService.findAll.mockResolvedValue(expectedResult);
            const result = await controller.findAll(mockRequest, filters);
            expect(mockNotificationService.findAll).toHaveBeenCalledWith('user-123', filters);
            expect(result).toEqual(expectedResult);
        });
        it('should handle user ID from sub field', async () => {
            const requestWithSub = { user: { sub: 'user-456' } };
            mockNotificationService.findAll.mockResolvedValue(expectedResult);
            await controller.findAll(requestWithSub, filters);
            expect(mockNotificationService.findAll).toHaveBeenCalledWith('user-456', filters);
        });
    });
    describe('findUnread', () => {
        it('should return unread notifications', async () => {
            const unreadNotifications = [mockNotification];
            mockNotificationService.findUnread.mockResolvedValue(unreadNotifications);
            const result = await controller.findUnread(mockRequest);
            expect(mockNotificationService.findUnread).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(unreadNotifications);
        });
    });
    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            mockNotificationService.getUnreadCount.mockResolvedValue(5);
            const result = await controller.getUnreadCount(mockRequest);
            expect(mockNotificationService.getUnreadCount).toHaveBeenCalledWith('user-123');
            expect(result).toEqual({ count: 5 });
        });
    });
    describe('findOne', () => {
        it('should return a specific notification', async () => {
            mockNotificationService.findOne.mockResolvedValue(mockNotification);
            const result = await controller.findOne('notification-123', mockRequest);
            expect(mockNotificationService.findOne).toHaveBeenCalledWith('notification-123', 'user-123');
            expect(result).toEqual(mockNotification);
        });
    });
    describe('update', () => {
        const updateDto = { isRead: true };
        it('should update notification', async () => {
            const updatedNotification = { ...mockNotification, isRead: true };
            mockNotificationService.update.mockResolvedValue(updatedNotification);
            const result = await controller.update('notification-123', updateDto, mockRequest);
            expect(mockNotificationService.update).toHaveBeenCalledWith('notification-123', 'user-123', updateDto);
            expect(result).toEqual(updatedNotification);
        });
    });
    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            const updatedNotification = { ...mockNotification, isRead: true, readAt: new Date() };
            mockNotificationService.update.mockResolvedValue(updatedNotification);
            const result = await controller.markAsRead('notification-123', mockRequest);
            expect(mockNotificationService.update).toHaveBeenCalledWith('notification-123', 'user-123', { isRead: true, readAt: expect.any(Date) });
            expect(result).toEqual(updatedNotification);
        });
    });
    describe('markMultipleAsRead', () => {
        const markAsReadDto = {
            notificationIds: ['id1', 'id2'],
        };
        it('should mark multiple notifications as read', async () => {
            const expectedResult = { marked: 2 };
            mockNotificationService.markAsRead.mockResolvedValue(expectedResult);
            const result = await controller.markMultipleAsRead(markAsReadDto, mockRequest);
            expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('user-123', markAsReadDto);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            const expectedResult = { marked: 10 };
            mockNotificationService.markAllAsRead.mockResolvedValue(expectedResult);
            const result = await controller.markAllAsRead(mockRequest);
            expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(expectedResult);
        });
    });
    describe('remove', () => {
        it('should remove notification', async () => {
            mockNotificationService.remove.mockResolvedValue(undefined);
            await controller.remove('notification-123', mockRequest);
            expect(mockNotificationService.remove).toHaveBeenCalledWith('notification-123', 'user-123');
        });
    });
    describe('cleanupExpired', () => {
        it('should cleanup expired notifications', async () => {
            const expectedResult = { deleted: 15 };
            mockNotificationService.cleanupExpiredNotifications.mockResolvedValue(expectedResult);
            const result = await controller.cleanupExpired();
            expect(mockNotificationService.cleanupExpiredNotifications).toHaveBeenCalled();
            expect(result).toEqual(expectedResult);
        });
    });
});
//# sourceMappingURL=notification.controller.spec.js.map