import { z } from 'zod';

// ============================================================================
// MARKET INTELLIGENCE TYPES
// ============================================================================

export interface MarketKPIs {
  psqmMedian: number;
  psqmMean: number;
  psqmStdDev: number;
  absorptionDays: number; // tempo medio di vendita
  inventoryCount: number;
  inventoryDensity: number; // immobili/km²
  priceVolatility: number; // coefficiente di variazione
  demandScore: number; // 0-100
  supplyScore: number; // 0-100
  marketBalance: number; // domanda - offerta
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: number; // 0-100
}

export interface HeatmapCell {
  id: string;
  coordinates: {
    lat: number;
    lng: number;
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  kpis: MarketKPIs;
  metadata: {
    compsCount: number;
    dataQuality: number; // 0-1
    lastUpdated: Date;
    dataSources: string[];
  };
}

export interface MarketInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'risk' | 'comparison';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'high' | 'medium' | 'low';
  dataPoints: {
    metric: string;
    value: number;
    change: number;
    unit: string;
  }[];
  recommendations?: string[];
}

export interface MarketSnapshot {
  id: string;
  city: string;
  asset: string; // 'residential' | 'commercial' | 'industrial'
  horizonMonths: number;
  timestamp: Date;
  data: {
    kpis: MarketKPIs;
    heatmap: {
      type: 'FeatureCollection';
      features: Array<{
        type: 'Feature';
        geometry: {
          type: 'Polygon';
          coordinates: number[][][];
        };
        properties: HeatmapCell;
      }>;
    };
    insights: MarketInsight[];
    comps: {
      total: number;
      median: number;
      mean: number;
      stdDev: number;
      quartiles: [number, number, number, number];
    };
    omi: {
      zone: string;
      range: [number, number];
      confidence: number;
      lastUpdate: Date;
    };
  };
  metadata: {
    dataSources: string[];
    cacheHit: boolean;
    generationTime: number;
    dataQuality: number; // 0-1
    coverage: number; // % territorio coperto
  };
}

export interface MarketTrendReport {
  id: string;
  city: string;
  asset: string;
  horizonMonths: number;
  generatedAt: Date;
  pdfUrl: string;
  summary: {
    keyInsights: MarketInsight[];
    marketHealth: 'excellent' | 'good' | 'fair' | 'poor';
    riskLevel: 'low' | 'medium' | 'high';
    opportunities: string[];
    risks: string[];
  };
  charts: {
    priceTrend: string; // URL chart
    absorptionTrend: string;
    inventoryTrend: string;
    demandSupplyBalance: string;
  };
}

export interface MarketScanRequest {
  city: string;
  asset: 'residential' | 'commercial' | 'industrial' | 'mixed';
  horizonMonths: number;
  radiusKm?: number;
  includeHeatmap?: boolean;
  includeInsights?: boolean;
  forceRefresh?: boolean;
}

export interface CompsFetchRequest {
  city: string;
  radiusKm?: number;
  sampleSize?: number;
  asset?: string;
  priceRange?: [number, number];
  surfaceRange?: [number, number];
  dateFrom?: Date;
  dateTo?: Date;
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

export const zMarketKPIs = z.object({
  psqmMedian: z.number().positive(),
  psqmMean: z.number().positive(),
  psqmStdDev: z.number().nonnegative(),
  absorptionDays: z.number().positive(),
  inventoryCount: z.number().nonnegative(),
  inventoryDensity: z.number().nonnegative(),
  priceVolatility: z.number().nonnegative(),
  demandScore: z.number().min(0).max(100),
  supplyScore: z.number().min(0).max(100),
  marketBalance: z.number(),
  trendDirection: z.enum(['up', 'down', 'stable']),
  trendStrength: z.number().min(0).max(100),
});

export const zHeatmapCell = z.object({
  id: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
    bounds: z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    }),
  }),
  kpis: zMarketKPIs,
  metadata: z.object({
    compsCount: z.number().nonnegative(),
    dataQuality: z.number().min(0).max(1),
    lastUpdated: z.date(),
    dataSources: z.array(z.string()),
  }),
});

export const zMarketInsight = z.object({
  id: z.string(),
  type: z.enum(['trend', 'opportunity', 'risk', 'comparison']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  impact: z.enum(['high', 'medium', 'low']),
  dataPoints: z.array(
    z.object({
      metric: z.string(),
      value: z.number(),
      change: z.number(),
      unit: z.string(),
    })
  ),
  recommendations: z.array(z.string()).optional(),
});

export const zMarketSnapshot = z.object({
  id: z.string(),
  city: z.string(),
  asset: z.enum(['residential', 'commercial', 'industrial']),
  horizonMonths: z.number().positive(),
  timestamp: z.date(),
  data: z.object({
    kpis: zMarketKPIs,
    heatmap: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(
        z.object({
          type: z.literal('Feature'),
          geometry: z.object({
            type: z.literal('Polygon'),
            coordinates: z.array(z.array(z.array(z.number()))),
          }),
          properties: zHeatmapCell,
        })
      ),
    }),
    insights: z.array(zMarketInsight),
    comps: z.object({
      total: z.number().nonnegative(),
      median: z.number().positive(),
      mean: z.number().positive(),
      stdDev: z.number().nonnegative(),
      quartiles: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    }),
    omi: z.object({
      zone: z.string(),
      range: z.tuple([z.number(), z.number()]),
      confidence: z.number().min(0).max(1),
      lastUpdate: z.date(),
    }),
  }),
  metadata: z.object({
    dataSources: z.array(z.string()),
    cacheHit: z.boolean(),
    generationTime: z.number().positive(),
    dataQuality: z.number().min(0).max(1),
    coverage: z.number().min(0).max(100),
  }),
});

