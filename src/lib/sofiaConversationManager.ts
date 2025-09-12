// 🔄 SOFIA 2.0 - DYNAMIC CONVERSATION FLOW
// Gestore di flusso conversazionale dinamico per Urbanova

import { ConversationMemory, ExtractedInformation } from './sofiaMemorySystem';
import { UniversalResponse, SuggestedAction } from './sofiaResponseSystem';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface ConversationFlow {
  currentState: ConversationState;
  flowHistory: FlowTransition[];
  activeGoals: ConversationGoal[];
  contextSwitches: ContextSwitch[];
  adaptiveStrategies: AdaptiveStrategy[];
}

export interface ConversationState {
  phase: 'greeting' | 'exploration' | 'action' | 'clarification' | 'completion' | 'follow_up';
  subPhase: string;
  confidence: number;
  userEngagement: 'low' | 'medium' | 'high';
  topicFocus: string;
  nextExpectedInput: ExpectedInput[];
}

export interface FlowTransition {
  from: ConversationState;
  to: ConversationState;
  trigger: string;
  timestamp: Date;
  reasoning: string;
  success: boolean;
}

export interface ConversationGoal {
  id: string;
  type: 'information_gathering' | 'task_execution' | 'problem_solving' | 'exploration';
  description: string;
  progress: number;
  requiredInfo: string[];
  gatheredInfo: string[];
  nextSteps: string[];
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
}

export interface ContextSwitch {
  fromTopic: string;
  toTopic: string;
  reason: 'user_request' | 'proactive_suggestion' | 'goal_completion' | 'interruption';
  timestamp: Date;
  smoothness: 'smooth' | 'abrupt' | 'confusing';
}

export interface AdaptiveStrategy {
  strategy: 'proactive_guidance' | 'reactive_support' | 'exploratory_assistance' | 'task_focus';
  parameters: any;
  effectiveness: number;
  usageCount: number;
}

export interface ExpectedInput {
  type: 'information' | 'confirmation' | 'choice' | 'question' | 'command';
  description: string;
  examples: string[];
  required: boolean;
  priority: 'high' | 'medium' | 'low';
}

// ============================================================================
// SOFIA CONVERSATION MANAGER CLASS
// ============================================================================

export class SofiaConversationManager {
  private flowStore: Map<string, ConversationFlow> = new Map();
  private adaptiveStrategies: Map<string, AdaptiveStrategy> = new Map();

