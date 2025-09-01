import { ListingPayload } from '@urbanova/types';
/**
 * Service per la generazione di feed XML per portali immobiliari
 */
export declare class FeedGeneratorService {
  /**
   * Genera feed XML per un portale specifico
   */
  generateFeed(portal: string, listingPayload: ListingPayload, zipUrl: string): Promise<string>;
  /**
   * Genera feed XML in formato GETRIX
   */
  private generateGetrixFeed;
  /**
   * Genera feed XML in formato Immobiliare.it
   */
  private generateImmobiliareFeed;
  /**
   * Genera feed XML generico
   */
  private generateGenericFeed;
  /**
   * Genera feed per altri portali (placeholder)
   */
  private generateCasaFeed;
  private generateIdealistaFeed;
  /**
   * Salva feed XML su Google Cloud Storage
   */
  private saveFeedToGCS;
  /**
   * Escape caratteri XML speciali
   */
  private escapeXml;
  /**
   * Valida XML generato
   */
  validateXml(xmlContent: string): boolean;
}
//# sourceMappingURL=feedGeneratorService.d.ts.map
