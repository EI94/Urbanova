#!/usr/bin/env ts-node

/**
 * Script di Test e Validazione Fase 1
 * Testa tutti i componenti implementati nella Fase 1
 */

import { systemAuditor } from '../src/lib/audit/systemAudit';
import { dataSourceValidator } from '../src/lib/data-sources/dataSourceValidator';
import { systemMonitor } from '../src/lib/monitoring/systemMonitor';
import { dataValidator } from '../src/lib/validation/dataValidator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
}

class Phase1Tester {
  private resultsDir = 'reports/phase1-tests';
  private testSuites: TestSuite[] = [];
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.setupDirectories();
  }

  /**
   * Esegue tutti i test della Fase 1
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Iniziando Test Fase 1: Preparazione e Analisi');
    console.log('=' .repeat(60));
    
    try {
      // Test 1: Sistema Audit
      await this.testSystemAudit();
      
      // Test 2: Validazione Fonti Dati
      await this.testDataSourceValidation();
      
      // Test 3: Sistema Monitoraggio
      await this.testSystemMonitoring();
      
      // Test 4: Sistema Validazione
      await this.testDataValidation();
      
      // Test 5: Integrazione
      await this.testIntegration();
      
      // Genera report finale
      await this.generateTestReport();
      
      console.log('\n✅ Tutti i test completati!');
      console.log(`⏱️  Tempo totale: ${this.getExecutionTime()}`);
      
    } catch (error) {
      console.error('\n❌ Errore durante esecuzione test:', error);
      throw error;
    }
  }

  /**
   * Test Sistema Audit
   */
  private async testSystemAudit(): Promise<void> {
    console.log('\n📊 Test Sistema Audit...');
    
    const suite: TestSuite = {
      name: 'Sistema Audit',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: 0
    };
    
    const suiteStart = Date.now();
    
    try {
      // Test 1: Creazione auditor
      const test1 = await this.runTest('Creazione SystemAuditor', async () => {
        const auditor = systemAuditor;
        if (!auditor) throw new Error('SystemAuditor non creato');
        return { auditor: 'OK' };
      });
      suite.tests.push(test1);
      
      // Test 2: Esecuzione audit
      const test2 = await this.runTest('Esecuzione Audit Completo', async () => {
        const result = await systemAuditor.performFullAudit();
        if (!result || !result.metrics) throw new Error('Audit non eseguito correttamente');
        return { 
          issues: result.issues.length,
          recommendations: result.recommendations.length,
          systemStatus: result.systemStatus
        };
      });
      suite.tests.push(test2);
      
      // Test 3: Generazione report
      const test3 = await this.runTest('Generazione Report Audit', async () => {
        const result = await systemAuditor.performFullAudit();
        const report = await systemAuditor.generateAuditReport(result);
        if (!report || report.length < 100) throw new Error('Report non generato correttamente');
        return { reportLength: report.length };
      });
      suite.tests.push(test3);
      
    } catch (error) {
      console.error('Errore durante test Sistema Audit:', error);
    }
    
    suite.duration = Date.now() - suiteStart;
    suite.totalTests = suite.tests.length;
    suite.passedTests = suite.tests.filter(t => t.status === 'PASS').length;
    suite.failedTests = suite.tests.filter(t => t.status === 'FAIL').length;
    suite.skippedTests = suite.tests.filter(t => t.status === 'SKIP').length;
    
    this.testSuites.push(suite);
    this.printSuiteResults(suite);
  }

  /**
   * Test Validazione Fonti Dati
   */
  private async testDataSourceValidation(): Promise<void> {
    console.log('\n🔍 Test Validazione Fonti Dati...');
    
    const suite: TestSuite = {
      name: 'Validazione Fonti Dati',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: 0
    };
    
    const suiteStart = Date.now();
    
    try {
      // Test 1: Creazione validator
      const test1 = await this.runTest('Creazione DataSourceValidator', async () => {
        const validator = dataSourceValidator;
        if (!validator) throw new Error('DataSourceValidator non creato');
        return { validator: 'OK' };
      });
      suite.tests.push(test1);
      
      // Test 2: Validazione fonti
      const test2 = await this.runTest('Validazione Fonti Dati', async () => {
        const sources = await dataSourceValidator.validateAllDataSources();
        if (!sources || sources.length === 0) throw new Error('Nessuna fonte validata');
        return { sourcesCount: sources.length };
      });
      suite.tests.push(test2);
      
      // Test 3: Generazione report
      const test3 = await this.runTest('Generazione Report Validazione', async () => {
        const sources = await dataSourceValidator.validateAllDataSources();
        const report = await dataSourceValidator.generateValidationReport(sources);
        if (!report || report.length < 100) throw new Error('Report non generato correttamente');
        return { reportLength: report.length };
      });
      suite.tests.push(test3);
      
    } catch (error) {
      console.error('Errore durante test Validazione Fonti Dati:', error);
    }
    
    suite.duration = Date.now() - suiteStart;
    suite.totalTests = suite.tests.length;
    suite.passedTests = suite.tests.filter(t => t.status === 'PASS').length;
    suite.failedTests = suite.tests.filter(t => t.status === 'FAIL').length;
    suite.skippedTests = suite.tests.filter(t => t.status === 'SKIP').length;
    
    this.testSuites.push(suite);
    this.printSuiteResults(suite);
  }

  /**
   * Test Sistema Monitoraggio
   */
  private async testSystemMonitoring(): Promise<void> {
    console.log('\n📈 Test Sistema Monitoraggio...');
    
    const suite: TestSuite = {
      name: 'Sistema Monitoraggio',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: 0
    };
    
    const suiteStart = Date.now();
    
    try {
      // Test 1: Creazione monitor
      const test1 = await this.runTest('Creazione SystemMonitor', async () => {
        const monitor = systemMonitor;
        if (!monitor) throw new Error('SystemMonitor non creato');
        return { monitor: 'OK' };
      });
      suite.tests.push(test1);
      
      // Test 2: Raccolta metriche
      const test2 = await this.runTest('Raccolta Metriche Sistema', async () => {
        const metrics = await systemMonitor.collectAllMetrics();
        if (!metrics || !metrics.health) throw new Error('Metriche non raccolte correttamente');
        return { 
          healthScore: metrics.health.score,
          status: metrics.health.status
        };
      });
      suite.tests.push(test2);
      
      // Test 3: Generazione report
      const test3 = await this.runTest('Generazione Report Monitoraggio', async () => {
        const metrics = await systemMonitor.collectAllMetrics();
        const report = await systemMonitor.generateMonitoringReport(metrics);
        if (!report || report.length < 100) throw new Error('Report non generato correttamente');
        return { reportLength: report.length };
      });
      suite.tests.push(test3);
      
      // Test 4: Storia metriche
      const test4 = await this.runTest('Storia Metriche', async () => {
        const history = systemMonitor.getMetricsHistory();
        if (!Array.isArray(history)) throw new Error('Storia metriche non disponibile');
        return { historyLength: history.length };
      });
      suite.tests.push(test4);
      
    } catch (error) {
      console.error('Errore durante test Sistema Monitoraggio:', error);
    }
    
    suite.duration = Date.now() - suiteStart;
    suite.totalTests = suite.tests.length;
    suite.passedTests = suite.tests.filter(t => t.status === 'PASS').length;
    suite.failedTests = suite.tests.filter(t => t.status === 'FAIL').length;
    suite.skippedTests = suite.tests.filter(t => t.status === 'SKIP').length;
    
    this.testSuites.push(suite);
    this.printSuiteResults(suite);
  }

  /**
   * Test Sistema Validazione
   */
  private async testDataValidation(): Promise<void> {
    console.log('\n✅ Test Sistema Validazione...');
    
    const suite: TestSuite = {
      name: 'Sistema Validazione',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: 0
    };
    
    const suiteStart = Date.now();
    
    try {
      // Test 1: Creazione validator
      const test1 = await this.runTest('Creazione DataValidator', async () => {
        const validator = dataValidator;
        if (!validator) throw new Error('DataValidator non creato');
        return { validator: 'OK' };
      });
      suite.tests.push(test1);
      
      // Test 2: Validazione dati comuni
      const test2 = await this.runTest('Validazione Dati Comuni', async () => {
        const mockComuniData = [
          {
            codice_istat: '001001',
            nome: 'Roma',
            latitudine: 41.9028,
            longitudine: 12.4964,
            popolazione: 2873000,
            superficie: 1285.31,
            regione: 'Lazio',
            provincia: 'Roma'
          }
        ];
        
        const result = await dataValidator.validateComuniData(mockComuniData);
        if (!result || !result.isValid) throw new Error('Validazione comuni fallita');
        return { 
          isValid: result.isValid,
          errors: result.errors.length,
          warnings: result.warnings.length
        };
      });
      suite.tests.push(test2);
      
      // Test 3: Validazione dati zone
      const test3 = await this.runTest('Validazione Dati Zone', async () => {
        const mockZoneData = [
          {
            nome: 'Centro Storico',
            comune: 'Roma',
            latitudine: 41.9028,
            longitudine: 12.4964,
            tipo: 'Centro Storico',
            popolazione: 50000
          }
        ];
        
        const result = await dataValidator.validateZoneUrbaneData(mockZoneData);
        if (!result || !result.isValid) throw new Error('Validazione zone fallita');
        return { 
          isValid: result.isValid,
          errors: result.errors.length,
          warnings: result.warnings.length
        };
      });
      suite.tests.push(test3);
      
    } catch (error) {
      console.error('Errore durante test Sistema Validazione:', error);
    }
    
    suite.duration = Date.now() - suiteStart;
    suite.totalTests = suite.tests.length;
    suite.passedTests = suite.tests.filter(t => t.status === 'PASS').length;
    suite.failedTests = suite.tests.filter(t => t.status === 'FAIL').length;
    suite.skippedTests = suite.tests.filter(t => t.status === 'SKIP').length;
    
    this.testSuites.push(suite);
    this.printSuiteResults(suite);
  }

  /**
   * Test Integrazione
   */
  private async testIntegration(): Promise<void> {
    console.log('\n🔗 Test Integrazione...');
    
    const suite: TestSuite = {
      name: 'Integrazione',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      duration: 0
    };
    
    const suiteStart = Date.now();
    
    try {
      // Test 1: Integrazione audit + monitoraggio
      const test1 = await this.runTest('Integrazione Audit + Monitoraggio', async () => {
        const auditResult = await systemAuditor.performFullAudit();
        const metrics = await systemMonitor.collectAllMetrics();
        
        if (!auditResult || !metrics) throw new Error('Integrazione fallita');
        return { 
          auditIssues: auditResult.issues.length,
          healthScore: metrics.health.score
        };
      });
      suite.tests.push(test1);
      
      // Test 2: Integrazione validazione + fonti
      const test2 = await this.runTest('Integrazione Validazione + Fonti', async () => {
        const sources = await dataSourceValidator.validateAllDataSources();
        const mockData = [{ codice_istat: '001001', nome: 'Roma', latitudine: 41.9028, longitudine: 12.4964 }];
        const validationResult = await dataValidator.validateComuniData(mockData);
        
        if (!sources || !validationResult) throw new Error('Integrazione fallita');
        return { 
          sourcesCount: sources.length,
          validationValid: validationResult.isValid
        };
      });
      suite.tests.push(test2);
      
    } catch (error) {
      console.error('Errore durante test Integrazione:', error);
    }
    
    suite.duration = Date.now() - suiteStart;
    suite.totalTests = suite.tests.length;
    suite.passedTests = suite.tests.filter(t => t.status === 'PASS').length;
    suite.failedTests = suite.tests.filter(t => t.status === 'FAIL').length;
    suite.skippedTests = suite.tests.filter(t => t.status === 'SKIP').length;
    
    this.testSuites.push(suite);
    this.printSuiteResults(suite);
  }

  /**
   * Esegue un singolo test
   */
  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const start = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - start;
      
      return {
        component: name,
        status: 'PASS',
        message: 'Test superato con successo',
        duration,
        details: result
      };
    } catch (error) {
      const duration = Date.now() - start;
      
      return {
        component: name,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Errore sconosciuto',
        duration,
        details: { error: error instanceof Error ? error.stack : error }
      };
    }
  }

  /**
   * Stampa risultati suite
   */
  private printSuiteResults(suite: TestSuite): void {
    console.log(`\n📊 ${suite.name}:`);
    console.log(`  ✅ Passati: ${suite.passedTests}`);
    console.log(`  ❌ Falliti: ${suite.failedTests}`);
    console.log(`  ⏭️  Saltati: ${suite.skippedTests}`);
    console.log(`  ⏱️  Durata: ${suite.duration}ms`);
    
    if (suite.failedTests > 0) {
      console.log(`\n❌ Test falliti:`);
      suite.tests.filter(t => t.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.component}: ${test.message}`);
      });
    }
  }

  /**
   * Genera report test
   */
  private async generateTestReport(): Promise<void> {
    const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalSkipped = this.testSuites.reduce((sum, suite) => sum + suite.skippedTests, 0);
    const totalDuration = this.testSuites.reduce((sum, suite) => sum + suite.duration, 0);
    
    const report = `
# 🧪 Test Fase 1: Preparazione e Analisi - REPORT

**Data Esecuzione:** ${this.startTime.toISOString()}  
**Durata Totale:** ${this.getExecutionTime()}  
**Stato:** ${totalFailed === 0 ? '✅ TUTTI I TEST SUPERATI' : '❌ ALCUNI TEST FALLITI'}

## 📊 Riepilogo Generale

- **Test Totali:** ${totalTests}
- **Test Superati:** ${totalPassed} (${Math.round((totalPassed / totalTests) * 100)}%)
- **Test Falliti:** ${totalFailed} (${Math.round((totalFailed / totalTests) * 100)}%)
- **Test Saltati:** ${totalSkipped} (${Math.round((totalSkipped / totalTests) * 100)}%)
- **Durata Totale:** ${totalDuration}ms

## 📋 Risultati per Suite

${this.testSuites.map(suite => `
### ${suite.name}
- **Test Totali:** ${suite.totalTests}
- **Superati:** ${suite.passedTests} (${Math.round((suite.passedTests / suite.totalTests) * 100)}%)
- **Falliti:** ${suite.failedTests} (${Math.round((suite.failedTests / suite.totalTests) * 100)}%)
- **Saltati:** ${suite.skippedTests} (${Math.round((suite.skippedTests / suite.totalTests) * 100)}%)
- **Durata:** ${suite.duration}ms

#### Dettagli Test
${suite.tests.map(test => `
- **${test.component}:** ${test.status} (${test.duration}ms)
  - Messaggio: ${test.message}
  ${test.details ? `  - Dettagli: ${JSON.stringify(test.details, null, 2)}` : ''}
`).join('')}
`).join('')}

## 🎯 Conclusioni

${totalFailed === 0 ? 
  '✅ Tutti i test sono stati superati con successo. La Fase 1 è pronta per la produzione.' : 
  '❌ Alcuni test sono falliti. È necessario risolvere i problemi prima di procedere.'}

## 📁 File Generati

- \`test-results.json\` - Risultati completi in formato JSON
- \`test-report.md\` - Report dettagliato test

---
*Report generato automaticamente dal Sistema di Test Fase 1 Urbanova*
`;

    // Salva report
    this.saveReport('test-report.md', report);
    
    // Salva risultati JSON
    const results = {
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalSkipped,
        totalDuration,
        executionTime: this.getExecutionTime()
      },
      suites: this.testSuites
    };
    
    this.saveReport('test-results.json', JSON.stringify(results, null, 2));
    
    console.log(`\n📋 Report test salvato in: ${join(this.resultsDir, 'test-report.md')}`);
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
    const tester = new Phase1Tester();
    await tester.runAllTests();
    
    console.log('\n🎉 Test Fase 1 completati!');
    console.log('📁 Controlla la cartella reports/phase1-tests/ per i report dettagliati');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Errore durante esecuzione test:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main();
}

export { Phase1Tester };

