import { NextRequest, NextResponse } from 'next/server';
import { RealLandScrapingAgent, LandSearchCriteria } from '@/lib/realLandScrapingAgent';

export const maxDuration = 60; // Configurazione Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { criteria, email }: { criteria: LandSearchCriteria; email: string } = body;

    if (!criteria || !email) {
      return NextResponse.json({
        success: false,
        error: 'Criteri di ricerca e email sono obbligatori',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log('🚀 API Land Scraping: Avvio ricerca automatizzata per', email);

    // Crea istanza dell'agente
    const agent = new RealLandScrapingAgent();

    // Esegui ricerca automatizzata
    const result = await agent.runAutomatedSearch(criteria, email);

    console.log(`✅ API Land Scraping: Completata ricerca con ${result.lands.length} terreni`);

    return NextResponse.json({
      success: true,
      data: result,
      summary: {
        totalFound: result.summary.totalFound,
        averagePrice: result.summary.averagePrice,
        emailSent: result.emailSent,
        marketTrends: result.summary.marketTrends,
        recommendations: result.summary.recommendations
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Land Scraping: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Land Scraping Agent API - Urbanova',
    version: '2.0',
    endpoints: {
      POST: '/api/land-scraping - Esegue ricerca automatizzata con AI'
    },
    features: [
      'Web Scraping automatico',
      'Analisi AI avanzata',
      'Invio email con risultati',
      'Analisi trend di mercato',
      'Raccomandazioni di investimento'
    ],
    timestamp: new Date().toISOString()
  });
}