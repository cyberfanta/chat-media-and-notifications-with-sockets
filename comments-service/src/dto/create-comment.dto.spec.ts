import { CreateCommentDto } from './create-comment.dto';

describe('CreateCommentDto', () => {
  describe('creation', () => {
    it('should create a DTO with valid data', () => {
      const dto = new CreateCommentDto();
      dto.content = 'This is a valid comment';
      dto.contentId = '12345678-1234-1234-1234-123456789012';

      expect(dto.content).toBe('This is a valid comment');
      expect(dto.contentId).toBe('12345678-1234-1234-1234-123456789012');
    });

    it('should create a DTO with parentId', () => {
      const dto = new CreateCommentDto();
      dto.content = 'This is a reply comment';
      dto.contentId = '12345678-1234-1234-1234-123456789012';
      dto.parentId = '87654321-4321-4321-4321-210987654321';

      expect(dto.content).toBe('This is a reply comment');
      expect(dto.contentId).toBe('12345678-1234-1234-1234-123456789012');
      expect(dto.parentId).toBe('87654321-4321-4321-4321-210987654321');
    });

    it('should create a DTO without parentId', () => {
      const dto = new CreateCommentDto();
      dto.content = 'Top level comment';
      dto.contentId = '12345678-1234-1234-1234-123456789012';

      expect(dto.content).toBe('Top level comment');
      expect(dto.contentId).toBe('12345678-1234-1234-1234-123456789012');
      expect(dto.parentId).toBeUndefined();
    });
  });
}); 