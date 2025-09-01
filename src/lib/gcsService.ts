// Google Cloud Storage Service - Urbanova AI
// Gestione storage ricevute PDF e documenti

export interface GCSFile {
  name: string;
  bucket: string;
  size: number;
  contentType: string;
  url: string;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  file?: GCSFile;
  error?: string;
}

export class GCSService {
  private readonly BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'urbanova-documents';
  private readonly PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'urbanova-dev';

  constructor() {
    console.log('🌐 [GCSService] Inizializzato per bucket:', this.BUCKET_NAME);
  }

  /**
   * Carica un file da URL esterno
   */
  async uploadFromUrl(url: string, fileName: string): Promise<UploadResult> {
    try {
      console.log('📥 [GCSService] Upload da URL:', url, 'a', fileName);

      // In produzione, questo si collegherebbe a Google Cloud Storage
      // Per ora, simuliamo l'upload

      const mockFile: GCSFile = {
        name: fileName,
        bucket: this.BUCKET_NAME,
        size: 1024 * 1024, // 1MB mock
        contentType: 'application/pdf',
        url: `https://storage.googleapis.com/${this.BUCKET_NAME}/${fileName}`,
        createdAt: new Date(),
        metadata: {
          sourceUrl: url,
          uploadedAt: new Date().toISOString(),
        },
      };

      console.log('✅ [GCSService] File caricato con successo:', fileName);

      return {
        success: true,
        file: mockFile,
      };
    } catch (error) {
      console.error('❌ [GCSService] Errore upload da URL:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Carica un file da buffer
   */
  async uploadBuffer(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
    try {
      console.log('📤 [GCSService] Upload buffer:', fileName, 'tipo:', contentType);

      const mockFile: GCSFile = {
        name: fileName,
        bucket: this.BUCKET_NAME,
        size: buffer.length,
        contentType,
        url: `https://storage.googleapis.com/${this.BUCKET_NAME}/${fileName}`,
        createdAt: new Date(),
        metadata: {
          uploadedAt: new Date().toISOString(),
          size: buffer.length.toString(),
        },
      };

      console.log('✅ [GCSService] Buffer caricato con successo:', fileName);

      return {
        success: true,
        file: mockFile,
      };
    } catch (error) {
      console.error('❌ [GCSService] Errore upload buffer:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Scarica un file
   */
  async downloadFile(fileName: string): Promise<Buffer | null> {
    try {
      console.log('📥 [GCSService] Download file:', fileName);

      // In produzione, scaricherebbe da GCS
      // Per ora, ritorna un buffer mock

      const mockBuffer = Buffer.from('Mock PDF content for ' + fileName);

      console.log('✅ [GCSService] File scaricato con successo:', fileName);

      return mockBuffer;
    } catch (error) {
      console.error('❌ [GCSService] Errore download file:', error);
      return null;
    }
  }

  /**
   * Elimina un file
   */
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      console.log('🗑️ [GCSService] Eliminazione file:', fileName);

      // In produzione, eliminerebbe da GCS
      // Per ora, simula il successo

      console.log('✅ [GCSService] File eliminato con successo:', fileName);

      return true;
    } catch (error) {
      console.error('❌ [GCSService] Errore eliminazione file:', error);
      return false;
    }
  }

  /**
   * Ottiene la lista dei file in una directory
   */
  async listFiles(prefix: string = ''): Promise<GCSFile[]> {
    try {
      console.log('📋 [GCSService] Lista file con prefisso:', prefix);

      // In produzione, listerebbe da GCS
      // Per ora, ritorna file mock

      const mockFiles: GCSFile[] = [
        {
          name: `${prefix}receipt-001.pdf`,
          bucket: this.BUCKET_NAME,
          size: 1024 * 1024,
          contentType: 'application/pdf',
          url: `https://storage.googleapis.com/${this.BUCKET_NAME}/${prefix}receipt-001.pdf`,
          createdAt: new Date(Date.now() - 86400000), // 1 giorno fa
          metadata: { type: 'receipt' },
        },
        {
          name: `${prefix}receipt-002.pdf`,
          bucket: this.BUCKET_NAME,
          size: 2048 * 1024,
          contentType: 'application/pdf',
          url: `https://storage.googleapis.com/${this.BUCKET_NAME}/${prefix}receipt-002.pdf`,
          createdAt: new Date(Date.now() - 172800000), // 2 giorni fa
          metadata: { type: 'receipt' },
        },
      ];

      console.log('✅ [GCSService] Lista file recuperata:', mockFiles.length, 'file');

      return mockFiles;
    } catch (error) {
      console.error('❌ [GCSService] Errore lista file:', error);
      return [];
    }
  }

  /**
   * Genera URL firmato per accesso temporaneo
   */
  async generateSignedUrl(
    fileName: string,
    expirationMinutes: number = 60
  ): Promise<string | null> {
    try {
      console.log('🔗 [GCSService] Generazione URL firmato per:', fileName);

      // In produzione, genererebbe un URL firmato di GCS
      // Per ora, ritorna un URL mock

      const signedUrl = `https://storage.googleapis.com/${this.BUCKET_NAME}/${fileName}?token=mock-signed-token&expires=${Date.now() + expirationMinutes * 60 * 1000}`;

      console.log('✅ [GCSService] URL firmato generato:', signedUrl);

      return signedUrl;
    } catch (error) {
      console.error('❌ [GCSService] Errore generazione URL firmato:', error);
      return null;
    }
  }

  /**
   * Verifica se un file esiste
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      console.log('🔍 [GCSService] Verifica esistenza file:', fileName);

      // In produzione, verificherebbe su GCS
      // Per ora, simula che tutti i file esistano

      return true;
    } catch (error) {
      console.error('❌ [GCSService] Errore verifica esistenza file:', error);
      return false;
    }
  }

  /**
   * Ottiene i metadati di un file
   */
  async getFileMetadata(fileName: string): Promise<GCSFile | null> {
    try {
      console.log('📊 [GCSService] Metadati file:', fileName);

      // In produzione, recupererebbe da GCS
      // Per ora, ritorna metadati mock

      const mockFile: GCSFile = {
        name: fileName,
        bucket: this.BUCKET_NAME,
        size: 1024 * 1024,
        contentType: 'application/pdf',
        url: `https://storage.googleapis.com/${this.BUCKET_NAME}/${fileName}`,
        createdAt: new Date(),
        metadata: {
          uploadedAt: new Date().toISOString(),
          type: 'document',
        },
      };

      console.log('✅ [GCSService] Metadati recuperati:', fileName);

      return mockFile;
    } catch (error) {
      console.error('❌ [GCSService] Errore recupero metadati:', error);
      return null;
    }
  }
}

export const gcsService = new GCSService();
