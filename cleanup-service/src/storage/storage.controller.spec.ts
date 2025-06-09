import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

describe('StorageController', () => {
  let controller: StorageController;
  let service: StorageService;

  const mockStorageService = {
    getStorageInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStorageInfo', () => {
    it('should return storage information', async () => {
      const mockStorageInfo = {
        totalSpace: '1 TB',
        usedSpace: '256 GB',
        freeSpace: '768 GB',
        usagePercentage: 25,
        directories: {
          uploads: {
            path: '/uploads',
            size: '200 GB',
            fileCount: 1500
          },
          chunks: {
            path: '/uploads/chunks',
            size: '56 GB',
            fileCount: 3000
          }
        },
        alerts: [],
        timestamp: new Date().toISOString()
      };

      mockStorageService.getStorageInfo.mockResolvedValue(mockStorageInfo);

      const result = await controller.getStorageInfo();

      expect(result).toEqual({ storage: mockStorageInfo });
      expect(mockStorageService.getStorageInfo).toHaveBeenCalled();
    });

    it('should handle storage info errors', async () => {
      mockStorageService.getStorageInfo.mockRejectedValue(new Error('Storage info failed'));

      await expect(controller.getStorageInfo()).rejects.toThrow('Storage info failed');
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 