import { BuyerJWTLink, JWTPermission } from '@urbanova/types';

/**
 * JWT Service
 *
 * Gestione link sicuri temporanei:
 * - Generazione JWT
 * - Verifica token
 * - Permessi granulari
 * - Scadenza automatica
 * - One-time use
 */

export class JWTService {
  private jwtLinks: Map<string, BuyerJWTLink> = new Map();
  private secretKey = process.env.JWT_SECRET_KEY || 'urbanova-buyer-secret-key-2024';
  private usedTokens: Set<string> = new Set();

  /**
   * Genera link upload
   */
  async generateUploadLink(request: {
    buyerId: string;
    projectId: string;
    documentTypes: string[];
    expiresIn: number;
    permissions: JWTPermission[];
  }): Promise<BuyerJWTLink> {
    const token = this.generateJWT({
      buyerId: request.buyerId,
      projectId: request.projectId,
      documentTypes: request.documentTypes,
      permissions: request.permissions,
      type: 'upload',
    });

    const expiresAt = new Date(Date.now() + request.expiresIn * 24 * 60 * 60 * 1000);

    const jwtLink: BuyerJWTLink = {
      id: `jwt_${Date.now()}`,
      token,
      url: `https://api.urbanova.com/buyer/upload/${token}`,
      buyerId: request.buyerId,
      projectId: request.projectId,
      documentTypes: request.documentTypes,
      permissions: request.permissions,
      type: 'upload',
      expiresAt,
      createdAt: new Date(),
      usedAt: null,
      usedCount: 0,
      maxUses: 1,
      metadata: {
        ipAddress: '127.0.0.1', // Simulato
        userAgent: 'Urbanova-Buyer-Service/1.0',
      },
    };

    this.jwtLinks.set(jwtLink.id, jwtLink);

    console.log(
      `🔗 Upload Link Generated - ID: ${jwtLink.id}, Buyer: ${request.buyerId}, Expires: ${expiresAt.toISOString()}`
    );

    return jwtLink;
  }

  /**
   * Genera link accesso
   */
  async generateAccessLink(request: {
    buyerId: string;
    projectId: string;
    permissions: JWTPermission[];
    expiresIn: number;
    maxUses?: number;
  }): Promise<BuyerJWTLink> {
    const token = this.generateJWT({
      buyerId: request.buyerId,
      projectId: request.projectId,
      permissions: request.permissions,
      type: 'access',
    });

    const expiresAt = new Date(Date.now() + request.expiresIn * 24 * 60 * 60 * 1000);

    const jwtLink: BuyerJWTLink = {
      id: `jwt_${Date.now()}`,
      token,
      url: `https://app.urbanova.com/buyer/access/${token}`,
      buyerId: request.buyerId,
      projectId: request.projectId,
      documentTypes: [],
      permissions: request.permissions,
      type: 'access',
      expiresAt,
      createdAt: new Date(),
      usedAt: null,
      usedCount: 0,
      maxUses: request.maxUses || 1,
      metadata: {
        ipAddress: '127.0.0.1',
        userAgent: 'Urbanova-Buyer-Service/1.0',
      },
    };

    this.jwtLinks.set(jwtLink.id, jwtLink);

    console.log(
      `🔗 Access Link Generated - ID: ${jwtLink.id}, Buyer: ${request.buyerId}, Max Uses: ${request.maxUses || 1}`
    );

    return jwtLink;
  }

  /**
   * Verifica token
   */
  async verifyToken(token: string): Promise<{
    valid: boolean;
    jwtLink?: BuyerJWTLink;
    error?: string;
  }> {
    try {
      // Controlla se token è già stato usato
      if (this.usedTokens.has(token)) {
        return {
          valid: false,
          error: 'Token already used',
        };
      }

      // Trova JWT link
      const jwtLink = Array.from(this.jwtLinks.values()).find(link => link.token === token);
      if (!jwtLink) {
        return {
          valid: false,
          error: 'Token not found',
        };
      }

      // Controlla scadenza
      if (jwtLink.expiresAt < new Date()) {
        return {
          valid: false,
          error: 'Token expired',
        };
      }

      // Controlla numero usi
      if (jwtLink.usedCount >= jwtLink.maxUses) {
        return {
          valid: false,
          error: 'Token usage limit exceeded',
        };
      }

      // Verifica JWT (simulazione)
      const decoded = this.decodeJWT(token);
      if (!decoded) {
        return {
          valid: false,
          error: 'Invalid token format',
        };
      }

      return {
        valid: true,
        jwtLink,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token verification failed',
      };
    }
  }

