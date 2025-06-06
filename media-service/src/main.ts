import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Media Service API')
    .setDescription('Microservicio para gestión de archivos multimedia con upload multipart')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('media', 'Gestión de archivos multimedia')
    .addTag('health', 'Estado del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5901;
  await app.listen(port);
  console.log(`🎬 Media Service ejecutándose en puerto ${port}`);
  console.log(`📖 Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap(); 