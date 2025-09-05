import { z } from 'zod';
export interface MarketKPIs {
    psqmMedian: number;
    psqmMean: number;
    psqmStdDev: number;
    absorptionDays: number;
    inventoryCount: number;
    inventoryDensity: number;
    priceVolatility: number;
    demandScore: number;
    supplyScore: number;
    marketBalance: number;
    trendDirection: 'up' | 'down' | 'stable';
    trendStrength: number;
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
        dataQuality: number;
        lastUpdated: Date;
        dataSources: string[];
    };
}
export interface MarketInsight {
    id: string;
    type: 'trend' | 'opportunity' | 'risk' | 'comparison';
    title: string;
    description: string;
    confidence: number;
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
    asset: string;
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
        dataQuality: number;
        coverage: number;
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
        priceTrend: string;
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
export declare const zMarketKPIs: z.ZodObject<{
    psqmMedian: z.ZodNumber;
    psqmMean: z.ZodNumber;
    psqmStdDev: z.ZodNumber;
    absorptionDays: z.ZodNumber;
    inventoryCount: z.ZodNumber;
    inventoryDensity: z.ZodNumber;
    priceVolatility: z.ZodNumber;
    demandScore: z.ZodNumber;
    supplyScore: z.ZodNumber;
    marketBalance: z.ZodNumber;
    trendDirection: z.ZodEnum<["up", "down", "stable"]>;
    trendStrength: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    psqmMedian: number;
    psqmMean: number;
    psqmStdDev: number;
    absorptionDays: number;
    inventoryCount: number;
    inventoryDensity: number;
    priceVolatility: number;
    demandScore: number;
    supplyScore: number;
    marketBalance: number;
    trendDirection: "up" | "down" | "stable";
    trendStrength: number;
}, {
    psqmMedian: number;
    psqmMean: number;
    psqmStdDev: number;
    absorptionDays: number;
    inventoryCount: number;
    inventoryDensity: number;
    priceVolatility: number;
    demandScore: number;
    supplyScore: number;
    marketBalance: number;
    trendDirection: "up" | "down" | "stable";
    trendStrength: number;
}>;
export declare const zHeatmapCell: z.ZodObject<{
    id: z.ZodString;
    coordinates: z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        bounds: z.ZodObject<{
            north: z.ZodNumber;
            south: z.ZodNumber;
            east: z.ZodNumber;
            west: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            north: number;
            south: number;
            east: number;
            west: number;
        }, {
            north: number;
            south: number;
            east: number;
            west: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        bounds: {
            north: number;
            south: number;
            east: number;
            west: number;
        };
    }, {
        lat: number;
        lng: number;
        bounds: {
            north: number;
            south: number;
            east: number;
            west: number;
        };
    }>;
    kpis: z.ZodObject<{
        psqmMedian: z.ZodNumber;
        psqmMean: z.ZodNumber;
        psqmStdDev: z.ZodNumber;
        absorptionDays: z.ZodNumber;
        inventoryCount: z.ZodNumber;
        inventoryDensity: z.ZodNumber;
        priceVolatility: z.ZodNumber;
        demandScore: z.ZodNumber;
        supplyScore: z.ZodNumber;
        marketBalance: z.ZodNumber;
        trendDirection: z.ZodEnum<["up", "down", "stable"]>;
        trendStrength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        psqmMedian: number;
        psqmMean: number;
        psqmStdDev: number;
        absorptionDays: number;
        inventoryCount: number;
        inventoryDensity: number;
        priceVolatility: number;
        demandScore: number;
        supplyScore: number;
        marketBalance: number;
        trendDirection: "up" | "down" | "stable";
        trendStrength: number;
    }, {
        psqmMedian: number;
        psqmMean: number;
        psqmStdDev: number;
        absorptionDays: number;
        inventoryCount: number;
        inventoryDensity: number;
        priceVolatility: number;
        demandScore: number;
        supplyScore: number;
        marketBalance: number;
        trendDirection: "up" | "down" | "stable";
        trendStrength: number;
    }>;
    metadata: z.ZodObject<{
        compsCount: z.ZodNumber;
        dataQuality: z.ZodNumber;
        lastUpdated: z.ZodDate;
        dataSources: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        compsCount: number;
        dataQuality: number;
        lastUpdated: Date;
        dataSources: string[];
    }, {
        compsCount: number;
        dataQuality: number;
        lastUpdated: Date;
        dataSources: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    metadata: {
        compsCount: number;
        dataQuality: number;
        lastUpdated: Date;
        dataSources: string[];
    };
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
    kpis: {
        psqmMedian: number;
        psqmMean: number;
        psqmStdDev: number;
        absorptionDays: number;
        inventoryCount: number;
        inventoryDensity: number;
        priceVolatility: number;
        demandScore: number;
        supplyScore: number;
        marketBalance: number;
        trendDirection: "up" | "down" | "stable";
        trendStrength: number;
    };
}, {
    id: string;
    metadata: {
        compsCount: number;
        dataQuality: number;
        lastUpdated: Date;
        dataSources: string[];
    };
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
    kpis: {
        psqmMedian: number;
        psqmMean: number;
        psqmStdDev: number;
        absorptionDays: number;
        inventoryCount: number;
        inventoryDensity: number;
        priceVolatility: number;
        demandScore: number;
        supplyScore: number;
        marketBalance: number;
        trendDirection: "up" | "down" | "stable";
        trendStrength: number;
    };
}>;
export declare const zMarketInsight: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["trend", "opportunity", "risk", "comparison"]>;
    title: z.ZodString;
    description: z.ZodString;
    confidence: z.ZodNumber;
    impact: z.ZodEnum<["high", "medium", "low"]>;
    dataPoints: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        value: z.ZodNumber;
        change: z.ZodNumber;
        unit: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        metric: string;
        change: number;
    }, {
        value: number;
        unit: string;
        metric: string;
        change: number;
    }>, "many">;
    recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    id: string;
    description: string;
    type: "trend" | "opportunity" | "risk" | "comparison";
    title: string;
    impact: "low" | "medium" | "high";
    dataPoints: {
        value: number;
        unit: string;
        metric: string;
        change: number;
    }[];
    recommendations?: string[] | undefined;
}, {
    confidence: number;
    id: string;
    description: string;
    type: "trend" | "opportunity" | "risk" | "comparison";
    title: string;
    impact: "low" | "medium" | "high";
    dataPoints: {
        value: number;
        unit: string;
        metric: string;
        change: number;
    }[];
    recommendations?: string[] | undefined;
}>;
export declare const zMarketSnapshot: z.ZodObject<{
    id: z.ZodString;
    city: z.ZodString;
    asset: z.ZodEnum<["residential", "commercial", "industrial"]>;
    horizonMonths: z.ZodNumber;
    timestamp: z.ZodDate;
    data: z.ZodObject<{
        kpis: z.ZodObject<{
            psqmMedian: z.ZodNumber;
            psqmMean: z.ZodNumber;
            psqmStdDev: z.ZodNumber;
            absorptionDays: z.ZodNumber;
            inventoryCount: z.ZodNumber;
            inventoryDensity: z.ZodNumber;
            priceVolatility: z.ZodNumber;
            demandScore: z.ZodNumber;
            supplyScore: z.ZodNumber;
            marketBalance: z.ZodNumber;
            trendDirection: z.ZodEnum<["up", "down", "stable"]>;
            trendStrength: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            psqmMedian: number;
            psqmMean: number;
            psqmStdDev: number;
            absorptionDays: number;
            inventoryCount: number;
            inventoryDensity: number;
            priceVolatility: number;
            demandScore: number;
            supplyScore: number;
            marketBalance: number;
            trendDirection: "up" | "down" | "stable";
            trendStrength: number;
        }, {
            psqmMedian: number;
            psqmMean: number;
            psqmStdDev: number;
            absorptionDays: number;
            inventoryCount: number;
            inventoryDensity: number;
            priceVolatility: number;
            demandScore: number;
            supplyScore: number;
            marketBalance: number;
            trendDirection: "up" | "down" | "stable";
            trendStrength: number;
        }>;
        heatmap: z.ZodObject<{
            type: z.ZodLiteral<"FeatureCollection">;
            features: z.ZodArray<z.ZodObject<{
                type: z.ZodLiteral<"Feature">;
                geometry: z.ZodObject<{
                    type: z.ZodLiteral<"Polygon">;
                    coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
                }, "strip", z.ZodTypeAny, {
                    type: "Polygon";
                    coordinates: number[][][];
                }, {
                    type: "Polygon";
                    coordinates: number[][][];
                }>;
                properties: z.ZodObject<{
                    id: z.ZodString;
                    coordinates: z.ZodObject<{
                        lat: z.ZodNumber;
                        lng: z.ZodNumber;
                        bounds: z.ZodObject<{
                            north: z.ZodNumber;
                            south: z.ZodNumber;
                            east: z.ZodNumber;
                            west: z.ZodNumber;
                        }, "strip", z.ZodTypeAny, {
                            north: number;
                            south: number;
                            east: number;
                            west: number;
                        }, {
                            north: number;
                            south: number;
                            east: number;
                            west: number;
                        }>;
                    }, "strip", z.ZodTypeAny, {
                        lat: number;
                        lng: number;
                        bounds: {
                            north: number;
                            south: number;
                            east: number;
                            west: number;
                        };
                    }, {
                        lat: number;
                        lng: number;
                        bounds: {
                            north: number;
                            south: number;
                            east: number;
                            west: number;
                        };
                    }>;
                    kpis: z.ZodObject<{
                        psqmMedian: z.ZodNumber;
                        psqmMean: z.ZodNumber;
                        psqmStdDev: z.ZodNumber;
                        absorptionDays: z.ZodNumber;
                        inventoryCount: z.ZodNumber;
                        inventoryDensity: z.ZodNumber;
                        priceVolatility: z.ZodNumber;
                        demandScore: z.ZodNumber;
                        supplyScore: z.ZodNumber;
                        marketBalance: z.ZodNumber;
                        trendDirection: z.ZodEnum<["up", "down", "stable"]>;
                        trendStrength: z.ZodNumber;
                    }, "strip", z.ZodTypeAny, {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    }, {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    }>;
                    metadata: z.ZodObject<{
                        compsCount: z.ZodNumber;
                        dataQuality: z.ZodNumber;
                        lastUpdated: z.ZodDate;
                        dataSources: z.ZodArray<z.ZodString, "many">;
                    }, "strip", z.ZodTypeAny, {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    }, {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    }>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                }, {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                }>;
            }, "strip", z.ZodTypeAny, {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }, {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "FeatureCollection";
            features: {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }[];
        }, {
            type: "FeatureCollection";
            features: {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }[];
        }>;
        insights: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["trend", "opportunity", "risk", "comparison"]>;
            title: z.ZodString;
            description: z.ZodString;
            confidence: z.ZodNumber;
            impact: z.ZodEnum<["high", "medium", "low"]>;
            dataPoints: z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                value: z.ZodNumber;
                change: z.ZodNumber;
                unit: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }, {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }>, "many">;
            recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }, {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }>, "many">;
        comps: z.ZodObject<{
            total: z.ZodNumber;
            median: z.ZodNumber;
            mean: z.ZodNumber;
            stdDev: z.ZodNumber;
            quartiles: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            total: number;
            median: number;
            mean: number;
            stdDev: number;
            quartiles: [number, number, number, number];
        }, {
            total: number;
            median: number;
            mean: number;
            stdDev: number;
            quartiles: [number, number, number, number];
        }>;
        omi: z.ZodObject<{
            zone: z.ZodString;
            range: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            confidence: z.ZodNumber;
            lastUpdate: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            lastUpdate: Date;
            zone: string;
            range: [number, number];
        }, {
            confidence: number;
            lastUpdate: Date;
            zone: string;
            range: [number, number];
        }>;
    }, "strip", z.ZodTypeAny, {
        kpis: {
            psqmMedian: number;
            psqmMean: number;
            psqmStdDev: number;
            absorptionDays: number;
            inventoryCount: number;
            inventoryDensity: number;
            priceVolatility: number;
            demandScore: number;
            supplyScore: number;
            marketBalance: number;
            trendDirection: "up" | "down" | "stable";
            trendStrength: number;
        };
        heatmap: {
            type: "FeatureCollection";
            features: {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }[];
        };
        insights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        comps: {
            total: number;
            median: number;
            mean: number;
            stdDev: number;
            quartiles: [number, number, number, number];
        };
        omi: {
            confidence: number;
            lastUpdate: Date;
            zone: string;
            range: [number, number];
        };
    }, {
        kpis: {
            psqmMedian: number;
            psqmMean: number;
            psqmStdDev: number;
            absorptionDays: number;
            inventoryCount: number;
            inventoryDensity: number;
            priceVolatility: number;
            demandScore: number;
            supplyScore: number;
            marketBalance: number;
            trendDirection: "up" | "down" | "stable";
            trendStrength: number;
        };
        heatmap: {
            type: "FeatureCollection";
            features: {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }[];
        };
        insights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        comps: {
            total: number;
            median: number;
            mean: number;
            stdDev: number;
            quartiles: [number, number, number, number];
        };
        omi: {
            confidence: number;
            lastUpdate: Date;
            zone: string;
            range: [number, number];
        };
    }>;
    metadata: z.ZodObject<{
        dataSources: z.ZodArray<z.ZodString, "many">;
        cacheHit: z.ZodBoolean;
        generationTime: z.ZodNumber;
        dataQuality: z.ZodNumber;
        coverage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        dataQuality: number;
        dataSources: string[];
        cacheHit: boolean;
        generationTime: number;
        coverage: number;
    }, {
        dataQuality: number;
        dataSources: string[];
        cacheHit: boolean;
        generationTime: number;
        coverage: number;
    }>;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    id: string;
    metadata: {
        dataQuality: number;
        dataSources: string[];
        cacheHit: boolean;
        generationTime: number;
        coverage: number;
    };
    city: string;
    asset: "residential" | "commercial" | "industrial";
    horizonMonths: number;
    data: {
        kpis: {
            psqmMedian: number;
            psqmMean: number;
            psqmStdDev: number;
            absorptionDays: number;
            inventoryCount: number;
            inventoryDensity: number;
            priceVolatility: number;
            demandScore: number;
            supplyScore: number;
            marketBalance: number;
            trendDirection: "up" | "down" | "stable";
            trendStrength: number;
        };
        heatmap: {
            type: "FeatureCollection";
            features: {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }[];
        };
        insights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        comps: {
            total: number;
            median: number;
            mean: number;
            stdDev: number;
            quartiles: [number, number, number, number];
        };
        omi: {
            confidence: number;
            lastUpdate: Date;
            zone: string;
            range: [number, number];
        };
    };
}, {
    timestamp: Date;
    id: string;
    metadata: {
        dataQuality: number;
        dataSources: string[];
        cacheHit: boolean;
        generationTime: number;
        coverage: number;
    };
    city: string;
    asset: "residential" | "commercial" | "industrial";
    horizonMonths: number;
    data: {
        kpis: {
            psqmMedian: number;
            psqmMean: number;
            psqmStdDev: number;
            absorptionDays: number;
            inventoryCount: number;
            inventoryDensity: number;
            priceVolatility: number;
            demandScore: number;
            supplyScore: number;
            marketBalance: number;
            trendDirection: "up" | "down" | "stable";
            trendStrength: number;
        };
        heatmap: {
            type: "FeatureCollection";
            features: {
                type: "Feature";
                geometry: {
                    type: "Polygon";
                    coordinates: number[][][];
                };
                properties: {
                    id: string;
                    metadata: {
                        compsCount: number;
                        dataQuality: number;
                        lastUpdated: Date;
                        dataSources: string[];
                    };
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
                    kpis: {
                        psqmMedian: number;
                        psqmMean: number;
                        psqmStdDev: number;
                        absorptionDays: number;
                        inventoryCount: number;
                        inventoryDensity: number;
                        priceVolatility: number;
                        demandScore: number;
                        supplyScore: number;
                        marketBalance: number;
                        trendDirection: "up" | "down" | "stable";
                        trendStrength: number;
                    };
                };
            }[];
        };
        insights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        comps: {
            total: number;
            median: number;
            mean: number;
            stdDev: number;
            quartiles: [number, number, number, number];
        };
        omi: {
            confidence: number;
            lastUpdate: Date;
            zone: string;
            range: [number, number];
        };
    };
}>;
export declare const zMarketTrendReport: z.ZodObject<{
    id: z.ZodString;
    city: z.ZodString;
    asset: z.ZodEnum<["residential", "commercial", "industrial"]>;
    horizonMonths: z.ZodNumber;
    generatedAt: z.ZodDate;
    pdfUrl: z.ZodString;
    summary: z.ZodObject<{
        keyInsights: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["trend", "opportunity", "risk", "comparison"]>;
            title: z.ZodString;
            description: z.ZodString;
            confidence: z.ZodNumber;
            impact: z.ZodEnum<["high", "medium", "low"]>;
            dataPoints: z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                value: z.ZodNumber;
                change: z.ZodNumber;
                unit: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }, {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }>, "many">;
            recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }, {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }>, "many">;
        marketHealth: z.ZodEnum<["excellent", "good", "fair", "poor"]>;
        riskLevel: z.ZodEnum<["low", "medium", "high"]>;
        opportunities: z.ZodArray<z.ZodString, "many">;
        risks: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        keyInsights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        marketHealth: "excellent" | "good" | "fair" | "poor";
        riskLevel: "low" | "medium" | "high";
        opportunities: string[];
        risks: string[];
    }, {
        keyInsights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        marketHealth: "excellent" | "good" | "fair" | "poor";
        riskLevel: "low" | "medium" | "high";
        opportunities: string[];
        risks: string[];
    }>;
    charts: z.ZodObject<{
        priceTrend: z.ZodString;
        absorptionTrend: z.ZodString;
        inventoryTrend: z.ZodString;
        demandSupplyBalance: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        priceTrend: string;
        absorptionTrend: string;
        inventoryTrend: string;
        demandSupplyBalance: string;
    }, {
        priceTrend: string;
        absorptionTrend: string;
        inventoryTrend: string;
        demandSupplyBalance: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    summary: {
        keyInsights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        marketHealth: "excellent" | "good" | "fair" | "poor";
        riskLevel: "low" | "medium" | "high";
        opportunities: string[];
        risks: string[];
    };
    generatedAt: Date;
    city: string;
    asset: "residential" | "commercial" | "industrial";
    horizonMonths: number;
    pdfUrl: string;
    charts: {
        priceTrend: string;
        absorptionTrend: string;
        inventoryTrend: string;
        demandSupplyBalance: string;
    };
}, {
    id: string;
    summary: {
        keyInsights: {
            confidence: number;
            id: string;
            description: string;
            type: "trend" | "opportunity" | "risk" | "comparison";
            title: string;
            impact: "low" | "medium" | "high";
            dataPoints: {
                value: number;
                unit: string;
                metric: string;
                change: number;
            }[];
            recommendations?: string[] | undefined;
        }[];
        marketHealth: "excellent" | "good" | "fair" | "poor";
        riskLevel: "low" | "medium" | "high";
        opportunities: string[];
        risks: string[];
    };
    generatedAt: Date;
    city: string;
    asset: "residential" | "commercial" | "industrial";
    horizonMonths: number;
    pdfUrl: string;
    charts: {
        priceTrend: string;
        absorptionTrend: string;
        inventoryTrend: string;
        demandSupplyBalance: string;
    };
}>;
export declare const zMarketScanRequest: z.ZodObject<{
    city: z.ZodString;
    asset: z.ZodEnum<["residential", "commercial", "industrial", "mixed"]>;
    horizonMonths: z.ZodNumber;
    radiusKm: z.ZodOptional<z.ZodNumber>;
    includeHeatmap: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeInsights: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    forceRefresh: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    city: string;
    asset: "residential" | "commercial" | "mixed" | "industrial";
    horizonMonths: number;
    includeHeatmap: boolean;
    includeInsights: boolean;
    forceRefresh: boolean;
    radiusKm?: number | undefined;
}, {
    city: string;
    asset: "residential" | "commercial" | "mixed" | "industrial";
    horizonMonths: number;
    radiusKm?: number | undefined;
    includeHeatmap?: boolean | undefined;
    includeInsights?: boolean | undefined;
    forceRefresh?: boolean | undefined;
}>;
export declare const zCompsFetchRequest: z.ZodObject<{
    city: z.ZodString;
    radiusKm: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sampleSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    asset: z.ZodOptional<z.ZodEnum<["residential", "commercial", "industrial"]>>;
    priceRange: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    surfaceRange: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    city: string;
    radiusKm: number;
    sampleSize: number;
    surfaceRange?: [number, number] | undefined;
    priceRange?: [number, number] | undefined;
    asset?: "residential" | "commercial" | "industrial" | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
}, {
    city: string;
    surfaceRange?: [number, number] | undefined;
    priceRange?: [number, number] | undefined;
    asset?: "residential" | "commercial" | "industrial" | undefined;
    radiusKm?: number | undefined;
    sampleSize?: number | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
}>;
export type AssetType = 'residential' | 'commercial' | 'industrial' | 'mixed';
export type TrendDirection = 'up' | 'down' | 'stable';
export type InsightType = 'trend' | 'opportunity' | 'risk' | 'comparison';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type MarketHealth = 'excellent' | 'good' | 'fair' | 'poor';
export type RiskLevel = 'low' | 'medium' | 'high';
export declare const MARKET_CACHE_TTL: {
    OMI_DATA: number;
    COMPS_DATA: number;
    HEATMAP: number;
    TREND_ANALYSIS: number;
    SNAPSHOT: number;
};
export declare const HEATMAP_GRID_SIZE = 500;
export declare const DEFAULT_RADIUS_KM = 10;
export declare const DEFAULT_SAMPLE_SIZE = 100;
export declare const MAX_HORIZON_MONTHS = 60;
export declare const ITALIAN_CITIES: readonly ["Milano", "Roma", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania", "Venezia", "Verona", "Messina", "Padova", "Trieste", "Brescia", "Parma", "Taranto", "Prato", "Modena", "Reggio Calabria", "Reggio Emilia", "Perugia", "Livorno", "Ravenna", "Cagliari", "Foggia", "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Giugliano in Campania", "Monza", "Siracusa", "Bergamo", "Pescara", "Trento", "Forlì", "Vicenza", "Terni", "Bolzano", "Novara", "Piacenza", "Udine", "Ancona", "Andria", "Arezzo", "Cesena", "Lecce", "Pesaro", "Alessandria", "Barletta", "Asti", "Chieti", "La Spezia", "Pistoia", "Catanzaro", "Brindisi", "Grosseto", "Ragusa", "Frosinone", "Trapani", "Cremona", "Mantova", "Agrigento", "Caltanissetta", "Savona", "Vercelli", "Belluno", "Pordenone", "Sondrio", "Aosta", "Bolzano"];
export declare const ASSET_TYPES: {
    readonly RESIDENTIAL: "residential";
    readonly COMMERCIAL: "commercial";
    readonly INDUSTRIAL: "industrial";
    readonly MIXED: "mixed";
};
export declare const MARKET_HEALTH_THRESHOLDS: {
    readonly EXCELLENT: {
        readonly demandScore: 80;
        readonly supplyScore: 60;
        readonly marketBalance: 20;
    };
    readonly GOOD: {
        readonly demandScore: 60;
        readonly supplyScore: 40;
        readonly marketBalance: 10;
    };
    readonly FAIR: {
        readonly demandScore: 40;
        readonly supplyScore: 60;
        readonly marketBalance: -10;
    };
    readonly POOR: {
        readonly demandScore: 20;
        readonly supplyScore: 80;
        readonly marketBalance: -30;
    };
};
//# sourceMappingURL=market.d.ts.map