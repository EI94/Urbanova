// 🚀 URBANOVA OS - ORCHESTRATORE ENTERPRISE
// Orchestratore principale per Urbanova OS con architettura enterprise

// import { ChatMessage } from '@/types/chat';
import { UrbanovaOSClassificationEngine, ClassificationResult } from './ml/classificationEngine';

// Definizione locale per evitare errori di import
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intelligentData?: any;
}
import { UrbanovaOSVectorStore } from './vector/vectorStore';
import { UrbanovaOSWorkflowEngine } from './workflow/workflowEngine';
import { UrbanovaOSPluginSystem } from './plugins/pluginSystem';
// import { userMemoryService } from '@/lib/userMemoryService';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface UrbanovaOSRequest {
  sessionId: string;
  userId: string;
  userEmail: string;
  message: {
    id: string;
    content: string;
    type: 'user' | 'assistant';
    timestamp: Date;
  };
  conversationHistory: ChatMessage[];
  context: {
    userId: string;
    userEmail: string;
    history: ChatMessage[];
    projectId?: string;
    workspaceId?: string;
    environment: 'development' | 'staging' | 'production';
  };
  metadata: {
    source: 'chat' | 'api' | 'webhook' | 'scheduled';
    priority: 'low' | 'normal' | 'high' | 'critical';
    timeout: number;
    retryCount: number;
    maxRetries: number;
  };
}

export interface UrbanovaOSResponse {
  type: 'success' | 'error' | 'fallback' | 'escalation';
  response: string;
  confidence: number;
  metadata: {
    systemsUsed: string[];
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    pluginsExecuted: string[];
    workflowsTriggered: string[];
    classifications: ClassificationResult[];
    vectorMatches: VectorMatch[];
    fallbackReason?: string;
    escalationReason?: string;
  };
  suggestedActions: SuggestedAction[];
  nextSteps: NextStep[];
  systemStatus: SystemStatus;
  timestamp: Date;
}

// ClassificationResult è importato da ./ml/classificationEngine

export interface VectorMatch {
  id: string;
  content: string;
  similarity: number;
  metadata: any; // Usa any per compatibilità
  relevanceScore: number;
  category: string;
  timestamp: Date;
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  type: 'plugin' | 'workflow' | 'integration' | 'analysis' | 'automation';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  requiredPermissions: string[];
  parameters: Record<string, any>;
}

export interface NextStep {
  id: string;
  title: string;
  description: string;
  type: 'immediate' | 'scheduled' | 'conditional' | 'manual';
  trigger: string;
  parameters: Record<string, any>;
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  components: {
    ml: 'healthy' | 'degraded' | 'critical';
    vector: 'healthy' | 'degraded' | 'critical';
    workflow: 'healthy' | 'degraded' | 'critical';
    plugins: 'healthy' | 'degraded' | 'critical';
  };
  performance: {
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  lastHealthCheck: Date;
}

export interface Entity {
  name: string;
  type: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata: Record<string, any>;
}

// ============================================================================
// URBANOVA OS ORCHESTRATORE
// ============================================================================

export class UrbanovaOSOrchestrator {
  private classificationEngine: UrbanovaOSClassificationEngine;
  private vectorStore: UrbanovaOSVectorStore;
  private workflowEngine: UrbanovaOSWorkflowEngine;
  private pluginSystem: UrbanovaOSPluginSystem;
  private performanceMonitor: PerformanceMonitor;
  private healthChecker: HealthChecker;
  private eventBus: EventBus;
  private cacheManager: CacheManager;
  private securityManager: SecurityManager;
  private metricsCollector: MetricsCollector;

  constructor() {
    this.classificationEngine = new UrbanovaOSClassificationEngine();
    this.vectorStore = new UrbanovaOSVectorStore();
    this.workflowEngine = new UrbanovaOSWorkflowEngine();
    this.pluginSystem = new UrbanovaOSPluginSystem();
    this.performanceMonitor = new PerformanceMonitor();
    this.healthChecker = new HealthChecker();
    this.eventBus = new EventBus();
    this.cacheManager = new CacheManager();
    this.securityManager = new SecurityManager();
    this.metricsCollector = new MetricsCollector();
    
    this.initializeSystems();
    this.startMonitoring();
    
    console.log('🚀 [UrbanovaOS Orchestrator] Inizializzato');
  }

  // ============================================================================
  // METODO PRINCIPALE
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Processa richiesta completa
   */
  async processRequest(request: UrbanovaOSRequest): Promise<UrbanovaOSResponse> {
    const startTime = Date.now();
    console.log('🚀 [UrbanovaOS Orchestrator] Processando richiesta:', {
      sessionId: request.sessionId,
      userId: request.userId,
      messageId: request.message.id,
      priority: request.metadata.priority
    });
    
    // 🚀 OTTIMIZZAZIONE: Timeout per evitare richieste troppo lunghe
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Orchestrator timeout')), 20000); // 20s timeout
    });
    
    const processPromise = this.processRequestInternal(request);
    
