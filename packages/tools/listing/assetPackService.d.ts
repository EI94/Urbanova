import { ListingPayload } from '@urbanova/types';
/**
 * Service per la generazione di asset pack (ZIP) per i listing
 */
export declare class AssetPackService {
  /**
   * Genera asset pack ZIP per un progetto
   */
  generateAssetPack(
    projectId: string,
    listingPayload: ListingPayload,
    options?: {
      includePlaceholders: boolean;
      generatePdf: boolean;
      compressImages: boolean;
      watermark: boolean;
    }
  ): Promise<string>;
  /**
   * Raccoglie tutti gli asset del progetto
   */
  private collectProjectAssets;
  /**
   * Ottiene descrizioni del progetto
   */
  private getDescriptions;
  /**
   * Ottiene immagini del progetto
   */
  private getImages;
  /**
   * Processa immagine (compressione, watermark, etc.)
   */
  private processImage;
  /**
   * Ottiene documenti del progetto
   */
  private getDocuments;
  /**
   * Ottiene planimetrie dal Design Center
   */
  private getPlanimetrie;
  /**
   * Ottiene materiali di marketing
   */
  private getMarketingMaterials;
  /**
   * Genera metadata dell'asset pack
   */
  private generateMetadata;
  /**
   * Crea pacchetto ZIP
   */
  private createZipPackage;
  /**
   * Valida asset pack generato
   */
  private validateAssetPack;
  /**
   * Genera report dell'asset pack
   */
  generateAssetPackReport(assets: any): string;
}
//# sourceMappingURL=assetPackService.d.ts.map
