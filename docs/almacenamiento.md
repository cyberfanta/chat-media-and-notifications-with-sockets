# 🗄️ Sistema de Almacenamiento de Archivos

Gestión completa de almacenamiento de archivos multimedia en la plataforma.

## 📋 Contenido

- [Almacenamiento Actual](#almacenamiento-actual)
- [Estructura de Directorios](#estructura-de-directorios)
- [Volúmenes Docker](#volúmenes-docker)
- [Acceso a Archivos](#acceso-a-archivos)
- [Gestión Manual](#gestión-manual)
- [Migración a la Nube](#migración-a-la-nube)
- [Respaldos](#respaldos)

## 💾 Almacenamiento Actual

### **Almacenamiento Local**

Actualmente, los archivos se almacenan **localmente** en el sistema de archivos del contenedor, no en un bucket en la nube. Esta configuración es ideal para desarrollo y testing.

**Características:**
- ✅ **Rápido acceso** para desarrollo
- ✅ **Sin costos** de almacenamiento en la nube
- ✅ **Control total** sobre los archivos
- ✅ **Fácil debugging** y troubleshooting
- ⚠️ **No escalable** para producción
- ⚠️ **Riesgo de pérdida** de datos si el contenedor falla

## 📁 Estructura de Directorios

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

### Tipos de Archivos Soportados

#### 🎬 Videos
- **Formatos**: MP4, AVI, MOV, MKV, WebM
- **Codecs**: H.264, H.265, VP9
- **Tamaño máximo**: 100MB por archivo
- **Resolución**: Hasta 4K (3840x2160)

#### 🖼️ Imágenes
- **Formatos**: JPEG, PNG, WebP, GIF
- **Tamaño máximo**: 10MB por archivo
- **Resolución**: Hasta 8K (7680x4320)
- **Características**: Soporte para animaciones GIF

#### 🎵 Audio
- **Formatos**: MP3, WAV, FLAC, AAC, OGG
- **Bitrate**: Hasta 320 kbps
- **Tamaño máximo**: 50MB por archivo
- **Duración**: Sin límite específico

#### 📄 Documentos (Experimental)
- **Formatos**: PDF, TXT, DOC, DOCX
- **Tamaño máximo**: 25MB por archivo
- **Uso**: Para testing y desarrollo

## 🐳 Volúmenes Docker

### Configuración de Volúmenes

```yaml
# docker-compose.yml
volumes:
  media_uploads:/app/uploads    # Archivos permanentes
  media_chunks:/app/chunks      # Chunks temporales
```

### Persistencia de Datos

```bash
# Ubicación de volúmenes Docker
docker volume ls | grep media

# Inspeccionar volumen específico
docker volume inspect chat-media-and-notifications-with-sockets_media_uploads

# Ubicación en Windows con Docker Desktop
\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\
```

### Configuración de Desarrollo vs Producción

#### Desarrollo
```yaml
volumes:
  - ./media-service/uploads:/app/uploads
  - ./media-service/chunks:/app/chunks
```

#### Producción
```yaml
volumes:
  - media_uploads:/app/uploads
  - media_chunks:/app/chunks
```

## 🔗 Acceso a Archivos

### Endpoints de Acceso

| Endpoint | Descripción | Método | Autenticación |
|----------|-------------|--------|---------------|
| `/media/:id/download` | Descargar archivo con nombre original | GET | JWT |
| `/media/:id/view` | Ver archivo en navegador | GET | JWT |
| `/media/storage/info` | Información de almacenamiento | GET | JWT |

### Ejemplos de Uso

#### Descargar Archivo
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5901/media/abc123-def456/download \
  -o "mi_archivo.mp4"
```

#### Ver Archivo en Navegador
```bash
# Para imágenes/videos que se pueden mostrar directamente
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5901/media/abc123-def456/view
```

#### Información de Almacenamiento
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5901/media/storage/info
```

**Response:**
```json
{
  "uploadsDir": "/app/uploads",
  "chunksDir": "/app/chunks",
  "totalFiles": 15,
  "diskUsage": {
    "uploads": {
      "files": 12,
      "sizeBytes": 52428800,
      "sizeHuman": "50.0 MB"
    },
    "chunks": {
      "files": 3,
      "sizeBytes": 1048576,
      "sizeHuman": "1.0 MB"
    }
  },
  "supportedTypes": ["image", "video", "audio", "document"],
  "maxFileSize": 104857600,
  "maxFileSizeHuman": "100 MB"
}
```

## 🔧 Gestión Manual

### Acceso desde el Contenedor

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

# Verificar espacio disponible
df -h /app/uploads/
```

### Acceso desde el Host

```bash
# Copiar archivo desde contenedor al host
docker cp media-service:/app/uploads/archivo.mp4 ./

# Copiar archivo desde host al contenedor
docker cp ./archivo.mp4 media-service:/app/uploads/

# Ver logs de actividad de archivos
docker logs media-service | grep "upload\|download"
```

### Limpieza Manual

```bash
# Limpiar chunks temporales antiguos (dentro del contenedor)
find /app/chunks -type d -mtime +1 -exec rm -rf {} +

# Limpiar archivos de más de 30 días
find /app/uploads -type f -mtime +30 -exec rm -f {} +

# Verificar integridad de archivos
find /app/uploads -type f -exec file {} \; | grep -v "data"
```

## ☁️ Migración a la Nube

### Opciones Recomendadas

#### 1. AWS S3
**✅ Más popular, integración directa**

```typescript
// Configuración AWS S3
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const uploadToS3 = async (file: Buffer, key: string) => {
  return s3.upload({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'application/octet-stream'
  }).promise();
};
```

#### 2. MinIO (Recomendado para desarrollo)
**✅ Compatible S3, auto-hospedado**

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

#### 3. Google Cloud Storage
**✅ Buena integración con GCP**

```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
```

#### 4. Azure Blob Storage
**✅ Para entornos Microsoft**

```typescript
import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
```

### Variables de Entorno para S3

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

### Implementación del Storage Service

```typescript
// media-service/src/storage/storage.service.ts
@Injectable()
export class StorageService {
  private useS3 = process.env.STORAGE_TYPE === 's3';
  private localPath = process.env.UPLOAD_PATH || './uploads';
  
  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    if (this.useS3) {
      return this.uploadToS3(file, fileName);
    } else {
      return this.uploadToLocal(file, fileName);
    }
  }
  
  async downloadFile(fileName: string): Promise<Buffer> {
    if (this.useS3) {
      return this.downloadFromS3(fileName);
    } else {
      return this.downloadFromLocal(fileName);
    }
  }
  
  private async uploadToS3(file: Buffer, fileName: string): Promise<string> {
    // Implementación S3
  }
  
  private async uploadToLocal(file: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(this.localPath, fileName);
    await fs.writeFile(filePath, file);
    return filePath;
  }
}
```

## 💾 Respaldos

### Script de Respaldo Automático

```bash
#!/bin/bash
# scripts/backup-media.sh

BACKUP_DIR="/opt/backups/media"
DATE=$(date +"%Y%m%d_%H%M%S")

# Crear directorio de respaldo
mkdir -p $BACKUP_DIR/$DATE

# Respaldar archivos multimedia
docker run --rm -v chat-media-and-notifications-with-sockets_media_uploads:/data \
  -v $BACKUP_DIR/$DATE:/backup alpine tar czf /backup/media-uploads.tar.gz -C /data .

# Respaldar chunks (opcional, solo si hay uploads en progreso)
docker run --rm -v chat-media-and-notifications-with-sockets_media_chunks:/data \
  -v $BACKUP_DIR/$DATE:/backup alpine tar czf /backup/media-chunks.tar.gz -C /data .

# Comprimir respaldo completo
tar -czf $BACKUP_DIR/media-backup-$DATE.tar.gz -C $BACKUP_DIR/$DATE .
rm -rf $BACKUP_DIR/$DATE

# Eliminar respaldos antiguos (mantener 7 días)
find $BACKUP_DIR -name "media-backup-*.tar.gz" -mtime +7 -delete

echo "Respaldo de media completado: media-backup-$DATE.tar.gz"
```

### Restauración desde Respaldo

```bash
#!/bin/bash
# scripts/restore-media.sh

BACKUP_FILE=$1
RESTORE_DIR="/tmp/media-restore"

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: $0 <archivo-respaldo.tar.gz>"
  exit 1
fi

# Extraer respaldo
mkdir -p $RESTORE_DIR
tar -xzf $BACKUP_FILE -C $RESTORE_DIR

# Detener servicio
docker-compose stop media-service

# Restaurar archivos
docker run --rm -v chat-media-and-notifications-with-sockets_media_uploads:/data \
  -v $RESTORE_DIR:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/media-uploads.tar.gz -C /data"

# Reiniciar servicio
docker-compose start media-service

# Limpiar
rm -rf $RESTORE_DIR

echo "Restauración completada desde $BACKUP_FILE"
```

### Configurar Respaldos Automáticos

```bash
# Editar crontab
crontab -e

# Respaldo diario a las 3 AM
0 3 * * * /opt/scripts/backup-media.sh >> /var/log/media-backup.log 2>&1

# Respaldo de chunks cada 6 horas (para uploads en progreso)
0 */6 * * * /opt/scripts/backup-chunks.sh >> /var/log/chunks-backup.log 2>&1
```

## 📊 Monitoreo de Almacenamiento

### Métricas de Uso

```bash
# Script de monitoreo
#!/bin/bash
# scripts/storage-metrics.sh

# Espacio usado por uploads
UPLOADS_SIZE=$(docker exec media-service du -sb /app/uploads | cut -f1)
UPLOADS_FILES=$(docker exec media-service find /app/uploads -type f | wc -l)

# Espacio usado por chunks
CHUNKS_SIZE=$(docker exec media-service du -sb /app/chunks | cut -f1)
CHUNKS_FILES=$(docker exec media-service find /app/chunks -type f | wc -l)

# Archivos por tipo
VIDEO_FILES=$(docker exec media-service find /app/uploads -name "*.mp4" -o -name "*.avi" -o -name "*.mov" | wc -l)
IMAGE_FILES=$(docker exec media-service find /app/uploads -name "*.jpg" -o -name "*.png" -o -name "*.gif" | wc -l)
AUDIO_FILES=$(docker exec media-service find /app/uploads -name "*.mp3" -o -name "*.wav" -o -name "*.flac" | wc -l)

echo "=== Media Storage Metrics ==="
echo "Uploads: $UPLOADS_FILES files, $(($UPLOADS_SIZE / 1024 / 1024)) MB"
echo "Chunks: $CHUNKS_FILES files, $(($CHUNKS_SIZE / 1024 / 1024)) MB"
echo "Videos: $VIDEO_FILES files"
echo "Images: $IMAGE_FILES files"
echo "Audio: $AUDIO_FILES files"
```

### Alertas de Espacio

```bash
# Script de alertas
#!/bin/bash
# scripts/storage-alerts.sh

THRESHOLD=80  # Porcentaje de uso
USAGE=$(docker exec media-service df /app/uploads | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
  echo "⚠️ ALERTA: Almacenamiento al $USAGE% de capacidad"
  # Enviar notificación (email, Slack, etc.)
  curl -X POST http://localhost:5903/notifications \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"USAGE_LIMIT_REACHED\",
      \"title\": \"Espacio de almacenamiento bajo\",
      \"message\": \"El almacenamiento está al $USAGE% de capacidad\",
      \"priority\": \"high\"
    }"
fi
```

## 🚀 Optimizaciones

### Compresión de Archivos

```typescript
// Compresión automática de imágenes
import sharp from 'sharp';

const compressImage = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize(1920, 1080, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 85,
      progressive: true 
    })
    .toBuffer();
};
```

### Cache de Archivos

```typescript
// Cache de archivos frecuentemente accedidos
@Injectable()
export class FileCache {
  private cache = new Map<string, { buffer: Buffer; timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutos

  get(fileId: string): Buffer | null {
    const cached = this.cache.get(fileId);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.buffer;
    }
    this.cache.delete(fileId);
    return null;
  }

  set(fileId: string, buffer: Buffer): void {
    this.cache.set(fileId, { buffer, timestamp: Date.now() });
  }
}
```

### Cleanup Automático

```typescript
// Limpieza automática de chunks antiguos
@Cron('0 2 * * *') // Diario a las 2 AM
async cleanupOldChunks() {
  const chunksDir = '/app/chunks';
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  const directories = await fs.readdir(chunksDir);
  
  for (const dir of directories) {
    const dirPath = path.join(chunksDir, dir);
    const stats = await fs.stat(dirPath);
    
    if (stats.isDirectory() && stats.mtime.getTime() < oneDayAgo) {
      await fs.rm(dirPath, { recursive: true });
      this.logger.log(`Cleaned up old chunks directory: ${dir}`);
    }
  }
}
```

El sistema de almacenamiento actual proporciona una base sólida para desarrollo y testing, con un camino claro para migrar a soluciones en la nube cuando sea necesario.
