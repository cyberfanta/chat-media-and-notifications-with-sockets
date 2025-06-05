"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_entity_1 = require("./comment.entity");
describe('Comment Entity', () => {
    describe('creation', () => {
        it('should create a comment with default values', () => {
            const comment = new comment_entity_1.Comment();
            expect(comment.id).toBeUndefined();
            expect(comment.content).toBeUndefined();
            expect(comment.status).toBeUndefined();
        });
        it('should create a comment with provided values', () => {
            const comment = new comment_entity_1.Comment();
            comment.id = 'comment-uuid-123';
            comment.content = 'Test comment content';
            comment.contentId = 'content-uuid-123';
            comment.userId = 'user-uuid-123';
            comment.userEmail = 'test@example.com';
            comment.status = comment_entity_1.CommentStatus.APPROVED;
            expect(comment.id).toBe('comment-uuid-123');
            expect(comment.content).toBe('Test comment content');
            expect(comment.status).toBe(comment_entity_1.CommentStatus.APPROVED);
        });
    });
    describe('CommentStatus enum', () => {
        it('should have all required status values', () => {
            expect(comment_entity_1.CommentStatus.PENDING).toBe('pending');
            expect(comment_entity_1.CommentStatus.APPROVED).toBe('approved');
            expect(comment_entity_1.CommentStatus.REJECTED).toBe('rejected');
            expect(comment_entity_1.CommentStatus.FLAGGED).toBe('flagged');
        });
    });
    describe('computed properties', () => {
        it('should calculate isModerated correctly', () => {
            const comment = new comment_entity_1.Comment();
            comment.status = comment_entity_1.CommentStatus.PENDING;
            expect(comment.isModerated).toBe(false);
            comment.status = comment_entity_1.CommentStatus.APPROVED;
            expect(comment.isModerated).toBe(true);
        });
        it('should calculate isVisible correctly', () => {
            const comment = new comment_entity_1.Comment();
            comment.status = comment_entity_1.CommentStatus.APPROVED;
            expect(comment.isVisible).toBe(true);
            comment.status = comment_entity_1.CommentStatus.REJECTED;
            expect(comment.isVisible).toBe(false);
        });
        it('should calculate totalReactions correctly', () => {
            const comment = new comment_entity_1.Comment();
            comment.likes = 5;
            comment.dislikes = 2;
            expect(comment.totalReactions).toBe(7);
        });
    });
});
//# sourceMappingURL=comment.entity.spec.js.map