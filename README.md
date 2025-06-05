# 🚀 Plataforma de Contenido Multimedia - Microservicios

Sistema completo de gestión de contenido multimedia con microservicios de autenticación y media, desarrollado con NestJS, PostgreSQL, Redis y Docker.

## 📋 Características

### 🔐 Auth Service
- ✅ Autenticación JWT
- ✅ Registro y login de usuarios
- ✅ Sistema de roles (USER, MODERATOR, ADMIN)
- ✅ Promoción de usuarios a moderadores

### 📁 Media Service
- ✅ Upload multipart de archivos multimedia
- ✅ Soporte para imágenes, videos y audios
- ✅ Gestión de chunks para archivos grandes
- ✅ Validación de tipos MIME
- ✅ Eliminación segura de archivos

### 🛠️ Características Generales
- ✅ Documentación Swagger automática
- ✅ Validaciones con class-validator
- ✅ Tests unitarios con Jest
- ✅ Docker y Docker Compose
- ✅ Arquitectura de microservicios

## 🛠️ Tecnologías

- **Framework**: NestJS con TypeScript
- **Base de datos**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: TypeORM
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest
- **Contenedores**: Docker & Docker Compose

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd chat-media-and-notifications-with-sockets
```

### 2. Ejecutar en Modo Desarrollo (Recomendado)
```bash
# Construir y ejecutar todos los servicios en modo desarrollo
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f auth-service
```

### 3. Ejecutar en Modo Producción
```bash
# Usar el archivo de producción
docker-compose -f docker-compose.prod.yml up --build

# Ejecutar en segundo plano
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Verificar que los servicios estén funcionando
```bash
# Ver estado de contenedores
docker-compose ps

# Verificar salud de los servicios
curl http://localhost:5900/auth/health
```

### 5. Detener y limpiar servicios
```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Limpiar sistema Docker
docker system prune -f
```

## 🌐 Servicios y Puertos

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **Auth Service** | 5900 | http://localhost:5900 | API de autenticación |
| **Auth Swagger** | 5900 | http://localhost:5900/api/docs | Documentación Auth API |
| **Media Service** | 5901 | http://localhost:5901 | API de archivos multimedia |
| **Media Swagger** | 5901 | http://localhost:5901/api/docs | Documentación Media API |
| **PostgreSQL Auth** | 5432 | localhost:5432 | Base de datos autenticación |
| **PostgreSQL Media** | 5433 | localhost:5433 | Base de datos multimedia |
| **Redis** | 6379 | localhost:6379 | Cache y sesiones |
| **pgAdmin** | 5050 | http://localhost:5050 | Administrador de BD (solo desarrollo) |

## 🔑 Credenciales por Defecto

### Base de Datos PostgreSQL Auth
- **Host**: localhost
- **Puerto**: 5432
- **Base de datos**: `auth_db`
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Base de Datos PostgreSQL Media
- **Host**: localhost
- **Puerto**: 5433
- **Base de datos**: `media_db`
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### pgAdmin (Administrador de Base de Datos)
- **URL**: http://localhost:5050
- **Email**: `admin@admin.com`
- **Contraseña**: `admin123`

### Redis
- **Host**: localhost
- **Puerto**: 6379
- **Sin contraseña**

### JWT
- **Secret**: `mi_super_secreto_jwt_para_autenticacion_2024`
- **Expiración**: 24 horas

## 📚 Endpoints de la API

### 🔐 Auth Service (Puerto 5900)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/profile` | Obtener perfil del usuario | JWT |
| POST | `/auth/refresh` | Renovar token | JWT |
| POST | `/auth/promote-to-moderator` | Promover a moderador | JWT + ADMIN |
| GET | `/auth/health` | Estado del servicio | No |

