"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const notification_entity_1 = require("./entities/notification.entity");
const notification_service_1 = require("./services/notification.service");
const event_listener_service_1 = require("./services/event-listener.service");
const notification_controller_1 = require("./controllers/notification.controller");
const health_controller_1 = require("./controllers/health.controller");
const notification_gateway_1 = require("./gateways/notification.gateway");
const redis_config_1 = require("./config/redis.config");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5434),
                    username: configService.get('DB_USERNAME', 'admin'),
                    password: configService.get('DB_PASSWORD', 'admin123'),
                    database: configService.get('DB_NAME', 'postgres_notifications'),
                    entities: [notification_entity_1.Notification],
                    synchronize: configService.get('DB_SYNCHRONIZE', true),
                    logging: configService.get('DB_LOGGING', false),
                    ssl: configService.get('DB_SSL', false),
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET', 'your-secret-key'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            passport_1.PassportModule,
        ],
        controllers: [
            notification_controller_1.NotificationController,
            health_controller_1.HealthController,
        ],
        providers: [
            notification_service_1.NotificationService,
            event_listener_service_1.EventListenerService,
            notification_gateway_1.NotificationGateway,
            redis_config_1.RedisConfig,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [
            notification_service_1.NotificationService,
            redis_config_1.RedisConfig,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map