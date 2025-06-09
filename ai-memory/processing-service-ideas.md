# 🎯 Ideas para el Servicio de Procesamiento (Puerto 5904)

## 🚀 Propuestas Principales

### 1. 🎨 **Servicio de Transformación de Media** (Recomendado)

#### Responsabilidades
- **Compresión automática** de imágenes y videos
- **Redimensionamiento** en múltiples resoluciones
- **Conversión de formatos** (WebP, AVIF para imágenes; H.264, VP9 para videos)
- **Generación de thumbnails** automáticos
- **Optimización para web** (responsive images)
- **Watermarking** automático opcional

#### Flujo de Procesamiento
```typescript
// Event-driven workflow
'media.uploaded' -> Queue Job -> Process -> Update Media Entity -> Notify
```

#### Casos de Uso
- Usuario sube imagen de 10MB → Se genera versión optimizada de 500KB
- Video 4K → Se generan versiones 1080p, 720p, 480p automáticamente
- Imagen → Se crean thumbnails pequeño, mediano, grande
- PDF → Se genera thumbnail de primera página

---

### 2. 🤖 **Servicio de Análisis de Contenido con IA**

#### Responsabilidades
- **Detección de contenido inapropiado** (NSFW, violencia)
- **Reconocimiento de objetos** en imágenes
- **Transcripción automática** de audio/video
- **Análisis de sentimientos** en comentarios
- **Detección de spam** y contenido duplicado
- **Generación de tags** automáticos

#### Integraciones Posibles
- **TensorFlow.js** para modelos locales
- **OpenAI API** para análisis avanzado
- **Google Vision API** para reconocimiento de imágenes
- **Azure Cognitive Services** para transcripción

#### Flujo de Moderación
```typescript
// Automated content moderation
'media.uploaded' -> AI Analysis -> Flag if inappropriate -> Notify moderators
'comment.created' -> Sentiment analysis -> Auto-moderate if toxic
```

---

### 3. 📊 **Servicio de Analytics y Métricas**

#### Responsabilidades
- **Tracking de views** y interacciones
- **Estadísticas de usage** por usuario y contenido
- **Reportes de performance** del sistema
- **Métricas de engagement** (comentarios, tiempo de visualización)
- **Dashboard analytics** para administradores
- **Alertas automáticas** por patrones anómalos

#### Métricas Clave
```typescript
interface AnalyticsData {
  contentViews: number;
  averageViewTime: number;
  commentEngagement: number;
  userRetention: number;
  popularContent: ContentMetric[];
  systemHealth: HealthMetric[];
}
```

---

### 4. 🔄 **Servicio de Workflow y Automatización**

#### Responsabilidades
- **Workflow de aprobación** para contenido
- **Automatización de tareas** repetitivas
- **Programación de publicaciones** (scheduled posts)
- **Backup automático** de contenido importante
- **Cleanup de archivos** temporales y obsoletos
- **Sincronización con servicios externos**

#### Workflows Ejemplo
```typescript
// Content approval workflow
Upload -> Auto-scan -> Queue for review -> Moderator approval -> Publish

// Cleanup workflow  
Daily -> Find expired chunks -> Delete -> Log cleanup -> Update stats
```

---

## 🎯 **Recomendación: Servicio de Transformación de Media**

### ¿Por qué esta opción?

#### ✅ **Ventajas**
1. **Valor inmediato**: Mejora directa en UX y performance
2. **Integración natural**: Encaja perfectamente con Media Service existente
3. **Escalabilidad**: Reduce ancho de banda y almacenamiento
4. **SEO friendly**: Imágenes optimizadas mejoran Core Web Vitals
5. **Compatibilidad**: Diferentes formatos para diferentes dispositivos

#### 🏗️ **Arquitectura Propuesta**

```typescript
// Processing Service Architecture
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Media Service │───▶│ Processing Queue │───▶│ Processing Jobs │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Redis Queue    │    │   File Storage  │
                       │   (Bull Queue)   │    │   (Processed)   │
                       └──────────────────┘    └─────────────────┘
```

### 📋 **Funcionalidades Detalladas**

#### Image Processing
```typescript
interface ImageProcessingOptions {
  formats: ['webp', 'avif', 'jpeg']; // Multi-format output
  sizes: [
    { name: 'thumbnail', width: 150, height: 150 },
    { name: 'small', width: 400, height: 300 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1200, height: 900 }
  ];
  quality: 85;
  optimization: true;
  watermark?: {
    text: string;
    position: 'bottom-right' | 'center';
    opacity: 0.3;
  };
}
```

#### Video Processing
```typescript
interface VideoProcessingOptions {
  resolutions: ['480p', '720p', '1080p'];
  formats: ['mp4', 'webm'];
  thumbnails: {
    count: 3; // 3 thumbnails at different timestamps
    format: 'jpg';
    quality: 90;
  };
  compression: {
    codec: 'h264';
    bitrate: 'auto'; // Adaptive bitrate
  };
}
```

### 🔧 **Stack Tecnológico Sugerido**

#### Procesamiento
- **Sharp** - Procesamiento de imágenes ultra-rápido
- **FFmpeg** - Procesamiento de video/audio
- **Bull Queue** - Queue system robusto con Redis
- **ImageMagick** - Fallback para casos especiales

#### Storage Strategy
```typescript
// File organization after processing
/uploads/
├── original/           # Archivos originales
├── processed/          # Versiones procesadas
│   ├── images/
│   │   ├── thumbnails/
│   │   ├── small/
│   │   ├── medium/
│   │   └── large/
│   └── videos/
│       ├── 480p/
│       ├── 720p/
│       ├── 1080p/
│       └── thumbnails/
└── temp/              # Procesamiento temporal
```

### 📊 **Métricas y Monitoreo**

```typescript
interface ProcessingStats {
  jobsCompleted: number;
  averageProcessingTime: number;
  compressionRatio: number; // Space saved
  failureRate: number;
  queueDepth: number;
  processingCapacity: number;
}
```

---

## 🚦 **Plan de Implementación**

### Fase 1: Fundamentos (Semana 1-2)
- [ ] Setup básico del servicio con NestJS
- [ ] Integración con Redis Queue (Bull)
- [ ] Event listeners para `media.uploaded`
- [ ] Procesamiento básico de imágenes con Sharp

