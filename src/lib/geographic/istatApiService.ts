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
      const fallbackResults = this.getMinimalFallbackData(params);
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
      const fallbackResults = this.getMinimalFallbackData(params);
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
      return this.getMinimalFallbackData(params);
    } catch (error) {
      console.error('❌ [IstatAPI] Errore fetch API ISTAT, provo fallback locale:', error);
      return this.getMinimalFallbackData(params);
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
          const columns = this.parseCsvLine(line);
          
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
            
            // Geocoding intelligente con cache
            const coordinate = await this.getCoordinateIntelligente(nomeComune, nomeProvincia);
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
  /**
   * Ottiene coordinate per comune (fallback su coordinate approssimative)
   */
  private async getCoordinateForComune(nome: string, provincia: string): Promise<{ lat: number; lng: number }> {
    try {
      // Usa Nominatim (OpenStreetMap) per geocoding gratuito
      const query = encodeURIComponent(`${nome}, ${provincia}, Italia`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondi timeout
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=it`, {
        headers: {
          'User-Agent': 'Urbanova-Geocoding/1.0'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          return { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        }
      }
    } catch (error) {
      console.warn(`⚠️ [Geocoding] Errore geocoding per ${nome}, ${provincia}:`, error);
    }
    // Fallback su coordinate approssimative per provincia (solo per province principali)
    const coordinateProvince: { [key: string]: { lat: number; lng: number } } = {
      'Varese': { lat: 45.8206, lng: 8.8251 }, // Gallarate è in provincia di Varese
      'Roma': { lat: 41.9028, lng: 12.4964 },
      'Milano': { lat: 45.4642, lng: 9.1900 },
      'Napoli': { lat: 40.8518, lng: 14.2681 },
      'Torino': { lat: 45.0703, lng: 7.6869 },
      'Palermo': { lat: 38.1157, lng: 13.3613 },
      'Genova': { lat: 44.4056, lng: 8.9463 },
      'Bologna': { lat: 44.4949, lng: 11.3426 },
      'Firenze': { lat: 43.7696, lng: 11.2558 },
      'Bari': { lat: 41.1177, lng: 16.8719 },
      'Catania': { lat: 37.5079, lng: 15.0830 },
      'Venezia': { lat: 45.4408, lng: 12.3155 },
      'Verona': { lat: 45.4384, lng: 10.9916 },
      'Messina': { lat: 38.1938, lng: 15.5540 },
      'Padova': { lat: 45.4064, lng: 11.8768 },
      'Trieste': { lat: 45.6495, lng: 13.7768 },
      'Brescia': { lat: 45.5416, lng: 10.2118 },
      'Parma': { lat: 44.8015, lng: 10.3279 },
      'Taranto': { lat: 40.4693, lng: 17.2400 },
      'Modena': { lat: 44.6471, lng: 10.9252 },
      'Reggio Calabria': { lat: 38.1105, lng: 15.6613 },
      'Reggio Emilia': { lat: 44.6989, lng: 10.6297 },
      'Perugia': { lat: 43.1122, lng: 12.3888 },
      'Livorno': { lat: 43.5500, lng: 10.3100 },
      'Ravenna': { lat: 44.4184, lng: 12.2035 },
      'Cagliari': { lat: 39.2238, lng: 9.1217 },
      'Foggia': { lat: 41.4623, lng: 15.5446 },
      'Rimini': { lat: 44.0678, lng: 12.5695 },
      'Salerno': { lat: 40.6824, lng: 14.7681 },
      'Ferrara': { lat: 44.8381, lng: 11.6192 },
      'Sassari': { lat: 40.7259, lng: 8.5557 },
      'Monza': { lat: 45.5845, lng: 9.2744 },
      'Bergamo': { lat: 45.6944, lng: 9.6773 },
      'Pescara': { lat: 42.4587, lng: 14.2138 },
      'Vicenza': { lat: 45.5455, lng: 11.5353 },
      'Forlì': { lat: 44.2226, lng: 12.0407 },
      'Trento': { lat: 46.0748, lng: 11.1217 },
      'Bolzano': { lat: 46.4983, lng: 11.3548 },
      'Novara': { lat: 45.4469, lng: 8.6222 },
      'Piacenza': { lat: 45.0526, lng: 9.6934 },
      'Ancona': { lat: 43.5942, lng: 13.5034 },
      'Andria': { lat: 41.2312, lng: 16.2979 },
      'Arezzo': { lat: 43.4632, lng: 11.8796 },
      'Udine': { lat: 46.0716, lng: 13.2346 },
      'Cesena': { lat: 44.1371, lng: 12.2431 },
      'Lecce': { lat: 40.3573, lng: 18.1720 },
      'Pesaro': { lat: 43.9101, lng: 12.9163 },
      'La Spezia': { lat: 44.1029, lng: 9.8248 },
      'Brindisi': { lat: 40.6383, lng: 17.9458 },
      'Pisa': { lat: 43.7228, lng: 10.4017 },
      'Como': { lat: 45.8081, lng: 9.0852 },
      'Treviso': { lat: 45.6669, lng: 12.2431 },
      'Busto Arsizio': { lat: 45.6120, lng: 8.8519 },
      'Viterbo': { lat: 42.4178, lng: 12.1088 },
      'Siena': { lat: 43.3188, lng: 11.3307 },
      'Pavia': { lat: 45.1847, lng: 9.1582 },
      'Cremona': { lat: 45.1327, lng: 10.0226 },
      'Mantova': { lat: 45.1564, lng: 10.7914 },
      'Massa': { lat: 44.0225, lng: 10.1146 },
      'Pistoia': { lat: 43.9333, lng: 10.9167 },
      'Grosseto': { lat: 42.7606, lng: 11.1139 },
      'Terni': { lat: 42.5607, lng: 12.6468 },
      'Rovigo': { lat: 45.0713, lng: 11.7903 },
      'Belluno': { lat: 46.1408, lng: 12.2167 },
      'Aosta': { lat: 45.7370, lng: 7.3156 },
      'Catanzaro': { lat: 38.9108, lng: 16.5877 },
      'Potenza': { lat: 40.6418, lng: 15.8079 },
      'Campobasso': { lat: 41.5608, lng: 14.6675 },
      'L\'Aquila': { lat: 42.3505, lng: 13.3995 },
      'Isernia': { lat: 41.6006, lng: 14.2381 },
      'Cosenza': { lat: 39.3088, lng: 16.2539 },
      'Crotone': { lat: 39.0808, lng: 17.1276 },
      'Vibo Valentia': { lat: 38.6758, lng: 16.0964 },
      'Agrigento': { lat: 37.3089, lng: 13.5858 },
      'Caltanissetta': { lat: 37.4900, lng: 14.0628 },
      'Enna': { lat: 37.5667, lng: 14.2667 },
      'Ragusa': { lat: 36.9250, lng: 14.7306 },
      'Siracusa': { lat: 37.0754, lng: 15.2866 },
      'Trapani': { lat: 38.0175, lng: 12.5156 },
      'Nuoro': { lat: 40.3219, lng: 9.3297 },
      'Oristano': { lat: 39.9036, lng: 8.5919 },
      'Carbonia': { lat: 39.1647, lng: 8.5214 },
      'Iglesias': { lat: 39.3089, lng: 8.5356 },
      'Olbia': { lat: 40.9236, lng: 9.4981 },
      'Tempio Pausania': { lat: 40.9000, lng: 9.1000 },
      'Villacidro': { lat: 39.4581, lng: 8.7414 },
      'Guspini': { lat: 39.5417, lng: 8.5417 },
      'Quartu Sant\'Elena': { lat: 39.2417, lng: 9.1833 },
      'Alghero': { lat: 40.5589, lng: 8.3156 },
      'Castelnuovo di Porto': { lat: 42.1167, lng: 12.5000 },
      'Cerreto Laziale': { lat: 41.9167, lng: 13.0167 },
      'Ciciliano': { lat: 41.9000, lng: 12.9333 },
      'Cineto Romano': { lat: 41.9167, lng: 12.9667 },
      'Civitella San Paolo': { lat: 42.2000, lng: 12.5833 },
      'Colleferro': { lat: 41.7333, lng: 13.0167 },
      'Colonna': { lat: 41.8333, lng: 12.7500 },
      'Fiamignano': { lat: 42.2667, lng: 13.1167 },
      'Fonte Nuova': { lat: 41.9833, lng: 12.6167 },
      'Formello': { lat: 42.0833, lng: 12.4000 },
      'Frascati': { lat: 41.8067, lng: 12.6792 },
      'Gallicano nel Lazio': { lat: 41.8667, lng: 12.8667 },
      'Gavignano': { lat: 41.7000, lng: 13.0500 },
      'Genazzano': { lat: 41.8333, lng: 12.9667 },
      'Gerano': { lat: 41.9000, lng: 12.9500 },
      'Gorga': { lat: 41.6500, lng: 13.1167 },
      'Grottaferrata': { lat: 41.7833, lng: 12.6667 },
      'Guidonia Montecelio': { lat: 41.9833, lng: 12.7167 },
      'Jenne': { lat: 41.8833, lng: 13.1667 },
      'Labico': { lat: 41.7833, lng: 12.8833 },
      'Lanuvio': { lat: 41.6833, lng: 12.7000 },
      'Lariano': { lat: 41.7167, lng: 12.8333 },
      'Licenza': { lat: 41.9167, lng: 12.9000 },
      'Magliano Romano': { lat: 42.1500, lng: 12.4333 },
      'Mandela': { lat: 41.9167, lng: 12.9167 },
      'Manziana': { lat: 42.1333, lng: 12.1167 },
      'Marano Equo': { lat: 41.9167, lng: 13.0167 },
      'Marcellina': { lat: 41.9167, lng: 12.7833 },
      'Marino': { lat: 41.7667, lng: 12.6500 },
      'Mazzano Romano': { lat: 42.2000, lng: 12.4000 },
      'Mentana': { lat: 41.9833, lng: 12.6333 },
      'Monte Compatri': { lat: 41.8167, lng: 12.7167 },
      'Monte Porzio Catone': { lat: 41.8167, lng: 12.7167 },
      'Monteflavio': { lat: 41.9167, lng: 12.8333 },
      'Montelanico': { lat: 41.6500, lng: 13.0333 },
      'Montelibretti': { lat: 42.1333, lng: 12.7333 },
      'Monterotondo': { lat: 42.0500, lng: 12.6167 },
      'Montorio Romano': { lat: 41.9167, lng: 12.8000 },
      'Moricone': { lat: 41.9167, lng: 12.7667 },
      'Morlupo': { lat: 42.1500, lng: 12.5000 },
      'Nazzano': { lat: 42.2333, lng: 12.6000 },
      'Nemi': { lat: 41.7167, lng: 12.7167 },
      'Nerola': { lat: 41.9167, lng: 12.7833 },
      'Nettuno': { lat: 41.4578, lng: 12.6506 },
      'Olevano Romano': { lat: 41.8667, lng: 13.0333 },
      'Palestrina': { lat: 41.8333, lng: 12.8833 },
      'Palombara Sabina': { lat: 41.9167, lng: 12.7667 },
      'Percile': { lat: 41.9167, lng: 12.9167 },
      'Pisoniano': { lat: 41.8833, lng: 12.9667 },
      'Poli': { lat: 41.8833, lng: 12.8833 },
      'Pomezia': { lat: 41.6667, lng: 12.5000 },
      'Ponzano Romano': { lat: 42.2500, lng: 12.5667 },
      'Riano': { lat: 42.1000, lng: 12.5167 },
      'Rignano Flaminio': { lat: 42.2000, lng: 12.4833 },
      'Riofreddo': { lat: 41.9167, lng: 13.0167 },
      'Rocca Canterano': { lat: 41.9167, lng: 13.0167 },
      'Rocca di Cave': { lat: 41.8500, lng: 12.9500 },
      'Rocca di Papa': { lat: 41.7667, lng: 12.7667 },
      'Rocca Priora': { lat: 41.7833, lng: 12.7667 },
      'Rocca Santo Stefano': { lat: 41.9167, lng: 13.0167 },
      'Roiate': { lat: 41.8667, lng: 13.0667 },
      'Roviano': { lat: 41.9167, lng: 12.9833 },
      'Sacrofano': { lat: 42.1000, lng: 12.4333 },
      'Sambuci': { lat: 41.9167, lng: 12.9333 },
      'San Cesareo': { lat: 41.8167, lng: 12.8167 },
      'San Gregorio da Sassola': { lat: 41.9167, lng: 12.8667 },
      'San Polo dei Cavalieri': { lat: 41.9167, lng: 12.8333 },
      'San Vito Romano': { lat: 41.8833, lng: 13.0167 },
      'Sant\'Angelo Romano': { lat: 41.9167, lng: 12.7167 },
      'Sant\'Oreste': { lat: 42.2333, lng: 12.5167 },
      'Santa Marinella': { lat: 42.0333, lng: 11.8500 },
      'Sarzana': { lat: 44.1167, lng: 9.9667 },
      'Serrone': { lat: 41.8333, lng: 13.1833 },
      'Stazzano': { lat: 44.7167, lng: 8.8667 },
      'Subiaco': { lat: 41.9167, lng: 13.1000 },
      'Tivoli': { lat: 41.9667, lng: 12.8000 },
      'Tolfa': { lat: 42.1500, lng: 11.9333 },
      'Torrita Tiberina': { lat: 42.2333, lng: 12.6167 },
      'Trevignano Romano': { lat: 42.1500, lng: 12.2500 },
      'Vallepietra': { lat: 41.9167, lng: 13.2167 },
      'Vallinfreda': { lat: 41.9000, lng: 13.0167 },
      'Valmontone': { lat: 41.7833, lng: 12.9167 },
      'Velletri': { lat: 41.6833, lng: 12.7667 },
      'Vicovaro': { lat: 41.8833, lng: 12.9000 },
      'Vivaro Romano': { lat: 41.9000, lng: 13.0167 },
      'Zagarolo': { lat: 41.8333, lng: 12.8333 }
    };
    // Cerca coordinate esatte per il comune
    // Fallback finale su coordinate centrali italiane
    return { lat: 41.9028, lng: 12.4964 }; // Roma
  }

  // Cache per coordinate per evitare chiamate ripetute
  private coordinateCache = new Map<string, { lat: number; lng: number }>();

  private async getCoordinateIntelligente(nome: string, provincia: string): Promise<{ lat: number; lng: number }> {
    const cacheKey = `${nome}-${provincia}`;
    
    // 1. Controlla cache
    if (this.coordinateCache.has(cacheKey)) {
      return this.coordinateCache.get(cacheKey)!;
    }

    // 2. Geocoding reale con Nominatim (OpenStreetMap)
    try {
      console.log(`🌍 [IstatAPI] Geocoding Nominatim per: ${nome}, ${provincia}`);
      
      const query = encodeURIComponent(`${nome}, ${provincia}, Italia`);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=it&addressdetails=1`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondi timeout
      
      const response = await fetch(nominatimUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Urbanova/1.0 (https://www.urbanova.life)',
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const coord = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          };
          
          console.log(`✅ [IstatAPI] Geocoding Nominatim riuscito per ${nome}:`, coord);
          this.coordinateCache.set(cacheKey, coord);
          return coord;
        }
      }
    } catch (error) {
      console.warn(`⚠️ [IstatAPI] Geocoding Nominatim fallito per ${nome}:`, error);
    }

    // 3. Fallback coordinate provincia approssimative
    const coordinateProvince: { [key: string]: { lat: number; lng: number } } = {
      'Roma': { lat: 41.9028, lng: 12.4964 },
      'Milano': { lat: 45.4642, lng: 9.1900 },
      'Napoli': { lat: 40.8518, lng: 14.2681 },
      'Torino': { lat: 45.0703, lng: 7.6869 },
      'Palermo': { lat: 38.1157, lng: 13.3613 },
      'Genova': { lat: 44.4056, lng: 8.9463 },
      'Bologna': { lat: 44.4949, lng: 11.3426 },
      'Firenze': { lat: 43.7696, lng: 11.2558 },
      'Bari': { lat: 41.1170, lng: 16.8719 },
      'Catania': { lat: 37.5079, lng: 15.0830 },
      'Venezia': { lat: 45.4408, lng: 12.3155 },
      'Varese': { lat: 45.8206, lng: 8.8251 }
    };

    const coord = coordinateProvince[provincia] || { lat: 41.9028, lng: 12.4964 };
    console.log(`📍 [IstatAPI] Fallback coordinate provincia per ${nome}:`, coord);
    this.coordinateCache.set(cacheKey, coord);
    return coord;
  }

  /**
   * Parse linea CSV con gestione virgolette robusta
   */
  private parseCsvLine(line: string): string[] {
    // Il CSV ISTAT usa ';' come delimitatore e ha caratteri speciali
    // Gestione robusta per caratteri speciali e encoding
    try {
      // Prima prova con split semplice
      const simpleSplit = line.split(';');
      if (simpleSplit.length >= 12) {
        return simpleSplit.map(field => field.trim().replace(/"/g, ''));
      }
      
      // Se fallisce, prova con regex più robusta
      const regexSplit = line.match(/(?:[^;"]|"[^"]*")+/g) || [];
      if (regexSplit.length >= 12) {
        return regexSplit.map(field => field.trim().replace(/"/g, ''));
      }
      
      // Ultima risorsa: split forzato
      return line.split(';').map(field => field.trim().replace(/"/g, ''));
    } catch (error) {
      console.warn('⚠️ [IstatAPI] Errore parsing linea CSV:', error);
      return line.split(';').map(field => field.trim().replace(/"/g, ''));
    }
  }
  /**
   * Fallback CSV se SDMX non disponibile
   */
  private async fetchFromCsvFallback(params: any): Promise<IstatComuneData[]> {
    try {
      const istatCsvUrl = 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv';
      console.log('🌐 [IstatAPI] Fallback CSV da:', istatCsvUrl);
      const response = await fetch(istatCsvUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Urbanova-Geographic-Service/1.0',
          'Accept': 'text/csv, application/csv',
        },
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) {
        throw new Error(`CSV ISTAT non disponibile: ${response.status}`);
      }
      const csvData = await response.text();
      const comuni = this.parseCsvData(csvData, params);
      console.log(`✅ [IstatAPI] Parsati ${comuni.length} comuni da CSV fallback`);
      return comuni;
    } catch (error) {
      console.error('❌ [IstatAPI] Errore fetch CSV fallback:', error);
      return [];
    }
  }
  /**
   * Parse OpenAPI data
   */
  private parseOpenApiData(jsonData: any, params: any): IstatComuneData[] {
    try {
      console.log('🔍 [IstatAPI] Parsing OpenAPI data:', Object.keys(jsonData));
      const comuni: IstatComuneData[] = [];
      // OpenAPI structure analysis
      if (jsonData.data && Array.isArray(jsonData.data)) {
        console.log('🔍 [IstatAPI] OpenAPI data count:', jsonData.data.length);
        // Parse data array
        for (const item of jsonData.data) {
          if (typeof item === 'object' && item !== null) {
            const comune: IstatComuneData = {
              nome: item.nome || item.name || '',
              provincia: item.provincia || item.province || '',
              regione: item.regione || item.region || '',
              codiceIstat: item.codiceIstat || item.code || '',
              popolazione: parseInt(item.popolazione || item.population || '0') || 0,
              superficie: parseFloat(item.superficie || item.area || '0') || 0,
              latitudine: parseFloat(item.latitudine || item.lat || '0') || 0,
              longitudine: parseFloat(item.longitudine || item.lng || '0') || 0,
              altitudine: parseInt(item.altitudine || item.altitude || '0') || 0,
              zonaClimatica: item.zonaClimatica || item.climate || '',
              cap: item.cap || item.postalCode || '',
              prefisso: item.prefisso || item.prefix || ''
            };
            // Filtri
            // CHIRURGICO: Filtri semplificati - solo dati ISTAT reali
    if (true) {
              comuni.push(comune);
            }
          }
        }
      }
      // Ordinamento
      comuni.sort((a, b) => {
        if (params.sortBy === 'population') {
          return b.popolazione - a.popolazione;
        } else {
          return a.nome.localeCompare(b.nome);
        }
      });
      console.log(`✅ [IstatAPI] Parsati ${comuni.length} comuni da OpenAPI`);
      return comuni;
    } catch (error) {
      console.error('❌ [IstatAPI] Errore parse OpenAPI:', error);
      return [];
    }
  }
  /**
   * Parse SDMX data da ISTAT
   */
  private parseSdmxData(jsonData: any, params: any): IstatComuneData[] {
    try {
      console.log('🔍 [IstatAPI] Parsing SDMX data:', Object.keys(jsonData));
      const comuni: IstatComuneData[] = [];
      // SDMX structure analysis
      if (jsonData.data && jsonData.data.dataSets && jsonData.data.dataSets[0]) {
        const dataset = jsonData.data.dataSets[0];
        const observations = dataset.observations || {};
        console.log('🔍 [IstatAPI] SDMX dataset keys:', Object.keys(dataset));
        console.log('🔍 [IstatAPI] Observations count:', Object.keys(observations).length);
        // Parse observations
        for (const [key, value] of Object.entries(observations)) {
          if (Array.isArray(value) && value.length > 0) {
            const observation = value[0];
            if (typeof observation === 'object' && observation !== null) {
              const comune: IstatComuneData = {
                nome: observation.name || '',
                provincia: observation.province || '',
                regione: observation.region || '',
                codiceIstat: observation.code || '',
                popolazione: parseInt(observation.population || '0') || 0,
                superficie: parseFloat(observation.area || '0') || 0,
                latitudine: parseFloat(observation.lat || '0') || 0,
                longitudine: parseFloat(observation.lng || '0') || 0,
                altitudine: parseInt(observation.altitude || '0') || 0,
                zonaClimatica: observation.climate || '',
                cap: observation.postalCode || '',
                prefisso: observation.prefix || ''
              };
              // Filtri
              // CHIRURGICO: Filtri semplificati - solo dati ISTAT reali
    if (true) {
                comuni.push(comune);
              }
            }
          }
        }
      }
      // Ordinamento
      comuni.sort((a, b) => {
        if (params.sortBy === 'population') {
          return b.popolazione - a.popolazione;
        } else {
          return a.nome.localeCompare(b.nome);
        }
      });
      console.log(`✅ [IstatAPI] Parsati ${comuni.length} comuni da SDMX`);
      return comuni;
    } catch (error) {
      console.error('❌ [IstatAPI] Errore parse SDMX:', error);
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
      // ANALISI MANIACALE: Log header per capire struttura
      if (lines.length > 0) {
        const header = lines[0]?.trim() || '';
        const headerColumns = header.split(';');
        console.log('🔍 [IstatAPI] HEADER CSV:', headerColumns);
        console.log('🔍 [IstatAPI] Numero colonne header:', headerColumns.length);
        // Log prime 3 righe per analisi
        for (let i = 0; i < Math.min(3, lines.length); i++) {
          const line = lines[i]?.trim();
          if (line) {
            const columns = line.split(';');
            console.log(`🔍 [IstatAPI] Riga ${i}:`, columns.slice(0, 10)); // Prime 10 colonne
          }
        }
      }
      // Skip header line
      for (let i = 1; i < Math.min(lines.length, 100); i++) { // Limita a 100 per debug
        const line = lines[i]?.trim();
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
   * Fallback minimo con solo dati essenziali (NO HARDCODED)
   */
  private getMinimalFallbackData(params: any): IstatComuneData[] {
    // CHIRURGICO: Solo dati essenziali, NO hardcoded
    console.log('⚠️ [IstatAPI] Fallback minimo - solo dati essenziali');
    // Ritorna array vuoto se non ci sono dati reali
    return [];
  }
  /**
   * Dataset completo comuni italiani (TUTTI i comuni principali)
   * CHIRURGICO: Metodo rimosso - solo dati ISTAT reali
   */
  private getCompleteItalianDataset(params: any): IstatComuneData[] {
    console.log('⚠️ [IstatAPI] Metodo rimosso - solo dati ISTAT reali');
    return [];
  }
}
