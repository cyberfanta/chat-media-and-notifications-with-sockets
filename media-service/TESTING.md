# Testing del Sistema de Upload Multimedia

Este documento explica cómo usar las herramientas de testing para validar el funcionamiento del sistema de upload multipart de archivos multimedia.

## 🚀 Herramientas Disponibles

### 1. Endpoint `/media/split-file`
Un endpoint especial diseñado para testing que permite dividir cualquier archivo en chunks.

**Endpoint**: `POST /media/split-file`
**Autenticación**: JWT Bearer Token requerido
**Content-Type**: `multipart/form-data`

**Parámetros**:
- `file`: Archivo a dividir
- `chunks`: Número de chunks (1-1000)

**Respuesta**:
```json
{
  "originalName": "video.mp4",
  "originalSize": 1048576,
  "totalChunks": 5,
  "chunkSize": 209715,
  "chunks": [
    {
      "chunkNumber": 0,
      "size": 209715,
      "data": "base64encodeddata..."
    },
    // ... más chunks
  ]
}
```

### 2. Utilidades de Testing (`src/utils/testing-helpers.ts`)

Conjunto de funciones para facilitar el testing:

- `chunkDataToBuffer()`: Convierte chunk base64 a Buffer
- `chunkDataToFile()`: Crea objeto File simulado
- `createChunkFormData()`: Crea FormData para upload
- `MediaUploadTester`: Clase completa para testing automatizado

### 3. Script de Testing Automatizado (`examples/test-upload.js`)

Script Node.js que ejecuta el workflow completo de testing.

## 📋 Guía de Testing

### Prerequisitos

1. **Servicios en ejecución**:
   ```bash
   docker-compose up -d
   ```

2. **Usuario de prueba**:
   - Asegúrate de tener un usuario en el auth-service
   - Por defecto usa `admin@example.com` / `admin123`

3. **Archivo de prueba**:
   - Coloca archivos en `./test-files/`
   - Modifica `TEST_FILE_PATH` en el script

### Opción 1: Testing Manual con Postman/Insomnia

#### Paso 1: Autenticación
```bash
POST http://localhost:5900/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### Paso 2: Dividir archivo
```bash
POST http://localhost:5901/media/split-file
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [seleccionar archivo]
chunks: 5
```

#### Paso 3: Inicializar upload
```bash
POST http://localhost:5901/media/init-upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "originalName": "video.mp4",
  "mimeType": "video/mp4",
  "type": "video",
  "totalSize": 1048576,
  "totalChunks": 5
}
```

#### Paso 4: Subir chunks
Para cada chunk devuelto por split-file:

```bash
POST http://localhost:5901/media/upload-chunk/{mediaId}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

file: [convertir chunk.data de base64 a binary]
chunkNumber: {chunk.chunkNumber}
```

#### Paso 5: Completar upload
```bash
POST http://localhost:5901/media/complete-upload/{mediaId}
Authorization: Bearer YOUR_JWT_TOKEN
```

### Opción 2: Testing Automatizado

#### Instalación de dependencias
```bash
cd media-service
npm install
```

#### Configuración
Edita `examples/test-upload.js` para ajustar:
- Credenciales de usuario
- Ruta del archivo de prueba
- Número de chunks

#### Ejecución
```bash
npm run test:upload
```

O directamente:
```bash
node examples/test-upload.js
```

### Opción 3: Testing Programático

Usa las utilidades en tu código:

```typescript
import { MediaUploadTester } from './src/utils/testing-helpers';

const tester = new MediaUploadTester(
  'http://localhost:5901',
  'your-jwt-token'
);

const result = await tester.testCompleteUploadWorkflow(file, 5);
console.log(result);
```

## 🔧 Conversión de Chunks

### De Base64 a Buffer (Node.js)
```javascript
const chunkBuffer = Buffer.from(chunkData, 'base64');
```

### De Base64 a Blob (Browser)
```javascript
const byteCharacters = atob(chunkData);
const byteNumbers = new Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i);
}
const byteArray = new Uint8Array(byteNumbers);
const blob = new Blob([byteArray]);
```

### Crear FormData para Upload
```javascript
const formData = new FormData();
formData.append('file', chunkBuffer, `chunk_${chunkNumber}`);
formData.append('chunkNumber', chunkNumber.toString());
```

## 📊 Verificación de Resultados

### Estados del Media
- `initializing`: Upload iniciado
- `uploading`: Recibiendo chunks
- `processing`: Ensamblando archivo
- `completed`: Upload exitoso
- `failed`: Error en el proceso

### Endpoints de Verificación
```bash
# Obtener info del media
GET http://localhost:5901/media/{mediaId}

# Listar medias del usuario
GET http://localhost:5901/media
```

## 🐛 Troubleshooting

### Error: "Invalid MIME type"
- Verifica que el `mimeType` coincida con el `type`
- Tipos soportados: image/*, video/*, audio/*

### Error: "Invalid chunk number"
- Los chunks van de 0 a (totalChunks - 1)
- Verifica el número de chunk en cada upload

### Error: "Not all chunks uploaded"
- Asegúrate de subir todos los chunks antes de completar
- Verifica que `uploadedChunks` == `totalChunks`

### Error en autenticación
- Verifica que el token JWT sea válido
- El token debe incluirse en el header: `Authorization: Bearer TOKEN`

## 💡 Tips

1. **Archivos pequeños**: Usa pocos chunks (2-5) para testing rápido
2. **Archivos grandes**: Divide en más chunks para simular casos reales
3. **Orden de chunks**: Pueden subirse en cualquier orden
4. **Reintentos**: Puedes subir el mismo chunk múltiples veces
5. **Limpieza**: Los chunks temporales se eliminan automáticamente al completar

## 📈 Casos de Prueba Recomendados

1. **Caso básico**: Archivo pequeño, 3 chunks
2. **Caso complejo**: Archivo grande, 20+ chunks
3. **Caso de error**: Faltar chunks al completar
4. **Caso de rendimiento**: Chunks grandes (>10MB)
5. **Caso de concurrencia**: Múltiples uploads simultáneos

## 🔗 Links Útiles

- [Swagger UI Media Service](http://localhost:5901/api)
- [Swagger UI Auth Service](http://localhost:5900/api)
- [Documentación NestJS](https://nestjs.com/)
- [Documentación TypeORM](https://typeorm.io/) 