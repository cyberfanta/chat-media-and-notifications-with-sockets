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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = RedisService_1 = class RedisService {
    constructor() {
        this.logger = new common_1.Logger(RedisService_1.name);
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://redis-notifications:6379'
        });
        this.client.on('error', (err) => {
            this.logger.error('Redis Client Error:', err);
        });
        this.client.on('connect', () => {
            this.logger.log('Connected to Redis');
        });
        this.connect().catch(err => {
            this.logger.warn('Redis connection failed during startup, will retry later:', err.message);
        });
    }
    async connect() {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
        }
        catch (error) {
            this.logger.warn('Failed to connect to Redis (service will continue without Redis):', error.message);
        }
    }
    async publish(channel, message) {
        try {
            await this.connect();
            if (this.client.isOpen) {
                await this.client.publish(channel, message);
                this.logger.log(`Published message to ${channel}: ${message}`);
            }
            else {
                this.logger.warn(`Cannot publish message to ${channel}: Redis not connected`);
            }
        }
        catch (error) {
            this.logger.warn('Failed to publish message (continuing without Redis):', error.message);
        }
    }
    async publishNotificationEvent(event, data) {
        const message = JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString(),
            service: 'comments-service'
        });
        await this.publish('notification_events', message);
    }
    async onModuleDestroy() {
        if (this.client && this.client.isOpen) {
            await this.client.quit();
            this.logger.log('Redis connection closed');
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map