/**
 * Utilidades para testing de la funcionalidad de upload de archivos multimedia
 */

/**
 * Convierte un chunk en formato base64 de vuelta a Buffer para poder subirlo
 */
export function base64ToBuffer(base64Data: string): Buffer {
  return Buffer.from(base64Data, 'base64');
}

/**
 * Convierte un chunk en formato base64 a un objeto File simulado para testing
 */
export function base64ToFile(
  base64Data: string,
  chunkNumber: number,
  originalName: string = 'test-file.mp4'
): Express.Multer.File {
  const buffer = base64ToBuffer(base64Data);
  
  return {
    fieldname: 'file',
    originalname: `chunk_${chunkNumber}`,
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    size: buffer.length,
    buffer: buffer,
    destination: '',
    filename: `chunk_${chunkNumber}`,
    path: '',
    stream: null,
  } as Express.Multer.File;
}

/**
 * Crea un FormData para subir un chunk
 */
export function createChunkFormData(
  chunkData: string,
  chunkNumber: number
): FormData {
  const formData = new FormData();
  const buffer = base64ToBuffer(chunkData);
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

  constructor(baseUrl: string = 'http://localhost:5901', authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  /**
   * Workflow completo de testing de upload multipart
   */
  async testCompleteUpload(file: Express.Multer.File, chunks: number = 5) {
    try {
      const splitResult = await this.splitFile(file, chunks);
      
      const initResult = await this.initUpload(splitResult.metadata);
      
      for (let i = 0; i < splitResult.chunks.length; i++) {
        await this.uploadChunk(initResult.mediaId, splitResult.chunks[i], i);
      }
      
      const completeResult = await this.completeUpload(initResult.mediaId);
      
      return completeResult;
    } catch (error) {
      console.error('Error en test de upload:', error);
      throw error;
    }
  }

  private async splitFile(file: Express.Multer.File, chunks: number) {
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);
    formData.append('chunks', chunks.toString());

    const response = await fetch(`${this.baseUrl}/media/split-file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: formData,
    });

    return await response.json();
  }

  private async initUpload(metadata: any) {
    const response = await fetch(`${this.baseUrl}/media/init-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(metadata),
    });

    return await response.json();
  }

  private async uploadChunk(mediaId: string, chunkData: string, chunkNumber: number) {
    const formData = createChunkFormData(chunkData, chunkNumber);

    const response = await fetch(`${this.baseUrl}/media/upload-chunk/${mediaId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
      body: formData,
    });

    return await response.json();
  }

  private async completeUpload(mediaId: string) {
    const response = await fetch(`${this.baseUrl}/media/complete-upload/${mediaId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
    });

    return await response.json();
  }
} 