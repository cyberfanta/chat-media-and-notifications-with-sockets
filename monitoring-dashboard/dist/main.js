"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Monitoring Dashboard API')
        .setDescription('API para el dashboard de monitoreo de procesamiento multimedia')
        .setVersion('1.0')
        .addTag('dashboard', 'Endpoints del dashboard de monitoreo')
        .addTag('queue', 'Monitoreo de cola de procesamiento')
        .addTag('notifications', 'Monitoreo de notificaciones')
        .addTag('stats', 'Estadísticas del sistema')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Monitoring Dashboard - API Documentation',
    });
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
//# sourceMappingURL=main.js.map