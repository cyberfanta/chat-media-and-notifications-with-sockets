import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ValidatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://auth-service:3000';
  }

  async validateToken(token: string): Promise<ValidatedUser> {
    try {
      const response = await fetch(`${this.authServiceUrl}/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      const data = await response.json();
      
      // El auth-service retorna directamente el payload del JWT
      return {
        id: data.sub,
        email: data.email,
        firstName: '', // El auth-service no retorna estos campos en validateToken
        lastName: '',  // Podríamos hacer una segunda llamada para obtenerlos si es necesario
        role: data.role,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al validar token con auth-service');
    }
  }
} 