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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CommentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("../entities/comment.entity");
const query_comments_dto_1 = require("../dto/query-comments.dto");
let CommentsService = CommentsService_1 = class CommentsService {
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
        this.logger = new common_1.Logger(CommentsService_1.name);
    }
    async create(createCommentDto, userId, userEmail) {
        try {
            if (createCommentDto.parentId) {
                const parentComment = await this.commentRepository.findOne({
                    where: { id: createCommentDto.parentId },
                });
                if (!parentComment) {
                    throw new common_1.BadRequestException('Comentario padre no encontrado');
                }
                if (parentComment.contentId !== createCommentDto.contentId) {
                    throw new common_1.BadRequestException('El comentario padre debe estar en el mismo contenido');
                }
            }
            const comment = this.commentRepository.create({
                ...createCommentDto,
                userId,
                userEmail,
                status: comment_entity_1.CommentStatus.PENDING,
            });
            const savedComment = await this.commentRepository.save(comment);
            this.logger.log(`Comment created: ${savedComment.id} by user: ${userId}`);
            return savedComment;
        }
        catch (error) {
            this.logger.error(`Error creating comment: ${error.message}`);
            throw error;
        }
    }
    async findByContentId(contentId, query) {
        try {
            const { page, limit, sortBy, sortOrder, status, userId, parentId, topLevelOnly } = query;
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
            if (sortBy === query_comments_dto_1.CommentSortBy.UPDATED_AT) {
                orderField = 'comment.updatedAt';
            }
            else if (sortBy === query_comments_dto_1.CommentSortBy.LIKES) {
                orderField = 'comment.likes';
            }
            queryBuilder.orderBy(orderField, sortOrder);
            const skip = (page - 1) * limit;
            queryBuilder.skip(skip).take(limit);
            const [comments, total] = await queryBuilder.getManyAndCount();
            const totalPages = Math.ceil(total / limit);
            const hasNext = page < totalPages;
            const hasPrev = page > 1;
            this.logger.debug(`Found ${comments.length} comments for content ${contentId}, page ${page}`);
            return {
                comments,
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrev,
            };
        }
        catch (error) {
            this.logger.error(`Error finding comments: ${error.message}`);
            throw error;
        }
    }
    async findById(id) {
        const comment = await this.commentRepository.findOne({ where: { id } });
        if (!comment) {
            throw new common_1.NotFoundException(`Comentario con ID ${id} no encontrado`);
        }
        return comment;
    }
    async update(id, updateCommentDto, userId) {
        try {
            const comment = await this.findById(id);
            if (comment.userId !== userId) {
                throw new common_1.ForbiddenException('No tienes permisos para editar este comentario');
            }
            if (comment.status !== comment_entity_1.CommentStatus.APPROVED) {
                throw new common_1.BadRequestException('Solo se pueden editar comentarios aprobados');
            }
            Object.assign(comment, updateCommentDto);
            comment.isEdited = true;
            comment.status = comment_entity_1.CommentStatus.PENDING;
            const savedComment = await this.commentRepository.save(comment);
            this.logger.log(`Comment updated: ${savedComment.id} by user: ${userId}`);
            return savedComment;
        }
        catch (error) {
            this.logger.error(`Error updating comment: ${error.message}`);
            throw error;
        }
    }
    async delete(id, userId) {
        try {
            const comment = await this.findById(id);
            if (comment.userId !== userId) {
                throw new common_1.ForbiddenException('No tienes permisos para eliminar este comentario');
            }
            await this.deleteCommentAndReplies(id);
            this.logger.log(`Comment deleted: ${id} by user: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Error deleting comment: ${error.message}`);
            throw error;
        }
    }
    async moderate(id, moderateDto, moderatorId) {
        try {
            const comment = await this.findById(id);
            if (moderateDto.status === comment_entity_1.CommentStatus.REJECTED && !moderateDto.moderationReason) {
                throw new common_1.BadRequestException('Se requiere una razón para rechazar el comentario');
            }
            comment.status = moderateDto.status;
            comment.moderationReason = moderateDto.moderationReason;
            comment.moderatedBy = moderatorId;
            comment.moderatedAt = new Date();
            const savedComment = await this.commentRepository.save(comment);
            this.logger.log(`Comment moderated: ${savedComment.id} to ${moderateDto.status} by moderator: ${moderatorId}`);
            return savedComment;
        }
        catch (error) {
            this.logger.error(`Error moderating comment: ${error.message}`);
            throw error;
        }
    }
    async deleteByContentId(contentId) {
        try {
            const comments = await this.commentRepository.find({
                where: { contentId },
            });
            if (comments.length > 0) {
                await this.commentRepository.remove(comments);
                this.logger.log(`Deleted ${comments.length} comments for content: ${contentId}`);
            }
        }
        catch (error) {
            this.logger.error(`Error deleting comments by content ID: ${error.message}`);
            throw error;
        }
    }
    async getPendingComments(query) {
        const modifiedQuery = { ...query, status: comment_entity_1.CommentStatus.PENDING };
        return this.findAllComments(modifiedQuery);
    }
    async getCommentStats(contentId) {
        try {
            const queryBuilder = this.commentRepository.createQueryBuilder('comment');
            if (contentId) {
                queryBuilder.where('comment.contentId = :contentId', { contentId });
            }
            const total = await queryBuilder.getCount();
            const approved = await queryBuilder.andWhere('comment.status = :status', { status: comment_entity_1.CommentStatus.APPROVED }).getCount();
            const pending = await queryBuilder.andWhere('comment.status = :status', { status: comment_entity_1.CommentStatus.PENDING }).getCount();
            const rejected = await queryBuilder.andWhere('comment.status = :status', { status: comment_entity_1.CommentStatus.REJECTED }).getCount();
            return {
                total,
                approved,
                pending,
                rejected,
                contentId: contentId || 'all',
            };
        }
        catch (error) {
            this.logger.error(`Error getting comment stats: ${error.message}`);
            throw error;
        }
    }
    async deleteCommentAndReplies(commentId) {
        const replies = await this.commentRepository.find({
            where: { parentId: commentId },
        });
        for (const reply of replies) {
            await this.deleteCommentAndReplies(reply.id);
        }
        await this.commentRepository.delete(commentId);
    }
    async findAllComments(query) {
        try {
            const { page, limit, sortBy, sortOrder, status, userId, parentId, topLevelOnly } = query;
            const queryBuilder = this.commentRepository.createQueryBuilder('comment');
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
            let orderField = 'comment.createdAt';
            if (sortBy === query_comments_dto_1.CommentSortBy.UPDATED_AT) {
                orderField = 'comment.updatedAt';
            }
            else if (sortBy === query_comments_dto_1.CommentSortBy.LIKES) {
                orderField = 'comment.likes';
            }
            queryBuilder.orderBy(orderField, sortOrder);
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
        }
        catch (error) {
            this.logger.error(`Error finding all comments: ${error.message}`);
            throw error;
        }
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = CommentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CommentsService);
//# sourceMappingURL=comments.service.js.map