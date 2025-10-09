/**
 * 🏦 API BUSINESS PLAN - LISTA E GESTIONE
 * 
 * Endpoint per gestire la lista dei Business Plan dell'utente:
 * - GET: Recupera tutti i Business Plan dell'utente
 * - DELETE: Elimina un Business Plan specifico
 */

import { NextRequest, NextResponse } from 'next/server';
import { businessPlanService } from '@/lib/businessPlanService';
import { query, where, orderBy, getDocs } from 'firebase/firestore';
import { safeCollection } from '@/lib/firebaseUtils';

/**
 * 📋 GET: Lista tutti i Business Plan dell'utente
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto' },
        { status: 400 }
      );
    }
    
    console.log(`📋 [API BusinessPlan] Caricamento lista BP per utente: ${userId}`);
    
    // Query Firestore per recuperare tutti i Business Plan dell'utente
    const q = query(
      safeCollection('businessPlans'),
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
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
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
    
    const success = await businessPlanService.deleteBusinessPlan(businessPlanId, userId);
    
    if (!success) {
      throw new Error('Errore durante l\'eliminazione');
    }
    
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