export const zMarketTrendReport = z.object({
  id: z.string(),
  city: z.string(),
  asset: z.enum(['residential', 'commercial', 'industrial']),
  horizonMonths: z.number().positive(),
  generatedAt: z.date(),
  pdfUrl: z.string().url(),
  summary: z.object({
    keyInsights: z.array(zMarketInsight),
    marketHealth: z.enum(['excellent', 'good', 'fair', 'poor']),
    riskLevel: z.enum(['low', 'medium', 'high']),
    opportunities: z.array(z.string()),
    risks: z.array(z.string()),
  }),
  charts: z.object({
    priceTrend: z.string(),
    absorptionTrend: z.string(),
    inventoryTrend: z.string(),
    demandSupplyBalance: z.string(),
  }),
});

export const zMarketScanRequest = z.object({
  city: z.string().min(1),
  asset: z.enum(['residential', 'commercial', 'industrial', 'mixed']),
  horizonMonths: z.number().min(1).max(60),
  radiusKm: z.number().positive().optional(),
  includeHeatmap: z.boolean().optional().default(true),
  includeInsights: z.boolean().optional().default(true),
  forceRefresh: z.boolean().optional().default(false),
});

export const zCompsFetchRequest = z.object({
  city: z.string().min(1),
  radiusKm: z.number().positive().optional().default(10),
  sampleSize: z.number().positive().optional().default(100),
  asset: z.enum(['residential', 'commercial', 'industrial']).optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  surfaceRange: z.tuple([z.number(), z.number()]).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AssetType = 'residential' | 'commercial' | 'industrial' | 'mixed';
export type TrendDirection = 'up' | 'down' | 'stable';
export type InsightType = 'trend' | 'opportunity' | 'risk' | 'comparison';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type MarketHealth = 'excellent' | 'good' | 'fair' | 'poor';
export type RiskLevel = 'low' | 'medium' | 'high';

// ============================================================================
// CONSTANTS
// ============================================================================

export const MARKET_CACHE_TTL = {
  OMI_DATA: 24 * 60 * 60 * 1000, // 24 ore
  COMPS_DATA: 6 * 60 * 60 * 1000, // 6 ore
  HEATMAP: 12 * 60 * 60 * 1000, // 12 ore
  TREND_ANALYSIS: 7 * 24 * 60 * 60 * 1000, // 7 giorni
  SNAPSHOT: 30 * 24 * 60 * 60 * 1000, // 30 giorni
};

export const HEATMAP_GRID_SIZE = 500; // metri
export const DEFAULT_RADIUS_KM = 10;
export const DEFAULT_SAMPLE_SIZE = 100;
export const MAX_HORIZON_MONTHS = 60;

export const ITALIAN_CITIES = [
  'Milano',
  'Roma',
  'Napoli',
  'Torino',
  'Palermo',
  'Genova',
  'Bologna',
  'Firenze',
  'Bari',
  'Catania',
  'Venezia',
  'Verona',
  'Messina',
  'Padova',
  'Trieste',
  'Brescia',
  'Parma',
  'Taranto',
  'Prato',
  'Modena',
  'Reggio Calabria',
  'Reggio Emilia',
  'Perugia',
  'Livorno',
  'Ravenna',
  'Cagliari',
  'Foggia',
  'Rimini',
  'Salerno',
  'Ferrara',
  'Sassari',
  'Latina',
  'Giugliano in Campania',
  'Monza',
  'Siracusa',
  'Bergamo',
  'Pescara',
  'Trento',
  'Forlì',
  'Vicenza',
  'Terni',
  'Bolzano',
  'Novara',
  'Piacenza',
  'Udine',
  'Ancona',
  'Andria',
  'Arezzo',
  'Cesena',
  'Lecce',
  'Pesaro',
  'Alessandria',
  'Barletta',
  'Asti',
  'Chieti',
  'La Spezia',
  'Pistoia',
  'Catanzaro',
  'Brindisi',
  'Grosseto',
  'Ragusa',
  'Frosinone',
  'Trapani',
  'Cremona',
  'Mantova',
  'Agrigento',
  'Caltanissetta',
  'Savona',
  'Vercelli',
  'Belluno',
  'Pordenone',
  'Sondrio',
  'Aosta',
  'Bolzano',
] as const;

export const ASSET_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  MIXED: 'mixed',
} as const;

export const MARKET_HEALTH_THRESHOLDS = {
  EXCELLENT: { demandScore: 80, supplyScore: 60, marketBalance: 20 },
  GOOD: { demandScore: 60, supplyScore: 40, marketBalance: 10 },
  FAIR: { demandScore: 40, supplyScore: 60, marketBalance: -10 },
  POOR: { demandScore: 20, supplyScore: 80, marketBalance: -30 },
} as const;
