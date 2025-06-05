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
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string, userEmail: string): Promise<Comment> {
    try {
      // Verificar que el comentario padre existe si se proporciona
      if (createCommentDto.parentId) {
        const parentComment = await this.commentRepository.findOne({
          where: { id: createCommentDto.parentId },
        });

        if (!parentComment) {
          throw new BadRequestException('Comentario padre no encontrado');
        }

        // Verificar que el comentario padre está en el mismo contenido
        if (parentComment.contentId !== createCommentDto.contentId) {
          throw new BadRequestException('El comentario padre debe estar en el mismo contenido');
        }
      }

      const comment = this.commentRepository.create({
        ...createCommentDto,
        userId,
        userEmail,
        status: CommentStatus.PENDING, // Todos los comentarios inician pendientes
      });

      const savedComment = await this.commentRepository.save(comment);
      this.logger.log(`Comment created: ${savedComment.id} by user: ${userId}`);
      
      return savedComment;
    } catch (error) {
      this.logger.error(`Error creating comment: ${error.message}`);
      throw error;
    }
  }

  async findByContentId(contentId: string, query: QueryCommentsDto): Promise<PaginatedComments> {
    try {
      const { page = 1, limit, sortBy, sortOrder, status, userId, parentId, topLevelOnly, cursor, useCursor } = query;
      
      if (useCursor) {
        return this.findByContentIdWithCursor(contentId, query);
      }
      
      // Fallback a paginación offset-based tradicional
      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.contentId = :contentId', { contentId });

      // Aplicar filtros
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

      // Aplicar ordenamiento
      let orderField = 'comment.createdAt';
      if (sortBy === CommentSortBy.UPDATED_AT) {
        orderField = 'comment.updatedAt';
      } else if (sortBy === CommentSortBy.LIKES) {
        orderField = 'comment.likes';
      }

      queryBuilder.orderBy(orderField, sortOrder);

      // Aplicar paginación offset-based
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

    // Aplicar filtros
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

    // Determinar el campo de ordenamiento
    let orderField = 'comment.createdAt';
    let orderFieldAlias = 'createdAt';
    if (sortBy === CommentSortBy.UPDATED_AT) {
      orderField = 'comment.updatedAt';
      orderFieldAlias = 'updatedAt';
    } else if (sortBy === CommentSortBy.LIKES) {
      orderField = 'comment.likes';
      orderFieldAlias = 'likes';
    }

    // Aplicar cursor si existe
    if (cursor) {
      // Obtener el valor del campo de ordenamiento del comentario cursor
      const cursorComment = await this.commentRepository.findOne({ 
        where: { id: cursor },
        select: ['id', orderFieldAlias as keyof Comment] 
      });

      if (cursorComment) {
        const cursorValue = cursorComment[orderFieldAlias];
        
        if (sortOrder === SortOrder.DESC) {
          // Para orden descendente, necesitamos comentarios con valores menores al cursor
          queryBuilder.andWhere(`${orderField} < :cursorValue OR (${orderField} = :cursorValue AND comment.id < :cursorId)`, {
            cursorValue,
            cursorId: cursor
          });
        } else {
          // Para orden ascendente, necesitamos comentarios con valores mayores al cursor
          queryBuilder.andWhere(`${orderField} > :cursorValue OR (${orderField} = :cursorValue AND comment.id > :cursorId)`, {
            cursorValue,
            cursorId: cursor
          });
        }
      }
    }

    // Aplicar ordenamiento (siempre incluir ID como campo secundario para consistencia)
    queryBuilder.orderBy(orderField, sortOrder);
    queryBuilder.addOrderBy('comment.id', sortOrder);

    // Obtener un elemento extra para determinar si hay más páginas
    queryBuilder.take(limit + 1);

    const comments = await queryBuilder.getMany();
    const hasNext = comments.length > limit;
    
    // Si hay más comentarios, remover el extra
    if (hasNext) {
      comments.pop();
    }

    // Determinar cursors para navegación
    const nextCursor = hasNext && comments.length > 0 ? comments[comments.length - 1].id : undefined;
    const hasPrev = !!cursor; // Si hay cursor, significa que hay página previa

    // Para obtener el cursor previo, necesitaríamos hacer una consulta inversa
    // Por simplicidad, solo indicamos si hay página previa
    const prevCursor = hasPrev ? null : undefined; // Se puede implementar si es necesario

    // Obtener total aproximado (puede ser costoso para grandes datasets)
    const totalQueryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.contentId = :contentId', { contentId });
    
    // Aplicar los mismos filtros para el conteo
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

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    try {
      const comment = await this.findById(id);

      // Verificar que el usuario es el propietario del comentario
      if (comment.userId !== userId) {
        throw new ForbiddenException('No tienes permisos para editar este comentario');
      }

      // Solo se pueden editar comentarios aprobados
      if (comment.status !== CommentStatus.APPROVED) {
        throw new BadRequestException('Solo se pueden editar comentarios aprobados');
      }

      // Actualizar el comentario
      Object.assign(comment, updateCommentDto);
      comment.isEdited = true;
      comment.status = CommentStatus.PENDING; // Vuelve a moderación después de editar

      const savedComment = await this.commentRepository.save(comment);
      this.logger.log(`Comment updated: ${savedComment.id} by user: ${userId}`);
      
      return savedComment;
    } catch (error) {
      this.logger.error(`Error updating comment: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const comment = await this.findById(id);

      // Verificar que el usuario es el propietario del comentario
      if (comment.userId !== userId) {
        throw new ForbiddenException('No tienes permisos para eliminar este comentario');
      }

      // Eliminar comentario y sus respuestas
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