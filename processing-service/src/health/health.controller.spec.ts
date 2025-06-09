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

  describe('check', () => {
    it('should return health status', async () => {
      const result = await controller.check();

      expect(result).toEqual({
        success: true,
        message: 'Processing Service está funcionando correctamente',
        timestamp: expect.any(String),
        service: 'processing-service',
        version: '1.0.0'
      });
    });

    it('should return current timestamp', async () => {
      const beforeCall = Date.now();
      const result = await controller.check();
      const afterCall = Date.now();
      const resultTime = new Date(result.timestamp).getTime();

      expect(resultTime).toBeGreaterThanOrEqual(beforeCall);
      expect(resultTime).toBeLessThanOrEqual(afterCall);
    });

    it('should always return success true', async () => {
      const result = await controller.check();
      expect(result.success).toBe(true);
    });

    it('should return correct service name', async () => {
      const result = await controller.check();
      expect(result.service).toBe('processing-service');
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 