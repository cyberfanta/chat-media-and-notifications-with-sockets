"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const comments_service_1 = require("./comments.service");
const comment_entity_1 = require("../entities/comment.entity");
const query_comments_dto_1 = require("../dto/query-comments.dto");
describe('CommentsService - Cursor Pagination Tests', () => {
    let service;
    let mockRepository;
    const mockComments = [
        {
            id: 'comment-1',
            content: 'Primer comentario',
            contentId: 'content-123',
            userId: 'user-1',
            userEmail: 'user1@test.com',
            status: comment_entity_1.CommentStatus.APPROVED,
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
            status: comment_entity_1.CommentStatus.APPROVED,
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
            status: comment_entity_1.CommentStatus.APPROVED,
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                comments_service_1.CommentsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(comment_entity_1.Comment),
                    useValue: mockRepository,
                },
            ],
        }).compile();
        service = module.get(comments_service_1.CommentsService);
        jest.clearAllMocks();
    });
    describe('cursor-based pagination', () => {
        it('should return first page with cursor pagination', async () => {
            const queryBuilder = mockRepository.createQueryBuilder();
            const commentsWithExtra = [...mockComments];
            queryBuilder.getMany.mockResolvedValue(commentsWithExtra);
            const query = {
                limit: 2,
                useCursor: true,
                sortBy: query_comments_dto_1.CommentSortBy.CREATED_AT,
                sortOrder: query_comments_dto_1.SortOrder.DESC,
            };
            const result = await service.findByContentId('content-123', query);
            expect(result.usedCursor).toBe(true);
            expect(result.comments).toHaveLength(2);
            expect(result.hasNext).toBe(true);
            expect(result.hasPrev).toBe(false);
            expect(result.nextCursor).toBe('comment-2');
            expect(result.page).toBeUndefined();
            expect(result.totalPages).toBeUndefined();
        });
        it('should handle cursor pagination with cursor provided', async () => {
            mockRepository.findOne.mockResolvedValue({
                id: 'comment-2',
                createdAt: new Date('2023-01-01T11:00:00Z'),
            });
            const queryBuilder = mockRepository.createQueryBuilder();
            queryBuilder.getMany.mockResolvedValue([mockComments[0]]);
            const query = {
                limit: 2,
                useCursor: true,
                cursor: 'comment-2',
                sortBy: query_comments_dto_1.CommentSortBy.CREATED_AT,
                sortOrder: query_comments_dto_1.SortOrder.DESC,
            };
            const result = await service.findByContentId('content-123', query);
            expect(result.usedCursor).toBe(true);
            expect(result.comments).toHaveLength(1);
            expect(result.hasNext).toBe(false);
            expect(result.hasPrev).toBe(true);
            expect(result.nextCursor).toBeUndefined();
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining('comment.createdAt < :cursorValue'), expect.objectContaining({
                cursorValue: expect.any(Date),
                cursorId: 'comment-2'
            }));
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
                sortBy: query_comments_dto_1.CommentSortBy.CREATED_AT,
                sortOrder: query_comments_dto_1.SortOrder.ASC,
            };
            const result = await service.findByContentId('content-123', query);
            expect(result.usedCursor).toBe(true);
            expect(result.comments).toHaveLength(2);
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining('comment.createdAt > :cursorValue'), expect.objectContaining({
                cursorValue: expect.any(Date),
                cursorId: 'comment-1'
            }));
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
                sortBy: query_comments_dto_1.CommentSortBy.LIKES,
                sortOrder: query_comments_dto_1.SortOrder.DESC,
            };
            const result = await service.findByContentId('content-123', query);
            expect(result.usedCursor).toBe(true);
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining('comment.likes < :cursorValue'), expect.objectContaining({
                cursorValue: 5,
                cursorId: 'comment-2'
            }));
        });
        it('should apply filters correctly with cursor pagination', async () => {
            const queryBuilder = mockRepository.createQueryBuilder();
            queryBuilder.getMany.mockResolvedValue([mockComments[0]]);
            const query = {
                limit: 2,
                useCursor: true,
                status: comment_entity_1.CommentStatus.APPROVED,
                userId: 'user-1',
                topLevelOnly: true,
            };
            await service.findByContentId('content-123', query);
            expect(queryBuilder.andWhere).toHaveBeenCalledWith('comment.status = :status', { status: comment_entity_1.CommentStatus.APPROVED });
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
            expect(queryBuilder.skip).toHaveBeenCalledWith(0);
            expect(queryBuilder.take).toHaveBeenCalledWith(2);
        });
        it('should handle invalid cursor gracefully', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const queryBuilder = mockRepository.createQueryBuilder();
            queryBuilder.getMany.mockResolvedValue(mockComments.slice(0, 2));
            const query = {
                limit: 2,
                useCursor: true,
                cursor: 'non-existent-cursor',
            };
            const result = await service.findByContentId('content-123', query);
            expect(result.usedCursor).toBe(true);
            expect(result.comments).toHaveLength(2);
            expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(expect.stringContaining('cursorValue'), expect.any(Object));
        });
    });
    describe('consistency benefits', () => {
        it('should demonstrate cursor pagination advantage over offset', async () => {
            const queryBuilder = mockRepository.createQueryBuilder();
            queryBuilder.getMany.mockResolvedValue([
                mockComments[1],
                mockComments[2],
            ]);
            const query = {
                limit: 2,
                useCursor: true,
                cursor: 'comment-1',
                sortBy: query_comments_dto_1.CommentSortBy.CREATED_AT,
                sortOrder: query_comments_dto_1.SortOrder.DESC,
            };
            mockRepository.findOne.mockResolvedValue({
                id: 'comment-1',
                createdAt: new Date('2023-01-01T10:00:00Z'),
            });
            const result = await service.findByContentId('content-123', query);
            expect(result.comments).toEqual([mockComments[1], mockComments[2]]);
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining('comment.createdAt < :cursorValue'), expect.objectContaining({
                cursorValue: expect.any(Date),
                cursorId: 'comment-1'
            }));
        });
    });
});
//# sourceMappingURL=comments.service.cursor.spec.js.map