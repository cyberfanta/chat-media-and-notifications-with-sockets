# 🔧 Configuración de pgAdmin

Guía completa para configurar y usar pgAdmin como administrador de bases de datos PostgreSQL.

## 📋 Contenido

- [Acceso a pgAdmin](#acceso-a-pgadmin)
- [Configuración Inicial](#configuración-inicial)
- [Configurar Servidores](#configurar-servidores)
- [Gestión de Bases de Datos](#gestión-de-bases-de-datos)
- [Consultas Útiles](#consultas-útiles)
- [Troubleshooting](#troubleshooting)

## 🌐 Acceso a pgAdmin

### Credenciales de Acceso
- **URL**: http://localhost:5050
- **Email**: `admin@admin.com`
- **Contraseña**: `admin123`

### Primera Conexión
1. Abre tu navegador y ve a http://localhost:5050
2. Ingresa las credenciales de acceso
3. Haz clic en "Login"

## ⚙️ Configuración Inicial

### Cambiar Idioma (Opcional)
1. Ve a **File** → **Preferences**
2. En **User Language**, selecciona tu idioma preferido
3. Haz clic en **Save** y recarga la página

### Configurar Tema (Opcional)
1. Ve a **File** → **Preferences**
2. En **Theme**, selecciona entre:
   - **Standard** (claro)
   - **Dark** (oscuro)
3. Haz clic en **Save**

## 🗄️ Configurar Servidores

### ⚠️ Importante: Usar Nombres de Contenedor

**NUNCA uses `localhost` para conectarte a las bases de datos desde pgAdmin**. Usa los nombres de los contenedores Docker.

### 1. Auth Database

#### Agregar Servidor
1. Clic derecho en **Servers** → **Create** → **Server...**
2. En la pestaña **General**:
   - **Name**: `Auth Database`
   - **Server Group**: `Servers`

3. En la pestaña **Connection**:
   - **Host name/address**: `postgres-auth` ⚠️ **¡NO usar localhost!**
   - **Port**: `5432`
   - **Maintenance database**: `auth_db`
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Save password**: ✅ (marcar)

4. Haz clic en **Save**

### 2. Media Database

#### Agregar Servidor
1. Clic derecho en **Servers** → **Create** → **Server...**
2. En la pestaña **General**:
   - **Name**: `Media Database`

3. En la pestaña **Connection**:
   - **Host name/address**: `postgres-media`
   - **Port**: `5432`
   - **Maintenance database**: `media_db`
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Save password**: ✅

4. Haz clic en **Save**

### 3. Comments Database

#### Agregar Servidor
1. Clic derecho en **Servers** → **Create** → **Server...**
2. En la pestaña **General**:
   - **Name**: `Comments Database`

3. En la pestaña **Connection**:
   - **Host name/address**: `postgres-comments`
   - **Port**: `5432`
   - **Maintenance database**: `comments_db`
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Save password**: ✅

4. Haz clic en **Save**

### 4. Notifications Database

#### Agregar Servidor
1. Clic derecho en **Servers** → **Create** → **Server...**
2. En la pestaña **General**:
   - **Name**: `Notifications Database`

3. En la pestaña **Connection**:
   - **Host name/address**: `postgres-notifications`
   - **Port**: `5432`
   - **Maintenance database**: `notifications_db`
   - **Username**: `admin`
   - **Password**: `admin123`
   - **Save password**: ✅

4. Haz clic en **Save**

## 📊 Gestión de Bases de Datos

### Explorar Estructura de Tablas

#### Auth Database
```
Auth Database
└── Databases
    └── auth_db
        └── Schemas
            └── public
                └── Tables
                    └── users
                        ├── Columns
                        ├── Constraints
                        └── Indexes
```

**Tabla `users`:**
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR)
- `firstName` (VARCHAR)
- `lastName` (VARCHAR)
- `role` (ENUM: USER, MODERATOR, ADMIN)
- `isActive` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

#### Media Database
```
Media Database
└── Databases
    └── media_db
        └── Schemas
            └── public
                └── Tables
                    └── media
                        ├── Columns
                        ├── Constraints
                        └── Indexes
```

**Tabla `media`:**
- `id` (UUID, Primary Key)
- `originalName` (VARCHAR)
- `fileName` (VARCHAR)
- `mimeType` (VARCHAR)
- `type` (ENUM: image, video, audio, document)
- `size` (BIGINT)
- `status` (ENUM: uploading, completed, failed)
- `userId` (UUID, Foreign Key)
- `totalChunks` (INTEGER)
- `uploadedChunks` (INTEGER)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

#### Comments Database
```
Comments Database
└── Databases
    └── comments_db
        └── Schemas
            └── public
                └── Tables
                    └── comments
                        ├── Columns
                        ├── Constraints
                        └── Indexes
```

**Tabla `comments`:**
- `id` (UUID, Primary Key)
- `content` (TEXT)
- `contentId` (VARCHAR)
- `authorId` (UUID)
- `parentId` (UUID, Nullable)
- `status` (ENUM: published, pending, moderated, deleted)
- `moderatedBy` (UUID, Nullable)
- `moderatedAt` (TIMESTAMP, Nullable)
- `moderationReason` (TEXT, Nullable)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

#### Notifications Database
```
Notifications Database
└── Databases
    └── notifications_db
        └── Schemas
            └── public
                └── Tables
                    └── notifications
                        ├── Columns
                        ├── Constraints
                        └── Indexes
```

**Tabla `notifications`:**
- `id` (UUID, Primary Key)
- `type` (VARCHAR)
- `title` (VARCHAR)
- `message` (TEXT)
- `userId` (UUID)
- `isRead` (BOOLEAN)
- `priority` (ENUM: low, medium, high)
- `metadata` (JSONB, Nullable)
- `expiresAt` (TIMESTAMP, Nullable)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Ejecutar Consultas

#### Abrir Query Tool
1. Selecciona una base de datos
2. Haz clic en **Tools** → **Query Tool**
3. O usa el ícono de SQL en la barra de herramientas

#### Ejemplo de Consultas
```sql
-- Ver todos los usuarios
SELECT id, email, "firstName", "lastName", role, "isActive", "createdAt" 
FROM users 
ORDER BY "createdAt" DESC;

-- Ver archivos multimedia por usuario
SELECT m.id, m."originalName", m."mimeType", m.type, m.size, m.status, m."createdAt"
FROM media m
WHERE m."userId" = 'USER_UUID_HERE'
ORDER BY m."createdAt" DESC;

-- Ver comentarios con información del autor
SELECT c.id, c.content, c."contentId", c.status, c."createdAt"
FROM comments c
WHERE c."contentId" = 'CONTENT_ID_HERE'
ORDER BY c."createdAt" DESC;

-- Ver notificaciones no leídas
SELECT id, type, title, message, priority, "createdAt"
FROM notifications
WHERE "userId" = 'USER_UUID_HERE' AND "isRead" = false
ORDER BY "createdAt" DESC;
```

## 🔍 Consultas Útiles

### Estadísticas Generales

#### Usuarios por Rol
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;
```

#### Archivos por Tipo
```sql
SELECT type, COUNT(*) as count, 
       ROUND(AVG(size)/1024/1024, 2) as avg_size_mb,
       ROUND(SUM(size)/1024/1024, 2) as total_size_mb
FROM media
WHERE status = 'completed'
GROUP BY type
ORDER BY count DESC;
```

#### Comentarios por Estado
```sql
SELECT status, COUNT(*) as count
FROM comments
GROUP BY status
ORDER BY count DESC;
```

#### Notificaciones por Tipo
```sql
SELECT type, COUNT(*) as count,
       COUNT(CASE WHEN "isRead" = false THEN 1 END) as unread_count
FROM notifications
GROUP BY type
ORDER BY count DESC;
```

### Consultas de Mantenimiento

#### Limpiar Notificaciones Expiradas
```sql
DELETE FROM notifications
WHERE "expiresAt" IS NOT NULL AND "expiresAt" < NOW();
```

#### Limpiar Chunks Antiguos (Media)
```sql
UPDATE media
SET status = 'failed'
WHERE status = 'uploading' 
  AND "createdAt" < NOW() - INTERVAL '24 hours';
```

#### Ver Usuarios Inactivos
```sql
SELECT id, email, "firstName", "lastName", "createdAt"
FROM users
WHERE "isActive" = false
ORDER BY "createdAt" DESC;
```

### Consultas de Análisis

#### Top Usuarios por Uploads
```sql
SELECT u.email, u."firstName", u."lastName", 
       COUNT(m.id) as total_uploads,
       ROUND(SUM(m.size)/1024/1024, 2) as total_mb
FROM users u
LEFT JOIN media m ON u.id = m."userId" AND m.status = 'completed'
GROUP BY u.id, u.email, u."firstName", u."lastName"
HAVING COUNT(m.id) > 0
ORDER BY total_uploads DESC
LIMIT 10;
```

#### Actividad de Comentarios por Día
```sql
SELECT DATE(c."createdAt") as date,
       COUNT(*) as comments_count
FROM comments c
WHERE c."createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY DATE(c."createdAt")
ORDER BY date DESC;
```

#### Notificaciones por Usuario
```sql
SELECT u.email, u."firstName", u."lastName",
       COUNT(n.id) as total_notifications,
       COUNT(CASE WHEN n."isRead" = false THEN 1 END) as unread_count
FROM users u
LEFT JOIN notifications n ON u.id = n."userId"
GROUP BY u.id, u.email, u."firstName", u."lastName"
HAVING COUNT(n.id) > 0
ORDER BY unread_count DESC, total_notifications DESC;
```

## 🛠️ Herramientas Útiles

### Backup de Base de Datos
1. Clic derecho en la base de datos
2. **Backup...**
3. Configurar opciones:
   - **Format**: Custom
   - **Filename**: `backup_auth_db_20240115.backup`
   - **Encoding**: UTF8
4. Haz clic en **Backup**

### Restore de Base de Datos
1. Clic derecho en **Databases**
2. **Create** → **Database...**
3. Crear nueva base de datos
4. Clic derecho en la nueva base de datos
5. **Restore...**
6. Seleccionar archivo de backup
7. Haz clic en **Restore**

### Import/Export Data
1. Clic derecho en una tabla
2. **Import/Export Data...**
3. Configurar opciones según necesidad
4. Ejecutar operación

### Ver Logs de Actividad
1. Ve a **Tools** → **Server Logs**
2. Selecciona el servidor
3. Revisa logs de conexiones y consultas

## 🔧 Troubleshooting

### Error: "Could not connect to server"

**Síntomas:**
```
could not connect to server: Connection refused
```

**Soluciones:**
1. **Verificar que uses el nombre del contenedor correcto**:
   - ✅ Correcto: `postgres-auth`
   - ❌ Incorrecto: `localhost`

2. **Verificar que el contenedor esté ejecutándose**:
   ```bash
   docker-compose ps postgres-auth
   ```

3. **Verificar logs del contenedor**:
   ```bash
   docker-compose logs postgres-auth
   ```

4. **Reiniciar el contenedor si es necesario**:
   ```bash
   docker-compose restart postgres-auth
   ```

### Error: "Password authentication failed"

**Síntomas:**
```
FATAL: password authentication failed for user "admin"
```

**Soluciones:**
1. **Verificar credenciales**:
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Verificar variables de entorno**:
   ```bash
   docker-compose exec postgres-auth env | grep POSTGRES
   ```

3. **Recrear base de datos si es necesario**:
   ```bash
   docker-compose down postgres-auth
   docker volume rm $(docker volume ls -q | grep postgres_auth)
   docker-compose up postgres-auth -d
   ```

### Error: "Database does not exist"

**Síntomas:**
```
FATAL: database "auth_db" does not exist
```

**Soluciones:**
1. **Verificar que la base de datos exista**:
   ```bash
   docker-compose exec postgres-auth psql -U admin -l
   ```

2. **Crear base de datos manualmente**:
   ```bash
   docker-compose exec postgres-auth createdb -U admin auth_db
   ```

3. **Verificar scripts de inicialización**:
   ```bash
   ls -la postgres-init/
   ```

### pgAdmin no carga o es muy lento

**Soluciones:**
1. **Limpiar cache del navegador**
2. **Verificar recursos de Docker**:
   ```bash
   docker stats pgadmin
   ```
3. **Reiniciar pgAdmin**:
   ```bash
   docker-compose restart pgadmin
   ```
4. **Usar modo incógnito/privado del navegador**

### Conexión perdida frecuentemente

**Soluciones:**
1. **Aumentar timeout en pgAdmin**:
   - Ve a **File** → **Preferences**
   - **Browser** → **Connection timeout**: aumentar a 60 segundos

2. **Verificar estabilidad de la red Docker**:
   ```bash
   docker network ls
   docker network inspect chat-media-and-notifications-with-sockets_default
   ```

## 📚 Recursos Adicionales

### Documentación Oficial
- **[pgAdmin Documentation](https://www.pgadmin.org/docs/)**
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)**

### Atajos de Teclado Útiles
- **F5**: Ejecutar consulta
- **Ctrl + Shift + C**: Comentar líneas
- **Ctrl + Shift + X**: Descomentar líneas
- **Ctrl + Space**: Autocompletar
- **Ctrl + /**: Comentar/descomentar línea

### Tips de Performance
1. **Usar LIMIT en consultas grandes**
2. **Crear índices para consultas frecuentes**
3. **Usar EXPLAIN ANALYZE para optimizar consultas**
4. **Cerrar conexiones no utilizadas**

---

**💡 Tip**: pgAdmin es una herramienta poderosa para administrar PostgreSQL. Úsala para explorar datos, ejecutar consultas de mantenimiento y monitorear el estado de las bases de datos.
