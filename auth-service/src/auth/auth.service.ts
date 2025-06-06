import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClassSerializerInterceptor } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const user = await this.usersService.create(registerDto);
      
      // Publicar evento de registro para notificaciones
      await this.redisService.publishNotificationEvent('user_registered', {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        registrationDate: new Date().toISOString()
      });
      
      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Error al crear el usuario');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar el usuario por email
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Validar la contraseña
    const isPasswordValid = await this.usersService.validatePassword(user, password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.usersService.updateLastLogin(user.id);

    // Publicar evento de login para notificaciones
    await this.redisService.publishNotificationEvent('user_login', {
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString(),
      userAgent: 'Unknown' // Se puede mejorar pasando el request
    });

    return this.generateAuthResponse(user);
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return user;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  async promoteToModerator(userId: string): Promise<User> {
    return await this.usersService.promoteToModerator(userId);
  }

  private generateAuthResponse(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    
    // Decodificar el token para obtener la fecha de expiración
    const decodedToken = this.jwtService.decode(access_token) as any;
    const expires_in = decodedToken.exp - decodedToken.iat;

    return {
      user,
      access_token,
      token_type: 'Bearer',
      expires_in,
    };
  }

  async refreshToken(userId: string): Promise<AuthResponse> {
    const user = await this.usersService.findById(userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return this.generateAuthResponse(user);
  }

  async validateTokenFromOtherService(token: string): Promise<JwtPayload> {
    try {
      // Verificar y decodificar el token
      const payload = this.jwtService.verify(token) as JwtPayload;
      
      // Verificar que el usuario existe y está activo
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no válido');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
} 