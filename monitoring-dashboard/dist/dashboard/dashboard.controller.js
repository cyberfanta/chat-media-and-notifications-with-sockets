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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let DashboardController = class DashboardController {
    getDashboard() {
        return { title: 'Monitoring Dashboard' };
    }
    redirectToDashboard() {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta http-equiv="refresh" content="0; url=/dashboard">
        <title>Monitoring Dashboard</title>
      </head>
      <body>
        <p>Redirigiendo al <a href="/dashboard">Dashboard de Monitoreo</a>...</p>
      </body>
      </html>
    `;
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, common_1.Render)('dashboard'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Redirección al dashboard principal' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirecciona a /dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "redirectToDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('dashboard'),
    (0, common_1.Controller)()
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map