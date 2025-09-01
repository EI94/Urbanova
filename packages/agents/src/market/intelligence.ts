// import {
//   MarketKPIs,
//   HeatmapCell,
//   MarketInsight,
//   MarketSnapshot,
//   MarketScanRequest,
//   CompsFetchRequest,
//   zMarketScanRequest,
//   zCompsFetchRequest,
//   zMarketSnapshot,
//   HEATMAP_GRID_SIZE,
//   MARKET_CACHE_TTL,
//   ITALIAN_CITIES,
//   ASSET_TYPES,
//   MARKET_HEALTH_THRESHOLDS,
// } from '@urbanova/types';

// Temporary type definitions and constants
interface MarketKPIs {
  psqmMedian: number;
  psqmMean: number;
  psqmStdDev: number;
  absorptionDays: number;
  priceVolatility: number;
  demandScore: number;
  supplyScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: number;
  marketBalance: number;
  inventoryCount: number;
  inventoryDensity: number;
}

interface HeatmapCell {
  lat: number;
  lng: number;
  value: number;
  color: string;
}

interface MarketInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  type: 'trend' | 'opportunity' | 'risk' | 'balance' | 'volatility';
  confidence: number;
  dataPoints?: any[];
  recommendations?: string[];
}

interface MarketSnapshot {
  id: string;
  city: string;
  asset: string;
  horizonMonths: number;
  kpis: MarketKPIs;
  insights: MarketInsight[];
  heatmapCells: number;
  cacheHit: boolean;
  timestamp: string;
  data: any;
  metadata: {
    generationTime: number;
    dataQuality: number;
    coverage: number;
    dataSources?: string[];
    cacheHit?: boolean;
  };
}

interface MarketScanRequest {
  city: string;
  asset: string;
  horizonMonths: number;
  radiusKm?: number;
  includeHeatmap?: boolean;
  includeInsights?: boolean;
  forceRefresh?: boolean;
}

interface CompsFetchRequest {
  city: string;
  radiusKm?: number;
  sampleSize?: number;
}

const HEATMAP_GRID_SIZE = 500;
const MARKET_CACHE_TTL = {
  HEATMAP: 3600000, // 1 hour
  COMPS: 1800000,   // 30 minutes
  SNAPSHOT: 7200000 // 2 hours
};
const ITALIAN_CITIES = ['Milano', 'Roma', 'Napoli', 'Torino', 'Bologna'];
const ASSET_TYPES = ['residential', 'commercial', 'industrial'];
const MARKET_HEALTH_THRESHOLDS = { excellent: 80, good: 60, fair: 40 };
// import { CompsOMIFacade } from '@urbanova/data';
// import {
//   persistMarketSnapshot,
//   getMarketSnapshot,
//   listMarketSnapshotsByCity,
//   getMarketSnapshotByKey,
// } from '@urbanova/data';

