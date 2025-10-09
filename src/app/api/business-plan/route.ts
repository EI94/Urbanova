/**
 * 🏦 API BUSINESS PLAN - LISTA E GESTIONE
 * 
 * Endpoint per gestire la lista dei Business Plan dell'utente:
 * - GET: Recupera tutti i Business Plan dell'utente
 * - DELETE: Elimina un Business Plan specifico
 */

import { NextRequest, NextResponse } from 'next/server';
import { businessPlanService } from '@/lib/businessPlanService';

/**
 * 📋 GET: Lista tutti i Business Plan dell'utente
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [API BusinessPlan] Richiesta lista Business Plan...');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }
    
    console.log(`📋 [API BusinessPlan] Caricamento lista BP per utente: ${userId}`);
    
    // Import dinamico per evitare errori di build
    const { db } = await import('@/lib/firebase');
    const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
    
    // Query Firestore per recuperare tutti i Business Plan dell'utente
    const businessPlansRef = collection(db, 'businessPlans');
    const q = query(
      businessPlansRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const businessPlans: any[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      businessPlans.push({
        id: doc.id,
        projectName: data.projectName,
        location: data.input?.location || '',
        totalUnits: data.input?.totalUnits || 0,
        averagePrice: data.input?.averagePrice || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        // Metriche del miglior scenario
        bestNPV: data.outputs?.length > 0 ? 
          Math.max(...data.outputs.map((o: any) => o.metrics?.npv || 0)) : 0,
        bestIRR: data.outputs?.length > 0 ? 
          Math.max(...data.outputs.map((o: any) => o.metrics?.irr || 0)) : 0,
        bestMargin: data.outputs?.length > 0 ? 
          Math.max(...data.outputs.map((o: any) => o.summary?.marginPercentage || 0)) : 0,
        scenariosCount: data.outputs?.length || 0
      });
    });
    
    console.log(`✅ [API BusinessPlan] Trovati ${businessPlans.length} Business Plan`);
    
    return NextResponse.json({
      success: true,
      businessPlans,
      count: businessPlans.length
    });
    
  } catch (error) {
    console.error('❌ [API BusinessPlan] Errore lista:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore caricamento lista Business Plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 🗑️ DELETE: Elimina un Business Plan
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessPlanId = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!businessPlanId || !userId) {
      return NextResponse.json(
        { error: 'Parametri id e userId richiesti' },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ [API BusinessPlan] Eliminazione BP: ${businessPlanId} per utente: ${userId}`);
    
    // Import dinamico per evitare errori di build
    const { db } = await import('@/lib/firebase');
    const { getDoc, deleteDoc, doc } = await import('firebase/firestore');
    
    // Verifica che il Business Plan appartenga all'utente
    const businessPlanDoc = doc(db, 'businessPlans', businessPlanId);
    const docSnapshot = await getDoc(businessPlanDoc);
    
    if (!docSnapshot.exists()) {
      throw new Error('Business Plan non trovato');
    }
    
    const businessPlanData = docSnapshot.data();
    if (businessPlanData?.userId !== userId) {
      throw new Error('Non autorizzato a eliminare questo Business Plan');
    }
    
    await deleteDoc(businessPlanDoc);
    
    console.log('✅ [API BusinessPlan] Business Plan eliminato con successo');
    
    return NextResponse.json({
      success: true,
      message: 'Business Plan eliminato con successo'
    });
    
  } catch (error) {
    console.error('❌ [API BusinessPlan] Errore eliminazione:', error);
    
    return NextResponse.json(
      { 
        error: 'Errore eliminazione Business Plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
