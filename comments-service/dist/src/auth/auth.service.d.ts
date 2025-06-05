export declare class AuthService {
    private readonly logger;
    private readonly authServiceUrl;
    validateToken(token: string): Promise<any>;
    checkUserRole(userId: string, requiredRole: string): Promise<boolean>;
}
