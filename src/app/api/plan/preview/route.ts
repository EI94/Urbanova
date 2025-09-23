import { NextRequest, NextResponse } from 'next/server';
// Mock types
type InteractiveTaskSession = any;
type InteractivePlan = any;

// Mock data for demonstration - in production this would come from the database
const mockSession: InteractiveTaskSession = {
  id: 'session-123',
  projectId: 'project-123',
  userId: 'user-123',
  status: 'awaiting_confirm',
  plan: {
    id: 'plan-123',
    title: 'Analisi di Fattibilità',
    description:
      "Esegue un'analisi completa di fattibilità del progetto con scenario di sensibilità",
    steps: [
      {
        id: 'step-1',
        toolId: 'feasibility',
        action: 'run_sensitivity',
        description: 'Esegui analisi di fattibilità con scenario di sensibilità',
        zArgs: { projectId: 'project-123', deltas: [0.1, 0.2, 0.3] },
        requiredRole: 'pm',
        order: 1,
      },
    ],
    requirements: [
      {
        id: 'req-1',
        field: 'projectId',
        description: "ID del progetto è richiesto per l'analisi di sensibilità",
        type: 'text',
        required: true,
        currentValue: 'project-123',
      },
      {
        id: 'req-2',
        field: 'deltas',
        description: "Array di delta per l'analisi di sensibilità",
        type: 'number',
        required: true,
        currentValue: [0.1, 0.2, 0.3],
      },
    ],
    assumptions: [
      {
        id: 'assump-1',
        source: 'project',
        confidence: 'high',
        description: 'Analisi per il progetto: project-123',
      },
    ],
    risks: [
      {
        id: 'risk-1',
        type: 'irreversible',
        severity: 'medium',
        description: '1 azione richiede conferma utente',
      },
    ],
    estimatedDuration: 300,
    totalCost: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  replies: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  // In production, fetch from database
  if (sessionId === 'session-123') {
    return NextResponse.json({
      success: true,
      session: mockSession,
      plan: mockSession.plan,
    });
  }

  return NextResponse.json({ error: 'Session not found' }, { status: 404 });
}
