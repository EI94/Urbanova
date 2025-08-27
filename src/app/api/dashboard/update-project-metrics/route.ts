import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/lib/dashboardService';

export async function POST(request: NextRequest) {
  try {
    const { projectId, metrics } = await request.json();
    
    console.log('🔄 [Dashboard API] Aggiornamento metriche progetto:', projectId);
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'ID progetto richiesto' },
        { status: 400 }
      );
    }
    
    // Aggiorna le metriche del progetto
    await dashboardService.updateProjectMetrics(projectId, metrics);
    
    // Registra l'attività di aggiornamento
    await dashboardService.logDashboardActivity({
      type: 'project_updated',
      projectId,
      projectName: metrics.projectName || 'Progetto',
      description: `Metriche progetto aggiornate: ${Object.keys(metrics).join(', ')}`,
      timestamp: new Date(),
      userId: 'system',
      userName: 'Sistema'
    });
    
    console.log('✅ [Dashboard API] Metriche progetto aggiornate:', projectId);
    
    return NextResponse.json({
      success: true,
      message: 'Metriche progetto aggiornate con successo'
    });
    
  } catch (error) {
    console.error('❌ [Dashboard API] Errore aggiornamento metriche:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Impossibile aggiornare le metriche del progetto',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
