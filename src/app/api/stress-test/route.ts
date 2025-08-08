import { NextRequest, NextResponse } from 'next/server';
import { advancedWebScraper } from '@/lib/advancedWebScraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { concurrentRequests = 5, duration = 30000 } = body; // 30 secondi default

    console.log('🔥 AVVIO STRESS TEST...');
    console.log(`- Richieste concorrenti: ${concurrentRequests}`);
    console.log(`- Durata: ${duration}ms`);
    
    const startTime = Date.now();
    const results = [];
    const activeRequests = [];

    // Crea richieste concorrenti
    for (let i = 0; i < concurrentRequests; i++) {
      const requestPromise = (async () => {
        const requestId = i + 1;
        const requestStart = Date.now();
        
        try {
          console.log(`🚀 Richiesta ${requestId} avviata...`);
          
          const criteria = {
            location: ['Roma', 'Milano', 'Napoli'][i % 3],
            minPrice: 0,
            maxPrice: 1000000,
            minArea: 100,
            maxArea: 10000,
            propertyType: 'residenziale'
          };

          const result = await Promise.race([
            advancedWebScraper.scrapeLandsAdvanced(criteria),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout richiesta ${requestId}`)), 45000)
            )
          ]);

          const requestTime = Date.now() - requestStart;
          
          return {
            requestId,
            success: true,
            landsFound: result.length,
            responseTime: requestTime,
            location: criteria.location,
            sources: result.map(land => land.source).filter((v, i, a) => a.indexOf(v) === i)
          };
          
        } catch (error) {
          const requestTime = Date.now() - requestStart;
          
          return {
            requestId,
            success: false,
            error: error instanceof Error ? error.message : 'Errore sconosciuto',
            responseTime: requestTime,
            location: ['Roma', 'Milano', 'Napoli'][i % 3]
          };
        }
      })();

      activeRequests.push(requestPromise);
    }

    // Attendi tutte le richieste o timeout
    const allResults = await Promise.allSettled(activeRequests);
    
    // Processa risultati
    allResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        console.log(`✅ Richiesta ${index + 1}: ${result.value.success ? 'Successo' : 'Fallita'} - ${result.value.responseTime}ms`);
      } else {
        results.push({
          requestId: index + 1,
          success: false,
          error: 'Promise rejected',
          responseTime: 0
        });
        console.log(`❌ Richiesta ${index + 1}: Promise rejected`);
      }
    });

    const totalTime = Date.now() - startTime;
    
    // Calcola statistiche
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);
    const totalLandsFound = successfulRequests.reduce((sum, r) => sum + r.landsFound, 0);
    const averageResponseTime = successfulRequests.length > 0 
      ? successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length 
      : 0;

    // Conta fonti funzionanti
    const allSources = new Set();
    successfulRequests.forEach(result => {
      if (result.sources) {
        result.sources.forEach(source => allSources.add(source));
      }
    });

    const stressTestResults = {
      timestamp: new Date().toISOString(),
      testType: 'stress',
      configuration: {
        concurrentRequests,
        duration,
        actualDuration: totalTime
      },
      results,
      summary: {
        totalRequests: results.length,
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        successRate: (successfulRequests.length / results.length) * 100,
        totalLandsFound,
        averageResponseTime: Math.round(averageResponseTime),
        sourcesWorking: allSources.size,
        requestsPerSecond: results.length / (totalTime / 1000)
      }
    };

    console.log('📊 RISULTATI STRESS TEST:');
    console.log(`- Richieste totali: ${stressTestResults.summary.totalRequests}`);
    console.log(`- Successi: ${stressTestResults.summary.successfulRequests}`);
    console.log(`- Fallimenti: ${stressTestResults.summary.failedRequests}`);
    console.log(`- Tasso di successo: ${stressTestResults.summary.successRate.toFixed(1)}%`);
    console.log(`- Terreni trovati: ${stressTestResults.summary.totalLandsFound}`);
    console.log(`- Tempo medio: ${stressTestResults.summary.averageResponseTime}ms`);
    console.log(`- Fonti funzionanti: ${stressTestResults.summary.sourcesWorking}`);
    console.log(`- Richieste/secondo: ${stressTestResults.summary.requestsPerSecond.toFixed(2)}`);

    return NextResponse.json(stressTestResults);
    
  } catch (error) {
    console.error('❌ Errore stress test:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
