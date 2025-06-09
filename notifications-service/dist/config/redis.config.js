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
var RedisConfig_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Redis = require("redis");
let RedisConfig = RedisConfig_1 = class RedisConfig {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisConfig_1.name);
        this.initializeClients();
    }
    async initializeClients() {
        const redisHost = this.configService.get('REDIS_HOST', 'redis-notifications');
        const redisPort = this.configService.get('REDIS_PORT', 6379);
        const redisPassword = this.configService.get('REDIS_PASSWORD');
        const redisConfig = {
            socket: {
                host: redisHost,
                port: redisPort,
                family: 4,
            },
            password: redisPassword || undefined,
        };
        this.redisClient = Redis.createClient(redisConfig);
        this.publisher = Redis.createClient(redisConfig);
        this.subscriber = Redis.createClient(redisConfig);
        await Promise.all([
            this.redisClient.connect(),
            this.publisher.connect(),
            this.subscriber.connect(),
        ]);
        this.logger.log('Redis clients connected successfully');
    }
    getClient() {
        return this.redisClient;
    }
    getPublisher() {
        return this.publisher;
    }
    getSubscriber() {
        return this.subscriber;
    }
    async cacheUnreadNotifications(userId, notifications) {
        const key = `unread_notifications:${userId}`;
        const ttl = 3600;
        await this.redisClient.setEx(key, ttl, JSON.stringify(notifications));
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
    async publishNotificationEvent(eventType, data) {
        await this.publisher.publish(`notification:${eventType}`, JSON.stringify(data));
    }
    async subscribeToNotificationEvents(eventType, callback) {
        await this.subscriber.subscribe(`notification:${eventType}`, callback);
    }
    async addUserConnection(userId, socketId) {
        const key = `user_connections:${userId}`;
        await this.redisClient.sAdd(key, socketId);
        await this.redisClient.expire(key, 3600);
    }
    async removeUserConnection(userId, socketId) {
        const key = `user_connections:${userId}`;
        await this.redisClient.sRem(key, socketId);
    }
    async getUserConnections(userId) {
        const key = `user_connections:${userId}`;
        return await this.redisClient.sMembers(key);
    }
    async checkRateLimit(userId) {
        const key = `rate_limit:${userId}`;
        const current = await this.redisClient.incr(key);
        if (current === 1) {
            await this.redisClient.expire(key, 60);
        }
        return current <= 10;
    }
};
exports.RedisConfig = RedisConfig;
exports.RedisConfig = RedisConfig = RedisConfig_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisConfig);
//# sourceMappingURL=redis.config.js.map