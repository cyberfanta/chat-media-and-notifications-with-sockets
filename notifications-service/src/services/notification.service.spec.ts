import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification, NotificationType, NotificationPriority, NotificationChannel } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto, MarkAsReadDto } from '../dto/update-notification.dto';
import { NotificationFiltersDto } from '../dto/notification-filters.dto';
import { RedisConfig } from '../config/redis.config';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: Repository<Notification>;
  let redisConfig: RedisConfig;

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

  const mockNotification: Partial<Notification> = {
    id: 'test-id-123',
    userId: 'user-123',
    type: NotificationType.USER_REGISTERED,
    title: 'Test Notification',
    message: 'Test message',
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.WEBSOCKET],
    isRead: false,
    createdAt: new Date(),
    readAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: RedisConfig,
          useValue: mockRedisConfig,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    redisConfig = module.get<RedisConfig>(RedisConfig);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateNotificationDto = {
      userId: 'user-123',
      type: NotificationType.USER_REGISTERED,
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
        priority: NotificationPriority.MEDIUM,
        channels: [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP],
        sentAt: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(mockRedisConfig.invalidateUnreadNotifications).toHaveBeenCalledWith('user-123');
      expect(mockRedisConfig.publishNotificationEvent).toHaveBeenCalledWith(
        'notification_created',
        { userId: 'user-123', notification: mockNotification }
      );
      expect(result).toEqual(mockNotification);
    });

    it('should throw BadRequestException when rate limit exceeded', async () => {
      mockRedisConfig.checkRateLimit.mockResolvedValue(false);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(mockRedisConfig.checkRateLimit).toHaveBeenCalledWith('user-123');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      mockRedisConfig.checkRateLimit.mockResolvedValue(true);
      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const filters: NotificationFiltersDto = {
      page: 1,
      limit: 10,
      type: NotificationType.USER_REGISTERED,
      isRead: false,
    };

    it('should find notifications with filters and pagination', async () => {
      const notifications = [mockNotification, mockNotification];
      mockRepository.findAndCount.mockResolvedValue([notifications, 2]);

      const result = await service.findAll('user-123', filters);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          type: NotificationType.USER_REGISTERED,
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

      await expect(service.findOne('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateNotificationDto = { isRead: true };

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

      await expect(service.update('non-existent', 'user-123', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead', () => {
    const markAsReadDto: MarkAsReadDto = {
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

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', isRead: false },
        { isRead: true, readAt: expect.any(Date) }
      );
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

      await expect(service.remove('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
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
        type: NotificationType.USER_REGISTERED,
        title: '¡Bienvenido!',
        message: 'Te damos la bienvenida a nuestra plataforma. ¡Esperamos que disfrutes la experiencia!',
        priority: NotificationPriority.HIGH,
        channels: [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP, NotificationChannel.EMAIL],
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

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          type: NotificationType.NEW_COMMENT,
          title: 'Nuevo comentario',
        })
      );
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

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          type: NotificationType.UPLOAD_COMPLETED,
          title: 'Subida completada',
        })
      );
      expect(result).toEqual(mockNotification);
    });

    it('should create failed upload notification', async () => {
      mockRedisConfig.checkRateLimit.mockResolvedValue(true);
      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createUploadNotification('user-123', uploadData, false);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          type: NotificationType.UPLOAD_FAILED,
          title: 'Error en subida',
        })
      );
      expect(result).toEqual(mockNotification);
    });
  });
}); 