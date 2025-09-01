// Re-export storage types from @urbanova/types
export * from '@urbanova/types/storage';

// GCS Service
export class GCSService {
  async uploadFile(bucket: string, filename: string, data: Buffer): Promise<string> {
    // Mock implementation
    const url = `gs://${bucket}/${filename}`;
    console.log(`GCS Upload: ${url}`);
    return url;
  }

  async downloadFile(bucket: string, filename: string): Promise<Buffer> {
    // Mock implementation
    console.log(`GCS Download: gs://${bucket}/${filename}`);
    return Buffer.from('mock file content');
  }

  async deleteFile(bucket: string, filename: string): Promise<void> {
    // Mock implementation
    console.log(`GCS Delete: gs://${bucket}/${filename}`);
  }

  async getSignedUrl(bucket: string, filename: string, expiration: number = 3600): Promise<string> {
    // Mock implementation
    return `https://storage.googleapis.com/${bucket}/${filename}?signed=${Date.now()}`;
  }

  async uploadBuffer(bucket: string, filename: string, buffer: Buffer, metadata?: any): Promise<string> {
    // Mock implementation
    const url = `gs://${bucket}/${filename}`;
    console.log(`GCS Upload Buffer: ${url}`, metadata);
    return url;
  }
}
