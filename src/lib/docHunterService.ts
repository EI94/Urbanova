// Doc Hunter Service - Urbanova AI
// Verifica certificazioni vendor per autorizzare pagamenti SAL

export interface VendorCertification {
  type: 'DURC' | 'VISURA' | 'ASSICURAZIONE' | 'CERTIFICAZIONE' | 'ALTRO';
  status: 'VALID' | 'EXPIRED' | 'MISSING' | 'INVALID';
  documentId: string;
  expiryDate?: Date;
  verifiedAt: Date;
  verifiedBy: string;
  notes?: string;
}

export interface VendorCertificationResult {
  isValid: boolean;
  vendorId: string;
  certifications: VendorCertification[];
  missingCertifications: string[];
  overallScore: number; // 0-100
  lastVerified: Date;
}

export class DocHunterService {
  private readonly COLLECTION = 'vendor_certifications';

  /**
   * Verifica tutte le certificazioni di un vendor
   */
  async verifyVendorCertifications(vendorId: string): Promise<VendorCertificationResult> {
    try {
      console.log('🔍 [DocHunter] Verifica certificazioni vendor:', vendorId);

      // In produzione, questo servizio si collegherebbe a sistemi esterni
      // come Agenzia delle Entrate, Inail, etc.

      // Per ora, simuliamo la verifica con dati mock
      const mockCertifications = this.generateMockCertifications(vendorId);

      const result: VendorCertificationResult = {
        isValid: this.validateCertifications(mockCertifications),
        vendorId,
        certifications: mockCertifications,
        missingCertifications: this.getMissingCertifications(mockCertifications),
        overallScore: this.calculateOverallScore(mockCertifications),
        lastVerified: new Date(),
      };

      console.log('✅ [DocHunter] Verifica completata:', result);

      return result;
    } catch (error) {
      console.error('❌ [DocHunter] Errore verifica certificazioni:', error);

      // In caso di errore, ritorna risultato negativo per sicurezza
      return {
        isValid: false,
        vendorId,
        certifications: [],
        missingCertifications: ['DURC', 'VISURA', 'ASSICURAZIONE'],
        overallScore: 0,
        lastVerified: new Date(),
      };
    }
  }

  /**
   * Verifica una certificazione specifica
   */
  async verifySpecificCertification(
    vendorId: string,
    certificationType: string
  ): Promise<VendorCertification | null> {
    try {
      console.log('🔍 [DocHunter] Verifica certificazione specifica:', vendorId, certificationType);

      // Simula verifica specifica
      const mockCert = this.generateMockCertification(vendorId, certificationType);

      return mockCert;
    } catch (error) {
      console.error('❌ [DocHunter] Errore verifica certificazione specifica:', error);
      return null;
    }
  }

  /**
   * Aggiorna certificazioni vendor
   */
  async updateVendorCertifications(
    vendorId: string,
    certifications: VendorCertification[]
  ): Promise<boolean> {
    try {
      console.log('📝 [DocHunter] Aggiornamento certificazioni vendor:', vendorId);

      // In produzione, salverebbe su database
      // Per ora, simuliamo il successo

      console.log('✅ [DocHunter] Certificazioni aggiornate con successo');
      return true;
    } catch (error) {
      console.error('❌ [DocHunter] Errore aggiornamento certificazioni:', error);
      return false;
    }
  }

  /**
   * Genera certificazioni mock per test
   */
  private generateMockCertifications(vendorId: string): VendorCertification[] {
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    return [
      {
        type: 'DURC',
        status: 'VALID',
        documentId: `durc_${vendorId}_${Date.now()}`,
        expiryDate: oneYearFromNow,
        verifiedAt: sixMonthsAgo,
        verifiedBy: 'Agenzia delle Entrate',
        notes: 'Documento Unico di Regolarità Contributiva valido',
      },
      {
        type: 'VISURA',
        status: 'VALID',
        documentId: `visura_${vendorId}_${Date.now()}`,
        expiryDate: oneYearFromNow,
        verifiedAt: sixMonthsAgo,
        verifiedBy: 'Camera di Commercio',
        notes: 'Visura camerale aggiornata',
      },
      {
        type: 'ASSICURAZIONE',
        status: 'VALID',
        documentId: `assic_${vendorId}_${Date.now()}`,
        expiryDate: oneYearFromNow,
        verifiedAt: sixMonthsAgo,
        verifiedBy: 'INAIL',
        notes: 'Assicurazione INAIL attiva',
      },
      {
        type: 'CERTIFICAZIONE',
        status: 'VALID',
        documentId: `cert_${vendorId}_${Date.now()}`,
        expiryDate: oneYearFromNow,
        verifiedAt: sixMonthsAgo,
        verifiedBy: 'Organismo di Certificazione',
        notes: 'Certificazione qualità ISO 9001',
      },
    ];
  }

  /**
   * Genera una certificazione mock specifica
   */
  private generateMockCertification(vendorId: string, type: string): VendorCertification {
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    return {
      type: type as any,
      status: 'VALID',
      documentId: `${type.toLowerCase()}_${vendorId}_${Date.now()}`,
      expiryDate: oneYearFromNow,
      verifiedAt: sixMonthsAgo,
      verifiedBy: 'Sistema Automatico',
      notes: `Certificazione ${type} verificata automaticamente`,
    };
  }

  /**
   * Valida le certificazioni
   */
  private validateCertifications(certifications: VendorCertification[]): boolean {
    // Tutte le certificazioni richieste devono essere VALID
    const requiredTypes = ['DURC', 'VISURA', 'ASSICURAZIONE'];
    const validCertifications = certifications.filter(
      cert => cert.status === 'VALID' && requiredTypes.includes(cert.type)
    );

    return validCertifications.length === requiredTypes.length;
  }

  /**
   * Ottiene le certificazioni mancanti
   */
  private getMissingCertifications(certifications: VendorCertification[]): string[] {
    const requiredTypes = ['DURC', 'VISURA', 'ASSICURAZIONE'];
    const validTypes = certifications
      .filter(cert => cert.status === 'VALID')
      .map(cert => cert.type);

    return requiredTypes.filter(type => !validTypes.includes(type as any));
  }

  /**
   * Calcola il punteggio complessivo
   */
  private calculateOverallScore(certifications: VendorCertification[]): number {
    if (certifications.length === 0) return 0;

    const validCount = certifications.filter(cert => cert.status === 'VALID').length;
    const totalCount = certifications.length;

    return Math.round((validCount / totalCount) * 100);
  }

  /**
   * Verifica se un vendor può ricevere pagamenti
   */
  canVendorReceivePayments(vendorId: string): Promise<boolean> {
    return this.verifyVendorCertifications(vendorId).then(result => result.isValid);
  }

  /**
   * Ottiene il report completo delle certificazioni
   */
  async getCertificationReport(vendorId: string): Promise<VendorCertificationResult> {
    return this.verifyVendorCertifications(vendorId);
  }
}

export const docHunterService = new DocHunterService();
