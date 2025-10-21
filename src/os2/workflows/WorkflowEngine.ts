/**
 * 🔄 WORKFLOW ENGINE - Sistema per workflow multi-step
 * 
 * Gestisce sequenze di skill complesse con:
 * - Context preservation tra step
 * - Branching condizionale
 * - Rollback su errori
 * - Progress tracking
 */

import { SkillCatalog } from '../skills/SkillCatalog';
import { SkillExecutionContext } from '../skills/Skill';

export interface WorkflowStep {
  id: string;
  skillId: string;
  inputs: Record<string, any>;
  condition?: (context: WorkflowContext) => boolean;
  onSuccess?: (result: any, context: WorkflowContext) => void;
  onFailure?: (error: Error, context: WorkflowContext) => void;
}

export interface WorkflowContext {
  workflowId: string;
  userId: string;
  userEmail: string;
  sessionId: string;
  projectId?: string;
  currentStep: number;
  completedSteps: string[];
  failedSteps: string[];
  stepResults: Map<string, any>;
  metadata: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  workflowId: string;
  completedSteps: string[];
  failedSteps: string[];
  results: Map<string, any>;
  duration: number;
  error?: string;
}

export class WorkflowEngine {
  private skillCatalog: SkillCatalog;
  private activeWorkflows = new Map<string, WorkflowContext>();

  constructor() {
    this.skillCatalog = SkillCatalog.getInstance();
    console.log('🔄 [WorkflowEngine] Inizializzato');
  }

