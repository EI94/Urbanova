import { NextRequest, NextResponse } from 'next/server';
import { advancedWebScraper } from '@/lib/advancedWebScraper';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test web scraper avanzato...');
    
    const testCriteria = {
      location: 'Roma',
      minPrice: 0,
      maxPrice: 1000000,
      minArea: 100,
      maxArea: 10000,
      propertyType: 'residenziale'
    };

    console.log('🔍 Test con criteri:', testCriteria);
    
    // Test con timeout ottimizzato
    const result = await Promise.race([
      advancedWebScraper.scrapeLandsAdvanced(testCriteria),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), 45000)
      )
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      landsFound: result.length,
      lands: result.slice(0, 3), // Mostra solo i primi 3 risultati
      testCriteria
    });
    
  } catch (error) {
    console.error('❌ Errore test web scraper:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
