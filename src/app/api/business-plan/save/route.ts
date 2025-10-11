import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inizializza Firebase Admin SDK
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('❌ [Firebase Admin] Errore inizializzazione:', error);
  }
}

const adminDb = getFirestore();

/**
 * 💾 SALVA BUSINESS PLAN
 * 
 * Endpoint per salvare un Business Plan calcolato dal frontend
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 [API BusinessPlan Save] Richiesta salvataggio...');
    
    const { input, outputs, userId } = await request.json();
    
    if (!input || !outputs || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Parametri mancanti: input, outputs e userId sono richiesti'
      }, { status: 400 });
    }
    
    console.log('💾 [API BusinessPlan Save] Salvataggio Business Plan:', {
      projectName: input.projectName,
      userId: userId,
      outputsCount: outputs.length
    });
    
    // Salva usando Firebase Admin SDK
    const businessPlanData = {
      userId,
      projectId: input.projectId || `bp_${Date.now()}`,
      projectName: input.projectName,
      input: input,
      outputs: outputs,
      documentType: 'BUSINESS_PLAN',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await adminDb.collection('feasibilityProjects').add(businessPlanData);
    
    console.log('✅ [API BusinessPlan Save] Business Plan salvato con ID:', docRef.id);
    
    return NextResponse.json({
      success: true,
      businessPlanId: docRef.id,
      message: 'Business Plan salvato con successo'
    });
    
  } catch (error: any) {
    console.error('❌ [API BusinessPlan Save] Errore:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nel salvataggio del Business Plan',
      details: error.message
    }, { status: 500 });
  }
}
