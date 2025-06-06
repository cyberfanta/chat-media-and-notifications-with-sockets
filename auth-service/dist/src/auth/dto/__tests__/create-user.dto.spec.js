"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const register_dto_1 = require("../register.dto");
describe('RegisterDto', () => {
    it('should validate a valid user creation DTO', async () => {
        const validDto = {
            email: 'test@example.com',
            password: 'validPassword123',
            firstName: 'Test',
            lastName: 'User',
        };
        const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, validDto);
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors).toHaveLength(0);
    });
    it('should validate with minimal required fields', async () => {
        const minimalDto = {
            email: 'test@example.com',
            password: 'validPassword123',
        };
        const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, minimalDto);
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors).toHaveLength(0);
    });
    describe('email validation', () => {
        it('should reject invalid email format', async () => {
            const invalidEmailDto = {
                email: 'invalid-email',
                password: 'validPassword123',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, invalidEmailDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints?.isEmail).toBeDefined();
        });
        it('should reject empty email', async () => {
            const emptyEmailDto = {
                email: '',
                password: 'validPassword123',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, emptyEmailDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints?.isEmail).toBeDefined();
        });
        it('should reject missing email', async () => {
            const noEmailDto = {
                password: 'validPassword123',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, noEmailDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });
        it('should handle whitespace in email validation', async () => {
            const whitespaceDto = {
                email: '  test@example.com  ',
                password: 'validPassword123',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, whitespaceDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });
    });
    describe('password validation', () => {
        it('should reject password shorter than 6 characters', async () => {
            const shortPasswordDto = {
                email: 'test@example.com',
                password: '12345',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, shortPasswordDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints?.minLength).toBeDefined();
        });
        it('should reject password longer than 50 characters', async () => {
            const longPasswordDto = {
                email: 'test@example.com',
                password: 'a'.repeat(51),
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, longPasswordDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints?.maxLength).toBeDefined();
        });
        it('should reject empty password', async () => {
            const emptyPasswordDto = {
                email: 'test@example.com',
                password: '',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, emptyPasswordDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints?.minLength).toBeDefined();
        });
        it('should reject missing password', async () => {
            const noPasswordDto = {
                email: 'test@example.com',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, noPasswordDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });
        it('should accept valid 6-character password', async () => {
            const validPasswordDto = {
                email: 'test@example.com',
                password: '123456',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, validPasswordDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
        it('should accept passwords up to 50 characters', async () => {
            const longPasswordDto = {
                email: 'test@example.com',
                password: 'a'.repeat(50),
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, longPasswordDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
    });
    describe('firstName validation (optional field)', () => {
        it('should accept valid firstName', async () => {
            const validDto = {
                email: 'test@example.com',
                password: 'validPassword123',
                firstName: 'John',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, validDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
        it('should accept firstName with special characters', async () => {
            const specialCharsDto = {
                email: 'test@example.com',
                password: 'validPassword123',
                firstName: 'José María',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, specialCharsDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
        it('should accept empty firstName since it is optional', async () => {
            const emptyFirstNameDto = {
                email: 'test@example.com',
                password: 'validPassword123',
                firstName: '',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, emptyFirstNameDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
        it('should accept missing firstName', async () => {
            const noFirstNameDto = {
                email: 'test@example.com',
                password: 'validPassword123',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, noFirstNameDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
    });
    describe('lastName validation (optional field)', () => {
        it('should accept valid lastName', async () => {
            const validDto = {
                email: 'test@example.com',
                password: 'validPassword123',
                lastName: 'Doe',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, validDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
        it('should accept lastName with special characters', async () => {
            const specialCharsDto = {
                email: 'test@example.com',
                password: 'validPassword123',
                lastName: 'García-Rodríguez',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, specialCharsDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
        it('should accept empty lastName since it is optional', async () => {
            const emptyLastNameDto = {
                email: 'test@example.com',
                password: 'validPassword123',
                lastName: '',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, emptyLastNameDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
        it('should accept missing lastName', async () => {
            const noLastNameDto = {
                email: 'test@example.com',
                password: 'validPassword123',
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, noLastNameDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors).toHaveLength(0);
        });
    });
    describe('multiple validation errors', () => {
        it('should return multiple errors for multiple invalid fields', async () => {
            const invalidDto = {
                email: 'invalid-email',
                password: '123',
                firstName: 'a'.repeat(51),
                lastName: 'b'.repeat(51),
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, invalidDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors.length).toBeGreaterThanOrEqual(2);
            const errorProperties = errors.map(error => error.property);
            expect(errorProperties).toContain('email');
            expect(errorProperties).toContain('password');
        });
    });
    describe('edge cases', () => {
        it('should handle null values', async () => {
            const nullDto = {
                email: null,
                password: null,
                firstName: null,
                lastName: null,
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, nullDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors.length).toBeGreaterThan(0);
        });
        it('should handle undefined values', async () => {
            const undefinedDto = {
                email: undefined,
                password: undefined,
                firstName: undefined,
                lastName: undefined,
            };
            const dto = (0, class_transformer_1.plainToClass)(register_dto_1.RegisterDto, undefinedDto);
            const errors = await (0, class_validator_1.validate)(dto);
            expect(errors.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=create-user.dto.spec.js.map