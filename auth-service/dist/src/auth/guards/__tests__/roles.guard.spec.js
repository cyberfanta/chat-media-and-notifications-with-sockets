"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const roles_guard_1 = require("../roles.guard");
const user_entity_1 = require("../../../users/entities/user.entity");
describe('RolesGuard', () => {
    let guard;
    let reflector;
    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };
    beforeEach(() => {
        reflector = mockReflector;
        guard = new roles_guard_1.RolesGuard(reflector);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('canActivate', () => {
        const createMockContext = (requiredRoles = [], userRole = user_entity_1.UserRole.USER) => {
            mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
            return {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: userRole ? { role: userRole } : null,
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            };
        };
        it('should allow access when no roles are required', () => {
            const context = createMockContext([], user_entity_1.UserRole.USER);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should allow access when user has required role', () => {
            const context = createMockContext([user_entity_1.UserRole.ADMIN], user_entity_1.UserRole.ADMIN);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should allow access when user has one of multiple required roles', () => {
            const context = createMockContext([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MODERATOR], user_entity_1.UserRole.MODERATOR);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should deny access when user lacks required role', () => {
            const context = createMockContext([user_entity_1.UserRole.ADMIN], user_entity_1.UserRole.USER);
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('should deny access when user is null', () => {
            mockReflector.getAllAndOverride.mockReturnValue([user_entity_1.UserRole.USER]);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: null,
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            };
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('should check roles from handler and class', () => {
            const context = createMockContext([user_entity_1.UserRole.ADMIN], user_entity_1.UserRole.ADMIN);
            guard.canActivate(context);
            expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
                context.getHandler(),
                context.getClass(),
            ]);
        });
        it('should handle empty roles array', () => {
            const context = createMockContext([], user_entity_1.UserRole.USER);
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should handle undefined roles', () => {
            mockReflector.getAllAndOverride.mockReturnValue(undefined);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { role: user_entity_1.UserRole.USER },
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            };
            const result = guard.canActivate(context);
            expect(result).toBe(true);
        });
        it('should handle multiple role requirements correctly', () => {
            const context1 = createMockContext([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MODERATOR], user_entity_1.UserRole.USER);
            expect(() => guard.canActivate(context1)).toThrow(common_1.ForbiddenException);
            const context2 = createMockContext([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MODERATOR], user_entity_1.UserRole.ADMIN);
            expect(guard.canActivate(context2)).toBe(true);
            const context3 = createMockContext([user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.MODERATOR], user_entity_1.UserRole.MODERATOR);
            expect(guard.canActivate(context3)).toBe(true);
        });
        it('should throw ForbiddenException with appropriate message', () => {
            const context = createMockContext([user_entity_1.UserRole.ADMIN], user_entity_1.UserRole.USER);
            try {
                guard.canActivate(context);
                fail('Expected ForbiddenException to be thrown');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.ForbiddenException);
                expect(error.message).toBe('Acceso denegado: rol insuficiente');
            }
        });
    });
    describe('Edge cases', () => {
        it('should handle malformed user object', () => {
            mockReflector.getAllAndOverride.mockReturnValue([user_entity_1.UserRole.USER]);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: {},
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            };
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('should handle request without user property', () => {
            mockReflector.getAllAndOverride.mockReturnValue([user_entity_1.UserRole.USER]);
            const context = {
                switchToHttp: () => ({
                    getRequest: () => ({}),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            };
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=roles.guard.spec.js.map