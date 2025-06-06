# 🔑 Credenciales y Configuración JWT

Información completa sobre las credenciales de acceso a bases de datos y configuración de JWT para todos los microservicios.

## 📋 Contenido

- [Credenciales de Base de Datos](#credenciales-de-base-de-datos)
- [Configuración Redis](#configuración-redis)
- [Configuración JWT](#configuración-jwt)
- [pgAdmin](#pgadmin)
- [Variables de Entorno](#variables-de-entorno)
- [Seguridad](#seguridad)

## 🗄️ Credenciales de Base de Datos

### PostgreSQL Auth Service
- **Host**: localhost (desarrollo) / postgres-auth (contenedor)
- **Puerto**: 5432
- **Base de datos**: `auth_db`
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Esquema**: `public`

### PostgreSQL Media Service
- **Host**: localhost (desarrollo) / postgres-media (contenedor)
- **Puerto**: 5433
- **Base de datos**: `media_db`
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Esquema**: `public`

### PostgreSQL Comments Service
- **Host**: localhost (desarrollo) / postgres-comments (contenedor)
- **Puerto**: 5434
- **Base de datos**: `comments_db`
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Esquema**: `public`

### PostgreSQL Notifications Service
- **Host**: localhost (desarrollo) / postgres-notifications (contenedor)
- **Puerto**: 5435
- **Base de datos**: `notifications_db`
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Esquema**: `public`

## 🔴 Configuración Redis

### Redis Auth Service
- **Host**: localhost (desarrollo) / redis-auth (contenedor)
- **Puerto**: 6379
- **Contraseña**: Sin contraseña (desarrollo)
- **Base de datos**: 0 (por defecto)
- **Uso**: Cache de sesiones y datos de autenticación

### Redis Notifications Service
- **Host**: localhost (desarrollo) / redis-notifications (contenedor)
- **Puerto**: 6380
- **Contraseña**: Sin contraseña (desarrollo)
- **Base de datos**: 0 (por defecto)
- **Uso**: Pub/Sub para notificaciones en tiempo real y cache

## 🔐 Configuración JWT

### Configuración Actual
- **Secret**: `mi_super_secreto_jwt_para_autenticacion_2024`
- **Algoritmo**: HS256
- **Expiración**: 24 horas
- **Issuer**: `auth-service`
- **Audience**: `media-platform`

### Estructura del Token JWT
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "usuario@ejemplo.com",
    "role": "USER",
    "iat": 1640995200,
    "exp": 1641081600,
    "iss": "auth-service",
    "aud": "media-platform"
  }
}
```

### Roles Disponibles
| Rol | Código | Descripción |
|-----|--------|-------------|
| **Usuario** | `USER` | Acceso básico a la plataforma |
| **Moderador** | `MODERATOR` | Puede moderar contenido y comentarios |
| **Administrador** | `ADMIN` | Acceso completo al sistema |

### Configuración por Servicio

#### Auth Service
```typescript
// auth-service/src/auth/constants.ts
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'mi_super_secreto_jwt_para_autenticacion_2024',
  signOptions: {
    expiresIn: '24h',
    issuer: 'auth-service',
    audience: 'media-platform'
  }
};
```

#### Otros Servicios
```typescript
// Configuración para validación de JWT
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'mi_super_secreto_jwt_para_autenticacion_2024',
  verifyOptions: {
    issuer: 'auth-service',
    audience: 'media-platform'
  }
};
```

## 🔧 pgAdmin

### Credenciales de Acceso
- **URL**: http://localhost:5050
- **Email**: `admin@admin.com`
- **Contraseña**: `admin123`

### Configuración de Servidores
Para conectarse a las bases de datos desde pgAdmin, usar:

#### Servidor Auth Database
- **Name**: `Auth Database`
- **Host name/address**: `postgres-auth` ⚠️ **¡NO usar `localhost`!**
- **Port**: `5432`
- **Maintenance database**: `auth_db`
- **Username**: `admin`
- **Password**: `admin123`

#### Servidor Media Database
- **Name**: `Media Database`
- **Host name/address**: `postgres-media`
- **Port**: `5432`
- **Maintenance database**: `media_db`
- **Username**: `admin`
- **Password**: `admin123`

#### Servidor Comments Database
- **Name**: `Comments Database`
- **Host name/address**: `postgres-comments`
- **Port**: `5432`
- **Maintenance database**: `comments_db`
- **Username**: `admin`
- **Password**: `admin123`

#### Servidor Notifications Database
- **Name**: `Notifications Database`
- **Host name/address**: `postgres-notifications`
- **Port**: `5432`
- **Maintenance database**: `notifications_db`
- **Username**: `admin`
- **Password**: `admin123`

## 🌍 Variables de Entorno

### Variables JWT por Servicio

#### Auth Service
```bash
# JWT Configuration
JWT_SECRET=mi_super_secreto_jwt_para_autenticacion_2024
JWT_EXPIRES_IN=24h
JWT_ISSUER=auth-service
JWT_AUDIENCE=media-platform

# Database
DATABASE_HOST=postgres-auth
DATABASE_PORT=5432
DATABASE_NAME=auth_db
DATABASE_USER=admin
DATABASE_PASSWORD=admin123

# Redis
REDIS_HOST=redis-auth
REDIS_PORT=6379
```

#### Media Service
```bash
# JWT Configuration (solo para validación)
JWT_SECRET=mi_super_secreto_jwt_para_autenticacion_2024
JWT_ISSUER=auth-service
JWT_AUDIENCE=media-platform

# Database
DATABASE_HOST=postgres-media
DATABASE_PORT=5432
DATABASE_NAME=media_db
DATABASE_USER=admin
DATABASE_PASSWORD=admin123

# File Upload
MAX_FILE_SIZE=104857600  # 100MB
UPLOAD_PATH=./uploads
CHUNKS_PATH=./chunks
```

#### Comments Service
```bash
# JWT Configuration (solo para validación)
JWT_SECRET=mi_super_secreto_jwt_para_autenticacion_2024
JWT_ISSUER=auth-service
JWT_AUDIENCE=media-platform

# Database
DATABASE_HOST=postgres-comments
DATABASE_PORT=5432
DATABASE_NAME=comments_db
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
```

#### Notifications Service
```bash
# JWT Configuration (solo para validación)
JWT_SECRET=mi_super_secreto_jwt_para_autenticacion_2024
JWT_ISSUER=auth-service
JWT_AUDIENCE=media-platform

# Database
DATABASE_HOST=postgres-notifications
DATABASE_PORT=5432
DATABASE_NAME=notifications_db
DATABASE_USER=admin
DATABASE_PASSWORD=admin123

# Redis
REDIS_HOST=redis-notifications
REDIS_PORT=6380

# WebSocket Configuration
WEBSOCKET_PORT=5903
CORS_ORIGIN=http://localhost:8080
```

## 🛡️ Seguridad

### ⚠️ Importante para Producción

**NUNCA uses estas credenciales en producción**. Las credenciales aquí mostradas son solo para desarrollo local.

### Configuración de Producción
Para producción, utiliza:

```bash
# JWT - Generar un secret seguro
JWT_SECRET=$(openssl rand -base64 64)

# Base de datos - Credenciales únicas y seguras
POSTGRES_USER=media_app_$(openssl rand -hex 8)
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Redis - Configurar contraseña
REDIS_PASSWORD=$(openssl rand -base64 32)
```

### Mejores Prácticas
1. **Usar variables de entorno** para todas las credenciales
2. **Rotar secrets JWT** regularmente
3. **Usar contraseñas complejas** para bases de datos
4. **Habilitar SSL/TLS** en todos los servicios
5. **Configurar firewall** para limitar acceso
6. **Usar herramientas de gestión de secrets** (Vault, AWS Secrets Manager, etc.)

### Verificación de Conexiones
```bash
# Verificar conexión a PostgreSQL
docker exec postgres-auth psql -U admin -d auth_db -c "SELECT current_database();"

# Verificar conexión a Redis
docker exec redis-auth redis-cli ping

# Verificar JWT
curl -X POST http://localhost:5900/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Troubleshooting de Conexiones

#### Error: "password authentication failed"
```bash
# Verificar credenciales en docker-compose.yml
# Recrear base de datos si es necesario
docker-compose down -v
docker-compose up postgres-auth -d
```

#### Error: "could not connect to server"
```bash
# Verificar que el contenedor esté ejecutándose
docker-compose ps postgres-auth

# Verificar logs
docker-compose logs postgres-auth
```

#### Error: "JWT token invalid"
```bash
# Verificar que el JWT_SECRET sea el mismo en todos los servicios
# Verificar que el token no haya expirado
# Verificar formato del header: "Authorization: Bearer <token>"
```

Esta configuración de credenciales está diseñada para facilitar el desarrollo local mientras se mantienen las mejores prácticas de seguridad para producción. 