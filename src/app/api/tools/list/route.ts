import { NextRequest, NextResponse } from 'next/server';

// Mock data per i tool abilitati
const enabledTools = [
  {
    id: 'feasibility-tool',
    name: 'Analisi Fattibilità',
    version: '1.0.0',
    description: 'Tool per analisi finanziarie, ROI e analisi di sensibilità',
    category: 'financial',
    enabled: true,
    actions: [
      {
        name: 'run_sensitivity',
        description: 'Esegue analisi di sensibilità',
        requiredRole: 'pm',
        confirm: false,
        longRunning: false,
        args: {
          projectId: { type: 'string', required: true, description: 'ID del progetto' },
          deltas: {
            type: 'array',
            required: false,
            description: 'Array di deltas per analisi',
            default: [-0.05, 0.05],
          },
        },
      },
      {
        name: 'calculate_roi',
        description: 'Calcola ROI del progetto',
        requiredRole: 'pm',
        confirm: false,
        longRunning: false,
        args: {
          projectId: { type: 'string', required: true, description: 'ID del progetto' },
          includeTaxes: {
            type: 'boolean',
            required: false,
            description: 'Include tasse nel calcolo',
            default: true,
          },
        },
      },
      {
        name: 'generate_report',
        description: 'Genera report fattibilità',
        requiredRole: 'pm',
        confirm: true,
        longRunning: true,
        args: {
          projectId: { type: 'string', required: true, description: 'ID del progetto' },
          format: {
            type: 'string',
            required: false,
            description: 'Formato report',
            default: 'pdf',
            enum: ['pdf', 'excel', 'html'],
          },
        },
      },
    ],
  },
  {
    id: 'land-scraper',
    name: 'Land Scraper',
    version: '2.1.0',
    description: 'Scansiona annunci immobiliari e estrae dati strutturati',
    category: 'research',
    enabled: true,
    actions: [
      {
        name: 'scan_listing',
        description: 'Scansiona singolo annuncio',
        requiredRole: 'sales',
        confirm: false,
        longRunning: false,
        args: {
          url: { type: 'string', required: true, description: "URL dell'annuncio" },
        },
      },
      {
        name: 'analyze_market',
        description: 'Analizza trend di mercato',
        requiredRole: 'pm',
        confirm: false,
        longRunning: true,
        args: {
          location: { type: 'string', required: true, description: 'Località da analizzare' },
          propertyType: {
            type: 'string',
            required: false,
            description: 'Tipo di proprietà',
            default: 'all',
          },
        },
      },
    ],
  },
  {
    id: 'document-manager',
    name: 'Document Manager',
    version: '1.5.0',
    description: 'Gestisce documenti, compliance e workflow approvazioni',
    category: 'compliance',
    enabled: true,
    actions: [
      {
        name: 'request_doc',
        description: 'Richiede nuovo documento',
        requiredRole: 'pm',
        confirm: true,
        longRunning: false,
        args: {
          projectId: { type: 'string', required: true, description: 'ID del progetto' },
          docType: { type: 'string', required: true, description: 'Tipo di documento' },
          vendor: { type: 'string', required: false, description: 'Vendor responsabile' },
        },
      },
      {
        name: 'check_status',
        description: 'Verifica stato documenti',
        requiredRole: 'pm',
        confirm: false,
        longRunning: false,
        args: {
          projectId: { type: 'string', required: true, description: 'ID del progetto' },
        },
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default';
    const projectId = searchParams.get('projectId');
    const category = searchParams.get('category');

    // Filtra tool per workspace e progetto
    let filteredTools = enabledTools.filter(tool => tool.enabled);

    // Filtra per categoria se specificata
    if (category) {
      filteredTools = filteredTools.filter(tool => tool.category === category);
    }

    // Filtra per progetto se specificato
    if (projectId) {
      // In futuro, qui si verificherà se il tool è abilitato per il progetto specifico
      // filteredTools = filteredTools.filter(tool => isToolEnabledForProject(workspaceId, projectId, tool.id));
    }

    return NextResponse.json({
      success: true,
      data: {
        tools: filteredTools,
        total: filteredTools.length,
        workspaceId,
        projectId,
        category,
      },
    });
  } catch (error) {
    console.error('Errore durante recupero tool:', error);

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
