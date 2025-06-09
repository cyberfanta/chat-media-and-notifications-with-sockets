import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { ProcessingService } from '../processing/processing.service';

describe('QueueController', () => {
  let controller: QueueController;

  const mockProcessingService = {
    // Mock methods if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: ProcessingService,
          useValue: mockProcessingService,
        },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
  });

  describe('getQueueStatus', () => {
    it('should return queue status', async () => {
      const result = await controller.getQueueStatus();

      expect(result).toEqual({
        success: true,
        data: {
          total: 0,
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          recentJobs: [],
          message: 'Queue service is ready - database tables pending setup'
        }
      });
    });

    it('should return success true', async () => {
      const result = await controller.getQueueStatus();
      expect(result.success).toBe(true);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 