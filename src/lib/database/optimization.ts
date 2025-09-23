/**
 * Database Optimization Production-Ready
 * Ottimizzazioni avanzate per PostgreSQL con PostGIS
 */

import { db } from './db';
import { dbLogger, LoggerService } from '../cache/logger';

export interface DatabaseOptimizationConfig {
  enableQueryOptimization: boolean;
  enableIndexOptimization: boolean;
  enableConnectionOptimization: boolean;
  enableStatisticsCollection: boolean;
  enableAutoVacuum: boolean;
  enableParallelQueries: boolean;
  maxWorkers: number;
  maintenanceWorkMem: string;
  sharedBuffers: string;
  effectiveCacheSize: string;
  randomPageCost: number;
  seqPageCost: number;
}

class DatabaseOptimizer {
  private config: DatabaseOptimizationConfig;

  constructor(config: DatabaseOptimizationConfig) {
    this.config = config;
  }

  /**
   * Ottimizza tutti gli indici del database
   */
  async optimizeIndexes(): Promise<void> {
    dbLogger.info('Iniziando ottimizzazione indici...');

    try {
      // Ottimizza indici esistenti
      await this.reindexAllIndexes();
      
      // Crea indici mancanti
      await this.createMissingIndexes();
      
      // Analizza statistiche
      await this.updateStatistics();
      
      // Ottimizza indici per query specifiche
      await this.optimizeQueryIndexes();
      
      dbLogger.info('Ottimizzazione indici completata');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione indici:', error);
      throw error;
    }
  }

