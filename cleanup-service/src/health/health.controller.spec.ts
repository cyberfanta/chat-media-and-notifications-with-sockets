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

  describe('getHealth', () => {
    it('should return health status', async () => {
      const result = await controller.getHealth();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        service: 'cleanup-service',
        version: '1.0.0'
      });
    });

    it('should return current timestamp', async () => {
      const beforeCall = Date.now();
      const result = await controller.getHealth();
      const afterCall = Date.now();
      const resultTime = new Date(result.timestamp).getTime();

      expect(resultTime).toBeGreaterThanOrEqual(beforeCall);
      expect(resultTime).toBeLessThanOrEqual(afterCall);
    });

    it('should always return ok status', async () => {
      const result = await controller.getHealth();
      expect(result.status).toBe('ok');
    });

    it('should return correct service name', async () => {
      const result = await controller.getHealth();
      expect(result.service).toBe('cleanup-service');
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 