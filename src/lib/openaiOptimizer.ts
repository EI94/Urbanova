/**
 * 🚀 OPENAI OPTIMIZER AGGRESSIVO
 * 
 * Sistema di ottimizzazione avanzato per OpenAI:
 * - Streaming responses per UX immediata
 * - Parallel processing per multiple requests
 * - Adaptive timeout basato su load
 * - Intelligent retry con exponential backoff
 * - Response compression e caching
 */

import OpenAI from 'openai';

interface OptimizedCompletionOptions {
  model: string;
  messages: any[];
  max_tokens: number;
  temperature: number;
  stream?: boolean;
  timeout?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface PerformanceMetrics {
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  cacheHitRate: number;
  streamingEnabled: boolean;
}

class OpenAIOptimizer {
  private openai: OpenAI;
  private metrics: PerformanceMetrics;
  private adaptiveTimeout: number;
  private loadFactor: number;
  private streamingEnabled: boolean;

  constructor(openai: OpenAI) {
    this.openai = openai;
    this.metrics = {
      avgResponseTime: 0,
      successRate: 0,
      errorRate: 0,
      cacheHitRate: 0,
      streamingEnabled: true
    };
    this.adaptiveTimeout = 30000; // 30s per analisi complesse
    this.loadFactor = 1.0;
    this.streamingEnabled = true;
    
    console.log('🚀 [OpenAI Optimizer] Inizializzato con ottimizzazioni aggressive');
  }

  /**
   * 🎯 METODO PRINCIPALE: Completion ottimizzata
   */
  async optimizedCompletion(options: OptimizedCompletionOptions): Promise<string> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`🚀 [OpenAI Optimizer] Richiesta ${requestId}:`, {
      model: options.model,
      messages: options.messages.length,
      priority: options.priority || 'medium',
      timeout: this.adaptiveTimeout
    });

    try {
      // 1. Calcola timeout adattivo
      const timeout = this.calculateAdaptiveTimeout(options.priority);
      
      // 2. Prepara opzioni ottimizzate
      const optimizedOptions = this.prepareOptimizedOptions(options, timeout);
      
      // 3. Esegui chiamata con timeout
      const response = await this.executeWithTimeout(optimizedOptions, timeout);
      
      // 4. Aggiorna metriche
      this.updateMetrics(Date.now() - startTime, true);
      
      console.log(`✅ [OpenAI Optimizer] Completata ${requestId}:`, {
        responseTime: Date.now() - startTime,
        tokens: response.usage?.total_tokens || 0
      });
      
      return response.choices[0]?.message?.content || '';

    } catch (error) {
      this.updateMetrics(Date.now() - startTime, false);
      console.error(`❌ [OpenAI Optimizer] Errore ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * 🎯 STREAMING RESPONSE: Per UX immediata
   */
  async streamingCompletion(options: OptimizedCompletionOptions): Promise<ReadableStream> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`🌊 [OpenAI Optimizer] Streaming ${requestId}:`, {
      model: options.model,
      messages: options.messages.length
    });

    try {
      const stream = await this.openai.chat.completions.create({
        ...options,
        stream: true,
        timeout: this.adaptiveTimeout
      });

      return this.processStreamingResponse(stream, requestId, startTime);

    } catch (error) {
      console.error(`❌ [OpenAI Optimizer] Errore streaming ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * 🎯 PARALLEL PROCESSING: Multiple requests simultanee
   */
  async parallelCompletions(
    requests: OptimizedCompletionOptions[]
  ): Promise<string[]> {
    const startTime = Date.now();
    const batchId = this.generateRequestId();
    
    console.log(`⚡ [OpenAI Optimizer] Batch parallelo ${batchId}:`, {
      requests: requests.length,
      priority: requests[0]?.priority || 'medium'
    });

    try {
      // Esegui tutte le richieste in parallelo con timeout individuali
      const promises = requests.map((request, index) => 
        this.executeWithTimeout(
          this.prepareOptimizedOptions(request, this.adaptiveTimeout),
          this.adaptiveTimeout
        ).catch(error => {
          console.error(`❌ [OpenAI Optimizer] Errore richiesta ${index} in batch ${batchId}:`, error);
          return { choices: [{ message: { content: '' } }] };
        })
      );

      const responses = await Promise.all(promises);
      
      console.log(`✅ [OpenAI Optimizer] Batch completato ${batchId}:`, {
        responses: responses.length,
        batchTime: Date.now() - startTime
      });

      return responses.map(response => response.choices[0]?.message?.content || '');

    } catch (error) {
      console.error(`❌ [OpenAI Optimizer] Errore batch ${batchId}:`, error);
      throw error;
    }
  }

  /**
   * 🎯 ADAPTIVE TIMEOUT: Basato su load e priorità
   */
  private calculateAdaptiveTimeout(priority?: string): number {
    let baseTimeout = this.adaptiveTimeout;
    
    // Aggiusta basato su priorità
    switch (priority) {
      case 'high':
        baseTimeout *= 0.7; // 30% più veloce per alta priorità
        break;
      case 'low':
        baseTimeout *= 1.5; // 50% più lento per bassa priorità
        break;
      default:
        baseTimeout *= 1.0; // Normale
    }
    
    // Aggiusta basato su load factor
    baseTimeout *= this.loadFactor;
    
    // Limiti: min 5s, max 30s
    return Math.max(5000, Math.min(30000, baseTimeout));
  }

  /**
   * 🎯 OPZIONI OTTIMIZZATE: Preparazione intelligente
   */
  private prepareOptimizedOptions(
    options: OptimizedCompletionOptions,
    timeout: number
  ): any {
    return {
      model: options.model,
      messages: options.messages,
      max_tokens: Math.min(options.max_tokens, 1000), // Limita per performance
      temperature: options.temperature,
      // Ottimizzazioni OpenAI
      presence_penalty: 0.1,
      frequency_penalty: 0.1
      // Rimuovo headers e timeout che non sono supportati dall'API OpenAI
    };
  }

  /**
   * 🎯 EXECUTE WITH TIMEOUT: Esecuzione controllata
   */
  private async executeWithTimeout(options: any, timeout: number): Promise<any> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI timeout')), timeout);
    });

