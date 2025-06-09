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

### 🎨 Processing Service
- ✅ Procesamiento automático de archivos multimedia
- ✅ Simulación de compresión y generación de thumbnails
- ✅ Sistema de cola de trabajos con progreso en tiempo real
- ✅ 6 tipos de notificaciones de procesamiento
- ✅ Gestión de estados y reintentos automáticos
- ✅ API REST completa con Swagger

### 🧹 Cleanup Service
- ✅ Limpieza automática programada cada 6 horas
- ✅ Eliminación de chunks huérfanos y uploads pendientes
- ✅ Monitoreo de almacenamiento y alertas
- ✅ Logs detallados de operaciones de limpieza
- ✅ API para ejecutar limpieza manual
- ✅ Estadísticas de espacio liberado

### 🖥️ Monitoring Dashboard
- ✅ Dashboard web moderno con Bootstrap 5
- ✅ Gráficos interactivos con Chart.js
- ✅ Monitoreo en tiempo real con WebSockets
- ✅ Estadísticas de cola de procesamiento
- ✅ Stream de notificaciones en vivo
- ✅ Interfaz independiente sin autenticación

### 🛠️ Características Generales
- ✅ Documentación Swagger automática
- ✅ Validaciones con class-validator
- ✅ Tests unitarios con Jest
- ✅ Docker y Docker Compose
- ✅ Arquitectura de microservicios

## 🏗️ Arquitectura del Sistema

```mermaid
graph TB
    subgraph "🌐 Cliente"
        WEB[Cliente Web]
        MOBILE[Cliente Móvil]
        POSTMAN[Postman/API]
    end
    
    subgraph "🚪 Gateway/Load Balancer"
        LB[Load Balancer<br/>Puerto 80/443]
    end
    
    subgraph "🏗️ Microservicios Backend"
        AUTH[🔐 Auth Service<br/>Puerto 5900<br/>JWT + Roles]
        MEDIA[📁 Media Service<br/>Puerto 5901<br/>Upload + Storage]
        COMMENTS[💬 Comments Service<br/>Puerto 5902<br/>Threading + Moderation]
        NOTIFY[🔔 Notifications Service<br/>Puerto 5903<br/>WebSocket + Real-time]
    end
    
    subgraph "🗄️ Bases de Datos"
        PGAUTH[(PostgreSQL Auth<br/>Puerto 5432)]
        PGMEDIA[(PostgreSQL Media<br/>Puerto 5433)]
        PGCOMMENTS[(PostgreSQL Comments<br/>Puerto 5434)]
        PGNOTIFY[(PostgreSQL Notifications<br/>Puerto 5435)]
    end
    
    subgraph "⚡ Cache y Mensajería"
        REDIS1[(Redis Auth<br/>Puerto 6379<br/>Sessions + Cache)]
        REDIS2[(Redis Notifications<br/>Puerto 6380<br/>Pub/Sub + Queue)]
    end
    
    subgraph "🛠️ Herramientas de Desarrollo"
        PGADMIN[pgAdmin<br/>Puerto 5050]
        SWAGGER[Swagger Docs<br/>Puertos 590X/api/docs]
        WSTEST[WebSocket Test Client<br/>Puerto 8080]
    end
    
    subgraph "💾 Almacenamiento"
        STORAGE[Local Storage<br/>./uploads/]
        CHUNKS[Chunks Temp<br/>./uploads/chunks/]
    end
    
    %% Conexiones principales
    WEB --> LB
    MOBILE --> LB
    POSTMAN --> LB
    
    LB --> AUTH
    LB --> MEDIA
    LB --> COMMENTS
    LB --> NOTIFY
    
    %% Conexiones a bases de datos
    AUTH --> PGAUTH
    MEDIA --> PGMEDIA
    COMMENTS --> PGCOMMENTS
    NOTIFY --> PGNOTIFY
    
    %% Conexiones a Redis
    AUTH --> REDIS1
    NOTIFY --> REDIS1
    NOTIFY --> REDIS2
    
    %% Conexiones entre servicios
    MEDIA --> AUTH
    COMMENTS --> AUTH
    NOTIFY --> AUTH
    
    %% Pub/Sub para notificaciones automáticas
    AUTH -.->|Publish Events| REDIS2
    MEDIA -.->|Publish Events| REDIS2
    COMMENTS -.->|Publish Events| REDIS2
    REDIS2 -.->|Subscribe Events| NOTIFY
    
    %% WebSocket en tiempo real
    WEB -.->|WebSocket| NOTIFY
    MOBILE -.->|WebSocket| NOTIFY
    
    %% Almacenamiento
    MEDIA --> STORAGE
    MEDIA --> CHUNKS
    
    %% Herramientas
    PGADMIN --> PGAUTH
    PGADMIN --> PGMEDIA
    PGADMIN --> PGCOMMENTS
    PGADMIN --> PGNOTIFY
    
    %% Estilos
    classDef service fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef database fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef cache fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef client fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef tool fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    
    class AUTH,MEDIA,COMMENTS,NOTIFY service
    class PGAUTH,PGMEDIA,PGCOMMENTS,PGNOTIFY database
    class REDIS1,REDIS2 cache
    class WEB,MOBILE,POSTMAN client
    class PGADMIN,SWAGGER,WSTEST tool
```

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

