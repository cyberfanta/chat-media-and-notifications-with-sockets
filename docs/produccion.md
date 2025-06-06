# 🚀 Configuración y Despliegue en Producción

Guía completa para configurar y desplegar la Plataforma de Contenido Multimedia en entornos de producción.

## 📋 Contenido

- [Prerrequisitos de Producción](#prerrequisitos-de-producción)
- [Configuración del Entorno](#configuración-del-entorno)
- [Variables de Entorno](#variables-de-entorno)
- [Despliegue con Docker Compose](#despliegue-con-docker-compose)
- [Configuración de Reverse Proxy](#configuración-de-reverse-proxy)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Respaldos](#respaldos)
- [Escalabilidad](#escalabilidad)
- [Seguridad](#seguridad)

## 🔧 Prerrequisitos de Producción

### Servidor de Producción
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: Mínimo 8GB, Recomendado 16GB+
- **CPU**: Mínimo 4 cores, Recomendado 8+ cores
- **Almacenamiento**: Mínimo 100GB SSD
- **Red**: Conexión estable con ancho de banda suficiente

### Software Requerido
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

## ⚙️ Configuración del Entorno

### 1. Preparar el Servidor
```bash
# Crear usuario para la aplicación
sudo useradd -m -s /bin/bash mediaapp
sudo usermod -aG docker mediaapp

# Crear directorio de la aplicación
sudo mkdir -p /opt/media-platform
sudo chown mediaapp:mediaapp /opt/media-platform

# Cambiar al usuario de la aplicación
sudo su - mediaapp
cd /opt/media-platform
```

### 2. Clonar el Repositorio
```bash
git clone https://github.com/cyberfanta/chat-media-and-notifications-with-sockets.git
cd chat-media-and-notifications-with-sockets
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivos de ejemplo
cp .env.example .env.production

# Editar variables de producción
nano .env.production
```

## 🌍 Variables de Entorno

### Variables Principales de Producción
```bash
# Entorno
NODE_ENV=production

# Base de datos PostgreSQL
POSTGRES_HOST=postgres-auth-prod
POSTGRES_PORT=5432
POSTGRES_USER=mediaapp_user
POSTGRES_PASSWORD=tu_password_super_seguro_aqui
POSTGRES_DB=mediaapp_production

# Redis
REDIS_HOST=redis-prod
REDIS_PORT=6379
REDIS_PASSWORD=tu_redis_password_aqui

# JWT
JWT_SECRET=tu_jwt_secret_super_largo_y_seguro_de_al_menos_64_caracteres
JWT_EXPIRES_IN=24h

# Configuración de aplicación
API_PORT=5900
MEDIA_PORT=5901
COMMENTS_PORT=5902
NOTIFICATIONS_PORT=5903

# Configuración de archivos
MAX_FILE_SIZE=100MB
UPLOAD_PATH=/opt/media-platform/uploads

# URLs públicas (cambiar por tu dominio)
PUBLIC_URL=https://tu-dominio.com
AUTH_SERVICE_URL=https://api.tu-dominio.com/auth
MEDIA_SERVICE_URL=https://api.tu-dominio.com/media
COMMENTS_SERVICE_URL=https://api.tu-dominio.com/comments
NOTIFICATIONS_SERVICE_URL=https://api.tu-dominio.com/notifications

# SSL/HTTPS
SSL_CERT_PATH=/opt/certs/fullchain.pem
SSL_KEY_PATH=/opt/certs/privkey.pem

# Monitoreo
LOG_LEVEL=warn
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 🐳 Despliegue con Docker Compose

### 1. Usar Configuración de Producción
```bash
# Ejecutar con archivo de producción
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar estado de servicios
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Configuración de Monitoreo
```bash
# Ver estado general
docker-compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Ver métricas de recursos
docker stats

# Limpiar recursos no utilizados
docker system prune -a
```

## 📊 Respaldos y Mantenimiento

### Script de Respaldo Automático
```bash
#!/bin/bash
# /opt/media-platform/scripts/backup.sh

BACKUP_DIR="/opt/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

# Crear directorio de respaldo
mkdir -p $BACKUP_DIR/$DATE

# Respaldar bases de datos
docker exec postgres-auth pg_dump -U mediaapp_user mediaapp_production > $BACKUP_DIR/$DATE/auth_db.sql
docker exec postgres-media pg_dump -U mediaapp_user mediaapp_production > $BACKUP_DIR/$DATE/media_db.sql

# Respaldar archivos multimedia
tar -czf $BACKUP_DIR/$DATE/media_files.tar.gz /opt/media-platform/uploads

# Comprimir respaldo completo
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/$DATE
rm -rf $BACKUP_DIR/$DATE

echo "Respaldo completado: backup_$DATE.tar.gz"
```

### Configurar Cron para Respaldos Automáticos
```bash
# Editar crontab
crontab -e

# Agregar línea para respaldo diario a las 2 AM
0 2 * * * /opt/media-platform/scripts/backup.sh >> /var/log/media-platform/backup.log 2>&1
```

## 🔐 Seguridad

### Configuración de Firewall
```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL/TLS con Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚨 Comandos de Producción Útiles

```bash
# Reiniciar un servicio específico
docker-compose -f docker-compose.prod.yml restart auth-service

# Actualizar servicios sin downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps auth-service

# Ejecutar respaldo manual
/opt/media-platform/scripts/backup.sh

# Restaurar desde respaldo
docker exec -i postgres-auth psql -U mediaapp_user -d mediaapp_production < backup_auth.sql
```

Esta configuración de producción proporciona una base sólida y segura para desplegar la plataforma en entornos de producción reales. 