### Fase 2: Procesamiento Avanzado (Semana 3-4)
- [ ] Multi-format image generation
- [ ] Video processing con FFmpeg
- [ ] Thumbnail generation automático
- [ ] Error handling y retry logic

### Fase 3: Optimización (Semana 5-6)
- [ ] Batch processing para eficiencia
- [ ] Progressive enhancement
- [ ] Monitoring y alertas
- [ ] API endpoints para reprocessing manual

### Fase 4: Features Avanzadas (Semana 7-8)
- [ ] Watermarking automático
- [ ] Smart cropping con IA
- [ ] Adaptive bitrate para videos
- [ ] CDN integration ready

---

## 🔗 **Integración con Servicios Existentes**

### Media Service
```typescript
// Media Service publishes event
this.eventEmitter.emit('media.uploaded', {
  mediaId: file.id,
  userId: file.userId,
  originalPath: file.path,
  mimeType: file.mimeType
});
```

### Processing Service
```typescript
// Processing Service listens and processes
@OnEvent('media.uploaded')
async handleMediaUpload(payload: MediaUploadEvent) {
  await this.queueService.addProcessingJob('image-optimization', {
    mediaId: payload.mediaId,
    inputPath: payload.originalPath,
    options: this.getProcessingOptions(payload.mimeType)
  });
}
```

### Notifications Service
```typescript
// Notify when processing completes
this.eventEmitter.emit('media.processed', {
  mediaId: processedFile.id,
  userId: processedFile.userId,
  variants: processedFile.variants // Different sizes/formats
});
```

---

## 💡 **Valor Agregado al Ecosistema**

1. **Performance**: Imágenes/videos optimizados = carga más rápida
2. **Storage**: Compresión inteligente = menor costo de almacenamiento  
3. **UX**: Thumbnails automáticos = mejor experiencia visual
4. **SEO**: Formatos modernos (WebP/AVIF) = mejor ranking
5. **Accessibility**: Múltiples resoluciones = mejor en dispositivos móviles
6. **Automation**: Menos trabajo manual para moderadores

¿Te parece interesante esta propuesta del **Servicio de Transformación de Media**? ¿O prefieres explorar alguna de las otras opciones como el análisis con IA o analytics?

---

## 📊 **Estado de Implementación de Ideas**

### 🎯 **Roadmap General de Servicios de Procesamiento**

```
📋 PLAN MAESTRO DE SERVICIOS DE PROCESAMIENTO

🎨 Servicio de Transformación de Media (Puerto 5904)
├── 🚧 FASE 1: EN DESARROLLO
│   ├── ✅ Análisis y diseño completado
│   ├── 🔄 Implementación básica (SIGUIENTE)
│   └── ⏳ Testing y optimización
│
├── 📋 FASES FUTURAS:
│   ├── 🤖 Módulo de Análisis con IA (Integrado)
│   ├── 📊 Módulo de Analytics (Integrado) 
│   └── 🔄 Módulo de Workflow (Integrado)
│
└── 🎯 OBJETIVO: Servicio único y poderoso de procesamiento

🚀 ESTRATEGIA: 
- Comenzar con Transformación de Media como base
- Incrementalmente agregar módulos de IA, Analytics y Workflow
- Mantener arquitectura modular para fácil extensión
- Un solo servicio pero con múltiples capacidades especializadas
```

### 🛠️ **Implementación Actual: Transformación de Media**

#### ✅ **Decisiones Confirmadas**
- **Prioridad**: Servicio de Transformación de Media como primer módulo
- **Puerto**: 5904 
- **Integración**: Event-driven con todos los microservicios existentes
- **Enfoque**: Procesamiento automático post-upload

#### 📋 **Especificaciones Técnicas Definidas**

##### Compresión Inteligente
- **Imágenes**: Algoritmos adaptativos según contenido (JPEG, WebP, AVIF)
- **Videos**: Compresión H.264/H.265 con bitrate adaptativo
- **Audio**: Compresión AAC/OGG optimizada según calidad original

##### Thumbnails Automáticos
- **Imagen**: Copia optimizada en baja resolución (150x150, 300x300)
- **Video**: 10 frames extraídos en momentos clave + thumbnail principal
- **Audio**: Icono Material Design convertido a imagen (waveform style)

##### ~~Watermarking Dual~~ → **MOVIDO A BAJA PRIORIDAD**
- ~~Visual: Overlay/estampado configurable~~
- ~~Metadata: Inserción de datos de autoría~~
- **Razón**: Requiere interfaz compleja de administración, upload de imágenes, transparencias, etc.

---

## 🗺️ **RUTA DE TRABAJO DETALLADA - FASE 1**

### 📦 **1. CREACIÓN DEL PROCESSING SERVICE (5904)**

#### 1.1 Estructura Base del Servicio
```
processing-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── processing/
│   │   ├── processing.module.ts
│   │   ├── processing.controller.ts
│   │   ├── processing.service.ts
│   │   └── dto/
│   │       ├── process-media.dto.ts
│   │       └── processing-result.dto.ts
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── queue.service.ts
│   │   └── processors/
│   │       ├── image.processor.ts
│   │       ├── video.processor.ts
│   │       └── audio.processor.ts
│   ├── compression/
│   │   ├── compression.module.ts
│   │   ├── image-compression.service.ts
│   │   ├── video-compression.service.ts
│   │   └── audio-compression.service.ts
│   ├── thumbnail/
│   │   ├── thumbnail.module.ts
│   │   ├── image-thumbnail.service.ts
│   │   ├── video-thumbnail.service.ts
│   │   └── audio-thumbnail.service.ts
│   ├── watermark/
│   │   ├── watermark.module.ts
│   │   ├── visual-watermark.service.ts
│   │   └── metadata-watermark.service.ts
│   ├── entities/
│   │   ├── processed-media.entity.ts
│   │   └── processing-job.entity.ts
│   ├── events/
│   │   ├── events.module.ts
│   │   └── media-events.listener.ts
│   └── config/
│       ├── database.config.ts
│       ├── redis.config.ts
│       └── processing.config.ts
├── package.json
├── Dockerfile
└── .env
```

