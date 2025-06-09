# 🏗️ Resumen Detallado de Microservicios

## 🔐 Auth Service (Puerto 5900)

### Responsabilidades
- Autenticación y autorización de usuarios
- Gestión de tokens JWT
- Sistema de roles jerárquico
- Promoción de usuarios a moderadores

### Entidades Principales
```typescript
// User Entity
{
  id: string (UUID),
  username: string (unique),
  email: string (unique),
  password: string (hashed),
  role: UserRole (USER, MODERATOR, ADMIN),
  isActive: boolean,
  created_at: Date,
  updated_at: Date
}
```

### Endpoints Clave
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Autenticación
- `GET /auth/profile` - Perfil del usuario
- `POST /auth/promote/:userId` - Promoción a moderador (solo ADMIN)
- `GET /auth/health` - Health check

### Configuración
- **Base de Datos**: PostgreSQL puerto 5432
- **Cache**: Redis puerto 6379 (sessions)
- **JWT**: Secret configurado via environment
- **Hash**: bcrypt para passwords

### Características Especiales
- Refresh token automático
- Rate limiting en login
- Password validation fuerte
- Session management con Redis

---

## 📁 Media Service (Puerto 5901)

### Responsabilidades
- Upload y gestión de archivos multimedia
- Soporte para chunks de archivos grandes
- Validación de tipos MIME
- Eliminación segura de archivos

### Entidades Principales
```typescript
// MediaFile Entity
{
  id: string (UUID),
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
  path: string,
  userId: string,
  metadata: JSON,
  created_at: Date,
  updated_at: Date
}

// ChunkUpload Entity
{
  id: string (UUID),
  uploadId: string,
  chunkIndex: number,
  filename: string,
  path: string,
  size: number,
  userId: string,
  created_at: Date
}
```

### Endpoints Clave
- `POST /media/upload` - Upload simple de archivos
- `POST /media/upload/chunk/start` - Iniciar upload por chunks
- `POST /media/upload/chunk/:uploadId` - Subir chunk
- `POST /media/upload/chunk/:uploadId/complete` - Completar upload
- `GET /media/:id` - Obtener información de archivo
- `DELETE /media/:id` - Eliminar archivo
- `GET /media/user/:userId` - Archivos de usuario

### Configuración
- **Base de Datos**: PostgreSQL puerto 5433
- **Storage**: Local filesystem `/uploads/`
- **Chunks**: Directorio temporal `/uploads/chunks/`
- **Validation**: MIME types permitidos configurables

### Características Especiales
- Multipart upload con resume capability
- Validación doble (MIME + extensión)
- Cleanup automático de chunks expirados
- Metadata extraction automática
- Support para imágenes, videos y audio

---

## 💬 Comments Service (Puerto 5902)

### Responsabilidades
- Sistema de comentarios jerárquico
- Moderación de contenido
- Paginación y filtros avanzados
- Estadísticas de comentarios

### Entidades Principales
```typescript
// Comment Entity
{
  id: string (UUID),
  content: string,
  userId: string,
  mediaId: string,
  parentId: string (nullable),
  isModerated: boolean,
  moderatedBy: string (nullable),
  moderationReason: string (nullable),
  created_at: Date,
  updated_at: Date
}
```

### Endpoints Clave
- `POST /comments` - Crear comentario
- `GET /comments/media/:mediaId` - Comentarios por contenido
- `GET /comments/:id/replies` - Respuestas a comentario
- `PUT /comments/:id` - Actualizar comentario (propio)
- `DELETE /comments/:id` - Eliminar comentario
- `PUT /comments/:id/moderate` - Moderar comentario (MODERATOR+)
- `GET /comments/stats/:mediaId` - Estadísticas

### Configuración
- **Base de Datos**: PostgreSQL puerto 5434
- **Pagination**: 20 comentarios por página por defecto
- **Threading**: Sin límite de profundidad
- **Validation**: Content sanitization

### Características Especiales
- Threading ilimitado con parent_id
- Moderación por roles (MODERATOR+)
- Soft delete con flag `isModerated`
- Paginación optimizada
- Filtros por estado de moderación
- Estadísticas en tiempo real

---

## 🔔 Notifications Service (Puerto 5903)

### Responsabilidades
- Notificaciones en tiempo real vía WebSocket
- Sistema Pub/Sub para eventos entre servicios
- Cache inteligente para performance
- Rate limiting anti-spam

### Entidades Principales
```typescript
// Notification Entity
{
  id: string (UUID),
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data: JSON,
  isRead: boolean,
  created_at: Date,
  updated_at: Date
}

// NotificationTypes
enum NotificationType {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_PROMOTED = 'USER_PROMOTED',
  MEDIA_UPLOADED = 'MEDIA_UPLOADED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_REPLY = 'COMMENT_REPLY',
  COMMENT_MODERATED = 'COMMENT_MODERATED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}
```

