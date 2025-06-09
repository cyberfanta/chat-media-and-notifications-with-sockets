import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: '*',
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

  // Configurar archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Configurar Swagger para la API
  const config = new DocumentBuilder()
    .setTitle('Monitoring Dashboard API')
    .setDescription('API para el dashboard de monitoreo de procesamiento multimedia')
    .setVersion('1.0')
    .addTag('dashboard', 'Endpoints del dashboard de monitoreo')
    .addTag('queue', 'Monitoreo de cola de procesamiento')
    .addTag('notifications', 'Monitoreo de notificaciones')
    .addTag('stats', 'Estadísticas del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Monitoring Dashboard - API Documentation',
  });

  // Configurar puerto
  const port = process.env.PORT || 5906;
  
  await app.listen(port);
  
  console.log(`🖥️  Monitoring Dashboard is running on: http://localhost:${port}`);
  console.log(`📊 Dashboard UI: http://localhost:${port}/dashboard`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health check: http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  console.error('❌ Error starting Monitoring Dashboard:', err);
  process.exit(1);
}); 