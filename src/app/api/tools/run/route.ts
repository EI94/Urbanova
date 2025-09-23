import { NextRequest, NextResponse } from 'next/server';

// Mock data per i tool runs
let toolRuns: any[] = [];

// Simula esecuzione tool
async function executeToolAction(toolId: string, action: string, args: any, context: any) {
  const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newRun = {
    id: runId,
    toolId,
    action,
    projectId: args.projectId || context.projectId,
    userId: context.userId || 'unknown',
    workspaceId: context.workspaceId || 'default',
    status: 'running',
    startedAt: new Date().toISOString(),
    args,
    context,
    progress: 0,
    estimatedTime: 30000, // 30 secondi di default
  };

  // Aggiungi run alla lista
  toolRuns.unshift(newRun);

  // Simula esecuzione asincrona
  setTimeout(async () => {
    try {
      // Simula logica di esecuzione basata su tool e action
      let result: any = { success: false };

      if (toolId === 'feasibility-tool') {
        if (action === 'run_sensitivity') {
          result = {
            success: true,
            data: {
              baseRoi: 15.5,
              range: { min: 14.7, max: 16.3 },
              scenarios: 4,
              pdfUrl: `https://storage.googleapis.com/urbanova-reports/sensitivity-${runId}.pdf`,
              scenario: 'default',
            },
          };
        } else if (action === 'calculate_roi') {
          result = {
            success: true,
            data: {
              projectId: args.projectId,
              baseRoi: 15.5,
              roiWithTaxes: args.includeTaxes ? 13.2 : 15.5,
              includeTaxes: args.includeTaxes || false,
              calculationDate: new Date().toISOString(),
            },
          };
        } else if (action === 'generate_report') {
          result = {
            success: true,
            data: {
              reportId: `report-${runId}`,
              format: args.format || 'pdf',
              includeCharts: true,
              size: '2.3 MB',
              reportUrl: `https://storage.googleapis.com/urbanova-reports/feasibility-${runId}.${args.format || 'pdf'}`,
              generatedAt: new Date().toISOString(),
            },
          };
        }
      } else if (toolId === 'land-scraper') {
        if (action === 'scan_listing') {
          result = {
            success: true,
            data: {
              url: args.url,
              price: '€250.000',
              surface: '120 m²',
              location: 'Roma, EUR',
              type: 'Appartamento',
              extractedAt: new Date().toISOString(),
            },
          };
        } else if (action === 'analyze_market') {
          result = {
            success: true,
            data: {
              location: args.location,
              propertyType: args.propertyType || 'all',
              avgPrice: '€3,200/m²',
              trend: 'up',
              dataPoints: 150,
              analyzedAt: new Date().toISOString(),
            },
          };
        }
      } else if (toolId === 'document-manager') {
        if (action === 'request_doc') {
          result = {
            success: true,
            data: {
              requestId: `doc-request-${runId}`,
              projectId: args.projectId,
              docType: args.docType,
              vendor: args.vendor,
              status: 'pending',
              requestedAt: new Date().toISOString(),
            },
          };
        } else if (action === 'check_status') {
          result = {
            success: true,
            data: {
              projectId: args.projectId,
              documents: [
                { type: 'CDU', status: 'completed', completedAt: '2025-01-15' },
                { type: 'VISURA', status: 'completed', completedAt: '2025-01-10' },
                { type: 'DURC', status: 'pending', dueDate: '2025-02-01' },
              ],
              checkedAt: new Date().toISOString(),
            },
          };
        }
      }

      // Aggiorna run con risultato
      const runIndex = toolRuns.findIndex(run => run.id === runId);
      if (runIndex !== -1) {
        toolRuns[runIndex] = {
          ...toolRuns[runIndex],
          status: 'completed',
          finishedAt: new Date().toISOString(),
          executionTime: Date.now() - new Date(toolRuns[runIndex].startedAt).getTime(),
          success: result.success,
          output: result.data,
          error: result.success ? undefined : 'Esecuzione fallita',
        };
      }

      // Post messaggio a chat (simulato)
      console.log(`Tool ${toolId}.${action} completato:`, result);
    } catch (error) {
      console.error(`Errore durante esecuzione ${toolId}.${action}:`, error);

      // Aggiorna run con errore
      const runIndex = toolRuns.findIndex(run => run.id === runId);
      if (runIndex !== -1) {
        toolRuns[runIndex] = {
          ...toolRuns[runIndex],
          status: 'failed',
          finishedAt: new Date().toISOString(),
          executionTime: Date.now() - new Date(toolRuns[runIndex].startedAt).getTime(),
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
        };
      }
    }
  }, 3000); // Simula 3 secondi di esecuzione

  return newRun;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, action, projectId, args, context } = body;

    // Validazione input
    if (!toolId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parametri mancanti',
          details: 'toolId e action sono obbligatori',
        },
        { status: 400 }
      );
    }

    // Validazione context
    if (!context?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contesto utente mancante',
          details: 'userId è obbligatorio nel context',
        },
        { status: 400 }
      );
    }

    // Esegui azione tool
    const run = await executeToolAction(toolId, action, args || {}, context || {});

    return NextResponse.json({
      success: true,
      data: {
        runId: run.id,
        status: run.status,
        startedAt: run.startedAt,
        estimatedTime: run.estimatedTime,
      },
    });
  } catch (error) {
    console.error('Errore durante esecuzione tool:', error);

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

// Endpoint per ottenere lo stato di un run
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

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

    const run = toolRuns.find(r => r.id === runId);

    if (!run) {
      return NextResponse.json(
        {
          success: false,
          error: 'Run non trovato',
          details: `Run con ID ${runId} non esiste`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: run,
    });
  } catch (error) {
    console.error('Errore durante recupero run:', error);

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