export class MarketIntelligenceService {
  // private compsFacade: CompsOMIFacade;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    // this.compsFacade = new CompsOMIFacade();
    this.cache = new Map();
  }

  /**
   * Scansiona il mercato di una città e genera KPIs + heatmap
   */
  async scanCity(request: MarketScanRequest): Promise<{
    snapshot: MarketSnapshot;
    insights: MarketInsight[];
    cacheHit: boolean;
  }> {
    // Mock validation - in production would use zMarketScanRequest.parse(request)
    const validated = request;
    const startTime = Date.now();

    // Verifica cache
    const cacheKey = this.generateCacheKey(validated);
    const cached = this.getFromCache(cacheKey);

    if (cached && !validated.forceRefresh) {
      return {
        snapshot: cached.data,
        insights: cached.data.data.insights,
        cacheHit: true,
      };
    }

    try {
      // Recupera dati OMI
      const omiData = await this.getOMIData(validated.city, validated.asset);

      // Recupera comps
      const compsData = await this.getCompsData(validated.city, validated.radiusKm || 10);

      // Calcola KPIs
      const kpis = await this.calculateKPIs(compsData, omiData, validated.horizonMonths);

      // Genera heatmap se richiesto
      const heatmap = validated.includeHeatmap
        ? await this.generateHeatmap(validated.city, compsData, omiData)
        : this.createEmptyHeatmap();

      // Genera insights
      const insights = validated.includeInsights
        ? await this.generateInsights(kpis, compsData, omiData, validated.city)
        : [];

      // Crea snapshot
      const snapshot: MarketSnapshot = {
        id: `${validated.city}_${validated.asset}_${validated.horizonMonths}_${Date.now()}`,
        city: validated.city,
        asset: validated.asset,
        horizonMonths: validated.horizonMonths,
        timestamp: new Date().toISOString(),
        kpis,
        insights,
        heatmapCells: heatmap.features?.length || 0,
        cacheHit: false,
        data: {
          kpis,
          heatmap,
          insights,
          comps: {
            total: compsData.internal.count,
            median: compsData.internal.p50,
            mean: compsData.internal.mean || compsData.internal.p50,
            stdDev: compsData.internal.stdDev || 0,
            quartiles: [
              compsData.internal.p25,
              compsData.internal.p50,
              compsData.internal.p75,
              compsData.internal.p90,
            ],
          },
          omi: {
            zone: omiData.zone || 'Unknown',
            range: omiData.range || [0, 0],
            confidence: omiData.confidence || 0,
            lastUpdate: new Date(),
          },
        },
        metadata: {
          dataSources: ['omi', 'internal_comps'],
          cacheHit: false,
          generationTime: Date.now() - startTime,
          dataQuality: this.calculateDataQuality(compsData, omiData),
          coverage: this.calculateCoverage(compsData, validated.city),
        },
      };

      // Salva snapshot
      // Mock persistence - in production would call persistMarketSnapshot(snapshot)
      console.log('Persisting market snapshot:', snapshot.id);

      // Aggiorna cache
      this.setCache(cacheKey, snapshot);

      return {
        snapshot,
        insights,
        cacheHit: false,
      };
    } catch (error) {
      console.error('Error scanning city:', error);
      throw new Error(
        `Market scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Recupera dati OMI per città e asset
   */
  private async getOMIData(
    city: string,
    asset: string
  ): Promise<{
    zone: string;
    range: [number, number];
    confidence: number;
  }> {
    try {
      // Mappa asset type a zone OMI
      const zone = this.mapAssetToZone(asset);
      // Mock OMI data - in production would use this.compsFacade.getCompsData(city, zone, 1000)
      const omiData = { 
        median: 2500, 
        count: 50,
        omi: {
          zone: zone,
          range: [2000, 3000],
          confidence: 0.8
        }
      };

      return {
        zone: omiData.omi?.zone || zone,
        range: (omiData.omi?.range as [number, number]) || [0, 0],
        confidence: omiData.omi?.confidence || 0.5,
      };
    } catch (error) {
      console.error('Error getting OMI data:', error);
      return {
        zone: 'Unknown',
        range: [0, 0],
        confidence: 0,
      };
    }
  }

  /**
   * Recupera dati comps per città
   */
  private async getCompsData(city: string, radiusKm: number): Promise<any> {
    try {
      // Mock comps data - in production would use this.compsFacade.getCompsData(city, 'Centro', radiusKm * 1000)
      return {
        total: 25,
        median: 2800,
        mean: 2750,
        stdDev: 400,
        p25: 2400,
        p50: 2800,
        p75: 3100,
        p90: 3400
      };
    } catch (error) {
      console.error('Error getting comps data:', error);
      return {
        internal: { count: 0, p50: 0, mean: 0, stdDev: 0 },
        omi: null,
      };
    }
  }

  /**
   * Calcola KPIs dal mercato
   */
  private async calculateKPIs(
    compsData: any,
    omiData: any,
    horizonMonths: number
  ): Promise<MarketKPIs> {
    const psqmValues = this.extractPSQMValues(compsData);

    const psqmMedian = this.calculateMedian(psqmValues);
    const psqmMean = this.calculateMean(psqmValues);
    const psqmStdDev = this.calculateStdDev(psqmValues, psqmMean);

    const absorptionDays = this.calculateAbsorptionDays(compsData, horizonMonths);
    const inventoryCount = compsData.internal.count || 0;
    const inventoryDensity = this.calculateInventoryDensity(
      inventoryCount,
      compsData.city || 'Unknown'
    );

    const priceVolatility = psqmStdDev / psqmMean;
    const demandScore = this.calculateDemandScore(compsData, omiData);
    const supplyScore = this.calculateSupplyScore(inventoryCount, absorptionDays);
    const marketBalance = demandScore - supplyScore;

    const trendDirection = this.calculateTrendDirection(compsData, omiData);
    const trendStrength = this.calculateTrendStrength(compsData, omiData);

    return {
      psqmMedian,
      psqmMean,
      psqmStdDev,
      absorptionDays,
      inventoryCount,
      inventoryDensity,
      priceVolatility,
      demandScore,
      supplyScore,
      marketBalance,
      trendDirection,
      trendStrength,
    };
  }

  /**
   * Genera heatmap per la città
   */
  private async generateHeatmap(city: string, compsData: any, omiData: any): Promise<any> {
    // Genera griglia 500m x 500m per la città
    const cityBounds = this.getCityBounds(city);
    const grid = this.generateGrid(cityBounds, HEATMAP_GRID_SIZE);

    const features = grid.map(cell => {
      const cellKPIs = this.calculateCellKPIs(cell, compsData, omiData);

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [cell.bounds.west, cell.bounds.south],
              [cell.bounds.east, cell.bounds.south],
              [cell.bounds.east, cell.bounds.north],
              [cell.bounds.west, cell.bounds.north],
              [cell.bounds.west, cell.bounds.south],
            ],
          ],
        },
        properties: {
          id: `cell_${cell.lat}_${cell.lng}`,
          coordinates: {
            lat: cell.lat,
            lng: cell.lng,
            bounds: cell.bounds,
          },
          kpis: cellKPIs,
          metadata: {
            compsCount: this.countCompsInCell(cell, compsData),
            dataQuality: this.calculateCellDataQuality(cell, compsData),
            lastUpdated: new Date(),
            dataSources: ['internal_comps', 'omi'],
          },
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Genera insights dal mercato
   */
  private async generateInsights(
    kpis: MarketKPIs,
    compsData: any,
    omiData: any,
    city: string
  ): Promise<MarketInsight[]> {
    const insights: MarketInsight[] = [];

    // Insight 1: Trend prezzi
    if (kpis.trendDirection !== 'stable') {
      insights.push({
        id: `trend_${Date.now()}_1`,
        type: 'trend',
        category: 'pricing',
        title: `Prezzi in ${kpis.trendDirection === 'up' ? 'aumento' : 'diminuzione'}`,
        description: `I prezzi al metro quadro mostrano una tendenza ${kpis.trendDirection === 'up' ? 'positiva' : 'negativa'} con una forza del ${kpis.trendStrength}%.`,
        confidence: Math.min(kpis.trendStrength / 100, 0.95),
        impact: kpis.trendStrength > 50 ? 'high' : 'medium',
        dataPoints: [
          {
            metric: 'Prezzo mediano',
            value: kpis.psqmMedian,
            change: kpis.trendStrength,
            unit: '€/m²',
          },
        ],
        recommendations: [
          kpis.trendDirection === 'up'
            ? 'Considerare investimenti a lungo termine'
            : 'Valutare opportunità di acquisto',
          "Monitorare l'evoluzione del mercato nei prossimi mesi",
        ],
      });
    }

    // Insight 2: Domanda vs Offerta
    if (Math.abs(kpis.marketBalance) > 20) {
      insights.push({
        id: `balance_${Date.now()}_2`,
        type: kpis.marketBalance > 0 ? 'opportunity' : 'risk',
        category: 'market_balance',
        title:
          kpis.marketBalance > 0
            ? 'Mercato favorevole alla vendita'
            : "Mercato favorevole all'acquisto",
        description: `Il mercato mostra un ${kpis.marketBalance > 0 ? 'eccesso di domanda' : 'eccesso di offerta'} con un punteggio di ${Math.abs(kpis.marketBalance)}.`,
        confidence: 0.8,
        impact: Math.abs(kpis.marketBalance) > 40 ? 'high' : 'medium',
        dataPoints: [
          {
            metric: 'Punteggio domanda',
            value: kpis.demandScore,
            change: 0,
            unit: '0-100',
          },
          {
            metric: 'Punteggio offerta',
            value: kpis.supplyScore,
            change: 0,
            unit: '0-100',
          },
        ],
        recommendations: [
          kpis.marketBalance > 0
            ? 'Accelerare le vendite per sfruttare la domanda'
            : 'Valutare opportunità di acquisto',
          "Monitorare l'evoluzione dell'inventario",
        ],
      });
    }

    // Insight 3: Volatilità prezzi
    if (kpis.priceVolatility > 0.3) {
      insights.push({
        id: `volatility_${Date.now()}_3`,
        type: 'risk',
        category: 'volatility',
        title: 'Alta volatilità dei prezzi',
        description: `I prezzi mostrano una volatilità del ${(kpis.priceVolatility * 100).toFixed(1)}%, indicando un mercato instabile.`,
        confidence: 0.7,
        impact: 'medium',
        dataPoints: [
          {
            metric: 'Volatilità prezzi',
            value: kpis.priceVolatility * 100,
            change: 0,
            unit: '%',
          },
        ],
        recommendations: [
          "Approfondire l'analisi delle cause della volatilità",
          'Considerare strategie di pricing conservative',
        ],
      });
    }

    return insights;
  }

  /**
   * Utility functions
   */
  private generateCacheKey(request: MarketScanRequest): string {
    return `${request.city}_${request.asset}_${request.horizonMonths}`;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < MARKET_CACHE_TTL.HEATMAP) {
      return cached;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private mapAssetToZone(asset: string): string {
    switch (asset) {
      case 'residential':
        return 'Residenziale';
      case 'commercial':
        return 'Commerciale';
      case 'industrial':
        return 'Industriale';
      default:
        return 'Misto';
    }
  }

  private extractPSQMValues(compsData: any): number[] {
    // Simula estrazione prezzi da comps
    const basePrice = compsData.internal.p50 || 2500;
    const count = compsData.internal.count || 50;

    return Array.from({ length: count }, () => basePrice + (Math.random() - 0.5) * basePrice * 0.3);
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2 : (sorted[mid] ?? 0);
  }

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateAbsorptionDays(compsData: any, horizonMonths: number): number {
    // Simula calcolo tempo di vendita
    const baseDays = 90; // 3 mesi base
    const inventoryFactor = Math.max(1, ((compsData?.internal?.count ?? 50) / 100));
    return Math.round(baseDays * inventoryFactor);
  }

  private calculateInventoryDensity(count: number, city: string): number {
    // Simula densità inventario per km²
    const cityArea = this.getCityArea(city);
    return count / cityArea;
  }

  private calculateDemandScore(compsData: any, omiData: any): number {
    // Simula punteggio domanda basato su vari fattori
    const baseScore = 50;
    const omiFactor = omiData?.confidence ?? 0.5;
    const compsFactor = Math.min(1, ((compsData?.internal?.count ?? 0) / 100));

    return Math.min(100, Math.max(0, baseScore + omiFactor * 30 + compsFactor * 20));
  }

  private calculateSupplyScore(count: number, absorptionDays: number): number {
    // Simula punteggio offerta
    const inventoryFactor = Math.min(1, count / 100);
    const absorptionFactor = Math.max(0, 1 - absorptionDays / 365);

    return Math.min(100, Math.max(0, inventoryFactor * 60 + absorptionFactor * 40));
  }

  private calculateTrendDirection(compsData: any, omiData: any): 'up' | 'down' | 'stable' {
    // Simula direzione trend
    const random = Math.random();
    if (random > 0.6) return 'up';
    if (random < 0.4) return 'down';
    return 'stable';
  }

  private calculateTrendStrength(compsData: any, omiData: any): number {
    // Simula forza trend
    return Math.random() * 100;
  }

  private getCityBounds(city: string): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    // Bounds approssimativi per città italiane
    const bounds = {
      Milano: { north: 45.5, south: 45.4, east: 9.3, west: 9.1 },
      Roma: { north: 41.9, south: 41.8, east: 12.6, west: 12.4 },
      Napoli: { north: 40.9, south: 40.8, east: 14.3, west: 14.1 },
      Torino: { north: 45.1, south: 45.0, east: 7.8, west: 7.6 },
      Bologna: { north: 44.5, south: 44.4, east: 11.4, west: 11.2 },
    };

    return (
      bounds[city as keyof typeof bounds] || { north: 45.0, south: 44.9, east: 10.0, west: 9.8 }
    );
  }

  private getCityArea(city: string): number {
    // Aree approssimative in km²
    const areas = {
      Milano: 181,
      Roma: 1285,
      Napoli: 119,
      Torino: 130,
      Bologna: 140,
    };

    return areas[city as keyof typeof areas] || 100;
  }

  private generateGrid(bounds: any, gridSize: number): any[] {
    const cells = [];
    const latStep = gridSize / 111000; // circa 111km per grado lat
    const lngStep = gridSize / (111000 * Math.cos((bounds.north * Math.PI) / 180));

    for (let lat = bounds.south; lat < bounds.north; lat += latStep) {
      for (let lng = bounds.west; lng < bounds.east; lng += lngStep) {
        cells.push({
          lat: lat + latStep / 2,
          lng: lng + lngStep / 2,
          bounds: {
            north: lat + latStep,
            south: lat,
            east: lng + lngStep,
            west: lng,
          },
        });
      }
    }

    return cells;
  }

  private calculateCellKPIs(cell: any, compsData: any, omiData: any): MarketKPIs {
    // Simula KPIs per cella
    const basePrice = omiData.range[0] + (omiData.range[1] - omiData.range[0]) * Math.random();

    return {
      psqmMedian: basePrice,
      psqmMean: basePrice * (1 + (Math.random() - 0.5) * 0.1),
      psqmStdDev: basePrice * 0.15,
      absorptionDays: 60 + Math.random() * 120,
      inventoryCount: Math.floor(Math.random() * 20),
      inventoryDensity: Math.random() * 10,
      priceVolatility: Math.random() * 0.5,
      demandScore: Math.random() * 100,
      supplyScore: Math.random() * 100,
      marketBalance: (Math.random() - 0.5) * 100,
      trendDirection: Math.random() > 0.5 ? 'up' : 'down',
      trendStrength: Math.random() * 100,
    };
  }

  private countCompsInCell(cell: any, compsData: any): number {
    // Simula conteggio comps nella cella
    return Math.floor(Math.random() * 10);
  }

  private calculateCellDataQuality(cell: any, compsData: any): number {
    // Simula qualità dati per cella
    return 0.5 + Math.random() * 0.5;
  }

  private calculateDataQuality(compsData: any, omiData: any): number {
    const compsQuality = Math.min(1, (compsData.internal.count || 0) / 100);
    const omiQuality = omiData.confidence || 0.5;

    return (compsQuality + omiQuality) / 2;
  }

  private calculateCoverage(compsData: any, city: string): number {
    const cityArea = this.getCityArea(city);
    const compsCount = compsData.internal.count || 0;

    return Math.min(100, (compsCount / cityArea) * 100);
  }

  private createEmptyHeatmap(): any {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
}
