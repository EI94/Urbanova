/**
 * Redis Client Production-Ready
 * Configurazione completa per cache Redis con clustering e failover
 */

import Redis from 'ioredis';
import { logger } from './logger';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  connectTimeout?: number;
  commandTimeout?: number;
  cluster?: {
    nodes: Array<{ host: string; port: number }>;
    options?: {
      redisOptions?: Partial<RedisConfig>;
      enableReadyCheck?: boolean;
      maxRedirections?: number;
      retryDelayOnFailover?: number;
      retryDelayOnClusterDown?: number;
      maxRetriesPerRequest?: number;
    };
  };
}

class RedisClient {
  private client: Redis | Redis.Cluster | null = null;
  private isConnected = false;
  private config: RedisConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  constructor(config: RedisConfig) {
    this.config = config;
    this.initializeClient();
  }

  /**
   * Inizializza il client Redis
   */
  private initializeClient(): void {
    try {
      if (this.config.cluster) {
        // Configurazione cluster Redis
        this.client = new Redis.Cluster(this.config.cluster.nodes, {
          redisOptions: {
            host: this.config.host,
            port: this.config.port,
            password: this.config.password,
            db: this.config.db || 0,
            retryDelayOnFailover: this.config.retryDelayOnFailover || 100,
            maxRetriesPerRequest: this.config.maxRetriesPerRequest || 3,
            lazyConnect: this.config.lazyConnect || true,
            keepAlive: this.config.keepAlive || 30000,
            connectTimeout: this.config.connectTimeout || 10000,
            commandTimeout: this.config.commandTimeout || 5000,
          },
          enableReadyCheck: true,
          maxRedirections: 16,
          retryDelayOnFailover: 100,
          retryDelayOnClusterDown: 300,
          maxRetriesPerRequest: 3,
          ...this.config.cluster.options,
        });
      } else {
        // Configurazione Redis singolo
        this.client = new Redis({
          host: this.config.host,
          port: this.config.port,
          password: this.config.password,
          db: this.config.db || 0,
          retryDelayOnFailover: this.config.retryDelayOnFailover || 100,
          maxRetriesPerRequest: this.config.maxRetriesPerRequest || 3,
          lazyConnect: this.config.lazyConnect || true,
          keepAlive: this.config.keepAlive || 30000,
          connectTimeout: this.config.connectTimeout || 10000,
          commandTimeout: this.config.commandTimeout || 5000,
        });
      }

      this.setupEventHandlers();
    } catch (error) {
      logger.error('Errore inizializzazione Redis client:', error);
      throw error;
    }
  }

