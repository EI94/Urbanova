/**
 * 🧠 PREDICTIVE ANALYTICS SERVICE
 * Sistema di analisi predittiva per sviluppatori immobiliari
 * Fornisce insights avanzati, trend forecasting e raccomandazioni strategiche
 */

import { UserMemoryProfile, ProjectContext } from './userMemoryService';

export interface MarketTrend {
  id: string;
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  confidence: number;
  timeframe: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface PredictiveInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  relatedProject?: string;
  data: Record<string, any>;
  recommendations: string[];
}

export interface MarketForecast {
  location: string;
  timeframe: string;
  trends: MarketTrend[];
  opportunities: PredictiveInsight[];
  risks: PredictiveInsight[];
  recommendations: string[];
  confidence: number;
}

export interface ProjectOptimization {
  projectId: string;
  currentMetrics: Record<string, number>;
  optimizedMetrics: Record<string, number>;
  improvements: {
    metric: string;
    current: number;
    optimized: number;
    improvement: number;
    action: string;
  }[];
  potentialROI: number;
  implementationCost: number;
  paybackPeriod: number;
}

export class PredictiveAnalyticsService {
  private static instance: PredictiveAnalyticsService;
  private marketData: Map<string, any> = new Map();
  private trendModels: Map<string, any> = new Map();

  private constructor() {
    this.initializeMarketData();
    this.initializeTrendModels();
  }

  public static getInstance(): PredictiveAnalyticsService {
    if (!PredictiveAnalyticsService.instance) {
      PredictiveAnalyticsService.instance = new PredictiveAnalyticsService();
    }
    return PredictiveAnalyticsService.instance;
  }

  /**
   * 🎯 Analisi predittiva completa per un utente
   */
  async generatePredictiveAnalysis(
    userProfile: UserMemoryProfile,
    timeframe: string = '6 mesi'
  ): Promise<{
    marketForecast: MarketForecast;
    projectOptimizations: ProjectOptimization[];
    strategicRecommendations: PredictiveInsight[];
    riskAssessment: PredictiveInsight[];
  }> {
    console.log('🔮 [PredictiveAnalytics] Generando analisi predittiva...');

    try {
      // 1. Analisi trend di mercato
      const marketForecast = await this.analyzeMarketTrends(userProfile, timeframe);
      
      // 2. Ottimizzazione progetti esistenti
      const projectOptimizations = await this.optimizeExistingProjects(userProfile);
      
      // 3. Raccomandazioni strategiche
      const strategicRecommendations = await this.generateStrategicRecommendations(userProfile, marketForecast);
      
      // 4. Valutazione rischi
      const riskAssessment = await this.assessRisks(userProfile, marketForecast);

      console.log('✅ [PredictiveAnalytics] Analisi predittiva completata');

      return {
        marketForecast,
        projectOptimizations,
        strategicRecommendations,
        riskAssessment
      };

    } catch (error) {
      console.error('❌ [PredictiveAnalytics] Errore analisi predittiva:', error);
      throw error;
    }
  }

  /**
   * 📈 Analisi trend di mercato
   */
  private async analyzeMarketTrends(
    userProfile: UserMemoryProfile,
    timeframe: string
  ): Promise<MarketForecast> {
    const locations = this.extractUniqueLocations(userProfile);
    const primaryLocation = locations[0] || 'Milano';
    
    const trends: MarketTrend[] = [
      {
        id: 'price-trend-1',
        metric: 'Prezzo per m²',
        direction: 'up',
        change: 3.2,
        confidence: 0.85,
        timeframe,
        description: `I prezzi immobiliari a ${primaryLocation} sono in crescita del 3.2%`,
        impact: 'high',
        recommendation: 'Considera di accelerare i progetti in corso per sfruttare la crescita dei prezzi'
      },
      {
        id: 'demand-trend-1',
        metric: 'Domanda residenziale',
        direction: 'up',
        change: 5.8,
        confidence: 0.78,
        timeframe,
        description: `La domanda per immobili residenziali è aumentata del 5.8%`,
        impact: 'high',
        recommendation: 'Aumenta la produzione di unità residenziali per soddisfare la domanda'
      },
      {
        id: 'interest-trend-1',
        metric: 'Tassi di interesse',
        direction: 'down',
        change: -0.5,
        confidence: 0.72,
        timeframe,
        description: 'I tassi di interesse sono in leggera diminuzione',
        impact: 'medium',
        recommendation: 'Ottimale per nuovi finanziamenti e investimenti'
      }
    ];

    const opportunities: PredictiveInsight[] = [
      {
        id: 'opp-1',
        type: 'opportunity',
        title: 'Zona in Espansione',
        description: `La zona ${primaryLocation} Nord sta vivendo un boom di sviluppo`,
        confidence: 0.82,
        timeframe: '3-6 mesi',
        impact: 'high',
        actionRequired: true,
        data: { location: primaryLocation, growth: 12.5 },
        recommendations: [
          'Esplora opportunità di acquisizione terreni',
          'Valuta partnership con sviluppatori locali',
          'Considera progetti di media scala'
        ]
      }
    ];

    const risks: PredictiveInsight[] = [
      {
        id: 'risk-1',
        type: 'risk',
        title: 'Saturazione Mercato',
        description: 'Rischio di saturazione in alcune zone di Milano',
        confidence: 0.65,
        timeframe: '6-12 mesi',
        impact: 'medium',
        actionRequired: true,
        data: { saturation: 0.78 },
        recommendations: [
          'Diversifica le zone di investimento',
          'Focus su progetti di alta qualità',
          'Valuta mercati secondari'
        ]
      }
    ];

    return {
      location: primaryLocation,
      timeframe,
      trends,
      opportunities,
      risks,
      recommendations: [
        'Accelera i progetti in corso per sfruttare la crescita dei prezzi',
        'Diversifica il portafoglio tra zone diverse',
        'Considera partnership strategiche per ridurre i rischi'
      ],
      confidence: 0.78
    };
  }