### Endpoints Clave
- `GET /notifications` - Lista de notificaciones paginada
- `GET /notifications/unread` - Solo no leídas
- `PUT /notifications/:id/read` - Marcar como leída
- `PUT /notifications/read-all` - Marcar todas como leídas
- `DELETE /notifications/:id` - Eliminar notificación
- `POST /notifications/test` - Crear notificación de prueba

### WebSocket Events
- `notification.new` - Nueva notificación
- `notification.read` - Notificación leída
- `notification.deleted` - Notificación eliminada
- `connection.established` - Conexión WebSocket exitosa

### Configuración
- **Base de Datos**: PostgreSQL puerto 5435
- **Cache**: Redis puerto 6380 (pub/sub + cache)
- **WebSocket**: Socket.IO en `/notifications`
- **Rate Limiting**: Configurable por usuario y tipo

### Características Especiales
- WebSocket con auto-reconnect
- Cache Redis para notificaciones frecuentes
- Pub/Sub entre microservicios
- Rate limiting inteligente
- Filtros avanzados (tipo, estado, fecha)
- Bulk operations (mark all as read)
- Real-time delivery garantizado

### Event Processing
```typescript
// Eventos escuchados de otros servicios
'user.registered' -> USER_REGISTERED notification
'user.promoted' -> USER_PROMOTED notification  
'media.uploaded' -> MEDIA_UPLOADED notification
'comment.created' -> COMMENT_CREATED notification
'comment.replied' -> COMMENT_REPLY notification
'comment.moderated' -> COMMENT_MODERATED notification
```

---

## 🧪 WebSocket Testing App (Puerto 8080)

### Propósito
Cliente web para testing de WebSocket connections y notificaciones en tiempo real

### Características
- Interfaz simple para conectar/desconectar
- Testing de diferentes tipos de notificaciones
- Monitor de eventos en tiempo real
- Logs de conexión y errores
- Útil para desarrollo y debugging

---

## 🗄️ Bases de Datos

### Distribución por Servicio
```
Auth Service     -> PostgreSQL 5432 (auth_db)
Media Service    -> PostgreSQL 5433 (media_db)  
Comments Service -> PostgreSQL 5434 (comments_db)
Notifications    -> PostgreSQL 5435 (notifications_db)
```

### Redis Configuration
```
Auth/Sessions    -> Redis 6379
Notifications    -> Redis 6380 (pub/sub + cache)
```

### Inicialización
- Scripts SQL en `/postgres-init/`
- Configuración automática via Docker
- Datos de prueba opcionales

---

## 🔗 Comunicación Entre Servicios

### HTTP/REST
- Media Service → Auth Service (validación de usuarios)
- Comments Service → Auth Service (validación de usuarios)
- Notifications Service → Auth Service (validación de usuarios)

### Event-Driven (Redis Pub/Sub)
```
Auth Service     -> Publica: user.registered, user.promoted
Media Service    -> Publica: media.uploaded, media.deleted
Comments Service -> Publica: comment.created, comment.replied, comment.moderated
Notifications    -> Escucha: Todos los eventos anteriores
```

### WebSocket
- Notifications Service expone WebSocket endpoint
- Clientes se conectan para recibir notificaciones en tiempo real
- Auto-reconnect y manejo de desconexiones

---

## 📊 Monitoreo y Health Checks

### Health Endpoints
Todos los servicios exponen `/health` endpoint que verifica:
- Conexión a base de datos
- Conexión a Redis (donde aplique)
- Estado general del servicio

### Logging
- Logs estructurados con Winston
- Diferentes niveles por environment
- Logs de errores detallados para debugging

### Performance
- Connection pooling en bases de datos
- Cache inteligente con TTL apropiado
- Rate limiting para prevenir abuso
- Paginación optimizada en todas las consultas

---

## 🎨 Processing Service (Puerto 5904) - NUEVO ✅

### Responsabilidades
- Compresión inteligente de archivos multimedia
- Generación automática de thumbnails
- Transformación de formatos
- Cola de trabajos asíncronos
- Publicación de 6 tipos de notificaciones

### Entidades Principales
```typescript
// ProcessedMedia Entity
{
  id: string (UUID),
  originalMediaId: string,
  uploaderId: string,
  mediaType: 'image' | 'video' | 'audio',
  status: 'pending' | 'processing' | 'completed' | 'failed',
  originalPath: string,
  compressedPath: string,
  compressionMetadata: JSON,
  thumbnailMetadata: JSON,
  processingDurationMs: number,
  created_at: Date,
  updated_at: Date
}

// ProcessingJob Entity
{
  id: string (UUID),
  queueJobId: string,
  jobType: 'compress_image' | 'compress_video' | 'compress_audio' | 'generate_thumbnails',
  status: 'waiting' | 'active' | 'completed' | 'failed',
  mediaId: string,
  progress: JSON,
  result: JSON,
  attempts: number,
  created_at: Date
}
```

### Funcionalidades Principales
- **Compresión Inteligente**: Sharp para imágenes, FFmpeg para videos/audio
- **Thumbnails Automáticos**:
  - Imágenes: Copia en baja resolución
  - Videos: 10 frames en momentos clave
  - Audio: Icono Material Design convertido a imagen
