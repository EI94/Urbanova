'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PriceGuardService = void 0;
/**
 * Service per la verifica delle policy sui prezzi (Publication Guard)
 */
class PriceGuardService {
  /**
   * Verifica price guard per un listing
   */
  async checkPriceGuard(listingPayload, priceGuard) {
    console.log(
      `🛡️ [PriceGuardService] Verifica price guard per progetto ${listingPayload.projectId}`
    );
    if (!priceGuard.enabled) {
      console.log(`ℹ️ [PriceGuardService] Price guard disabilitato`);
      return [];
    }
    const violations = [];
    // 1. Verifica prezzo per mq
    const pricePerSqm = listingPayload.pricePerSqm;
    if (pricePerSqm < priceGuard.minPricePerSqm) {
      violations.push({
        type: 'price_below_min',
        severity: 'error',
        message: `Prezzo per mq (€${pricePerSqm}) sotto il minimo consentito (€${priceGuard.minPricePerSqm})`,
        currentValue: pricePerSqm,
        thresholdValue: priceGuard.minPricePerSqm,
        difference: priceGuard.minPricePerSqm - pricePerSqm,
        differencePct: Math.round(
          ((priceGuard.minPricePerSqm - pricePerSqm) / priceGuard.minPricePerSqm) * 100
        ),
      });
    }
    if (pricePerSqm > priceGuard.maxPricePerSqm) {
      violations.push({
        type: 'price_above_max',
        severity: 'warning',
        message: `Prezzo per mq (€${pricePerSqm}) sopra il massimo consigliato (€${priceGuard.maxPricePerSqm})`,
        currentValue: pricePerSqm,
        thresholdValue: priceGuard.maxPricePerSqm,
        difference: pricePerSqm - priceGuard.maxPricePerSqm,
        differencePct: Math.round(
          ((pricePerSqm - priceGuard.maxPricePerSqm) / priceGuard.maxPricePerSqm) * 100
        ),
      });
    }
    // 2. Verifica discount rispetto al BP target
    const targetPricePerSqm = priceGuard.businessPlanSnapshot.targetPricePerSqm;
    const discountPct = Math.round(((targetPricePerSqm - pricePerSqm) / targetPricePerSqm) * 100);
    if (discountPct > priceGuard.maxDiscountPct) {
      violations.push({
        type: 'discount_exceeded',
        severity: 'critical',
        message: `Sconto del ${discountPct}% supera il massimo consentito del ${priceGuard.maxDiscountPct}%`,
        currentValue: discountPct,
        thresholdValue: priceGuard.maxDiscountPct,
        difference: discountPct - priceGuard.maxDiscountPct,
        differencePct: discountPct - priceGuard.maxDiscountPct,
      });
    }
    // 3. Verifica ROI rispetto al target
    const currentRoi = this.calculateRoi(listingPayload);
    const targetRoi = priceGuard.businessPlanSnapshot.targetRoi;
    if (currentRoi < targetRoi) {
      violations.push({
        type: 'roi_below_target',
        severity: 'warning',
        message: `ROI corrente (${currentRoi.toFixed(2)}%) sotto il target (${targetRoi.toFixed(2)}%)`,
        currentValue: currentRoi,
        thresholdValue: targetRoi,
        difference: targetRoi - currentRoi,
        differencePct: Math.round(((targetRoi - currentRoi) / targetRoi) * 100),
      });
    }
    // Log risultati
    if (violations.length > 0) {
      console.log(`⚠️ [PriceGuardService] ${violations.length} violazioni rilevate:`);
      violations.forEach(v => {
        console.log(`  - ${v.severity.toUpperCase()}: ${v.message}`);
      });
    } else {
      console.log(`✅ [PriceGuardService] Nessuna violazione rilevata`);
    }
    return violations;
  }
  /**
   * Calcola ROI stimato per il listing
   */
  calculateRoi(listingPayload) {
    // TODO: Integrare con BusinessPlanService per calcolo ROI reale
    // Per ora simuliamo un calcolo basato su parametri standard
    const baseRoi = 12.5; // ROI base per immobili residenziali
    const surfaceBonus = Math.min(listingPayload.surface / 100, 2); // Bonus per superficie > 100m²
    const conditionBonus = this.getConditionBonus(listingPayload.condition);
    const locationBonus = this.getLocationBonus(listingPayload.location.city);
    const totalRoi = baseRoi + surfaceBonus + conditionBonus + locationBonus;
    // Aggiungi variabilità realistica
    const variation = (Math.random() - 0.5) * 2; // ±1%
    return Math.max(8, Math.min(20, totalRoi + variation)); // ROI tra 8% e 20%
  }
  /**
   * Bonus ROI per condizione dell'immobile
   */
  getConditionBonus(condition) {
    const bonuses = {
      excellent: 1.5,
      good: 0.5,
      fair: -0.5,
      needs_renovation: -1.0,
    };
    return bonuses[condition] || 0;
  }
  /**
   * Bonus ROI per localizzazione
   */
  getLocationBonus(city) {
    const bonuses = {
      Milano: 1.0,
      Roma: 0.8,
      Napoli: 0.5,
      Torino: 0.7,
      Firenze: 0.6,
    };
    return bonuses[city] || 0.3;
  }
  /**
   * Genera report dettagliato delle violazioni
   */
  generateViolationReport(violations) {
    if (violations.length === 0) {
      return '✅ Nessuna violazione rilevata - Prezzo conforme alle policy';
    }
    let report = `⚠️ VIOLAZIONI PRICE GUARD (${violations.length})\n\n`;
    violations.forEach((violation, index) => {
      report += `${index + 1}. ${violation.severity.toUpperCase()}: ${violation.type}\n`;
      report += `   ${violation.message}\n`;
      report += `   Valore corrente: ${violation.currentValue}\n`;
      report += `   Soglia: ${violation.thresholdValue}\n`;
      report += `   Differenza: ${violation.difference} (${violation.differencePct}%)\n\n`;
    });
    report += '📋 AZIONI RICHIESTE:\n';
    report += '• Conferma esplicita per override\n';
    report += "• Motivazione dell'eccezione\n";
    report += '• Approvazione del manager\n';
    return report;
  }
  /**
   * Verifica se le violazioni sono critiche (bloccano la pubblicazione)
   */
  hasCriticalViolations(violations) {
    return violations.some(v => v.severity === 'critical');
  }
  /**
   * Verifica se le violazioni richiedono conferma manager
   */
  requiresManagerApproval(violations) {
    return violations.some(v => v.severity === 'critical' || v.type === 'discount_exceeded');
  }
}
exports.PriceGuardService = PriceGuardService;
//# sourceMappingURL=priceGuardService.js.map
