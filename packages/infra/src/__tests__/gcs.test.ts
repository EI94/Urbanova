import { Storage } from '@google-cloud/storage';
import {
  uploadBuffer,
  getSignedUrl,
  uploadPdfAndGetUrl,
  bucketExists,
  ensureBucketExists,
  deleteObject,
} from '../gcs';
import { GcsUploadOptions, GcsSignedUrlOptions } from '@urbanova/types';

// Mock @google-cloud/storage
jest.mock('@google-cloud/storage');

const mockStorage = {
  bucket: jest.fn(),
};

const mockBucket = {
  file: jest.fn(),
  exists: jest.fn(),
  create: jest.fn(),
};

const mockFile = {
  save: jest.fn(),
  getSignedUrl: jest.fn(),
  delete: jest.fn(),
};

// Mock Storage constructor
const MockStorage = jest.fn().mockImplementation(() => mockStorage);
jest.mocked(require('@google-cloud/storage')).Storage = MockStorage;

// Mock environment variables
process.env.GCP_PROJECT_ID = 'test-project';
process.env.GCP_CLIENT_EMAIL = 'test@test.com';
process.env.GCP_PRIVATE_KEY = 'test-key';

describe('GCS Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.bucket.mockReturnValue(mockBucket);
    mockBucket.file.mockReturnValue(mockFile);

    // Reset environment variables
    process.env.GCP_PROJECT_ID = 'test-project';
    process.env.GCP_CLIENT_EMAIL = 'test@test.com';
    process.env.GCP_PRIVATE_KEY = 'test-key';
  });

  describe('uploadBuffer', () => {
    it('should upload buffer successfully', async () => {
      const testBuffer = Buffer.from('test content');
      const options: GcsUploadOptions = {
        contentType: 'application/pdf',
        metadata: { projectId: 'proj123' },
      };

      mockFile.save.mockResolvedValue([]);

      const result = await uploadBuffer('test-bucket', 'test/path.pdf', testBuffer, options);

      expect(mockStorage.bucket).toHaveBeenCalledWith('test-bucket');
      expect(mockBucket.file).toHaveBeenCalledWith('test/path.pdf');
      expect(mockFile.save).toHaveBeenCalledWith(testBuffer, {
        metadata: {
          contentType: 'application/pdf',
          metadata: { projectId: 'proj123' },
        },
      });
      expect(result).toEqual({
        success: true,
        storageRef: {
          bucket: 'test-bucket',
          path: 'test/path.pdf',
          contentType: 'application/pdf',
          metadata: { projectId: 'proj123' },
        },
        duration: expect.any(Number),
        operationId: expect.any(String),
      });
    });

    it('should handle upload errors', async () => {
      const testBuffer = Buffer.from('test content');
      const error = new Error('Upload failed');

      mockFile.save.mockRejectedValue(error);

      const result = await uploadBuffer('test-bucket', 'test/path.pdf', testBuffer);

      expect(result).toEqual({
        success: false,
        error: 'Upload failed',
        duration: expect.any(Number),
        operationId: expect.any(String),
      });
    });

    it('should use default options when none provided', async () => {
      const testBuffer = Buffer.from('test content');

      mockFile.save.mockResolvedValue([]);

      await uploadBuffer('test-bucket', 'test/path.pdf', testBuffer);

      expect(mockFile.save).toHaveBeenCalledWith(testBuffer, {
        metadata: {
          contentType: undefined,
          metadata: undefined,
        },
      });
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL successfully', async () => {
      const expectedUrl = 'https://storage.googleapis.com/test-bucket/test/path.pdf?signed=true';
      const options: GcsSignedUrlOptions = {
        method: 'GET',
        expires: Date.now() + 900000, // 15 minutes
      };

      mockFile.getSignedUrl.mockResolvedValue([expectedUrl]);

      const result = await getSignedUrl('test-bucket', 'test/path.pdf', options);

      expect(mockStorage.bucket).toHaveBeenCalledWith('test-bucket');
      expect(mockBucket.file).toHaveBeenCalledWith('test/path.pdf');
      expect(mockFile.getSignedUrl).toHaveBeenCalledWith({
        action: 'get',
        expires: expect.any(Number),
        responseType: undefined,
        responseDisposition: undefined,
        version: undefined,
      });
      expect(result).toBe(expectedUrl);
    });

    it('should use default options when none provided', async () => {
      const expectedUrl = 'https://storage.googleapis.com/test-bucket/test/path.pdf?signed=true';

      mockFile.getSignedUrl.mockResolvedValue([expectedUrl]);

      await getSignedUrl('test-bucket', 'test/path.pdf');

      expect(mockFile.getSignedUrl).toHaveBeenCalledWith({
        action: 'get',
        expires: expect.any(Number),
        responseType: undefined,
        responseDisposition: undefined,
        version: undefined,
      });
    });

    it('should handle signed URL generation errors', async () => {
      const error = new Error('Signed URL generation failed');

      mockFile.getSignedUrl.mockRejectedValue(error);

      await expect(getSignedUrl('test-bucket', 'test/path.pdf')).rejects.toThrow(
        'Signed URL generation failed'
      );
    });
  });

  describe('uploadPdfAndGetUrl', () => {
    it('should upload PDF and return signed URL', async () => {
      const testBuffer = Buffer.from('PDF content');
      const expectedUrl = 'https://storage.googleapis.com/test-bucket/test/path.pdf?signed=true';
      const metadata = { projectId: 'proj123', dealId: 'deal456' };

      mockFile.save.mockResolvedValue([]);
      mockFile.getSignedUrl.mockResolvedValue([expectedUrl]);

      const result = await uploadPdfAndGetUrl('test-bucket', 'test/path.pdf', testBuffer, metadata);

      expect(mockFile.save).toHaveBeenCalledWith(testBuffer, {
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            ...metadata,
            uploadedAt: expect.any(String),
          },
        },
      });
      expect(result).toEqual({
        success: true,
        storageRef: {
          bucket: 'test-bucket',
          path: 'test/path.pdf',
          contentType: 'application/pdf',
          metadata: {
            ...metadata,
            uploadedAt: expect.any(String),
          },
          signedUrl: expectedUrl,
          expiresAt: expect.any(Date),
        },
        duration: expect.any(Number),
        operationId: expect.any(String),
      });
    });

    it('should handle upload errors in uploadPdfAndGetUrl', async () => {
      const testBuffer = Buffer.from('PDF content');
      const error = new Error('Upload failed');

      mockFile.save.mockRejectedValue(error);

      const result = await uploadPdfAndGetUrl('test-bucket', 'test/path.pdf', testBuffer);

      expect(result).toEqual({
        success: false,
        error: 'Upload failed',
        duration: expect.any(Number),
        operationId: expect.any(String),
      });
    });
  });

  describe('bucketExists', () => {
    it('should return true when bucket exists', async () => {
      mockBucket.exists.mockResolvedValue([true]);

      const result = await bucketExists('test-bucket');

      expect(mockStorage.bucket).toHaveBeenCalledWith('test-bucket');
      expect(mockBucket.exists).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when bucket does not exist', async () => {
      mockBucket.exists.mockResolvedValue([false]);

      const result = await bucketExists('test-bucket');

      expect(result).toBe(false);
    });

    it('should handle bucket exists check errors', async () => {
      const error = new Error('Check failed');

      mockBucket.exists.mockRejectedValue(error);

      const result = await bucketExists('test-bucket');

      expect(result).toBe(false);
    });
  });

  describe('ensureBucketExists', () => {
    it('should return true when bucket already exists', async () => {
      mockBucket.exists.mockResolvedValue([true]);

      const result = await ensureBucketExists('test-bucket');

      expect(mockBucket.exists).toHaveBeenCalled();
      expect(mockBucket.create).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should create bucket when it does not exist', async () => {
      mockBucket.exists.mockResolvedValue([false]);
      mockBucket.create.mockResolvedValue([]);

      const result = await ensureBucketExists('test-bucket', 'test-project');

      expect(mockBucket.exists).toHaveBeenCalled();
      expect(mockBucket.create).toHaveBeenCalledWith({
        location: 'US',
        project: 'test-project',
      });
      expect(result).toBe(true);
    });

    it('should handle bucket creation errors', async () => {
      const error = new Error('Creation failed');

      mockBucket.exists.mockResolvedValue([false]);
      mockBucket.create.mockRejectedValue(error);

      const result = await ensureBucketExists('test-bucket');

      expect(result).toBe(false);
    });
  });

  describe('deleteObject', () => {
    it('should delete object successfully', async () => {
      mockFile.delete.mockResolvedValue([]);

      const result = await deleteObject('test-bucket', 'test/path.pdf');

      expect(mockStorage.bucket).toHaveBeenCalledWith('test-bucket');
      expect(mockBucket.file).toHaveBeenCalledWith('test/path.pdf');
      expect(mockFile.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');

      mockFile.delete.mockRejectedValue(error);

      const result = await deleteObject('test-bucket', 'test/path.pdf');

      expect(result).toBe(false);
    });
  });
});
