import { NextRequest, NextResponse } from 'next/server';
import { osTestService } from '@/lib/osTestService';

export async function POST(request: NextRequest) {
  try {
    const { category, runAll } = await request.json();
    
    console.log('🧪 [Test API] Avvio test OS...');
    
    let results;
    
    if (runAll) {
      results = await osTestService.runAllTests();
    } else if (category) {
      results = await osTestService.runTestsByCategory(category);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Specifica category o runAll=true'
      }, { status: 400 });
    }
    
    console.log('✅ [Test API] Test completati');
    
    return NextResponse.json({
      success: true,
      results,
      report: osTestService.generateTestReport(results.results || results)
    });
    
  } catch (error) {
    console.error('❌ [Test API] Errore:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}
