import { NextRequest, NextResponse } from 'next/server';
import { cleanupService } from '@/lib/cleanupService';

export const maxDuration = 120; // 2 minuti per operazioni di pulizia

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collections, dryRun = false } = body;

    console.log('🧹 API Cleanup: Avvio pulizia database');

    // Esegui pulizia
    const result = await cleanupService.cleanupDatabase(collections, dryRun);

    console.log(`✅ API Cleanup: Completata pulizia - ${result.deletedCount} documenti eliminati`);

    return NextResponse.json({
      success: true,
      data: result,
      message: dryRun ? 'Simulazione completata' : 'Pulizia completata',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Cleanup: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Ottieni statistiche database
    const stats = await cleanupService.getDatabaseStats();

    return NextResponse.json({
      message: 'Database Cleanup API - Urbanova',
      version: '2.0',
      endpoints: {
        POST: '/api/cleanup - Esegue pulizia database',
        GET: '/api/cleanup - Ottiene statistiche database'
      },
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Errore nel recupero statistiche database',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}