  /**
   * Ricostruisce tutti gli indici
   */
  private async reindexAllIndexes(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Ottimizza indici per comuni
      await db.query('REINDEX INDEX CONCURRENTLY idx_comuni_geom');
      await db.query('REINDEX INDEX CONCURRENTLY idx_comuni_area_geom');
      await db.query('REINDEX INDEX CONCURRENTLY idx_comuni_istat_code');
      await db.query('REINDEX INDEX CONCURRENTLY idx_comuni_name_gin');
      
      // Ottimizza indici per zone
      await db.query('REINDEX INDEX CONCURRENTLY idx_zone_geom');
      await db.query('REINDEX INDEX CONCURRENTLY idx_zone_area_geom');
      await db.query('REINDEX INDEX CONCURRENTLY idx_zone_comune_istat_code');
      await db.query('REINDEX INDEX CONCURRENTLY idx_zone_name_gin');
      
      const duration = Date.now() - startTime;
      LoggerService.logPerformance('database_reindex', duration, {
        indexes: 8,
        tables: ['comuni', 'zone']
      });
      
      dbLogger.info(`Ricostruzione indici completata in ${duration}ms`);
    } catch (error) {
      dbLogger.error('Errore durante ricostruzione indici:', error);
      throw error;
    }
  }

  /**
   * Crea indici mancanti per ottimizzazione
   */
  private async createMissingIndexes(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Indici per ottimizzazione query comuni
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_region_province 
        ON comuni (regione, provincia) 
        WHERE regione IS NOT NULL AND provincia IS NOT NULL
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_population 
        ON comuni (popolazione DESC) 
        WHERE popolazione IS NOT NULL
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_area 
        ON comuni (area_sq_km DESC) 
        WHERE area_sq_km IS NOT NULL
      `);
      
      // Indici per ottimizzazione query zone
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_type 
        ON zone (type) 
        WHERE type IS NOT NULL
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_population 
        ON zone (popolazione DESC) 
        WHERE popolazione IS NOT NULL
      `);
      
      // Indici compositi per query complesse
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_search_composite 
        ON comuni USING GIN (
          to_tsvector('italian', nome || ' ' || provincia || ' ' || regione)
        )
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_search_composite 
        ON zone USING GIN (
          to_tsvector('italian', nome || ' ' || type)
        )
      `);
      
      // Indici per query spaziali avanzate
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_spatial_cluster 
        ON comuni USING GIST (geom) 
        WITH (fillfactor = 80)
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_spatial_cluster 
        ON zone USING GIST (geom) 
        WITH (fillfactor = 80)
      `);
      
      const duration = Date.now() - startTime;
      LoggerService.logPerformance('database_create_indexes', duration, {
        indexes: 10,
        type: 'optimization'
      });
      
      dbLogger.info(`Creazione indici ottimizzazione completata in ${duration}ms`);
    } catch (error) {
      dbLogger.error('Errore durante creazione indici:', error);
      throw error;
    }
  }

  /**
   * Aggiorna statistiche del database
   */
  private async updateStatistics(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Aggiorna statistiche per tutte le tabelle
      await db.query('ANALYZE comuni');
      await db.query('ANALYZE zone');
      
      // Aggiorna statistiche per indici
      await db.query('ANALYZE idx_comuni_geom');
      await db.query('ANALYZE idx_comuni_name_gin');
      await db.query('ANALYZE idx_zone_geom');
      await db.query('ANALYZE idx_zone_name_gin');
      
      const duration = Date.now() - startTime;
      LoggerService.logPerformance('database_analyze', duration, {
        tables: 2,
        indexes: 4
      });
      
      dbLogger.info(`Aggiornamento statistiche completato in ${duration}ms`);
    } catch (error) {
      dbLogger.error('Errore durante aggiornamento statistiche:', error);
      throw error;
    }
  }

  /**
   * Ottimizza indici per query specifiche
   */
  private async optimizeQueryIndexes(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Indici per query di ricerca full-text
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_fulltext_optimized 
        ON comuni USING GIN (
          to_tsvector('italian', nome)
        ) 
        WITH (fastupdate = off)
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_fulltext_optimized 
        ON zone USING GIN (
          to_tsvector('italian', nome)
        ) 
        WITH (fastupdate = off)
      `);
      
      // Indici per query spaziali con ranking
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_spatial_ranking 
        ON comuni USING GIST (geom) 
        INCLUDE (nome, provincia, regione, popolazione)
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_spatial_ranking 
        ON zone USING GIST (geom) 
        INCLUDE (nome, type, popolazione)
      `);
      
      const duration = Date.now() - startTime;
      LoggerService.logPerformance('database_query_optimization', duration, {
        indexes: 4,
        type: 'query_specific'
      });
      
      dbLogger.info(`Ottimizzazione indici query completata in ${duration}ms`);
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione indici query:', error);
      throw error;
    }
  }

  /**
   * Ottimizza configurazione database
   */
  async optimizeConfiguration(): Promise<void> {
    dbLogger.info('Iniziando ottimizzazione configurazione database...');

    try {
      // Ottimizza parametri di performance
      await this.optimizePerformanceParameters();
      
      // Ottimizza parametri di memoria
      await this.optimizeMemoryParameters();
      
      // Ottimizza parametri di I/O
      await this.optimizeIOParameters();
      
      // Ottimizza parametri di connessione
      await this.optimizeConnectionParameters();
      
      dbLogger.info('Ottimizzazione configurazione completata');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione configurazione:', error);
      throw error;
    }
  }

  /**
   * Ottimizza parametri di performance
   */
  private async optimizePerformanceParameters(): Promise<void> {
    try {
      // Abilita query parallele
      if (this.config.enableParallelQueries) {
        await db.query(`SET max_parallel_workers_per_gather = ${this.config.maxWorkers}`);
        await db.query(`SET max_parallel_workers = ${this.config.maxWorkers * 2}`);
        await db.query('SET parallel_tuple_cost = 0.1');
        await db.query('SET parallel_setup_cost = 1000.0');
      }
      
      // Ottimizza costi per SSD
      await db.query(`SET random_page_cost = ${this.config.randomPageCost}`);
      await db.query(`SET seq_page_cost = ${this.config.seqPageCost}`);
      await db.query('SET effective_io_concurrency = 200');
      
      // Ottimizza parametri di query
      await db.query('SET enable_hashjoin = on');
      await db.query('SET enable_mergejoin = on');
      await db.query('SET enable_nestloop = on');
      await db.query('SET enable_indexscan = on');
      await db.query('SET enable_indexonlyscan = on');
      
      dbLogger.info('Parametri di performance ottimizzati');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione parametri performance:', error);
      throw error;
    }
  }

  /**
   * Ottimizza parametri di memoria
   */
  private async optimizeMemoryParameters(): Promise<void> {
    try {
      // Ottimizza memoria condivisa
      await db.query(`SET shared_buffers = '${this.config.sharedBuffers}'`);
      await db.query(`SET effective_cache_size = '${this.config.effectiveCacheSize}'`);
      
      // Ottimizza memoria di lavoro
      await db.query(`SET maintenance_work_mem = '${this.config.maintenanceWorkMem}'`);
      await db.query('SET work_mem = 256MB');
      
      // Ottimizza memoria per operazioni di sorting
      await db.query('SET sort_mem = 256MB');
      await db.query('SET hash_mem_multiplier = 2.0');
      
      // Ottimizza memoria per join
      await db.query('SET join_collapse_limit = 8');
      await db.query('SET from_collapse_limit = 8');
      
      dbLogger.info('Parametri di memoria ottimizzati');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione parametri memoria:', error);
      throw error;
    }
  }

  /**
   * Ottimizza parametri di I/O
   */
  private async optimizeIOParameters(): Promise<void> {
    try {
      // Ottimizza checkpoint
      await db.query('SET checkpoint_completion_target = 0.9');
      await db.query('SET wal_buffers = 16MB');
      await db.query('SET checkpoint_segments = 32');
      
      // Ottimizza WAL
      await db.query('SET wal_level = replica');
      await db.query('SET max_wal_size = 4GB');
      await db.query('SET min_wal_size = 1GB');
      
      // Ottimizza fsync
      await db.query('SET synchronous_commit = on');
      await db.query('SET fsync = on');
      
      // Ottimizza temp files
      await db.query('SET temp_file_limit = 2GB');
      await db.query('SET log_temp_files = 0');
      
      dbLogger.info('Parametri di I/O ottimizzati');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione parametri I/O:', error);
      throw error;
    }
  }

  /**
   * Ottimizza parametri di connessione
   */
  private async optimizeConnectionParameters(): Promise<void> {
    try {
      // Ottimizza timeout
      await db.query('SET statement_timeout = 300000'); // 5 minuti
      await db.query('SET idle_in_transaction_session_timeout = 300000');
      await db.query('SET lock_timeout = 30000'); // 30 secondi
      
      // Ottimizza deadlock detection
      await db.query('SET deadlock_timeout = 1s');
      await db.query('SET log_lock_waits = on');
      
      // Ottimizza connection pooling
      await db.query('SET tcp_keepalives_idle = 600');
      await db.query('SET tcp_keepalives_interval = 30');
      await db.query('SET tcp_keepalives_count = 3');
      
      dbLogger.info('Parametri di connessione ottimizzati');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione parametri connessione:', error);
      throw error;
    }
  }

  /**
   * Esegue VACUUM e ANALYZE ottimizzato
   */
  async performMaintenance(): Promise<void> {
    dbLogger.info('Iniziando manutenzione database...');

    try {
      const startTime = Date.now();
      
      // VACUUM ottimizzato
      await db.query('VACUUM (VERBOSE, ANALYZE, BUFFER_USAGE_LIMIT 0) comuni');
      await db.query('VACUUM (VERBOSE, ANALYZE, BUFFER_USAGE_LIMIT 0) zone');
      
      // VACUUM FULL per tabelle piccole
      await db.query('VACUUM FULL comuni');
      await db.query('VACUUM FULL zone');
      
      // Aggiorna statistiche estese
      await db.query('ANALYZE VERBOSE comuni');
      await db.query('ANALYZE VERBOSE zone');
      
      const duration = Date.now() - startTime;
      LoggerService.logPerformance('database_maintenance', duration, {
        tables: 2,
        operations: ['vacuum', 'analyze']
      });
      
      dbLogger.info(`Manutenzione database completata in ${duration}ms`);
    } catch (error) {
      dbLogger.error('Errore durante manutenzione database:', error);
      throw error;
    }
  }

  /**
   * Analizza performance delle query
   */
  async analyzeQueryPerformance(): Promise<{
    slowQueries: any[];
    missingIndexes: any[];
    recommendations: string[];
  }> {
    dbLogger.info('Iniziando analisi performance query...');

    try {
      // Query lente
      const slowQueries = await db.query(`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          rows,
          100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
        FROM pg_stat_statements 
        WHERE mean_time > 1000 
        ORDER BY mean_time DESC 
        LIMIT 20
      `);

      // Indici mancanti
      const missingIndexes = await db.query(`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public' 
        AND n_distinct > 100 
        AND correlation < 0.1
        ORDER BY n_distinct DESC
      `);

      // Genera raccomandazioni
      const recommendations = this.generateRecommendations(slowQueries.rows, missingIndexes.rows);

      dbLogger.info(`Analisi performance completata: ${slowQueries.rows.length} query lente, ${missingIndexes.rows.length} indici mancanti`);

      return {
        slowQueries: slowQueries.rows,
        missingIndexes: missingIndexes.rows,
        recommendations
      };
    } catch (error) {
      dbLogger.error('Errore durante analisi performance:', error);
      throw error;
    }
  }

  /**
   * Genera raccomandazioni di ottimizzazione
   */
  private generateRecommendations(slowQueries: any[], missingIndexes: any[]): string[] {
    const recommendations: string[] = [];

    if (slowQueries.length > 0) {
      recommendations.push(`Ottimizzare ${slowQueries.length} query lente identificate`);
      
      slowQueries.forEach(query => {
        if (query.mean_time > 5000) {
          recommendations.push(`Query critica: ${query.query.substring(0, 100)}... (${query.mean_time}ms)`);
        }
      });
    }

    if (missingIndexes.length > 0) {
      recommendations.push(`Creare indici per ${missingIndexes.length} colonne ad alta cardinalità`);
      
      missingIndexes.forEach(index => {
        recommendations.push(`Indice consigliato: ${index.tablename}.${index.attname} (cardinalità: ${index.n_distinct})`);
      });
    }

    if (recommendations.length === 0) {
      recommendations.push('Database già ottimizzato - nessuna azione richiesta');
    }

    return recommendations;
  }

  /**
   * Ottimizza query specifiche per Urbanova
   */
  async optimizeUrbanovaQueries(): Promise<void> {
    dbLogger.info('Iniziando ottimizzazione query specifiche Urbanova...');

    try {
      // Ottimizza query di ricerca geografica
      await this.optimizeGeographicSearchQueries();
      
      // Ottimizza query di autocomplete
      await this.optimizeAutocompleteQueries();
      
      // Ottimizza query di statistiche
      await this.optimizeStatisticsQueries();
      
      dbLogger.info('Ottimizzazione query Urbanova completata');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione query Urbanova:', error);
      throw error;
    }
  }

  /**
   * Ottimizza query di ricerca geografica
   */
  private async optimizeGeographicSearchQueries(): Promise<void> {
    try {
      // Crea indici specifici per ricerca geografica
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_geographic_search 
        ON comuni USING GIN (
          to_tsvector('italian', nome || ' ' || provincia || ' ' || regione)
        ) 
        WHERE nome IS NOT NULL AND provincia IS NOT NULL AND regione IS NOT NULL
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_geographic_search 
        ON zone USING GIN (
          to_tsvector('italian', nome || ' ' || type)
        ) 
        WHERE nome IS NOT NULL AND type IS NOT NULL
      `);
      
      // Indici per query spaziali con ranking
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_spatial_search 
        ON comuni USING GIST (geom) 
        INCLUDE (nome, provincia, regione, popolazione, area_sq_km)
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_spatial_search 
        ON zone USING GIST (geom) 
        INCLUDE (nome, type, popolazione, area_sq_km)
      `);
      
      dbLogger.info('Query di ricerca geografica ottimizzate');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione query geografiche:', error);
      throw error;
    }
  }

  /**
   * Ottimizza query di autocomplete
   */
  private async optimizeAutocompleteQueries(): Promise<void> {
    try {
      // Indici per autocomplete con similarità
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_autocomplete 
        ON comuni USING GIN (
          to_tsvector('italian', nome)
        ) 
        WITH (fastupdate = on)
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_autocomplete 
        ON zone USING GIN (
          to_tsvector('italian', nome)
        ) 
        WITH (fastupdate = on)
      `);
      
      // Indici per ricerca fuzzy
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_fuzzy 
        ON comuni USING GIN (
          nome gin_trgm_ops
        )
      `);
      
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_fuzzy 
        ON zone USING GIN (
          nome gin_trgm_ops
        )
      `);
      
      dbLogger.info('Query di autocomplete ottimizzate');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione query autocomplete:', error);
      throw error;
    }
  }

  /**
   * Ottimizza query di statistiche
   */
  private async optimizeStatisticsQueries(): Promise<void> {
    try {
      // Indici per statistiche per regione
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_stats_region 
        ON comuni (regione, popolazione, area_sq_km) 
        WHERE popolazione IS NOT NULL AND area_sq_km IS NOT NULL
      `);
      
      // Indici per statistiche per provincia
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comuni_stats_province 
        ON comuni (provincia, popolazione, area_sq_km) 
        WHERE popolazione IS NOT NULL AND area_sq_km IS NOT NULL
      `);
      
      // Indici per statistiche zone
      await db.query(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_zone_stats_type 
        ON zone (type, popolazione, area_sq_km) 
        WHERE popolazione IS NOT NULL AND area_sq_km IS NOT NULL
      `);
      
      dbLogger.info('Query di statistiche ottimizzate');
    } catch (error) {
      dbLogger.error('Errore durante ottimizzazione query statistiche:', error);
      throw error;
    }
  }
}

// Configurazione ottimizzazione
const optimizationConfig: DatabaseOptimizationConfig = {
  enableQueryOptimization: true,
  enableIndexOptimization: true,
  enableConnectionOptimization: true,
  enableStatisticsCollection: true,
  enableAutoVacuum: true,
  enableParallelQueries: true,
  maxWorkers: 4,
  maintenanceWorkMem: '1GB',
  sharedBuffers: '4GB',
  effectiveCacheSize: '12GB',
  randomPageCost: 1.1,
  seqPageCost: 1.0
};

// Istanza singleton dell'ottimizzatore
export const databaseOptimizer = new DatabaseOptimizer(optimizationConfig);

export default databaseOptimizer;
