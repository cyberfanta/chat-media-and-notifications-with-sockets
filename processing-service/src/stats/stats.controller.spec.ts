import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { ProcessingService } from '../processing/processing.service';

describe('StatsController', () => {
  let controller: StatsController;

  const mockProcessingService = {
    // Mock methods if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: ProcessingService,
          useValue: mockProcessingService,
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
  });

  describe('getProcessingStats', () => {
    it('should return processing statistics', async () => {
      const result = await controller.getProcessingStats();

      expect(result).toEqual({
        success: true,
        data: {
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          successRate: 0,
          avgProcessingTimeMs: 0,
          avgProcessingTimeSeconds: 0,
          timestamp: expect.any(String),
          message: 'Stats service is ready - database tables pending setup'
        }
      });
    });

    it('should return current timestamp', async () => {
      const beforeCall = Date.now();
      const result = await controller.getProcessingStats();
      const afterCall = Date.now();
      const resultTime = new Date(result.data.timestamp).getTime();

      expect(resultTime).toBeGreaterThanOrEqual(beforeCall);
      expect(resultTime).toBeLessThanOrEqual(afterCall);
    });

    it('should return valid stats data', async () => {
      const result = await controller.getProcessingStats();
      
      expect(result.data.totalJobs).toBe(0);
      expect(result.data.completedJobs).toBe(0);
      expect(result.data.failedJobs).toBe(0);
      expect(result.data.successRate).toBe(0);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 