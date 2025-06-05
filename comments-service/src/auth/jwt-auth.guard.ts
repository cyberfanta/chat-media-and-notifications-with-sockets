import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No token provided in request');
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      const user = await this.authService.validateToken(token);
      
      if (!user) {
        this.logger.warn('Invalid token provided');
        throw new UnauthorizedException('Token inválido o expirado');
      }

      // Adjuntar información del usuario a la request
      request.user = user;
      return true;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      throw new UnauthorizedException('Error de autenticación');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 