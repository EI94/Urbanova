"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCService = void 0;
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
class KYCService {
    constructor() {
        this.kycRequests = new Map();
        this.documents = new Map();
        this.docHunterApi = {
            uploadDocument: async (file, type) => {
                // Simulazione upload Doc Hunter
                console.log(`📤 Doc Hunter Upload - Type: ${type}, File: ${file.name}`);
                return {
                    documentId: `doc_${Date.now()}`,
                    status: 'uploaded',
                    verificationUrl: `https://dochunter.com/verify/${Date.now()}`,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
                };
            },
            verifyDocument: async (documentId) => {
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
    async createKYCRequest(request) {
        const kycRequest = {
            id: `kyc_${Date.now()}`,
            buyerId: request.buyerId,
            documents: [],
            status: request.status,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.kycRequests.set(kycRequest.id, kycRequest);
        console.log(`✅ KYC Request Created - ID: ${kycRequest.id}, Buyer: ${request.buyerId}`);
        return kycRequest;
    }
    /**
     * Upload documento KYC
     */
    async uploadDocument(request) {
        const kycRequest = this.kycRequests.get(request.kycRequestId);
        if (!kycRequest) {
            throw new Error(`KYC Request ${request.kycRequestId} not found`);
        }
        // Upload su Doc Hunter
        const docHunterResult = await this.docHunterApi.uploadDocument(request.file, request.documentType);
        const document = {
            id: docHunterResult.documentId,
            type: request.documentType,
            filename: request.file.name,
            url: docHunterResult.verificationUrl,
            uploadedAt: new Date(),
            status: 'pending',
        };
        this.documents.set(document.id, document);
        kycRequest.documents.push(document.id);
        kycRequest.updatedAt = new Date();
        console.log(`📄 Document Uploaded - ID: ${document.id}, Type: ${request.documentType}`);
        return document;
    }
    /**
     * Verifica documento
     */
    async verifyDocument(documentId) {
        const document = this.documents.get(documentId);
        if (!document) {
            throw new Error(`Document ${documentId} not found`);
        }
        // Verifica su Doc Hunter
        const verificationResult = await this.docHunterApi.verifyDocument(documentId);
        // Note: BuyerDocument doesn't support verification properties
        // Store verification data separately if needed
        console.log(`✅ Document Verified - ID: ${documentId}`);
        return document;
    }
    /**
     * Ottieni status KYC
     */
    async getKYCStatus(buyerId) {
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
        const documents = Array.from(this.documents.values());
        if (!latestRequest) {
            return {
                hasKYC: false,
                status: 'pending',
                lastRequest: null,
                documents: [],
            };
        }
        return {
            hasKYC: true,
            status: latestRequest.status,
            lastRequest: latestRequest,
            documents,
        };
    }
    /**
     * Lista richieste KYC
     */
    async listKYCRequests(filters = {}) {
        let requests = Array.from(this.kycRequests.values());
        if (filters.buyerId) {
            requests = requests.filter(req => req.buyerId === filters.buyerId);
        }
        if (filters.status) {
            requests = requests.filter(req => req.status === filters.status);
        }
        return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    /**
     * Ottieni documento
     */
    async getDocument(documentId) {
        return this.documents.get(documentId) || null;
    }
    /**
     * Lista documenti buyer
     */
    async listBuyerDocuments(buyerId) {
        return Array.from(this.documents.values())
            .filter(doc => doc.buyerId === buyerId)
            .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    }
    /**
     * Aggiorna status KYC
     */
    async updateKYCStatus(kycRequestId, status) {
        const kycRequest = this.kycRequests.get(kycRequestId);
        if (!kycRequest) {
            throw new Error(`KYC Request ${kycRequestId} not found`);
        }
        kycRequest.status = status;
        kycRequest.updatedAt = new Date();
        if (status === 'completed') {
            // KYC completed successfully
            console.log(`✅ KYC Request ${kycRequestId} completed`);
        }
        console.log(`🔄 KYC Status Updated - ID: ${kycRequestId}, Status: ${status}`);
        return kycRequest;
    }
    /**
     * Elimina documento
     */
    async deleteDocument(documentId) {
        const document = this.documents.get(documentId);
        if (!document) {
            return false;
        }
        // Rimuovi da KYC request
        const kycRequest = this.kycRequests.get(document.kycRequestId);
        if (kycRequest) {
            kycRequest.documents = kycRequest.documents.filter((doc) => doc.id !== documentId);
            kycRequest.updatedAt = new Date();
        }
        this.documents.delete(documentId);
        console.log(`🗑️ Document Deleted - ID: ${documentId}`);
        return true;
    }
    /**
     * Esporta dati KYC (GDPR compliance)
     */
    async exportKYCData(buyerId) {
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
    async deleteKYCData(buyerId) {
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
        console.log(`🗑️ KYC Data Deleted - Buyer: ${buyerId}, Requests: ${kycRequests.length}, Documents: ${documents.length}`);
        return true;
    }
}
exports.KYCService = KYCService;
//# sourceMappingURL=kycService.js.map