'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchIcon, MapIcon, XIcon, PlusIcon, TagIcon } from '@/components/icons';

interface Location {
  id: string;
  name: string;
  type: 'comune' | 'provincia' | 'regione' | 'quartiere' | 'zona';
  parent?: string;
  searchTerms: string[];
  coordinates?: { lat: number; lng: number };
}

interface MultiLocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

// Database completo delle località italiane
const ITALIAN_LOCATIONS: Location[] = [
  // Regioni
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

  // Province del Lazio
  { id: 'roma', name: 'Roma', type: 'provincia', parent: 'Lazio', searchTerms: ['roma', 'romano', 'caput mundi'] },
  { id: 'latina', name: 'Latina', type: 'provincia', parent: 'Lazio', searchTerms: ['latina', 'pontino'] },
  { id: 'frosinone', name: 'Frosinone', type: 'provincia', parent: 'Lazio', searchTerms: ['frosinone', 'ciociaro'] },
  { id: 'viterbo', name: 'Viterbo', type: 'provincia', parent: 'Lazio', searchTerms: ['viterbo', 'tuscia'] },
  { id: 'rieti', name: 'Rieti', type: 'provincia', parent: 'Lazio', searchTerms: ['rieti', 'sabino'] },

  // Comuni principali del Lazio
  { id: 'roma-comune', name: 'Roma', type: 'comune', parent: 'Roma', searchTerms: ['roma', 'capitale', 'eterna'] },
  { id: 'latina-comune', name: 'Latina', type: 'comune', parent: 'Latina', searchTerms: ['latina', 'pontina', 'littoria'] },
  { id: 'frosinone-comune', name: 'Frosinone', type: 'comune', parent: 'Frosinone', searchTerms: ['frosinone', 'ciociaria'] },
  { id: 'viterbo-comune', name: 'Viterbo', type: 'comune', parent: 'Viterbo', searchTerms: ['viterbo', 'tuscia'] },
  { id: 'rieti-comune', name: 'Rieti', type: 'comune', parent: 'Rieti', searchTerms: ['rieti', 'sabina'] },
  { id: 'cassino', name: 'Cassino', type: 'comune', parent: 'Frosinone', searchTerms: ['cassino', 'montecassino'] },
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
  { id: 'privero', name: 'Priverno', type: 'comune', parent: 'Latina', searchTerms: ['priverno', 'priverano'] },
  { id: 'prossedi', name: 'Prossedi', type: 'comune', parent: 'Latina', searchTerms: ['prossedi', 'prossedano'] },
  { id: 'roccagorga', name: 'Roccagorga', type: 'comune', parent: 'Latina', searchTerms: ['roccagorga', 'roccagorgano'] },
  { id: 'roccamassima', name: 'Roccamassima', type: 'comune', parent: 'Latina', searchTerms: ['roccamassima', 'roccamassimano'] },
  { id: 'roccasecca-dei-volsci', name: 'Roccasecca dei Volsci', type: 'comune', parent: 'Latina', searchTerms: ['roccasecca dei volsci'] },
  { id: 'san-giovanni-incarico', name: 'San Giovanni Incarico', type: 'comune', parent: 'Frosinone', searchTerms: ['san giovanni incarico'] },
  { id: 'santi-cosma-e-damiano', name: 'Santi Cosma e Damiano', type: 'comune', parent: 'Latina', searchTerms: ['santi cosma e damiano'] },
  { id: 'serrone', name: 'Serrone', type: 'comune', parent: 'Frosinone', searchTerms: ['serrone', 'serronese'] },
  { id: 'sezze', name: 'Sezze', type: 'comune', parent: 'Latina', searchTerms: ['sezze', 'setino'] },
  { id: 'sonnino', name: 'Sonnino', type: 'comune', parent: 'Latina', searchTerms: ['sonnino', 'sonninese'] },
  { id: 'sperlonga', name: 'Sperlonga', type: 'comune', parent: 'Latina', searchTerms: ['sperlonga', 'sperlongano'] },
  { id: 'spigno-saturnia', name: 'Spigno Saturnia', type: 'comune', parent: 'Latina', searchTerms: ['spigno saturnia'] },
  { id: 'ventotene', name: 'Ventotene', type: 'comune', parent: 'Latina', searchTerms: ['ventotene', 'ventotenese'] },

  // Quartieri di Roma
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
  { id: 'roma-trastevere', name: 'Trastevere', type: 'quartiere', parent: 'Roma', searchTerms: ['trastevere', 'roma trastevere'] },
  { id: 'roma-ostiense', name: 'Ostiense', type: 'quartiere', parent: 'Roma', searchTerms: ['ostiense', 'roma ostiense'] },
  { id: 'roma-ardea', name: 'Ardea', type: 'quartiere', parent: 'Roma', searchTerms: ['ardea', 'roma ardea'] },
  { id: 'roma-pomezia', name: 'Pomezia', type: 'quartiere', parent: 'Roma', searchTerms: ['pomezia', 'roma pomezia'] },
  { id: 'roma-albano-laziale', name: 'Albano Laziale', type: 'quartiere', parent: 'Roma', searchTerms: ['albano laziale', 'roma albano'] },
  { id: 'roma-castel-gandolfo', name: 'Castel Gandolfo', type: 'quartiere', parent: 'Roma', searchTerms: ['castel gandolfo', 'roma castel gandolfo'] },
  { id: 'roma-frascati', name: 'Frascati', type: 'quartiere', parent: 'Roma', searchTerms: ['frascati', 'roma frascati'] },
  { id: 'roma-grottaferrata', name: 'Grottaferrata', type: 'quartiere', parent: 'Roma', searchTerms: ['grottaferrata', 'roma grottaferrata'] },
  { id: 'roma-marina-di-cerveteri', name: 'Marina di Cerveteri', type: 'quartiere', parent: 'Roma', searchTerms: ['marina di cerveteri', 'roma marina cerveteri'] },
  { id: 'roma-santa-marinella', name: 'Santa Marinella', type: 'quartiere', parent: 'Roma', searchTerms: ['santa marinella', 'roma santa marinella'] },
  { id: 'roma-civitavecchia', name: 'Civitavecchia', type: 'quartiere', parent: 'Roma', searchTerms: ['civitavecchia', 'roma civitavecchia'] },
  { id: 'roma-tarquinia', name: 'Tarquinia', type: 'quartiere', parent: 'Roma', searchTerms: ['tarquinia', 'roma tarquinia'] },
  { id: 'roma-viterbo', name: 'Viterbo', type: 'quartiere', parent: 'Roma', searchTerms: ['viterbo', 'roma viterbo'] },
  { id: 'roma-rieti', name: 'Rieti', type: 'quartiere', parent: 'Roma', searchTerms: ['rieti', 'roma rieti'] },
  { id: 'roma-frosinone', name: 'Frosinone', type: 'quartiere', parent: 'Roma', searchTerms: ['frosinone', 'roma frosinone'] },
  { id: 'roma-latina', name: 'Latina', type: 'quartiere', parent: 'Roma', searchTerms: ['latina', 'roma latina'] },

  // Altre città importanti
  { id: 'milano', name: 'Milano', type: 'comune', parent: 'Lombardia', searchTerms: ['milano', 'milanese'] },
  { id: 'torino', name: 'Torino', type: 'comune', parent: 'Piemonte', searchTerms: ['torino', 'torinese'] },
  { id: 'napoli', name: 'Napoli', type: 'comune', parent: 'Campania', searchTerms: ['napoli', 'napoletano'] },
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
  { id: 'verona', name: 'Verona', type: 'comune', parent: 'Veneto', searchTerms: ['verona', 'veronese'] },
  { id: 'vicenza', name: 'Vicenza', type: 'comune', parent: 'Veneto', searchTerms: ['vicenza', 'vicentino'] },
  { id: 'viterbo', name: 'Viterbo', type: 'comune', parent: 'Lazio', searchTerms: ['viterbo', 'viterbese'] },
  { id: 'rieti', name: 'Rieti', type: 'comune', parent: 'Lazio', searchTerms: ['rieti', 'reatino'] },
  { id: 'frosinone', name: 'Frosinone', type: 'comune', parent: 'Lazio', searchTerms: ['frosinone', 'frusinate'] },
  { id: 'latina', name: 'Latina', type: 'comune', parent: 'Lazio', searchTerms: ['latina', 'pontino'] },
];

