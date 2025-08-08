import { NextRequest, NextResponse } from 'next/server';
import { advancedWebScraper } from '@/lib/advancedWebScraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'comprehensive' } = body;

    console.log('🧪 AVVIO TEST MASSIVI DEL SISTEMA...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      testType,
      results: [],
      summary: {
        totalTests: 0,
        successful: 0,
        failed: 0,
        totalLandsFound: 0,
        averageResponseTime: 0,
        sourcesWorking: 0,
        sourcesFailing: 0
      }
    };

    // Test 1: Città diverse
    const cities = ['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'];
    
    for (const city of cities) {
      console.log(`🏙️ Test città: ${city}`);
      
      const startTime = Date.now();
      try {
        const criteria = {
          location: city,
          minPrice: 0,
          maxPrice: 1000000,
          minArea: 100,
          maxArea: 10000,
          propertyType: 'residenziale'
        };

        const result = await Promise.race([
          advancedWebScraper.scrapeLandsAdvanced(criteria),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout ${city}`)), 60000)
          )
        ]);

        const responseTime = Date.now() - startTime;
        
        testResults.results.push({
          test: `Città: ${city}`,
          success: true,
          landsFound: result.length,
          responseTime,
          averagePrice: result.length > 0 ? result.reduce((sum, land) => sum + land.price, 0) / result.length : 0,
          sources: result.map(land => land.source).filter((v, i, a) => a.indexOf(v) === i)
        });

        testResults.summary.totalLandsFound += result.length;
        testResults.summary.successful++;
        
        console.log(`✅ ${city}: ${result.length} terreni in ${responseTime}ms`);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        testResults.results.push({
          test: `Città: ${city}`,
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          responseTime,
          landsFound: 0
        });
        testResults.summary.failed++;
        console.log(`❌ ${city}: Fallito in ${responseTime}ms`);
      }
      
      testResults.summary.totalTests++;
      
      // Delay tra i test
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Test 2: Range di prezzi diversi
    const priceRanges = [
      { min: 0, max: 50000, name: 'Economico' },
      { min: 50000, max: 200000, name: 'Medio' },
      { min: 200000, max: 1000000, name: 'Alto' }
    ];

    for (const range of priceRanges) {
      console.log(`💰 Test range prezzi: ${range.name} (€${range.min}-${range.max})`);
      
      const startTime = Date.now();
      try {
        const criteria = {
          location: 'Roma',
          minPrice: range.min,
          maxPrice: range.max,
          minArea: 100,
          maxArea: 10000,
          propertyType: 'residenziale'
        };

        const result = await Promise.race([
          advancedWebScraper.scrapeLandsAdvanced(criteria),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout ${range.name}`)), 60000)
          )
        ]);

        const responseTime = Date.now() - startTime;
        
        testResults.results.push({
          test: `Range prezzi: ${range.name}`,
          success: true,
          landsFound: result.length,
          responseTime,
          averagePrice: result.length > 0 ? result.reduce((sum, land) => sum + land.price, 0) / result.length : 0,
          priceRange: `${range.min}-${range.max}`
        });

        testResults.summary.totalLandsFound += result.length;
        testResults.summary.successful++;
        
        console.log(`✅ ${range.name}: ${result.length} terreni in ${responseTime}ms`);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        testResults.results.push({
          test: `Range prezzi: ${range.name}`,
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          responseTime,
          landsFound: 0
        });
        testResults.summary.failed++;
        console.log(`❌ ${range.name}: Fallito in ${responseTime}ms`);
      }
      
      testResults.summary.totalTests++;
      
      // Delay tra i test
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Test 3: Zone specifiche
    const zones = ['Trastevere', 'EUR', 'Parioli', 'Testaccio'];
    
    for (const zone of zones) {
      console.log(`📍 Test zona specifica: ${zone}`);
      
      const startTime = Date.now();
      try {
        const criteria = {
          location: zone,
          minPrice: 0,
          maxPrice: 1000000,
          minArea: 100,
          maxArea: 10000,
          propertyType: 'residenziale'
        };

        const result = await Promise.race([
          advancedWebScraper.scrapeLandsAdvanced(criteria),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout ${zone}`)), 60000)
          )
        ]);

        const responseTime = Date.now() - startTime;
        
        testResults.results.push({
          test: `Zona: ${zone}`,
          success: true,
          landsFound: result.length,
          responseTime,
          averagePrice: result.length > 0 ? result.reduce((sum, land) => sum + land.price, 0) / result.length : 0,
          zone
        });

        testResults.summary.totalLandsFound += result.length;
        testResults.summary.successful++;
        
        console.log(`✅ ${zone}: ${result.length} terreni in ${responseTime}ms`);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        testResults.results.push({
          test: `Zona: ${zone}`,
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          responseTime,
          landsFound: 0
        });
        testResults.summary.failed++;
        console.log(`❌ ${zone}: Fallito in ${responseTime}ms`);
      }
      
      testResults.summary.totalTests++;
      
      // Delay tra i test
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Calcola statistiche finali
    const successfulTests = testResults.results.filter(r => r.success);
    testResults.summary.averageResponseTime = successfulTests.length > 0 
      ? successfulTests.reduce((sum, test) => sum + test.responseTime, 0) / successfulTests.length 
      : 0;

    // Conta fonti funzionanti
    const allSources = new Set();
    const workingSources = new Set();
    
    testResults.results.forEach(result => {
      if (result.sources) {
        result.sources.forEach(source => {
          allSources.add(source);
          workingSources.add(source);
        });
      }
    });

    testResults.summary.sourcesWorking = workingSources.size;
    testResults.summary.sourcesFailing = allSources.size - workingSources.size;

    console.log('📊 RISULTATI TEST MASSIVI:');
    console.log(`- Test totali: ${testResults.summary.totalTests}`);
    console.log(`- Successi: ${testResults.summary.successful}`);
    console.log(`- Fallimenti: ${testResults.summary.failed}`);
    console.log(`- Terreni trovati: ${testResults.summary.totalLandsFound}`);
    console.log(`- Tempo medio: ${Math.round(testResults.summary.averageResponseTime)}ms`);
    console.log(`- Fonti funzionanti: ${testResults.summary.sourcesWorking}`);

    return NextResponse.json(testResults);
    
  } catch (error) {
    console.error('❌ Errore test massivi:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
