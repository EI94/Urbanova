/**
 * API Endpoint per Conteggio Comuni Italiani in Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { safeCollection } from '@/lib/firebaseUtils';
import { getDocs, query, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔢 Conteggio comuni italiani in Firestore...');
    
    // Conta tutti i documenti nella collezione comuni_italiani
    const comuniSnapshot = await getDocs(safeCollection('comuni_italiani'));
    const totalComuni = comuniSnapshot.size;
    
    console.log(`📊 Totale comuni trovati: ${totalComuni}`);
    
    // Prendi un campione dei primi 10 per debug
    const sampleQuery = query(safeCollection('comuni_italiani'), limit(10));
    const sampleSnapshot = await getDocs(sampleQuery);
    
    const sample: any[] = [];
    sampleSnapshot.forEach(doc => {
      const data = doc.data();
      sample.push({
        id: doc.id,
        nome: data.nome,
        provincia: data.provincia,
        regione: data.regione,
        popolazione: data.popolazione
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Conteggio comuni completato',
      data: {
        totalComuni,
        sample,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('❌ Errore conteggio comuni:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
