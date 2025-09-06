import {
  InteractiveTaskSession as TaskSession,
  InteractiveUserReply as UserReply,
  SessionStatus,
  zTaskSession,
  zUserReply,
} from '@urbanova/types';
import { v4 as uuidv4 } from 'uuid';

export interface SessionFilter {
  userId?: string;
  projectId?: string;
  status?: SessionStatus;
  limit?: number;
  offset?: number;
}

export interface SessionUpdate {
  status?: SessionStatus;
  currentStep?: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export class SessionManager {
  private sessions: Map<string, TaskSession> = new Map();

  constructor() {
    // In production, this would connect to Firestore
    // For now, we'll use in-memory storage for development
  }

  /**
   * Create a new task session
   */
  async createSession(
    session: Omit<TaskSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskSession> {
    const newSession: TaskSession = {
      ...session,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(newSession.id, newSession);
    return newSession;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<TaskSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get sessions with filtering
   */
  async getSessions(filter: SessionFilter = {}): Promise<TaskSession[]> {
    let sessions = Array.from(this.sessions.values());

    // Apply filters
    if (filter.userId) {
      sessions = sessions.filter(s => s.userId === filter.userId);
    }
    if (filter.projectId) {
      sessions = sessions.filter(s => s.projectId === filter.projectId);
    }
    if (filter.status) {
      sessions = sessions.filter(s => s.status === filter.status);
    }

    // Apply pagination
    if (filter.offset) {
      sessions = sessions.slice(filter.offset);
    }
    if (filter.limit) {
      sessions = sessions.slice(0, filter.limit);
    }

    return sessions;
  }

  /**
   * Update session status and other fields
   */
  async updateSessionStatus(sessionId: string, update: SessionUpdate): Promise<TaskSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const updatedSession: TaskSession = {
      ...session,
      ...update,
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Apply a user reply to a session
   */
  async applyReply(
    sessionId: string,
    reply: Omit<UserReply, 'id' | 'timestamp'>
  ): Promise<TaskSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const newReply: UserReply = {
      ...reply,
      id: uuidv4(),
      timestamp: new Date(),
    };

    const updatedSession: TaskSession = {
      ...session,
      replies: [...session.replies, newReply],
      updatedAt: new Date(),
    };

    // Update session status based on reply type
    switch (reply.type) {
      case 'confirm':
        if (session.status === SessionStatus.AWAITING_CONFIRM) {
          updatedSession.status = SessionStatus.RUNNING;
          updatedSession.startedAt = new Date();
        }
        break;
      case 'cancel':
        updatedSession.status = SessionStatus.CANCELLED;
        updatedSession.completedAt = new Date();
        break;
      case 'edit':
        // Reset to collecting status to gather more information
        updatedSession.status = SessionStatus.COLLECTING;
        break;
      case 'dryrun':
        // Keep current status for dry run
        break;
      case 'provide_value':
        // Check if all requirements are met
        if (this.areRequirementsMet(updatedSession)) {
          updatedSession.status = SessionStatus.AWAITING_CONFIRM;
        }
        break;
    }

    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<TaskSession[]> {
    return this.getSessions({
      userId,
      status: SessionStatus.COLLECTING,
    });
  }

  /**
   * Get sessions awaiting confirmation
   */
  async getSessionsAwaitingConfirmation(userId: string): Promise<TaskSession[]> {
    return this.getSessions({
      userId,
      status: SessionStatus.AWAITING_CONFIRM,
    });
  }

  /**
   * Get running sessions
   */
  async getRunningSessions(userId: string): Promise<TaskSession[]> {
    return this.getSessions({
      userId,
      status: SessionStatus.RUNNING,
    });
  }

  /**
   * Check if all requirements are met for a session
   */
  private areRequirementsMet(session: TaskSession): boolean {
    // This is a simplified check - in production you'd validate against the actual plan
    // and check if all required fields have been provided
    return session.plan.requirements.every(req => {
      if (!req.required) return true;

      // Check if the requirement has been satisfied through user replies
      const valueReplies = session.replies.filter(
        r => r.type === 'provide_value' && r.data && r.data[req.field]
      );

      return valueReplies.length > 0;
    });
  }

  /**
   * Get session statistics
   */
  async getSessionStats(userId: string): Promise<{
    total: number;
    collecting: number;
    awaitingConfirm: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  }> {
    const sessions = await this.getSessions({ userId });

    return {
      total: sessions.length,
      collecting: sessions.filter(s => s.status === SessionStatus.COLLECTING).length,
      awaitingConfirm: sessions.filter(s => s.status === SessionStatus.AWAITING_CONFIRM).length,
      running: sessions.filter(s => s.status === SessionStatus.RUNNING).length,
      completed: sessions.filter(s => s.status === SessionStatus.SUCCEEDED).length,
      failed: sessions.filter(s => s.status === SessionStatus.FAILED).length,
      cancelled: sessions.filter(s => s.status === SessionStatus.CANCELLED).length,
    };
  }

  /**
   * Clean up old completed sessions
   */
  async cleanupOldSessions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.completedAt && session.completedAt < cutoffDate) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Validate session data
   */
  validateSession(session: unknown): { success: boolean; errors?: string[] } {
    const result = zTaskSession.safeParse(session);
    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        errors: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
      };
    }
  }

  /**
   * Validate user reply data
   */
  validateReply(reply: unknown): { success: boolean; errors?: string[] } {
    const result = zUserReply.safeParse(reply);
    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        errors: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
      };
    }
  }
}
