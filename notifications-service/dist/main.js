"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Notifications Service API')
        .setDescription(`
      ## 🔔 Microservicio de Notificaciones

      Sistema completo de notificaciones en tiempo real con WebSockets y API REST.

      ### 🎯 Características Principales

      - ✅ **Notificaciones en tiempo real** vía WebSocket (Socket.IO)
      - ✅ **API REST completa** para gestión de notificaciones
      - ✅ **Cache inteligente** con Redis para mejor rendimiento
      - ✅ **Pub/Sub** entre microservicios para eventos
      - ✅ **Rate limiting** para prevenir spam
      - ✅ **Múltiples tipos** de notificaciones (auth, media, comments, sistema)
      - ✅ **Filtros avanzados** y paginación
      - ✅ **Autenticación JWT** en todos los endpoints

      ### 📡 Conexión Socket.IO

      **URL**: \`ws://localhost:5903/notifications\`
      
      **Autenticación**: Envía el token JWT en el query string:
      \`\`\`javascript
      const socket = io('ws://localhost:5903/notifications', {
        query: { token: 'tu_token_jwt_aqui' }
      });
      \`\`\`

      ### 🎮 Eventos WebSocket Disponibles

      #### Eventos que puedes enviar:
      - **\`join_notifications\`**: Unirse a notificaciones del usuario
      - **\`get_notifications\`**: Obtener notificaciones con filtros
      - **\`mark_as_read\`**: Marcar notificaciones como leídas

      #### Eventos que recibirás:
      - **\`new_notification\`**: Nueva notificación en tiempo real
      - **\`unread_count\`**: Contador de notificaciones no leídas
      - **\`unread_notifications\`**: Lista de notificaciones no leídas
      - **\`marked_as_read\`**: Confirmación de marcado como leído
      - **\`notifications\`**: Lista de notificaciones solicitadas
      - **\`error\`**: Errores de autenticación o procesamiento

      ### 🧪 Cliente de Testing
      
      **URL**: http://localhost:8080
      
      Incluye un cliente web completo para probar todas las funcionalidades de Socket.IO.
    `)
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    }, 'access-token')
        .addTag('notifications', 'Gestión de notificaciones')
        .addTag('health', 'Estado del servicio')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 5903;
    await app.listen(port);
    console.log(`🔔 Notifications Service ejecutándose en puerto ${port}`);
    console.log(`📖 Documentación Swagger: http://localhost:${port}/api/docs`);
    console.log(`📡 Socket.IO: ws://localhost:${port}/notifications`);
}
bootstrap();
//# sourceMappingURL=main.js.map