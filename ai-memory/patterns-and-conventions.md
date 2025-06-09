# 🎨 Patrones y Convenciones de Código

## 📁 Estructura de Archivos NestJS

### Organización por Módulos
```
service-name/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts          # Root module
│   ├── module-name/           # Feature module
│   │   ├── module-name.module.ts
│   │   ├── module-name.controller.ts
│   │   ├── module-name.service.ts
│   │   ├── dto/
│   │   │   ├── create-entity.dto.ts
│   │   │   └── update-entity.dto.ts
│   │   └── entities/
│   │       └── entity.entity.ts
│   ├── common/               # Shared utilities
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   └── config/              # Configuration
│       └── database.config.ts
```

### Convenciones de Naming
- **Archivos**: kebab-case (`user-profile.service.ts`)
- **Clases**: PascalCase (`UserProfileService`)
- **Métodos**: camelCase (`getUserProfile()`)
- **Variables**: camelCase (`userProfile`)
- **Constantes**: SCREAMING_SNAKE_CASE (`JWT_SECRET`)
- **Interfaces**: PascalCase con prefix `I` (`IUserProfile`)

## 🛡️ DTOs y Validación

### Patrón DTO Estándar
```typescript
// Create DTO
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// Update DTO (extends PartialType)
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### Decoradores de Validación Comunes
- `@IsString()`, `@IsNumber()`, `@IsBoolean()`
- `@IsNotEmpty()`, `@IsOptional()`
- `@MinLength()`, `@MaxLength()`
- `@IsEmail()`, `@IsUUID()`
- `@Min()`, `@Max()`

## 🗄️ Patrones de Base de Datos

### Entity Pattern
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];
}
```

### Repository Pattern
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['comments'] 
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }
}
```

## 🔐 Autenticación y Autorización

### JWT Guard Pattern
```typescript
@Controller('protected-resource')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getProtectedData(@Request() req) {
    return { user: req.user };
  }
}
```

### Role-Based Access Control
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  @Post('promote/:userId')
  async promoteUser(@Param('userId') userId: string) {
    // Solo ADMIN puede acceder
  }
}
```

### Custom Decorators
```typescript
// Decorator para obtener usuario actual
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

## 🌐 Patrones de API

### Response Standardization
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  }
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Handling Pattern
```typescript
// Global Exception Filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;
    
    response.status(status).json({
      success: false,
      error: {
        code: exception.constructor.name,
        message: exception.message,
        timestamp: new Date().toISOString(),
      }
    });
  }
}
```

## 📦 Dependency Injection

### Service Pattern
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
    private logger: Logger,
  ) {}
  
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepo.create(createUserDto);
      return await this.userRepo.save(user);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
```

## 🔄 Event-Driven Patterns

### Event Publishing
```typescript
@Injectable()
export class MediaService {
  constructor(private eventEmitter: EventEmitter2) {}
  
  async uploadFile(file: Express.Multer.File): Promise<MediaFile> {
    const mediaFile = await this.saveFile(file);
    
    // Publicar evento para notificaciones
    this.eventEmitter.emit('media.uploaded', {
      userId: mediaFile.userId,
      mediaId: mediaFile.id,
      type: 'MEDIA_UPLOAD'
    });
    
    return mediaFile;
  }
}
```

### Event Listening
```typescript
@Injectable()
export class NotificationService {
  @OnEvent('media.uploaded')
  async handleMediaUpload(payload: MediaUploadEvent) {
    await this.createNotification({
      userId: payload.userId,
      type: NotificationType.MEDIA_UPLOAD,
      data: { mediaId: payload.mediaId }
    });
  }
}
```

## 🧪 Testing Patterns

### Unit Test Structure
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find user by id', async () => {
    const userId = 'test-id';
    const expectedUser = { id: userId, username: 'test' };
    
    jest.spyOn(repository, 'findOne').mockResolvedValue(expectedUser);
    
    const result = await service.findOne(userId);
    
    expect(result).toEqual(expectedUser);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
  });
});
```

## 📄 Documentación Swagger

### Controller Documentation
```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }
}
```

### DTO Documentation
```typescript
export class CreateUserDto {
  @ApiProperty({ 
    description: 'Username for the user',
    example: 'john_doe',
    minLength: 3,
    maxLength: 20
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;
}
```

## ⚡ Performance Patterns

### Caching Pattern
```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  
  async getOrSet<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl: number = 300
  ): Promise<T> {
    let value = await this.cacheManager.get<T>(key);
    
    if (!value) {
      value = await fetchFn();
      await this.cacheManager.set(key, value, ttl);
    }
    
    return value;
  }
}
```

### Pagination Pattern
```typescript
export class PaginationDto {
  @ApiProperty({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

// Service method
async findPaginated(paginationDto: PaginationDto) {
  const { page, limit } = paginationDto;
  const skip = (page - 1) * limit;
  
  const [data, total] = await this.repository.findAndCount({
    skip,
    take: limit,
    order: { created_at: 'DESC' }
  });
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

## 📋 Environment Configuration

### Config Pattern
```typescript
@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService) {}
  
  get config(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get('NODE_ENV') !== 'production',
    };
  }
}
```

## 🚦 Rate Limiting Pattern

```typescript
@Injectable()
export class RateLimitService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}
  
  async checkRateLimit(
    key: string, 
    limit: number, 
    window: number
  ): Promise<boolean> {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    return current <= limit;
  }
}
```

---

## 📝 Reglas de Código

### General Rules
1. **Siempre usar TypeScript strict mode**
2. **Todas las funciones públicas deben tener tipos explícitos**
3. **Usar interfaces para contratos entre módulos**
4. **Error handling explícito en todas las operaciones async**
5. **Logging estructurado para debugging**

### NestJS Specific
1. **Un módulo por feature**
2. **DTOs para toda entrada/salida de datos**
3. **Guards para autorización, Pipes para validación**
4. **Services para business logic, Controllers solo para routing**
5. **Interceptors para cross-cutting concerns** 