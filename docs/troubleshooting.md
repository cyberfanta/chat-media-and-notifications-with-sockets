# 🔧 Troubleshooting - Solución de Problemas

Guía completa para resolver problemas comunes en la Plataforma de Contenido Multimedia.

## 📋 Contenido

- [Problemas de Docker](#problemas-de-docker)
- [Problemas de Base de Datos](#problemas-de-base-de-datos)
- [Problemas de Autenticación](#problemas-de-autenticación)
- [Problemas de WebSocket](#problemas-de-websocket)
- [Problemas de Upload](#problemas-de-upload)
- [Problemas de Performance](#problemas-de-performance)
- [Comandos de Diagnóstico](#comandos-de-diagnóstico)

## 🐳 Problemas de Docker

### Error: "Cannot connect to the Docker daemon"

**Síntomas:**
```
Cannot connect to the Docker daemon at unix:///var/lib/docker.sock
```

**Soluciones:**
```bash
# Windows - Verificar que Docker Desktop esté ejecutándose
# Reiniciar Docker Desktop

# Linux - Verificar estado del servicio
sudo systemctl status docker
sudo systemctl start docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a iniciar
```

### Error: "Port already in use"

**Síntomas:**
```
Error starting userland proxy: listen tcp 0.0.0.0:5900: bind: address already in use
```

**Soluciones:**
```bash
# Verificar qué proceso usa el puerto
netstat -tulpn | grep :5900
# o en Windows
netstat -ano | findstr :5900

# Detener servicios existentes
docker-compose down

# Cambiar puertos en docker-compose.yml si es necesario
# Ejemplo: cambiar "5900:5900" a "5901:5900"
```

### Error: "No space left on device"

**Síntomas:**
```
Error response from daemon: no space left on device
```

**Soluciones:**
```bash
# Limpiar imágenes no utilizadas
docker system prune -a

# Limpiar volúmenes no utilizados
docker volume prune

# Verificar espacio en disco
df -h

# Limpiar logs de Docker
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### Error: "Build failed"

**Síntomas:**
```
ERROR [internal] load metadata for docker.io/library/node:18-alpine
```

**Soluciones:**
```bash
# Limpiar cache de build
docker builder prune

# Reconstruir sin cache
docker-compose build --no-cache

# Verificar conexión a internet
ping docker.io

# Usar imagen específica si hay problemas de red
# En Dockerfile cambiar: FROM node:18-alpine
# Por: FROM node:18.17.0-alpine
```

## 🗄️ Problemas de Base de Datos

### Error: "Connection refused" a PostgreSQL

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Soluciones:**
```bash
# Verificar que el contenedor esté ejecutándose
docker-compose ps postgres-auth

# Ver logs del contenedor PostgreSQL
docker-compose logs postgres-auth

# Verificar variables de entorno
docker-compose exec postgres-auth env | grep POSTGRES

# Reiniciar solo el servicio de base de datos
docker-compose restart postgres-auth

# Verificar conectividad desde el contenedor de la app
docker-compose exec auth-service ping postgres-auth
```

### Error: "Password authentication failed"

**Síntomas:**
```
error: password authentication failed for user "admin"
```

**Soluciones:**
```bash
# Verificar credenciales en docker-compose.yml
# Asegurar que POSTGRES_USER y POSTGRES_PASSWORD coincidan

# Recrear volúmenes de base de datos (CUIDADO: elimina datos)
docker-compose down -v
docker-compose up postgres-auth -d

# Verificar conexión manual
docker-compose exec postgres-auth psql -U admin -d auth_db -c "SELECT 1;"
```

### Error: "Database does not exist"

**Síntomas:**
```
error: database "auth_db" does not exist
```

**Soluciones:**
```bash
# Verificar que la base de datos se haya creado
docker-compose exec postgres-auth psql -U admin -l

# Crear base de datos manualmente si es necesario
docker-compose exec postgres-auth createdb -U admin auth_db

# Verificar scripts de inicialización
ls -la postgres-init/

# Recrear contenedor con inicialización
docker-compose down postgres-auth
docker volume rm $(docker volume ls -q | grep postgres)
docker-compose up postgres-auth -d
```

### Error: "Too many connections"

**Síntomas:**
```
error: sorry, too many clients already
```

**Soluciones:**
```bash
# Verificar conexiones activas
docker-compose exec postgres-auth psql -U admin -d auth_db -c "SELECT count(*) FROM pg_stat_activity;"

# Reiniciar servicios para cerrar conexiones
docker-compose restart auth-service media-service

# Aumentar max_connections en PostgreSQL (si es necesario)
# Agregar en docker-compose.yml:
# command: postgres -c max_connections=200
```

## 🔐 Problemas de Autenticación

### Error: "JWT token invalid"

**Síntomas:**
```
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Soluciones:**
```bash
# Verificar que el token no haya expirado
# Los tokens JWT expiran en 24 horas por defecto

# Verificar formato del header
# Correcto: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# Incorrecto: "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Verificar que JWT_SECRET sea el mismo en todos los servicios
docker-compose exec auth-service env | grep JWT_SECRET
docker-compose exec media-service env | grep JWT_SECRET

# Obtener nuevo token
curl -X POST http://localhost:5900/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Error: "User not found"

**Síntomas:**
```
{
  "statusCode": 404,
  "message": "User not found"
}
```

**Soluciones:**
```bash
# Verificar que el usuario exista en la base de datos
docker-compose exec postgres-auth psql -U admin -d auth_db -c "SELECT * FROM users;"

# Registrar usuario si no existe
curl -X POST http://localhost:5900/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Verificar logs del servicio de autenticación
docker-compose logs auth-service
```

### Error: "Insufficient permissions"

**Síntomas:**
```
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**Soluciones:**
```bash
# Verificar rol del usuario
curl -X GET http://localhost:5900/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Promover usuario a moderador (requiere admin)
curl -X POST http://localhost:5900/auth/promote-to-moderator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"userId": "user-uuid"}'

# Verificar que el endpoint requiera el rol correcto
# Revisar decoradores @Roles() en el código
```

## 📡 Problemas de WebSocket

### Error: "WebSocket connection failed"

**Síntomas:**
```
WebSocket connection to 'ws://localhost:5903/notifications' failed
```

**Soluciones:**
```bash
# Verificar que el servicio de notificaciones esté ejecutándose
curl http://localhost:5903/health

# Verificar logs del servicio
docker-compose logs notifications-service

# Probar conexión con wscat
npm install -g wscat
wscat -c "ws://localhost:5903/notifications?token=YOUR_JWT_TOKEN"

# Verificar CORS si es desde navegador
# El servicio debe permitir el origen del cliente
```

### Error: "Authentication failed" en WebSocket

**Síntomas:**
```
{
  "message": "Authentication failed",
  "code": "AUTH_FAILED"
}
```

**Soluciones:**
```bash
# Verificar que el token se envíe correctamente
# Opción 1: Query parameter
ws://localhost:5903/notifications?token=YOUR_JWT_TOKEN

# Opción 2: En el evento join_notifications
socket.emit('join_notifications', { token: 'YOUR_JWT_TOKEN' });

# Verificar que el token sea válido
curl -X GET http://localhost:5900/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Error: "Room not found" en WebSocket

**Síntomas:**
```
{
  "message": "User not in any notification room",
  "code": "ROOM_NOT_FOUND"
}
```

**Soluciones:**
```javascript
// Asegurar que se ejecute join_notifications después de conectar
socket.on('connect', () => {
  socket.emit('join_notifications', { token: 'YOUR_JWT_TOKEN' });
});

// Verificar que el evento se envíe correctamente
socket.on('joined_notifications', (data) => {
  console.log('Successfully joined notifications room');
});
```

## 📤 Problemas de Upload

### Error: "File too large"

**Síntomas:**
```
{
  "statusCode": 413,
  "message": "File too large"
}
```

**Soluciones:**
```bash
# Verificar límite de tamaño (100MB por defecto)
# Cambiar MAX_FILE_SIZE en variables de entorno

# Para archivos grandes, usar upload multipart
# 1. Dividir archivo en chunks
# 2. Usar /media/init-upload
# 3. Subir cada chunk con /media/upload-chunk
# 4. Completar con /media/complete-upload
```

### Error: "Invalid file type"

**Síntomas:**
```
{
  "statusCode": 400,
  "message": "Invalid file type"
}
```

**Soluciones:**
```bash
# Verificar tipos MIME soportados:
# Videos: video/mp4, video/avi, video/mov, video/mkv, video/webm
# Imágenes: image/jpeg, image/png, image/webp, image/gif
# Audio: audio/mp3, audio/wav, audio/flac, audio/aac, audio/ogg
# Documentos: text/plain, application/pdf

# Verificar que el tipo MIME se envíe correctamente
curl -X POST http://localhost:5901/media/init-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "originalName": "video.mp4",
    "mimeType": "video/mp4",
    "type": "video",
    "totalSize": 1048576,
    "totalChunks": 1
  }'
```

### Error: "Chunk upload failed"

**Síntomas:**
```
{
  "statusCode": 400,
  "message": "Invalid chunk number or chunk already exists"
}
```

**Soluciones:**
```bash
# Verificar que los chunks se suban en orden
# chunkNumber debe empezar en 0

# Verificar que no se repitan chunks
# Cada chunk debe tener un número único

# Verificar logs del media service
docker-compose logs media-service

# Reiniciar upload si es necesario
curl -X DELETE http://localhost:5901/media/MEDIA_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚡ Problemas de Performance

### Respuestas lentas de la API

**Diagnóstico:**
```bash
# Verificar uso de recursos
docker stats

# Verificar logs de base de datos
docker-compose logs postgres-auth | grep "slow query"

# Verificar conexiones a Redis
docker-compose exec redis-auth redis-cli ping
```

**Soluciones:**
```bash
# Aumentar recursos de Docker si es necesario
# En Docker Desktop: Settings > Resources

# Verificar índices en base de datos
docker-compose exec postgres-auth psql -U admin -d auth_db -c "
  SELECT schemaname, tablename, attname, n_distinct, correlation 
  FROM pg_stats 
  WHERE tablename = 'users';
"

# Limpiar cache de Redis si está lleno
docker-compose exec redis-auth redis-cli FLUSHALL
```

### WebSocket desconexiones frecuentes

**Diagnóstico:**
```bash
# Verificar logs de conexiones
docker-compose logs notifications-service | grep "disconnect"

# Verificar configuración de timeout
# En el código del cliente, aumentar timeout:
# socket.timeout(30000);
```

**Soluciones:**
```javascript
// Configurar reconexión automática
const socket = io('http://localhost:5903/notifications', {
  query: { token },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 30000
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Reconectar manualmente si el servidor desconectó
    socket.connect();
  }
});
```

## 🔍 Comandos de Diagnóstico

### Verificación General del Sistema

```bash
#!/bin/bash
# health-check.sh - Script de diagnóstico completo

echo "🔍 Diagnóstico del Sistema"
echo "=========================="

# Verificar Docker
echo "📦 Docker Status:"
docker --version
docker-compose --version

# Verificar contenedores
echo -e "\n🐳 Contenedores:"
docker-compose ps

# Verificar salud de servicios
echo -e "\n🏥 Salud de Servicios:"
curl -s http://localhost:5900/auth/health || echo "❌ Auth Service DOWN"
curl -s http://localhost:5901/media/health || echo "❌ Media Service DOWN"
curl -s http://localhost:5902/comments/health || echo "❌ Comments Service DOWN"
curl -s http://localhost:5903/health || echo "❌ Notifications Service DOWN"

# Verificar bases de datos
echo -e "\n🗄️ Bases de Datos:"
docker-compose exec postgres-auth pg_isready -U admin || echo "❌ Auth DB DOWN"
docker-compose exec postgres-media pg_isready -U admin || echo "❌ Media DB DOWN"
docker-compose exec postgres-comments pg_isready -U admin || echo "❌ Comments DB DOWN"
docker-compose exec postgres-notifications pg_isready -U admin || echo "❌ Notifications DB DOWN"

# Verificar Redis
echo -e "\n🔴 Redis:"
docker-compose exec redis-auth redis-cli ping || echo "❌ Auth Redis DOWN"
docker-compose exec redis-notifications redis-cli ping || echo "❌ Notifications Redis DOWN"

# Verificar puertos
echo -e "\n🌐 Puertos:"
netstat -tulpn | grep -E ":(5900|5901|5902|5903|8080|5050)" || echo "⚠️ Algunos puertos no están disponibles"

echo -e "\n✅ Diagnóstico completado"
```

### Logs Centralizados

```bash
#!/bin/bash
# collect-logs.sh - Recopilar logs de todos los servicios

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_DIR="logs_$TIMESTAMP"

mkdir -p $LOG_DIR

echo "📋 Recopilando logs en $LOG_DIR..."

# Logs de servicios
docker-compose logs auth-service > $LOG_DIR/auth-service.log
docker-compose logs media-service > $LOG_DIR/media-service.log
docker-compose logs comments-service > $LOG_DIR/comments-service.log
docker-compose logs notifications-service > $LOG_DIR/notifications-service.log

# Logs de bases de datos
docker-compose logs postgres-auth > $LOG_DIR/postgres-auth.log
docker-compose logs postgres-media > $LOG_DIR/postgres-media.log
docker-compose logs postgres-comments > $LOG_DIR/postgres-comments.log
docker-compose logs postgres-notifications > $LOG_DIR/postgres-notifications.log

# Logs de Redis
docker-compose logs redis-auth > $LOG_DIR/redis-auth.log
docker-compose logs redis-notifications > $LOG_DIR/redis-notifications.log

# Estado del sistema
docker-compose ps > $LOG_DIR/containers-status.txt
docker stats --no-stream > $LOG_DIR/resource-usage.txt

echo "✅ Logs recopilados en $LOG_DIR/"
```

### Limpieza del Sistema

```bash
#!/bin/bash
# cleanup.sh - Limpiar sistema completamente

echo "🧹 Limpiando sistema..."

# Detener servicios
docker-compose down

# Limpiar volúmenes (CUIDADO: elimina datos)
read -p "¿Eliminar volúmenes de datos? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "✅ Volúmenes eliminados"
fi

# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar sistema completo
docker system prune -f

echo "✅ Limpieza completada"
```

## 🆘 Cuando Todo Falla

### Reset Completo del Sistema

```bash
# ⚠️ CUIDADO: Esto eliminará TODOS los datos
docker-compose down -v
docker system prune -a -f
docker volume prune -f
docker network prune -f

# Reconstruir desde cero
docker-compose up --build
```

### Contactar Soporte

Si ninguna de estas soluciones funciona:

1. **Recopila información del sistema:**
   ```bash
   ./health-check.sh > system-info.txt
   ./collect-logs.sh
   ```

2. **Crea un issue en GitHub:**
   - URL: https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/issues
   - Incluye los logs y información del sistema
   - Describe los pasos que llevaron al problema

3. **Información útil para incluir:**
   - Sistema operativo y versión
   - Versión de Docker y Docker Compose
   - Logs relevantes
   - Pasos para reproducir el problema

---

**💡 Tip**: Mantén este documento a mano y ejecuta los scripts de diagnóstico regularmente para detectar problemas antes de que se vuelvan críticos.
