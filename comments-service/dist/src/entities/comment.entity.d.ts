export declare enum CommentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    FLAGGED = "flagged"
}
export declare class Comment {
    id: string;
    content: string;
    contentId: string;
    userId: string;
    userEmail: string;
    status: CommentStatus;
    moderationReason: string;
    moderatedBy: string;
    moderatedAt: Date;
    likes: number;
    dislikes: number;
    parentId: string;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
    get isModerated(): boolean;
    get isVisible(): boolean;
    get totalReactions(): number;
}
