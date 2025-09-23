interface FeasibilityAnalysis {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  totalInvestment: number;
  expectedROI: number;
  paybackPeriod: number;
  netPresentValue: number;
  internalRateOfReturn: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  marketTrend: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  recommendations: string[];
  createdAt: string;
}
interface AIAnalysis {
  pros: string[];
  cons: string[];
  recommendation: string;
  strategies: string[];
}
export declare class PDFGeneratorService {
  private doc;
  constructor();
  generateFeasibilityReport(analysis: FeasibilityAnalysis, aiAnalysis: AIAnalysis): Promise<Buffer>;
  private generateHeader;
  private generateOverview;
  private generateFinancialMetrics;
  private generateAIAnalysis;
  private generateRecommendations;
  private generateFooter;
  private getROIStatus;
  private getNPVStatus;
  private getIRRStatus;
  private getRiskLabel;
  private getRiskColor;
  private getTrendLabel;
  private getTrendColor;
}
export {};
//# sourceMappingURL=pdfGeneratorService.d.ts.map
