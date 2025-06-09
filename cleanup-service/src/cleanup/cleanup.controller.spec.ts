import { Test, TestingModule } from '@nestjs/testing';
import { CleanupController } from './cleanup.controller';
import { CleanupService } from './cleanup.service';

describe('CleanupController', () => {
  let controller: CleanupController;
  let service: CleanupService;

  const mockCleanupService = {
    runScheduledCleanup: jest.fn(),
    getCleanupLogs: jest.fn(),
    getCleanupStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CleanupController],
      providers: [
        {
          provide: CleanupService,
          useValue: mockCleanupService,
        },
      ],
    }).compile();

    controller = module.get<CleanupController>(CleanupController);
    service = module.get<CleanupService>(CleanupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runCleanup', () => {
    it('should run cleanup successfully', async () => {
      mockCleanupService.runScheduledCleanup.mockResolvedValue(undefined);

      const result = await controller.runCleanup();

      expect(result).toEqual({ message: 'Cleanup tasks executed successfully' });
      expect(mockCleanupService.runScheduledCleanup).toHaveBeenCalled();
    });

    it('should handle cleanup errors', async () => {
      mockCleanupService.runScheduledCleanup.mockRejectedValue(new Error('Cleanup failed'));

      await expect(controller.runCleanup()).rejects.toThrow('Cleanup failed');
    });
  });

  describe('getCleanupStats', () => {
    it('should return cleanup statistics', async () => {
      const mockStats = {
        lastCleanup: new Date().toISOString(),
        totalCleanupsRun: 10,
        totalFilesRemoved: 50,
        totalSpaceFreed: '125.5 MB',
        nextScheduledCleanup: new Date().toISOString(),
        cleanupFrequency: '6 hours'
      };

      mockCleanupService.getCleanupStats.mockResolvedValue(mockStats);

      const result = await controller.getCleanupStats();

      expect(result).toEqual({ stats: mockStats });
      expect(mockCleanupService.getCleanupStats).toHaveBeenCalled();
    });
  });

  describe('getCleanupLogs', () => {
    it('should return cleanup logs', async () => {
      const mockLogs = [
        { timestamp: new Date().toISOString(), message: 'Cleanup started' },
        { timestamp: new Date().toISOString(), message: 'Cleanup completed' }
      ];

      mockCleanupService.getCleanupLogs.mockResolvedValue(mockLogs);

      const result = await controller.getCleanupLogs();

      expect(result).toEqual({ logs: mockLogs });
      expect(mockCleanupService.getCleanupLogs).toHaveBeenCalled();
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 