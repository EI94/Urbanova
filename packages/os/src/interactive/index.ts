import { InteractivePlanner } from './planner';
import { SessionManager } from './sessions';
import { PlanRenderer } from './renderer';
import type { PlanningContext } from './planner';
import type { SessionUpdate } from './sessions';
import {
  SessionStatus,
  InteractiveTaskSession as TaskSession,
  InteractivePlan as Plan,
  InteractivePlanStep as PlanStep,
  InteractiveRequirement as Requirement,
  InteractiveAssumption as Assumption,
  InteractiveRisk as Risk,
  InteractiveUserReply as UserReply,
  InteractivePlanValidation as PlanValidation,
  InteractivePlanPreview as PlanPreview,
} from '@urbanova/types';

export { InteractivePlanner } from './planner';
export { SessionManager } from './sessions';
export { PlanRenderer } from './renderer';
export { InteractivePlannerController } from './controller';
export type { PlannerContext, PlannerRequest, PlannerReply, PlannerResponse } from './controller';
export { SessionStatus } from '@urbanova/types';

export type { PlanningContext, PlanningInput } from './planner';

export type { SessionFilter, SessionUpdate } from './sessions';

export type { RenderOptions } from './renderer';

// Re-export types for convenience
export type {
  InteractiveTaskSession as TaskSession,
  InteractivePlan as Plan,
  InteractivePlanStep as PlanStep,
  InteractiveRequirement as Requirement,
  InteractiveAssumption as Assumption,
  InteractiveRisk as Risk,
  InteractiveUserReply as UserReply,
  InteractivePlanValidation as PlanValidation,
  InteractivePlanPreview as PlanPreview,
} from '@urbanova/types';

// Re-export schemas for validation
export { schemas } from '@urbanova/types';

/**
 * Interactive Planner Facade
 *
 * This module provides a unified interface for the Interactive Planner system,
 * which enables users to review and confirm plans before execution.
 *
 * Key Features:
 * - Two-stage protocol: PLAN → CONFIRM → RUN
 * - Plan validation against tool schemas
 * - Session management for multi-turn conversations
 * - Rich plan previews with CTAs
 * - Support for dry-run and parameter editing
 *
 * Usage:
 * ```typescript
 * import { InteractivePlanner, SessionManager, PlanRenderer } from '@urbanova/os/interactive';
 *
 * const planner = new InteractivePlanner(toolRegistry);
 * const sessionManager = new SessionManager();
 * const renderer = new PlanRenderer();
 *
 * // Draft a plan
 * const { plan, session } = await planner.draftPlan(input, context);
 *
 * // Store session
 * const savedSession = await sessionManager.createSession(session);
 *
 * // Render for chat
 * const preview = renderer.buildPlanPreview(savedSession);
 * ```
 */
export class InteractivePlannerFacade {
  constructor(
    private planner: InteractivePlanner,
    private sessionManager: SessionManager,
    private renderer: PlanRenderer
  ) {}

  /**
   * Process a new user request and create a plan
   */
  async processRequest(input: {
    text: string;
    projectId?: string;
    userId: string;
    workspaceId: string;
    userRole: string;
  }): Promise<{
    session: TaskSession;
    preview: PlanPreview;
    summary: string;
    ctaText: string;
  }> {
    // Create planning context
    const context: PlanningContext = {
      userId: input.userId,
      projectId: input.projectId,
      workspaceId: input.workspaceId,
      userRole: input.userRole,
      availableTools: [], // TODO: Get from tool registry
    };

    // Draft plan
    const { plan, session } = await this.planner.draftPlan(input);

    // Validate plan
    const validation = this.planner.validatePlan(plan);

    // Update session status based on validation
    if (validation.ready) {
      session.status = SessionStatus.AWAITING_CONFIRM;
    } else {
      session.status = SessionStatus.COLLECTING;
    }

    // Save session
    const savedSession = await this.sessionManager.createSession(session);

    // Generate preview and text
    const preview = this.renderer.buildPlanPreview(savedSession);
    const summary = this.renderer.generatePlanSummary(savedSession);
    const ctaText = this.renderer.generateCTAText(savedSession);

    return {
      session: savedSession,
      preview,
      summary,
      ctaText,
    };
  }

  /**
   * Process a user reply to an existing session
   */
  async processReply(
    sessionId: string,
    reply: {
      type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
      userId: string;
      data?: Record<string, unknown>;
    }
  ): Promise<{
    session: TaskSession;
    preview: PlanPreview;
    summary: string;
    ctaText: string;
    action?: 'run' | 'dryrun' | 'cancel' | 'continue';
  }> {
    // Apply reply to session
    const updatedSession = await this.sessionManager.applyReply(sessionId, reply);
    if (!updatedSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Generate updated preview and text
    const preview = this.renderer.buildPlanPreview(updatedSession);
    const summary = this.renderer.generatePlanSummary(updatedSession);
    const ctaText = this.renderer.generateCTAText(updatedSession);

    // Determine next action
    let action: 'run' | 'dryrun' | 'cancel' | 'continue' | undefined;

    switch (reply.type) {
      case 'confirm':
        if (updatedSession.status === SessionStatus.RUNNING) {
          action = 'run';
        }
        break;
      case 'dryrun':
        action = 'dryrun';
        break;
      case 'cancel':
        action = 'cancel';
        break;
      case 'edit':
      case 'provide_value':
        action = 'continue';
        break;
    }

    return {
      session: updatedSession,
      preview,
      summary,
      ctaText,
      action,
    };
  }

  /**
   * Get session status and progress
   */
  async getSessionStatus(sessionId: string): Promise<{
    session: TaskSession;
    statusMessage: string;
    progressMessage?: string;
  }> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const statusMessage = this.renderer.generateStatusMessage(session);
    const progressMessage = this.renderer.generateProgressMessage(
      session,
      0,
      session.plan.steps.length
    );

    return {
      session,
      statusMessage,
      progressMessage,
    };
  }

  /**
   * Validate a plan
   */
  async validatePlan(plan: Plan): Promise<PlanValidation> {
    return this.planner.validatePlan(plan);
  }

  /**
   * Update session status
   */
  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<TaskSession> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updatedSession = await this.sessionManager.updateSessionStatus(sessionId, { status });
    if (!updatedSession) {
      throw new Error(`Failed to update session ${sessionId}`);
    }
    return updatedSession;
  }

  /**
   * Generate preview for a session
   */
  async generatePreview(session: TaskSession): Promise<PlanPreview> {
    return this.renderer.buildPlanPreview(session);
  }

  /**
   * Complete a session with results
   */
  async completeSession(
    sessionId: string,
    results: Record<string, unknown>,
    success: boolean = true
  ): Promise<{
    session: TaskSession;
    completionMessage: string;
  }> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update session status
    const update: SessionUpdate = {
      status: success ? SessionStatus.SUCCEEDED : SessionStatus.FAILED,
      completedAt: new Date(),
    };

    if (!success && results.error) {
      update.error = String(results.error);
    }

    const updatedSession = await this.sessionManager.updateSessionStatus(sessionId, update);
    if (!updatedSession) {
      throw new Error(`Failed to update session ${sessionId}`);
    }

    // Generate completion message
    const completionMessage = success
      ? this.renderer.generateCompletionMessage(updatedSession, results)
      : `❌ **${updatedSession.plan.title} fallito**\n\nErrore: ${results.error || 'Errore sconosciuto'}`;

    return {
      session: updatedSession,
      completionMessage,
    };
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<TaskSession[]> {
    return this.sessionManager.getSessions({ userId });
  }
}
