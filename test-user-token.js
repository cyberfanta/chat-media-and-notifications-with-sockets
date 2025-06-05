const fetch = require('node-fetch');

async function testUserToken() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2ZhZDQ3YS0zMTQ3LTQ3ZDEtOGNlYy0zMzYwZDMxM2ZjMzIiLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0OTE0MTA4NCwiZXhwIjoxNzQ5MjI3NDg0fQ.RTaOQR0vtwZM-fdkyWwnxvw6LliMhF2YfYO7JChk9DQ';

  try {
    console.log('🔍 Probando token de usuario...');
    
    // 1. Probar validación directa en auth-service
    console.log('📝 Probando validación en auth-service...');
    const authResponse = await fetch('http://localhost:5900/auth/validate-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!authResponse.ok) {
      console.error('❌ Error en auth-service:', authResponse.status, authResponse.statusText);
      const errorText = await authResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ Token válido en auth-service');
    console.log('👤 Usuario:', authData.user.email);
    console.log('🆔 ID:', authData.user.id);

    // 2. Probar endpoint protegido en media-service
    console.log('\n📱 Probando endpoint protegido en media-service...');
    const mediaResponse = await fetch('http://localhost:5901/media', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mediaResponse.ok) {
      console.error('❌ Error en media-service:', mediaResponse.status, mediaResponse.statusText);
      const errorText = await mediaResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const mediaData = await mediaResponse.json();
    console.log('✅ Token válido en media-service');
    console.log('📁 Medias del usuario:', mediaData.length);

    console.log('\n🎉 ¡Token funcionando correctamente en ambos servicios!');
    console.log('💡 Ahora debería funcionar en Swagger UI también');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

testUserToken(); 