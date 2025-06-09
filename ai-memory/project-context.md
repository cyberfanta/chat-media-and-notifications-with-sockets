# 🎯 Contexto del Proyecto

## 📊 Información General
- **Nombre**: Plataforma de Contenido Multimedia - Microservicios
- **Arquitectura**: Microservicios con NestJS
- **Propósito**: Sistema completo de gestión de contenido multimedia con notificaciones en tiempo real
- **Estado**: En desarrollo activo
- **Autor**: Julio César León

## 🏗️ Arquitectura General

### Microservicios Implementados
1. **Auth Service** (Puerto 5900)
   - Autenticación JWT
   - Sistema de roles (USER, MODERATOR, ADMIN)
   - Promoción de usuarios

2. **Media Service** (Puerto 5901)
   - Upload multipart de archivos
   - Soporte multimedia completo
   - Gestión de chunks para archivos grandes

3. **Comments Service** (Puerto 5902)
   - Sistema de comentarios jerárquico
   - Moderación por roles
   - Paginación y filtros

4. **Notifications Service** (Puerto 5903)
   - WebSockets en tiempo real
   - Sistema Pub/Sub con Redis
   - Cache inteligente
   - Rate limiting

### Stack Tecnológico
- **Framework**: NestJS con TypeScript
- **Base de Datos**: PostgreSQL 15 (una BD por servicio)
- **Cache**: Redis 7 (sessions y pub/sub)
- **ORM**: TypeORM
- **Autenticación**: JWT + Passport
- **WebSockets**: Socket.IO
- **Contenedores**: Docker + Docker Compose
- **Documentación**: Swagger/OpenAPI

### Patrones Arquitecturales
- **Microservicios**: Cada servicio es independiente
- **Database per Service**: Cada microservicio tiene su propia BD
- **Event-Driven**: Comunicación asíncrona con Redis Pub/Sub
- **API Gateway Pattern**: Cada servicio expone su propia API
- **CQRS**: Separación de comandos y consultas donde aplica

## 🔌 Comunicación Entre Servicios

### HTTP/REST
- Comunicación síncrona para operaciones críticas
- Validación de tokens JWT entre servicios
- Documentación Swagger automática

### Event-Driven (Redis Pub/Sub)
- Notificaciones automáticas entre servicios
- Eventos de usuario, media y comentarios
- Procesamiento asíncrono de notificaciones

### WebSocket
- Notificaciones en tiempo real
- Cliente de testing incluido (puerto 8080)
- Auto-reconexión y manejo de errores

## 📦 Estructura de Puertos

| Servicio | Puerto | Base de Datos | Redis |
|----------|--------|---------------|-------|
| Auth | 5900 | 5432 | 6379 |
| Media | 5901 | 5433 | - |
| Comments | 5902 | 5434 | - |
| Notifications | 5903 | 5435 | 6380 |
| WebSocket Testing | 8080 | - | - |
| pgAdmin | 5050 | - | - |

## 🎯 Características Clave
- Sistema de roles granular
- Upload de archivos con chunks
- Comentarios con moderación
- Notificaciones en tiempo real
- Cache inteligente con Redis
- Rate limiting anti-spam
- Documentación automática
- Testing automatizado
- Docker development/production

## 🚀 Estado Actual
- ✅ Todos los microservicios funcionales
- ✅ Documentación completa
- ✅ Testing automatizado
- ✅ Docker environment
- 🔄 Frontend Flutter (planificado)
- 🔄 Servicio de Procesamiento (en desarrollo) 