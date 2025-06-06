# 🐞 Validación de Problemas de Autenticación en Swagger

## 🎯 Problema Identificado

**El media-service estaba enviando el token JWT de manera incorrecta al auth-service**, causando errores de "token inválido" en Swagger.

## 🔧 Solución Implementada

### ❌ Configuración Anterior (Media Service)
```typescript
// media-service/src/auth/auth.service.ts - INCORRECTO
const response = await fetch(`${this.authServiceUrl}/auth/validate-token`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,  // ❌ Token en header
    'Content-Type': 'application/json',
  },
});
```

### ✅ Configuración Corregida (Media Service)
```typescript
// media-service/src/auth/auth.service.ts - CORRECTO
const response = await fetch(`${this.authServiceUrl}/auth/validate-token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ token }),  // ✅ Token en body
});
```

## 📋 Pasos para Validar la Solución

### 1. Ejecutar Script de Prueba
```bash
node test-auth-integration.js
```

### 2. Probar en Swagger Manualmente

#### 🔐 Auth Service (puerto 3002)
1. Ir a `http://localhost:3002/api/docs`
2. POST `/auth/login` con:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
3. Copiar el `access_token` de la respuesta

#### 📁 Media Service (puerto 5901)
1. Ir a `http://localhost:5901/api/docs`
2. Hacer clic en el botón **"Authorize"** 🔒
3. Pegar el token (sin "Bearer", solo el token)
4. Probar POST `/media/init-upload` con:
   ```json
   {
     "filename": "test-video.mp4",
     "fileSize": 1024000,
     "mimeType": "video/mp4"
   }
   ```

#### 💬 Comments Service (puerto 3000)
1. Ir a `http://localhost:3000/api/docs`
2. Hacer clic en el botón **"Authorize"** 🔒
3. Pegar el token (sin "Bearer", solo el token)
4. Probar POST `/comments/media/{mediaId}` con:
   ```json
   {
     "content": "Test comment",
     "contentId": "test-video-123"
   }
   ```

## 🔍 Validación de Endpoints de Health

### Auth Service
- URL: `http://localhost:3002/auth/health`
- Respuesta esperada: `{ "status": "OK", "timestamp": "...", "service": "Auth Service" }`

### Media Service  
- URL: `http://localhost:5901/health`
- Respuesta esperada: `{ "status": "OK", "timestamp": "..." }`

### Comments Service
- URL: `http://localhost:3000/comments/health`
- Respuesta esperada: `{ "status": "OK", "timestamp": "...", "service": "Comments Service" }`

## 🛠️ Configuración de Swagger

### Todos los servicios usan la misma configuración:
```typescript
.addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Ingresa tu token JWT',
    in: 'header',
  },
  'JWT-auth',
)
```

### Los controladores usan:
```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
```

## 🧪 Script de Prueba Automatizada

El archivo `test-auth-integration.js` realiza las siguientes validaciones:

1. ✅ Verifica que todos los servicios estén disponibles
2. ✅ Registra un usuario de prueba
3. ✅ Hace login y obtiene un token JWT
4. ✅ Valida el token directamente con auth-service
5. ✅ Prueba autenticación en media-service
6. ✅ Prueba autenticación en comments-service
7. ✅ Verifica health checks de todos los servicios

## 🚨 Problemas Comunes y Soluciones

### "Token inválido" en Swagger
- **Causa**: Configuración incorrecta en AuthService
- **Solución**: ✅ Corregida - Token enviado en body en lugar de header

### "Cannot connect to auth-service"  
- **Causa**: Auth-service no está ejecutándose
- **Solución**: Verificar que esté corriendo en puerto 3002

### "CORS error" en Swagger
- **Causa**: Configuración CORS restrictiva
- **Solución**: Verificar que CORS permita el origen correcto

### "Bearer token format"
- **Swagger UI**: Solo pegar el token sin "Bearer"
- **Postman/curl**: Usar `Authorization: Bearer <token>`

## 📝 Checklist de Validación

- [ ] Auth-service ejecutándose en puerto 3002
- [ ] Media-service ejecutándose en puerto 5901  
- [ ] Comments-service ejecutándose en puerto 3000
- [ ] Script `test-auth-integration.js` pasa todas las pruebas
- [ ] Swagger de media-service permite autenticación exitosa
- [ ] Swagger de comments-service permite autenticación exitosa
- [ ] Todos los health checks responden correctamente

## 🎉 Resultado Esperado

Después de la corrección, deberías poder:

1. 🔐 Hacer login en auth-service
2. 📋 Copiar el token JWT
3. 🔒 Autorizar en cualquier Swagger (media/comments)
4. ✅ Usar endpoints protegidos sin errores de "token inválido"

**¡La autenticación JWT debería funcionar perfectamente en todos los servicios!** 