// 🧩 SOFIA 2.0 - MULTI-INTENT PROCESSING
// Processore multi-intent per Urbanova

import { ExtractedInformation } from './sofiaMemorySystem';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface MultiIntentAnalysis {
  primaryIntent: IntentAnalysis;
  secondaryIntents: IntentAnalysis[];
  intentRelationships: IntentRelationship[];
  processingStrategy: 'sequential' | 'parallel' | 'hierarchical' | 'adaptive';
  confidence: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'multi_domain';
}

export interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: EntityMapping[];
  parameters: IntentParameters;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  dependencies: string[];
  conflicts: string[];
}

export interface EntityMapping {
  entity: string;
  value: any;
  confidence: number;
  source: 'explicit' | 'inferred' | 'contextual';
  relevance: number;
}

export interface IntentParameters {
  required: Record<string, any>;
  optional: Record<string, any>;
  inferred: Record<string, any>;
  missing: string[];
}

export interface IntentRelationship {
  fromIntent: string;
  toIntent: string;
  relationship: 'prerequisite' | 'complementary' | 'conflicting' | 'independent';
  strength: number;
  reasoning: string;
}

export interface MultiIntentExecution {
  executionPlan: ExecutionStep[];
  estimatedDuration: string;
  resourceRequirements: ResourceRequirement[];
  riskAssessment: RiskAssessment;
  successCriteria: SuccessCriteria[];
}

export interface ExecutionStep {
  stepId: string;
  intent: string;
  action: string;
  parameters: any;
  dependencies: string[];
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  canParallelize: boolean;
}

export interface ResourceRequirement {
  resource: 'tool' | 'data' | 'user_input' | 'external_api';
  description: string;
  availability: 'available' | 'limited' | 'unavailable';
  alternatives: string[];
}

export interface RiskAssessment {
  risks: Risk[];
  mitigationStrategies: MitigationStrategy[];
  overallRisk: 'low' | 'medium' | 'high';
}

export interface Risk {
  type: 'data_conflict' | 'resource_conflict' | 'timing_conflict' | 'user_confusion';
  description: string;
  probability: number;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface MitigationStrategy {
  risk: string;
  strategy: string;
  implementation: string;
  effectiveness: number;
}

export interface SuccessCriteria {
  criterion: string;
  measurement: string;
  threshold: number;
  importance: 'critical' | 'important' | 'nice_to_have';
}

// ============================================================================
// SOFIA MULTI-INTENT PROCESSOR CLASS
// ============================================================================

export class SofiaMultiIntentProcessor {
  private intentPatterns: Map<string, IntentPattern> = new Map();
  private entityExtractors: Map<string, EntityExtractor> = new Map();
  private relationshipRules: Map<string, RelationshipRule> = new Map();

