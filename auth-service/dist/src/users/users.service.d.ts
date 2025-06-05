import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(registerDto: RegisterDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    promoteToModerator(userId: string): Promise<User>;
    validatePassword(user: User, password: string): Promise<boolean>;
    updateLastLogin(userId: string): Promise<void>;
    deactivateUser(userId: string): Promise<User>;
    activateUser(userId: string): Promise<User>;
}
