/**
 * 📚 BUDGET SUPPLIERS LIBRARIES
 * 
 * Librerie di voci per computo metrico - Benchmark Lazio 2023
 */

export interface LibraryItem {
  id: string;
  code: string;
  description: string;
  category: 'OPERE' | 'FORNITURE' | 'SICUREZZA' | 'CANTIERIZZAZIONE' | 'ESTERNE_ALTRO';
  uom: 'mq' | 'mc' | 'kg' | 'pz' | 'h' | 'ml' | 'q.le' | 'altra';
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  notes?: string;
  source: string;
}

export interface Library {
  id: string;
  name: string;
  description: string;
  version: string;
  region: string;
  year: number;
  type: 'benchmark' | 'custom' | 'historical';
  items: LibraryItem[];
  metadata: {
    lastUpdated: string;
    totalItems: number;
    categories: string[];
  };
}

// Benchmark Lazio 2023 - Allegato A (Mock Data)
export const lazioBenchmark2023: Library = {
  id: 'lazio-benchmark-2023',
  name: 'Urbanova — Lazio 2023 (Allegato A)',
  description: 'Benchmark prezzi costruzione Regione Lazio - Allegato A DGR',
  version: '1.0',
  region: 'Lazio',
  year: 2023,
  type: 'benchmark',
  items: [
    // OPERE
    {
      id: 'lz-001',
      code: '001',
      description: 'Scavi e sbancamenti in terra comune',
      category: 'OPERE',
      uom: 'mc',
      priceRange: { min: 8.50, max: 12.00, average: 10.25 },
      notes: 'Incluso trasporto e smaltimento',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-002',
      code: '002',
      description: 'Fondazioni continue in c.a. ordinario',
      category: 'OPERE',
      uom: 'mc',
      priceRange: { min: 180.00, max: 220.00, average: 200.00 },
      notes: 'Classe Rck 25/30',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-003',
      code: '003',
      description: 'Struttura portante in c.a. ordinario',
      category: 'OPERE',
      uom: 'mc',
      priceRange: { min: 320.00, max: 380.00, average: 350.00 },
      notes: 'Classe Rck 30/37',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-004',
      code: '004',
      description: 'Murature in laterizio forato 12 cm',
      category: 'OPERE',
      uom: 'mq',
      priceRange: { min: 25.00, max: 35.00, average: 30.00 },
      notes: 'Incluso malta e manodopera',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-005',
      code: '005',
      description: 'Intonaco civile interno',
      category: 'OPERE',
      uom: 'mq',
      priceRange: { min: 12.00, max: 18.00, average: 15.00 },
      notes: 'Spessore 1.5 cm',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-006',
      code: '006',
      description: 'Intonaco civile esterno',
      category: 'OPERE',
      uom: 'mq',
      priceRange: { min: 18.00, max: 25.00, average: 21.50 },
      notes: 'Spessore 2 cm, impermeabilizzato',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-007',
      code: '007',
      description: 'Pavimento in gres porcellanato',
      category: 'OPERE',
      uom: 'mq',
      priceRange: { min: 28.00, max: 45.00, average: 36.50 },
      notes: 'Incluso posa e fughe',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-008',
      code: '008',
      description: 'Rivestimento bagno in ceramica',
      category: 'OPERE',
      uom: 'mq',
      priceRange: { min: 35.00, max: 55.00, average: 45.00 },
      notes: 'Incluso posa e fughe',
      source: 'Lazio 2023'
    },

    // FORNITURE
    {
      id: 'lz-009',
      code: '009',
      description: 'Impianto elettrico civile',
      category: 'FORNITURE',
      uom: 'mq',
      priceRange: { min: 25.00, max: 35.00, average: 30.00 },
      notes: 'Incluso materiali e posa',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-010',
      code: '010',
      description: 'Impianto idrico civile',
      category: 'FORNITURE',
      uom: 'mq',
      priceRange: { min: 20.00, max: 30.00, average: 25.00 },
      notes: 'Incluso materiali e posa',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-011',
      code: '011',
      description: 'Impianto termico autonomo',
      category: 'FORNITURE',
      uom: 'mq',
      priceRange: { min: 45.00, max: 65.00, average: 55.00 },
      notes: 'Caldaia a condensazione',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-012',
      code: '012',
      description: 'Serramenti esterni in PVC',
      category: 'FORNITURE',
      uom: 'mq',
      priceRange: { min: 180.00, max: 250.00, average: 215.00 },
      notes: 'Incluso installazione',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-013',
      code: '013',
      description: 'Porta blindata classe 2',
      category: 'FORNITURE',
      uom: 'pz',
      priceRange: { min: 450.00, max: 650.00, average: 550.00 },
      notes: 'Incluso installazione',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-014',
      code: '014',
      description: 'Sanitari completo bagno',
      category: 'FORNITURE',
      uom: 'pz',
      priceRange: { min: 800.00, max: 1200.00, average: 1000.00 },
      notes: 'WC, bidet, lavabo, doccia',
      source: 'Lazio 2023'
    },

    // SICUREZZA
    {
      id: 'lz-015',
      code: '015',
      description: 'Sistema antincendio classe A',
      category: 'SICUREZZA',
      uom: 'pz',
      priceRange: { min: 12000.00, max: 18000.00, average: 15000.00 },
      notes: 'Per edificio residenziale',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-016',
      code: '016',
      description: 'Impianto videosorveglianza',
      category: 'SICUREZZA',
      uom: 'pz',
      priceRange: { min: 2500.00, max: 4000.00, average: 3250.00 },
      notes: '4 telecamere + centrale',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-017',
      code: '017',
      description: 'Sistema allarme perimetrale',
      category: 'SICUREZZA',
      uom: 'pz',
      priceRange: { min: 1800.00, max: 2800.00, average: 2300.00 },
      notes: 'Sensori perimetrali',
      source: 'Lazio 2023'
    },

    // CANTIERIZZAZIONE
    {
      id: 'lz-018',
      code: '018',
      description: 'Recinzione cantiere temporanea',
      category: 'CANTIERIZZAZIONE',
      uom: 'mq',
      priceRange: { min: 15.00, max: 25.00, average: 20.00 },
      notes: 'Pannelli modulari',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-019',
      code: '019',
      description: 'Baracca cantiere ufficio',
      category: 'CANTIERIZZAZIONE',
      uom: 'pz',
      priceRange: { min: 8000.00, max: 12000.00, average: 10000.00 },
      notes: 'Modulo 6x3m',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-020',
      code: '020',
      description: 'Gru a torre 8 tonnellate',
      category: 'CANTIERIZZAZIONE',
      uom: 'h',
      priceRange: { min: 45.00, max: 65.00, average: 55.00 },
      notes: 'Noleggio mensile',
      source: 'Lazio 2023'
    },

    // ESTERNE_ALTRO
    {
      id: 'lz-021',
      code: '021',
      description: 'Pavimentazione esterna in asfalto',
      category: 'ESTERNE_ALTRO',
      uom: 'mq',
      priceRange: { min: 18.00, max: 28.00, average: 23.00 },
      notes: 'Spessore 5 cm',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-022',
      code: '022',
      description: 'Manto erboso seminato',
      category: 'ESTERNE_ALTRO',
      uom: 'mq',
      priceRange: { min: 8.00, max: 15.00, average: 11.50 },
      notes: 'Incluso preparazione terreno',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-023',
      code: '023',
      description: 'Illuminazione esterna LED',
      category: 'ESTERNE_ALTRO',
      uom: 'pz',
      priceRange: { min: 120.00, max: 200.00, average: 160.00 },
      notes: 'Incluso installazione',
      source: 'Lazio 2023'
    },
    {
      id: 'lz-024',
      code: '024',
      description: 'Cancello automatico elettrico',
      category: 'ESTERNE_ALTRO',
      uom: 'pz',
      priceRange: { min: 2500.00, max: 4000.00, average: 3250.00 },
      notes: 'Incluso installazione',
      source: 'Lazio 2023'
    }
  ],
  metadata: {
    lastUpdated: '2023-12-31',
    totalItems: 24,
    categories: ['OPERE', 'FORNITURE', 'SICUREZZA', 'CANTIERIZZAZIONE', 'ESTERNE_ALTRO']
  }
};

