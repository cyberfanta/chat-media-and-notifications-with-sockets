import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment, CommentStatus } from '../entities/comment.entity';

describe('CommentsService Working Tests', () => {
  let service: CommentsService;
  let mockRepository: any;

  const mockComment = {
    id: 'comment-uuid-123',
    content: 'Test comment content',
    contentId: 'content-uuid-123',
    userId: 'user-uuid-123',
    userEmail: 'test@example.com',
    status: CommentStatus.PENDING,
    moderationReason: null,
    moderatedBy: null,
    moderatedAt: null,
    likes: 0,
    dislikes: 0,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isEdited: false,
    isModerated: false,
    isVisible: false,
    totalReactions: 0
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockComment], 1]),
        getCount: jest.fn().mockResolvedValue(1),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const createDto = {
        content: 'Test comment',
        contentId: 'content-uuid-123',
      };

      mockRepository.create.mockReturnValue(mockComment);
      mockRepository.save.mockResolvedValue(mockComment);

      const result = await service.create(createDto, 'user-id', 'test@email.com');

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it('should create a reply comment when parent exists', async () => {
      const createDto = {
        content: 'Test reply',
        contentId: 'content-uuid-123',
        parentId: 'parent-id',
      };

      const parentComment = { ...mockComment, id: 'parent-id', contentId: 'content-uuid-123' };
      
      mockRepository.findOne.mockResolvedValue(parentComment);
      mockRepository.create.mockReturnValue(mockComment);
      mockRepository.save.mockResolvedValue(mockComment);

      const result = await service.create(createDto, 'user-id', 'test@email.com');

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it('should throw error when parent comment not found', async () => {
      const createDto = {
        content: 'Test reply',
        contentId: 'content-uuid-123',
        parentId: 'non-existent-parent',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-id', 'test@email.com'))
        .rejects.toThrow('Comentario padre no encontrado');
    });
  });

  describe('findByContentId', () => {
    it('should return paginated comments', async () => {
      const query = { page: 1, limit: 10 };

      const result = await service.findByContentId('content-id', query);

      expect(result.comments).toEqual([mockComment]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findById', () => {
    it('should return a comment when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockComment);

      const result = await service.findById('comment-id');

      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an approved comment', async () => {
      const approvedComment = { ...mockComment, status: CommentStatus.APPROVED };
      const updateDto = { content: 'Updated content' };

      mockRepository.findOne.mockResolvedValue(approvedComment);
      mockRepository.save.mockResolvedValue({
        ...approvedComment,
        content: 'Updated content',
        isEdited: true,
        status: CommentStatus.PENDING
      });

      const result = await service.update('comment-id', updateDto, 'user-uuid-123');

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.content).toBe('Updated content');
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      const otherUserComment = { ...mockComment, userId: 'other-user' };
      mockRepository.findOne.mockResolvedValue(otherUserComment);

      await expect(service.update('comment-id', {}, 'user-uuid-123'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a comment successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockComment);
      mockRepository.find.mockResolvedValue([]);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('comment-id', 'user-uuid-123');

      expect(mockRepository.delete).toHaveBeenCalledWith('comment-id');
    });
  });

  describe('moderate', () => {
    it('should moderate a comment successfully', async () => {
      const moderateDto = {
        status: CommentStatus.APPROVED,
      };

      mockRepository.findOne.mockResolvedValue(mockComment);
      mockRepository.save.mockResolvedValue({
        ...mockComment,
        status: CommentStatus.APPROVED,
        moderatedBy: 'moderator-id',
        moderatedAt: new Date()
      });

      const result = await service.moderate('comment-id', moderateDto, 'moderator-id');

      expect(result.status).toBe(CommentStatus.APPROVED);
    });

    it('should throw error when rejecting without reason', async () => {
      const moderateDto = {
        status: CommentStatus.REJECTED,
      };

      mockRepository.findOne.mockResolvedValue(mockComment);

      await expect(service.moderate('comment-id', moderateDto, 'moderator-id'))
        .rejects.toThrow('Se requiere una razón para rechazar el comentario');
    });
  });

  describe('deleteByContentId', () => {
    it('should delete all comments for content', async () => {
      const comments = [mockComment, { ...mockComment, id: 'comment-2' }];
      mockRepository.find.mockResolvedValue(comments);
      mockRepository.remove.mockResolvedValue(comments);

      await service.deleteByContentId('content-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { contentId: 'content-id' }
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(comments);
    });
  });

  describe('getCommentStats', () => {
    it('should return statistics for content', async () => {
      const result = await service.getCommentStats('content-id');

      expect(result.total).toBe(1);
      expect(result.contentId).toBe('content-id');
    });
  });
}); 