import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ModerateCommentDto } from '../dto/moderate-comment.dto';
import { QueryCommentsDto } from '../dto/query-comments.dto';
import { Comment } from '../entities/comment.entity';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    createComment(mediaId: string, createCommentDto: CreateCommentDto, req: any): Promise<Comment>;
    getCommentsByMedia(mediaId: string, query: QueryCommentsDto): Promise<import("../services/comments.service").PaginatedComments>;
    getComment(id: string): Promise<Comment>;
    updateComment(id: string, updateCommentDto: UpdateCommentDto, req: any): Promise<Comment>;
    deleteComment(id: string, req: any): Promise<void>;
    moderateComment(id: string, moderateDto: ModerateCommentDto, req: any): Promise<Comment>;
    getPendingComments(query: QueryCommentsDto): Promise<import("../services/comments.service").PaginatedComments>;
    deleteCommentsByMedia(mediaId: string): Promise<void>;
    getCommentStats(mediaId: string): Promise<{
        total: number;
        approved: number;
        pending: number;
        rejected: number;
        contentId: string;
    }>;
}
