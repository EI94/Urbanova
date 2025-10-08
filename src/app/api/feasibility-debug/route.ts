import { NextRequest, NextResponse } from 'next/server';
import '@/lib/osProtection'; // OS Protection per API

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { action, projectData } = requestData;
    
    console.log('🔍 [FEASIBILITY DEBUG API] Richiesta ricevuta:', { action, hasProjectData: !!projectData });
    
    // Import dinamico per evitare errori di build
    const { feasibilityDebugService } = await import('@/lib/feasibilityDebugService');
    
    switch (action) {
      case 'test-connection':
        console.log('🔍 [FEASIBILITY DEBUG API] Test connessione Firebase...');
        const connectionResult = await feasibilityDebugService.testFirebaseConnection();
        return NextResponse.json({
          success: true,
          action: 'test-connection',
          result: connectionResult,
          timestamp: new Date().toISOString()
        });

      case 'test-simple-save':
        console.log('🔍 [FEASIBILITY DEBUG API] Test salvataggio semplice...');
        const simpleSaveResult = await feasibilityDebugService.testSimpleSave();
        return NextResponse.json({
          success: true,
          action: 'test-simple-save',
          result: simpleSaveResult,
          timestamp: new Date().toISOString()
        });

      case 'test-real-save':
        console.log('🔍 [FEASIBILITY DEBUG API] Test salvataggio dati reali...');
        if (!projectData) {
          return NextResponse.json({
            success: false,
            error: 'Dati progetto mancanti per test salvataggio'
          }, { status: 400 });
        }
        
        const realSaveResult = await feasibilityDebugService.testRealDataSave(projectData);
        return NextResponse.json({
          success: true,
          action: 'test-real-save',
          result: realSaveResult,
          timestamp: new Date().toISOString()
        });

      case 'check-existing':
        console.log('🔍 [FEASIBILITY DEBUG API] Verifica progetti esistenti...');
        const existingResult = await feasibilityDebugService.checkExistingProjects();
        return NextResponse.json({
          success: true,
          action: 'check-existing',
          result: existingResult,
          timestamp: new Date().toISOString()
        });

      case 'full-test':
        console.log('🔍 [FEASIBILITY DEBUG API] Test completo sistema...');
        const fullTestResult = await feasibilityDebugService.runFullTest();
        return NextResponse.json({
          success: true,
          action: 'full-test',
          result: fullTestResult,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Azione non riconosciuta. Azioni disponibili: test-connection, test-simple-save, test-real-save, check-existing, full-test'
        }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('❌ [FEASIBILITY DEBUG API] Errore:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error?.message || 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [FEASIBILITY DEBUG API] Richiesta GET - informazioni endpoint');
    
    return NextResponse.json({
      success: true,
      endpoint: 'feasibility-debug',
      description: 'Endpoint per testare il sistema di salvataggio delle analisi di fattibilità',
      availableActions: [
        {
          action: 'test-connection',
          method: 'POST',
          description: 'Testa la connessione Firebase',
          body: { action: 'test-connection' }
        },
        {
          action: 'test-simple-save',
          method: 'POST',
          description: 'Testa il salvataggio di un progetto semplice',
          body: { action: 'test-simple-save' }
        },
        {
          action: 'test-real-save',
          method: 'POST',
          description: 'Testa il salvataggio con dati reali dalla UI',
          body: { action: 'test-real-save', projectData: { /* dati progetto */ } }
        },
        {
          action: 'check-existing',
          method: 'POST',
          description: 'Verifica progetti esistenti nel database',
          body: { action: 'check-existing' }
        },
        {
          action: 'full-test',
          method: 'POST',
          description: 'Esegue un test completo del sistema',
          body: { action: 'full-test' }
        }
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ [FEASIBILITY DEBUG API] Errore GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error?.message || 'Errore sconosciuto'
    }, { status: 500 });
  }
}
