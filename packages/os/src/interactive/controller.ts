import { InteractivePlannerFacade, TaskSession, Plan, SessionStatus } from './index';
import { ToolActionSpec } from '@urbanova/types';

// Mock execution engine interface for now
export interface MockExecutionEngine {
  executePlan(plan: any, context: any, onProgress: any): Promise<any>;
  retryStep(toolRun: any, stepId: string, plan: any, context: any, onProgress: any): Promise<any>;
  cancelExecution(toolRun: any, onProgress: any): Promise<any>;
  getExecutionProgress(toolRun: any): any;
}

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

export interface PlannerContext {
  userId: string;
  workspaceId: string;
  userRole: string;
  projectId?: string;
  channel: 'chat' | 'whatsapp';
  channelId?: string; // chat thread ID or WhatsApp sender ID
}

export interface PlannerRequest {
  text: string;
  context: PlannerContext;
}

export interface PlannerReply {
  sessionId: string;
  text?: string;
  slashCommand?: string;
  context: PlannerContext;
}

export interface PlannerResponse {
  session: TaskSession;
  plan?: Plan;
  preview?: any; // PlanPreview from renderer
  summary?: string;
  action?: 'draft' | 'confirm' | 'cancel' | 'dryrun' | 'edit' | 'run' | 'continue';
  message?: string;
  options?: Array<{ id: string; label: string; description: string }>;
}

export class InteractivePlannerController {
  private facade: InteractivePlannerFacade;
  private activeSessions: Map<string, TaskSession> = new Map();
  private executionEngine: MockExecutionEngine;
  private activeExecutions: Map<string, any> = new Map();

  constructor(facade: InteractivePlannerFacade, executionEngine: MockExecutionEngine) {
    this.facade = facade;
    this.executionEngine = executionEngine;
  }

