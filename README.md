# 🚀 Plataforma de Contenido Multimedia - Microservicios

Sistema completo de gestión de contenido multimedia con microservicios de autenticación, media, comentarios y notificaciones en tiempo real, desarrollado con NestJS, PostgreSQL, Redis y Docker.

[![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)]()
[![NestJS](https://img.shields.io/badge/Framework-NestJS-red)]()
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)]()
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)]()
[![Redis](https://img.shields.io/badge/Cache-Redis-red)]()
[![Docker](https://img.shields.io/badge/Container-Docker-blue)]()

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

### 💬 Comments Service
- ✅ Sistema de comentarios jerárquico
- ✅ Moderación de comentarios con roles
- ✅ Paginación y filtros de comentarios
- ✅ Estadísticas de comentarios por contenido
- ✅ Eliminación en cascada de comentarios

### 🔔 Notifications Service
- ✅ Notificaciones en tiempo real con WebSockets
- ✅ Sistema completo de CRUD de notificaciones
- ✅ Cache inteligente con Redis para rendimiento
- ✅ Pub/Sub entre microservicios para eventos
- ✅ Rate limiting para prevenir spam
- ✅ Múltiples tipos de notificaciones
- ✅ Filtros avanzados y paginación

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
git clone https://github.com/cyberfanta/chat-media-and-notifications-with-sockets.git
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

### 3. Verificar que los servicios estén funcionando
```bash
# Ver estado de contenedores
docker-compose ps

# Verificar salud de los servicios
curl http://localhost:5900/auth/health
```

### 4. Detener y limpiar servicios
```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v
```

## 🌐 Servicios y Puertos

| Servicio | Puerto | URL | Documentación |
|----------|--------|-----|---------------|
| **Auth Service** | 5900 | http://localhost:5900 | [Swagger](http://localhost:5900/api/docs) |
| **Media Service** | 5901 | http://localhost:5901 | [Swagger](http://localhost:5901/api/docs) |
| **Comments Service** | 5902 | http://localhost:5902 | [Swagger](http://localhost:5902/api/docs) |
| **Notifications Service** | 5903 | http://localhost:5903 | [Swagger](http://localhost:5903/api/docs) |
| **WebSocket Testing App** | 8080 | http://localhost:8080 | Cliente de pruebas |
| **PostgreSQL Auth** | 5432 | localhost:5432 | Base de datos autenticación |
| **PostgreSQL Media** | 5433 | localhost:5433 | Base de datos multimedia |
| **PostgreSQL Comments** | 5434 | localhost:5434 | Base de datos comentarios |
| **PostgreSQL Notifications** | 5435 | localhost:5435 | Base de datos notificaciones |
| **Redis Auth** | 6379 | localhost:6379 | Cache y sesiones |
| **Redis Notifications** | 6380 | localhost:6380 | Pub/Sub y notificaciones |
| **pgAdmin** | 5050 | http://localhost:5050 | Administrador BD (desarrollo) |

## 📖 Documentación Completa

### 📚 Guías Principales
- **[Requisitos del Proyecto](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/requisitos.md)** - Especificaciones técnicas y funcionalidades requeridas
- **[Producción](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/produccion.md)** - Configuración y despliegue en producción
- **[Credenciales y JWT](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/credenciales.md)** - Configuración de acceso a bases de datos y JWT
- **[Endpoints de la API](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/endpoints.md)** - Lista completa de todos los endpoints
- **[WebSocket y Notificaciones](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/websocket-notificaciones.md)** - Sistema de notificaciones en tiempo real
- **[Testing](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/testing.md)** - Guía completa de testing y scripts automatizados
- **[Roles de Usuario](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/roles.md)** - Sistema de roles y permisos
- **[Almacenamiento](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/almacenamiento.md)** - Gestión de archivos y almacenamiento
- **[Ejemplos de Uso](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/ejemplos.md)** - Ejemplos prácticos de uso de la API

### 🔧 Configuración y Herramientas
- **[Configuración de pgAdmin](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/pgadmin.md)** - Configuración del administrador de base de datos
- **[Troubleshooting](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/troubleshooting.md)** - Solución de problemas comunes
- **[Colección de Postman](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/postman-collection.md)** - Colección completa para importar en Postman
- **[Validación Swagger](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/validate-swagger.md)** - Herramientas para validar documentación API
- **[Optimización Docker](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/docker-optimization.md)** - Mejores prácticas para contenedores

### 📋 Información Adicional
- **[Tipos de Notificaciones](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/notificaciones.md)** - Tipos y configuración de notificaciones
- **[Flujo de Notificaciones](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/flujo-notificaciones.md)** - Arquitectura y flujo de notificaciones en tiempo real
- **[WebSocket Testing Guide](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/websocket-testing-guide.md)** - Guía especializada para testing de WebSockets
- **[Refactoring Endpoints](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/endpoints-refactor.md)** - Historial y mejoras de endpoints
- **[Soporte](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/soporte.md)** - Información de soporte y contacto

## 📊 Estructura del Proyecto

```
chat-media-and-notifications-with-sockets/
├── auth-service/                 # Microservicio de autenticación
├── media-service/                # Microservicio de archivos multimedia
├── comments-service/             # Microservicio de comentarios
├── notifications-service/        # Microservicio de notificaciones
├── websocket-testing-app/        # Cliente de testing para WebSockets
├── test/                         # Scripts de testing automatizado
├── docs/                         # Documentación completa
├── postgres-init/                # Scripts de inicialización de BD
├── docker-compose.yml            # Configuración desarrollo
├── docker-compose.prod.yml       # Configuración producción
└── README.md                     # Este archivo
```

## 🐛 Logs y Debugging

Para revisar los logs de cada servicio:

```bash
# Ver logs de un servicio específico
docker-compose logs auth-service
docker-compose logs media-service
docker-compose logs comments-service
docker-compose logs notifications-service

# Ver logs en tiempo real
docker-compose logs -f auth-service

# Ver logs de todos los servicios
docker-compose logs

# Ver logs con timestamps
docker-compose logs -t auth-service
```

## 🎯 Trabajo Futuro

### 🚀 Próximos Desarrollos

1. ✅ **Servicio de Autenticación** (puerto 5900) - ¡Completado!
2. ✅ **Servicio de Contenido Multimedia** (puerto 5901) - ¡Completado!
3. ✅ **Servicio de Comentarios** (puerto 5902) - ¡Completado!
4. ✅ **Servicio de Notificaciones** (puerto 5903) - ¡Completado!
5. 🔄 **Servicio de Procesamiento** (puerto 5904) - En desarrollo
6. 📱 **Frontend Flutter** - Aplicación móvil multiplataforma

### 📱 Frontend en Flutter

Se planea desarrollar una aplicación frontend en **Flutter** que permitirá:

- ✨ **Interfaz moderna y responsive** para dispositivos móviles y web
- 🔐 **Autenticación completa** con gestión de sesiones
- 📁 **Upload de archivos multimedia** con preview y progreso
- 💬 **Sistema de comentarios** con threading y moderación
- 🔔 **Notificaciones push** en tiempo real
- 👥 **Gestión de usuarios** y roles
- 📊 **Dashboard administrativo** para moderadores y admins
- 🎨 **Temas claro/oscuro** personalizables

**Características técnicas del Frontend Flutter:**
- **Arquitectura**: Clean Architecture con BLoC pattern
- **State Management**: Flutter BLoC para gestión de estado
- **Networking**: Dio para HTTP requests y WebSocket
- **Local Storage**: Hive para almacenamiento local
- **Authentication**: JWT tokens con refresh automático
- **Push Notifications**: Firebase Cloud Messaging
- **Real-time**: WebSocket integration con auto-reconnect
- **File Upload**: Chunk upload con progress tracking
- **Responsive Design**: Adaptive UI para móvil, tablet y web

Este frontend proporcionará una experiencia visual completa para validar todas las funcionalidades del sistema de microservicios backend.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT con requisitos de atribución - ver el archivo [LICENSE.md](LICENSE.md) para más detalles. Si usas cualquier parte de este código, debes proporcionar atribución al autor original, Julio César León.

## ✒️ Autor

**Julio César León** - *Developer* - [GitHub Profile](https://github.com/cyberfanta)

**Enlace del Proyecto**: [Chat Media and Notifications with Sockets](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets)

---

### 📚 Recursos de Aprendizaje

Para más información sobre las tecnologías utilizadas:

- [NestJS Documentation](https://docs.nestjs.com/) - Documentación oficial de NestJS
- [TypeORM Documentation](https://typeorm.io/) - ORM para TypeScript
- [Redis Documentation](https://redis.io/docs/) - Documentación de Redis
- [Socket.IO Documentation](https://socket.io/docs/) - WebSockets en tiempo real

¡Disfruta explorando la aplicación! 🎉 