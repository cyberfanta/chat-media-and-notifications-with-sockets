# ⚡ Referencia Rápida

## 🚀 Comandos Esenciales

### Docker
```bash
# Levantar todos los servicios
docker-compose up --build

# Levantar en background
docker-compose up -d --build

# Ver logs de un servicio
docker-compose logs -f auth-service

# Parar servicios
docker-compose down

# Parar y limpiar volúmenes
docker-compose down -v

# Ver estado de servicios
docker-compose ps
```

### Testing
```bash
# Correr todos los tests
cd test && ./run-all-tests.sh

# Test específico de un servicio
cd test && ./test-auth-service.sh

# Test de WebSocket
cd test && ./test-websocket.sh
```

## 🌐 URLs Importantes

| Servicio | URL | Swagger | Health |
|----------|-----|---------|--------|
| Auth | http://localhost:5900 | [/api/docs](http://localhost:5900/api/docs) | [/health](http://localhost:5900/health) |
| Media | http://localhost:5901 | [/api/docs](http://localhost:5901/api/docs) | [/health](http://localhost:5901/health) |
| Comments | http://localhost:5902 | [/api/docs](http://localhost:5902/api/docs) | [/health](http://localhost:5902/health) |
| Notifications | http://localhost:5903 | [/api/docs](http://localhost:5903/api/docs) | [/health](http://localhost:5903/health) |
| WebSocket Test | http://localhost:8080 | - | - |
| pgAdmin | http://localhost:5050 | - | - |

## 🗄️ Conexiones de Base de Datos

```bash
# Auth DB
psql -h localhost -p 5432 -U auth_user -d auth_db

# Media DB  
psql -h localhost -p 5433 -U media_user -d media_db

# Comments DB
psql -h localhost -p 5434 -U comments_user -d comments_db

# Notifications DB
psql -h localhost -p 5435 -U notifications_user -d notifications_db
```

## 🔐 Usuarios de Prueba

### Credenciales Predeterminadas
```json
// ADMIN User
{
  "username": "admin",
  "email": "admin@example.com", 
  "password": "admin123",
  "role": "ADMIN"
}

// MODERATOR User
{
  "username": "moderator",
  "email": "mod@example.com",
  "password": "mod123", 
  "role": "MODERATOR"
}

// USER Regular
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "user123",
  "role": "USER"
}
```

## 📋 Flujo de Testing Rápido

### 1. Autenticación
```bash
# Registrar usuario
curl -X POST http://localhost:5900/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5900/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
  
# Usar el token en headers
Authorization: Bearer <token>
```

### 2. Upload de Media
```bash
# Upload simple
curl -X POST http://localhost:5901/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.jpg"

# Ver archivos del usuario
curl -X GET http://localhost:5901/media/user/<userId> \
  -H "Authorization: Bearer <token>"
```

### 3. Comentarios
```bash
# Crear comentario
curl -X POST http://localhost:5902/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Mi comentario","mediaId":"<mediaId>"}'

# Ver comentarios de un media
curl -X GET http://localhost:5902/comments/media/<mediaId>
```

### 4. Notificaciones
```bash
# Ver notificaciones
curl -X GET http://localhost:5903/notifications \
  -H "Authorization: Bearer <token>"

# Conectar WebSocket
// Usar cliente en http://localhost:8080
// O conectar a ws://localhost:5903/notifications
```

## 🔧 Variables de Entorno Importantes

```bash
# JWT
JWT_SECRET=your-secret-key

# Databases
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=auth_user
DB_PASSWORD=auth_password
DB_NAME=auth_db

# Redis
REDIS_HOST=localhost  
REDIS_PORT=6379

# Node
NODE_ENV=development
PORT=5900
```

## 🚨 Troubleshooting Rápido

### Servicios no levantan
```bash
# Verificar puertos ocupados
netstat -tulpn | grep :5900

# Limpiar Docker
docker system prune -a

# Recrear contenedores
docker-compose down -v
docker-compose up --build --force-recreate
```

### Base de datos no conecta
```bash
# Verificar logs de PostgreSQL
docker-compose logs postgres-auth

# Verificar si el puerto está libre
telnet localhost 5432
```

### WebSocket no conecta
```bash
# Verificar servicio de notificaciones
curl http://localhost:5903/health

# Verificar logs
docker-compose logs notifications-service

# Test con cliente web
# Ir a http://localhost:8080
```

## 📊 Tipos de Notificaciones

```typescript
USER_REGISTERED     // Usuario se registra
USER_PROMOTED       // Usuario promovido a moderador
MEDIA_UPLOADED      // Archivo subido
COMMENT_CREATED     // Nuevo comentario
COMMENT_REPLY       // Respuesta a comentario
COMMENT_MODERATED   // Comentario moderado
SYSTEM_ANNOUNCEMENT // Anuncio del sistema
```

## 🎯 Roles y Permisos

```
USER (0):
- Crear comentarios
- Subir archivos
- Ver propias notificaciones

MODERATOR (1):
- Todo lo de USER
- Moderar comentarios
- Ver comentarios moderados

ADMIN (2):  
- Todo lo de MODERATOR
- Promover usuarios a MODERATOR
- Acceso completo al sistema
```

## 📁 Estructura de Archivos

```
/uploads/
├── images/           # Imágenes
├── videos/           # Videos  
├── audio/            # Archivos de audio
└── chunks/           # Chunks temporales
    └── <uploadId>/   # Por upload
```

## 🔄 Estados de Entidades

### Comentarios
- `isModerated: false` - Comentario visible
- `isModerated: true` - Comentario oculto/moderado

### Notificaciones  
- `isRead: false` - No leída
- `isRead: true` - Leída

### Usuarios
- `isActive: true` - Usuario activo
- `isActive: false` - Usuario desactivado

## 🎭 Modo de Desarrollo vs Producción

### Desarrollo
- `NODE_ENV=development`
- Logs verbosos
- CORS habilitado
- Swagger disponible
- Database sync automático

### Producción
- `NODE_ENV=production`
- Logs optimizados
- CORS restringido
- Swagger deshabilitado
- Migrations manuales requeridas 