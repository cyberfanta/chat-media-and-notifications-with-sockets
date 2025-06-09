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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const storage_service_1 = require("./storage.service");
let StorageController = class StorageController {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async getStorageInfo() {
        const info = await this.storageService.getStorageInfo();
        return { storage: info };
    }
    async getStorageHealth() {
        const health = await this.storageService.checkStorageHealth();
        return { health };
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Get)('info'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener información de almacenamiento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Información de almacenamiento' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getStorageInfo", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar salud del almacenamiento' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado de salud del almacenamiento' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getStorageHealth", null);
exports.StorageController = StorageController = __decorate([
    (0, swagger_1.ApiTags)('storage'),
    (0, common_1.Controller)('storage'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map