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
      // CHIRURGICO: Cache rimosso - solo dati ISTAT reali
      // 2. Prova API ISTAT
      const istatResults = await this.fetchFromIstatApi(params);
      if (istatResults.length > 0) {
        console.log(`✅ [IstatAPI] Trovati ${istatResults.length} comuni tramite API ISTAT`);
        // CHIRURGICO: Cache rimosso - solo dati ISTAT reali
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
      const fallbackResults: IstatComuneData[] = [];
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
      const fallbackResults: IstatComuneData[] = [];
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
   * Carica TUTTI i comuni italiani reali via API ISTAT server
   */
  private async fetchFromIstatApi(params: any): Promise<IstatComuneData[]> {
    try {
      // CHIRURGICO: Chiamata API ISTAT dal server per TUTTI i comuni italiani
      console.log('🌐 [IstatAPI] Caricamento TUTTI i comuni italiani via API ISTAT server...');
      // 1. Prova API ISTAT CSV completo dal server
      const csvUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
      console.log('📊 [IstatAPI] Fetch CSV ISTAT completo dal server:', csvUrl);
      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Urbanova-Server/1.0',
          'Accept': 'text/csv, application/csv',
        },
        signal: AbortSignal.timeout(30000) // 30 secondi
      });
      if (response.ok) {
        const csvData = await response.text();
        console.log(`📊 [IstatAPI] CSV ISTAT ricevuto: ${csvData.length} caratteri`);
        console.log(`📊 [IstatAPI] Prime 200 caratteri CSV:`, csvData.substring(0, 200));
                  const comuni = await this.parseCompleteIstatCsv(csvData, params);
        if (comuni.length > 0) {
          console.log(`✅ [IstatAPI] Caricati ${comuni.length} comuni reali dal CSV ISTAT`);
          return comuni;
        } else {
          console.log(`⚠️ [IstatAPI] Nessun comune parsato dal CSV ISTAT - provo parsing alternativo`);
          // Prova parsing alternativo senza filtri
                    const allComuni = await this.parseCompleteIstatCsv(csvData, {});
          if (allComuni.length > 0) {
            console.log(`✅ [IstatAPI] Parsing alternativo riuscito: ${allComuni.length} comuni totali`);
            return allComuni;
          }
        }
      } else {
        console.log(`❌ [IstatAPI] Errore HTTP ${response.status}: ${response.statusText}`);
      }
      // 2. Prova API ISTAT territoriali
      console.log('📊 [IstatAPI] Tentativo API ISTAT territoriali...');
      const territorialUrl = 'https://www.istat.it/it/files/2023/03/Elenco-comuni-italiani.csv';
      const territorialResponse = await fetch(territorialUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Urbanova-Server/1.0',
          'Accept': 'text/csv, application/csv',
        },
        signal: AbortSignal.timeout(30000) // 30 secondi
      });
      if (territorialResponse.ok) {
        const territorialData = await territorialResponse.text();
        const comuni = await this.parseCompleteIstatCsv(territorialData, params);
        if (comuni.length > 0) {
          console.log(`✅ [IstatAPI] Caricati ${comuni.length} comuni reali da API territoriali`);
          return comuni;
        }
      }
      // 3. Prova API ISTAT SDMX via server
      console.log('📊 [IstatAPI] Tentativo API ISTAT SDMX via server...');
      const sdmxUrl = 'https://sdmx.istat.it/SDMXWS/rest/data/IT1,DF_DCCV_1,1.0/ALL?format=jsondata';
      const sdmxResponse = await fetch(sdmxUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Urbanova-Server/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000) // 30 secondi
      });
      if (sdmxResponse.ok) {
        const sdmxData = await sdmxResponse.json();
        const comuni = this.parseIstatSdmxData(sdmxData, params);
        if (comuni.length > 0) {
          console.log(`✅ [IstatAPI] Caricati ${comuni.length} comuni reali da SDMX`);
          return comuni;
        }
      }
      console.log('⚠️ [IstatAPI] Tutte le API ISTAT non disponibili, uso fallback minimo');
      return [];
    } catch (error) {
      console.error('❌ [IstatAPI] Errore fetch API ISTAT, provo fallback locale:', error);
      return [];
    }
  }
  /**
   * Parse dati API ISTAT SDMX
   */
  private parseIstatSdmxData(sdmxData: any, params: any): IstatComuneData[] {
    try {
      const comuni: IstatComuneData[] = [];
      if (sdmxData.data && sdmxData.data.dataSets && sdmxData.data.dataSets[0]) {
        const dataset = sdmxData.data.dataSets[0];
        const observations = dataset.observations || {};
        // Estrai dimensioni per mappare i dati
        const dimensions = sdmxData.data.structure?.dimensions?.observation || [];
        for (const [key, value] of Object.entries(observations)) {
          try {
            const observation = value as any;
            const values = Array.isArray(observation) ? observation : [observation];
            // Mappa i valori alle dimensioni
            const comune: IstatComuneData = {
              nome: values[0]?.toString() || '',
              provincia: values[1]?.toString() || '',
              regione: values[2]?.toString() || '',
              codiceIstat: key,
              popolazione: parseInt(values[3]?.toString()) || 0,
              superficie: parseFloat(values[4]?.toString()) || 0,
              latitudine: parseFloat(values[5]?.toString()) || 0,
              longitudine: parseFloat(values[6]?.toString()) || 0,
              altitudine: parseInt(values[7]?.toString()) || 0,
              zonaClimatica: values[8]?.toString() || 'D',
              cap: values[9]?.toString() || '',
              prefisso: values[10]?.toString() || ''
            };
            if (comune.nome && comune.codiceIstat) {
              comuni.push(comune);
            }
          } catch (error) {
            console.warn('⚠️ [IstatAPI] Errore parsing osservazione SDMX:', key);
          }
        }
      }
      console.log(`📊 [IstatAPI] Parsati ${comuni.length} comuni da SDMX`);
      return comuni;
    } catch (error) {
      console.error('❌ [IstatAPI] Errore parsing SDMX:', error);
      return [];
    }
  }
  /**
   * Parse CSV ISTAT completo (TUTTI i comuni italiani)
   */
  private async parseCompleteIstatCsv(csvData: string, params: any): Promise<IstatComuneData[]> {
    try {
      const lines = csvData.split('\n');
      const comuni: IstatComuneData[] = [];
      console.log(`📊 [IstatAPI] Parsing CSV ISTAT con ${lines.length} linee`);

      // Debug: Verifica header
      console.log('🔍 [IstatAPI] Header CSV:', lines[0]?.substring(0, 200) + '...');
      console.log('🔍 [IstatAPI] Prima linea dati:', lines[1]?.substring(0, 200) + '...');

      // Skip header lines (header multi-linea su 3 linee)
      for (let i = 3; i < lines.length; i++) {
        const line = lines[i]?.trim();
        if (!line) continue;
        
        // DEBUG MANIACALE: Log ogni linea che contiene Roma
        if (line.includes('Roma')) {
          console.log(`🎯 [IstatAPI] LINEA CON ROMA TROVATA ${i}:`, line.substring(0, 100) + '...');
        }
        
        try {
          const columns = line.split(';');
          
          // Debug: Verifica parsing
          if (i <= 3) {
            console.log(`🔍 [IstatAPI] Linea ${i} - Colonne parseate:`, columns.length);
            console.log(`🔍 [IstatAPI] Linea ${i} - Prime 5 colonne:`, columns.slice(0, 5));
          }
          
          // Verifica che abbiamo abbastanza colonne (CSV ISTAT ha molte colonne)
          if (columns.length >= 12) {
            const nomeComune = columns[6]?.trim() || ''; // Denominazione (Italiana e straniera) - colonna 7
            const nomeProvincia = columns[11]?.trim() || ''; // Denominazione Unit� territoriale - colonna 12
            const nomeRegione = columns[10]?.trim() || ''; // Denominazione Regione - colonna 11
            
            // DEBUG MANIACALE: Log specifico per Roma
            if (nomeComune === 'Roma') {
              console.log(`🎯 [IstatAPI] ROMA PARSATA:`, { nomeComune, nomeProvincia, nomeRegione, columns: columns.slice(0, 15) });
              console.log(`🎯 [IstatAPI] ROMA COLONNE:`, columns);
            }
            
            // Debug: Verifica campi
            if (i <= 3) {
              console.log(`🔍 [IstatAPI] Linea ${i} - Nome: "${nomeComune}", Provincia: "${nomeProvincia}", Regione: "${nomeRegione}"`);
            }
            
            // Geocoding temporaneamente disabilitato per debug
            const coordinate = { lat: 41.9028, lng: 12.4964 }; // Roma di default
            const comune: IstatComuneData = {
              nome: nomeComune, // Denominazione (colonna 6)
              provincia: nomeProvincia, // Provincia (colonna 12)
              regione: nomeRegione, // Regione (colonna 10)
              codiceIstat: columns[4]?.trim() || '', // Codice Comune (colonna 5)
              popolazione: 0, // Non disponibile nel CSV base
              superficie: 0, // Non disponibile nel CSV base
              latitudine: coordinate.lat,
              longitudine: coordinate.lng,
              altitudine: 0, // Non disponibile nel CSV base
              zonaClimatica: 'D', // Default
              cap: '', // Non disponibile nel CSV base
              prefisso: '' // Non disponibile nel CSV base
            };
            // Filtra solo comuni validi
            if (comune.nome && comune.codiceIstat && comune.provincia && comune.regione) {
              comuni.push(comune);
              // DEBUG MANIACALE: Log specifico per Roma
              if (comune.nome === 'Roma') {
                console.log(`🎯 [IstatAPI] ROMA TROVATA E AGGIUNTA:`, comune);
              }
              console.log(`✅ [IstatAPI] Comune aggiunto:`, comune.nome);
            } else {
              // DEBUG MANIACALE: Log specifico per Roma scartata
              if (comune.nome === 'Roma') {
                console.log(`🎯 [IstatAPI] ROMA SCARTATA:`, { nome: comune.nome, codiceIstat: comune.codiceIstat, provincia: comune.provincia, regione: comune.regione });
              }
              console.log(`❌ [IstatAPI] Comune scartato:`, { nome: comune.nome, codiceIstat: comune.codiceIstat, provincia: comune.provincia, regione: comune.regione });
            }
          }
        } catch (error) {
          console.warn('⚠️ [IstatAPI] Errore parsing linea CSV:', line.substring(0, 50) + '...');
        }
      }
      // Applica filtri se specificati con algoritmo intelligente
      let filteredComuni = comuni;
      if (params.query || params.q) {
        const query = (params.query || params.q).toLowerCase().trim();
        console.log(`🔍 [IstatAPI] Ricerca intelligente per: "${query}"`);
        
        // 1. MATCH ESATTI SUL NOME (priorità massima)
        const exactNameMatches = comuni.filter(comune => 
          comune.nome.toLowerCase() === query
        );
        
        // 2. MATCH ESATTI SU PROVINCIA/REGIONE (priorità alta)
        const exactLocationMatches = comuni.filter(comune => 
          !exactNameMatches.includes(comune) && (
            comune.provincia.toLowerCase() === query ||
            comune.regione.toLowerCase() === query
          )
        );
        
        // 3. INIZI CON (priorità media)
        const startsWithMatches = comuni.filter(comune => 
          !exactNameMatches.includes(comune) && 
          !exactLocationMatches.includes(comune) && (
            comune.nome.toLowerCase().startsWith(query) ||
            comune.provincia.toLowerCase().startsWith(query) ||
            comune.regione.toLowerCase().startsWith(query)
          )
        );
        
        // 4. CONTIENE (priorità normale)
        const containsMatches = comuni.filter(comune => 
          !exactNameMatches.includes(comune) && 
          !exactLocationMatches.includes(comune) && 
          !startsWithMatches.includes(comune) && (
            comune.nome.toLowerCase().includes(query) ||
            comune.provincia.toLowerCase().includes(query) ||
            comune.regione.toLowerCase().includes(query)
          )
        );
        
        // Combina i risultati in ordine di priorità: NOME ESATTO → PROVINCIA/REGIONE ESATTA → INIZI CON → CONTIENE
        filteredComuni = [...exactNameMatches, ...exactLocationMatches, ...startsWithMatches, ...containsMatches];
        
        console.log(`🔍 [IstatAPI] Risultati intelligenti: ${exactNameMatches.length} nomi esatti, ${exactLocationMatches.length} province/regioni esatte, ${startsWithMatches.length} iniziano, ${containsMatches.length} contengono`);
        console.log(`🔍 [IstatAPI] Primi 5 risultati:`, filteredComuni.slice(0, 5).map(c => c.nome));
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
      console.log(`✅ [IstatAPI] Parsati ${filteredComuni.length} comuni dal CSV ISTAT completo (${comuni.length} totali)`);
      return filteredComuni;
    } catch (error) {
      console.error('❌ [IstatAPI] Errore parsing CSV completo:', error);
      return [];
    }
  }
}
