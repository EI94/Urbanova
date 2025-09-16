#!/usr/bin/env ts-node

/**
 * Script di Esecuzione Fase 2 - Raccolta e Preparazione Dati
 * Esegue importazione dati ISTAT, OSM e elaborazione completa
 */

import { istatImporter } from '../src/lib/data-import/istatImporter';
import { osmImporter } from '../src/lib/data-import/osmImporter';
import { dataProcessor } from '../src/lib/data-processing/dataProcessor';
import { systemMonitor } from '../src/lib/monitoring/systemMonitor';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface Phase2Results {
  istatImport: any;
  osmImport: any;
  dataProcessing: any;
  monitoring: any;
  recommendations: string[];
  nextSteps: string[];
}

class Phase2Executor {
  private resultsDir = 'reports/phase2';
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.setupDirectories();
  }

  /**
   * Esegue la Fase 2 completa
   */
  async execute(): Promise<Phase2Results> {
    console.log('🚀 Iniziando Fase 2: Raccolta e Preparazione Dati');
    console.log('=' .repeat(60));
    
    const results: Phase2Results = {
      istatImport: null,
      osmImport: null,
      dataProcessing: null,
      monitoring: null,
      recommendations: [],
      nextSteps: []
    };

    try {
      // 1. Importazione dati ISTAT
      console.log('\n📊 1. Importazione Dati ISTAT...');
      results.istatImport = await this.executeIstatImport();
      
      // 2. Importazione dati OpenStreetMap
      console.log('\n🗺️ 2. Importazione Dati OpenStreetMap...');
      results.osmImport = await this.executeOsmImport();
      
      // 3. Elaborazione dati
      console.log('\n🔧 3. Elaborazione Dati...');
      results.dataProcessing = await this.executeDataProcessing();
      
      // 4. Monitoraggio sistema
      console.log('\n📈 4. Monitoraggio Sistema...');
      results.monitoring = await this.executeSystemMonitoring();
      
      // 5. Genera raccomandazioni
      console.log('\n💡 5. Generazione Raccomandazioni...');
      results.recommendations = this.generateRecommendations(results);
      
      // 6. Prossimi passi
      console.log('\n🎯 6. Definizione Prossimi Passi...');
      results.nextSteps = this.generateNextSteps(results);
      
      // 7. Salva risultati
      console.log('\n💾 7. Salvataggio Risultati...');
      await this.saveResults(results);
      
      // 8. Genera report finale
      console.log('\n📋 8. Generazione Report Finale...');
      await this.generateFinalReport(results);
      
      console.log('\n✅ Fase 2 completata con successo!');
      console.log(`⏱️  Tempo totale: ${this.getExecutionTime()}`);
      
      return results;
      
    } catch (error) {
      console.error('\n❌ Errore durante esecuzione Fase 2:', error);
      throw error;
    }
  }

  /**
   * Esegue importazione ISTAT
   */
  private async executeIstatImport(): Promise<any> {
    console.log('  📊 Importando dati ISTAT...');
    
    const importResult = await istatImporter.importAllData((progress) => {
      console.log(`  📈 Progresso ISTAT: ${progress.percentage}% - ${progress.message}`);
    });
    
    console.log(`  ✅ Importazione ISTAT completata: ${importResult.importedRecords} comuni importati`);
    
    // Salva report importazione
    const importReport = await istatImporter.generateImportReport(importResult);
    this.saveReport('istat-import-report.md', importReport);
    
    return importResult;
  }

  /**
   * Esegue importazione OSM
   */
  private async executeOsmImport(): Promise<any> {
    console.log('  🗺️ Importando dati OpenStreetMap...');
    
    const importResult = await osmImporter.importAllZones((progress) => {
      console.log(`  📈 Progresso OSM: ${progress.percentage}% - ${progress.message}`);
    });
    
    console.log(`  ✅ Importazione OSM completata: ${importResult.importedZones} zone importate`);
    
    // Salva report importazione
    const importReport = await osmImporter.generateImportReport(importResult);
    this.saveReport('osm-import-report.md', importReport);
    
    return importResult;
  }

  /**
   * Esegue elaborazione dati
   */
  private async executeDataProcessing(): Promise<any> {
    console.log('  🔧 Elaborando dati...');
    
    const processingResult = await dataProcessor.processAllData((progress) => {
      console.log(`  📈 Progresso Elaborazione: ${progress.percentage}% - ${progress.message}`);
    });
    
    console.log(`  ✅ Elaborazione completata: ${processingResult.processedRecords} record processati`);
    
    // Salva report elaborazione
    const processingReport = await dataProcessor.generateProcessingReport(processingResult);
    this.saveReport('data-processing-report.md', processingReport);
    
    return processingResult;
  }

  /**
   * Esegue monitoraggio sistema
   */
  private async executeSystemMonitoring(): Promise<any> {
    console.log('  📊 Raccogliendo metriche sistema...');
    
    const metrics = await systemMonitor.collectAllMetrics();
    
    console.log(`  ✅ Metriche raccolte: ${metrics.health.status} (${metrics.health.score}/100)`);
    
    // Salva report monitoraggio
    const monitoringReport = await systemMonitor.generateMonitoringReport(metrics);
    this.saveReport('system-monitoring.md', monitoringReport);
    
    return metrics;
  }

  /**
   * Genera raccomandazioni basate sui risultati
   */
  private generateRecommendations(results: Phase2Results): string[] {
    const recommendations: string[] = [];
    
    // Raccomandazioni basate su importazione ISTAT
    if (results.istatImport) {
      if (results.istatImport.success) {
        recommendations.push(`✅ ${results.istatImport.importedRecords} comuni ISTAT importati con successo`);
      } else {
        recommendations.push(`❌ Importazione ISTAT fallita: ${results.istatImport.errors.join(', ')}`);
      }
      
      if (results.istatImport.dataQuality.completeness < 95) {
        recommendations.push(`⚠️ Completezza dati ISTAT: ${results.istatImport.dataQuality.completeness}% - migliorare qualità dati`);
      }
    }
    
    // Raccomandazioni basate su importazione OSM
    if (results.osmImport) {
      if (results.osmImport.success) {
        recommendations.push(`✅ ${results.osmImport.importedZones} zone OSM importate con successo`);
      } else {
        recommendations.push(`❌ Importazione OSM fallita: ${results.osmImport.errors.join(', ')}`);
      }
      
      const totalZoneTypes = Object.keys(results.osmImport.zoneTypes).length;
      if (totalZoneTypes < 5) {
        recommendations.push(`⚠️ Solo ${totalZoneTypes} tipi di zone importati - espandere copertura`);
      }
    }
    
    // Raccomandazioni basate su elaborazione dati
    if (results.dataProcessing) {
      if (results.dataProcessing.success) {
        recommendations.push(`✅ ${results.dataProcessing.processedRecords} record elaborati con successo`);
      } else {
        recommendations.push(`❌ Elaborazione dati fallita: ${results.dataProcessing.errors.join(', ')}`);
      }
      
      if (results.dataProcessing.metrics.duplicatesRemoved > 0) {
        recommendations.push(`🧹 ${results.dataProcessing.metrics.duplicatesRemoved} duplicati rimossi`);
      }
      
      if (results.dataProcessing.metrics.coordinatesFixed > 0) {
        recommendations.push(`🔧 ${results.dataProcessing.metrics.coordinatesFixed} coordinate corrette`);
      }
    }
    
    // Raccomandazioni basate su monitoraggio
    if (results.monitoring) {
      if (results.monitoring.health.score < 70) {
        recommendations.push('🚨 Sistema in stato critico - intervento immediato richiesto');
      } else if (results.monitoring.health.score < 90) {
        recommendations.push('⚠️ Sistema in stato di warning - monitorare attentamente');
      } else {
        recommendations.push('✅ Sistema in buono stato');
      }
      
      if (results.monitoring.dataQuality.dataCompleteness < 90) {
        recommendations.push('📊 Dati incompleti - completamento necessario');
      }
      
      if (results.monitoring.performance.avgQueryTime > 500) {
        recommendations.push('⚡ Query lente rilevate - ottimizzazione necessaria');
      }
    }
    
    return recommendations;
  }

  /**
   * Genera prossimi passi
   */
  private generateNextSteps(results: Phase2Results): string[] {
    const nextSteps: string[] = [];
    
    nextSteps.push('🗺️ Fase 3: Implementazione Mappa (Settimana 5-6)');
    nextSteps.push('  - Setup Leaflet e dependencies');
    nextSteps.push('  - Implementare componente mappa interattiva');
    nextSteps.push('  - Integrare ricerca geografica');
    nextSteps.push('  - Implementare filtri avanzati');
    
    nextSteps.push('🔧 Fase 4: API e Ricerca Avanzata (Settimana 7-8)');
    nextSteps.push('  - Implementare API endpoints completi');
    nextSteps.push('  - Implementare ricerca full-text');
    nextSteps.push('  - Implementare autocomplete intelligente');
    nextSteps.push('  - Implementare cache Redis');
    
    nextSteps.push('⚡ Fase 5: Ottimizzazione e Performance (Settimana 9-10)');
    nextSteps.push('  - Ottimizzare query database');
    nextSteps.push('  - Implementare monitoring avanzato');
    nextSteps.push('  - Implementare test automatizzati');
    nextSteps.push('  - Implementare backup e recovery');
    
    // Passi specifici basati sui risultati
    if (results.istatImport?.success && results.osmImport?.success) {
      nextSteps.push('🎯 Implementazione Mappa: Dati pronti per visualizzazione');
    }
    
    if (results.dataProcessing?.success) {
      nextSteps.push('🔍 Ricerca Avanzata: Dati ottimizzati per performance');
    }
    
    return nextSteps;
  }

  /**
   * Salva risultati
   */
  private async saveResults(results: Phase2Results): Promise<void> {
    const resultsFile = join(this.resultsDir, 'phase2-results.json');
    writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`  💾 Risultati salvati in: ${resultsFile}`);
  }

  /**
   * Genera report finale
   */
  private async generateFinalReport(results: Phase2Results): Promise<void> {
    const report = `
# 🚀 Fase 2: Raccolta e Preparazione Dati - COMPLETATA

**Data Esecuzione:** ${this.startTime.toISOString()}  
**Durata:** ${this.getExecutionTime()}  
**Stato:** ✅ COMPLETATA CON SUCCESSO

## 📊 Riepilogo Risultati

### Importazione ISTAT
- **Stato:** ${results.istatImport?.success ? '✅ SUCCESSO' : '❌ FALLITO'}
- **Comuni Importati:** ${results.istatImport?.importedRecords || 0}
- **Record Falliti:** ${results.istatImport?.failedRecords || 0}
- **Qualità Dati:** ${results.istatImport?.dataQuality?.completeness || 0}%

### Importazione OpenStreetMap
- **Stato:** ${results.osmImport?.success ? '✅ SUCCESSO' : '❌ FALLITO'}
- **Zone Importate:** ${results.osmImport?.importedZones || 0}
- **Zone Fallite:** ${results.osmImport?.failedZones || 0}
- **Tipi Zone:** ${Object.keys(results.osmImport?.zoneTypes || {}).length}

### Elaborazione Dati
- **Stato:** ${results.dataProcessing?.success ? '✅ SUCCESSO' : '❌ FALLITO'}
- **Record Processati:** ${results.dataProcessing?.processedRecords || 0}
- **Record Puliti:** ${results.dataProcessing?.cleanedRecords || 0}
- **Duplicati Rimossi:** ${results.dataProcessing?.metrics?.duplicatesRemoved || 0}
- **Coordinate Corrette:** ${results.dataProcessing?.metrics?.coordinatesFixed || 0}

### Monitoraggio Sistema
- **Stato Salute:** ${results.monitoring?.health.status || 'UNKNOWN'}
- **Score:** ${results.monitoring?.health.score || 0}/100
- **Problemi:** ${results.monitoring?.health.issues.length || 0}

## 🎯 Raccomandazioni Principali

${results.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📋 Prossimi Passi

${results.nextSteps.map(step => `- ${step}`).join('\n')}

## 📁 File Generati

- \`istat-import-report.md\` - Report importazione ISTAT
- \`osm-import-report.md\` - Report importazione OpenStreetMap
- \`data-processing-report.md\` - Report elaborazione dati
- \`system-monitoring.md\` - Metriche e monitoraggio
- \`phase2-results.json\` - Risultati completi in formato JSON

## ✅ Fase 2 Completata

La Fase 2 è stata completata con successo. I dati geografici sono stati importati, elaborati e ottimizzati.

**Pronto per la Fase 3: Implementazione Mappa**

---
*Report generato automaticamente dal Sistema di Esecuzione Fase 2 Urbanova*
`;

    this.saveReport('phase2-final-report.md', report);
    console.log(`  📋 Report finale salvato in: ${join(this.resultsDir, 'phase2-final-report.md')}`);
  }

  /**
   * Salva un report
   */
  private saveReport(filename: string, content: string): void {
    const filePath = join(this.resultsDir, filename);
    writeFileSync(filePath, content);
  }

  /**
   * Crea directory necessarie
   */
  private setupDirectories(): void {
    try {
      mkdirSync(this.resultsDir, { recursive: true });
    } catch (error) {
      // Directory già esiste
    }
  }

  /**
   * Calcola tempo di esecuzione
   */
  private getExecutionTime(): string {
    const duration = Date.now() - this.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

// Esecuzione script
async function main() {
  try {
    const executor = new Phase2Executor();
    const results = await executor.execute();
    
    console.log('\n🎉 Fase 2 completata con successo!');
    console.log('📁 Controlla la cartella reports/phase2/ per i report dettagliati');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Errore durante esecuzione Fase 2:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main();
}

export { Phase2Executor };
