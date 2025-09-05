// Comps & OMI Integration - Urbanova AI
// Facade per l'integrazione di dati di mercato reali

import type { PriceRange, CompsStats, DataProvenance } from '@urbanova/types';
import { getFirestoreInstance, serverTimestamp } from '@urbanova/infra';

// ============================================================================
// OMI INTEGRATION
// ============================================================================

/**
 * Dati OMI per una zona specifica
 */
interface OMIData {
  zone: string;
  city: string;
  propertyType: string;
  priceRange: PriceRange;
  lastUpdated: Date;
  confidence: number;
  source: 'API' | 'CACHE' | 'FALLBACK';
}

/**
 * Configurazione OMI
 */
interface OMIConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  cacheTTL: number;
  retryAttempts: number;
}

/**
 * Servizio per l'integrazione OMI
 */
class OMIService {
  private config: OMIConfig;
  private cache: Map<string, { data: OMIData; timestamp: number }>;

  constructor() {
    this.config = {
      apiKey: process.env.OMI_API_KEY || '',
      baseUrl: process.env.OMI_BASE_URL || 'https://api.omi.it/v1',
      timeout: parseInt(process.env.OMI_TIMEOUT || '5000'),
      cacheTTL: parseInt(process.env.OMI_CACHE_TTL || '86400'), // 24 ore
      retryAttempts: parseInt(process.env.OMI_RETRY_ATTEMPTS || '3'),
    };
    this.cache = new Map();
  }

  /**
   * Ottiene i dati OMI per una zona specifica
   */
  async getOMIData(
    city: string,
    zone: string,
    propertyType: string = 'residential'
  ): Promise<OMIData> {
    const cacheKey = `${city}-${zone}-${propertyType}`;

    // Controlla cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTTL * 1000) {
      return {
        ...cached.data,
        source: 'CACHE' as const,
      };
    }

