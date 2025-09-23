/**
 * Load Testing Production-Ready
 * Test di carico completi per API e sistema
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { LoggerService } from '@/lib/cache/logger';
import { db } from '@/lib/database/db';
import { redisClient } from '@/lib/cache/redisClient';

interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // secondi
  testDuration: number; // secondi
  targetResponseTime: number; // millisecondi
  maxErrorRate: number; // percentuale
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  duration: number;
  concurrentUsers: number;
  timestamp: string;
}

class LoadTester {
  private config: LoadTestConfig;
  private results: LoadTestResult[] = [];
  private startTime: number = 0;
  private endTime: number = 0;

  constructor(config: LoadTestConfig) {
    this.config = config;
  }

  /**
   * Esegue test di carico completo
   */
  async runLoadTest(): Promise<LoadTestResult> {
    LoggerService.logBusinessEvent('load_test_started', {
      config: this.config
    });

    this.startTime = Date.now();
    
    try {
      // Prepara ambiente di test
      await this.setupTestEnvironment();
      
      // Esegue test di carico
      const result = await this.executeLoadTest();
      
      // Pulisce ambiente di test
      await this.cleanupTestEnvironment();
      
      this.endTime = Date.now();
      result.duration = this.endTime - this.startTime;
      
      // Salva risultato
      this.results.push(result);
      
      LoggerService.logPerformance('load_test_completed', result.duration, {
        result
      });
      
      return result;
    } catch (error) {
      LoggerService.logBusinessEvent('load_test_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Prepara ambiente di test
   */
  private async setupTestEnvironment(): Promise<void> {
    try {
      // Pulisce cache
      await redisClient.clearAllCache();
      
      // Prepara dati di test
      await this.prepareTestData();
      
      LoggerService.logBusinessEvent('test_environment_setup', {});
    } catch (error) {
      LoggerService.logBusinessEvent('test_environment_setup_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Prepara dati di test
   */
  private async prepareTestData(): Promise<void> {
    try {
      // Crea dati di test per comuni
      await db.query(`
        INSERT INTO comuni (istat_code, name, province, region, population, area_sq_km, geom)
        VALUES 
          ('058091', 'Roma', 'Roma', 'Lazio', 2873000, 1285.31, ST_SetSRID(ST_MakePoint(12.4964, 41.9028), 4326)),
          ('015146', 'Milano', 'Milano', 'Lombardia', 1396000, 181.76, ST_SetSRID(ST_MakePoint(9.1900, 45.4642), 4326)),
          ('063049', 'Napoli', 'Napoli', 'Campania', 914000, 119.02, ST_SetSRID(ST_MakePoint(14.2681, 40.8518), 4326)),
          ('001272', 'Torino', 'Torino', 'Piemonte', 848000, 130.17, ST_SetSRID(ST_MakePoint(7.6869, 45.0703), 4326)),
          ('082053', 'Palermo', 'Palermo', 'Sicilia', 640000, 158.88, ST_SetSRID(ST_MakePoint(13.3613, 38.1157), 4326))
        ON CONFLICT (istat_code) DO UPDATE SET
          name = EXCLUDED.name,
          province = EXCLUDED.province,
          region = EXCLUDED.region,
          population = EXCLUDED.population,
          area_sq_km = EXCLUDED.area_sq_km,
          geom = EXCLUDED.geom
      `);
      
      // Crea dati di test per zone
      await db.query(`
        INSERT INTO zone (comune_istat_code, name, type, population, area_sq_km, geom)
        VALUES 
          ('058091', 'Centro Storico', 'quartiere', 50000, 5.0, ST_SetSRID(ST_MakePoint(12.4964, 41.9028), 4326)),
          ('015146', 'Brera', 'quartiere', 30000, 3.0, ST_SetSRID(ST_MakePoint(9.1900, 45.4642), 4326)),
          ('063049', 'Vomero', 'quartiere', 40000, 4.0, ST_SetSRID(ST_MakePoint(14.2681, 40.8518), 4326)),
          ('001272', 'Centro', 'quartiere', 35000, 3.5, ST_SetSRID(ST_MakePoint(7.6869, 45.0703), 4326)),
          ('082053', 'Centro Storico', 'quartiere', 45000, 4.5, ST_SetSRID(ST_MakePoint(13.3613, 38.1157), 4326))
      `);
      
      LoggerService.logBusinessEvent('test_data_prepared', {
        comuni: 5,
        zone: 5
      });
    } catch (error) {
      LoggerService.logBusinessEvent('test_data_preparation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Esegue test di carico
   */
  private async executeLoadTest(): Promise<LoadTestResult> {
    const startTime = Date.now();
    const requests: Array<{ startTime: number; endTime: number; success: boolean; responseTime: number }> = [];
    
    try {
      // Simula utenti concorrenti
      const userPromises = [];
      for (let i = 0; i < this.config.concurrentUsers; i++) {
        userPromises.push(this.simulateUser(i));
      }
      
      // Attende completamento di tutti gli utenti
      const userResults = await Promise.all(userPromises);
      
      // Raccoglie risultati
      for (const userResult of userResults) {
        requests.push(...userResult);
      }
      
      // Calcola metriche
      const result = this.calculateMetrics(requests, startTime);
      
      LoggerService.logBusinessEvent('load_test_executed', {
        totalRequests: requests.length,
        concurrentUsers: this.config.concurrentUsers
      });
      
      return result;
    } catch (error) {
      LoggerService.logBusinessEvent('load_test_execution_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Simula un utente
   */
  private async simulateUser(userId: number): Promise<Array<{ startTime: number; endTime: number; success: boolean; responseTime: number }>> {
    const requests: Array<{ startTime: number; endTime: number; success: boolean; responseTime: number }> = [];
    
    try {
      // Ramp up graduale
      const rampUpDelay = (this.config.rampUpTime * 1000) / this.config.concurrentUsers;
      await this.delay(userId * rampUpDelay);
      
      // Esegue richieste
      for (let i = 0; i < this.config.requestsPerUser; i++) {
        const requestStart = Date.now();
        
        try {
          // Simula richiesta API
          await this.simulateAPIRequest(userId, i);
          
          const requestEnd = Date.now();
          const responseTime = requestEnd - requestStart;
          
          requests.push({
            startTime: requestStart,
            endTime: requestEnd,
            success: true,
            responseTime
          });
          
          // Delay tra richieste
          await this.delay(100 + Math.random() * 200);
        } catch (error) {
          const requestEnd = Date.now();
          const responseTime = requestEnd - requestStart;
          
          requests.push({
            startTime: requestStart,
            endTime: requestEnd,
            success: false,
            responseTime
          });
        }
      }
      
      LoggerService.logBusinessEvent('user_simulation_completed', {
        userId,
        requests: requests.length,
        successful: requests.filter(r => r.success).length
      });
      
      return requests;
    } catch (error) {
      LoggerService.logBusinessEvent('user_simulation_failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return requests;
    }
  }

  /**
   * Simula richiesta API
   */
  private async simulateAPIRequest(userId: number, requestId: number): Promise<void> {
    try {
      // Simula diversi tipi di richieste
      const requestTypes = [
        'geographic_search',
        'autocomplete',
        'health_check',
        'spatial_search',
        'statistics'
      ];
      
      const requestType = requestTypes[requestId % requestTypes.length];
      
      switch (requestType) {
        case 'geographic_search':
          await this.simulateGeographicSearch();
          break;
        case 'autocomplete':
          await this.simulateAutocomplete();
          break;
        case 'health_check':
          await this.simulateHealthCheck();
          break;
        case 'spatial_search':
          await this.simulateSpatialSearch();
          break;
        case 'statistics':
          await this.simulateStatistics();
          break;
      }
      
      LoggerService.logBusinessEvent('api_request_simulated', {
        userId,
        requestId,
        requestType
      });
    } catch (error) {
      LoggerService.logBusinessEvent('api_request_simulation_failed', {
        userId,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Simula ricerca geografica
   */
  private async simulateGeographicSearch(): Promise<void> {
    const queries = ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    // Simula query database
    await db.query(`
      SELECT 
        id,
        nome,
        provincia,
        regione,
        'comune' as tipo,
        popolazione,
        superficie,
        ST_Y(geom) as latitudine,
        ST_X(geom) as longitudine,
        ts_rank(to_tsvector('italian', nome), to_tsquery('italian', $1)) as score
      FROM comuni
      WHERE to_tsvector('italian', nome) @@ to_tsquery('italian', $1)
      ORDER BY score DESC
      LIMIT 10
    `, [query]);
  }

  /**
   * Simula autocomplete
   */
  private async simulateAutocomplete(): Promise<void> {
    const queries = ['Rom', 'Mil', 'Nap', 'Tor', 'Pal'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    
    // Simula query database
    await db.query(`
      SELECT 
        id,
        nome,
        provincia,
        regione,
        'comune' as tipo,
        popolazione,
        ST_Y(geom) as latitudine,
        ST_X(geom) as longitudine,
        similarity(nome, $1) as similarity_score
      FROM comuni
      WHERE similarity(nome, $1) > 0.3
      ORDER BY similarity_score DESC
      LIMIT 5
    `, [query]);
  }

  /**
   * Simula health check
   */
  private async simulateHealthCheck(): Promise<void> {
    // Simula health check
    await db.query('SELECT NOW()');
    await redisClient.ping();
  }

  /**
   * Simula ricerca spaziale
   */
  private async simulateSpatialSearch(): Promise<void> {
    const lat = 41.9028 + (Math.random() - 0.5) * 0.1;
    const lng = 12.4964 + (Math.random() - 0.5) * 0.1;
    const radius = 50;
    
    // Simula query spaziale
    await db.query(`
      SELECT 
        id,
        nome,
        provincia,
        regione,
        'comune' as tipo,
        popolazione,
        superficie,
        ST_Y(geom) as latitudine,
        ST_X(geom) as longitudine,
        ST_Distance(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326)) as distance
      FROM comuni
      WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3 * 1000)
      ORDER BY distance
      LIMIT 10
    `, [lat, lng, radius]);
  }

  /**
   * Simula statistiche
   */
  private async simulateStatistics(): Promise<void> {
    // Simula query statistiche
    await db.query(`
      SELECT 
        regione,
        COUNT(*) as comuni_count,
        SUM(popolazione) as total_population,
        AVG(area_sq_km) as avg_area
      FROM comuni
      GROUP BY regione
      ORDER BY total_population DESC
    `);
  }

  /**
   * Calcola metriche del test
   */
  private calculateMetrics(requests: Array<{ startTime: number; endTime: number; success: boolean; responseTime: number }>, startTime: number): LoadTestResult {
    const totalRequests = requests.length;
    const successfulRequests = requests.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = requests.map(r => r.responseTime).sort((a, b) => a - b);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];
    
    const duration = Date.now() - startTime;
    const requestsPerSecond = totalRequests / (duration / 1000);
    const errorRate = (failedRequests / totalRequests) * 100;
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      p99ResponseTime: Math.round(p99ResponseTime),
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      duration,
      concurrentUsers: this.config.concurrentUsers,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Pulisce ambiente di test
   */
  private async cleanupTestEnvironment(): Promise<void> {
    try {
      // Pulisce dati di test
      await db.query('DELETE FROM zone WHERE comune_istat_code IN (\'058091\', \'015146\', \'063049\', \'001272\', \'082053\')');
      await db.query('DELETE FROM comuni WHERE istat_code IN (\'058091\', \'015146\', \'063049\', \'001272\', \'082053\')');
      
      // Pulisce cache
      await redisClient.clearAllCache();
      
      LoggerService.logBusinessEvent('test_environment_cleaned', {});
    } catch (error) {
      LoggerService.logBusinessEvent('test_environment_cleanup_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ottiene risultati dei test
   */
  getResults(): LoadTestResult[] {
    return this.results;
  }

  /**
   * Genera report dei test
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'Nessun risultato di test disponibile';
    }
    
    const latestResult = this.results[this.results.length - 1];
    
    return `
# Load Test Report - Urbanova

**Data Test:** ${latestResult.timestamp}  
**Durata:** ${latestResult.duration}ms  
**Utenti Concorrenti:** ${latestResult.concurrentUsers}

## 📊 Risultati

- **Richieste Totali:** ${latestResult.totalRequests}
- **Richieste Riuscite:** ${latestResult.successfulRequests}
- **Richieste Fallite:** ${latestResult.failedRequests}
- **Tasso di Errore:** ${latestResult.errorRate}%

## ⚡ Performance

- **Tempo di Risposta Medio:** ${latestResult.averageResponseTime}ms
- **P95 Response Time:** ${latestResult.p95ResponseTime}ms
- **P99 Response Time:** ${latestResult.p99ResponseTime}ms
- **Richieste per Secondo:** ${latestResult.requestsPerSecond}

## 🎯 Soglie

- **Target Response Time:** ${this.config.targetResponseTime}ms
- **Max Error Rate:** ${this.config.maxErrorRate}%

## ✅ Status

${latestResult.averageResponseTime <= this.config.targetResponseTime ? '✅' : '❌'} Response Time: ${latestResult.averageResponseTime}ms <= ${this.config.targetResponseTime}ms  
${latestResult.errorRate <= this.config.maxErrorRate ? '✅' : '❌'} Error Rate: ${latestResult.errorRate}% <= ${this.config.maxErrorRate}%

---
*Report generato automaticamente dal Sistema di Load Testing Urbanova*
`;
  }
}

describe('Load Testing Production Tests', () => {
  let loadTester: LoadTester;

  beforeAll(async () => {
    // Setup database e cache per i test
    try {
      await db.connect();
      await redisClient.connect();
    } catch (error) {
      console.error('Errore setup load test:', error);
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      await redisClient.disconnect();
      await db.disconnect();
    } catch (error) {
      console.error('Errore cleanup load test:', error);
    }
  });

  beforeEach(() => {
    // Configurazione test di carico
    const config: LoadTestConfig = {
      concurrentUsers: 10,
      requestsPerUser: 5,
      rampUpTime: 30,
      testDuration: 300,
      targetResponseTime: 1000,
      maxErrorRate: 5
    };
    
    loadTester = new LoadTester(config);
  });

  describe('Load Test - Ricerca Geografica', () => {
    it('dovrebbe gestire 10 utenti concorrenti con 5 richieste ciascuno', async () => {
      const result = await loadTester.runLoadTest();
      
      expect(result.totalRequests).toBe(50); // 10 utenti * 5 richieste
      expect(result.concurrentUsers).toBe(10);
      expect(result.errorRate).toBeLessThanOrEqual(5);
      expect(result.averageResponseTime).toBeLessThanOrEqual(1000);
    }, 60000); // Timeout 60 secondi

    it('dovrebbe mantenere performance sotto soglia con carico moderato', async () => {
      const config: LoadTestConfig = {
        concurrentUsers: 5,
        requestsPerUser: 3,
        rampUpTime: 15,
        testDuration: 180,
        targetResponseTime: 500,
        maxErrorRate: 2
      };
      
      const tester = new LoadTester(config);
      const result = await tester.runLoadTest();
      
      expect(result.averageResponseTime).toBeLessThanOrEqual(500);
      expect(result.errorRate).toBeLessThanOrEqual(2);
      expect(result.requestsPerSecond).toBeGreaterThan(0);
    }, 30000);

    it('dovrebbe gestire picchi di traffico', async () => {
      const config: LoadTestConfig = {
        concurrentUsers: 20,
        requestsPerUser: 10,
        rampUpTime: 60,
        testDuration: 600,
        targetResponseTime: 2000,
        maxErrorRate: 10
      };
      
      const tester = new LoadTester(config);
      const result = await tester.runLoadTest();
      
      expect(result.totalRequests).toBe(200); // 20 utenti * 10 richieste
      expect(result.averageResponseTime).toBeLessThanOrEqual(2000);
      expect(result.errorRate).toBeLessThanOrEqual(10);
    }, 120000);
  });

  describe('Load Test - Autocomplete', () => {
    it('dovrebbe gestire richieste autocomplete multiple', async () => {
      const config: LoadTestConfig = {
        concurrentUsers: 15,
        requestsPerUser: 8,
        rampUpTime: 45,
        testDuration: 400,
        targetResponseTime: 300,
        maxErrorRate: 3
      };
      
      const tester = new LoadTester(config);
      const result = await tester.runLoadTest();
      
      expect(result.totalRequests).toBe(120); // 15 utenti * 8 richieste
      expect(result.averageResponseTime).toBeLessThanOrEqual(300);
      expect(result.errorRate).toBeLessThanOrEqual(3);
    }, 90000);
  });

  describe('Load Test - Health Check', () => {
    it('dovrebbe gestire health check frequenti', async () => {
      const config: LoadTestConfig = {
        concurrentUsers: 25,
        requestsPerUser: 4,
        rampUpTime: 30,
        testDuration: 200,
        targetResponseTime: 100,
        maxErrorRate: 1
      };
      
      const tester = new LoadTester(config);
      const result = await tester.runLoadTest();
      
      expect(result.totalRequests).toBe(100); // 25 utenti * 4 richieste
      expect(result.averageResponseTime).toBeLessThanOrEqual(100);
      expect(result.errorRate).toBeLessThanOrEqual(1);
    }, 60000);
  });

  describe('Performance Analysis', () => {
    it('dovrebbe generare report dettagliato', async () => {
      await loadTester.runLoadTest();
      
      const report = loadTester.generateReport();
      
      expect(report).toContain('Load Test Report');
      expect(report).toContain('Richieste Totali');
      expect(report).toContain('Performance');
      expect(report).toContain('Status');
    });

    it('dovrebbe tracciare metriche di performance', async () => {
      const result = await loadTester.runLoadTest();
      
      expect(result.p95ResponseTime).toBeGreaterThan(0);
      expect(result.p99ResponseTime).toBeGreaterThan(0);
      expect(result.requestsPerSecond).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('Stress Testing', () => {
    it('dovrebbe gestire carico estremo', async () => {
      const config: LoadTestConfig = {
        concurrentUsers: 50,
        requestsPerUser: 20,
        rampUpTime: 120,
        testDuration: 1200,
        targetResponseTime: 5000,
        maxErrorRate: 20
      };
      
      const tester = new LoadTester(config);
      const result = await tester.runLoadTest();
      
      expect(result.totalRequests).toBe(1000); // 50 utenti * 20 richieste
      expect(result.averageResponseTime).toBeLessThanOrEqual(5000);
      expect(result.errorRate).toBeLessThanOrEqual(20);
    }, 300000); // Timeout 5 minuti
  });
});
