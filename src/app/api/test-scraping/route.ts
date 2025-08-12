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
        setTimeout(() => reject(new Error('Test timeout')), 120000)
      )
    ]) as any[];

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, projectType, maxPrice, minArea, testMode, testSite } = body;

    console.log('🧪 Test web scraper avanzato con parametri personalizzati...');
    
    const testCriteria = {
      location: location || 'Roma',
      minPrice: 0,
      maxPrice: maxPrice || 1000000,
      minArea: minArea || 100,
      maxArea: 10000,
      propertyType: projectType || 'residenziale'
    };

    console.log('🔍 Test con criteri personalizzati:', testCriteria);
    
    let result: any[] = [];
    
    if (testMode === 'single' && testSite) {
      console.log(`🧪 Test singolo sito: ${testSite}`);
      
      // Test di un singolo sito
      switch (testSite) {
        case 'immobiliare.it':
          result = await advancedWebScraper['scrapeImmobiliareAdvanced'](testCriteria);
          break;
        case 'casa.it':
          result = await advancedWebScraper['scrapeCasaAdvanced'](testCriteria);
          break;
        case 'idealista.it':
          result = await advancedWebScraper['scrapeIdealistaAdvanced'](testCriteria);
          break;
        case 'borsinoimmobiliare.it':
          result = await advancedWebScraper['scrapeBorsinoImmobiliareAdvanced'](testCriteria);
          break;
        default:
          throw new Error(`Sito non supportato: ${testSite}`);
      }
    } else if (testMode === 'strategia-hacker' && testSite) {
      console.log(`🦹 Test STRATEGIA HACKER ULTRA-AVANZATA per sito: ${testSite}`);
      
      // Test con STRATEGIA HACKER ULTRA-AVANZATA
      switch (testSite) {
        case 'casa.it':
          result = await advancedWebScraper['scrapeCasaAdvanced'](testCriteria);
          break;
        case 'idealista.it':
          result = await advancedWebScraper['scrapeIdealistaAdvanced'](testCriteria);
          break;
        default:
          throw new Error(`Sito non supportato per STRATEGIA HACKER ULTRA-AVANZATA: ${testSite}`);
      }
    } else {
      console.log('🧪 Test completo multi-sito...');
      // Test completo con timeout ottimizzato
      result = await Promise.race([
        advancedWebScraper.scrapeLandsAdvanced(testCriteria),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), 300000) // 5 minuti per strategia indiretta
        )
      ]) as any[];
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      landsFound: result.length,
      lands: result.slice(0, 3), // Mostra solo i primi 3 risultati
      testCriteria,
      testMode: testMode || 'complete',
      testSite: testSite || 'all'
    });
    
  } catch (error) {
    console.error('❌ Errore test web scraper con parametri personalizzati:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
