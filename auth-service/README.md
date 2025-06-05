# Servicio de Autenticación

Microservicio de autenticación desarrollado con NestJS, TypeScript, PostgreSQL y Redis.

## Características

- ✅ Autenticación JWT con roles (USER, MODERATOR, ADMIN)
- ✅ Registro y login de usuarios
- ✅ Validación de datos con class-validator
- ✅ Base de datos PostgreSQL con TypeORM
- ✅ Cache con Redis
- ✅ Documentación Swagger/OpenAPI
- ✅ Docker y Docker Compose
- ✅ Pruebas unitarias con Jest (70%+ cobertura)
- ✅ Guards de autenticación y autorización
- ✅ Decoradores personalizados
- ✅ Estrategias JWT

## Endpoints

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `GET /auth/profile` - Obtener perfil del usuario autenticado
- `POST /auth/refresh` - Renovar token JWT
- `POST /auth/promote-to-moderator` - Promover usuario a moderador (solo ADMIN)
- `GET /health` - Estado del servicio

## Pruebas Unitarias

El proyecto incluye pruebas unitarias completas con Jest que cubren:

### AuthService (src/auth/auth.service.spec.ts)
- ✅ Registro de usuarios (casos exitosos y errores)
- ✅ Login de usuarios (validación de credenciales)
- ✅ Validación de usuarios JWT
- ✅ Obtención de perfil de usuario
- ✅ Promoción a moderador
- ✅ Renovación de tokens
- ✅ Manejo de errores y casos edge

### UsersService (src/users/users.service.spec.ts)
- ✅ Creación de usuarios con validaciones
- ✅ Búsqueda por email e ID
- ✅ Validación de contraseñas con bcrypt
- ✅ Actualización de último login
- ✅ Promoción de roles
- ✅ Manejo de errores de base de datos

### AuthController (src/auth/auth.controller.spec.ts)
- ✅ Endpoints de registro y login
- ✅ Obtención de perfil
- ✅ Renovación de tokens
- ✅ Promoción de usuarios
- ✅ Manejo de errores HTTP
- ✅ Validación de entrada

### Guards y Estrategias
- ✅ JwtAuthGuard (src/auth/guards/__tests__/jwt-auth.guard.spec.ts)
- ✅ RolesGuard (src/auth/guards/__tests__/roles.guard.spec.ts)

### DTOs
- ✅ RegisterDto (src/auth/dto/__tests__/create-user.dto.spec.ts)
- ✅ Validaciones de email, password, nombres
- ✅ Casos edge y errores múltiples

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:cov

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas en Docker
docker-compose exec auth-service npm run test:cov
```

### Configuración de Cobertura

El proyecto está configurado para requerir un mínimo de 70% de cobertura en:
- Líneas de código
- Funciones
- Ramas (branches)
- Declaraciones (statements)

La configuración se encuentra en `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

## Instalación y Uso

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)

### Configuración con Docker

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd auth-service
```

2. **Iniciar servicios con Docker Compose**
```bash
docker-compose up -d
```

3. **Verificar que los servicios estén funcionando**
```bash
# Verificar estado de contenedores
docker-compose ps

# Ver logs del servicio de autenticación
docker-compose logs auth-service
```

### Servicios Disponibles

| Servicio | Puerto | URL | Credenciales |
|----------|--------|-----|--------------|
| Auth API | 5900 | http://localhost:5900 | - |
| Swagger Docs | 5900 | http://localhost:5900/api | - |
| PostgreSQL | 5432 | localhost:5432 | postgres/postgres |
| Redis | 6379 | localhost:6379 | - |
| pgAdmin | 5050 | http://localhost:5050 | - |

### Configuración de pgAdmin

1. **Acceder a pgAdmin**: http://localhost:5050
2. **Credenciales de acceso**: 
   - Email: `admin@admin.com`
   - Contraseña: `admin123`
3. **Configurar servidor PostgreSQL manualmente**:
   - Clic derecho en "Servers" → "Register" → "Server"
   - **General tab**:
     - Name: `Auth Database` (o el nombre que prefieras)
   - **Connection tab**:
     - Host name/address: `postgres-auth`
     - Port: `5432`
     - Maintenance database: `auth_db`
     - Username: `admin`
     - Password: `admin123`
   - Clic en "Save"

**Nota**: pgAdmin ahora viene sin configuraciones automáticas para que puedas configurar manualmente los servidores que necesites.

### Variables de Entorno

El archivo `.env` contiene la configuración del entorno:

```env
# Database
POSTGRES_HOST=postgres-auth
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=auth_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Redis
REDIS_HOST=redis-auth
REDIS_PORT=6379

# App
PORT=5900
NODE_ENV=development
```

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run start:dev

# Ejecutar pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:cov
```

### Uso de la API

#### Registro de Usuario
```bash
curl -X POST http://localhost:5900/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5900/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }'
```

#### Obtener Perfil (requiere token)
```bash
curl -X GET http://localhost:5900/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Estructura del Proyecto

```
auth-service/
├── src/
│   ├── auth/                 # Módulo de autenticación
│   │   ├── decorators/       # Decoradores personalizados
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Guards de autenticación/autorización
│   │   ├── strategies/       # Estrategias JWT
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                # Módulo de usuarios
│   │   ├── entities/         # Entidades TypeORM
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/                     # Configuración de pruebas
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
└── README.md
```

### Roles y Permisos

- **USER**: Usuario básico, puede acceder a su perfil
- **MODERATOR**: Puede moderar contenido (funcionalidad futura)
- **ADMIN**: Acceso completo, puede promover usuarios

### Troubleshooting

#### pgAdmin no puede conectar a PostgreSQL
1. Verificar que ambos contenedores estén ejecutándose
2. Usar `postgres-auth` como hostname (no `localhost`)
3. Verificar credenciales en docker-compose.yml

#### Error de conexión a Redis
1. Verificar que Redis esté ejecutándose: `docker-compose ps`
2. Revisar logs: `docker-compose logs redis-auth`

#### Problemas con la base de datos
1. Recrear volúmenes: `docker-compose down -v && docker-compose up -d`
2. Verificar logs de PostgreSQL: `docker-compose logs postgres-auth`

### Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles. 