# 📮 Colección de Postman - Plataforma de Contenido Multimedia

Esta colección de Postman incluye todos los endpoints de los microservicios para testing y desarrollo.

## 🚀 Importar en Postman

1. Copia el JSON completo de abajo
2. Abre Postman
3. Click en "Import" 
4. Pega el JSON
5. ¡Listo para usar!

## 📝 Configuración Previa

**Variables de entorno sugeridas:**
- `baseUrl`: `http://localhost`
- `authToken`: Tu JWT token (se obtiene automáticamente con los requests de login)

---

## 🔗 Colección JSON (v2.1)

```json
{
  "info": {
    "name": "Plataforma Multimedia - Microservicios",
    "description": "Colección completa de endpoints para la plataforma de contenido multimedia con microservicios de autenticación, media, comentarios y notificaciones.",
    "version": "1.0.0",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "userId",
      "value": "",
      "type": "string"
    },
    {
      "key": "mediaId",
      "value": "",
      "type": "string"
    },
    {
      "key": "commentId",
      "value": "",
      "type": "string"
    },
    {
      "key": "notificationId",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "🔐 Auth Service (5900)",
      "description": "Endpoints de autenticación y gestión de usuarios",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"usuario@ejemplo.com\",\n  \"password\": \"mipassword123\",\n  \"firstName\": \"Juan\",\n  \"lastName\": \"Pérez\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}:5900/auth/register",
              "host": ["{{baseUrl}}"],
              "port": "5900",
              "path": ["auth", "register"]
            }
          },
          "response": []
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.environment.set('authToken', response.access_token);",
                  "    pm.environment.set('userId', response.user.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"usuario@ejemplo.com\",\n  \"password\": \"mipassword123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}:5900/auth/login",
              "host": ["{{baseUrl}}"],
              "port": "5900",
              "path": ["auth", "login"]
            }
          },
          "response": []
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}:5900/auth/profile",
              "host": ["{{baseUrl}}"],
              "port": "5900",
              "path": ["auth", "profile"]
            }
          },
          "response": []
        },
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}:5900/auth/health",
              "host": ["{{baseUrl}}"],
              "port": "5900",
              "path": ["auth", "health"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "📁 Media Service (5901)",
      "description": "Endpoints de gestión de archivos multimedia",
      "item": [
        {
          "name": "Initialize Upload",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 201) {",
                  "    const response = pm.response.json();",
                  "    pm.environment.set('mediaId', response.id);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"originalName\": \"mi_video.mp4\",\n  \"mimeType\": \"video/mp4\",\n  \"type\": \"video\",\n  \"totalSize\": 104857600,\n  \"totalChunks\": 100\n}"
            },
            "url": {
              "raw": "{{baseUrl}}:5901/media/init-upload",
              "host": ["{{baseUrl}}"],
              "port": "5901",
              "path": ["media", "init-upload"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Media",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}:5901/media?page=1&limit=10",
              "host": ["{{baseUrl}}"],
              "port": "5901",
              "path": ["media"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}:5901/media/health",
              "host": ["{{baseUrl}}"],
              "port": "5901",
              "path": ["media", "health"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "💬 Comments Service (5902)",
      "description": "Endpoints de gestión de comentarios",
      "item": [
        {
          "name": "Create Comment",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"content\": \"¡Excelente contenido!\",\n  \"parentId\": null\n}"
            },
            "url": {
              "raw": "{{baseUrl}}:5902/comments/content/content-123",
              "host": ["{{baseUrl}}"],
              "port": "5902",
              "path": ["comments", "content", "content-123"]
            }
          },
          "response": []
        },
        {
          "name": "Get Comments",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}:5902/comments/content/content-123?page=1&limit=10",
              "host": ["{{baseUrl}}"],
              "port": "5902",
              "path": ["comments", "content", "content-123"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}:5902/comments/health",
              "host": ["{{baseUrl}}"],
              "port": "5902",
              "path": ["comments", "health"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "🔔 Notifications Service (5903)",
      "description": "Endpoints de gestión de notificaciones",
      "item": [
        {
          "name": "Get Notifications",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}:5903/notifications?page=1&limit=10",
              "host": ["{{baseUrl}}"],
              "port": "5903",
              "path": ["notifications"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Create Notification",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{authToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"type\": \"NEW_COMMENT\",\n  \"title\": \"Nuevo comentario\",\n  \"message\": \"Tienes un nuevo comentario\",\n  \"priority\": \"medium\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}:5903/notifications",
              "host": ["{{baseUrl}}"],
              "port": "5903",
              "path": ["notifications"]
            }
          },
          "response": []
        },
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}:5903/health",
              "host": ["{{baseUrl}}"],
              "port": "5903",
              "path": ["health"]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
```

## 📋 Instrucciones de Uso

### 1. **Variables de Entorno**
Configura en Postman:
- `baseUrl`: `http://localhost`

### 2. **Flujo Recomendado**
1. Verificar servicios con "Health Check"
2. Registrar usuario con "Register User"
3. Hacer login con "Login" (guarda token automáticamente)
4. Probar otros endpoints

### 3. **Scripts Automáticos**
- Login guarda automáticamente el token JWT
- Initialize Upload guarda el mediaId

Esta colección incluye los endpoints principales de cada servicio para testing básico y desarrollo. 