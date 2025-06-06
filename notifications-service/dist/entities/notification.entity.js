"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.NotificationChannel = exports.NotificationPriority = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
var NotificationType;
(function (NotificationType) {
    NotificationType["USER_REGISTERED"] = "user_registered";
    NotificationType["LOGIN_NEW_DEVICE"] = "login_new_device";
    NotificationType["PASSWORD_CHANGED"] = "password_changed";
    NotificationType["LOGIN_FAILED"] = "login_failed";
    NotificationType["PROFILE_UPDATED"] = "profile_updated";
    NotificationType["UPLOAD_COMPLETED"] = "upload_completed";
    NotificationType["UPLOAD_FAILED"] = "upload_failed";
    NotificationType["MEDIA_PROCESSED"] = "media_processed";
    NotificationType["MEDIA_DELETED"] = "media_deleted";
    NotificationType["NEW_CONTENT"] = "new_content";
    NotificationType["NEW_CONTENT_FOLLOWED"] = "new_content_followed";
    NotificationType["MEDIA_REPORTED"] = "media_reported";
    NotificationType["NEW_COMMENT"] = "new_comment";
    NotificationType["COMMENT_REPLY"] = "comment_reply";
    NotificationType["COMMENT_MODERATED"] = "comment_moderated";
    NotificationType["COMMENT_APPROVED"] = "comment_approved";
    NotificationType["COMMENT_MENTION"] = "comment_mention";
    NotificationType["SYSTEM_MAINTENANCE"] = "system_maintenance";
    NotificationType["SYSTEM_UPDATE"] = "system_update";
    NotificationType["USAGE_LIMIT_REACHED"] = "usage_limit_reached";
    NotificationType["NEW_FOLLOWER"] = "new_follower";
    NotificationType["CONTENT_LIKED"] = "content_liked";
    NotificationType["CONTENT_TRENDING"] = "content_trending";
    NotificationType["MILESTONE_REACHED"] = "milestone_reached";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["CRITICAL"] = "critical";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["WEBSOCKET"] = "websocket";
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["IN_APP"] = "in_app";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationType
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM
    }),
    __metadata("design:type", String)
], Notification.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationChannel,
        array: true,
        default: [NotificationChannel.WEBSOCKET, NotificationChannel.IN_APP]
    }),
    __metadata("design:type", Array)
], Notification.prototype, "channels", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_read', default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_entity_id', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "relatedEntityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'related_entity_type', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "relatedEntityType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['userId', 'isRead']),
    (0, typeorm_1.Index)(['type', 'createdAt'])
], Notification);
//# sourceMappingURL=notification.entity.js.map