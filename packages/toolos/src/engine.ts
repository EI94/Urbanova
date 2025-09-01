import { InteractivePlan, InteractivePlanStep, ToolRun, ToolRunSubStep } from '@urbanova/types';
import { ToolRunner } from './runner';

export interface ExecutionContext {
  userId: string;
  workspaceId: string;
  projectId?: string;
  sessionId: string;
  planId: string;
  userRole: string;
  metadata: Record<string, unknown>;
}

export interface ProgressCallback {
  (
    stepId: string,
    status: 'started' | 'completed' | 'failed',
    message: string,
    error?: string
  ): void;
}

export interface ExecutionResult {
  status: 'succeeded' | 'failed' | 'cancelled';
  completedSteps: number;
  totalSteps: number;
  outputs: Record<string, unknown>;
  errors: Array<{
    stepId: string;
    error: string;
    rollbackAttempted?: boolean;
    rollbackSuccess?: boolean;
  }>;
  toolRun: ToolRun;
}

export class PlanExecutionEngine {
  private runner: ToolRunner;

  constructor(runner: ToolRunner) {
    this.runner = runner;
  }

  /**
   * Execute a plan sequentially with progress tracking and error handling
   */
  async executePlan(
    plan: InteractivePlan,
    context: ExecutionContext,
    onProgress: ProgressCallback
  ): Promise<ExecutionResult> {
    const startTime = new Date();

    // Create initial ToolRun
    const toolRun: ToolRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: context.sessionId,
      planId: context.planId,
      status: 'running',
      startedAt: startTime,
      subRuns: [],
      outputs: {},
      metadata: {
        ...context.metadata,
        totalSteps: plan.steps.length,
        executionStarted: startTime.toISOString(),
      },
    };

    // Sort steps by order
    const sortedSteps = [...plan.steps].sort((a, b) => a.order - b.order);

    // Initialize sub-runs
    for (const step of sortedSteps) {
      const subRun: ToolRunSubStep = {
        stepId: step.id,
        status: 'pending',
        startedAt: startTime,
        retryCount: 0,
        maxRetries: 3,
      };
      toolRun.subRuns.push(subRun);
    }

    const result: ExecutionResult = {
      status: 'succeeded',
      completedSteps: 0,
      totalSteps: sortedSteps.length,
      outputs: {},
      errors: [],
      toolRun,
    };

    // Post initial progress message
    onProgress('', 'started', `⏳ Avvio piano (${sortedSteps.length} step)...`);

    // Execute steps sequentially
    for (let i = 0; i < sortedSteps.length; i++) {
      const step = sortedSteps[i];
      const subRun = toolRun.subRuns.find(sr => sr.stepId === step.id);

      if (!subRun) {
        console.error(`SubRun not found for step ${step.id}`);
        continue;
      }

      try {
        // Execute step
        const stepResult = await this.executeStep(
          step,
          context,
          subRun,
          i + 1,
          sortedSteps.length,
          onProgress
        );

        if (stepResult.success) {
          result.completedSteps++;
          result.outputs[step.id] = stepResult.output;
        } else {
          // Handle step failure
          const errorInfo = {
            stepId: step.id,
            error: stepResult.error || 'Unknown error',
            rollbackAttempted: false,
            rollbackSuccess: false,
          };

          result.errors.push(errorInfo);

          // Attempt rollback if defined
          if (step.rollback) {
            errorInfo.rollbackAttempted = true;
            const rollbackResult = await this.attemptRollback(step, context, onProgress);
            errorInfo.rollbackSuccess = rollbackResult.success;
          }

          // Check failure handling strategy
          if (step.onFailure === 'stop' || step.onFailure === undefined) {
            // Stop execution
            result.status = 'failed';
            onProgress(
              step.id,
              'failed',
              `❌ Piano interrotto al step ${i + 1}/${sortedSteps.length}: ${step.description}`,
              stepResult.error
            );
            break;
          } else if (step.onFailure === 'continue') {
            // Continue with next step
            onProgress(
              step.id,
              'failed',
              `⚠️ Step ${i + 1}/${sortedSteps.length} fallito, continuo: ${step.description}`,
              stepResult.error
            );
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          stepId: step.id,
          error: errorMessage,
        });

        subRun.status = 'failed';
        subRun.error = errorMessage;
        subRun.finishedAt = new Date();

        if (step.onFailure === 'stop' || step.onFailure === undefined) {
          result.status = 'failed';
          onProgress(
            step.id,
            'failed',
            `❌ Piano interrotto al step ${i + 1}/${sortedSteps.length}: ${step.description}`,
            errorMessage
          );
          break;
        } else {
          onProgress(
            step.id,
            'failed',
            `⚠️ Step ${i + 1}/${sortedSteps.length} fallito, continuo: ${step.description}`,
            errorMessage
          );
        }
      }
    }

    // Finalize ToolRun
    toolRun.finishedAt = new Date();
    toolRun.status = result.status === 'succeeded' ? 'succeeded' : 'failed';
    toolRun.outputs = result.outputs;

    if (result.errors.length > 0) {
      toolRun.error = `${result.errors.length} step(s) failed: ${result.errors.map(e => e.stepId).join(', ')}`;
    }

    // Post final progress message
    if (result.status === 'succeeded') {
      onProgress(
        '',
        'completed',
        `✅ Piano completato con successo! (${result.completedSteps}/${result.totalSteps} step)`
      );
    } else {
      onProgress(
        '',
        'failed',
        `❌ Piano fallito dopo ${result.completedSteps}/${result.totalSteps} step`
      );
    }

