// Servizio di Localizzazione Avanzata per Urbanova AI
export interface LocationZone {
  id: string;
  name: string;
  type: 'quartiere' | 'zona' | 'comune' | 'provincia';
  parent?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  searchTerms: string[];
}

export interface LocationSearchResult {
  zone: LocationZone;
  relevance: number;
  searchUrl: string;
}

export class AdvancedLocationService {
  private romeZones: LocationZone[] = [
    // Quartieri centrali di Roma
    {
      id: 'centro-storico',
      name: 'Centro Storico',
      type: 'quartiere',
      searchTerms: ['centro storico', 'centro', 'roma centro'],
    },
    {
      id: 'trastevere',
      name: 'Trastevere',
      type: 'quartiere',
      searchTerms: ['trastevere', 'roma trastevere'],
    },
    {
      id: 'testaccio',
      name: 'Testaccio',
      type: 'quartiere',
      searchTerms: ['testaccio', 'roma testaccio'],
    },
    { id: 'monti', name: 'Monti', type: 'quartiere', searchTerms: ['monti', 'roma monti'] },
    {
      id: 'campo-marzio',
      name: 'Campo Marzio',
      type: 'quartiere',
      searchTerms: ['campo marzio', 'roma campo marzio'],
    },

    // Zone residenziali
    { id: 'paroli', name: 'Parioli', type: 'quartiere', searchTerms: ['parioli', 'roma parioli'] },
    {
      id: 'flaminio',
      name: 'Flaminio',
      type: 'quartiere',
      searchTerms: ['flaminio', 'roma flaminio'],
    },
    { id: 'salario', name: 'Salario', type: 'quartiere', searchTerms: ['salario', 'roma salario'] },
    {
      id: 'nomentano',
      name: 'Nomentano',
      type: 'quartiere',
      searchTerms: ['nomentano', 'roma nomentano'],
    },
    {
      id: 'tiburtino',
      name: 'Tiburtino',
      type: 'quartiere',
      searchTerms: ['tiburtino', 'roma tiburtino'],
    },

    // Zone periferiche
    {
      id: 'eur',
      name: 'EUR',
      type: 'quartiere',
      searchTerms: ['eur', 'roma eur', 'esposizione universale roma'],
    },
    {
      id: 'ostiense',
      name: 'Ostiense',
      type: 'quartiere',
      searchTerms: ['ostiense', 'roma ostiense'],
    },
    {
      id: 'garbatella',
      name: 'Garbatella',
      type: 'quartiere',
      searchTerms: ['garbatella', 'roma garbatella'],
    },
    {
      id: 'san-paolo',
      name: 'San Paolo',
      type: 'quartiere',
      searchTerms: ['san paolo', 'roma san paolo'],
    },
    { id: 'marconi', name: 'Marconi', type: 'quartiere', searchTerms: ['marconi', 'roma marconi'] },

    // Comuni della provincia di Roma
    {
      id: 'guidonia',
      name: 'Guidonia Montecelio',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['guidonia', 'guidonia montecelio'],
    },
    {
      id: 'fiumicino',
      name: 'Fiumicino',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['fiumicino'],
    },
    { id: 'pomezia', name: 'Pomezia', type: 'comune', parent: 'roma', searchTerms: ['pomezia'] },
    { id: 'velletri', name: 'Velletri', type: 'comune', parent: 'roma', searchTerms: ['velletri'] },
    {
      id: 'civitavecchia',
      name: 'Civitavecchia',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['civitavecchia'],
    },
    {
      id: 'albano-laziale',
      name: 'Albano Laziale',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['albano laziale', 'albano'],
    },
    { id: 'aricia', name: 'Ariccia', type: 'comune', parent: 'roma', searchTerms: ['aricia'] },
    {
      id: 'castel-gandolfo',
      name: 'Castel Gandolfo',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['castel gandolfo'],
    },
    { id: 'frascati', name: 'Frascati', type: 'comune', parent: 'roma', searchTerms: ['frascati'] },
    { id: 'marino', name: 'Marino', type: 'comune', parent: 'roma', searchTerms: ['marino'] },
    {
      id: 'montecompatri',
      name: 'Montecompatri',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['montecompatri'],
    },
    {
      id: 'rocca-priora',
      name: 'Rocca Priora',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['rocca priora'],
    },
    {
      id: 'rocca-di-papa',
      name: 'Rocca di Papa',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['rocca di papa'],
    },
    {
      id: 'genzano',
      name: 'Genzano di Roma',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['genzano', 'genzano di roma'],
    },
    { id: 'lanuvio', name: 'Lanuvio', type: 'comune', parent: 'roma', searchTerms: ['lanuvio'] },
    { id: 'nemi', name: 'Nemi', type: 'comune', parent: 'roma', searchTerms: ['nemi'] },
    { id: 'ardea', name: 'Ardea', type: 'comune', parent: 'roma', searchTerms: ['ardea'] },
    { id: 'anzi', name: 'Anzio', type: 'comune', parent: 'roma', searchTerms: ['anzio'] },
    { id: 'nettuno', name: 'Nettuno', type: 'comune', parent: 'roma', searchTerms: ['nettuno'] },
    {
      id: 'ladispoli',
      name: 'Ladispoli',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['ladispoli'],
    },
    {
      id: 'cerveteri',
      name: 'Cerveteri',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['cerveteri'],
    },
    {
      id: 'bracciano',
      name: 'Bracciano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['bracciano'],
    },
    {
      id: 'angullara',
      name: 'Anguillara Sabazia',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['anguillara', 'anguillara sabazia'],
    },
    {
      id: 'trevignano',
      name: 'Trevignano Romano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['trevignano', 'trevignano romano'],
    },
    {
      id: 'campagnano',
      name: 'Campagnano di Roma',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['campagnano', 'campagnano di roma'],
    },
    { id: 'formello', name: 'Formello', type: 'comune', parent: 'roma', searchTerms: ['formello'] },
    {
      id: 'sacrofano',
      name: 'Sacrofano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['sacrofano'],
    },
    {
      id: 'mazzano',
      name: 'Mazzano Romano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['mazzano', 'mazzano romano'],
    },
    { id: 'calcata', name: 'Calcata', type: 'comune', parent: 'roma', searchTerms: ['calcata'] },
    {
      id: 'fiano',
      name: 'Fiano Romano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['fiano', 'fiano romano'],
    },
    { id: 'capena', name: 'Capena', type: 'comune', parent: 'roma', searchTerms: ['capena'] },
    { id: 'morlupo', name: 'Morlupo', type: 'comune', parent: 'roma', searchTerms: ['morlupo'] },
    {
      id: 'castelnuovo',
      name: 'Castelnuovo di Porto',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['castelnuovo', 'castelnuovo di porto'],
    },
    { id: 'riano', name: 'Riano', type: 'comune', parent: 'roma', searchTerms: ['riano'] },
    {
      id: 'sant-oreste',
      name: "Sant'Oreste",
      type: 'comune',
      parent: 'roma',
      searchTerms: ["sant'oreste", 'sant oreste'],
    },
    {
      id: 'ponzano',
      name: 'Ponzano Romano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['ponzano', 'ponzano romano'],
    },
    {
      id: 'filacciano',
      name: 'Filacciano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['filacciano'],
    },
    {
      id: 'torrita',
      name: 'Torrita Tiberina',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['torrita', 'torrita tiberina'],
    },
    {
      id: 'montopoli',
      name: 'Montopoli di Sabina',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['montopoli', 'montopoli di sabina'],
    },
    {
      id: 'fara',
      name: 'Fara in Sabina',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['fara', 'fara in sabina'],
    },
    { id: 'toffia', name: 'Toffia', type: 'comune', parent: 'roma', searchTerms: ['toffia'] },
    { id: 'nerola', name: 'Nerola', type: 'comune', parent: 'roma', searchTerms: ['nerola'] },
    {
      id: 'montelibretti',
      name: 'Montelibretti',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['montelibretti'],
    },
    {
      id: 'marcellina',
      name: 'Marcellina',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['marcellina'],
    },
    {
      id: 'san-polo',
      name: 'San Polo dei Cavalieri',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['san polo', 'san polo dei cavalieri'],
    },
    { id: 'ticino', name: 'Tivoli', type: 'comune', parent: 'roma', searchTerms: ['tivoli'] },
    { id: 'vicovaro', name: 'Vicovaro', type: 'comune', parent: 'roma', searchTerms: ['vicovaro'] },
    { id: 'mandela', name: 'Mandela', type: 'comune', parent: 'roma', searchTerms: ['mandela'] },
    {
      id: 'roccagiovine',
      name: 'Roccagiovine',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['roccagiovine'],
    },
    { id: 'licenza', name: 'Licenza', type: 'comune', parent: 'roma', searchTerms: ['licenza'] },
    { id: 'percile', name: 'Percile', type: 'comune', parent: 'roma', searchTerms: ['percile'] },
    {
      id: 'cineto',
      name: 'Cineto Romano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['cineto', 'cineto romano'],
    },
    {
      id: 'poggio',
      name: 'Poggio Moiano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['poggio', 'poggio moiano'],
    },
    { id: 'orvinio', name: 'Orvinio', type: 'comune', parent: 'roma', searchTerms: ['orvinio'] },
    { id: 'carsoli', name: 'Carsoli', type: 'comune', parent: 'roma', searchTerms: ['carsoli'] },
    { id: 'pereto', name: 'Pereto', type: 'comune', parent: 'roma', searchTerms: ['pereto'] },
    {
      id: 'roccaserra',
      name: 'Rocca Serra',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['rocca serra'],
    },
    {
      id: 'tagliacozzo',
      name: 'Tagliacozzo',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['tagliacozzo'],
    },
    {
      id: 'sante-marie',
      name: 'Sante Marie',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['sante marie'],
    },
    {
      id: 'magliano',
      name: "Magliano de' Marsi",
      type: 'comune',
      parent: 'roma',
      searchTerms: ['magliano', 'magliano de marsi'],
    },
    {
      id: 'massad',
      name: "Massa d'Albe",
      type: 'comune',
      parent: 'roma',
      searchTerms: ["massa d'albe", 'massa dalbe'],
    },
    { id: 'ovindoli', name: 'Ovindoli', type: 'comune', parent: 'roma', searchTerms: ['ovindoli'] },
    { id: 'celano', name: 'Celano', type: 'comune', parent: 'roma', searchTerms: ['celano'] },
    { id: 'aielli', name: 'Aielli', type: 'comune', parent: 'roma', searchTerms: ['aielli'] },
    { id: 'cerchio', name: 'Cerchio', type: 'comune', parent: 'roma', searchTerms: ['cerchio'] },
    {
      id: 'collarmele',
      name: 'Collarmele',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['collarmele'],
    },
    { id: 'paterno', name: 'Paterno', type: 'comune', parent: 'roma', searchTerms: ['paterno'] },
    {
      id: 'san-benedetto',
      name: 'San Benedetto dei Marsi',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['san benedetto', 'san benedetto dei marsi'],
    },
    { id: 'trasacco', name: 'Trasacco', type: 'comune', parent: 'roma', searchTerms: ['trasacco'] },
    { id: 'lucoli', name: 'Lucoli', type: 'comune', parent: 'roma', searchTerms: ['lucoli'] },
    {
      id: 'rocca',
      name: 'Rocca di Mezzo',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['rocca di mezzo'],
    },
    {
      id: 'roccavalle',
      name: 'Rocca di Cambio',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['rocca di cambio'],
    },
    {
      id: "l'aquila",
      name: "L'Aquila",
      type: 'comune',
      parent: 'roma',
      searchTerms: ["l'aquila", 'laquila'],
    },
    { id: 'barete', name: 'Barete', type: 'comune', parent: 'roma', searchTerms: ['barete'] },
    {
      id: 'cagnano',
      name: 'Cagnano Amiterno',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['cagnano', 'cagnano amiterno'],
    },
    {
      id: 'campotosto',
      name: 'Campotosto',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['campotosto'],
    },
    {
      id: 'capistrello',
      name: 'Capistrello',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['capistrello'],
    },
    {
      id: 'caporciano',
      name: 'Caporciano',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['caporciano'],
    },
    {
      id: 'cappadocia',
      name: 'Cappadocia',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['cappadocia'],
    },
    { id: 'carsoli', name: 'Carsoli', type: 'comune', parent: 'roma', searchTerms: ['carsoli'] },
    {
      id: 'castel',
      name: 'Castel del Monte',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['castel del monte'],
    },
    {
      id: 'castellafiume',
      name: 'Castellafiume',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['castellafiume'],
    },
    {
      id: 'castelvecchio',
      name: 'Castelvecchio Subequo',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['castelvecchio', 'castelvecchio subequo'],
    },
    {
      id: 'civitella',
      name: 'Civitella Roveto',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['civitella', 'civitella roveto'],
    },
    { id: 'cocullo', name: 'Cocullo', type: 'comune', parent: 'roma', searchTerms: ['cocullo'] },
    { id: 'corfinio', name: 'Corfinio', type: 'comune', parent: 'roma', searchTerms: ['corfinio'] },
    {
      id: 'fagnano',
      name: 'Fagnano Alto',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['fagnano', 'fagnano alto'],
    },
    { id: 'fossa', name: 'Fossa', type: 'comune', parent: 'roma', searchTerms: ['fossa'] },
    {
      id: 'gagliano',
      name: 'Gagliano Aterno',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['gagliano', 'gagliano aterno'],
    },
    {
      id: 'goriano',
      name: 'Goriano Sicoli',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['goriano', 'goriano sicoli'],
    },
    {
      id: 'introdacqua',
      name: 'Introdacqua',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['introdacqua'],
    },
    {
      id: "l'aquila",
      name: "L'Aquila",
      type: 'comune',
      parent: 'roma',
      searchTerms: ["l'aquila", 'laquila'],
    },
    {
      id: 'lecce',
      name: 'Lecce nei Marsi',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['lecce', 'lecce nei marsi'],
    },
    {
      id: 'luco',
      name: 'Luco dei Marsi',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['luco', 'luco dei marsi'],
    },
    { id: 'malegno', name: 'Malegno', type: 'comune', parent: 'roma', searchTerms: ['malegno'] },
    {
      id: 'massa',
      name: "Massa d'Albe",
      type: 'comune',
      parent: 'roma',
      searchTerms: ["massa d'albe", 'massa dalbe'],
    },
    {
      id: 'molina',
      name: 'Molina Aterno',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['molina', 'molina aterno'],
    },
    {
      id: 'montereale',
      name: 'Montereale',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['montereale'],
    },
    { id: 'morino', name: 'Morino', type: 'comune', parent: 'roma', searchTerms: ['morino'] },
    { id: 'navelli', name: 'Navelli', type: 'comune', parent: 'roma', searchTerms: ['navelli'] },
    { id: 'opena', name: 'Ocre', type: 'comune', parent: 'roma', searchTerms: ['ocre'] },
    { id: 'ofena', name: 'Ofena', type: 'comune', parent: 'roma', searchTerms: ['ofena'] },
    { id: 'paganica', name: 'Paganica', type: 'comune', parent: 'roma', searchTerms: ['paganica'] },
    {
      id: 'pettorano',
      name: 'Pettorano sul Gizio',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['pettorano', 'pettorano sul gizio'],
    },
    { id: 'pizzoli', name: 'Pizzoli', type: 'comune', parent: 'roma', searchTerms: ['pizzoli'] },
    {
      id: 'poggio',
      name: 'Poggio Picenze',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['poggio', 'poggio picenze'],
    },
    {
      id: 'prata',
      name: "Prata d'Ansidonia",
      type: 'comune',
      parent: 'roma',
      searchTerms: ['prata', "prata d'ansidonia"],
    },
    { id: 'prezza', name: 'Prezza', type: 'comune', parent: 'roma', searchTerms: ['prezza'] },
    { id: 'raiano', name: 'Raiano', type: 'comune', parent: 'roma', searchTerms: ['raiano'] },
    {
      id: 'roccacasale',
      name: 'Rocca Casale',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['rocca casale'],
    },
    { id: 'roccap', name: 'Rocca Pia', type: 'comune', parent: 'roma', searchTerms: ['rocca pia'] },
    {
      id: 'roccaraso',
      name: 'Roccaraso',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['roccaraso'],
    },
    {
      id: 'san-benedetto',
      name: 'San Benedetto in Perillis',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['san benedetto', 'san benedetto in perillis'],
    },
    {
      id: 'san-demetrio',
      name: "San Demetrio ne' Vestini",
      type: 'comune',
      parent: 'roma',
      searchTerms: ['san demetrio', 'san demetrio ne vestini'],
    },
    {
      id: 'san-pio',
      name: 'San Pio delle Camere',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['san pio', 'san pio delle camere'],
    },
    {
      id: 'sante-marie',
      name: 'Sante Marie',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['sante marie'],
    },
    {
      id: 'sant-eusanio',
      name: "Sant'Eusanio Forconese",
      type: 'comune',
      parent: 'roma',
      searchTerms: ["sant'eusanio", 'sant eusanio forconese'],
    },
    {
      id: 'santo-stefano',
      name: 'Santo Stefano di Sessanio',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['santo stefano', 'santo stefano di sessanio'],
    },
    { id: 'scanno', name: 'Scanno', type: 'comune', parent: 'roma', searchTerms: ['scanno'] },
    {
      id: 'scurcola',
      name: 'Scurcola Marsicana',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['scurcola', 'scurcola marsicana'],
    },
    { id: 'secinaro', name: 'Secinaro', type: 'comune', parent: 'roma', searchTerms: ['secinaro'] },
    { id: 'sulmona', name: 'Sulmona', type: 'comune', parent: 'roma', searchTerms: ['sulmona'] },
    {
      id: 'tagliacozzo',
      name: 'Tagliacozzo',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['tagliacozzo'],
    },
    {
      id: 'tione',
      name: 'Tione degli Abruzzi',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['tione', 'tione degli abruzzi'],
    },
    {
      id: 'tornimparte',
      name: 'Tornimparte',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['tornimparte'],
    },
    { id: 'trasacco', name: 'Trasacco', type: 'comune', parent: 'roma', searchTerms: ['trasacco'] },
    {
      id: 'villa',
      name: "Villa Sant'Angelo",
      type: 'comune',
      parent: 'roma',
      searchTerms: ['villa', "villa sant'angelo"],
    },
    {
      id: 'villa-santa',
      name: 'Villa Santa Lucia degli Abruzzi',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['villa santa', 'villa santa lucia degli abruzzi'],
    },
    {
      id: 'vittorito',
      name: 'Vittorito',
      type: 'comune',
      parent: 'roma',
      searchTerms: ['vittorito'],
    },
  ];