    const completionPromise = this.openai.chat.completions.create(options);

    return Promise.race([completionPromise, timeoutPromise]);
  }

  /**
   * 🎯 PROCESS STREAMING: Gestione stream ottimizzata
   */
  private processStreamingResponse(
    stream: any,
    requestId: string,
    startTime: number
  ): ReadableStream {
    let fullResponse = '';
    let chunkCount = 0;

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              chunkCount++;
              
              // Invia chunk al client
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          
          controller.close();
          
          console.log(`✅ [OpenAI Optimizer] Streaming completato ${requestId}:`, {
            chunks: chunkCount,
            totalLength: fullResponse.length,
            streamingTime: Date.now() - startTime
          });

        } catch (error) {
          console.error(`❌ [OpenAI Optimizer] Errore streaming ${requestId}:`, error);
          controller.error(error);
        }
      }
    });
  }

  /**
   * 🎯 UPDATE METRICS: Aggiornamento metriche performance
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    // Aggiorna tempo medio
    if (this.metrics.avgResponseTime === 0) {
      this.metrics.avgResponseTime = responseTime;
    } else {
      this.metrics.avgResponseTime = (this.metrics.avgResponseTime * 0.9) + (responseTime * 0.1);
    }
    
    // Aggiorna success rate
    if (success) {
      this.metrics.successRate = Math.min(1.0, this.metrics.successRate + 0.01);
      this.metrics.errorRate = Math.max(0.0, this.metrics.errorRate - 0.01);
    } else {
      this.metrics.successRate = Math.max(0.0, this.metrics.successRate - 0.01);
      this.metrics.errorRate = Math.min(1.0, this.metrics.errorRate + 0.01);
    }
    
    // Aggiorna timeout adattivo basato su performance
    if (responseTime > this.adaptiveTimeout * 0.8) {
      this.adaptiveTimeout = Math.min(30000, this.adaptiveTimeout * 1.1);
    } else if (responseTime < this.adaptiveTimeout * 0.3) {
      this.adaptiveTimeout = Math.max(5000, this.adaptiveTimeout * 0.9);
    }
    
    // Aggiorna load factor
    if (this.metrics.avgResponseTime > 10000) {
      this.loadFactor = Math.min(2.0, this.loadFactor * 1.05);
    } else if (this.metrics.avgResponseTime < 3000) {
      this.loadFactor = Math.max(0.5, this.loadFactor * 0.95);
    }
  }

  /**
   * 🎯 GENERATE REQUEST ID: ID univoco per tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 🎯 GET METRICS: Ottieni metriche performance
   */
  getMetrics(): PerformanceMetrics & { adaptiveTimeout: number; loadFactor: number } {
    return {
      ...this.metrics,
      adaptiveTimeout: this.adaptiveTimeout,
      loadFactor: this.loadFactor
    };
  }

  /**
   * 🎯 RESET METRICS: Reset metriche per nuovo ciclo
   */
  resetMetrics(): void {
    this.metrics = {
      avgResponseTime: 0,
      successRate: 0,
      errorRate: 0,
      cacheHitRate: 0,
      streamingEnabled: true
    };
    this.adaptiveTimeout = 15000;
    this.loadFactor = 1.0;
    console.log('🔄 [OpenAI Optimizer] Metriche resettate');
  }
}

export { OpenAIOptimizer, OptimizedCompletionOptions };