    return result;
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: InteractivePlanStep,
    context: ExecutionContext,
    subRun: ToolRunSubStep,
    stepNumber: number,
    totalSteps: number,
    onProgress: ProgressCallback
  ): Promise<{ success: boolean; output?: unknown; error?: string }> {
    // Update sub-run status
    subRun.status = 'running';
    subRun.startedAt = new Date();

    // Post progress message
    onProgress(
      step.id,
      'started',
      `▶️ Step ${stepNumber}/${totalSteps}: ${step.toolId}.${step.action}...`
    );

    try {
      // Create step-specific context
      const stepContext = {
        ...context,
        stepId: step.id,
        stepOrder: step.order,
      };

      // Execute the tool action
      const result = await this.runner.runAction({
        toolId: step.toolId,
        action: step.action,
        args: step.zArgs || {},
        ctx: stepContext,
      });

      // Update sub-run on success
      subRun.status = 'succeeded';
      subRun.finishedAt = new Date();
      subRun.outputRef = result.outputRef;

      // Post success message
      onProgress(
        step.id,
        'completed',
        `✅ Step ${stepNumber}/${totalSteps} completato: ${step.description}`
      );

      return {
        success: true,
        output: result.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update sub-run on failure
      subRun.status = 'failed';
      subRun.error = errorMessage;
      subRun.finishedAt = new Date();

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Attempt rollback for a failed step
   */
  private async attemptRollback(
    step: InteractivePlanStep,
    context: ExecutionContext,
    onProgress: ProgressCallback
  ): Promise<{ success: boolean; error?: string }> {
    if (!step.rollback) {
      return { success: false, error: 'No rollback defined' };
    }

    onProgress(step.id, 'started', `🔄 Tentativo rollback per step: ${step.description}...`);

    try {
      // Execute rollback action
      await this.runner.runAction({
        toolId: step.rollback.toolId,
        action: step.rollback.action,
        args: step.rollback.args,
        ctx: {
          ...context,
          stepId: step.id,
          isRollback: true,
        },
      });

      onProgress(step.id, 'completed', `✅ Rollback completato per step: ${step.description}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onProgress(
        step.id,
        'failed',
        `❌ Rollback fallito per step: ${step.description}`,
        errorMessage
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Retry a specific step
   */
  async retryStep(
    toolRun: ToolRun,
    stepId: string,
    plan: InteractivePlan,
    context: ExecutionContext,
    onProgress: ProgressCallback
  ): Promise<{ success: boolean; output?: unknown; error?: string }> {
    const step = plan.steps.find(s => s.id === stepId);
    const subRun = toolRun.subRuns.find(sr => sr.stepId === stepId);

    if (!step) {
      throw new Error(`Step ${stepId} not found in plan`);
    }

    if (!subRun) {
      throw new Error(`SubRun for step ${stepId} not found`);
    }

    if (subRun.retryCount >= subRun.maxRetries) {
      throw new Error(`Step ${stepId} has exceeded maximum retries (${subRun.maxRetries})`);
    }

    // Increment retry count
    subRun.retryCount++;
    subRun.status = 'running';
    subRun.startedAt = new Date();
    subRun.finishedAt = undefined;
    subRun.error = undefined;

    onProgress(
      stepId,
      'started',
      `🔄 Retry ${subRun.retryCount}/${subRun.maxRetries} per step: ${step.description}...`
    );

    try {
      const stepContext = {
        ...context,
        stepId: step.id,
        stepOrder: step.order,
        isRetry: true,
        retryCount: subRun.retryCount,
      };

      const result = await this.runner.runAction({
        toolId: step.toolId,
        action: step.action,
        args: step.zArgs || {},
        ctx: stepContext,
      });

      // Update sub-run on success
      subRun.status = 'succeeded';
      subRun.finishedAt = new Date();
      subRun.outputRef = result.outputRef;

      onProgress(stepId, 'completed', `✅ Retry riuscito per step: ${step.description}`);

      return {
        success: true,
        output: result.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      subRun.status = 'failed';
      subRun.error = errorMessage;
      subRun.finishedAt = new Date();

      onProgress(stepId, 'failed', `❌ Retry fallito per step: ${step.description}`, errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Cancel plan execution
   */
  async cancelExecution(
    toolRun: ToolRun,
    onProgress: ProgressCallback
  ): Promise<{ success: boolean; message: string }> {
    // Check if execution is cancellable
    const runningSteps = toolRun.subRuns.filter(sr => sr.status === 'running');

    if (runningSteps.length === 0) {
      return {
        success: false,
        message: 'Nessun step in esecuzione da cancellare',
      };
    }

    // Mark all running/pending steps as cancelled
    for (const subRun of toolRun.subRuns) {
      if (subRun.status === 'running' || subRun.status === 'pending') {
        subRun.status = 'cancelled';
        subRun.finishedAt = new Date();
        subRun.error = 'Cancelled by user';
      }
    }

    // Update main tool run
    toolRun.status = 'cancelled';
    toolRun.finishedAt = new Date();
    toolRun.error = 'Cancelled by user';

    onProgress('', 'failed', "❌ Esecuzione piano cancellata dall'utente");

    return {
      success: true,
      message: 'Piano cancellato con successo',
    };
  }

  /**
   * Get execution progress
   */
  getExecutionProgress(toolRun: ToolRun): {
    completed: number;
    total: number;
    percentage: number;
    currentStep?: string;
    status: string;
  } {
    const completed = toolRun.subRuns.filter(sr => sr.status === 'succeeded').length;
    const total = toolRun.subRuns.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const runningStep = toolRun.subRuns.find(sr => sr.status === 'running');

    return {
      completed,
      total,
      percentage,
      currentStep: runningStep?.stepId,
      status: toolRun.status,
    };
  }
}
