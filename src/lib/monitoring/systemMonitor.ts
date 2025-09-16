/**
 * Sistema di Monitoraggio e Metriche per Urbanova
 * Monitora performance, qualità dati e utilizzo del sistema
 */

import { db } from '@/lib/database';

export interface SystemMetrics {
  timestamp: Date;
  performance: PerformanceMetrics;
  dataQuality: DataQualityMetrics;
  usage: UsageMetrics;
  errors: ErrorMetrics;
  health: HealthStatus;
}

export interface PerformanceMetrics {
  avgQueryTime: number;
  slowQueries: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
}

export interface DataQualityMetrics {
  totalComuni: number;
  comuniWithCoordinates: number;
  comuniWithPopulation: number;
  comuniWithArea: number;
  totalZone: number;
  zoneWithCoordinates: number;
  duplicateEntries: number;
  missingRequiredFields: number;
  invalidCoordinates: number;
  outdatedData: number;
  dataCompleteness: number;
  dataAccuracy: number;
}

export interface UsageMetrics {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  uniqueUsers: number;
  popularSearches: string[];
  searchByType: {
    comuni: number;
    zone: number;
    mixed: number;
  };
  searchByRegion: Record<string, number>;
  peakUsageHour: number;
  averageSessionDuration: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recentErrors: Array<{
    timestamp: Date;
    type: string;
    message: string;
    severity: string;
    count: number;
  }>;
  errorRate: number;
}

export interface HealthStatus {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DOWN';
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  lastCheck: Date;
}

export class SystemMonitor {
  private db: typeof db;
  private metricsHistory: SystemMetrics[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.db = db;
  }

  /**
   * Raccoglie tutte le metriche del sistema
   */
  async collectAllMetrics(): Promise<SystemMetrics> {
    console.log('📊 Raccogliendo metriche del sistema...');
    
    const [performance, dataQuality, usage, errors, health] = await Promise.all([
      this.collectPerformanceMetrics(),
      this.collectDataQualityMetrics(),
      this.collectUsageMetrics(),
      this.collectErrorMetrics(),
      this.collectHealthStatus()
    ]);

    const metrics: SystemMetrics = {
      timestamp: new Date(),
      performance,
      dataQuality,
      usage,
      errors,
      health
    };

    // Salva nelle metriche storiche
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Salva nel database
    await this.saveMetricsToDatabase(metrics);

    return metrics;
  }

