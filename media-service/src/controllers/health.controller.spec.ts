import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const beforeCall = Date.now();
      const result = await controller.healthCheck();
      const afterCall = Date.now();

      expect(result).toHaveProperty('status', 'OK');
      expect(result).toHaveProperty('timestamp');
      
      // Verify timestamp is a valid ISO string
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      
      // Verify timestamp is recent (within the last second)
      const timestampMs = new Date(result.timestamp).getTime();
      expect(timestampMs).toBeGreaterThanOrEqual(beforeCall - 1000);
      expect(timestampMs).toBeLessThanOrEqual(afterCall + 1000);
    });

    it('should return consistent structure', async () => {
      const result1 = await controller.healthCheck();
      
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result2 = await controller.healthCheck();

      // Structure should be consistent
      expect(Object.keys(result1)).toEqual(['status', 'timestamp']);
      expect(Object.keys(result2)).toEqual(['status', 'timestamp']);

      // Status should always be OK
      expect(result1.status).toBe('OK');
      expect(result2.status).toBe('OK');

      // Timestamps should be different
      expect(result1.timestamp).not.toBe(result2.timestamp);
    });

    it('should not throw any errors', async () => {
      await expect(controller.healthCheck()).resolves.not.toThrow();
    });
  });
}); 