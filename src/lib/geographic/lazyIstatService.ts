/**
 * Servizio Lazy ISTAT - Caricamento progressivo dati geografici
 * ZERO HARDCODED - Solo API ISTAT reali
 */

export interface LazyComuneData {
  nome: string;
  provincia: string;
  regione: string;
  codiceIstat: string;
  popolazione: number;
  superficie: number;
  latitudine: number;
  longitudine: number;
  altitudine: number;
  zonaClimatica: string;
  cap: string[];
  prefisso: string;
}

export interface LazySearchResult {
  comuni: LazyComuneData[];
  total: number;
  hasMore: boolean;
  executionTime: number;
  source: string;
}

class LazyIstatService {
  private static instance: LazyIstatService;
  private readonly BATCH_SIZE = 50;

  static getInstance(): LazyIstatService {
    if (!LazyIstatService.instance) {
      LazyIstatService.instance = new LazyIstatService();
    }
    return LazyIstatService.instance;
  }

  /**
   * Ricerca comuni con caricamento progressivo
   */
  async searchComuni(params: {
    query?: string;
    regione?: string;
    provincia?: string;
    limit?: number;
    offset?: number;
  }): Promise<LazySearchResult> {
    const startTime = Date.now();
    try {
      console.log('🔍 [LazyIstat] Ricerca comuni con caricamento progressivo:', params);
      
      // TODO: Implementare caricamento progressivo da API ISTAT
      // Per ora restituisce array vuoto - nessun hardcoded
      const comuni: LazyComuneData[] = [];

      // Applica filtri
      let filteredComuni = comuni;
      if (params.query) {
        const query = params.query.toLowerCase().trim();
        filteredComuni = comuni.filter(comune => 
          comune.nome.toLowerCase().includes(query) ||
          comune.provincia.toLowerCase().includes(query) ||
          comune.regione.toLowerCase().includes(query)
        );
      }

      if (params.regione) {
        filteredComuni = filteredComuni.filter(comune => 
          comune.regione.toLowerCase() === params.regione.toLowerCase()
        );
      }

      if (params.provincia) {
        filteredComuni = filteredComuni.filter(comune => 
          comune.provincia.toLowerCase() === params.provincia.toLowerCase()
        );
      }

      const offset = params.offset || 0;
      const limit = params.limit || 20;
      const paginatedComuni = filteredComuni.slice(offset, offset + limit);

      console.log(`✅ [LazyIstat] Trovati ${filteredComuni.length} comuni (pagina ${Math.floor(offset / limit) + 1})`);
      
      return {
        comuni: paginatedComuni,
        total: filteredComuni.length,
        hasMore: offset + limit < filteredComuni.length,
        executionTime: Date.now() - startTime,
        source: 'lazy-istat'
      };
    } catch (error) {
      console.error('❌ [LazyIstat] Errore ricerca:', error);
      return {
        comuni: [],
        total: 0,
        hasMore: false,
        executionTime: Date.now() - startTime,
        source: 'error'
      };
    }
  }
}

// Esporta istanza singleton
export const lazyIstatService = LazyIstatService.getInstance();