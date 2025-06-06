export declare enum NotificationType {
    USER_REGISTERED = "user_registered",
    LOGIN_NEW_DEVICE = "login_new_device",
    PASSWORD_CHANGED = "password_changed",
    LOGIN_FAILED = "login_failed",
    PROFILE_UPDATED = "profile_updated",
    UPLOAD_COMPLETED = "upload_completed",
    UPLOAD_FAILED = "upload_failed",
    MEDIA_PROCESSED = "media_processed",
    MEDIA_DELETED = "media_deleted",
    NEW_CONTENT = "new_content",
    NEW_CONTENT_FOLLOWED = "new_content_followed",
    MEDIA_REPORTED = "media_reported",
    NEW_COMMENT = "new_comment",
    COMMENT_REPLY = "comment_reply",
    COMMENT_MODERATED = "comment_moderated",
    COMMENT_APPROVED = "comment_approved",
    COMMENT_MENTION = "comment_mention",
    SYSTEM_MAINTENANCE = "system_maintenance",
    SYSTEM_UPDATE = "system_update",
    USAGE_LIMIT_REACHED = "usage_limit_reached",
    NEW_FOLLOWER = "new_follower",
    CONTENT_LIKED = "content_liked",
    CONTENT_TRENDING = "content_trending",
    MILESTONE_REACHED = "milestone_reached"
}
export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum NotificationChannel {
    WEBSOCKET = "websocket",
    EMAIL = "email",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: any;
    priority: NotificationPriority;
    channels: NotificationChannel[];
    isRead: boolean;
    readAt: Date;
    sentAt: Date;
    expiresAt: Date;
    relatedEntityId: string;
    relatedEntityType: string;
    createdAt: Date;
    updatedAt: Date;
}
