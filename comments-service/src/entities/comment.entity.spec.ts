import { Comment, CommentStatus } from './comment.entity';

describe('Comment Entity', () => {
  describe('creation', () => {
    it('should create a comment with default values', () => {
      const comment = new Comment();
      
      expect(comment.id).toBeUndefined();
      expect(comment.content).toBeUndefined();
      expect(comment.status).toBeUndefined();
    });

    it('should create a comment with provided values', () => {
      const comment = new Comment();
      comment.id = 'comment-uuid-123';
      comment.content = 'Test comment content';
      comment.contentId = 'content-uuid-123';
      comment.userId = 'user-uuid-123';
      comment.userEmail = 'test@example.com';
      comment.status = CommentStatus.APPROVED;

      expect(comment.id).toBe('comment-uuid-123');
      expect(comment.content).toBe('Test comment content');
      expect(comment.status).toBe(CommentStatus.APPROVED);
    });
  });

  describe('CommentStatus enum', () => {
    it('should have all required status values', () => {
      expect(CommentStatus.PENDING).toBe('pending');
      expect(CommentStatus.APPROVED).toBe('approved');
      expect(CommentStatus.REJECTED).toBe('rejected');
      expect(CommentStatus.FLAGGED).toBe('flagged');
    });
  });

  describe('computed properties', () => {
    it('should calculate isModerated correctly', () => {
      const comment = new Comment();
      
      comment.status = CommentStatus.PENDING;
      expect(comment.isModerated).toBe(false);

      comment.status = CommentStatus.APPROVED;
      expect(comment.isModerated).toBe(true);
    });

    it('should calculate isVisible correctly', () => {
      const comment = new Comment();
      
      comment.status = CommentStatus.APPROVED;
      expect(comment.isVisible).toBe(true);

      comment.status = CommentStatus.REJECTED;
      expect(comment.isVisible).toBe(false);
    });

    it('should calculate totalReactions correctly', () => {
      const comment = new Comment();
      comment.likes = 5;
      comment.dislikes = 2;

      expect(comment.totalReactions).toBe(7);
    });
  });
}); 