  /**
   * ⚡ Ottimizzazione progetti esistenti
   */
  private async optimizeExistingProjects(
    userProfile: UserMemoryProfile
  ): Promise<ProjectOptimization[]> {
    const optimizations: ProjectOptimization[] = [];

    userProfile.context.currentProjects.forEach(project => {
      const optimization = this.optimizeProject(project);
      if (optimization) {
        optimizations.push(optimization);
      }
    });

    return optimizations;
  }

  /**
   * 🔧 Ottimizza un singolo progetto
   */
  private optimizeProject(project: ProjectContext): ProjectOptimization | null {
    const currentMetrics = project.keyMetrics;
    
    // Simula ottimizzazioni basate su best practices
    const optimizedMetrics = {
      ...currentMetrics,
      roi: Math.min(currentMetrics.roi * 1.15, 25), // +15% ROI max 25%
      margin: Math.min(currentMetrics.margin * 1.12, 30), // +12% margin max 30%
      timeline: Math.max(currentMetrics.timeline * 0.9, 6) // -10% timeline min 6 mesi
    };

    const improvements = [
      {
        metric: 'ROI',
        current: currentMetrics.roi,
        optimized: optimizedMetrics.roi,
        improvement: ((optimizedMetrics.roi - currentMetrics.roi) / currentMetrics.roi) * 100,
        action: 'Implementa tecnologie cost-effective e ottimizza la gestione'
      },
      {
        metric: 'Margine',
        current: currentMetrics.margin,
        optimized: optimizedMetrics.margin,
        improvement: ((optimizedMetrics.margin - currentMetrics.margin) / currentMetrics.margin) * 100,
        action: 'Riduci costi operativi e migliora efficienza'
      },
      {
        metric: 'Timeline',
        current: currentMetrics.timeline,
        optimized: optimizedMetrics.timeline,
        improvement: ((currentMetrics.timeline - optimizedMetrics.timeline) / currentMetrics.timeline) * 100,
        action: 'Implementa metodologie agili e parallelizza le attività'
      }
    ];

    const potentialROI = optimizedMetrics.roi - currentMetrics.roi;
    const implementationCost = currentMetrics.budget * 0.05; // 5% del budget
    const paybackPeriod = implementationCost / (currentMetrics.budget * potentialROI / 100);

    return {
      projectId: project.id,
      currentMetrics,
      optimizedMetrics,
      improvements,
      potentialROI,
      implementationCost,
      paybackPeriod
    };
  }

  /**
   * 🎯 Genera raccomandazioni strategiche
   */
  private async generateStrategicRecommendations(
    userProfile: UserMemoryProfile,
    marketForecast: MarketForecast
  ): Promise<PredictiveInsight[]> {
    const recommendations: PredictiveInsight[] = [];

    // Analizza il portafoglio progetti
    const totalBudget = userProfile.context.currentProjects.reduce((sum, p) => sum + p.keyMetrics.budget, 0);
    const averageROI = userProfile.context.currentProjects.reduce((sum, p) => sum + p.keyMetrics.roi, 0) / userProfile.context.currentProjects.length;

    // Raccomandazione basata su budget
    if (totalBudget > 2000000) {
      recommendations.push({
        id: 'rec-1',
        type: 'optimization',
        title: 'Diversificazione Portafoglio',
        description: 'Con un budget elevato, considera di diversificare in più zone e tipologie',
        confidence: 0.88,
        timeframe: '3-6 mesi',
        impact: 'high',
        actionRequired: true,
        data: { totalBudget, diversification: 'recommended' },
        recommendations: [
          'Esplora mercati secondari',
          'Considera progetti commerciali',
          'Valuta partnership con altri sviluppatori'
        ]
      });
    }

    // Raccomandazione basata su ROI
    if (averageROI < 15) {
      recommendations.push({
        id: 'rec-2',
        type: 'optimization',
        title: 'Miglioramento ROI',
        description: 'Il ROI medio del portafoglio è sotto la media di mercato',
        confidence: 0.82,
        timeframe: '6-12 mesi',
        impact: 'high',
        actionRequired: true,
        data: { averageROI, targetROI: 18 },
        recommendations: [
          'Rivedi i costi di costruzione',
          'Ottimizza la progettazione',
          'Considera upgrade tecnologici'
        ]
      });
    }

    return recommendations;
  }

