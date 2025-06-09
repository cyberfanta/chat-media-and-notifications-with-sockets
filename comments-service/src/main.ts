import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Comments Service API')
    .setDescription('Microservicio de comentarios con moderación y sistema jerárquico')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('comments', 'Gestión de comentarios')
    .addTag('health', 'Estado del servicio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5902;
  await app.listen(port);
  console.log(`💬 Comments Service ejecutándose en puerto ${port}`);
  console.log(`📖 Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap(); 