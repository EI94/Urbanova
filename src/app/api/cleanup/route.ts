import { NextRequest, NextResponse } from 'next/server';
import { cleanupService } from '@/lib/cleanupService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collections, confirm } = body;

    if (!confirm) {
      return NextResponse.json({
        success: false,
        error: 'Conferma richiesta per procedere con la pulizia'
      }, { status: 400 });
    }

    console.log('🧹 API Cleanup: Avvio pulizia database');

    // Esegui la pulizia
    const results = await cleanupService.cleanupDatabase(collections || []);

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Pulizia completata con successo',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Cleanup: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante la pulizia',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Ottieni statistiche database
    const stats = await cleanupService.getDatabaseStats();

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Statistiche database'
    });

  } catch (error) {
    console.error('❌ API Cleanup Stats: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero statistiche',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}