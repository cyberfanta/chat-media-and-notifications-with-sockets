import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PromoteUserDto } from './dto/promote-user.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    getProfile(req: any): Promise<User>;
    refreshToken(req: any): Promise<AuthResponse>;
    promoteToModerator(promoteUserDto: PromoteUserDto): Promise<{
        message: string;
        user: User;
    }>;
    validateToken(body: {
        token: string;
    }): Promise<any>;
}
