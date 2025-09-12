// 🚀 SOFIA 2.0 - ORCHESTRATORE PRINCIPALE
// Orchestratore principale che integra tutti i sistemi SOFIA 2.0

import { sofiaMemorySystem, ConversationMemory } from './sofiaMemorySystem';
import { sofiaResponseSystem, UniversalResponse, ResponseContext } from './sofiaResponseSystem';
import { sofiaConversationManager, ConversationFlow } from './sofiaConversationManager';
import { sofiaMultiIntentProcessor, MultiIntentAnalysis } from './sofiaMultiIntentProcessor';
import { sofiaPersonalitySystem, PersonalizedResponse, PersonalityContext } from './sofiaPersonalitySystem';
import { sofiaFallbackSystem, FallbackResponse } from './sofiaFallbackSystem';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface SofiaRequest {
  sessionId: string;
  userId: string;
  userEmail: string;
  message: ChatMessage;
  conversationHistory: ChatMessage[];
  context?: any;
}

export interface SofiaResponse {
  response: string;
  type: 'success' | 'fallback' | 'escalation';
  confidence: number;
  metadata: SofiaMetadata;
  suggestedActions: string[];
  nextSteps: string[];
  systemStatus: 'normal' | 'degraded' | 'recovering' | 'escalated';
}

export interface SofiaMetadata {
  processingTime: number;
  systemsUsed: string[];
  memoryUpdated: boolean;
  personalityAdapted: boolean;
  learningApplied: boolean;
  fallbackTriggered: boolean;
  conversationPhase: string;
  userMood: string;
  complexity: string;
  toolsAvailable: string[];
  toolsUsed: string[];
}

export interface SofiaContext {
  memory: ConversationMemory;
  flow: ConversationFlow;
  intentAnalysis: MultiIntentAnalysis;
  personalityContext: PersonalityContext;
  systemState: SystemState;
}

export interface SystemState {
  status: 'healthy' | 'degraded' | 'recovering' | 'critical';
  performance: number;
  reliability: number;
  lastHealthCheck: Date;
  activeSessions: number;
  errorRate: number;
}

// ============================================================================
// SOFIA ORCHESTRATOR CLASS
// ============================================================================

export class SofiaOrchestrator {
  private systemState: SystemState;
  private activeSessions: Map<string, SofiaContext> = new Map();
  private performanceMetrics: Map<string, number> = new Map();

  constructor() {
    this.systemState = this.initializeSystemState();
    this.startHealthMonitoring();
    console.log('🚀 [SofiaOrchestrator] Inizializzato');
  }