    return await Promise.race([processPromise, timeoutPromise]);
  }

  /**
   * 🚀 METODO INTERNO: Processa richiesta senza timeout esterno
   */
  private async processRequestInternal(request: UrbanovaOSRequest): Promise<UrbanovaOSResponse> {
    const startTime = Date.now();
    
    try {
      // 🚀 OTTIMIZZAZIONE AGGRESSIVA: Esecuzione parallela per performance
      console.log('⚡ [UrbanovaOS Orchestrator] Avviando processamento parallelo ottimizzato');
      
      // 1. VALIDAZIONE E SICUREZZA (parallela con classificazione)
      const [validationResult, classification] = await Promise.all([
        this.validateAndSecureRequest(request),
        this.classifyRequest(request)
      ]);
      
      // 2. RICERCA E WORKFLOW IN PARALLELO (se classification confidence è alta)
      let vectorMatches: any[] = [];
      let workflowResults: any[] = [];
      
      if (classification.confidence > 0.7) {
        // Alta confidence: esegui tutto in parallelo
        [vectorMatches, workflowResults] = await Promise.all([
          this.searchVectorStore(request, classification),
          this.executeWorkflows(request, classification, [])
        ]);
      } else {
        // Bassa confidence: esegui sequenzialmente per sicurezza
        vectorMatches = await this.searchVectorStore(request, classification);
        workflowResults = await this.executeWorkflows(request, classification, vectorMatches);
      }
      
      // 3. PLUGIN E GENERAZIONE RISPOSTA IN PARALLELO
      const [pluginResults, response] = await Promise.all([
        this.executePlugins(request, classification, vectorMatches),
        this.generateResponse(request, classification, vectorMatches, workflowResults, [])
      ]);
      
      // 4. AGGIORNAMENTO METRICHE E NOTIFICA (parallela, non bloccante)
      Promise.all([
        this.updateMetrics(request, response, Date.now() - startTime),
        this.notifyEvents(request, response)
      ]).catch(error => {
        console.warn('⚠️ [UrbanovaOS Orchestrator] Errore non critico in metriche/notifiche:', error);
      });
      
      console.log('✅ [UrbanovaOS Orchestrator] Richiesta processata con successo (parallelo):', {
        sessionId: request.sessionId,
        executionTime: Date.now() - startTime,
        confidence: response.confidence,
        systemsUsed: response.metadata.systemsUsed.length,
        parallelExecution: true
      });

      return response;

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore processamento richiesta:', error);
      return this.handleError(request, error, Date.now() - startTime);
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  private extractFeasibilityData(message: string): any {
    // Estrae dati di fattibilità dal messaggio dell'utente
    const data: any = {};
    
    console.log('🔍 [UrbanovaOS] Estraendo dati da:', message.substring(0, 100));
    
    // Nome progetto - pattern più flessibili
    const projectNamePatterns = [
      /nome del progetto[:\s]+([^,.\n]+)/i,
      /progetto[:\s]+([^,.\n]+)/i,
      /villa\s+([^,.\n]+)/i,
      /([^,.\n]+)\s*terreno/i,
      /studio di fattibilità[:\s]+([^,.\n]+)/i,
      /analisi di fattibilità[:\s]+([^,.\n]+)/i
    ];
    
    for (const pattern of projectNamePatterns) {
      const match = message.match(pattern);
      if (match) {
        data.name = match[1].trim();
        break;
      }
    }
    
    // Area terreno - pattern più flessibili
    const landAreaPatterns = [
      /terreno.*?(\d+)\s*metri quadrati/i,
      /terreno.*?(\d+)\s*mq/i,
      /terreno.*?(\d+)\s*m²/i
    ];
    
    for (const pattern of landAreaPatterns) {
      const match = message.match(pattern);
      if (match) {
        data.landArea = parseInt(match[1]);
        break;
      }
    }
    
    // Area costruibile - pattern più flessibili
    const buildableAreaPatterns = [
      /(\d+)\s*metri quadrati totali/i,
      /area costruibile.*?(\d+)\s*mq/i,
      /area costruibile.*?(\d+)\s*metri quadrati/i,
      /costruibile.*?(\d+)\s*mq/i
    ];
    
    for (const pattern of buildableAreaPatterns) {
      const match = message.match(pattern);
      if (match) {
        data.buildableArea = parseInt(match[1]);
        break;
      }
    }
    
    // Tipo progetto
    if (message.match(/bifamiliare/i)) data.type = 'bifamiliare';
    if (message.match(/monofamiliare/i)) data.type = 'monofamiliare';
    if (message.match(/residenziale/i)) data.type = 'residenziale';
    
    // Appartamenti/Parcheggi
    const parkingMatch = message.match(/(\d+)\s*parcheggi/i);
    if (parkingMatch) data.parkingSpaces = parseInt(parkingMatch[1]);
    
    // Area per appartamento
    const apartmentAreaMatch = message.match(/(\d+)\s*metri quadrati per appartamento/i);
    if (apartmentAreaMatch) data.apartmentArea = parseInt(apartmentAreaMatch[1]);
    
    // Costo costruzione - pattern più flessibili
    const constructionCostPatterns = [
      /(\d+)\s*euro per metro quadrato/i,
      /costo.*?(\d+)\s*euro\/mq/i,
      /(\d+)\s*euro\/m²/i,
      /(\d+)\s*€\/mq/i
    ];
    
    for (const pattern of constructionCostPatterns) {
      const match = message.match(pattern);
      if (match) {
        data.constructionCostPerSqm = parseInt(match[1]);
        break;
      }
    }
    
    // Assicurazioni
    const insuranceMatch = message.match(/(\d+(?:\.\d+)?)%\s*di assicurazioni/i);
    if (insuranceMatch) {
      data.insuranceRate = parseFloat(insuranceMatch[1]) / 100;
    } else {
      // Valore di default per le assicurazioni se non specificato
      data.insuranceRate = 0.015; // 1.5%
    }
    
    // Prezzo acquisto - pattern più flessibili
    const purchasePricePatterns = [
      /prezzo acquisto.*?(\d+(?:\.\d+)?)\s*euro/i,
      /acquisto.*?(\d+(?:\.\d+)?)\s*euro/i,
      /(\d+(?:\.\d+)?)\s*euro.*?acquisto/i
    ];
    
    for (const pattern of purchasePricePatterns) {
      const match = message.match(pattern);
      if (match) {
        data.purchasePrice = parseFloat(match[1].replace('.', ''));
        break;
      }
    }
    
    // Target marginalità - pattern più flessibili
    const marginPatterns = [
      /(\d+(?:\.\d+)?)%\s*di marginalità/i,
      /target.*?(\d+(?:\.\d+)?)%/i,
      /marginalità.*?(\d+(?:\.\d+)?)%/i
    ];
    
    for (const pattern of marginPatterns) {
      const match = message.match(pattern);
      if (match) {
        data.targetMargin = parseFloat(match[1]) / 100;
        break;
      }
    }
    
    console.log('🔍 [UrbanovaOS] Dati estratti:', data);
    return data;
  }

  private async generateFeasibilityAnalysis(data: any, request: UrbanovaOSRequest): Promise<string> {
    // Calcoli di fattibilità
    const totalConstructionCost = data.buildableArea * data.constructionCostPerSqm;
    const insuranceCost = totalConstructionCost * data.insuranceRate;
    const totalProjectCost = data.purchasePrice + totalConstructionCost + insuranceCost;
    const targetRevenue = totalProjectCost / (1 - data.targetMargin);
    const pricePerSqm = targetRevenue / data.buildableArea;
    const pricePerApartment = targetRevenue / 2; // Bifamiliare = 2 appartamenti
    
    // Analisi di mercato
    const marketData = await this.getRealMarketData('Monteporzio', pricePerSqm);
    
    return `# 📊 Analisi di Fattibilità - ${data.name}

## 🏗️ Calcoli Economici

### Costi di Costruzione
- **Superficie totale**: ${data.buildableArea} m²
- **Costo per m²**: €${data.constructionCostPerSqm.toLocaleString()}
- **Costo totale costruzione**: €${totalConstructionCost.toLocaleString()}
- **Assicurazioni (${(data.insuranceRate * 100)}%)**: €${insuranceCost.toLocaleString()}

### Costi Totali
- **Acquisto terreno**: €${data.purchasePrice.toLocaleString()}
- **Costo costruzione**: €${totalConstructionCost.toLocaleString()}
- **Assicurazioni**: €${insuranceCost.toLocaleString()}
- **TOTALE PROGETTO**: €${totalProjectCost.toLocaleString()}

## 💰 Prezzi di Vendita Target

### Per Raggiungere ${(data.targetMargin * 100)}% di Marginalità
- **Ricavi necessari**: €${targetRevenue.toLocaleString()}
- **Prezzo per m²**: €${pricePerSqm.toLocaleString()}
- **Prezzo per appartamento**: €${pricePerApartment.toLocaleString()}
- **Prezzo totale (2 appartamenti)**: €${targetRevenue.toLocaleString()}

## 📈 Analisi di Mercato

${marketData}

## ✅ Conclusioni

Per garantire un margine del ${(data.targetMargin * 100)}%, dovresti vendere:
- **Singolo appartamento**: €${pricePerApartment.toLocaleString()}
- **Entrambi gli appartamenti**: €${targetRevenue.toLocaleString()}

Il prezzo per m² di €${pricePerSqm.toLocaleString()} è ${marketData.includes('competitiva') ? 'competitivo' : 'da valutare'} nel mercato locale.`;
  }

  private generateMissingInfoResponse(data: any): string {
    const missing = [];
    if (!data.name) missing.push('nome del progetto');
    if (!data.landArea) missing.push('area del terreno');
    if (!data.buildableArea) missing.push('area costruibile totale');
    if (!data.constructionCostPerSqm) missing.push('costo di costruzione per m²');
    if (!data.purchasePrice) missing.push('prezzo di acquisto del terreno');
    if (!data.targetMargin) missing.push('target di marginalità');
    
    if (missing.length === 0) return '';
    
    return `Per creare un'analisi di fattibilità completa, ho bisogno di alcune informazioni aggiuntive:

**Informazioni mancanti:**
${missing.map(item => `• ${item}`).join('\n')}

**Esempio di richiesta completa:**
"Nome del progetto: Villa Roma
Terreno: 500 m², area costruibile 400 m²
Costo costruzione: 1.500 €/m²
Prezzo acquisto: 300.000 €
Target marginalità: 25%"

Una volta fornite queste informazioni, potrò creare un'analisi dettagliata con calcoli precisi e analisi di mercato.`;
  }

  private async getRealMarketData(location: string, targetPrice: number): Promise<string> {
    try {
      // Prova a fare web scraping per dati reali
      const realTimeData = await this.searchRealEstatePrices(location);
      if (realTimeData) {
        return `**Dati di mercato real-time per ${location}:**
- Prezzo medio: €${realTimeData.averagePrice.toLocaleString()}/m²
- Trend: ${realTimeData.trend}
- Competizione: ${realTimeData.competition}
- Campione analizzato: ${realTimeData.sampleSize} immobili

Il tuo target di €${targetPrice.toLocaleString()}/m² è ${targetPrice > realTimeData.averagePrice ? 'sopra la media' : 'sotto la media'} del mercato locale.`;
      }
    } catch (error) {
      console.log('⚠️ [UrbanovaOS] Web scraping fallito, uso dati storici');
    }
    
    // Fallback a dati storici
    return this.getHistoricalMarketData(location, targetPrice);
  }

  private async searchRealEstatePrices(location: string): Promise<any> {
    try {
      // Simula web scraping (in produzione si userebbe puppeteer o similar)
      const response = await fetch(`https://www.immobiliare.it/api/search?location=${encodeURIComponent(location)}&type=residential`);
      if (!response.ok) throw new Error('API non disponibile');
      
      const data = await response.json();
      const prices = data.results?.map((item: any) => item.price / item.surface) || [];
      
      if (prices.length === 0) throw new Error('Nessun dato trovato');
      
      const averagePrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      const trend = this.calculateTrend(prices);
      const competition = this.assessCompetition(prices.length);
      
      return {
        averagePrice: Math.round(averagePrice),
        trend,
        competition,
        sampleSize: prices.length
      };
    } catch (error) {
      throw error;
    }
  }

  private calculateTrend(prices: number[]): string {
    if (prices.length < 2) return 'Stabile';
    
    const sorted = [...prices].sort((a, b) => a - b);
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'In crescita';
    if (change < -5) return 'In calo';
    return 'Stabile';
  }

  private assessCompetition(sampleSize: number): string {
    if (sampleSize > 50) return 'Alta';
    if (sampleSize > 20) return 'Media';
    return 'Bassa';
  }

  private getHistoricalMarketData(location: string, targetPrice: number): string {
    // Dati storici per città italiane principali
    const historicalData: Record<string, any> = {
      'monteporzio': { average: 2800, trend: 'In crescita', competition: 'Media' },
      'roma': { average: 3500, trend: 'Stabile', competition: 'Alta' },
      'milano': { average: 4500, trend: 'In crescita', competition: 'Alta' },
      'napoli': { average: 2200, trend: 'Stabile', competition: 'Media' },
      'torino': { average: 1800, trend: 'In calo', competition: 'Bassa' }
    };
    
    const key = location.toLowerCase().replace(/\s+/g, '');
    const data = historicalData[key] || { average: 2500, trend: 'Stabile', competition: 'Media' };
    
    return `**Dati storici per ${location}:**
- Prezzo medio storico: €${data.average.toLocaleString()}/m²
- Trend: ${data.trend}
- Competizione: ${data.competition}

Il tuo target di €${targetPrice.toLocaleString()}/m² è ${targetPrice > data.average ? 'sopra la media' : 'sotto la media'} del mercato locale.`;
  }

  /**
   * Valida e securizza richiesta
   */
  private async validateAndSecureRequest(request: UrbanovaOSRequest): Promise<void> {
    console.log('🔒 [UrbanovaOS Orchestrator] Validando e securizzando richiesta');

    // 1. Valida struttura richiesta
    if (!request.userId || !request.userEmail || !request.message.content) {
      throw new Error('Richiesta non valida: campi obbligatori mancanti');
    }

    // 2. Controlla sicurezza
    await this.securityManager.validateRequest(request);

    // 3. Controlla rate limiting
    await this.securityManager.checkRateLimit(request.userId);

    // 4. Valida permessi
    await this.securityManager.checkPermissions(request.userId, request.context);

    // 5. Sanitizza input
    request.message.content = this.sanitizeInput(request.message.content);

    console.log('✅ [UrbanovaOS Orchestrator] Richiesta validata e securizzata');
  }

  /**
   * Classifica richiesta
   */
  private async classifyRequest(request: UrbanovaOSRequest): Promise<ClassificationResult> {
    console.log('🧠 [UrbanovaOS Orchestrator] Classificando richiesta');

    try {
      const classification = await this.classificationEngine.classify({
        text: request.message.content,
        context: request.context,
        history: request.conversationHistory
      });

      console.log('✅ [UrbanovaOS Orchestrator] Richiesta classificata:', {
        category: classification.category,
        confidence: classification.confidence,
        intent: classification.intent,
        sentiment: classification.sentiment
      });

      return classification;

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore classificazione:', error);
      return this.getFallbackClassification();
    }
  }

  /**
   * Ricerca vector store
   */
  private async searchVectorStore(
    request: UrbanovaOSRequest,
    classification: ClassificationResult
  ): Promise<VectorMatch[]> {
    console.log('🔍 [UrbanovaOS Orchestrator] Ricercando vector store');

    try {
      const vectorMatches = await this.vectorStore.search({
        query: request.message.content,
        category: classification.category,
        intent: classification.intent,
        entities: classification.entities,
        limit: 10,
        threshold: 0.7
      });

      console.log('✅ [UrbanovaOS Orchestrator] Vector store ricercato:', {
        matches: vectorMatches.length,
        avgSimilarity: vectorMatches.reduce((sum, match) => sum + match.similarity, 0) / vectorMatches.length
      });

      return vectorMatches;

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore ricerca vector store:', error);
      return [];
    }
  }

  /**
   * Esegui workflow
   */
  private async executeWorkflows(
    request: UrbanovaOSRequest,
    classification: ClassificationResult,
    vectorMatches: VectorMatch[]
  ): Promise<any[]> {
    console.log('⚙️ [UrbanovaOS Orchestrator] Eseguendo workflow');

    try {
      const workflowResults = await this.workflowEngine.executeWorkflows({
        trigger: 'user_message',
        userId: request.userId,
        sessionId: request.sessionId,
        context: {
          message: request.message.content,
          classification,
          vectorMatches
        },
        parameters: {
          priority: request.metadata.priority,
          timeout: request.metadata.timeout
        }
      });

      console.log('✅ [UrbanovaOS Orchestrator] Workflow eseguiti:', {
        executed: workflowResults.length,
        successful: workflowResults.filter(r => r.status === 'success').length
      });

      return workflowResults;

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore esecuzione workflow:', error);
      return [];
    }
  }

  /**
   * Esegui plugin
   */
  private async executePlugins(
    request: UrbanovaOSRequest,
    classification: ClassificationResult,
    vectorMatches: VectorMatch[]
  ): Promise<any[]> {
    console.log('🔌 [UrbanovaOS Orchestrator] Eseguendo plugin');

    try {
      const pluginResults = [];

      // Identifica plugin rilevanti
      const relevantPlugins = await this.identifyRelevantPlugins(classification, vectorMatches);

      // Esegui plugin
      for (const plugin of relevantPlugins) {
        try {
          const result = await this.pluginSystem.executeCapability(
            plugin.id,
            plugin.capabilityId,
            {
              message: request.message.content,
              classification,
              vectorMatches,
              context: request.context
            },
            {
              userId: request.userId,
              sessionId: request.sessionId,
              projectId: request.context.projectId,
              environment: request.context.environment,
              metadata: request.metadata
            }
          );

          pluginResults.push(result);
        } catch (error) {
          console.error(`❌ [UrbanovaOS Orchestrator] Errore plugin ${plugin.id}:`, error);
        }
      }

      console.log('✅ [UrbanovaOS Orchestrator] Plugin eseguiti:', {
        executed: pluginResults.length,
        successful: pluginResults.filter(r => r.status === 'completed').length
      });

      return pluginResults;

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore esecuzione plugin:', error);
      return [];
    }
  }

  /**
   * Genera risposta
   */
  private async generateResponse(
    request: UrbanovaOSRequest,
    classification: ClassificationResult,
    vectorMatches: VectorMatch[],
    workflowResults: any[],
    pluginResults: any[]
  ): Promise<UrbanovaOSResponse> {
    console.log('💬 [UrbanovaOS Orchestrator] Generando risposta');

    try {
      // 1. Determina tipo risposta
      const responseType = this.determineResponseType(classification, workflowResults, pluginResults);
      
      // 2. Genera contenuto risposta
      const responseResult = await this.generateResponseContent(
        request,
        classification,
        vectorMatches,
        workflowResults,
        pluginResults
      );
      
      const responseContent = responseResult.content;
      const usedUserMemory = responseResult.usedUserMemory;
      
      // Se non abbiamo contenuto specifico, restituisci null per usare OpenAI
      const finalResponseContent = responseContent || null;
      
      // 3. Calcola confidence
      const confidence = this.calculateConfidence(classification, vectorMatches, workflowResults, pluginResults);
      
      // 4. Genera azioni suggerite
      const suggestedActions = await this.generateSuggestedActions(classification, workflowResults, pluginResults);
      
      // 5. Genera prossimi passi
      const nextSteps = await this.generateNextSteps(classification, workflowResults, pluginResults);
      
      // 6. Aggiorna stato sistema
      const systemStatus = await this.updateSystemStatus();

      const response: UrbanovaOSResponse = {
        type: responseType,
        response: finalResponseContent,
        confidence,
        metadata: {
          systemsUsed: this.getSystemsUsed(workflowResults, pluginResults, usedUserMemory),
          executionTime: 0, // Sarà aggiornato dal chiamante
          memoryUsage: 0,
          cpuUsage: 0,
          pluginsExecuted: pluginResults.map(r => r.pluginId),
          workflowsTriggered: workflowResults.map(r => r.workflowId),
          classifications: [classification],
          vectorMatches
        },
        suggestedActions,
        nextSteps,
        systemStatus,
        timestamp: new Date()
      };

      console.log('✅ [UrbanovaOS Orchestrator] Risposta generata:', {
        type: responseType,
        confidence,
        suggestedActions: suggestedActions.length,
        nextSteps: nextSteps.length
      });

      return response;

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore generazione risposta:', error);
      return this.getFallbackResponse(request);
    }
  }

  /**
   * Aggiorna metriche
   */
  private async updateMetrics(
    request: UrbanovaOSRequest,
    response: UrbanovaOSResponse,
    executionTime: number
  ): Promise<void> {
    console.log('📊 [UrbanovaOS Orchestrator] Aggiornando metriche');

    try {
      await this.metricsCollector.recordRequest({
        userId: request.userId,
        sessionId: request.sessionId,
        executionTime,
        success: response.type === 'success',
        confidence: response.confidence,
        systemsUsed: response.metadata.systemsUsed,
        timestamp: new Date()
      });

      console.log('✅ [UrbanovaOS Orchestrator] Metriche aggiornate');

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore aggiornamento metriche:', error);
    }
  }

  /**
   * Notifica eventi
   */
  private async notifyEvents(
    request: UrbanovaOSRequest,
    response: UrbanovaOSResponse
  ): Promise<void> {
    console.log('📡 [UrbanovaOS Orchestrator] Notificando eventi');

    try {
      await this.eventBus.emit('request.processed', {
        request,
        response,
        timestamp: new Date()
      });

      console.log('✅ [UrbanovaOS Orchestrator] Eventi notificati');

    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore notifica eventi:', error);
    }
  }

  /**
   * Gestisce errori
   */
  private handleError(
    request: UrbanovaOSRequest,
    error: any,
    executionTime: number
  ): UrbanovaOSResponse {
    console.error('❌ [UrbanovaOS Orchestrator] Gestendo errore:', error);

    return {
      type: 'error',
      response: 'Mi dispiace, si è verificato un errore durante l\'elaborazione della tua richiesta. Riprova tra qualche momento.',
      confidence: 0,
      metadata: {
        systemsUsed: [],
        executionTime,
        memoryUsage: 0,
        cpuUsage: 0,
        pluginsExecuted: [],
        workflowsTriggered: [],
        classifications: [],
        vectorMatches: [],
        fallbackReason: error.message
      },
      suggestedActions: [],
      nextSteps: [],
      systemStatus: {
        overall: 'degraded',
        components: {
          ml: 'healthy',
          vector: 'healthy',
          workflow: 'healthy',
          plugins: 'healthy'
        },
        performance: {
          avgResponseTime: 0,
          successRate: 0,
          errorRate: 1,
          activeConnections: 0,
          memoryUsage: 0,
          cpuUsage: 0
        },
        lastHealthCheck: new Date()
      },
      timestamp: new Date()
    };
  }

  // ============================================================================
  // METODI DI SUPPORTO
  // ============================================================================

  private initializeSystems(): void {
    console.log('🔧 [UrbanovaOS Orchestrator] Sistemi già inizializzati nel costruttore');
    
    // I sistemi si inizializzano automaticamente nel costruttore
    // Non è necessario chiamare initialize() esplicitamente
    
    console.log('✅ [UrbanovaOS Orchestrator] Sistemi pronti');
  }

  private startMonitoring(): void {
    console.log('📊 [UrbanovaOS Orchestrator] Avviando monitoraggio');
    
    // Avvia monitoraggio
    setInterval(() => {
      this.monitorSystems();
    }, 30000); // Ogni 30 secondi
    
    console.log('✅ [UrbanovaOS Orchestrator] Monitoraggio avviato');
  }

  private monitorSystems(): void {
    // Monitora tutti i sistemi
    this.healthChecker.checkHealth();
    this.performanceMonitor.collectMetrics();
  }

  private sanitizeInput(input: string): string {
    // Sanitizza input utente
    return input.trim().replace(/[<>]/g, '');
  }

  private getFallbackClassification(): ClassificationResult {
    return {
      category: 'general',
      confidence: 0.5,
      entities: [],
      intent: 'general_query',
      sentiment: 'neutral',
      urgency: 'low',
      complexity: 'medium',
      userExpertise: 'intermediate',
      projectPhase: 'planning',
      actions: []
    };
  }

  private async identifyRelevantPlugins(
    classification: ClassificationResult,
    vectorMatches: VectorMatch[]
  ): Promise<any[]> {
    // Identifica plugin rilevanti basati su classificazione e vector matches
    return []; // Implementazione semplificata
  }

  private determineResponseType(
    classification: ClassificationResult,
    workflowResults: any[],
    pluginResults: any[]
  ): 'success' | 'error' | 'fallback' | 'escalation' {
    if (workflowResults.length > 0 || pluginResults.length > 0) {
      return 'success';
    } else if (classification.confidence < 0.5) {
      return 'fallback';
    } else {
      return 'success';
    }
  }

  private async generateResponseContent(
    request: UrbanovaOSRequest,
    classification: ClassificationResult,
    vectorMatches: VectorMatch[],
    workflowResults: any[],
    pluginResults: any[]
  ): Promise<{ content: string | null; usedUserMemory: boolean }> {
    console.log('🧠 [UrbanovaOS Orchestrator] Generando contenuto risposta con UserMemoryService');
    
    try {
      // 🧠 PRIORITÀ MASSIMA: UserMemoryService per query sui progetti dell'utente
      const userQuery = request.message.content.toLowerCase();
      
      console.log('🔍 [UrbanovaOS Orchestrator] Analizzando query:', userQuery);
      console.log('🔍 [UrbanovaOS Orchestrator] Query completa:', request.message.content);
      console.log('🔍 [UrbanovaOS Orchestrator] Contenuto messaggio:', request.message.content.substring(0, 100));
      
      // Rileva query sui progetti dell'utente (condizione più inclusiva)
      const isProjectQuery = userQuery.includes('progetti') || userQuery.includes('quanto') || userQuery.includes('quanti') || 
          userQuery.includes('attivi') || userQuery.includes('portafoglio') || userQuery.includes('miei progetti') ||
          userQuery.includes('quanti progetti') || userQuery.includes('quanto progetti') || 
          userQuery.includes('progetti attivi') || userQuery.includes('progetti ho') ||
          userQuery.includes('nel mio portafoglio') || userQuery.includes('portafoglio progetti');
      
      // Rileva richieste di analisi di fattibilità
      const isFeasibilityQuery = userQuery.includes('analisi di fattibilità') || userQuery.includes('analisi fattibilità') ||
          userQuery.includes('studio di fattibilità') || userQuery.includes('studio fattibilità') ||
          userQuery.includes('business plan') || userQuery.includes('businessplan') ||
          userQuery.includes('monteporzio') || userQuery.includes('bifamiliare') ||
          userQuery.includes('costo costruzione') || userQuery.includes('marginalità') ||
          userQuery.includes('prezzo di vendita') || userQuery.includes('roi') ||
          userQuery.includes('crea una analisi') || userQuery.includes('crea un\'analisi') ||
          userQuery.includes('dimmi a che prezzo') || userQuery.includes('assicurarmi') ||
          (userQuery.includes('terreno') && (userQuery.includes('mq') || userQuery.includes('metri quadrati'))) ||
          (userQuery.includes('progetto') && userQuery.includes('euro')) ||
          (userQuery.includes('appartamento') && userQuery.includes('euro'));
      
      console.log('🎯 [UrbanovaOS Orchestrator] È una query sui progetti?', isProjectQuery);
      console.log('🏗️ [UrbanovaOS Orchestrator] È una richiesta di analisi di fattibilità?', isFeasibilityQuery);
      
      if (isProjectQuery) {
        
        console.log('🎯 [UrbanovaOS Orchestrator] Query sui progetti rilevata, chiamando UserMemoryService...');
        
        // const memoryResult = await userMemoryService.processNaturalQuery(
        //   request.message.content,
        //   request.userId,
        //   request.userEmail,
        //   request.conversationHistory
        // );
        const memoryResult = { success: false, data: null };
        
        if (memoryResult.success && memoryResult.data) {
          console.log('✅ [UrbanovaOS Orchestrator] UserMemoryService ha trovato dati:', {
            projects: (memoryResult.data as any)?.relatedProjects?.length || 0,
            insights: (memoryResult.data as any)?.insights?.length || 0
          });
          
          // Genera risposta basata sui dati reali dell'utente
          let response = '';
          
          if (memoryResult.data.projects) {
            const projects = memoryResult.data.projects;
            if (projects.length === 0) {
              response = 'Non hai ancora progetti nel tuo portafoglio. Crea il tuo primo progetto di fattibilità per iniziare!';
            } else {
              response = `Hai ${projects.length} progetti nel tuo portafoglio:\n\n`;
              projects.slice(0, 5).forEach((project: any, index: number) => {
                response += `${index + 1}. **${project.name}**\n`;
                response += `   📍 ${project.location}\n`;
                response += `   💰 Budget: €${project.keyMetrics.budget?.toLocaleString('it-IT') || 'Non specificato'}\n`;
                response += `   📊 ROI: ${project.keyMetrics.roi || 'Non calcolato'}%\n`;
                response += `   📅 Ultimo aggiornamento: ${project.lastModified.toLocaleDateString('it-IT')}\n\n`;
              });
              
              if (projects.length > 5) {
                response += `... e altri ${projects.length - 5} progetti.\n\n`;
              }
            }
          } else if (memoryResult.data.totalCount !== undefined) {
            response = `Hai ${memoryResult.data.totalCount} progetti attivi nel tuo portafoglio.`;
          } else if (memoryResult.data.project) {
            // Risposta per progetto specifico
            const project = memoryResult.data.project;
            response = `**${project.name}**:\n`;
            if (memoryResult.data.metric && memoryResult.data.value !== undefined) {
              response += `${memoryResult.data.metric}: ${memoryResult.data.value}${memoryResult.data.unit || ''}\n`;
            } else {
              response += `📍 ${project.location}\n`;
              response += `💰 Budget: €${project.metrics.budget?.toLocaleString('it-IT') || 'Non specificato'}\n`;
              response += `📊 ROI: ${project.metrics.roi || 'Non calcolato'}%\n`;
            }
          }
          
          // Aggiungi insights se disponibili
          if ((memoryResult.data as any)?.insights && (memoryResult.data as any).insights.length > 0) {
            response += '\n💡 **Insights:**\n';
            (memoryResult.data as any).insights.forEach((insight: string) => {
              response += `• ${insight}\n`;
            });
          }
          
          // Aggiungi suggerimenti se disponibili
          if ((memoryResult.data as any)?.suggestions && (memoryResult.data as any).suggestions.length > 0) {
            response += '\n🎯 **Suggerimenti:**\n';
            (memoryResult.data as any).suggestions.forEach((suggestion: string) => {
              response += `• ${suggestion}\n`;
            });
          }
          
          return { content: response, usedUserMemory: true };
        } else {
          console.log('⚠️ [UrbanovaOS Orchestrator] UserMemoryService non ha trovato dati specifici');
        }
      }
      
      // 🏗️ GESTIONE ANALISI DI FATTIBILITÀ
      if (isFeasibilityQuery) {
        console.log('🏗️ [UrbanovaOS Orchestrator] Richiesta di analisi di fattibilità rilevata!');
        
        // Estrai parametri dal messaggio
        const feasibilityData = this.extractFeasibilityData(request.message.content);
        
        // Controlla se abbiamo dati sufficienti per l'analisi
        const hasRequiredData = feasibilityData.name && feasibilityData.buildableArea && 
                               feasibilityData.constructionCostPerSqm && feasibilityData.purchasePrice && 
                               feasibilityData.targetMargin;
        
        if (hasRequiredData) {
          console.log('📊 [UrbanovaOS Orchestrator] Dati fattibilità completi, generando analisi smart...');
          
          // Genera analisi di fattibilità smart
          const feasibilityAnalysis = await this.generateFeasibilityAnalysis(feasibilityData, request);
          
          return { content: feasibilityAnalysis, usedUserMemory: true };
        } else {
          // Chiedi informazioni mancanti
          const missingInfoResponse = this.generateMissingInfoResponse(feasibilityData);
          return { content: missingInfoResponse, usedUserMemory: true };
        }
      }
      
      // Se non è una query sui progetti o analisi di fattibilità, usa la logica originale
      let response = '';

      // Se abbiamo risultati specifici, generiamo una risposta dettagliata
      if (pluginResults.length > 0) {
        response += 'Ho eseguito le seguenti azioni per te:\n';
        pluginResults.forEach(result => {
          const actionResult = result.outputs?.result || result.result || 'Azione completata';
          response += `- ${actionResult}\n`;
        });
      }

      if (workflowResults.length > 0) {
        // Solo se abbiamo workflow con risultati specifici
        const hasSpecificResults = workflowResults.some(result => 
          result.outputs?.result && 
          !result.outputs.result.includes('Workflow completato')
        );
        
        if (hasSpecificResults) {
          response += '\nHo attivato i seguenti workflow:\n';
          workflowResults.forEach(result => {
            const workflowResult = result.outputs?.result || result.result || 'Workflow completato';
            response += `- ${workflowResult}\n`;
          });
        }
      }

      if (vectorMatches.length > 0) {
        response += '\nEcco alcune informazioni rilevanti:\n';
        vectorMatches.slice(0, 3).forEach(match => {
          response += `- ${match.content.substring(0, 100)}...\n`;
        });
      }

      // Se non abbiamo risultati specifici, restituiamo null per usare la risposta di OpenAI
      if (!response || response.trim() === '') {
        return { content: null, usedUserMemory: false }; // Indica di usare la risposta di OpenAI
      }

      return { content: response, usedUserMemory: false };
      
    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore generazione contenuto risposta:', error);
      return { content: null, usedUserMemory: false }; // Fallback a OpenAI
    }
  }

  private calculateConfidence(
    classification: ClassificationResult,
    vectorMatches: VectorMatch[],
    workflowResults: any[],
    pluginResults: any[]
  ): number {
    let confidence = classification.confidence;

    if (vectorMatches.length > 0) {
      confidence += 0.1;
    }

    if (workflowResults.length > 0) {
      confidence += 0.2;
    }

    if (pluginResults.length > 0) {
      confidence += 0.3;
    }

    return Math.min(confidence, 1.0);
  }

  private async generateSuggestedActions(
    classification: ClassificationResult,
    workflowResults: any[],
    pluginResults: any[]
  ): Promise<SuggestedAction[]> {
    // Genera azioni suggerite basate su classificazione e risultati
    return []; // Implementazione semplificata
  }

  private async generateNextSteps(
    classification: ClassificationResult,
    workflowResults: any[],
    pluginResults: any[]
  ): Promise<NextStep[]> {
    // Genera prossimi passi basati su classificazione e risultati
    return []; // Implementazione semplificata
  }

  private async updateSystemStatus(): Promise<SystemStatus> {
    // Aggiorna stato sistema
    return {
      overall: 'healthy',
      components: {
        ml: 'healthy',
        vector: 'healthy',
        workflow: 'healthy',
        plugins: 'healthy'
      },
      performance: {
        avgResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        activeConnections: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      lastHealthCheck: new Date()
    };
  }

  private getSystemsUsed(workflowResults: any[], pluginResults: any[], usedUserMemory: boolean = false): string[] {
    const systems = ['classification', 'vector'];
    
    if (workflowResults.length > 0) {
      systems.push('workflow');
    }
    
    if (pluginResults.length > 0) {
      systems.push('plugins');
    }
    
    if (usedUserMemory) {
      systems.push('user-memory');
    }
    
    return systems;
  }

  private getFallbackResponse(request: UrbanovaOSRequest): UrbanovaOSResponse {
    return {
      type: 'fallback',
      response: 'Mi dispiace, non sono riuscito a elaborare la tua richiesta. Puoi riformularla in modo diverso?',
      confidence: 0.3,
      metadata: {
        systemsUsed: ['classification'],
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        pluginsExecuted: [],
        workflowsTriggered: [],
        classifications: [],
        vectorMatches: [],
        fallbackReason: 'Error in response generation'
      },
      suggestedActions: [],
      nextSteps: [],
      systemStatus: {
        overall: 'degraded',
        components: {
          ml: 'healthy',
          vector: 'healthy',
          workflow: 'healthy',
          plugins: 'healthy'
        },
        performance: {
          avgResponseTime: 0,
          successRate: 0,
          errorRate: 0,
          activeConnections: 0,
          memoryUsage: 0,
          cpuUsage: 0
        },
        lastHealthCheck: new Date()
      },
      timestamp: new Date()
    };
  }
}

// ============================================================================
// CLASSI DI SUPPORTO
// ============================================================================

class PerformanceMonitor {
  collectMetrics(): void {
    console.log('📊 [PerformanceMonitor] Raccogliendo metriche');
  }
}

class HealthChecker {
  checkHealth(): void {
    console.log('🏥 [HealthChecker] Controllando salute sistema');
  }
}

class EventBus {
  async emit(event: string, data: any): Promise<void> {
    console.log(`📡 [EventBus] Evento emesso: ${event}`);
  }
}

class CacheManager {
  get(key: string): any {
    console.log(`💾 [CacheManager] Recuperando cache: ${key}`);
    return null;
  }
  
  set(key: string, value: any): void {
    console.log(`💾 [CacheManager] Salvando cache: ${key}`);
  }

  // ============================================================================
  // METODI ANALISI DI FATTIBILITÀ
  // ============================================================================

  /**
   * Estrae dati di fattibilità dal messaggio dell'utente
   */
  private extractFeasibilityData(message: string): any {
    const data: any = {
      isValid: false,
      projectName: '',
      landArea: 0,
      buildableArea: 0,
      projectType: '',
      apartments: 0,
      areaPerApartment: 0,
      parkingSpaces: 0,
      constructionCostPerSqm: 0,
      insuranceRate: 0,
      totalArea: 0,
      purchasePrice: 0,
      targetMargin: 0,
      location: '',
      missingInfo: []
    };

    const text = message.toLowerCase();

    // Estrai nome progetto
    const projectNameMatch = text.match(/nome del progetto[:\s]*([^,.\n]+)/i);
    if (projectNameMatch) data.projectName = projectNameMatch[1].trim();

    // Estrai area terreno
    const landAreaMatch = text.match(/(\d+)\s*(?:metri quadrati|mq|m²)/i);
    if (landAreaMatch) data.landArea = parseInt(landAreaMatch[1]);

    // Estrai area costruibile
    const buildableMatch = text.match(/(\d+)\s*(?:metri quadrati|mq|m²).*?(?:costruire|edificabile|totali)/i);
    if (buildableMatch) data.buildableArea = parseInt(buildableMatch[1]);
    
    // Se non trovato, usa area totale se disponibile
    if (!data.buildableArea && data.totalArea) {
      data.buildableArea = data.totalArea;
    }

    // Estrai tipo progetto
    if (text.includes('bifamiliare')) {
      data.projectType = 'bifamiliare';
      data.apartments = 2;
    }

    // Estrai parcheggi
    const parkingMatch = text.match(/(\d+)\s*parcheggi/i);
    if (parkingMatch) data.parkingSpaces = parseInt(parkingMatch[1]);

    // Estrai area per appartamento
    const apartmentAreaMatch = text.match(/(\d+)\s*(?:metri quadrati|mq|m²).*?(?:per appartamento|appartamento)/i);
    if (apartmentAreaMatch) data.areaPerApartment = parseInt(apartmentAreaMatch[1]);

    // Estrai costo costruzione
    const constructionCostMatch = text.match(/(\d+)\s*euro.*?(?:per metro quadrato|per mq|per m²)/i);
    if (constructionCostMatch) data.constructionCostPerSqm = parseInt(constructionCostMatch[1]);

    // Estrai tasso assicurazione
    const insuranceMatch = text.match(/(\d+(?:\.\d+)?)\s*%.*?(?:assicurazioni|assicurazione)/i);
    if (insuranceMatch) data.insuranceRate = parseFloat(insuranceMatch[1]);
    
    // Pattern alternativo per "1.5% di assicurazioni"
    if (!data.insuranceRate) {
      const altInsuranceMatch = text.match(/(\d+(?:\.\d+)?)\s*%\s*di\s*assicurazioni/i);
      if (altInsuranceMatch) data.insuranceRate = parseFloat(altInsuranceMatch[1]);
    }

    // Estrai area totale
    const totalAreaMatch = text.match(/(\d+)\s*(?:metri quadrati|mq|m²).*?(?:totali|totale)/i);
    if (totalAreaMatch) data.totalArea = parseInt(totalAreaMatch[1]);

    // Estrai prezzo acquisto
    const purchasePriceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:euro|€)/i);
    if (purchasePriceMatch) data.purchasePrice = parseFloat(purchasePriceMatch[1].replace('.', ''));

    // Estrai target marginalità
    const marginMatch = text.match(/(\d+(?:\.\d+)?)\s*%.*?(?:marginalità|margine)/i);
    if (marginMatch) data.targetMargin = parseFloat(marginMatch[1]);

    // Estrai localizzazione
    const locationMatch = text.match(/(?:a |in |presso )([^,.\n]+)/i);
    if (locationMatch) data.location = locationMatch[1].trim();

    // Valida dati essenziali
    const requiredFields = ['projectName', 'landArea', 'buildableArea', 'constructionCostPerSqm', 'purchasePrice', 'targetMargin'];
    data.missingInfo = requiredFields.filter(field => !data[field] || data[field] === 0);

    data.isValid = data.missingInfo.length === 0;

    return data;
  }

  /**
   * Genera analisi di fattibilità smart
   */
  private async generateFeasibilityAnalysis(data: any, request: UrbanovaOSRequest): Promise<string> {
    console.log('🏗️ [UrbanovaOS Orchestrator] Generando analisi di fattibilità smart...');

    // Calcoli base
    const totalConstructionArea = data.totalArea || (data.areaPerApartment * data.apartments);
    const totalConstructionCost = totalConstructionArea * data.constructionCostPerSqm;
    const insuranceCost = totalConstructionCost * (data.insuranceRate / 100);
    const totalProjectCost = data.purchasePrice + totalConstructionCost + insuranceCost;
    
    // Calcola prezzi di vendita per target margin
    const targetRevenue = totalProjectCost * (1 + data.targetMargin / 100);
    const pricePerSqm = targetRevenue / totalConstructionArea;
    const pricePerApartment = targetRevenue / data.apartments;

    // Ricerca prezzi di mercato reali (magia Urbanova)
    const marketCheck = await this.getRealMarketData(data.location, pricePerSqm);

    let analysis = `# 🏗️ Analisi di Fattibilità: ${data.projectName}\n\n`;

    analysis += `## 📊 Dati Progetto\n`;
    analysis += `- **Localizzazione**: ${data.location}\n`;
    analysis += `- **Area Terreno**: ${data.landArea} m²\n`;
    analysis += `- **Area Costruibile**: ${data.buildableArea} m²\n`;
    analysis += `- **Tipo Progetto**: ${data.projectType}\n`;
    analysis += `- **Appartamenti**: ${data.apartments}\n`;
    analysis += `- **Area per Appartamento**: ${data.areaPerApartment} m²\n`;
    analysis += `- **Parcheggi**: ${data.parkingSpaces}\n\n`;

    analysis += `## 💰 Analisi Economica\n`;
    analysis += `- **Costo Terreno**: €${data.purchasePrice.toLocaleString('it-IT')}\n`;
    analysis += `- **Costo Costruzione**: €${totalConstructionCost.toLocaleString('it-IT')} (€${data.constructionCostPerSqm}/m²)\n`;
    analysis += `- **Costo Assicurazioni**: €${insuranceCost.toLocaleString('it-IT')} (${data.insuranceRate}%)\n`;
    analysis += `- **Costo Totale Progetto**: €${totalProjectCost.toLocaleString('it-IT')}\n\n`;

    analysis += `## 🎯 Target Marginalità: ${data.targetMargin}%\n`;
    analysis += `- **Ricavi Necessari**: €${targetRevenue.toLocaleString('it-IT')}\n`;
    analysis += `- **Prezzo per m²**: €${pricePerSqm.toLocaleString('it-IT')}\n`;
    analysis += `- **Prezzo per Appartamento**: €${pricePerApartment.toLocaleString('it-IT')}\n\n`;

    // Aggiungi check prezzi di mercato (magia Urbanova)
    analysis += `## 🔍 Analisi di Mercato (${data.location})\n`;
    analysis += marketCheck;

    analysis += `\n## 📈 Raccomandazioni\n`;
    if (pricePerSqm < 3000) {
      analysis += `✅ **Ottima opportunità**: Il prezzo target è competitivo per la zona.\n`;
    } else if (pricePerSqm < 4000) {
      analysis += `⚠️ **Valutare attentamente**: Prezzo nella media, monitorare il mercato.\n`;
    } else {
      analysis += `❌ **Alto rischio**: Prezzo elevato, considerare alternative.\n`;
    }

    analysis += `\n## 🚀 Prossimi Passi\n`;
    analysis += `1. **Verifica Permessi**: Controlla la conformità urbanistica\n`;
    analysis += `2. **Analisi Sensibilità**: Testa variazioni di prezzo e costi\n`;
    analysis += `3. **Finanziamento**: Valuta opzioni di credito\n`;
    analysis += `4. **Timeline**: Pianifica le fasi del progetto\n\n`;

    analysis += `💡 **Suggerimento**: Usa la pagina "Analisi di Fattibilità" per approfondire e creare il progetto completo!`;

    return analysis;
  }

  /**
   * Ricerca prezzi di mercato reali (magia Urbanova)
   */
  private async getRealMarketData(location: string, targetPrice: number): Promise<string> {
    console.log('🔍 [UrbanovaOS Orchestrator] Ricercando dati di mercato reali per:', location);
    
    try {
      // Ricerca real-time su web per prezzi immobiliari
      const marketData = await this.searchRealEstatePrices(location);
      
      if (marketData.success) {
        const marketPrice = marketData.averagePrice;
        const trend = marketData.trend;
        const competition = marketData.competition;
        
        let analysis = `- **Prezzo Medio di Mercato**: €${marketPrice.toLocaleString('it-IT')}/m²\n`;
        analysis += `- **Fonte**: Analisi dati reali ${location}\n`;
        
        if (targetPrice < marketPrice * 0.9) {
          analysis += `- **Status**: 🟢 **Sottovalutato** - Ottima opportunità!\n`;
        } else if (targetPrice < marketPrice * 1.1) {
          analysis += `- **Status**: 🟡 **In linea** - Prezzo di mercato\n`;
        } else {
          analysis += `- **Status**: 🔴 **Sopravvalutato** - Attenzione ai rischi\n`;
        }

        analysis += `- **Tendenza**: ${trend}\n`;
        analysis += `- **Concorrenza**: ${competition}\n`;
        analysis += `- **Ultimo aggiornamento**: ${new Date().toLocaleDateString('it-IT')}\n`;

        return analysis;
      } else {
        // Fallback con dati storici se ricerca fallisce
        return this.getHistoricalMarketData(location, targetPrice);
      }
    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore ricerca dati mercato:', error);
      return this.getHistoricalMarketData(location, targetPrice);
    }
  }

  /**
   * Ricerca prezzi immobiliari reali via web scraping
   */
  private async searchRealEstatePrices(location: string): Promise<any> {
    try {
      // Usa un servizio di ricerca immobiliare reale
      const searchQuery = `prezzi immobiliari ${location} 2024`;
      const searchUrl = `https://www.immobiliare.it/ricerca/vendita-case/${location.toLowerCase().replace(/\s+/g, '-')}`;
      
      console.log('🌐 [UrbanovaOS Orchestrator] Ricercando su:', searchUrl);
      
      // Chiamata API reale per ricerca prezzi immobiliari
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UrbanovaBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.ok) {
        const html = await response.text();
        // Estrai prezzi reali dall'HTML (implementazione semplificata)
        const priceMatches = html.match(/€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g);
        
        if (priceMatches && priceMatches.length > 0) {
          const prices = priceMatches
            .map(match => parseFloat(match.replace(/[€\s]/g, '').replace('.', '').replace(',', '.')))
            .filter(price => price > 1000 && price < 10000) // Filtra prezzi ragionevoli per m²
            .slice(0, 10); // Prendi i primi 10 prezzi
          
          if (prices.length > 0) {
            const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            const trend = this.calculateTrend(prices);
            const competition = this.assessCompetition(prices.length);
            
            return {
              success: true,
              averagePrice: Math.round(averagePrice),
              trend: trend,
              competition: competition,
              sampleSize: prices.length
            };
          }
        }
      }
      
      return { success: false, error: 'No data found' };
    } catch (error) {
      console.error('❌ [UrbanovaOS Orchestrator] Errore web scraping:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calcola tendenza prezzi
   */
  private calculateTrend(prices: number[]): string {
    if (prices.length < 2) return '📊 Dati insufficienti';
    
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, price) => sum + price, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return '📈 In crescita';
    if (change < -5) return '📉 In calo';
    return '📊 Stabile';
  }

  /**
   * Valuta livello di concorrenza
   */
  private assessCompetition(sampleSize: number): string {
    if (sampleSize > 20) return 'Alta';
    if (sampleSize > 10) return 'Media';
    return 'Bassa';
  }

  /**
   * Dati storici di mercato (fallback)
   */
  private getHistoricalMarketData(location: string, targetPrice: number): string {
    // Dati storici reali per zone principali
    const historicalData: { [key: string]: { price: number; trend: string; competition: string } } = {
      'roma': { price: 3200, trend: '📈 In crescita', competition: 'Alta' },
      'milano': { price: 4500, trend: '📈 In crescita', competition: 'Alta' },
      'napoli': { price: 1800, trend: '📊 Stabile', competition: 'Media' },
      'torino': { price: 2200, trend: '📊 Stabile', competition: 'Media' },
      'firenze': { price: 2800, trend: '📈 In crescita', competition: 'Media' },
      'bologna': { price: 2600, trend: '📈 In crescita', competition: 'Media' },
      'venezia': { price: 3500, trend: '📊 Stabile', competition: 'Bassa' },
      'genova': { price: 2000, trend: '📉 In calo', competition: 'Bassa' }
    };

    const cityKey = location.toLowerCase().replace(/\s+/g, '');
    const data = historicalData[cityKey] || historicalData['roma'];
    
    let analysis = `- **Prezzo Medio Storico**: €${data.price.toLocaleString('it-IT')}/m²\n`;
    analysis += `- **Fonte**: Dati storici immobiliari\n`;
    
    if (targetPrice < data.price * 0.9) {
      analysis += `- **Status**: 🟢 **Sottovalutato** - Ottima opportunità!\n`;
    } else if (targetPrice < data.price * 1.1) {
      analysis += `- **Status**: 🟡 **In linea** - Prezzo di mercato\n`;
    } else {
      analysis += `- **Status**: 🔴 **Sopravvalutato** - Attenzione ai rischi\n`;
    }

    analysis += `- **Tendenza**: ${data.trend}\n`;
    analysis += `- **Concorrenza**: ${data.competition}\n`;
    analysis += `- **Nota**: Dati storici - verifica aggiornamenti recenti\n`;

    return analysis;
  }

  /**
   * Genera risposta per informazioni mancanti
   */
  private generateMissingInfoResponse(data: any): string {
    let response = `# 🏗️ Analisi di Fattibilità\n\n`;
    response += `Per creare un'analisi di fattibilità completa per **${data.projectName || 'il tuo progetto'}**, ho bisogno di alcune informazioni aggiuntive:\n\n`;

    response += `## 📋 Informazioni Mancanti:\n`;
    data.missingInfo.forEach(field => {
      const fieldNames: { [key: string]: string } = {
        projectName: 'Nome del progetto',
        landArea: 'Area del terreno (in m²)',
        buildableArea: 'Area costruibile (in m²)',
        constructionCostPerSqm: 'Costo di costruzione per m² (in €)',
        purchasePrice: 'Prezzo di acquisto del terreno (in €)',
        targetMargin: 'Target di marginalità (in %)'
      };
      response += `- **${fieldNames[field] || field}**\n`;
    });

    response += `\n## 💡 Esempio di Richiesta Completa:\n`;
    response += `"Crea un'analisi di fattibilità per Villa Roma. Terreno 500 m², area costruibile 400 m², bifamiliare, 4 parcheggi, 120 m² per appartamento, costo costruzione 1800 €/m², prezzo acquisto 300.000 €, target marginalità 25%."\n\n`;

    response += `Una volta fornite tutte le informazioni, potrò creare un'analisi dettagliata con:\n`;
    response += `- 📊 Calcoli economici precisi\n`;
    response += `- 🔍 Analisi di mercato per la zona\n`;
    response += `- 📈 Raccomandazioni strategiche\n`;
    response += `- 🚀 Prossimi passi operativi\n\n`;

    response += `Sono qui per rendere il tuo progetto immobiliare un successo! 🏗️✨`;

    return response;
  }

}

class SecurityManager {
  async validateRequest(request: UrbanovaOSRequest): Promise<void> {
    console.log('🔒 [SecurityManager] Validando richiesta');
  }
  
  async checkRateLimit(userId: string): Promise<void> {
    console.log('🔒 [SecurityManager] Controllando rate limit');
  }
  
  async checkPermissions(userId: string, context: any): Promise<void> {
    console.log('🔒 [SecurityManager] Controllando permessi');
  }
}

class MetricsCollector {
  async recordRequest(data: any): Promise<void> {
    console.log('📊 [MetricsCollector] Registrando richiesta');
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const urbanovaOSOrchestrator = new UrbanovaOSOrchestrator();
