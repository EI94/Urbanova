import { NextRequest, NextResponse } from 'next/server';
import { realLandScrapingAgent } from '@/lib/realLandScrapingAgent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, criteria, aiAnalysis, email } = body;

    console.log('🤖 API Land Scraping Agent: Avvio ricerca per', location, 'email:', email);

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email richiesta per la ricerca'
      }, { status: 400 });
    }

    // Converti i criteri nel formato corretto per l'agente
    const searchCriteria = {
      location: location || 'Roma',
      priceRange: [criteria?.minPrice || 0, criteria?.maxPrice || 1000000],
      areaRange: [criteria?.minArea || 500, criteria?.maxArea || 10000],
      zoning: criteria?.propertyType ? [criteria.propertyType] : ['residenziale'],
      buildingRights: true,
      infrastructure: [],
      keywords: []
    };

    // Esegui la ricerca automatizzata
    const results = await realLandScrapingAgent.runAutomatedSearch(searchCriteria, email);

    return NextResponse.json({
      success: true,
      data: results,
      location,
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Land Scraping Agent: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante la ricerca dei terreni',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Land Scraping Agent API - Utilizza POST per la ricerca automatizzata',
    endpoints: {
      POST: '/api/land-scraping - Esegue ricerca automatizzata dei terreni'
    }
  });
}