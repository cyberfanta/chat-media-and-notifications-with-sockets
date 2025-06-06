"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventListenerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventListenerService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
const notification_service_1 = require("./notification.service");
const notification_entity_1 = require("../entities/notification.entity");
let EventListenerService = EventListenerService_1 = class EventListenerService {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(EventListenerService_1.name);
        this.subscriber = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://redis-notifications:6379'
        });
        this.subscriber.on('error', (err) => {
            this.logger.error('Redis Subscriber Error:', err);
        });
        this.subscriber.on('connect', () => {
            this.logger.log('Redis Subscriber connected');
        });
    }
    async onModuleInit() {
        try {
            await this.subscriber.connect();
            await this.subscriber.subscribe('notification_events', (message) => {
                this.handleNotificationEvent(message);
            });
            this.logger.log('Subscribed to notification_events channel');
        }
        catch (error) {
            this.logger.error('Failed to subscribe to Redis:', error);
        }
    }
    async onModuleDestroy() {
        if (this.subscriber && this.subscriber.isOpen) {
            await this.subscriber.quit();
            this.logger.log('Redis subscriber connection closed');
        }
    }
    async handleNotificationEvent(message) {
        try {
            const eventData = JSON.parse(message);
            const { event, data, service } = eventData;
            this.logger.log(`Received event: ${event} from ${service}`);
            switch (event) {
                case 'user_registered':
                    await this.handleUserRegistered(data);
                    break;
                case 'user_login':
                    await this.handleUserLogin(data);
                    break;
                case 'upload_completed':
                    await this.handleUploadCompleted(data);
                    break;
                case 'new_comment':
                    await this.handleNewComment(data);
                    break;
                default:
                    this.logger.warn(`Unknown event type: ${event}`);
            }
        }
        catch (error) {
            this.logger.error('Error handling notification event:', error);
        }
    }
    async handleUserRegistered(data) {
        try {
            await this.notificationService.create({
                userId: data.userId,
                type: notification_entity_1.NotificationType.USER_REGISTERED,
                title: '¡Bienvenido a la plataforma!',
                message: `Hola ${data.firstName}, tu cuenta ha sido creada exitosamente. ¡Comienza a explorar y subir contenido!`,
                priority: notification_entity_1.NotificationPriority.HIGH,
                data: {
                    registrationDate: data.registrationDate,
                    email: data.email
                }
            });
            this.logger.log(`Welcome notification created for user: ${data.userId}`);
        }
        catch (error) {
            this.logger.error('Error creating welcome notification:', error);
        }
    }
    async handleUserLogin(data) {
        try {
            await this.notificationService.create({
                userId: data.userId,
                type: notification_entity_1.NotificationType.LOGIN_NEW_DEVICE,
                title: 'Nuevo acceso a tu cuenta',
                message: `Se ha detectado un nuevo acceso a tu cuenta desde un dispositivo. Si no fuiste tú, cambia tu contraseña inmediatamente.`,
                priority: notification_entity_1.NotificationPriority.MEDIUM,
                data: {
                    loginTime: data.loginTime,
                    userAgent: data.userAgent,
                    email: data.email
                }
            });
            this.logger.log(`Login notification created for user: ${data.userId}`);
        }
        catch (error) {
            this.logger.error('Error creating login notification:', error);
        }
    }
    async handleUploadCompleted(data) {
        try {
            await this.notificationService.create({
                userId: data.userId,
                type: notification_entity_1.NotificationType.UPLOAD_COMPLETED,
                title: 'Archivo subido exitosamente',
                message: `Tu archivo "${data.fileName}" ha sido procesado y está listo para compartir.`,
                priority: notification_entity_1.NotificationPriority.MEDIUM,
                data: {
                    mediaId: data.mediaId,
                    fileName: data.fileName,
                    fileSize: data.fileSize,
                    mediaType: data.mediaType,
                    completedAt: data.completedAt
                },
                relatedEntityId: data.mediaId,
                relatedEntityType: 'media'
            });
            this.logger.log(`Upload confirmation sent to user: ${data.userId}, media: ${data.mediaId}`);
            await this.notificationService.createBroadcastNotification({
                type: notification_entity_1.NotificationType.NEW_CONTENT,
                title: '🎬 Nuevo contenido disponible',
                message: `Se ha subido nuevo contenido: "${data.fileName}". ¡Échale un vistazo!`,
                priority: notification_entity_1.NotificationPriority.LOW,
                data: {
                    mediaId: data.mediaId,
                    fileName: data.fileName,
                    mediaType: data.mediaType,
                    uploadedBy: data.userId,
                    completedAt: data.completedAt
                },
                relatedEntityId: data.mediaId,
                relatedEntityType: 'media',
                excludeUserId: data.userId
            });
            this.logger.log(`Broadcast notification sent for new content: ${data.mediaId}`);
        }
        catch (error) {
            this.logger.error('Error creating upload notifications:', error);
        }
    }
    async handleNewComment(data) {
        try {
            const title = data.isReply ? 'Nueva respuesta a tu comentario' : 'Nuevo comentario en tu contenido';
            const message = data.isReply
                ? `${data.authorEmail} respondió a tu comentario: "${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}"`
                : `${data.authorEmail} comentó en tu contenido: "${data.content.substring(0, 100)}${data.content.length > 100 ? '...' : ''}"`;
            await this.notificationService.create({
                userId: data.authorId,
                type: data.isReply ? notification_entity_1.NotificationType.COMMENT_REPLY : notification_entity_1.NotificationType.NEW_COMMENT,
                title,
                message,
                priority: notification_entity_1.NotificationPriority.MEDIUM,
                data: {
                    commentId: data.commentId,
                    contentId: data.contentId,
                    authorId: data.authorId,
                    authorEmail: data.authorEmail,
                    content: data.content,
                    parentId: data.parentId,
                    isReply: data.isReply,
                    createdAt: data.createdAt
                },
                relatedEntityId: data.commentId,
                relatedEntityType: 'comment'
            });
            this.logger.log(`Comment notification created for comment: ${data.commentId}`);
        }
        catch (error) {
            this.logger.error('Error creating comment notification:', error);
        }
    }
};
exports.EventListenerService = EventListenerService;
exports.EventListenerService = EventListenerService = EventListenerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], EventListenerService);
//# sourceMappingURL=event-listener.service.js.map