- **Queue System**: Bull + Redis para procesamiento asíncrono
- **Event Publishing**: 6 tipos de notificaciones en tiempo real

### 6 Tipos de Notificaciones
1. **processing_started** - Solo uploader (inicio de procesamiento)
2. **processing_progress** - Solo uploader (progreso en tiempo real)
3. **processing_completed** - Solo uploader (procesamiento completado)
4. **processing_failed** - Solo uploader (error en procesamiento)
5. **media_available_public** - TODOS los usuarios (nuevo media disponible)
6. **media_quality_analysis** - Solo uploader (análisis de calidad)

### Configuración
- **Base de Datos**: PostgreSQL puerto 5436
- **Queue**: Redis puerto 6380 (DB 2)
- **Event Publisher**: Redis puerto 6380 (DB 0)
- **Storage**: Directorios organizados `/uploads/processed/`, `/uploads/thumbnails/`

---

## 🧹 Cleanup Service (Puerto 5905) - NUEVO ✅

### Responsabilidades
- Limpieza automática de chunks huérfanos
- Cleanup de uploads pendientes abandonados
- Limpieza de archivos temporales
- Monitoreo de espacio de almacenamiento
- Jobs programados con Schedule

### Funcionalidades
- **Chunk Cleanup**: Elimina chunks >6 horas sin completar
- **Upload Cleanup**: Elimina uploads PENDING >6 horas
- **Temp Files**: Limpia archivos temporales >24 horas
- **Storage Monitoring**: Alertas cuando espacio <10% disponible
- **Scheduled Jobs**: Ejecución cada 6 horas automáticamente

### Configuración
- **Base de Datos**: PostgreSQL puerto 5437
- **Media DB Access**: Conecta a postgres-media para consultas
- **Storage Paths**: Acceso a `/uploads/` compartido
- **Schedule**: Configurable via environment variables

---

## 📊 Monitoring Dashboard (Puerto 5906) - NUEVO ✅

### Propósito
Dashboard web independiente para monitorear cola de procesamiento y notificaciones emitidas, sin necesidad de autenticación de usuario específico.

### Características UI
- **UI Moderna**: Bootstrap 5 + Chart.js + Font Awesome
- **Tiempo Real**: WebSocket para actualizaciones automáticas
- **Gráficos Interactivos**: 
  - Doughnut chart para estado de cola
  - Line chart para notificaciones por minuto
- **Responsive Design**: Adaptable a diferentes dispositivos

### Funcionalidades de Monitoreo
- **Cola de Procesamiento**:
  - Estado de todos los trabajos (waiting, active, completed, failed)
  - Progreso en tiempo real de trabajos activos
  - Estadísticas de rendimiento
- **Notificaciones Emitidas**:
  - Stream en tiempo real de todas las notificaciones
  - Filtros por tipo de notificación
  - Historial de notificaciones recientes
- **Métricas del Sistema**:
  - Total de trabajos procesados
  - Tasa de éxito del procesamiento
  - Trabajos activos concurrentes

### Endpoints API
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/queue` - Estado de cola de procesamiento
- `GET /api/dashboard/notifications` - Notificaciones recientes
- `GET /dashboard` - Página principal del dashboard

### Configuración
- **UI Rendering**: Handlebars templates + Static assets
- **WebSocket**: Socket.IO para actualizaciones en tiempo real
- **Data Sources**: 
  - Processing DB (PostgreSQL 5436)
  - Redis Queue (puerto 6380)
  - Event Stream (Redis pub/sub)

---

## 🗄️ Bases de Datos Actualizadas

### Distribución por Servicio
```
Auth Service       -> PostgreSQL 5432 (auth_db)
Media Service      -> PostgreSQL 5433 (media_db)  
Comments Service   -> PostgreSQL 5434 (comments_db)
Notifications      -> PostgreSQL 5435 (notifications_db)
Processing Service -> PostgreSQL 5436 (processing_db)    [NUEVO]
Cleanup Service    -> PostgreSQL 5437 (cleanup_db)       [NUEVO]
```

### Redis Configuration
```
Auth/Sessions      -> Redis 6379
Notifications      -> Redis 6380 (pub/sub + cache)
Processing Queue   -> Redis 6380 DB 2                    [NUEVO]
Event Publishing   -> Redis 6380 DB 0                    [COMPARTIDO]
```

---

## 🚀 Scripts de Inicio

### Windows
```bash
# Iniciar todo el sistema
start-processing-system.bat

# Incluye verificación de Docker, health checks y URLs
```

### Puertos del Sistema Completo
```
🔐 Auth Service:           5900
📁 Media Service:          5901
💬 Comments Service:       5902
🔔 Notifications Service:  5903
🎨 Processing Service:     5904  [NUEVO]
🧹 Cleanup Service:        5905  [NUEVO]
📊 Monitoring Dashboard:   5906  [NUEVO]
🧪 WebSocket Testing:      8080
📊 pgAdmin:               5050
``` 