### 📁 Media Service (Puerto 5901)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/media/init-upload` | Inicializar upload multipart | JWT |
| POST | `/media/upload-chunk/:mediaId` | Subir chunk de archivo | JWT |
| POST | `/media/complete-upload/:mediaId` | Completar y ensamblar archivo | JWT |
| GET | `/media/:id` | Obtener información de un media | JWT |
| GET | `/media` | Obtener medias del usuario | JWT |
| DELETE | `/media/:id` | Eliminar media | JWT |
| GET | `/media/:id/download` | Descargar archivo | JWT |
| GET | `/media/:id/view` | Ver archivo en navegador | JWT |
| GET | `/media/storage/info` | Información de almacenamiento | JWT |
| GET | `/media/health` | Estado del servicio | No |

### 📖 Documentación Swagger
- **Auth Service**: http://localhost:5900/api/docs
- **Media Service**: http://localhost:5901/api/docs

## 🔧 Herramientas de Testing para Upload Multimedia

### 🧰 Endpoint de División de Archivos (Testing Tool)
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/media/split-file` | Dividir archivo en chunks para testing | JWT |

Este endpoint especial permite dividir cualquier archivo en la cantidad de chunks especificada, devolviendo cada chunk en formato base64. Es ideal para probar el workflow completo de upload multipart.

**Ejemplo de uso**:
```bash
curl -X POST http://localhost:5901/media/split-file \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -F "file=@video.mp4" \
  -F "chunks=5"
```

### 📋 Scripts de Testing Automatizado

#### 1. Script Node.js de Testing Completo
```bash
cd media-service
npm run test:upload
```

Este script ejecuta un workflow completo de testing:
1. Divide un archivo usando `/split-file`
2. Inicializa el upload con `/init-upload`
3. Sube cada chunk con `/upload-chunk`
4. Completa el upload con `/complete-upload`

#### 2. Utilidades de Testing en TypeScript
Ubicadas en `media-service/src/utils/testing-helpers.ts`:
- Conversión de chunks base64 a Buffer
- Creación de FormData para uploads
- Clase `MediaUploadTester` para testing automatizado

#### 3. Guía Detallada de Testing
Ver `media-service/TESTING.md` para instrucciones paso a paso sobre:
- Testing manual con Postman/Insomnia
- Testing automatizado con scripts
- Conversión de chunks y troubleshooting

## 🧪 Testing de Servicios

```bash
# Ejecutar tests dentro del contenedor
docker-compose exec auth-service npm test

# Ejecutar tests con cobertura
docker-compose exec auth-service npm run test:cov

# Ejecutar tests en modo watch
docker-compose exec auth-service npm run test:watch
```

## 👥 Roles de Usuario

### USER (Por defecto)
- Acceso básico a la plataforma
- Puede ver su propio perfil

### MODERATOR
- Puede moderar contenido
- Acceso a funciones de moderación

### ADMIN
- Acceso completo al sistema
- Puede promover usuarios a moderadores
- Gestión completa de usuarios

## 🔧 Configuración de Desarrollo

### Variables de Entorno
Copia el archivo `auth-service/env.example` y ajusta las variables según necesites:

```bash
cp auth-service/env.example auth-service/.env
```

### Desarrollo Local (sin Docker)
```bash
cd auth-service
npm install
npm run start:dev
```

## 🗄️ Sistema de Almacenamiento de Archivos

### **Almacenamiento Local (Actual)**

Actualmente, los archivos se almacenan **localmente** en el sistema de archivos del contenedor, no en un bucket en la nube. Esta configuración es ideal para desarrollo y testing.

#### **Estructura de Directorios**

```
media-service/
├── uploads/          # Archivos finales completados
│   ├── abc123.mp4   # Videos
│   ├── def456.jpg   # Imágenes  
│   └── ghi789.mp3   # Audio
├── chunks/           # Chunks temporales durante upload
│   ├── media-id-1/  # Chunks por archivo
│   │   ├── chunk_0
│   │   ├── chunk_1
│   │   └── chunk_2
│   └── media-id-2/
└── src/
```

#### **Volúmenes Docker**

```yaml
volumes:
  - media_uploads:/app/uploads    # Archivos permanentes
  - media_chunks:/app/chunks      # Chunks temporales
