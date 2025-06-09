import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { RedisService } from '../redis/redis.service';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { SortOrder, CommentSortBy } from '../dto/query-comments.dto';

describe('CommentsService - Cursor Pagination Tests', () => {
  let service: CommentsService;
  let mockRepository: any;
  let mockRedisService: any;

  const mockComments = [
    {
      id: 'comment-1',
      content: 'Primer comentario',
      contentId: 'content-123',
      userId: 'user-1',
      userEmail: 'user1@test.com',
      status: CommentStatus.APPROVED,
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-01T10:00:00Z'),
      likes: 10,
    },
    {
      id: 'comment-2',
      content: 'Segundo comentario',
      contentId: 'content-123',
      userId: 'user-2',
      userEmail: 'user2@test.com',
      status: CommentStatus.APPROVED,
      createdAt: new Date('2023-01-01T11:00:00Z'),
      updatedAt: new Date('2023-01-01T11:00:00Z'),
      likes: 5,
    },
    {
      id: 'comment-3',
      content: 'Tercer comentario',
      contentId: 'content-123',
      userId: 'user-3',
      userEmail: 'user3@test.com',
      status: CommentStatus.APPROVED,
      createdAt: new Date('2023-01-01T12:00:00Z'),
      updatedAt: new Date('2023-01-01T12:00:00Z'),
      likes: 15,
    },
  ];

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn().mockResolvedValue(3),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    mockRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      findOne: jest.fn(),
    };

    mockRedisService = {
      publishNotificationEvent: jest.fn().mockResolvedValue(true),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  describe('cursor-based pagination', () => {
    it('should return first page with cursor pagination', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      // Simulamos que hay más comentarios (devolvemos 3 para que hasNext sea true con limit 2)
      const commentsWithExtra = [...mockComments];
      queryBuilder.getMany.mockResolvedValue(commentsWithExtra);

      const query = {
        limit: 2,
        useCursor: true,
        sortBy: CommentSortBy.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const result = await service.findByContentId('content-123', query);

      expect(result.usedCursor).toBe(true);
      expect(result.comments).toHaveLength(2); // Se quita el extra
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
      expect(result.nextCursor).toBe('comment-2'); // ID del último comentario devuelto (después de quitar el extra)
      expect(result.page).toBeUndefined();
      expect(result.totalPages).toBeUndefined();
    });

    it('should handle cursor pagination with cursor provided', async () => {
      // Mock para encontrar el comentario cursor
      mockRepository.findOne.mockResolvedValue({
        id: 'comment-2',
        createdAt: new Date('2023-01-01T11:00:00Z'),
      });

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockComments[0]]); // Solo el primer comentario

      const query = {
        limit: 2,
        useCursor: true,
        cursor: 'comment-2',
        sortBy: CommentSortBy.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const result = await service.findByContentId('content-123', query);

      expect(result.usedCursor).toBe(true);
      expect(result.comments).toHaveLength(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
      expect(result.nextCursor).toBeUndefined();
      
      // Verificar que se aplicó el cursor correctamente
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('comment.createdAt < :cursorValue'),
        expect.objectContaining({
          cursorValue: expect.any(Date),
          cursorId: 'comment-2'
        })
      );
    });

    it('should handle ascending order with cursor', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 'comment-1',
        createdAt: new Date('2023-01-01T10:00:00Z'),
      });

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockComments[1], mockComments[2]]);

      const query = {
        limit: 2,
        useCursor: true,
        cursor: 'comment-1',
        sortBy: CommentSortBy.CREATED_AT,
        sortOrder: SortOrder.ASC,
      };

      const result = await service.findByContentId('content-123', query);

      expect(result.usedCursor).toBe(true);
      expect(result.comments).toHaveLength(2);
      
      // Verificar que se aplicó el cursor correctamente para orden ascendente
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('comment.createdAt > :cursorValue'),
        expect.objectContaining({
          cursorValue: expect.any(Date),
          cursorId: 'comment-1'
        })
      );
    });

    it('should handle cursor pagination with different sort fields', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 'comment-2',
        likes: 5,
      });

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockComments[2], mockComments[0]]);

      const query = {
        limit: 2,
        useCursor: true,
        cursor: 'comment-2',
        sortBy: CommentSortBy.LIKES,
        sortOrder: SortOrder.DESC,
      };

      const result = await service.findByContentId('content-123', query);

      expect(result.usedCursor).toBe(true);
      
      // Verificar que se usó el campo likes para el cursor
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('comment.likes < :cursorValue'),
        expect.objectContaining({
          cursorValue: 5,
          cursorId: 'comment-2'
        })
      );
    });

    it('should apply filters correctly with cursor pagination', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockComments[0]]);

      const query = {
        limit: 2,
        useCursor: true,
        status: CommentStatus.APPROVED,
        userId: 'user-1',
        topLevelOnly: true,
      };

      await service.findByContentId('content-123', query);

      // Verificar que se aplicaron todos los filtros
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.status = :status', { status: CommentStatus.APPROVED });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.userId = :userId', { userId: 'user-1' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.parentId IS NULL');
    });

    it('should fallback to offset pagination when useCursor is false', async () => {
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getManyAndCount = jest.fn().mockResolvedValue([mockComments.slice(0, 2), 3]);

      const query = {
        limit: 2,
        page: 1,
        useCursor: false,
      };

      const result = await service.findByContentId('content-123', query);

      expect(result.usedCursor).toBe(false);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(2);
      expect(result.nextCursor).toBeUndefined();
      
      // Verificar que se usó skip/take en lugar de cursor
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(2);
    });

    it('should handle invalid cursor gracefully', async () => {
      // Mock para cursor que no existe
      mockRepository.findOne.mockResolvedValue(null);

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockComments.slice(0, 2));

      const query = {
        limit: 2,
        useCursor: true,
        cursor: 'non-existent-cursor',
      };

      const result = await service.findByContentId('content-123', query);

      // Debería continuar sin aplicar condición de cursor
      expect(result.usedCursor).toBe(true);
      expect(result.comments).toHaveLength(2);
      
      // No debería haber llamada andWhere para cursor
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('cursorValue'),
        expect.any(Object)
      );
    });
  });

  describe('consistency benefits', () => {
    it('should demonstrate cursor pagination advantage over offset', async () => {
      // Este test documenta por qué cursor pagination es mejor
      // para datos que cambian frecuentemente
      
      const queryBuilder = mockRepository.createQueryBuilder();
      
      // Simulamos que hay más comentarios disponibles
      queryBuilder.getMany.mockResolvedValue([
        mockComments[1], // comment-2
        mockComments[2], // comment-3
      ]);

      const query = {
        limit: 2,
        useCursor: true,
        cursor: 'comment-1', // Comenzamos después del comment-1
        sortBy: CommentSortBy.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      mockRepository.findOne.mockResolvedValue({
        id: 'comment-1',
        createdAt: new Date('2023-01-01T10:00:00Z'),
      });

      const result = await service.findByContentId('content-123', query);

      // Con cursor pagination, incluso si se agregan nuevos comentarios
      // antes de comment-1, seguiremos obteniendo comment-2 y comment-3
      expect(result.comments).toEqual([mockComments[1], mockComments[2]]);
      
      // Esto garantiza consistencia: no vemos duplicados ni perdemos comentarios
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('comment.createdAt < :cursorValue'),
        expect.objectContaining({
          cursorValue: expect.any(Date),
          cursorId: 'comment-1'
        })
      );
    });
  });
}); 