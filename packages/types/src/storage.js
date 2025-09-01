'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.zStorageOperationResult =
  exports.zGcsBucketConfig =
  exports.zFileMetadata =
  exports.zGcsSignedUrlOptions =
  exports.zGcsUploadOptions =
  exports.zStorageRef =
    void 0;
const zod_1 = require('zod');
// GCS storage reference
exports.zStorageRef = zod_1.z.object({
  bucket: zod_1.z.string().min(1, 'Bucket name required'),
  path: zod_1.z.string().min(1, 'Object path required'),
  contentType: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.string()).default({}),
  // Generated fields
  signedUrl: zod_1.z.string().url().optional(),
  expiresAt: zod_1.z.date().optional(),
  publicUrl: zod_1.z.string().url().optional(),
});
// GCS upload options
exports.zGcsUploadOptions = zod_1.z.object({
  contentType: zod_1.z.string().default('application/octet-stream'),
  metadata: zod_1.z.record(zod_1.z.string()).default({}),
  cacheControl: zod_1.z.string().optional(),
  public: zod_1.z.boolean().default(false),
  // Custom metadata
  customMetadata: zod_1.z.record(zod_1.z.string()).default({}),
});
// GCS signed URL options
exports.zGcsSignedUrlOptions = zod_1.z.object({
  ttl: zod_1.z.number().min(60).max(3600).default(900), // 15 minutes default
  method: zod_1.z.enum(['GET', 'PUT', 'POST', 'DELETE']).default('GET'),
  responseType: zod_1.z.string().optional(),
  responseDisposition: zod_1.z.string().optional(),
  version: zod_1.z.enum(['v2', 'v4']).default('v4'),
});
// File metadata for audit
exports.zFileMetadata = zod_1.z.object({
  projectId: zod_1.z.string().min(1),
  dealId: zod_1.z.string().min(1),
  hash: zod_1.z.string().min(1), // SHA-256 hash
  size: zod_1.z.number().min(1),
  uploadedBy: zod_1.z.string().min(1),
  uploadedAt: zod_1.z.date(),
  expiresAt: zod_1.z.date().optional(),
  tags: zod_1.z.array(zod_1.z.string()).default([]),
});
// GCS bucket configuration
exports.zGcsBucketConfig = zod_1.z.object({
  name: zod_1.z.string().min(1),
  projectId: zod_1.z.string().min(1),
  location: zod_1.z.string().default('US'),
  storageClass: zod_1.z.enum(['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE']).default('STANDARD'),
  versioning: zod_1.z.boolean().default(false),
  lifecycleRules: zod_1.z
    .array(
      zod_1.z.object({
        action: zod_1.z.enum(['Delete', 'SetStorageClass']),
        condition: zod_1.z.object({
          age: zod_1.z.number().optional(),
          daysSinceNoncurrentTime: zod_1.z.number().optional(),
          noncurrentTimeBefore: zod_1.z.date().optional(),
        }),
      })
    )
    .default([]),
});
// Storage operation result
exports.zStorageOperationResult = zod_1.z.object({
  success: zod_1.z.boolean(),
  storageRef: exports.zStorageRef.optional(),
  error: zod_1.z.string().optional(),
  operationId: zod_1.z.string().optional(),
  duration: zod_1.z.number().optional(), // milliseconds
});
//# sourceMappingURL=storage.js.map
