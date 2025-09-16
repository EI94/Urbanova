/**
 * Sistema di Elaborazione Dati per Urbanova
 * Elabora, pulisce e ottimizza dati geografici
 */

import { db } from '@/lib/database';
import { systemMonitor } from '@/lib/monitoring/systemMonitor';
import { z } from 'zod';

export interface ProcessingResult {
  success: boolean;
  processedRecords: number;
  cleanedRecords: number;
  optimizedRecords: number;
  errors: string[];
  warnings: string[];
  duration: number;
  metrics: {
    duplicatesRemoved: number;
    coordinatesFixed: number;
    missingDataFilled: number;
    indexesCreated: number;
  };
}

export interface ProcessingProgress {
  current: number;
  total: number;
  percentage: number;
  currentOperation: string;
  status: 'cleaning' | 'validating' | 'optimizing' | 'indexing' | 'completed' | 'error';
  message: string;
}

export class DataProcessor {
  private db: typeof db;
  private progressCallback?: (progress: ProcessingProgress) => void;
  private isCancelled = false;

  constructor() {
    this.db = db;
  }

  /**
   * Elabora tutti i dati geografici
   */
  async processAllData(progressCallback?: (progress: ProcessingProgress) => void): Promise<ProcessingResult> {
    this.progressCallback = progressCallback;
    this.isCancelled = false;
    const startTime = Date.now();

    try {
      const metrics = {
        duplicatesRemoved: 0,
        coordinatesFixed: 0,
        missingDataFilled: 0,
        indexesCreated: 0
      };

      // 1. Pulizia dati comuni
      this.updateProgress(0, 100, 'cleaning', 'Pulendo dati comuni...', '');
      const comuniResult = await this.cleanComuniData();
      metrics.duplicatesRemoved += comuniResult.duplicatesRemoved;
      metrics.coordinatesFixed += comuniResult.coordinatesFixed;
      metrics.missingDataFilled += comuniResult.missingDataFilled;

      // 2. Pulizia dati zone
      this.updateProgress(25, 100, 'cleaning', 'Pulendo dati zone...', '');
      const zoneResult = await this.cleanZoneData();
      metrics.duplicatesRemoved += zoneResult.duplicatesRemoved;
      metrics.coordinatesFixed += zoneResult.coordinatesFixed;
      metrics.missingDataFilled += zoneResult.missingDataFilled;

      // 3. Validazione dati
      this.updateProgress(50, 100, 'validating', 'Validando dati...', '');
      const validationResult = await this.validateAllData();

      // 4. Ottimizzazione database
      this.updateProgress(75, 100, 'optimizing', 'Ottimizzando database...', '');
      const optimizationResult = await this.optimizeDatabase();
      metrics.indexesCreated = optimizationResult.indexesCreated;

      // 5. Creazione indici
      this.updateProgress(90, 100, 'indexing', 'Creando indici...', '');
      await this.createOptimizedIndexes();

      // 6. Completamento
      this.updateProgress(100, 100, 'completed', 'Elaborazione completata!', '');

      const duration = Date.now() - startTime;

      return {
        success: true,
        processedRecords: comuniResult.processedRecords + zoneResult.processedRecords,
        cleanedRecords: comuniResult.cleanedRecords + zoneResult.cleanedRecords,
        optimizedRecords: optimizationResult.optimizedRecords,
        errors: [...comuniResult.errors, ...zoneResult.errors, ...validationResult.errors],
        warnings: [...comuniResult.warnings, ...zoneResult.warnings, ...validationResult.warnings],
        duration,
        metrics
      };

    } catch (error) {
      this.updateProgress(0, 100, 'error', 'Errore durante elaborazione', error instanceof Error ? error.message : 'Errore sconosciuto');
      
      return {
        success: false,
        processedRecords: 0,
        cleanedRecords: 0,
        optimizedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Errore sconosciuto'],
        warnings: [],
        duration: Date.now() - startTime,
        metrics: {
          duplicatesRemoved: 0,
          coordinatesFixed: 0,
          missingDataFilled: 0,
          indexesCreated: 0
        }
      };
    }
  }

