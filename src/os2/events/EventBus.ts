// 🚌 EVENT BUS - Internal event emitter per OS 2.0
// Singleton pattern per emissione e sottoscrizione eventi

/**
 * Event types
 */
export type OsEventType = 
  | 'plan_started'
  | 'step_started'
  | 'step_progress'
  | 'step_succeeded'
  | 'step_failed'
  | 'plan_completed'
  | 'plan_failed';

/**
 * Base event
 */
export interface OsEvent {
  type: OsEventType;
  planId: string;
  userId: string;
  sessionId: string;
  timestamp: number;
}

/**
 * Specific event types
 */
export interface PlanStartedEvent extends OsEvent {
  type: 'plan_started';
  projectId?: string;
  stepsCount: number;
}

export interface StepStartedEvent extends OsEvent {
  type: 'step_started';
  stepIndex: number;
  stepId: string;
  skillId: string;
  label: string;
  projectId?: string;
}

export interface StepProgressEvent extends OsEvent {
  type: 'step_progress';
  stepIndex: number;
  stepId: string;
  percent: number; // 0-100
}

export interface StepSucceededEvent extends OsEvent {
  type: 'step_succeeded';
  stepIndex: number;
  stepId: string;
  skillId: string;
  duration: number; // ms
}

export interface StepFailedEvent extends OsEvent {
  type: 'step_failed';
  stepIndex: number;
  stepId: string;
  skillId: string;
  message: string; // Non-sensitive error message
  duration: number;
}

export interface PlanCompletedEvent extends OsEvent {
  type: 'plan_completed';
  duration: number; // ms
  successfulSteps: number;
  failedSteps: number;
  success: boolean;
}

export interface PlanFailedEvent extends OsEvent {
  type: 'plan_failed';
  duration: number;
  errorMessage: string;
}

/**
 * Union type
 */
export type OsEventData = 
  | PlanStartedEvent
  | StepStartedEvent
  | StepProgressEvent
  | StepSucceededEvent
  | StepFailedEvent
  | PlanCompletedEvent
  | PlanFailedEvent;

/**
 * Event handler
 */
export type EventHandler = (event: OsEventData) => void;

/**
 * EventBus - Internal event emitter
 */
export class EventBus {
  private static instance: EventBus;
  private handlers: Map<OsEventType, Set<EventHandler>> = new Map();
  private allHandlers: Set<EventHandler> = new Set();
  
  private constructor() {
    console.log('🚌 [EventBus] Inizializzato');
  }
  
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Emit event
   */
  public emit(event: OsEventData): void {
    console.log(`🚌 [EventBus] Emit: ${event.type} [plan:${event.planId}, user:${event.userId}]`);
    
    // Call type-specific handlers
    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      typeHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`🚌 [EventBus] Handler error for ${event.type}:`, error);
        }
      });
    }
    
    // Call wildcard handlers
    this.allHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`🚌 [EventBus] Wildcard handler error:`, error);
      }
    });
  }
  
  /**
   * Subscribe to specific event type
   */
  public on(type: OsEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }
  
  /**
   * Subscribe to all events
   */
  public onAny(handler: EventHandler): () => void {
    this.allHandlers.add(handler);
    
    return () => {
      this.allHandlers.delete(handler);
    };
  }
  
  /**
   * Remove all handlers
   */
  public clear(): void {
    this.handlers.clear();
    this.allHandlers.clear();
  }
  
  /**
   * Get handler count (for debugging)
   */
  public getHandlerCount(type?: OsEventType): number {
    if (type) {
      return this.handlers.get(type)?.size || 0;
    }
    
    let total = this.allHandlers.size;
    this.handlers.forEach(handlers => {
      total += handlers.size;
    });
    
    return total;
  }
}

/**
 * Get EventBus singleton
 */
export function getEventBus(): EventBus {
  return EventBus.getInstance();
}