#### 1.2 Nuevas Dependencias Requeridas
```json
{
  "dependencies": {
    "sharp": "^0.32.0",           // Procesamiento de imágenes
    "fluent-ffmpeg": "^2.1.2",   // Procesamiento de video/audio
    "ffmpeg-static": "^5.1.0",   // FFmpeg binario
    "@nestjs/bull": "^10.0.1",   // Queue management
    "bull": "^4.11.3",           // Job queue
    "exifr": "^7.1.3",           // Metadata de imágenes
    "node-ffprobe": "^3.0.0",    // Metadata de video/audio
    "canvas": "^2.11.2",         // Generación de iconos
    "@material-design-icons/svg": "^0.14.0" // Iconos material
  }
}
```

### 📊 **2. NUEVA BASE DE DATOS: PROCESSING_DB (Puerto 5436)**

#### 2.1 Entidades Principales
```typescript
// ProcessedMedia Entity
{
  id: string (UUID),
  originalMediaId: string,      // FK al Media Service
  processedVariants: JSON,      // Array de versiones procesadas
  compressionStats: JSON,       // Estadísticas de compresión
  thumbnails: JSON,             // Array de thumbnails generados
  watermarks: JSON,             // Info de watermarks aplicados
  processingStatus: enum,       // PENDING, PROCESSING, COMPLETED, FAILED
  processingStartedAt: Date,
  processingCompletedAt: Date,
  errorLog: string,
  created_at: Date,
  updated_at: Date
}

// ProcessingJob Entity  
{
  id: string (UUID),
  mediaId: string,
  jobType: enum,               // IMAGE, VIDEO, AUDIO
  priority: number,
  status: enum,                // QUEUED, PROCESSING, COMPLETED, FAILED
  progress: number,            // 0-100
  estimatedDuration: number,
  actualDuration: number,
  errorMessage: string,
  retryCount: number,
  created_at: Date,
  updated_at: Date
}
```

#### 2.2 Configuración Docker
```yaml
# Agregar a docker-compose.yml
postgres-processing:
  image: postgres:15
  environment:
    POSTGRES_DB: processing_db
    POSTGRES_USER: processing_user
    POSTGRES_PASSWORD: processing_password
  ports:
    - "5436:5432"
  volumes:
    - postgres_processing_data:/var/lib/postgresql/data
    - ./postgres-init/05-processing-init.sql:/docker-entrypoint-initdb.d/05-processing-init.sql
```

### 🔄 **3. MODIFICACIONES AL MEDIA SERVICE (5901)**

#### 3.1 Cambios en MediaController
```typescript
// ❌ ERROR CORREGIDO: El evento debe ir en complete-upload, NO en upload básico

@Post('complete-upload/:mediaId')
async completeUpload(@Param('mediaId') mediaId: string, @Request() req) {
  // ... lógica existente de completeUpload ...
  
  const completedMedia = await this.mediaService.completeUpload(mediaId, req.user.sub);
  
  // 🆕 NUEVO: Publicar evento para procesamiento SOLO cuando upload esté completado
  this.eventEmitter.emit('media.uploaded.for.processing', {
    mediaId: completedMedia.id,
    userId: completedMedia.userId,
    originalPath: completedMedia.filePath,
    filename: completedMedia.originalName,
    mimeType: completedMedia.mimeType,
    size: completedMedia.actualSize
  });
  
  return completedMedia;
}
```

#### 3.2 Cambios en MediaService
```typescript
// AGREGAR nuevo método en media.service.ts:

async updateProcessingStatus(mediaId: string, processingData: any) {
  const media = await this.findOne(mediaId);
  
  // Actualizar con información de procesamiento
  media.processingStatus = processingData.status;
  media.processedVariants = processingData.variants;
  media.thumbnails = processingData.thumbnails;
  
  return await this.mediaRepository.save(media);
}
```

#### 3.3 Nueva Entity MediaFile Extendida
```typescript
// AGREGAR campos a media-file.entity.ts:

@Column({ type: 'enum', enum: ProcessingStatus, default: ProcessingStatus.PENDING })
processingStatus: ProcessingStatus;

@Column({ type: 'json', nullable: true })
processedVariants: ProcessedVariant[];

@Column({ type: 'json', nullable: true })
thumbnails: ThumbnailInfo[];

@Column({ type: 'json', nullable: true })
compressionStats: CompressionStats;
```

### 🔔 **4. MODIFICACIONES AL NOTIFICATIONS SERVICE (5903)**

#### 4.1 Nuevos Tipos de Notificaciones
```typescript
// AGREGAR en notification-type.enum.ts:

MEDIA_PROCESSING_STARTED = 'MEDIA_PROCESSING_STARTED',
MEDIA_PROCESSING_COMPLETED = 'MEDIA_PROCESSING_COMPLETED', 
MEDIA_PROCESSING_FAILED = 'MEDIA_PROCESSING_FAILED',
MEDIA_THUMBNAILS_GENERATED = 'MEDIA_THUMBNAILS_GENERATED',
MEDIA_COMPRESSED = 'MEDIA_COMPRESSED'
```

#### 4.2 Nuevos Event Listeners
```typescript
// AGREGAR en events.listener.ts:

@OnEvent('media.processing.started')
async handleProcessingStarted(payload: ProcessingEvent) {
  await this.createNotification({
    userId: payload.userId,
    type: NotificationType.MEDIA_PROCESSING_STARTED,
    title: 'Procesamiento Iniciado',
    message: `Tu archivo ${payload.filename} está siendo optimizado`,
    data: { mediaId: payload.mediaId }
  });
}

@OnEvent('media.processing.completed')
async handleProcessingCompleted(payload: ProcessingEvent) {
  await this.createNotification({
    userId: payload.userId,
    type: NotificationType.MEDIA_PROCESSING_COMPLETED,
    title: 'Archivo Optimizado',
    message: `Tu archivo ha sido procesado exitosamente`,
    data: { 
      mediaId: payload.mediaId,
      compressionSavings: payload.compressionStats.spaceSaved,
      thumbnailsGenerated: payload.thumbnails.length
    }
  });
}
```