  /**
   * Usa token
   */
  async useToken(token: string): Promise<{
    success: boolean;
    jwtLink?: BuyerJWTLink;
    error?: string;
  }> {
    const verification = await this.verifyToken(token);

    if (!verification.valid) {
      return {
        success: false,
        error: verification.error,
      };
    }

    const jwtLink = verification.jwtLink!;

    // Aggiorna contatore usi
    jwtLink.usedCount++;
    jwtLink.usedAt = new Date();

    // Se raggiunto limite usi, marca come usato
    if (jwtLink.usedCount >= jwtLink.maxUses) {
      this.usedTokens.add(token);
    }

    console.log(`✅ Token Used - ID: ${jwtLink.id}, Uses: ${jwtLink.usedCount}/${jwtLink.maxUses}`);

    return {
      success: true,
      jwtLink,
    };
  }

  /**
   * Revoca token
   */
  async revokeToken(token: string): Promise<boolean> {
    const jwtLink = Array.from(this.jwtLinks.values()).find(link => link.token === token);
    if (!jwtLink) {
      return false;
    }

    // Marca come usato per invalidarlo
    this.usedTokens.add(token);
    jwtLink.usedCount = jwtLink.maxUses;
    jwtLink.usedAt = new Date();

    console.log(`🚫 Token Revoked - ID: ${jwtLink.id}`);

    return true;
  }

  /**
   * Ottieni JWT link
   */
  async getJWTLink(jwtLinkId: string): Promise<BuyerJWTLink | null> {
    return this.jwtLinks.get(jwtLinkId) || null;
  }

  /**
   * Lista JWT link
   */
  async listJWTLinks(
    filters: {
      buyerId?: string;
      projectId?: string;
      type?: 'upload' | 'access';
      active?: boolean;
    } = {}
  ): Promise<BuyerJWTLink[]> {
    let links = Array.from(this.jwtLinks.values());

    if (filters.buyerId) {
      links = links.filter(link => link.buyerId === filters.buyerId);
    }

    if (filters.projectId) {
      links = links.filter(link => link.projectId === filters.projectId);
    }

    if (filters.type) {
      links = links.filter(link => link.type === filters.type);
    }

    if (filters.active !== undefined) {
      const now = new Date();
      links = links.filter(link => {
        const notExpired = link.expiresAt > now;
        const notUsed = link.usedCount < link.maxUses;
        return filters.active ? notExpired && notUsed : !notExpired || !notUsed;
      });
    }

    return links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Pulisci token scaduti
   */
  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date();
    const expiredLinks = Array.from(this.jwtLinks.values()).filter(link => link.expiresAt < now);

    expiredLinks.forEach(link => {
      this.jwtLinks.delete(link.id);
      this.usedTokens.add(link.token);
    });

    console.log(`🧹 Cleaned up ${expiredLinks.length} expired JWT tokens`);

    return expiredLinks.length;
  }

  /**
   * Genera JWT (simulazione)
   */
  private generateJWT(payload: any): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    // Simulazione firma
    const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${this.secretKey}`).toString(
      'base64url'
    );

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Decodifica JWT (simulazione)
   */
  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Statistiche JWT
   */
  async getJWTStats(): Promise<{
    totalLinks: number;
    activeLinks: number;
    expiredLinks: number;
    usedLinks: number;
    uploadLinks: number;
    accessLinks: number;
  }> {
    const links = Array.from(this.jwtLinks.values());
    const now = new Date();

    return {
      totalLinks: links.length,
      activeLinks: links.filter(link => link.expiresAt > now && link.usedCount < link.maxUses)
        .length,
      expiredLinks: links.filter(link => link.expiresAt <= now).length,
      usedLinks: links.filter(link => link.usedCount >= link.maxUses).length,
      uploadLinks: links.filter(link => link.type === 'upload').length,
      accessLinks: links.filter(link => link.type === 'access').length,
    };
  }
}
