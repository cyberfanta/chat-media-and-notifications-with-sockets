/**
 * Utilidades para testing de la funcionalidad de upload de archivos multimedia
 */

/**
 * Convierte un chunk en formato base64 de vuelta a Buffer para poder subirlo
 * @param base64Data - Datos del chunk en base64
 * @returns Buffer del chunk
 */
export function chunkDataToBuffer(base64Data: string): Buffer {
  return Buffer.from(base64Data, 'base64');
}

/**
 * Convierte un chunk en formato base64 a un objeto File simulado para testing
 * @param base64Data - Datos del chunk en base64
 * @param chunkNumber - Número del chunk
 * @param originalName - Nombre original del archivo
 * @returns Objeto que simula Express.Multer.File
 */
export function chunkDataToFile(
  base64Data: string, 
  chunkNumber: number, 
  originalName: string
): Express.Multer.File {
  const buffer = chunkDataToBuffer(base64Data);
  
  return {
    fieldname: 'file',
    originalname: `chunk_${chunkNumber}_${originalName}`,
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    size: buffer.length,
    buffer: buffer,
    destination: '',
    filename: '',
    path: '',
    stream: null,
  };
}

/**
 * Crea un FormData para subir un chunk
 * @param chunkData - Datos del chunk en base64
 * @param chunkNumber - Número del chunk
 * @returns FormData listo para enviar
 */
export function createChunkFormData(chunkData: string, chunkNumber: number): FormData {
  const formData = new FormData();
  const buffer = chunkDataToBuffer(chunkData);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  
  formData.append('file', blob, `chunk_${chunkNumber}`);
  formData.append('chunkNumber', chunkNumber.toString());
  
  return formData;
}

/**
 * Ejemplo de uso completo para testing
 */
export class MediaUploadTester {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  /**
   * Workflow completo de testing:
   * 1. Divide un archivo en chunks
   * 2. Inicializa el upload
   * 3. Sube cada chunk
   * 4. Completa el upload
   */
  async testCompleteUploadWorkflow(
    file: File, 
    numChunks: number
  ): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    try {
      // 1. Dividir archivo en chunks
      const splitResponse = await this.splitFile(file, numChunks);
      console.log('Archivo dividido en', splitResponse.totalChunks, 'chunks');

      // 2. Inicializar upload
      const initResponse = await this.initializeUpload({
        originalName: file.name,
        mimeType: file.type,
        type: this.getMediaType(file.type),
        totalSize: file.size,
        totalChunks: numChunks,
      });
      
      console.log('Upload inicializado con ID:', initResponse.id);
      const mediaId = initResponse.id;

      // 3. Subir cada chunk
      for (const chunk of splitResponse.chunks) {
        const chunkResponse = await this.uploadChunk(
          mediaId, 
          chunk.chunkNumber, 
          chunk.data
        );
        console.log(`Chunk ${chunk.chunkNumber} subido. Progreso: ${chunkResponse.uploadedChunks}/${chunkResponse.totalChunks}`);
      }

      // 4. Completar upload
      const completeResponse = await this.completeUpload(mediaId);
      console.log('Upload completado:', completeResponse.fileName);

      return { success: true, mediaId };
    } catch (error) {
      console.error('Error en testing workflow:', error);
      return { success: false, error: error.message };
    }
  }

  private async splitFile(file: File, numChunks: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chunks', numChunks.toString());

    const response = await fetch(`${this.baseUrl}/media/split-file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al dividir archivo: ${response.statusText}`);
    }

    return await response.json();
  }

  private async initializeUpload(initData: any) {
    const response = await fetch(`${this.baseUrl}/media/init-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(initData),
    });

    if (!response.ok) {
      throw new Error(`Error al inicializar upload: ${response.statusText}`);
    }

    return await response.json();
  }

  private async uploadChunk(mediaId: string, chunkNumber: number, chunkData: string) {
    const formData = createChunkFormData(chunkData, chunkNumber);

    const response = await fetch(`${this.baseUrl}/media/upload-chunk/${mediaId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir chunk ${chunkNumber}: ${response.statusText}`);
    }

    return await response.json();
  }

  private async completeUpload(mediaId: string) {
    const response = await fetch(`${this.baseUrl}/media/complete-upload/${mediaId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al completar upload: ${response.statusText}`);
    }

    return await response.json();
  }

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'image'; // default
  }
} 