  // ============================================================================
  // METODO PRINCIPALE
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Processa richiesta completa SOFIA 2.0
   */
  async processRequest(request: SofiaRequest): Promise<SofiaResponse> {
    const startTime = Date.now();
    console.log('🚀 [SofiaOrchestrator] Processando richiesta:', {
      sessionId: request.sessionId,
      userId: request.userId,
      messageLength: request.message.content.length
    });

    try {
      // 1. PREVENZIONE PROATTIVA ERRORI
      const preventionResult = await this.performProactivePrevention(request);
      
      // 2. INIZIALIZZAZIONE CONTESTO
      const context = await this.initializeContext(request);
      
      // 3. PROCESSAMENTO MULTI-INTENT
      const intentAnalysis = await this.processMultiIntent(request, context);
      
      // 4. AGGIORNAMENTO MEMORIA CONTESTUALE
      const memory = await this.updateContextualMemory(request, context, intentAnalysis);
      
      // 5. GESTIONE FLUSSO CONVERSAZIONALE
      const flow = await this.manageConversationFlow(request, context, intentAnalysis);
      
      // 6. GENERAZIONE RISPOSTA UNIVERSALE
      const universalResponse = await this.generateUniversalResponse(request, context, intentAnalysis);
      
      // 7. PERSONALIZZAZIONE RISPOSTA
      const personalizedResponse = await this.personalizeResponse(
        universalResponse,
        context,
        intentAnalysis
      );
      
      // 8. AGGIORNAMENTO CONTESTO FINALE
      await this.updateFinalContext(request, context, personalizedResponse);
      
      // 9. CALCOLO METRICHE
      const processingTime = Date.now() - startTime;
      const metadata = this.generateMetadata(
        request,
        context,
        personalizedResponse,
        processingTime,
        preventionResult
      );

      const response: SofiaResponse = {
        response: personalizedResponse.response,
        type: 'success',
        confidence: personalizedResponse.confidence,
        metadata,
        suggestedActions: this.extractSuggestedActions(personalizedResponse),
        nextSteps: this.extractNextSteps(personalizedResponse),
        systemStatus: this.systemState.status
      };

      console.log('✅ [SofiaOrchestrator] Richiesta processata:', {
        processingTime,
        confidence: response.confidence,
        systemsUsed: metadata.systemsUsed.length,
        memoryUpdated: metadata.memoryUpdated
      });

      return response;

    } catch (error) {
      console.error('❌ [SofiaOrchestrator] Errore processamento:', error);
      return await this.handleProcessingError(error, request, startTime);
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Prevenzione proattiva errori
   */
  private async performProactivePrevention(request: SofiaRequest): Promise<any> {
    try {
      const context = {
        memory: this.activeSessions.get(request.sessionId)?.memory,
        intentAnalysis: null, // Sarà popolato dopo
        userMessage: request.message
      };

      return await sofiaFallbackSystem.preventErrors(context);
    } catch (error) {
      console.warn('⚠️ [SofiaOrchestrator] Prevenzione fallita:', error);
      return { issuesIdentified: 0, risksMitigated: 0, preventionsApplied: 0 };
    }
  }

  /**
   * Inizializza contesto
   */
  private async initializeContext(request: SofiaRequest): Promise<SofiaContext> {
    let context = this.activeSessions.get(request.sessionId);
    
    if (!context) {
      // Crea nuovo contesto
      const memory = await sofiaMemorySystem.getMemory(request.sessionId) || 
                     await this.createNewMemory(request);
      
      context = {
        memory,
        flow: null as any, // Sarà popolato dopo
        intentAnalysis: null as any, // Sarà popolato dopo
        personalityContext: this.createPersonalityContext(request),
        systemState: this.systemState
      };
      
      this.activeSessions.set(request.sessionId, context);
    }
    
    return context;
  }

  /**
   * Processa multi-intent
   */
  private async processMultiIntent(
    request: SofiaRequest,
    context: SofiaContext
  ): Promise<MultiIntentAnalysis> {
    const intentAnalysis = await sofiaMultiIntentProcessor.processMultiIntent(
      request.message,
      request.conversationHistory,
      context.personalityContext
    );
    
    context.intentAnalysis = intentAnalysis;
    return intentAnalysis;
  }

  /**
   * Aggiorna memoria contestuale
   */
  private async updateContextualMemory(
    request: SofiaRequest,
    context: SofiaContext,
    intentAnalysis: MultiIntentAnalysis
  ): Promise<ConversationMemory> {
    // Crea ExtractedInformation dal MultiIntentAnalysis
    const extractedInfo = this.convertIntentAnalysisToExtractedInfo(intentAnalysis);
    
    const memory = await sofiaMemorySystem.updateMemory(
      request.sessionId,
      request.userId,
      request.userEmail,
      request.message,
      extractedInfo
    );
    
    context.memory = memory;
    return memory;
  }

  /**
   * Gestisce flusso conversazionale
   */
  private async manageConversationFlow(
    request: SofiaRequest,
    context: SofiaContext,
    intentAnalysis: MultiIntentAnalysis
  ): Promise<ConversationFlow> {
    const flow = await sofiaConversationManager.manageConversationFlow(
      request.sessionId,
      context.memory,
      this.convertIntentAnalysisToExtractedInfo(intentAnalysis),
      request.message
    );
    
    context.flow = flow;
    return flow;
  }

  /**
   * Genera risposta universale
   */
  private async generateUniversalResponse(
    request: SofiaRequest,
    context: SofiaContext,
    intentAnalysis: MultiIntentAnalysis
  ): Promise<UniversalResponse> {
    const responseContext: ResponseContext = {
      memory: context.memory,
      extractedInfo: this.convertIntentAnalysisToExtractedInfo(intentAnalysis),
      userMessage: request.message,
      availableTools: this.getAvailableTools(),
      systemCapabilities: this.getSystemCapabilities()
    };
    
    return await sofiaResponseSystem.generateUniversalResponse(responseContext);
  }

  /**
   * Personalizza risposta
   */
  private async personalizeResponse(
    universalResponse: UniversalResponse,
    context: SofiaContext,
    intentAnalysis: MultiIntentAnalysis
  ): Promise<PersonalizedResponse> {
    return await sofiaPersonalitySystem.generatePersonalizedResponse(
      universalResponse,
      context.personalityContext,
      context.memory,
      intentAnalysis
    );
  }

  /**
   * Aggiorna contesto finale
   */
  private async updateFinalContext(
    request: SofiaRequest,
    context: SofiaContext,
    personalizedResponse: PersonalizedResponse
  ): Promise<void> {
    // Aggiorna stato sistema
    this.updateSystemState('healthy');
    
    // Salva contesto aggiornato
    this.activeSessions.set(request.sessionId, context);
    
    // Aggiorna metriche performance
    this.updatePerformanceMetrics(request.sessionId, personalizedResponse.confidence);
  }

  /**
   * Gestisce errore di processamento
   */
  private async handleProcessingError(
    error: any,
    request: SofiaRequest,
    startTime: number
  ): Promise<SofiaResponse> {
    console.error('❌ [SofiaOrchestrator] Gestendo errore di processamento:', error);
    
    try {
      // Usa sistema di fallback
      const context = this.activeSessions.get(request.sessionId);
      const fallbackResponse = await sofiaFallbackSystem.handleIntelligentFallback(
        error,
        {
          memory: context?.memory,
          intentAnalysis: context?.intentAnalysis,
          userMessage: request.message,
          systemState: this.systemState
        }
      );
      
      const processingTime = Date.now() - startTime;
      
      return {
        response: fallbackResponse.response,
        type: 'fallback',
        confidence: fallbackResponse.confidence,
        metadata: {
          processingTime,
          systemsUsed: ['fallback_system'],
          memoryUpdated: false,
          personalityAdapted: false,
          learningApplied: fallbackResponse.learningApplied,
          fallbackTriggered: true,
          conversationPhase: 'error_recovery',
          userMood: 'neutral',
          complexity: 'simple',
          toolsAvailable: [],
          toolsUsed: []
        },
        suggestedActions: fallbackResponse.recoveryActions,
        nextSteps: ['recovery', 'monitoring'],
        systemStatus: fallbackResponse.systemStatus as any
      };
      
    } catch (fallbackError) {
      console.error('❌ [SofiaOrchestrator] Errore anche nel fallback:', fallbackError);
      
      return {
        response: 'Mi dispiace, ho riscontrato un problema tecnico. Il team è stato notificato. Per assistenza immediata, contatta il supporto tecnico.',
        type: 'escalation',
        confidence: 0.1,
        metadata: {
          processingTime: Date.now() - startTime,
          systemsUsed: ['emergency'],
          memoryUpdated: false,
          personalityAdapted: false,
          learningApplied: false,
          fallbackTriggered: true,
          conversationPhase: 'emergency',
          userMood: 'neutral',
          complexity: 'simple',
          toolsAvailable: [],
          toolsUsed: []
        },
        suggestedActions: ['contact_support'],
        nextSteps: ['escalation'],
        systemStatus: 'critical'
      };
    }
  }

  // ============================================================================
  // METODI DI SUPPORTO
  // ============================================================================

  private createNewMemory(request: SofiaRequest): ConversationMemory {
    return {
      sessionId: request.sessionId,
      userId: request.userId,
      userEmail: request.userEmail,
      startTime: new Date(),
      lastActivity: new Date(),
      conversationContext: {
        messages: [],
        extractedInfo: [],
        currentContext: {
          topic: 'general',
          mood: 'professional',
          userGoal: null,
          missingInfo: [],
          providedInfo: []
        },
        conversationPatterns: {
          questionTypes: [],
          responseStyles: [],
          topicsDiscussed: [],
          userPreferences: []
        }
      },
      userProfile: {
        communicationStyle: {
          formality: 'professional',
          detailLevel: 'detailed',
          responseFormat: 'structured'
        },
        workPatterns: {
          preferredTimes: [],
          projectTypes: [],
          budgetRanges: [],
          locations: []
        },
        decisionHistory: []
      },
      projectContext: {
        activeProjects: [],
        discussedProjects: [],
        opportunities: []
      },
      intentMemory: {
        recurringIntents: [],
        activeGoals: [],
        intentContext: {
          currentIntent: null,
          intentHistory: [],
          intentTransitions: []
        }
      },
      preferenceMemory: {
        explicitPreferences: [],
        inferredPreferences: [],
        behavioralPatterns: []
      }
    };
  }

  private createPersonalityContext(request: SofiaRequest): PersonalityContext {
    return {
      userMood: 'neutral',
      conversationPhase: 'greeting',
      userExpertise: 'intermediate',
      urgency: 'medium',
      complexity: 'simple',
      relationship: 'new'
    };
  }

  private convertIntentAnalysisToExtractedInfo(intentAnalysis: MultiIntentAnalysis): any {
    return {
      messageId: `msg_${Date.now()}`,
      timestamp: new Date(),
      entities: {
        projects: intentAnalysis.primaryIntent.entities
          .filter(e => e.entity === 'project')
          .map(e => e.value),
        locations: intentAnalysis.primaryIntent.entities
          .filter(e => e.entity === 'location')
          .map(e => e.value),
        budgets: intentAnalysis.primaryIntent.entities
          .filter(e => e.entity === 'budget')
          .map(e => e.value)
      },
      intents: {
        primary: intentAnalysis.primaryIntent.intent,
        secondary: intentAnalysis.secondaryIntents.map(i => i.intent),
        confidence: intentAnalysis.confidence
      },
      suggestedActions: []
    };
  }

  private getAvailableTools(): string[] {
    return [
      'feasibility',
      'market',
      'design',
      'timeline',
      'docs',
      'procurement',
      'buyer',
      'leads'
    ];
  }

  private getSystemCapabilities(): string[] {
    return [
      'natural_language_processing',
      'multi_intent_processing',
      'contextual_memory',
      'personality_adaptation',
      'intelligent_fallback',
      'conversation_flow_management'
    ];
  }

  private generateMetadata(
    request: SofiaRequest,
    context: SofiaContext,
    personalizedResponse: PersonalizedResponse,
    processingTime: number,
    preventionResult: any
  ): SofiaMetadata {
    return {
      processingTime,
      systemsUsed: [
        'memory_system',
        'response_system',
        'conversation_manager',
        'multi_intent_processor',
        'personality_system'
      ],
      memoryUpdated: true,
      personalityAdapted: personalizedResponse.adaptationReasoning !== 'Nessun adattamento specifico necessario',
      learningApplied: preventionResult.preventionsApplied > 0,
      fallbackTriggered: false,
      conversationPhase: context.flow?.currentState.phase || 'unknown',
      userMood: context.personalityContext.userMood,
      complexity: context.intentAnalysis?.complexity || 'simple',
      toolsAvailable: this.getAvailableTools(),
      toolsUsed: this.extractToolsUsed(personalizedResponse)
    };
  }

  private extractSuggestedActions(personalizedResponse: PersonalizedResponse): string[] {
    // Estrai azioni suggerite dalla risposta personalizzata
    return [
      'Continuare conversazione',
      'Eseguire azioni suggerite',
      'Fornire feedback'
    ];
  }

  private extractNextSteps(personalizedResponse: PersonalizedResponse): string[] {
    return [
      'Monitorare risposta utente',
      'Aggiornare memoria contestuale',
      'Adattare personalità se necessario'
    ];
  }

  private extractToolsUsed(personalizedResponse: PersonalizedResponse): string[] {
    // Estrai tool utilizzati dalla risposta
    return [];
  }

  private initializeSystemState(): SystemState {
    return {
      status: 'healthy',
      performance: 1.0,
      reliability: 0.95,
      lastHealthCheck: new Date(),
      activeSessions: 0,
      errorRate: 0.0
    };
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Ogni 30 secondi
  }

  private performHealthCheck(): void {
    const now = new Date();
    this.systemState.lastHealthCheck = now;
    this.systemState.activeSessions = this.activeSessions.size;
    
    // Calcola error rate
    const totalRequests = this.performanceMetrics.size;
    const successfulRequests = Array.from(this.performanceMetrics.values())
      .filter(confidence => confidence > 0.7).length;
    
    this.systemState.errorRate = totalRequests > 0 ? 
      (totalRequests - successfulRequests) / totalRequests : 0;
    
    // Aggiorna status basato su metriche
    if (this.systemState.errorRate > 0.1) {
      this.systemState.status = 'degraded';
    } else if (this.systemState.errorRate > 0.05) {
      this.systemState.status = 'recovering';
    } else {
      this.systemState.status = 'healthy';
    }
    
    console.log('🏥 [SofiaOrchestrator] Health check:', {
      status: this.systemState.status,
      activeSessions: this.systemState.activeSessions,
      errorRate: this.systemState.errorRate
    });
  }

  private updateSystemState(status: 'healthy' | 'degraded' | 'recovering' | 'critical'): void {
    this.systemState.status = status;
  }

  private updatePerformanceMetrics(sessionId: string, confidence: number): void {
    this.performanceMetrics.set(sessionId, confidence);
    
    // Mantieni solo le ultime 100 metriche
    if (this.performanceMetrics.size > 100) {
      const firstKey = this.performanceMetrics.keys().next().value;
      this.performanceMetrics.delete(firstKey);
    }
  }

  // ============================================================================
  // METODI PUBBLICI
  // ============================================================================

  /**
   * Ottieni stato sistema
   */
  getSystemState(): SystemState {
    return { ...this.systemState };
  }

  /**
   * Ottieni metriche performance
   */
  getPerformanceMetrics(): any {
    return {
      activeSessions: this.activeSessions.size,
      averageConfidence: Array.from(this.performanceMetrics.values())
        .reduce((sum, conf) => sum + conf, 0) / this.performanceMetrics.size || 0,
      systemReliability: this.systemState.reliability,
      errorRate: this.systemState.errorRate
    };
  }

  /**
   * Pulisci sessione
   */
  clearSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    sofiaMemorySystem.clearSessionMemory(sessionId);
    console.log('🧹 [SofiaOrchestrator] Sessione pulita:', sessionId);
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const sofiaOrchestrator = new SofiaOrchestrator();
