import { ScrapedLand, LandSearchCriteria } from '@/types/land';
export declare class RealWebScraper {
  isInitialized: boolean;
  private retryRequest;
  private getRandomUserAgent;
  private getRealisticHeaders;
  private getAdvancedHeaders;
  private getUltraAggressiveHeaders;
  initialize(): Promise<void>;
  close(): Promise<void>;
  scrapeLands(criteria: LandSearchCriteria): Promise<ScrapedLand[]>;
  private extractRealPrice;
  private extractRealArea;
  private scrapeImmobiliareWorking;
  private scrapeCasaWorking;
  private scrapeIdealistaWorking;
  private scrapeBorsinoWorking;
  private scrapeSubitoHTTP;
  private scrapeKijijiHTTP;
  private scrapeBakecaHTTP;
  private scrapeAnnunciHTTP;
}
export declare const realWebScraper: RealWebScraper;
//# sourceMappingURL=realWebScraper.d.ts.map
