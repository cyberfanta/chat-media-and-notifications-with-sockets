import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';

  async validateToken(token: string): Promise<any> {
    try {
      this.logger.debug(`Validating token with auth service: ${this.authServiceUrl}`);
      
      const response = await fetch(`${this.authServiceUrl}/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      this.logger.debug(`Auth service response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Error validating token: ${response.status} ${response.statusText} - ${errorText}`);
        return null;
      }

      const tokenData = await response.json();
      this.logger.debug(`Token validated for user: ${tokenData.email}`);
      
      // Transformar la respuesta del auth-service para mantener compatibilidad
      return {
        sub: tokenData.sub,
        email: tokenData.email,
        role: tokenData.role,
        id: tokenData.sub, // Alias para compatibilidad
      };
    } catch (error) {
      this.logger.error(`Error connecting to auth service: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      return null;
    }
  }

  async checkUserRole(userId: string, requiredRole: string): Promise<boolean> {
    try {
      // Para simplicidad, implementamos roles básicos
      // En una implementación más compleja, esto consultaría el auth-service
      return true; // Por ahora permitimos todas las operaciones
    } catch (error) {
      this.logger.error(`Error checking user role: ${error.message}`);
      return false;
    }
  }
} 