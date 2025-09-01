export interface DeletionResult {
  success: boolean;
  projectId: string;
  message: string;
  timestamp: Date;
  backendVerified: boolean;
}
export declare class RobustProjectDeletionService {
  private readonly COLLECTION;
  private readonly MAX_RETRIES;
  private readonly RETRY_DELAY;
  /**
   * ELIMINAZIONE ROBUSTA E SINCRONIZZATA
   * 1. Elimina dal backend
   * 2. Verifica eliminazione
   * 3. Gestisce retry automatici
   * 4. Log completo per debugging
   */
  robustDeleteProject(projectId: string): Promise<DeletionResult>;
  /**
   * VERIFICA COMPLETA ELIMINAZIONE
   * Controlla che il progetto non sia presente in nessuna query
   */
  private verifyProjectDeletion;
  /**
   * ELIMINAZIONE MULTIPLA ROBUSTA
   * Per pulizia database completa
   */
  robustDeleteMultipleProjects(projectIds: string[]): Promise<DeletionResult[]>;
  /**
   * PULIZIA COMPLETA DATABASE
   * Elimina tutti i progetti per reset completo
   */
  completeDatabaseCleanup(): Promise<DeletionResult>;
  /**
   * VERIFICA DATABASE VUOTO
   */
  private verifyDatabaseEmpty;
  /**
   * UTILITY: DELAY ASINCRONO
   */
  private delay;
  /**
   * STATO SERVIZIO
   */
  getServiceStatus(): {
    name: string;
    version: string;
    status: string;
  };
}
export declare const robustProjectDeletionService: RobustProjectDeletionService;
//# sourceMappingURL=robustProjectDeletionService.d.ts.map
