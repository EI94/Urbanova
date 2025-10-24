// ⚡ PLAN EXECUTOR - Esecuzione intelligente di ActionPlan
// Sistema di esecuzione con retry, backoff, conferme e idempotenza

import {
  ActionPlan,
  OsActionStep,
  PlanExecutionResult,
  StepExecutionResult,
  ExecutionContext,
  ExecutorOptions,
  DEFAULT_RETRY_CONFIG,
  OsMode,
} from '../planner/ActionPlan';
import { SkillCatalog, Skill } from '../skills/SkillCatalog';
import { getRbacEnforcer, UserRole } from '../security/Rbac';
import { getGuardrail } from '../security/Guardrail';
import { getAuditLog, AuditEvent } from '../audit/AuditLog';
import { getMetrics } from '../telemetry/metrics';
import { getEventBus, PlanStartedEvent, StepStartedEvent, StepSucceededEvent, StepFailedEvent, PlanCompletedEvent } from '../events/EventBus';
import { getSkillStatusLine } from '../conversation/systemPrompt';
import osTranslations from '../../../i18n/it/os2.json';
import { BudgetSuppliersEvents, BudgetSuppliersStatusMessages } from '../../modules/budgetSuppliers/osTools/tools';

/**
 * Audit Log Entry
 */
interface AuditLogEntry {
  timestamp: Date;
  planId: string;
  stepIndex: number;
  skillId: string;
  osMode: OsMode;
  action: 'executed' | 'skipped' | 'preview_shown' | 'confirmed' | 'rejected';
  userId: string;
  reason?: string;
}

/**
 * Audit Logger per tracciare modalità usate
 */
class AuditLogger {
  private logs: AuditLogEntry[] = [];
  
  log(entry: Omit<AuditLogEntry, 'timestamp'>) {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    this.logs.push(fullEntry);
    
    console.log(`📋 [Audit] ${entry.osMode.toUpperCase()} - ${entry.action} - ${entry.skillId}`, {
      reason: entry.reason,
    });
    
    // In production, invia a servizio audit
    // await sendToAuditService(fullEntry);
  }
  
  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }
  
  getLogsForPlan(planId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.planId === planId);
  }
  
  getAuditLogsForPlan(planId: string): AuditLogEntry[] {
    return this.getLogsForPlan(planId);
  }
}

const auditLogger = new AuditLogger();

/**
 * Executor che esegue ActionPlan step-by-step
 */
export class PlanExecutor {
  private skillCatalog: SkillCatalog;
  private rbacEnforcer = getRbacEnforcer();
  private guardrail = getGuardrail();
  private auditLog = getAuditLog();
  private metrics = getMetrics();
  private eventBus = getEventBus();
  
  constructor() {
    this.skillCatalog = SkillCatalog.getInstance();
  }
  
