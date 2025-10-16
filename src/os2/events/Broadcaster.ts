// 📡 BROADCASTER - Pubblica eventi EventBus verso client SSE
// Scoping per user/session

import { getEventBus, OsEventData } from './EventBus';
import { SseEvent } from '@/app/api/os2/stream/route';

/**
 * Callback per inviare evento a client (fornito da SSE route)
 */
export type BroadcastCallback = (userId: string, sessionId: string, event: SseEvent) => void;

/**
 * Broadcaster - Pubblica eventi verso SSE
 */
export class Broadcaster {
  private static instance: Broadcaster;
  private eventBus = getEventBus();
  private broadcastCallback?: BroadcastCallback;
  
  private constructor() {
    // Subscribe to all EventBus events
    this.eventBus.onAny((event) => {
      this.publishToSSE(event);
    });
    
    console.log('📡 [Broadcaster] Inizializzato');
  }
  
  public static getInstance(): Broadcaster {
    if (!Broadcaster.instance) {
      Broadcaster.instance = new Broadcaster();
    }
    return Broadcaster.instance;
  }
  
  /**
   * Set broadcast callback (da SSE route)
   */
  public setBroadcastCallback(callback: BroadcastCallback): void {
    this.broadcastCallback = callback;
    console.log('📡 [Broadcaster] Callback SSE configurato');
  }
  
  /**
   * Publish event to SSE clients
   */
  private publishToSSE(event: OsEventData): void {
    if (!this.broadcastCallback) {
      console.warn('📡 [Broadcaster] No callback configured, skip SSE publish');
      return;
    }
    
    // Convert OsEventData to SseEvent
    const sseEvent = this.convertToSseEvent(event);
    
    // Broadcast to specific user/session
    try {
      this.broadcastCallback(event.userId, event.sessionId, sseEvent);
    } catch (error) {
      console.error('📡 [Broadcaster] Error broadcasting to SSE:', error);
    }
  }
  
  /**
   * Convert internal event to SSE event
   */
  private convertToSseEvent(event: OsEventData): SseEvent {
    const baseEvent = {
      planId: event.planId,
      ts: event.timestamp,
    };
    
    switch (event.type) {
      case 'plan_started':
        return {
          type: 'plan_started',
          ...baseEvent,
          projectId: event.projectId,
        };
      
      case 'step_started':
        return {
          type: 'step_started',
          ...baseEvent,
          stepId: event.stepId,
          skillId: event.skillId,
          label: event.label,
          projectId: event.projectId,
        };
      
      case 'step_progress':
        return {
          type: 'step_progress',
          ...baseEvent,
          stepId: event.stepId,
          percent: event.percent,
        };
      
      case 'step_succeeded':
        return {
          type: 'step_succeeded',
          ...baseEvent,
          stepId: event.stepId,
          skillId: event.skillId,
        };
      
      case 'step_failed':
        return {
          type: 'step_failed',
          ...baseEvent,
          stepId: event.stepId,
          skillId: event.skillId,
          message: event.message,
        };
      
      case 'plan_completed':
        return {
          type: 'plan_completed',
          ...baseEvent,
          message: `Completato in ${(event.duration / 1000).toFixed(1)}s`,
        };
      
      case 'plan_failed':
        return {
          type: 'plan_completed', // Map to plan_completed con success=false
          ...baseEvent,
          message: `Fallito: ${event.errorMessage}`,
        };
    }
  }
}

/**
 * Get Broadcaster singleton
 */
export function getBroadcaster(): Broadcaster {
  return Broadcaster.getInstance();
}