  private milanZones: LocationZone[] = [
    // Quartieri di Milano
    {
      id: 'centro-milano',
      name: 'Centro Milano',
      type: 'quartiere',
      searchTerms: ['centro milano', 'milano centro'],
    },
    { id: 'brera', name: 'Brera', type: 'quartiere', searchTerms: ['brera', 'milano brera'] },
    {
      id: 'navigli',
      name: 'Navigli',
      type: 'quartiere',
      searchTerms: ['navigli', 'milano navigli'],
    },
    {
      id: 'porta-romana',
      name: 'Porta Romana',
      type: 'quartiere',
      searchTerms: ['porta romana', 'milano porta romana'],
    },
    {
      id: 'porta-venezia',
      name: 'Porta Venezia',
      type: 'quartiere',
      searchTerms: ['porta venezia', 'milano porta venezia'],
    },
    {
      id: 'porta-nuova',
      name: 'Porta Nuova',
      type: 'quartiere',
      searchTerms: ['porta nuova', 'milano porta nuova'],
    },
    { id: 'isola', name: 'Isola', type: 'quartiere', searchTerms: ['isola', 'milano isola'] },
    {
      id: 'garibaldi',
      name: 'Garibaldi',
      type: 'quartiere',
      searchTerms: ['garibaldi', 'milano garibaldi'],
    },
    {
      id: 'corso-italia',
      name: 'Corso Italia',
      type: 'quartiere',
      searchTerms: ['corso italia', 'milano corso italia'],
    },
    {
      id: 'san-babila',
      name: 'San Babila',
      type: 'quartiere',
      searchTerms: ['san babila', 'milano san babila'],
    },

    // Comuni della provincia di Milano
    { id: 'monza', name: 'Monza', type: 'comune', parent: 'milano', searchTerms: ['monza'] },
    {
      id: 'sesto-san-giovanni',
      name: 'Sesto San Giovanni',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['sesto san giovanni', 'sesto'],
    },
    {
      id: 'cologno-monzese',
      name: 'Cologno Monzese',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['cologno monzese', 'cologno'],
    },
    {
      id: 'cernusco-sul-naviglio',
      name: 'Cernusco sul Naviglio',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['cernusco sul naviglio', 'cernusco'],
    },
    {
      id: 'pioltello',
      name: 'Pioltello',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['pioltello'],
    },
    { id: 'segrate', name: 'Segrate', type: 'comune', parent: 'milano', searchTerms: ['segrate'] },
    {
      id: 'san-donato-milanese',
      name: 'San Donato Milanese',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['san donato milanese', 'san donato'],
    },
    {
      id: 'peschiera-borromeo',
      name: 'Peschiera Borromeo',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['peschiera borromeo', 'peschiera'],
    },
    { id: 'lodi', name: 'Lodi', type: 'comune', parent: 'milano', searchTerms: ['lodi'] },
    {
      id: 'busto-arsizio',
      name: 'Busto Arsizio',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['busto arsizio', 'busto'],
    },
    { id: 'legnano', name: 'Legnano', type: 'comune', parent: 'milano', searchTerms: ['legnano'] },
    {
      id: 'gallarate',
      name: 'Gallarate',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['gallarate'],
    },
    { id: 'varese', name: 'Varese', type: 'comune', parent: 'milano', searchTerms: ['varese'] },
    { id: 'como', name: 'Como', type: 'comune', parent: 'milano', searchTerms: ['como'] },
    { id: 'lecco', name: 'Lecco', type: 'comune', parent: 'milano', searchTerms: ['lecco'] },
    { id: 'bergamo', name: 'Bergamo', type: 'comune', parent: 'milano', searchTerms: ['bergamo'] },
    { id: 'brescia', name: 'Brescia', type: 'comune', parent: 'milano', searchTerms: ['brescia'] },
    { id: 'cremona', name: 'Cremona', type: 'comune', parent: 'milano', searchTerms: ['cremona'] },
    { id: 'mantova', name: 'Mantova', type: 'comune', parent: 'milano', searchTerms: ['mantova'] },
    { id: 'pavia', name: 'Pavia', type: 'comune', parent: 'milano', searchTerms: ['pavia'] },
    {
      id: 'alessandria',
      name: 'Alessandria',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['alessandria'],
    },
    { id: 'novara', name: 'Novara', type: 'comune', parent: 'milano', searchTerms: ['novara'] },
    {
      id: 'vercelli',
      name: 'Vercelli',
      type: 'comune',
      parent: 'milano',
      searchTerms: ['vercelli'],
    },
    { id: 'biella', name: 'Biella', type: 'comune', parent: 'milano', searchTerms: ['biella'] },
    { id: 'torino', name: 'Torino', type: 'comune', parent: 'milano', searchTerms: ['torino'] },
  ];

