interface ListingPayload {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    features: any[];
    images: any[];
    documents: any[];
    projectId?: string;
    pricePerSqm?: number;
    surface?: number;
    rooms?: number;
    [key: string]: any;
}
interface PriceGuard {
    id: string;
    name: string;
    description: string;
    rules: any[];
    isActive: boolean;
    enabled: boolean;
    minPricePerSqm: number;
    maxPricePerSqm: number;
    businessPlanSnapshot: any;
    maxDiscountPct: number;
    createdAt: Date;
    updatedAt: Date;
}
interface PriceGuardViolation {
    id?: string;
    guardId?: string;
    listingId?: string;
    violationType?: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: any;
    currentValue?: any;
    thresholdValue?: any;
    difference?: any;
    differencePct?: any;
    createdAt?: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
}
/**
 * Service per la verifica delle policy sui prezzi (Publication Guard)
 */
export declare class PriceGuardService {
    /**
     * Verifica price guard per un listing
     */
    checkPriceGuard(listingPayload: ListingPayload, priceGuard: PriceGuard): Promise<PriceGuardViolation[]>;
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
export {};
//# sourceMappingURL=priceGuardService.d.ts.map