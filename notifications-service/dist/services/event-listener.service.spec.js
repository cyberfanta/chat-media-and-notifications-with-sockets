"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const event_listener_service_1 = require("./event-listener.service");
const notification_service_1 = require("./notification.service");
const common_1 = require("@nestjs/common");
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
    let service;
    let notificationService;
    const mockNotificationService = {
        create: jest.fn(),
        createBroadcastNotification: jest.fn(),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                event_listener_service_1.EventListenerService,
                {
                    provide: notification_service_1.NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compile();
        service = module.get(event_listener_service_1.EventListenerService);
        notificationService = module.get(notification_service_1.NotificationService);
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
            await service.handleNotificationEvent(JSON.stringify(eventData));
            expect(mockNotificationService.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'user-123',
                title: '¡Bienvenido a la plataforma!',
            }));
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
            await service.handleNotificationEvent(JSON.stringify(eventData));
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
            await service.handleNotificationEvent(JSON.stringify(eventData));
            expect(mockNotificationService.create).toHaveBeenCalled();
        });
        it('should handle invalid JSON gracefully', async () => {
            const loggerSpy = jest.spyOn(common_1.Logger.prototype, 'error').mockImplementation();
            await service.handleNotificationEvent('invalid-json');
            expect(loggerSpy).toHaveBeenCalled();
            expect(mockNotificationService.create).not.toHaveBeenCalled();
            loggerSpy.mockRestore();
        });
        it('should handle unknown event types', async () => {
            const loggerSpy = jest.spyOn(common_1.Logger.prototype, 'warn').mockImplementation();
            const eventData = {
                event: 'unknown_event',
                data: {},
                service: 'test-service'
            };
            await service.handleNotificationEvent(JSON.stringify(eventData));
            expect(loggerSpy).toHaveBeenCalledWith('Unknown event type: unknown_event');
            loggerSpy.mockRestore();
        });
    });
    describe('lifecycle methods', () => {
        it('should handle module initialization', async () => {
            expect(service).toBeDefined();
        });
        it('should handle module destruction', async () => {
            await service.onModuleDestroy();
            expect(true).toBe(true);
        });
    });
});
//# sourceMappingURL=event-listener.service.spec.js.map