import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
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
interface FeedResult {
    success?: boolean;
    feedUrl?: string;
    zipUrl?: string;
    violations?: any[];
    warnings?: any[];
    metadata?: any;
    error?: string;
}
export declare const listingManifest: ToolManifest;
export declare const listingActions: ToolActionSpec[];
export declare class ListingTool {
    private listingService;
    private priceGuardService;
    private feedGeneratorService;
    private assetPackService;
    constructor();
    /**
     * Prepara annuncio con asset pack e feed XML
     */
    prepare(args: {
        projectId: string;
        portal: string;
        priceGuard: PriceGuard;
        options?: {
            includePlaceholders: boolean;
            generatePdf: boolean;
            compressImages: boolean;
            watermark: boolean;
        };
    }): Promise<any>;
    /**
     * Pubblica annuncio su portale specifico
     */
    push(args: {
        projectId: string;
        portal: string;
        feedResult: FeedResult;
        confirmOverride?: boolean;
        overrideReason?: string;
    }): Promise<{
        success: boolean;
        message: string;
        portalUrl?: string;
    }>;
    /**
     * Calcola metadata per il risultato
     */
    private calculateMetadata;
    /**
     * Genera istruzioni per upload manuale
     */
    private generateManualInstructions;
}
export declare const listingTool: ListingTool;
export {};
//# sourceMappingURL=index.d.ts.map