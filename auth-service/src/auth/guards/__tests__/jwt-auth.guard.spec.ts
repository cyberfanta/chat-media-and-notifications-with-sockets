import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

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
  } as any;

  beforeEach(() => {
    reflector = mockReflector as any;
    guard = new JwtAuthGuard(reflector);
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
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when error exists', () => {
      const error = new Error('Token expired');
      const mockUser = { id: '123' };

      expect(() => guard.handleRequest(error, mockUser, null)).toThrow(UnauthorizedException);
    });

    it('should handle different error types', () => {
      const jwtError = new Error('JsonWebTokenError');
      
      expect(() => guard.handleRequest(jwtError, null, null)).toThrow(UnauthorizedException);
    });
  });
}); 