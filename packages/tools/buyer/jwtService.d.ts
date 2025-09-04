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
export declare class JWTService {
    private jwtLinks;
    private secretKey;
    private usedTokens;
    /**
     * Genera link upload
     */
    generateUploadLink(request: {
        buyerId: string;
        projectId: string;
        documentTypes: string[];
        expiresIn: number;
        permissions: JWTPermission[];
    }): Promise<BuyerJWTLink>;
    /**
     * Genera link accesso
     */
    generateAccessLink(request: {
        buyerId: string;
        projectId: string;
        permissions: JWTPermission[];
        expiresIn: number;
        maxUses?: number;
    }): Promise<BuyerJWTLink>;
    /**
     * Verifica token
     */
    verifyToken(token: string): Promise<{
        valid: boolean;
        jwtLink?: BuyerJWTLink;
        error?: string;
    }>;
    /**
     * Usa token
     */
    useToken(token: string): Promise<{
        success: boolean;
        jwtLink?: BuyerJWTLink;
        error?: string;
    }>;
    /**
     * Revoca token
     */
    revokeToken(token: string): Promise<boolean>;
    /**
     * Ottieni JWT link
     */
    getJWTLink(jwtLinkId: string): Promise<BuyerJWTLink | null>;
    /**
     * Lista JWT link
     */
    listJWTLinks(filters?: {
        buyerId?: string;
        projectId?: string;
        type?: 'upload' | 'access';
        active?: boolean;
    }): Promise<BuyerJWTLink[]>;
    /**
     * Pulisci token scaduti
     */
    cleanupExpiredTokens(): Promise<number>;
    /**
     * Genera JWT (simulazione)
     */
    private generateJWT;
    /**
     * Decodifica JWT (simulazione)
     */
    private decodeJWT;
    /**
     * Statistiche JWT
     */
    getJWTStats(): Promise<{
        totalLinks: number;
        activeLinks: number;
        expiredLinks: number;
        usedLinks: number;
        uploadLinks: number;
        accessLinks: number;
    }>;
}
//# sourceMappingURL=jwtService.d.ts.map