### 📁 **5. ESTRUCTURA DE ALMACENAMIENTO EXPANDIDA**

#### 5.1 Nueva Organización de Directorios
```
/uploads/
├── original/                    # 🆕 Archivos originales sin procesar
│   ├── images/
│   ├── videos/
│   └── audio/
├── processed/                   # 🆕 Archivos procesados
│   ├── images/
│   │   ├── compressed/          # Versiones comprimidas
│   │   ├── formats/             # Diferentes formatos (webp, avif)
│   │   └── watermarked/         # Con watermark visual
│   ├── videos/
│   │   ├── compressed/          # Diferentes resoluciones
│   │   ├── formats/             # MP4, WebM
│   │   └── watermarked/
│   └── audio/
│       ├── compressed/          # AAC, OGG optimizados
│       └── watermarked/         # Con metadata watermark
├── thumbnails/                  # 🆕 Thumbnails generados
│   ├── images/                  # Miniaturas de imágenes
│   ├── videos/                  # Frames de videos
│   └── audio/                   # Iconos para audio
├── temp/                        # Procesamiento temporal
│   ├── processing/
│   └── conversion/
└── chunks/                      # Chunks existentes (no cambiar)
```

### ⚡ **6. EVENTOS Y COMUNICACIÓN ENTRE SERVICIOS**

#### 6.1 Flujo de Eventos Completo
```typescript
// FLUJO DE EVENTOS DETALLADO:

1. Media Service: 'media.uploaded.for.processing'
   ↓
2. Processing Service: Recibe evento → Encola job
   ↓  
3. Processing Service: 'media.processing.started'
   ↓
4. Notifications Service: Notifica al usuario "Procesamiento iniciado"
   ↓
5. Processing Service: Procesa archivo (compresión, thumbnails, watermark)
   ↓
6. Processing Service: 'media.processing.completed' 
   ↓
7. Media Service: Actualiza registro con datos procesados
   ↓
8. Notifications Service: Notifica "Archivo optimizado"
   ↓
9. Comments Service: Puede usar thumbnails para previews
```

#### 6.2 Nuevos Eventos Redis Pub/Sub
```typescript
// NUEVOS CANALES DE EVENTOS:

'media.uploaded.for.processing'    // Media → Processing
'media.processing.started'         // Processing → Notifications  
'media.processing.progress'        // Processing → (WebSocket real-time)
'media.processing.completed'       // Processing → Media + Notifications
'media.processing.failed'          // Processing → Notifications
'media.thumbnails.generated'       // Processing → Media + Comments
'media.watermark.applied'          // Processing → Media
```

### 🔧 **7. CONFIGURACIÓN Y VARIABLES DE ENTORNO**

#### 7.1 Nuevas Variables para Processing Service
```bash
# Processing Service Environment Variables
PORT=5904
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5436
DB_USERNAME=processing_user
DB_PASSWORD=processing_password
DB_NAME=processing_db

# Redis Queue
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_DB=2

# Processing Configuration
MAX_CONCURRENT_JOBS=5
IMAGE_QUALITY=85
VIDEO_BITRATE=auto
THUMBNAIL_SIZE=300
WATERMARK_OPACITY=0.3
WATERMARK_TEXT="Plataforma Multimedia"

# Storage Paths
ORIGINAL_STORAGE_PATH=/uploads/original
PROCESSED_STORAGE_PATH=/uploads/processed
THUMBNAIL_STORAGE_PATH=/uploads/thumbnails
TEMP_STORAGE_PATH=/uploads/temp
```

### 📊 **8. ENDPOINTS NUEVOS DEL PROCESSING SERVICE**

#### 8.1 API Endpoints
```typescript
// processing.controller.ts endpoints:

GET  /processing/health                    // Health check
POST /processing/reprocess/:mediaId       // Re-procesar archivo manualmente
GET  /processing/status/:mediaId          // Estado de procesamiento
GET  /processing/stats                    // Estadísticas generales
GET  /processing/queue                    // Estado de la cola
PUT  /processing/config                   // Actualizar configuración
GET  /processing/jobs                     // Lista de trabajos
DELETE /processing/jobs/:jobId            // Cancelar trabajo
```

### 🧪 **9. TESTING Y VALIDACIÓN**

#### 9.1 Casos de Testing Necesarios
```bash
# Tests a crear:
- Upload imagen → Verificar compresión + thumbnail
- Upload video → Verificar múltiples resoluciones + 10 frames  
- Upload audio → Verificar compresión + icono material
- Watermark visual en imagen
- Watermark metadata en todos los tipos
- Queue overflow handling
- Processing failure recovery
- Event emission correcta
- Integration con otros servicios
```

### 🚀 **10. DOCKER Y DEPLOYMENT**

#### 10.1 Dockerfile para Processing Service
```dockerfile
FROM node:18-alpine

# Instalar FFmpeg y dependencias
RUN apk add --no-cache ffmpeg imagemagick

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 5904
CMD ["npm", "run", "start:prod"]
```

#### 10.2 Actualización docker-compose.yml
```yaml
# AGREGAR servicio processing:
processing-service:
  build: ./processing-service
  ports:
    - "5904:5904"
  depends_on:
    - postgres-processing
    - redis-notifications
  environment:
    - NODE_ENV=development
    - PORT=5904
  volumes:
    - ./uploads:/uploads
```

---

## ✅ **RESUMEN DE MODIFICACIONES POR SERVICIO**

### 🔐 Auth Service (5900)
- **Sin cambios** - No requiere modificaciones

### 📁 Media Service (5901)  
- ✅ Agregar evento `media.uploaded.for.processing`
- ✅ Extender MediaFile entity con campos de procesamiento
- ✅ Nuevo método `updateProcessingStatus()`
- ✅ Agregar listener para eventos de procesamiento completado

### 💬 Comments Service (5902)
- ✅ Agregar integración con thumbnails para previews
- ✅ Listener para `media.thumbnails.generated`

### 🔔 Notifications Service (5903)
- ✅ 5 nuevos tipos de notificaciones de procesamiento
- ✅ Event listeners para todos los eventos de processing
- ✅ WebSocket real-time para progreso de procesamiento

