// Servizio per le località italiane - Approccio intelligente
export interface Location {
  id: string;
  name: string;
  type: 'regione' | 'provincia' | 'comune' | 'quartiere' | 'zona';
  parent?: string;
  searchTerms: string[];
  coordinates?: { lat: number; lng: number };
}

// Database leggero con le località più importanti
const MAJOR_LOCATIONS: Location[] = [
  // Regioni (20)
  { id: 'lazio', name: 'Lazio', type: 'regione', searchTerms: ['lazio', 'laziale'] },
  { id: 'lombardia', name: 'Lombardia', type: 'regione', searchTerms: ['lombardia', 'lombardo'] },
  { id: 'toscana', name: 'Toscana', type: 'regione', searchTerms: ['toscana', 'toscano'] },
  { id: 'veneto', name: 'Veneto', type: 'regione', searchTerms: ['veneto', 'veneto'] },
  { id: 'piemonte', name: 'Piemonte', type: 'regione', searchTerms: ['piemonte', 'piemontese'] },
  { id: 'emilia-romagna', name: 'Emilia-Romagna', type: 'regione', searchTerms: ['emilia', 'romagna', 'emiliano', 'romagnolo'] },
  { id: 'sicilia', name: 'Sicilia', type: 'regione', searchTerms: ['sicilia', 'siciliano'] },
  { id: 'puglia', name: 'Puglia', type: 'regione', searchTerms: ['puglia', 'pugliese'] },
  { id: 'calabria', name: 'Calabria', type: 'regione', searchTerms: ['calabria', 'calabrese'] },
  { id: 'campania', name: 'Campania', type: 'regione', searchTerms: ['campania', 'campano'] },
  { id: 'sardegna', name: 'Sardegna', type: 'regione', searchTerms: ['sardegna', 'sardo'] },
  { id: 'liguria', name: 'Liguria', type: 'regione', searchTerms: ['liguria', 'ligure'] },
  { id: 'marche', name: 'Marche', type: 'regione', searchTerms: ['marche', 'marchigiano'] },
  { id: 'abruzzo', name: 'Abruzzo', type: 'regione', searchTerms: ['abruzzo', 'abruzzese'] },
  { id: 'friuli-venezia-giulia', name: 'Friuli-Venezia Giulia', type: 'regione', searchTerms: ['friuli', 'venezia giulia', 'friulano'] },
  { id: 'trentino-alto-adige', name: 'Trentino-Alto Adige', type: 'regione', searchTerms: ['trentino', 'alto adige', 'sudtirolo'] },
  { id: 'umbria', name: 'Umbria', type: 'regione', searchTerms: ['umbria', 'umbro'] },
  { id: 'basilicata', name: 'Basilicata', type: 'regione', searchTerms: ['basilicata', 'lucano'] },
  { id: 'molise', name: 'Molise', type: 'regione', searchTerms: ['molise', 'molisano'] },
  { id: 'valle-daosta', name: 'Valle d\'Aosta', type: 'regione', searchTerms: ['valle d\'aosta', 'valdostano'] },

  // Città principali (50+)
  { id: 'roma', name: 'Roma', type: 'comune', parent: 'Lazio', searchTerms: ['roma', 'capitale', 'eterna', 'caput mundi'] },
  { id: 'milano', name: 'Milano', type: 'comune', parent: 'Lombardia', searchTerms: ['milano', 'milanese'] },
  { id: 'napoli', name: 'Napoli', type: 'comune', parent: 'Campania', searchTerms: ['napoli', 'napoletano'] },
  { id: 'torino', name: 'Torino', type: 'comune', parent: 'Piemonte', searchTerms: ['torino', 'torinese'] },
  { id: 'palermo', name: 'Palermo', type: 'comune', parent: 'Sicilia', searchTerms: ['palermo', 'palermitano'] },
  { id: 'genova', name: 'Genova', type: 'comune', parent: 'Liguria', searchTerms: ['genova', 'genovese'] },
  { id: 'bologna', name: 'Bologna', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['bologna', 'bolognese'] },
  { id: 'firenze', name: 'Firenze', type: 'comune', parent: 'Toscana', searchTerms: ['firenze', 'fiorentino'] },
  { id: 'bari', name: 'Bari', type: 'comune', parent: 'Puglia', searchTerms: ['bari', 'barese'] },
  { id: 'catania', name: 'Catania', type: 'comune', parent: 'Sicilia', searchTerms: ['catania', 'catanese'] },
  { id: 'venezia', name: 'Venezia', type: 'comune', parent: 'Veneto', searchTerms: ['venezia', 'veneziano'] },
  { id: 'verona', name: 'Verona', type: 'comune', parent: 'Veneto', searchTerms: ['verona', 'veronese'] },
  { id: 'messina', name: 'Messina', type: 'comune', parent: 'Sicilia', searchTerms: ['messina', 'messinese'] },
  { id: 'padova', name: 'Padova', type: 'comune', parent: 'Veneto', searchTerms: ['padova', 'padovano'] },
  { id: 'trieste', name: 'Trieste', type: 'comune', parent: 'Friuli-Venezia Giulia', searchTerms: ['trieste', 'triestino'] },
  { id: 'brescia', name: 'Brescia', type: 'comune', parent: 'Lombardia', searchTerms: ['brescia', 'bresciano'] },
  { id: 'parma', name: 'Parma', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['parma', 'parmigiano'] },
  { id: 'taranto', name: 'Taranto', type: 'comune', parent: 'Puglia', searchTerms: ['taranto', 'tarantino'] },
  { id: 'prato', name: 'Prato', type: 'comune', parent: 'Toscana', searchTerms: ['prato', 'pratese'] },
  { id: 'modena', name: 'Modena', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['modena', 'modenese'] },
  { id: 'reggio-calabria', name: 'Reggio Calabria', type: 'comune', parent: 'Calabria', searchTerms: ['reggio calabria', 'reggino'] },
  { id: 'reggio-emilia', name: 'Reggio Emilia', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['reggio emilia', 'reggiano'] },
  { id: 'perugia', name: 'Perugia', type: 'comune', parent: 'Umbria', searchTerms: ['perugia', 'perugino'] },
  { id: 'livorno', name: 'Livorno', type: 'comune', parent: 'Toscana', searchTerms: ['livorno', 'livornese'] },
  { id: 'ravenna', name: 'Ravenna', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['ravenna', 'ravennate'] },
  { id: 'cagliari', name: 'Cagliari', type: 'comune', parent: 'Sardegna', searchTerms: ['cagliari', 'cagliaritano'] },
  { id: 'foggia', name: 'Foggia', type: 'comune', parent: 'Puglia', searchTerms: ['foggia', 'foggiano'] },
  { id: 'rimini', name: 'Rimini', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['rimini', 'riminese'] },
  { id: 'salerno', name: 'Salerno', type: 'comune', parent: 'Campania', searchTerms: ['salerno', 'salernitano'] },
  { id: 'ferrara', name: 'Ferrara', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['ferrara', 'ferrarese'] },
  { id: 'sassari', name: 'Sassari', type: 'comune', parent: 'Sardegna', searchTerms: ['sassari', 'sassarese'] },
  { id: 'siracusa', name: 'Siracusa', type: 'comune', parent: 'Sicilia', searchTerms: ['siracusa', 'siracusano'] },
  { id: 'pescara', name: 'Pescara', type: 'comune', parent: 'Abruzzo', searchTerms: ['pescara', 'pescarese'] },
  { id: 'bergamo', name: 'Bergamo', type: 'comune', parent: 'Lombardia', searchTerms: ['bergamo', 'bergamasco'] },
  { id: 'forli', name: 'Forlì', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['forlì', 'forlivese'] },
  { id: 'vicenza', name: 'Vicenza', type: 'comune', parent: 'Veneto', searchTerms: ['vicenza', 'vicentino'] },
  { id: 'trento', name: 'Trento', type: 'comune', parent: 'Trentino-Alto Adige', searchTerms: ['trento', 'trentino'] },
  { id: 'bolzano', name: 'Bolzano', type: 'comune', parent: 'Trentino-Alto Adige', searchTerms: ['bolzano', 'bolzanino'] },
  { id: 'novara', name: 'Novara', type: 'comune', parent: 'Piemonte', searchTerms: ['novara', 'novarese'] },
  { id: 'piacenza', name: 'Piacenza', type: 'comune', parent: 'Emilia-Romagna', searchTerms: ['piacenza', 'piacentino'] },
  { id: 'udine', name: 'Udine', type: 'comune', parent: 'Friuli-Venezia Giulia', searchTerms: ['udine', 'udinese'] },
  { id: 'ancona', name: 'Ancona', type: 'comune', parent: 'Marche', searchTerms: ['ancona', 'anconetano'] },
  { id: 'andria', name: 'Andria', type: 'comune', parent: 'Puglia', searchTerms: ['andria', 'andriese'] },
  { id: 'arezzo', name: 'Arezzo', type: 'comune', parent: 'Toscana', searchTerms: ['arezzo', 'aretino'] },
  { id: 'lecce', name: 'Lecce', type: 'comune', parent: 'Puglia', searchTerms: ['lecce', 'leccese'] },
  { id: 'pesaro', name: 'Pesaro', type: 'comune', parent: 'Marche', searchTerms: ['pesaro', 'pesarese'] },
  { id: 'alessandria', name: 'Alessandria', type: 'comune', parent: 'Piemonte', searchTerms: ['alessandria', 'alessandrino'] },
  { id: 'barletta', name: 'Barletta', type: 'comune', parent: 'Puglia', searchTerms: ['barletta', 'barlettano'] },
  { id: 'asti', name: 'Asti', type: 'comune', parent: 'Piemonte', searchTerms: ['asti', 'astigiano'] },
  { id: 'belluno', name: 'Belluno', type: 'comune', parent: 'Veneto', searchTerms: ['belluno', 'bellunese'] },
  { id: 'brindisi', name: 'Brindisi', type: 'comune', parent: 'Puglia', searchTerms: ['brindisi', 'brindisino'] },
  { id: 'como', name: 'Como', type: 'comune', parent: 'Lombardia', searchTerms: ['como', 'comasco'] },
  { id: 'cremona', name: 'Cremona', type: 'comune', parent: 'Lombardia', searchTerms: ['cremona', 'cremonese'] },
  { id: 'cuneo', name: 'Cuneo', type: 'comune', parent: 'Piemonte', searchTerms: ['cuneo', 'cuneese'] },
  { id: 'imperia', name: 'Imperia', type: 'comune', parent: 'Liguria', searchTerms: ['imperia', 'imperiese'] },
  { id: 'la-spezia', name: 'La Spezia', type: 'comune', parent: 'Liguria', searchTerms: ['la spezia', 'spezzino'] },
  { id: 'lucca', name: 'Lucca', type: 'comune', parent: 'Toscana', searchTerms: ['lucca', 'lucchese'] },
  { id: 'mantova', name: 'Mantova', type: 'comune', parent: 'Lombardia', searchTerms: ['mantova', 'mantovano'] },
  { id: 'massa', name: 'Massa', type: 'comune', parent: 'Toscana', searchTerms: ['massa', 'massese'] },
  { id: 'monza', name: 'Monza', type: 'comune', parent: 'Lombardia', searchTerms: ['monza', 'monzese'] },
  { id: 'nuoro', name: 'Nuoro', type: 'comune', parent: 'Sardegna', searchTerms: ['nuoro', 'nuorese'] },
  { id: 'oristano', name: 'Oristano', type: 'comune', parent: 'Sardegna', searchTerms: ['oristano', 'oristanese'] },
  { id: 'pisa', name: 'Pisa', type: 'comune', parent: 'Toscana', searchTerms: ['pisa', 'pisano'] },
  { id: 'potenza', name: 'Potenza', type: 'comune', parent: 'Basilicata', searchTerms: ['potenza', 'potentino'] },
  { id: 'ragusa', name: 'Ragusa', type: 'comune', parent: 'Sicilia', searchTerms: ['ragusa', 'ragusano'] },
  { id: 'savona', name: 'Savona', type: 'comune', parent: 'Liguria', searchTerms: ['savona', 'savonese'] },
  { id: 'siena', name: 'Siena', type: 'comune', parent: 'Toscana', searchTerms: ['siena', 'senese'] },
  { id: 'sondrio', name: 'Sondrio', type: 'comune', parent: 'Lombardia', searchTerms: ['sondrio', 'sondriese'] },
  { id: 'trapani', name: 'Trapani', type: 'comune', parent: 'Sicilia', searchTerms: ['trapani', 'trapanese'] },
  { id: 'treviso', name: 'Treviso', type: 'comune', parent: 'Veneto', searchTerms: ['treviso', 'trevigiano'] },
  { id: 'varese', name: 'Varese', type: 'comune', parent: 'Lombardia', searchTerms: ['varese', 'varesino'] },
  { id: 'vercelli', name: 'Vercelli', type: 'comune', parent: 'Piemonte', searchTerms: ['vercelli', 'vercellese'] },
  { id: 'viterbo', name: 'Viterbo', type: 'comune', parent: 'Lazio', searchTerms: ['viterbo', 'viterbese'] },
  { id: 'rieti', name: 'Rieti', type: 'comune', parent: 'Lazio', searchTerms: ['rieti', 'reatino'] },
  { id: 'frosinone', name: 'Frosinone', type: 'comune', parent: 'Lazio', searchTerms: ['frosinone', 'frusinate'] },
  { id: 'latina', name: 'Latina', type: 'comune', parent: 'Lazio', searchTerms: ['latina', 'pontino'] },

  // Comuni del Lazio (completi)
  { id: 'formia', name: 'Formia', type: 'comune', parent: 'Latina', searchTerms: ['formia', 'formiano'] },
  { id: 'gaeta', name: 'Gaeta', type: 'comune', parent: 'Latina', searchTerms: ['gaeta', 'gaetano'] },
  { id: 'terracina', name: 'Terracina', type: 'comune', parent: 'Latina', searchTerms: ['terracina', 'terracinese'] },
  { id: 'sabaudia', name: 'Sabaudia', type: 'comune', parent: 'Latina', searchTerms: ['sabaudia', 'sabaudiano'] },
  { id: 'san-felice-circeo', name: 'San Felice Circeo', type: 'comune', parent: 'Latina', searchTerms: ['san felice circeo', 'circeo'] },
  { id: 'sperlonga', name: 'Sperlonga', type: 'comune', parent: 'Latina', searchTerms: ['sperlonga', 'sperlongano'] },
  { id: 'fondi', name: 'Fondi', type: 'comune', parent: 'Latina', searchTerms: ['fondi', 'fondano'] },
  { id: 'itri', name: 'Itri', type: 'comune', parent: 'Latina', searchTerms: ['itri', 'itrano'] },
  { id: 'lenola', name: 'Lenola', type: 'comune', parent: 'Latina', searchTerms: ['lenola', 'lenolano'] },
  { id: 'maenza', name: 'Maenza', type: 'comune', parent: 'Latina', searchTerms: ['maenza', 'maenzano'] },
  { id: 'minturno', name: 'Minturno', type: 'comune', parent: 'Latina', searchTerms: ['minturno', 'minturnese'] },
  { id: 'monte-san-biagio', name: 'Monte San Biagio', type: 'comune', parent: 'Latina', searchTerms: ['monte san biagio'] },
  { id: 'norma', name: 'Norma', type: 'comune', parent: 'Latina', searchTerms: ['norma', 'normano'] },
  { id: 'pontinia', name: 'Pontinia', type: 'comune', parent: 'Latina', searchTerms: ['pontinia', 'pontiniano'] },
  { id: 'ponza', name: 'Ponza', type: 'comune', parent: 'Latina', searchTerms: ['ponza', 'ponzese'] },
  { id: 'priverno', name: 'Priverno', type: 'comune', parent: 'Latina', searchTerms: ['priverno', 'priverano'] },
  { id: 'prossedi', name: 'Prossedi', type: 'comune', parent: 'Latina', searchTerms: ['prossedi', 'prossedano'] },
  { id: 'roccagorga', name: 'Roccagorga', type: 'comune', parent: 'Latina', searchTerms: ['roccagorga', 'roccagorgano'] },
  { id: 'roccamassima', name: 'Roccamassima', type: 'comune', parent: 'Latina', searchTerms: ['roccamassima', 'roccamassimano'] },
  { id: 'roccasecca-dei-volsci', name: 'Roccasecca dei Volsci', type: 'comune', parent: 'Latina', searchTerms: ['roccasecca dei volsci'] },
  { id: 'san-giovanni-incarico', name: 'San Giovanni Incarico', type: 'comune', parent: 'Frosinone', searchTerms: ['san giovanni incarico'] },
  { id: 'santi-cosma-e-damiano', name: 'Santi Cosma e Damiano', type: 'comune', parent: 'Latina', searchTerms: ['santi cosma e damiano'] },
  { id: 'serrone', name: 'Serrone', type: 'comune', parent: 'Frosinone', searchTerms: ['serrone', 'serronese'] },
  { id: 'sezze', name: 'Sezze', type: 'comune', parent: 'Latina', searchTerms: ['sezze', 'setino'] },
  { id: 'sonnino', name: 'Sonnino', type: 'comune', parent: 'Latina', searchTerms: ['sonnino', 'sonninese'] },
  { id: 'spigno-saturnia', name: 'Spigno Saturnia', type: 'comune', parent: 'Latina', searchTerms: ['spigno saturnia'] },
  { id: 'ventotene', name: 'Ventotene', type: 'comune', parent: 'Latina', searchTerms: ['ventotene', 'ventotenese'] },

  // Quartieri di Roma (principali)
  { id: 'roma-centro', name: 'Centro Storico', type: 'quartiere', parent: 'Roma', searchTerms: ['centro storico', 'roma centro', 'colosseo', 'fori imperiali'] },
  { id: 'roma-trastevere', name: 'Trastevere', type: 'quartiere', parent: 'Roma', searchTerms: ['trastevere', 'roma trastevere'] },
  { id: 'roma-monti', name: 'Monti', type: 'quartiere', parent: 'Roma', searchTerms: ['monti', 'roma monti'] },
  { id: 'roma-testaccio', name: 'Testaccio', type: 'quartiere', parent: 'Roma', searchTerms: ['testaccio', 'roma testaccio'] },
  { id: 'roma-ostiense', name: 'Ostiense', type: 'quartiere', parent: 'Roma', searchTerms: ['ostiense', 'roma ostiense'] },
  { id: 'roma-san-lorenzo', name: 'San Lorenzo', type: 'quartiere', parent: 'Roma', searchTerms: ['san lorenzo', 'roma san lorenzo'] },
  { id: 'roma-pigneto', name: 'Pigneto', type: 'quartiere', parent: 'Roma', searchTerms: ['pigneto', 'roma pigneto'] },
  { id: 'roma-esquilino', name: 'Esquilino', type: 'quartiere', parent: 'Roma', searchTerms: ['esquilino', 'roma esquilino'] },
  { id: 'roma-celio', name: 'Celio', type: 'quartiere', parent: 'Roma', searchTerms: ['celio', 'roma celio'] },
  { id: 'roma-aventino', name: 'Aventino', type: 'quartiere', parent: 'Roma', searchTerms: ['aventino', 'roma aventino'] },
  { id: 'roma-parioli', name: 'Parioli', type: 'quartiere', parent: 'Roma', searchTerms: ['parioli', 'roma parioli'] },
  { id: 'roma-flaminio', name: 'Flaminio', type: 'quartiere', parent: 'Roma', searchTerms: ['flaminio', 'roma flaminio'] },
  { id: 'roma-prati', name: 'Prati', type: 'quartiere', parent: 'Roma', searchTerms: ['prati', 'roma prati'] },
  { id: 'roma-borgo', name: 'Borgo', type: 'quartiere', parent: 'Roma', searchTerms: ['borgo', 'roma borgo'] },
  { id: 'roma-vaticano', name: 'Vaticano', type: 'quartiere', parent: 'Roma', searchTerms: ['vaticano', 'roma vaticano', 'città del vaticano'] },
  { id: 'roma-gianicolense', name: 'Gianicolense', type: 'quartiere', parent: 'Roma', searchTerms: ['gianicolense', 'roma gianicolense'] },
  { id: 'roma-aurelio', name: 'Aurelio', type: 'quartiere', parent: 'Roma', searchTerms: ['aurelio', 'roma aurelio'] },
];

