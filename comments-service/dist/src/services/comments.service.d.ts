import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ModerateCommentDto } from '../dto/moderate-comment.dto';
import { QueryCommentsDto } from '../dto/query-comments.dto';
import { RedisService } from '../redis/redis.service';
export interface PaginatedComments {
    comments: Comment[];
    total: number;
    page?: number;
    limit: number;
    totalPages?: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
    usedCursor?: boolean;
}
export declare class CommentsService {
    private commentRepository;
    private redisService;
    private readonly logger;
    constructor(commentRepository: Repository<Comment>, redisService: RedisService);
    create(createCommentDto: CreateCommentDto, userId: string, userEmail: string): Promise<Comment>;
    findByContentId(contentId: string, query: QueryCommentsDto): Promise<PaginatedComments>;
    private findByContentIdWithCursor;
    findById(id: string): Promise<Comment>;
    update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment>;
    delete(id: string, userId: string): Promise<void>;
    moderate(id: string, moderateDto: ModerateCommentDto, moderatorId: string): Promise<Comment>;
    deleteByContentId(contentId: string): Promise<void>;
    getPendingComments(query: QueryCommentsDto): Promise<PaginatedComments>;
    getCommentStats(contentId?: string): Promise<{
        total: number;
        approved: number;
        pending: number;
        rejected: number;
        contentId: string;
    }>;
    private deleteCommentAndReplies;
    private findAllComments;
}