### 🎨 Processing Service (5904) - NUEVO
- ✅ Servicio completamente nuevo
- ✅ Base de datos PostgreSQL independiente
- ✅ Queue system con Redis
- ✅ Módulos de compresión, thumbnails y watermarking
- ✅ Event-driven integration

### 🧹 Cleanup Service (5905) - NUEVO AÑADIDO
- ✅ **Estructura base del servicio**
  - ✅ Setup NestJS con TypeScript
  - ✅ Configuración de base de datos PostgreSQL (puerto 5437)
  - ✅ Scheduler con cron jobs (@nestjs/schedule)
  - ✅ File system utilities y path management
  - ✅ Health check endpoint
  - ✅ Swagger documentation

- ✅ **Módulo de Chunk Cleanup**
  - ✅ ChunkCleanupService
    - ✅ Detector de chunks huérfanos >6 horas
    - ✅ Validación cruzada con base de datos Media
    - ✅ Cleanup de directorios vacíos
    - ✅ Marcado de uploads como FAILED
  - ✅ Scheduled job cada 1 hora
  - ✅ Métricas de archivos eliminados y espacio recuperado

- ✅ **Módulo de Upload Cleanup**  
  - ✅ UploadCleanupService
    - ✅ Detector de init-uploads PENDING >6 horas
    - ✅ Verificación de chunks asociados
    - ✅ Eliminación de registros huérfanos de BD
    - ✅ Log detallado de limpieza
  - ✅ Scheduled job cada 2 horas
  - ✅ Notificación a admins si muchos uploads fallan

- ✅ **Módulo de Temporary Files Cleanup**
  - ✅ TempFileCleanupService
    - ✅ Scanner de archivos en /temp/ >24 horas
    - ✅ Verificación de referencias en BDs
    - ✅ Cleanup de archivos de procesamiento abandonados
    - ✅ Cleanup de logs antiguos
  - ✅ Scheduled job diario
  - ✅ Preservación de archivos importantes

- ✅ **Sistema de Storage Monitoring**
  - ✅ StorageMonitoringService
    - ✅ Análisis de uso de disco en tiempo real
    - ✅ Alertas cuando espacio libre <10%
    - ✅ Reporte de archivos más grandes
    - ✅ Estadísticas de crecimiento de storage
  - ✅ Dashboard de métricas
  - ✅ Notificaciones automáticas a admins

- ✅ **Configuración y Management**
  - ✅ Reglas de cleanup configurables
  - ✅ Enable/disable jobs individuales
  - ✅ Timeouts personalizables por tipo
  - ✅ Preview mode (qué se eliminaría sin eliminar)
  - ✅ Manual trigger de cleanup jobs

### 🐳 Docker Infrastructure
- ✅ Nueva base de datos PostgreSQL (puerto 5436)
- ✅ Nuevo servicio en docker-compose
- ✅ Volúmenes expandidos para estructura de archivos

---

## 🎯 **RESULTADO ESPERADO**

Una vez implementado este plan:

1. **Usuario sube archivo** → Media Service lo guarda
2. **Automáticamente** → Processing Service recibe evento y encola procesamiento  
3. **Procesamiento inteligente** → Compresión + thumbnails + watermarks
4. **Notificaciones en tiempo real** → Usuario ve progreso via WebSocket
5. **Actualización automática** → Media Service actualizado con versiones procesadas
6. **Mejor experiencia** → Archivos optimizados disponibles inmediatamente

---

## 🚨 **CORRECCIONES CRÍTICAS IDENTIFICADAS**

### ❌ **Error 1: Evento de Procesamiento en Lugar Incorrecto**
**Problema**: El evento `media.uploaded.for.processing` estaba en el endpoint básico de upload  
**Corrección**: Debe ir en `complete-upload/:mediaId` cuando el archivo esté realmente completo  
**Impacto**: Evita procesar archivos incompletos o chunks sueltos

### ❌ **Error 2: Falta Microservicio de Limpieza**
**Problema**: No había consideración para cleanup de archivos huérfanos  
**Solución**: Nuevo **Cleanup Service (Puerto 5905)** con:
- Limpieza de `init-upload` sin chunks por >6 horas
- Cleanup de chunks sin actividad por >6 horas  
- Eliminación de archivos temporales no utilizados
- Jobs programados con cron

### ❌ **Error 3: Ambigüedad en Notificaciones Post-Procesamiento**
**Problema**: No estaba claro quién recibe notificaciones de "media disponible"  
**Aclaración Requerida**: 
- ❓ Notificaciones de procesamiento (start/fail/complete) → Solo uploader
- ❓ Notificación "media disponible" → ¿A quién? ¿Todos? ¿Seguidores? ¿Nadie?

---

## 🧹 **NUEVO: CLEANUP SERVICE (Puerto 5905)**

### Responsabilidades
- **Scheduled cleanup** de archivos huérfanos (cada 1 hora)
- **Detección de uploads abandonados** (>6 horas sin actividad)
- **Limpieza de chunks** sin progreso por >6 horas
- **Cleanup de archivos temporales** no referenciados en BD
- **Métricas de espacio recuperado** y estadísticas
- **Alertas de almacenamiento** cuando espacio sea crítico

### Entidades Cleanup Service
```typescript
// CleanupJob Entity
{
  id: string (UUID),
  jobType: enum,              // CHUNK_CLEANUP, UPLOAD_CLEANUP, TEMP_CLEANUP
  status: enum,               // PENDING, RUNNING, COMPLETED, FAILED
  itemsProcessed: number,
  itemsDeleted: number,
  spaceRecovered: number,     // bytes
  startedAt: Date,
  completedAt: Date,
  errorLog: string,
  created_at: Date
}

// CleanupRule Entity  
{
  id: string (UUID),
  ruleType: enum,             // UPLOAD_TIMEOUT, CHUNK_TIMEOUT, TEMP_FILE_AGE
  enabled: boolean,
  timeoutHours: number,       // 6 horas por defecto
  cronPattern: string,        // '0 */1 * * *' (cada hora)
  lastRun: Date,
  nextRun: Date,
  created_at: Date,
  updated_at: Date
}
```

