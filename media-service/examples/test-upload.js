/**
 * Script de ejemplo para testing del workflow completo de upload multimedia
 * 
 * Este script demuestra cómo:
 * 1. Usar el endpoint /split-file para dividir un archivo
 * 2. Usar los chunks resultantes para probar upload-chunk
 * 3. Completar el proceso de upload
 * 
 * Para usar este script:
 * 1. Asegúrate de tener los servicios corriendo (docker-compose up)
 * 2. Obtén un token JWT del auth-service
 * 3. Modifica las variables de configuración abajo
 * 4. Ejecuta con: node test-upload.js
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuración
const AUTH_SERVICE_URL = 'http://localhost:5900';
const MEDIA_SERVICE_URL = 'http://localhost:5901';
const TEST_FILE_PATH = './test-files/sample-video.mp4'; // Cambia por tu archivo de prueba
const NUM_CHUNKS = 5;

// Credenciales de prueba (ajusta según tus datos)
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

/**
 * Función principal que ejecuta todo el workflow de testing
 */
async function main() {
  try {
    console.log('🚀 Iniciando testing del workflow de upload multimedia...\n');

    // 1. Autenticarse
    console.log('1️⃣ Autenticándose...');
    const authToken = await authenticate();
    console.log('✅ Autenticación exitosa\n');

    // 2. Verificar que el archivo de prueba existe
    if (!fs.existsSync(TEST_FILE_PATH)) {
      throw new Error(`Archivo de prueba no encontrado: ${TEST_FILE_PATH}`);
    }

    // 3. Dividir archivo en chunks
    console.log('2️⃣ Dividiendo archivo en chunks...');
    const splitResult = await splitFile(TEST_FILE_PATH, NUM_CHUNKS, authToken);
    console.log(`✅ Archivo dividido en ${splitResult.totalChunks} chunks de ~${Math.round(splitResult.chunkSize / 1024)}KB cada uno\n`);

    // 4. Inicializar upload
    console.log('3️⃣ Inicializando upload...');
    const fileStats = fs.statSync(TEST_FILE_PATH);
    const mediaId = await initializeUpload({
      originalName: 'sample-video.mp4',
      mimeType: 'video/mp4',
      type: 'video',
      totalSize: fileStats.size,
      totalChunks: NUM_CHUNKS,
    }, authToken);
    console.log(`✅ Upload inicializado con ID: ${mediaId}\n`);

    // 5. Subir cada chunk
    console.log('4️⃣ Subiendo chunks...');
    for (const chunk of splitResult.chunks) {
      const result = await uploadChunk(mediaId, chunk.chunkNumber, chunk.data, authToken);
      console.log(`   Chunk ${chunk.chunkNumber + 1}/${NUM_CHUNKS} subido. Progreso: ${result.uploadedChunks}/${result.totalChunks}`);
    }
    console.log('✅ Todos los chunks subidos exitosamente\n');

    // 6. Completar upload
    console.log('5️⃣ Completando upload...');
    const completedMedia = await completeUpload(mediaId, authToken);
    console.log(`✅ Upload completado. Archivo final: ${completedMedia.fileName}\n`);

    // 7. Verificar información del media
    console.log('6️⃣ Verificando información del media...');
    const mediaInfo = await getMediaInfo(mediaId, authToken);
    console.log('📄 Información del media:');
    console.log(`   ID: ${mediaInfo.id}`);
    console.log(`   Nombre: ${mediaInfo.originalName}`);
    console.log(`   Tamaño: ${Math.round(mediaInfo.totalSize / 1024)}KB`);
    console.log(`   Estado: ${mediaInfo.status}`);
    console.log(`   Ruta: ${mediaInfo.filePath}\n`);

    console.log('🎉 ¡Testing completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el testing:', error.message);
    process.exit(1);
  }
}

/**
 * Autenticar usuario y obtener token JWT
 */
async function authenticate() {
  const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(TEST_USER),
  });

  if (!response.ok) {
    throw new Error(`Error en autenticación: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Dividir archivo usando el endpoint split-file
 */
async function splitFile(filePath, numChunks, authToken) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('chunks', numChunks.toString());

  const response = await fetch(`${MEDIA_SERVICE_URL}/media/split-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al dividir archivo: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Inicializar upload multimedia
 */
async function initializeUpload(initData, authToken) {
  const response = await fetch(`${MEDIA_SERVICE_URL}/media/init-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(initData),
  });

  if (!response.ok) {
    throw new Error(`Error al inicializar upload: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Subir un chunk específico
 */
async function uploadChunk(mediaId, chunkNumber, chunkData, authToken) {
  const formData = new FormData();
  
  // Convertir base64 de vuelta a buffer
  const chunkBuffer = Buffer.from(chunkData, 'base64');
  formData.append('file', chunkBuffer, `chunk_${chunkNumber}`);
  formData.append('chunkNumber', chunkNumber.toString());

  const response = await fetch(`${MEDIA_SERVICE_URL}/media/upload-chunk/${mediaId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error al subir chunk ${chunkNumber}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Completar upload
 */
async function completeUpload(mediaId, authToken) {
  const response = await fetch(`${MEDIA_SERVICE_URL}/media/complete-upload/${mediaId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al completar upload: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Obtener información del media
 */
async function getMediaInfo(mediaId, authToken) {
  const response = await fetch(`${MEDIA_SERVICE_URL}/media/${mediaId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener info del media: ${response.statusText}`);
  }

  return await response.json();
}

// Crear directorio de archivos de prueba si no existe
if (!fs.existsSync('./test-files')) {
  fs.mkdirSync('./test-files');
  console.log('📁 Directorio test-files creado');
  console.log('💡 Coloca archivos de prueba en ./test-files/ y modifica TEST_FILE_PATH');
  process.exit(0);
}

// Ejecutar el testing
main(); 