import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  private readonly commentsServiceUrl = process.env.COMMENTS_SERVICE_URL || 'http://comments-service:3000';

  async deleteCommentsByMediaId(mediaId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.commentsServiceUrl}/comments/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Failed to delete comments for media ${mediaId}: ${response.statusText}`);
        return;
      }

      this.logger.log(`Successfully deleted comments for media: ${mediaId}`);
    } catch (error) {
      this.logger.error(`Error deleting comments for media ${mediaId}: ${error.message}`);
      // No lanzamos error para que no bloquee la eliminación del archivo multimedia
    }
  }
} 