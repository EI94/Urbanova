import {
  Buyer,
  BuyerPreferences,
  RetentionPolicy,
  DataSubjectRights,
  PrivacySettings,
} from '@urbanova/types';
/**
 * Privacy Service
 *
 * Gestione privacy GDPR compliant:
 * - PII minimale
 * - Retention configurabile
 * - Diritti soggetto dati
 * - Pseudonimizzazione
 * - Audit logging
 */
export declare class PrivacyService {
  private buyers;
  private privacySettings;
  private auditLog;
  /**
   * Crea buyer con privacy by design
   */
  createBuyer(
    projectId: string,
    data?: {
      name?: string;
      email?: string;
      phone?: string;
      preferences?: BuyerPreferences;
    }
  ): Promise<Buyer>;
  /**
   * Ottieni buyer
   */
  getBuyer(buyerId: string): Promise<Buyer | null>;
  /**
   * Aggiorna buyer
   */
  updateBuyer(
    buyerId: string,
    updates: {
      name?: string;
      email?: string;
      phone?: string;
      preferences?: BuyerPreferences;
      status?: 'active' | 'inactive' | 'deleted';
    }
  ): Promise<Buyer>;
  /**
   * Ottieni impostazioni privacy
   */
  getPrivacySettings(buyerId: string): Promise<PrivacySettings | null>;
  /**
   * Aggiorna impostazioni privacy
   */
  updatePrivacySettings(
    buyerId: string,
    retentionPolicy?: Partial<RetentionPolicy>,
    dataSubjectRights?: Partial<DataSubjectRights>
  ): Promise<PrivacySettings>;
  /**
   * Esporta dati buyer (GDPR right to access)
   */
  exportBuyerData(buyerId: string): Promise<{
    buyer: Buyer;
    privacySettings: PrivacySettings;
    auditLog: any[];
    metadata: any;
  }>;
  /**
   * Cancella dati buyer (GDPR right to erasure)
   */
  deleteBuyerData(buyerId: string, reason?: string): Promise<boolean>;
  /**
   * Pseudonimizza dati buyer
   */
  pseudonymizeBuyer(buyerId: string): Promise<Buyer>;
  /**
   * Controlla retention policy
   */
  checkRetentionPolicy(buyerId: string): Promise<{
    shouldDelete: boolean;
    reason?: string;
    dataToDelete: string[];
  }>;
  /**
   * Applica retention policy automatica
   */
  applyRetentionPolicy(): Promise<{
    processed: number;
    deleted: number;
    errors: string[];
  }>;
  /**
   * Log audit event
   */
  private logAuditEvent;
  /**
   * Hash value per pseudonimizzazione
   */
  private hashValue;
  /**
   * Ottieni audit log
   */
  getAuditLog(buyerId?: string, fromDate?: Date, toDate?: Date): Promise<any[]>;
  /**
   * Lista buyer
   */
  listBuyers(filters?: { projectId?: string; status?: string }): Promise<Buyer[]>;
  /**
   * Statistiche privacy
   */
  getPrivacyStats(): Promise<{
    totalBuyers: number;
    activeBuyers: number;
    pseudonymizedBuyers: number;
    retentionPolicyEnabled: number;
    auditLogEntries: number;
  }>;
}
//# sourceMappingURL=privacyService.d.ts.map
