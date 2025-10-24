/**
 * 📄 OFFER PARSER
 * 
 * Parser per estrazione dati da PDF/Excel/email offerte fornitori
 */

import * as XLSX from 'xlsx';

export interface ParsedOfferLine {
  code?: string;
  description: string;
  category?: string;
  uom?: string;
  qty?: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  exclusions?: string;
  leadTime?: string;
  confidence: number; // 0-1, confidence del parsing
}

export interface ParsedOffer {
  vendorName: string;
  vendorEmail: string;
  lines: ParsedOfferLine[];
  metadata: {
    fileName: string;
    fileType: string;
    parsedAt: number;
    totalLines: number;
    confidence: number;
  };
}

export interface ManualMapping {
  columnMappings: Record<string, string>;
  itemMappings: Record<string, string>;
  customRules: Record<string, any>;
}

export class OfferParser {
  
  // Parse principale - determina tipo file e chiama parser specifico
  static async parseOffer(file: File, manualMapping?: ManualMapping): Promise<ParsedOffer> {
    try {
      console.log('📄 [PARSER] Parsing offerta:', file.name);
      
      const fileType = this.getFileType(file.name);
      let parsedOffer: ParsedOffer;
      
      switch (fileType) {
        case 'excel':
          parsedOffer = await this.parseExcel(file, manualMapping);
          break;
        case 'pdf':
          parsedOffer = await this.parsePdf(file, manualMapping);
          break;
        case 'email':
          parsedOffer = await this.parseEmail(file, manualMapping);
          break;
        default:
          throw new Error(`Tipo file non supportato: ${fileType}`);
      }
      
      console.log('✅ [PARSER] Offerta parsata:', parsedOffer.metadata);
      return parsedOffer;
      
    } catch (error: any) {
      console.error('❌ [PARSER] Errore parsing offerta:', error);
      throw new Error(`Errore parsing offerta: ${error.message}`);
    }
  }

