import { LandSearchCriteria, RealLandScrapingResult } from '@/types/land';
export declare class RealLandScrapingAgent {
  private name;
  private version;
  constructor();
  runAutomatedSearch(criteria: LandSearchCriteria, email: string): Promise<RealLandScrapingResult>;
  private sendEmailNotification;
  private generateAdvancedEmailHTML;
  private saveSearchResults;
  verifyAllServices(): Promise<{
    email: boolean;
    webScraping: boolean;
    ai: boolean;
  }>;
}
export declare const realLandScrapingAgent: RealLandScrapingAgent;
//# sourceMappingURL=realLandScrapingAgent.d.ts.map