```

#### **Endpoints de Acceso a Archivos**

| Endpoint | Descripción | Uso |
|----------|-------------|-----|
| `GET /media/:id/download` | Descargar archivo | Descarga con nombre original |
| `GET /media/:id/view` | Ver en navegador | Visualización directa |
| `GET /media/storage/info` | Info almacenamiento | Estadísticas de uso |

#### **Ejemplo de Uso de Archivos**

```bash
# 1. Listar archivos del usuario
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5901/media

# 2. Descargar archivo específico
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5901/media/abc123-def456/download \
  -o "mi_archivo.mp4"

# 3. Ver archivo en navegador (para imágenes/videos)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5901/media/abc123-def456/view

# 4. Ver información de almacenamiento
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5901/media/storage/info
```

#### **Información de Almacenamiento**

El endpoint `/media/storage/info` devuelve:

```json
{
  "uploadsDir": "/app/uploads",
  "chunksDir": "/app/chunks",
  "totalFiles": 15,
  "diskUsage": {
    "uploads": {
      "files": 12,
      "sizeBytes": 52428800
    },
    "chunks": {
      "files": 3,
      "sizeBytes": 1048576
    }
  }
}
```

### **Migración a Almacenamiento en la Nube (Opcional)**

Para producción, se recomienda migrar a un sistema de almacenamiento en la nube:

#### **Opciones Recomendadas**

1. **AWS S3**: Más popular, integración directa
2. **MinIO**: Compatible S3, auto-hospedado
3. **Google Cloud Storage**: Buena integración con GCP
4. **Azure Blob Storage**: Para entornos Microsoft

#### **Configuración MinIO (Recomendado para desarrollo)**

MinIO es compatible con S3 y se puede ejecutar localmente:

```yaml
# Agregar a docker-compose.yml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: admin
    MINIO_ROOT_PASSWORD: admin123
  command: server /data --console-address ":9001"
  volumes:
    - minio_data:/data

volumes:
  minio_data:
```

#### **Variables de Entorno para S3**

```bash
# Para producción con AWS S3
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-media-bucket

# Para desarrollo con MinIO
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=admin
AWS_SECRET_ACCESS_KEY=admin123
AWS_REGION=us-east-1
S3_BUCKET_NAME=media-bucket
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
```

### **Acceso Manual a Archivos**

#### **Desde el contenedor**

```bash
# Entrar al contenedor media-service
docker exec -it media-service sh

# Listar archivos subidos
ls -la /app/uploads/

# Ver un archivo específico
file /app/uploads/abc123.mp4

# Ver tamaño de directorios
du -sh /app/uploads/
du -sh /app/chunks/
```

#### **Desde el host (desarrollo)**

Los volúmenes Docker permiten acceso desde el host:

```bash
# Ver ubicación de volúmenes
docker volume inspect chat-media-and-notifications-with-sockets_media_uploads

# En Windows con Docker Desktop
# Los archivos están en: \\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\
```

#### **Backup de Archivos**

```bash
# Backup de todos los archivos
docker run --rm -v chat-media-and-notifications-with-sockets_media_uploads:/data \
  -v $(pwd):/backup alpine tar czf /backup/media-backup.tar.gz -C /data .

# Restaurar backup
docker run --rm -v chat-media-and-notifications-with-sockets_media_uploads:/data \
  -v $(pwd):/backup alpine tar xzf /backup/media-backup.tar.gz -C /data
```

## 📝 Ejemplos de Uso

### 🔐 Auth Service

#### 1. Registrar un nuevo usuario
```bash
curl -X POST http://localhost:5900/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "mipassword123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

#### 2. Iniciar sesión
```bash
curl -X POST http://localhost:5900/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "mipassword123"
  }'
```

#### 3. Obtener perfil (con token)
```bash
curl -X GET http://localhost:5900/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

#### 4. Promover usuario a moderador (solo ADMIN)
```bash
curl -X POST http://localhost:5900/auth/promote-to-moderator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -d '{
    "userId": "uuid-del-usuario"
  }'
```

### 📁 Media Service

#### 1. Inicializar upload de archivo multimedia
```bash
curl -X POST http://localhost:5901/media/init-upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "originalName": "mi_video.mp4",
    "mimeType": "video/mp4",
    "type": "video",
    "totalSize": 104857600,
    "totalChunks": 100
  }'
