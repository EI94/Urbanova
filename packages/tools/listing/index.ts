import type { ToolManifest, ToolActionSpec } from '@urbanova/types';
import { ListingPayload, PriceGuard, FeedResult, PriceGuardViolation } from '@urbanova/types';
import { ListingService } from './listingService';
import { PriceGuardService } from './priceGuardService';
import { FeedGeneratorService } from './feedGeneratorService';
import { AssetPackService } from './assetPackService';

// Listing Tool Manifest
export const listingManifest: ToolManifest = {
  id: 'listing',
  name: 'Listing Management',
  version: '1.0.0',
  icon: '🏠',
  category: 'marketing',
  description: 'Gestisce la creazione e pubblicazione di annunci immobiliari sui portali',
  intents: ['annuncio', 'listing', 'pubblica', 'portale', 'feed', 'asset'],
  tags: ['listing', 'marketing', 'portal', 'feed', 'assets'],
};

// Tool Actions
export const listingActions: ToolActionSpec[] = [
  {
    name: 'prepare',
    description: 'Prepara annuncio con asset pack e feed XML',
    zArgs: {} as any, // Will be properly typed
    requiredRole: 'sales',
    longRunning: true,
    confirm: true,
    onFailure: 'stop',
  },
  {
    name: 'push',
    description: 'Pubblica annuncio su portale specifico',
    zArgs: {} as any, // Will be properly typed
    requiredRole: 'sales',
    longRunning: false,
    confirm: true,
    onFailure: 'stop',
  },
];

// Listing Tool Implementation
export class ListingTool {
  private listingService: ListingService;
  private priceGuardService: PriceGuardService;
  private feedGeneratorService: FeedGeneratorService;
  private assetPackService: AssetPackService;

  constructor() {
    this.listingService = new ListingService();
    this.priceGuardService = new PriceGuardService();
    this.feedGeneratorService = new FeedGeneratorService();
    this.assetPackService = new AssetPackService();
  }

  /**
   * Prepara annuncio con asset pack e feed XML
   */
  async prepare(args: {
    projectId: string;
    portal: string;
    priceGuard: PriceGuard;
    options?: {
      includePlaceholders: boolean;
      generatePdf: boolean;
      compressImages: boolean;
      watermark: boolean;
    };
  }): Promise<FeedResult> {
    console.log(
      `🔧 [ListingTool] Preparazione annuncio per progetto ${args.projectId} su portale ${args.portal}`
    );

    // 1. Genera listing payload dal progetto
    const listingPayload = await this.listingService.generateListingPayload(args.projectId);

    // 2. Verifica price guard
    const violations = await this.priceGuardService.checkPriceGuard(
      listingPayload,
      args.priceGuard
    );

    // 3. Genera asset pack (ZIP)
    const zipUrl = await this.assetPackService.generateAssetPack(
      args.projectId,
      listingPayload,
      args.options
    );

    // 4. Genera feed XML
    const feedUrl = await this.feedGeneratorService.generateFeed(
      args.portal,
      listingPayload,
      zipUrl
    );

    // 5. Calcola metadata
    const metadata = await this.calculateMetadata(feedUrl, zipUrl, args.portal, args.projectId);

    const result: FeedResult = {
      feedUrl,
      zipUrl,
      violations: violations.length > 0 ? violations : undefined,
      warnings: violations.length > 0 ? ['Price guard violations detected'] : undefined,
      metadata,
    };

    console.log(`✅ [ListingTool] Annuncio preparato: ${feedUrl}, ${zipUrl}`);
    return result;
  }

  /**
   * Pubblica annuncio su portale specifico
   */
  async push(args: {
    projectId: string;
    portal: string;
    feedResult: FeedResult;
    confirmOverride?: boolean;
    overrideReason?: string;
  }): Promise<{ success: boolean; message: string; portalUrl?: string }> {
    console.log(
      `🚀 [ListingTool] Pubblicazione annuncio per progetto ${args.projectId} su portale ${args.portal}`
    );

    // 1. Verifica conferma per violazioni
    if (args.feedResult.violations && args.feedResult.violations.length > 0) {
      if (!args.confirmOverride) {
        throw new Error(
          `Pubblicazione bloccata: violazioni price guard rilevate. Richiedi conferma esplicita.`
        );
      }
      console.log(`⚠️ [ListingTool] Override confermato per violazioni: ${args.overrideReason}`);
    }

    // 2. Carica feed e ZIP su GCS
    const portalUrl = await this.listingService.uploadToPortal(
      args.portal,
      args.projectId,
      args.feedResult
    );

    // 3. Log istruzioni per upload manuale (v1)
    const manualInstructions = this.generateManualInstructions(
      args.portal,
      args.projectId,
      args.feedResult
    );
    console.log(`📋 [ListingTool] Istruzioni upload manuale: ${manualInstructions}`);

    return {
      success: true,
      message: `Annuncio pubblicato con successo su ${args.portal}`,
      portalUrl,
    };
  }

  /**
   * Calcola metadata per il risultato
   */
  private async calculateMetadata(
    feedUrl: string,
    zipUrl: string,
    portal: string,
    projectId: string
  ) {
    // Simula calcolo file size e checksum
    const fileSize = {
      xml: Math.floor(Math.random() * 10000) + 1000, // 1-11 KB
      zip: Math.floor(Math.random() * 100000) + 10000, // 10-110 KB
    };

    const checksum = {
      xml: `sha256-${Math.random().toString(36).substring(2, 15)}`,
      zip: `sha256-${Math.random().toString(36).substring(2, 15)}`,
    };

    return {
      generatedAt: new Date(),
      portal,
      projectId,
      fileSize,
      checksum,
    };
  }

  /**
   * Genera istruzioni per upload manuale
   */
  private generateManualInstructions(
    portal: string,
    projectId: string,
    feedResult: FeedResult
  ): string {
    return `
📋 ISTRUZIONI UPLOAD MANUALE - ${portal.toUpperCase()}

1. Feed XML: ${feedResult.feedUrl}
2. Asset Pack: ${feedResult.zipUrl}

📁 Contenuto ZIP:
   - Descrizioni progetto
   - Planimetrie (da Design Center)
   - Immagini progetto
   - Documenti tecnici

⚠️  ATTENZIONE: ${feedResult.violations ? `${feedResult.violations.length} violazioni price guard rilevate` : 'Nessuna violazione rilevata'}

🔗 Upload su: ${portal}
📧 Contatto supporto: support@${portal}.com
    `.trim();
  }
}

// Export default instance
export const listingTool = new ListingTool();
