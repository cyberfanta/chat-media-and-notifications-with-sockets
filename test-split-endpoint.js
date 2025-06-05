const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testSplitEndpoint() {
  try {
    // 1. Login para obtener token
    console.log('🔐 Haciendo login...');
    const loginResponse = await fetch('http://localhost:5900/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en login: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login exitoso');

    // 2. Crear archivo de prueba si no existe
    const testContent = 'Este es un archivo de prueba para testing del upload multimedia. Contiene texto suficiente para dividir en chunks y probar la funcionalidad completa.';
    fs.writeFileSync('test-file.txt', testContent);
    console.log('📄 Archivo de prueba creado');

    // 3. Probar endpoint split-file
    console.log('🔪 Probando endpoint split-file...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-file.txt'));
    formData.append('chunks', '3');

    const splitResponse = await fetch('http://localhost:5901/media/split-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!splitResponse.ok) {
      const errorText = await splitResponse.text();
      throw new Error(`Error en split-file: ${splitResponse.statusText} - ${errorText}`);
    }

    const splitData = await splitResponse.json();
    console.log('✅ Endpoint split-file funcionando correctamente!');
    console.log('📊 Resultado:');
    console.log(`   - Archivo original: ${splitData.originalName}`);
    console.log(`   - Tamaño original: ${splitData.originalSize} bytes`);
    console.log(`   - Total chunks: ${splitData.totalChunks}`);
    console.log(`   - Tamaño por chunk: ~${splitData.chunkSize} bytes`);
    
    // Mostrar información de los primeros chunks
    console.log('📦 Chunks generados:');
    splitData.chunks.forEach((chunk, index) => {
      console.log(`   Chunk ${chunk.chunkNumber}: ${chunk.size} bytes`);
      if (index < 2) { // Mostrar solo los primeros 2 chunks
        console.log(`      Data preview: ${chunk.data.substring(0, 50)}...`);
      }
    });

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('💡 El token JWT está siendo validado correctamente con el auth-service');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

testSplitEndpoint(); 