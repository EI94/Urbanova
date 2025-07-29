import { NextRequest, NextResponse } from 'next/server';
import { realLandScrapingAgent } from '@/lib/realLandScrapingAgent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, criteria, aiAnalysis } = body;

    console.log('🤖 API Land Scraping Agent: Avvio analisi per', location);

    // Esegui l'analisi AI
    const results = await realLandScrapingAgent.analyzeLocation({
      location: location || 'Italia',
      criteria: criteria || {},
      enableAIAnalysis: aiAnalysis !== false
    });

    return NextResponse.json({
      success: true,
      data: results,
      location,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Land Scraping Agent: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'analisi AI',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Land Scraping Agent API - Utilizza POST per l\'analisi AI',
    endpoints: {
      POST: '/api/land-scraping - Esegue analisi AI dei terreni'
    }
  });
}