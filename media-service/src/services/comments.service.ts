import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  private readonly commentsServiceUrl = process.env.COMMENTS_SERVICE_URL || 'http://comments-service:3000';

  async deleteCommentsByContentId(contentId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.commentsServiceUrl}/comments/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Failed to delete comments for content ${contentId}: ${response.statusText}`);
        return;
      }

      this.logger.log(`Successfully deleted comments for content: ${contentId}`);
    } catch (error) {
      this.logger.error(`Error deleting comments for content ${contentId}: ${error.message}`);
      // No lanzamos error para que no bloquee la eliminación del contenido multimedia
    }
  }
} 