  /**
   * Gestisce eventi Budget Suppliers per status tracking
   */
  private handleBudgetSuppliersEvents(skillId: string, event: string, data?: any) {
    if (skillId.startsWith('budget_suppliers.')) {
      const statusMessage = BudgetSuppliersStatusMessages[event as keyof typeof BudgetSuppliersStatusMessages];
      if (statusMessage) {
        // Emetti evento per LiveTicker
        this.eventBus.emit({
          type: 'budget_suppliers_status',
          skillId,
          status: statusMessage,
          data,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Esegue un ActionPlan completo rispettando la modalità OS
   */
  public async execute(
    plan: ActionPlan,
    context: ExecutionContext,
    options: ExecutorOptions = {}
  ): Promise<PlanExecutionResult> {
    const osMode = options.osMode || 'ask_to_act'; // Default: ask_to_act
    console.log(`⚡ [Executor] Esecuzione plan ${plan.id} con ${plan.steps.length} step [MODE: ${osMode.toUpperCase()}]`);
    
    const startTime = Date.now();
    const stepResults: StepExecutionResult[] = [];
    let successfulSteps = 0;
    let failedSteps = 0;
    let awaitingConfirmSteps = 0;
    let skippedSteps = 0;
    
    // ✨ EMIT PLAN_STARTED EVENT ✨
    const planStartedEvent: PlanStartedEvent = {
      type: 'plan_started',
      planId: plan.id,
      userId: context.userId,
      sessionId: context.sessionId,
      projectId: context.projectId,
      stepsCount: plan.steps.length,
      timestamp: Date.now(),
    };
    
    this.eventBus.emit(planStartedEvent);
    
    // Legacy callback support
    if (options.onPlanStarted) {
      try {
        options.onPlanStarted(plan.id);
      } catch (error) {
        console.warn('⚠️ [Executor] Error in onPlanStarted callback:', error);
      }
    }
    
    // Setup retry config
    const retryConfig = options.retry || DEFAULT_RETRY_CONFIG;
    
    // Esegui ogni step in sequenza
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      
      // Controlla timeout globale PRIMA di eseguire step
      const elapsedTime = Date.now() - startTime;
      if (options.globalTimeoutMs && elapsedTime > options.globalTimeoutMs) {
        console.warn(`⏱️ [Executor] Timeout globale raggiunto (${elapsedTime}ms > ${options.globalTimeoutMs}ms), stop esecuzione`);
        
        // Aggiungi result per step skippati
        stepResults.push({
          stepIndex: i,
          skillId: step.skillId,
          status: 'skipped',
          error: {
            message: 'Skipped per timeout globale',
            code: 'GLOBAL_TIMEOUT',
            retryable: false,
          },
          attemptCount: 0,
          executionTimeMs: 0,
          timestamp: new Date(),
        });
        
        break;
      }
      
      // ✨ CHECK RBAC ✨
      const skill = this.skillCatalog.get(step.skillId);
      const rbacCheck = this.rbacEnforcer.canExecuteSkill(
        context.userRoles as UserRole[],
        step.skillId,
        skill?.meta
      );
      
      if (!rbacCheck.allowed) {
        console.log(`🔒 [Executor] Step ${i + 1} blocked per RBAC: ${rbacCheck.reason}`);
        
        stepResults.push({
          stepIndex: i,
          skillId: step.skillId,
          status: 'failed',
          error: {
            message: rbacCheck.reason || 'Permission denied',
            code: 'RBAC_DENIED',
            retryable: false,
          },
          attemptCount: 0,
          executionTimeMs: 0,
          timestamp: new Date(),
        });
        
        failedSteps++;
        
        // Log audit
        await this.auditLog.log({
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: (context.userRoles as UserRole[])[0],
          action: 'rbac_denied',
          skillId: step.skillId,
          planId: plan.id,
          stepIndex: i,
          osMode,
          success: false,
          errorMessage: rbacCheck.reason,
        });
        
        auditLogger.log({
          planId: plan.id,
          stepIndex: i,
          skillId: step.skillId,
          osMode,
          action: 'skipped',
          userId: context.userId,
          reason: `RBAC: ${rbacCheck.reason}`,
        });
        
        continue;
      }
      
      // ✨ CHECK OS MODE BEHAVIOR ✨
      const shouldSkip = await this.shouldSkipStepForMode(step, skill, osMode, plan.id, i, context);
      
      if (shouldSkip) {
        console.log(`⏭️ [Executor] Step ${i + 1} skipped per modalità ${osMode.toUpperCase()}`);
        
        stepResults.push({
          stepIndex: i,
          skillId: step.skillId,
          status: 'skipped',
          error: {
            message: `Skipped in modalità ${osMode}`,
            code: 'MODE_SKIP',
            retryable: false,
          },
          attemptCount: 0,
          executionTimeMs: 0,
          timestamp: new Date(),
        });
        
        skippedSteps++;
        
        auditLogger.log({
          planId: plan.id,
          stepIndex: i,
          skillId: step.skillId,
          osMode,
          action: 'skipped',
          userId: context.userId,
          reason: `Mode ${osMode} prevented execution`,
        });
        
        // Log audit persistente
        await this.auditLog.log({
          userId: context.userId,
          userEmail: context.userEmail,
          action: 'skipped',
          skillId: step.skillId,
          planId: plan.id,
          stepIndex: i,
          osMode,
          sideEffects: skill?.meta.sideEffects,
        });
        
        continue;
      }
      
      // ✨ PREVIEW STEP (Ask-to-Act mode) ✨
      if (osMode === 'ask_to_act' && this.requiresPreview(step, skill)) {
        const previewAccepted = await this.showPreview(step, skill, options, plan.id, i, context);
        
        if (!previewAccepted) {
          console.log(`❌ [Executor] Step ${i + 1} rejected by user (preview)`);
          
          stepResults.push({
            stepIndex: i,
            skillId: step.skillId,
            status: 'skipped',
            error: {
              message: 'Rejected by user in preview',
              code: 'USER_REJECT',
              retryable: false,
            },
            attemptCount: 0,
            executionTimeMs: 0,
            timestamp: new Date(),
          });
          
          skippedSteps++;
          
          auditLogger.log({
            planId: plan.id,
            stepIndex: i,
            skillId: step.skillId,
            osMode,
            action: 'rejected',
            userId: context.userId,
            reason: 'User rejected preview',
          });
          
          continue;
        }
      }
      
      console.log(`🔄 [Executor] Esecuzione step ${i + 1}/${plan.steps.length}: ${step.skillId}`);
      
      // ✨ EMIT STEP_STARTED EVENT ✨
      const statusLabel = this.getStepLabel(step.skillId, step.name);
      
      const stepStartedEvent: StepStartedEvent = {
        type: 'step_started',
        planId: plan.id,
        userId: context.userId,
        sessionId: context.sessionId,
        stepIndex: i,
        stepId: `step_${i}`,
        skillId: step.skillId,
        label: statusLabel,
        projectId: context.projectId,
        timestamp: Date.now(),
      };
      
      this.eventBus.emit(stepStartedEvent);
      
      // Legacy callback support
      if (options.onStepStarted) {
        try {
          options.onStepStarted(i, step.skillId, statusLabel);
        } catch (error) {
          console.warn('⚠️ [Executor] Error in onStepStarted callback:', error);
        }
      }
      
      // Esegui step con retry
      const result = await this.executeStepWithRetry(
        step,
        i,
        context,
        retryConfig
      );
      
      stepResults.push(result);
      
      // Aggiorna contatori
      if (result.status === 'success') {
        successfulSteps++;
        
        // Log audit (in-memory)
        auditLogger.log({
          planId: plan.id,
          stepIndex: i,
          skillId: step.skillId,
          osMode,
          action: 'executed',
          userId: context.userId,
        });
        
        // Log audit persistente (Firestore)
        await this.auditLog.log({
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: (context.userRoles as UserRole[])[0],
          action: 'executed',
          skillId: step.skillId,
          skillName: skill?.meta.summary,
          planId: plan.id,
          stepIndex: i,
          projectId: context.projectId,
          osMode,
          inputs: step.inputs as Record<string, unknown>,
          outputs: result.output as Record<string, unknown>,
          sideEffects: skill?.meta.sideEffects,
          duration: result.executionTimeMs,
          success: true,
        });
        
        // ✨ EMIT SKILL METRICS ✨
        await this.metrics.trackSkill({
          skillId: step.skillId,
          planId: plan.id,
          userId: context.userId,
          latencyMs: result.executionTimeMs,
          success: true,
          osMode,
        });
        
        // ✨ EMIT STEP_SUCCEEDED EVENT ✨
        const stepSucceededEvent: StepSucceededEvent = {
          type: 'step_succeeded',
          planId: plan.id,
          userId: context.userId,
          sessionId: context.sessionId,
          stepIndex: i,
          stepId: `step_${i}`,
          skillId: step.skillId,
          duration: result.executionTimeMs,
          timestamp: Date.now(),
        };
        
        this.eventBus.emit(stepSucceededEvent);
        
        // Legacy callback support
        if (options.onStepCompleted) {
          try {
            options.onStepCompleted(i, true);
          } catch (error) {
            console.warn('⚠️ [Executor] Error in onStepCompleted callback:', error);
          }
        }
      } else if (result.status === 'failed') {
        failedSteps++;
        
        // ✨ EMIT STEP_FAILED EVENT ✨
        const stepFailedEvent: StepFailedEvent = {
          type: 'step_failed',
          planId: plan.id,
          userId: context.userId,
          sessionId: context.sessionId,
          stepIndex: i,
          stepId: `step_${i}`,
          skillId: step.skillId,
          message: this.sanitizeErrorMessage(result.error?.message || 'Step failed'),
          duration: result.executionTimeMs,
          timestamp: Date.now(),
        };
        
        this.eventBus.emit(stepFailedEvent);
        
        // Stop esecuzione se errore critico e continueOnError=false
        if (!options.continueOnError) {
          console.error(`❌ [Executor] Step ${i} fallito, stop esecuzione`);
          break;
        }
      } else if (result.status === 'awaiting_confirm') {
        awaitingConfirmSteps++;
        
        // Skip step successivi se conferma non ricevuta
        if (options.skipUnconfirmed) {
          console.warn(`⏭️ [Executor] Conferma non ricevuta, skip step rimanenti`);
          break;
        }
      }
      
      // Callback progress (chiama sempre, anche per awaiting_confirm)
      if (options.onProgress) {
        try {
          options.onProgress(i, result);
        } catch (callbackError) {
          console.warn(`⚠️ [Executor] Errore in onProgress callback:`, callbackError);
        }
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    // Determina status complessivo
    let overallStatus: PlanExecutionResult['status'];
    if (awaitingConfirmSteps > 0) {
      overallStatus = 'awaiting_confirm';
    } else if (failedSteps > 0) {
      overallStatus = 'error';
    } else if (successfulSteps === plan.steps.length) {
      overallStatus = 'done';
    } else {
      overallStatus = 'running';
    }
    
    // ✨ EMIT METRICS ✨
    await this.metrics.trackPlan({
      planId: plan.id,
      userId: context.userId,
      projectId: context.projectId,
      osMode,
      confidence: plan.metadata?.confidence || 0.5,
      stepsCount: plan.steps.length,
      totalTimeMs: totalTime,
      successfulSteps,
      failedSteps,
    });
    
    // ✨ EMIT PLAN_COMPLETED EVENT ✨
    const planCompletedEvent: PlanCompletedEvent = {
      type: 'plan_completed',
      planId: plan.id,
      userId: context.userId,
      sessionId: context.sessionId,
      duration: totalTime,
      successfulSteps,
      failedSteps,
      success: overallStatus === 'done',
      timestamp: Date.now(),
    };
    
    this.eventBus.emit(planCompletedEvent);
    
    // Legacy callback support
    if (options.onPlanCompleted) {
      try {
        options.onPlanCompleted(
          plan.id,
          overallStatus === 'done',
          totalTime
        );
      } catch (error) {
        console.warn('⚠️ [Executor] Error in onPlanCompleted callback:', error);
      }
    }
    
    const result: PlanExecutionResult = {
      planId: plan.id,
      status: overallStatus,
      stepResults,
      totalExecutionTimeMs: totalTime,
      successfulSteps,
      failedSteps,
      awaitingConfirmSteps,
      skippedSteps,
      startedAt: new Date(startTime),
      completedAt: new Date(),
      metadata: {
        osMode, // ✨ Traccia modalità usata
      },
    };
    
    // Aggiungi errore se fallito
    if (failedSteps > 0) {
      const firstFailure = stepResults.find(r => r.status === 'failed');
      result.error = {
        message: firstFailure?.error?.message || 'Esecuzione fallita',
        failedStepIndex: firstFailure ? stepResults.indexOf(firstFailure) : undefined,
      };
    }
    
    // Aggrega output finale (output dell'ultimo step successful)
    const lastSuccessful = stepResults
      .reverse()
      .find(r => r.status === 'success');
    
    if (lastSuccessful) {
      result.finalOutput = lastSuccessful.output;
    }
    
    console.log(`✅ [Executor] Plan completato: ${overallStatus}, ${successfulSteps}/${plan.steps.length} step OK`);
    
    return result;
  }
  
  /**
   * Esegue un singolo step con retry e backoff
   */
  private async executeStepWithRetry(
    step: OsActionStep,
    stepIndex: number,
    context: ExecutionContext,
    retryConfig: typeof DEFAULT_RETRY_CONFIG
  ): Promise<StepExecutionResult> {
    const stepStartTime = Date.now();
    
    // Recupera skill dal catalog
    const skill = this.skillCatalog.get(step.skillId);
    
    if (!skill) {
      return {
        stepIndex,
        skillId: step.skillId,
        status: 'failed',
        error: {
          message: `Skill ${step.skillId} non trovata nel catalog`,
          code: 'SKILL_NOT_FOUND',
          retryable: false,
        },
        attemptCount: 0,
        executionTimeMs: Date.now() - stepStartTime,
        timestamp: new Date(),
      };
    }
    
    // Controlla RBAC PRIMA della conferma (permessi hanno priorità)
    if (skill.meta.rbac && skill.meta.rbac.length > 0) {
      const hasPermission = context.userRoles?.some(role => 
        skill.meta.rbac?.includes(role)
      );
      
      if (!hasPermission) {
        console.error(`❌ [Executor] Permessi insufficienti per ${step.skillId}`);
        
        return {
          stepIndex,
          skillId: step.skillId,
          status: 'failed',
          error: {
            message: `Permessi insufficienti per ${step.skillId}. Richiede: ${skill.meta.rbac.join(' o ')}`,
            code: 'PERMISSION_DENIED',
            retryable: false,
          },
          attemptCount: 0,
          executionTimeMs: Date.now() - stepStartTime,
          timestamp: new Date(),
        };
      }
    }
    
    // Controlla se richiede conferma (dopo RBAC check)
    if (step.confirm || skill.meta.requiresConfirm) {
      // Verifica se conferma è stata ricevuta
      if (!context.userConfirmations?.has(step.skillId)) {
        console.warn(`⚠️ [Executor] Step ${stepIndex} richiede conferma non ricevuta: ${step.skillId}`);
        
        return {
          stepIndex,
          skillId: step.skillId,
          status: 'awaiting_confirm',
          attemptCount: 0,
          executionTimeMs: Date.now() - stepStartTime,
          timestamp: new Date(),
        };
      }
    }
    
    // Esegui con retry
    let lastError: { message: string; code?: string; retryable?: boolean } | undefined;
    
    for (let attempt = 0; attempt < retryConfig.maxAttempts; attempt++) {
      try {
        console.log(`🔄 [Executor] Tentativo ${attempt + 1}/${retryConfig.maxAttempts} per step ${stepIndex}`);
        
        // Esegui skill
        const output = await this.executeSkill(skill, step.inputs, context);
        
        // Success!
        return {
          stepIndex,
          skillId: step.skillId,
          status: 'success',
          output,
          attemptCount: attempt + 1,
          executionTimeMs: Date.now() - stepStartTime,
          timestamp: new Date(),
        };
        
      } catch (error) {
        console.error(`❌ [Executor] Tentativo ${attempt + 1} fallito:`, error);
        
        lastError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: (error as { code?: string }).code,
          retryable: true,
        };
        
        // Se non è l'ultimo tentativo, aspetta backoff
        if (attempt < retryConfig.maxAttempts - 1) {
          const backoffMs = retryConfig.backoffMs[attempt] || 1000;
          const jitter = retryConfig.useJitter ? Math.random() * 200 : 0;
          const waitMs = backoffMs + jitter;
          
          console.log(`⏳ [Executor] Backoff ${waitMs}ms prima del prossimo tentativo`);
          await this.sleep(waitMs);
        }
      }
    }
    
    // Tutti i tentativi falliti
    return {
      stepIndex,
      skillId: step.skillId,
      status: 'failed',
      error: lastError,
      attemptCount: retryConfig.maxAttempts,
      executionTimeMs: Date.now() - stepStartTime,
      timestamp: new Date(),
    };
  }
  
  /**
   * Esegue una skill con validazione e timeout
   */
  private async executeSkill(
    skill: Skill,
    inputs: unknown,
    context: ExecutionContext
  ): Promise<unknown> {
    // Validazione inputs (se implementata)
    if (skill.validateInputs) {
      const validation = await skill.validateInputs(inputs);
      if (validation !== true) {
        throw new Error(`Validazione inputs fallita: ${validation}`);
      }
    }
    
    // Setup skill execution context
    const skillContext = {
      userId: context.userId,
      sessionId: context.sessionId,
      projectId: context.projectId,
      userRoles: context.userRoles || ['viewer'],
      environment: context.environment,
      metadata: context.metadata,
    };
    
    // Esegui con timeout (usa latency budget della skill)
    const timeoutMs = skill.meta.latencyBudgetMs || 10000;
    
    const executePromise = skill.execute(inputs, skillContext);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Skill timeout dopo ${timeoutMs}ms`)), timeoutMs);
    });
    
    return await Promise.race([executePromise, timeoutPromise]);
  }
  
  /**
   * Helper sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Valida un ActionPlan prima dell'esecuzione
   */
  public validatePlan(plan: ActionPlan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Controlla che ci siano step
    if (plan.steps.length === 0) {
      errors.push('Plan vuoto: nessuno step da eseguire');
    }
    
    // Controlla che tutte le skill esistano
    for (const step of plan.steps) {
      if (!this.skillCatalog.has(step.skillId)) {
        errors.push(`Skill non trovata: ${step.skillId}`);
      }
    }
    
    // Controlla che confirmables siano effettivamente nella lista step
    if (plan.confirmables) {
      for (const confirmable of plan.confirmables) {
        const stepExists = plan.steps.some(s => s.skillId === confirmable);
        if (!stepExists) {
          errors.push(`Confirmable ${confirmable} non trovato negli step`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Determina se uno step deve essere skippato basandosi sulla modalità OS
   */
  private async shouldSkipStepForMode(
    step: OsActionStep,
    skill: Skill | undefined,
    osMode: OsMode,
    planId: string,
    stepIndex: number,
    context: ExecutionContext
  ): Promise<boolean> {
    if (!skill) return false;
    
    const hasSideEffects = skill.meta.sideEffects && skill.meta.sideEffects.length > 0;
    
    // ASK mode: skip TUTTI gli step con side effects
    if (osMode === 'ask') {
      if (hasSideEffects) {
        console.log(`⏭️ [Executor] ASK mode: skipping ${step.skillId} (has side effects: ${skill.meta.sideEffects?.join(', ')})`);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Determina se uno step richiede preview (Ask-to-Act mode)
   */
  private requiresPreview(step: OsActionStep, skill: Skill | undefined): boolean {
    if (!skill) return false;
    
    const hasSideEffects = skill.meta.sideEffects && skill.meta.sideEffects.length > 0;
    const requiresConfirm = skill.meta.requiresConfirm;
    const isNotIdempotent = !skill.meta.idempotent;
    
    return hasSideEffects || requiresConfirm || isNotIdempotent;
  }
  
  /**
   * Determina se una skill è pericolosa (Act mode)
   */
  private isDangerousSkill(skill: Skill): boolean {
    const dangerousSkills = ['email.send', 'rdo.create', 'payment.process', 'data.delete'];
    
    if (dangerousSkills.includes(skill.meta.id)) {
      return true;
    }
    
    const dangerousSideEffects = ['email.send', 'payment', 'delete'];
    const hasDangerousSideEffect = skill.meta.sideEffects?.some(se => 
      dangerousSideEffects.some(d => se.includes(d))
    );
    
    return hasDangerousSideEffect || false;
  }
  
  /**
   * Mostra anteprima step e aspetta conferma (Ask-to-Act mode)
   */
  private async showPreview(
    step: OsActionStep,
    skill: Skill | undefined,
    options: ExecutorOptions,
    planId: string,
    stepIndex: number,
    context: ExecutionContext
  ): Promise<boolean> {
    console.log(`👁️ [Executor] Mostrando preview per ${step.skillId}...`);
    
    const previewData = {
      skillId: step.skillId,
      skillName: skill?.meta.summary || step.name,
      inputs: step.inputs,
      sideEffects: skill?.meta.sideEffects || [],
      estimatedDuration: skill?.meta.latencyBudgetMs || 1000,
    };
    
    auditLogger.log({
      planId,
      stepIndex,
      skillId: step.skillId,
      osMode: 'ask_to_act',
      action: 'preview_shown',
      userId: context.userId,
    });
    
    if (options.onPreview) {
      try {
        const accepted = await options.onPreview(step, previewData);
        
        auditLogger.log({
          planId,
          stepIndex,
          skillId: step.skillId,
          osMode: 'ask_to_act',
          action: accepted ? 'confirmed' : 'rejected',
          userId: context.userId,
        });
        
        return accepted;
      } catch (error) {
        console.error(`❌ [Executor] Errore in onPreview callback:`, error);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get audit logs
   */
  public static getAuditLogs(): AuditLogEntry[] {
    return auditLogger.getLogs();
  }
  
  /**
   * Get audit logs for specific plan
   */
  public static getAuditLogsForPlan(planId: string): AuditLogEntry[] {
    return auditLogger.getAuditLogsForPlan(planId);
  }
  
  /**
   * Get step label usando i18n status lines
   */
  private getStepLabel(skillId: string, stepName?: string): string {
    // Try i18n status line
    const statusKey = this.skillIdToStatusKey(skillId);
    const i18nLabel = (osTranslations.status as any)[statusKey];
    
    if (i18nLabel) {
      return i18nLabel;
    }
    
    // Fallback to skill status line
    const statusLine = getSkillStatusLine(skillId);
    if (statusLine && statusLine !== 'Elaboro richiesta…') {
      return statusLine;
    }
    
    // Fallback to step name or skill ID
    return stepName || skillId;
  }
  
  /**
   * Convert skillId to i18n status key
   */
  private skillIdToStatusKey(skillId: string): string {
    const mapping: Record<string, string> = {
      'business_plan.run': 'calcBP',
      'sensitivity.run': 'sensitivity',
      'term_sheet.create': 'generatePDF',
      'rdo.create': 'sendRDO',
      'sal.record': 'recordSAL',
      'sales.proposal': 'prepareProposal',
      'feasibility.analyze': 'buildFeasibility',
      'market.research': 'fetchMarket',
    };
    
    return mapping[skillId] || 'working';
  }
  
  /**
   * Sanitize error message (rimuovi info sensibili)
   */
  private sanitizeErrorMessage(message: string): string {
    // Remove stack traces
    const lines = message.split('\n');
    const firstLine = lines[0];
    
    // Remove file paths
    let sanitized = firstLine.replace(/\/[^\s]+/g, '');
    
    // Remove email addresses
    sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[email]');
    
    // Remove API keys/tokens
    sanitized = sanitized.replace(/[a-zA-Z0-9]{32,}/g, '[token]');
    
    // Truncate if too long
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 97) + '...';
    }
    
    return sanitized;
  }
}

