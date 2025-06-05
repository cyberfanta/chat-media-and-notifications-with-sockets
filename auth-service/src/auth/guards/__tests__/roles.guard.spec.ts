import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { UserRole } from '../../../users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    reflector = mockReflector as any;
    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    const createMockContext = (requiredRoles: UserRole[] = [], userRole: UserRole = UserRole.USER): ExecutionContext => {
      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            user: userRole ? { role: userRole } : null,
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    };

    it('should allow access when no roles are required', () => {
      const context = createMockContext([], UserRole.USER);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const context = createMockContext([UserRole.ADMIN], UserRole.ADMIN);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const context = createMockContext([UserRole.ADMIN, UserRole.MODERATOR], UserRole.MODERATOR);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user lacks required role', () => {
      const context = createMockContext([UserRole.ADMIN], UserRole.USER);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny access when user is null', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: null,
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should check roles from handler and class', () => {
      const context = createMockContext([UserRole.ADMIN], UserRole.ADMIN);

      guard.canActivate(context);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should handle empty roles array', () => {
      const context = createMockContext([], UserRole.USER);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle undefined roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: UserRole.USER },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle multiple role requirements correctly', () => {
      // Test USER trying to access ADMIN+MODERATOR endpoint
      const context1 = createMockContext([UserRole.ADMIN, UserRole.MODERATOR], UserRole.USER);
      expect(() => guard.canActivate(context1)).toThrow(ForbiddenException);

      // Test ADMIN accessing ADMIN+MODERATOR endpoint
      const context2 = createMockContext([UserRole.ADMIN, UserRole.MODERATOR], UserRole.ADMIN);
      expect(guard.canActivate(context2)).toBe(true);

      // Test MODERATOR accessing ADMIN+MODERATOR endpoint
      const context3 = createMockContext([UserRole.ADMIN, UserRole.MODERATOR], UserRole.MODERATOR);
      expect(guard.canActivate(context3)).toBe(true);
    });

    it('should throw ForbiddenException with appropriate message', () => {
      const context = createMockContext([UserRole.ADMIN], UserRole.USER);

      try {
        guard.canActivate(context);
        fail('Expected ForbiddenException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('Acceso denegado: rol insuficiente');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed user object', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { /* no role property */ },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle request without user property', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            /* no user property */
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
}); 