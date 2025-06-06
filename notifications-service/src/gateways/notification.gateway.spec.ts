import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from '../services/notification.service';
import { RedisConfig } from '../config/redis.config';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { MarkAsReadDto } from '../dto/update-notification.dto';
import { NotificationType, NotificationPriority, NotificationChannel, Notification } from '../entities/notification.entity';

// Mock Socket interface
interface MockSocket {
  id: string;
  userId?: string;
  handshake: {
    query: { token?: string };
    headers: { authorization?: string };
  };
  join: jest.Mock;
  emit: jest.Mock;
  disconnect: jest.Mock;
}

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let notificationService: NotificationService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let redisConfig: RedisConfig;

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

  const mockNotification: Partial<Notification> = {
    id: 'notification-123',
    userId: 'user-123',
    type: NotificationType.USER_REGISTERED,
    title: 'Test Notification',
    message: 'Test message',
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.WEBSOCKET],
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisConfig,
          useValue: mockRedisConfig,
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    notificationService = module.get<NotificationService>(NotificationService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    redisConfig = module.get<RedisConfig>(RedisConfig);

    // Mock the server
    gateway.server = mockServer as any;

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    let mockClient: MockSocket;

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

      await gateway.handleConnection(mockClient as any);

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

      await gateway.handleConnection(mockClient as any);

      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
      expect(mockClient.userId).toBeNull();
      expect(mockClient.join).toHaveBeenCalledWith('user_null');
    });

    it('should disconnect client with invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      mockConfigService.get.mockReturnValue('secret-key');

      await gateway.handleConnection(mockClient as any);

      expect(mockClient.emit).toHaveBeenCalledWith('error', { message: 'Token JWT inválido' });
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Connection error'));
      mockConfigService.get.mockReturnValue('secret-key');

      await gateway.handleConnection(mockClient as any);

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

      await gateway.handleDisconnect(mockClient as any);

      expect(mockRedisConfig.removeUserConnection).toHaveBeenCalledWith('user-123', 'client-123');
    });

    it('should handle disconnection of unauthenticated client', async () => {
      const mockClient = {
        id: 'client-123',
        userId: null,
      };

      await gateway.handleDisconnect(mockClient as any);

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

      await gateway.handleJoinNotifications(mockClient as any);

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

      await gateway.handleJoinNotifications(mockClient as any);

      expect(mockClient.join).not.toHaveBeenCalled();
      expect(mockNotificationService.getUnreadCount).not.toHaveBeenCalled();
    });
  });

  describe('handleGetNotifications', () => {
    const filters: NotificationFiltersDto = {
      page: 1,
      limit: 10,
      type: NotificationType.USER_REGISTERED,
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

      await gateway.handleGetNotifications(mockClient as any, filters);

      expect(mockNotificationService.findAll).toHaveBeenCalledWith('user-123', filters);
      expect(mockClient.emit).toHaveBeenCalledWith('notifications', expectedResult);
    });

    it('should emit error for unauthenticated client', async () => {
      const mockClient = {
        id: 'client-123',
        userId: null,
        emit: jest.fn(),
      };

      await gateway.handleGetNotifications(mockClient as any, filters);

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

      await gateway.handleGetNotifications(mockClient as any, filters);

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

      await gateway.handleMarkAsRead(mockClient as any, markAsReadData);

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

      await gateway.handleMarkAsRead(mockClient as any, markAsReadData);

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

      await gateway.handleMarkAsRead(mockClient as any, markAsReadData);

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

      // Spy on the sendNotificationToUser method
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

      // Access the private method through bracket notation for testing
      const token = (gateway as any).extractTokenFromHandshake(mockSocket);

      expect(token).toBe('query-token');
    });

    it('should extract token from authorization header', () => {
      const mockSocket = {
        handshake: {
          query: {},
          headers: { authorization: 'Bearer header-token' },
        },
      };

      const token = (gateway as any).extractTokenFromHandshake(mockSocket);

      expect(token).toBe('header-token');
    });

    it('should return null when no token found', () => {
      const mockSocket = {
        handshake: {
          query: {},
          headers: {},
        },
      };

      const token = (gateway as any).extractTokenFromHandshake(mockSocket);

      expect(token).toBeNull();
    });
  });
}); 
