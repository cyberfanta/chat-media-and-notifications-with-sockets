import { CommentStatus } from '../entities/comment.entity';
export declare enum CommentSortBy {
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt",
    LIKES = "likes",
    TOTAL_REACTIONS = "totalReactions"
}
export declare enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export declare class QueryCommentsDto {
    page?: number;
    limit?: number;
    sortBy?: CommentSortBy;
    sortOrder?: SortOrder;
    status?: CommentStatus;
    userId?: string;
    parentId?: string;
    topLevelOnly?: boolean;
    cursor?: string;
    useCursor?: boolean;
}
