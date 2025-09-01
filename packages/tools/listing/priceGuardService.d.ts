import { ListingPayload, PriceGuard, PriceGuardViolation } from '@urbanova/types';
/**
 * Service per la verifica delle policy sui prezzi (Publication Guard)
 */
export declare class PriceGuardService {
  /**
   * Verifica price guard per un listing
   */
  checkPriceGuard(
    listingPayload: ListingPayload,
    priceGuard: PriceGuard
  ): Promise<PriceGuardViolation[]>;
  /**
   * Calcola ROI stimato per il listing
   */
  private calculateRoi;
  /**
   * Bonus ROI per condizione dell'immobile
   */
  private getConditionBonus;
  /**
   * Bonus ROI per localizzazione
   */
  private getLocationBonus;
  /**
   * Genera report dettagliato delle violazioni
   */
  generateViolationReport(violations: PriceGuardViolation[]): string;
  /**
   * Verifica se le violazioni sono critiche (bloccano la pubblicazione)
   */
  hasCriticalViolations(violations: PriceGuardViolation[]): boolean;
  /**
   * Verifica se le violazioni richiedono conferma manager
   */
  requiresManagerApproval(violations: PriceGuardViolation[]): boolean;
}
//# sourceMappingURL=priceGuardService.d.ts.map
