import { Storage } from '@google-cloud/storage';
// import type {
//   StorageRef,
//   GcsUploadOptions,
//   GcsSignedUrlOptions,
//   StorageOperationResult,
// } from '@urbanova/types';

// Mock types
type StorageRef = any;
type GcsUploadOptions = any;
type GcsSignedUrlOptions = any;
type StorageOperationResult = any;

// GCS client singleton
let storageClient: Storage | null = null;

/**
 * Initialize GCS client
 */
function getStorageClient(): Storage {
  if (!storageClient) {
    const projectId = process.env.GCP_PROJECT_ID;
    const clientEmail = process.env.GCP_CLIENT_EMAIL;
    const privateKey = process.env.GCP_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing GCS credentials: GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY');
    }

    storageClient = new Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    });
  }

  return storageClient;
}

/**
 * Upload buffer to GCS
 */
export async function uploadBuffer(
  bucketName: string,
  path: string,
  buffer: Buffer,
  options: GcsUploadOptions = {
    contentType: 'application/octet-stream',
    metadata: {},
    public: false,
    customMetadata: {},
  }
): Promise<StorageOperationResult> {
  const startTime = Date.now();

  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(path);

    const uploadOptions = {
      metadata: {
        contentType: options.contentType,
        metadata: options.metadata,
        cacheControl: options.cacheControl,
        customMetadata: options.customMetadata,
      },
      public: options.public,
    };

    await file.save(buffer, uploadOptions);

    const storageRef: StorageRef = {
      bucket: bucketName,
      path,
      contentType: options.contentType,
      metadata: options.metadata,
    };

    return {
      success: true,
      storageRef,
      operationId: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
      operationId: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Generate signed URL for GCS object
 */
export async function getSignedUrl(
  bucketName: string,
  path: string,
  options: GcsSignedUrlOptions = {
    ttl: 900,
    method: 'GET',
    version: 'v4',
  }
): Promise<string> {
  const storage = getStorageClient();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(path);

  const signedUrlConfig = {
    version: options.version,
    action: options.method.toLowerCase() as 'read' | 'write' | 'delete',
    expires: Date.now() + options.ttl * 1000,
    ...(options.responseType && { responseType: options.responseType }),
    ...(options.responseDisposition && { responseDisposition: options.responseDisposition }),
  };

  const [url] = await file.getSignedUrl(signedUrlConfig);

  return url;
}

/**
 * Upload PDF and return signed URL
 */
export async function uploadPdfAndGetUrl(
  bucketName: string,
  path: string,
  pdfBuffer: Buffer,
  metadata: Record<string, string> = {}
): Promise<StorageOperationResult> {
  const uploadResult = await uploadBuffer(bucketName, path, pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      ...metadata,
      uploadedAt: new Date().toISOString(),
    },
    public: false,
    customMetadata: {},
  });

  if (!uploadResult.success || !uploadResult.storageRef) {
    return uploadResult;
  }

  try {
    const signedUrl = await getSignedUrl(bucketName, path, {
      ttl: 900,
      method: 'GET',
      version: 'v4',
    }); // 15 minutes

    uploadResult.storageRef.signedUrl = signedUrl;
    uploadResult.storageRef.expiresAt = new Date(Date.now() + 900 * 1000);

    return uploadResult;
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      operationId: uploadResult.operationId,
      duration: uploadResult.duration,
    };
  }
}

/**
 * Check if GCS bucket exists
 */
export async function bucketExists(bucketName: string): Promise<boolean> {
  try {
    const storage = getStorageClient();
    const [exists] = await storage.bucket(bucketName).exists();
    return exists;
  } catch (error) {
    console.error(`Error checking bucket existence: ${error}`);
    return false;
  }
}

/**
 * Create GCS bucket if it doesn't exist
 */
export async function ensureBucketExists(bucketName: string, projectId?: string): Promise<boolean> {
  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);

    const [exists] = await bucket.exists();
    if (exists) {
      return true;
    }

    await bucket.create({
      project: projectId || process.env.GCP_PROJECT_ID,
      location: 'US',
    });

    return true;
  } catch (error) {
    console.error(`Error creating bucket: ${error}`);
    return false;
  }
}

/**
 * Delete GCS object
 */
export async function deleteObject(bucketName: string, path: string): Promise<boolean> {
  try {
    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(path);

    await file.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting object: ${error}`);
    return false;
  }
}
