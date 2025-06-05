"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../jwt-auth.guard");
describe('JwtAuthGuard', () => {
    let guard;
    let reflector;
    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };
    const mockContext = {
        switchToHttp: () => ({
            getRequest: () => ({}),
            getResponse: () => ({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
    };
    beforeEach(() => {
        reflector = mockReflector;
        guard = new jwt_auth_guard_1.JwtAuthGuard(reflector);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('handleRequest', () => {
        it('should return user when valid', () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                role: 'USER',
            };
            const result = guard.handleRequest(null, mockUser, null);
            expect(result).toBe(mockUser);
        });
        it('should throw UnauthorizedException when no user', () => {
            expect(() => guard.handleRequest(null, null, null)).toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException when error exists', () => {
            const error = new Error('Token expired');
            const mockUser = { id: '123' };
            expect(() => guard.handleRequest(error, mockUser, null)).toThrow(common_1.UnauthorizedException);
        });
        it('should handle different error types', () => {
            const jwtError = new Error('JsonWebTokenError');
            expect(() => guard.handleRequest(jwtError, null, null)).toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=jwt-auth.guard.spec.js.map