export default function MultiLocationSelector({
  value,
  onChange,
  placeholder = "Cerca localizzazioni...",
  className = ""
}: MultiLocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Gestione click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ricerca suggerimenti
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Debounce per evitare troppe ricerche
    const timeoutId = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = ITALIAN_LOCATIONS.filter(location => 
        location.name.toLowerCase().includes(query) ||
        location.searchTerms.some(term => term.toLowerCase().includes(query)) ||
        (location.parent && location.parent.toLowerCase().includes(query))
      ).slice(0, 15);
      
      setSuggestions(results);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (location: Location) => {
    if (!selectedLocations.find(loc => loc.id === location.id)) {
      const newSelectedLocations = [...selectedLocations, location];
      setSelectedLocations(newSelectedLocations);
      updateValue(newSelectedLocations);
    }
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeLocation = (locationId: string) => {
    const newSelectedLocations = selectedLocations.filter(loc => loc.id !== locationId);
    setSelectedLocations(newSelectedLocations);
    updateValue(newSelectedLocations);
  };

  const updateValue = (locations: Location[]) => {
    if (locations.length === 0) {
      onChange('');
    } else if (locations.length === 1) {
      onChange(locations[0].name);
    } else {
      onChange(locations.map(loc => loc.name).join(', '));
    }
  };

  const getLocationIcon = (location: Location) => {
    switch (location.type) {
      case 'regione':
        return <MapIcon className="w-4 h-4 text-purple-500" />;
      case 'provincia':
        return <MapIcon className="w-4 h-4 text-blue-500" />;
      case 'comune':
        return <MapIcon className="w-4 h-4 text-green-500" />;
      case 'quartiere':
        return <MapIcon className="w-4 h-4 text-orange-500" />;
      case 'zona':
        return <MapIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MapIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLocationBadge = (location: Location) => {
    switch (location.type) {
      case 'regione':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Regione</span>;
      case 'provincia':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Provincia</span>;
      case 'comune':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Comune</span>;
      case 'quartiere':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Quartiere</span>;
      case 'zona':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Zona</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Località</span>;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input principale */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedLocations.length > 0 ? "Aggiungi altre località..." : placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Località selezionate */}
      {selectedLocations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm"
            >
              {getLocationIcon(location)}
              <span className="text-blue-900">{location.name}</span>
              {getLocationBadge(location)}
              <button
                onClick={() => removeLocation(location.id)}
                className="text-blue-400 hover:text-blue-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown suggerimenti */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Ricerca in corso...
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSuggestionClick(location)}
                  disabled={selectedLocations.find(loc => loc.id === location.id)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                    selectedLocations.find(loc => loc.id === location.id) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getLocationIcon(location)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {location.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {location.parent ? location.parent : location.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getLocationBadge(location)}
                      {selectedLocations.find(loc => loc.id === location.id) && (
                        <span className="text-xs text-green-600">✓ Selezionata</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Nessuna localizzazione trovata per "{searchQuery}"
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Inizia a digitare per cercare localizzazioni...
            </div>
          )}
        </div>
      )}

      {/* Informazioni aggiuntive */}
      {selectedLocations.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TagIcon className="w-4 h-4" />
            <span>Ricerca in {selectedLocations.length} località</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            La ricerca verrà eseguita in tutte le località selezionate
          </div>
        </div>
      )}
    </div>
  );
}
