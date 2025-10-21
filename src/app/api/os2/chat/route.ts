// 💬 API ROUTE - OS2 Chat
// Endpoint principale per conversazione OS 2.0

import { NextRequest, NextResponse } from 'next/server';
import { getOS2, OS2Request } from '@/os2';
import { broadcastEvent, SseEvent } from '../stream/route';
import { getSkillStatusLine } from '@/os2/conversation/systemPrompt';

/**
 * POST /api/os2/chat
 * Invia messaggio a OS 2.0 e riceve risposta
 */
export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body = await request.json();
    
    const {
      message,
      userId,
      userEmail,
      sessionId,
      projectId,
      userRoles = ['editor'],
      conversationHistory = [],
      userConfirmations = [],
    } = body;
    
    // Validation
    if (!message || !userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: message, userId, sessionId',
      }, { status: 400 });
    }
    
    // Prepare OS2 request
    const os2Request: OS2Request = {
      userMessage: message,
      intent: body.intent || 'general', // Will be classified if not provided
      entities: body.entities || {},
      confidence: body.confidence,
      classification: body.classification,
      userId,
      userEmail: userEmail && userEmail.trim() ? userEmail : `${userId}@urbanova.local`,
      sessionId,
      projectId,
      userRoles,
      conversationHistory,
      userConfirmations,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    };
    
    // Process with OS2 (con SSE callbacks + timing tracking)
    const os2 = getOS2();
    const startTime = Date.now();
    const requestSentAt = Date.now();
    let firstStatusAt: number | undefined;
    
    // Prepare SSE callbacks
    const sseCallbacks = {
      onPlanStarted: (planId: string) => {
        // Track time to first status
        if (!firstStatusAt) {
          firstStatusAt = Date.now();
          
          // Emit timing metric
          const metrics = require('@/os2/telemetry/metrics').getMetrics();
          metrics.trackTimeToFirstStatus({
            planId,
            userId,
            requestSentAt,
            firstStatusAt,
          });
        }
        
        const event: SseEvent = {
          type: 'plan_started',
          planId,
          projectId,
          ts: Date.now(),
        };
        broadcastEvent(userId, sessionId, event);
      },
      
      onStepStarted: (stepIndex: number, skillId: string, label: string) => {
        const event: SseEvent = {
          type: 'step_started',
          planId: 'current', // Will be updated with actual planId
          stepId: `step_${stepIndex}`,
          skillId,
          label: label || getSkillStatusLine(skillId),
          ts: Date.now(),
        };
        broadcastEvent(userId, sessionId, event);
      },
      
      onStepProgress: (stepIndex: number, percent: number) => {
        const event: SseEvent = {
          type: 'step_progress',
          planId: 'current',
          stepId: `step_${stepIndex}`,
          percent,
          ts: Date.now(),
        };
        broadcastEvent(userId, sessionId, event);
      },
      
      onStepCompleted: (stepIndex: number, success: boolean) => {
        const event: SseEvent = {
          type: success ? 'step_succeeded' : 'step_failed',
          planId: 'current',
          stepId: `step_${stepIndex}`,
          ts: Date.now(),
        };
        broadcastEvent(userId, sessionId, event);
      },
      
      onPlanCompleted: (planId: string, success: boolean, duration: number) => {
        // Track time to plan complete
        const planCompletedAt = Date.now();
        
        const metrics = require('@/os2/telemetry/metrics').getMetrics();
        metrics.trackTimeToPlanComplete({
          planId,
          userId,
          requestSentAt,
          planCompletedAt,
        });
        
        const event: SseEvent = {
          type: 'plan_completed',
          planId,
          message: `Completato in ${(duration / 1000).toFixed(1)}s`,
          ts: Date.now(),
        };
        broadcastEvent(userId, sessionId, event);
      },
    };
    
    // Add SSE callbacks to OS2 request options (if supported)
    // Note: Questo richiede che OS2.process() supporti callbacks
    // Per ora, il processo normale funziona, SSE sarà aggiunto quando Executor viene chiamato con callbacks
    
    // Usa il sistema smart per processare la richiesta
    console.log('📡 [OS2 Smart API] Invio richiesta a OS2 Smart...');
    const response = await os2.processRequestSmart(os2Request);
    
    const totalTime = Date.now() - startTime;
    
    // Return response
    return NextResponse.json({
      success: response.success,
      response: response.response,
      functionCalls: response.functionCalls || [],
      artifacts: response.artifacts || [],
      kpis: response.kpis || [],
      requestId: response.requestId,
      duration: totalTime,
      plan: response.plan || [],
      smart: response.smart || false,
      fallback: response.fallback || false,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('❌ [API /os2/chat] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

/**
 * GET /api/os2/chat (health check)
 */
export async function GET() {
  return NextResponse.json({
    service: 'OS2 Chat API',
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
}

