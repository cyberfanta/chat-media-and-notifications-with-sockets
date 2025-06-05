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
exports.QueryCommentsDto = exports.SortOrder = exports.CommentSortBy = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const comment_entity_1 = require("../entities/comment.entity");
var CommentSortBy;
(function (CommentSortBy) {
    CommentSortBy["CREATED_AT"] = "createdAt";
    CommentSortBy["UPDATED_AT"] = "updatedAt";
    CommentSortBy["LIKES"] = "likes";
    CommentSortBy["TOTAL_REACTIONS"] = "totalReactions";
})(CommentSortBy || (exports.CommentSortBy = CommentSortBy = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "ASC";
    SortOrder["DESC"] = "DESC";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
class QueryCommentsDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = CommentSortBy.CREATED_AT;
        this.sortOrder = SortOrder.DESC;
        this.topLevelOnly = false;
    }
}
exports.QueryCommentsDto = QueryCommentsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número de página',
        example: 1,
        default: 1,
        minimum: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryCommentsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cantidad de elementos por página',
        example: 10,
        default: 10,
        minimum: 1,
        maximum: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryCommentsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Campo por el cual ordenar',
        enum: CommentSortBy,
        example: CommentSortBy.CREATED_AT,
        default: CommentSortBy.CREATED_AT,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CommentSortBy),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Orden de clasificación',
        enum: SortOrder,
        example: SortOrder.DESC,
        default: SortOrder.DESC,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filtrar por estado de comentario',
        enum: comment_entity_1.CommentStatus,
        example: comment_entity_1.CommentStatus.APPROVED,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(comment_entity_1.CommentStatus),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filtrar por ID de usuario',
        example: 'user-uuid-123',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('all'),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filtrar por ID de comentario padre',
        example: 'parent-comment-uuid',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('all'),
    __metadata("design:type", String)
], QueryCommentsDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Incluir solo comentarios de primer nivel (sin respuestas)',
        example: true,
        default: false,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryCommentsDto.prototype, "topLevelOnly", void 0);
//# sourceMappingURL=query-comments.dto.js.map