```

#### 2. Subir chunk de archivo
```bash
curl -X POST http://localhost:5901/media/upload-chunk/MEDIA_ID_OBTENIDO \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -F "file=@chunk_0.bin" \
  -F "chunkNumber=0"
```

#### 3. Completar upload
```bash
curl -X POST http://localhost:5901/media/complete-upload/MEDIA_ID_OBTENIDO \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

#### 4. Obtener información de un media
```bash
curl -X GET http://localhost:5901/media/MEDIA_ID \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

#### 5. Obtener todos los medias del usuario
```bash
curl -X GET http://localhost:5901/media \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

#### 6. Eliminar un media
```bash
curl -X DELETE http://localhost:5901/media/MEDIA_ID \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 🗄️ Configuración de pgAdmin

### **Configuración Manual del Servidor PostgreSQL**

1. **Ejecuta los servicios**: 
   ```bash
   docker-compose up -d
   ```

2. **Accede a pgAdmin**: http://localhost:5050

3. **Inicia sesión** con:
   - **Email**: `admin@admin.com`
   - **Contraseña**: `admin123`

4. **Agregar servidor PostgreSQL**:
   - Clic derecho en "Servers" (en el panel izquierdo)
   - Selecciona **"Create" → "Server..."**

5. **Pestaña "General"**:
   - **Name**: `Auth Database` (o el nombre que prefieras)
   - **Comments**: `Servicio de Autenticación` (opcional)

6. **Pestaña "Connection"**:
   - **Host name/address**: `postgres-auth` ⚠️ **¡MUY IMPORTANTE: NO uses `localhost`!**
   - **Port**: `5432`
   - **Maintenance database**: `auth_db`
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Save password**: ✅ **Marcar esta opción**

7. **Pestaña "SSL" (Opcional)**:
   - **SSL mode**: `Prefer` (recomendado)

8. **Clic "Save"**

9. **Agregar servidor Media Database** (repetir pasos 4-8 con los siguientes datos):
   - **Name**: `Media Database`
   - **Host name/address**: `postgres-media` ⚠️ **¡MUY IMPORTANTE: NO uses `localhost`!**
   - **Port**: `5432`
   - **Maintenance database**: `media_db`
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Save password**: ✅ **Marcar esta opción**

### **Verificar la Conexión**

Si todo está correcto, deberías ver:
- ✅ **Servidor "Auth Database"** en el panel izquierdo con icono verde
- ✅ **Base de datos `auth_db`** expandible con tabla `users`
- ✅ **Servidor "Media Database"** en el panel izquierdo con icono verde  
- ✅ **Base de datos `media_db`** expandible con tabla `media`
- ✅ **Esquema `public`** con sus tablas

### **Datos de Conexión de Referencia Rápida**

#### **Auth Database**
| Campo | Valor | Notas |
|-------|-------|-------|
| **Host** | `postgres-auth` | ⚠️ NO `localhost` |
| **Puerto** | `5432` | Puerto estándar PostgreSQL |
| **Base de datos** | `auth_db` | BD principal del servicio |
| **Usuario** | `admin` | Usuario con todos los permisos |
| **Contraseña** | `admin123` | Contraseña del usuario admin |

#### **Media Database**
| Campo | Valor | Notas |
|-------|-------|-------|
| **Host** | `postgres-media` | ⚠️ NO `localhost` |
| **Puerto** | `5432` | Puerto estándar PostgreSQL |
| **Base de datos** | `media_db` | BD principal del servicio |
| **Usuario** | `admin` | Usuario con todos los permisos |
| **Contraseña** | `admin123` | Contraseña del usuario admin |

### **¿Por qué usar `postgres-auth` como host?**

🔑 **Concepto clave**: Dentro de Docker Compose, los contenedores se comunican usando **nombres de servicios** como hostnames, NO `localhost`:

```yaml
postgres-auth:  # ← Este nombre es el hostname dentro de la red Docker
  image: postgres:15-alpine
  container_name: postgres-auth