### Cleanup Jobs Programados
```typescript
// Jobs automáticos del Cleanup Service:

1. "Chunk Cleanup" (cada 1 hora):
   - Encuentra chunks sin actividad >6 horas
   - Verifica si upload está abandonado
   - Elimina chunks y directorio
   - Marca upload como FAILED en BD

2. "Upload Cleanup" (cada 2 horas):
   - Encuentra init-uploads PENDING >6 horas
   - Sin chunks asociados  
   - Elimina registro de BD
   - Log de cleanup

3. "Temp File Cleanup" (diario):
   - Archivos en /temp/ >24 horas
   - No referenciados en ninguna BD
   - Limpieza de archivos huérfanos

4. "Storage Report" (diario):
   - Generar métricas de uso
   - Alertar si espacio <10% libre
   - Reportar archivos más grandes
```

### Configuración Cleanup Service
```bash
# Cleanup Service Environment Variables
PORT=5905
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5437
DB_USERNAME=cleanup_user
DB_PASSWORD=cleanup_password
DB_NAME=cleanup_db

# Cleanup Configuration
UPLOAD_TIMEOUT_HOURS=6
CHUNK_TIMEOUT_HOURS=6
TEMP_FILE_TIMEOUT_HOURS=24
CLEANUP_SCHEDULE_CRON='0 */1 * * *'  # Cada hora
STORAGE_ALERT_THRESHOLD=10            # % libre mínimo

# Storage Paths
UPLOADS_PATH=/uploads
CHUNKS_PATH=/uploads/chunks
TEMP_PATH=/uploads/temp
PROCESSED_PATH=/uploads/processed
```

### Endpoints Cleanup Service
```typescript
GET  /cleanup/health                   // Health check
POST /cleanup/run/:jobType            // Ejecutar cleanup manual
GET  /cleanup/stats                   // Estadísticas de limpieza
GET  /cleanup/jobs                    // Historia de trabajos
GET  /cleanup/rules                   // Reglas de cleanup
PUT  /cleanup/rules/:id               // Actualizar regla
POST /cleanup/storage-report          // Generar reporte de storage
GET  /cleanup/preview/:jobType        // Preview de qué se eliminaría
```

---

## 📢 **ACLARACIÓN REQUERIDA: NOTIFICACIONES**

### Tipos de Notificaciones Identificados
```typescript
// NIVEL 1: Notificaciones de Procesamiento (Solo Uploader)
MEDIA_PROCESSING_STARTED    → Solo quien subió el archivo
MEDIA_PROCESSING_COMPLETED  → Solo quien subió el archivo  
MEDIA_PROCESSING_FAILED     → Solo quien subió el archivo

// NIVEL 2: Notificaciones de Disponibilidad (¿?)
MEDIA_AVAILABLE_FOR_ALL     → ❓ ¿Quién debe recibirla?
```

### ✅ **Regla de Negocio Definida**: 
Una vez que el procesamiento esté completo y el media esté disponible:

**Notificar a todos los usuarios** ✅
- **Notificaciones de procesamiento** (start/progress/complete/failed) → Solo uploader
- **Notificación "nuevo media disponible"** → Todos los usuarios del sistema
- **Tipo de notificación**: `MEDIA_AVAILABLE_PUBLIC` con datos del nuevo contenido

---

## 🔄 **FLUJO CORREGIDO COMPLETO**

```typescript
// FLUJO ACTUALIZADO Y CORREGIDO:

1. Usuario: init-upload → Media Service crea registro PENDING
2. Usuario: upload-chunk(s) → Media Service almacena chunks
3. Usuario: complete-upload → Media Service ensambla archivo
4. Media Service: Publica 'media.uploaded.for.processing' ✅
5. Processing Service: Encola job de procesamiento
6. Processing Service: 'media.processing.started' → Notification (solo uploader)
7. Processing Service: Procesa (compress + thumbnail + watermark)
8. Processing Service: 'media.processing.completed' → Updates + Notification (uploader)
9. ✅ Processing Service: 'media.available.public' → Notification (todos los usuarios)

// LIMPIEZA PARALELA:
Cleanup Service (cada hora): 
- Busca uploads PENDING >6h sin chunks → DELETE
- Busca chunks sin actividad >6h → DELETE + mark FAILED
- Cleanup archivos temp >24h → DELETE
```

---

## ✅ **RESUMEN DE MODIFICACIONES ACTUALIZADAS**

### 🔐 Auth Service (5900)
- **Sin cambios** - No requiere modificaciones

### 📁 Media Service (5901)
- ✅ **Modificaciones en Controller**
  - ✅ Agregar evento `media.uploaded.for.processing` en endpoint `complete-upload`
  - ✅ Emitir evento solo cuando archivo esté completamente ensamblado
  - ✅ Incluir metadata completa en el evento (path, size, mimeType)

- ✅ **Extensión de Entity MediaFile**
  - ✅ Campo `processingStatus` (PENDING, PROCESSING, COMPLETED, FAILED)
  - ✅ Campo `processedVariants` (JSON array de versiones procesadas)
  - ✅ Campo `thumbnails` (JSON array de thumbnails generados)
  - ✅ Campo `compressionStats` (estadísticas de compresión)

- ✅ **Nuevos métodos en MediaService**
  - ✅ `updateProcessingStatus(mediaId, status, data)`
  - ✅ `addProcessedVariant(mediaId, variant)`
  - ✅ `setThumbnails(mediaId, thumbnails)`
  - ✅ `getProcessingInfo(mediaId)`

- ✅ **Event Listeners**
  - ✅ Listener para `media.processing.completed`
  - ✅ Listener para `media.thumbnails.generated`
  - ✅ Actualización automática de registros

### 💬 Comments Service (5902)
- ✅ Agregar integración con thumbnails para previews
- ✅ Listener para `media.thumbnails.generated`

### 🔔 Notifications Service (5903)
- ✅ **Nuevos Tipos de Notificaciones**
  - ✅ `MEDIA_PROCESSING_STARTED` (solo uploader)
  - ✅ `MEDIA_PROCESSING_PROGRESS` (solo uploader)
  - ✅ `MEDIA_PROCESSING_COMPLETED` (solo uploader)
  - ✅ `MEDIA_PROCESSING_FAILED` (solo uploader)
  - ✅ `MEDIA_AVAILABLE_PUBLIC` (todos los usuarios) ✅
  - ✅ `MEDIA_THUMBNAILS_GENERATED` (solo uploader)