  /**
   * Pulisce dati comuni
   */
  private async cleanComuniData(): Promise<{
    processedRecords: number;
    cleanedRecords: number;
    duplicatesRemoved: number;
    coordinatesFixed: number;
    missingDataFilled: number;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let duplicatesRemoved = 0;
    let coordinatesFixed = 0;
    let missingDataFilled = 0;

    try {
      // 1. Rimuovi duplicati
      const duplicateResult = await this.db.query(`
        WITH duplicates AS (
          SELECT codice_istat, COUNT(*) as count
          FROM comuni
          GROUP BY codice_istat
          HAVING COUNT(*) > 1
        )
        DELETE FROM comuni
        WHERE codice_istat IN (
          SELECT codice_istat FROM duplicates
        ) AND id NOT IN (
          SELECT MIN(id) FROM comuni
          WHERE codice_istat IN (SELECT codice_istat FROM duplicates)
          GROUP BY codice_istat
        )
      `);
      duplicatesRemoved = duplicateResult.rowCount || 0;

      // 2. Corregge coordinate non valide
      const coordinateResult = await this.db.query(`
        UPDATE comuni SET
          latitudine = CASE
            WHEN latitudine < -90 THEN -90
            WHEN latitudine > 90 THEN 90
            ELSE latitudine
          END,
          longitudine = CASE
            WHEN longitudine < -180 THEN -180
            WHEN longitudine > 180 THEN 180
            ELSE longitudine
          END
        WHERE latitudine < -90 OR latitudine > 90 
           OR longitudine < -180 OR longitudine > 180
      `);
      coordinatesFixed = coordinateResult.rowCount || 0;

      // 3. Completa dati mancanti
      const missingDataResult = await this.db.query(`
        UPDATE comuni SET
          popolazione = COALESCE(popolazione, 0),
          superficie = COALESCE(superficie, 0),
          altitudine = COALESCE(altitudine, 0),
          nome_ascii = COALESCE(nome_ascii, nome)
        WHERE popolazione IS NULL 
           OR superficie IS NULL 
           OR altitudine IS NULL 
           OR nome_ascii IS NULL
      `);
      missingDataFilled = missingDataResult.rowCount || 0;

      // 4. Aggiorna geometrie
      await this.db.query(`
        UPDATE comuni SET geometry = ST_SetSRID(ST_MakePoint(longitudine, latitudine), 4326)
        WHERE latitudine IS NOT NULL AND longitudine IS NOT NULL
      `);

      // 5. Conta record processati
      const countResult = await this.db.query('SELECT COUNT(*) as count FROM comuni');
      const processedRecords = countResult[0].count;

      return {
        processedRecords,
        cleanedRecords: duplicatesRemoved + coordinatesFixed + missingDataFilled,
        duplicatesRemoved,
        coordinatesFixed,
        missingDataFilled,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Errore pulizia comuni: ${error}`);
      return {
        processedRecords: 0,
        cleanedRecords: 0,
        duplicatesRemoved: 0,
        coordinatesFixed: 0,
        missingDataFilled: 0,
        errors,
        warnings
      };
    }
  }

  /**
   * Pulisce dati zone
   */
  private async cleanZoneData(): Promise<{
    processedRecords: number;
    cleanedRecords: number;
    duplicatesRemoved: number;
    coordinatesFixed: number;
    missingDataFilled: number;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let duplicatesRemoved = 0;
    let coordinatesFixed = 0;
    let missingDataFilled = 0;

    try {
      // 1. Rimuovi duplicati zone
      const duplicateResult = await this.db.query(`
        WITH duplicates AS (
          SELECT comune_id, nome, COUNT(*) as count
          FROM zone_urbane
          GROUP BY comune_id, nome
          HAVING COUNT(*) > 1
        )
        DELETE FROM zone_urbane
        WHERE (comune_id, nome) IN (
          SELECT comune_id, nome FROM duplicates
        ) AND id NOT IN (
          SELECT MIN(id) FROM zone_urbane
          WHERE (comune_id, nome) IN (SELECT comune_id, nome FROM duplicates)
          GROUP BY comune_id, nome
        )
      `);
      duplicatesRemoved = duplicateResult.rowCount || 0;

      // 2. Corregge coordinate zone
      const coordinateResult = await this.db.query(`
        UPDATE zone_urbane SET
          latitudine = CASE
            WHEN latitudine < -90 THEN -90
            WHEN latitudine > 90 THEN 90
            ELSE latitudine
          END,
          longitudine = CASE
            WHEN longitudine < -180 THEN -180
            WHEN longitudine > 180 THEN 180
            ELSE longitudine
          END
        WHERE latitudine < -90 OR latitudine > 90 
           OR longitudine < -180 OR longitudine > 180
      `);
      coordinatesFixed = coordinateResult.rowCount || 0;

      // 3. Completa dati mancanti zone
      const missingDataResult = await this.db.query(`
        UPDATE zone_urbane SET
          popolazione = COALESCE(popolazione, 0),
          superficie = COALESCE(superficie, 0),
          altitudine = COALESCE(altitudine, 0),
          metadata = COALESCE(metadata, '{}')
        WHERE popolazione IS NULL 
           OR superficie IS NULL 
           OR altitudine IS NULL 
           OR metadata IS NULL
      `);
      missingDataFilled = missingDataResult.rowCount || 0;

      // 4. Aggiorna geometrie zone
      await this.db.query(`
        UPDATE zone_urbane SET geometry = ST_SetSRID(ST_MakePoint(longitudine, latitudine), 4326)
        WHERE latitudine IS NOT NULL AND longitudine IS NOT NULL
      `);

      // 5. Conta record processati
      const countResult = await this.db.query('SELECT COUNT(*) as count FROM zone_urbane');
      const processedRecords = countResult[0].count;

      return {
        processedRecords,
        cleanedRecords: duplicatesRemoved + coordinatesFixed + missingDataFilled,
        duplicatesRemoved,
        coordinatesFixed,
        missingDataFilled,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Errore pulizia zone: ${error}`);
      return {
        processedRecords: 0,
        cleanedRecords: 0,
        duplicatesRemoved: 0,
        coordinatesFixed: 0,
        missingDataFilled: 0,
        errors,
        warnings
      };
    }
  }

