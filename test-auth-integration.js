const axios = require('axios');

// Configuración de servicios (puertos del docker-compose)
const AUTH_SERVICE_URL = 'http://localhost:5900';
const MEDIA_SERVICE_URL = 'http://localhost:5901';
const COMMENTS_SERVICE_URL = 'http://localhost:5902';

async function testAuthentication() {
  console.log('🧪 Testing JWT Authentication Integration\n');

  try {
    // 1. Registrar un usuario de prueba
    console.log('1️⃣ Registrando usuario de prueba...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    try {
      await axios.post(`${AUTH_SERVICE_URL}/auth/register`, registerData);
      console.log('✅ Usuario registrado correctamente');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Usuario ya existe, continuando...');
      } else {
        throw error;
      }
    }

    // 2. Hacer login y obtener token
    console.log('\n2️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');
    console.log(`📄 Token: ${token.substring(0, 20)}...`);

    // 3. Validar token directamente con auth-service
    console.log('\n3️⃣ Validando token con auth-service...');
    const validateResponse = await axios.post(`${AUTH_SERVICE_URL}/auth/validate-token`, {
      token: token
    });
    console.log('✅ Token validado correctamente');
    console.log(`👤 Usuario: ${validateResponse.data.email} (${validateResponse.data.role})`);

    // 4. Probar media-service
    console.log('\n4️⃣ Probando media-service...');
    try {
      const mediaResponse = await axios.post(
        `${MEDIA_SERVICE_URL}/media/init-upload`,
        {
          originalName: 'test-video.mp4',
          type: 'video',
          totalSize: 1024000,
          totalChunks: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Media-service: Autenticación exitosa');
      console.log(`📁 Upload ID: ${mediaResponse.data.uploadId}`);
    } catch (error) {
      console.log('❌ Media-service: Error de autenticación');
      console.log(`Error: ${error.response?.data?.message || error.message}`);
    }

    // 5. Probar comments-service
    console.log('\n5️⃣ Probando comments-service...');
    try {
      const commentsResponse = await axios.post(
        `${COMMENTS_SERVICE_URL}/comments/media/test-video-123`,
        {
          content: 'Este es un comentario de prueba',
          contentId: 'test-video-123'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Comments-service: Autenticación exitosa');
      console.log(`💬 Comment ID: ${commentsResponse.data.id}`);
    } catch (error) {
      console.log('❌ Comments-service: Error de autenticación');
      console.log(`Error: ${error.response?.data?.message || error.message}`);
    }

    // 6. Probar health checks
    console.log('\n6️⃣ Probando health checks...');
    
    const authHealth = await axios.get(`${AUTH_SERVICE_URL}/auth/health`);
    console.log(`✅ Auth-service: ${authHealth.data.status}`);

    try {
      const mediaHealth = await axios.get(`${MEDIA_SERVICE_URL}/health`);
      console.log(`✅ Media-service: ${mediaHealth.data.status}`);
    } catch (error) {
      console.log('❌ Media-service: No disponible');
    }

    try {
      const commentsHealth = await axios.get(`${COMMENTS_SERVICE_URL}/comments/health`);
      console.log(`✅ Comments-service: ${commentsHealth.data.status}`);
    } catch (error) {
      console.log('❌ Comments-service: No disponible');
    }

    console.log('\n🎉 ¡Pruebas completadas!');

  } catch (error) {
    console.error('\n💥 Error durante las pruebas:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

// Función para verificar servicios disponibles
async function checkServices() {
  console.log('🔍 Verificando servicios disponibles...\n');
  
  const services = [
    { name: 'Auth Service', url: AUTH_SERVICE_URL },
    { name: 'Media Service', url: MEDIA_SERVICE_URL },
    { name: 'Comments Service', url: COMMENTS_SERVICE_URL }
  ];

  for (const service of services) {
    try {
      let healthUrl = `${service.url}/health`;
      if (service.name === 'Comments Service') {
        healthUrl = `${service.url}/comments/health`;
      } else if (service.name === 'Auth Service') {
        healthUrl = `${service.url}/auth/health`;
      }
      await axios.get(healthUrl, { timeout: 2000 });
      console.log(`✅ ${service.name}: Disponible`);
    } catch (error) {
      console.log(`❌ ${service.name}: No disponible (${service.url})`);
    }
  }
  console.log('');
}

// Función principal
async function main() {
  console.log('🚀 JWT Authentication Integration Test\n');
  
  await checkServices();
  await testAuthentication();
}

if (require.main === module) {
  main();
} 