const fetch = require('node-fetch');

async function testSimpleComment() {
  try {
    console.log('🔐 Obteniendo token...');
    
    // 1. Login
    const loginResponse = await fetch('http://localhost:5900/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en login: ${loginResponse.statusText}`);
    }

    const { access_token: token } = await loginResponse.json();
    console.log(`✅ Token obtenido: ${token.substring(0, 50)}...`);

    // 2. Crear comentario
    console.log('\n💬 Creando comentario...');
    
    const commentResponse = await fetch('http://localhost:5902/comments/content/12345678-1234-1234-1234-123456789012', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: 'Este es un comentario de prueba 🎉',
        contentId: '12345678-1234-1234-1234-123456789012',
      }),
    });

    console.log(`Status: ${commentResponse.status}`);
    
    if (commentResponse.ok) {
      const comment = await commentResponse.json();
      console.log('✅ Comentario creado exitosamente:');
      console.log(`   ID: ${comment.id}`);
      console.log(`   Contenido: ${comment.content}`);
      console.log(`   Estado: ${comment.status}`);
      console.log(`   Usuario: ${comment.userEmail}`);
    } else {
      const errorText = await commentResponse.text();
      console.log(`❌ Error creando comentario: ${commentResponse.status} ${commentResponse.statusText}`);
      console.log(`   Respuesta: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleComment(); 