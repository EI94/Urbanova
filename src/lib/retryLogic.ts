/**
 * 🔄 RETRY LOGIC INTELLIGENTE
 * 
 * Sistema di retry avanzato per gestire errori e timeout:
 * - Retry esponenziale con jitter
 * - Circuit breaker per evitare sovraccarico
 * - Fallback graceful per errori persistenti
 * - Metriche dettagliate per monitoring
 */

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  jitter: boolean;
  timeout: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

interface RetryStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  timeoutAttempts: number;
  circuitBreakerTrips: number;
  averageRetryTime: number;
}

class RetryLogic {
  private config: RetryConfig;
  private stats: RetryStats;
  private circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private circuitBreakerFailures: number = 0;
  private circuitBreakerLastFailure: number = 0;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      jitter: true,
      timeout: 30000,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      ...config
    };

    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      timeoutAttempts: 0,
      circuitBreakerTrips: 0,
      averageRetryTime: 0
    };

    console.log('🔄 [RetryLogic] Sistema retry intelligente inizializzato');
  }

  /**
   * Calcola delay con backoff esponenziale e jitter
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(2, attempt - 1);
    const delay = Math.min(exponentialDelay, this.config.maxDelay);
    
    if (this.config.jitter) {
      // Aggiungi jitter casuale per evitare thundering herd
      const jitterAmount = delay * 0.1;
      return delay + (Math.random() * jitterAmount * 2) - jitterAmount;
    }
    
    return delay;
  }

  /**
   * Controlla stato circuit breaker
   */
  private checkCircuitBreaker(): boolean {
    const now = Date.now();
    
    switch (this.circuitBreakerState) {
      case 'CLOSED':
        if (this.circuitBreakerFailures >= this.config.circuitBreakerThreshold) {
          this.circuitBreakerState = 'OPEN';
          this.circuitBreakerLastFailure = now;
          this.stats.circuitBreakerTrips++;
          console.log('🔴 [RetryLogic] Circuit breaker OPEN - troppi errori');
          return false;
        }
        return true;
        
      case 'OPEN':
        if (now - this.circuitBreakerLastFailure > this.config.circuitBreakerTimeout) {
          this.circuitBreakerState = 'HALF_OPEN';
          console.log('🟡 [RetryLogic] Circuit breaker HALF_OPEN - testando connessione');
          return true;
        }
        return false;
        
      case 'HALF_OPEN':
        return true;
        
      default:
        return true;
    }
  }

  /**
   * Aggiorna stato circuit breaker
   */
  private updateCircuitBreaker(success: boolean): void {
    if (success) {
      this.circuitBreakerFailures = 0;
      if (this.circuitBreakerState === 'HALF_OPEN') {
        this.circuitBreakerState = 'CLOSED';
        console.log('🟢 [RetryLogic] Circuit breaker CLOSED - servizio ripristinato');
      }
    } else {
      this.circuitBreakerFailures++;
      if (this.circuitBreakerState === 'HALF_OPEN') {
        this.circuitBreakerState = 'OPEN';
        this.circuitBreakerLastFailure = Date.now();
        console.log('🔴 [RetryLogic] Circuit breaker OPEN - test fallito');
      }
    }
  }

  /**
   * Esegue operazione con retry intelligente
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Controlla circuit breaker
    if (!this.checkCircuitBreaker()) {
      throw new Error(`Circuit breaker OPEN per ${operationName}`);
    }

    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      this.stats.totalAttempts++;
      
      try {
        console.log(`🔄 [RetryLogic] Tentativo ${attempt}/${this.config.maxRetries + 1} per ${operationName}`);
        
        // Timeout per singola operazione
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout);
        });
        
        const result = await Promise.race([operation(), timeoutPromise]);
        
        // Successo!
        this.stats.successfulAttempts++;
        this.updateCircuitBreaker(true);
        
        const totalTime = Date.now() - startTime;
        this.updateAverageRetryTime(totalTime);
        
        if (attempt > 1) {
          console.log(`✅ [RetryLogic] Successo al tentativo ${attempt} per ${operationName} (${totalTime}ms)`);
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        this.stats.failedAttempts++;
        
        if (error instanceof Error && error.message === 'Operation timeout') {
          this.stats.timeoutAttempts++;
          console.log(`⏰ [RetryLogic] Timeout al tentativo ${attempt} per ${operationName}`);
        } else {
          console.log(`❌ [RetryLogic] Errore al tentativo ${attempt} per ${operationName}: ${error}`);
        }
        
        // Se è l'ultimo tentativo, fallisci
        if (attempt === this.config.maxRetries + 1) {
          this.updateCircuitBreaker(false);
          break;
        }
        
        // Calcola delay per prossimo tentativo
        const delay = this.calculateDelay(attempt);
        console.log(`⏳ [RetryLogic] Attesa ${delay}ms prima del prossimo tentativo`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Tutti i tentativi falliti
    const totalTime = Date.now() - startTime;
    this.updateAverageRetryTime(totalTime);
    
    console.log(`💥 [RetryLogic] Tutti i tentativi falliti per ${operationName} (${totalTime}ms)`);
    throw lastError || new Error(`Operazione fallita dopo ${this.config.maxRetries + 1} tentativi`);
  }

  /**
   * Aggiorna tempo medio retry
   */
  private updateAverageRetryTime(totalTime: number): void {
    const totalSuccessful = this.stats.successfulAttempts;
    if (totalSuccessful > 0) {
      this.stats.averageRetryTime = 
        (this.stats.averageRetryTime * (totalSuccessful - 1) + totalTime) / totalSuccessful;
    }
  }

  /**
   * Ottieni statistiche retry
   */
  getStats(): RetryStats & { circuitBreakerState: string; successRate: number } {
    const successRate = this.stats.totalAttempts > 0 
      ? (this.stats.successfulAttempts / this.stats.totalAttempts) * 100 
      : 0;
    
    return {
      ...this.stats,
      circuitBreakerState: this.circuitBreakerState,
      successRate
    };
  }

  /**
   * Reset circuit breaker manualmente
   */
  resetCircuitBreaker(): void {
    this.circuitBreakerState = 'CLOSED';
    this.circuitBreakerFailures = 0;
    this.circuitBreakerLastFailure = 0;
    console.log('🔄 [RetryLogic] Circuit breaker resettato manualmente');
  }

  /**
   * Reset statistiche
   */
  resetStats(): void {
    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      timeoutAttempts: 0,
      circuitBreakerTrips: 0,
      averageRetryTime: 0
    };
    console.log('📊 [RetryLogic] Statistiche resettate');
  }
}

// Singleton instance con configurazione ottimizzata per OpenAI
export const retryLogic = new RetryLogic({
  maxRetries: 2, // Ridotto per performance
  baseDelay: 500, // Delay iniziale più basso
  maxDelay: 5000, // Max delay ridotto
  jitter: true,
  timeout: 25000, // Timeout ridotto
  circuitBreakerThreshold: 3, // Soglia più bassa
  circuitBreakerTimeout: 30000 // Timeout circuit breaker ridotto
});

// Utility per logging statistiche
export function logRetryStats(): void {
  const stats = retryLogic.getStats();
  console.log(`📊 [RetryLogic] Stats: ${stats.successfulAttempts}/${stats.totalAttempts} successi (${stats.successRate.toFixed(1)}%), ${stats.circuitBreakerTrips} circuit breaker trips, avg time: ${stats.averageRetryTime.toFixed(0)}ms`);
}
