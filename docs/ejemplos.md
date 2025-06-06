# 📝 Ejemplos de Uso

Ejemplos prácticos paso a paso para usar todos los endpoints de la API.

## 📋 Contenido

- [Configuración Inicial](#configuración-inicial)
- [Auth Service](#auth-service)
- [Media Service](#media-service)
- [Comments Service](#comments-service)
- [Notifications Service](#notifications-service)
- [Ejemplos Avanzados](#ejemplos-avanzados)

## 🔧 Configuración Inicial

### Variables de Entorno
```bash
# URLs base de los servicios
AUTH_URL="http://localhost:5900"
MEDIA_URL="http://localhost:5901"
COMMENTS_URL="http://localhost:5902"
NOTIFICATIONS_URL="http://localhost:5903"

# Token JWT (se obtiene después del login)
JWT_TOKEN=""
```

## 🔐 Auth Service

### 1. Registrar un nuevo usuario
```bash
curl -X POST ${AUTH_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@ejemplo.com",
    "password": "MiPassword123!",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

**Response esperado:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "juan.perez@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Iniciar sesión
```bash
curl -X POST ${AUTH_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@ejemplo.com",
    "password": "MiPassword123!"
  }'
```

**Response esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "juan.perez@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "USER"
  }
}
```

**Guardar token para uso posterior:**
```bash
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Obtener perfil del usuario
```bash
curl -X GET ${AUTH_URL}/auth/profile \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### 4. Promover usuario a moderador (solo ADMIN)
```bash
curl -X POST ${AUTH_URL}/auth/promote-to-moderator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

## 📁 Media Service

### 1. Upload Simple de Archivo Pequeño

#### Paso 1: Inicializar upload
```bash
curl -X POST ${MEDIA_URL}/media/init-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "originalName": "mi_video.mp4",
    "mimeType": "video/mp4",
    "type": "video",
    "totalSize": 52428800,
    "totalChunks": 1
  }'
```

**Response:**
```json
{
  "id": "media-123-456-789",
  "uploadId": "media-123-456-789",
  "message": "Upload inicializado correctamente"
}
```

#### Paso 2: Subir archivo completo
```bash
curl -X POST ${MEDIA_URL}/media/upload-chunk/media-123-456-789 \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -F "file=@./mi_video.mp4" \
  -F "chunkNumber=0"
```

#### Paso 3: Completar upload
```bash
curl -X POST ${MEDIA_URL}/media/complete-upload/media-123-456-789 \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### 2. Upload Multipart de Archivo Grande

#### Dividir archivo en chunks (usando endpoint de testing)
```bash
curl -X POST ${MEDIA_URL}/media/split-file \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -F "file=@./archivo_grande.mp4" \
  -F "chunks=5"
```

**Response:**
```json
{
  "originalName": "archivo_grande.mp4",
  "totalSize": 104857600,
  "totalChunks": 5,
  "chunks": [
    {
      "chunkNumber": 0,
      "size": 20971520,
      "data": "base64_chunk_data_here..."
    },
    // ... más chunks
  ]
}
```

#### Workflow completo con chunks
```bash
# 1. Inicializar
INIT_RESPONSE=$(curl -X POST ${MEDIA_URL}/media/init-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "originalName": "archivo_grande.mp4",
    "mimeType": "video/mp4",
    "type": "video",
    "totalSize": 104857600,
    "totalChunks": 5
  }')

MEDIA_ID=$(echo $INIT_RESPONSE | jq -r '.id')

# 2. Subir cada chunk (ejemplo para chunk 0)
echo "base64_chunk_data_here..." | base64 -d > chunk_0.bin
curl -X POST ${MEDIA_URL}/media/upload-chunk/${MEDIA_ID} \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -F "file=@chunk_0.bin" \
  -F "chunkNumber=0"

# 3. Repetir para todos los chunks...

# 4. Completar upload
curl -X POST ${MEDIA_URL}/media/complete-upload/${MEDIA_ID} \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### 3. Gestión de Archivos

#### Listar archivos del usuario
```bash
curl -X GET "${MEDIA_URL}/media?page=1&limit=10&type=video" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Descargar archivo
```bash
curl -X GET ${MEDIA_URL}/media/${MEDIA_ID}/download \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -o "archivo_descargado.mp4"
```

#### Ver información de almacenamiento
```bash
curl -X GET ${MEDIA_URL}/media/storage/info \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

#### Eliminar archivo
```bash
curl -X DELETE ${MEDIA_URL}/media/${MEDIA_ID} \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

## 💬 Comments Service

### 1. Crear comentario en contenido
```bash
curl -X POST ${COMMENTS_URL}/comments/content/mi-video-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "content": "¡Excelente video! Me ha gustado mucho la explicación.",
    "parentId": null
  }'
```

**Response:**
```json
{
  "id": "comment-uuid-123",
  "content": "¡Excelente video! Me ha gustado mucho la explicación.",
  "contentId": "mi-video-123",
  "authorId": "user-uuid",
  "parentId": null,
  "status": "published",
  "createdAt": "2024-01-15T10:45:00.000Z"
}
```

### 2. Responder a un comentario
```bash
curl -X POST ${COMMENTS_URL}/comments/content/mi-video-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "content": "Gracias por tu comentario! Me alegra que te haya gustado.",
    "parentId": "comment-uuid-123"
  }'
```

### 3. Obtener comentarios con paginación
```bash
curl -X GET "${COMMENTS_URL}/comments/content/mi-video-123?page=1&limit=10&sort=newest" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### 4. Moderar comentario (solo MODERATOR/ADMIN)
```bash
curl -X PUT ${COMMENTS_URL}/comments/comment-uuid-123/moderate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MODERATOR_TOKEN}" \
  -d '{
    "action": "approve",
    "reason": "Contenido apropiado"
  }'
```

### 5. Obtener estadísticas de comentarios
```bash
curl -X GET ${COMMENTS_URL}/comments/stats/mi-video-123
```

**Response:**
```json
{
  "contentId": "mi-video-123",
  "totalComments": 25,
  "publishedComments": 23,
  "pendingComments": 1,
  "moderatedComments": 1,
  "repliesCount": 8,
  "lastCommentDate": "2024-01-15T10:45:00.000Z"
}
```

## 🔔 Notifications Service

### 1. Crear notificación manual
```bash
curl -X POST ${NOTIFICATIONS_URL}/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "type": "NEW_COMMENT",
    "title": "Nuevo comentario en tu video",
    "message": "Juan Pérez comentó en tu video \"Tutorial de NestJS\"",
    "priority": "medium",
    "metadata": {
      "contentId": "mi-video-123",
      "commentId": "comment-uuid-123",
      "authorName": "Juan Pérez"
    }
  }'
```

### 2. Obtener notificaciones no leídas
```bash
curl -X GET ${NOTIFICATIONS_URL}/notifications/unread \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### 3. Obtener contador de notificaciones no leídas
```bash
curl -X GET ${NOTIFICATIONS_URL}/notifications/unread/count \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

**Response:**
```json
{
  "count": 5,
  "cachedAt": "2024-01-15T10:50:00.000Z"
}
```

### 4. Marcar notificaciones como leídas
```bash
curl -X POST ${NOTIFICATIONS_URL}/notifications/mark-read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "notificationIds": ["notif-1", "notif-2", "notif-3"]
  }'
```

### 5. Filtrar notificaciones
```bash
curl -X GET "${NOTIFICATIONS_URL}/notifications?type=NEW_COMMENT&priority=high&isRead=false&page=1&limit=5" \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

## 🚀 Ejemplos Avanzados

### Workflow Completo: Usuario Nuevo

```bash
#!/bin/bash
# Script completo para demostrar flujo de usuario nuevo

# 1. Registrar usuario
echo "1. Registrando usuario..."
REGISTER_RESPONSE=$(curl -s -X POST ${AUTH_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario.demo@ejemplo.com",
    "password": "DemoPassword123!",
    "firstName": "Usuario",
    "lastName": "Demo"
  }')

echo "Usuario registrado: $(echo $REGISTER_RESPONSE | jq '.message')"

# 2. Hacer login
echo "2. Iniciando sesión..."
LOGIN_RESPONSE=$(curl -s -X POST ${AUTH_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario.demo@ejemplo.com",
    "password": "DemoPassword123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Token obtenido: ${TOKEN:0:20}..."

# 3. Subir archivo
echo "3. Subiendo archivo..."
INIT_RESPONSE=$(curl -s -X POST ${MEDIA_URL}/media/init-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "originalName": "demo.txt",
    "mimeType": "text/plain",
    "type": "document",
    "totalSize": 1024,
    "totalChunks": 1
  }')

MEDIA_ID=$(echo $INIT_RESPONSE | jq -r '.id')
echo "Upload inicializado con ID: $MEDIA_ID"

# Crear archivo demo
echo "Este es un archivo de demostración" > demo.txt

# Subir archivo
curl -s -X POST ${MEDIA_URL}/media/upload-chunk/$MEDIA_ID \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@demo.txt" \
  -F "chunkNumber=0"

# Completar upload
COMPLETE_RESPONSE=$(curl -s -X POST ${MEDIA_URL}/media/complete-upload/$MEDIA_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Archivo subido: $(echo $COMPLETE_RESPONSE | jq '.message')"

# 4. Crear comentario
echo "4. Creando comentario..."
COMMENT_RESPONSE=$(curl -s -X POST ${COMMENTS_URL}/comments/content/$MEDIA_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Este es mi primer comentario de demostración",
    "parentId": null
  }')

COMMENT_ID=$(echo $COMMENT_RESPONSE | jq -r '.id')
echo "Comentario creado con ID: $COMMENT_ID"

# 5. Crear notificación
echo "5. Creando notificación..."
NOTIF_RESPONSE=$(curl -s -X POST ${NOTIFICATIONS_URL}/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "UPLOAD_COMPLETED",
    "title": "Archivo subido exitosamente",
    "message": "Tu archivo demo.txt ha sido procesado correctamente",
    "priority": "medium"
  }')

echo "Notificación creada: $(echo $NOTIF_RESPONSE | jq '.title')"

# 6. Verificar estado final
echo "6. Estado final del usuario:"
curl -s -X GET ${AUTH_URL}/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.firstName, .lastName, .email'

# Limpiar archivo temporal
rm demo.txt

echo "Demo completada exitosamente!"
```

### Testing de WebSocket con Node.js

```javascript
// websocket-demo.js
const io = require('socket.io-client');

// Token obtenido del login
const token = 'tu_jwt_token_aqui';

// Conectar al servicio de notificaciones
const socket = io('http://localhost:5903/notifications', {
  query: { token }
});

socket.on('connect', () => {
  console.log('✅ Conectado a notificaciones');
  
  // Unirse a notificaciones del usuario
  socket.emit('join_notifications', { token });
  
  // Solicitar notificaciones no leídas
  socket.emit('get_notifications', {
    filters: { isRead: false },
    pagination: { page: 1, limit: 10 }
  });
});

socket.on('new_notification', (notification) => {
  console.log('🔔 Nueva notificación:', notification.title);
});

socket.on('unread_count', (data) => {
  console.log('📊 Notificaciones no leídas:', data.count);
});

socket.on('notifications', (data) => {
  console.log('📝 Notificaciones obtenidas:', data.data.length);
  
  // Marcar las primeras 3 como leídas
  if (data.data.length > 0) {
    const idsToMarkRead = data.data.slice(0, 3).map(n => n.id);
    socket.emit('mark_as_read', { notificationIds: idsToMarkRead });
  }
});

socket.on('marked_as_read', (data) => {
  console.log('✅ Marcadas como leídas:', data.notificationIds.length);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

// Ejecutar: node websocket-demo.js
```

### Benchmark de Performance

```bash
#!/bin/bash
# benchmark.sh - Test de carga básico

echo "🚀 Iniciando benchmark de la API..."

# Función para medir tiempo
time_endpoint() {
  local url=$1
  local method=${2:-GET}
  local data=${3:-""}
  
  if [ "$method" = "POST" ]; then
    time curl -s -X POST "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -d "$data" > /dev/null
  else
    time curl -s "$url" \
      -H "Authorization: Bearer $JWT_TOKEN" > /dev/null
  fi
}

# Login para obtener token
echo "Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST ${AUTH_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario.demo@ejemplo.com",
    "password": "DemoPassword123!"
  }')

JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

# Tests de performance
echo "Testing Auth Service..."
time_endpoint "${AUTH_URL}/auth/profile"

echo "Testing Media Service..."
time_endpoint "${MEDIA_URL}/media"

echo "Testing Comments Service..."
time_endpoint "${COMMENTS_URL}/comments/content/test-content"

echo "Testing Notifications Service..."
time_endpoint "${NOTIFICATIONS_URL}/notifications/unread/count"

echo "Benchmark completado!"
```

Estos ejemplos proporcionan una guía completa para usar todas las funcionalidades de la plataforma de contenido multimedia.
