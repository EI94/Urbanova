import { Comparison, ScoringWeights } from '@urbanova/types';
import { DocHunterService } from '../docs/docHunterService';
import { GoogleCloudStorageService } from '../storage/googleCloudStorageService';
import { PDFReportGenerator } from '../reports/pdfReportGenerator';
/**
 * Servizio Procurement REALE - Gestione completa RDO lifecycle
 *
 * Integra:
 * - Doc Hunter per pre-check documenti
 * - GCS per storage sicuro
 * - PDF generator per report confronto
 * - Scoring engine con outlier detection
 */
export declare class ProcurementService {
  private docHunter;
  private storage;
  private pdfGenerator;
  private rdos;
  private offers;
  private comparisons;
  private vendors;
  constructor(
    docHunter: DocHunterService,
    storage: GoogleCloudStorageService,
    pdfGenerator: PDFReportGenerator
  );
  private initializeVendors;
  /**
   * Crea RDO con inviti vendor sicuri
   */
  createRDO(args: {
    projectId: string;
    title: string;
    deadlineDays: number;
    invitedVendors: string[];
    lines: any[];
    category?: string;
    estimatedValue?: number;
    location?: string;
    requirements?: string[];
  }): Promise<{
    rdoId: string;
    status: string;
    invitedVendors: any[];
    deadline: Date;
    accessInstructions: string;
  }>;
  /**
   * Confronto automatico offerte con scoring e outlier detection
   */
  compareOffers(rdoId: string, weights?: ScoringWeights): Promise<Comparison>;
  /**
   * Aggiudicazione RDO con pre-check Doc Hunter
   */
  awardRDO(
    rdoId: string,
    vendorId: string,
    overridePreCheck?: boolean
  ): Promise<{
    rdoId: string;
    awardedTo: string;
    awardedAt: Date;
    preCheckPassed: boolean;
    overrideUsed: boolean;
    message: string;
  }>;
  /**
   * Pre-check con Doc Hunter per verifica documenti
   */
  private performPreCheck;
  /**
   * Genera PDF di confronto REALE
   */
  private generateComparisonPDF;
  /**
   * Genera JWT token sicuro per accesso vendor
   */
  private generateSecureToken;
  /**
   * Ricevi offerta da vendor tramite token JWT
   */
  submitOffer(
    token: string,
    offerData: any
  ): Promise<{
    offerId: string;
    status: string;
    message: string;
    submittedAt: Date;
  }>;
}
//# sourceMappingURL=procurementService.d.ts.map
