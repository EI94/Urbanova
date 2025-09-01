import { z } from 'zod';
export declare const zStorageRef: z.ZodObject<
  {
    bucket: z.ZodString;
    path: z.ZodString;
    contentType: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    signedUrl: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    publicUrl: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    path: string;
    metadata: Record<string, string>;
    bucket: string;
    expiresAt?: Date | undefined;
    contentType?: string | undefined;
    signedUrl?: string | undefined;
    publicUrl?: string | undefined;
  },
  {
    path: string;
    bucket: string;
    metadata?: Record<string, string> | undefined;
    expiresAt?: Date | undefined;
    contentType?: string | undefined;
    signedUrl?: string | undefined;
    publicUrl?: string | undefined;
  }
>;
export type StorageRef = z.infer<typeof zStorageRef>;
export declare const zGcsUploadOptions: z.ZodObject<
  {
    contentType: z.ZodDefault<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    cacheControl: z.ZodOptional<z.ZodString>;
    public: z.ZodDefault<z.ZodBoolean>;
    customMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    metadata: Record<string, string>;
    contentType: string;
    public: boolean;
    customMetadata: Record<string, string>;
    cacheControl?: string | undefined;
  },
  {
    metadata?: Record<string, string> | undefined;
    contentType?: string | undefined;
    cacheControl?: string | undefined;
    public?: boolean | undefined;
    customMetadata?: Record<string, string> | undefined;
  }
>;
export type GcsUploadOptions = z.infer<typeof zGcsUploadOptions>;
export declare const zGcsSignedUrlOptions: z.ZodObject<
  {
    ttl: z.ZodDefault<z.ZodNumber>;
    method: z.ZodDefault<z.ZodEnum<['GET', 'PUT', 'POST', 'DELETE']>>;
    responseType: z.ZodOptional<z.ZodString>;
    responseDisposition: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodEnum<['v2', 'v4']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    version: 'v2' | 'v4';
    ttl: number;
    method: 'GET' | 'PUT' | 'POST' | 'DELETE';
    responseType?: string | undefined;
    responseDisposition?: string | undefined;
  },
  {
    version?: 'v2' | 'v4' | undefined;
    ttl?: number | undefined;
    method?: 'GET' | 'PUT' | 'POST' | 'DELETE' | undefined;
    responseType?: string | undefined;
    responseDisposition?: string | undefined;
  }
>;
export type GcsSignedUrlOptions = z.infer<typeof zGcsSignedUrlOptions>;
export declare const zFileMetadata: z.ZodObject<
  {
    projectId: z.ZodString;
    dealId: z.ZodString;
    hash: z.ZodString;
    size: z.ZodNumber;
    uploadedBy: z.ZodString;
    uploadedAt: z.ZodDate;
    expiresAt: z.ZodOptional<z.ZodDate>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, 'many'>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    tags: string[];
    hash: string;
    dealId: string;
    uploadedAt: Date;
    size: number;
    uploadedBy: string;
    expiresAt?: Date | undefined;
  },
  {
    projectId: string;
    hash: string;
    dealId: string;
    uploadedAt: Date;
    size: number;
    uploadedBy: string;
    tags?: string[] | undefined;
    expiresAt?: Date | undefined;
  }
