import { Test, TestingModule } from '@nestjs/testing';
import { EventListenerService } from './event-listener.service';
import { NotificationService } from './notification.service';
import { Logger } from '@nestjs/common';

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    on: jest.fn(),
    connect: jest.fn(),
    subscribe: jest.fn(),
    quit: jest.fn(),
    isOpen: true,
  })),
}));

describe('EventListenerService', () => {
  let service: EventListenerService;
  let notificationService: NotificationService;

  const mockNotificationService = {
    create: jest.fn(),
    createBroadcastNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventListenerService,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<EventListenerService>(EventListenerService);
    notificationService = module.get<NotificationService>(NotificationService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleNotificationEvent', () => {
    it('should handle user_registered event', async () => {
      const eventData = {
        event: 'user_registered',
        data: { userId: 'user-123', firstName: 'John', email: 'john@example.com' },
        service: 'auth-service'
      };

      mockNotificationService.create.mockResolvedValue({});

      // Access private method for testing
      await (service as any).handleNotificationEvent(JSON.stringify(eventData));

      expect(mockNotificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          title: '¡Bienvenido a la plataforma!',
        })
      );
    });

    it('should handle upload_completed event', async () => {
      const eventData = {
        event: 'upload_completed',
        data: { 
          userId: 'user-123', 
          fileName: 'test.jpg',
          mediaId: 'media-123',
          fileSize: 1024,
          mediaType: 'image'
        },
        service: 'media-service'
      };

      mockNotificationService.create.mockResolvedValue({});
      mockNotificationService.createBroadcastNotification.mockResolvedValue({});

      await (service as any).handleNotificationEvent(JSON.stringify(eventData));

      expect(mockNotificationService.create).toHaveBeenCalled();
      expect(mockNotificationService.createBroadcastNotification).toHaveBeenCalled();
    });

    it('should handle new_comment event', async () => {
      const eventData = {
        event: 'new_comment',
        data: { 
          commentId: 'comment-123',
          authorId: 'user-123',
          authorEmail: 'john@example.com',
          content: 'Great content!',
          contentId: 'content-123'
        },
        service: 'comments-service'
      };

      mockNotificationService.create.mockResolvedValue({});

      await (service as any).handleNotificationEvent(JSON.stringify(eventData));

      expect(mockNotificationService.create).toHaveBeenCalled();
    });

    it('should handle invalid JSON gracefully', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await (service as any).handleNotificationEvent('invalid-json');

      expect(loggerSpy).toHaveBeenCalled();
      expect(mockNotificationService.create).not.toHaveBeenCalled();

      loggerSpy.mockRestore();
    });

    it('should handle unknown event types', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      const eventData = {
        event: 'unknown_event',
        data: {},
        service: 'test-service'
      };

      await (service as any).handleNotificationEvent(JSON.stringify(eventData));

      expect(loggerSpy).toHaveBeenCalledWith('Unknown event type: unknown_event');
      loggerSpy.mockRestore();
    });
  });

  describe('lifecycle methods', () => {
    it('should handle module initialization', async () => {
      // This test verifies the service can be initialized without errors
      expect(service).toBeDefined();
    });

    it('should handle module destruction', async () => {
      await service.onModuleDestroy();
      // Should not throw any errors
      expect(true).toBe(true);
    });
  });
}); 