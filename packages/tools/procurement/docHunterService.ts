import axios from 'axios';

/**
 * Servizio Doc Hunter per verifica automatica documenti vendor
 *
 * Integra con:
 * - API DURC (Direzione Centrale per la Vigilanza sui Lavori Pubblici)
 * - Visura camerale (Registro Imprese)
 * - Certificazioni ISO e altre
 * - Verifica scadenze e validità
 */

export interface DocumentCheckRequest {
  type: 'DURC' | 'visura' | 'certification' | 'insurance' | 'financial';
  vendorId: string;
  documentUrl?: string;
  expiryDate?: Date;
  vendorData?: {
    vatNumber: string;
    fiscalCode: string;
    companyName: string;
  };
}

export interface DocumentCheckResult {
  type: string;
  status: 'valid' | 'expired' | 'missing' | 'invalid' | 'pending';
  score: number; // 0-100
  notes: string;
  verifiedAt: Date;
  expiresAt?: Date;
  documentUrl?: string;
  verificationSource: string;
  confidence: number; // 0-1
  warnings: string[];
  errors: string[];
}

export interface PreCheckRequest {
  vendorId: string;
  rdoId: string;
  requiredDocuments: string[];
}

export interface PreCheckResponse {
  vendorId: string;
  rdoId: string;
  passed: boolean;
  overallScore: number;
  checks: DocumentCheckResult[];
  warnings: string[];
  errors: string[];
  recommendations: string[];
  lastChecked: Date;
  nextCheckDue: Date;
}

export class DocHunterService {
  private apiKey: string;
  private baseUrl: string;
  private rateLimit: { requests: number; window: number; lastReset: number };

  constructor() {
    this.apiKey = process.env.DOC_HUNTER_API_KEY || 'demo-key';
    this.baseUrl = process.env.DOC_HUNTER_BASE_URL || 'https://api.dochunter.com/v1';
    this.rateLimit = { requests: 0, window: 60000, lastReset: Date.now() };
  }

  /**
   * Verifica singolo documento
   */
  async verifyDocument(request: DocumentCheckRequest): Promise<DocumentCheckResult> {
    try {
      // Rate limiting
      this.checkRateLimit();

      console.log(
        `🔍 [DocHunter] Verifica documento ${request.type} per vendor ${request.vendorId}`
      );

      let result: DocumentCheckResult;

      switch (request.type) {
        case 'DURC':
          result = await this.verifyDURC(request);
          break;
        case 'visura':
          result = await this.verifyVisura(request);
          break;
        case 'certification':
          result = await this.verifyCertification(request);
          break;
        case 'insurance':
          result = await this.verifyInsurance(request);
          break;
        case 'financial':
          result = await this.verifyFinancial(request);
          break;
        default:
          throw new Error(`Tipo documento non supportato: ${request.type}`);
      }

      // Log audit
      this.logAudit(request, result);

      return result;
    } catch (error) {
      console.error(`❌ [DocHunter] Errore verifica documento ${request.type}:`, error);

      // Fallback per errori API
      return this.createFallbackResult(request, error);
    }
  }

  /**
   * Pre-check completo per vendor
   */
  async performPreCheck(request: PreCheckRequest): Promise<PreCheckResponse> {
    try {
      console.log(
        `🔍 [DocHunter] Pre-check completo per vendor ${request.vendorId} su RDO ${request.rdoId}`
      );

      const checks: DocumentCheckResult[] = [];
      let overallScore = 0;
      let passed = true;
      const warnings: string[] = [];
      const errors: string[] = [];

      // Verifica ogni documento richiesto
      for (const docType of request.requiredDocuments) {
        const checkResult = await this.verifyDocument({
          type: docType as any,
          vendorId: request.vendorId,
        });

        checks.push(checkResult);
        overallScore += checkResult.score;

        if (checkResult.status === 'expired' || checkResult.status === 'invalid') {
          errors.push(`${docType}: ${checkResult.notes}`);
          passed = false;
        } else if (checkResult.status === 'pending') {
          warnings.push(`${docType}: ${checkResult.notes}`);
        }
      }

      // Calcola score medio
      overallScore = Math.round(overallScore / request.requiredDocuments.length);

      // Genera raccomandazioni
      const recommendations = this.generateRecommendations(checks, overallScore);

      const response: PreCheckResponse = {
        vendorId: request.vendorId,
        rdoId: request.rdoId,
        passed,
        overallScore,
        checks,
        warnings,
        errors,
        recommendations,
        lastChecked: new Date(),
        nextCheckDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
      };

      console.log(
        `${passed ? '✅' : '❌'} [DocHunter] Pre-check completato: ${passed ? 'PASSED' : 'FAILED'} (score: ${overallScore})`
      );

      return response;
    } catch (error) {
      console.error(`❌ [DocHunter] Errore pre-check:`, error);
      throw new Error(`Errore pre-check: ${error.message}`);
    }
  }

  // ===========================================
  // DOCUMENT VERIFICATION METHODS
  // ===========================================

