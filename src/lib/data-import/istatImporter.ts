/**
 * Importatore Dati ISTAT per Urbanova
 * Importa tutti i comuni italiani dal dataset ufficiale ISTAT
 */

import { db } from '@/lib/database';
import { dataValidator } from '@/lib/validation/dataValidator';
import { systemMonitor } from '@/lib/monitoring/systemMonitor';
import axios from 'axios';
import { z } from 'zod';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Schema per dati ISTAT
const IstatComuneSchema = z.object({
  Codice_Comune_formato_alfanumerico: z.string(),
  Denominazione_Comune: z.string(),
  Denominazione_Regione: z.string(),
  Denominazione_Provincia: z.string(),
  Sigla_automobilistica: z.string().optional(),
  Codice_Comune_numerico: z.string(),
  Codice_Regione: z.string(),
  Codice_Provincia: z.string(),
  Popolazione_residente: z.string().optional(),
  Superficie_territoriale_kmq: z.string().optional(),
  Altitudine_centro_abitato_metri: z.string().optional(),
  Zona_climatica: z.string().optional(),
  Zona_sismica: z.string().optional(),
  Codice_Catastale: z.string().optional(),
  Prefisso_telefonico: z.string().optional(),
  CAP: z.string().optional(),
  Coordinate_geografiche: z.string().optional()
});

export type IstatComuneData = z.infer<typeof IstatComuneSchema>;

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: string[];
  warnings: string[];
  duration: number;
  dataQuality: {
    completeness: number;
    accuracy: number;
    duplicates: number;
  };
}

export interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
  currentRecord: string;
  status: 'downloading' | 'parsing' | 'validating' | 'importing' | 'completed' | 'error';
  message: string;
}

export class IstatImporter {
  private db: typeof db;
  private progressCallback?: (progress: ImportProgress) => void;
  private isCancelled = false;

  // URL dataset ISTAT
  private readonly ISTAT_URLS = {
    csv: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv',
    json: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.json',
    xml: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xml'
  };

  constructor() {
    this.db = db;
  }

