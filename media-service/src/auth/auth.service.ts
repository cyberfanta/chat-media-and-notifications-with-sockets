import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ValidatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  user: ValidatedUser;
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      const data: TokenValidationResponse = await response.json();
      
      if (!data.valid) {
        throw new UnauthorizedException('Token inválido');
      }

      return data.user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al validar token con auth-service');
    }
  }
} 