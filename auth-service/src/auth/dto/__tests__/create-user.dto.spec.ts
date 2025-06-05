import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RegisterDto } from '../register.dto';

describe('RegisterDto', () => {
  it('should validate a valid user creation DTO', async () => {
    const validDto = {
      email: 'test@example.com',
      password: 'validPassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const dto = plainToClass(RegisterDto, validDto);
    const errors = await validate(dto as object);

    expect(errors).toHaveLength(0);
  });

  it('should validate with minimal required fields', async () => {
    const minimalDto = {
      email: 'test@example.com',
      password: 'validPassword123',
    };

    const dto = plainToClass(RegisterDto, minimalDto);
    const errors = await validate(dto as object);

    expect(errors).toHaveLength(0);
  });

  describe('email validation', () => {
    it('should reject invalid email format', async () => {
      const invalidEmailDto = {
        email: 'invalid-email',
        password: 'validPassword123',
      };

      const dto = plainToClass(RegisterDto, invalidEmailDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isEmail).toBeDefined();
    });

    it('should reject empty email', async () => {
      const emptyEmailDto = {
        email: '',
        password: 'validPassword123',
      };

      const dto = plainToClass(RegisterDto, emptyEmailDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints?.isEmail).toBeDefined();
    });

    it('should reject missing email', async () => {
      const noEmailDto = {
        password: 'validPassword123',
      };

      const dto = plainToClass(RegisterDto, noEmailDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should handle whitespace in email validation', async () => {
      const whitespaceDto = {
        email: '  test@example.com  ',
        password: 'validPassword123',
      };

      const dto = plainToClass(RegisterDto, whitespaceDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1); // Should fail because email validator doesn't trim
      expect(errors[0].property).toBe('email');
    });
  });

  describe('password validation', () => {
    it('should reject password shorter than 6 characters', async () => {
      const shortPasswordDto = {
        email: 'test@example.com',
        password: '12345',
      };

      const dto = plainToClass(RegisterDto, shortPasswordDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it('should reject password longer than 50 characters', async () => {
      const longPasswordDto = {
        email: 'test@example.com',
        password: 'a'.repeat(51), // 51 characters, exceeds limit
      };

      const dto = plainToClass(RegisterDto, longPasswordDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('should reject empty password', async () => {
      const emptyPasswordDto = {
        email: 'test@example.com',
        password: '',
      };

      const dto = plainToClass(RegisterDto, emptyPasswordDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it('should reject missing password', async () => {
      const noPasswordDto = {
        email: 'test@example.com',
      };

      const dto = plainToClass(RegisterDto, noPasswordDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('should accept valid 6-character password', async () => {
      const validPasswordDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const dto = plainToClass(RegisterDto, validPasswordDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(0);
    });

    it('should accept passwords up to 50 characters', async () => {
      const longPasswordDto = {
        email: 'test@example.com',
        password: 'a'.repeat(50), // Exactly 50 characters
      };

      const dto = plainToClass(RegisterDto, longPasswordDto);
      const errors = await validate(dto as object);

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

      const dto = plainToClass(RegisterDto, validDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(0);
    });

    it('should accept firstName with special characters', async () => {
      const specialCharsDto = {
        email: 'test@example.com',
        password: 'validPassword123',
        firstName: 'José María',
      };

      const dto = plainToClass(RegisterDto, specialCharsDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(0);
    });

    it('should accept empty firstName since it is optional', async () => {
      const emptyFirstNameDto = {
        email: 'test@example.com',
        password: 'validPassword123',
        firstName: '',
      };

      const dto = plainToClass(RegisterDto, emptyFirstNameDto);
      const errors = await validate(dto as object);

      // Empty string should pass validation since field is optional
      expect(errors).toHaveLength(0);
    });

    it('should accept missing firstName', async () => {
      const noFirstNameDto = {
        email: 'test@example.com',
        password: 'validPassword123',
      };

      const dto = plainToClass(RegisterDto, noFirstNameDto);
      const errors = await validate(dto as object);

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

      const dto = plainToClass(RegisterDto, validDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(0);
    });

    it('should accept lastName with special characters', async () => {
      const specialCharsDto = {
        email: 'test@example.com',
        password: 'validPassword123',
        lastName: 'García-Rodríguez',
      };

      const dto = plainToClass(RegisterDto, specialCharsDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(0);
    });

    it('should accept empty lastName since it is optional', async () => {
      const emptyLastNameDto = {
        email: 'test@example.com',
        password: 'validPassword123',
        lastName: '',
      };

      const dto = plainToClass(RegisterDto, emptyLastNameDto);
      const errors = await validate(dto as object);

      // Empty string should pass validation since field is optional
      expect(errors).toHaveLength(0);
    });

    it('should accept missing lastName', async () => {
      const noLastNameDto = {
        email: 'test@example.com',
        password: 'validPassword123',
      };

      const dto = plainToClass(RegisterDto, noLastNameDto);
      const errors = await validate(dto as object);

      expect(errors).toHaveLength(0);
    });
  });

  describe('multiple validation errors', () => {
    it('should return multiple errors for multiple invalid fields', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: 'a'.repeat(51), // Too long (if provided)
        lastName: 'b'.repeat(51), // Too long (if provided)
      };

      const dto = plainToClass(RegisterDto, invalidDto);
      const errors = await validate(dto as object);

      expect(errors.length).toBeGreaterThanOrEqual(2); // At least email and password errors
      
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

      const dto = plainToClass(RegisterDto, nullDto);
      const errors = await validate(dto as object);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined values', async () => {
      const undefinedDto = {
        email: undefined,
        password: undefined,
        firstName: undefined,
        lastName: undefined,
      };

      const dto = plainToClass(RegisterDto, undefinedDto);
      const errors = await validate(dto as object);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
}); 