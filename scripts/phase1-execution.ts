#!/usr/bin/env ts-node

/**
 * Script di Esecuzione Fase 1 - Preparazione e Analisi
 * Esegue audit completo, validazione fonti e preparazione database
 */

import { systemAuditor } from '../src/lib/audit/systemAudit';
import { dataSourceValidator } from '../src/lib/data-sources/dataSourceValidator';
import { systemMonitor } from '../src/lib/monitoring/systemMonitor';
import { dataValidator } from '../src/lib/validation/dataValidator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface Phase1Results {
  audit: any;
  dataSources: any[];
  monitoring: any;
  recommendations: string[];
  nextSteps: string[];
}

class Phase1Executor {
  private resultsDir = 'reports/phase1';
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.setupDirectories();
  }

  /**
   * Esegue la Fase 1 completa
   */
  async execute(): Promise<Phase1Results> {
    console.log('🚀 Iniziando Fase 1: Preparazione e Analisi');
    console.log('=' .repeat(60));
    
    const results: Phase1Results = {
      audit: null,
      dataSources: [],
      monitoring: null,
      recommendations: [],
      nextSteps: []
    };

    try {
      // 1. Audit del sistema attuale
      console.log('\n📊 1. Esecuzione Audit Sistema...');
      results.audit = await this.executeSystemAudit();
      
      // 2. Validazione fonti dati
      console.log('\n🔍 2. Validazione Fonti Dati...');
      results.dataSources = await this.executeDataSourceValidation();
      
      // 3. Monitoraggio sistema
      console.log('\n📈 3. Monitoraggio Sistema...');
      results.monitoring = await this.executeSystemMonitoring();
      
      // 4. Genera raccomandazioni
      console.log('\n💡 4. Generazione Raccomandazioni...');
      results.recommendations = this.generateRecommendations(results);
      
      // 5. Prossimi passi
      console.log('\n🎯 5. Definizione Prossimi Passi...');
      results.nextSteps = this.generateNextSteps(results);
      
      // 6. Salva risultati
      console.log('\n💾 6. Salvataggio Risultati...');
      await this.saveResults(results);
      
      // 7. Genera report finale
      console.log('\n📋 7. Generazione Report Finale...');
      await this.generateFinalReport(results);
      
      console.log('\n✅ Fase 1 completata con successo!');
      console.log(`⏱️  Tempo totale: ${this.getExecutionTime()}`);
      
      return results;
      
    } catch (error) {
      console.error('\n❌ Errore durante esecuzione Fase 1:', error);
      throw error;
    }
  }

  /**
   * Esegue audit del sistema
   */
  private async executeSystemAudit(): Promise<any> {
    console.log('  🔍 Eseguendo audit completo...');
    
    const auditResult = await systemAuditor.performFullAudit();
    
    console.log(`  ✅ Audit completato: ${auditResult.issues.length} problemi, ${auditResult.recommendations.length} raccomandazioni`);
    
    // Salva report audit
    const auditReport = await systemAuditor.generateAuditReport(auditResult);
    this.saveReport('audit-report.md', auditReport);
    
    return auditResult;
  }

  /**
   * Esegue validazione fonti dati
   */
  private async executeDataSourceValidation(): Promise<any[]> {
    console.log('  🔍 Validando fonti dati...');
    
    const dataSources = await dataSourceValidator.validateAllDataSources();
    
    console.log(`  ✅ ${dataSources.length} fonti validate`);
    
    // Salva report validazione
    const validationReport = await dataSourceValidator.generateValidationReport(dataSources);
    this.saveReport('data-sources-validation.md', validationReport);
    
    return dataSources;
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
  private generateRecommendations(results: Phase1Results): string[] {
    const recommendations: string[] = [];
    
    // Raccomandazioni basate su audit
    if (results.audit) {
      const criticalIssues = results.audit.issues.filter((i: any) => i.severity === 'CRITICAL');
      if (criticalIssues.length > 0) {
        recommendations.push(`🚨 Risolvere ${criticalIssues.length} problemi critici identificati nell'audit`);
      }
      
      const highIssues = results.audit.issues.filter((i: any) => i.severity === 'HIGH');
      if (highIssues.length > 0) {
        recommendations.push(`⚠️ Risolvere ${highIssues.length} problemi ad alta priorità`);
      }
    }
    
    // Raccomandazioni basate su fonti dati
    if (results.dataSources.length > 0) {
      const accessibleSources = results.dataSources.filter((s: any) => s.validationResults?.isAccessible);
      if (accessibleSources.length === 0) {
        recommendations.push('🔍 Nessuna fonte dati accessibile - verificare connessioni');
      } else {
        recommendations.push(`✅ ${accessibleSources.length} fonti dati accessibili identificate`);
      }
    }
    
    // Raccomandazioni basate su monitoraggio
    if (results.monitoring) {
      if (results.monitoring.health.score < 70) {
        recommendations.push('🏥 Sistema in stato critico - intervento immediato richiesto');
      } else if (results.monitoring.health.score < 90) {
        recommendations.push('⚠️ Sistema in stato di warning - monitorare attentamente');
      } else {
        recommendations.push('✅ Sistema in buono stato');
      }
      
      if (results.monitoring.performance.avgQueryTime > 500) {
        recommendations.push('⚡ Query lente rilevate - ottimizzazione necessaria');
      }
      
      if (results.monitoring.dataQuality.dataCompleteness < 90) {
        recommendations.push('📊 Dati incompleti - completamento necessario');
      }
    }
    
    return recommendations;
  }

  /**
   * Genera prossimi passi
   */
  private generateNextSteps(results: Phase1Results): string[] {
    const nextSteps: string[] = [];
    
    nextSteps.push('📋 Fase 2: Raccolta e Preparazione Dati (Settimana 3-4)');
    nextSteps.push('  - Implementare script di importazione ISTAT');
    nextSteps.push('  - Implementare script di importazione OpenStreetMap');
    nextSteps.push('  - Validare e pulire dati importati');
    nextSteps.push('  - Creare indici per performance ottimali');
    
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
    
    return nextSteps;
  }

  /**
   * Salva risultati
   */
  private async saveResults(results: Phase1Results): Promise<void> {
    const resultsFile = join(this.resultsDir, 'phase1-results.json');
    writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`  💾 Risultati salvati in: ${resultsFile}`);
  }

  /**
   * Genera report finale
   */
  private async generateFinalReport(results: Phase1Results): Promise<void> {
    const report = `
# 🚀 Fase 1: Preparazione e Analisi - COMPLETATA

**Data Esecuzione:** ${this.startTime.toISOString()}  
**Durata:** ${this.getExecutionTime()}  
**Stato:** ✅ COMPLETATA CON SUCCESSO

## 📊 Riepilogo Risultati

### Audit Sistema
- **Problemi Identificati:** ${results.audit?.issues.length || 0}
- **Raccomandazioni:** ${results.audit?.recommendations.length || 0}
- **Stato Sistema:** ${results.audit?.systemStatus || 'UNKNOWN'}

### Fonti Dati
- **Fonti Validate:** ${results.dataSources.length}
- **Fonti Accessibili:** ${results.dataSources.filter((s: any) => s.validationResults?.isAccessible).length}

### Monitoraggio
- **Stato Salute:** ${results.monitoring?.health.status || 'UNKNOWN'}
- **Score:** ${results.monitoring?.health.score || 0}/100
- **Problemi:** ${results.monitoring?.health.issues.length || 0}

## 🎯 Raccomandazioni Principali

${results.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📋 Prossimi Passi

${results.nextSteps.map(step => `- ${step}`).join('\n')}

## 📁 File Generati

- \`audit-report.md\` - Report completo audit sistema
- \`data-sources-validation.md\` - Validazione fonti dati
- \`system-monitoring.md\` - Metriche e monitoraggio
- \`phase1-results.json\` - Risultati completi in formato JSON

## ✅ Fase 1 Completata

La Fase 1 è stata completata con successo. Il sistema è stato analizzato, le fonti dati validate e il monitoraggio implementato. 

**Pronto per la Fase 2: Raccolta e Preparazione Dati**

---
*Report generato automaticamente dal Sistema di Esecuzione Fase 1 Urbanova*
`;

    this.saveReport('phase1-final-report.md', report);
    console.log(`  📋 Report finale salvato in: ${join(this.resultsDir, 'phase1-final-report.md')}`);
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
    const executor = new Phase1Executor();
    const results = await executor.execute();
    
    console.log('\n🎉 Fase 1 completata con successo!');
    console.log('📁 Controlla la cartella reports/phase1/ per i report dettagliati');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Errore durante esecuzione Fase 1:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main();
}

export { Phase1Executor };

