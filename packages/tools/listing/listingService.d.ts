import { ListingPayload, FeedResult } from '@urbanova/types';
/**
 * Service per la gestione dei listing immobiliari
 */
export declare class ListingService {
  /**
   * Genera listing payload da un progetto
   */
  generateListingPayload(projectId: string): Promise<ListingPayload>;
  /**
   * Carica feed e ZIP su portale specifico
   */
  uploadToPortal(portal: string, projectId: string, feedResult: FeedResult): Promise<string>;
  /**
   * Ottiene dati del progetto (mock)
   */
  private getProjectData;
  /**
   * Genera descrizione del progetto
   */
  private generateDescription;
  /**
   * Ottiene immagini del progetto
   */
  private getProjectImages;
  /**
   * Ottiene documenti del progetto
   */
  private getProjectDocuments;
  /**
   * Upload su Google Cloud Storage
   */
  private uploadToGCS;
}
//# sourceMappingURL=listingService.d.ts.map