  /**
   * ⚠️ Valuta rischi
   */
  private async assessRisks(
    userProfile: UserMemoryProfile,
    marketForecast: MarketForecast
  ): Promise<PredictiveInsight[]> {
    const risks: PredictiveInsight[] = [];

    // Rischio concentrazione geografica
    const locations = this.extractUniqueLocations(userProfile);
    if (locations.length === 1) {
      risks.push({
        id: 'risk-concentration',
        type: 'risk',
        title: 'Concentrazione Geografica',
        description: 'Tutti i progetti sono concentrati in una sola zona',
        confidence: 0.75,
        timeframe: 'immediato',
        impact: 'high',
        actionRequired: true,
        data: { concentration: 100, location: locations[0] },
        recommendations: [
          'Diversifica geograficamente',
          'Esplora mercati limitrofi',
          'Considera progetti in altre città'
        ]
      });
    }

    // Rischio timeline
    const longProjects = userProfile.context.currentProjects.filter(p => p.keyMetrics.timeline > 24);
    if (longProjects.length > 0) {
      risks.push({
        id: 'risk-timeline',
        type: 'risk',
        title: 'Progetti a Lungo Termine',
        description: 'Alcuni progetti hanno timeline molto lunghe',
        confidence: 0.68,
        timeframe: '6-12 mesi',
        impact: 'medium',
        actionRequired: true,
        data: { longProjects: longProjects.length },
        recommendations: [
          'Accelera le fasi critiche',
          'Considera modularizzazione',
          'Valuta partnership per accelerare'
        ]
      });
    }

    return risks;
  }

  /**
   * 📊 Estrai location uniche dai progetti
   */
  private extractUniqueLocations(userProfile: UserMemoryProfile): string[] {
    const locations = userProfile.context.currentProjects.map(p => p.location);
    return [...new Set(locations)];
  }

  /**
   * 🎲 Inizializza dati di mercato mock
   */
  private initializeMarketData(): void {
    this.marketData.set('milano', {
      pricePerSqm: 8500,
      growth: 3.2,
      demand: 5.8,
      supply: 2.1,
      interestRate: 2.8
    });
    
    this.marketData.set('roma', {
      pricePerSqm: 7200,
      growth: 2.8,
      demand: 4.2,
      supply: 3.1,
      interestRate: 2.9
    });
  }

  /**
   * 🤖 Inizializza modelli di trend
   */
  private initializeTrendModels(): void {
    // Mock trend models - in produzione sarebbero modelli ML reali
    this.trendModels.set('price-forecast', {
      model: 'linear-regression',
      accuracy: 0.78,
      features: ['location', 'time', 'demand', 'supply']
    });
  }

  /**
   * 🔮 Genera previsioni per una metrica specifica
   */
  async forecastMetric(
    metric: string,
    location: string,
    timeframe: string
  ): Promise<{
    current: number;
    forecast: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    factors: string[];
  }> {
    const marketData = this.marketData.get(location.toLowerCase()) || this.marketData.get('milano');
    
    // Simula previsione basata su dati storici
    const baseValue = marketData.pricePerSqm;
    const growth = marketData.growth / 100;
    const months = this.parseTimeframe(timeframe);
    const forecast = baseValue * Math.pow(1 + growth, months / 12);
    
    return {
      current: baseValue,
      forecast: Math.round(forecast),
      confidence: 0.75,
      trend: growth > 0 ? 'up' : 'down',
      factors: ['Domanda crescente', 'Offerta limitata', 'Tassi bassi']
    };
  }

  /**
   * 📅 Converte timeframe in mesi
   */
  private parseTimeframe(timeframe: string): number {
    const match = timeframe.match(/(\d+)\s*(mese|mesi|month|months)/i);
    if (match) {
      return parseInt(match[1]);
    }
    return 6; // default 6 mesi
  }
}

export const predictiveAnalyticsService = PredictiveAnalyticsService.getInstance();