// Servizio per la ricerca intelligente
export class ItalianLocationsService {
  private static instance: ItalianLocationsService;
  private locations: Location[] = MAJOR_LOCATIONS;

  private constructor() {}

  static getInstance(): ItalianLocationsService {
    if (!ItalianLocationsService.instance) {
      ItalianLocationsService.instance = new ItalianLocationsService();
    }
    return ItalianLocationsService.instance;
  }

  // Ricerca intelligente con fuzzy matching
  searchLocations(query: string): Location[] {
    if (!query || query.length < 2) return [];
    
    const searchQuery = query.toLowerCase().trim();
    const results: Array<{ location: Location; score: number }> = [];

    for (const location of this.locations) {
      let score = 0;
      
      // Ricerca esatta nel nome
      if (location.name.toLowerCase() === searchQuery) {
        score += 100;
      }
      // Ricerca parziale nel nome
      else if (location.name.toLowerCase().includes(searchQuery)) {
        score += 50;
      }
      
      // Ricerca nei termini di ricerca
      for (const term of location.searchTerms) {
        if (term.toLowerCase() === searchQuery) {
          score += 40;
        } else if (term.toLowerCase().includes(searchQuery)) {
          score += 20;
        }
      }
      
      // Ricerca nel parent
      if (location.parent && location.parent.toLowerCase().includes(searchQuery)) {
        score += 10;
      }
      
      // Bonus per tipo di località
      if (location.type === 'comune') score += 5;
      if (location.type === 'regione') score += 3;
      
      if (score > 0) {
        results.push({ location, score });
      }
    }

    // Ordina per punteggio e restituisci i migliori risultati
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map(result => result.location);
  }

  // Ottieni località per tipo
  getLocationsByType(type: Location['type']): Location[] {
    return this.locations.filter(loc => loc.type === type);
  }

  // Ottieni località per regione
  getLocationsByRegion(regionName: string): Location[] {
    return this.locations.filter(loc => 
      loc.parent === regionName || loc.name === regionName
    );
  }

  // Ottieni tutte le località
  getAllLocations(): Location[] {
    return [...this.locations];
  }

  // Aggiungi località personalizzate
  addCustomLocation(location: Location): void {
    if (!this.locations.find(loc => loc.id === location.id)) {
      this.locations.push(location);
    }
  }
}

// Esporta istanza singleton
export const italianLocationsService = ItalianLocationsService.getInstance();
