// 🧪 API TEST - OS2 Planner/Executor
// Endpoint di test per verificare funzionamento OS2

import { NextRequest, NextResponse } from 'next/server';
// LAZY: Import dinamico per evitare TDZ durante bundle
// import { getOS2, OS2Request } from '@/os2';
type OS2Request = any; // Type only, verrà risolto dinamicamente

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userMessage, intent, entities, userId = 'test-user', userEmail = 'test@test.com' } = body;
    
    if (!userMessage || !intent) {
      return NextResponse.json(
        { success: false, error: 'userMessage e intent sono richiesti' },
        { status: 400 }
      );
    }
    
    console.log('🧪 [OS2 Test API] Testing OS2 con:', { intent, entities });
    
    // Crea request per OS2
    const os2Request: OS2Request = {
      userMessage,
      intent,
      entities: entities || {},
      userId,
      userEmail,
      sessionId: `test_session_${Date.now()}`,
      environment: 'development',
      userRoles: ['editor'], // Test con permessi editor
      userConfirmations: body.userConfirmations || [],
    };
    
    // Processa con OS2 - LAZY: Carica getOS2 solo quando necessario
    const os2Module = await import('@/os2');
    const os2 = os2Module.getOS2();
    const response = await os2.process(os2Request);
    
    console.log('✅ [OS2 Test API] Response generata:', {
      planId: response.metadata.planId,
      status: response.execution.status,
      stepsExecuted: response.metadata.stepsExecuted,
    });
    
    return NextResponse.json({
      success: response.success,
      planId: response.metadata.planId,
      executionStatus: response.execution.status,
      response: response.response,
      plan: {
        goal: response.plan.goal,
        stepsCount: response.plan.steps.length,
        assumptions: response.plan.assumptions,
        risks: response.plan.risks,
        confirmables: response.plan.confirmables,
      },
      execution: {
        totalTimeMs: response.metadata.executionTimeMs,
        stepsExecuted: response.metadata.stepsExecuted,
        stepsSuccessful: response.metadata.stepsSuccessful,
        stepsFailed: response.metadata.stepsFailed,
        stepsAwaitingConfirm: response.metadata.stepsAwaitingConfirm,
        stepResults: response.execution.stepResults.map(r => ({
          stepIndex: r.stepIndex,
          skillId: r.skillId,
          status: r.status,
          executionTimeMs: r.executionTimeMs,
          error: r.error,
        })),
      },
      error: response.error,
    });
    
  } catch (error) {
    console.error('❌ [OS2 Test API] Errore:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check OS2 - LAZY: Carica getOS2 solo quando necessario
  const os2Module = await import('@/os2');
  const os2 = os2Module.getOS2();
  const health = await os2.healthCheck();
  
  return NextResponse.json({
    name: 'Urbanova OS 2.0 - Planner/Executor',
    version: '2.0.0',
    health,
    endpoints: {
      test: 'POST /api/os2/test',
      healthCheck: 'GET /api/os2/test',
    },
    examples: [
      {
        name: 'Business Plan',
        request: {
          userMessage: 'Crea BP progetto Test',
          intent: 'business_plan',
          entities: {
            projectName: 'Test',
            units: 4,
            salePrice: 390000,
            constructionCost: 200000,
          },
        },
      },
      {
        name: 'Sensitivity Analysis',
        request: {
          userMessage: 'Sensitivity ±15%',
          intent: 'sensitivity_analysis',
          entities: {
            projectId: 'proj123',
            variable: 'price',
            range: 15,
          },
        },
      },
      {
        name: 'RDO Send',
        request: {
          userMessage: 'Invia RDO',
          intent: 'rdo_send',
          entities: {
            projectId: 'proj456',
            vendors: ['vendor1@test.com'],
          },
          userConfirmations: ['rdo.send'], // Conferma necessaria
        },
      },
    ],
  });
}

