// Tipi comuni per il sistema Land Scraping - Urbanova AI

export interface ScrapedLand {
  id: string;
  title: string;
  location: string;
  price: number;
  pricePerSqm?: number;
  area: number;
  zoning?: string;
  buildingRights?: string;
  infrastructure?: string[];
  description: string;
  coordinates?: [number, number];
  source: string;
  url: string;
  dateScraped?: Date;
  aiScore?: number;
  features: string[];
  images?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    agent?: string;
  };
  timestamp?: Date;
  // Campi per tracciare la veridicità dei dati
  hasRealPrice?: boolean;
  hasRealArea?: boolean;
}

export interface LandSearchCriteria {
  location: string;
  locations?: string[]; // Per supportare multiple località
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  propertyType?: string;
}

export interface LandAnalysis {
  aiScore: number;
  investmentPotential: number;
  riskAssessment: string;
  marketTrends: string;
  recommendations: string[];
  opportunities: string[];
  warnings: string[];
  estimatedROI: number;
  timeToMarket: string;
  competitiveAdvantage: string;
}

export interface RealLandScrapingResult {
  lands: ScrapedLand[];
  analysis: LandAnalysis[];
  emailSent: boolean;
  summary: {
    totalFound: number;
    averagePrice: number;
    bestOpportunities: ScrapedLand[];
    marketTrends: string;
    recommendations: string[];
  };
} 