  /**
   * Configura event handlers per Redis
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      logger.info('Redis client connesso');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.client.on('ready', () => {
      logger.info('Redis client pronto');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      logger.error('Errore Redis client:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      logger.warn('Connessione Redis chiusa');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (delay) => {
      logger.info(`Redis client riconnessione in ${delay}ms`);
      this.reconnectAttempts++;
    });

    this.client.on('end', () => {
      logger.warn('Connessione Redis terminata');
      this.isConnected = false;
    });
  }

  /**
   * Connette al Redis
   */
  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client non inizializzato');
    }

    try {
      await this.client.connect();
      logger.info('Connessione Redis stabilita');
    } catch (error) {
      logger.error('Errore connessione Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnette dal Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
        logger.info('Disconnessione Redis completata');
      } catch (error) {
        logger.error('Errore disconnessione Redis:', error);
      }
    }
  }

  /**
   * Verifica se il client è connesso
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Ottiene il client Redis
   */
  getClient(): Redis | Redis.Cluster {
    if (!this.client) {
      throw new Error('Redis client non inizializzato');
    }
    return this.client;
  }

  /**
   * Set con TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      if (ttlSeconds) {
        await this.client!.setex(key, ttlSeconds, value);
      } else {
        await this.client!.set(key, value);
      }
    } catch (error) {
      logger.error(`Errore Redis SET ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get
   */
  async get(key: string): Promise<string | null> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.get(key);
    } catch (error) {
      logger.error(`Errore Redis GET ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete
   */
  async del(key: string): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.del(key);
    } catch (error) {
      logger.error(`Errore Redis DEL ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  async delMultiple(keys: string[]): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.del(...keys);
    } catch (error) {
      logger.error(`Errore Redis DEL multiple:`, error);
      throw error;
    }
  }

  /**
   * Exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Errore Redis EXISTS ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set con TTL in millisecondi
   */
  async setWithTTL(key: string, value: string, ttlMs: number): Promise<void> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      await this.client!.set(key, value, 'PX', ttlMs);
    } catch (error) {
      logger.error(`Errore Redis SET TTL ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment
   */
  async incr(key: string): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.incr(key);
    } catch (error) {
      logger.error(`Errore Redis INCR ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment by
   */
  async incrby(key: string, increment: number): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.incrby(key, increment);
    } catch (error) {
      logger.error(`Errore Redis INCRBY ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set Hash
   */
  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.hset(key, field, value);
    } catch (error) {
      logger.error(`Errore Redis HSET ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get Hash
   */
  async hget(key: string, field: string): Promise<string | null> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.hget(key, field);
    } catch (error) {
      logger.error(`Errore Redis HGET ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get All Hash
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.hgetall(key);
    } catch (error) {
      logger.error(`Errore Redis HGETALL ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set Hash Multiple
   */
  async hmset(key: string, fields: Record<string, string>): Promise<void> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      await this.client!.hmset(key, fields);
    } catch (error) {
      logger.error(`Errore Redis HMSET ${key}:`, error);
      throw error;
    }
  }

  /**
   * List operations
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.lpush(key, ...values);
    } catch (error) {
      logger.error(`Errore Redis LPUSH ${key}:`, error);
      throw error;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.rpush(key, ...values);
    } catch (error) {
      logger.error(`Errore Redis RPUSH ${key}:`, error);
      throw error;
    }
  }

  async lpop(key: string): Promise<string | null> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.lpop(key);
    } catch (error) {
      logger.error(`Errore Redis LPOP ${key}:`, error);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.rpop(key);
    } catch (error) {
      logger.error(`Errore Redis RPOP ${key}:`, error);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.lrange(key, start, stop);
    } catch (error) {
      logger.error(`Errore Redis LRANGE ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set operations
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.sadd(key, ...members);
    } catch (error) {
      logger.error(`Errore Redis SADD ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.smembers(key);
    } catch (error) {
      logger.error(`Errore Redis SMEMBERS ${key}:`, error);
      throw error;
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      const result = await this.client!.sismember(key, member);
      return result === 1;
    } catch (error) {
      logger.error(`Errore Redis SISMEMBER ${key}:`, error);
      throw error;
    }
  }

  /**
   * Sorted Set operations
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.zadd(key, score, member);
    } catch (error) {
      logger.error(`Errore Redis ZADD ${key}:`, error);
      throw error;
    }
  }

  async zrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      const args = withScores ? ['WITHSCORES'] : [];
      return await this.client!.zrange(key, start, stop, ...args);
    } catch (error) {
      logger.error(`Errore Redis ZRANGE ${key}:`, error);
      throw error;
    }
  }

  async zrevrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      const args = withScores ? ['WITHSCORES'] : [];
      return await this.client!.zrevrange(key, start, stop, ...args);
    } catch (error) {
      logger.error(`Errore Redis ZREVRANGE ${key}:`, error);
      throw error;
    }
  }

  /**
   * Expire
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      const result = await this.client!.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error(`Errore Redis EXPIRE ${key}:`, error);
      throw error;
    }
  }

  /**
   * TTL
   */
  async ttl(key: string): Promise<number> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.ttl(key);
    } catch (error) {
      logger.error(`Errore Redis TTL ${key}:`, error);
      throw error;
    }
  }

  /**
   * Keys pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.keys(pattern);
    } catch (error) {
      logger.error(`Errore Redis KEYS ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Flush DB
   */
  async flushdb(): Promise<void> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      await this.client!.flushdb();
    } catch (error) {
      logger.error('Errore Redis FLUSHDB:', error);
      throw error;
    }
  }

  /**
   * Info
   */
  async info(section?: string): Promise<string> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.info(section);
    } catch (error) {
      logger.error('Errore Redis INFO:', error);
      throw error;
    }
  }

  /**
   * Ping
   */
  async ping(): Promise<string> {
    if (!this.isClientConnected()) {
      throw new Error('Redis client non connesso');
    }

    try {
      return await this.client!.ping();
    } catch (error) {
      logger.error('Errore Redis PING:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const pong = await this.ping();
      const latency = Date.now() - startTime;
      
      if (pong === 'PONG') {
        return { status: 'healthy', latency };
      } else {
        return { status: 'unhealthy', error: 'Ping response not PONG' };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Configurazione Redis basata su variabili d'ambiente
const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  // Configurazione cluster se specificata
  ...(process.env.REDIS_CLUSTER_NODES && {
    cluster: {
      nodes: process.env.REDIS_CLUSTER_NODES.split(',').map(node => {
        const [host, port] = node.split(':');
        return { host, port: parseInt(port) };
      }),
      options: {
        enableReadyCheck: true,
        maxRedirections: 16,
        retryDelayOnFailover: 100,
        retryDelayOnClusterDown: 300,
        maxRetriesPerRequest: 3,
      }
    }
  })
};

// Istanza singleton del client Redis
export const redisClient = new RedisClient(redisConfig);

// Funzioni di utilità per cache
export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 ora
  private static readonly SEARCH_CACHE_TTL = 1800; // 30 minuti
  private static readonly STATS_CACHE_TTL = 300; // 5 minuti

  /**
   * Cache per risultati di ricerca
   */
  static async cacheSearchResult(query: string, results: any[], ttl = this.SEARCH_CACHE_TTL): Promise<void> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    await redisClient.set(key, JSON.stringify(results), ttl);
  }

  static async getCachedSearchResult(query: string): Promise<any[] | null> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache per statistiche
   */
  static async cacheStats(key: string, stats: any, ttl = this.STATS_CACHE_TTL): Promise<void> {
    await redisClient.set(`stats:${key}`, JSON.stringify(stats), ttl);
  }

  static async getCachedStats(key: string): Promise<any | null> {
    const cached = await redisClient.get(`stats:${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache per dati geografici
   */
  static async cacheGeographicData(type: string, key: string, data: any, ttl = this.DEFAULT_TTL): Promise<void> {
    await redisClient.set(`geo:${type}:${key}`, JSON.stringify(data), ttl);
  }

  static async getCachedGeographicData(type: string, key: string): Promise<any | null> {
    const cached = await redisClient.get(`geo:${type}:${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Cache per autocomplete
   */
  static async cacheAutocomplete(query: string, suggestions: string[], ttl = 1800): Promise<void> {
    const key = `autocomplete:${Buffer.from(query.toLowerCase()).toString('base64')}`;
    await redisClient.set(key, JSON.stringify(suggestions), ttl);
  }

  static async getCachedAutocomplete(query: string): Promise<string[] | null> {
    const key = `autocomplete:${Buffer.from(query.toLowerCase()).toString('base64')}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Invalida cache
   */
  static async invalidateCache(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.delMultiple(keys);
    }
  }

  /**
   * Clear all cache
   */
  static async clearAllCache(): Promise<void> {
    await redisClient.flushdb();
  }
}

export default redisClient;
