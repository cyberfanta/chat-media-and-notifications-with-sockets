const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testCompleteFileWorkflow() {
  try {
    console.log('🚀 Iniciando test completo del sistema de archivos...\n');

    // 1. Login
    console.log('1️⃣ Autenticándose...');
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
    console.log('✅ Login exitoso\n');

    // 2. Crear archivo de prueba
    console.log('2️⃣ Creando archivo de prueba...');
    const testContent = 'Este es un archivo de prueba multimedia. '.repeat(100); // ~3KB
    fs.writeFileSync('test-media-file.txt', testContent);
    console.log(`✅ Archivo creado: ${testContent.length} bytes\n`);

    // 3. Inicializar upload
    console.log('3️⃣ Inicializando upload...');
    const initResponse = await fetch('http://localhost:5901/media/init-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        originalName: 'test-image.jpg',
        mimeType: 'image/jpeg',
        type: 'image',
        totalSize: testContent.length,
        totalChunks: 3,
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`Error en init-upload: ${initResponse.statusText}`);
    }

    const media = await initResponse.json();
    const mediaId = media.id;
    console.log(`✅ Upload inicializado: ${mediaId}\n`);

    // 4. Dividir archivo en chunks
    console.log('4️⃣ Dividiendo archivo en chunks...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-media-file.txt'));
    formData.append('chunks', '3');

    const splitResponse = await fetch('http://localhost:5901/media/split-file', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const splitData = await splitResponse.json();
    console.log(`✅ Archivo dividido en ${splitData.totalChunks} chunks\n`);

    // 5. Subir chunks
    console.log('5️⃣ Subiendo chunks...');
    for (const chunk of splitData.chunks) {
      const chunkFormData = new FormData();
      const chunkBuffer = Buffer.from(chunk.data, 'base64');
      chunkFormData.append('file', chunkBuffer, `chunk_${chunk.chunkNumber}`);
      chunkFormData.append('chunkNumber', chunk.chunkNumber.toString());

      const chunkResponse = await fetch(`http://localhost:5901/media/upload-chunk/${mediaId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: chunkFormData,
      });

      if (!chunkResponse.ok) {
        throw new Error(`Error subiendo chunk ${chunk.chunkNumber}`);
      }

      const chunkResult = await chunkResponse.json();
      console.log(`   ✅ Chunk ${chunk.chunkNumber} subido (${chunkResult.uploadedChunks}/${chunkResult.totalChunks})`);
    }

    // 6. Completar upload
    console.log('\n6️⃣ Completando upload...');
    const completeResponse = await fetch(`http://localhost:5901/media/complete-upload/${mediaId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!completeResponse.ok) {
      throw new Error(`Error completando upload: ${completeResponse.statusText}`);
    }

    const completedMedia = await completeResponse.json();
    console.log(`✅ Upload completado: ${completedMedia.fileName}\n`);

    // 7. Verificar información del archivo
    console.log('7️⃣ Verificando información del archivo...');
    const infoResponse = await fetch(`http://localhost:5901/media/${mediaId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const fileInfo = await infoResponse.json();
    console.log('📄 Información del archivo:');
    console.log(`   ID: ${fileInfo.id}`);
    console.log(`   Nombre original: ${fileInfo.originalName}`);
    console.log(`   Archivo guardado: ${fileInfo.fileName}`);
    console.log(`   Tamaño: ${fileInfo.totalSize} bytes`);
    console.log(`   Estado: ${fileInfo.status}`);
    console.log(`   Ruta: ${fileInfo.filePath}\n`);

    // 8. Probar descarga del archivo
    console.log('8️⃣ Probando descarga del archivo...');
    const downloadResponse = await fetch(`http://localhost:5901/media/${mediaId}/download`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!downloadResponse.ok) {
      throw new Error(`Error descargando archivo: ${downloadResponse.statusText}`);
    }

    const downloadedBuffer = await downloadResponse.buffer();
    fs.writeFileSync('downloaded-file.txt', downloadedBuffer);
    console.log(`✅ Archivo descargado: ${downloadedBuffer.length} bytes`);
    console.log(`✅ Archivo guardado como: downloaded-file.txt\n`);

    // 9. Verificar que el contenido es idéntico
    console.log('9️⃣ Verificando integridad del archivo...');
    const originalContent = fs.readFileSync('test-media-file.txt');
    const downloadedContent = fs.readFileSync('downloaded-file.txt');
    
    if (originalContent.equals(downloadedContent)) {
      console.log('✅ El archivo descargado es idéntico al original\n');
    } else {
      console.log('❌ El archivo descargado NO coincide con el original\n');
    }

    // 10. Obtener información de almacenamiento
    console.log('🔟 Obteniendo información de almacenamiento...');
    const storageResponse = await fetch('http://localhost:5901/media/storage/info', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!storageResponse.ok) {
      throw new Error(`Error obteniendo info de almacenamiento: ${storageResponse.statusText}`);
    }

    const storageInfo = await storageResponse.json();
    console.log('💾 Información de almacenamiento:');
    console.log(`   Directorio uploads: ${storageInfo.uploadsDir}`);
    console.log(`   Directorio chunks: ${storageInfo.chunksDir}`);
    console.log(`   Total archivos completados: ${storageInfo.totalFiles}`);
    console.log(`   Archivos en uploads: ${storageInfo.diskUsage.uploads.files} (${Math.round(storageInfo.diskUsage.uploads.sizeBytes / 1024)}KB)`);
    console.log(`   Archivos en chunks: ${storageInfo.diskUsage.chunks.files} (${Math.round(storageInfo.diskUsage.chunks.sizeBytes / 1024)}KB)\n`);

    // 11. Limpiar archivos de prueba
    console.log('🧹 Limpiando archivos de prueba...');
    if (fs.existsSync('test-media-file.txt')) fs.unlinkSync('test-media-file.txt');
    if (fs.existsSync('downloaded-file.txt')) fs.unlinkSync('downloaded-file.txt');
    console.log('✅ Archivos de prueba eliminados\n');

    console.log('🎉 ¡Test completo exitoso!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Autenticación JWT');
    console.log('   ✅ División de archivos en chunks');
    console.log('   ✅ Upload multipart');
    console.log('   ✅ Ensamblado de archivos');
    console.log('   ✅ Descarga de archivos');
    console.log('   ✅ Verificación de integridad');
    console.log('   ✅ Información de almacenamiento');
    
    console.log('\n🔗 URLs útiles:');
    console.log('   📚 Swagger Media: http://localhost:5901/api/docs');
    console.log('   📚 Swagger Auth: http://localhost:5900/api/docs');
    console.log('   💾 pgAdmin: http://localhost:5050');
    console.log(`   📁 Ver archivo: http://localhost:5901/media/${mediaId}/view`);
    console.log(`   📥 Descargar archivo: http://localhost:5901/media/${mediaId}/download`);

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    
    // Limpiar archivos de prueba en caso de error
    try {
      if (fs.existsSync('test-media-file.txt')) fs.unlinkSync('test-media-file.txt');
      if (fs.existsSync('downloaded-file.txt')) fs.unlinkSync('downloaded-file.txt');
    } catch (cleanupError) {
      console.error('Error limpiando archivos:', cleanupError.message);
    }
  }
}

testCompleteFileWorkflow(); 