  private naplesZones: LocationZone[] = [
    // Quartieri di Napoli
    {
      id: 'centro-napoli',
      name: 'Centro Napoli',
      type: 'quartiere',
      searchTerms: ['centro napoli', 'napoli centro'],
    },
    { id: 'chiaia', name: 'Chiaia', type: 'quartiere', searchTerms: ['chiaia', 'napoli chiaia'] },
    {
      id: 'posillipo',
      name: 'Posillipo',
      type: 'quartiere',
      searchTerms: ['posillipo', 'napoli posillipo'],
    },
    { id: 'vomero', name: 'Vomero', type: 'quartiere', searchTerms: ['vomero', 'napoli vomero'] },
    {
      id: 'fuorigrotta',
      name: 'Fuorigrotta',
      type: 'quartiere',
      searchTerms: ['fuorigrotta', 'napoli fuorigrotta'],
    },
    {
      id: 'bagnoli',
      name: 'Bagnoli',
      type: 'quartiere',
      searchTerms: ['bagnoli', 'napoli bagnoli'],
    },
    {
      id: 'pianura',
      name: 'Pianura',
      type: 'quartiere',
      searchTerms: ['pianura', 'napoli pianura'],
    },
    {
      id: 'soccavo',
      name: 'Soccavo',
      type: 'quartiere',
      searchTerms: ['soccavo', 'napoli soccavo'],
    },
    {
      id: 'arenella',
      name: 'Arenella',
      type: 'quartiere',
      searchTerms: ['arenella', 'napoli arenella'],
    },
    {
      id: 'san-fernando',
      name: 'San Ferdinando',
      type: 'quartiere',
      searchTerms: ['san ferdinando', 'napoli san ferdinando'],
    },

    // Comuni della provincia di Napoli
    {
      id: 'giugliano',
      name: 'Giugliano in Campania',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['giugliano', 'giugliano in campania'],
    },
    { id: 'casoria', name: 'Casoria', type: 'comune', parent: 'napoli', searchTerms: ['casoria'] },
    {
      id: 'afragola',
      name: 'Afragola',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['afragola'],
    },
    { id: 'portici', name: 'Portici', type: 'comune', parent: 'napoli', searchTerms: ['portici'] },
    {
      id: 'ercolano',
      name: 'Ercolano',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['ercolano'],
    },
    {
      id: 'torre-del-greco',
      name: 'Torre del Greco',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['torre del greco', 'torre greco'],
    },
    { id: 'pompei', name: 'Pompei', type: 'comune', parent: 'napoli', searchTerms: ['pompei'] },
    {
      id: 'castellammare-di-stabia',
      name: 'Castellammare di Stabia',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['castellammare di stabia', 'castellammare'],
    },
    {
      id: 'sorrento',
      name: 'Sorrento',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['sorrento'],
    },
    { id: 'salerno', name: 'Salerno', type: 'comune', parent: 'napoli', searchTerms: ['salerno'] },
    {
      id: 'benevento',
      name: 'Benevento',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['benevento'],
    },
    {
      id: 'avellino',
      name: 'Avellino',
      type: 'comune',
      parent: 'napoli',
      searchTerms: ['avellino'],
    },
    { id: 'caserta', name: 'Caserta', type: 'comune', parent: 'napoli', searchTerms: ['caserta'] },
  ];

