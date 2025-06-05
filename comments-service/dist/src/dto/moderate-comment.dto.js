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
exports.ModerateCommentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const comment_entity_1 = require("../entities/comment.entity");
class ModerateCommentDto {
}
exports.ModerateCommentDto = ModerateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nuevo estado del comentario',
        enum: comment_entity_1.CommentStatus,
        example: comment_entity_1.CommentStatus.APPROVED,
    }),
    (0, class_validator_1.IsEnum)(comment_entity_1.CommentStatus, {
        message: 'Status debe ser uno de: pending, approved, rejected, flagged',
    }),
    __metadata("design:type", String)
], ModerateCommentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Razón de la moderación (obligatorio si se rechaza)',
        example: 'Contenido inapropiado, lenguaje ofensivo',
        required: false,
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 500, {
        message: 'La razón de moderación debe tener entre 1 y 500 caracteres',
    }),
    __metadata("design:type", String)
], ModerateCommentDto.prototype, "moderationReason", void 0);
//# sourceMappingURL=moderate-comment.dto.js.map