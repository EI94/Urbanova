import { NextRequest, NextResponse } from 'next/server';
import { feasibilityService } from '@/lib/feasibilityService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API: Ricalcolo di tutti i progetti di fattibilità...');
    
    // Esegui il ricalcolo di tutti i progetti
    await feasibilityService.recalculateAllProjects();
    
    console.log('✅ API: Ricalcolo completato con successo');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tutti i progetti sono stati ricalcolati e aggiornati con successo',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ API: Errore durante il ricalcolo:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Errore sconosciuto durante il ricalcolo',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Utilizza POST per ricalcolare tutti i progetti',
    endpoint: '/api/feasibility-recalculate'
  });
}