### 3. Ejecutar Solo el Sistema de Procesamiento
```bash
# En Windows - Ejecutar script automatizado
.\start-processing-system.bat

# En Linux/Mac - Ejecutar servicios manualmente
docker-compose up -d postgres-processing postgres-cleanup redis-notifications
docker-compose up -d processing-service cleanup-service monitoring-dashboard
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
```

## 🌐 Servicios y Puertos

| Servicio | Puerto | URL | Documentación |
|----------|--------|-----|---------------|
| **Auth Service** | 5900 | http://localhost:5900 | [Swagger](http://localhost:5900/api/docs) |
| **Media Service** | 5901 | http://localhost:5901 | [Swagger](http://localhost:5901/api/docs) |
| **Comments Service** | 5902 | http://localhost:5902 | [Swagger](http://localhost:5902/api/docs) |
| **Notifications Service** | 5903 | http://localhost:5903 | [Swagger](http://localhost:5903/api/docs) |
| **Processing Service** | 5904 | http://localhost:5904 | [Swagger](http://localhost:5904/api/docs) |
| **Cleanup Service** | 5905 | http://localhost:5905 | [Swagger](http://localhost:5905/api/docs) |
| **Monitoring Dashboard** | 5906 | http://localhost:5906/dashboard | [Swagger](http://localhost:5906/api/docs) |
| **WebSocket Testing App** | 8080 | http://localhost:8080 | Cliente de pruebas |
| **PostgreSQL Auth** | 5432 | localhost:5432 | Base de datos autenticación |
| **PostgreSQL Media** | 5433 | localhost:5433 | Base de datos multimedia |
| **PostgreSQL Comments** | 5434 | localhost:5434 | Base de datos comentarios |
| **PostgreSQL Notifications** | 5435 | localhost:5435 | Base de datos notificaciones |
| **PostgreSQL Processing** | 5436 | localhost:5436 | Base de datos procesamiento |
| **PostgreSQL Cleanup** | 5437 | localhost:5437 | Base de datos cleanup |
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
- **[Índice de Diagramas](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets/blob/main/docs/diagramas.md)** - Todos los diagramas visuales del sistema

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
5. ✅ **Servicio de Procesamiento** (puerto 5904) - ¡Completado!
6. ✅ **Servicio de Cleanup** (puerto 5905) - ¡Completado!
7. ✅ **Dashboard de Monitoreo** (puerto 5906) - ¡Completado!
6. 📱 **Frontend Flutter** - Aplicación móvil multiplataforma

## ✅ Estado Actual de los Servicios

### 🟢 Servicios Funcionando Correctamente
- ✅ **Auth Service** (puerto 5900) - Healthy
- ✅ **Comments Service** (puerto 5902) - Healthy  
- ✅ **Processing Service** (puerto 5904) - Healthy
- ✅ **Cleanup Service** (puerto 5905) - Healthy
- ✅ **Monitoring Dashboard** (puerto 5906) - Healthy

### 🟡 Servicios con Health Check Pendiente
- 🔄 **Media Service** (puerto 5901) - Funcionando pero health check en proceso
- 🔄 **Notifications Service** (puerto 5903) - Funcionando pero health check en proceso

**Nota**: Los servicios Media y Notifications responden correctamente a las peticiones HTTP (StatusCode: 200), pero los health checks de Docker pueden tardar en actualizarse. Ambos servicios están completamente funcionales.

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

**Julio César León** - *Senior Fullstack Developer* - [GitHub Profile](https://github.com/cyberfanta)

**Enlace del Proyecto**: [Chat Media and Notifications with Sockets](https://github.com/cyberfanta/chat-media-and-notifications-with-sockets)

---

### 📚 Recursos de Aprendizaje

Para más información sobre las tecnologías utilizadas:

- [NestJS Documentation](https://docs.nestjs.com/) - Documentación oficial de NestJS
- [TypeORM Documentation](https://typeorm.io/) - ORM para TypeScript
- [Redis Documentation](https://redis.io/docs/) - Documentación de Redis
- [Socket.IO Documentation](https://socket.io/docs/) - WebSockets en tiempo real

¡Disfruta explorando la aplicación! 🎉 