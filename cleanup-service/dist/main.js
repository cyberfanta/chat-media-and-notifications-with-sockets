"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:8080'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Cleanup Service API')
        .setDescription('Microservicio de limpieza automática del sistema - Chunks, uploads y archivos temporales')
        .setVersion('1.0')
        .addTag('cleanup', 'Endpoints de limpieza del sistema')
        .addTag('storage', 'Monitoreo de almacenamiento')
        .addTag('jobs', 'Gestión de trabajos programados')
        .addTag('health', 'Health checks y monitoreo del servicio')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Cleanup Service - API Documentation',
    });
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
//# sourceMappingURL=main.js.map