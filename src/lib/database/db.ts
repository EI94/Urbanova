/**
 * Database Connection Production-Ready
 * PostgreSQL con PostGIS, connection pooling, retry logic e monitoring
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { dbLogger, LoggerService } from '../cache/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  acquireTimeoutMillis?: number;
  createTimeoutMillis?: number;
  destroyTimeoutMillis?: number;
  reapIntervalMillis?: number;
  createRetryIntervalMillis?: number;
  propagateCreateError?: boolean;
}

class DatabaseManager {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.initializePool();
  }

  /**
   * Inizializza il pool di connessioni
   */
  private initializePool(): void {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        ssl: this.config.ssl || false,
        max: this.config.max || 20, // Massimo 20 connessioni
        min: this.config.min || 2,  // Minimo 2 connessioni
        idleTimeoutMillis: this.config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis || 10000,
        acquireTimeoutMillis: this.config.acquireTimeoutMillis || 10000,
        createTimeoutMillis: this.config.createTimeoutMillis || 10000,
        destroyTimeoutMillis: this.config.destroyTimeoutMillis || 5000,
        reapIntervalMillis: this.config.reapIntervalMillis || 1000,
        createRetryIntervalMillis: this.config.createRetryIntervalMillis || 200,
        propagateCreateError: this.config.propagateCreateError || false,
      });

      this.setupEventHandlers();
    } catch (error) {
      dbLogger.error('Errore inizializzazione database pool:', error);
      throw error;
    }
  }

  /**
   * Configura event handlers per il pool
   */
  private setupEventHandlers(): void {
    if (!this.pool) return;

    this.pool.on('connect', (client: PoolClient) => {
      dbLogger.info('Nuova connessione database stabilita');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.pool.on('acquire', (client: PoolClient) => {
      dbLogger.debug('Connessione database acquisita dal pool');
    });

    this.pool.on('remove', (client: PoolClient) => {
      dbLogger.info('Connessione database rimossa dal pool');
    });

    this.pool.on('error', (error: Error, client: PoolClient) => {
      dbLogger.error('Errore pool database:', error);
      this.isConnected = false;
    });
  }

  /**
   * Connette al database
   */
  async connect(): Promise<void> {
    if (!this.pool) {
      throw new Error('Database pool non inizializzato');
    }

    try {
      // Testa la connessione
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      dbLogger.info('Connessione database stabilita');
    } catch (error) {
      dbLogger.error('Errore connessione database:', error);
      throw error;
    }
  }

  /**
   * Disconnette dal database
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        this.isConnected = false;
        dbLogger.info('Disconnessione database completata');
      } catch (error) {
        dbLogger.error('Errore disconnessione database:', error);
      }
    }
  }

  /**
   * Verifica se il database è connesso
   */
  isDatabaseConnected(): boolean {
    return this.isConnected && this.pool !== null;
  }

  /**
   * Ottiene il pool di connessioni
   */
  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database pool non inizializzato');
    }
    return this.pool;
  }

  /**
   * Esegue una query con logging e retry
   */
  async query(text: string, params: any[] = []): Promise<QueryResult> {
    if (!this.isDatabaseConnected()) {
      throw new Error('Database non connesso');
    }

    const startTime = Date.now();
    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await this.pool!.query(text, params);
        const duration = Date.now() - startTime;
        
        LoggerService.logDbQuery(text, params, duration);
        return result;
      } catch (error) {
        lastError = error as Error;
        dbLogger.warn(`Tentativo query ${attempt}/3 fallito:`, error);
        
        if (attempt < 3) {
          // Aspetta prima del prossimo tentativo
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    // Tutti i tentativi falliti
    LoggerService.logDbError(text, lastError!, params);
    throw lastError;
  }

  /**
   * Esegue una query con transazione
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.isDatabaseConnected()) {
      throw new Error('Database non connesso');
    }

    const client = await this.pool!.connect();
    const startTime = Date.now();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      const duration = Date.now() - startTime;
      dbLogger.info(`Transazione completata in ${duration}ms`);
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      dbLogger.error('Transazione fallita, rollback eseguito:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Esegue multiple query in batch
   */
  async batch(queries: Array<{ text: string; params?: any[] }>): Promise<QueryResult[]> {
    if (!this.isDatabaseConnected()) {
      throw new Error('Database non connesso');
    }

    const client = await this.pool!.connect();
    const startTime = Date.now();
    const results: QueryResult[] = [];

    try {
      await client.query('BEGIN');
      
      for (const query of queries) {
        const result = await client.query(query.text, query.params || []);
        results.push(result);
      }
      
      await client.query('COMMIT');
      
      const duration = Date.now() - startTime;
      dbLogger.info(`Batch di ${queries.length} query completato in ${duration}ms`);
      
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      dbLogger.error('Batch fallito, rollback eseguito:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check del database
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string; stats?: any }> {
    const startTime = Date.now();
    
    try {
      const result = await this.query('SELECT NOW() as current_time, version() as version');
      const latency = Date.now() - startTime;
      
      // Ottieni statistiche del pool
      const stats = {
        totalCount: this.pool?.totalCount || 0,
        idleCount: this.pool?.idleCount || 0,
        waitingCount: this.pool?.waitingCount || 0
      };
      
      return { 
        status: 'healthy', 
        latency,
        stats,
        error: undefined
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Ottiene statistiche del pool
   */
  getPoolStats(): { totalCount: number; idleCount: number; waitingCount: number } {
    if (!this.pool) {
      return { totalCount: 0, idleCount: 0, waitingCount: 0 };
    }
    
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  /**
   * Pulisce il pool di connessioni
   */
  async clearPool(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        this.initializePool();
        dbLogger.info('Pool database pulito e reinizializzato');
      } catch (error) {
        dbLogger.error('Errore pulizia pool database:', error);
        throw error;
      }
    }
  }
}

// Configurazione database basata su variabili d'ambiente
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'urbanova',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  min: parseInt(process.env.DB_MIN_CONNECTIONS || '2'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '10000'),
  createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT || '10000'),
  destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000'),
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
  createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL || '200'),
  propagateCreateError: process.env.DB_PROPAGATE_CREATE_ERROR === 'true'
};

// Istanza singleton del database manager
export const db = new DatabaseManager(dbConfig);

// Funzioni di utilità per query comuni
export class DatabaseService {
  /**
   * Ricerca full-text con ranking
   */
  static async fullTextSearch(
    table: string,
    searchTerm: string,
    columns: string[],
    limit = 50,
    offset = 0
  ): Promise<QueryResult> {
    const searchVector = columns.map(col => `to_tsvector('italian', ${col})`).join(' || ');
    const searchQuery = `to_tsquery('italian', $1)`;
    
    const query = `
      SELECT *, 
             ts_rank(${searchVector}, ${searchQuery}) as rank
      FROM ${table}
      WHERE ${searchVector} @@ ${searchQuery}
      ORDER BY rank DESC, id
      LIMIT $2 OFFSET $3
    `;
    
    return await db.query(query, [searchTerm, limit, offset]);
  }

  /**
   * Ricerca spaziale con PostGIS
   */
  static async spatialSearch(
    table: string,
    lat: number,
    lng: number,
    radiusKm: number,
    limit = 50
  ): Promise<QueryResult> {
    const query = `
      SELECT *, 
             ST_Distance(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326)) as distance
      FROM ${table}
      WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3 * 1000)
      ORDER BY distance
      LIMIT $4
    `;
    
    return await db.query(query, [lat, lng, radiusKm, limit]);
  }

  /**
   * Ricerca combinata (full-text + spaziale)
   */
  static async combinedSearch(
    table: string,
    searchTerm: string,
    columns: string[],
    lat?: number,
    lng?: number,
    radiusKm?: number,
    limit = 50,
    offset = 0
  ): Promise<QueryResult> {
    let query = `
      SELECT *, 
             ts_rank(${columns.map(col => `to_tsvector('italian', ${col})`).join(' || ')}, to_tsquery('italian', $1)) as text_rank
    `;
    
    const params: any[] = [searchTerm];
    let paramIndex = 2;
    
    if (lat && lng && radiusKm) {
      query += `, ST_Distance(geom, ST_SetSRID(ST_MakePoint($${paramIndex + 1}, $${paramIndex}), 4326)) as distance`;
      params.push(lat, lng, radiusKm);
      paramIndex += 3;
    }
    
    query += ` FROM ${table} WHERE `;
    
    // Condizione full-text
    query += `${columns.map(col => `to_tsvector('italian', ${col})`).join(' || ')} @@ to_tsquery('italian', $1)`;
    
    // Condizione spaziale se specificata
    if (lat && lng && radiusKm) {
      query += ` AND ST_DWithin(geom, ST_SetSRID(ST_MakePoint($${paramIndex - 1}, $${paramIndex - 2}), 4326), $${paramIndex} * 1000)`;
    }
    
    query += ` ORDER BY text_rank DESC`;
    
    if (lat && lng && radiusKm) {
      query += `, distance ASC`;
    }
    
    query += ` LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`;
    params.push(limit, offset);
    
    return await db.query(query, params);
  }

  /**
   * Conta risultati di una query
   */
  static async countResults(
    table: string,
    whereClause?: string,
    params?: any[]
  ): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    const result = await db.query(query, params || []);
    return parseInt(result.rows[0].count);
  }

  /**
   * Ottiene statistiche di una tabella
   */
  static async getTableStats(table: string): Promise<{
    totalRows: number;
    tableSize: string;
    indexSize: string;
    lastAnalyze: string;
  }> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM ${table}) as total_rows,
        pg_size_pretty(pg_total_relation_size('${table}')) as table_size,
        pg_size_pretty(pg_indexes_size('${table}')) as index_size,
        (SELECT last_analyze FROM pg_stat_user_tables WHERE relname = '${table}') as last_analyze
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }

  /**
   * Ottimizza una tabella (VACUUM ANALYZE)
   */
  static async optimizeTable(table: string): Promise<void> {
    const query = `VACUUM ANALYZE ${table}`;
    await db.query(query);
    dbLogger.info(`Tabella ${table} ottimizzata`);
  }

  /**
   * Crea indice se non esiste
   */
  static async createIndexIfNotExists(
    table: string,
    indexName: string,
    columns: string,
    indexType = 'BTREE'
  ): Promise<void> {
    const query = `
      CREATE INDEX IF NOT EXISTS ${indexName} 
      ON ${table} USING ${indexType} (${columns})
    `;
    
    await db.query(query);
    dbLogger.info(`Indice ${indexName} creato su ${table}`);
  }

  /**
   * Crea indice spaziale se non esiste
   */
  static async createSpatialIndexIfNotExists(
    table: string,
    indexName: string,
    geometryColumn = 'geom'
  ): Promise<void> {
    const query = `
      CREATE INDEX IF NOT EXISTS ${indexName} 
      ON ${table} USING GIST (${geometryColumn})
    `;
    
    await db.query(query);
    dbLogger.info(`Indice spaziale ${indexName} creato su ${table}.${geometryColumn}`);
  }
}

export default db;