  constructor() {
    this.initializeIntentPatterns();
    this.initializeEntityExtractors();
    this.initializeRelationshipRules();
    console.log('🧩 [SofiaMultiIntentProcessor] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Processa messaggio multi-intent
   */
  async processMultiIntent(
    message: ChatMessage,
    conversationHistory: ChatMessage[],
    userContext: any
  ): Promise<MultiIntentAnalysis> {
    console.log('🧩 [SofiaMultiIntent] Processando messaggio multi-intent');

    try {
      // 1. Estrai tutti gli intenti possibili
      const detectedIntents = await this.detectAllIntents(message, conversationHistory);
      
      // 2. Analizza entità per ogni intent
      const intentAnalyses = await this.analyzeIntentsWithEntities(detectedIntents, message, userContext);
      
      // 3. Determina relazioni tra intenti
      const relationships = await this.analyzeIntentRelationships(intentAnalyses);
      
      // 4. Seleziona strategia di processamento
      const processingStrategy = this.selectProcessingStrategy(intentAnalyses, relationships);
      
      // 5. Calcola metriche finali
      const confidence = this.calculateOverallConfidence(intentAnalyses);
      const complexity = this.determineComplexity(intentAnalyses, relationships);

      const analysis: MultiIntentAnalysis = {
        primaryIntent: intentAnalyses[0],
        secondaryIntents: intentAnalyses.slice(1),
        intentRelationships: relationships,
        processingStrategy,
        confidence,
        complexity
      };

      console.log('✅ [SofiaMultiIntent] Analisi completata:', {
        primaryIntent: analysis.primaryIntent.intent,
        secondaryIntents: analysis.secondaryIntents.length,
        strategy: analysis.processingStrategy,
        confidence: analysis.confidence,
        complexity: analysis.complexity
      });

      return analysis;

    } catch (error) {
      console.error('❌ [SofiaMultiIntent] Errore processamento:', error);
      throw error;
    }
  }

  /**
   * 🎯 Genera piano di esecuzione multi-intent
   */
  async generateExecutionPlan(
    analysis: MultiIntentAnalysis,
    availableTools: string[],
    userPreferences: any
  ): Promise<MultiIntentExecution> {
    console.log('🧩 [SofiaMultiIntent] Generando piano di esecuzione');

    try {
      // 1. Genera passi di esecuzione
      const executionSteps = await this.generateExecutionSteps(analysis, availableTools);
      
      // 2. Calcola durata stimata
      const estimatedDuration = this.calculateEstimatedDuration(executionSteps);
      
      // 3. Valuta requisiti risorse
      const resourceRequirements = this.assessResourceRequirements(executionSteps, availableTools);
      
      // 4. Valuta rischi
      const riskAssessment = this.assessRisks(analysis, executionSteps);
      
      // 5. Definisci criteri di successo
      const successCriteria = this.defineSuccessCriteria(analysis);

      const execution: MultiIntentExecution = {
        executionPlan: executionSteps,
        estimatedDuration,
        resourceRequirements,
        riskAssessment,
        successCriteria
      };

      console.log('✅ [SofiaMultiIntent] Piano di esecuzione generato:', {
        steps: executionSteps.length,
        duration: estimatedDuration,
        risks: riskAssessment.risks.length,
        criteria: successCriteria.length
      });

      return execution;

    } catch (error) {
      console.error('❌ [SofiaMultiIntent] Errore generazione piano:', error);
      throw error;
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Rileva tutti gli intenti nel messaggio
   */
  private async detectAllIntents(
    message: ChatMessage,
    conversationHistory: ChatMessage[]
  ): Promise<string[]> {
    const intents: string[] = [];
    const content = message.content.toLowerCase();
    
    // Pattern per intenti multipli
    const intentPatterns = [
      { pattern: /(?:crea|genera|fai)\s+(?:un'?analisi|una\s+analisi)/gi, intent: 'feasibility_analysis' },
      { pattern: /(?:e\s+anche|inoltre|in\s+più)\s+(?:ricerca|trova)/gi, intent: 'market_research' },
      { pattern: /(?:confronta|paragona)\s+(?:con|tra)/gi, intent: 'comparison' },
      { pattern: /(?:mostra|visualizza)\s+(?:grafici|chart|grafici)/gi, intent: 'visualization' },
      { pattern: /(?:salva|memorizza)\s+(?:questo|i\s+risultati)/gi, intent: 'save_results' },
      { pattern: /(?:invia|condividi)\s+(?:via|per)\s+(?:email|whatsapp)/gi, intent: 'share_results' },
      { pattern: /(?:programma|schedula)\s+(?:un\s+appuntamento|una\s+riunione)/gi, intent: 'schedule_meeting' },
      { pattern: /(?:ricorda|nota)\s+(?:che|questo)/gi, intent: 'remember_info' }
    ];
    
    // Applica pattern
    intentPatterns.forEach(({ pattern, intent }) => {
      if (pattern.test(content)) {
        intents.push(intent);
      }
    });
    
    // Se non trova intenti specifici, usa intent generale
    if (intents.length === 0) {
      intents.push('general_query');
    }
    
    // Rimuovi duplicati
    return [...new Set(intents)];
  }

  /**
   * Analizza intenti con entità
   */
  private async analyzeIntentsWithEntities(
    intents: string[],
    message: ChatMessage,
    userContext: any
  ): Promise<IntentAnalysis[]> {
    const analyses: IntentAnalysis[] = [];
    
    for (const intent of intents) {
      const analysis = await this.analyzeSingleIntent(intent, message, userContext);
      analyses.push(analysis);
    }
    
    // Ordina per priorità e confidence
    return analyses.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.confidence - a.confidence;
    });
  }

  /**
   * Analizza singolo intent
   */
  private async analyzeSingleIntent(
    intent: string,
    message: ChatMessage,
    userContext: any
  ): Promise<IntentAnalysis> {
    const pattern = this.intentPatterns.get(intent);
    if (!pattern) {
      return this.createDefaultIntentAnalysis(intent, message);
    }
    
    // Estrai entità specifiche per intent
    const entities = await this.extractIntentSpecificEntities(intent, message, userContext);
    
    // Determina parametri
    const parameters = this.determineIntentParameters(intent, entities, userContext);
    
    // Calcola confidence
    const confidence = this.calculateIntentConfidence(intent, entities, message);
    
    // Determina priorità
    const priority = this.determineIntentPriority(intent, entities, userContext);
    
    // Stima tempo
    const estimatedTime = this.estimateIntentExecutionTime(intent, entities);
    
    // Identifica dipendenze e conflitti
    const dependencies = this.identifyIntentDependencies(intent);
    const conflicts = this.identifyIntentConflicts(intent, entities);
    
    return {
      intent,
      confidence,
      entities,
      parameters,
      priority,
      estimatedTime,
      dependencies,
      conflicts
    };
  }

  /**
   * Analizza relazioni tra intenti
   */
  private async analyzeIntentRelationships(
    intentAnalyses: IntentAnalysis[]
  ): Promise<IntentRelationship[]> {
    const relationships: IntentRelationship[] = [];
    
    for (let i = 0; i < intentAnalyses.length; i++) {
      for (let j = i + 1; j < intentAnalyses.length; j++) {
        const relationship = this.analyzeIntentPair(
          intentAnalyses[i],
          intentAnalyses[j]
        );
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }
    
    return relationships;
  }

  /**
   * Analizza coppia di intenti
   */
  private analyzeIntentPair(
    intent1: IntentAnalysis,
    intent2: IntentAnalysis
  ): IntentRelationship | null {
    const rule = this.relationshipRules.get(`${intent1.intent}_${intent2.intent}`) ||
                 this.relationshipRules.get(`${intent2.intent}_${intent1.intent}`);
    
    if (rule) {
      return {
        fromIntent: intent1.intent,
        toIntent: intent2.intent,
        relationship: rule.relationship,
        strength: rule.strength,
        reasoning: rule.reasoning
      };
    }
    
    // Analisi generica basata su entità comuni
    const commonEntities = this.findCommonEntities(intent1.entities, intent2.entities);
    if (commonEntities.length > 0) {
      return {
        fromIntent: intent1.intent,
        toIntent: intent2.intent,
        relationship: 'complementary',
        strength: commonEntities.length / Math.max(intent1.entities.length, intent2.entities.length),
        reasoning: `Condividono ${commonEntities.length} entità comuni`
      };
    }
    
    return null;
  }

  /**
   * Seleziona strategia di processamento
   */
  private selectProcessingStrategy(
    intentAnalyses: IntentAnalysis[],
    relationships: IntentRelationship[]
  ): 'sequential' | 'parallel' | 'hierarchical' | 'adaptive' {
    // Se ci sono dipendenze, usa sequenziale
    const hasDependencies = intentAnalyses.some(intent => intent.dependencies.length > 0);
    if (hasDependencies) {
      return 'sequential';
    }
    
    // Se ci sono conflitti, usa gerarchico
    const hasConflicts = intentAnalyses.some(intent => intent.conflicts.length > 0);
    if (hasConflicts) {
      return 'hierarchical';
    }
    
    // Se ci sono relazioni complementari, usa parallelo
    const hasComplementary = relationships.some(rel => rel.relationship === 'complementary');
    if (hasComplementary) {
      return 'parallel';
    }
    
    // Default: adattivo
    return 'adaptive';
  }

  /**
   * Genera passi di esecuzione
   */
  private async generateExecutionSteps(
    analysis: MultiIntentAnalysis,
    availableTools: string[]
  ): Promise<ExecutionStep[]> {
    const steps: ExecutionStep[] = [];
    
    // Genera passi per intent primario
    const primarySteps = this.generateStepsForIntent(
      analysis.primaryIntent,
      availableTools,
      'primary'
    );
    steps.push(...primarySteps);
    
    // Genera passi per intent secondari
    analysis.secondaryIntents.forEach((intent, index) => {
      const secondarySteps = this.generateStepsForIntent(
        intent,
        availableTools,
        'secondary'
      );
      steps.push(...secondarySteps);
    });
    
    // Ottimizza ordine basato su strategia
    return this.optimizeStepOrder(steps, analysis.processingStrategy);
  }

  /**
   * Genera passi per singolo intent
   */
  private generateStepsForIntent(
    intent: IntentAnalysis,
    availableTools: string[],
    type: 'primary' | 'secondary'
  ): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    
    // Mappa intent a tool
    const intentToolMap: Record<string, string> = {
      'feasibility_analysis': 'feasibility',
      'market_research': 'market',
      'project_design': 'design',
      'timeline_management': 'timeline',
      'document_generation': 'docs',
      'comparison': 'comparison',
      'visualization': 'visualization',
      'save_results': 'save',
      'share_results': 'share',
      'schedule_meeting': 'calendar'
    };
    
    const tool = intentToolMap[intent.intent];
    if (tool && availableTools.includes(tool)) {
      steps.push({
        stepId: `${intent.intent}_${Date.now()}`,
        intent: intent.intent,
        action: `execute_${tool}`,
        parameters: intent.parameters,
        dependencies: intent.dependencies,
        estimatedTime: intent.estimatedTime,
        priority: intent.priority,
        canParallelize: type === 'secondary' && intent.conflicts.length === 0
      });
    }
    
    return steps;
  }

  /**
   * Ottimizza ordine passi
   */
  private optimizeStepOrder(
    steps: ExecutionStep[],
    strategy: string
  ): ExecutionStep[] {
    switch (strategy) {
      case 'sequential':
        return steps.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
      
      case 'parallel':
        return steps.sort((a, b) => {
          if (a.canParallelize !== b.canParallelize) {
            return a.canParallelize ? 1 : -1;
          }
          return this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
        });
      
      case 'hierarchical':
        return steps.sort((a, b) => {
          const aIsPrimary = a.intent.includes('primary');
          const bIsPrimary = b.intent.includes('primary');
          if (aIsPrimary !== bIsPrimary) {
            return aIsPrimary ? -1 : 1;
          }
          return this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
        });
      
      default:
        return steps;
    }
  }

  // ============================================================================
  // METODI DI SUPPORTO
  // ============================================================================

  private initializeIntentPatterns(): void {
    this.intentPatterns.set('feasibility_analysis', {
      pattern: /(?:analisi|fattibilità|feasibility)/gi,
      entities: ['location', 'budget', 'project_type'],
      priority: 'high',
      estimatedTime: '2-3 minuti'
    });
    
    this.intentPatterns.set('market_research', {
      pattern: /(?:ricerca|mercato|market)/gi,
      entities: ['location', 'property_type', 'price_range'],
      priority: 'high',
      estimatedTime: '1-2 minuti'
    });
    
    this.intentPatterns.set('comparison', {
      pattern: /(?:confronta|paragona|compare)/gi,
      entities: ['projects', 'locations', 'metrics'],
      priority: 'medium',
      estimatedTime: '1 minuto'
    });
  }

  private initializeEntityExtractors(): void {
    this.entityExtractors.set('location', {
      pattern: /(?:a|in|per)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      confidence: 0.8
    });
    
    this.entityExtractors.set('budget', {
      pattern: /(?:€|euro|budget)\s*(\d+(?:\.\d+)?[km]?)/gi,
      confidence: 0.9
    });
  }

  private initializeRelationshipRules(): void {
    this.relationshipRules.set('feasibility_analysis_market_research', {
      relationship: 'prerequisite',
      strength: 0.8,
      reasoning: 'Market research is typically needed before feasibility analysis'
    });
    
    this.relationshipRules.set('comparison_feasibility_analysis', {
      relationship: 'complementary',
      strength: 0.6,
      reasoning: 'Comparison can enhance feasibility analysis results'
    });
  }

  private createDefaultIntentAnalysis(intent: string, message: ChatMessage): IntentAnalysis {
    return {
      intent,
      confidence: 0.5,
      entities: [],
      parameters: { required: {}, optional: {}, inferred: {}, missing: [] },
      priority: 'medium',
      estimatedTime: '1 minuto',
      dependencies: [],
      conflicts: []
    };
  }

  private async extractIntentSpecificEntities(
    intent: string,
    message: ChatMessage,
    userContext: any
  ): Promise<EntityMapping[]> {
    const entities: EntityMapping[] = [];
    const content = message.content;
    
    // Estrai entità basate su pattern
    this.entityExtractors.forEach((extractor, entityType) => {
      const matches = content.match(extractor.pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            entity: entityType,
            value: match,
            confidence: extractor.confidence,
            source: 'explicit',
            relevance: 1.0
          });
        });
      }
    });
    
    return entities;
  }

