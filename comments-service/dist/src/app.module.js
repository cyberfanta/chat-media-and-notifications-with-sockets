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
const database_config_1 = require("./config/database.config");
const comment_entity_1 = require("./entities/comment.entity");
const comments_controller_1 = require("./controllers/comments.controller");
const comments_service_1 = require("./services/comments.service");
const auth_service_1 = require("./auth/auth.service");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const redis_module_1 = require("./redis/redis.module");
const health_controller_1 = require("./health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(database_config_1.databaseConfig),
            typeorm_1.TypeOrmModule.forFeature([comment_entity_1.Comment]),
            redis_module_1.RedisModule,
        ],
        controllers: [comments_controller_1.CommentsController, health_controller_1.HealthController],
        providers: [
            comments_service_1.CommentsService,
            auth_service_1.AuthService,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [comments_service_1.CommentsService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map