import {
  zStorageRef,
  zGcsUploadOptions,
  zGcsSignedUrlOptions,
  zFileMetadata,
  zGcsBucketConfig,
  zStorageOperationResult,
} from '../storage';

describe('Storage Types Validation', () => {
  describe('zStorageRef', () => {
    it('should validate valid storage reference', () => {
      const validRef = {
        bucket: 'urbanova-materials',
        path: 'projects/project-123/memos/memo-456.pdf',
        contentType: 'application/pdf',
        metadata: {
          projectId: 'project-123',
          dealId: 'deal-456',
        },
      };

      const result = zStorageRef.safeParse(validRef);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidRef = {
        bucket: 'urbanova-materials',
        // Missing path
      };

      const result = zStorageRef.safeParse(invalidRef);
      expect(result.success).toBe(false);
    });
  });

  describe('zGcsUploadOptions', () => {
    it('should validate valid upload options', () => {
      const validOptions = {
        contentType: 'application/pdf',
        metadata: {
          projectId: 'project-123',
          dealId: 'deal-456',
        },
        cacheControl: 'public, max-age=3600',
        public: false,
        customMetadata: {
          uploadedBy: 'user-123',
          version: '1.0',
        },
      };

      const result = zGcsUploadOptions.safeParse(validOptions);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const minimalOptions = {};

      const result = zGcsUploadOptions.safeParse(minimalOptions);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe('application/octet-stream');
        expect(result.data.public).toBe(false);
        expect(result.data.metadata).toEqual({});
        expect(result.data.customMetadata).toEqual({});
      }
    });
  });

  describe('zGcsSignedUrlOptions', () => {
    it('should validate valid signed URL options', () => {
      const validOptions = {
        ttl: 1800, // 30 minutes
        method: 'GET',
        responseType: 'application/pdf',
        responseDisposition: 'attachment; filename="memo.pdf"',
        version: 'v4',
      };

      const result = zGcsSignedUrlOptions.safeParse(validOptions);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const minimalOptions = {};

      const result = zGcsSignedUrlOptions.safeParse(minimalOptions);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ttl).toBe(900); // 15 minutes
        expect(result.data.method).toBe('GET');
        expect(result.data.version).toBe('v4');
      }
    });
  });
});
