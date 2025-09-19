import { NextRequest, NextResponse } from 'next/server';
import '@/lib/osProtection';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TEST SAVE] Test salvataggio diretto...');
    
    const { FeasibilityService } = await import('@/lib/feasibilityService');
    const feasibilityService = new FeasibilityService();
    
    const testProject = {
      name: 'Test Project Direct',
      address: 'Via Test 123',
      status: 'PIANIFICAZIONE' as const,
      startDate: new Date(),
      constructionStartDate: new Date(),
      duration: 18,
      totalArea: 1000,
      targetMargin: 25,
      createdBy: 'test-user-direct',
      notes: 'Test project direct',
      costs: {
        land: {
          purchasePrice: 100000,
          purchaseTaxes: 10000,
          intermediationFees: 3000,
          subtotal: 113000
        },
        construction: {
          excavation: 10000,
          structures: 40000,
          systems: 20000,
          finishes: 30000,
          subtotal: 100000
        },
        externalWorks: 5000,
        concessionFees: 2000,
        design: 3000,
        bankCharges: 1000,
        exchange: 0,
        insurance: 1500,
        total: 221500
      },
      revenues: {
        units: 1,
        averageArea: 1000,
        pricePerSqm: 2500,
        revenuePerUnit: 2500000,
        totalSales: 2500000,
        otherRevenues: 0,
        total: 2500000
      },
      results: {
        profit: 285000,
        margin: 12.86,
        roi: 12.86,
        paybackPeriod: 0
      },
      isTargetAchieved: false
    };
    
    console.log('🧪 [TEST SAVE] Chiamando createProject...');
    const result = await feasibilityService.createProject(testProject);
    console.log('✅ [TEST SAVE] Progetto creato:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Progetto salvato con successo',
      projectId: result
    });
    
  } catch (error) {
    console.error('❌ [TEST SAVE] Errore:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
