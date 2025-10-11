import { NextRequest, NextResponse } from 'next/server';
import { businessPlanService } from '@/lib/businessPlanService';

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
    
    // Salva usando il businessPlanService
    const businessPlanId = await businessPlanService.saveBusinessPlan(input, outputs, userId);
    
    console.log('✅ [API BusinessPlan Save] Business Plan salvato con ID:', businessPlanId);
    
    return NextResponse.json({
      success: true,
      businessPlanId,
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
