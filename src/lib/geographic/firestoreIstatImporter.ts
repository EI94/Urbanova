/**
 * Importatore Dati ISTAT per Firestore
 * Importa tutti i comuni italiani dal dataset ufficiale ISTAT in Firestore
 */

import { safeCollection } from '@/lib/firebaseUtils';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc,
  writeBatch
} from 'firebase/firestore';
import axios from 'axios';
import { z } from 'zod';

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
  duration: number;
}

export interface ImportProgress {
  percentage: number;
  stage: 'downloading' | 'parsing' | 'validating' | 'importing' | 'completed' | 'error';
  message: string;
}

export class FirestoreIstatImporter {
  private progressCallback?: (progress: ImportProgress) => void;
  private isCancelled = false;

  // URL dataset ISTAT
  private readonly ISTAT_URLS = {
    csv: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv',
    json: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.json',
    xml: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xml'
  };

  /**
   * Importa tutti i dati ISTAT in Firestore
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

      // 4. Importazione Firestore
      this.updateProgress(75, 100, 'importing', 'Importando in Firestore...', '');
      const importResult = await this.importToFirestore(validationResult.cleanedData);

      // 5. Completamento
      this.updateProgress(100, 100, 'completed', 'Importazione completata!', '');

      const duration = Date.now() - startTime;

      return {
        success: true,
        totalRecords: parsedData.length,
        importedRecords: importResult.importedCount,
        failedRecords: importResult.failedCount,
        errors: importResult.errors,
        duration
      };

    } catch (error) {
      this.updateProgress(0, 100, 'error', `Errore: ${error}`, '');
      throw error;
    }
  }

  /**
   * Scarica dati ISTAT
   */
  private async downloadIstatData(): Promise<string> {
    try {
      console.log('📥 Scaricando dataset ISTAT...');
      const response = await axios.get(this.ISTAT_URLS.csv, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Urbanova/1.0 (https://urbanova.life)'
        }
      });
      
      console.log(`✅ Dataset scaricato: ${response.data.length} caratteri`);
      return response.data;
    } catch (error) {
      console.error('❌ Errore download ISTAT:', error);
      throw new Error(`Errore download dataset ISTAT: ${error}`);
    }
  }

  /**
   * Parsing dati CSV ISTAT
   */
  private async parseIstatData(csvData: string): Promise<IstatComuneData[]> {
    try {
      console.log('🔄 Parsing dati CSV ISTAT...');
      
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data: IstatComuneData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (this.isCancelled) break;
        
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = this.parseCSVLine(line);
        if (values.length !== headers.length) continue;
        
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index]?.replace(/"/g, '') || '';
        });
        
        // Valida con Zod
        const validation = IstatComuneSchema.safeParse(record);
        if (validation.success) {
          data.push(validation.data);
        }
      }
      
      console.log(`✅ Parsing completato: ${data.length} comuni validi`);
      return data;
    } catch (error) {
      console.error('❌ Errore parsing ISTAT:', error);
      throw new Error(`Errore parsing dataset ISTAT: ${error}`);
    }
  }

  /**
   * Parsing linea CSV con gestione virgolette
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  /**
   * Validazione dati ISTAT
   */
  private async validateIstatData(data: IstatComuneData[]): Promise<{
    cleanedData: any[];
    validationResult: {
      score: number;
      errors: any[];
      warnings: any[];
    };
  }> {
    try {
      console.log('🔍 Validando dati ISTAT...');
      
      const cleanedData: any[] = [];
      const errors: any[] = [];
      const warnings: any[] = [];
      
      for (const record of data) {
        if (this.isCancelled) break;
        
        try {
          // Converte dati ISTAT in formato Firestore
          const comune = {
            nome: record.Denominazione_Comune,
            provincia: record.Denominazione_Provincia,
            regione: record.Denominazione_Regione,
            codiceIstat: record.Codice_Comune_formato_alfanumerico,
            codiceCatastale: record.Codice_Catastale || '',
            popolazione: parseInt(record.Popolazione_residente || '0') || 0,
            superficie: parseFloat(record.Superficie_territoriale_kmq || '0') || 0,
            altitudine: parseInt(record.Altitudine_centro_abitato_metri || '0') || 0,
            zonaClimatica: record.Zona_climatica || 'D',
            cap: record.CAP ? record.CAP.split(',').map(c => c.trim()) : [],
            prefisso: record.Prefisso_telefonico || '',
            latitudine: 0, // Sarà calcolato dalle coordinate
            longitudine: 0, // Sarà calcolato dalle coordinate
            dataCreazione: new Date(),
            dataAggiornamento: new Date(),
            attivo: true
          };
          
          // Parsing coordinate se disponibili
          if (record.Coordinate_geografiche) {
            const coords = this.parseCoordinates(record.Coordinate_geografiche);
            if (coords) {
              comune.latitudine = coords.lat;
              comune.longitudine = coords.lng;
            }
          }
          
          cleanedData.push(comune);
        } catch (error) {
          errors.push({
            record: record.Denominazione_Comune,
            error: error
          });
        }
      }
      
      const score = cleanedData.length / data.length;
      
      console.log(`✅ Validazione completata: ${cleanedData.length}/${data.length} comuni validi (${Math.round(score * 100)}%)`);
      
      return {
        cleanedData,
        validationResult: {
          score,
          errors,
          warnings
        }
      };
    } catch (error) {
      console.error('❌ Errore validazione ISTAT:', error);
      throw new Error(`Errore validazione dataset ISTAT: ${error}`);
    }
  }

  /**
   * Parsing coordinate geografiche
   */
  private parseCoordinates(coordString: string): { lat: number; lng: number } | null {
    try {
      // Formato: "41.9028, 12.4964" o "41°54'10\"N, 12°29'47\"E"
      const clean = coordString.replace(/[°'"]/g, '').replace(/[NS]/g, '').replace(/[EW]/g, '');
      const parts = clean.split(',').map(p => p.trim());
      
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Importa dati in Firestore
   */
  private async importToFirestore(data: any[]): Promise<{
    importedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    try {
      console.log(`💾 Importando ${data.length} comuni in Firestore...`);
      
      let importedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      
      // Importa in batch di 500
      const batchSize = 500;
      const batches = this.chunkArray(data, batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        if (this.isCancelled) break;
        
        const batch = batches[i];
        console.log(`📦 Importando batch ${i + 1}/${batches.length} (${batch.length} comuni)...`);
        
        try {
          const firestoreBatch = writeBatch(db);
          
          for (const comune of batch) {
            const docRef = doc(safeCollection('comuni_italiani'));
            firestoreBatch.set(docRef, comune);
          }
          
          await firestoreBatch.commit();
          importedCount += batch.length;
          
          console.log(`✅ Batch ${i + 1} importato: ${batch.length} comuni`);
        } catch (error) {
          console.error(`❌ Errore batch ${i + 1}:`, error);
          failedCount += batch.length;
          errors.push(`Batch ${i + 1}: ${error}`);
        }
      }
      
      console.log(`✅ Importazione completata: ${importedCount} comuni importati, ${failedCount} falliti`);
      
      return { importedCount, failedCount, errors };
    } catch (error) {
      console.error('❌ Errore importazione Firestore:', error);
      throw new Error(`Errore importazione Firestore: ${error}`);
    }
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
  private updateProgress(percentage: number, total: number, stage: ImportProgress['stage'], message: string, details: string): void {
    if (this.progressCallback) {
      this.progressCallback({
        percentage: Math.round((percentage / total) * 100),
        stage,
        message: `${message} ${details}`.trim()
      });
    }
  }

  /**
   * Genera report importazione
   */
  async generateImportReport(result: ImportResult): Promise<string> {
    const report = `
# 📊 Report Importazione ISTAT Firestore

## 📈 Risultati
- **Totale record**: ${result.totalRecords}
- **Importati**: ${result.importedRecords}
- **Falliti**: ${result.failedRecords}
- **Durata**: ${Math.round(result.duration / 1000)}s
- **Successo**: ${result.success ? '✅' : '❌'}

## 📊 Statistiche
- **Tasso successo**: ${Math.round((result.importedRecords / result.totalRecords) * 100)}%
- **Velocità**: ${Math.round(result.importedRecords / (result.duration / 1000))} record/s

## ❌ Errori
${result.errors.length > 0 ? result.errors.map(e => `- ${e}`).join('\n') : 'Nessun errore'}

## 📅 Data
- **Data importazione**: ${new Date().toISOString()}
- **Versione**: 1.0.0
    `;
    
    return report;
  }
}

// Istanza singleton
export const firestoreIstatImporter = new FirestoreIstatImporter();
