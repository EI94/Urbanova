import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// import { InteractiveTaskSession, InteractivePlan } from '@urbanova/types/interactive';

// Mock types
type InteractiveTaskSession = any;
type InteractivePlan = any;

const editRequestSchema = z.object({
  sessionId: z.string(),
  fills: z.record(z.any()),
});

// Mock data for demonstration
let mockSession: InteractiveTaskSession = {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, fills } = editRequestSchema.parse(body);

    if (sessionId !== 'session-123') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update the plan with new fills
    const updatedPlan: InteractivePlan = {
      ...mockSession.plan,
      requirements: mockSession.plan.requirements.map((req: any) => ({
        ...req,
        currentValue: fills[req.field] !== undefined ? fills[req.field] : req.currentValue,
      })),
      updatedAt: new Date(),
    };

    // Update the session
    mockSession = {
      ...mockSession,
      plan: updatedPlan,
      updatedAt: new Date(),
    };

    // Validate that all required fields are filled
    const missingRequirements = updatedPlan.requirements.filter(
      (req: any) =>
        req.required &&
        (req.currentValue === undefined || req.currentValue === null || req.currentValue === '')
    );

    const isReady = missingRequirements.length === 0;

    return NextResponse.json({
      success: true,
      session: mockSession,
      plan: updatedPlan,
      isReady,
      missingRequirements: missingRequirements.map((r: any) => r.field),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
