// 🛡️ SOFIA 2.0 - INTELLIGENT FALLBACK SYSTEM
// Sistema di fallback intelligente per Urbanova

import { ConversationMemory } from './sofiaMemorySystem';
import { UniversalResponse } from './sofiaResponseSystem';
import { MultiIntentAnalysis } from './sofiaMultiIntentProcessor';
import { PersonalizedResponse } from './sofiaPersonalitySystem';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface FallbackContext {
  errorType: FallbackErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  recoveryStrategy: RecoveryStrategy;
  learningOpportunity: LearningOpportunity;
}

export interface FallbackErrorType {
  category: 'system' | 'user_input' | 'tool_failure' | 'context_mismatch' | 'timeout' | 'unknown';
  subcategory: string;
  description: string;
  technicalDetails: any;
  userFacingMessage: string;
}

export interface RecoveryStrategy {
  strategy: 'graceful_degradation' | 'alternative_approach' | 'user_guidance' | 'escalation' | 'retry';
  steps: RecoveryStep[];
  estimatedTime: string;
  successProbability: number;
  userCommunication: string;
}

export interface RecoveryStep {
  step: string;
  action: string;
  parameters: any;
  fallback: string;
  successCriteria: string;
}

export interface LearningOpportunity {
  errorPattern: string;
  preventionStrategy: string;
  systemImprovement: string;
  userEducation: string;
  confidence: number;
}

export interface FallbackResponse {
  response: string;
  fallbackType: 'graceful' | 'alternative' | 'guidance' | 'escalation';
  recoveryActions: string[];
  userGuidance: string;
  systemStatus: 'recovering' | 'degraded' | 'normal' | 'escalated';
  learningApplied: boolean;
  confidence: number;
}

export interface FallbackMetrics {
  totalFallbacks: number;
  successRate: number;
  averageRecoveryTime: string;
  userSatisfaction: number;
  learningEffectiveness: number;
  systemReliability: number;
}

// ============================================================================
// SOFIA FALLBACK SYSTEM CLASS
// ============================================================================

export class SofiaFallbackSystem {
  private fallbackHistory: FallbackContext[] = [];
  private learningPatterns: Map<string, LearningPattern> = new Map();
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private metrics: FallbackMetrics;

