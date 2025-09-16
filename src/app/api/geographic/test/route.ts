/**
 * API Endpoint per Test Firestore
 * Testa la connessione e i permessi Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Firestore iniziato...');
    
    // Test 1: Verifica connessione
    console.log('🔍 Test 1: Verifica connessione Firestore...');
    const testCollection = collection(db, 'test_collection');
    console.log('✅ Connessione Firestore OK');
    
    // Test 2: Prova a inserire un documento di test
    console.log('🔍 Test 2: Inserimento documento di test...');
    const testDoc = await addDoc(testCollection, {
      test: true,
      timestamp: new Date(),
      message: 'Test Firestore connection'
    });
    console.log(`✅ Documento di test inserito con ID: ${testDoc.id}`);
    
    // Test 3: Prova a leggere i documenti
    console.log('🔍 Test 3: Lettura documenti di test...');
    const snapshot = await getDocs(testCollection);
    console.log(`✅ Trovati ${snapshot.size} documenti di test`);
    
    // Test 4: Prova a inserire nella collezione comuni
    console.log('🔍 Test 4: Test inserimento collezione comuni...');
    const comuniCollection = collection(db, 'comuni_italiani');
    const testComune = await addDoc(comuniCollection, {
      nome: 'Test Comune',
      provincia: 'Test Provincia',
      regione: 'Test Regione',
      popolazione: 1000,
      superficie: 10.5,
      latitudine: 41.9028,
      longitudine: 12.4964,
      attivo: true,
      dataCreazione: new Date(),
      dataAggiornamento: new Date()
    });
    console.log(`✅ Comune di test inserito con ID: ${testComune.id}`);
    
    // Test 5: Verifica conteggio comuni
    console.log('🔍 Test 5: Verifica conteggio comuni...');
    const comuniSnapshot = await getDocs(comuniCollection);
    console.log(`✅ Trovati ${comuniSnapshot.size} comuni in Firestore`);
    
    return NextResponse.json({
      success: true,
      message: 'Test Firestore completato con successo',
      data: {
        testDocId: testDoc.id,
        testComuneId: testComune.id,
        testDocumentsCount: snapshot.size,
        comuniCount: comuniSnapshot.size
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Errore test Firestore:', error);
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
