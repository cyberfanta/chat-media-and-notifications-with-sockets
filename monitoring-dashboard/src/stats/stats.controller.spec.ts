import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { DashboardService } from '../dashboard/dashboard.service';

describe('StatsController', () => {
  let controller: StatsController;

  const mockDashboardService = {
    getSystemStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
  });

  describe('getSystemStats', () => {
    it('should return system statistics', async () => {
      const mockStats = {
        totalJobs: 100,
        activeJobs: 5,
        totalNotifications: 250,
        successRate: 95.5,
        processingTimeAvg: 1500,
        queueSize: 3
      };

      mockDashboardService.getSystemStats.mockResolvedValue(mockStats);

      const result = await controller.getSystemStats();

      expect(result).toEqual({ stats: mockStats });
      expect(mockDashboardService.getSystemStats).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockDashboardService.getSystemStats.mockRejectedValue(new Error('Service error'));

      await expect(controller.getSystemStats()).rejects.toThrow('Service error');
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 