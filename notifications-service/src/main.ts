import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5900', 'http://localhost:5901', 'http://localhost:5902', 'http://localhost:5903', 'http://localhost:8080'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['Content-Range', 'Accept-Ranges'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Notifications Microservice API')
    .setDescription(`
      Microservicio de notificaciones con WebSockets y Redis.
      
      ## Características principales:
      - **CRUD completo** de notificaciones
      - **WebSockets** para notificaciones en tiempo real  
      - **Redis** para cache y pub/sub
      - **Autenticación JWT** en todos los endpoints
      - **Filtros y paginación** avanzados
      - **Rate limiting** para prevenir spam
      - **Múltiples canales** de entrega (WebSocket, Email, Push)
      
      ## Tipos de notificaciones soportadas:
      - Notificaciones de autenticación (registro, login, seguridad)
      - Notificaciones de contenido multimedia (uploads, procesamiento)
      - Notificaciones de comentarios e interacciones sociales
      - Notificaciones del sistema y mantenimiento
      
      ## Uso de WebSockets:
      - **URL**: ws://localhost:5903/notifications
      - **Autenticación**: Token JWT vía query string (?token=JWT) o header Authorization
      - **Eventos disponibles**: join_notifications, mark_as_read, get_notifications
      - **Eventos recibidos**: new_notification, unread_count, unread_notifications
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Notificaciones', 'CRUD de notificaciones con WebSockets')
    .addTag('Health', 'Health check del microservicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  // Start the server
  const port = process.env.PORT || 5903;
  await app.listen(port);
  
  console.log(`🚀 Notifications Service ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
  console.log(`🔄 WebSocket servidor en: ws://localhost:${port}/notifications`);
  console.log(`📡 Redis para pub/sub y cache configurado`);
}

bootstrap(); 