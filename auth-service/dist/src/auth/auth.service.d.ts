import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
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
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    validateUser(payload: JwtPayload): Promise<User>;
    getProfile(userId: string): Promise<User>;
    promoteToModerator(userId: string): Promise<User>;
    private generateAuthResponse;
    refreshToken(userId: string): Promise<AuthResponse>;
}