>;
export type FileMetadata = z.infer<typeof zFileMetadata>;
export declare const zGcsBucketConfig: z.ZodObject<
  {
    name: z.ZodString;
    projectId: z.ZodString;
    location: z.ZodDefault<z.ZodString>;
    storageClass: z.ZodDefault<z.ZodEnum<['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE']>>;
    versioning: z.ZodDefault<z.ZodBoolean>;
    lifecycleRules: z.ZodDefault<
      z.ZodArray<
        z.ZodObject<
          {
            action: z.ZodEnum<['Delete', 'SetStorageClass']>;
            condition: z.ZodObject<
              {
                age: z.ZodOptional<z.ZodNumber>;
                daysSinceNoncurrentTime: z.ZodOptional<z.ZodNumber>;
                noncurrentTimeBefore: z.ZodOptional<z.ZodDate>;
              },
              'strip',
              z.ZodTypeAny,
              {
                age?: number | undefined;
                daysSinceNoncurrentTime?: number | undefined;
                noncurrentTimeBefore?: Date | undefined;
              },
              {
                age?: number | undefined;
                daysSinceNoncurrentTime?: number | undefined;
                noncurrentTimeBefore?: Date | undefined;
              }
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            condition: {
              age?: number | undefined;
              daysSinceNoncurrentTime?: number | undefined;
              noncurrentTimeBefore?: Date | undefined;
            };
            action: 'Delete' | 'SetStorageClass';
          },
          {
            condition: {
              age?: number | undefined;
              daysSinceNoncurrentTime?: number | undefined;
              noncurrentTimeBefore?: Date | undefined;
            };
            action: 'Delete' | 'SetStorageClass';
          }
        >,
        'many'
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    name: string;
    location: string;
    storageClass: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE';
    versioning: boolean;
    lifecycleRules: {
      condition: {
        age?: number | undefined;
        daysSinceNoncurrentTime?: number | undefined;
        noncurrentTimeBefore?: Date | undefined;
      };
      action: 'Delete' | 'SetStorageClass';
    }[];
  },
  {
    projectId: string;
    name: string;
    location?: string | undefined;
    storageClass?: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE' | undefined;
    versioning?: boolean | undefined;
    lifecycleRules?:
      | {
          condition: {
            age?: number | undefined;
            daysSinceNoncurrentTime?: number | undefined;
            noncurrentTimeBefore?: Date | undefined;
          };
          action: 'Delete' | 'SetStorageClass';
        }[]
      | undefined;
  }
>;
export type GcsBucketConfig = z.infer<typeof zGcsBucketConfig>;
export declare const zStorageOperationResult: z.ZodObject<
  {
    success: z.ZodBoolean;
    storageRef: z.ZodOptional<
      z.ZodObject<
        {
          bucket: z.ZodString;
          path: z.ZodString;
          contentType: z.ZodOptional<z.ZodString>;
          metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
          signedUrl: z.ZodOptional<z.ZodString>;
          expiresAt: z.ZodOptional<z.ZodDate>;
          publicUrl: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          path: string;
          metadata: Record<string, string>;
          bucket: string;
          expiresAt?: Date | undefined;
          contentType?: string | undefined;
          signedUrl?: string | undefined;
          publicUrl?: string | undefined;
        },
        {
          path: string;
          bucket: string;
          metadata?: Record<string, string> | undefined;
          expiresAt?: Date | undefined;
          contentType?: string | undefined;
          signedUrl?: string | undefined;
          publicUrl?: string | undefined;
        }
      >
    >;
    error: z.ZodOptional<z.ZodString>;
    operationId: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    success: boolean;
    error?: string | undefined;
    duration?: number | undefined;
    storageRef?:
      | {
          path: string;
          metadata: Record<string, string>;
          bucket: string;
          expiresAt?: Date | undefined;
          contentType?: string | undefined;
          signedUrl?: string | undefined;
          publicUrl?: string | undefined;
        }
      | undefined;
    operationId?: string | undefined;
  },
  {
    success: boolean;
    error?: string | undefined;
    duration?: number | undefined;
    storageRef?:
      | {
          path: string;
          bucket: string;
          metadata?: Record<string, string> | undefined;
          expiresAt?: Date | undefined;
          contentType?: string | undefined;
          signedUrl?: string | undefined;
          publicUrl?: string | undefined;
        }
      | undefined;
    operationId?: string | undefined;
  }
>;
export type StorageOperationResult = z.infer<typeof zStorageOperationResult>;
//# sourceMappingURL=storage.d.ts.map
