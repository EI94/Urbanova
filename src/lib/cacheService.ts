// Servizio di Caching per AI Land Scraping - Urbanova
import { LandSearchCriteria } from './realWebScraper';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface SearchCacheKey {
  location: string;
  priceRange: [number, number];
  areaRange: [number, number];
  hash: string;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minuti
  private readonly MAX_CACHE_SIZE = 100;

  private constructor() {
    // Pulisci cache ogni 5 minuti
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private generateSearchKey(criteria: LandSearchCriteria): string {
    const key: SearchCacheKey = {
      location: criteria.location || '',
      priceRange: criteria.priceRange || [0, 1000000],
      areaRange: criteria.areaRange || [500, 10000],
      hash: this.hashString(JSON.stringify(criteria))
    };
    return JSON.stringify(key);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  async get(criteria: LandSearchCriteria): Promise<any | null> {
    const key = this.generateSearchKey(criteria);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Controlla se è scaduto
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log('🎯 Cache hit per ricerca:', criteria.location);
    return entry.data;
  }

  async set(criteria: LandSearchCriteria, data: any, ttl?: number): Promise<void> {
    const key = this.generateSearchKey(criteria);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };

    // Gestione dimensione cache
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    console.log('💾 Risultati salvati in cache per:', criteria.location);
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log('🗑️ Rimossa entry più vecchia dalla cache');
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Pulizia cache: rimosse ${cleanedCount} entry scadute`);
    }
  }

  async invalidateByLocation(location: string): Promise<void> {
    let invalidatedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      try {
        const searchKey: SearchCacheKey = JSON.parse(key);
        if (searchKey.location.toLowerCase().includes(location.toLowerCase())) {
          this.cache.delete(key);
          invalidatedCount++;
        }
      } catch (error) {
        // Ignora chiavi non valide
      }
    }

    if (invalidatedCount > 0) {
      console.log(`🔄 Cache invalidata per ${location}: rimosse ${invalidatedCount} entry`);
    }
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // Placeholder - implementare tracking reale
    };
  }

  clear(): void {
    this.cache.clear();
    console.log('🧹 Cache completamente svuotata');
  }
}

export const cacheService = CacheService.getInstance(); 