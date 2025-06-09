# ⚙️ Decisiones Técnicas Importantes

## 🏗️ Arquitectura

### Microservicios vs Monolito
- **Decisión**: Arquitectura de microservicios
- **Razón**: Escalabilidad independiente, tecnologías específicas por dominio, aislamiento de fallos
- **Impacto**: Mayor complejidad pero mejor mantenibilidad a largo plazo

### Database per Service
- **Decisión**: Cada microservicio tiene su propia base de datos PostgreSQL
- **Razón**: Independencia de datos, evitar acoplamiento entre servicios
- **Implementación**: 
  - Auth DB: Puerto 5432
  - Media DB: Puerto 5433  
  - Comments DB: Puerto 5434
  - Notifications DB: Puerto 5435

### Event-Driven Communication
- **Decisión**: Redis Pub/Sub para comunicación asíncrona entre servicios
- **Razón**: Desacoplamiento, procesamiento asíncrono, notificaciones automáticas
- **Patrón**: Servicios publican eventos, Notifications Service los consume

## 🔐 Autenticación y Autorización

### JWT Strategy
- **Decisión**: JWT con Passport.js
- **Razón**: Stateless, escalable, estándar de la industria
- **Configuración**: Tokens con expiración, refresh automático

### Sistema de Roles
- **Decisión**: Roles jerárquicos (USER < MODERATOR < ADMIN)
- **Razón**: Control granular de permisos, escalabilidad de moderación
- **Implementación**: Enum con niveles numéricos para comparación

### Promoción de Usuarios
- **Decisión**: Solo ADMIN puede promover a MODERATOR
- **Razón**: Control estricto de permisos administrativos
- **Limitación**: No downgrade automático (decisión de seguridad)

## 📁 Gestión de Archivos

### Upload Strategy
- **Decisión**: Multipart upload con chunks
- **Razón**: Soporte para archivos grandes, mejor UX, recuperación de errores
- **Implementación**: Chunks temporales + ensamblado final

### File Storage
- **Decisión**: Almacenamiento local con Docker volumes
- **Razón**: Simplicidad para desarrollo, fácil migración a cloud storage
- **Estructura**: `/uploads/` con subdirectorios por tipo

### File Validation
- **Decisión**: Validación por MIME type y extensión
- **Razón**: Seguridad doble, prevención de archivos maliciosos
- **Tipos soportados**: Imágenes, videos, audios específicos

## 💬 Sistema de Comentarios

### Threading Model
- **Decisión**: Comentarios jerárquicos con parent_id
- **Razón**: Flexibilidad para hilos de conversación
- **Limitación**: Sin límite de profundidad (a evaluar performance)

### Moderación
- **Decisión**: Solo MODERATOR+ puede moderar comentarios
- **Razón**: Control de calidad del contenido, prevención de spam
- **Alcance**: Moderators pueden moderar cualquier comentario

## 🔔 Notificaciones

### Real-time Strategy
- **Decisión**: WebSockets con Socket.IO
- **Razón**: Notificaciones instantáneas, mejor UX
- **Fallback**: Polling para clientes que no soporten WebSocket

### Cache Strategy
- **Decisión**: Redis cache para notificaciones frecuentes
- **Razón**: Reducir carga en BD, mejor performance
- **TTL**: Configurado por tipo de notificación

### Rate Limiting
- **Decisión**: Rate limiting por usuario y tipo
- **Razón**: Prevenir spam, proteger recursos del servidor
- **Implementación**: Redis con sliding window

## 🗄️ Base de Datos

### ORM Choice
- **Decisión**: TypeORM
- **Razón**: Integración nativa con NestJS, TypeScript support, migrations automáticas
- **Configuración**: Entities separadas por servicio

### Connection Pooling
- **Decisión**: Pool de conexiones por defecto de TypeORM
- **Razón**: Mejor performance, manejo eficiente de recursos
- **Configuración**: Límites apropiados para desarrollo

## 🐳 Containerización

### Docker Strategy
- **Decisión**: Multi-container con Docker Compose
- **Razón**: Aislamiento de servicios, fácil setup de desarrollo
- **Configuración**: Desarrollo y producción separados

### Health Checks
- **Decisión**: Health endpoints en todos los servicios
- **Razón**: Monitoreo de estado, debugging más fácil
- **Implementación**: `/health` endpoint estándar

## 📚 Documentación

### API Documentation
- **Decisión**: Swagger/OpenAPI automático
- **Razón**: Documentación always up-to-date, testing integrado
- **URL Pattern**: `http://localhost:590X/api/docs`

### Code Documentation
- **Decisión**: JSDoc comments para funciones complejas
- **Razón**: Mejor mantenibilidad, onboarding más fácil
- **Estándar**: Documenting interfaces y business logic

## 🧪 Testing

### Testing Strategy
- **Decisión**: Jest para unit tests, scripts para integration testing
- **Razón**: Estándar de NestJS, buen ecosistema, fácil setup
- **Cobertura**: Focus en business logic y edge cases

### E2E Testing
- **Decisión**: Scripts bash automatizados
- **Razón**: Testing real de APIs, validación end-to-end
- **Scope**: Flujos críticos de usuario

---

## 📝 Decisiones Pendientes

### Temas a Resolver
1. **Límite de profundidad en comentarios** - Performance vs UX
2. **Cloud storage migration** - AWS S3 vs Azure Blob vs Google Cloud
3. **Monitoring y observability** - Prometheus/Grafana vs ELK Stack
4. **Database sharding** - Para escalabilidad futura
5. **API versioning** - Estrategia para backward compatibility

### Evaluaciones Futuras
- **Message Queues**: Considerar RabbitMQ vs Apache Kafka para high-throughput
- **Caching Layer**: Evaluar distributed cache para multi-instance deployment
- **Security**: Implementar OAuth2/OIDC providers
- **Performance**: APM tools para monitoring de performance 