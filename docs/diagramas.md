# 📊 Índice de Diagramas - Arquitectura de Microservicios

Esta página contiene enlaces a todos los diagramas visuales de la arquitectura y flujos del sistema de microservicios.

## 📋 Contenido

- [Arquitectura General](#arquitectura-general)
- [Flujos de Procesos](#flujos-de-procesos)
- [Arquitecturas Específicas](#arquitecturas-específicas)
- [Testing y Desarrollo](#testing-y-desarrollo)

## 🏗️ Arquitectura General

### 🌐 Diagrama Principal del Sistema
**Ubicación**: [README.md - Arquitectura del Sistema](../README.md#🏗️-arquitectura-del-sistema)

Muestra la arquitectura completa de microservicios con:
- 4 microservicios principales (Auth, Media, Comments, Notifications)
- Bases de datos PostgreSQL independientes
- Sistema Redis para cache y pub/sub
- Herramientas de desarrollo (pgAdmin, Swagger, WebSocket Test Client)
- Conexiones entre servicios y flujos de datos

## 🔄 Flujos de Procesos

### 📨 Flujo de Notificaciones en Tiempo Real
**Ubicación**: [docs/flujo-notificaciones.md](flujo-notificaciones.md#🏗️-arquitectura-del-sistema-de-notificaciones)

Diagrama de secuencia que muestra:
- Conexión inicial de WebSocket con autenticación JWT
- Publicación de eventos entre microservicios
- Procesamiento de notificaciones en tiempo real
- Gestión de usuarios conectados y desconectados
- Marcado de notificaciones como leídas

### 🔐 Flujo de Autenticación y JWT
**Ubicación**: [docs/credenciales.md](credenciales.md#🔄-diagrama-de-autenticación)

Diagrama de secuencia que ilustra:
- Proceso completo de registro y login
- Generación y validación de tokens JWT
- Uso de tokens en diferentes microservicios
- Renovación automática de tokens
- Gestión de roles y permisos

### 📁 Upload Multipart de Archivos
**Ubicación**: [docs/almacenamiento.md](almacenamiento.md#🔄-diagrama-de-upload-multipart)

Diagrama de secuencia que detalla:
- División de archivos grandes en chunks
- Proceso de upload paralelo de chunks
- Validación y concatenación de archivos
- Manejo de errores y reintentos
- Notificaciones de éxito/fallo

## 🏗️ Arquitecturas Específicas

### 🔔 Arquitectura WebSocket
**Ubicación**: [docs/notificaciones.md](notificaciones.md#🏗️-diagrama-de-arquitectura-websocket)

Diagrama de arquitectura que muestra:
- Clientes conectados (Web, Móvil, Testing)
- Gateway Socket.IO con autenticación
- Salas de usuario para notificaciones personalizadas
- Event handlers y service layer
- Integración con Redis y PostgreSQL
- Pub/Sub entre microservicios

## 🧪 Testing y Desarrollo

### 📊 Ecosistema de Testing
**Ubicación**: [docs/websocket-testing-guide.md](websocket-testing-guide.md#🏗️-diagrama-de-testing)

Diagrama de arquitectura que incluye:
- Tests unitarios con Jest por servicio
- Tests de integración automatizados
- Cliente visual de testing WebSocket
- Herramientas API (Postman, Swagger, cURL)
- Entorno Docker para testing
- Conexiones entre herramientas y servicios

## 🎯 Cómo Usar los Diagramas

### Para Desarrolladores
1. **Arquitectura General**: Entender la estructura completa del sistema
2. **Flujos de Procesos**: Comprender cómo interactúan los servicios
3. **Arquitecturas Específicas**: Profundizar en componentes particulares

### Para Testing
1. **Diagrama de Testing**: Identificar todas las herramientas disponibles
2. **Flujo de Notificaciones**: Entender qué probar en WebSockets
3. **Flujo de Autenticación**: Validar tokens y permisos

### Para Documentación
1. **Flujo de Upload**: Explicar el proceso a usuarios finales
2. **Arquitectura WebSocket**: Mostrar capacidades en tiempo real
3. **Arquitectura General**: Presentar el proyecto a stakeholders

## 🔗 Enlaces Rápidos

| Diagrama | Archivo | Sección |
|----------|---------|---------|
| **Arquitectura Principal** | [README.md](../README.md) | Arquitectura del Sistema |
| **Flujo Notificaciones** | [flujo-notificaciones.md](flujo-notificaciones.md) | Arquitectura del Sistema |
| **Autenticación JWT** | [credenciales.md](credenciales.md) | Diagrama de Autenticación |
| **Upload Multipart** | [almacenamiento.md](almacenamiento.md) | Diagrama de Upload |
| **WebSocket Architecture** | [notificaciones.md](notificaciones.md) | Diagrama de Arquitectura |
| **Testing Ecosystem** | [websocket-testing-guide.md](websocket-testing-guide.md) | Diagrama de Testing |

## 📝 Notas Técnicas

### Formato de Diagramas
- **Herramienta**: Mermaid.js
- **Tipos**: Sequence diagrams, Graph diagrams
- **Estilos**: Colores diferenciados por tipo de componente
- **Compatibilidad**: GitHub, GitLab, VS Code, navegadores modernos

### Actualización de Diagramas
- Los diagramas se actualizan junto con cambios en la arquitectura
- Cada diagrama incluye información actualizada de puertos y servicios
- Los flujos reflejan la implementación actual del sistema

---

**💡 Tip**: Estos diagramas son interactivos en muchas plataformas. Puedes hacer zoom y explorar los detalles de cada componente.

**🔄 Última actualización**: Enero 2025 - Todos los diagramas reflejan el estado actual del sistema de microservicios. 