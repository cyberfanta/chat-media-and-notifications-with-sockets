import { Test, TestingModule } from '@nestjs/testing';
import { ProcessingController } from './processing.controller';
import { ProcessingService } from './processing.service';

describe('ProcessingController', () => {
  let controller: ProcessingController;
  let service: ProcessingService;

  const mockProcessingService = {
    startProcessing: jest.fn(),
    getJobStatus: jest.fn(),
    getAllJobs: jest.fn(),
    getProcessedMedia: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessingController],
      providers: [
        {
          provide: ProcessingService,
          useValue: mockProcessingService,
        },
      ],
    }).compile();

    controller = module.get<ProcessingController>(ProcessingController);
    service = module.get<ProcessingService>(ProcessingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startProcessing', () => {
    it('should start processing and return job info', async () => {
      const mockJob = {
        id: 'job_123',
        mediaId: 1,
        uploaderId: 1,
        status: 'WAITING'
      };

      mockProcessingService.startProcessing.mockResolvedValue(mockJob);

      const result = await controller.startProcessing({
        mediaId: 1,
        uploaderId: 1
      });

      expect(result).toEqual({
        success: true,
        message: 'Procesamiento iniciado',
        jobId: 'job_123',
        data: mockJob
      });
      expect(mockProcessingService.startProcessing).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('getJobStatus', () => {
    it('should return job status', async () => {
      const mockJob = {
        id: 'job_123',
        status: 'ACTIVE',
        progress: 75
      };

      mockProcessingService.getJobStatus.mockResolvedValue(mockJob);

      const result = await controller.getJobStatus('job_123');

      expect(result).toEqual({
        success: true,
        data: mockJob
      });
      expect(mockProcessingService.getJobStatus).toHaveBeenCalledWith('job_123');
    });
  });

  describe('getAllJobs', () => {
    it('should return all jobs', async () => {
      const mockJobs = [
        { id: 'job_1', status: 'COMPLETED' },
        { id: 'job_2', status: 'ACTIVE' }
      ];

      mockProcessingService.getAllJobs.mockResolvedValue(mockJobs);

      const result = await controller.getAllJobs();

      expect(result).toEqual({
        success: true,
        data: mockJobs,
        total: 2
      });
      expect(mockProcessingService.getAllJobs).toHaveBeenCalled();
    });
  });

  describe('getProcessedMedia', () => {
    it('should return processed media info', async () => {
      const mockMedia = {
        id: '1',
        originalPath: '/uploads/test.jpg',
        processedPath: '/uploads/processed/test.jpg',
        thumbnailPath: '/uploads/thumbnails/test.jpg'
      };

      mockProcessingService.getProcessedMedia.mockResolvedValue(mockMedia);

      const result = await controller.getProcessedMedia('1');

      expect(result).toEqual({
        success: true,
        data: mockMedia
      });
      expect(mockProcessingService.getProcessedMedia).toHaveBeenCalledWith('1');
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 