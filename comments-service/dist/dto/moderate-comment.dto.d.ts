import { CommentStatus } from '../entities/comment.entity';
export declare class ModerateCommentDto {
    status: CommentStatus;
    moderationReason?: string;
}