  // Cerca zone per una localizzazione
  searchLocations(query: string): LocationSearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    const results: LocationSearchResult[] = [];

    // Combina tutte le zone
    const allZones = [...this.romeZones, ...this.milanZones, ...this.naplesZones];

    allZones.forEach(zone => {
      let relevance = 0;

      // Controlla match esatto
      if (zone.name.toLowerCase() === normalizedQuery) {
        relevance = 100;
      }
      // Controlla match parziale nel nome
      else if (zone.name.toLowerCase().includes(normalizedQuery)) {
        relevance = 80;
      }
      // Controlla match nei termini di ricerca
      else if (zone.searchTerms.some(term => term.toLowerCase().includes(normalizedQuery))) {
        relevance = 60;
      }
      // Controlla match parziale nei termini di ricerca
      else if (zone.searchTerms.some(term => normalizedQuery.includes(term.toLowerCase()))) {
        relevance = 40;
      }

      if (relevance > 0) {
        results.push({
          zone,
          relevance,
          searchUrl: this.generateSearchUrl(zone),
        });
      }
    });

    // Ordina per rilevanza
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Genera URL di ricerca per una zona
  generateSearchUrl(zone: LocationZone): string {
    const searchTerm = zone.searchTerms[0] || zone.name;
    return encodeURIComponent(searchTerm);
  }

  // Ottieni tutte le zone di una città
  getCityZones(city: string): LocationZone[] {
    const normalizedCity = city.toLowerCase();

    switch (normalizedCity) {
      case 'roma':
      case 'rome':
        return this.romeZones;
      case 'milano':
      case 'milan':
        return this.milanZones;
      case 'napoli':
      case 'naples':
        return this.naplesZones;
      default:
        return [];
    }
  }

  // Ottieni zone per tipo
  getZonesByType(city: string, type: 'quartiere' | 'comune'): LocationZone[] {
    return this.getCityZones(city).filter(zone => zone.type === type);
  }

  // Suggerimenti intelligenti
  getSuggestions(query: string): string[] {
    const results = this.searchLocations(query);
    return results.slice(0, 10).map(result => result.zone.name);
  }
}

export const advancedLocationService = new AdvancedLocationService();
