import { NextRequest, NextResponse } from 'next/server';
import { apiProxyService } from '@/lib/apiProxyService';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando servizi proxy...');
    
    // Ottieni statistiche dei servizi
    const stats = apiProxyService.getServiceStats();
    const availableServices = apiProxyService.getAvailableServices();
    
    // Testa tutti i servizi
    const testResults = await apiProxyService.testAllServices();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      availableServices: availableServices.map(service => ({
        name: service.name,
        requiresKey: service.requiresKey,
        costPerRequest: service.costPerRequest,
        successRate: service.successRate
      })),
      testResults,
      recommendations: generateRecommendations(stats, testResults)
    });
    
  } catch (error) {
    console.error('❌ Errore test servizi proxy:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function generateRecommendations(stats: any, testResults: any[]): string[] {
  const recommendations = [];
  
  if (stats.availableServices === 0) {
    recommendations.push('⚠️ Nessun servizio proxy configurato. Configura almeno una API key per bypassare DataDome.');
    recommendations.push('💡 Servizi consigliati: ScrapingBee (€0.01/req), ScraperAPI (€0.015/req)');
  }
  
  const workingServices = testResults.filter(result => result.working);
  if (workingServices.length === 0) {
    recommendations.push('❌ Nessun servizio proxy funzionante. Verifica le API keys e la connessione.');
  } else {
    recommendations.push(`✅ ${workingServices.length} servizi proxy funzionanti`);
  }
  
  if (stats.totalCost > 0.1) {
    recommendations.push('💰 Attenzione: Costo totale per richiesta elevato. Considera servizi più economici.');
  }
  
  return recommendations;
}
