import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [TEST BUSINESS PLANS] Test accesso collezione...');
    
    // Import dinamico per evitare errori di build
    const { db } = await import('@/lib/firebase');
    const { getDocs, collection } = await import('firebase/firestore');
    
    // Test semplice: prova ad accedere alla collezione senza query
    const businessPlansRef = collection(db, 'businessPlans');
    console.log('📋 [TEST BUSINESS PLANS] Riferimento collezione creato:', businessPlansRef.id);
    
    // Prova a fare il getDocs senza query per vedere se la collezione esiste
    const snapshot = await getDocs(businessPlansRef);
    console.log('📋 [TEST BUSINESS PLANS] Snapshot ottenuto, docs:', snapshot.size);
    
    const businessPlans: any[] = [];
    snapshot.forEach((doc) => {
      console.log('📋 [TEST BUSINESS PLANS] Doc trovato:', doc.id);
      businessPlans.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test completato',
      collectionExists: true,
      docsCount: snapshot.size,
      businessPlans: businessPlans.slice(0, 2) // Solo i primi 2 per non sovraccaricare
    });
    
  } catch (error: any) {
    console.error('❌ [TEST BUSINESS PLANS] Errore:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.code || 'Unknown error'
    }, { status: 500 });
  }
}
