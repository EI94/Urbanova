import { ScrapedLand, LandAnalysis } from '@/types/land';
export declare class RealAIService {
  private openai;
  private isConfigured;
  constructor();
  analyzeLand(land: ScrapedLand, marketContext?: any): Promise<LandAnalysis>;
  analyzeMarketTrends(location: string): Promise<string>;
  generateInvestmentRecommendations(lands: ScrapedLand[]): Promise<string[]>;
  calculateAdvancedAIScore(land: ScrapedLand, analysis: LandAnalysis): Promise<number>;
  private buildAnalysisPrompt;
  private parseAIResponse;
  private parseManualResponse;
  private parseRecommendations;
  private calculateBasicAIScore;
  private fallbackAnalysis;
  verifyAIConfig(): Promise<boolean>;
  get isAIConfigured(): boolean;
}
export declare const realAIService: RealAIService;
//# sourceMappingURL=realAIService.d.ts.map