- ✅ **Event Listeners Específicos**
  - ✅ Listener para `media.processing.started`
  - ✅ Listener para `media.processing.progress` (WebSocket real-time)
  - ✅ Listener para `media.processing.completed`
  - ✅ Listener para `media.processing.failed`
  - ✅ Listener para `media.available.public` (broadcast a todos)

- ✅ **Sistema de Broadcasting**
  - ✅ Notificaciones privadas para uploader
  - ✅ Notificaciones públicas para todos los usuarios
  - ✅ WebSocket real-time para progreso de procesamiento
  - ✅ Rate limiting para prevenir spam de notificaciones

### 🎨 Processing Service (5904) - NUEVO
- ✅ **Estructura base del servicio**
  - ✅ Setup NestJS con TypeScript
  - ✅ Configuración de base de datos PostgreSQL (puerto 5436)
  - ✅ Integración con Redis Queue (Bull)
  - ✅ Event listeners para media upload events
  - ✅ Health check endpoint
  - ✅ Swagger documentation setup

- ✅ **Módulo de Compresión Inteligente**
  - ✅ ImageCompressionService (Sharp)
    - ✅ Algoritmo adaptativo JPEG/WebP/AVIF
    - ✅ Calidad automática según tamaño original
    - ✅ Preservación de metadatos importantes
  - ✅ VideoCompressionService (FFmpeg)
    - ✅ Compresión H.264/H.265 
    - ✅ Bitrate adaptativo según resolución
    - ✅ Múltiples resoluciones (480p, 720p, 1080p)
  - ✅ AudioCompressionService (FFmpeg)
    - ✅ Compresión AAC/OGG optimizada
    - ✅ Bitrate adaptativo según calidad original

- ✅ **Módulo de Thumbnails Automáticos**
  - ✅ ImageThumbnailService
    - ✅ Redimensionamiento a 150x150 y 300x300
    - ✅ Mantener aspect ratio
    - ✅ Formato optimizado (WebP preferred)
  - ✅ VideoThumbnailService 
    - ✅ Extracción de 10 frames en momentos clave
    - ✅ Thumbnail principal del frame medio
    - ✅ Generación de sprite sheet de previews
  - ✅ AudioThumbnailService
    - ✅ Generación de icono Material Design
    - ✅ Waveform visual básico con Canvas
    - ✅ Conversión a imagen PNG/WebP

- ✅ **Sistema de Queue y Jobs**
  - ✅ Queue management con Bull/Redis
  - ✅ Job processors por tipo de media
  - ✅ Progress tracking en tiempo real
  - ✅ Error handling y retry logic
  - ✅ Rate limiting y concurrency control

- ✅ **Storage y File Management**
  - ✅ Organización de directorios optimizada
  - ✅ Cleanup de archivos temporales
  - ✅ Path resolution para versiones procesadas
  - ✅ File metadata tracking

### 🧹 Cleanup Service (5905) - NUEVO ✅
- ✅ Microservicio de limpieza y mantenimiento
- ✅ Base de datos PostgreSQL independiente (puerto 5437)
- ✅ Jobs programados con cron para cleanup automático
- ✅ Cleanup de uploads/chunks abandonados >6 horas
- ✅ Métricas y reportes de espacio recuperado

### 🐳 Docker Infrastructure
- ✅ Nueva base de datos PostgreSQL Processing (puerto 5436)
- ✅ Nueva base de datos PostgreSQL Cleanup (puerto 5437)
- ✅ Dos nuevos servicios en docker-compose
- ✅ Volúmenes expandidos para estructura de archivos

---

## 🛣️ **ROADMAP DE FUNCIONALIDADES FUTURAS**

### 🎯 **FASE 2: Sistema de Recomendaciones (Alta Prioridad)**
```typescript
// Para el frontend Flutter: Lista de medias estilo YouTube

📱 FUNCIONALIDAD OBJETIVO:
- Lista lateral de videos relacionados al contenido actual
- Algoritmo de recomendación basado en tags/categorías
- API endpoints para "videos similares" y "videos relacionados"
```

#### Nuevos Endpoints Requeridos (Media Service)
```typescript
GET /media/related/:mediaId          // Videos relacionados al actual
GET /media/recommendations/:userId   // Recomendaciones personalizadas  
GET /media/trending                  // Contenido trending/popular
GET /media/by-tags?tags=action,drama // Filtrar por tags específicos
```

#### Sistema de Tags/Categorización
```typescript
// Nuevas entidades para el Media Service:

// MediaTag Entity
{
  id: string (UUID),
  mediaId: string,
  tag: string,              // "action", "comedy", "tutorial", etc.
  confidence: number,       // 0-1 (si es auto-generado por IA)
  source: enum,             // MANUAL, AUTO_AI, USER_SUGGESTED
  created_at: Date
}

// MediaCategory Entity  
{
  id: string (UUID),
  mediaId: string,
  category: enum,           // VIDEO, AUDIO, IMAGE
  subcategory: string,      // "gaming", "music", "education", etc.
  primaryTag: string,       // Tag principal del contenido
  created_at: Date
}
```

#### Algoritmo de Recomendación Básico
```typescript
// Lógica para encontrar contenido similar:

1. Obtener tags del media actual
2. Buscar otros medias con tags similares  
3. Calcular score de similitud
4. Filtrar por popularidad/recencia
5. Devolver lista ordenada por relevancia

// Ejemplo de scoring:
similarityScore = 
  (tagsEnComun / totalTags) * 0.6 +     // Similitud de tags
  (popularityScore) * 0.3 +              // Popularidad 
  (recencyScore) * 0.1                   // Qué tan reciente es
```

### 📰 **FASE 3: Sistema de Feed (Alta Prioridad)**
```typescript
// Feed cronológico de contenido nuevo

📱 FUNCIONALIDAD OBJETIVO:
- Timeline de contenido nuevo
- Filtros por tipo de media
- Infinite scroll / paginación
- Cache inteligente para performance
```