  /**
   * Handle new request - draft plan if no active session
   */
  async handleNewRequest(request: PlannerRequest): Promise<PlannerResponse> {
    const { text, context } = request;

    // Check for active session
    const activeSession = await this.getActiveSession(context);

    if (activeSession) {
      // Continue existing session
      return this.handleReply({
        sessionId: activeSession.id,
        text,
        context,
      });
    }

    // Draft new plan
    try {
      const result = await this.facade.processRequest({
        text,
        userId: context.userId,
        workspaceId: context.workspaceId,
        userRole: context.userRole,
        projectId: context.projectId,
      });

      // Store session
      this.activeSessions.set(result.session.id, result.session);

      return {
        session: result.session,
        plan: result.session.plan,
        preview: result.preview,
        summary: result.summary,
        action: 'draft',
        message: 'Ho preparato un piano per te. Controlla i dettagli e conferma per procedere.',
      };
    } catch (error) {
      throw new Error(
        `Failed to draft plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle user reply to existing session
   */
  async handleReply(reply: PlannerReply): Promise<PlannerResponse> {
    const { sessionId, text, slashCommand, context } = reply;

    // Get session
    const session = await this.facade.getSessionStatus(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Parse slash command or text
    if (slashCommand) {
      return this.handleSlashCommand(slashCommand, session.session, context);
    }

    // Handle natural language text
    return this.handleNaturalLanguage(text || '', session.session, context);
  }

  /**
   * Handle slash commands
   */
  private async handleSlashCommand(
    command: string,
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    const parts = command.trim().split(' ');
    const action = parts[1];

    switch (action) {
      case 'confirm':
        return this.handleConfirm(session, context);

      case 'cancel':
        return this.handleCancel(session, context);

      case 'dryrun':
        return this.handleDryRun(session, context);

      case 'edit':
        return this.handleEdit(parts.slice(2), session, context);

      case 'retry':
        return this.handleRetry(parts.slice(2), session, context);

      default:
        throw new Error(`Unknown slash command: ${action}`);
    }
  }

  /**
   * Handle natural language text
   */
  private async handleNaturalLanguage(
    text: string,
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    const lowerText = text.toLowerCase().trim();

    // Check for confirmation keywords
    if (['ok', 'conferma', 'vai', 'si', 'yes', 'procedi', 'esegui'].includes(lowerText)) {
      if (session.status === 'awaiting_confirm') {
        return this.handleConfirm(session, context);
      } else {
        return {
          session,
          action: 'continue',
          message: "Il piano non è ancora pronto per l'esecuzione. Completa i parametri richiesti.",
        };
      }
    }

    // Check for cancellation keywords
    if (['no', 'annulla', 'stop', 'ferma', 'cancella'].includes(lowerText)) {
      return this.handleCancel(session, context);
    }

    // Check for project ambiguity resolution
    if (/^[1-3]$/.test(text.trim())) {
      return this.handleProjectSelection(parseInt(text), session, context);
    }

    // Treat as parameter input
    return this.handleParameterInput(text, session, context);
  }

  /**
   * Handle plan confirmation and execution
   */
  private async handleConfirm(
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    if (session.status !== 'awaiting_confirm') {
      // Check if already running
      const activeExecution = this.activeExecutions.get(session.id);
      if (activeExecution && activeExecution.status === 'running') {
        return {
          session,
          action: 'continue',
          message: 'Piano già in esecuzione. Usa "/plan status" per vedere i progressi.',
        };
      }

      return {
        session,
        action: 'continue',
        message: "Il piano non è ancora pronto per l'esecuzione.",
      };
    }

    // Check if plan is ready
    const validation = await this.facade.validatePlan(session.plan);
    if (!validation.ready) {
      return {
        session,
        action: 'continue',
        message: 'Il piano non è ancora pronto. Completa i parametri richiesti.',
        options: validation.missing.map((req: any) => ({
          id: req.field,
          label: req.field,
          description: req.description,
        })),
      };
    }

    // Update session status to running
    const updatedSession = await this.facade.updateSessionStatus(session.id, 'running');
    this.activeSessions.set(updatedSession.id, updatedSession);

    // Create execution context
    const executionContext: ExecutionContext = {
      userId: context.userId,
      workspaceId: context.workspaceId,
      projectId: context.projectId,
      sessionId: session.id,
      planId: session.plan.id,
      userRole: context.userRole,
      metadata: {
        channel: context.channel,
        channelId: context.channelId,
      },
    };

    // Create progress callback for chat updates
    const progressCallback: ProgressCallback = (stepId, status, message, error) => {
      // This would send chat messages in production
      console.log(`[${session.id}] ${stepId}: ${status} - ${message}${error ? ` (${error})` : ''}`);

      // In production, you would dispatch these to the chat system
      // chatService.sendProgressMessage(context.channelId, {
      //   sessionId: session.id,
      //   stepId,
      //   status,
      //   message,
      //   error
      // });
    };

    // Start execution asynchronously
    this.executeAsync(session.plan, executionContext, progressCallback);

    return {
      session: updatedSession,
      action: 'run',
      message: "Piano confermato! L'esecuzione è iniziata. Ti aggiornerò sui progressi.",
    };
  }

  /**
   * Execute plan asynchronously
   */
  private async executeAsync(
    plan: Plan,
    context: ExecutionContext,
    onProgress: ProgressCallback
  ): Promise<void> {
    try {
      const result = await this.executionEngine.executePlan(plan, context, onProgress);

      // Store the completed execution
      this.activeExecutions.set(context.sessionId, result.toolRun);

      // Update session status
      const finalStatus = result.status === 'succeeded' ? 'succeeded' : 'failed';
      await this.facade.updateSessionStatus(context.sessionId, finalStatus);
    } catch (error) {
      console.error(`Execution failed for session ${context.sessionId}:`, error);

      // Update session status to failed
      await this.facade.updateSessionStatus(context.sessionId, 'failed');
    }
  }

  /**
   * Handle step retry
   */
  private async handleRetry(
    retryParts: string[],
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    // Parse retry command: step:<stepId>
    let stepId: string | undefined;

    for (const part of retryParts) {
      if (part.startsWith('step:')) {
        stepId = part.substring(5);
        break;
      }
    }

    if (!stepId) {
      return {
        session,
        action: 'continue',
        message: 'Specifica lo step da ripetere: /plan retry step:<stepId>',
      };
    }

    // Get active execution
    const toolRun = this.activeExecutions.get(session.id);
    if (!toolRun) {
      return {
        session,
        action: 'continue',
        message: 'Nessuna esecuzione attiva trovata per questo piano.',
      };
    }

    // Find the step
    const subRun = toolRun.subRuns?.find((sr: any) => sr.stepId === stepId);
    if (!subRun) {
      return {
        session,
        action: 'continue',
        message: `Step ${stepId} non trovato nel piano.`,
      };
    }

    if (subRun.status !== 'failed') {
      return {
        session,
        action: 'continue',
        message: `Step ${stepId} non è fallito. Stato attuale: ${subRun.status}`,
      };
    }

    // Create execution context
    const executionContext: ExecutionContext = {
      userId: context.userId,
      workspaceId: context.workspaceId,
      projectId: context.projectId,
      sessionId: session.id,
      planId: session.plan.id,
      userRole: context.userRole,
      metadata: {
        channel: context.channel,
        channelId: context.channelId,
      },
    };

    // Create progress callback
    const progressCallback: ProgressCallback = (stepId, status, message, error) => {
      console.log(
        `[${session.id}] RETRY ${stepId}: ${status} - ${message}${error ? ` (${error})` : ''}`
      );
    };

    try {
      // Retry the step
      const retryResult = await this.executionEngine.retryStep(
        toolRun,
        stepId,
        session.plan,
        executionContext,
        progressCallback
      );

      if (retryResult.success) {
        return {
          session,
          action: 'continue',
          message: `✅ Step ${stepId} ripetuto con successo!`,
        };
      } else {
        return {
          session,
          action: 'continue',
          message: `❌ Retry fallito per step ${stepId}: ${retryResult.error}`,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        session,
        action: 'continue',
        message: `❌ Errore durante retry: ${errorMessage}`,
      };
    }
  }

  /**
   * Handle plan cancellation
   */
  private async handleCancel(
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    // Check if there's an active execution to cancel
    const toolRun = this.activeExecutions.get(session.id);

    if (toolRun && toolRun.status === 'running') {
      // Create progress callback
      const progressCallback: ProgressCallback = (stepId, status, message, error) => {
        console.log(
          `[${session.id}] CANCEL ${stepId}: ${status} - ${message}${error ? ` (${error})` : ''}`
        );
      };

      try {
        const cancelResult = await this.executionEngine.cancelExecution(toolRun, progressCallback);

        if (cancelResult.success) {
          // Update session status
          const updatedSession = await this.facade.updateSessionStatus(session.id, 'cancelled');
          this.activeSessions.set(updatedSession.id, updatedSession);

          return {
            session: updatedSession,
            action: 'cancel',
            message: 'Piano cancellato con successo.',
          };
        } else {
          return {
            session,
            action: 'continue',
            message: `Impossibile cancellare: ${cancelResult.message}`,
          };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          session,
          action: 'continue',
          message: `Errore durante cancellazione: ${errorMessage}`,
        };
      }
    } else {
      // No active execution, just update session status
      const updatedSession = await this.facade.updateSessionStatus(session.id, 'cancelled');
      this.activeSessions.set(updatedSession.id, updatedSession);

      return {
        session: updatedSession,
        action: 'cancel',
        message: "Piano annullato. Posso aiutarti con qualcos'altro?",
      };
    }
  }

  /**
   * Handle dry-run simulation
   */
  private async handleDryRun(
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    // Simulate plan execution
    const simulation = this.simulatePlan(session.plan);

    return {
      session,
      action: 'dryrun',
      message: 'Ecco cosa succederebbe se eseguissi il piano:',
      summary: simulation,
    };
  }

  /**
   * Handle parameter editing
   */
  private async handleEdit(
    editParts: string[],
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    // Parse edit command: key:<path> value:<json>
    const fills: Record<string, any> = {};

    for (let i = 0; i < editParts.length; i += 2) {
      if (editParts[i]?.startsWith('key:') && editParts[i + 1]?.startsWith('value:')) {
        const key = editParts[i].substring(4);
        const valueStr = editParts[i + 1].substring(6);

        try {
          const value = JSON.parse(valueStr);
          fills[key] = value;
        } catch (error) {
          console.warn(`Failed to parse value for ${key}:`, valueStr);
        }
      }
    }

    if (Object.keys(fills).length === 0) {
      throw new Error('No valid parameters provided for editing');
    }

    // Apply reply with fills
    const updatedSession = await this.facade.processReply(session.id, {
      type: 'provide_value',
      userId: context.userId,
      data: fills,
    });

    // Revalidate plan
    const validation = await this.facade.validatePlan(updatedSession.session.plan);

    // Generate new preview
    const preview = await this.facade.generatePreview(updatedSession.session);

    this.activeSessions.set(updatedSession.session.id, updatedSession.session);

    return {
      session: updatedSession.session,
      plan: updatedSession.session.plan,
      preview,
      action: 'edit',
      message: validation.ready
        ? "Parametri aggiornati! Il piano è ora pronto per l'esecuzione."
        : 'Parametri aggiornati. Ancora alcuni campi da completare.',
    };
  }

  /**
   * Handle project selection for ambiguous requests
   */
  private async handleProjectSelection(
    selection: number,
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    // This would resolve project ambiguity
    // For now, return a message
    return {
      session,
      action: 'continue',
      message: `Progetto ${selection} selezionato. Continuo con l'analisi.`,
    };
  }

  /**
   * Handle parameter input
   */
  private async handleParameterInput(
    text: string,
    session: TaskSession,
    context: PlannerContext
  ): Promise<PlannerResponse> {
    // Try to extract parameters from text
    // This is a simplified version - in production you'd use NLP
    const fills = this.extractParametersFromText(text, session.plan.requirements);

    if (Object.keys(fills).length > 0) {
      return this.handleEdit(
        ['key:' + Object.keys(fills)[0], 'value:' + JSON.stringify(Object.values(fills)[0])],
        session,
        context
      );
    }

    return {
      session,
      action: 'continue',
      message: 'Non ho capito. Puoi essere più specifico o usare i comandi disponibili?',
    };
  }

  /**
   * Simulate plan execution
   */
  private simulatePlan(plan: Plan): string {
    const steps = plan.steps
      .map(
        (step: any, index: number) =>
          `${index + 1}. ${step.toolId}.${step.action} - ${step.description}`
      )
      .join('\n');

    const duration = plan.estimatedDuration
      ? `\n\n⏱️ Tempo stimato: ${Math.round(plan.estimatedDuration / 60)} minuti`
      : '';
    const cost = plan.totalCost ? `\n💰 Costo stimato: ${plan.totalCost} tokens` : '';

    return `**Simulazione Esecuzione Piano:**\n\n${steps}${duration}${cost}`;
  }

  /**
   * Extract parameters from natural language text
   */
  private extractParametersFromText(text: string, requirements: any[]): Record<string, any> {
    const fills: Record<string, any> = {};

    // Simple keyword-based extraction
    requirements.forEach(req => {
      if (req.type === 'text' && text.toLowerCase().includes(req.field.toLowerCase())) {
        // Extract text after the field name
        const regex = new RegExp(`${req.field}\\s*[:=]?\\s*([^\\s,]+)`, 'i');
        const match = text.match(regex);
        if (match) {
          fills[req.field] = match[1];
        }
      }

      if (req.type === 'number') {
        const numbers = text.match(/\d+(?:\.\d+)?/g);
        if (numbers && numbers.length > 0) {
          fills[req.field] = parseFloat(numbers[0]);
        }
      }
    });

    return fills;
  }

  /**
   * Get active session for context
   */
  private async getActiveSession(context: PlannerContext): Promise<TaskSession | null> {
    const key = this.getSessionKey(context);

    // Check in-memory sessions first
    for (const session of this.activeSessions.values()) {
      if (this.matchesSessionKey(session, key)) {
        return session;
      }
    }

    // Check database for active sessions
    const sessions = await this.facade.getUserSessions(context.userId);
    const activeSession = sessions.find(
      s => s.status === 'awaiting_confirm' && this.matchesSessionKey(s, key)
    );

    if (activeSession) {
      this.activeSessions.set(activeSession.id, activeSession);
    }

    return activeSession || null;
  }

  /**
   * Generate session key for context
   */
  private getSessionKey(context: PlannerContext): string {
    if (context.channel === 'whatsapp') {
      return `wa:${context.channelId}`;
    }
    return `chat:${context.channelId || context.userId}`;
  }

  /**
   * Check if session matches key
   */
  private matchesSessionKey(session: TaskSession, key: string): boolean {
    // This is a simplified matching - in production you'd store channel info
    return session.userId === key.split(':')[1] || session.id === key;
  }

  /**
   * Clean up old sessions
   */
  async cleanupOldSessions(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [id, session] of this.activeSessions.entries()) {
      if (now - session.updatedAt.getTime() > maxAge) {
        this.activeSessions.delete(id);
      }
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(sessionId: string): Promise<{
    session: TaskSession;
    toolRun?: any;
    progress?: {
      completed: number;
      total: number;
      percentage: number;
      currentStep?: string;
      status: string;
    };
  }> {
    const sessionStatus = await this.facade.getSessionStatus(sessionId);
    const toolRun = this.activeExecutions.get(sessionId);

    let progress;
    if (toolRun) {
      progress = this.executionEngine.getExecutionProgress(toolRun);
    }

    return {
      session: sessionStatus.session,
      toolRun,
      progress,
    };
  }
}
