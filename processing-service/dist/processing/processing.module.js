"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const processing_service_1 = require("./processing.service");
const processing_controller_1 = require("./processing.controller");
const processed_media_entity_1 = require("../entities/processed-media.entity");
const processing_job_entity_1 = require("../entities/processing-job.entity");
const events_module_1 = require("../events/events.module");
let ProcessingModule = class ProcessingModule {
};
exports.ProcessingModule = ProcessingModule;
exports.ProcessingModule = ProcessingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([processed_media_entity_1.ProcessedMedia, processing_job_entity_1.ProcessingJob]),
            config_1.ConfigModule,
            events_module_1.EventsModule,
        ],
        controllers: [processing_controller_1.ProcessingController],
        providers: [processing_service_1.ProcessingService],
        exports: [processing_service_1.ProcessingService],
    })
], ProcessingModule);
//# sourceMappingURL=processing.module.js.map