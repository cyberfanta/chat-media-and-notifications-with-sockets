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
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const redis_config_1 = require("../config/redis.config");
const notification_service_1 = require("../services/notification.service");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(jwtService, configService, redisConfig, notificationService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisConfig = redisConfig;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
        this.initializeRedisSubscription();
    }
    async handleConnection(client) {
        try {
            this.logger.log(`Cliente conectando: ${client.id}`);
            const token = this.extractTokenFromHandshake(client);
            if (!token) {
                this.logger.warn(`Conexión sin token - Cliente: ${client.id}`);
                client.userId = null;
            }
            else {
                try {
                    const payload = await this.jwtService.verifyAsync(token, {
                        secret: this.configService.get('JWT_SECRET'),
                    });
                    client.userId = payload.sub || payload.id;
                }
                catch (jwtError) {
                    this.logger.error(`Token JWT inválido para cliente ${client.id}:`, jwtError.message);
                    client.emit('error', { message: 'Token JWT inválido' });
                    client.disconnect();
                    return;
                }
            }
            await client.join(`user_${client.userId}`);
            await this.redisConfig.addUserConnection(client.userId, client.id);
            this.logger.log(`Cliente autenticado y conectado: ${client.id} - Usuario: ${client.userId}`);
            await this.sendUnreadNotifications(client);
        }
        catch (error) {
            this.logger.error(`Error en la conexión del cliente ${client.id}:`, error.stack);
            client.emit('error', { message: 'Error de autenticación' });
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            await this.redisConfig.removeUserConnection(client.userId, client.id);
            this.logger.log(`Cliente desconectado: ${client.id} - Usuario: ${client.userId}`);
        }
        else {
            this.logger.log(`Cliente desconectado: ${client.id}`);
        }
    }
    async handleJoinNotifications(client) {
        if (client.userId) {
            await client.join(`user_${client.userId}`);
            client.emit('joined_notifications', { status: 'success' });
            const unreadCount = await this.notificationService.getUnreadCount(client.userId);
            client.emit('unread_count', { count: unreadCount });
        }
    }
    async handleMarkAsRead(client, data) {
        if (!client.userId) {
            client.emit('error', { message: 'No autenticado' });
            return;
        }
        try {
            const result = await this.notificationService.markAsRead(client.userId, data);
            client.emit('marked_as_read', { marked: result.marked });
            const unreadCount = await this.notificationService.getUnreadCount(client.userId);
            client.emit('unread_count', { count: unreadCount });
        }
        catch (error) {
            client.emit('error', { message: 'Error al marcar como leída' });
        }
    }
    async handleGetNotifications(client, filters) {
        if (!client.userId) {
            client.emit('error', { message: 'No autenticado' });
            return;
        }
        try {
            const result = await this.notificationService.findAll(client.userId, filters);
            client.emit('notifications', result);
        }
        catch (error) {
            client.emit('error', { message: 'Error al obtener notificaciones' });
        }
    }
    async sendNotificationToUser(userId, notification) {
        const room = `user_${userId}`;
        this.server.to(room).emit('new_notification', notification);
        const unreadCount = await this.notificationService.getUnreadCount(userId);
        this.server.to(room).emit('unread_count', { count: unreadCount });
    }
    async sendNotificationToUsers(userIds, notification) {
        for (const userId of userIds) {
            await this.sendNotificationToUser(userId, notification);
        }
    }
    async broadcastNotification(notification) {
        this.server.emit('broadcast_notification', notification);
    }
    async sendUnreadNotifications(client) {
        if (!client.userId)
            return;
        try {
            const unreadNotifications = await this.notificationService.findUnread(client.userId);
            const unreadCount = unreadNotifications.length;
            client.emit('unread_notifications', unreadNotifications);
            client.emit('unread_count', { count: unreadCount });
        }
        catch (error) {
            this.logger.error(`Error al enviar notificaciones no leídas a ${client.userId}:`, error.stack);
        }
    }
    extractTokenFromHandshake(client) {
        const tokenFromQuery = client.handshake.query.token;
        if (tokenFromQuery) {
            return tokenFromQuery;
        }
        const authHeader = client.handshake.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            return type === 'Bearer' ? token : null;
        }
        return null;
    }
    async initializeRedisSubscription() {
        const subscriber = this.redisConfig.getSubscriber();
        subscriber.subscribe('notification_created');
        subscriber.on('message', async (channel, message) => {
            try {
                this.logger.log(`Gateway recibió evento: ${channel}`);
                const data = JSON.parse(message);
                if (channel === 'notification_created') {
                    await this.sendNotificationToUser(data.userId, data.notification);
                    this.logger.log(`Notificación enviada por WebSocket a usuario: ${data.userId}`);
                }
            }
            catch (error) {
                this.logger.error('Error procesando mensaje de Redis:', error.stack);
            }
        });
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_notifications'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleJoinNotifications", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_as_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_notifications'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleGetNotifications", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        },
        transports: ['websocket'],
        namespace: '/notifications'
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        redis_config_1.RedisConfig,
        notification_service_1.NotificationService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map