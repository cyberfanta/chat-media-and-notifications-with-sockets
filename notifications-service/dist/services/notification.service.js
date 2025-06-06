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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../entities/notification.entity");
const redis_config_1 = require("../config/redis.config");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationRepository, redisConfig) {
        this.notificationRepository = notificationRepository;
        this.redisConfig = redisConfig;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async create(createNotificationDto) {
        try {
            const canSend = await this.redisConfig.checkRateLimit(createNotificationDto.userId);
            if (!canSend) {
                throw new common_1.BadRequestException('Límite de notificaciones excedido para este usuario');
            }
            const notification = this.notificationRepository.create({
                ...createNotificationDto,
                priority: createNotificationDto.priority || notification_entity_1.NotificationPriority.MEDIUM,
                channels: createNotificationDto.channels || [notification_entity_1.NotificationChannel.WEBSOCKET, notification_entity_1.NotificationChannel.IN_APP],
                sentAt: new Date(),
            });
            const savedNotification = await this.notificationRepository.save(notification);
            await this.redisConfig.invalidateUnreadNotifications(createNotificationDto.userId);
            await this.redisConfig.publishNotificationEvent('notification_created', {
                userId: createNotificationDto.userId,
                notification: savedNotification,
            });
            return savedNotification;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al crear notificación: ${error.message}`);
        }
    }
    async findAll(userId, filters) {
        const { page = 1, limit = 20, type, priority, isRead, startDate, endDate } = filters;
        const whereConditions = { userId };
        if (type) {
            whereConditions.type = type;
        }
        if (priority) {
            whereConditions.priority = priority;
        }
        if (typeof isRead === 'boolean') {
            whereConditions.isRead = isRead;
        }
        if (startDate && endDate) {
            whereConditions.createdAt = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
        }
        const options = {
            where: whereConditions,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        };
        const [notifications, total] = await this.notificationRepository.findAndCount(options);
        const totalPages = Math.ceil(total / limit);
        if (isRead === false) {
            await this.redisConfig.cacheUnreadNotifications(userId, notifications);
        }
        return { notifications, total, totalPages };
    }
    async findUnread(userId) {
        const cached = await this.redisConfig.getUnreadNotifications(userId);
        if (cached) {
            return cached;
        }
        const notifications = await this.notificationRepository.find({
            where: { userId, isRead: false },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        await this.redisConfig.cacheUnreadNotifications(userId, notifications);
        return notifications;
    }
    async findOne(id, userId) {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notificación con ID ${id} no encontrada`);
        }
        return notification;
    }
    async update(id, userId, updateNotificationDto) {
        const notification = await this.findOne(id, userId);
        if (updateNotificationDto.isRead !== undefined) {
            notification.isRead = updateNotificationDto.isRead;
            notification.readAt = updateNotificationDto.isRead ? new Date() : null;
        }
        const updatedNotification = await this.notificationRepository.save(notification);
        if (updateNotificationDto.isRead !== undefined) {
            await this.redisConfig.invalidateUnreadNotifications(userId);
        }
        return updatedNotification;
    }
    async markAsRead(userId, markAsReadDto) {
        let query = this.notificationRepository
            .createQueryBuilder()
            .update(notification_entity_1.Notification)
            .set({
            isRead: true,
            readAt: new Date()
        })
            .where('userId = :userId', { userId })
            .andWhere('isRead = false');
        if (markAsReadDto.notificationIds && markAsReadDto.notificationIds.length > 0) {
            query = query.andWhere('id IN (:...ids)', { ids: markAsReadDto.notificationIds });
        }
        const result = await query.execute();
        await this.redisConfig.invalidateUnreadNotifications(userId);
        return { marked: result.affected || 0 };
    }
    async markAllAsRead(userId) {
        const result = await this.notificationRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
        await this.redisConfig.invalidateUnreadNotifications(userId);
        return { marked: result.affected || 0 };
    }
    async remove(id, userId) {
        const notification = await this.findOne(id, userId);
        await this.notificationRepository.remove(notification);
        await this.redisConfig.invalidateUnreadNotifications(userId);
    }
    async getUnreadCount(userId) {
        return await this.notificationRepository.count({
            where: { userId, isRead: false },
        });
    }
    async cleanupExpiredNotifications() {
        const result = await this.notificationRepository
            .createQueryBuilder()
            .delete()
            .from(notification_entity_1.Notification)
            .where('expiresAt IS NOT NULL')
            .andWhere('expiresAt < :now', { now: new Date() })
            .execute();
        return { deleted: result.affected || 0 };
    }
    async createWelcomeNotification(userId) {
        return this.create({
            userId,
            type: notification_entity_1.NotificationType.USER_REGISTERED,
            title: '¡Bienvenido!',
            message: 'Te damos la bienvenida a nuestra plataforma. ¡Esperamos que disfrutes la experiencia!',
            priority: notification_entity_1.NotificationPriority.HIGH,
            channels: [notification_entity_1.NotificationChannel.WEBSOCKET, notification_entity_1.NotificationChannel.IN_APP, notification_entity_1.NotificationChannel.EMAIL],
        });
    }
    async createCommentNotification(userId, commentData) {
        return this.create({
            userId,
            type: notification_entity_1.NotificationType.NEW_COMMENT,
            title: 'Nuevo comentario',
            message: `${commentData.authorName} ha comentado en tu contenido`,
            data: commentData,
            priority: notification_entity_1.NotificationPriority.MEDIUM,
            relatedEntityId: commentData.contentId,
            relatedEntityType: 'media',
        });
    }
    async createUploadNotification(userId, uploadData, success) {
        return this.create({
            userId,
            type: success ? notification_entity_1.NotificationType.UPLOAD_COMPLETED : notification_entity_1.NotificationType.UPLOAD_FAILED,
            title: success ? 'Subida completada' : 'Error en subida',
            message: success
                ? `Tu archivo "${uploadData.filename}" se ha subido correctamente`
                : `Hubo un error al subir "${uploadData.filename}"`,
            data: uploadData,
            priority: success ? notification_entity_1.NotificationPriority.MEDIUM : notification_entity_1.NotificationPriority.HIGH,
            relatedEntityId: uploadData.mediaId,
            relatedEntityType: 'media',
        });
    }
    async createBroadcastNotification(notificationData) {
        try {
            let sentCount = 0;
            const uniqueUserIds = await this.notificationRepository
                .createQueryBuilder('notification')
                .select('DISTINCT notification.userId', 'userId')
                .getRawMany();
            const batchPromises = uniqueUserIds
                .filter(user => user.userId !== notificationData.excludeUserId)
                .map(async (user) => {
                try {
                    await this.create({
                        userId: user.userId,
                        type: notificationData.type,
                        title: notificationData.title,
                        message: notificationData.message,
                        data: notificationData.data,
                        priority: notificationData.priority,
                        relatedEntityId: notificationData.relatedEntityId,
                        relatedEntityType: notificationData.relatedEntityType,
                        channels: [notification_entity_1.NotificationChannel.WEBSOCKET, notification_entity_1.NotificationChannel.IN_APP],
                    });
                    sentCount++;
                }
                catch (error) {
                    this.logger.error(`Error creating broadcast notification for user ${user.userId}:`, error.message);
                }
            });
            await Promise.allSettled(batchPromises);
            this.logger.log(`Broadcast notification sent to ${sentCount} users`);
            return { sent: sentCount };
        }
        catch (error) {
            this.logger.error('Error creating broadcast notifications:', error);
            throw new common_1.BadRequestException(`Error enviando notificación broadcast: ${error.message}`);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_config_1.RedisConfig])
], NotificationService);
//# sourceMappingURL=notification.service.js.map