// 🚀 URBANOVA OS 2.0 SMART - Sistema intelligente con RAG, Function Calling e Guardrails
// Entry point principale per OS 2.0 Smart con architettura avanzata

import { Planner } from './planner/Planner';
import { PlanExecutor } from './executor/PlanExecutor';
import { SkillCatalog } from './skills/SkillCatalog';
import { Arbitrator, ArbitratorDecision } from './decider/Arbitrator';
import { FallbackManager } from './decider/Fallbacks';
import { getSmartOSOrchestrator, SmartOSRequest, SmartOSResponse } from './smart/SmartOrchestrator';
import {
  ActionPlan,
  PlanExecutionResult,
  ExecutionContext,
  ExecutorOptions,
  PlannerInput,
  createExecutionContext,
} from './planner/ActionPlan';

/**
 * Request per OS 2.0
 */
export interface OS2Request {
  /** Messaggio utente */
  userMessage: string;
  
  /** Intent riconosciuto (da Classification Engine) */
  intent: string;
  
  /** Entità estratte (da Classification Engine) */
  entities: Record<string, unknown>;
  
  /** Confidence della classificazione (per Decision Layer) */
  confidence?: number;
  
  /** Classification completa (opzionale) */
  classification?: import('@/lib/urbanovaOS/ml/classificationEngine').ClassificationResult;
  
  /** User context */
  userId: string;
  userEmail: string;
  sessionId: string;
  projectId?: string;
  userRoles?: Array<'viewer' | 'editor' | 'admin'>;
  
  /** Conversation history */
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  
  /** Conferme utente ricevute */
  userConfirmations?: string[];
  
  /** Environment */
  environment?: 'development' | 'staging' | 'production';
}

/**
 * Response da OS 2.0
 */
export interface OS2Response {
  /** Success flag */
  success: boolean;
  
  /** Plan generato */
  plan: ActionPlan;
  
  /** Risultato esecuzione */
  execution: PlanExecutionResult;
  
  /** Risposta testuale per l'utente */
  response: string;
  
  /** Metadata */
  metadata: {
    planId: string;
    executionTimeMs: number;
    stepsExecuted: number;
    stepsSuccessful: number;
    stepsFailed: number;
    stepsAwaitingConfirm: number;
    
    // Decision Layer metadata
    decision?: {
      type: 'proceed' | 'clarify' | 'disambiguate';
      confidence: number;
      clarifyPrompt?: string;
      interpretations?: Array<{ intent: string; description: string }>;
    };
    
    // Fallback metadata
    fallbacksUsed?: Array<{
      originalSkillId: string;
      fallbackSkillId: string;
      reason: string;
    }>;
  };
  
  /** Errore se fallito */
  error?: {
    message: string;
    code?: string;
    failedStepIndex?: number;
  };
}

/**
 * Urbanova OS 2.0 Smart - Main Orchestrator con sistema intelligente
 */
export class UrbanovaOS2 {
  // LAZY: Tutti i componenti sono lazy - nessuna inizializzazione durante import
  private _skillCatalog: SkillCatalog | null = null;
  private _planner: Planner | null = null;
  private _executor: PlanExecutor | null = null;
  private _arbitrator: Arbitrator | null = null;
  private _fallbackManager: FallbackManager | null = null;
  private _smartOrchestrator: ReturnType<typeof getSmartOSOrchestrator> | null = null;
  
  constructor() {
    // LAZY: Tutti i componenti vengono inizializzati solo quando necessari
    // Questo evita completamente TDZ durante l'import del modulo
    // Niente viene eseguito qui - tutto è lazy tramite getter
    console.log('🚀 [OS2 Smart] Urbanova OS 2.0 Smart costruttore completato (tutti i componenti sono lazy)');
  }
  
  // LAZY getters per tutti i componenti
  private get skillCatalog() {
    if (!this._skillCatalog) {
      this._skillCatalog = SkillCatalog.getInstance();
      // Carica skill reali solo quando catalog viene accessato per la prima volta
      this.loadRealSkills();
    }
    return this._skillCatalog;
  }
  
