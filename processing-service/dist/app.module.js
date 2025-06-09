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
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const processing_module_1 = require("./processing/processing.module");
const events_module_1 = require("./events/events.module");
const health_module_1 = require("./health/health.module");
const processed_media_entity_1 = require("./entities/processed-media.entity");
const processing_job_entity_1 = require("./entities/processing-job.entity");
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
                    port: configService.get('DB_PORT', 5436),
                    username: configService.get('DB_USERNAME', 'processing_user'),
                    password: configService.get('DB_PASSWORD', 'processing_password'),
                    database: configService.get('DB_NAME', 'processing_db'),
                    entities: [processed_media_entity_1.ProcessedMedia, processing_job_entity_1.ProcessingJob],
                    synchronize: false,
                    logging: configService.get('NODE_ENV') === 'development',
                    retryAttempts: 3,
                    retryDelay: 3000,
                }),
                inject: [config_1.ConfigService],
            }),
            event_emitter_1.EventEmitterModule.forRoot({
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 20,
                verboseMemoryLeak: false,
                ignoreErrors: false,
            }),
            schedule_1.ScheduleModule.forRoot(),
            processing_module_1.ProcessingModule,
            events_module_1.EventsModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map