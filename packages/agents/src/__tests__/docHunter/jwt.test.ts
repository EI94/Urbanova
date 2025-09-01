import { describe, it, expect, beforeEach } from '@jest/globals';
import { JWTService } from '../../docHunter/jwt';

describe('JWTService', () => {
  let jwtService: JWTService;

  beforeEach(() => {
    // Set environment variable for testing
    process.env.DOCUPLOAD_SECRET = 'test-secret-key-for-jest';
    jwtService = new JWTService();
  });

  describe('generateUploadToken', () => {
    it('should generate a valid JWT token', () => {
      const docId = 'test-doc-123';
      const projectId = 'test-project-456';
      const kind = 'CDU';
      const vendorId = 'test-vendor-789';

      const token = jwtService.generateUploadToken(docId, projectId, kind, vendorId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate token without vendorId', () => {
      const docId = 'test-doc-123';
      const projectId = 'test-project-456';
      const kind = 'CDU';

      const token = jwtService.generateUploadToken(docId, projectId, kind);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should use custom expiry time', () => {
      const docId = 'test-doc-123';
      const projectId = 'test-project-456';
      const kind = 'CDU';
      const customExpiryHours = 24;

      const token = jwtService.generateUploadToken(
        docId,
        projectId,
        kind,
        undefined,
        customExpiryHours
      );

      expect(token).toBeDefined();
    });
  });

  describe('verifyUploadToken', () => {
    it('should verify a valid token', () => {
      const docId = 'test-doc-123';
      const projectId = 'test-project-456';
      const kind = 'CDU';

      const token = jwtService.generateUploadToken(docId, projectId, kind);
      const result = jwtService.verifyUploadToken(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      if (result.payload) {
        expect(result.payload.docId).toBe(docId);
        expect(result.payload.projectId).toBe(projectId);
        expect(result.payload.kind).toBe(kind);
      }
    });

    it('should reject invalid token', () => {
      const result = jwtService.verifyUploadToken('invalid-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateUploadUrl', () => {
    it('should generate a valid upload URL', () => {
      const baseUrl = 'https://example.com';
      const docId = 'test-doc-123';
      const projectId = 'test-project-456';
      const kind = 'CDU';

      const url = jwtService.generateUploadUrl(baseUrl, docId, projectId, kind);

      expect(url).toContain(baseUrl);
      expect(url).toContain('/docs/upload');
      expect(url).toContain('token=');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const docId = 'test-doc-123';
      const projectId = 'test-project-456';
      const kind = 'CDU';

      const token = jwtService.generateUploadToken(docId, projectId, kind);
      const decoded = jwtService.decodeToken(token);

      expect(decoded).toBeDefined();
      if (decoded) {
        expect(decoded.docId).toBe(docId);
        expect(decoded.projectId).toBe(projectId);
        expect(decoded.kind).toBe(kind);
      }
    });

    it('should return null for invalid token', () => {
      const decoded = jwtService.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('getTokenExpiryInfo', () => {
    it('should return expiry information for valid token', () => {
      const docId = 'test-doc-123';
      const projectId = 'test-project-456';
      const kind = 'CDU';

      const token = jwtService.generateUploadToken(docId, projectId, kind);
      const info = jwtService.getTokenExpiryInfo(token);

      expect(info.expiresAt).toBeDefined();
      expect(info.isExpired).toBeDefined();
      expect(info.timeUntilExpiry).toBeDefined();
    });
  });
});
