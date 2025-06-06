# 👥 Roles de Usuario

Sistema de roles y permisos para la Plataforma de Contenido Multimedia.

## 📋 Contenido

- [Descripción General](#descripción-general)
- [Tipos de Roles](#tipos-de-roles)
- [Permisos por Rol](#permisos-por-rol)
- [Gestión de Roles](#gestión-de-roles)
- [Implementación Técnica](#implementación-técnica)

## 🏗️ Descripción General

El sistema de roles proporciona control de acceso basado en roles (RBAC) con tres niveles principales:

- **USER**: Acceso básico a la plataforma
- **MODERATOR**: Capacidades de moderación de contenido
- **ADMIN**: Control completo del sistema

## 👤 Tipos de Roles

### USER (Por defecto)
**Rol asignado automáticamente al registrarse**

**Características:**
- ✅ Acceso básico a la plataforma
- ✅ Puede ver su propio perfil
- ✅ Subir archivos multimedia propios
- ✅ Crear y gestionar sus comentarios
- ✅ Recibir notificaciones
- ✅ Descargar contenido público

**Limitaciones:**
- ❌ No puede moderar contenido de otros
- ❌ No puede promover usuarios
- ❌ Acceso limitado a estadísticas

### MODERATOR
**Rol que puede ser asignado por administradores**

**Características:**
- ✅ **Todos los permisos de USER** +
- ✅ **Moderar comentarios** de cualquier usuario
- ✅ **Aprobar/rechazar comentarios** pendientes
- ✅ **Eliminar comentarios** inapropiados
- ✅ **Ver comentarios reportados**
- ✅ **Acceso a panel de moderación**
- ✅ **Estadísticas de moderación**

**Limitaciones:**
- ❌ No puede promover otros usuarios
- ❌ No puede acceder a configuración de sistema
- ❌ No puede gestionar otros moderadores

### ADMIN
**Rol con acceso completo al sistema**

**Características:**
- ✅ **Todos los permisos de MODERATOR** +
- ✅ **Promover usuarios** a MODERATOR
- ✅ **Gestión completa de usuarios**
- ✅ **Acceso a todas las estadísticas**
- ✅ **Configuración del sistema**
- ✅ **Acceso a logs y métricas**
- ✅ **Gestión de notificaciones del sistema**

## 🔐 Permisos por Rol

### Auth Service

| Endpoint | USER | MODERATOR | ADMIN |
|----------|------|-----------|-------|
| `GET /auth/profile` | ✅ Propio | ✅ Propio | ✅ Cualquiera |
| `POST /auth/refresh` | ✅ | ✅ | ✅ |
| `POST /auth/promote-to-moderator` | ❌ | ❌ | ✅ |

### Media Service

| Endpoint | USER | MODERATOR | ADMIN |
|----------|------|-----------|-------|
| `POST /media/init-upload` | ✅ | ✅ | ✅ |
| `GET /media` | ✅ Propio | ✅ Propio | ✅ Cualquiera |
| `DELETE /media/:id` | ✅ Propio | ✅ + Reportado | ✅ Cualquiera |
| `GET /media/storage/info` | ✅ Básico | ✅ Detallado | ✅ Completo |

### Comments Service

| Endpoint | USER | MODERATOR | ADMIN |
|----------|------|-----------|-------|
| `POST /comments/content/:id` | ✅ | ✅ | ✅ |
| `PUT /comments/:id` | ✅ Propio | ✅ Propio | ✅ Cualquiera |
| `DELETE /comments/:id` | ✅ Propio | ✅ + Moderación | ✅ Cualquiera |
| `PUT /comments/:id/moderate` | ❌ | ✅ | ✅ |
| `GET /comments/moderation/pending` | ❌ | ✅ | ✅ |

### Notifications Service

| Endpoint | USER | MODERATOR | ADMIN |
|----------|------|-----------|-------|
| `GET /notifications` | ✅ Propias | ✅ Propias | ✅ Cualquiera |
| `POST /notifications` | ✅ Propias | ✅ + Moderación | ✅ Sistema |
| `POST /notifications/cleanup` | ❌ | ✅ Limitado | ✅ Completo |

## ⚙️ Gestión de Roles

### Promoción de Usuario a Moderador

**Solo disponible para ADMIN**

```bash
curl -X POST http://localhost:5900/auth/promote-to-moderator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -d '{
    "userId": "uuid-del-usuario",
    "reason": "Usuario activo con buen historial de participación"
  }'
```

**Response:**
```json
{
  "message": "Usuario promovido a moderador exitosamente",
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "role": "MODERATOR",
    "promotedAt": "2024-01-01T00:00:00.000Z",
    "promotedBy": "admin-uuid"
  }
}
```

### Criterios para Promoción a Moderador

**Recomendaciones para promover usuarios:**

1. **Actividad Consistente**: Usuario activo durante al menos 30 días
2. **Comportamiento Ejemplar**: Sin reportes negativos o violaciones
3. **Contribuciones Positivas**: Comentarios constructivos y contenido de calidad
4. **Conocimiento de la Plataforma**: Familiaridad con las reglas y funcionamiento
5. **Disponibilidad**: Tiempo disponible para tareas de moderación

### Remoción de Roles

**Funcionalidad futura - No implementada actualmente**

```typescript
// Endpoint futuro para degradar roles
PUT /auth/users/:id/demote
{
  "reason": "Inactividad prolongada",
  "newRole": "USER"
}
```

## 🔧 Implementación Técnica

### Enum de Roles

```typescript
// auth-service/src/auth/enums/role.enum.ts
export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}
```

### Guards de Autorización

```typescript
// auth-service/src/auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Decorador de Roles

```typescript
// auth-service/src/auth/decorators/roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Uso en controladores
@Controller('comments')
export class CommentsController {
  
  @Put(':id/moderate')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async moderateComment(@Param('id') id: string, @Body() dto: ModerateCommentDto) {
    return this.commentsService.moderateComment(id, dto);
  }
}
```

### Validación en JWT

```typescript
// JWT payload incluye rol del usuario
interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
```

### Middleware de Verificación

```typescript
// Verificación automática de roles en todos los servicios
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    
    // Verificar que el rol sea válido
    if (!Object.values(Role).includes(user.role)) {
      throw new UnauthorizedException('Rol inválido');
    }
    
    return user;
  }
}
```

## 📊 Estadísticas por Rol

### Métricas de Usuarios

```sql
-- Distribución de roles
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Usuarios activos por rol (últimos 30 días)
SELECT role, COUNT(*) as active_users
FROM users 
WHERE last_login > NOW() - INTERVAL '30 days'
GROUP BY role;

-- Moderadores más activos
SELECT u.email, COUNT(ca.id) as moderation_actions
FROM users u
LEFT JOIN comment_actions ca ON u.id = ca.moderator_id
WHERE u.role = 'MODERATOR'
GROUP BY u.id, u.email
ORDER BY moderation_actions DESC;
```

### Dashboard de Roles (Futuro)

**Métricas propuestas para implementar:**

- Distribución de roles en tiempo real
- Actividad de moderación por usuario
- Tiempo promedio de respuesta en moderación
- Reportes de eficiencia por moderador
- Tendencias de promociones/degradaciones

## 🛡️ Seguridad y Mejores Prácticas

### Principio de Menor Privilegio
- Los usuarios reciben el mínimo nivel de acceso necesario
- Los permisos se validan en cada request
- Los roles se verifican tanto en frontend como backend

### Auditoria de Acciones
```typescript
// Log de acciones sensibles
@Injectable()
export class AuditLogger {
  logRoleChange(userId: string, oldRole: Role, newRole: Role, adminId: string) {
    this.logger.log({
      action: 'ROLE_CHANGE',
      userId,
      oldRole,
      newRole,
      performedBy: adminId,
      timestamp: new Date()
    });
  }

  logModerationAction(moderatorId: string, commentId: string, action: string) {
    this.logger.log({
      action: 'MODERATION_ACTION',
      moderatorId,
      commentId,
      moderationAction: action,
      timestamp: new Date()
    });
  }
}
```

### Rotación de Privilegios
- **Revisión periódica** de roles asignados
- **Desactivación automática** por inactividad
- **Alertas** para acciones administrativas

## 🚀 Roadmap de Mejoras

### Características Futuras

1. **Roles Customizables**
   - Creación de roles personalizados
   - Permisos granulares por funcionalidad
   - Roles temporales con expiración

2. **Jerarquía de Roles**
   - Subroles dentro de MODERATOR
   - Roles por categoría de contenido
   - Delegación de permisos

3. **Sistema de Reportes**
   - Dashboard de actividad por rol
   - Métricas de moderación
   - Reportes de uso del sistema

4. **Integración con IAM**
   - Single Sign-On (SSO)
   - Integración con Active Directory
   - OAuth2 con roles externos

El sistema de roles proporciona una base sólida y escalable para la gestión de permisos en la plataforma de contenido multimedia.
