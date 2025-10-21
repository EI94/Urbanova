/**
 * 🔌 Circuit Breaker Pattern
 * 
 * Previene timeout e cascading failures:
 * - CLOSED: Normale operazione
 * - OPEN: Blocca chiamate dopo troppi errori
 * - HALF_OPEN: Testa se il servizio è tornato disponibile
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerConfig {
  failureThreshold: number; // Numero di fallimenti prima di aprire
  successThreshold: number; // Numero di successi per chiudere
  timeout: number; // Timeout in ms
  resetTimeout: number; // Tempo prima di provare HALF_OPEN
}

interface CircuitBreakerMetrics {
  failures: number;
  successes: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private metrics: CircuitBreakerMetrics = {
    failures: 0,
    successes: 0,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    lastFailureTime: null,
    lastSuccessTime: null,
    totalCalls: 0,
    totalFailures: 0,
    totalSuccesses: 0,
  };

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000, // 30s default
      resetTimeout: 60000, // 1min default
    }
  ) {
    console.log(`🔌 [CircuitBreaker:${name}] Inizializzato con config:`, config);
  }

  /**
   * Esegue una funzione con protezione Circuit Breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check se circuit è OPEN
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        console.log(`🔌 [CircuitBreaker:${this.name}] Tentativo HALF_OPEN...`);
        this.state = CircuitState.HALF_OPEN;
      } else {
        const error = new Error(`Circuit breaker is OPEN for ${this.name}`);
        console.warn(`⚠️ [CircuitBreaker:${this.name}] Chiamata bloccata (OPEN)`);
        throw error;
      }
    }

    this.metrics.totalCalls++;

    try {
      // Esegui con timeout
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Esegue funzione con timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${this.config.timeout}ms`)),
          this.config.timeout
        )
      ),
    ]);
  }

  /**
   * Handler per successo
   */
  private onSuccess(): void {
    this.metrics.successes++;
    this.metrics.totalSuccesses++;
    this.metrics.consecutiveSuccesses++;
    this.metrics.consecutiveFailures = 0;
    this.metrics.lastSuccessTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.metrics.consecutiveSuccesses >= this.config.successThreshold) {
        console.log(`✅ [CircuitBreaker:${this.name}] Ritorno a CLOSED dopo ${this.metrics.consecutiveSuccesses} successi`);
        this.state = CircuitState.CLOSED;
        this.resetMetrics();
      }
    }
  }

  /**
   * Handler per fallimento
   */
  private onFailure(): void {
    this.metrics.failures++;
    this.metrics.totalFailures++;
    this.metrics.consecutiveFailures++;
    this.metrics.consecutiveSuccesses = 0;
    this.metrics.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      console.log(`🔌 [CircuitBreaker:${this.name}] HALF_OPEN → OPEN (fallimento durante test)`);
      this.state = CircuitState.OPEN;
    } else if (this.metrics.consecutiveFailures >= this.config.failureThreshold) {
      console.log(`🔌 [CircuitBreaker:${this.name}] CLOSED → OPEN (${this.metrics.consecutiveFailures} fallimenti consecutivi)`);
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Check se provare reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.metrics.lastFailureTime) return false;
    const timeSinceLastFailure = Date.now() - this.metrics.lastFailureTime;
    return timeSinceLastFailure >= this.config.resetTimeout;
  }

  /**
   * Reset metriche
   */
  private resetMetrics(): void {
    this.metrics.failures = 0;
    this.metrics.successes = 0;
    this.metrics.consecutiveSuccesses = 0;
    this.metrics.consecutiveFailures = 0;
  }

  /**
   * Ottieni stato corrente
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Ottieni metriche
   */
  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset manuale (per testing)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.resetMetrics();
    console.log(`🔄 [CircuitBreaker:${this.name}] Reset manuale`);
  }
}

/**
 * Factory per Circuit Breakers comuni
 */
export class CircuitBreakerFactory {
  private static breakers = new Map<string, CircuitBreaker>();

  /**
   * Ottieni o crea Circuit Breaker
   */
  static getOrCreate(
    name: string,
    config?: Partial<CircuitBreakerConfig>
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000,
        resetTimeout: 60000,
      };

      this.breakers.set(
        name,
        new CircuitBreaker(name, { ...defaultConfig, ...config })
      );
    }

    return this.breakers.get(name)!;
  }

  /**
   * Circuit Breaker per OpenAI
   */
  static openai(): CircuitBreaker {
    return this.getOrCreate('openai', {
      failureThreshold: 3,
      timeout: 20000, // 20s per OpenAI
      resetTimeout: 30000, // Retry dopo 30s
    });
  }

  /**
   * Circuit Breaker per Firestore
   */
  static firestore(): CircuitBreaker {
    return this.getOrCreate('firestore', {
      failureThreshold: 5,
      timeout: 10000, // 10s per Firestore
      resetTimeout: 20000,
    });
  }

  /**
   * Circuit Breaker per Skill Execution
   */
  static skill(): CircuitBreaker {
    return this.getOrCreate('skill', {
      failureThreshold: 3,
      timeout: 15000, // 15s per skill
      resetTimeout: 30000,
    });
  }

  /**
   * Ottieni tutti i breakers
   */
  static getAll(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  /**
   * Reset tutti i breakers
   */
  static resetAll(): void {
    this.breakers.forEach((breaker) => breaker.reset());
  }
}

