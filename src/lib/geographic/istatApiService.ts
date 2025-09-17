/**
 * Servizio API ISTAT Reale
 * Connessione diretta alle API ufficiali ISTAT per dati sempre aggiornati
 */

export interface IstatComuneData {
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
  cap: string;
  prefisso: string;
}

export interface IstatSearchResult {
  comuni: IstatComuneData[];
  total: number;
  hasMore: boolean;
  executionTime: number;
  source: 'istat-api' | 'fallback';
}

class IstatApiService {
  private static instance: IstatApiService;
  private cache = new Map<string, { data: IstatComuneData[]; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore

  private constructor() {}

  static getInstance(): IstatApiService {
    if (!IstatApiService.instance) {
      IstatApiService.instance = new IstatApiService();
    }
    return IstatApiService.instance;
  }

  /**
   * Ricerca comuni tramite API ISTAT
   */
  async searchComuni(params: {
    query?: string;
    regione?: string;
    provincia?: string;
    limit?: number;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<IstatSearchResult> {
    const startTime = Date.now();
    
    try {
      console.log('🌐 [IstatAPI] Ricerca comuni tramite API ISTAT:', params);
      
      // 1. Prova cache prima
      const cacheKey = this.generateCacheKey(params);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('✅ [IstatAPI] Risultati da cache');
        return {
          comuni: cached.slice(0, params.limit || 20),
          total: cached.length,
          hasMore: cached.length > (params.limit || 20),
          executionTime: Date.now() - startTime,
          source: 'istat-api'
        };
      }

      // 2. Prova API ISTAT
      const istatResults = await this.fetchFromIstatApi(params);
      if (istatResults.length > 0) {
        console.log(`✅ [IstatAPI] Trovati ${istatResults.length} comuni tramite API ISTAT`);
        this.setCache(cacheKey, istatResults);
        return {
          comuni: istatResults.slice(0, params.limit || 20),
          total: istatResults.length,
          hasMore: istatResults.length > (params.limit || 20),
          executionTime: Date.now() - startTime,
          source: 'istat-api'
        };
      }

      // 3. Fallback su dati di base
      console.log('⚠️ [IstatAPI] API ISTAT non disponibile, usando fallback');
      const fallbackResults = this.getFallbackData(params);
      
      return {
        comuni: fallbackResults.slice(0, params.limit || 20),
        total: fallbackResults.length,
        hasMore: fallbackResults.length > (params.limit || 20),
        executionTime: Date.now() - startTime,
        source: 'fallback'
      };
      
    } catch (error) {
      console.error('❌ [IstatAPI] Errore ricerca:', error);
      
      // Fallback in caso di errore
      const fallbackResults = this.getFallbackData(params);
      return {
        comuni: fallbackResults.slice(0, params.limit || 20),
        total: fallbackResults.length,
        hasMore: fallbackResults.length > (params.limit || 20),
        executionTime: Date.now() - startTime,
        source: 'fallback'
      };
    }
  }

  /**
   * Fetch dati da API ISTAT
   */
  private async fetchFromIstatApi(params: any): Promise<IstatComuneData[]> {
    try {
      // API ISTAT per comuni italiani
      const istatUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
      
      console.log('🌐 [IstatAPI] Fetching dati da:', istatUrl);
      
      const response = await fetch(istatUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Urbanova-Geographic-Service/1.0',
          'Accept': 'text/csv, application/csv',
        },
        // Timeout per evitare blocchi
        signal: AbortSignal.timeout(10000) // 10 secondi
      });

      if (!response.ok) {
        throw new Error(`API ISTAT non disponibile: ${response.status}`);
      }

      const csvData = await response.text();
      const comuni = this.parseCsvData(csvData, params);
      
      console.log(`✅ [IstatAPI] Parsati ${comuni.length} comuni da CSV ISTAT`);
      return comuni;
      
    } catch (error) {
      console.error('❌ [IstatAPI] Errore fetch ISTAT:', error);
      return [];
    }
  }

