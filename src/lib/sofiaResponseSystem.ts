// 🎯 SOFIA 2.0 - INTENT-AGNOSTIC RESPONSE SYSTEM
// Sistema di risposta universale per Urbanova

import { ConversationMemory, ExtractedInformation } from './sofiaMemorySystem';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface UniversalResponse {
  response: string;
  type: 'answer' | 'question' | 'action' | 'clarification' | 'suggestion';
  confidence: number;
  
  // Azioni suggerite
  suggestedActions: SuggestedAction[];
  
  // Contesto per prossima interazione
  nextContext: {
    expectedInput: string[];
    missingInfo: string[];
    priority: 'high' | 'medium' | 'low';
  };
  
  // Metadati
  metadata: {
    processingTime: number;
    sourcesUsed: string[];
    reasoning: string;
  };
}

export interface SuggestedAction {
  type: 'tool_execution' | 'data_retrieval' | 'user_input' | 'navigation';
  tool?: string;
  parameters?: any;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

export interface ResponseContext {
  memory: ConversationMemory;
  extractedInfo: ExtractedInformation;
  userMessage: ChatMessage;
  availableTools: string[];
  systemCapabilities: string[];
}

// ============================================================================
// SOFIA RESPONSE SYSTEM CLASS
// ============================================================================

export class SofiaResponseSystem {
  private responseTemplates: Map<string, ResponseTemplate> = new Map();
  private toolRegistry: Map<string, ToolCapability> = new Map();

  constructor() {
    this.initializeResponseTemplates();
    this.initializeToolRegistry();
    console.log('🎯 [SofiaResponseSystem] Inizializzato');
  }

