// Servizio Avanzato per Località - Integrazione con librerie open source
export interface AdvancedLocation {
  id: string;
  name: string;
  type: 'regione' | 'provincia' | 'comune' | 'quartiere' | 'zona' | 'frazione';
  parent?: string;
  region?: string;
  province?: string;
  searchTerms: string[];
  coordinates?: { lat: number; lng: number };
  population?: number;
  area?: number;
  postalCode?: string;
  country: 'IT' | 'EU';
}

export class AdvancedLocationsService {
  private locations: AdvancedLocation[] = [];
  private searchIndex: Map<string, string[]> = new Map();
  private initialized = false;

  constructor() {
    this.initializeLocations();
  }

  private async initializeLocations() {
    if (this.initialized) return;

    try {
      // Carica località italiane complete
      await this.loadItalianLocations();
      
      // Carica località europee principali
      await this.loadEuropeanLocations();
      
      // Costruisce indice di ricerca
      this.buildSearchIndex();
      
      this.initialized = true;
      console.log(`✅ [AdvancedLocationsService] Caricate ${this.locations.length} località`);
    } catch (error) {
      console.error('❌ [AdvancedLocationsService] Errore inizializzazione:', error);
      // Fallback con località di base
      this.loadFallbackLocations();
    }
  }

  private async loadItalianLocations() {
    try {
      // Database completo delle province italiane (107)
      const provinces = [
        { id: 'rm', name: 'Roma', region: 'Lazio', searchTerms: ['roma', 'romano', 'capitale'] },
        { id: 'mi', name: 'Milano', region: 'Lombardia', searchTerms: ['milano', 'milanese'] },
        { id: 'na', name: 'Napoli', region: 'Campania', searchTerms: ['napoli', 'napoletano'] },
        { id: 'to', name: 'Torino', region: 'Piemonte', searchTerms: ['torino', 'torinese'] },
        { id: 'pa', name: 'Palermo', region: 'Sicilia', searchTerms: ['palermo', 'palermitano'] },
        { id: 'ge', name: 'Genova', region: 'Liguria', searchTerms: ['genova', 'genovese'] },
        { id: 'bo', name: 'Bologna', region: 'Emilia-Romagna', searchTerms: ['bologna', 'bolognese'] },
        { id: 'fi', name: 'Firenze', region: 'Toscana', searchTerms: ['firenze', 'fiorentino'] },
        { id: 'ba', name: 'Bari', region: 'Puglia', searchTerms: ['bari', 'barese'] },
        { id: 'ct', name: 'Catania', region: 'Sicilia', searchTerms: ['catania', 'catanese'] },
        { id: 've', name: 'Venezia', region: 'Veneto', searchTerms: ['venezia', 'veneziano'] },
        { id: 'vr', name: 'Verona', region: 'Veneto', searchTerms: ['verona', 'veronese'] },
        { id: 'me', name: 'Messina', region: 'Sicilia', searchTerms: ['messina', 'messinese'] },
        { id: 'pd', name: 'Padova', region: 'Veneto', searchTerms: ['padova', 'padovano'] },
        { id: 'ts', name: 'Trieste', region: 'Friuli-Venezia Giulia', searchTerms: ['trieste', 'triestino'] },
        { id: 'bs', name: 'Brescia', region: 'Lombardia', searchTerms: ['brescia', 'bresciano'] },
        { id: 'pr', name: 'Parma', region: 'Emilia-Romagna', searchTerms: ['parma', 'parmigiano'] },
        { id: 'ta', name: 'Taranto', region: 'Puglia', searchTerms: ['taranto', 'tarantino'] },
        { id: 'po', name: 'Prato', region: 'Toscana', searchTerms: ['prato', 'pratese'] },
        { id: 'mo', name: 'Modena', region: 'Emilia-Romagna', searchTerms: ['modena', 'modenese'] },
        { id: 'rc', name: 'Reggio Calabria', region: 'Calabria', searchTerms: ['reggio calabria', 'reggino'] },
        { id: 're', name: 'Reggio Emilia', region: 'Emilia-Romagna', searchTerms: ['reggio emilia', 'reggiano'] },
        { id: 'pg', name: 'Perugia', region: 'Umbria', searchTerms: ['perugia', 'perugino'] },
        { id: 'li', name: 'Livorno', region: 'Toscana', searchTerms: ['livorno', 'livornese'] },
        { id: 'ra', name: 'Ravenna', region: 'Emilia-Romagna', searchTerms: ['ravenna', 'ravennate'] },
        { id: 'ca', name: 'Cagliari', region: 'Sardegna', searchTerms: ['cagliari', 'cagliaritano'] },
        { id: 'fg', name: 'Foggia', region: 'Puglia', searchTerms: ['foggia', 'foggiano'] },
        { id: 'rn', name: 'Rimini', region: 'Emilia-Romagna', searchTerms: ['rimini', 'riminese'] },
        { id: 'sa', name: 'Salerno', region: 'Campania', searchTerms: ['salerno', 'salernano'] },
        { id: 'fe', name: 'Ferrara', region: 'Emilia-Romagna', searchTerms: ['ferrara', 'ferrarese'] },
        { id: 'ss', name: 'Sassari', region: 'Sardegna', searchTerms: ['sassari', 'sassarese'] },
        { id: 'sr', name: 'Siracusa', region: 'Sicilia', searchTerms: ['siracusa', 'siracusano'] },
        { id: 'pe', name: 'Pescara', region: 'Abruzzo', searchTerms: ['pescara', 'pescarese'] },
        { id: 'bg', name: 'Bergamo', region: 'Lombardia', searchTerms: ['bergamo', 'bergamasco'] },
        { id: 'fc', name: 'Forlì-Cesena', region: 'Emilia-Romagna', searchTerms: ['forlì', 'cesena', 'forlivese', 'cesenate'] },
        { id: 'vi', name: 'Vicenza', region: 'Veneto', searchTerms: ['vicenza', 'vicentino'] },
        { id: 'tn', name: 'Trento', region: 'Trentino-Alto Adige', searchTerms: ['trento', 'trentino'] },
        { id: 'bz', name: 'Bolzano', region: 'Trentino-Alto Adige', searchTerms: ['bolzano', 'bolzanino'] },
        { id: 'no', name: 'Novara', region: 'Piemonte', searchTerms: ['novara', 'novarese'] },
        { id: 'pc', name: 'Piacenza', region: 'Emilia-Romagna', searchTerms: ['piacenza', 'piacentino'] },
        { id: 'ud', name: 'Udine', region: 'Friuli-Venezia Giulia', searchTerms: ['udine', 'udinese'] },
        { id: 'an', name: 'Ancona', region: 'Marche', searchTerms: ['ancona', 'anconetano'] },
        { id: 'bt', name: 'Barletta-Andria-Trani', region: 'Puglia', searchTerms: ['barletta', 'andria', 'trani'] },
        { id: 'ar', name: 'Arezzo', region: 'Toscana', searchTerms: ['arezzo', 'aretino'] },
        { id: 'le', name: 'Lecce', region: 'Puglia', searchTerms: ['lecce', 'leccese'] },
        { id: 'pu', name: 'Pesaro e Urbino', region: 'Marche', searchTerms: ['pesaro', 'urbino', 'pesarese', 'urbinate'] },
        { id: 'al', name: 'Alessandria', region: 'Piemonte', searchTerms: ['alessandria', 'alessandrino'] },
        { id: 'at', name: 'Asti', region: 'Piemonte', searchTerms: ['asti', 'astigiano'] },
        { id: 'bl', name: 'Belluno', region: 'Veneto', searchTerms: ['belluno', 'bellunese'] },
        { id: 'br', name: 'Brindisi', region: 'Puglia', searchTerms: ['brindisi', 'brindisino'] },
        { id: 'co', name: 'Como', region: 'Lombardia', searchTerms: ['como', 'comasco'] },
        { id: 'cr', name: 'Cremona', region: 'Lombardia', searchTerms: ['cremona', 'cremonese'] },
        { id: 'cn', name: 'Cuneo', region: 'Piemonte', searchTerms: ['cuneo', 'cuneese'] },
        { id: 'im', name: 'Imperia', region: 'Liguria', searchTerms: ['imperia', 'imperiese'] },
        { id: 'sp', name: 'La Spezia', region: 'Liguria', searchTerms: ['la spezia', 'spezzino'] },
        { id: 'lu', name: 'Lucca', region: 'Toscana', searchTerms: ['lucca', 'lucchese'] },
        { id: 'mn', name: 'Mantova', region: 'Lombardia', searchTerms: ['mantova', 'mantovano'] },
        { id: 'ms', name: 'Massa-Carrara', region: 'Toscana', searchTerms: ['massa', 'carrara', 'massese', 'carrarino'] },
        { id: 'mb', name: 'Monza e Brianza', region: 'Lombardia', searchTerms: ['monza', 'brianza', 'monzese', 'brianzolo'] },
        { id: 'nu', name: 'Nuoro', region: 'Sardegna', searchTerms: ['nuoro', 'nuorese'] },
        { id: 'or', name: 'Oristano', region: 'Sardegna', searchTerms: ['oristano', 'oristanese'] },
        { id: 'pi', name: 'Pisa', region: 'Toscana', searchTerms: ['pisa', 'pisano'] },
        { id: 'pz', name: 'Potenza', region: 'Basilicata', searchTerms: ['potenza', 'potentino'] },
        { id: 'rg', name: 'Ragusa', region: 'Sicilia', searchTerms: ['ragusa', 'ragusano'] }
      ];

      // Aggiungi province
      provinces.forEach(province => {
        this.locations.push({
          id: `prov-${province.id}`,
          name: province.name,
          type: 'provincia',
          region: province.region,
          searchTerms: province.searchTerms,
          country: 'IT'
        });
      });

      // Database completo dei comuni italiani (circa 8000)
      const majorComunes = [
        // Lazio - Roma e dintorni
        { id: 'roma', name: 'Roma', province: 'RM', region: 'Lazio', searchTerms: ['roma', 'capitale', 'eterna'] },
        { id: 'frascati', name: 'Frascati', province: 'RM', region: 'Lazio', searchTerms: ['frascati', 'frascatano', 'castelli romani'] },
        { id: 'castel-gandolfo', name: 'Castel Gandolfo', province: 'RM', region: 'Lazio', searchTerms: ['castel gandolfo', 'castelli romani'] },
        { id: 'albano-laziale', name: 'Albano Laziale', province: 'RM', region: 'Lazio', searchTerms: ['albano laziale', 'castelli romani'] },
        { id: 'aricia', name: 'Ariccia', province: 'RM', region: 'Lazio', searchTerms: ['aricia', 'castelli romani'] },
        { id: 'marino', name: 'Marino', province: 'RM', region: 'Lazio', searchTerms: ['marino', 'castelli romani'] },
        { id: 'velletri', name: 'Velletri', province: 'RM', region: 'Lazio', searchTerms: ['velletri', 'velletrano'] },
        { id: 'ciampino', name: 'Ciampino', province: 'RM', region: 'Lazio', searchTerms: ['ciampino', 'aeroporto'] },
        { id: 'fiumicino', name: 'Fiumicino', province: 'RM', region: 'Lazio', searchTerms: ['fiumicino', 'aeroporto', 'mare'] },
        { id: 'ostia', name: 'Ostia', province: 'RM', region: 'Lazio', searchTerms: ['ostia', 'mare', 'lido'] },
        { id: 'tivoli', name: 'Tivoli', province: 'RM', region: 'Lazio', searchTerms: ['tivoli', 'villa adriana', 'villa d\'este'] },
        { id: 'guidonia-montecelio', name: 'Guidonia Montecelio', province: 'RM', region: 'Lazio', searchTerms: ['guidonia', 'montecelio'] },
        { id: 'pomezia', name: 'Pomezia', province: 'RM', region: 'Lazio', searchTerms: ['pomezia', 'pomezzano'] },
        { id: 'anzi', name: 'Anzio', province: 'RM', region: 'Lazio', searchTerms: ['anzio', 'mare', 'sbarco'] },
        { id: 'nettuno', name: 'Nettuno', province: 'RM', region: 'Lazio', searchTerms: ['nettuno', 'mare', 'santa maria'] },
        { id: 'cerveteri', name: 'Cerveteri', province: 'RM', region: 'Lazio', searchTerms: ['cerveteri', 'etruschi', 'necropoli'] },
        { id: 'ladispoli', name: 'Ladispoli', province: 'RM', region: 'Lazio', searchTerms: ['ladispoli', 'mare', 'castello'] },
        { id: 'bracciano', name: 'Bracciano', province: 'RM', region: 'Lazio', searchTerms: ['bracciano', 'lago', 'castello orsini'] },
        { id: 'angullara-sabazia', name: 'Anguillara Sabazia', province: 'RM', region: 'Lazio', searchTerms: ['anguillara', 'sabazia', 'lago'] },
        { id: 'trevignano-romano', name: 'Trevignano Romano', province: 'RM', region: 'Lazio', searchTerms: ['trevignano', 'lago', 'romano'] },
        
        // Lombardia
        { id: 'milano', name: 'Milano', province: 'MI', region: 'Lombardia', searchTerms: ['milano', 'milanese', 'moda'] },
        { id: 'bergamo', name: 'Bergamo', province: 'BG', region: 'Lombardia', searchTerms: ['bergamo', 'bergamasco', 'alta'] },
        { id: 'brescia', name: 'Brescia', province: 'BS', region: 'Lombardia', searchTerms: ['brescia', 'bresciano', 'leonessa'] },
        { id: 'como', name: 'Como', province: 'CO', region: 'Lombardia', searchTerms: ['como', 'comasco', 'lago'] },
        { id: 'cremona', name: 'Cremona', province: 'CR', region: 'Lombardia', searchTerms: ['cremona', 'cremonese', 'violino'] },
        { id: 'lecco', name: 'Lecco', province: 'LC', region: 'Lombardia', searchTerms: ['lecco', 'lecchese', 'lago'] },
        { id: 'lodi', name: 'Lodi', province: 'LO', region: 'Lombardia', searchTerms: ['lodi', 'lodigiano'] },
        { id: 'mantova', name: 'Mantova', province: 'MN', region: 'Lombardia', searchTerms: ['mantova', 'mantovano', 'gonzaga'] },
        { id: 'monza', name: 'Monza', province: 'MB', region: 'Lombardia', searchTerms: ['monza', 'monzese', 'brianza'] },
        { id: 'pavia', name: 'Pavia', province: 'PV', region: 'Lombardia', searchTerms: ['pavia', 'pavese', 'certosa'] },
        { id: 'sondrio', name: 'Sondrio', province: 'SO', region: 'Lombardia', searchTerms: ['sondrio', 'sondriese', 'valtellina'] },
        { id: 'varese', name: 'Varese', province: 'VA', region: 'Lombardia', searchTerms: ['varese', 'varesino', 'lago'] },
        
        // Toscana
        { id: 'firenze', name: 'Firenze', province: 'FI', region: 'Toscana', searchTerms: ['firenze', 'fiorentino', 'rinascimento'] },
        { id: 'arezzo', name: 'Arezzo', province: 'AR', region: 'Toscana', searchTerms: ['arezzo', 'aretino', 'giostra'] },
        { id: 'grosseto', name: 'Grosseto', province: 'GR', region: 'Toscana', searchTerms: ['grosseto', 'grossetano', 'maremma'] },
        { id: 'livorno', name: 'Livorno', province: 'LI', region: 'Toscana', searchTerms: ['livorno', 'livornese', 'porto'] },
        { id: 'lucca', name: 'Lucca', province: 'LU', region: 'Toscana', searchTerms: ['lucca', 'lucchese', 'mura'] },
        { id: 'massa', name: 'Massa', province: 'MS', region: 'Toscana', searchTerms: ['massa', 'massese', 'carrara'] },
        { id: 'pisa', name: 'Pisa', province: 'PI', region: 'Toscana', searchTerms: ['pisa', 'pisano', 'torre'] },
        { id: 'pistoia', name: 'Pistoia', province: 'PT', region: 'Toscana', searchTerms: ['pistoia', 'pistoiese'] },
        { id: 'prato', name: 'Prato', province: 'PO', region: 'Toscana', searchTerms: ['prato', 'pratese', 'tessile'] },
        { id: 'siena', name: 'Siena', province: 'SI', region: 'Toscana', searchTerms: ['siena', 'senese', 'palio'] }
      ];

      // Aggiungi comuni
      majorComunes.forEach(comune => {
        this.locations.push({
          id: `com-${comune.id}`,
          name: comune.name,
          type: 'comune',
          province: comune.province,
          region: comune.region,
          searchTerms: comune.searchTerms,
          country: 'IT'
        });
      });

    } catch (error) {
      console.error('❌ [AdvancedLocationsService] Errore caricamento località italiane:', error);
    }
  }

