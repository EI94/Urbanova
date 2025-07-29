import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, criteria, email } = body;

    console.log('🔍 API Land Search: Ricerca per', location, 'email:', email);

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email richiesta per la ricerca'
      }, { status: 400 });
    }

    // Simula una ricerca (per ora)
    const mockResults = {
      lands: [
        {
          id: '1',
          title: `Terreno ${location} - Opportunità 1`,
          price: 150000,
          location: location || 'Roma',
          area: 800,
          description: 'Terreno edificabile in zona residenziale',
          url: '#',
          source: 'immobiliare.it',
          images: [],
          features: ['Edificabile', 'Residenziale'],
          contactInfo: {},
          timestamp: new Date(),
          aiScore: 85
        },
        {
          id: '2',
          title: `Terreno ${location} - Opportunità 2`,
          price: 220000,
          location: location || 'Roma',
          area: 1200,
          description: 'Terreno con permessi di costruzione',
          url: '#',
          source: 'casa.it',
          images: [],
          features: ['Permessi', 'Commerciale'],
          contactInfo: {},
          timestamp: new Date(),
          aiScore: 78
        }
      ],
      analysis: [],
      emailSent: true,
      summary: {
        totalFound: 2,
        averagePrice: 185000,
        bestOpportunities: [],
        marketTrends: 'Mercato in crescita per la zona',
        recommendations: ['Investire in terreni residenziali', 'Considerare sviluppo misto']
      }
    };

    return NextResponse.json({
      success: true,
      data: mockResults,
      location,
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Land Search: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante la ricerca dei terreni',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Land Search API - Utilizza POST per la ricerca',
    endpoints: {
      POST: '/api/land-search - Esegue ricerca terreni'
    }
  });
} 