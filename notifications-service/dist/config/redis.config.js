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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisConfig = class RedisConfig {
    constructor(configService) {
        this.configService = configService;
        const redisConfig = {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD', undefined),
            db: this.configService.get('REDIS_DB', 0),
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
        };
        this.redisClient = new ioredis_1.default(redisConfig);
        this.publisherClient = new ioredis_1.default(redisConfig);
        this.subscriberClient = new ioredis_1.default(redisConfig);
    }
    getClient() {
        return this.redisClient;
    }
    getPublisher() {
        return this.publisherClient;
    }
    getSubscriber() {
        return this.subscriberClient;
    }
    async cacheUnreadNotifications(userId, notifications) {
        const key = `unread_notifications:${userId}`;
        await this.redisClient.setex(key, 3600, JSON.stringify(notifications));
    }
    async getUnreadNotifications(userId) {
        const key = `unread_notifications:${userId}`;
        const cached = await this.redisClient.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    async invalidateUnreadNotifications(userId) {
        const key = `unread_notifications:${userId}`;
        await this.redisClient.del(key);
    }
    async publishNotificationEvent(event, data) {
        await this.publisherClient.publish('notification_events', JSON.stringify({ event, data }));
    }
    async publishEvent(channel, data) {
        await this.publisherClient.publish(channel, JSON.stringify(data));
    }
    async subscribeToMicroserviceEvents() {
        await this.subscriberClient.subscribe('auth_events', 'media_events', 'comments_events');
    }
    async addUserConnection(userId, socketId) {
        await this.redisClient.sadd(`user_connections:${userId}`, socketId);
    }
    async removeUserConnection(userId, socketId) {
        await this.redisClient.srem(`user_connections:${userId}`, socketId);
    }
    async getUserConnections(userId) {
        return await this.redisClient.smembers(`user_connections:${userId}`);
    }
    async checkRateLimit(userId, limit = 10, window = 60) {
        const key = `rate_limit:${userId}`;
        const current = await this.redisClient.incr(key);
        if (current === 1) {
            await this.redisClient.expire(key, window);
        }
        return current <= limit;
    }
};
exports.RedisConfig = RedisConfig;
exports.RedisConfig = RedisConfig = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisConfig);
//# sourceMappingURL=redis.config.js.map