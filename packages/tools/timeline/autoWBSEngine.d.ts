import { WBS, Fact } from '@urbanova/types';
/**
 * Auto WBS Engine - Genera WBS da fatti reali
 *
 * Funzionalità:
 * - Fact Collection da servizi
 * - Task Inference da stati
 * - Dependency Mapping automatico
 * - Critical Path Calculation
 */
export declare class AutoWBSEngine {
  constructor();
  /**
   * Genera WBS da fatti reali
   */
  generateWBS(projectId: string, facts: Fact[]): Promise<WBS>;
  /**
   * Inferisci task dai fatti
   */
  private inferTasksFromFacts;
  /**
   * Crea task da Doc Hunter fact
   */
  private createDocHunterTask;
  /**
   * Crea task da Procurement fact
   */
  private createProcurementTask;
  /**
   * Crea task da SAL fact
   */
  private createSALTask;
  /**
   * Crea task da Listing fact
   */
  private createListingTask;
  /**
   * Mappa status Doc Hunter
   */
  private mapDocHunterStatus;
  /**
   * Mappa status Procurement
   */
  private mapProcurementStatus;
  /**
   * Mappa status SAL
   */
  private mapSALStatus;
  /**
   * Mappa status Listing
   */
  private mapListingStatus;
  /**
   * Calcola priorità
   */
  private calculatePriority;
  /**
   * Calcola durata Doc Hunter
   */
  private calculateDocHunterDuration;
  /**
   * Calcola durata Procurement
   */
  private calculateProcurementDuration;
  /**
   * Calcola durata SAL
   */
  private calculateSALDuration;
  /**
   * Calcola durata Listing
   */
  private calculateListingDuration;
  /**
   * Calcola progresso Doc Hunter
   */
  private calculateDocHunterProgress;
  /**
   * Calcola progresso Procurement
   */
  private calculateProcurementProgress;
  /**
   * Calcola progresso SAL
   */
  private calculateSALProgress;
  /**
   * Calcola progresso Listing
   */
  private calculateListingProgress;
  /**
   * Calcola work completato Procurement
   */
  private calculateProcurementCompletedWork;
  /**
   * Calcola work completato SAL
   */
  private calculateSALCompletedWork;
  /**
   * Calcola work completato Listing
   */
  private calculateListingCompletedWork;
  /**
   * Mappa dipendenze tra task
   */
  private mapDependencies;
  /**
   * Calcola scheduling dei task
   */
  private calculateScheduling;
  /**
   * Calcola progresso dei task
   */
  private calculateProgress;
  /**
   * Calcola progresso di un singolo task
   */
  private calculateTaskProgress;
  /**
   * Calcola work completato di un singolo task
   */
  private calculateTaskCompletedWork;
  /**
   * Calcola data inizio WBS
   */
  private calculateStartDate;
  /**
   * Calcola data fine WBS
   */
  private calculateEndDate;
  /**
   * Calcola progresso complessivo
   */
  private calculateOverallProgress;
}
//# sourceMappingURL=autoWBSEngine.d.ts.map
