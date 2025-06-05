import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PromoteUserDto } from './dto/promote-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Autenticación')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: Object,
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya existe',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return await this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async getProfile(@Request() req: any): Promise<User> {
    return await this.authService.getProfile(req.user.id);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    type: Object,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido',
  })
  async refreshToken(@Request() req: any): Promise<AuthResponse> {
    return await this.authService.refreshToken(req.user.id);
  }

  @Post('promote-to-moderator')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Promover usuario a moderador',
    description: 'Solo los administradores pueden promover usuarios a moderadores'
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario promovido exitosamente',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para realizar esta acción',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede modificar el rol de un administrador',
  })
  @ApiBody({ type: PromoteUserDto })
  async promoteToModerator(@Body() promoteUserDto: PromoteUserDto): Promise<{ message: string; user: User }> {
    const user = await this.authService.promoteToModerator(promoteUserDto.userId);
    return {
      message: 'Usuario promovido a moderador exitosamente',
      user,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado del servicio' })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
  })
  healthCheck(): { status: string; timestamp: string; service: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Auth Service',
    };
  }

  @Post('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Validar token JWT y obtener información del usuario',
    description: 'Endpoint para que otros microservicios validen tokens JWT' 
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async validateToken(@Request() req: any): Promise<{ valid: boolean; user: User }> {
    const user = await this.authService.getProfile(req.user.id);
    return {
      valid: true,
      user: user,
    };
  }
} 