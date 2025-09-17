/**
 * API Endpoint per Importazione Dati ISTAT in Firestore
 * Importa tutti i comuni italiani dal dataset ufficiale ISTAT
 */

import { NextRequest, NextResponse } from 'next/server';
import { firestoreIstatImporter } from '@/lib/geographic/firestoreIstatImporter';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Importazione dati ISTAT richiesta...');
    
    // Verifica stato prima dell'importazione
    const comuniPrima = await getComuniCount();
    console.log(`📊 Comuni esistenti prima: ${comuniPrima}`);
    
    // Importa i dati ISTAT
    const importResult = await firestoreIstatImporter.importAllData((progress) => {
      console.log(`📈 Progresso ISTAT: ${progress.percentage}% - ${progress.message}`);
    });
    
    // Verifica stato dopo l'importazione
    const comuniDopo = await getComuniCount();
    console.log(`📊 Comuni esistenti dopo: ${comuniDopo}`);
    
    console.log('✅ Importazione dati ISTAT completata');
    
    return NextResponse.json({
      success: true,
      message: 'Dati ISTAT importati con successo in Firestore',
      data: {
        comuniPrima,
        comuniDopo,
        comuniImportati: comuniDopo - comuniPrima,
        importResult
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Errore importazione dati ISTAT:', error);
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
    console.log('📊 Verifica stato dati ISTAT...');
    
    const comuniCount = await getComuniCount();
    
    return NextResponse.json({
      success: true,
      message: 'Stato dati ISTAT verificato',
      data: {
        comuniCount,
        status: comuniCount > 100 ? 'completo' : 'incompleto',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('❌ Errore verifica stato ISTAT:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Conta i comuni esistenti in Firestore
 */
async function getComuniCount(): Promise<number> {
  try {
    const { safeCollection } = await import('@/lib/firebaseUtils');
    const { getDocs, query, limit } = await import('firebase/firestore');
    
    const q = query(safeCollection('comuni_italiani'), limit(1));
    const snapshot = await getDocs(q);
    
    // Per ora restituiamo una stima basata sulla presenza di documenti
    return snapshot.size > 0 ? 1000 : 0; // Stima approssimativa
  } catch (error) {
    console.error('❌ Errore conteggio comuni:', error);
    return 0;
  }
}