  /**
   * Raccoglie metriche di performance
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    // Test query performance
    const testQueries = [
      'SELECT COUNT(*) FROM comuni WHERE nome ILIKE \'%milano%\'',
      'SELECT * FROM comuni WHERE regione_id = 1 LIMIT 100',
      'SELECT c.*, z.nome as zona_nome FROM comuni c LEFT JOIN zone_urbane z ON c.id = z.comune_id WHERE c.nome ILIKE \'%roma%\' LIMIT 50'
    ];
    
    const queryTimes: number[] = [];
    
    for (const query of testQueries) {
      const queryStart = Date.now();
      try {
        await this.db.query(query);
        queryTimes.push(Date.now() - queryStart);
      } catch (error) {
        console.warn(`Query fallita: ${query}`, error);
        queryTimes.push(9999); // Penalità per query fallite
      }
    }
    
    const avgQueryTime = queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
    const slowQueries = queryTimes.filter(time => time > 1000).length;
    
    // Simula metriche di sistema (in un sistema reale, queste verrebbero da monitoring tools)
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const cpuUsage = await this.getCpuUsage();
    const diskUsage = await this.getDiskUsage();
    const activeConnections = await this.getActiveConnections();
    
    // Calcola percentili di response time
    const sortedTimes = queryTimes.sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    return {
      avgQueryTime: Math.round(avgQueryTime * 100) / 100,
      slowQueries,
      cacheHitRate: 85, // Simulato - in realtà da Redis
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      cpuUsage,
      diskUsage,
      activeConnections,
      responseTime: {
        p50: Math.round(p50 * 100) / 100,
        p95: Math.round(p95 * 100) / 100,
        p99: Math.round(p99 * 100) / 100
      }
    };
  }

  /**
   * Raccoglie metriche di qualità dati
   */
  private async collectDataQualityMetrics(): Promise<DataQualityMetrics> {
    const queries = {
      totalComuni: 'SELECT COUNT(*) as count FROM comuni',
      comuniWithCoordinates: 'SELECT COUNT(*) as count FROM comuni WHERE latitudine IS NOT NULL AND longitudine IS NOT NULL',
      comuniWithPopulation: 'SELECT COUNT(*) as count FROM comuni WHERE popolazione IS NOT NULL AND popolazione > 0',
      comuniWithArea: 'SELECT COUNT(*) as count FROM comuni WHERE superficie IS NOT NULL AND superficie > 0',
      totalZone: 'SELECT COUNT(*) as count FROM zone_urbane',
      zoneWithCoordinates: 'SELECT COUNT(*) as count FROM zone_urbane WHERE latitudine IS NOT NULL AND longitudine IS NOT NULL',
      duplicateEntries: `
        SELECT COUNT(*) as count FROM (
          SELECT nome, COUNT(*) as cnt 
          FROM comuni 
          GROUP BY nome 
          HAVING COUNT(*) > 1
        ) duplicates
      `,
      missingRequiredFields: 'SELECT COUNT(*) as count FROM comuni WHERE nome IS NULL OR latitudine IS NULL OR longitudine IS NULL',
      invalidCoordinates: `
        SELECT COUNT(*) as count FROM comuni 
        WHERE latitudine < -90 OR latitudine > 90 
           OR longitudine < -180 OR longitudine > 180
      `,
      outdatedData: 'SELECT COUNT(*) as count FROM comuni WHERE updated_at < NOW() - INTERVAL \'1 year\''
    };
    
    const results = await Promise.all(
      Object.entries(queries).map(async ([key, query]) => {
        try {
          const result = await this.db.query(query);
          return [key, result[0].count] as const;
        } catch (error) {
          console.warn(`Query fallita per ${key}:`, error);
          return [key, 0] as const;
        }
      })
    );
    
    const metrics = Object.fromEntries(results) as Record<string, number>;
    
    // Calcola completezza e accuratezza
    const dataCompleteness = metrics.totalComuni > 0 
      ? Math.round((metrics.comuniWithCoordinates / metrics.totalComuni) * 10000) / 100
      : 0;
    
    const dataAccuracy = metrics.totalComuni > 0
      ? Math.round(((metrics.totalComuni - metrics.duplicateEntries - metrics.invalidCoordinates) / metrics.totalComuni) * 10000) / 100
      : 0;
    
    return {
      totalComuni: metrics.totalComuni,
      comuniWithCoordinates: metrics.comuniWithCoordinates,
      comuniWithPopulation: metrics.comuniWithPopulation,
      comuniWithArea: metrics.comuniWithArea,
      totalZone: metrics.totalZone,
      zoneWithCoordinates: metrics.zoneWithCoordinates,
      duplicateEntries: metrics.duplicateEntries,
      missingRequiredFields: metrics.missingRequiredFields,
      invalidCoordinates: metrics.invalidCoordinates,
      outdatedData: metrics.outdatedData,
      dataCompleteness,
      dataAccuracy
    };
  }

  /**
   * Raccoglie metriche di utilizzo
   */
  private async collectUsageMetrics(): Promise<UsageMetrics> {
    // Recupera statistiche degli ultimi 24h
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const usageQuery = `
      SELECT 
        COALESCE(SUM(total_searches), 0) as total_searches,
        COALESCE(SUM(successful_searches), 0) as successful_searches,
        COALESCE(SUM(failed_searches), 0) as failed_searches,
        COALESCE(SUM(unique_users), 0) as unique_users,
        COALESCE(AVG(avg_response_time), 0) as avg_response_time
      FROM usage_stats 
      WHERE date >= $1
    `;
    
    const usageResult = await this.db.query(usageQuery, [yesterday.toISOString().split('T')[0]]);
    const usage = usageResult[0];
    
    // Recupera ricerche popolari (simulato)
    const popularSearches = ['Milano', 'Roma', 'Napoli', 'Torino', 'Firenze'];
    
    // Recupera statistiche per tipo (simulato)
    const searchByType = {
      comuni: Math.floor(usage.total_searches * 0.7),
      zone: Math.floor(usage.total_searches * 0.2),
      mixed: Math.floor(usage.total_searches * 0.1)
    };
    
    // Recupera statistiche per regione (simulato)
    const searchByRegion = {
      'Lombardia': Math.floor(usage.total_searches * 0.25),
      'Lazio': Math.floor(usage.total_searches * 0.20),
      'Campania': Math.floor(usage.total_searches * 0.15),
      'Sicilia': Math.floor(usage.total_searches * 0.10),
      'Veneto': Math.floor(usage.total_searches * 0.10),
      'Altri': Math.floor(usage.total_searches * 0.20)
    };
    
    return {
      totalSearches: usage.total_searches,
      successfulSearches: usage.successful_searches,
      failedSearches: usage.failed_searches,
      uniqueUsers: usage.unique_users,
      popularSearches,
      searchByType,
      searchByRegion,
      peakUsageHour: 14, // Simulato
      averageSessionDuration: 300 // 5 minuti
    };
  }