  /**
   * Esegue un workflow completo
   */
  async executeWorkflow(
    steps: WorkflowStep[],
    initialContext: Partial<WorkflowContext>
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const workflowId = `workflow_${Date.now()}`;

    // Inizializza context
    const context: WorkflowContext = {
      workflowId,
      userId: initialContext.userId || 'anonymous',
      userEmail: initialContext.userEmail || '',
      sessionId: initialContext.sessionId || Date.now().toString(),
      projectId: initialContext.projectId,
      currentStep: 0,
      completedSteps: [],
      failedSteps: [],
      stepResults: new Map(),
      metadata: initialContext.metadata || {},
    };

    this.activeWorkflows.set(workflowId, context);

    console.log(`🔄 [WorkflowEngine] Avvio workflow ${workflowId} con ${steps.length} step`);

    try {
      // Esegui ogni step in sequenza
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        context.currentStep = i;

        console.log(`🔄 [WorkflowEngine] Step ${i + 1}/${steps.length}: ${step.skillId}`);

        // Check condizione
        if (step.condition && !step.condition(context)) {
          console.log(`⏭️ [WorkflowEngine] Step ${step.id} skipped (condizione non soddisfatta)`);
          continue;
        }

        // Esegui skill
        try {
          const result = await this.executeStep(step, context);
          
          // Salva risultato
          context.stepResults.set(step.id, result);
          context.completedSteps.push(step.id);

          // Callback success
          if (step.onSuccess) {
            step.onSuccess(result, context);
          }

          console.log(`✅ [WorkflowEngine] Step ${step.id} completato`);

        } catch (error) {
          console.error(`❌ [WorkflowEngine] Step ${step.id} fallito:`, error);
          
          context.failedSteps.push(step.id);

          // Callback failure
          if (step.onFailure) {
            step.onFailure(error as Error, context);
          }

          // Rollback se necessario
          await this.rollbackWorkflow(context, i);

          throw error;
        }
      }

      // Workflow completato
      const duration = Date.now() - startTime;
      console.log(`✅ [WorkflowEngine] Workflow ${workflowId} completato in ${duration}ms`);

      return {
        success: true,
        workflowId,
        completedSteps: context.completedSteps,
        failedSteps: context.failedSteps,
        results: context.stepResults,
        duration,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [WorkflowEngine] Workflow ${workflowId} fallito:`, error);

      return {
        success: false,
        workflowId,
        completedSteps: context.completedSteps,
        failedSteps: context.failedSteps,
        results: context.stepResults,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

    } finally {
      // Cleanup
      this.activeWorkflows.delete(workflowId);
    }
  }

  /**
   * Esegue un singolo step
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<any> {
    const skill = this.skillCatalog.get(step.skillId);

    if (!skill) {
      throw new Error(`Skill '${step.skillId}' non trovato`);
    }

    // Prepara execution context
    const executionContext: SkillExecutionContext = {
      userId: context.userId,
      userEmail: context.userEmail,
      sessionId: context.sessionId,
      projectId: context.projectId,
      osMode: 'smart',
      requestId: `${context.workflowId}_${step.id}`,
    };

    // Risolvi inputs dinamici (possono riferirsi a risultati precedenti)
    const resolvedInputs = this.resolveInputs(step.inputs, context);

    // Esegui skill
    return await skill.execute(resolvedInputs, executionContext);
  }

  /**
   * Risolve inputs dinamici
   */
  private resolveInputs(
    inputs: Record<string, any>,
    context: WorkflowContext
  ): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(inputs)) {
      // Se value è una funzione, eseguila con context
      if (typeof value === 'function') {
        resolved[key] = value(context);
      }
      // Se value è un riferimento a step precedente ($stepId.field)
      else if (typeof value === 'string' && value.startsWith('$')) {
        const [stepId, field] = value.substring(1).split('.');
        const stepResult = context.stepResults.get(stepId);
        resolved[key] = field ? stepResult?.[field] : stepResult;
      }
      // Altrimenti usa valore diretto
      else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Rollback workflow su errore
   */
  private async rollbackWorkflow(
    context: WorkflowContext,
    failedStepIndex: number
  ): Promise<void> {
    console.log(`🔄 [WorkflowEngine] Rollback workflow da step ${failedStepIndex}...`);

    // TODO: Implementare rollback specifico per ogni skill
    // Per ora, solo log
    for (let i = failedStepIndex - 1; i >= 0; i--) {
      const stepId = context.completedSteps[i];
      console.log(`↩️ [WorkflowEngine] Rollback step ${stepId}`);
    }
  }

  /**
   * Ottieni workflow attivo
   */
  getActiveWorkflow(workflowId: string): WorkflowContext | null {
    return this.activeWorkflows.get(workflowId) || null;
  }

  /**
   * Lista workflow attivi
   */
  getActiveWorkflows(): WorkflowContext[] {
    return Array.from(this.activeWorkflows.values());
  }
}

/**
 * Workflow Templates Predefiniti
 */
export class WorkflowTemplates {
  /**
   * Workflow: Analisi Fattibilità → Business Plan
   */
  static feasibilityToBusinessPlan(
    location: string,
    landArea: number,
    units: number
  ): WorkflowStep[] {
    return [
      {
        id: 'step1_feasibility',
        skillId: 'feasibility.analyze',
        inputs: {
          landArea,
          constructionCostPerSqm: 1200,
          salePrice: 3000,
        },
      },
      {
        id: 'step2_save_feasibility',
        skillId: 'feasibility.save',
        inputs: {
          data: (ctx: WorkflowContext) => ctx.stepResults.get('step1_feasibility'),
        },
        condition: (ctx) => ctx.stepResults.get('step1_feasibility')?.roi > 0.2,
      },
      {
        id: 'step3_business_plan',
        skillId: 'business_plan.calculate',
        inputs: {
          projectName: `Progetto ${location}`,
          units,
          salePrice: 3000,
          constructionCost: 1200,
          landScenarios: [
            { price: 500, area: landArea },
            { price: 600, area: landArea * 1.2 },
          ],
        },
        condition: (ctx) => ctx.stepResults.get('step1_feasibility')?.roi > 0.15,
      },
    ];
  }

  /**
   * Workflow: Business Plan → Sensitivity → Export
   */
  static businessPlanComplete(projectName: string): WorkflowStep[] {
    return [
      {
        id: 'step1_bp_calculate',
        skillId: 'business_plan.calculate',
        inputs: {
          projectName,
          units: 10,
          salePrice: 3000,
          constructionCost: 1200,
          landScenarios: [
            { price: 500, area: 1000 },
            { price: 600, area: 1200 },
          ],
        },
      },
      {
        id: 'step2_sensitivity',
        skillId: 'business_plan.sensitivity',
        inputs: {
          baseScenario: '$step1_bp_calculate',
          variations: {
            salePrice: [-10, 0, 10],
            constructionCost: [-5, 0, 5],
          },
        },
      },
      {
        id: 'step3_export',
        skillId: 'business_plan.export',
        inputs: {
          businessPlan: '$step1_bp_calculate',
          format: 'pdf',
        },
      },
    ];
  }

  /**
   * Workflow: Project Creation → Email Notification
   */
  static projectCreationWithNotification(
    projectType: 'feasibility' | 'business_plan',
    recipients: string[]
  ): WorkflowStep[] {
    return [
      {
        id: 'step1_create',
        skillId: projectType === 'feasibility' ? 'feasibility.analyze' : 'business_plan.calculate',
        inputs: projectType === 'feasibility' 
          ? { landArea: 1000, constructionCostPerSqm: 1200, salePrice: 3000 }
          : { projectName: 'Nuovo Progetto', units: 8, salePrice: 3000, constructionCost: 1200, landScenarios: [] },
      },
      {
        id: 'step2_notify',
        skillId: 'email.send',
        inputs: {
          recipients,
          subject: `Nuovo ${projectType === 'feasibility' ? 'Analisi Fattibilità' : 'Business Plan'} creato`,
          body: (ctx: WorkflowContext) => {
            const result = ctx.stepResults.get('step1_create');
            return `Il tuo progetto è stato creato con successo!\n\nRisultati: ${JSON.stringify(result, null, 2)}`;
          },
        },
      },
    ];
  }
}

/**
 * Singleton per Workflow Engine
 */
let workflowEngineInstance: WorkflowEngine | null = null;

export function getWorkflowEngine(): WorkflowEngine {
  if (!workflowEngineInstance) {
    workflowEngineInstance = new WorkflowEngine();
  }
  return workflowEngineInstance;
}

