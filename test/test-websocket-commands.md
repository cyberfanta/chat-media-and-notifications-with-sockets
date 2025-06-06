# 🔔 Comandos para Probar WebSockets - Notifications Service

## 📋 Guía Paso a Paso

### 1. 🔑 Obtener Token JWT (Opcional)

```bash
# Registrar usuario (si no existe)
curl -X POST http://localhost:5900/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"websocket@test.com","password":"test123","firstName":"WebSocket","lastName":"Test"}'

# Hacer login para obtener token
curl -X POST http://localhost:5900/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"websocket@test.com","password":"test123"}'
```

**PowerShell:**
```powershell
# Registrar usuario
Invoke-RestMethod -Uri "http://localhost:5900/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"websocket@test.com","password":"test123","firstName":"WebSocket","lastName":"Test"}'

# Login y obtener token
$token = (Invoke-RestMethod -Uri "http://localhost:5900/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"websocket@test.com","password":"test123"}').access_token
Write-Host "Tu token JWT: $token"
```

### 2. 🌐 Probar WebSocket con Cliente HTML

1. Abre `websocket-test-client.html` en tu navegador
2. **URL:** `ws://localhost:5903/notifications`
3. **Token JWT:** Pega el token obtenido arriba (opcional)
4. Haz clic en "🔌 Conectar"

### 3. 📱 Probar con wscat (Línea de comandos)

```bash
# Sin autenticación
wscat -c ws://localhost:5903/notifications

# Con token JWT (reemplaza YOUR_JWT_TOKEN)
wscat -c "ws://localhost:5903/notifications?token=YOUR_JWT_TOKEN"
```

### 4. 📤 Eventos que puedes enviar

#### a) Unirse a notificaciones del usuario
```json
{
  "event": "join_notifications",
  "data": {}
}
```

#### b) Obtener notificaciones con filtros
```json
{
  "event": "get_notifications", 
  "data": {
    "filters": {
      "type": "NEW_COMMENT",
      "isRead": false
    },
    "page": 1,
    "limit": 10
  }
}
```

#### c) Marcar notificaciones como leídas
```json
{
  "event": "mark_as_read",
  "data": {
    "notificationIds": ["uuid-1", "uuid-2"]
  }
}
```

### 5. 📨 Eventos que recibirás

- **new_notification**: Nueva notificación en tiempo real
- **unread_count**: Contador de notificaciones no leídas
- **unread_notifications**: Lista de notificaciones no leídas
- **marked_as_read**: Confirmación de notificaciones marcadas
- **notifications**: Lista de notificaciones solicitadas
- **error**: Errores de autenticación o procesamiento

### 6. 🧪 Crear notificaciones de prueba

Para generar notificaciones de prueba, puedes:

1. **Crear un comentario** (generará notificación NEW_COMMENT):
```bash
curl -X POST http://localhost:5902/comments/content/test-content-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content":"Este es un comentario de prueba"}'
```

2. **Subir un archivo** (generará notificación UPLOAD_COMPLETED):
```bash
curl -X POST http://localhost:5901/media/init-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg","size":1024}'
```

### 7. 📋 Ejemplo de Flujo Completo

1. Abre `websocket-test-client.html`
2. Conecta al WebSocket
3. Envía evento `join_notifications`
4. En otra pestaña, crea un comentario o sube un archivo
5. ¡Verás la notificación aparecer en tiempo real!

## 🔧 Herramientas Alternativas

### Postman
- Abre Postman
- Ve a "New" → "WebSocket Request"
- URL: `ws://localhost:5903/notifications`
- Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

### Insomnia  
- Abre Insomnia
- "New Request" → "WebSocket"
- URL: `ws://localhost:5903/notifications`
- Query: `token=YOUR_JWT_TOKEN`

### Browser Console
```javascript
// Conectar al WebSocket
const ws = new WebSocket('ws://localhost:5903/notifications?token=YOUR_JWT_TOKEN');

ws.onopen = () => console.log('✅ Conectado');
ws.onmessage = (event) => console.log('📨 Recibido:', event.data);

// Enviar evento
ws.send(JSON.stringify({
  event: 'join_notifications',
  data: {}
}));
```

## 🎯 URLs de Documentación

- **Swagger Notifications**: http://localhost:5903/api/docs
- **Health Check**: http://localhost:5903/health
- **Swagger Auth**: http://localhost:5900/api/docs
- **Swagger Comments**: http://localhost:5902/api/docs 