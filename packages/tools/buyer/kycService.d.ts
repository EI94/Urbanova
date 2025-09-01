import { BuyerDocument, KYCRequest, KYCStatus, DocumentType } from '@urbanova/types';
/**
 * KYC Service
 *
 * Gestione completa KYC con Doc Hunter:
 * - Creazione richieste KYC
 * - Upload documenti
 * - Verifica documenti
 * - Tracking status
 * - Compliance GDPR
 */
export declare class KYCService {
  private kycRequests;
  private documents;
  private docHunterApi;
  constructor();
  /**
   * Crea richiesta KYC
   */
  createKYCRequest(request: {
    buyerId: string;
    projectId: string;
    documentTypes: string[];
    uploadLink: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  }): Promise<KYCRequest>;
  /**
   * Upload documento KYC
   */
  uploadDocument(request: {
    kycRequestId: string;
    documentType: DocumentType;
    file: any;
    metadata?: any;
  }): Promise<BuyerDocument>;
  /**
   * Verifica documento
   */
  verifyDocument(documentId: string): Promise<BuyerDocument>;
  /**
   * Ottieni status KYC
   */
  getKYCStatus(buyerId: string): Promise<KYCStatus>;
  /**
   * Lista richieste KYC
   */
  listKYCRequests(filters?: {
    buyerId?: string;
    projectId?: string;
    status?: string;
  }): Promise<KYCRequest[]>;
  /**
   * Ottieni documento
   */
  getDocument(documentId: string): Promise<BuyerDocument | null>;
  /**
   * Lista documenti buyer
   */
  listBuyerDocuments(buyerId: string): Promise<BuyerDocument[]>;
  /**
   * Aggiorna status KYC
   */
  updateKYCStatus(
    kycRequestId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  ): Promise<KYCRequest>;
  /**
   * Elimina documento
   */
  deleteDocument(documentId: string): Promise<boolean>;
  /**
   * Esporta dati KYC (GDPR compliance)
   */
  exportKYCData(buyerId: string): Promise<{
    kycRequests: KYCRequest[];
    documents: BuyerDocument[];
    metadata: any;
  }>;
  /**
   * Cancellazione dati (GDPR right to erasure)
   */
  deleteKYCData(buyerId: string): Promise<boolean>;
}
//# sourceMappingURL=kycService.d.ts.map
