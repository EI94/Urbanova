'use client';

// 📡 USE OS ACTIVITY STREAM - SSE subscription hook
// Real-time events per LiveTicker

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * SSE Event (from server)
 */
export interface OsStreamEvent {
  type: 'plan_started' | 'step_started' | 'step_progress' | 'step_succeeded' | 'step_failed' | 'plan_completed';
  planId: string;
  stepId?: string;
  skillId?: string;
  projectId?: string;
  label?: string;
  percent?: number; // 0-100
  message?: string;
  ts: number;
}

/**
 * Active step state
 */
export interface ActiveStep {
  stepId: string;
  skillId: string;
  label: string;
  status: 'running' | 'progress' | 'success' | 'failed';
  progress?: number;
  startTime: number;
}

/**
 * Hook state
 */
interface UseOsActivityStreamState {
  connected: boolean;
  activeSteps: ActiveStep[];
  currentPlanId?: string;
  lastEvent?: OsStreamEvent;
  error?: string;
}

/**
 * Track SSE error
 */
function trackSseError(userId: string, sessionId: string, errorType: string): void {
  try {
    fetch('/api/telemetry/sse-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId, errorType }),
    });
  } catch (error) {
    console.warn('Failed to track SSE error:', error);
  }
}

/**
 * Hook for SSE subscription
 */
export function useOsActivityStream(userId: string, sessionId: string) {
  const [state, setState] = useState<UseOsActivityStreamState>({
    connected: false,
    activeSteps: [],
  });
  
  const eventSourceRef = useRef<EventSource | null>(null);
  
  /**
   * Connect to SSE stream
   */
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return; // Already connected
    }
    
    const url = `/api/os2/stream?userId=${userId}&sessionId=${sessionId}`;
    
    console.log(`📡 [Stream] Connecting to ${url}...`);
    
    const eventSource = new EventSource(url);
    
    eventSource.onopen = () => {
      console.log('📡 [Stream] Connected');
      setState(prev => ({ ...prev, connected: true, error: undefined }));
    };
    
    eventSource.onmessage = (e) => {
      try {
        const event: OsStreamEvent = JSON.parse(e.data);
        
        console.log(`📡 [Stream] Event:`, event.type, event);
        
        handleEvent(event);
        
      } catch (error) {
        console.error('📡 [Stream] Parse error:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('📡 [Stream] Error:', error);
      
      // Track SSE error
      trackSseError(userId, sessionId, 'connection_lost');
      
      setState(prev => ({
        ...prev,
        connected: false,
        error: 'Connection lost',
      }));
      
      // Reconnect after 3s
      setTimeout(() => {
        eventSource.close();
        eventSourceRef.current = null;
        connect();
      }, 3000);
    };
    
    eventSourceRef.current = eventSource;
  }, [userId, sessionId]);
  
  /**
   * Handle incoming event
   */
  const handleEvent = useCallback((event: OsStreamEvent) => {
    setState(prev => {
      const newState = { ...prev, lastEvent: event };
      
      // plan_started
      if (event.type === 'plan_started') {
        newState.currentPlanId = event.planId;
        newState.activeSteps = [];
      }
      
      // step_started
      if (event.type === 'step_started' && event.stepId && event.skillId) {
        const newStep: ActiveStep = {
          stepId: event.stepId,
          skillId: event.skillId,
          label: event.label || event.skillId,
          status: 'running',
          startTime: event.ts,
        };
        
        newState.activeSteps = [...prev.activeSteps, newStep];
      }
      
      // step_progress
      if (event.type === 'step_progress' && event.stepId) {
        newState.activeSteps = prev.activeSteps.map(step =>
          step.stepId === event.stepId
            ? { ...step, status: 'progress' as const, progress: event.percent }
            : step
        );
      }
      
      // step_succeeded
      if (event.type === 'step_succeeded' && event.stepId) {
        newState.activeSteps = prev.activeSteps.map(step =>
          step.stepId === event.stepId
            ? { ...step, status: 'success' as const }
            : step
        );
      }
      
      // step_failed
      if (event.type === 'step_failed' && event.stepId) {
        newState.activeSteps = prev.activeSteps.map(step =>
          step.stepId === event.stepId
            ? { ...step, status: 'failed' as const }
            : step
        );
      }
      
      // plan_completed
      if (event.type === 'plan_completed') {
        // Keep final state for 3s then clear
        setTimeout(() => {
          setState(s => ({
            ...s,
            currentPlanId: undefined,
            activeSteps: [],
          }));
        }, 3000);
      }
      
      return newState;
    });
  }, []);
  
  /**
   * Disconnect
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      
      setState(prev => ({
        ...prev,
        connected: false,
        activeSteps: [],
        currentPlanId: undefined,
      }));
      
      console.log('📡 [Stream] Disconnected');
    }
  }, []);
  
  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    connected: state.connected,
    activeSteps: state.activeSteps,
    currentPlanId: state.currentPlanId,
    lastEvent: state.lastEvent,
    error: state.error,
    connect,
    disconnect,
  };
}