```

- **`localhost`** = Se refiere al propio contenedor de pgAdmin
- **`postgres-auth`** = Se refiere al contenedor de PostgreSQL

### **Troubleshooting pgAdmin**

#### **❌ pgAdmin no inicia o se reinicia constantemente**
```bash
# Limpiar pgAdmin y recrearlo
docker-compose down
docker volume rm chat-media-andnotifications-with-sockets_pgadmin_data
docker-compose up pgadmin -d
```

#### **❌ Error "could not connect to server: Connection refused"**

**Causa**: Problema de conectividad de red o PostgreSQL no está ejecutándose.

**Solución**:
```bash
# 1. Verificar que PostgreSQL esté ejecutándose
docker-compose ps

# 2. Verificar logs de PostgreSQL
docker-compose logs postgres-auth

# 3. Probar conectividad desde pgAdmin a PostgreSQL
docker exec pgadmin-auth ping postgres-auth

# 4. Si sigue fallando, reiniciar PostgreSQL
docker-compose restart postgres-auth
```

#### **❌ Error "FATAL: password authentication failed for user admin"**

**Causa**: Credenciales incorrectas o problema de autenticación.

**Solución**:
```bash
# 1. Verificar que usas las credenciales correctas:
#    Usuario: admin
#    Contraseña: admin123

# 2. Si persiste, recrear PostgreSQL con configuración limpia
docker-compose down
docker volume rm chat-media-andnotifications-with-sockets_postgres_auth_data
docker-compose up -d
```

#### **❌ Error "server closed the connection unexpectedly"**

**Causa**: PostgreSQL está sobrecargado o hay problema de configuración.

**Solución**:
```bash
# Reiniciar PostgreSQL
docker-compose restart postgres-auth

# O reiniciar todo el stack
docker-compose restart
```

#### **❌ Error "could not connect to server: Name or service not known"**

**Causa**: Estás usando `localhost` en lugar de `postgres-auth`.

**Solución**:
- ✅ Usa: `postgres-auth`
- ❌ NO uses: `localhost`, `127.0.0.1`, o la IP del contenedor

#### **❌ Error "Connection to the server has been lost"**

**Causa**: PostgreSQL se reinició o hay problemas de red.

**Solución**:
```bash
# 1. Refrescar pgAdmin (F5 en el navegador)
# 2. Reconectarse al servidor en pgAdmin
# 3. Si persiste, verificar estado de contenedores
docker-compose ps
```

### **Verificación Final**

Para confirmar que todo funciona:

```bash
# 1. Verificar todos los servicios
docker-compose ps

# 2. Probar API de autenticación
curl http://localhost:5900/auth/health

# 3. Verificar PostgreSQL directamente
docker exec postgres-auth psql -U admin -d auth_db -c "SELECT current_database();"

# 4. Acceder a pgAdmin
# http://localhost:5050
```

**¡Si sigues estos pasos exactamente, pgAdmin debería conectarse sin problemas!** 🎯

## 🐛 Troubleshooting

### Problema: Los contenedores no inician
```bash
# Limpiar contenedores y volúmenes
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Problema: Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose logs postgres-auth

# Reiniciar solo la base de datos
docker-compose restart postgres-auth
```

### Problema: Puerto ya en uso
```bash
# Cambiar puertos en docker-compose.yml si es necesario
# Por ejemplo, cambiar 5900:3000 por 5901:3000
```

### Problema: Error en npm ci
```bash
# El proyecto ahora usa npm install
# Si tienes problemas, limpia y reconstruye
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 📊 Estructura del Proyecto

```
auth-service/
├── src/
│   ├── auth/                 # Módulo de autenticación
│   │   ├── dto/             # DTOs de validación
│   │   ├── guards/          # Guards de seguridad
│   │   ├── decorators/      # Decoradores personalizados
│   │   └── strategies/      # Estrategias de Passport
│   ├── users/               # Módulo de usuarios
│   │   └── entities/        # Entidades de TypeORM
│   ├── app.module.ts        # Módulo principal
│   └── main.ts             # Punto de entrada
├── test/                    # Tests e2e
├── Dockerfile              # Configuración Docker (producción)
├── Dockerfile.dev          # Configuración Docker (desarrollo)
├── .dockerignore           # Archivos excluidos de Docker
├── package.json            # Dependencias
└── tsconfig.json           # Configuración TypeScript
```

