const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testSplitWithUserToken() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2ZhZDQ3YS0zMTQ3LTQ3ZDEtOGNlYy0zMzYwZDMxM2ZjMzIiLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc0OTE0MTA4NCwiZXhwIjoxNzQ5MjI3NDg0fQ.RTaOQR0vtwZM-fdkyWwnxvw6LliMhF2YfYO7JChk9DQ';

  try {
    console.log('🔍 Probando endpoint split-file con tu token...');
    
    // Crear archivo de prueba
    const testContent = 'Este es un archivo de prueba para el usuario usuario@ejemplo.com. Contiene suficiente texto para dividir en chunks y verificar que la autenticación JWT funciona correctamente en Swagger UI.';
    fs.writeFileSync('test-user-file.txt', testContent);
    console.log('📄 Archivo de prueba creado');

    // Probar split-file
    console.log('🔪 Probando endpoint split-file...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-user-file.txt'));
    formData.append('chunks', '4');

    const splitResponse = await fetch('http://localhost:5901/media/split-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!splitResponse.ok) {
      const errorText = await splitResponse.text();
      console.error('❌ Error en split-file:', splitResponse.status, splitResponse.statusText);
      console.error('Error details:', errorText);
      return;
    }

    const splitData = await splitResponse.json();
    console.log('✅ Endpoint split-file funcionando correctamente!');
    console.log('📊 Resultado:');
    console.log(`   - Usuario: usuario@ejemplo.com`);
    console.log(`   - Archivo original: ${splitData.originalName}`);
    console.log(`   - Tamaño original: ${splitData.originalSize} bytes`);
    console.log(`   - Total chunks: ${splitData.totalChunks}`);
    console.log(`   - Tamaño por chunk: ~${splitData.chunkSize} bytes`);
    
    console.log('📦 Chunks generados:');
    splitData.chunks.forEach((chunk, index) => {
      console.log(`   Chunk ${chunk.chunkNumber}: ${chunk.size} bytes`);
    });

    console.log('\n🎉 ¡Endpoint funcionando correctamente!');
    console.log('🔧 Configuración para Swagger UI:');
    console.log('   1. Ve a: http://localhost:5901/api/docs');
    console.log('   2. Haz clic en "Authorize" (candado verde)');
    console.log('   3. En el campo "Value" ingresa SOLO el token (sin "Bearer"):');
    console.log(`   ${token}`);
    console.log('   4. Haz clic en "Authorize" y luego "Close"');
    console.log('   5. Ahora puedes usar cualquier endpoint protegido');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

testSplitWithUserToken(); 