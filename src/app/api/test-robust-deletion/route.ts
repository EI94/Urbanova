import { NextRequest, NextResponse } from 'next/server';

import { robustProjectDeletionService } from '@/lib/robustProjectDeletionService';

export async function POST(request: NextRequest) {
  try {
    const { projectId, action } = await request.json();

    console.log(`🧪 TEST ROBUST DELETION - Action: ${action}, ProjectId: ${projectId}`);

    if (action === 'delete-single') {
      if (!projectId) {
        return NextResponse.json(
          {
            success: false,
            error: 'ProjectId richiesto per eliminazione singola',
          },
          { status: 400 }
        );
      }

      const result = await robustProjectDeletionService.robustDeleteProject(projectId);
      return NextResponse.json(result);
    } else if (action === 'cleanup-all') {
      const result = await robustProjectDeletionService.completeDatabaseCleanup();
      return NextResponse.json(result);
    } else if (action === 'status') {
      const status = robustProjectDeletionService.getServiceStatus();
      return NextResponse.json({
        success: true,
        status,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Azione non valida. Usa: delete-single, cleanup-all, o status',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Errore test robust deletion:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Errore interno: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = robustProjectDeletionService.getServiceStatus();

    return NextResponse.json({
      success: true,
      message: 'Test Robust Deletion Service - Endpoint attivo',
      status,
      timestamp: new Date().toISOString(),
      endpoints: {
        'POST /api/test-robust-deletion': 'Testa eliminazione robusta',
        'GET /api/test-robust-deletion': 'Stato servizio',
      },
      actions: [
        'delete-single: Elimina un progetto specifico',
        'cleanup-all: Pulisce tutto il database',
        'status: Stato del servizio',
      ],
    });
  } catch (error) {
    console.error('❌ Errore GET test robust deletion:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Errore interno: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
      },
      { status: 500 }
    );
  }
}