    try {
      // Chiamata API OMI
      const data = await this.fetchOMIFromAPI(city, zone, propertyType);

      // Salva in cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('❌ Error fetching OMI data:', error);

      // Fallback ai dati storici
      return this.getOMIFallback(city, zone, propertyType);
    }
  }

  /**
   * Chiamata API OMI reale
   */
  private async fetchOMIFromAPI(
    city: string,
    zone: string,
    propertyType: string
  ): Promise<OMIData> {
    const url = `${this.config.baseUrl}/prices?city=${encodeURIComponent(city)}&zone=${encodeURIComponent(zone)}&type=${encodeURIComponent(propertyType)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OMI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any; // Type assertion for API response

      return {
        zone,
        city,
        propertyType,
        priceRange: {
          min: data.priceRange?.min || 0,
          max: data.priceRange?.max || 0,
          median: data.priceRange?.median || 0,
          mean: data.priceRange?.mean || 0,
          stdDev: data.priceRange?.stdDev || 0,
          confidence: data.confidence || 0.8,
        } as PriceRange,
        lastUpdated: new Date(data.lastUpdated || Date.now()),
        confidence: data.confidence || 0.8,
        source: 'API' as const,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Fallback ai dati OMI storici
   */
  private getOMIFallback(city: string, zone: string, propertyType: string): OMIData {
    // Dati di fallback basati su medie storiche per città italiane
    const fallbackData: Record<string, { min: number; max: number; median: number }> = {
      Milano: { min: 3000, max: 8000, median: 5500 },
      Roma: { min: 2500, max: 6000, median: 4250 },
      Torino: { min: 1500, max: 4000, median: 2750 },
      Firenze: { min: 2000, max: 5000, median: 3500 },
      Bologna: { min: 1800, max: 4500, median: 3150 },
      Napoli: { min: 1200, max: 3500, median: 2350 },
    };

    const cityData = fallbackData[city] || fallbackData['Torino']!;

    return {
      zone,
      city,
      propertyType,
      priceRange: {
        ...cityData,
        mean: (cityData.min + cityData.max) / 2,
        stdDev: (cityData.max - cityData.min) / 4,
        confidence: 0.6, // Bassa confidenza per dati di fallback
      } as PriceRange,
      lastUpdated: new Date(),
      confidence: 0.6,
      source: 'FALLBACK' as const,
    };
  }
}

// ============================================================================
// INTERNAL COMPS INTEGRATION
// ============================================================================

/**
 * Comp interno normalizzato
 */
interface InternalComp {
  id: string;
  projectId: string;
  city: string;
  zone: string;
  propertyType: string;
  pricePerSqm: number;
  surface: number;
  rooms: number;
  energyClass?: string;
  completionDate: Date;
  saleDate: Date;
  salePrice: number;
  normalizedPrice: number; // Prezzo normalizzato per mq
  confidence: number;
  source: 'FIRESTORE' | 'CACHE';
}

/**
 * Servizio per i comps interni
 */
class InternalCompsService {
  private cache: Map<string, { data: InternalComp[]; timestamp: number }>;
  private cacheTTL: number;

  constructor() {
    this.cache = new Map();
    this.cacheTTL = parseInt(process.env.INTERNAL_COMPS_CACHE_TTL || '3600'); // 1 ora
  }

  /**
   * Ottiene i comps interni per una città e raggio
   */
  async getInternalComps(
    city: string,
    radius: number = 10,
    propertyType?: string,
    minConfidence: number = 0.7
  ): Promise<InternalComp[]> {
    const cacheKey = `${city}-${radius}-${propertyType || 'all'}-${minConfidence}`;

    // Controlla cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL * 1000) {
      return cached.data.map(comp => ({ ...comp, source: 'CACHE' as const }));
    }

    try {
      const comps = await this.fetchInternalCompsFromFirestore(
        city,
        radius,
        propertyType,
        minConfidence
      );

      // Salva in cache
      this.cache.set(cacheKey, {
        data: comps,
        timestamp: Date.now(),
      });

      return comps;
    } catch (error) {
      console.error('❌ Error fetching internal comps:', error);
      return [];
    }
  }

  /**
   * Recupera i comps da Firestore
   */
  private async fetchInternalCompsFromFirestore(
    city: string,
    radius: number,
    propertyType?: string,
    minConfidence: number = 0.7
  ): Promise<InternalComp[]> {
    const db = getFirestoreInstance();

    // Query per comps nella città specificata
    let query = db
      .collection('comps')
      .where('city', '==', city)
      .where('confidence', '>=', minConfidence)
      .orderBy('confidence', 'desc')
      .orderBy('completionDate', 'desc');

    if (propertyType) {
      query = query.where('propertyType', '==', propertyType);
    }

    const snapshot = await query.limit(100).get();
    const comps: InternalComp[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      comps.push({
        id: doc.id,
        projectId: data.projectId,
        city: data.city,
        zone: data.zone,
        propertyType: data.propertyType,
        pricePerSqm: data.pricePerSqm,
        surface: data.surface,
        rooms: data.rooms,
        energyClass: data.energyClass,
        completionDate: data.completionDate.toDate(),
        saleDate: data.saleDate.toDate(),
        salePrice: data.salePrice,
        normalizedPrice: data.normalizedPrice,
        confidence: data.confidence,
        source: 'FIRESTORE' as const,
      });
    });

    return comps;
  }

  /**
   * Calcola le statistiche dei comps con outlier filtering
   */
  calculateCompsStats(comps: InternalComp[], outlierThreshold: number = 0.1): CompsStats {
    if (comps.length === 0) {
      return {
        count: 0,
        p25: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        outliersRemoved: 0,
        confidence: 0,
      };
    }

    // Estrai prezzi normalizzati
    const prices = comps.map(c => c.normalizedPrice).sort((a, b) => a - b);

    // Calcola percentili
    const p25 = this.calculatePercentile(prices, 25);
    const p50 = this.calculatePercentile(prices, 50);
    const p75 = this.calculatePercentile(prices, 75);
    const p90 = this.calculatePercentile(prices, 90);

    // Outlier filtering
    const iqr = p75 - p25;
    const lowerBound = p25 - 1.5 * iqr;
    const upperBound = p75 + 1.5 * iqr;

    const filteredPrices = prices.filter(p => p >= lowerBound && p <= upperBound);
    const outliersRemoved = prices.length - filteredPrices.length;

    // Calcola confidenza basata su numero di comps e outlier ratio
    const outlierRatio = outliersRemoved / prices.length;
    const confidence = Math.max(
      0.1,
      Math.min(1.0, (filteredPrices.length / 10) * (1 - outlierRatio))
    );

    return {
      count: filteredPrices.length,
      p25: this.calculatePercentile(filteredPrices, 25),
      p50: this.calculatePercentile(filteredPrices, 50),
      p75: this.calculatePercentile(filteredPrices, 75),
      p90: this.calculatePercentile(filteredPrices, 90),
      outliersRemoved,
      confidence,
    };
  }

  /**
   * Calcola un percentile specifico
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]!;
    if (lower === upper) return sortedArray[lower]!;

    return sortedArray[lower]! * (1 - weight) + sortedArray[upper]! * weight;
  }
}

// ============================================================================
// MAIN FACADE
// ============================================================================

/**
 * Facade principale per l'integrazione Comps e OMI
 */
export class CompsOMIFacade {
  private omiService: OMIService;
  private internalCompsService: InternalCompsService;

  constructor() {
    this.omiService = new OMIService();
    this.internalCompsService = new InternalCompsService();
  }

  /**
   * Ottiene i dati OMI per una zona
   */
  async getOMI(
    city: string,
    zone: string,
    propertyType: string = 'residential'
  ): Promise<PriceRange> {
    const omiData = await this.omiService.getOMIData(city, zone, propertyType);
    return omiData.priceRange;
  }

  /**
   * Ottiene i comps interni per una città
   */
  async getInternalComps(
    city: string,
    radius: number = 10,
    propertyType?: string,
    minConfidence: number = 0.7
  ): Promise<InternalComp[]> {
    return this.internalCompsService.getInternalComps(city, radius, propertyType, minConfidence);
  }

  /**
   * Ottiene le statistiche dei comps con outlier filtering
   */
  async getCompsStats(
    city: string,
    radius: number = 10,
    propertyType?: string,
    outlierThreshold: number = 0.1
  ): Promise<CompsStats> {
    const comps = await this.getInternalComps(city, radius, propertyType);
    return this.internalCompsService.calculateCompsStats(comps, outlierThreshold);
  }

  /**
   * Ottiene dati completi per una zona (OMI + Internal)
   */
  async getZoneData(
    city: string,
    zone: string,
    propertyType: string = 'residential',
    radius: number = 10
  ): Promise<{
    omi: PriceRange;
    internal: CompsStats;
    provenance: {
      omi: DataProvenance;
      internal: DataProvenance;
    };
  }> {
    const [omiData, internalStats] = await Promise.all([
      this.omiService.getOMIData(city, zone, propertyType),
      this.getCompsStats(city, radius, propertyType),
    ]);

    return {
      omi: omiData.priceRange,
      internal: internalStats,
      provenance: {
        omi: {
          source: omiData.source,
          timestamp: omiData.lastUpdated,
          confidence: omiData.confidence,
          lastUpdated: omiData.lastUpdated,
          version: '1.0',
        },
        internal: {
          source: 'FIRESTORE',
          timestamp: new Date(),
          confidence: internalStats.confidence,
          lastUpdated: new Date(),
          version: '1.0',
        },
      },
    };
  }

  /**
   * Salva un nuovo comp in Firestore
   */
  async saveComp(comp: Omit<InternalComp, 'id' | 'source'>): Promise<string> {
    const db = getFirestoreInstance();

    const compData = {
      ...comp,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await db.collection('comps').add(compData);

    // Invalida cache
    (this.internalCompsService as any).cache.clear();

    console.log(`✅ Comp saved to Firestore: ${docRef.id}`);
    return docRef.id;
  }

  /**
   * Aggiorna un comp esistente
   */
  async updateComp(compId: string, updates: Partial<InternalComp>): Promise<void> {
    const db = getFirestoreInstance();

    await db
      .collection('comps')
      .doc(compId)
      .update({
        ...updates,
        updatedAt: serverTimestamp(),
      });

    // Invalida cache
    (this.internalCompsService as any).cache.clear();

    console.log(`✅ Comp updated in Firestore: ${compId}`);
  }

  /**
   * Elimina un comp
   */
  async deleteComp(compId: string): Promise<void> {
    const db = getFirestoreInstance();

    await db.collection('comps').doc(compId).delete();

    // Invalida cache
    (this.internalCompsService as any).cache.clear();

    console.log(`✅ Comp deleted from Firestore: ${compId}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { OMIData, InternalComp, PriceRange, CompsStats, DataProvenance };

export { OMIService, InternalCompsService };
