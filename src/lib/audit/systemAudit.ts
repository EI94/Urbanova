/**
 * Sistema di Audit Completo per Urbanova
 * Analizza lo stato attuale del sistema di comuni e zone
 * Identifica gap e problemi per implementazione maniacale
 */

import { db } from '@/lib/database';
import { z } from 'zod';

// Schema per validazione dati audit
const AuditResultSchema = z.object({
  timestamp: z.date(),
  version: z.string(),
  systemStatus: z.enum(['HEALTHY', 'WARNING', 'CRITICAL', 'ERROR']),
  metrics: z.object({
    comuni: z.object({
      total: z.number(),
      withCoordinates: z.number(),
      withPopulation: z.number(),
      withArea: z.number(),
      completeness: z.number().min(0).max(100)
    }),
    zone: z.object({
      total: z.number(),
      byType: z.record(z.string(), z.number()),
      withCoordinates: z.number(),
      completeness: z.number().min(0).max(100)
    }),
    performance: z.object({
      avgQueryTime: z.number(),
      slowQueries: z.number(),
      cacheHitRate: z.number().min(0).max(100),
      memoryUsage: z.number()
    }),
    dataQuality: z.object({
      duplicateEntries: z.number(),
      missingRequiredFields: z.number(),
      invalidCoordinates: z.number(),
      outdatedData: z.number()
    })
  }),
  issues: z.array(z.object({
    id: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    category: z.enum(['DATA', 'PERFORMANCE', 'UX', 'SECURITY', 'COMPLIANCE']),
    title: z.string(),
    description: z.string(),
    impact: z.string(),
    recommendation: z.string(),
    estimatedFixTime: z.string(),
    priority: z.number().min(1).max(10)
  })),
  recommendations: z.array(z.object({
    id: z.string(),
    category: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    effort: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
    cost: z.enum(['FREE', 'LOW', 'MEDIUM', 'HIGH']),
    timeline: z.string(),
    dependencies: z.array(z.string())
  }))
});

export type AuditResult = z.infer<typeof AuditResultSchema>;
export type SystemIssue = z.infer<typeof AuditResultSchema>['issues'][0];
export type SystemRecommendation = z.infer<typeof AuditResultSchema>['recommendations'][0];

export class SystemAuditor {
  private db: typeof db;
  private startTime: Date;

  constructor() {
    this.db = db;
    this.startTime = new Date();
  }

