import { IsOptional, IsPositive, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '../entities/comment.entity';

export enum CommentSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  LIKES = 'likes',
  TOTAL_REACTIONS = 'totalReactions',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryCommentsDto {
  @ApiProperty({
    description: 'Número de página',
    example: 1,
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Cantidad de elementos por página',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Campo por el cual ordenar',
    enum: CommentSortBy,
    example: CommentSortBy.CREATED_AT,
    default: CommentSortBy.CREATED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(CommentSortBy)
  sortBy?: CommentSortBy = CommentSortBy.CREATED_AT;

  @ApiProperty({
    description: 'Orden de clasificación',
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    description: 'Filtrar por estado de comentario',
    enum: CommentStatus,
    example: CommentStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @ApiProperty({
    description: 'Filtrar por ID de usuario',
    example: 'user-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsUUID('all')
  userId?: string;

  @ApiProperty({
    description: 'Filtrar por ID de comentario padre',
    example: 'parent-comment-uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID('all')
  parentId?: string;

  @ApiProperty({
    description: 'Incluir solo comentarios de primer nivel (sin respuestas)',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  topLevelOnly?: boolean = false;

  @ApiProperty({
    description: 'Cursor para paginación basada en cursor (ID del último comentario visto)',
    example: 'comment-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsUUID('all')
  cursor?: string;

  @ApiProperty({
    description: 'Usar paginación basada en cursor en lugar de offset',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  useCursor?: boolean = false;
} 