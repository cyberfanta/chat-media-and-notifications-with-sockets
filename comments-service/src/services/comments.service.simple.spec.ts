import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { Comment, CommentStatus } from '../entities/comment.entity';

describe('CommentsService Simple Test', () => {
  let service: CommentsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a comment', async () => {
    const mockComment = {
      id: 'test-id',
      content: 'Test comment',
      contentId: 'content-id',
      userId: 'user-id',
      userEmail: 'test@test.com',
      status: CommentStatus.PENDING,
      moderationReason: null,
      moderatedBy: null,
      moderatedAt: null,
      likes: 0,
      dislikes: 0,
      parentId: null,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false
    };

    const createDto = {
      content: 'Test comment',
      contentId: 'content-id',
    };

    mockRepository.create.mockReturnValue(mockComment);
    mockRepository.save.mockResolvedValue(mockComment);

    const result = await service.create(createDto, 'user-id', 'test@test.com');

    expect(result).toEqual(mockComment);
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });
}); 