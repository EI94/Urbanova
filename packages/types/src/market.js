"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARKET_HEALTH_THRESHOLDS = exports.ASSET_TYPES = exports.ITALIAN_CITIES = exports.MAX_HORIZON_MONTHS = exports.DEFAULT_SAMPLE_SIZE = exports.DEFAULT_RADIUS_KM = exports.HEATMAP_GRID_SIZE = exports.MARKET_CACHE_TTL = exports.zCompsFetchRequest = exports.zMarketScanRequest = exports.zMarketTrendReport = exports.zMarketSnapshot = exports.zMarketInsight = exports.zHeatmapCell = exports.zMarketKPIs = void 0;
const zod_1 = require("zod");
// ============================================================================
// ZOD SCHEMAS
// ============================================================================
exports.zMarketKPIs = zod_1.z.object({
    psqmMedian: zod_1.z.number().positive(),
    psqmMean: zod_1.z.number().positive(),
    psqmStdDev: zod_1.z.number().nonnegative(),
    absorptionDays: zod_1.z.number().positive(),
    inventoryCount: zod_1.z.number().nonnegative(),
    inventoryDensity: zod_1.z.number().nonnegative(),
    priceVolatility: zod_1.z.number().nonnegative(),
    demandScore: zod_1.z.number().min(0).max(100),
    supplyScore: zod_1.z.number().min(0).max(100),
    marketBalance: zod_1.z.number(),
    trendDirection: zod_1.z.enum(['up', 'down', 'stable']),
    trendStrength: zod_1.z.number().min(0).max(100),
});
exports.zHeatmapCell = zod_1.z.object({
    id: zod_1.z.string(),
    coordinates: zod_1.z.object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
        bounds: zod_1.z.object({
            north: zod_1.z.number(),
            south: zod_1.z.number(),
            east: zod_1.z.number(),
            west: zod_1.z.number(),
        }),
    }),
    kpis: exports.zMarketKPIs,
    metadata: zod_1.z.object({
        compsCount: zod_1.z.number().nonnegative(),
        dataQuality: zod_1.z.number().min(0).max(1),
        lastUpdated: zod_1.z.date(),
        dataSources: zod_1.z.array(zod_1.z.string()),
    }),
});
exports.zMarketInsight = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['trend', 'opportunity', 'risk', 'comparison']),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    impact: zod_1.z.enum(['high', 'medium', 'low']),
    dataPoints: zod_1.z.array(zod_1.z.object({
        metric: zod_1.z.string(),
        value: zod_1.z.number(),
        change: zod_1.z.number(),
        unit: zod_1.z.string(),
    })),
    recommendations: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.zMarketSnapshot = zod_1.z.object({
    id: zod_1.z.string(),
    city: zod_1.z.string(),
    asset: zod_1.z.enum(['residential', 'commercial', 'industrial']),
    horizonMonths: zod_1.z.number().positive(),
    timestamp: zod_1.z.date(),
    data: zod_1.z.object({
        kpis: exports.zMarketKPIs,
        heatmap: zod_1.z.object({
            type: zod_1.z.literal('FeatureCollection'),
            features: zod_1.z.array(zod_1.z.object({
                type: zod_1.z.literal('Feature'),
                geometry: zod_1.z.object({
                    type: zod_1.z.literal('Polygon'),
                    coordinates: zod_1.z.array(zod_1.z.array(zod_1.z.array(zod_1.z.number()))),
                }),
                properties: exports.zHeatmapCell,
            })),
        }),
        insights: zod_1.z.array(exports.zMarketInsight),
        comps: zod_1.z.object({
            total: zod_1.z.number().nonnegative(),
            median: zod_1.z.number().positive(),
            mean: zod_1.z.number().positive(),
            stdDev: zod_1.z.number().nonnegative(),
            quartiles: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number(), zod_1.z.number(), zod_1.z.number()]),
        }),
        omi: zod_1.z.object({
            zone: zod_1.z.string(),
            range: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
            confidence: zod_1.z.number().min(0).max(1),
            lastUpdate: zod_1.z.date(),
        }),
    }),
    metadata: zod_1.z.object({
        dataSources: zod_1.z.array(zod_1.z.string()),
        cacheHit: zod_1.z.boolean(),
        generationTime: zod_1.z.number().positive(),
        dataQuality: zod_1.z.number().min(0).max(1),
        coverage: zod_1.z.number().min(0).max(100),
    }),
});
exports.zMarketTrendReport = zod_1.z.object({
    id: zod_1.z.string(),
    city: zod_1.z.string(),
    asset: zod_1.z.enum(['residential', 'commercial', 'industrial']),
    horizonMonths: zod_1.z.number().positive(),
    generatedAt: zod_1.z.date(),
    pdfUrl: zod_1.z.string().url(),
    summary: zod_1.z.object({
        keyInsights: zod_1.z.array(exports.zMarketInsight),
        marketHealth: zod_1.z.enum(['excellent', 'good', 'fair', 'poor']),
        riskLevel: zod_1.z.enum(['low', 'medium', 'high']),
        opportunities: zod_1.z.array(zod_1.z.string()),
        risks: zod_1.z.array(zod_1.z.string()),
    }),
    charts: zod_1.z.object({
        priceTrend: zod_1.z.string(),
        absorptionTrend: zod_1.z.string(),
        inventoryTrend: zod_1.z.string(),
        demandSupplyBalance: zod_1.z.string(),
    }),
});
exports.zMarketScanRequest = zod_1.z.object({
    city: zod_1.z.string().min(1),
    asset: zod_1.z.enum(['residential', 'commercial', 'industrial', 'mixed']),
    horizonMonths: zod_1.z.number().min(1).max(60),
    radiusKm: zod_1.z.number().positive().optional(),
    includeHeatmap: zod_1.z.boolean().optional().default(true),
    includeInsights: zod_1.z.boolean().optional().default(true),
    forceRefresh: zod_1.z.boolean().optional().default(false),
});
exports.zCompsFetchRequest = zod_1.z.object({
    city: zod_1.z.string().min(1),
    radiusKm: zod_1.z.number().positive().optional().default(10),
    sampleSize: zod_1.z.number().positive().optional().default(100),
    asset: zod_1.z.enum(['residential', 'commercial', 'industrial']).optional(),
    priceRange: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
    surfaceRange: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
    dateFrom: zod_1.z.date().optional(),
    dateTo: zod_1.z.date().optional(),
});
// ============================================================================
// CONSTANTS
// ============================================================================
exports.MARKET_CACHE_TTL = {
    OMI_DATA: 24 * 60 * 60 * 1000, // 24 ore
    COMPS_DATA: 6 * 60 * 60 * 1000, // 6 ore
    HEATMAP: 12 * 60 * 60 * 1000, // 12 ore
    TREND_ANALYSIS: 7 * 24 * 60 * 60 * 1000, // 7 giorni
    SNAPSHOT: 30 * 24 * 60 * 60 * 1000, // 30 giorni
};
exports.HEATMAP_GRID_SIZE = 500; // metri
exports.DEFAULT_RADIUS_KM = 10;
exports.DEFAULT_SAMPLE_SIZE = 100;
exports.MAX_HORIZON_MONTHS = 60;
exports.ITALIAN_CITIES = [
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
];
exports.ASSET_TYPES = {
    RESIDENTIAL: 'residential',
    COMMERCIAL: 'commercial',
    INDUSTRIAL: 'industrial',
    MIXED: 'mixed',
};
exports.MARKET_HEALTH_THRESHOLDS = {
    EXCELLENT: { demandScore: 80, supplyScore: 60, marketBalance: 20 },
    GOOD: { demandScore: 60, supplyScore: 40, marketBalance: 10 },
    FAIR: { demandScore: 40, supplyScore: 60, marketBalance: -10 },
    POOR: { demandScore: 20, supplyScore: 80, marketBalance: -30 },
};
//# sourceMappingURL=market.js.map