  constructor() {
    this.initializeAdaptiveStrategies();
    console.log('🔄 [SofiaConversationManager] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Gestisce flusso conversazionale dinamico
   */
  async manageConversationFlow(
    sessionId: string,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation,
    userMessage: ChatMessage
  ): Promise<ConversationFlow> {
    console.log('🔄 [SofiaConversation] Gestendo flusso per sessione:', sessionId);

    try {
      // 1. Ottieni o crea flusso conversazione
      let flow = this.flowStore.get(sessionId);
      if (!flow) {
        flow = await this.createNewFlow(sessionId, memory);
      }

      // 2. Analizza stato attuale
      const currentAnalysis = await this.analyzeCurrentState(flow, memory, extractedInfo);

      // 3. Determina transizione necessaria
      const transition = await this.determineTransition(flow, currentAnalysis, extractedInfo);

      // 4. Esegui transizione
      if (transition) {
        await this.executeTransition(flow, transition);
      }

      // 5. Aggiorna obiettivi conversazione
      await this.updateConversationGoals(flow, extractedInfo, memory);

      // 6. Adatta strategie
      await this.adaptStrategies(flow, currentAnalysis);

      // 7. Salva flusso aggiornato
      this.flowStore.set(sessionId, flow);

      console.log('✅ [SofiaConversation] Flusso aggiornato:', {
        sessionId,
        currentPhase: flow.currentState.phase,
        activeGoals: flow.activeGoals.length,
        transitions: flow.flowHistory.length
      });

      return flow;

    } catch (error) {
      console.error('❌ [SofiaConversation] Errore gestione flusso:', error);
      throw error;
    }
  }

  /**
   * 🎯 Genera strategia di risposta adattiva
   */
  async generateAdaptiveResponse(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): Promise<AdaptiveResponse> {
    console.log('🔄 [SofiaConversation] Generando risposta adattiva');

    try {
      // 1. Determina strategia ottimale
      const optimalStrategy = this.selectOptimalStrategy(flow, memory, extractedInfo);

      // 2. Genera risposta basata su strategia
      const response = await this.generateStrategyBasedResponse(
        optimalStrategy,
        flow,
        memory,
        extractedInfo
      );

      // 3. Determina prossimi passi
      const nextSteps = this.determineNextSteps(flow, optimalStrategy);

      // 4. Calcola metriche di adattamento
      const adaptationMetrics = this.calculateAdaptationMetrics(flow, optimalStrategy);

      return {
        strategy: optimalStrategy,
        response,
        nextSteps,
        adaptationMetrics,
        confidence: this.calculateStrategyConfidence(optimalStrategy, flow)
      };

    } catch (error) {
      console.error('❌ [SofiaConversation] Errore generazione risposta adattiva:', error);
      return this.generateFallbackResponse(flow);
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Crea nuovo flusso conversazione
   */
  private async createNewFlow(sessionId: string, memory: ConversationMemory): Promise<ConversationFlow> {
    const now = new Date();
    
    return {
      currentState: {
        phase: 'greeting',
        subPhase: 'initial',
        confidence: 0.5,
        userEngagement: 'medium',
        topicFocus: 'general',
        nextExpectedInput: [
          {
            type: 'information',
            description: 'Informazioni sui progetti o obiettivi',
            examples: ['Vorrei creare un progetto', 'Analizza questo terreno'],
            required: false,
            priority: 'medium'
          }
        ]
      },
      flowHistory: [],
      activeGoals: [],
      contextSwitches: [],
      adaptiveStrategies: []
    };
  }

  /**
   * Analizza stato attuale
   */
  private async analyzeCurrentState(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): Promise<StateAnalysis> {
    const currentState = flow.currentState;
    const conversationContext = memory.conversationContext.currentContext;
    
    return {
      phase: currentState.phase,
      userEngagement: this.calculateUserEngagement(memory),
      topicFocus: conversationContext.topic,
      confidence: this.calculateStateConfidence(flow, extractedInfo),
      goalProgress: this.calculateGoalProgress(flow),
      contextStability: this.calculateContextStability(flow),
      userSatisfaction: this.estimateUserSatisfaction(flow, memory)
    };
  }

  /**
   * Determina transizione necessaria
   */
  private async determineTransition(
    flow: ConversationFlow,
    analysis: StateAnalysis,
    extractedInfo: ExtractedInformation
  ): Promise<FlowTransition | null> {
    const currentState = flow.currentState;
    
    // Logica di transizione basata su analisi
    if (analysis.userEngagement === 'low' && currentState.phase === 'exploration') {
      return {
        from: currentState,
        to: { ...currentState, phase: 'clarification', subPhase: 'engagement_recovery' },
        trigger: 'low_engagement',
        timestamp: new Date(),
        reasoning: 'User engagement is low, switching to clarification mode',
        success: false
      };
    }
    
    if (extractedInfo.intents.primary === 'feasibility_analysis' && currentState.phase === 'exploration') {
      return {
        from: currentState,
        to: { ...currentState, phase: 'action', subPhase: 'tool_execution' },
        trigger: 'specific_intent',
        timestamp: new Date(),
        reasoning: 'User has specific intent, switching to action mode',
        success: false
      };
    }
    
    if (analysis.goalProgress >= 0.8 && currentState.phase === 'action') {
      return {
        from: currentState,
        to: { ...currentState, phase: 'completion', subPhase: 'summary' },
        trigger: 'goal_completion',
        timestamp: new Date(),
        reasoning: 'Primary goal is nearly complete',
        success: false
      };
    }
    
    return null;
  }

  /**
   * Esegue transizione
   */
  private async executeTransition(flow: ConversationFlow, transition: FlowTransition): Promise<void> {
    // Aggiungi transizione alla cronologia
    flow.flowHistory.push(transition);
    
    // Aggiorna stato corrente
    flow.currentState = transition.to;
    
    // Aggiorna metriche di successo
    transition.success = this.evaluateTransitionSuccess(transition);
    
    console.log('🔄 [SofiaConversation] Transizione eseguita:', {
      from: transition.from.phase,
      to: transition.to.phase,
      trigger: transition.trigger,
      success: transition.success
    });
  }

  /**
   * Aggiorna obiettivi conversazione
   */
  private async updateConversationGoals(
    flow: ConversationFlow,
    extractedInfo: ExtractedInformation,
    memory: ConversationMemory
  ): Promise<void> {
    // Identifica nuovi obiettivi
    const newGoals = this.identifyNewGoals(extractedInfo, memory);
    
    // Aggiungi nuovi obiettivi
    newGoals.forEach(goal => {
      if (!flow.activeGoals.find(g => g.id === goal.id)) {
        flow.activeGoals.push(goal);
      }
    });
    
    // Aggiorna progresso obiettivi esistenti
    flow.activeGoals.forEach(goal => {
      goal.progress = this.calculateGoalProgress(goal, extractedInfo);
      goal.gatheredInfo = this.updateGatheredInfo(goal, extractedInfo);
      goal.nextSteps = this.updateNextSteps(goal, extractedInfo);
    });
    
    // Rimuovi obiettivi completati
    flow.activeGoals = flow.activeGoals.filter(goal => goal.progress < 1.0);
  }

  /**
   * Adatta strategie
   */
  private async adaptStrategies(flow: ConversationFlow, analysis: StateAnalysis): Promise<void> {
    // Aggiorna efficacia strategie basata su performance
    flow.adaptiveStrategies.forEach(strategy => {
      strategy.effectiveness = this.calculateStrategyEffectiveness(strategy, analysis);
    });
    
    // Aggiungi nuove strategie se necessario
    const newStrategies = this.identifyNewStrategies(analysis);
    newStrategies.forEach(strategy => {
      if (!flow.adaptiveStrategies.find(s => s.strategy === strategy.strategy)) {
        flow.adaptiveStrategies.push(strategy);
      }
    });
  }

  /**
   * Seleziona strategia ottimale
   */
  private selectOptimalStrategy(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): AdaptiveStrategy {
    const availableStrategies = Array.from(this.adaptiveStrategies.values());
    
    // Calcola score per ogni strategia
    const scoredStrategies = availableStrategies.map(strategy => ({
      strategy,
      score: this.calculateStrategyScore(strategy, flow, memory, extractedInfo)
    }));
    
    // Seleziona strategia con score più alto
    const optimal = scoredStrategies.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return optimal.strategy;
  }

  /**
   * Genera risposta basata su strategia
   */
  private async generateStrategyBasedResponse(
    strategy: AdaptiveStrategy,
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): Promise<string> {
    switch (strategy.strategy) {
      case 'proactive_guidance':
        return this.generateProactiveGuidanceResponse(flow, memory, extractedInfo);
      
      case 'reactive_support':
        return this.generateReactiveSupportResponse(flow, memory, extractedInfo);
      
      case 'exploratory_assistance':
        return this.generateExploratoryAssistanceResponse(flow, memory, extractedInfo);
      
      case 'task_focus':
        return this.generateTaskFocusResponse(flow, memory, extractedInfo);
      
      default:
        return this.generateGenericResponse(flow, memory, extractedInfo);
    }
  }

  // ============================================================================
  // METODI DI GENERAZIONE RISPOSTE
  // ============================================================================

  private generateProactiveGuidanceResponse(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): string {
    const activeGoal = flow.activeGoals.find(g => g.priority === 'high');
    if (activeGoal) {
      return `Perfetto! Vedo che stai lavorando su ${activeGoal.description}. Per completare questo obiettivo, ti suggerisco di ${activeGoal.nextSteps[0]}.`;
    }
    return "Basandomi sui tuoi progetti attivi, ti suggerisco alcune azioni che potrebbero essere utili per ottimizzare il tuo lavoro.";
  }

  private generateReactiveSupportResponse(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): string {
    return `Capisco perfettamente la tua richiesta. Ti aiuto subito con ${extractedInfo.intents.primary}.`;
  }

  private generateExploratoryAssistanceResponse(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): string {
    return "Interessante! Esploriamo insieme questa possibilità. Ti mostro alcune opzioni che potrebbero essere rilevanti per te.";
  }

  private generateTaskFocusResponse(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): string {
    const currentGoal = flow.activeGoals.find(g => g.progress < 1.0);
    if (currentGoal) {
      return `Concentriamoci su ${currentGoal.description}. Il prossimo passo è ${currentGoal.nextSteps[0]}.`;
    }
    return "Procediamo con l'obiettivo principale. Dimmi come posso aiutarti a completarlo.";
  }

  private generateGenericResponse(
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): string {
    return "Come posso aiutarti oggi? Ho accesso a tutti i tuoi progetti e posso supportarti in ogni fase del lavoro.";
  }

  // ============================================================================
  // METODI DI CALCOLO
  // ============================================================================

  private calculateUserEngagement(memory: ConversationMemory): 'low' | 'medium' | 'high' {
    const messageCount = memory.conversationContext.messages.length;
    const timeSpan = Date.now() - memory.startTime.getTime();
    const messagesPerMinute = messageCount / (timeSpan / 60000);
    
    if (messagesPerMinute > 2) return 'high';
    if (messagesPerMinute > 0.5) return 'medium';
    return 'low';
  }

  private calculateStateConfidence(flow: ConversationFlow, extractedInfo: ExtractedInformation): number {
    let confidence = extractedInfo.intents.confidence;
    
    // Aggiusta confidence basata su storia conversazione
    if (flow.flowHistory.length > 0) {
      const recentTransitions = flow.flowHistory.slice(-3);
      const successRate = recentTransitions.filter(t => t.success).length / recentTransitions.length;
      confidence = (confidence + successRate) / 2;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private calculateGoalProgress(flow: ConversationFlow): number {
    if (flow.activeGoals.length === 0) return 0;
    
    const totalProgress = flow.activeGoals.reduce((sum, goal) => sum + goal.progress, 0);
    return totalProgress / flow.activeGoals.length;
  }

  private calculateContextStability(flow: ConversationFlow): number {
    if (flow.contextSwitches.length === 0) return 1.0;
    
    const recentSwitches = flow.contextSwitches.slice(-5);
    const smoothSwitches = recentSwitches.filter(s => s.smoothness === 'smooth').length;
    return smoothSwitches / recentSwitches.length;
  }

  private estimateUserSatisfaction(flow: ConversationFlow, memory: ConversationMemory): number {
    // Stima soddisfazione basata su metriche conversazione
    let satisfaction = 0.5; // Base
    
    // Aggiungi punti per engagement alto
    if (flow.currentState.userEngagement === 'high') satisfaction += 0.3;
    
    // Aggiungi punti per progresso obiettivi
    satisfaction += this.calculateGoalProgress(flow) * 0.2;
    
    return Math.min(1.0, Math.max(0.0, satisfaction));
  }

  private identifyNewGoals(extractedInfo: ExtractedInformation, memory: ConversationMemory): ConversationGoal[] {
    const goals: ConversationGoal[] = [];
    
    // Identifica obiettivi basati su intent
    if (extractedInfo.intents.primary === 'feasibility_analysis') {
      goals.push({
        id: 'feasibility_' + Date.now(),
        type: 'task_execution',
        description: 'Completare analisi di fattibilità',
        progress: 0,
        requiredInfo: ['location', 'budget', 'project_type'],
        gatheredInfo: [],
        nextSteps: ['Raccogliere informazioni mancanti', 'Eseguire analisi'],
        priority: 'high'
      });
    }
    
    return goals;
  }

  private calculateGoalProgress(goal: ConversationGoal, extractedInfo: ExtractedInformation): number {
    const totalRequired = goal.requiredInfo.length;
    const gathered = goal.gatheredInfo.length;
    return gathered / totalRequired;
  }

  private updateGatheredInfo(goal: ConversationGoal, extractedInfo: ExtractedInformation): string[] {
    const gathered = [...goal.gatheredInfo];
    
    // Aggiungi nuove informazioni basate su entità estratte
    if (extractedInfo.entities.locations?.length > 0 && !gathered.includes('location')) {
      gathered.push('location');
    }
    if (extractedInfo.entities.budgets?.length > 0 && !gathered.includes('budget')) {
      gathered.push('budget');
    }
    
    return gathered;
  }

  private updateNextSteps(goal: ConversationGoal, extractedInfo: ExtractedInformation): string[] {
    // Aggiorna prossimi passi basati su informazioni raccolte
    const nextSteps = [...goal.nextSteps];
    
    if (goal.gatheredInfo.includes('location') && goal.gatheredInfo.includes('budget')) {
      nextSteps.unshift('Eseguire analisi di fattibilità');
    }
    
    return nextSteps;
  }

  private calculateStrategyEffectiveness(strategy: AdaptiveStrategy, analysis: StateAnalysis): number {
    // Calcola efficacia strategia basata su metriche
    let effectiveness = strategy.effectiveness;
    
    // Aggiusta basata su performance recente
    if (analysis.userSatisfaction > 0.7) {
      effectiveness += 0.1;
    } else if (analysis.userSatisfaction < 0.3) {
      effectiveness -= 0.1;
    }
    
    return Math.min(1.0, Math.max(0.0, effectiveness));
  }

  private identifyNewStrategies(analysis: StateAnalysis): AdaptiveStrategy[] {
    const strategies: AdaptiveStrategy[] = [];
    
    // Identifica nuove strategie basate su analisi
    if (analysis.userEngagement === 'low') {
      strategies.push({
        strategy: 'proactive_guidance',
        parameters: { engagement_boost: true },
        effectiveness: 0.7,
        usageCount: 0
      });
    }
    
    return strategies;
  }

  private calculateStrategyScore(
    strategy: AdaptiveStrategy,
    flow: ConversationFlow,
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): number {
    let score = strategy.effectiveness;
    
    // Aggiusta score basato su contesto
    if (strategy.strategy === 'proactive_guidance' && flow.currentState.userEngagement === 'low') {
      score += 0.3;
    }
    
    if (strategy.strategy === 'task_focus' && flow.activeGoals.length > 0) {
      score += 0.2;
    }
    
    return score;
  }

  private determineNextSteps(flow: ConversationFlow, strategy: AdaptiveStrategy): string[] {
    const nextSteps: string[] = [];
    
    // Determina prossimi passi basati su strategia e stato
    if (strategy.strategy === 'proactive_guidance') {
      nextSteps.push('Monitorare engagement utente');
      nextSteps.push('Suggerire azioni proattive');
    }
    
    if (flow.activeGoals.length > 0) {
      nextSteps.push('Aggiornare progresso obiettivi');
    }
    
    return nextSteps;
  }

  private calculateAdaptationMetrics(flow: ConversationFlow, strategy: AdaptiveStrategy): any {
    return {
      strategyEffectiveness: strategy.effectiveness,
      conversationFlow: flow.flowHistory.length,
      activeGoals: flow.activeGoals.length,
      contextStability: this.calculateContextStability(flow),
      userEngagement: flow.currentState.userEngagement
    };
  }

  private calculateStrategyConfidence(strategy: AdaptiveStrategy, flow: ConversationFlow): number {
    return strategy.effectiveness * flow.currentState.confidence;
  }

  private evaluateTransitionSuccess(transition: FlowTransition): boolean {
    // Logica semplificata per valutare successo transizione
    return transition.reasoning.includes('success') || transition.reasoning.includes('complete');
  }

  private generateFallbackResponse(flow: ConversationFlow): AdaptiveResponse {
    return {
      strategy: this.adaptiveStrategies.get('reactive_support')!,
      response: "Mi dispiace, ho riscontrato un problema. Puoi riformulare la tua richiesta?",
      nextSteps: ['Recuperare da errore', 'Riformulare richiesta'],
      adaptationMetrics: {
        strategyEffectiveness: 0.5,
        conversationFlow: flow.flowHistory.length,
        activeGoals: flow.activeGoals.length,
        contextStability: 0.5,
        userEngagement: 'medium'
      },
      confidence: 0.5
    };
  }

  private initializeAdaptiveStrategies(): void {
    this.adaptiveStrategies.set('proactive_guidance', {
      strategy: 'proactive_guidance',
      parameters: { guidance_level: 'high' },
      effectiveness: 0.8,
      usageCount: 0
    });
    
    this.adaptiveStrategies.set('reactive_support', {
      strategy: 'reactive_support',
      parameters: { support_level: 'medium' },
      effectiveness: 0.7,
      usageCount: 0
    });
    
    this.adaptiveStrategies.set('exploratory_assistance', {
      strategy: 'exploratory_assistance',
      parameters: { exploration_depth: 'medium' },
      effectiveness: 0.6,
      usageCount: 0
    });
    
    this.adaptiveStrategies.set('task_focus', {
      strategy: 'task_focus',
      parameters: { focus_level: 'high' },
      effectiveness: 0.9,
      usageCount: 0
    });
  }
}

// ============================================================================
// INTERFACCE DI SUPPORTO
// ============================================================================

interface StateAnalysis {
  phase: string;
  userEngagement: 'low' | 'medium' | 'high';
  topicFocus: string;
  confidence: number;
  goalProgress: number;
  contextStability: number;
  userSatisfaction: number;
}

interface AdaptiveResponse {
  strategy: AdaptiveStrategy;
  response: string;
  nextSteps: string[];
  adaptationMetrics: any;
  confidence: number;
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const sofiaConversationManager = new SofiaConversationManager();
