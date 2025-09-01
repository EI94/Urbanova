export interface MarketTrend {
  id: string;
  zone: string;
  city: string;
  province: string;
  region: string;
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED';
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  confidence: number;
  dataPoints: {
    date: Date;
    averagePrice: number;
    volume: number;
    daysOnMarket: number;
  }[];
  analysis: {
    priceChange: number;
    volumeChange: number;
    marketVelocity: number;
    demandSupplyRatio: number;
  };
  factors: {
    economic: string[];
    demographic: string[];
    infrastructure: string[];
    regulatory: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
export interface ZoneAnalysis {
  id: string;
  zone: string;
  city: string;
  province: string;
  coordinates: {
    center: {
      latitude: number;
      longitude: number;
    };
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  metrics: {
    projectDensity: number;
    averageROI: number;
    averageBudget: number;
    completionRate: number;
    marketVolatility: number;
  };
  opportunities: {
    underservedSegments: string[];
    growthPotential: number;
    investmentGaps: string[];
    emergingTrends: string[];
  };
  risks: {
    oversaturation: 'LOW' | 'MEDIUM' | 'HIGH';
    regulatoryChanges: 'LOW' | 'MEDIUM' | 'HIGH';
    economicVulnerability: 'LOW' | 'MEDIUM' | 'HIGH';
    environmentalFactors: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  recommendations: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
export interface DemographicInsight {
  id: string;
  zone: string;
  city: string;
  data: {
    population: {
      total: number;
      density: number;
      growthRate: number;
      ageDistribution: {
        under18: number;
        '18-35': number;
        '36-50': number;
        '51-65': number;
        over65: number;
      };
    };
    income: {
      average: number;
      median: number;
      distribution: {
        low: number;
        medium: number;
        high: number;
      };
    };
    education: {
      universityDegree: number;
      highSchool: number;
      primary: number;
    };
    employment: {
      unemploymentRate: number;
      mainSectors: string[];
      averageSalary: number;
    };
  };
  insights: {
    targetMarket: string[];
    purchasingPower: 'LOW' | 'MEDIUM' | 'HIGH';
    lifestylePreferences: string[];
    investmentCapacity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  source: 'ISTAT' | 'OpenData' | 'Survey' | 'Estimated';
  lastUpdated: Date;
}
export interface InfrastructureAnalysis {
  id: string;
  zone: string;
  city: string;
  transport: {
    metro: {
      lines: string[];
      stations: number;
      coverage: number;
    };
    bus: {
      lines: number;
      frequency: string;
      coverage: number;
    };
    train: {
      stations: number;
      connections: string[];
      frequency: string;
    };
    roads: {
      highways: string[];
      mainRoads: number;
      accessibility: number;
    };
  };
  services: {
    healthcare: {
      hospitals: number;
      clinics: number;
      coverage: number;
    };
    education: {
      schools: number;
      universities: number;
      quality: number;
    };
    shopping: {
      malls: number;
      supermarkets: number;
      specialty: number;
    };
    recreation: {
      parks: number;
      gyms: number;
      cultural: number;
    };
  };
  utilities: {
    water: {
      coverage: number;
      quality: number;
    };
    electricity: {
      coverage: number;
      reliability: number;
    };
    internet: {
      fiber: number;
      mobile: number;
      speed: number;
    };
    waste: {
      collection: number;
      recycling: number;
    };
  };
  accessibility: {
    overall: number;
    publicTransport: number;
    carAccess: number;
    walking: number;
    cycling: number;
  };
  lastUpdated: Date;
}
export interface InvestmentOpportunity {
  id: string;
  zone: string;
  city: string;
  type: 'UNDERSERVED_SEGMENT' | 'GROWTH_ZONE' | 'REGENERATION_AREA' | 'NEW_INFRASTRUCTURE';
  description: string;
  potential: {
    roi: number;
    timeframe: 'SHORT' | 'MEDIUM' | 'LONG';
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    scalability: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  market: {
    targetDemand: number;
    competition: 'LOW' | 'MEDIUM' | 'HIGH';
    barriers: string[];
    advantages: string[];
  };
  requirements: {
    minimumInvestment: number;
    expertise: string[];
    timeline: number;
    permits: string[];
  };
  evidence: {
    dataPoints: string[];
    trends: string[];
    comparableProjects: string[];
  };
  createdAt: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
export interface CreateMarketTrendData {
  zone: string;
  city: string;
  province: string;
  region: string;
  propertyType: MarketTrend['propertyType'];
  trend: MarketTrend['trend'];
  confidence: number;
  dataPoints: MarketTrend['dataPoints'];
  analysis: MarketTrend['analysis'];
  factors: MarketTrend['factors'];
}
export interface CreateZoneAnalysisData {
  zone: string;
  city: string;
  province: string;
  coordinates: ZoneAnalysis['coordinates'];
  metrics: ZoneAnalysis['metrics'];
  opportunities: ZoneAnalysis['opportunities'];
  risks: ZoneAnalysis['risks'];
  recommendations: ZoneAnalysis['recommendations'];
}
export declare class TerritorialIntelligenceService {
  private readonly MARKET_TRENDS_COLLECTION;
  private readonly ZONE_ANALYSIS_COLLECTION;
  private readonly DEMOGRAPHIC_INSIGHTS_COLLECTION;
  private readonly INFRASTRUCTURE_ANALYSIS_COLLECTION;
  private readonly INVESTMENT_OPPORTUNITIES_COLLECTION;
  /**
   * Crea un nuovo trend di mercato
   */
  createMarketTrend(trendData: CreateMarketTrendData): Promise<string>;
  /**
   * Crea un'analisi di zona
   */
  createZoneAnalysis(analysisData: CreateZoneAnalysisData): Promise<string>;
  /**
   * Recupera tutti i trend di mercato per una zona
   */
  getMarketTrendsByZone(zone: string, city?: string): Promise<MarketTrend[]>;
  /**
   * Recupera analisi di zona
   */
  getZoneAnalysis(zone: string, city?: string): Promise<ZoneAnalysis[]>;
  /**
   * Analizza opportunità di investimento per una zona
   */
  analyzeInvestmentOpportunities(zone: string, city: string): Promise<InvestmentOpportunity[]>;
  /**
   * Genera insights demografici per una zona
   */
  generateDemographicInsights(zone: string, city: string): Promise<DemographicInsight>;
  /**
   * Analizza infrastrutture per una zona
   */
  analyzeInfrastructure(zone: string, city: string): Promise<InfrastructureAnalysis>;
  /**
   * Inizializza dati di esempio per l'intelligence territoriale
   */
  initializeSampleData(): Promise<void>;
}
export declare const territorialIntelligenceService: TerritorialIntelligenceService;
//# sourceMappingURL=territorialIntelligenceService.d.ts.map