  /**
   * Verifica DURC (Documento Unico di Regolarità Contributiva)
   */
  private async verifyDURC(request: DocumentCheckRequest): Promise<DocumentCheckResult> {
    try {
      // API call a sistema DURC
      const response = await axios.post(
        `${this.baseUrl}/verify/durc`,
        {
          vatNumber: request.vendorData?.vatNumber,
          fiscalCode: request.vendorData?.fiscalCode,
          companyName: request.vendorData?.companyName,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );

      const data = response.data;

      return {
        type: 'DURC',
        status: data.valid ? 'valid' : 'invalid',
        score: data.valid ? 100 : 0,
        notes: data.valid ? 'DURC valido e aggiornato' : `DURC non valido: ${data.reason}`,
        verifiedAt: new Date(),
        expiresAt: data.expiryDate ? new Date(data.expiryDate) : undefined,
        documentUrl: data.documentUrl,
        verificationSource: 'DURC API',
        confidence: 0.95,
        warnings: data.warnings || [],
        errors: data.errors || [],
      };
    } catch (error) {
      // Fallback per errori API
      return {
        type: 'DURC',
        status: 'pending',
        score: 50,
        notes: 'Verifica DURC in corso - errore API',
        verifiedAt: new Date(),
        verificationSource: 'DocHunter Fallback',
        confidence: 0.5,
        warnings: ['Verifica manuale richiesta'],
        errors: ['Errore API DURC'],
      };
    }
  }

  /**
   * Verifica Visura Camerale
   */
  private async verifyVisura(request: DocumentCheckRequest): Promise<DocumentCheckResult> {
    try {
      // API call a Registro Imprese
      const response = await axios.post(
        `${this.baseUrl}/verify/visura`,
        {
          vatNumber: request.vendorData?.vatNumber,
          companyName: request.vendorData?.companyName,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );

      const data = response.data;

      return {
        type: 'visura',
        status: data.active ? 'valid' : 'invalid',
        score: data.active ? 100 : 0,
        notes: data.active ? 'Azienda attiva e regolare' : `Azienda non attiva: ${data.status}`,
        verifiedAt: new Date(),
        documentUrl: data.visuraUrl,
        verificationSource: 'Registro Imprese API',
        confidence: 0.98,
        warnings: data.warnings || [],
        errors: data.errors || [],
      };
    } catch (error) {
      return {
        type: 'visura',
        status: 'pending',
        score: 50,
        notes: 'Verifica visura in corso - errore API',
        verifiedAt: new Date(),
        verificationSource: 'DocHunter Fallback',
        confidence: 0.5,
        warnings: ['Verifica manuale richiesta'],
        errors: ['Errore API Registro Imprese'],
      };
    }
  }

  /**
   * Verifica Certificazioni
   */
  private async verifyCertification(request: DocumentCheckRequest): Promise<DocumentCheckResult> {
    try {
      // Verifica certificazioni ISO, UNI, etc.
      const response = await axios.post(
        `${this.baseUrl}/verify/certification`,
        {
          vendorId: request.vendorId,
          documentUrl: request.documentUrl,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );

      const data = response.data;

      return {
        type: 'certification',
        status: data.valid ? 'valid' : 'invalid',
        score: data.valid ? 100 : 0,
        notes: data.valid
          ? `Certificazione ${data.type} valida`
          : `Certificazione non valida: ${data.reason}`,
        verifiedAt: new Date(),
        expiresAt: data.expiryDate ? new Date(data.expiryDate) : undefined,
        documentUrl: request.documentUrl,
        verificationSource: 'Certification Authority API',
        confidence: 0.9,
        warnings: data.warnings || [],
        errors: data.errors || [],
      };
    } catch (error) {
      return {
        type: 'certification',
        status: 'pending',
        score: 50,
        notes: 'Verifica certificazione in corso',
        verifiedAt: new Date(),
        verificationSource: 'DocHunter Fallback',
        confidence: 0.5,
        warnings: ['Verifica manuale richiesta'],
        errors: ['Errore API certificazione'],
      };
    }
  }

  /**
   * Verifica Assicurazioni
   */
  private async verifyInsurance(request: DocumentCheckRequest): Promise<DocumentCheckResult> {
    try {
      // Verifica polizze assicurative
      const response = await axios.post(
        `${this.baseUrl}/verify/insurance`,
        {
          vendorId: request.vendorId,
          documentUrl: request.documentUrl,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );

      const data = response.data;

      return {
        type: 'insurance',
        status: data.active ? 'valid' : 'expired',
        score: data.active ? 100 : 0,
        notes: data.active ? 'Polizza assicurativa attiva' : 'Polizza assicurativa scaduta',
        verifiedAt: new Date(),
        expiresAt: data.expiryDate ? new Date(data.expiryDate) : undefined,
        documentUrl: request.documentUrl,
        verificationSource: 'Insurance Database API',
        confidence: 0.85,
        warnings: data.warnings || [],
        errors: data.errors || [],
      };
    } catch (error) {
      return {
        type: 'insurance',
        status: 'pending',
        score: 50,
        notes: 'Verifica assicurazione in corso',
        verifiedAt: new Date(),
        verificationSource: 'DocHunter Fallback',
        confidence: 0.5,
        warnings: ['Verifica manuale richiesta'],
        errors: ['Errore API assicurazione'],
      };
    }
  }

  /**
   * Verifica Dati Finanziari
   */
  private async verifyFinancial(request: DocumentCheckRequest): Promise<DocumentCheckResult> {
    try {
      // Verifica bilancio e rating finanziario
      const response = await axios.post(
        `${this.baseUrl}/verify/financial`,
        {
          vatNumber: request.vendorData?.vatNumber,
          fiscalCode: request.vendorData?.fiscalCode,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );

      const data = response.data;

      return {
        type: 'financial',
        status: data.solvent ? 'valid' : 'invalid',
        score: data.solvent ? 100 : 0,
        notes: data.solvent
          ? 'Situazione finanziaria solida'
          : `Problemi finanziari: ${data.issues}`,
        verifiedAt: new Date(),
        verificationSource: 'Financial Database API',
        confidence: 0.8,
        warnings: data.warnings || [],
        errors: data.errors || [],
      };
    } catch (error) {
      return {
        type: 'financial',
        status: 'pending',
        score: 50,
        notes: 'Verifica finanziaria in corso',
        verifiedAt: new Date(),
        verificationSource: 'DocHunter Fallback',
        confidence: 0.5,
        warnings: ['Verifica manuale richiesta'],
        errors: ['Errore API finanziaria'],
      };
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Controllo rate limiting
   */
  private checkRateLimit(): void {
    const now = Date.now();

    if (now - this.rateLimit.lastReset > this.rateLimit.window) {
      this.rateLimit.requests = 0;
      this.rateLimit.lastReset = now;
    }

    if (this.rateLimit.requests >= 100) {
      // 100 richieste per minuto
      throw new Error('Rate limit exceeded. Riprova tra un minuto.');
    }

    this.rateLimit.requests++;
  }

  /**
   * Crea risultato fallback per errori
   */
  private createFallbackResult(request: DocumentCheckRequest, error: any): DocumentCheckResult {
    return {
      type: request.type,
      status: 'pending',
      score: 25,
      notes: `Verifica non disponibile: ${error.message}`,
      verifiedAt: new Date(),
      verificationSource: 'DocHunter Fallback',
      confidence: 0.25,
      warnings: ['Verifica manuale richiesta'],
      errors: [error.message],
    };
  }

  /**
   * Genera raccomandazioni basate sui risultati
   */
  private generateRecommendations(checks: DocumentCheckResult[], overallScore: number): string[] {
    const recommendations: string[] = [];

    if (overallScore < 50) {
      recommendations.push('Richiedi verifica manuale di tutti i documenti');
      recommendations.push("Considera sospendere l'aggiudicazione");
    } else if (overallScore < 80) {
      recommendations.push('Verifica manuale dei documenti con score basso');
      recommendations.push("Richiedi aggiornamenti prima dell'aggiudicazione");
    } else {
      recommendations.push("Documenti in ordine - procedi con l'aggiudicazione");
    }

    // Raccomandazioni specifiche per tipo documento
    checks.forEach(check => {
      if (check.status === 'expired') {
        recommendations.push(`Richiedi rinnovo ${check.type} per ${check.notes}`);
      } else if (check.status === 'pending') {
        recommendations.push(`Completa verifica ${check.type} con documentazione`);
      }
    });

    return recommendations;
  }

  /**
   * Log audit per compliance
   */
  private logAudit(request: DocumentCheckRequest, result: DocumentCheckResult): void {
    console.log(`📝 [DocHunter] AUDIT: Verifica ${request.type} per vendor ${request.vendorId}`);
    console.log(`  • Status: ${result.status}`);
    console.log(`  • Score: ${result.score}/100`);
    console.log(`  • Confidence: ${result.confidence}`);
    console.log(`  • Source: ${result.verificationSource}`);
    console.log(`  • Timestamp: ${result.verifiedAt.toISOString()}`);
  }

  /**
   * Health check del servizio
   */
  async healthCheck(): Promise<{ status: string; services: any[] }> {
    try {
      const services = [
        { name: 'DURC API', status: 'unknown' },
        { name: 'Visura API', status: 'unknown' },
        { name: 'Certification API', status: 'unknown' },
        { name: 'Insurance API', status: 'unknown' },
        { name: 'Financial API', status: 'unknown' },
      ];

      // Test rapido di ogni servizio
      for (let i = 0; i < services.length; i++) {
        try {
          await axios.get(`${this.baseUrl}/health/${services[i].name.toLowerCase()}`, {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            timeout: 5000,
          });
          services[i].status = 'healthy';
        } catch (error) {
          services[i].status = 'unhealthy';
        }
      }

      const healthyServices = services.filter(s => s.status === 'healthy').length;
      const status = healthyServices >= 3 ? 'healthy' : 'degraded';

      return { status, services };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: [],
      };
    }
  }
}
