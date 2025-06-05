# 🚀 Servicio de Autenticación - Microservicio

Este es el servicio de autenticación para la plataforma de contenido multimedia, desarrollado con NestJS, PostgreSQL, Redis y Docker.

## 📋 Características

- ✅ Autenticación JWT
- ✅ Registro y login de usuarios
- ✅ Sistema de roles (USER, MODERATOR, ADMIN)
- ✅ Promoción de usuarios a moderadores
- ✅ Documentación Swagger automática
- ✅ Validaciones con class-validator
- ✅ Tests unitarios con Jest
- ✅ Docker y Docker Compose

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
| **Swagger Docs** | 5900 | http://localhost:5900/api/docs | Documentación API |
| **PostgreSQL** | 5432 | localhost:5432 | Base de datos |
| **Redis** | 6379 | localhost:6379 | Cache y sesiones |
| **pgAdmin** | 5050 | http://localhost:5050 | Administrador de BD (solo desarrollo) |

## 🔑 Credenciales por Defecto

### Base de Datos PostgreSQL
- **Host**: localhost
- **Puerto**: 5432
- **Base de datos**: `auth_db`
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

### Autenticación
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| GET | `/auth/profile` | Obtener perfil del usuario | JWT |
| POST | `/auth/refresh` | Renovar token | JWT |
| POST | `/auth/promote-to-moderator` | Promover a moderador | JWT + ADMIN |
| GET | `/auth/health` | Estado del servicio | No |

### Documentación Swagger
Visita http://localhost:5900/api/docs para ver la documentación interactiva completa.

## 🧪 Testing

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

## 📝 Ejemplos de Uso

### 1. Registrar un nuevo usuario
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

### 2. Iniciar sesión
```bash
curl -X POST http://localhost:5900/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "mipassword123"
  }'
```

### 3. Obtener perfil (con token)
```bash
curl -X GET http://localhost:5900/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 4. Promover usuario a moderador (solo ADMIN)
```bash
curl -X POST http://localhost:5900/auth/promote-to-moderator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -d '{
    "userId": "uuid-del-usuario"
  }'
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

### **Verificar la Conexión**

Si todo está correcto, deberías ver:
- ✅ **Servidor "Auth Database"** en el panel izquierdo con icono verde
- ✅ **Base de datos `auth_db`** expandible
- ✅ **Esquema `public`** con sus tablas
- ✅ **Tabla `users`** (se crea automáticamente cuando el servicio de auth ejecuta)

### **Datos de Conexión de Referencia Rápida**

| Campo | Valor | Notas |
|-------|-------|-------|
| **Host** | `postgres-auth` | ⚠️ NO `localhost` |
| **Puerto** | `5432` | Puerto estándar PostgreSQL |
| **Base de datos** | `auth_db` | BD principal del servicio |
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

Este es el primer microservicio de la plataforma. Los siguientes servicios a desarrollar serán:

1. **Servicio de Contenido Multimedia** (puerto 5901)
2. **Servicio de Comentarios** (puerto 5902)
3. **Servicio de Notificaciones** (puerto 5903)
4. **Servicio de Procesamiento** (puerto 5904)

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa los logs: `docker-compose logs auth-service`
2. Verifica la documentación Swagger: http://localhost:5900/api/docs
3. Ejecuta los tests para verificar funcionalidad: `npm test`

---

**¡El servicio de autenticación está listo para usar! 🎉** 