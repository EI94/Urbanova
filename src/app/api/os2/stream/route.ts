// 📡 API ROUTE - OS2 SSE Stream
// Server-Sent Events per real-time execution updates

import { NextRequest } from 'next/server';
import { getBroadcaster } from '@/os2/events/Broadcaster';

/**
 * SSE Event Type
 */
export type SseEventType = 
  | 'plan_started'
  | 'step_started'
  | 'step_progress'
  | 'step_succeeded'
  | 'step_failed'
  | 'plan_completed';

/**
 * SSE Event Data
 */
export interface SseEvent {
  type: SseEventType;
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
 * Active SSE connections (in-memory)
 * In production, use Redis for multi-instance support
 */
const activeStreams = new Map<string, {
  controller: ReadableStreamDefaultController;
  sessionId: string;
  userId: string;
  lastActivity: number;
}>();

/**
 * Configure Broadcaster on module load
 */
const broadcaster = getBroadcaster();
broadcaster.setBroadcastCallback(broadcastEvent);

/**
 * GET /api/os2/stream?sessionId=xxx&userId=xxx
 * SSE endpoint per real-time updates
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');
  
  // Validation
  if (!sessionId || !userId) {
    return new Response('Missing sessionId or userId', { status: 400 });
  }
  
  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      const streamKey = `${userId}:${sessionId}`;
      activeStreams.set(streamKey, {
        controller,
        sessionId,
        userId,
        lastActivity: Date.now(),
      });
      
      console.log(`📡 [SSE] New connection: ${streamKey}`);
      
      // Send initial event
      const initEvent: SseEvent = {
        type: 'plan_started',
        planId: 'init',
        ts: Date.now(),
        message: 'Connected',
      };
      
      sendEvent(controller, initEvent);
      
      // Setup keep-alive (every 15s)
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(': keep-alive\n\n');
        } catch (error) {
          console.log(`📡 [SSE] Keep-alive failed for ${streamKey}, cleaning up`);
          clearInterval(keepAliveInterval);
          activeStreams.delete(streamKey);
        }
      }, 15000);
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        console.log(`📡 [SSE] Connection closed: ${streamKey}`);
        clearInterval(keepAliveInterval);
        activeStreams.delete(streamKey);
        
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
    },
  });
  
  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

/**
 * Send SSE event to controller
 */
function sendEvent(controller: ReadableStreamDefaultController, event: SseEvent): void {
  const eventData = `data: ${JSON.stringify(event)}\n\n`;
  controller.enqueue(eventData);
}

/**
 * Broadcast event to specific user session
 */
export function broadcastEvent(userId: string, sessionId: string, event: SseEvent): void {
  const streamKey = `${userId}:${sessionId}`;
  const stream = activeStreams.get(streamKey);
  
  if (stream) {
    try {
      sendEvent(stream.controller, event);
      stream.lastActivity = Date.now();
      
      console.log(`📡 [SSE] Event sent to ${streamKey}:`, event.type);
    } catch (error) {
      console.error(`📡 [SSE] Failed to send event to ${streamKey}:`, error);
      activeStreams.delete(streamKey);
    }
  } else {
    console.warn(`📡 [SSE] No active stream for ${streamKey}`);
  }
}

/**
 * Broadcast to all sessions for a user
 */
export function broadcastToUser(userId: string, event: SseEvent): void {
  let sent = 0;
  
  activeStreams.forEach((stream, streamKey) => {
    if (stream.userId === userId) {
      try {
        sendEvent(stream.controller, event);
        stream.lastActivity = Date.now();
        sent++;
      } catch (error) {
        console.error(`📡 [SSE] Failed to broadcast to ${streamKey}:`, error);
        activeStreams.delete(streamKey);
      }
    }
  });
  
  if (sent > 0) {
    console.log(`📡 [SSE] Event broadcast to ${sent} sessions for user ${userId}`);
  }
}

/**
 * Get active connections count
 */
export function getActiveConnectionsCount(): number {
  return activeStreams.size;
}

/**
 * Cleanup stale connections (> 5 min inactive)
 */
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes
  
  activeStreams.forEach((stream, streamKey) => {
    if (now - stream.lastActivity > staleThreshold) {
      console.log(`📡 [SSE] Cleaning up stale connection: ${streamKey}`);
      
      try {
        stream.controller.close();
      } catch (error) {
        // Already closed
      }
      
      activeStreams.delete(streamKey);
    }
  });
}, 60000); // Check every minute

