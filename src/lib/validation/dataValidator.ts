/**
 * Sistema di Validazione Dati per Urbanova
 * Valida e verifica la qualità dei dati importati
 */

import { z } from 'zod';
import { db } from '@/lib/database';

// Schema per validazione comuni
const ComuneValidationSchema = z.object({
  codice_istat: z.string().regex(/^\d{6}$/, 'Codice ISTAT deve essere di 6 cifre'),
  nome: z.string().min(1).max(100),
  nome_ascii: z.string().optional(),
  nome_altri: z.string().optional(),
  regione: z.string().min(1),
  provincia: z.string().min(1),
  cap: z.string().regex(/^\d{5}$/, 'CAP deve essere di 5 cifre').optional(),
  popolazione: z.number().int().min(0).optional(),
  superficie: z.number().min(0).optional(),
  altitudine: z.number().int().min(-500).max(5000).optional(),
  zona_climatica: z.string().optional(),
  zona_sismica: z.string().optional(),
  latitudine: z.number().min(-90).max(90),
  longitudine: z.number().min(-180).max(180)
});

// Schema per validazione zone urbane
const ZonaUrbanaValidationSchema = z.object({
  nome: z.string().min(1).max(100),
  tipo_zona: z.enum([
    'quartiere', 'frazione', 'località', 'zona_industriale',
    'centro_storico', 'periferia', 'zona_residenziale',
    'zona_commerciale', 'zona_artigianale', 'zona_agricola'
  ]),
  comune: z.string().min(1),
  popolazione: z.number().int().min(0).optional(),
  superficie: z.number().min(0).optional(),
  altitudine: z.number().int().min(-500).max(5000).optional(),
  latitudine: z.number().min(-90).max(90).optional(),
  longitudine: z.number().min(-180).max(180).optional()
});

export type ComuneData = z.infer<typeof ComuneValidationSchema>;
export type ZonaUrbanaData = z.infer<typeof ZonaUrbanaValidationSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  value?: any;
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: any;
  suggestion?: string;
}

export class DataValidator {
  private db: typeof db;

  constructor() {
    this.db = db;
  }