  // ============================================================================
  // METODO PRINCIPALE
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Genera risposta universale
   */
  async generateUniversalResponse(
    context: ResponseContext
  ): Promise<UniversalResponse> {
    const startTime = Date.now();
    console.log('🎯 [SofiaResponse] Generando risposta universale');

    try {
      // 1. Analizza contesto completo
      const contextAnalysis = await this.analyzeContext(context);
      
      // 2. Determina tipo di risposta ottimale
      const responseType = this.determineResponseType(contextAnalysis);
      
      // 3. Genera risposta base
      const baseResponse = await this.generateBaseResponse(responseType, contextAnalysis);
      
      // 4. Suggerisci azioni
      const suggestedActions = await this.generateSuggestedActions(contextAnalysis);
      
      // 5. Determina contesto prossima interazione
      const nextContext = this.determineNextContext(contextAnalysis);
      
      // 6. Genera risposta finale
      const finalResponse = await this.generateFinalResponse(
        baseResponse,
        suggestedActions,
        nextContext,
        contextAnalysis
      );

      const processingTime = Date.now() - startTime;

      console.log('✅ [SofiaResponse] Risposta generata:', {
        type: finalResponse.type,
        confidence: finalResponse.confidence,
        actionsCount: finalResponse.suggestedActions.length,
        processingTime
      });

      return {
        ...finalResponse,
        metadata: {
          processingTime,
          sourcesUsed: contextAnalysis.sourcesUsed,
          reasoning: contextAnalysis.reasoning
        }
      };

    } catch (error) {
      console.error('❌ [SofiaResponse] Errore generazione risposta:', error);
      return this.generateFallbackResponse(context);
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Analizza contesto completo
   */
  private async analyzeContext(context: ResponseContext): Promise<ContextAnalysis> {
    const { memory, extractedInfo, userMessage, availableTools } = context;
    
    // Analizza intenti
    const intentAnalysis = this.analyzeIntents(extractedInfo);
    
    // Analizza entità
    const entityAnalysis = this.analyzeEntities(extractedInfo);
    
    // Analizza contesto conversazione
    const conversationAnalysis = this.analyzeConversation(memory);
    
    // Analizza disponibilità tool
    const toolAnalysis = this.analyzeToolAvailability(extractedInfo, availableTools);
    
    // Determina priorità
    const priorityAnalysis = this.determinePriority(intentAnalysis, entityAnalysis, conversationAnalysis);
    
    return {
      intents: intentAnalysis,
      entities: entityAnalysis,
      conversation: conversationAnalysis,
      tools: toolAnalysis,
      priority: priorityAnalysis,
      sourcesUsed: ['memory', 'extraction', 'tools'],
      reasoning: this.generateReasoning(intentAnalysis, entityAnalysis, conversationAnalysis)
    };
  }

  /**
   * Determina tipo di risposta ottimale
   */
  private determineResponseType(analysis: ContextAnalysis): string {
    const { intents, entities, conversation, tools } = analysis;
    
    // Se ci sono tool disponibili per l'intent primario
    if (tools.availableTools.length > 0) {
      return 'action';
    }
    
    // Se mancano informazioni critiche
    if (entities.missingEntities.length > 0) {
      return 'clarification';
    }
    
    // Se è una domanda diretta
    if (intents.primary === 'question') {
      return 'answer';
    }
    
    // Se è esplorativo
    if (conversation.mood === 'exploratory') {
      return 'suggestion';
    }
    
    // Default: risposta generica
    return 'answer';
  }

  /**
   * Genera risposta base
   */
  private async generateBaseResponse(
    responseType: string,
    analysis: ContextAnalysis
  ): Promise<string> {
    const template = this.responseTemplates.get(responseType);
    if (!template) {
      return this.generateGenericResponse(analysis);
    }
    
    return this.fillTemplate(template, analysis);
  }

  /**
   * Genera azioni suggerite
   */
  private async generateSuggestedActions(analysis: ContextAnalysis): Promise<SuggestedAction[]> {
    const actions: SuggestedAction[] = [];
    
    // Azioni basate su tool disponibili
    analysis.tools.availableTools.forEach(tool => {
      actions.push({
        type: 'tool_execution',
        tool: tool.name,
        parameters: tool.parameters,
        description: tool.description,
        priority: tool.priority,
        estimatedTime: tool.estimatedTime
      });
    });
    
    // Azioni basate su informazioni mancanti
    analysis.entities.missingEntities.forEach(entity => {
      actions.push({
        type: 'user_input',
        description: `Fornisci informazioni su: ${entity}`,
        priority: 'medium'
      });
    });
    
    // Azioni proattive basate su contesto
    const proactiveActions = this.generateProactiveActions(analysis);
    actions.push(...proactiveActions);
    
    return actions.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  /**
   * Determina contesto prossima interazione
   */
  private determineNextContext(analysis: ContextAnalysis): any {
    return {
      expectedInput: analysis.entities.missingEntities,
      missingInfo: analysis.entities.missingEntities,
      priority: analysis.priority.level
    };
  }

  /**
   * Genera risposta finale
   */
  private async generateFinalResponse(
    baseResponse: string,
    suggestedActions: SuggestedAction[],
    nextContext: any,
    analysis: ContextAnalysis
  ): Promise<UniversalResponse> {
    // Combina risposta base con azioni suggerite
    let finalResponse = baseResponse;
    
    if (suggestedActions.length > 0) {
      finalResponse += '\n\n' + this.formatSuggestedActions(suggestedActions);
    }
    
    // Aggiungi contesto prossima interazione se necessario
    if (nextContext.missingInfo.length > 0) {
      finalResponse += '\n\n' + this.formatNextContext(nextContext);
    }
    
    return {
      response: finalResponse,
      type: this.determineResponseType(analysis) as any,
      confidence: this.calculateConfidence(analysis),
      suggestedActions,
      nextContext
    };
  }

  // ============================================================================
  // METODI DI ANALISI
  // ============================================================================

  private analyzeIntents(extractedInfo: ExtractedInformation): IntentAnalysis {
    return {
      primary: extractedInfo.intents.primary,
      secondary: extractedInfo.intents.secondary,
      confidence: extractedInfo.intents.confidence,
      complexity: this.calculateIntentComplexity(extractedInfo.intents.secondary.length)
    };
  }

  private analyzeEntities(extractedInfo: ExtractedInformation): EntityAnalysis {
    const entities = extractedInfo.entities;
    const missingEntities: string[] = [];
    
    // Determina entità mancanti basate su intent
    if (extractedInfo.intents.primary === 'feasibility_analysis') {
      if (!entities.locations?.length) missingEntities.push('location');
      if (!entities.budgets?.length) missingEntities.push('budget');
    }
    
    return {
      available: entities,
      missingEntities,
      completeness: this.calculateEntityCompleteness(entities, missingEntities)
    };
  }

  private analyzeConversation(memory: ConversationMemory): ConversationAnalysis {
    const context = memory.conversationContext.currentContext;
    const patterns = memory.conversationContext.conversationPatterns;
    
    return {
      mood: context.mood,
      topic: context.topic,
      userGoal: context.userGoal,
      patterns: patterns,
      length: memory.conversationContext.messages.length,
      complexity: this.calculateConversationComplexity(memory)
    };
  }

  private analyzeToolAvailability(
    extractedInfo: ExtractedInformation,
    availableTools: string[]
  ): ToolAnalysis {
    const relevantTools = this.findRelevantTools(extractedInfo.intents.primary, availableTools);
    
    return {
      availableTools: relevantTools,
      totalTools: availableTools.length,
      coverage: relevantTools.length / availableTools.length
    };
  }

  private determinePriority(
    intents: IntentAnalysis,
    entities: EntityAnalysis,
    conversation: ConversationAnalysis
  ): PriorityAnalysis {
    let priority = 'medium';
    
    if (conversation.mood === 'urgent') {
      priority = 'high';
    } else if (entities.missingEntities.length === 0 && intents.confidence > 0.8) {
      priority = 'high';
    } else if (entities.completeness < 0.5) {
      priority = 'low';
    }
    
    return {
      level: priority as any,
      factors: ['mood', 'completeness', 'confidence'],
      score: this.calculatePriorityScore(intents, entities, conversation)
    };
  }

  // ============================================================================
  // METODI DI SUPPORTO
  // ============================================================================

  private initializeResponseTemplates(): void {
    this.responseTemplates.set('answer', {
      template: "Basandomi sul contesto della nostra conversazione, {response}",
      variables: ['response']
    });
    
    this.responseTemplates.set('action', {
      template: "Perfetto! {action_description}. Procedo con {tool_name}.",
      variables: ['action_description', 'tool_name']
    });
    
    this.responseTemplates.set('clarification', {
      template: "Per completare {intent}, ho bisogno di: {missing_info}",
      variables: ['intent', 'missing_info']
    });
    
    this.responseTemplates.set('suggestion', {
      template: "Considerando il tuo profilo e i progetti attivi, ti suggerisco: {suggestions}",
      variables: ['suggestions']
    });
  }

  private initializeToolRegistry(): void {
    // Registra tool disponibili
    this.toolRegistry.set('feasibility', {
      name: 'feasibility',
      description: 'Analisi di fattibilità immobiliare',
      parameters: ['location', 'budget', 'project_type'],
      priority: 'high',
      estimatedTime: '2-3 minuti'
    });
    
    this.toolRegistry.set('market', {
      name: 'market',
      description: 'Ricerca e analisi di mercato',
      parameters: ['location', 'property_type', 'price_range'],
      priority: 'high',
      estimatedTime: '1-2 minuti'
    });
    
    this.toolRegistry.set('design', {
      name: 'design',
      description: 'Generazione progetti architettonici',
      parameters: ['project_type', 'area', 'requirements'],
      priority: 'medium',
      estimatedTime: '5-10 minuti'
    });
  }

  private findRelevantTools(intent: string, availableTools: string[]): ToolCapability[] {
    const relevantTools: ToolCapability[] = [];
    
    // Mappa intenti a tool
    const intentToolMap: Record<string, string[]> = {
      'feasibility_analysis': ['feasibility'],
      'market_research': ['market'],
      'project_design': ['design'],
      'timeline_management': ['timeline'],
      'document_generation': ['docs']
    };
    
    const toolNames = intentToolMap[intent] || [];
    
    toolNames.forEach(toolName => {
      if (availableTools.includes(toolName)) {
        const tool = this.toolRegistry.get(toolName);
        if (tool) {
          relevantTools.push(tool);
        }
      }
    });
    
    return relevantTools;
  }

  private generateProactiveActions(analysis: ContextAnalysis): SuggestedAction[] {
    const actions: SuggestedAction[] = [];
    
    // Azioni proattive basate su pattern conversazione
    if (analysis.conversation.patterns.topicsDiscussed.includes('feasibility')) {
      actions.push({
        type: 'tool_execution',
        tool: 'market',
        description: 'Analizza opportunità di mercato correlate',
        priority: 'medium',
        estimatedTime: '1-2 minuti'
      });
    }
    
    return actions;
  }

  private formatSuggestedActions(actions: SuggestedAction[]): string {
    if (actions.length === 0) return '';
    
    let formatted = '💡 **Azioni suggerite:**\n';
    actions.forEach((action, index) => {
      formatted += `${index + 1}. ${action.description}`;
      if (action.estimatedTime) {
        formatted += ` (${action.estimatedTime})`;
      }
      formatted += '\n';
    });
    
    return formatted;
  }

  private formatNextContext(nextContext: any): string {
    if (nextContext.missingInfo.length === 0) return '';
    
    return `📋 **Per continuare, potresti fornire:**\n${nextContext.missingInfo.map((info: string) => `• ${info}`).join('\n')}`;
  }

  private generateGenericResponse(analysis: ContextAnalysis): string {
    return `Ciao! Vedo che stai lavorando su ${analysis.conversation.topic}. Come posso aiutarti oggi?`;
  }

  private fillTemplate(template: ResponseTemplate, analysis: ContextAnalysis): string {
    // Implementazione semplificata per riempire template
    return template.template.replace('{response}', 'la tua richiesta');
  }

  private generateFallbackResponse(context: ResponseContext): UniversalResponse {
    return {
      response: "Mi dispiace, ho riscontrato un problema tecnico. Puoi riformulare la tua richiesta?",
      type: 'clarification',
      confidence: 0.5,
      suggestedActions: [],
      nextContext: {
        expectedInput: ['riformulazione richiesta'],
        missingInfo: [],
        priority: 'medium'
      },
      metadata: {
        processingTime: 0,
        sourcesUsed: ['fallback'],
        reasoning: 'fallback_response'
      }
    };
  }

  // ============================================================================
  // METODI DI CALCOLO
  // ============================================================================

  private calculateIntentComplexity(secondaryCount: number): 'simple' | 'complex' | 'multi' {
    if (secondaryCount === 0) return 'simple';
    if (secondaryCount <= 2) return 'complex';
    return 'multi';
  }

  private calculateEntityCompleteness(entities: any, missing: string[]): number {
    const totalExpected = 5; // Numero totale di entità attese
    const available = totalExpected - missing.length;
    return available / totalExpected;
  }

  private calculateConversationComplexity(memory: ConversationMemory): 'simple' | 'moderate' | 'complex' {
    const messageCount = memory.conversationContext.messages.length;
    if (messageCount <= 5) return 'simple';
    if (messageCount <= 15) return 'moderate';
    return 'complex';
  }

  private calculatePriorityScore(
    intents: IntentAnalysis,
    entities: EntityAnalysis,
    conversation: ConversationAnalysis
  ): number {
    let score = 0.5; // Base score
    
    // Aggiungi punti per confidence alta
    score += intents.confidence * 0.3;
    
    // Aggiungi punti per completezza entità
    score += entities.completeness * 0.2;
    
    // Aggiungi punti per urgenza
    if (conversation.mood === 'urgent') score += 0.3;
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  private calculateConfidence(analysis: ContextAnalysis): number {
    return analysis.priority.score;
  }

  private getPriorityValue(priority: string): number {
    const values = { 'high': 3, 'medium': 2, 'low': 1 };
    return values[priority as keyof typeof values] || 1;
  }

  private generateReasoning(
    intents: IntentAnalysis,
    entities: EntityAnalysis,
    conversation: ConversationAnalysis
  ): string {
    return `Intent: ${intents.primary} (${intents.confidence}), Entities: ${entities.completeness}, Mood: ${conversation.mood}`;
  }
}

// ============================================================================
// INTERFACCE DI SUPPORTO
// ============================================================================

interface ResponseTemplate {
  template: string;
  variables: string[];
}

interface ToolCapability {
  name: string;
  description: string;
  parameters: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

interface ContextAnalysis {
  intents: IntentAnalysis;
  entities: EntityAnalysis;
  conversation: ConversationAnalysis;
  tools: ToolAnalysis;
  priority: PriorityAnalysis;
  sourcesUsed: string[];
  reasoning: string;
}

interface IntentAnalysis {
  primary: string;
  secondary: string[];
  confidence: number;
  complexity: 'simple' | 'complex' | 'multi';
}

interface EntityAnalysis {
  available: any;
  missingEntities: string[];
  completeness: number;
}

interface ConversationAnalysis {
  mood: string;
  topic: string;
  userGoal: string | null;
  patterns: any;
  length: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

interface ToolAnalysis {
  availableTools: ToolCapability[];
  totalTools: number;
  coverage: number;
}

interface PriorityAnalysis {
  level: 'high' | 'medium' | 'low';
  factors: string[];
  score: number;
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const sofiaResponseSystem = new SofiaResponseSystem();
