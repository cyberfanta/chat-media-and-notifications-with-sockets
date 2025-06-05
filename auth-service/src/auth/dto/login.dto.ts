import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @ApiProperty({
    example: 'MiContraseña123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string;
} 