  /**
   * Raccoglie metriche di errori
   */
  private async collectErrorMetrics(): Promise<ErrorMetrics> {
    // Simula metriche di errori (in un sistema reale, queste verrebbero da logging)
    const totalErrors = Math.floor(Math.random() * 50);
    const errorsByType = {
      'DatabaseError': Math.floor(totalErrors * 0.3),
      'ValidationError': Math.floor(totalErrors * 0.25),
      'NetworkError': Math.floor(totalErrors * 0.2),
      'TimeoutError': Math.floor(totalErrors * 0.15),
      'OtherError': Math.floor(totalErrors * 0.1)
    };
    
    const errorsBySeverity = {
      critical: Math.floor(totalErrors * 0.05),
      high: Math.floor(totalErrors * 0.15),
      medium: Math.floor(totalErrors * 0.4),
      low: Math.floor(totalErrors * 0.4)
    };
    
    const recentErrors = [
      {
        timestamp: new Date(Date.now() - 3600000),
        type: 'DatabaseError',
        message: 'Connection timeout',
        severity: 'medium',
        count: 5
      },
      {
        timestamp: new Date(Date.now() - 7200000),
        type: 'ValidationError',
        message: 'Invalid coordinates',
        severity: 'low',
        count: 3
      }
    ];
    
    const errorRate = totalErrors > 0 ? Math.round((totalErrors / 1000) * 10000) / 100 : 0;
    
    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      recentErrors,
      errorRate
    };
  }

  /**
   * Raccoglie stato di salute del sistema
   */
  private async collectHealthStatus(): Promise<HealthStatus> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Verifica connessione database
    try {
      await this.db.query('SELECT 1');
    } catch (error) {
      issues.push('Database non raggiungibile');
      score -= 50;
    }
    
    // Verifica metriche di performance
    const perfMetrics = await this.collectPerformanceMetrics();
    if (perfMetrics.avgQueryTime > 1000) {
      issues.push('Query lente rilevate');
      score -= 20;
      recommendations.push('Ottimizzare query e indici');
    }
    
    if (perfMetrics.memoryUsage > 1000) {
      issues.push('Uso memoria elevato');
      score -= 15;
      recommendations.push('Ottimizzare gestione memoria');
    }
    
    // Verifica qualità dati
    const dataMetrics = await this.collectDataQualityMetrics();
    if (dataMetrics.dataCompleteness < 90) {
      issues.push('Dati incompleti');
      score -= 10;
      recommendations.push('Completare dati mancanti');
    }
    
    if (dataMetrics.duplicateEntries > 0) {
      issues.push('Entrate duplicate rilevate');
      score -= 5;
      recommendations.push('Rimuovere duplicati');
    }
    
    // Determina stato
    let status: HealthStatus['status'];
    if (score >= 90) status = 'HEALTHY';
    else if (score >= 70) status = 'WARNING';
    else if (score >= 50) status = 'CRITICAL';
    else status = 'DOWN';
    
    return {
      status,
      score: Math.max(0, score),
      issues,
      recommendations,
      lastCheck: new Date()
    };
  }

  /**
   * Simula uso CPU
   */
  private async getCpuUsage(): Promise<number> {
    // In un sistema reale, questo verrebbe da os.cpus() o monitoring tools
    return Math.round(Math.random() * 100 * 100) / 100;
  }

  /**
   * Simula uso disco
   */
  private async getDiskUsage(): Promise<number> {
    // In un sistema reale, questo verrebbe da fs.statSync() o monitoring tools
    return Math.round(Math.random() * 80 * 100) / 100;
  }

  /**
   * Recupera connessioni attive
   */
  private async getActiveConnections(): Promise<number> {
    try {
      const result = await this.db.query('SELECT count(*) as count FROM pg_stat_activity');
      return result[0].count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Salva metriche nel database
   */
  private async saveMetricsToDatabase(metrics: SystemMetrics): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO system_metrics (
          timestamp, performance, data_quality, usage, errors, health
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        metrics.timestamp,
        JSON.stringify(metrics.performance),
        JSON.stringify(metrics.dataQuality),
        JSON.stringify(metrics.usage),
        JSON.stringify(metrics.errors),
        JSON.stringify(metrics.health)
      ]);
    } catch (error) {
      console.warn('Impossibile salvare metriche nel database:', error);
    }
  }

  /**
   * Genera report di monitoraggio
   */
  async generateMonitoringReport(metrics: SystemMetrics): Promise<string> {
    const report = `
# 📊 Report Monitoraggio Sistema - Urbanova

**Data:** ${metrics.timestamp.toISOString()}  
**Stato Sistema:** ${this.getHealthStatusEmoji(metrics.health.status)} ${metrics.health.status}  
**Score:** ${metrics.health.score}/100

## ⚡ Performance

- **Tempo Medio Query:** ${metrics.performance.avgQueryTime}ms
- **Query Lente:** ${metrics.performance.slowQueries}
- **Cache Hit Rate:** ${metrics.performance.cacheHitRate}%
- **Uso Memoria:** ${metrics.performance.memoryUsage}MB
- **Uso CPU:** ${metrics.performance.cpuUsage}%
- **Uso Disco:** ${metrics.performance.diskUsage}%
- **Connessioni Attive:** ${metrics.performance.activeConnections}

**Response Time:**
- P50: ${metrics.performance.responseTime.p50}ms
- P95: ${metrics.performance.responseTime.p95}ms
- P99: ${metrics.performance.responseTime.p99}ms

## 📊 Qualità Dati

- **Comuni Totali:** ${metrics.dataQuality.totalComuni}
- **Con Coordinate:** ${metrics.dataQuality.comuniWithCoordinates} (${Math.round((metrics.dataQuality.comuniWithCoordinates / metrics.dataQuality.totalComuni) * 100)}%)
- **Con Popolazione:** ${metrics.dataQuality.comuniWithPopulation}
- **Con Superficie:** ${metrics.dataQuality.comuniWithArea}
- **Zone Totali:** ${metrics.dataQuality.totalZone}
- **Zone Con Coordinate:** ${metrics.dataQuality.zoneWithCoordinates}

**Problemi:**
- Entrate Duplicate: ${metrics.dataQuality.duplicateEntries}
- Campi Obbligatori Mancanti: ${metrics.dataQuality.missingRequiredFields}
- Coordinate Non Valide: ${metrics.dataQuality.invalidCoordinates}
- Dati Obsoleti: ${metrics.dataQuality.outdatedData}

**Metriche Qualità:**
- Completezza: ${metrics.dataQuality.dataCompleteness}%
- Accuratezza: ${metrics.dataQuality.dataAccuracy}%

## 👥 Utilizzo

- **Ricerche Totali:** ${metrics.usage.totalSearches}
- **Ricerche Riuscite:** ${metrics.usage.successfulSearches}
- **Ricerche Fallite:** ${metrics.usage.failedSearches}
- **Utenti Unici:** ${metrics.usage.uniqueUsers}
- **Durata Media Sessione:** ${metrics.usage.averageSessionDuration}s

**Ricerche Popolari:**
${metrics.usage.popularSearches.map(search => `- ${search}`).join('\n')}

**Per Tipo:**
- Comuni: ${metrics.usage.searchByType.comuni}
- Zone: ${metrics.usage.searchByType.zone}
- Miste: ${metrics.usage.searchByType.mixed}

**Per Regione:**
${Object.entries(metrics.usage.searchByRegion)
  .map(([region, count]) => `- ${region}: ${count}`)
  .join('\n')}

## 🚨 Errori

- **Totale Errori:** ${metrics.errors.totalErrors}
- **Tasso Errori:** ${metrics.errors.errorRate}%

**Per Tipo:**
${Object.entries(metrics.errors.errorsByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

**Per Severità:**
- Critici: ${metrics.errors.errorsBySeverity.critical}
- Alti: ${metrics.errors.errorsBySeverity.high}
- Medi: ${metrics.errors.errorsBySeverity.medium}
- Bassi: ${metrics.errors.errorsBySeverity.low}

## 🏥 Stato Salute

**Stato:** ${this.getHealthStatusEmoji(metrics.health.status)} ${metrics.health.status}  
**Score:** ${metrics.health.score}/100

${metrics.health.issues.length > 0 ? `
**Problemi:**
${metrics.health.issues.map(issue => `- ⚠️ ${issue}`).join('\n')}
` : '✅ Nessun problema rilevato'}

${metrics.health.recommendations.length > 0 ? `
**Raccomandazioni:**
${metrics.health.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}
` : ''}

---
*Report generato automaticamente dal Sistema di Monitoraggio Urbanova*
`;

    return report;
  }

  /**
   * Recupera metriche storiche
   */
  getMetricsHistory(): SystemMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Recupera trend delle metriche
   */
  getMetricsTrend(hours: number = 24): {
    performance: number[];
    dataQuality: number[];
    usage: number[];
    errors: number[];
  } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp >= cutoff);
    
    return {
      performance: recentMetrics.map(m => m.performance.avgQueryTime),
      dataQuality: recentMetrics.map(m => m.dataQuality.dataCompleteness),
      usage: recentMetrics.map(m => m.usage.totalSearches),
      errors: recentMetrics.map(m => m.errors.totalErrors)
    };
  }

  private getHealthStatusEmoji(status: string): string {
    switch (status) {
      case 'HEALTHY': return '✅';
      case 'WARNING': return '⚠️';
      case 'CRITICAL': return '🚨';
      case 'DOWN': return '❌';
      default: return '❓';
    }
  }
}

// Esporta istanza singleton
export const systemMonitor = new SystemMonitor();

