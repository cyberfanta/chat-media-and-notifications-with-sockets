import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ModerateCommentDto } from '../dto/moderate-comment.dto';
import { QueryCommentsDto, CommentSortBy, SortOrder } from '../dto/query-comments.dto';
import { RedisService } from '../redis/redis.service';

export interface PaginatedComments {
  comments: Comment[];
  total: number;
  page?: number;
  limit: number;
  totalPages?: number;
  hasNext: boolean;
  hasPrev: boolean;
  // Cursor-based pagination fields
  nextCursor?: string;
  prevCursor?: string;
  usedCursor?: boolean;
}

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private redisService: RedisService,
  ) {}

  /** Crear un nuevo comentario o respuesta */
  async create(createCommentDto: CreateCommentDto, userId: string, userEmail: string): Promise<Comment> {
    try {
      if (createCommentDto.parentId) {
        const parentComment = await this.commentRepository.findOne({
          where: { id: createCommentDto.parentId },
        });

        if (!parentComment) {
          throw new BadRequestException('Comentario padre no encontrado');
        }

        if (parentComment.contentId !== createCommentDto.contentId) {
          throw new BadRequestException('El comentario padre debe estar en el mismo contenido');
        }
      }

      const comment = this.commentRepository.create({
        ...createCommentDto,
        userId,
        userEmail,
        status: CommentStatus.PENDING,
      });

      const savedComment = await this.commentRepository.save(comment);
      this.logger.log(`Comment created: ${savedComment.id} by user: ${userId}`);
      
      try {
        await this.redisService.publishNotificationEvent('new_comment', {
          commentId: savedComment.id,
          contentId: savedComment.contentId,
          authorId: userId,
          authorEmail: userEmail,
          content: savedComment.content,
          parentId: savedComment.parentId,
          isReply: !!savedComment.parentId,
          createdAt: savedComment.createdAt.toISOString()
        });
      } catch (redisError) {
        this.logger.warn('Failed to publish notification event (continuing without Redis):', redisError.message);
      }
      
      return savedComment;
    } catch (error) {
      this.logger.error(`Error creating comment: ${error.message}`);
      throw error;
    }
  }

  /** Obtener comentarios de un contenido con paginación y filtros */
  async findByContentId(contentId: string, query: QueryCommentsDto): Promise<PaginatedComments> {
    try {
      const { page = 1, limit, sortBy, sortOrder, status, userId, parentId, topLevelOnly, cursor, useCursor } = query;
      
      if (useCursor) {
        return this.findByContentIdWithCursor(contentId, query);
      }
      
      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.contentId = :contentId', { contentId });

      if (status) {
        queryBuilder.andWhere('comment.status = :status', { status });
      }

      if (userId) {
        queryBuilder.andWhere('comment.userId = :userId', { userId });
      }

      if (parentId) {
        queryBuilder.andWhere('comment.parentId = :parentId', { parentId });
      }

      if (topLevelOnly) {
        queryBuilder.andWhere('comment.parentId IS NULL');
      }

      let orderField = 'comment.createdAt';
      if (sortBy === CommentSortBy.UPDATED_AT) {
        orderField = 'comment.updatedAt';
      } else if (sortBy === CommentSortBy.LIKES) {
        orderField = 'comment.likes';
      }

      queryBuilder.orderBy(orderField, sortOrder);

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [comments, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      this.logger.debug(`Found ${comments.length} comments for content ${contentId}, page ${page} (offset-based)`);

      return {
        comments,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
        usedCursor: false,
      };
    } catch (error) {
      this.logger.error(`Error finding comments: ${error.message}`);
      throw error;
    }
  }

  private async findByContentIdWithCursor(contentId: string, query: QueryCommentsDto): Promise<PaginatedComments> {
    const { limit, sortBy, sortOrder, status, userId, parentId, topLevelOnly, cursor } = query;
    
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.contentId = :contentId', { contentId });

    if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('comment.userId = :userId', { userId });
    }

    if (parentId) {
      queryBuilder.andWhere('comment.parentId = :parentId', { parentId });
    }

    if (topLevelOnly) {
      queryBuilder.andWhere('comment.parentId IS NULL');
    }
    let orderField = 'comment.createdAt';
    let orderFieldAlias = 'createdAt';
    if (sortBy === CommentSortBy.UPDATED_AT) {
      orderField = 'comment.updatedAt';
      orderFieldAlias = 'updatedAt';
    } else if (sortBy === CommentSortBy.LIKES) {
      orderField = 'comment.likes';
      orderFieldAlias = 'likes';
    }

    if (cursor) {
      const cursorComment = await this.commentRepository.findOne({ 
        where: { id: cursor },
        select: ['id', orderFieldAlias as keyof Comment] 
      });

      if (cursorComment) {
        const cursorValue = cursorComment[orderFieldAlias];
        
        if (sortOrder === SortOrder.DESC) {
          queryBuilder.andWhere(`${orderField} < :cursorValue OR (${orderField} = :cursorValue AND comment.id < :cursorId)`, {
            cursorValue,
            cursorId: cursor
          });
        } else {
          queryBuilder.andWhere(`${orderField} > :cursorValue OR (${orderField} = :cursorValue AND comment.id > :cursorId)`, {
            cursorValue,
            cursorId: cursor
          });
        }
      }
    }

    queryBuilder.orderBy(orderField, sortOrder);
    queryBuilder.addOrderBy('comment.id', sortOrder);

    queryBuilder.take(limit + 1);

    const comments = await queryBuilder.getMany();
    const hasNext = comments.length > limit;
    
    if (hasNext) {
      comments.pop();
    }

    const nextCursor = hasNext && comments.length > 0 ? comments[comments.length - 1].id : undefined;
    const hasPrev = !!cursor;

    const prevCursor = hasPrev ? null : undefined;

    const totalQueryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.contentId = :contentId', { contentId });
    
    if (status) {
      totalQueryBuilder.andWhere('comment.status = :status', { status });
    }
    if (userId) {
      totalQueryBuilder.andWhere('comment.userId = :userId', { userId });
    }
    if (parentId) {
      totalQueryBuilder.andWhere('comment.parentId = :parentId', { parentId });
    }
    if (topLevelOnly) {
      totalQueryBuilder.andWhere('comment.parentId IS NULL');
    }

    const total = await totalQueryBuilder.getCount();

    this.logger.debug(`Found ${comments.length} comments for content ${contentId} with cursor ${cursor} (cursor-based)`);

    return {
      comments,
      total,
      limit,
      hasNext,
      hasPrev,
      nextCursor,
      prevCursor,
      usedCursor: true,
    };
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    
    if (!comment) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comment;
  }

  /** Actualizar un comentario propio */
  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    try {
      const comment = await this.findById(id);

      if (comment.userId !== userId) {
        throw new ForbiddenException('No tienes permisos para editar este comentario');
      }

      if (comment.status !== CommentStatus.APPROVED) {
        throw new BadRequestException('Solo se pueden editar comentarios aprobados');
      }

      Object.assign(comment, updateCommentDto);
      comment.isEdited = true;
      comment.status = CommentStatus.PENDING;

      const savedComment = await this.commentRepository.save(comment);
      this.logger.log(`Comment updated: ${savedComment.id} by user: ${userId}`);
      
      return savedComment;
    } catch (error) {
      this.logger.error(`Error updating comment: ${error.message}`);
      throw error;
    }
  }

  /** Eliminar un comentario propio y todas sus respuestas */
  /** Eliminar un comentario propio y todas sus respuestas */
  async delete(id: string, userId: string): Promise<void> {
    try {
      const comment = await this.findById(id);

      if (comment.userId !== userId) {
        throw new ForbiddenException('No tienes permisos para eliminar este comentario');
      }

      await this.deleteCommentAndReplies(id);
      
      this.logger.log(`Comment deleted: ${id} by user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error deleting comment: ${error.message}`);
      throw error;
    }
  }

  async moderate(id: string, moderateDto: ModerateCommentDto, moderatorId: string): Promise<Comment> {
    try {
      const comment = await this.findById(id);

      // Validar que se proporcione razón si se rechaza
      if (moderateDto.status === CommentStatus.REJECTED && !moderateDto.moderationReason) {
        throw new BadRequestException('Se requiere una razón para rechazar el comentario');
      }

      // Actualizar el comentario con información de moderación
      comment.status = moderateDto.status;
      comment.moderationReason = moderateDto.moderationReason;
      comment.moderatedBy = moderatorId;
      comment.moderatedAt = new Date();

      const savedComment = await this.commentRepository.save(comment);
      this.logger.log(`Comment moderated: ${savedComment.id} to ${moderateDto.status} by moderator: ${moderatorId}`);
      
      return savedComment;
    } catch (error) {
      this.logger.error(`Error moderating comment: ${error.message}`);
      throw error;
    }
  }

  async deleteByContentId(contentId: string): Promise<void> {
    try {
      const comments = await this.commentRepository.find({
        where: { contentId },
      });

      if (comments.length > 0) {
        await this.commentRepository.remove(comments);
        this.logger.log(`Deleted ${comments.length} comments for content: ${contentId}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting comments by content ID: ${error.message}`);
      throw error;
    }
  }

  async getPendingComments(query: QueryCommentsDto): Promise<PaginatedComments> {
    const modifiedQuery = { ...query, status: CommentStatus.PENDING };
    return this.findAllComments(modifiedQuery);
  }

  async getCommentStats(contentId?: string) {
    try {
      const queryBuilder = this.commentRepository.createQueryBuilder('comment');

      if (contentId) {
        queryBuilder.where('comment.contentId = :contentId', { contentId });
      }

      const total = await queryBuilder.getCount();
      const approved = await queryBuilder.andWhere('comment.status = :status', { status: CommentStatus.APPROVED }).getCount();
      const pending = await queryBuilder.andWhere('comment.status = :status', { status: CommentStatus.PENDING }).getCount();
      const rejected = await queryBuilder.andWhere('comment.status = :status', { status: CommentStatus.REJECTED }).getCount();

      return {
        total,
        approved,
        pending,
        rejected,
        contentId: contentId || 'all',
      };
    } catch (error) {
      this.logger.error(`Error getting comment stats: ${error.message}`);
      throw error;
    }
  }

  private async deleteCommentAndReplies(commentId: string): Promise<void> {
    // Encontrar todas las respuestas a este comentario
    const replies = await this.commentRepository.find({
      where: { parentId: commentId },
    });

    // Eliminar recursivamente todas las respuestas
    for (const reply of replies) {
      await this.deleteCommentAndReplies(reply.id);
    }

    // Eliminar el comentario principal
    await this.commentRepository.delete(commentId);
  }

  private async findAllComments(query: QueryCommentsDto): Promise<PaginatedComments> {
    try {
      const { page, limit, sortBy, sortOrder, status, userId, parentId, topLevelOnly } = query;
      
      const queryBuilder = this.commentRepository.createQueryBuilder('comment');

      // Aplicar filtros
      if (status) {
        queryBuilder.where('comment.status = :status', { status });
      }

      if (userId) {
        queryBuilder.andWhere('comment.userId = :userId', { userId });
      }

      if (parentId) {
        queryBuilder.andWhere('comment.parentId = :parentId', { parentId });
      }

      if (topLevelOnly) {
        queryBuilder.andWhere('comment.parentId IS NULL');
      }

      // Aplicar ordenamiento
      let orderField = 'comment.createdAt';
      if (sortBy === CommentSortBy.UPDATED_AT) {
        orderField = 'comment.updatedAt';
      } else if (sortBy === CommentSortBy.LIKES) {
        orderField = 'comment.likes';
      }

      queryBuilder.orderBy(orderField, sortOrder);

      // Aplicar paginación
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [comments, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        comments,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      };
    } catch (error) {
      this.logger.error(`Error finding all comments: ${error.message}`);
      throw error;
    }
  }
} 