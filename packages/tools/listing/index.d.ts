import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
import { PriceGuard, FeedResult } from '@urbanova/types';
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
  }): Promise<FeedResult>;
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
//# sourceMappingURL=index.d.ts.map
