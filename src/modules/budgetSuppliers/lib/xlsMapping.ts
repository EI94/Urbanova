/**
 * 📊 EXCEL MAPPING
 * 
 * Mapping colonne Excel per importazione computo metrico
 */

export interface ExcelColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
  description: string;
  examples: string[];
}

export interface ExcelMapping {
  column: string;
  field: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
}

export interface ExcelSheet {
  name: string;
  data: any[][];
  headers: string[];
  rowCount: number;
}

export interface ExcelFile {
  fileName: string;
  sheets: ExcelSheet[];
  totalRows: number;
}

// Definizione colonne supportate
export const SUPPORTED_COLUMNS: ExcelColumn[] = [
  {
    name: 'Descrizione',
    type: 'text',
    required: true,
    description: 'Descrizione della voce di computo',
    examples: ['Scavi e fondazioni', 'Struttura portante', 'Impianto elettrico']
  },
  {
    name: 'Categoria',
    type: 'text',
    required: true,
    description: 'Categoria della voce (OPERE, FORNITURE, SICUREZZA, etc.)',
    examples: ['OPERE', 'FORNITURE', 'SICUREZZA', 'CANTIERIZZAZIONE', 'ESTERNE_ALTRO']
  },
  {
    name: 'UM',
    type: 'text',
    required: true,
    description: 'Unità di misura',
    examples: ['mq', 'mc', 'kg', 'pz', 'h', 'ml', 'q.le']
  },
  {
    name: 'Q.tà',
    type: 'number',
    required: true,
    description: 'Quantità',
    examples: ['100', '150.5', '25']
  },
  {
    name: 'Prezzo Budget',
    type: 'currency',
    required: false,
    description: 'Prezzo preventivato',
    examples: ['25000', '150.5', '€ 1,200.00']
  },
  {
    name: 'Codice',
    type: 'text',
    required: false,
    description: 'Codice della voce',
    examples: ['001', 'A.1.1', 'SCAVI-001']
  },
  {
    name: 'Note',
    type: 'text',
    required: false,
    description: 'Note aggiuntive',
    examples: ['Incluso trasporto', 'Classe Rck 25/30']
  },
  {
    name: 'Livello',
    type: 'text',
    required: false,
    description: 'Livello di dettaglio',
    examples: ['rough', 'definitive', 'executive']
  }
];

// Mapping automatico basato su pattern comuni
export const COLUMN_PATTERNS: Record<string, string[]> = {
  'Descrizione': ['descrizione', 'desc', 'voce', 'lavoro', 'item', 'descrizione lavoro'],
  'Categoria': ['categoria', 'cat', 'tipo', 'classe', 'gruppo'],
  'UM': ['um', 'unità', 'unita', 'misura', 'unit', 'u.m.'],
  'Q.tà': ['q.tà', 'quantità', 'quantita', 'qty', 'qta', 'q.tà', 'quantita'],
  'Prezzo Budget': ['prezzo budget', 'budget', 'prezzo', 'costo', 'importo', 'valore', '€', 'euro'],
  'Codice': ['codice', 'code', 'cod', 'rif', 'riferimento', 'id'],
  'Note': ['note', 'note', 'osservazioni', 'commenti', 'descrizione aggiuntiva'],
  'Livello': ['livello', 'level', 'dettaglio', 'precisione']
};

// Validatori per ogni tipo di colonna
export const COLUMN_VALIDATORS = {
  text: (value: any): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
  },
  number: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
  },
  currency: (value: any): boolean => {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      // Rimuovi simboli di valuta e spazi
      const cleanValue = value.replace(/[€$£¥,\s]/g, '').replace(/\./g, '');
      return !isNaN(parseFloat(cleanValue)) && isFinite(parseFloat(cleanValue));
    }
    return false;
  },
  date: (value: any): boolean => {
    return !isNaN(Date.parse(value));
  }
};