  /**
   * Valida dati comuni
   */
  async validateComuniData(data: ComuneData[]): Promise<ValidationResult> {
    console.log(`🔍 Validando ${data.length} comuni...`);
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let validCount = 0;

    for (let i = 0; i < data.length; i++) {
      const comune = data[i];
      
      try {
        // Validazione schema base
        ComuneValidationSchema.parse(comune);
        
        // Validazioni aggiuntive
        const comuneErrors = await this.validateComuneAdvanced(comune, i);
        const comuneWarnings = await this.validateComuneWarnings(comune, i);
        
        errors.push(...comuneErrors);
        warnings.push(...comuneWarnings);
        
        if (comuneErrors.length === 0) {
          validCount++;
        }
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              severity: this.getSeverityFromZodError(err),
              value: err.input,
              suggestion: this.getSuggestionFromZodError(err)
            });
          });
        } else {
          errors.push({
            field: 'unknown',
            message: `Errore di validazione: ${error}`,
            severity: 'CRITICAL'
          });
        }
      }
    }

    const score = Math.round((validCount / data.length) * 100);
    
    return {
      isValid: errors.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Valida dati zone urbane
   */
  async validateZoneUrbaneData(data: ZonaUrbanaData[]): Promise<ValidationResult> {
    console.log(`🔍 Validando ${data.length} zone urbane...`);
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let validCount = 0;

    for (let i = 0; i < data.length; i++) {
      const zona = data[i];
      
      try {
        // Validazione schema base
        ZonaUrbanaValidationSchema.parse(zona);
        
        // Validazioni aggiuntive
        const zonaErrors = await this.validateZonaAdvanced(zona, i);
        const zonaWarnings = await this.validateZonaWarnings(zona, i);
        
        errors.push(...zonaErrors);
        warnings.push(...zonaWarnings);
        
        if (zonaErrors.length === 0) {
          validCount++;
        }
        
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              severity: this.getSeverityFromZodError(err),
              value: err.input,
              suggestion: this.getSuggestionFromZodError(err)
            });
          });
        } else {
          errors.push({
            field: 'unknown',
            message: `Errore di validazione: ${error}`,
            severity: 'CRITICAL'
          });
        }
      }
    }

    const score = Math.round((validCount / data.length) * 100);
    
    return {
      isValid: errors.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validazioni avanzate per comuni
   */
  private async validateComuneAdvanced(comune: ComuneData, index: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Verifica duplicati codice ISTAT
    const duplicateCheck = await this.db.query(
      'SELECT COUNT(*) as count FROM comuni WHERE codice_istat = $1',
      [comune.codice_istat]
    );
    
    if (duplicateCheck[0].count > 0) {
      errors.push({
        field: 'codice_istat',
        message: `Codice ISTAT ${comune.codice_istat} già esistente`,
        severity: 'HIGH',
        value: comune.codice_istat,
        suggestion: 'Verificare che il codice ISTAT sia univoco'
      });
    }

    // Verifica esistenza regione
    const regioneCheck = await this.db.query(
      'SELECT COUNT(*) as count FROM regioni WHERE nome = $1',
      [comune.regione]
    );
    
    if (regioneCheck[0].count === 0) {
      errors.push({
        field: 'regione',
        message: `Regione "${comune.regione}" non trovata`,
        severity: 'HIGH',
        value: comune.regione,
        suggestion: 'Verificare che la regione esista nel database'
      });
    }

    // Verifica esistenza provincia
    const provinciaCheck = await this.db.query(
      'SELECT COUNT(*) as count FROM province WHERE nome = $1',
      [comune.provincia]
    );
    
    if (provinciaCheck[0].count === 0) {
      errors.push({
        field: 'provincia',
        message: `Provincia "${comune.provincia}" non trovata`,
        severity: 'HIGH',
        value: comune.provincia,
        suggestion: 'Verificare che la provincia esista nel database'
      });
    }

    // Verifica coordinate realistiche per Italia
    if (comune.latitudine < 35.5 || comune.latitudine > 47.1) {
      errors.push({
        field: 'latitudine',
        message: `Latitudine ${comune.latitudine} fuori dai confini italiani`,
        severity: 'MEDIUM',
        value: comune.latitudine,
        suggestion: 'Verificare che la latitudine sia corretta per l\'Italia (35.5 - 47.1)'
      });
    }

    if (comune.longitudine < 6.6 || comune.longitudine > 18.5) {
      errors.push({
        field: 'longitudine',
        message: `Longitudine ${comune.longitudine} fuori dai confini italiani`,
        severity: 'MEDIUM',
        value: comune.longitudine,
        suggestion: 'Verificare che la longitudine sia corretta per l\'Italia (6.6 - 18.5)'
      });
    }

    // Verifica coerenza popolazione/superficie
    if (comune.popolazione && comune.superficie) {
      const densita = comune.popolazione / comune.superficie;
      if (densita > 10000) {
        errors.push({
          field: 'popolazione',
          message: `Densità di popolazione ${densita.toFixed(2)} abitanti/km² sembra eccessiva`,
          severity: 'LOW',
          value: { popolazione: comune.popolazione, superficie: comune.superficie },
          suggestion: 'Verificare i dati di popolazione e superficie'
        });
      }
    }

    return errors;
  }

  /**
   * Validazioni avanzate per zone urbane
   */
  private async validateZonaAdvanced(zona: ZonaUrbanaData, index: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Verifica esistenza comune
    const comuneCheck = await this.db.query(
      'SELECT COUNT(*) as count FROM comuni WHERE nome = $1',
      [zona.comune]
    );
    
    if (comuneCheck[0].count === 0) {
      errors.push({
        field: 'comune',
        message: `Comune "${zona.comune}" non trovato`,
        severity: 'HIGH',
        value: zona.comune,
        suggestion: 'Verificare che il comune esista nel database'
      });
    }

    // Verifica coordinate se presenti
    if (zona.latitudine && zona.longitudine) {
      if (zona.latitudine < 35.5 || zona.latitudine > 47.1) {
        errors.push({
          field: 'latitudine',
          message: `Latitudine ${zona.latitudine} fuori dai confini italiani`,
          severity: 'MEDIUM',
          value: zona.latitudine,
          suggestion: 'Verificare che la latitudine sia corretta per l\'Italia'
        });
      }

      if (zona.longitudine < 6.6 || zona.longitudine > 18.5) {
        errors.push({
          field: 'longitudine',
          message: `Longitudine ${zona.longitudine} fuori dai confini italiani`,
          severity: 'MEDIUM',
          value: zona.longitudine,
          suggestion: 'Verificare che la longitudine sia corretta per l\'Italia'
        });
      }
    }

    return errors;
  }

  /**
   * Genera warning per comuni
   */
  private async validateComuneWarnings(comune: ComuneData, index: number): Promise<ValidationWarning[]> {
    const warnings: ValidationWarning[] = [];

    // Warning per dati mancanti
    if (!comune.popolazione || comune.popolazione === 0) {
      warnings.push({
        field: 'popolazione',
        message: 'Popolazione non specificata',
        value: comune.popolazione,
        suggestion: 'Aggiungere dati di popolazione se disponibili'
      });
    }

    if (!comune.superficie || comune.superficie === 0) {
      warnings.push({
        field: 'superficie',
        message: 'Superficie non specificata',
        value: comune.superficie,
        suggestion: 'Aggiungere dati di superficie se disponibili'
      });
    }

    if (!comune.cap) {
      warnings.push({
        field: 'cap',
        message: 'CAP non specificato',
        value: comune.cap,
        suggestion: 'Aggiungere CAP se disponibile'
      });
    }

    // Warning per dati anomali
    if (comune.popolazione && comune.popolazione < 100) {
      warnings.push({
        field: 'popolazione',
        message: `Popolazione molto bassa: ${comune.popolazione}`,
        value: comune.popolazione,
        suggestion: 'Verificare che i dati di popolazione siano corretti'
      });
    }

    if (comune.superficie && comune.superficie < 0.1) {
      warnings.push({
        field: 'superficie',
        message: `Superficie molto piccola: ${comune.superficie} km²`,
        value: comune.superficie,
        suggestion: 'Verificare che i dati di superficie siano corretti'
      });
    }

    return warnings;
  }

  /**
   * Genera warning per zone urbane
   */
  private async validateZonaWarnings(zona: ZonaUrbanaData, index: number): Promise<ValidationWarning[]> {
    const warnings: ValidationWarning[] = [];

    // Warning per dati mancanti
    if (!zona.popolazione || zona.popolazione === 0) {
      warnings.push({
        field: 'popolazione',
        message: 'Popolazione non specificata',
        value: zona.popolazione,
        suggestion: 'Aggiungere dati di popolazione se disponibili'
      });
    }

    if (!zona.superficie || zona.superficie === 0) {
      warnings.push({
        field: 'superficie',
        message: 'Superficie non specificata',
        value: zona.superficie,
        suggestion: 'Aggiungere dati di superficie se disponibili'
      });
    }

    if (!zona.latitudine || !zona.longitudine) {
      warnings.push({
        field: 'coordinate',
        message: 'Coordinate geografiche non specificate',
        value: { latitudine: zona.latitudine, longitudine: zona.longitudine },
        suggestion: 'Aggiungere coordinate per abilitare la visualizzazione sulla mappa'
      });
    }

    return warnings;
  }

  /**
   * Determina severità da errore Zod
   */
  private getSeverityFromZodError(error: z.ZodIssue): ValidationError['severity'] {
    switch (error.code) {
      case z.ZodIssueCode.invalid_type:
        return 'HIGH';
      case z.ZodIssueCode.too_small:
      case z.ZodIssueCode.too_big:
        return 'MEDIUM';
      case z.ZodIssueCode.invalid_string:
        return 'MEDIUM';
      case z.ZodIssueCode.custom:
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  }

  /**
   * Genera suggerimento da errore Zod
   */
  private getSuggestionFromZodError(error: z.ZodIssue): string {
    switch (error.code) {
      case z.ZodIssueCode.invalid_type:
        return `Il campo deve essere di tipo ${error.expected}`;
      case z.ZodIssueCode.too_small:
        return `Il valore deve essere almeno ${error.minimum}`;
      case z.ZodIssueCode.too_big:
        return `Il valore deve essere al massimo ${error.maximum}`;
      case z.ZodIssueCode.invalid_string:
        return 'Formato stringa non valido';
      default:
        return 'Verificare il formato del dato';
    }
  }

  /**
   * Genera report di validazione
   */
  async generateValidationReport(result: ValidationResult, dataType: string): Promise<string> {
    const totalErrors = result.errors.length;
    const criticalErrors = result.errors.filter(e => e.severity === 'CRITICAL').length;
    const highErrors = result.errors.filter(e => e.severity === 'HIGH').length;
    const mediumErrors = result.errors.filter(e => e.severity === 'MEDIUM').length;
    const lowErrors = result.errors.filter(e => e.severity === 'LOW').length;
    const totalWarnings = result.warnings.length;

    const report = `
# 🔍 Report Validazione Dati - ${dataType}

**Data:** ${new Date().toISOString()}  
**Tipo Dati:** ${dataType}  
**Stato:** ${result.isValid ? '✅ VALIDO' : '❌ NON VALIDO'}  
**Score:** ${result.score}/100

## 📊 Riepilogo Errori

- **Totale Errori:** ${totalErrors}
  - 🔴 **Critici:** ${criticalErrors}
  - 🟠 **Alti:** ${highErrors}
  - 🟡 **Medi:** ${mediumErrors}
  - 🟢 **Bassi:** ${lowErrors}

- **Totale Warning:** ${totalWarnings}

## 🚨 Errori per Severità

### Critici (${criticalErrors})
${result.errors
  .filter(e => e.severity === 'CRITICAL')
  .map(e => `- **${e.field}:** ${e.message}${e.suggestion ? `\n  💡 *Suggerimento: ${e.suggestion}*` : ''}`)
  .join('\n') || 'Nessun errore critico'}

### Alti (${highErrors})
${result.errors
  .filter(e => e.severity === 'HIGH')
  .map(e => `- **${e.field}:** ${e.message}${e.suggestion ? `\n  💡 *Suggerimento: ${e.suggestion}*` : ''}`)
  .join('\n') || 'Nessun errore alto'}

### Medi (${mediumErrors})
${result.errors
  .filter(e => e.severity === 'MEDIUM')
  .map(e => `- **${e.field}:** ${e.message}${e.suggestion ? `\n  💡 *Suggerimento: ${e.suggestion}*` : ''}`)
  .join('\n') || 'Nessun errore medio'}

### Bassi (${lowErrors})
${result.errors
  .filter(e => e.severity === 'LOW')
  .map(e => `- **${e.field}:** ${e.message}${e.suggestion ? `\n  💡 *Suggerimento: ${e.suggestion}*` : ''}`)
  .join('\n') || 'Nessun errore basso'}

## ⚠️ Warning

${result.warnings
  .map(w => `- **${w.field}:** ${w.message}${w.suggestion ? `\n  💡 *Suggerimento: ${w.suggestion}*` : ''}`)
  .join('\n') || 'Nessun warning'}

## 🎯 Raccomandazioni

${result.isValid 
  ? '✅ I dati sono validi e possono essere importati nel database.'
  : '❌ Correggere gli errori critici e alti prima dell\'importazione.'}

${totalWarnings > 0 
  ? '⚠️ Considerare di correggere i warning per migliorare la qualità dei dati.'
  : ''}

---
*Report generato automaticamente dal Sistema di Validazione Dati Urbanova*
`;

    return report;
  }

  /**
   * Valida e pulisce dati prima dell'importazione
   */
  async cleanAndValidateData<T extends ComuneData | ZonaUrbanaData>(
    data: T[],
    type: 'comune' | 'zona'
  ): Promise<{ cleanedData: T[]; validationResult: ValidationResult }> {
    console.log(`🧹 Pulizia e validazione di ${data.length} ${type}...`);
    
    // Rimuovi duplicati
    const uniqueData = this.removeDuplicates(data, type);
    
    // Pulisci dati
    const cleanedData = this.cleanData(uniqueData, type);
    
    // Valida dati puliti
    const validationResult = type === 'comune' 
      ? await this.validateComuniData(cleanedData as ComuneData[])
      : await this.validateZoneUrbaneData(cleanedData as ZonaUrbanaData[]);
    
    return { cleanedData, validationResult };
  }

  /**
   * Rimuove duplicati dai dati
   */
  private removeDuplicates<T extends ComuneData | ZonaUrbanaData>(
    data: T[],
    type: 'comune' | 'zona'
  ): T[] {
    const seen = new Set<string>();
    return data.filter(item => {
      const key = type === 'comune' 
        ? (item as ComuneData).codice_istat
        : `${(item as ZonaUrbanaData).nome}-${(item as ZonaUrbanaData).comune}`;
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Pulisce i dati
   */
  private cleanData<T extends ComuneData | ZonaUrbanaData>(
    data: T[],
    type: 'comune' | 'zona'
  ): T[] {
    return data.map(item => {
      const cleaned = { ...item };
      
      // Pulisci stringhe
      if (cleaned.nome) {
        cleaned.nome = cleaned.nome.trim().replace(/\s+/g, ' ');
      }
      
      if (type === 'comune') {
        const comune = cleaned as ComuneData;
        if (comune.nome_ascii) {
          comune.nome_ascii = comune.nome_ascii.trim();
        }
        if (comune.nome_altri) {
          comune.nome_altri = comune.nome_altri.trim();
        }
        if (comune.cap) {
          comune.cap = comune.cap.replace(/\D/g, '').padStart(5, '0');
        }
      }
      
      return cleaned;
    });
  }
}

// Esporta istanza singleton
export const dataValidator = new DataValidator();