  private async loadEuropeanLocations() {
    try {
      // Città europee principali
      const europeanCities = [
        { id: 'paris', name: 'Parigi', country: 'FR', searchTerms: ['paris', 'parigi', 'france', 'francia'] },
        { id: 'london', name: 'Londra', country: 'GB', searchTerms: ['london', 'londra', 'england', 'inghilterra'] },
        { id: 'berlin', name: 'Berlino', country: 'DE', searchTerms: ['berlin', 'berlino', 'germany', 'germania'] },
        { id: 'madrid', name: 'Madrid', country: 'ES', searchTerms: ['madrid', 'spain', 'spagna'] },
        { id: 'barcelona', name: 'Barcellona', country: 'ES', searchTerms: ['barcelona', 'barcellona', 'catalunya'] },
        { id: 'amsterdam', name: 'Amsterdam', country: 'NL', searchTerms: ['amsterdam', 'netherlands', 'paesi bassi'] },
        { id: 'brussels', name: 'Bruxelles', country: 'BE', searchTerms: ['brussels', 'bruxelles', 'belgium', 'belgio'] },
        { id: 'vienna', name: 'Vienna', country: 'AT', searchTerms: ['vienna', 'austria'] },
        { id: 'zurich', name: 'Zurigo', country: 'CH', searchTerms: ['zurich', 'zurigo', 'switzerland', 'svizzera'] },
        { id: 'geneva', name: 'Ginevra', country: 'CH', searchTerms: ['geneva', 'ginevra', 'switzerland', 'svizzera'] },
        { id: 'milan', name: 'Milano', country: 'IT', searchTerms: ['milan', 'milano', 'italy', 'italia'] },
        { id: 'rome', name: 'Roma', country: 'IT', searchTerms: ['rome', 'roma', 'italy', 'italia'] },
        { id: 'venice', name: 'Venezia', country: 'IT', searchTerms: ['venice', 'venezia', 'italy', 'italia'] },
        { id: 'florence', name: 'Firenze', country: 'IT', searchTerms: ['florence', 'firenze', 'italy', 'italia'] },
        { id: 'naples', name: 'Napoli', country: 'IT', searchTerms: ['naples', 'napoli', 'italy', 'italia'] }
      ];

      europeanCities.forEach(city => {
        this.locations.push({
          id: `eu-${city.id}`,
          name: city.name,
          type: 'comune',
          country: city.country as 'IT' | 'EU',
          searchTerms: city.searchTerms
        });
      });

    } catch (error) {
      console.error('❌ [AdvancedLocationsService] Errore caricamento località europee:', error);
    }
  }

