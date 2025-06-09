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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
    }
    async getStorageInfo() {
        return {
            totalSpaceGB: 100,
            usedSpaceGB: 25,
            availableSpaceGB: 75,
            usagePercentage: 25,
            status: 'healthy',
            warning: false,
            critical: false,
        };
    }
    async checkStorageHealth() {
        const info = await this.getStorageInfo();
        const warningThreshold = this.configService.get('STORAGE_WARNING_THRESHOLD', 90);
        const criticalThreshold = this.configService.get('STORAGE_CRITICAL_THRESHOLD', 95);
        const warning = info.usagePercentage >= warningThreshold;
        const critical = info.usagePercentage >= criticalThreshold;
        return {
            ...info,
            warning,
            critical,
            status: critical ? 'critical' : warning ? 'warning' : 'healthy',
        };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map