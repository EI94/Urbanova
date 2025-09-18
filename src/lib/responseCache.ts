/**
 * 🚀 RESPONSE CACHE INTELLIGENTE
 * 
 * Sistema di caching avanzato per ottimizzare performance:
 * - Cache risposte OpenAI per query simili
 * - Cache metadata Urbanova OS
 * - Cache intelligente con TTL dinamico
 * - Cache invalidation automatica
 */

// 🛡️ OS PROTECTION - Importa protezione CSS per response cache
import '@/lib/osProtection';

interface CacheEntry {
  response: string;
  metadata: any;
  timestamp: number;
  ttl: number;
  hitCount: number;
  queryHash: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    hitRate: 0
  };
  
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly DEFAULT_TTL = 300000; // 5 minuti
  private readonly CLEANUP_INTERVAL = 60000; // 1 minuto

  constructor() {
    // Cleanup automatico ogni minuto
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
    
    console.log('🚀 [ResponseCache] Cache intelligente inizializzato');
  }

  /**
   * Genera hash intelligente per query simili
   */
  private generateQueryHash(message: string, context: any): string {
    // Normalizza il messaggio per query simili
    const normalizedMessage = message
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Rimuovi punteggiatura
      .replace(/\s+/g, ' ') // Normalizza spazi
      .trim();
    
    // Estrai parole chiave principali
    const keywords = normalizedMessage
      .split(' ')
      .filter(word => word.length > 3) // Solo parole significative
      .slice(0, 10) // Prime 10 parole chiave
      .sort()
      .join('_');
    
    // Aggiungi contesto se disponibile
    const contextKey = context?.userId ? `user_${context.userId}` : 'anonymous';
    
    return `${contextKey}_${keywords}`;
  }

  /**
   * 🚀 CACHING AGGRESSIVO: Pre-cache per query comuni
   */
  async preCacheCommonQueries(): Promise<void> {
    const commonQueries = [
      'Ciao, cosa posso fare con te?',
      'Come posso esportare i miei progetti?',
      'Il sistema è lento oggi',
      'Voglio fare un\'analisi di fattibilità',
      'Mi serve un\'analisi di mercato',
      'Ho bisogno di progettare un edificio',
      'Cerco terreni edificabili',
      'Devo creare un business plan'
    ];

    console.log('🚀 [ResponseCache] Pre-caching query comuni...');
    
    for (const query of commonQueries) {
      const hash = this.generateQueryHash(query, {});
      if (!this.cache.has(hash)) {
        // Simula una risposta comune per pre-cache
        const commonResponse = this.generateCommonResponse(query);
        this.cache.set(hash, {
          response: commonResponse,
          metadata: { preCached: true, timestamp: Date.now() },
          timestamp: Date.now(),
          ttl: this.DEFAULT_TTL * 2, // Cache più a lungo per query comuni
          hitCount: 0,
          queryHash: hash
        });
      }
    }
    
    console.log(`✅ [ResponseCache] Pre-cached ${commonQueries.length} query comuni`);
  }

  /**
   * Genera risposta comune per pre-cache
   */
  private generateCommonResponse(query: string): string {
    const responses: Record<string, string> = {
      'Ciao, cosa posso fare con te?': 'Ciao! Sono Urbanova, la piattaforma avanzata per la gestione immobiliare e sviluppo di progetti smart city. Posso aiutarti con analisi di fattibilità, market intelligence, progettazione architettonica, gestione progetti, permessi e compliance, business plan e molto altro. Cosa ti serve?',
      'Come posso esportare i miei progetti?': 'Per esportare i tuoi progetti, accedi alla sezione "I Miei Progetti" nel dashboard, seleziona il progetto che desideri esportare e clicca sul pulsante "Esporta". Potrai scegliere tra diversi formati (PDF, Excel, CSV) e personalizzare i dati da includere.',
      'Il sistema è lento oggi': 'Mi dispiace per l\'inconveniente. Ti consiglio di verificare la tua connessione internet e chiudere eventuali applicazioni non necessarie. Se il problema persiste, contatta il supporto tecnico per assistenza specifica.',
      'Voglio fare un\'analisi di fattibilità': 'Per avviare un\'analisi di fattibilità, accedi alla sezione "Analisi di Fattibilità" e clicca su "Nuova Analisi". Ti guiderò attraverso tutti i passaggi necessari per valutare la fattibilità del tuo progetto immobiliare.',
      'Mi serve un\'analisi di mercato': 'Per eseguire un\'analisi di mercato, vai nella sezione "Market Intelligence" e seleziona la zona di interesse. Ti fornirò dati aggiornati su prezzi, trend, domanda e offerta del mercato immobiliare.',
      'Ho bisogno di progettare un edificio': 'Per progettare un edificio, accedi al "Design Center" dove troverai strumenti avanzati per la progettazione architettonica, rendering 3D e ottimizzazione degli spazi.',
      'Cerco terreni edificabili': 'Per cercare terreni edificabili, utilizza la funzione "Scansione Terreni" che ti permetterà di identificare opportunità di investimento basate sui tuoi criteri specifici.',
      'Devo creare un business plan': 'Per creare un business plan, vai nella sezione "Business Plan" dove potrai sviluppare piani finanziari dettagliati, proiezioni e analisi di sostenibilità per il tuo progetto.'
    };
    
    return responses[query] || 'Posso aiutarti con la gestione immobiliare e lo sviluppo di progetti smart city. Dimmi di più su quello che ti serve!';
  }

  /**
   * Calcola TTL dinamico basato su complessità query
   */
  private calculateTTL(message: string, context: any): number {
    const baseTTL = this.DEFAULT_TTL;
    
    // Query semplici: cache più a lungo
    if (message.length < 50) {
      return baseTTL * 2; // 10 minuti
    }
    
    // Query con dati specifici: cache meno
    if (context?.userId && message.includes('progetto')) {
      return baseTTL / 2; // 2.5 minuti
    }
    
    // Query generiche: cache normale
    return baseTTL;
  }

  /**
   * Ottieni risposta dalla cache
   */
  get(message: string, context: any): { response: string; metadata: any } | null {
    const queryHash = this.generateQueryHash(message, context);
    const entry = this.cache.get(queryHash);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Controlla se è scaduto
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(queryHash);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Aggiorna statistiche
    entry.hitCount++;
    this.stats.hits++;
    this.updateHitRate();
    
    console.log(`🎯 [ResponseCache] Cache HIT per query: ${message.substring(0, 50)}...`);
    
    return {
      response: entry.response,
      metadata: entry.metadata
    };
  }

  /**
   * Salva risposta nella cache
   */
  set(message: string, context: any, response: string, metadata: any): void {
    const queryHash = this.generateQueryHash(message, context);
    const ttl = this.calculateTTL(message, context);
    
    // Controlla dimensione cache
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry = {
      response,
      metadata,
      timestamp: Date.now(),
      ttl,
      hitCount: 0,
      queryHash
    };
    
    this.cache.set(queryHash, entry);
    
    console.log(`💾 [ResponseCache] Cache SET per query: ${message.substring(0, 50)}... (TTL: ${ttl}ms)`);
  }

  /**
   * Rimuovi entry meno utilizzate
   */
  private evictLeastUsed(): void {
    let leastUsed: string | null = null;
    let minHits = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount < minHits) {
        minHits = entry.hitCount;
        leastUsed = key;
      }
    }
    
    if (leastUsed) {
      this.cache.delete(leastUsed);
      this.stats.evictions++;
      console.log(`🗑️ [ResponseCache] Evicted entry: ${leastUsed}`);
    }
  }

  /**
   * Cleanup automatico entry scadute
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
      console.log(`🧹 [ResponseCache] Cleanup: ${cleaned} entry scadute rimosse`);
    }
  }

  /**
   * Aggiorna hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Ottieni statistiche cache
   */
  getStats(): CacheStats & { size: number } {
    return {
      ...this.stats,
      size: this.cache.size
    };
  }

  /**
   * Invalida cache per utente specifico
   */
  invalidateUser(userId: string): void {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.queryHash.startsWith(`user_${userId}_`)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      console.log(`🔄 [ResponseCache] Invalidated ${invalidated} entries for user: ${userId}`);
    }
  }

  /**
   * Pulisci tutta la cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      hitRate: 0
    };
    console.log('🧹 [ResponseCache] Cache completamente pulita');
  }
}

// Singleton instance
export const responseCache = new ResponseCache();

// Utility per logging statistiche
export function logCacheStats(): void {
  const stats = responseCache.getStats();
  console.log(`📊 [ResponseCache] Stats: ${stats.hits} hits, ${stats.misses} misses, ${stats.hitRate.toFixed(1)}% hit rate, ${stats.size} entries`);
}
