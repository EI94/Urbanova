import {
  Buyer,
  BuyerDocument,
  KYCRequest,
  KYCStatus,
  DocumentType,
  DocumentStatus,
} from '@urbanova/types';

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

export class KYCService {
  private kycRequests: Map<string, KYCRequest> = new Map();
  private documents: Map<string, BuyerDocument> = new Map();
  private docHunterApi: any; // Simulazione Doc Hunter API

  constructor() {
    this.docHunterApi = {
      uploadDocument: async (file: any, type: string) => {
        // Simulazione upload Doc Hunter
        console.log(`📤 Doc Hunter Upload - Type: ${type}, File: ${file.name}`);
        return {
          documentId: `doc_${Date.now()}`,
          status: 'uploaded',
          verificationUrl: `https://dochunter.com/verify/${Date.now()}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
        };
      },

      verifyDocument: async (documentId: string) => {
        // Simulazione verifica Doc Hunter
        console.log(`🔍 Doc Hunter Verify - Document: ${documentId}`);
        return {
          verified: true,
          confidence: 0.95,
          extractedData: {
            name: 'Mario Rossi',
            birthDate: '1985-03-15',
            documentNumber: 'CA123456789',
            expiryDate: '2030-12-31',
          },
          verificationDate: new Date(),
        };
      },
    };
  }

  /**
   * Crea richiesta KYC
   */
  async createKYCRequest(request: {
    buyerId: string;
    projectId: string;
    documentTypes: string[];
    uploadLink: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  }): Promise<KYCRequest> {
    const kycRequest: KYCRequest = {
      id: `kyc_${Date.now()}`,
      buyerId: request.buyerId,
      projectId: request.projectId,
      documentTypes: request.documentTypes,
      uploadLink: request.uploadLink,
      status: request.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: [],
      verificationResults: null,
      complianceStatus: 'pending',
    };

    this.kycRequests.set(kycRequest.id, kycRequest);
    console.log(`✅ KYC Request Created - ID: ${kycRequest.id}, Buyer: ${request.buyerId}`);

    return kycRequest;
  }

  /**
   * Upload documento KYC
   */
  async uploadDocument(request: {
    kycRequestId: string;
    documentType: DocumentType;
    file: any;
    metadata?: any;
  }): Promise<BuyerDocument> {
    const kycRequest = this.kycRequests.get(request.kycRequestId);
    if (!kycRequest) {
      throw new Error(`KYC Request ${request.kycRequestId} not found`);
    }

    // Upload su Doc Hunter
    const docHunterResult = await this.docHunterApi.uploadDocument(
      request.file,
      request.documentType
    );

    const document: BuyerDocument = {
      id: docHunterResult.documentId,
      buyerId: kycRequest.buyerId,
      kycRequestId: request.kycRequestId,
      documentType: request.documentType,
      fileName: request.file.name,
      fileSize: request.file.size,
      uploadDate: new Date(),
      status: 'uploaded' as DocumentStatus,
      docHunterUrl: docHunterResult.verificationUrl,
      expiresAt: docHunterResult.expiresAt,
      metadata: request.metadata || {},
      verificationData: null,
    };

    this.documents.set(document.id, document);
    kycRequest.documents.push(document);
    kycRequest.updatedAt = new Date();

    console.log(`📄 Document Uploaded - ID: ${document.id}, Type: ${request.documentType}`);

    return document;
  }

  /**
   * Verifica documento
   */
  async verifyDocument(documentId: string): Promise<BuyerDocument> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Verifica su Doc Hunter
    const verificationResult = await this.docHunterApi.verifyDocument(documentId);

    document.verificationData = verificationResult.extractedData;
    document.status = verificationResult.verified ? 'verified' : 'rejected';
    document.verifiedAt = new Date();
    document.confidence = verificationResult.confidence;

    // Aggiorna status KYC request
    const kycRequest = this.kycRequests.get(document.kycRequestId);
    if (kycRequest) {
      const allVerified = kycRequest.documents.every(doc => doc.status === 'verified');
      if (allVerified) {
        kycRequest.status = 'completed';
        kycRequest.complianceStatus = 'compliant';
        kycRequest.verificationResults = {
          verifiedAt: new Date(),
          confidence:
            kycRequest.documents.reduce((acc, doc) => acc + (doc.confidence || 0), 0) /
            kycRequest.documents.length,
        };
      }
      kycRequest.updatedAt = new Date();
    }

    console.log(`✅ Document Verified - ID: ${documentId}, Status: ${document.status}`);

    return document;
  }

  /**
   * Ottieni status KYC
   */
  async getKYCStatus(buyerId: string): Promise<KYCStatus> {
    const buyerKYCRequests = Array.from(this.kycRequests.values())
      .filter(kyc => kyc.buyerId === buyerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (buyerKYCRequests.length === 0) {
      return {
        hasKYC: false,
        status: 'not_started',
        lastRequest: null,
        documents: [],
        complianceStatus: 'not_applicable',
      };
    }

    const latestRequest = buyerKYCRequests[0];
    const documents = Array.from(this.documents.values()).filter(doc => doc.buyerId === buyerId);

    return {
      hasKYC: true,
      status: latestRequest.status,
      lastRequest: latestRequest,
      documents,
      complianceStatus: latestRequest.complianceStatus,
    };
  }

  /**
   * Lista richieste KYC
   */
  async listKYCRequests(
    filters: {
      buyerId?: string;
      projectId?: string;
      status?: string;
    } = {}
  ): Promise<KYCRequest[]> {
    let requests = Array.from(this.kycRequests.values());

    if (filters.buyerId) {
      requests = requests.filter(req => req.buyerId === filters.buyerId);
    }

    if (filters.projectId) {
      requests = requests.filter(req => req.projectId === filters.projectId);
    }

    if (filters.status) {
      requests = requests.filter(req => req.status === filters.status);
    }

    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Ottieni documento
   */
  async getDocument(documentId: string): Promise<BuyerDocument | null> {
    return this.documents.get(documentId) || null;
  }

  /**
   * Lista documenti buyer
   */
  async listBuyerDocuments(buyerId: string): Promise<BuyerDocument[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.buyerId === buyerId)
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }

  /**
   * Aggiorna status KYC
   */
  async updateKYCStatus(
    kycRequestId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  ): Promise<KYCRequest> {
    const kycRequest = this.kycRequests.get(kycRequestId);
    if (!kycRequest) {
      throw new Error(`KYC Request ${kycRequestId} not found`);
    }

    kycRequest.status = status;
    kycRequest.updatedAt = new Date();

    if (status === 'completed') {
      kycRequest.complianceStatus = 'compliant';
      kycRequest.verificationResults = {
        verifiedAt: new Date(),
        confidence: 0.95,
      };
    }

    console.log(`🔄 KYC Status Updated - ID: ${kycRequestId}, Status: ${status}`);

    return kycRequest;
  }

  /**
   * Elimina documento
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    const document = this.documents.get(documentId);
    if (!document) {
      return false;
    }

    // Rimuovi da KYC request
    const kycRequest = this.kycRequests.get(document.kycRequestId);
    if (kycRequest) {
      kycRequest.documents = kycRequest.documents.filter(doc => doc.id !== documentId);
      kycRequest.updatedAt = new Date();
    }

    this.documents.delete(documentId);
    console.log(`🗑️ Document Deleted - ID: ${documentId}`);

    return true;
  }

  /**
   * Esporta dati KYC (GDPR compliance)
   */
  async exportKYCData(buyerId: string): Promise<{
    kycRequests: KYCRequest[];
    documents: BuyerDocument[];
    metadata: any;
  }> {
    const kycRequests = await this.listKYCRequests({ buyerId });
    const documents = await this.listBuyerDocuments(buyerId);

    return {
      kycRequests,
      documents,
      metadata: {
        exportedAt: new Date(),
        buyerId,
        totalRequests: kycRequests.length,
        totalDocuments: documents.length,
      },
    };
  }

  /**
   * Cancellazione dati (GDPR right to erasure)
   */
  async deleteKYCData(buyerId: string): Promise<boolean> {
    const kycRequests = await this.listKYCRequests({ buyerId });
    const documents = await this.listBuyerDocuments(buyerId);

    // Cancella tutti i documenti
    for (const document of documents) {
      this.documents.delete(document.id);
    }

    // Cancella tutte le richieste KYC
    for (const request of kycRequests) {
      this.kycRequests.delete(request.id);
    }

    console.log(
      `🗑️ KYC Data Deleted - Buyer: ${buyerId}, Requests: ${kycRequests.length}, Documents: ${documents.length}`
    );

    return true;
  }
}