  /**
   * Parse CSV data da ISTAT
   */
  private parseCsvData(csvData: string, params: any): IstatComuneData[] {
    try {
      const lines = csvData.split('\n');
      const comuni: IstatComuneData[] = [];
      
      console.log('🔍 [IstatAPI] Parsing CSV ISTAT, righe totali:', lines.length);
      
      // Skip header line
      for (let i = 1; i < Math.min(lines.length, 100); i++) { // Limita a 100 per debug
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(';');
        console.log(`🔍 [IstatAPI] Riga ${i}, colonne: ${columns.length}, nome: ${columns[6]}`);
        
        if (columns.length < 10) continue;
        
        const comune: IstatComuneData = {
          nome: columns[6]?.trim() || '',
          provincia: columns[3]?.trim() || '',
          regione: columns[2]?.trim() || '',
          codiceIstat: columns[19]?.trim() || '',
          popolazione: parseInt(columns[20]?.trim() || '0') || 0,
          superficie: parseFloat(columns[21]?.trim() || '0') || 0,
          latitudine: parseFloat(columns[22]?.trim() || '0') || 0,
          longitudine: parseFloat(columns[23]?.trim() || '0') || 0,
          altitudine: parseInt(columns[24]?.trim() || '0') || 0,
          zonaClimatica: columns[25]?.trim() || '',
          cap: columns[26]?.trim() || '',
          prefisso: columns[27]?.trim() || ''
        };
        
        // Filtri
        if (params.q) {
          const query = params.q.toLowerCase();
          if (!comune.nome.toLowerCase().includes(query) &&
              !comune.provincia.toLowerCase().includes(query) &&
              !comune.regione.toLowerCase().includes(query)) {
            continue;
          }
        }
        
        if (params.regione && comune.regione.toLowerCase() !== params.regione.toLowerCase()) {
          continue;
        }
        
        if (params.provincia && comune.provincia.toLowerCase() !== params.provincia.toLowerCase()) {
          continue;
        }
        
        comuni.push(comune);
      }
      
      // Ordinamento
      comuni.sort((a, b) => {
        if (params.sortBy === 'population') {
          return b.popolazione - a.popolazione;
        } else {
          return a.nome.localeCompare(b.nome);
        }
      });
      
      return comuni;
      
    } catch (error) {
      console.error('❌ [IstatAPI] Errore parse CSV:', error);
      return [];
    }
  }

  /**
   * Dati di fallback quando API ISTAT non disponibile
   */
  private getFallbackData(params: any): IstatComuneData[] {
    const fallbackComuni: IstatComuneData[] = [
      {
        nome: "Roma",
        provincia: "Roma",
        regione: "Lazio",
        codiceIstat: "058091",
        popolazione: 2873000,
        superficie: 1285.31,
        latitudine: 41.9028,
        longitudine: 12.4964,
        altitudine: 21,
        zonaClimatica: "D",
        cap: "00100",
        prefisso: "06"
      },
      {
        nome: "Milano",
        provincia: "Milano",
        regione: "Lombardia",
        codiceIstat: "015146",
        popolazione: 1396000,
        superficie: 181.76,
        latitudine: 45.4642,
        longitudine: 9.1900,
        altitudine: 122,
        zonaClimatica: "E",
        cap: "20100",
        prefisso: "02"
      },
      {
        nome: "Napoli",
        provincia: "Napoli",
        regione: "Campania",
        codiceIstat: "063049",
        popolazione: 967000,
        superficie: 119.02,
        latitudine: 40.8518,
        longitudine: 14.2681,
        altitudine: 17,
        zonaClimatica: "C",
        cap: "80100",
        prefisso: "081"
      },
      {
        nome: "Torino",
        provincia: "Torino",
        regione: "Piemonte",
        codiceIstat: "001272",
        popolazione: 886000,
        superficie: 130.01,
        latitudine: 45.0703,
        longitudine: 7.6869,
        altitudine: 239,
        zonaClimatica: "E",
        cap: "10100",
        prefisso: "011"
      },
      {
        nome: "Palermo",
        provincia: "Palermo",
        regione: "Sicilia",
        codiceIstat: "082053",
        popolazione: 676000,
        superficie: 158.88,
        latitudine: 38.1157,
        longitudine: 13.3613,
        altitudine: 14,
        zonaClimatica: "B",
        cap: "90100",
        prefisso: "091"
      }
    ];

    // Applica filtri
    let filtered = fallbackComuni;
    
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(comune => 
        comune.nome.toLowerCase().includes(query) ||
        comune.provincia.toLowerCase().includes(query) ||
        comune.regione.toLowerCase().includes(query)
      );
    }
    
    if (params.regione) {
      filtered = filtered.filter(comune => 
        comune.regione.toLowerCase() === params.regione.toLowerCase()
      );
    }
    
    if (params.provincia) {
      filtered = filtered.filter(comune => 
        comune.provincia.toLowerCase() === params.provincia.toLowerCase()
      );
    }
    
    return filtered;
  }

  /**
   * Cache management
   */
  private generateCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  private getFromCache(key: string): IstatComuneData[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: IstatComuneData[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const istatApiService = IstatApiService.getInstance();