  // Determina tipo file
  private static getFileType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'pdf':
        return 'pdf';
      case 'eml':
      case 'msg':
        return 'email';
      default:
        return 'unknown';
    }
  }

  // Parse Excel
  private static async parseExcel(file: File, manualMapping?: ManualMapping): Promise<ParsedOffer> {
    try {
      console.log('📊 [PARSER] Parsing Excel:', file.name);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Trova il foglio più promettente
      const sheetName = this.findBestSheet(workbook);
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error('Nessun foglio valido trovato');
      }
      
      // Converti in JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Trova header row
      const headerRow = this.findHeaderRow(jsonData);
      if (headerRow === -1) {
        throw new Error('Header row non trovata');
      }
      
      const headers = jsonData[headerRow] as string[];
      const dataRows = jsonData.slice(headerRow + 1);
      
      // Mappa colonne usando heuristics o manual mapping
      const columnMapping = manualMapping?.columnMappings || this.mapColumns(headers);
      
      // Parse righe dati
      const lines = this.parseDataRows(dataRows, columnMapping, headers);
      
      // Estrai info vendor dal nome file o contenuto
      const vendorInfo = this.extractVendorInfo(file.name, jsonData);
      
      return {
        vendorName: vendorInfo.name,
        vendorEmail: vendorInfo.email,
        lines,
        metadata: {
          fileName: file.name,
          fileType: 'excel',
          parsedAt: Date.now(),
          totalLines: lines.length,
          confidence: this.calculateConfidence(lines)
        }
      };
      
    } catch (error: any) {
      console.error('❌ [PARSER] Errore parsing Excel:', error);
      throw new Error(`Errore parsing Excel: ${error.message}`);
    }
  }

  // Parse PDF (simulato - in produzione useresti pdf-parse o similar)
  private static async parsePdf(file: File, manualMapping?: ManualMapping): Promise<ParsedOffer> {
    try {
      console.log('📄 [PARSER] Parsing PDF:', file.name);
      
      // Simula parsing PDF (in produzione useresti una libreria PDF)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data per demo
      const mockLines: ParsedOfferLine[] = [
        {
          description: 'Scavi e fondazioni',
          uom: 'mc',
          qty: 100,
          unitPrice: 45.50,
          totalPrice: 4550,
          notes: 'Include smaltimento terreno',
          confidence: 0.8
        },
        {
          description: 'Struttura in cemento armato',
          uom: 'mc',
          qty: 200,
          unitPrice: 380.00,
          totalPrice: 76000,
          notes: 'Classe C25/30',
          confidence: 0.9
        }
      ];
      
      const vendorInfo = this.extractVendorInfo(file.name, []);
      
      return {
        vendorName: vendorInfo.name,
        vendorEmail: vendorInfo.email,
        lines: mockLines,
        metadata: {
          fileName: file.name,
          fileType: 'pdf',
          parsedAt: Date.now(),
          totalLines: mockLines.length,
          confidence: 0.7
        }
      };
      
    } catch (error: any) {
      console.error('❌ [PARSER] Errore parsing PDF:', error);
      throw new Error(`Errore parsing PDF: ${error.message}`);
    }
  }

  // Parse Email (simulato)
  private static async parseEmail(file: File, manualMapping?: ManualMapping): Promise<ParsedOffer> {
    try {
      console.log('📧 [PARSER] Parsing Email:', file.name);
      
      // Simula parsing email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data per demo
      const mockLines: ParsedOfferLine[] = [
        {
          description: 'Fornitura e posa piastrelle',
          uom: 'mq',
          qty: 500,
          unitPrice: 25.00,
          totalPrice: 12500,
          notes: 'Piastrelle 30x60 cm',
          confidence: 0.6
        }
      ];
      
      const vendorInfo = this.extractVendorInfo(file.name, []);
      
      return {
        vendorName: vendorInfo.name,
        vendorEmail: vendorInfo.email,
        lines: mockLines,
        metadata: {
          fileName: file.name,
          fileType: 'email',
          parsedAt: Date.now(),
          totalLines: mockLines.length,
          confidence: 0.6
        }
      };
      
    } catch (error: any) {
      console.error('❌ [PARSER] Errore parsing Email:', error);
      throw new Error(`Errore parsing Email: ${error.message}`);
    }
  }

  // Trova il foglio migliore in Excel
  private static findBestSheet(workbook: XLSX.WorkBook): string {
    const sheetNames = workbook.SheetNames;
    
    // Priorità: "Offerta", "Preventivo", "Listino", primo foglio
    const prioritySheets = ['Offerta', 'Preventivo', 'Listino', 'Sheet1', 'Foglio1'];
    
    for (const priority of prioritySheets) {
      if (sheetNames.includes(priority)) {
        return priority;
      }
    }
    
    // Fallback: foglio con più dati
    let bestSheet = sheetNames[0];
    let maxRows = 0;
    
    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
      const rows = range.e.r - range.s.r + 1;
      
      if (rows > maxRows) {
        maxRows = rows;
        bestSheet = sheetName;
      }
    }
    
    return bestSheet;
  }

  // Trova riga header
  private static findHeaderRow(data: any[][]): number {
    const keywords = ['codice', 'descrizione', 'prezzo', 'quantità', 'unit', 'totale', 'importo'];
    
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (!row || !Array.isArray(row)) continue;
      
      const rowText = row.join(' ').toLowerCase();
      const matches = keywords.filter(keyword => rowText.includes(keyword));
      
      if (matches.length >= 3) {
        return i;
      }
    }
    
    return -1;
  }

  // Mappa colonne usando heuristics
  private static mapColumns(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    const patterns = {
      description: ['descrizione', 'desc', 'voce', 'item', 'articolo', 'lavoro'],
      code: ['codice', 'cod', 'ref', 'riferimento', 'id'],
      qty: ['quantità', 'qty', 'q.tà', 'qta', 'numero', 'n°'],
      unitPrice: ['prezzo', 'prezzo unitario', 'prezzo unit', 'costo unitario', '€/unit'],
      totalPrice: ['totale', 'importo', 'valore', 'costo totale', 'subtotale'],
      uom: ['um', 'unità', 'misura', 'u.m.', 'unità di misura'],
      notes: ['note', 'osservazioni', 'commenti', 'dettagli', 'specifiche']
    };
    
    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase().trim();
      
      for (const [field, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => headerLower.includes(keyword))) {
          mapping[field] = `col_${index}`;
          break;
        }
      }
    });
    
    return mapping;
  }

  // Parse righe dati
  private static parseDataRows(
    dataRows: any[][], 
    columnMapping: Record<string, string>, 
    headers: string[]
  ): ParsedOfferLine[] {
    const lines: ParsedOfferLine[] = [];
    
    dataRows.forEach((row, rowIndex) => {
      if (!row || row.length === 0) return;
      
      // Skip righe vuote o con solo spazi
      if (row.every(cell => !cell || cell.toString().trim() === '')) return;
      
      const line: ParsedOfferLine = {
        description: '',
        confidence: 0.5
      };
      
      // Estrai dati usando mapping
      Object.entries(columnMapping).forEach(([field, colKey]) => {
        const colIndex = parseInt(colKey.replace('col_', ''));
        const value = row[colIndex];
        
        if (value !== undefined && value !== null && value !== '') {
          switch (field) {
            case 'description':
              line.description = value.toString().trim();
              line.confidence += 0.2;
              break;
            case 'code':
              line.code = value.toString().trim();
              line.confidence += 0.1;
              break;
            case 'qty':
              line.qty = this.parseNumber(value);
              line.confidence += 0.1;
              break;
            case 'unitPrice':
              line.unitPrice = this.parseNumber(value);
              line.confidence += 0.2;
              break;
            case 'totalPrice':
              line.totalPrice = this.parseNumber(value);
              line.confidence += 0.1;
              break;
            case 'uom':
              line.uom = value.toString().trim();
              line.confidence += 0.1;
              break;
            case 'notes':
              line.notes = value.toString().trim();
              line.confidence += 0.05;
              break;
          }
        }
      });
      
      // Calcola totalPrice se mancante
      if (!line.totalPrice && line.qty && line.unitPrice) {
        line.totalPrice = line.qty * line.unitPrice;
      }
      
      // Solo aggiungi se ha almeno descrizione
      if (line.description) {
        lines.push(line);
      }
    });
    
    return lines;
  }

  // Parse numero da vari formati
  private static parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    
    const str = value.toString().trim();
    
    // Rimuovi simboli di valuta e spazi
    const cleaned = str.replace(/[€$£¥]/g, '').replace(/\s/g, '');
    
    // Gestisci separatori decimali (virgola vs punto)
    const normalized = cleaned.replace(',', '.');
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Estrai info vendor
  private static extractVendorInfo(fileName: string, content: any[]): { name: string; email: string } {
    // Estrai da nome file
    const nameFromFile = fileName
      .replace(/\.(xlsx?|pdf|eml)$/i, '')
      .replace(/[_-]/g, ' ')
      .trim();
    
    // Cerca email nel contenuto
    let email = '';
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    content.forEach(row => {
      if (Array.isArray(row)) {
        row.forEach(cell => {
          const matches = cell?.toString().match(emailRegex);
          if (matches && matches.length > 0) {
            email = matches[0];
          }
        });
      }
    });
    
    return {
      name: nameFromFile || 'Fornitore Sconosciuto',
      email: email || 'email@fornitore.it'
    };
  }

  // Calcola confidence generale
  private static calculateConfidence(lines: ParsedOfferLine[]): number {
    if (lines.length === 0) return 0;
    
    const totalConfidence = lines.reduce((sum, line) => sum + line.confidence, 0);
    return Math.min(1, totalConfidence / lines.length);
  }

  // Fallback manual mapping UI
  static createManualMappingUI(
    headers: string[], 
    currentMapping: Record<string, string>
  ): ManualMapping {
    return {
      columnMappings: currentMapping,
      itemMappings: {},
      customRules: {}
    };
  }

  // Valida offerta parsata
  static validateParsedOffer(offer: ParsedOffer): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!offer.vendorName) {
      errors.push('Nome fornitore mancante');
    }
    
    if (offer.lines.length === 0) {
      errors.push('Nessuna linea offerta trovata');
    }
    
    const linesWithPrices = offer.lines.filter(line => line.unitPrice && line.unitPrice > 0);
    if (linesWithPrices.length === 0) {
      errors.push('Nessun prezzo trovato');
    }
    
    const linesWithDescription = offer.lines.filter(line => line.description && line.description.trim());
    if (linesWithDescription.length === 0) {
      errors.push('Nessuna descrizione trovata');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