  private get planner() {
    if (!this._planner) {
      this._planner = new Planner();
    }
    return this._planner;
  }
  
  private get executor() {
    if (!this._executor) {
      this._executor = new PlanExecutor();
    }
    return this._executor;
  }
  
  private get arbitrator() {
    if (!this._arbitrator) {
      this._arbitrator = new Arbitrator();
    }
    return this._arbitrator;
  }
  
  private get fallbackManager() {
    if (!this._fallbackManager) {
      this._fallbackManager = new FallbackManager();
    }
    return this._fallbackManager;
  }
  
  private get smartOrchestrator() {
    if (!this._smartOrchestrator) {
      this._smartOrchestrator = getSmartOSOrchestrator();
    }
    return this._smartOrchestrator;
  }
  
  /**
   * Carica skill reali nel catalog
   */
  private loadRealSkills(): void {
    try {
      const skillsModule = require('./skills/index');
      const realSkills = skillsModule.SKILLS || skillsModule.default;
      
      if (realSkills && Array.isArray(realSkills)) {
        this.skillCatalog.loadRealSkills(realSkills);
      }
    } catch (error) {
      console.warn('⚠️ [OS2] Impossibile caricare skill reali, uso placeholder');
    }
  }
  
  /**
   * Processa una richiesta completa: Decision Layer → Planner → Executor
   */
  public async process(request: OS2Request): Promise<OS2Response> {
    console.log(`🚀 [OS2] Processing request: ${request.intent}`);
    const startTime = Date.now();
    
    try {
      // 0. DECISION LAYER: Arbitrator decide se procedere
      let decisionMetadata: OS2Response['metadata']['decision'] | undefined;
      let plannerInput: PlannerInput;
      
      if (request.classification) {
        console.log(`🧠 [OS2] Step 0: Decision Layer (confidence: ${request.classification.confidence.toFixed(2)})...`);
        
        const decision = this.arbitrator.decide(
          request.classification,
          request.userMessage,
          request.userId,
          request.sessionId
        );
        
        decisionMetadata = {
          type: decision.type,
          confidence: request.classification.confidence,
        };
        
        // SCENARIO 1: Alta confidence → Proceed
        if (decision.type === 'proceed') {
          console.log('✅ [OS2] Decision: PROCEED con Planner');
          plannerInput = decision.plannerInput;
          
        // SCENARIO 2: Media confidence → Clarify
        } else if (decision.type === 'clarify') {
          console.log('⚠️ [OS2] Decision: CLARIFY richiesto');
          
          decisionMetadata.clarifyPrompt = decision.clarifyPrompt.question;
          
          // Ritorna response con richiesta chiarimento
          return this.generateClarifyResponse(decision, request, startTime);
          
        // SCENARIO 3: Bassa confidence → Disambiguate
        } else {
          console.log('❌ [OS2] Decision: DISAMBIGUATE con 2 interpretazioni');
          
          decisionMetadata.interpretations = decision.interpretations.map(i => ({
            intent: i.intent,
            description: i.description,
          }));
          
          // Ritorna response con interpretazioni
          return this.generateDisambiguateResponse(decision, request, startTime);
        }
      } else {
        // Nessuna classification fornita, procedi direttamente
        plannerInput = {
          intent: request.intent,
          entities: request.entities,
          userMessage: request.userMessage,
          conversationContext: {
            previousActions: [],
            currentProject: request.projectId ? { id: request.projectId } : undefined,
          },
          userContext: createExecutionContext(
            request.userId,
            request.sessionId,
            {
              projectId: request.projectId,
              userRoles: request.userRoles,
              environment: request.environment,
            }
          ),
        };
      }
      
      // 1. PLANNER: Genera ActionPlan
      console.log('🧠 [OS2] Step 1: Planning...');
      
      const plan = await this.planner.plan(plannerInput);
      
      console.log(`✅ [OS2] Plan generato: ${plan.steps.length} step, goal: ${plan.goal}`);
      
      // 2. EXECUTOR: Esegui ActionPlan
      console.log('⚡ [OS2] Step 2: Executing...');
      
      // Crea execution context
      const executionContext = createExecutionContext(
        request.userId,
        request.sessionId,
        {
          projectId: request.projectId,
          userRoles: request.userRoles,
          environment: request.environment,
        }
      );
      
      // Aggiungi conferme utente
      if (request.userConfirmations && request.userConfirmations.length > 0) {
        executionContext.userConfirmations = new Set(request.userConfirmations);
      }
      
      // Opzioni executor
      const executorOptions: ExecutorOptions = {
        globalTimeoutMs: 30000, // 30s
        continueOnError: false,
        skipUnconfirmed: false,
        onProgress: (stepIndex, result) => {
          console.log(`📊 [OS2] Progress: Step ${stepIndex + 1} → ${result.status}`);
        },
      };
      
      const execution = await this.executor.execute(plan, executionContext, executorOptions);
      
      console.log(`✅ [OS2] Execution completata: ${execution.status}`);
      
      // 3. RESPONSE: Genera risposta per utente
      const response = this.generateUserResponse(plan, execution);
      
      const totalTime = Date.now() - startTime;
      
      // Check fallback in execution
      const fallbacksUsed = this.extractFallbacksFromExecution(execution);
      
      return {
        success: execution.status === 'done' || execution.status === 'awaiting_confirm',
        plan,
        execution,
        response,
        metadata: {
          planId: plan.id,
          executionTimeMs: totalTime,
          stepsExecuted: execution.stepResults.length,
          stepsSuccessful: execution.successfulSteps,
          stepsFailed: execution.failedSteps,
          stepsAwaitingConfirm: execution.awaitingConfirmSteps,
          decision: decisionMetadata,
          fallbacksUsed: fallbacksUsed.length > 0 ? fallbacksUsed : undefined,
        },
        error: execution.error,
      };
      
    } catch (error) {
      console.error('❌ [OS2] Errore processing:', error);
      
      // Genera plan vuoto e execution fallita
      const errorPlan = {
        id: `plan_error_${Date.now()}`,
        goal: request.intent,
        assumptions: [],
        steps: [],
        createdAt: new Date(),
      };
      
      const errorExecution: PlanExecutionResult = {
        planId: errorPlan.id,
        status: 'error',
        stepResults: [],
        totalExecutionTimeMs: Date.now() - startTime,
        successfulSteps: 0,
        failedSteps: 0,
        awaitingConfirmSteps: 0,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
      
      return {
        success: false,
        plan: errorPlan,
        execution: errorExecution,
        response: `Mi dispiace, si è verificato un errore durante l'elaborazione della tua richiesta: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        metadata: {
          planId: errorPlan.id,
          executionTimeMs: Date.now() - startTime,
          stepsExecuted: 0,
          stepsSuccessful: 0,
          stepsFailed: 0,
          stepsAwaitingConfirm: 0,
        },
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  
  /**
   * Genera risposta testuale per l'utente dal risultato dell'execution
   */
  private generateUserResponse(plan: ActionPlan, execution: PlanExecutionResult): string {
    let response = '';
    
    // Header con goal
    response += `🎯 **${plan.goal}**\n\n`;
    
    // Status complessivo
    if (execution.status === 'done') {
      response += `✅ Completato con successo!\n\n`;
    } else if (execution.status === 'awaiting_confirm') {
      response += `⏸️ In attesa di conferma per alcuni step.\n\n`;
    } else if (execution.status === 'error') {
      response += `❌ Esecuzione fallita.\n\n`;
    } else {
      response += `🔄 In esecuzione...\n\n`;
    }
    
    // Dettagli step
    response += `📋 **Step eseguiti**: ${execution.successfulSteps}/${plan.steps.length}\n\n`;
    
    // Step details
    if (execution.stepResults.length > 0) {
      response += `**Dettagli step**:\n`;
      
      execution.stepResults.forEach((result, idx) => {
        const step = plan.steps[idx];
        const icon = result.status === 'success' ? '✅' : 
                     result.status === 'failed' ? '❌' : 
                     result.status === 'awaiting_confirm' ? '⏸️' : '🔄';
        
        response += `${icon} ${idx + 1}. ${step.name || step.skillId}`;
        
        if (result.status === 'failed' && result.error) {
          response += ` - ${result.error.message}`;
        }
        
        response += `\n`;
      });
      
      response += `\n`;
    }
    
    // Output finale
    if (execution.finalOutput) {
      response += `📊 **Risultato**:\n`;
      response += this.formatOutput(execution.finalOutput);
      response += `\n\n`;
    }
    
    // Assumptions
    if (plan.assumptions.length > 0) {
      response += `💡 **Assumptions**:\n`;
      plan.assumptions.forEach(assumption => {
        response += `- ${assumption}\n`;
      });
      response += `\n`;
    }
    
    // Risks
    if (plan.risks && plan.risks.length > 0) {
      response += `⚠️ **Rischi**:\n`;
      plan.risks.forEach(risk => {
        response += `- ${risk}\n`;
      });
      response += `\n`;
    }
    
    // Conferme richieste
    if (execution.awaitingConfirmSteps > 0) {
      response += `⏸️ **Conferme richieste**:\n`;
      execution.stepResults
        .filter(r => r.status === 'awaiting_confirm')
        .forEach(r => {
          const step = plan.steps[r.stepIndex];
          response += `- ${step.name || step.skillId}: ${step.description || 'Richiede approvazione'}\n`;
        });
      response += `\n`;
    }
    
    // Timing
    response += `⏱️ Tempo di esecuzione: ${execution.totalExecutionTimeMs}ms\n`;
    
    return response;
  }
  
  /**
   * Formatta output per visualizzazione
   */
  private formatOutput(output: unknown): string {
    if (typeof output === 'string') {
      return output;
    }
    
    if (typeof output === 'object' && output !== null) {
      return JSON.stringify(output, null, 2);
    }
    
    return String(output);
  }
  
  /**
   * Genera response per richiesta chiarimento
   */
  private generateClarifyResponse(
    decision: ArbitratorDecision & { type: 'clarify' },
    request: OS2Request,
    startTime: number
  ): OS2Response {
    const emptyPlan: ActionPlan = {
      id: `plan_clarify_${Date.now()}`,
      goal: 'Richiesta chiarimento',
      assumptions: [],
      steps: [],
      createdAt: new Date(),
    };
    
    const emptyExecution: PlanExecutionResult = {
      planId: emptyPlan.id,
      status: 'awaiting_confirm',
      stepResults: [],
      totalExecutionTimeMs: 0,
      successfulSteps: 0,
      failedSteps: 0,
      awaitingConfirmSteps: 0,
      startedAt: new Date(),
    };
    
    return {
      success: false,
      plan: emptyPlan,
      execution: emptyExecution,
      response: decision.clarifyPrompt.question,
      metadata: {
        planId: emptyPlan.id,
        executionTimeMs: Date.now() - startTime,
        stepsExecuted: 0,
        stepsSuccessful: 0,
        stepsFailed: 0,
        stepsAwaitingConfirm: 0,
        decision: {
          type: 'clarify',
          confidence: decision.clarifyPrompt.context.confidence,
          clarifyPrompt: decision.clarifyPrompt.question,
        },
      },
    };
  }
  
  /**
   * Genera response per disambiguazione
   */
  private generateDisambiguateResponse(
    decision: ArbitratorDecision & { type: 'disambiguate' },
    request: OS2Request,
    startTime: number
  ): OS2Response {
    const emptyPlan: ActionPlan = {
      id: `plan_disambiguate_${Date.now()}`,
      goal: 'Disambiguazione intent',
      assumptions: [],
      steps: [],
      createdAt: new Date(),
    };
    
    const emptyExecution: PlanExecutionResult = {
      planId: emptyPlan.id,
      status: 'awaiting_confirm',
      stepResults: [],
      totalExecutionTimeMs: 0,
      successfulSteps: 0,
      failedSteps: 0,
      awaitingConfirmSteps: 0,
      startedAt: new Date(),
    };
    
    // Formatta risposta con le 2 interpretazioni
    let response = `Non sono sicuro di aver capito bene. Intendi:\n\n`;
    
    decision.interpretations.forEach((interp, idx) => {
      response += `**${idx + 1}. ${interp.description}**\n`;
      response += `${interp.example}\n\n`;
    });
    
    response += `Scegli l'opzione che preferisci!`;
    
    return {
      success: false,
      plan: emptyPlan,
      execution: emptyExecution,
      response,
      metadata: {
        planId: emptyPlan.id,
        executionTimeMs: Date.now() - startTime,
        stepsExecuted: 0,
        stepsSuccessful: 0,
        stepsFailed: 0,
        stepsAwaitingConfirm: 0,
        decision: {
          type: 'disambiguate',
          confidence: decision.interpretations[0].confidence,
          interpretations: decision.interpretations.map(i => ({
            intent: i.intent,
            description: i.description,
          })),
        },
      },
    };
  }
  
  /**
   * Estrae fallback usati dall'execution
   */
  private extractFallbacksFromExecution(execution: PlanExecutionResult): Array<{
    originalSkillId: string;
    fallbackSkillId: string;
    reason: string;
  }> {
    const fallbacks: Array<{
      originalSkillId: string;
      fallbackSkillId: string;
      reason: string;
    }> = [];
    
    // Analizza step results per trovare fallback
    execution.stepResults.forEach((result, idx) => {
      if (result.status === 'failed' && this.fallbackManager.hasFallback(result.skillId)) {
        // Questo step potrebbe aver usato fallback
        // (logica semplificata, in versione completa traccia effettivamente i fallback)
        fallbacks.push({
          originalSkillId: result.skillId,
          fallbackSkillId: 'fallback_unknown',
          reason: 'Step fallito con fallback disponibile',
        });
      }
    });
    
    return fallbacks;
  }
  
  /**
   * Processa una richiesta utente con il sistema OS 2.0 Smart
   */
  async processRequestSmart(input: OsRequest): Promise<OsResponse> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}`;
    
    try {
      console.log(`🎯 [OS2 Smart] Processo richiesta ${requestId}:`, input.message);
      
      // Usa il sistema intelligente per processare la richiesta
      const smartResponse = await this.smartOrchestrator.processRequest(input);
      
      console.log(`📥 [OS2 Smart] Risposta ricevuta:`, {
        success: smartResponse.success,
        hasResponse: !!smartResponse.response,
        response: smartResponse.response?.substring(0, 100) + '...',
        requiresConfirmation: smartResponse.requiresConfirmation,
        reasoning: smartResponse.reasoning
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ [OS2 Smart] Richiesta ${requestId} completata in ${duration}ms`);
      
      return {
        success: true,
        response: smartResponse.response,
        functionCalls: smartResponse.functionCalls || [],
        artifacts: smartResponse.artifacts || [],
        kpis: smartResponse.kpis || [],
        requestId,
        duration,
        plan: smartResponse.plan || [],
        smart: true, // Indica che è stata usata la modalità smart
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [OS2 Smart] Errore richiesta ${requestId}:`, error);
      
      // Fallback al sistema tradizionale in caso di errore
      console.log(`🔄 [OS2 Smart] Fallback al sistema tradizionale...`);
      return await this.processRequest(input);
    }
  }

  /**
   * Health check OS 2.0
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      planner: boolean;
      executor: boolean;
      skillCatalog: boolean;
    };
    skillCount: number;
  }> {
    const skills = this.skillCatalog.list();
    
    return {
      status: 'healthy',
      components: {
        planner: !!this.planner,
        executor: !!this.executor,
        skillCatalog: !!this.skillCatalog,
      },
      skillCount: skills.length,
    };
  }
}

// Singleton instance
let os2Instance: UrbanovaOS2 | null = null;

/**
 * Ottiene istanza singleton di OS 2.0
 */
export function getOS2(): UrbanovaOS2 {
  if (!os2Instance) {
    os2Instance = new UrbanovaOS2();
  }
  return os2Instance;
}

// Export types
export type { OS2Request, OS2Response };
export { Planner } from './planner/Planner';
export { PlanExecutor } from './executor/PlanExecutor';
export { SkillCatalog } from './skills/SkillCatalog';
export * from './planner/ActionPlan';

