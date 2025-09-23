import {
  DesignTemplate,
  DesignCustomization,
  GeoLocation,
  BudgetBreakdown,
} from './designCenterService';
export interface AIDesignSuggestion {
  id: string;
  title: string;
  reasoning: string;
  benefits: string[];
  implementation: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'LAYOUT' | 'SUSTAINABILITY' | 'EFFICIENCY' | 'AESTHETICS' | 'FUNCTIONALITY' | 'ROI';
  estimatedImpact: {
    roi: number;
    cost: number;
    time: number;
    marketValue: number;
  };
  confidence: number;
}
export interface DesignOptimization {
  originalROI: number;
  optimizedROI: number;
  improvements: AIDesignSuggestion[];
  totalCostIncrease: number;
  totalTimeIncrease: number;
  paybackPeriod: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
export interface MarketAnalysis {
  trends: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
  marketScore: number;
  competitorAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
}
declare class AIDesignService {
  /**
   * Genera suggerimenti AI personalizzati per un progetto
   */
  generateDesignSuggestions(
    template: DesignTemplate,
    customization: DesignCustomization,
    location: GeoLocation,
    budget: BudgetBreakdown
  ): Promise<AIDesignSuggestion[]>;
  /**
   * Analizza opportunità di miglioramento ROI
   */
  private analyzeROIOpportunities;
  /**
   * Analizza opportunità di sostenibilità
   */
  private analyzeSustainability;
  /**
   * Analizza efficienza energetica
   */
  private analyzeEnergyEfficiency;
  /**
   * Analizza funzionalità e layout
   */
  private analyzeFunctionality;
  /**
   * Analizza estetica e mercato
   */
  private analyzeAesthetics;
  /**
   * Ottimizza il design per massimizzare il ROI
   */
  optimizeDesignForROI(
    template: DesignTemplate,
    customization: DesignCustomization,
    location: GeoLocation,
    budget: BudgetBreakdown,
    maxBudgetIncrease?: number
  ): Promise<DesignOptimization>;
  /**
   * Calcola il ROI originale del progetto
   */
  private calculateOriginalROI;
  /**
   * Genera combinazioni di ottimizzazioni
   */
  private generateOptimizationCombinations;
  /**
   * Ottiene tutte le combinazioni di n elementi da un array
   */
  private getCombinations;
  /**
   * Calcola il periodo di payback
   */
  private calculatePaybackPeriod;
  /**
   * Valuta il livello di rischio
   */
  private assessRiskLevel;
  /**
   * Analizza il mercato per un progetto specifico
   */
  analyzeMarketForProject(
    template: DesignTemplate,
    location: GeoLocation,
    customization: DesignCustomization
  ): Promise<MarketAnalysis>;
  /**
   * Identifica trend di mercato
   */
  private identifyMarketTrends;
  /**
   * Identifica opportunità di mercato
   */
  private identifyMarketOpportunities;
  /**
   * Identifica rischi di mercato
   */
  private identifyMarketRisks;
  /**
   * Genera raccomandazioni di mercato
   */
  private generateMarketRecommendations;
  /**
   * Calcola il punteggio di mercato
   */
  private calculateMarketScore;
  /**
   * Analizza i competitor
   */
  private analyzeCompetitors;
}
export declare const aiDesignService: AIDesignService;
export {};
//# sourceMappingURL=aiDesignService.d.ts.map