  /**
   * Importa tutti i dati ISTAT
   */
  async importAllData(progressCallback?: (progress: ImportProgress) => void): Promise<ImportResult> {
    this.progressCallback = progressCallback;
    this.isCancelled = false;
    const startTime = Date.now();

    try {
      // 1. Scarica dati
      this.updateProgress(0, 100, 'downloading', 'Scaricando dataset ISTAT...', '');
      const rawData = await this.downloadIstatData();

      // 2. Parsing dati
      this.updateProgress(25, 100, 'parsing', 'Elaborando dati...', '');
      const parsedData = await this.parseIstatData(rawData);

      // 3. Validazione dati
      this.updateProgress(50, 100, 'validating', 'Validando dati...', '');
      const validationResult = await this.validateIstatData(parsedData);

      // 4. Importazione database
      this.updateProgress(75, 100, 'importing', 'Importando nel database...', '');
      const importResult = await this.importToDatabase(validationResult.cleanedData);

      // 5. Completamento
      this.updateProgress(100, 100, 'completed', 'Importazione completata!', '');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalRecords: parsedData.length,
        importedRecords: importResult.importedCount,
        failedRecords: importResult.failedCount,
        errors: importResult.errors,
        warnings: validationResult.validationResult.warnings.map(w => w.message),
        duration,
        dataQuality: {
          completeness: validationResult.validationResult.score,
          accuracy: validationResult.validationResult.score,
          duplicates: validationResult.validationResult.errors.filter(e => e.field === 'codice_istat').length
        }
      };

    } catch (error) {
      this.updateProgress(0, 100, 'error', 'Errore durante importazione', error instanceof Error ? error.message : 'Errore sconosciuto');
      
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        failedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Errore sconosciuto'],
        warnings: [],
        duration: Date.now() - startTime,
        dataQuality: {
          completeness: 0,
          accuracy: 0,
          duplicates: 0
        }
      };
    }
  }

  /**
   * Scarica dati ISTAT
   */
  private async downloadIstatData(): Promise<string> {
    try {
      // Prova prima CSV
      const response = await axios.get(this.ISTAT_URLS.csv, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Urbanova-IstatImporter/1.0.0'
        }
      });

      return response.data;
    } catch (error) {
      console.warn('Errore scaricamento CSV, provo JSON...', error);
      
      try {
        const response = await axios.get(this.ISTAT_URLS.json, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Urbanova-IstatImporter/1.0.0'
          }
        });

        return JSON.stringify(response.data);
      } catch (jsonError) {
        throw new Error(`Impossibile scaricare dati ISTAT: ${error} | ${jsonError}`);
      }
    }
  }

  /**
   * Parsing dati ISTAT
   */
  private async parseIstatData(rawData: string): Promise<IstatComuneData[]> {
    const data: IstatComuneData[] = [];

    try {
      // Prova parsing CSV
      const csvData = this.parseCsvData(rawData);
      if (csvData.length > 0) {
        return csvData;
      }

      // Prova parsing JSON
      const jsonData = this.parseJsonData(rawData);
      if (jsonData.length > 0) {
        return jsonData;
      }

      throw new Error('Formato dati non riconosciuto');
    } catch (error) {
      throw new Error(`Errore parsing dati: ${error}`);
    }
  }

  /**
   * Parsing dati CSV
   */
  private parseCsvData(csvData: string): IstatComuneData[] {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: IstatComuneData[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (this.isCancelled) break;
      
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCsvLine(line);
      if (values.length !== headers.length) continue;

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index]?.replace(/"/g, '') || '';
      });

      // Mappa campi ISTAT ai nostri campi
      const mappedRecord: IstatComuneData = {
        Codice_Comune_formato_alfanumerico: record['Codice Comune formato alfanumerico'] || record['Codice_Comune_formato_alfanumerico'] || '',
        Denominazione_Comune: record['Denominazione Comune'] || record['Denominazione_Comune'] || '',
        Denominazione_Regione: record['Denominazione Regione'] || record['Denominazione_Regione'] || '',
        Denominazione_Provincia: record['Denominazione Provincia'] || record['Denominazione_Provincia'] || '',
        Sigla_automobilistica: record['Sigla automobilistica'] || record['Sigla_automobilistica'] || '',
        Codice_Comune_numerico: record['Codice Comune numerico'] || record['Codice_Comune_numerico'] || '',
        Codice_Regione: record['Codice Regione'] || record['Codice_Regione'] || '',
        Codice_Provincia: record['Codice Provincia'] || record['Codice_Provincia'] || '',
        Popolazione_residente: record['Popolazione residente'] || record['Popolazione_residente'] || '',
        Superficie_territoriale_kmq: record['Superficie territoriale (kmq)'] || record['Superficie_territoriale_kmq'] || '',
        Altitudine_centro_abitato_metri: record['Altitudine centro abitato (metri)'] || record['Altitudine_centro_abitato_metri'] || '',
        Zona_climatica: record['Zona climatica'] || record['Zona_climatica'] || '',
        Zona_sismica: record['Zona sismica'] || record['Zona_sismica'] || '',
        Codice_Catastale: record['Codice Catastale'] || record['Codice_Catastale'] || '',
        Prefisso_telefonico: record['Prefisso telefonico'] || record['Prefisso_telefonico'] || '',
        CAP: record['CAP'] || '',
        Coordinate_geografiche: record['Coordinate geografiche'] || record['Coordinate_geografiche'] || ''
      };

      data.push(mappedRecord);
    }

    return data;
  }

  /**
   * Parsing dati JSON
   */
  private parseJsonData(jsonData: string): IstatComuneData[] {
    try {
      const parsed = JSON.parse(jsonData);
      return Array.isArray(parsed) ? parsed : parsed.data || [];
    } catch (error) {
      throw new Error(`Errore parsing JSON: ${error}`);
    }
  }

  /**
   * Parsing linea CSV con gestione virgolette
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Valida dati ISTAT
   */
  private async validateIstatData(data: IstatComuneData[]): Promise<{
    cleanedData: any[];
    validationResult: any;
  }> {
    // Converte dati ISTAT al formato interno
    const convertedData = data.map(record => this.convertIstatToInternal(record));
    
    // Valida con sistema esistente
    const validationResult = await dataValidator.validateComuniData(convertedData);
    
    // Pulisce dati
    const { cleanedData } = await dataValidator.cleanAndValidateData(convertedData, 'comune');
    
    return { cleanedData, validationResult };
  }

  /**
   * Converte dati ISTAT al formato interno
   */
  private convertIstatToInternal(istatRecord: IstatComuneData): any {
    // Estrae coordinate da stringa
    const coordinates = this.parseCoordinates(istatRecord.Coordinate_geografiche || '');
    
    return {
      codice_istat: istatRecord.Codice_Comune_formato_alfanumerico,
      nome: istatRecord.Denominazione_Comune,
      nome_ascii: this.toAscii(istatRecord.Denominazione_Comune),
      regione: istatRecord.Denominazione_Regione,
      provincia: istatRecord.Denominazione_Provincia,
      cap: istatRecord.CAP,
      popolazione: istatRecord.Popolazione_residente ? parseInt(istatRecord.Popolazione_residente.replace(/\D/g, '')) : 0,
      superficie: istatRecord.Superficie_territoriale_kmq ? parseFloat(istatRecord.Superficie_territoriale_kmq.replace(',', '.')) : 0,
      altitudine: istatRecord.Altitudine_centro_abitato_metri ? parseInt(istatRecord.Altitudine_centro_abitato_metri) : 0,
      zona_climatica: istatRecord.Zona_climatica,
      zona_sismica: istatRecord.Zona_sismica,
      codice_catastale: istatRecord.Codice_Catastale,
      prefisso_telefonico: istatRecord.Prefisso_telefonico,
      latitudine: coordinates.lat,
      longitudine: coordinates.lng
    };
  }

  /**
   * Parsing coordinate da stringa ISTAT
   */
  private parseCoordinates(coordinateString: string): { lat: number; lng: number } {
    if (!coordinateString) return { lat: 0, lng: 0 };

    // Formato: "41.9028, 12.4964" o "41°54'10\"N, 12°29'47\"E"
    const match = coordinateString.match(/(\d+\.?\d*)[°\s]*(\d+\.?\d*)[\s'"]*[NS]?[\s,]*(\d+\.?\d*)[°\s]*(\d+\.?\d*)[\s'"]*[EW]?/);
    
    if (match) {
      const lat = parseFloat(match[1]) + (parseFloat(match[2]) / 60);
      const lng = parseFloat(match[3]) + (parseFloat(match[4]) / 60);
      return { lat, lng };
    }

    // Formato semplice: "41.9028, 12.4964"
    const simpleMatch = coordinateString.match(/(\d+\.?\d*)[\s,]+(\d+\.?\d*)/);
    if (simpleMatch) {
      return {
        lat: parseFloat(simpleMatch[1]),
        lng: parseFloat(simpleMatch[2])
      };
    }

    return { lat: 0, lng: 0 };
  }

  /**
   * Converte testo a ASCII
   */
  private toAscii(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .toLowerCase();
  }

  /**
   * Importa dati nel database
   */
  private async importToDatabase(data: any[]): Promise<{
    importedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Prepara dati per importazione batch
    const batchSize = 100;
    const batches = this.chunkArray(data, batchSize);

    for (let i = 0; i < batches.length; i++) {
      if (this.isCancelled) break;

      const batch = batches[i];
      this.updateProgress(
        75 + (i / batches.length) * 20,
        100,
        'importing',
        `Importando batch ${i + 1}/${batches.length}...`,
        batch[0]?.nome || ''
      );

      try {
        await this.importBatch(batch);
        importedCount += batch.length;
      } catch (error) {
        failedCount += batch.length;
        errors.push(`Batch ${i + 1}: ${error}`);
      }
    }

    return { importedCount, failedCount, errors };
  }

  /**
   * Importa batch di dati
   */
  private async importBatch(batch: any[]): Promise<void> {
    const values = batch.map((record, index) => {
      const offset = index * 17; // Numero di campi
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15}, $${offset + 16}, $${offset + 17})`;
    }).join(', ');

    const query = `
      INSERT INTO comuni (
        codice_istat, nome, nome_ascii, nome_altri, regione_id, provincia_id,
        cap, popolazione, superficie, altitudine, zona_climatica, zona_sismica,
        codice_catastale, prefisso_telefonico, latitudine, longitudine, geometry
      ) VALUES ${values}
      ON CONFLICT (codice_istat) DO UPDATE SET
        nome = EXCLUDED.nome,
        nome_ascii = EXCLUDED.nome_ascii,
        popolazione = EXCLUDED.popolazione,
        superficie = EXCLUDED.superficie,
        latitudine = EXCLUDED.latitudine,
        longitudine = EXCLUDED.longitudine,
        updated_at = NOW()
    `;

    const params = batch.flatMap(record => [
      record.codice_istat,
      record.nome,
      record.nome_ascii,
      record.nome_altri || '',
      record.regione_id,
      record.provincia_id,
      record.cap || '',
      record.popolazione || 0,
      record.superficie || 0,
      record.altitudine || 0,
      record.zona_climatica || '',
      record.zona_sismica || '',
      record.codice_catastale || '',
      record.prefisso_telefonico || '',
      record.latitudine,
      record.longitudine,
      `POINT(${record.longitudine} ${record.latitudine})`
    ]);

    await this.db.query(query, params);
  }

  /**
   * Divide array in chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Aggiorna progresso
   */
  private updateProgress(
    current: number,
    total: number,
    status: ImportProgress['status'],
    message: string,
    currentRecord: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        currentRecord,
        status,
        message
      });
    }
  }

  /**
   * Cancella importazione
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Genera report importazione
   */
  async generateImportReport(result: ImportResult): Promise<string> {
    const report = `
# 📊 Report Importazione Dati ISTAT - Urbanova

**Data:** ${new Date().toISOString()}  
**Stato:** ${result.success ? '✅ SUCCESSO' : '❌ FALLITO'}  
**Durata:** ${Math.round(result.duration / 1000)}s

## 📈 Statistiche Importazione

- **Record Totali:** ${result.totalRecords}
- **Record Importati:** ${result.importedRecords}
- **Record Falliti:** ${result.failedRecords}
- **Tasso Successo:** ${Math.round((result.importedRecords / result.totalRecords) * 100)}%

## 📊 Qualità Dati

- **Completezza:** ${result.dataQuality.completeness}%
- **Accuratezza:** ${result.dataQuality.accuracy}%
- **Duplicati:** ${result.dataQuality.duplicates}

## 🚨 Errori

${result.errors.length > 0 ? result.errors.map(error => `- ${error}`).join('\n') : 'Nessun errore'}

## ⚠️ Warning

${result.warnings.length > 0 ? result.warnings.map(warning => `- ${warning}`).join('\n') : 'Nessun warning'}

## 🎯 Prossimi Passi

${result.success ? 
  '✅ Importazione completata con successo. Procedere con importazione zone urbane.' : 
  '❌ Risolvere errori prima di procedere.'}

---
*Report generato automaticamente dal Sistema di Importazione ISTAT Urbanova*
`;

    return report;
  }
}

// Esporta istanza singleton
export const istatImporter = new IstatImporter();