### Diferencias entre Desarrollo y Producción

| Aspecto | Desarrollo | Producción |
|---------|------------|------------|
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile` |
| **Hot Reload** | ✅ Sí | ❌ No |
| **Volúmenes** | ✅ Código montado | ❌ Código en imagen |
| **pgAdmin** | ✅ Incluido | ❌ No incluido |
| **Build** | ❌ No requerido | ✅ Build en imagen |
| **Comando** | `npm run start:dev` | `npm run start:prod` |

## 🔄 Próximos Pasos

Ya tenemos implementados los primeros dos microservicios. Los siguientes servicios a desarrollar serán:

1. ✅ **Servicio de Autenticación** (puerto 5900) - ¡Completado!
2. ✅ **Servicio de Contenido Multimedia** (puerto 5901) - ¡Completado!
3. **Servicio de Comentarios** (puerto 5902)
4. **Servicio de Notificaciones** (puerto 5903)
5. **Servicio de Procesamiento** (puerto 5904)

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Revisa los logs**:
   - Auth Service: `docker-compose logs auth-service`
   - Media Service: `docker-compose logs media-service`

2. **Verifica la documentación Swagger**:
   - Auth Service: http://localhost:5900/api/docs
   - Media Service: http://localhost:5901/api/docs

3. **Ejecuta los tests**: `docker-compose exec [service-name] npm test`

4. **Verifica el estado de los servicios**:
   - Auth: `curl http://localhost:5900/auth/health`
   - Media: `curl http://localhost:5901/media/health`

## 🧪 Testing

### Media Service - Pruebas Unitarias

El Media Service incluye un conjunto completo de pruebas unitarias que cubren las funcionalidades principales:

#### Cobertura de Pruebas

- **MediaService**: Tests completos de la lógica de negocio
  - Inicialización de uploads
  - Upload de chunks
  - Completar uploads
  - Validación de tipos MIME
  - Operaciones CRUD

- **HealthController**: Tests del endpoint de salud
  - Respuesta de estado
  - Formato de timestamp
  - Consistencia de estructura

- **InitUploadDto**: Tests de validación de datos
  - Propiedades requeridas
  - Tipos de media soportados
  - Lógica de validación

#### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
docker-compose exec media-service npm test

# Ejecutar pruebas con cobertura
docker-compose exec media-service npm run test:cov

# Ejecutar pruebas en modo watch
docker-compose exec media-service npm run test:watch

# Ejecutar solo pruebas unitarias
docker-compose exec media-service npm run test:unit

# Ejecutar pruebas para CI/CD
docker-compose exec media-service npm run test:ci
```

#### Resultados de Cobertura

- **26 tests** ejecutados exitosamente
- **3 suites de tests** completadas
- Cobertura de código configurada con umbral mínimo
- Tests automatizados sin dependencias externas

#### Estructura de Tests

```
media-service/src/
├── controllers/
│   └── health.controller.spec.ts
├── dto/
│   └── init-upload.dto.spec.ts
├── services/
│   └── media.service.spec.ts
└── test-setup.ts
```

#### Configuración de Jest

- **Mocks automatizados** para fs, path y TypeORM
- **Variables de entorno** configuradas para testing
- **Timeout personalizado** para tests de integración
- **Reportes de cobertura** en formato text, lcov y html

### Características de Testing

✅ **Tests Unitarios**: Cobertura de lógica de negocio  
✅ **Mocks Avanzados**: Simulación de sistema de archivos  
✅ **Validación de DTOs**: Tests de validación de entrada  
✅ **Error Handling**: Tests de manejo de errores  
✅ **Async Operations**: Tests de operaciones asíncronas  

### Lineamientos para Testing

- Todos los nuevos servicios deben incluir pruebas unitarias
- Cobertura mínima del 70% para servicios críticos
- Tests de integración para endpoints principales
- Documentación de casos de prueba complejos

---

**¡Los microservicios de autenticación y media están listos para usar! 🎉** 