/**
 * API Endpoint per Inizializzazione Dati Geografici
 * Popola Firestore con dati geografici italiani
 */

import { NextRequest, NextResponse } from 'next/server';
import { firestoreGeographicService } from '@/lib/geographic/firestoreGeographicService';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Inizializzazione dati geografici richiesta...');
    
    // Verifica stato prima dell'inizializzazione
    const comuniPrima = await firestoreGeographicService.getComuniCount();
    const zonePrima = await firestoreGeographicService.getZoneCount();
    console.log(`📊 Stato prima: ${comuniPrima} comuni, ${zonePrima} zone`);
    
    // Inizializza i dati geografici
    await firestoreGeographicService.initializeGeographicData();
    
    // Verifica stato dopo l'inizializzazione
    const comuniDopo = await firestoreGeographicService.getComuniCount();
    const zoneDopo = await firestoreGeographicService.getZoneCount();
    console.log(`📊 Stato dopo: ${comuniDopo} comuni, ${zoneDopo} zone`);
    
    console.log('✅ Inizializzazione dati geografici completata');
    
    return NextResponse.json({
      success: true,
      message: 'Dati geografici inizializzati con successo',
      data: {
        comuniPrima,
        zonePrima,
        comuniDopo,
        zoneDopo,
        comuniInseriti: comuniDopo - comuniPrima,
        zoneInserite: zoneDopo - zonePrima
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Errore inizializzazione dati geografici:', error);
    console.error('❌ Codice errore:', error.code);
    console.error('❌ Messaggio errore:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verifica stato dati geografici...');
    
    // Verifica se i dati esistono già
    const comuniSnapshot = await firestoreGeographicService.getComuniCount();
    const zoneSnapshot = await firestoreGeographicService.getZoneCount();
    
    return NextResponse.json({
      success: true,
      data: {
        comuni: comuniSnapshot,
        zone: zoneSnapshot,
        initialized: comuniSnapshot > 0 || zoneSnapshot > 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Errore verifica dati geografici:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