// Libreria utente personalizzata (vuota inizialmente)
export const userLibrary: Library = {
  id: 'user-custom',
  name: 'Libreria Utente',
  description: 'Voci personalizzate aggiunte dall\'utente',
  version: '1.0',
  region: 'Custom',
  year: new Date().getFullYear(),
  type: 'custom',
  items: [],
  metadata: {
    lastUpdated: new Date().toISOString().split('T')[0],
    totalItems: 0,
    categories: []
  }
};

// Esporta tutte le librerie disponibili
export const availableLibraries: Library[] = [
  lazioBenchmark2023,
  userLibrary
];

// Helper functions
export function getLibraryById(id: string): Library | undefined {
  return availableLibraries.find(lib => lib.id === id);
}

export function getItemsByCategory(libraryId: string, category: string): LibraryItem[] {
  const library = getLibraryById(libraryId);
  if (!library) return [];
  
  return library.items.filter(item => item.category === category);
}

export function searchItems(libraryId: string, query: string): LibraryItem[] {
  const library = getLibraryById(libraryId);
  if (!library) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return library.items.filter(item => 
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.code.toLowerCase().includes(lowercaseQuery)
  );
}

export function addItemToUserLibrary(item: Omit<LibraryItem, 'id'>): LibraryItem {
  const newItem: LibraryItem = {
    ...item,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  userLibrary.items.push(newItem);
  userLibrary.metadata.totalItems = userLibrary.items.length;
  userLibrary.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  
  // Aggiorna categorie se necessario
  const categories = [...new Set(userLibrary.items.map(item => item.category))];
  userLibrary.metadata.categories = categories;
  
  return newItem;
}

export function removeItemFromUserLibrary(itemId: string): boolean {
  const index = userLibrary.items.findIndex(item => item.id === itemId);
  if (index === -1) return false;
  
  userLibrary.items.splice(index, 1);
  userLibrary.metadata.totalItems = userLibrary.items.length;
  userLibrary.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  
  // Aggiorna categorie se necessario
  const categories = [...new Set(userLibrary.items.map(item => item.category))];
  userLibrary.metadata.categories = categories;
  
  return true;
}
