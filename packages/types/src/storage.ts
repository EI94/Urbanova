import { z } from 'zod';

// GCS storage reference
export const zStorageRef = z.object({
  bucket: z.string().min(1, 'Bucket name required'),
  path: z.string().min(1, 'Object path required'),
  contentType: z.string().optional(),
  metadata: z.record(z.string()).default({}),
  // Generated fields
  signedUrl: z.string().url().optional(),
  expiresAt: z.date().optional(),
  publicUrl: z.string().url().optional(),
});

export type StorageRef = z.infer<typeof zStorageRef>;

// GCS upload options
export const zGcsUploadOptions = z.object({
  contentType: z.string().default('application/octet-stream'),
  metadata: z.record(z.string()).default({}),
  cacheControl: z.string().optional(),
  public: z.boolean().default(false),
  // Custom metadata
  customMetadata: z.record(z.string()).default({}),
});

export type GcsUploadOptions = z.infer<typeof zGcsUploadOptions>;

// GCS signed URL options
export const zGcsSignedUrlOptions = z.object({
  ttl: z.number().min(60).max(3600).default(900), // 15 minutes default
  method: z.enum(['GET', 'PUT', 'POST', 'DELETE']).default('GET'),
  responseType: z.string().optional(),
  responseDisposition: z.string().optional(),
  version: z.enum(['v2', 'v4']).default('v4'),
});

export type GcsSignedUrlOptions = z.infer<typeof zGcsSignedUrlOptions>;

// File metadata for audit
export const zFileMetadata = z.object({
  projectId: z.string().min(1),
  dealId: z.string().min(1),
  hash: z.string().min(1), // SHA-256 hash
  size: z.number().min(1),
  uploadedBy: z.string().min(1),
  uploadedAt: z.date(),
  expiresAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
});

export type FileMetadata = z.infer<typeof zFileMetadata>;

// GCS bucket configuration
export const zGcsBucketConfig = z.object({
  name: z.string().min(1),
  projectId: z.string().min(1),
  location: z.string().default('US'),
  storageClass: z.enum(['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE']).default('STANDARD'),
  versioning: z.boolean().default(false),
  lifecycleRules: z
    .array(
      z.object({
        action: z.enum(['Delete', 'SetStorageClass']),
        condition: z.object({
          age: z.number().optional(),
          daysSinceNoncurrentTime: z.number().optional(),
          noncurrentTimeBefore: z.date().optional(),
        }),
      })
    )
    .default([]),
});

export type GcsBucketConfig = z.infer<typeof zGcsBucketConfig>;

// Storage operation result
export const zStorageOperationResult = z.object({
  success: z.boolean(),
  storageRef: zStorageRef.optional(),
  error: z.string().optional(),
  operationId: z.string().optional(),
  duration: z.number().optional(), // milliseconds
});

export type StorageOperationResult = z.infer<typeof zStorageOperationResult>;
