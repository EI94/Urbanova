import { RePlanTrigger, RePlanProposal } from '@urbanova/types';
/**
 * Re-Plan Engine - Motore di ripianificazione automatica
 *
 * Funzionalità:
 * - Trigger Detection
 * - Impact Analysis
 * - Proposal Generation
 * - Preview Creation
 */
export declare class RePlanEngine {
  constructor();
  /**
   * Rileva trigger per re-plan
   */
  detectTriggers(projectId: string): Promise<RePlanTrigger[]>;
  /**
   * Rileva trigger specifico
   */
  detectTrigger(projectId: string, cause: string, details: any): Promise<RePlanTrigger>;
  /**
   * Analizza impatto del trigger
   */
  analyzeImpact(trigger: RePlanTrigger): Promise<RePlanProposal>;
  /**
   * Rileva trigger scadenza documenti
   */
  private detectDocumentExpiryTriggers;
  /**
   * Rileva trigger ritardi SAL
   */
  private detectSALDelayTriggers;
  /**
   * Rileva trigger ritardi Procurement
   */
  private detectProcurementDelayTriggers;
  /**
   * Rileva trigger conflitti risorse
   */
  private detectResourceConflictTriggers;
  /**
   * Analizza tipo di trigger
   */
  private analyzeTriggerType;
  /**
   * Calcola severità trigger
   */
  private calculateTriggerSeverity;
  /**
   * Analizza impatto trigger
   */
  private analyzeTriggerImpact;
  /**
   * Ottieni timeline corrente
   */
  private getCurrentTimeline;
  /**
   * Genera timeline proposta
   */
  private generateProposedTimeline;
  /**
   * Calcola cambiamenti tra timeline
   */
  private calculateChanges;
  /**
   * Valuta impatto dei cambiamenti
   */
  private assessImpact;
  /**
   * Determina se è richiesta conferma
   */
  private determineConfirmationRequired;
}
//# sourceMappingURL=rePlanEngine.d.ts.map
