"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const notification_gateway_1 = require("./notification.gateway");
const notification_service_1 = require("../services/notification.service");
const redis_config_1 = require("../config/redis.config");
const notification_entity_1 = require("../entities/notification.entity");
describe('NotificationGateway', () => {
    let gateway;
    let notificationService;
    let jwtService;
    let configService;
    let redisConfig;
    const mockNotificationService = {
        findAll: jest.fn(),
        findUnread: jest.fn(),
        markAsRead: jest.fn(),
        getUnreadCount: jest.fn(),
    };
    const mockJwtService = {
        verifyAsync: jest.fn(),
    };
    const mockConfigService = {
        get: jest.fn(),
    };
    const mockRedisConfig = {
        addUserConnection: jest.fn(),
        removeUserConnection: jest.fn(),
        subscribeToNotificationEvents: jest.fn(),
        publishNotificationEvent: jest.fn(),
        getUnreadNotifications: jest.fn(),
        cacheUnreadNotifications: jest.fn(),
        getSubscriber: jest.fn(),
    };
    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
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
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                notification_gateway_1.NotificationGateway,
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
                {
                    provide: redis_config_1.RedisConfig,
                    useValue: mockRedisConfig,
                },
            ],
        }).compile();
        gateway = module.get(notification_gateway_1.NotificationGateway);
        notificationService = module.get(notification_service_1.NotificationService);
        jwtService = module.get(jwt_1.JwtService);
        configService = module.get(config_1.ConfigService);
        redisConfig = module.get(redis_config_1.RedisConfig);
        gateway.server = mockServer;
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    describe('handleConnection', () => {
        let mockClient;
        beforeEach(() => {
            mockClient = {
                id: 'client-123',
                handshake: {
                    query: { token: 'valid-token' },
                    headers: {},
                },
                join: jest.fn(),
                emit: jest.fn(),
                disconnect: jest.fn(),
            };
        });
        it('should authenticate client with valid token', async () => {
            const jwtPayload = { sub: 'user-123', id: 'user-123' };
            mockJwtService.verifyAsync.mockResolvedValue(jwtPayload);
            mockConfigService.get.mockReturnValue('secret-key');
            mockNotificationService.findUnread.mockResolvedValue([mockNotification]);
            mockNotificationService.getUnreadCount.mockResolvedValue(1);
            await gateway.handleConnection(mockClient);
            expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
                secret: 'secret-key',
            });
            expect(mockClient.join).toHaveBeenCalledWith('user_user-123');
            expect(mockRedisConfig.addUserConnection).toHaveBeenCalledWith('user-123', 'client-123');
            expect(mockNotificationService.findUnread).toHaveBeenCalledWith('user-123');
            expect(mockClient.emit).toHaveBeenCalledWith('unread_notifications', [mockNotification]);
            expect(mockClient.emit).toHaveBeenCalledWith('unread_count', { count: 1 });
        });
        it('should allow connection without token for testing', async () => {
            mockClient.handshake.query.token = undefined;
            await gateway.handleConnection(mockClient);
            expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
            expect(mockClient.userId).toBeNull();
            expect(mockClient.join).toHaveBeenCalledWith('user_null');
        });
        it('should disconnect client with invalid token', async () => {
            mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
            mockConfigService.get.mockReturnValue('secret-key');
            await gateway.handleConnection(mockClient);
            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'Token JWT inválido' });
            expect(mockClient.disconnect).toHaveBeenCalled();
        });
        it('should handle connection errors gracefully', async () => {
            mockJwtService.verifyAsync.mockRejectedValue(new Error('Connection error'));
            mockConfigService.get.mockReturnValue('secret-key');
            await gateway.handleConnection(mockClient);
            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'Token JWT inválido' });
            expect(mockClient.disconnect).toHaveBeenCalled();
        });
    });
    describe('handleDisconnect', () => {
        it('should cleanup authenticated user connection', async () => {
            const mockClient = {
                id: 'client-123',
                userId: 'user-123',
            };
            await gateway.handleDisconnect(mockClient);
            expect(mockRedisConfig.removeUserConnection).toHaveBeenCalledWith('user-123', 'client-123');
        });
        it('should handle disconnection of unauthenticated client', async () => {
            const mockClient = {
                id: 'client-123',
                userId: null,
            };
            await gateway.handleDisconnect(mockClient);
            expect(mockRedisConfig.removeUserConnection).not.toHaveBeenCalled();
        });
    });
    describe('handleJoinNotifications', () => {
        it('should join authenticated client to notifications room', async () => {
            const mockClient = {
                id: 'client-123',
                userId: 'user-123',
                join: jest.fn(),
                emit: jest.fn(),
            };
            mockNotificationService.getUnreadCount.mockResolvedValue(3);
            await gateway.handleJoinNotifications(mockClient);
            expect(mockClient.join).toHaveBeenCalledWith('user_user-123');
            expect(mockClient.emit).toHaveBeenCalledWith('joined_notifications', { status: 'success' });
            expect(mockClient.emit).toHaveBeenCalledWith('unread_count', { count: 3 });
        });
        it('should not join unauthenticated client', async () => {
            const mockClient = {
                id: 'client-123',
                userId: null,
                join: jest.fn(),
                emit: jest.fn(),
            };
            await gateway.handleJoinNotifications(mockClient);
            expect(mockClient.join).not.toHaveBeenCalled();
            expect(mockNotificationService.getUnreadCount).not.toHaveBeenCalled();
        });
    });
    describe('handleGetNotifications', () => {
        const filters = {
            page: 1,
            limit: 10,
            type: notification_entity_1.NotificationType.USER_REGISTERED,
        };
        it('should return notifications for authenticated client', async () => {
            const mockClient = {
                id: 'client-123',
                userId: 'user-123',
                emit: jest.fn(),
            };
            const expectedResult = {
                notifications: [mockNotification],
                total: 1,
                totalPages: 1,
            };
            mockNotificationService.findAll.mockResolvedValue(expectedResult);
            await gateway.handleGetNotifications(mockClient, filters);
            expect(mockNotificationService.findAll).toHaveBeenCalledWith('user-123', filters);
            expect(mockClient.emit).toHaveBeenCalledWith('notifications', expectedResult);
        });
        it('should emit error for unauthenticated client', async () => {
            const mockClient = {
                id: 'client-123',
                userId: null,
                emit: jest.fn(),
            };
            await gateway.handleGetNotifications(mockClient, filters);
            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'No autenticado' });
            expect(mockNotificationService.findAll).not.toHaveBeenCalled();
        });
        it('should handle service errors', async () => {
            const mockClient = {
                id: 'client-123',
                userId: 'user-123',
                emit: jest.fn(),
            };
            mockNotificationService.findAll.mockRejectedValue(new Error('Service error'));
            await gateway.handleGetNotifications(mockClient, filters);
            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'Error al obtener notificaciones' });
        });
    });
    describe('handleMarkAsRead', () => {
        const markAsReadData = { notificationIds: ['id1', 'id2'] };
        it('should mark notifications as read for authenticated client', async () => {
            const mockClient = {
                id: 'client-123',
                userId: 'user-123',
                emit: jest.fn(),
            };
            mockNotificationService.markAsRead.mockResolvedValue({ marked: 2 });
            mockNotificationService.getUnreadCount.mockResolvedValue(3);
            await gateway.handleMarkAsRead(mockClient, markAsReadData);
            expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('user-123', markAsReadData);
            expect(mockClient.emit).toHaveBeenCalledWith('marked_as_read', { marked: 2 });
            expect(mockClient.emit).toHaveBeenCalledWith('unread_count', { count: 3 });
        });
        it('should emit error for unauthenticated client', async () => {
            const mockClient = {
                id: 'client-123',
                userId: null,
                emit: jest.fn(),
            };
            await gateway.handleMarkAsRead(mockClient, markAsReadData);
            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'No autenticado' });
            expect(mockNotificationService.markAsRead).not.toHaveBeenCalled();
        });
        it('should handle service errors', async () => {
            const mockClient = {
                id: 'client-123',
                userId: 'user-123',
                emit: jest.fn(),
            };
            mockNotificationService.markAsRead.mockRejectedValue(new Error('Service error'));
            await gateway.handleMarkAsRead(mockClient, markAsReadData);
            expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'Error al marcar como leída' });
        });
    });
    describe('sendNotificationToUser', () => {
        it('should send notification to specific user room', async () => {
            mockNotificationService.getUnreadCount.mockResolvedValue(5);
            await gateway.sendNotificationToUser('user-123', mockNotification);
            expect(mockServer.to).toHaveBeenCalledWith('user_user-123');
            expect(mockServer.emit).toHaveBeenCalledWith('new_notification', mockNotification);
            expect(mockServer.emit).toHaveBeenCalledWith('unread_count', { count: 5 });
        });
    });
    describe('sendNotificationToUsers', () => {
        it('should send notification to multiple users', async () => {
            const userIds = ['user-123', 'user-456'];
            mockNotificationService.getUnreadCount.mockResolvedValue(5);
            const sendNotificationToUserSpy = jest.spyOn(gateway, 'sendNotificationToUser').mockResolvedValue();
            await gateway.sendNotificationToUsers(userIds, mockNotification);
            expect(sendNotificationToUserSpy).toHaveBeenCalledTimes(2);
            expect(sendNotificationToUserSpy).toHaveBeenCalledWith('user-123', mockNotification);
            expect(sendNotificationToUserSpy).toHaveBeenCalledWith('user-456', mockNotification);
            sendNotificationToUserSpy.mockRestore();
        });
    });
    describe('broadcastNotification', () => {
        it('should broadcast notification to all connected clients', async () => {
            await gateway.broadcastNotification(mockNotification);
            expect(mockServer.emit).toHaveBeenCalledWith('broadcast_notification', mockNotification);
        });
    });
    describe('extractTokenFromHandshake', () => {
        it('should extract token from query string', () => {
            const mockSocket = {
                handshake: {
                    query: { token: 'query-token' },
                    headers: {},
                },
            };
            const token = gateway.extractTokenFromHandshake(mockSocket);
            expect(token).toBe('query-token');
        });
        it('should extract token from authorization header', () => {
            const mockSocket = {
                handshake: {
                    query: {},
                    headers: { authorization: 'Bearer header-token' },
                },
            };
            const token = gateway.extractTokenFromHandshake(mockSocket);
            expect(token).toBe('header-token');
        });
        it('should return null when no token found', () => {
            const mockSocket = {
                handshake: {
                    query: {},
                    headers: {},
                },
            };
            const token = gateway.extractTokenFromHandshake(mockSocket);
            expect(token).toBeNull();
        });
    });
});
//# sourceMappingURL=notification.gateway.spec.js.map