/**
 * 🧠 RESPONSE CACHE - Sistema di caching intelligente per OS 2.0
 * 
 * Implementa LRU (Least Recently Used) cache con:
 * - TTL (Time To Live) configurabile
 * - Similarity matching per query simili
 * - Auto-cleanup per memoria
 * - Metriche dettagliate
 */

interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  hitCount: number;
  lastAccessTime: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

export class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTTL: number;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };

  constructor(
    maxSize: number = 1000,
    defaultTTL: number = 3600000 // 1 ora default
  ) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Auto-cleanup ogni 5 minuti
    setInterval(() => this.cleanup(), 300000);
    
    console.log(`💾 [ResponseCache] Inizializzato: maxSize=${maxSize}, TTL=${defaultTTL}ms`);
  }

  /**
   * Ottieni valore dalla cache
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry scaduta
      this.cache.delete(key);
      this.metrics.misses++;
      this.metrics.evictions++;
      this.updateHitRate();
      return null;
    }

    // Cache hit
    entry.hitCount++;
    entry.lastAccessTime = now;
    this.metrics.hits++;
    this.updateHitRate();
    
    console.log(`✅ [ResponseCache] HIT: ${key} (hitCount: ${entry.hitCount})`);
    return entry.value;
  }

  /**
   * Salva valore in cache
   */
  set(key: string, value: any, ttl?: number): void {
    // Se cache piena, rimuovi LRU
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hitCount: 0,
      lastAccessTime: Date.now(),
    };

    this.cache.set(key, entry);
    this.metrics.size = this.cache.size;
    
    console.log(`💾 [ResponseCache] SET: ${key} (size: ${this.cache.size}/${this.maxSize})`);
  }

  /**
   * Genera chiave di cache normalizzata
   */
  generateKey(userMessage: string, context?: Record<string, any>): string {
    // Normalizza messaggio
    const normalized = userMessage
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');

    // Aggiungi context se presente
    const contextKey = context 
      ? JSON.stringify(Object.entries(context).sort())
      : '';

    return `${normalized}:${contextKey}`;
  }

  /**
   * Cerca entry simili (fuzzy matching)
   */
  findSimilar(userMessage: string, threshold: number = 0.8): any | null {
    const normalized = userMessage.toLowerCase().trim();
    
    for (const [key, entry] of this.cache.entries()) {
      const cachedMessage = key.split(':')[0];
      const similarity = this.calculateSimilarity(normalized, cachedMessage);
      
      if (similarity >= threshold) {
        console.log(`🎯 [ResponseCache] SIMILAR MATCH: ${similarity.toFixed(2)} similarity`);
        entry.hitCount++;
        entry.lastAccessTime = Date.now();
        this.metrics.hits++;
        this.updateHitRate();
        return entry.value;
      }
    }

    this.metrics.misses++;
    this.updateHitRate();
    return null;
  }

  /**
   * Calcola similarità tra due stringhe (Levenshtein ratio)
   */
  private calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calcola Levenshtein distance
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[s2.length][s1.length];
  }

  /**
   * Rimuovi entry LRU (Least Recently Used)
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessTime < lruTime) {
        lruTime = entry.lastAccessTime;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.metrics.evictions++;
      console.log(`🗑️ [ResponseCache] LRU evicted: ${lruKey}`);
    }
  }

  /**
   * Cleanup entry scadute
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.metrics.evictions += cleaned;
      this.metrics.size = this.cache.size;
      console.log(`🧹 [ResponseCache] Cleanup: ${cleaned} entry rimosse`);
    }
  }

  /**
   * Aggiorna hit rate
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
  }

  /**
   * Ottieni metriche cache
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset cache
   */
  clear(): void {
    this.cache.clear();
    this.metrics.size = 0;
    console.log(`🗑️ [ResponseCache] Cache cleared`);
  }

  /**
   * Ottieni dimensione cache
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Factory per cache specializzate
 */
export class CacheFactory {
  private static caches = new Map<string, ResponseCache>();

  /**
   * Ottieni o crea cache
   */
  static getOrCreate(name: string, maxSize?: number, ttl?: number): ResponseCache {
    if (!this.caches.has(name)) {
      this.caches.set(name, new ResponseCache(maxSize, ttl));
    }
    return this.caches.get(name)!;
  }

  /**
   * Cache per risposte conversazionali
   */
  static conversation(): ResponseCache {
    return this.getOrCreate('conversation', 500, 1800000); // 30min TTL
  }

  /**
   * Cache per tool results
   */
  static toolResults(): ResponseCache {
    return this.getOrCreate('tool-results', 200, 600000); // 10min TTL
  }

  /**
   * Cache per pattern matching
   */
  static patterns(): ResponseCache {
    return this.getOrCreate('patterns', 1000, 3600000); // 1h TTL
  }

  /**
   * Ottieni tutte le cache
   */
  static getAll(): Map<string, ResponseCache> {
    return this.caches;
  }

  /**
   * Ottieni metriche aggregate
   */
  static getAggregateMetrics(): Record<string, CacheMetrics> {
    const metrics: Record<string, CacheMetrics> = {};
    
    for (const [name, cache] of this.caches.entries()) {
      metrics[name] = cache.getMetrics();
    }
    
    return metrics;
  }
}

