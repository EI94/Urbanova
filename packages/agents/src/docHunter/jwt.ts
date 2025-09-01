// JWT Service for Doc Hunter v1 - Secure Upload Links

import * as jwt from 'jsonwebtoken';

export interface UploadTokenPayload {
  docId: string;
  projectId: string;
  kind: string;
  vendorId?: string;
  expiresAt: number;
}

export interface UploadTokenVerification {
  isValid: boolean;
  payload?: UploadTokenPayload;
  error?: string;
}

export class JWTService {
  private secret: string;
  private defaultExpiryHours: number;

  constructor() {
    this.secret = process.env.DOCUPLOAD_SECRET || 'fallback-secret-change-in-production';
    this.defaultExpiryHours = 48; // 48 hours default expiry
  }

  generateUploadToken(
    docId: string,
    projectId: string,
    kind: string,
    vendorId?: string,
    customExpiryHours?: number
  ): string {
    const expiryHours = customExpiryHours || this.defaultExpiryHours;
    const expiresAt = Date.now() + expiryHours * 60 * 60 * 1000;

    const payload: UploadTokenPayload = {
      docId,
      projectId,
      kind,
      ...(vendorId && { vendorId }),
      expiresAt,
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: `${expiryHours}h`,
      issuer: 'urbanova-doc-hunter',
      audience: 'document-upload',
    });
  }

  verifyUploadToken(token: string): UploadTokenVerification {
    try {
      const payload = jwt.verify(token, this.secret, {
        issuer: 'urbanova-doc-hunter',
        audience: 'document-upload',
      }) as UploadTokenPayload;

      // Additional validation
      if (payload.expiresAt < Date.now()) {
        return {
          isValid: false,
          error: 'Token expired',
        };
      }

      if (!payload.docId || !payload.projectId || !payload.kind) {
        return {
          isValid: false,
          error: 'Invalid token payload',
        };
      }

      return {
        isValid: true,
        payload,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          isValid: false,
          error: 'Token expired',
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          error: 'Invalid token',
        };
      } else {
        return {
          isValid: false,
          error: 'Token verification failed',
        };
      }
    }
  }

  generateUploadUrl(
    baseUrl: string,
    docId: string,
    projectId: string,
    kind: string,
    vendorId?: string,
    customExpiryHours?: number
  ): string {
    const token = this.generateUploadToken(docId, projectId, kind, vendorId, customExpiryHours);
    return `${baseUrl}/docs/upload?token=${token}`;
  }

  // Decode token without verification (for debugging)
  decodeToken(token: string): UploadTokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as UploadTokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Get token expiry information
  getTokenExpiryInfo(token: string): {
    expiresAt: Date | null;
    isExpired: boolean;
    timeUntilExpiry: number | null;
  } {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return {
        expiresAt: null,
        isExpired: false,
        timeUntilExpiry: null,
      };
    }

    const expiresAt = new Date(decoded.expiresAt);
    const now = new Date();
    const timeUntilExpiry = decoded.expiresAt - now.getTime();
    const isExpired = timeUntilExpiry <= 0;

    return {
      expiresAt,
      isExpired,
      timeUntilExpiry: isExpired ? null : timeUntilExpiry,
    };
  }

  // Refresh token (extend expiry)
  refreshToken(token: string, additionalHours: number = 24): string | null {
    const verification = this.verifyUploadToken(token);
    if (!verification.isValid || !verification.payload) {
      return null;
    }

    const { docId, projectId, kind, vendorId } = verification.payload;
    return this.generateUploadToken(docId, projectId, kind, vendorId, additionalHours);
  }

  // Validate token for specific project and document
  validateTokenForDocument(
    token: string,
    expectedDocId: string,
    expectedProjectId: string
  ): UploadTokenVerification {
    const verification = this.verifyUploadToken(token);

    if (!verification.isValid || !verification.payload) {
      return verification;
    }

    const { docId, projectId } = verification.payload;

    if (docId !== expectedDocId) {
      return {
        isValid: false,
        error: 'Token not valid for this document',
      };
    }

    if (projectId !== expectedProjectId) {
      return {
        isValid: false,
        error: 'Token not valid for this project',
      };
    }

    return verification;
  }
}

export const jwtService = new JWTService();