// Funzioni di parsing per ogni tipo
export const COLUMN_PARSERS = {
  text: (value: any): string => {
    return String(value).trim();
  },
  number: (value: any): number => {
    return parseFloat(value);
  },
  currency: (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Rimuovi simboli di valuta e spazi, gestisci separatori decimali
      const cleanValue = value.replace(/[€$£¥,\s]/g, '').replace(/\./g, '');
      return parseFloat(cleanValue);
    }
    return 0;
  },
  date: (value: any): Date => {
    return new Date(value);
  }
};

// Funzione per rilevare automaticamente le colonne
export function detectColumns(headers: string[]): ExcelMapping[] {
  const mappings: ExcelMapping[] = [];
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();
    
    // Cerca pattern corrispondenti
    for (const [fieldName, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (patterns.some(pattern => normalizedHeader.includes(pattern))) {
        const column = SUPPORTED_COLUMNS.find(col => col.name === fieldName);
        if (column) {
          mappings.push({
            column: header,
            field: fieldName,
            type: column.type,
            required: column.required
          });
          break;
        }
      }
    }
  });
  
  return mappings;
}

// Funzione per validare i dati importati
export function validateImportedData(data: any[][], mappings: ExcelMapping[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verifica che ci siano almeno le colonne obbligatorie
  const requiredFields = mappings.filter(m => m.required).map(m => m.field);
  const missingRequired = SUPPORTED_COLUMNS
    .filter(col => col.required)
    .filter(col => !requiredFields.includes(col.name))
    .map(col => col.name);
  
  if (missingRequired.length > 0) {
    errors.push(`Colonne obbligatorie mancanti: ${missingRequired.join(', ')}`);
  }
  
  // Valida ogni riga di dati
  data.forEach((row, rowIndex) => {
    mappings.forEach(mapping => {
      const value = row[mapping.column];
      const validator = COLUMN_VALIDATORS[mapping.type];
      
      if (mapping.required && (!value || !validator(value))) {
        errors.push(`Riga ${rowIndex + 1}: Valore non valido per "${mapping.column}"`);
      } else if (!mapping.required && value && !validator(value)) {
        warnings.push(`Riga ${rowIndex + 1}: Valore non valido per "${mapping.column}" (colonna opzionale)`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Funzione per convertire i dati Excel in formato BoqItem
export function convertToBoqItems(data: any[][], mappings: ExcelMapping[]): any[] {
  const items: any[] = [];
  
  data.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    
    const item: any = {
      id: `imported-${Date.now()}-${index}`,
      projectId: '', // Will be set by parent component
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
      level: 'definitive'
    };
    
    mappings.forEach(mapping => {
      const value = row[mapping.column];
      const parser = COLUMN_PARSERS[mapping.type];
      
      switch (mapping.field) {
        case 'Descrizione':
          item.description = parser(value);
          break;
        case 'Categoria':
          item.category = parser(value);
          break;
        case 'UM':
          item.uom = parser(value);
          break;
        case 'Q.tà':
          item.qty = parser(value);
          break;
        case 'Prezzo Budget':
          item.budget = parser(value);
          break;
        case 'Codice':
          item.code = parser(value);
          break;
        case 'Note':
          item.notes = parser(value);
          break;
        case 'Livello':
          item.level = parser(value);
          break;
      }
    });
    
    // Valori di default per campi mancanti
    if (!item.code) item.code = `IMP-${String(index).padStart(3, '0')}`;
    if (!item.budget) item.budget = 0;
    if (!item.notes) item.notes = '';
    
    items.push(item);
  });
  
  return items;
}

// Funzione per generare un template Excel
export function generateExcelTemplate(): string {
  const headers = SUPPORTED_COLUMNS.map(col => col.name);
  const examples = SUPPORTED_COLUMNS.map(col => col.examples[0]);
  
  return [
    headers.join('\t'),
    examples.join('\t'),
    '', // Riga vuota per separare header da dati
    'Esempio voce 1\tOPERE\tmc\t100\t25000\t001\tNote esempio\tdefinitive',
    'Esempio voce 2\tFORNITURE\tmq\t50\t1500\t002\tNote esempio\tdefinitive'
  ].join('\n');
}