#### Nuevos Endpoints Feed
```typescript
GET /feed                        // Feed general cronológico
GET /feed/personalized/:userId   // Feed personalizado
GET /feed/by-type/:mediaType     // Solo videos, solo imágenes, etc.
POST /feed/mark-seen/:mediaId    // Marcar como visto
```

#### Feed Entity
```typescript
// FeedItem Entity (nueva BD o en Media Service)
{
  id: string (UUID),
  mediaId: string,
  userId: string,           // Quien subió el contenido
  feedType: enum,           // PUBLIC, TRENDING, RECOMMENDED
  publishedAt: Date,        // Cuándo se hizo público
  score: number,            // Score para ordenamiento
  created_at: Date
}
```

### 🎨 **FASE 4: Sistema de Watermarking (Baja Prioridad)**
```typescript
// Watermarking complejo con interfaz de administración

📱 FUNCIONALIDAD OBJETIVO:
- Interfaz para subir imágenes de watermark
- Editor de transparencia y posicionamiento
- Watermarking visual configurable
- Watermarking en metadatos
```

#### Watermarking Management
```typescript
// Nuevos endpoints para administración de watermarks:

POST /watermark/upload-image        // Subir imagen de watermark
PUT  /watermark/config              // Configurar posición, opacidad, etc.
GET  /watermark/preview/:mediaId    // Preview con watermark aplicado
POST /watermark/apply/:mediaId      // Aplicar watermark a media existente
```

#### Watermark Entities
```typescript
// WatermarkTemplate Entity
{
  id: string (UUID),
  name: string,
  imagePath: string,        // Ruta de la imagen del watermark
  opacity: number,          // 0-1
  position: enum,           // TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, etc.
  offsetX: number,          // Offset horizontal
  offsetY: number,          // Offset vertical
  isActive: boolean,
  createdBy: string,
  created_at: Date
}
```

#### Interfaz de Administración
```typescript
// Componentes de UI requeridos:
- Upload de imagen con preview
- Slider de transparencia
- Grid de posicionamiento
- Preview en tiempo real
- Configuración por tipo de media
```

### 👥 **FASE 5: Sistema de Seguidores (Baja Prioridad)**
```typescript
// Funcionalidad social básica

📱 FUNCIONALIDAD OBJETIVO:
- Seguir/No seguir usuarios
- Feed de contenido de usuarios seguidos
- Notificaciones de nuevo contenido de seguidos
```

#### Nuevos Endpoints Sociales
```typescript
POST /social/follow/:userId      // Seguir usuario
DELETE /social/unfollow/:userId  // Dejar de seguir
GET /social/followers/:userId    // Seguidores de usuario
GET /social/following/:userId    // A quién sigue el usuario
GET /social/feed/:userId         // Feed de usuarios seguidos
```

#### Social Entities
```typescript
// Follow Entity (Auth Service o nuevo Social Service)
{
  id: string (UUID),
  followerId: string,       // Quien sigue
  followeeId: string,       // A quien sigue
  createdAt: Date,
  isActive: boolean
}
```

### 🤖 **FASE 6: IA Avanzada (Futuro)**
```typescript
// Integración con servicios de IA para auto-tagging

🔮 FUNCIONALIDADES FUTURAS:
- Auto-generación de tags con Google Vision API
- Análisis de contenido con OpenAI
- Detección automática de categorías
- Generación de descripciones automáticas
- Content moderation con IA
```

---

## 🎯 **PLAN ACTUALIZADO PARA IMPLEMENTACIÓN INMEDIATA**

### ✅ **Notificaciones Definidas Completamente**
```typescript
// NUEVOS TIPOS DE NOTIFICACIONES:

// Para el Uploader únicamente:
MEDIA_PROCESSING_STARTED = 'MEDIA_PROCESSING_STARTED',
MEDIA_PROCESSING_PROGRESS = 'MEDIA_PROCESSING_PROGRESS', 
MEDIA_PROCESSING_COMPLETED = 'MEDIA_PROCESSING_COMPLETED',
MEDIA_PROCESSING_FAILED = 'MEDIA_PROCESSING_FAILED',

// Para todos los usuarios:
MEDIA_AVAILABLE_PUBLIC = 'MEDIA_AVAILABLE_PUBLIC',      // ✅ NUEVO
MEDIA_THUMBNAILS_GENERATED = 'MEDIA_THUMBNAILS_GENERATED'
```

### 🔄 **Flujo Final Completo**
```typescript
// FLUJO DEFINITIVO:

1. Usuario: init-upload → Media Service (registro PENDING)
2. Usuario: upload-chunk(s) → Media Service (almacena chunks)  
3. Usuario: complete-upload → Media Service (ensambla archivo)
4. Media Service: 'media.uploaded.for.processing' → Processing Service
5. Processing Service: 'media.processing.started' → Notification (solo uploader)
6. Processing Service: Procesa archivo (compress + thumbnail + watermark)
7. Processing Service: 'media.processing.completed' → Media Service + Notification (uploader)
8. Processing Service: 'media.available.public' → Notification (TODOS los usuarios) ✅

// Paralelo: Cleanup Service limpia archivos huérfanos cada hora
```

### 📊 **Implementación por Prioridades**
```
🏗️ INMEDIATO (Esta implementación):
├── Processing Service (5904) - Compresión + thumbnails + watermarks
├── Cleanup Service (5905) - Limpieza automática
└── Notificaciones completas - Uploader privadas + públicas para todos

📱 ALTA PRIORIDAD (Siguiente):
├── Endpoints de recomendaciones para Flutter
├── Sistema de tags/categorización  
└── Feed cronológico de contenido

👥 BAJA PRIORIDAD (Futuro):
├── Sistema de watermarking completo con UI
├── Sistema de seguidores
├── Feed personalizado por seguidos
└── Funcionalidades sociales avanzadas

🤖 FUTURO (Cuando esté maduro):
└── IA para auto-tagging y recomendaciones inteligentes
```

¿Te parece perfecto este plan actualizado? **¿Procedemos con la implementación del Processing Service (5904) y Cleanup Service (5905)?** 