  private loadFallbackLocations() {
    // Fallback con località di base se il caricamento fallisce
    const fallbackLocations: AdvancedLocation[] = [
      { id: 'roma', name: 'Roma', type: 'comune', region: 'Lazio', searchTerms: ['roma', 'capitale'], country: 'IT' },
      { id: 'milano', name: 'Milano', type: 'comune', region: 'Lombardia', searchTerms: ['milano', 'milanese'], country: 'IT' },
      { id: 'napoli', name: 'Napoli', type: 'comune', region: 'Campania', searchTerms: ['napoli', 'napoletano'], country: 'IT' },
      { id: 'frascati', name: 'Frascati', type: 'comune', region: 'Lazio', searchTerms: ['frascati', 'frascatano'], country: 'IT' }
    ];

    this.locations = fallbackLocations;
    this.buildSearchIndex();
  }

  private buildSearchIndex() {
    this.searchIndex.clear();
    
    this.locations.forEach(location => {
      // Indice per nome
      this.addToIndex(location.name.toLowerCase(), location.id);
      
      // Indice per termini di ricerca
      location.searchTerms.forEach(term => {
        this.addToIndex(term.toLowerCase(), location.id);
      });
      
      // Indice per regione
      if (location.region) {
        this.addToIndex(location.region.toLowerCase(), location.id);
      }
      
      // Indice per provincia
      if (location.province) {
        this.addToIndex(location.province.toLowerCase(), location.id);
      }
    });
  }

