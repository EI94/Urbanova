'use client';

// 📊 USE TELEMETRY - Client-side metrics hook
// Track time-to-first-action, user interactions, performance

import { useEffect, useRef, useCallback } from 'react';

/**
 * Client metric
 */
interface ClientMetric {
  type: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Telemetry hook
 */
export function useTelemetry(pageName: string) {
  const mountTime = useRef<number>(Date.now());
  const metricsBuffer = useRef<ClientMetric[]>([]);
  const firstActionRecorded = useRef(false);
  
  /**
   * Track time-to-first-action
   */
  const trackFirstAction = useCallback((actionType: string) => {
    if (firstActionRecorded.current) return;
    
    const timeToFirstAction = Date.now() - mountTime.current;
    
    const metric: ClientMetric = {
      type: 'time_to_first_action',
      value: timeToFirstAction,
      timestamp: Date.now(),
      metadata: {
        page: pageName,
        actionType,
      },
    };
    
    metricsBuffer.current.push(metric);
    firstActionRecorded.current = true;
    
    console.log(`📊 [Telemetry] First action: ${actionType} after ${timeToFirstAction}ms`);
    
    // Send to backend
    sendMetrics([metric]);
  }, [pageName]);
  
  /**
   * Track custom event
   */
  const track = useCallback((eventName: string, value: number = 1, metadata?: Record<string, unknown>) => {
    const metric: ClientMetric = {
      type: eventName,
      value,
      timestamp: Date.now(),
      metadata: {
        page: pageName,
        ...metadata,
      },
    };
    
    metricsBuffer.current.push(metric);
    
    console.log(`📊 [Telemetry] ${eventName}: ${value}`, metadata);
    
    // Send to backend
    sendMetrics([metric]);
  }, [pageName]);
  
  /**
   * Track performance
   */
  const trackPerformance = useCallback((label: string, startTime: number) => {
    const duration = Date.now() - startTime;
    
    track(`performance.${label}`, duration, { unit: 'ms' });
  }, [track]);
  
  /**
   * Track error
   */
  const trackError = useCallback((error: Error | string, context?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    track('error', 1, {
      errorMessage,
      ...context,
    });
  }, [track]);
  
  // Track page view on mount
  useEffect(() => {
    track('page_view', 1);
    
    // Track page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        track('page_hidden', 1);
      } else {
        track('page_visible', 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Flush remaining metrics on unmount
      if (metricsBuffer.current.length > 0) {
        sendMetrics(metricsBuffer.current);
      }
    };
  }, [track]);
  
  return {
    trackFirstAction,
    track,
    trackPerformance,
    trackError,
  };
}

/**
 * Send metrics to backend
 */
async function sendMetrics(metrics: ClientMetric[]): Promise<void> {
  try {
    // Batch send to backend API
    await fetch('/api/telemetry/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics }),
    });
  } catch (error) {
    console.warn('⚠️ [Telemetry] Failed to send metrics:', error);
    // Fail silently - non bloccare UX
  }
}

