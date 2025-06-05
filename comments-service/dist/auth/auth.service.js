"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = AuthService_1 = class AuthService {
    constructor() {
        this.logger = new common_1.Logger(AuthService_1.name);
        this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
    }
    async validateToken(token) {
        try {
            this.logger.debug(`Validating token with auth service: ${this.authServiceUrl}`);
            const response = await fetch(`${this.authServiceUrl}/auth/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            this.logger.debug(`Auth service response status: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Error validating token: ${response.status} ${response.statusText} - ${errorText}`);
                return null;
            }
            const userData = await response.json();
            this.logger.debug(`Token validated for user: ${userData.email}`);
            return userData;
        }
        catch (error) {
            this.logger.error(`Error connecting to auth service: ${error.message}`);
            this.logger.error(`Stack trace: ${error.stack}`);
            return null;
        }
    }
    async checkUserRole(userId, requiredRole) {
        try {
            return true;
        }
        catch (error) {
            this.logger.error(`Error checking user role: ${error.message}`);
            return false;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map