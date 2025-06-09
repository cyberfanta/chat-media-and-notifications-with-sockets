import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Cleanup Service API')
    .setDescription('Microservicio de limpieza automática del sistema - Chunks, uploads y archivos temporales')
    .setVersion('1.0')
    .addTag('cleanup', 'Endpoints de limpieza del sistema')
    .addTag('storage', 'Monitoreo de almacenamiento')
    .addTag('health', 'Health checks y monitoreo del servicio')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Cleanup Service - API Documentation',
  });

  // Configurar puerto
  const port = process.env.PORT || 5905;
  
  await app.listen(port);
  
  console.log(`🧹 Cleanup Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health check: http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  console.error('❌ Error starting Cleanup Service:', err);
  process.exit(1);
}); 