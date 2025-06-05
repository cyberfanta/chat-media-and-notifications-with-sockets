import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from '../services/comments.service';
import { AuthService } from '../auth/auth.service';
import { CommentStatus } from '../entities/comment.entity';

describe('CommentsController Simple Tests', () => {
  let controller: CommentsController;
  let commentsService: any;
  let authService: any;

  const mockComment = {
    id: 'comment-uuid-123',
    content: 'Test comment',
    contentId: 'content-uuid-123',
    userId: 'user-uuid-123',
    userEmail: 'test@example.com',
    status: CommentStatus.APPROVED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: {
      sub: 'user-uuid-123',
      email: 'test@example.com',
      role: 'user'
    }
  };

  beforeEach(async () => {
    commentsService = {
      create: jest.fn(),
      findByContentId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      moderate: jest.fn(),
      getPendingComments: jest.fn(),
      deleteByContentId: jest.fn(),
      getCommentStats: jest.fn(),
    };

    authService = {
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CommentsService, useValue: commentsService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const createDto = { content: 'Test', contentId: 'media-id' };
      commentsService.create.mockResolvedValue(mockComment);

      const result = await controller.createComment('media-id', createDto, mockRequest);

      expect(commentsService.create).toHaveBeenCalledWith(
        createDto, 
        mockRequest.user.sub, 
        mockRequest.user.email
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('getCommentsByMedia', () => {
    it('should return paginated comments', async () => {
      const mockResult = {
        comments: [mockComment],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      
      commentsService.findByContentId.mockResolvedValue(mockResult);

      const result = await controller.getCommentsByMedia('media-id', {});

      expect(commentsService.findByContentId).toHaveBeenCalledWith('media-id', {});
      expect(result).toEqual(mockResult);
    });
  });

  describe('getComment', () => {
    it('should return a comment', async () => {
      commentsService.findById.mockResolvedValue(mockComment);

      const result = await controller.getComment('comment-id');

      expect(commentsService.findById).toHaveBeenCalledWith('comment-id');
      expect(result).toEqual(mockComment);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const updateDto = { content: 'Updated' };
      const updatedComment = { ...mockComment, content: 'Updated' };
      
      commentsService.update.mockResolvedValue(updatedComment);

      const result = await controller.updateComment('comment-id', updateDto, mockRequest);

      expect(commentsService.update).toHaveBeenCalledWith(
        'comment-id', 
        updateDto, 
        mockRequest.user.sub
      );
      expect(result).toEqual(updatedComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      commentsService.delete.mockResolvedValue();

      await controller.deleteComment('comment-id', mockRequest);

      expect(commentsService.delete).toHaveBeenCalledWith('comment-id', mockRequest.user.sub);
    });
  });

  describe('moderateComment', () => {
    it('should moderate a comment', async () => {
      const moderateDto = { status: CommentStatus.APPROVED };
      const moderatedComment = { ...mockComment, status: CommentStatus.APPROVED };
      
      commentsService.moderate.mockResolvedValue(moderatedComment);

      const result = await controller.moderateComment('comment-id', moderateDto, mockRequest);

      expect(commentsService.moderate).toHaveBeenCalledWith(
        'comment-id', 
        moderateDto, 
        mockRequest.user.sub
      );
      expect(result).toEqual(moderatedComment);
    });
  });

  describe('deleteCommentsByMedia', () => {
    it('should delete comments by media id', async () => {
      commentsService.deleteByContentId.mockResolvedValue();

      await controller.deleteCommentsByMedia('media-id');

      expect(commentsService.deleteByContentId).toHaveBeenCalledWith('media-id');
    });
  });

  describe('getCommentStats', () => {
    it('should return comment statistics', async () => {
      const mockStats = { total: 10, approved: 8, pending: 2, rejected: 0 };
      
      commentsService.getCommentStats.mockResolvedValue(mockStats);

      const result = await controller.getCommentStats('media-id');

      expect(commentsService.getCommentStats).toHaveBeenCalledWith('media-id');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('comments-service');
      expect(result.timestamp).toBeDefined();
    });
  });
}); 