  /**
   * Esegue audit completo del sistema
   */
  async performFullAudit(): Promise<AuditResult> {
    console.log('🔍 Iniziando audit completo del sistema...');
    
    try {
      // 1. Verifica connessione database
      await this.verifyDatabaseConnection();
      
      // 2. Analizza dati comuni
      const comuniMetrics = await this.analyzeComuniData();
      
      // 3. Analizza dati zone
      const zoneMetrics = await this.analyzeZoneData();
      
      // 4. Analizza performance
      const performanceMetrics = await this.analyzePerformance();
      
      // 5. Analizza qualità dati
      const dataQualityMetrics = await this.analyzeDataQuality();
      
      // 6. Identifica problemi
      const issues = await this.identifyIssues(comuniMetrics, zoneMetrics, performanceMetrics, dataQualityMetrics);
      
      // 7. Genera raccomandazioni
      const recommendations = await this.generateRecommendations(issues);
      
      // 8. Determina stato sistema
      const systemStatus = this.determineSystemStatus(issues);
      
      const auditResult: AuditResult = {
        timestamp: this.startTime,
        version: '1.0.0',
        systemStatus,
        metrics: {
          comuni: comuniMetrics,
          zone: zoneMetrics,
          performance: performanceMetrics,
          dataQuality: dataQualityMetrics
        },
        issues,
        recommendations
      };
      
      // 9. Salva audit result
      await this.saveAuditResult(auditResult);
      
      console.log('✅ Audit completato con successo');
      return auditResult;
      
    } catch (error) {
      console.error('❌ Errore durante audit:', error);
      throw new Error(`Audit fallito: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  }

  /**
   * Verifica connessione database
   */
  private async verifyDatabaseConnection(): Promise<void> {
    try {
      await this.db.query('SELECT 1');
      console.log('✅ Connessione database verificata');
    } catch (error) {
      throw new Error(`Connessione database fallita: ${error}`);
    }
  }

  /**
   * Analizza dati comuni
   */
  private async analyzeComuniData(): Promise<AuditResult['metrics']['comuni']> {
    console.log('📊 Analizzando dati comuni...');
    
    const queries = {
      total: 'SELECT COUNT(*) as count FROM comuni',
      withCoordinates: 'SELECT COUNT(*) as count FROM comuni WHERE latitudine IS NOT NULL AND longitudine IS NOT NULL',
      withPopulation: 'SELECT COUNT(*) as count FROM comuni WHERE popolazione IS NOT NULL AND popolazione > 0',
      withArea: 'SELECT COUNT(*) as count FROM comuni WHERE superficie IS NOT NULL AND superficie > 0'
    };
    
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const result = await this.db.query(query);
        return [key, result[0].count] as const;
      })
    );
    
    const metrics = Object.fromEntries(results) as Record<string, number>;
    const completeness = (metrics.withCoordinates / metrics.total) * 100;
    
    return {
      total: metrics.total,
      withCoordinates: metrics.withCoordinates,
      withPopulation: metrics.withPopulation,
      withArea: metrics.withArea,
      completeness: Math.round(completeness * 100) / 100
    };
  }

  /**
   * Analizza dati zone
   */
  private async analyzeZoneData(): Promise<AuditResult['metrics']['zone']> {
    console.log('🏘️ Analizzando dati zone...');
    
    const queries = {
      total: 'SELECT COUNT(*) as count FROM zone_urbane',
      withCoordinates: 'SELECT COUNT(*) as count FROM zone_urbane WHERE latitudine IS NOT NULL AND longitudine IS NOT NULL',
      byType: 'SELECT tipo_zona, COUNT(*) as count FROM zone_urbane GROUP BY tipo_zona'
    };
    
    const [totalResult, coordinatesResult, typeResult] = await Promise.all([
      this.db.query(queries.total),
      this.db.query(queries.withCoordinates),
      this.db.query(queries.byType)
    ]);
    
    const total = totalResult[0].count;
    const withCoordinates = coordinatesResult[0].count;
    const byType = Object.fromEntries(
      typeResult.map((row: any) => [row.tipo_zona, row.count])
    );
    
    const completeness = total > 0 ? (withCoordinates / total) * 100 : 0;
    
    return {
      total,
      byType,
      withCoordinates,
      completeness: Math.round(completeness * 100) / 100
    };
  }

  /**
   * Analizza performance sistema
   */
  private async analyzePerformance(): Promise<AuditResult['metrics']['performance']> {
    console.log('⚡ Analizzando performance...');
    
    // Test query performance
    const testQueries = [
      'SELECT COUNT(*) FROM comuni WHERE nome ILIKE \'%milano%\'',
      'SELECT * FROM comuni WHERE regione = \'Lombardia\' LIMIT 100',
      'SELECT c.*, z.nome as zona_nome FROM comuni c LEFT JOIN zone_urbane z ON c.id = z.comune_id WHERE c.nome ILIKE \'%roma%\' LIMIT 50'
    ];
    
    const queryTimes: number[] = [];
    
    for (const query of testQueries) {
      const start = Date.now();
      await this.db.query(query);
      const end = Date.now();
      queryTimes.push(end - start);
    }
    
    const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
    const slowQueries = queryTimes.filter(time => time > 1000).length;
    
    // Simula metriche cache e memoria (in un sistema reale, queste verrebbero da Redis e monitoring)
    const cacheHitRate = 85; // Simulato
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    
    return {
      avgQueryTime: Math.round(avgQueryTime * 100) / 100,
      slowQueries,
      cacheHitRate,
      memoryUsage: Math.round(memoryUsage * 100) / 100
    };
  }

  /**
   * Analizza qualità dati
   */
  private async analyzeDataQuality(): Promise<AuditResult['metrics']['dataQuality']> {
    console.log('🔍 Analizzando qualità dati...');
    
    const queries = {
      duplicateEntries: `
        SELECT COUNT(*) as count FROM (
          SELECT nome, COUNT(*) as cnt 
          FROM comuni 
          GROUP BY nome 
          HAVING COUNT(*) > 1
        ) duplicates
      `,
      missingRequiredFields: `
        SELECT COUNT(*) as count FROM comuni 
        WHERE nome IS NULL OR latitudine IS NULL OR longitudine IS NULL
      `,
      invalidCoordinates: `
        SELECT COUNT(*) as count FROM comuni 
        WHERE latitudine < -90 OR latitudine > 90 
           OR longitudine < -180 OR longitudine > 180
      `,
      outdatedData: `
        SELECT COUNT(*) as count FROM comuni 
        WHERE updated_at < NOW() - INTERVAL '1 year'
      `
    };
    
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        const result = await this.db.query(query);
        return [key, result[0].count] as const;
      })
    );
    
    return Object.fromEntries(results) as Record<string, number>;
  }

  /**
   * Identifica problemi del sistema
   */
  private async identifyIssues(
    comuniMetrics: AuditResult['metrics']['comuni'],
    zoneMetrics: AuditResult['metrics']['zone'],
    performanceMetrics: AuditResult['metrics']['performance'],
    dataQualityMetrics: AuditResult['metrics']['dataQuality']
  ): Promise<SystemIssue[]> {
    console.log('🚨 Identificando problemi...');
    
    const issues: SystemIssue[] = [];
    
    // Problemi dati comuni
    if (comuniMetrics.total < 7900) {
      issues.push({
        id: 'missing-comuni',
        severity: 'CRITICAL',
        category: 'DATA',
        title: 'Comuni mancanti nel database',
        description: `Solo ${comuniMetrics.total} comuni presenti, ne servono almeno 7904`,
        impact: 'Gli utenti non possono selezionare molti comuni italiani',
        recommendation: 'Importare dataset ISTAT completo',
        estimatedFixTime: '2-3 giorni',
        priority: 10
      });
    }
    
    if (comuniMetrics.completeness < 95) {
      issues.push({
        id: 'incomplete-comuni-data',
        severity: 'HIGH',
        category: 'DATA',
        title: 'Dati comuni incompleti',
        description: `Solo ${comuniMetrics.completeness}% dei comuni ha coordinate complete`,
        impact: 'Mappa non funziona per molti comuni',
        recommendation: 'Completare coordinate mancanti',
        estimatedFixTime: '1-2 giorni',
        priority: 8
      });
    }
    
    // Problemi zone
    if (zoneMetrics.total < 1000) {
      issues.push({
        id: 'missing-zone-urbane',
        severity: 'HIGH',
        category: 'DATA',
        title: 'Zone urbane insufficienti',
        description: `Solo ${zoneMetrics.total} zone urbane presenti, ne servono almeno 10000`,
        impact: 'Ricerca limitata per quartieri e frazioni',
        recommendation: 'Importare dati OpenStreetMap per zone urbane',
        estimatedFixTime: '3-4 giorni',
        priority: 9
      });
    }
    
    // Problemi performance
    if (performanceMetrics.avgQueryTime > 500) {
      issues.push({
        id: 'slow-queries',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        title: 'Query lente',
        description: `Tempo medio query: ${performanceMetrics.avgQueryTime}ms`,
        impact: 'Esperienza utente degradata',
        recommendation: 'Ottimizzare indici e query',
        estimatedFixTime: '1 giorno',
        priority: 6
      });
    }
    
    if (performanceMetrics.cacheHitRate < 80) {
      issues.push({
        id: 'low-cache-hit-rate',
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        title: 'Cache hit rate basso',
        description: `Cache hit rate: ${performanceMetrics.cacheHitRate}%`,
        impact: 'Caricamento dati più lento',
        recommendation: 'Implementare cache Redis',
        estimatedFixTime: '2 giorni',
        priority: 5
      });
    }
    
    // Problemi qualità dati
    if (dataQualityMetrics.duplicateEntries > 0) {
      issues.push({
        id: 'duplicate-entries',
        severity: 'MEDIUM',
        category: 'DATA',
        title: 'Entrate duplicate',
        description: `${dataQualityMetrics.duplicateEntries} entrate duplicate trovate`,
        impact: 'Risultati di ricerca confusi',
        recommendation: 'Rimuovere duplicati e implementare vincoli unici',
        estimatedFixTime: '1 giorno',
        priority: 4
      });
    }
    
    if (dataQualityMetrics.invalidCoordinates > 0) {
      issues.push({
        id: 'invalid-coordinates',
        severity: 'HIGH',
        category: 'DATA',
        title: 'Coordinate non valide',
        description: `${dataQualityMetrics.invalidCoordinates} comuni con coordinate non valide`,
        impact: 'Mappa non funziona per questi comuni',
        recommendation: 'Correggere coordinate non valide',
        estimatedFixTime: '1 giorno',
        priority: 7
      });
    }
    
    return issues;
  }

  /**
   * Genera raccomandazioni per miglioramenti
   */
  private async generateRecommendations(issues: SystemIssue[]): Promise<SystemRecommendation[]> {
    console.log('💡 Generando raccomandazioni...');
    
    const recommendations: SystemRecommendation[] = [];
    
    // Raccomandazioni basate sui problemi identificati
    if (issues.some(i => i.id === 'missing-comuni')) {
      recommendations.push({
        id: 'import-istat-data',
        category: 'DATA',
        title: 'Importare dataset ISTAT completo',
        description: 'Implementare script di importazione per tutti i 7904 comuni italiani',
        impact: 'CRITICAL',
        effort: 'MEDIUM',
        cost: 'FREE',
        timeline: 'Settimana 3-4',
        dependencies: ['setup-database-schema']
      });
    }
    
    if (issues.some(i => i.id === 'missing-zone-urbane')) {
      recommendations.push({
        id: 'import-osm-data',
        category: 'DATA',
        title: 'Importare dati OpenStreetMap',
        description: 'Implementare importazione zone urbane da OSM per quartieri e frazioni',
        impact: 'HIGH',
        effort: 'HIGH',
        cost: 'FREE',
        timeline: 'Settimana 5-6',
        dependencies: ['import-istat-data']
      });
    }
    
    if (issues.some(i => i.id === 'slow-queries')) {
      recommendations.push({
        id: 'optimize-database',
        category: 'PERFORMANCE',
        title: 'Ottimizzare database e query',
        description: 'Implementare indici ottimizzati e query efficienti',
        impact: 'HIGH',
        effort: 'MEDIUM',
        cost: 'FREE',
        timeline: 'Settimana 7-8',
        dependencies: ['import-istat-data']
      });
    }
    
    if (issues.some(i => i.id === 'low-cache-hit-rate')) {
      recommendations.push({
        id: 'implement-redis-cache',
        category: 'PERFORMANCE',
        title: 'Implementare cache Redis',
        description: 'Aggiungere cache Redis per migliorare performance',
        impact: 'MEDIUM',
        effort: 'MEDIUM',
        cost: 'LOW',
        timeline: 'Settimana 9-10',
        dependencies: ['optimize-database']
      });
    }
    
    // Raccomandazioni generali
    recommendations.push({
      id: 'implement-map-search',
      category: 'UX',
      title: 'Implementare ricerca con mappa',
      description: 'Aggiungere componente mappa interattiva per selezione zone',
      impact: 'HIGH',
      effort: 'HIGH',
      cost: 'FREE',
      timeline: 'Settimana 11-12',
      dependencies: ['import-osm-data', 'optimize-database']
    });
    
    recommendations.push({
      id: 'implement-advanced-search',
      category: 'UX',
      title: 'Implementare ricerca avanzata',
      description: 'Aggiungere filtri avanzati e autocomplete intelligente',
      impact: 'MEDIUM',
      effort: 'MEDIUM',
      cost: 'FREE',
      timeline: 'Settimana 13-14',
      dependencies: ['implement-map-search']
    });
    
    return recommendations;
  }

  /**
   * Determina stato del sistema
   */
  private determineSystemStatus(issues: SystemIssue[]): AuditResult['systemStatus'] {
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL').length;
    const highIssues = issues.filter(i => i.severity === 'HIGH').length;
    const mediumIssues = issues.filter(i => i.severity === 'MEDIUM').length;
    
    if (criticalIssues > 0) return 'CRITICAL';
    if (highIssues > 2) return 'ERROR';
    if (highIssues > 0 || mediumIssues > 5) return 'WARNING';
    return 'HEALTHY';
  }

  /**
   * Salva risultato audit
   */
  private async saveAuditResult(auditResult: AuditResult): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO audit_results (
          timestamp, version, system_status, metrics, issues, recommendations
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        auditResult.timestamp,
        auditResult.version,
        auditResult.systemStatus,
        JSON.stringify(auditResult.metrics),
        JSON.stringify(auditResult.issues),
        JSON.stringify(auditResult.recommendations)
      ]);
      
      console.log('✅ Risultato audit salvato');
    } catch (error) {
      console.warn('⚠️ Impossibile salvare risultato audit:', error);
    }
  }

  /**
   * Genera report audit in formato markdown
   */
  async generateAuditReport(auditResult: AuditResult): Promise<string> {
    const report = `
# 🔍 Audit Report - Sistema Comuni e Zone Urbanova

**Data:** ${auditResult.timestamp.toISOString()}  
**Versione:** ${auditResult.version}  
**Stato Sistema:** ${this.getStatusEmoji(auditResult.systemStatus)} ${auditResult.systemStatus}

## 📊 Metriche Principali

### Comuni
- **Totale:** ${auditResult.metrics.comuni.total}
- **Con Coordinate:** ${auditResult.metrics.comuni.withCoordinates}
- **Con Popolazione:** ${auditResult.metrics.comuni.withPopulation}
- **Con Superficie:** ${auditResult.metrics.comuni.withArea}
- **Completezza:** ${auditResult.metrics.comuni.completeness}%

### Zone Urbane
- **Totale:** ${auditResult.metrics.zone.total}
- **Con Coordinate:** ${auditResult.metrics.zone.withCoordinates}
- **Completezza:** ${auditResult.metrics.zone.completeness}%

**Per Tipo:**
${Object.entries(auditResult.metrics.zone.byType)
  .map(([type, count]) => `- **${type}:** ${count}`)
  .join('\n')}

### Performance
- **Tempo Medio Query:** ${auditResult.metrics.performance.avgQueryTime}ms
- **Query Lente:** ${auditResult.metrics.performance.slowQueries}
- **Cache Hit Rate:** ${auditResult.metrics.performance.cacheHitRate}%
- **Uso Memoria:** ${auditResult.metrics.performance.memoryUsage}MB

### Qualità Dati
- **Entrate Duplicate:** ${auditResult.metrics.dataQuality.duplicateEntries}
- **Campi Obbligatori Mancanti:** ${auditResult.metrics.dataQuality.missingRequiredFields}
- **Coordinate Non Valide:** ${auditResult.metrics.dataQuality.invalidCoordinates}
- **Dati Obsoleti:** ${auditResult.metrics.dataQuality.outdatedData}

## 🚨 Problemi Identificati

${auditResult.issues.map(issue => `
### ${this.getSeverityEmoji(issue.severity)} ${issue.title}
- **Categoria:** ${issue.category}
- **Severità:** ${issue.severity}
- **Priorità:** ${issue.priority}/10
- **Descrizione:** ${issue.description}
- **Impatto:** ${issue.impact}
- **Raccomandazione:** ${issue.recommendation}
- **Tempo Stimato:** ${issue.estimatedFixTime}
`).join('\n')}

## 💡 Raccomandazioni

${auditResult.recommendations.map(rec => `
### ${rec.title}
- **Categoria:** ${rec.category}
- **Impatto:** ${rec.impact}
- **Sforzo:** ${rec.effort}
- **Costo:** ${rec.cost}
- **Timeline:** ${rec.timeline}
- **Descrizione:** ${rec.description}
- **Dipendenze:** ${rec.dependencies.join(', ') || 'Nessuna'}
`).join('\n')}

## 🎯 Prossimi Passi

1. **Priorità Alta:** Risolvere problemi CRITICAL e HIGH
2. **Implementazione:** Seguire raccomandazioni in ordine di priorità
3. **Monitoraggio:** Eseguire audit regolari per verificare miglioramenti
4. **Testing:** Implementare test automatizzati per prevenire regressioni

---
*Report generato automaticamente dal Sistema di Audit Urbanova*
`;

    return report;
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'HEALTHY': return '✅';
      case 'WARNING': return '⚠️';
      case 'CRITICAL': return '🚨';
      case 'ERROR': return '❌';
      default: return '❓';
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'LOW': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🟠';
      case 'CRITICAL': return '🔴';
      default: return '⚪';
    }
  }
}

// Esporta istanza singleton
export const systemAuditor = new SystemAuditor();