  private determineIntentParameters(
    intent: string,
    entities: EntityMapping[],
    userContext: any
  ): IntentParameters {
    const pattern = this.intentPatterns.get(intent);
    if (!pattern) {
      return { required: {}, optional: {}, inferred: {}, missing: [] };
    }
    
    const required: Record<string, any> = {};
    const optional: Record<string, any> = {};
    const inferred: Record<string, any> = {};
    const missing: string[] = [];
    
    // Mappa entità a parametri
    entities.forEach(entity => {
      if (pattern.entities.includes(entity.entity)) {
        required[entity.entity] = entity.value;
      } else {
        optional[entity.entity] = entity.value;
      }
    });
    
    // Identifica parametri mancanti
    pattern.entities.forEach(entityType => {
      if (!required[entityType] && !optional[entityType]) {
        missing.push(entityType);
      }
    });
    
    return { required, optional, inferred, missing };
  }

  private calculateIntentConfidence(
    intent: string,
    entities: EntityMapping[],
    message: ChatMessage
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Aggiungi confidence per entità trovate
    const pattern = this.intentPatterns.get(intent);
    if (pattern) {
      const foundEntities = entities.filter(e => pattern.entities.includes(e.entity));
      confidence += foundEntities.length * 0.2;
    }
    
    // Aggiungi confidence per pattern match
    if (pattern?.pattern.test(message.content)) {
      confidence += 0.3;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private determineIntentPriority(
    intent: string,
    entities: EntityMapping[],
    userContext: any
  ): 'high' | 'medium' | 'low' {
    const pattern = this.intentPatterns.get(intent);
    if (pattern) {
      return pattern.priority as 'high' | 'medium' | 'low';
    }
    
    // Priorità basata su entità critiche
    const criticalEntities = ['location', 'budget'];
    const hasCriticalEntities = entities.some(e => criticalEntities.includes(e.entity));
    
    return hasCriticalEntities ? 'high' : 'medium';
  }

  private estimateIntentExecutionTime(
    intent: string,
    entities: EntityMapping[]
  ): string {
    const pattern = this.intentPatterns.get(intent);
    if (pattern) {
      return pattern.estimatedTime;
    }
    
    // Stima basata su complessità entità
    const complexity = entities.length > 3 ? 'high' : entities.length > 1 ? 'medium' : 'low';
    const timeMap = { 'high': '3-5 minuti', 'medium': '1-3 minuti', 'low': '30 secondi - 1 minuto' };
    
    return timeMap[complexity];
  }

  private identifyIntentDependencies(intent: string): string[] {
    const dependencyMap: Record<string, string[]> = {
      'feasibility_analysis': ['market_research'],
      'comparison': ['feasibility_analysis'],
      'visualization': ['feasibility_analysis', 'market_research']
    };
    
    return dependencyMap[intent] || [];
  }

  private identifyIntentConflicts(intent: string, entities: EntityMapping[]): string[] {
    // Logica semplificata per identificare conflitti
    const conflicts: string[] = [];
    
    // Esempio: conflitto tra analisi di fattibilità e ricerca di mercato se hanno parametri diversi
    if (intent === 'feasibility_analysis') {
      const hasMarketEntities = entities.some(e => e.entity === 'market_data');
      if (hasMarketEntities) {
        conflicts.push('market_research');
      }
    }
    
    return conflicts;
  }

  private calculateOverallConfidence(intentAnalyses: IntentAnalysis[]): number {
    if (intentAnalyses.length === 0) return 0;
    
    const totalConfidence = intentAnalyses.reduce((sum, analysis) => sum + analysis.confidence, 0);
    return totalConfidence / intentAnalyses.length;
  }

  private determineComplexity(
    intentAnalyses: IntentAnalysis[],
    relationships: IntentRelationship[]
  ): 'simple' | 'moderate' | 'complex' | 'multi_domain' {
    const intentCount = intentAnalyses.length;
    const relationshipCount = relationships.length;
    
    if (intentCount === 1 && relationshipCount === 0) {
      return 'simple';
    } else if (intentCount <= 2 && relationshipCount <= 1) {
      return 'moderate';
    } else if (intentCount <= 3 && relationshipCount <= 3) {
      return 'complex';
    } else {
      return 'multi_domain';
    }
  }

  private calculateEstimatedDuration(steps: ExecutionStep[]): string {
    // Calcola durata totale basata su passi
    let totalMinutes = 0;
    
    steps.forEach(step => {
      const timeMatch = step.estimatedTime.match(/(\d+)/);
      if (timeMatch) {
        totalMinutes += parseInt(timeMatch[1]);
      }
    });
    
    if (totalMinutes < 60) {
      return `${totalMinutes} minuti`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  private assessResourceRequirements(
    steps: ExecutionStep[],
    availableTools: string[]
  ): ResourceRequirement[] {
    const requirements: ResourceRequirement[] = [];
    
    steps.forEach(step => {
      const tool = step.action.replace('execute_', '');
      if (!availableTools.includes(tool)) {
        requirements.push({
          resource: 'tool',
          description: `Tool ${tool} non disponibile`,
          availability: 'unavailable',
          alternatives: this.findToolAlternatives(tool)
        });
      }
    });
    
    return requirements;
  }

  private assessRisks(
    analysis: MultiIntentAnalysis,
    steps: ExecutionStep[]
  ): RiskAssessment {
    const risks: Risk[] = [];
    
    // Rischio di conflitto tra intenti
    if (analysis.intentRelationships.some(rel => rel.relationship === 'conflicting')) {
      risks.push({
        type: 'data_conflict',
        description: 'Conflitto tra intenti multipli',
        probability: 0.3,
        impact: 'medium',
        mitigation: 'Eseguire intenti in ordine di priorità'
      });
    }
    
    // Rischio di timeout
    if (steps.length > 3) {
      risks.push({
        type: 'timing_conflict',
        description: 'Esecuzione potrebbe richiedere troppo tempo',
        probability: 0.2,
        impact: 'low',
        mitigation: 'Eseguire passi in parallelo quando possibile'
      });
    }
    
    return {
      risks,
      mitigationStrategies: risks.map(risk => ({
        risk: risk.description,
        strategy: risk.mitigation,
        implementation: 'Automatic',
        effectiveness: 0.8
      })),
      overallRisk: risks.length > 2 ? 'high' : risks.length > 0 ? 'medium' : 'low'
    };
  }

  private defineSuccessCriteria(analysis: MultiIntentAnalysis): SuccessCriteria[] {
    const criteria: SuccessCriteria[] = [];
    
    // Criterio per intent primario
    criteria.push({
      criterion: 'Intent primario completato',
      measurement: 'Success rate',
      threshold: 0.9,
      importance: 'critical'
    });
    
    // Criterio per intent secondari
    if (analysis.secondaryIntents.length > 0) {
      criteria.push({
        criterion: 'Intent secondari completati',
        measurement: 'Success rate',
        threshold: 0.7,
        importance: 'important'
      });
    }
    
    // Criterio per soddisfazione utente
    criteria.push({
      criterion: 'Soddisfazione utente',
      measurement: 'User rating',
      threshold: 0.8,
      importance: 'critical'
    });
    
    return criteria;
  }

  private findCommonEntities(entities1: EntityMapping[], entities2: EntityMapping[]): string[] {
    const types1 = entities1.map(e => e.entity);
    const types2 = entities2.map(e => e.entity);
    return types1.filter(type => types2.includes(type));
  }

  private findToolAlternatives(tool: string): string[] {
    const alternatives: Record<string, string[]> = {
      'feasibility': ['market', 'comparison'],
      'market': ['feasibility'],
      'design': ['visualization']
    };
    
    return alternatives[tool] || [];
  }

  private getPriorityValue(priority: string): number {
    const values = { 'high': 3, 'medium': 2, 'low': 1 };
    return values[priority as keyof typeof values] || 1;
  }
}

// ============================================================================
// INTERFACCE DI SUPPORTO
// ============================================================================

interface IntentPattern {
  pattern: RegExp;
  entities: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

interface EntityExtractor {
  pattern: RegExp;
  confidence: number;
}

interface RelationshipRule {
  relationship: 'prerequisite' | 'complementary' | 'conflicting' | 'independent';
  strength: number;
  reasoning: string;
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const sofiaMultiIntentProcessor = new SofiaMultiIntentProcessor();
