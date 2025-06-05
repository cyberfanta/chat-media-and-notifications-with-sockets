"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const comments_service_1 = require("./comments.service");
const comment_entity_1 = require("../entities/comment.entity");
describe('CommentsService Simple Test', () => {
    let service;
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
            status: comment_entity_1.CommentStatus.PENDING,
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
//# sourceMappingURL=comments.service.simple.spec.js.map