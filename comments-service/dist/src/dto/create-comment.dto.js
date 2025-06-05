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
exports.CreateCommentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCommentDto {
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contenido del comentario',
        example: 'Este video está increíble, me encanta la calidad.',
        minLength: 1,
        maxLength: 1000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 1000, {
        message: 'El comentario debe tener entre 1 y 1000 caracteres',
    }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del contenido multimedia al que se comenta',
        example: 'abc123-def456-ghi789',
    }),
    (0, class_validator_1.IsUUID)('all', { message: 'contentId debe ser un UUID válido' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "contentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del comentario padre (para respuestas)',
        example: 'parent-comment-uuid',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('all', { message: 'parentId debe ser un UUID válido' }),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "parentId", void 0);
//# sourceMappingURL=create-comment.dto.js.map