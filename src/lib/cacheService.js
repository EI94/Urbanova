'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.cacheService = exports.CacheService = void 0;
class CacheService {
  constructor() {
    this.cache = new Map();
    this.DEFAULT_TTL = 30 * 60 * 1000; // 30 minuti
    this.MAX_CACHE_SIZE = 100;
    // Pulisci cache ogni 5 minuti
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  static getInstance() {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }
  generateSearchKey(criteria) {
    const key = {
      location: criteria.location || '',
      priceRange: criteria.priceRange || [0, 1000000],
      areaRange: criteria.areaRange || [500, 10000],
      hash: this.hashString(JSON.stringify(criteria)),
    };
    return JSON.stringify(key);
  }
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  async get(criteria) {
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
  async set(criteria, data, ttl) {
    const key = this.generateSearchKey(criteria);
    const entry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    };
    // Gestione dimensione cache
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    this.cache.set(key, entry);
    console.log('💾 Risultati salvati in cache per:', criteria.location);
  }
  evictOldest() {
    let oldestKey = null;
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
  cleanup() {
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
  async invalidateByLocation(location) {
    let invalidatedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      try {
        const searchKey = JSON.parse(key);
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
  getStats() {
    return {
      size: this.cache.size,
      hitRate: 0.85, // Placeholder - implementare tracking reale
    };
  }
  clear() {
    this.cache.clear();
    console.log('🧹 Cache completamente svuotata');
  }
}
exports.CacheService = CacheService;
exports.cacheService = CacheService.getInstance();
//# sourceMappingURL=cacheService.js.map
