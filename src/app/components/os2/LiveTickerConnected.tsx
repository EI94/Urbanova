'use client';

// 🎬 LIVE TICKER CONNECTED - LiveTicker con SSE stream
// Versione connessa che riceve eventi real-time

import React from 'react';
import { LiveTicker, TickerStep } from './LiveTicker';
import { useOsActivityStream } from '@/hooks/os2/useOsActivityStream';

interface LiveTickerConnectedProps {
  userId: string;
  sessionId: string;
  onClose?: () => void;
}

/**
 * LiveTicker connesso a SSE stream
 */
export function LiveTickerConnected({
  userId,
  sessionId,
  onClose,
}: LiveTickerConnectedProps) {
  const { connected, activeSteps, currentPlanId, error } = useOsActivityStream(userId, sessionId);
  
  // Convert ActiveStep[] to TickerStep[]
  const tickerSteps: TickerStep[] = activeSteps.map(step => ({
    id: step.stepId,
    skillId: step.skillId,
    label: step.label,
    status: step.status,
    progress: step.progress,
  }));
  
  // Determine plan status
  const planStatus = currentPlanId
    ? activeSteps.some(s => s.status === 'running' || s.status === 'progress')
      ? 'running' as const
      : activeSteps.some(s => s.status === 'failed')
      ? 'failed' as const
      : activeSteps.length > 0 && activeSteps.every(s => s.status === 'success')
      ? 'completed' as const
      : 'running' as const
    : 'idle' as const;
  
  // Calculate total duration
  const totalDuration = activeSteps.length > 0
    ? Date.now() - Math.min(...activeSteps.map(s => s.startTime))
    : undefined;
  
  return (
    <>
      {/* Connection status (for debugging) */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-xs text-red-600">
          ⚠️ Stream error: {error}
        </div>
      )}
      
      {/* Live Ticker */}
      <LiveTicker
        planId={currentPlanId}
        planStatus={planStatus}
        steps={tickerSteps}
        totalDuration={totalDuration}
        onClose={onClose}
      />
    </>
  );
}

