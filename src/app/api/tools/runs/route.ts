import { NextRequest, NextResponse } from 'next/server';

// Mock data per i tool runs (in produzione questo verrà da database)
const mockToolRuns = [
  {
    id: 'run-1',
    toolId: 'feasibility-tool',
    action: 'run_sensitivity',
    projectId: 'proj-a',
    userId: 'user-123',
    workspaceId: 'workspace-1',
    status: 'completed',
    startedAt: '2025-01-30T10:00:00Z',
    finishedAt: '2025-01-30T10:00:03Z',
    executionTime: 3000,
    success: true,
    args: { projectId: 'proj-a', deltas: [-0.05, 0.05] },
    output: {
      baseRoi: 15.5,
      range: { min: 14.7, max: 16.3 },
      scenarios: 4,
      pdfUrl: 'https://storage.googleapis.com/urbanova-reports/sensitivity-run-1.pdf',
    },
  },
  {
    id: 'run-2',
    toolId: 'land-scraper',
    action: 'analyze_market',
    projectId: 'proj-b',
    userId: 'user-456',
    workspaceId: 'workspace-1',
    status: 'running',
    startedAt: '2025-01-30T11:30:00Z',
    progress: 65,
    estimatedTime: 30000,
    args: { location: 'Milano', propertyType: 'residential' },
  },
  {
    id: 'run-3',
    toolId: 'document-manager',
    action: 'request_doc',
    projectId: 'proj-c',
    userId: 'user-789',
    workspaceId: 'workspace-1',
    status: 'failed',
    startedAt: '2025-01-30T09:15:00Z',
    finishedAt: '2025-01-30T09:15:01Z',
    executionTime: 1000,
    success: false,
    args: { projectId: 'proj-c', docType: 'CDU', vendor: 'vendor-abc' },
    error: 'Documento non trovato nel sistema',
  },
  {
    id: 'run-4',
    toolId: 'feasibility-tool',
    action: 'calculate_roi',
    projectId: 'proj-d',
    userId: 'user-123',
    workspaceId: 'workspace-1',
    status: 'completed',
    startedAt: '2025-01-30T08:45:00Z',
    finishedAt: '2025-01-30T08:45:00Z',
    executionTime: 500,
    success: true,
    args: { projectId: 'proj-d', includeTaxes: true },
    output: {
      projectId: 'proj-d',
      baseRoi: 18.2,
      roiWithTaxes: 15.8,
      includeTaxes: true,
      calculationDate: '2025-01-30T08:45:00Z',
    },
  },
  {
    id: 'run-5',
    toolId: 'feasibility-tool',
    action: 'generate_report',
    projectId: 'proj-e',
    userId: 'user-456',
    workspaceId: 'workspace-1',
    status: 'completed',
    startedAt: '2025-01-30T07:30:00Z',
    finishedAt: '2025-01-30T07:30:45Z',
    executionTime: 45000,
    success: true,
    args: { projectId: 'proj-e', format: 'pdf' },
    output: {
      reportId: 'report-run-5',
      format: 'pdf',
      includeCharts: true,
      size: '3.1 MB',
      reportUrl: 'https://storage.googleapis.com/urbanova-reports/feasibility-run-5.pdf',
      generatedAt: '2025-01-30T07:30:45Z',
    },
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default';
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const toolId = searchParams.get('toolId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filtra runs per parametri
    let filteredRuns = [...mockToolRuns];

    // Filtra per workspace
    if (workspaceId !== 'default') {
      filteredRuns = filteredRuns.filter(run => run.workspaceId === workspaceId);
    }

    // Filtra per progetto
    if (projectId) {
      filteredRuns = filteredRuns.filter(run => run.projectId === projectId);
    }

    // Filtra per status
    if (status && status !== 'all') {
      filteredRuns = filteredRuns.filter(run => run.status === status);
    }

    // Filtra per tool
    if (toolId) {
      filteredRuns = filteredRuns.filter(run => run.toolId === toolId);
    }

    // Filtra per utente
    if (userId) {
      filteredRuns = filteredRuns.filter(run => run.userId === userId);
    }

    // Ordina per data di inizio (più recenti prima)
    filteredRuns.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    // Applica paginazione
    const paginatedRuns = filteredRuns.slice(offset, offset + limit);
    const total = filteredRuns.length;

    // Calcola statistiche
    const stats = {
      total,
      byStatus: {
        running: filteredRuns.filter(run => run.status === 'running').length,
        completed: filteredRuns.filter(run => run.status === 'completed').length,
        failed: filteredRuns.filter(run => run.status === 'failed').length,
        cancelled: filteredRuns.filter(run => run.status === 'cancelled').length,
        pending: filteredRuns.filter(run => run.status === 'pending').length,
      },
      byTool: filteredRuns.reduce(
        (acc, run) => {
          acc[run.toolId] = (acc[run.toolId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      averageExecutionTime:
        filteredRuns
          .filter(run => run.executionTime)
          .reduce((sum, run) => sum + (run.executionTime || 0), 0) /
          filteredRuns.filter(run => run.executionTime).length || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        runs: paginatedRuns,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Errore durante recupero tool runs:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}

// Endpoint per aggiornare lo stato di un run (es. cancellazione)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, status, progress } = body;

    if (!runId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parametro mancante',
          details: 'runId è obbligatorio',
        },
        { status: 400 }
      );
    }

    // In produzione, questo aggiornerebbe il database
    // Per ora, simuliamo l'aggiornamento
    const runIndex = mockToolRuns.findIndex(run => run.id === runId);

    if (runIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Run non trovato',
          details: `Run con ID ${runId} non esiste`,
        },
        { status: 404 }
      );
    }

    // Aggiorna il run
    if (status && mockToolRuns[runIndex]) {
      mockToolRuns[runIndex].status = status;

      if (status === 'cancelled' || status === 'completed' || status === 'failed') {
        mockToolRuns[runIndex].finishedAt = new Date().toISOString();
        if (mockToolRuns[runIndex].startedAt) {
          mockToolRuns[runIndex].executionTime =
            Date.now() - new Date(mockToolRuns[runIndex].startedAt).getTime();
        }
      }
    }

    if (progress !== undefined && mockToolRuns[runIndex]) {
      mockToolRuns[runIndex].progress = progress;
    }

    return NextResponse.json({
      success: true,
      data: {
        runId,
        status: mockToolRuns[runIndex]?.status,
        progress: mockToolRuns[runIndex]?.progress,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Errore durante aggiornamento run:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 }
    );
  }
}