  constructor() {
    this.initializeRecoveryStrategies();
    this.initializeLearningPatterns();
    this.metrics = this.initializeMetrics();
    console.log('🛡️ [SofiaFallbackSystem] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Gestisce fallback intelligente
   */
  async handleIntelligentFallback(
    error: any,
    context: {
      memory: ConversationMemory;
      intentAnalysis: MultiIntentAnalysis;
      userMessage: ChatMessage;
      systemState: any;
    }
  ): Promise<FallbackResponse> {
    console.log('🛡️ [SofiaFallback] Gestendo fallback intelligente');

    try {
      // 1. Analizza errore e contesto
      const fallbackContext = await this.analyzeErrorAndContext(error, context);
      
      // 2. Seleziona strategia di recovery
      const recoveryStrategy = await this.selectRecoveryStrategy(fallbackContext, context);
      
      // 3. Genera risposta di fallback
      const fallbackResponse = await this.generateFallbackResponse(
        fallbackContext,
        recoveryStrategy,
        context
      );
      
      // 4. Applica apprendimento
      const learningApplied = await this.applyLearning(fallbackContext, recoveryStrategy);
      
      // 5. Aggiorna metriche
      this.updateMetrics(fallbackContext, recoveryStrategy, learningApplied);
      
      // 6. Salva nel history
      this.fallbackHistory.push(fallbackContext);

      const response: FallbackResponse = {
        response: fallbackResponse.response,
        fallbackType: fallbackResponse.fallbackType,
        recoveryActions: fallbackResponse.recoveryActions,
        userGuidance: fallbackResponse.userGuidance,
        systemStatus: fallbackResponse.systemStatus,
        learningApplied,
        confidence: fallbackResponse.confidence
      };

      console.log('✅ [SofiaFallback] Fallback gestito:', {
        errorType: fallbackContext.errorType.category,
        strategy: recoveryStrategy.strategy,
        learningApplied,
        confidence: response.confidence
      });

      return response;

    } catch (error) {
      console.error('❌ [SofiaFallback] Errore gestione fallback:', error);
      return this.generateEmergencyFallback(error, context);
    }
  }

  /**
   * 🎯 Prevenzione proattiva errori
   */
  async preventErrors(
    context: {
      memory: ConversationMemory;
      intentAnalysis: MultiIntentAnalysis;
      userMessage: ChatMessage;
    }
  ): Promise<PreventionResult> {
    console.log('🛡️ [SofiaFallback] Prevenzione proattiva errori');

    try {
      // 1. Identifica potenziali problemi
      const potentialIssues = await this.identifyPotentialIssues(context);
      
      // 2. Valuta rischi
      const riskAssessment = await this.assessRisks(potentialIssues, context);
      
      // 3. Applica prevenzioni
      const preventions = await this.applyPreventions(riskAssessment, context);
      
      // 4. Genera avvisi proattivi
      const proactiveWarnings = await this.generateProactiveWarnings(preventions, context);

      const result: PreventionResult = {
        issuesIdentified: potentialIssues.length,
        risksMitigated: riskAssessment.filtered.length,
        preventionsApplied: preventions.length,
        proactiveWarnings,
        confidence: this.calculatePreventionConfidence(preventions),
        systemReliability: this.calculateSystemReliability()
      };

      console.log('✅ [SofiaFallback] Prevenzione completata:', {
        issues: result.issuesIdentified,
        risks: result.risksMitigated,
        preventions: result.preventionsApplied
      });

      return result;

    } catch (error) {
      console.error('❌ [SofiaFallback] Errore prevenzione:', error);
      return this.generateFallbackPreventionResult();
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Analizza errore e contesto
   */
  private async analyzeErrorAndContext(
    error: any,
    context: any
  ): Promise<FallbackContext> {
    const errorType = this.categorizeError(error);
    const severity = this.assessSeverity(error, context);
    const userImpact = this.assessUserImpact(error, context);
    const recoveryStrategy = this.selectRecoveryStrategy(errorType, severity, context);
    const learningOpportunity = this.identifyLearningOpportunity(error, context);

    return {
      errorType,
      severity,
      userImpact,
      recoveryStrategy,
      learningOpportunity
    };
  }

  /**
   * Categorizza errore
   */
  private categorizeError(error: any): FallbackErrorType {
    const errorMessage = error.message || error.toString();
    
    // Categorizza basato su pattern di errore
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      return {
        category: 'timeout',
        subcategory: 'network_timeout',
        description: 'Network or service timeout',
        technicalDetails: error,
        userFacingMessage: 'Il servizio sta rispondendo lentamente'
      };
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return {
        category: 'system',
        subcategory: 'permission_denied',
        description: 'Permission or authorization error',
        technicalDetails: error,
        userFacingMessage: 'Problema di autorizzazione'
      };
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return {
        category: 'system',
        subcategory: 'resource_not_found',
        description: 'Resource not found',
        technicalDetails: error,
        userFacingMessage: 'Risorsa non trovata'
      };
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return {
        category: 'user_input',
        subcategory: 'validation_error',
        description: 'User input validation error',
        technicalDetails: error,
        userFacingMessage: 'Input non valido'
      };
    }
    
    if (errorMessage.includes('tool') || errorMessage.includes('capability')) {
      return {
        category: 'tool_failure',
        subcategory: 'tool_unavailable',
        description: 'Tool or capability failure',
        technicalDetails: error,
        userFacingMessage: 'Strumento temporaneamente non disponibile'
      };
    }
    
    // Default: errore sconosciuto
    return {
      category: 'unknown',
      subcategory: 'unclassified',
      description: 'Unclassified error',
      technicalDetails: error,
      userFacingMessage: 'Si è verificato un problema tecnico'
    };
  }

  /**
   * Valuta severità errore
   */
  private assessSeverity(error: any, context: any): 'low' | 'medium' | 'high' | 'critical' {
    const errorType = this.categorizeError(error);
    
    // Severità basata su categoria
    const severityMap: Record<string, string> = {
      'timeout': 'medium',
      'permission_denied': 'high',
      'resource_not_found': 'medium',
      'validation_error': 'low',
      'tool_unavailable': 'medium',
      'unclassified': 'high'
    };
    
    // Aggiusta basato su contesto
    if (context.intentAnalysis?.complexity === 'multi_domain') {
      return 'high';
    }
    
    if (context.memory?.conversationContext?.currentContext?.mood === 'urgent') {
      return 'high';
    }
    
    return severityMap[errorType.subcategory] as any || 'medium';
  }

  /**
   * Valuta impatto utente
   */
  private assessUserImpact(error: any, context: any): 'minimal' | 'moderate' | 'significant' | 'severe' {
    const severity = this.assessSeverity(error, context);
    const conversationPhase = context.memory?.conversationContext?.currentContext?.topic;
    
    // Impatto basato su severità e fase conversazione
    if (severity === 'critical') {
      return 'severe';
    }
    
    if (severity === 'high' && conversationPhase === 'action') {
      return 'significant';
    }
    
    if (severity === 'medium') {
      return 'moderate';
    }
    
    return 'minimal';
  }

  /**
   * Seleziona strategia di recovery
   */
  private selectRecoveryStrategy(
    errorType: FallbackErrorType,
    severity: string,
    context: any
  ): RecoveryStrategy {
    const strategyKey = `${errorType.category}_${severity}`;
    const strategy = this.recoveryStrategies.get(strategyKey);
    
    if (strategy) {
      return strategy;
    }
    
    // Strategia di default
    return {
      strategy: 'graceful_degradation',
      steps: [
        {
          step: 'acknowledge_error',
          action: 'Acknowledge the error to user',
          parameters: { errorType: errorType.userFacingMessage },
          fallback: 'Generic error message',
          successCriteria: 'User understands there was an issue'
        },
        {
          step: 'provide_alternative',
          action: 'Offer alternative approach',
          parameters: { context },
          fallback: 'Suggest manual approach',
          successCriteria: 'User has alternative option'
        }
      ],
      estimatedTime: '30 secondi',
      successProbability: 0.7,
      userCommunication: 'Ti offro un approccio alternativo'
    };
  }

  /**
   * Genera risposta di fallback
   */
  private async generateFallbackResponse(
    fallbackContext: FallbackContext,
    recoveryStrategy: RecoveryStrategy,
    context: any
  ): Promise<FallbackResponse> {
    let response = '';
    let fallbackType: 'graceful' | 'alternative' | 'guidance' | 'escalation' = 'graceful';
    let systemStatus: 'recovering' | 'degraded' | 'normal' | 'escalated' = 'recovering';
    
    // Genera risposta basata su strategia
    switch (recoveryStrategy.strategy) {
      case 'graceful_degradation':
        response = this.generateGracefulDegradationResponse(fallbackContext, context);
        fallbackType = 'graceful';
        systemStatus = 'degraded';
        break;
        
      case 'alternative_approach':
        response = this.generateAlternativeApproachResponse(fallbackContext, context);
        fallbackType = 'alternative';
        systemStatus = 'recovering';
        break;
        
      case 'user_guidance':
        response = this.generateUserGuidanceResponse(fallbackContext, context);
        fallbackType = 'guidance';
        systemStatus = 'recovering';
        break;
        
      case 'escalation':
        response = this.generateEscalationResponse(fallbackContext, context);
        fallbackType = 'escalation';
        systemStatus = 'escalated';
        break;
        
      case 'retry':
        response = this.generateRetryResponse(fallbackContext, context);
        fallbackType = 'graceful';
        systemStatus = 'recovering';
        break;
    }
    
    const recoveryActions = recoveryStrategy.steps.map(step => step.action);
    const userGuidance = recoveryStrategy.userCommunication;
    const confidence = recoveryStrategy.successProbability;
    
    return {
      response,
      fallbackType,
      recoveryActions,
      userGuidance,
      systemStatus,
      learningApplied: false,
      confidence
    };
  }

  /**
   * Genera risposta graceful degradation
   */
  private generateGracefulDegradationResponse(
    fallbackContext: FallbackContext,
    context: any
  ): string {
    const errorMessage = fallbackContext.errorType.userFacingMessage;
    
    return `Mi dispiace, ${errorMessage.toLowerCase()}. 
    
Tuttavia, posso comunque aiutarti in altri modi:
• Posso fornirti informazioni generali sul tuo settore
• Posso guidarti attraverso processi alternativi
• Posso rispondere alle tue domande su progetti esistenti

Come preferisci procedere?`;
  }

  /**
   * Genera risposta approccio alternativo
   */
  private generateAlternativeApproachResponse(
    fallbackContext: FallbackContext,
    context: any
  ): string {
    return `Ho riscontrato un problema tecnico, ma ho un approccio alternativo per te.

Invece di utilizzare lo strumento automatico, posso:
• Guidarti passo dopo passo nel processo manuale
• Fornirti template e checklist
• Condividere best practices e esempi

Questo approccio potrebbe essere anche più educativo. Vuoi che proceda così?`;
  }

  /**
   * Genera risposta guida utente
   */
  private generateUserGuidanceResponse(
    fallbackContext: FallbackContext,
    context: any
  ): string {
    return `Sembra che ci sia stato un problema tecnico. Ti guido io personalmente:

1. Prima di tutto, dimmi esattamente cosa stai cercando di fare
2. Ti fornirò istruzioni dettagliate passo dopo passo
3. Sarò qui per rispondere a ogni tua domanda

Iniziamo: qual è il tuo obiettivo principale?`;
  }

  /**
   * Genera risposta escalation
   */
  private generateEscalationResponse(
    fallbackContext: FallbackContext,
    context: any
  ): string {
    return `Ho riscontrato un problema tecnico che richiede attenzione specializzata.

Ho già:
• Registrato il problema per il team tecnico
• Salvato il contesto della nostra conversazione
• Preparato un report dettagliato

Nel frattempo, posso:
• Rispondere alle tue domande generali
• Fornirti risorse e documentazione
• Programmare un follow-up quando il problema sarà risolto

Vuoi che ti contatti non appena avremo una soluzione?`;
  }

  /**
   * Genera risposta retry
   */
  private generateRetryResponse(
    fallbackContext: FallbackContext,
    context: any
  ): string {
    return `Ho riscontrato un problema temporaneo. Proviamo di nuovo:

🔄 Riprovo automaticamente...
⏱️ Questo potrebbe richiedere qualche secondo in più
💡 Se il problema persiste, ti offrirò un approccio alternativo

Per favore, aspetta un momento...`;
  }

  /**
   * Identifica opportunità di apprendimento
   */
  private identifyLearningOpportunity(
    error: any,
    context: any
  ): LearningOpportunity {
    const errorPattern = this.categorizeError(error).category;
    
    return {
      errorPattern,
      preventionStrategy: this.generatePreventionStrategy(errorPattern),
      systemImprovement: this.generateSystemImprovement(errorPattern),
      userEducation: this.generateUserEducation(errorPattern),
      confidence: 0.7
    };
  }

  /**
   * Applica apprendimento
   */
  private async applyLearning(
    fallbackContext: FallbackContext,
    recoveryStrategy: RecoveryStrategy
  ): Promise<boolean> {
    try {
      const pattern = fallbackContext.learningOpportunity.errorPattern;
      const existingPattern = this.learningPatterns.get(pattern);
      
      if (existingPattern) {
        // Aggiorna pattern esistente
        existingPattern.frequency++;
        existingPattern.lastOccurrence = new Date();
        existingPattern.successRate = (existingPattern.successRate + recoveryStrategy.successProbability) / 2;
      } else {
        // Crea nuovo pattern
        this.learningPatterns.set(pattern, {
          pattern,
          frequency: 1,
          firstOccurrence: new Date(),
          lastOccurrence: new Date(),
          successRate: recoveryStrategy.successProbability,
          preventionStrategies: [fallbackContext.learningOpportunity.preventionStrategy],
          systemImprovements: [fallbackContext.learningOpportunity.systemImprovement]
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ [SofiaFallback] Errore applicazione apprendimento:', error);
      return false;
    }
  }

  /**
   * Aggiorna metriche
   */
  private updateMetrics(
    fallbackContext: FallbackContext,
    recoveryStrategy: RecoveryStrategy,
    learningApplied: boolean
  ): void {
    this.metrics.totalFallbacks++;
    
    // Aggiorna success rate
    const currentSuccessRate = this.metrics.successRate;
    const newSuccessRate = (currentSuccessRate + recoveryStrategy.successProbability) / 2;
    this.metrics.successRate = newSuccessRate;
    
    // Aggiorna user satisfaction (stima)
    if (recoveryStrategy.successProbability > 0.8) {
      this.metrics.userSatisfaction = Math.min(1.0, this.metrics.userSatisfaction + 0.1);
    }
    
    // Aggiorna learning effectiveness
    if (learningApplied) {
      this.metrics.learningEffectiveness = Math.min(1.0, this.metrics.learningEffectiveness + 0.05);
    }
    
    // Aggiorna system reliability
    this.metrics.systemReliability = this.calculateSystemReliability();
  }

  /**
   * Identifica potenziali problemi
   */
  private async identifyPotentialIssues(context: any): Promise<any[]> {
    const issues: any[] = [];
    
    // Controlla complessità intent
    if (context.intentAnalysis?.complexity === 'multi_domain') {
      issues.push({
        type: 'complexity_risk',
        description: 'Multi-domain intent may cause system overload',
        probability: 0.3,
        impact: 'medium'
      });
    }
    
    // Controlla disponibilità tool
    if (context.intentAnalysis?.primaryIntent?.dependencies?.length > 0) {
      issues.push({
        type: 'dependency_risk',
        description: 'Intent has dependencies that may not be available',
        probability: 0.2,
        impact: 'high'
      });
    }
    
    // Controlla contesto utente
    if (context.memory?.conversationContext?.currentContext?.mood === 'urgent') {
      issues.push({
        type: 'urgency_risk',
        description: 'User urgency may cause timeout issues',
        probability: 0.4,
        impact: 'medium'
      });
    }
    
    return issues;
  }

  /**
   * Valuta rischi
   */
  private async assessRisks(issues: any[], context: any): Promise<any> {
    const filtered = issues.filter(issue => 
      issue.probability > 0.3 && issue.impact !== 'low'
    );
    
    return {
      total: issues.length,
      filtered: filtered.length,
      highRisk: filtered.filter(issue => issue.impact === 'high').length,
      mediumRisk: filtered.filter(issue => issue.impact === 'medium').length
    };
  }

  /**
   * Applica prevenzioni
   */
  private async applyPreventions(riskAssessment: any, context: any): Promise<any[]> {
    const preventions: any[] = [];
    
    if (riskAssessment.highRisk > 0) {
      preventions.push({
        type: 'resource_allocation',
        description: 'Allocate additional resources for high-risk operations',
        applied: true
      });
    }
    
    if (riskAssessment.mediumRisk > 0) {
      preventions.push({
        type: 'timeout_extension',
        description: 'Extend timeout for medium-risk operations',
        applied: true
      });
    }
    
    return preventions;
  }

  /**
   * Genera avvisi proattivi
   */
  private async generateProactiveWarnings(preventions: any[], context: any): Promise<string[]> {
    const warnings: string[] = [];
    
    if (preventions.some(p => p.type === 'resource_allocation')) {
      warnings.push('⚠️ Operazione complessa rilevata - allocando risorse aggiuntive');
    }
    
    if (preventions.some(p => p.type === 'timeout_extension')) {
      warnings.push('⏱️ Estendendo timeout per operazione complessa');
    }
    
    return warnings;
  }

  // ============================================================================
  // METODI DI INIZIALIZZAZIONE
  // ============================================================================

  private initializeRecoveryStrategies(): void {
    // Strategie per timeout
    this.recoveryStrategies.set('timeout_medium', {
      strategy: 'retry',
      steps: [
        {
          step: 'retry_with_backoff',
          action: 'Retry with exponential backoff',
          parameters: { maxRetries: 3, backoffMs: 1000 },
          fallback: 'graceful_degradation',
          successCriteria: 'Operation completes successfully'
        }
      ],
      estimatedTime: '30 secondi',
      successProbability: 0.8,
      userCommunication: 'Riprovo automaticamente con una strategia diversa'
    });
    
    // Strategie per permission denied
    this.recoveryStrategies.set('system_high', {
      strategy: 'escalation',
      steps: [
        {
          step: 'log_error',
          action: 'Log error for technical team',
          parameters: { error: 'permission_denied' },
          fallback: 'user_guidance',
          successCriteria: 'Error logged successfully'
        },
        {
          step: 'provide_alternative',
          action: 'Provide alternative approach',
          parameters: { context: 'user_needs' },
          fallback: 'manual_process',
          successCriteria: 'User has alternative option'
        }
      ],
      estimatedTime: '2 minuti',
      successProbability: 0.9,
      userCommunication: 'Ho registrato il problema e ti offro un approccio alternativo'
    });
    
    // Strategie per validation error
    this.recoveryStrategies.set('user_input_low', {
      strategy: 'user_guidance',
      steps: [
        {
          step: 'clarify_input',
          action: 'Ask user to clarify input',
          parameters: { validation_rules: 'required_fields' },
          fallback: 'provide_examples',
          successCriteria: 'User provides valid input'
        }
      ],
      estimatedTime: '1 minuto',
      successProbability: 0.9,
      userCommunication: 'Ti aiuto a fornire le informazioni corrette'
    });
  }

  private initializeLearningPatterns(): void {
    // Pattern di apprendimento iniziali
    this.learningPatterns.set('timeout', {
      pattern: 'timeout',
      frequency: 0,
      firstOccurrence: new Date(),
      lastOccurrence: new Date(),
      successRate: 0.8,
      preventionStrategies: ['increase_timeout', 'optimize_queries'],
      systemImprovements: ['connection_pooling', 'query_optimization']
    });
  }

  private initializeMetrics(): FallbackMetrics {
    return {
      totalFallbacks: 0,
      successRate: 0.8,
      averageRecoveryTime: '1 minuto',
      userSatisfaction: 0.8,
      learningEffectiveness: 0.7,
      systemReliability: 0.9
    };
  }

  // ============================================================================
  // METODI DI CALCOLO
  // ============================================================================

  private calculatePreventionConfidence(preventions: any[]): number {
    if (preventions.length === 0) return 0.5;
    
    const appliedPreventions = preventions.filter(p => p.applied).length;
    return appliedPreventions / preventions.length;
  }

  private calculateSystemReliability(): number {
    const totalFallbacks = this.metrics.totalFallbacks;
    const successRate = this.metrics.successRate;
    
    if (totalFallbacks === 0) return 1.0;
    
    // Reliability diminuisce con fallbacks frequenti
    const fallbackPenalty = Math.min(0.3, totalFallbacks * 0.01);
    return Math.max(0.5, successRate - fallbackPenalty);
  }

  private generatePreventionStrategy(errorPattern: string): string {
    const strategies: Record<string, string> = {
      'timeout': 'Implementare timeout più lunghi e retry automatici',
      'permission_denied': 'Migliorare gestione autorizzazioni e fallback',
      'validation_error': 'Migliorare validazione input e messaggi di errore',
      'tool_failure': 'Implementare tool alternativi e graceful degradation'
    };
    
    return strategies[errorPattern] || 'Migliorare gestione errori generici';
  }

  private generateSystemImprovement(errorPattern: string): string {
    const improvements: Record<string, string> = {
      'timeout': 'Ottimizzare query e implementare connection pooling',
      'permission_denied': 'Migliorare sistema di autorizzazioni',
      'validation_error': 'Migliorare validazione lato client e server',
      'tool_failure': 'Implementare health checks e monitoring'
    };
    
    return improvements[errorPattern] || 'Migliorare monitoring e logging';
  }

  private generateUserEducation(errorPattern: string): string {
    const education: Record<string, string> = {
      'timeout': 'Educare utenti su operazioni che richiedono più tempo',
      'permission_denied': 'Spiegare sistema di autorizzazioni',
      'validation_error': 'Fornire esempi di input validi',
      'tool_failure': 'Spiegare alternative disponibili'
    };
    
    return education[errorPattern] || 'Fornire guida generale all\'uso del sistema';
  }

  private generateEmergencyFallback(error: any, context: any): FallbackResponse {
    return {
      response: 'Mi dispiace, ho riscontrato un problema tecnico. Il team è stato notificato. Nel frattempo, puoi contattarmi per assistenza diretta.',
      fallbackType: 'escalation',
      recoveryActions: ['notify_technical_team', 'log_error', 'provide_manual_support'],
      userGuidance: 'Contatta il supporto tecnico per assistenza immediata',
      systemStatus: 'escalated',
      learningApplied: false,
      confidence: 0.3
    };
  }

  private generateFallbackPreventionResult(): PreventionResult {
    return {
      issuesIdentified: 0,
      risksMitigated: 0,
      preventionsApplied: 0,
      proactiveWarnings: [],
      confidence: 0.5,
      systemReliability: 0.8
    };
  }
}

// ============================================================================
// INTERFACCE DI SUPPORTO
// ============================================================================

interface LearningPattern {
  pattern: string;
  frequency: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  successRate: number;
  preventionStrategies: string[];
  systemImprovements: string[];
}

interface PreventionResult {
  issuesIdentified: number;
  risksMitigated: number;
  preventionsApplied: number;
  proactiveWarnings: string[];
  confidence: number;
  systemReliability: number;
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const sofiaFallbackSystem = new SofiaFallbackSystem();