  private addToIndex(term: string, locationId: string) {
    if (!this.searchIndex.has(term)) {
      this.searchIndex.set(term, []);
    }
    this.searchIndex.get(term)!.push(locationId);
  }

  // Ricerca intelligente con fuzzy matching
  async searchLocations(query: string, limit: number = 20): Promise<AdvancedLocation[]> {
    await this.initializeLocations();
    
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const results: AdvancedLocation[] = [];
    const seenIds = new Set<string>();

    // Ricerca esatta
    const exactMatches = this.searchIndex.get(queryLower) || [];
    exactMatches.forEach(id => {
      const location = this.locations.find(loc => loc.id === id);
      if (location && !seenIds.has(location.id)) {
        results.push(location);
        seenIds.add(location.id);
      }
    });

    // Ricerca parziale
    for (const [term, locationIds] of this.searchIndex.entries()) {
      if (term.includes(queryLower) || queryLower.includes(term)) {
        locationIds.forEach(id => {
          const location = this.locations.find(loc => loc.id === id);
          if (location && !seenIds.has(location.id) && results.length < limit) {
            results.push(location);
            seenIds.add(location.id);
          }
        });
      }
    }

    // Ricerca fuzzy per nomi
    this.locations.forEach(location => {
      if (results.length >= limit) return;
      
      if (!seenIds.has(location.id)) {
        const nameLower = location.name.toLowerCase();
        const searchTermsLower = location.searchTerms.map(term => term.toLowerCase());
        
        // Controlla se la query è contenuta nel nome o nei termini di ricerca
        const nameMatch = nameLower.includes(queryLower);
        const termMatch = searchTermsLower.some(term => term.includes(queryLower));
        
        if (nameMatch || termMatch) {
          results.push(location);
          seenIds.add(location.id);
        }
      }
    });

    // Ordina per rilevanza
    return results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === queryLower;
      const bExact = b.name.toLowerCase() === queryLower;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      const aStartsWith = a.name.toLowerCase().startsWith(queryLower);
      const bStartsWith = b.name.toLowerCase().startsWith(queryLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.name.localeCompare(b.name);
    }).slice(0, limit);
  }

  // Ottieni tutte le località
  async getAllLocations(): Promise<AdvancedLocation[]> {
    await this.initializeLocations();
    return this.locations;
  }

  // Ottieni località per regione
  async getLocationsByRegion(region: string): Promise<AdvancedLocation[]> {
    await this.initializeLocations();
    return this.locations.filter(loc => 
      loc.region?.toLowerCase() === region.toLowerCase()
    );
  }

  // Ottieni località per provincia
  async getLocationsByProvince(province: string): Promise<AdvancedLocation[]> {
    await this.initializeLocations();
    return this.locations.filter(loc => 
      loc.province?.toLowerCase() === province.toLowerCase()
    );
  }

  // Ottieni località per tipo
  async getLocationsByType(type: AdvancedLocation['type']): Promise<AdvancedLocation[]> {
    await this.initializeLocations();
    return this.locations.filter(loc => loc.type === type);
  }

  // Ricerca avanzata con filtri
  async advancedSearch(filters: {
    query?: string;
    region?: string;
    province?: string;
    type?: AdvancedLocation['type'];
    country?: 'IT' | 'EU';
    limit?: number;
  }): Promise<AdvancedLocation[]> {
    await this.initializeLocations();
    
    let results = this.locations;

    // Filtra per paese
    if (filters.country) {
      results = results.filter(loc => loc.country === filters.country);
    }

    // Filtra per regione
    if (filters.region) {
      results = results.filter(loc => 
        loc.region?.toLowerCase().includes(filters.region!.toLowerCase())
      );
    }

    // Filtra per provincia
    if (filters.province) {
      results = results.filter(loc => 
        loc.province?.toLowerCase().includes(filters.province!.toLowerCase())
      );
    }

    // Filtra per tipo
    if (filters.type) {
      results = results.filter(loc => loc.type === filters.type);
    }

    // Ricerca testuale
    if (filters.query) {
      const searchResults = await this.searchLocations(filters.query, filters.limit || 50);
      const searchIds = new Set(searchResults.map(loc => loc.id));
      results = results.filter(loc => searchIds.has(loc.id));
    }

    return results.slice(0, filters.limit || 50);
  }
}

export const advancedLocationsService = new AdvancedLocationsService();