  /**
   * Valida tutti i dati
   */
  private async validateAllData(): Promise<{
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Valida integrità referenziale
      const referentialResult = await this.db.query(`
        SELECT COUNT(*) as count FROM zone_urbane z
        LEFT JOIN comuni c ON z.comune_id = c.id
        WHERE c.id IS NULL
      `);
      
      if (referentialResult[0].count > 0) {
        warnings.push(`${referentialResult[0].count} zone con riferimenti comuni non validi`);
      }

      // 2. Valida coordinate
      const coordinateResult = await this.db.query(`
        SELECT COUNT(*) as count FROM comuni
        WHERE latitudine = 0 AND longitudine = 0
      `);
      
      if (coordinateResult[0].count > 0) {
        warnings.push(`${coordinateResult[0].count} comuni con coordinate non specificate`);
      }

      // 3. Valida dati obbligatori
      const requiredDataResult = await this.db.query(`
        SELECT COUNT(*) as count FROM comuni
        WHERE nome IS NULL OR nome = ''
      `);
      
      if (requiredDataResult[0].count > 0) {
        errors.push(`${requiredDataResult[0].count} comuni senza nome`);
      }

      return { errors, warnings };

    } catch (error) {
      errors.push(`Errore validazione: ${error}`);
      return { errors, warnings };
    }
  }

  /**
   * Ottimizza database
   */
  private async optimizeDatabase(): Promise<{
    optimizedRecords: number;
    indexesCreated: number;
  }> {
    let indexesCreated = 0;

    try {
      // 1. Analizza tabelle
      await this.db.query('ANALYZE comuni');
      await this.db.query('ANALYZE zone_urbane');
      await this.db.query('ANALYZE regioni');
      await this.db.query('ANALYZE province');

      // 2. Ottimizza query
      await this.db.query('VACUUM ANALYZE comuni');
      await this.db.query('VACUUM ANALYZE zone_urbane');

      // 3. Conta record ottimizzati
      const countResult = await this.db.query(`
        SELECT 
          (SELECT COUNT(*) FROM comuni) +
          (SELECT COUNT(*) FROM zone_urbane) +
          (SELECT COUNT(*) FROM regioni) +
          (SELECT COUNT(*) FROM province) as total
      `);
      const optimizedRecords = countResult[0].total;

      return { optimizedRecords, indexesCreated };

    } catch (error) {
      console.warn('Errore ottimizzazione database:', error);
      return { optimizedRecords: 0, indexesCreated: 0 };
    }
  }

  /**
   * Crea indici ottimizzati
   */
  private async createOptimizedIndexes(): Promise<void> {
    try {
      // Indici per performance ricerca
      const indexes = [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_search ON comuni USING gin(to_tsvector(\'italian\', nome || \' \' || COALESCE(nome_ascii, \'\')))',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_search ON zone_urbane USING gin(to_tsvector(\'italian\', nome))',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_population ON comuni(popolazione) WHERE popolazione > 0',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_type ON zone_urbane(tipo_zona)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_region ON comuni(regione_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_province ON comuni(provincia_id)'
      ];

      for (const indexQuery of indexes) {
        try {
          await this.db.query(indexQuery);
        } catch (error) {
          console.warn(`Errore creazione indice: ${error}`);
        }
      }

    } catch (error) {
      console.warn('Errore creazione indici:', error);
    }
  }

  /**
   * Aggiorna progresso
   */
  private updateProgress(
    current: number,
    total: number,
    status: ProcessingProgress['status'],
    message: string,
    currentOperation: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        currentOperation,
        status,
        message
      });
    }
  }

  /**
   * Cancella elaborazione
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Genera report elaborazione
   */
  async generateProcessingReport(result: ProcessingResult): Promise<string> {
    const report = `
# 🔧 Report Elaborazione Dati - Urbanova

**Data:** ${new Date().toISOString()}  
**Stato:** ${result.success ? '✅ SUCCESSO' : '❌ FALLITO'}  
**Durata:** ${Math.round(result.duration / 1000)}s

## 📈 Statistiche Elaborazione

- **Record Processati:** ${result.processedRecords}
- **Record Puliti:** ${result.cleanedRecords}
- **Record Ottimizzati:** ${result.optimizedRecords}

## 🔧 Metriche Pulizia

- **Duplicati Rimossi:** ${result.metrics.duplicatesRemoved}
- **Coordinate Corrette:** ${result.metrics.coordinatesFixed}
- **Dati Mancanti Completati:** ${result.metrics.missingDataFilled}
- **Indici Creati:** ${result.metrics.indexesCreated}

## 🚨 Errori

${result.errors.length > 0 ? result.errors.map(error => `- ${error}`).join('\n') : 'Nessun errore'}

## ⚠️ Warning

${result.warnings.length > 0 ? result.warnings.map(warning => `- ${warning}`).join('\n') : 'Nessun warning'}

## 🎯 Prossimi Passi

${result.success ? 
  '✅ Elaborazione completata. Dati pronti per implementazione mappa.' : 
  '❌ Risolvere errori prima di procedere.'}

---
*Report generato automaticamente dal Sistema di Elaborazione Dati Urbanova*
`;

    return report;
  }
}

// Esporta istanza singleton
export const dataProcessor = new DataProcessor();
