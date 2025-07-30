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
          description: 'Terreno edificabile in zona residenziale con ottima esposizione',
          url: 'https://www.immobiliare.it/terreno-roma-opportunita-1',
          source: 'immobiliare.it',
          images: ['https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Terreno+1'],
          features: ['Edificabile', 'Residenziale', 'Permessi di costruzione'],
          contactInfo: {
            phone: '+39 06 1234567',
            email: 'agente@immobiliare.it',
            agent: 'Studio Immobiliare Roma'
          },
          timestamp: new Date(),
          aiScore: 85,
          pricePerSqm: 187.5
        },
        {
          id: '2',
          title: `Terreno ${location} - Opportunità 2`,
          price: 220000,
          location: location || 'Roma',
          area: 1200,
          description: 'Terreno con permessi di costruzione per sviluppo commerciale',
          url: 'https://www.casa.it/terreno-roma-opportunita-2',
          source: 'casa.it',
          images: ['https://via.placeholder.com/300x200/059669/FFFFFF?text=Terreno+2'],
          features: ['Permessi', 'Commerciale', 'Zona industriale'],
          contactInfo: {
            phone: '+39 06 7654321',
            email: 'info@casa.it',
            agent: 'Casa Immobiliare'
          },
          timestamp: new Date(),
          aiScore: 78,
          pricePerSqm: 183.3
        },
        {
          id: '3',
          title: `Terreno ${location} - Opportunità 3`,
          price: 180000,
          location: location || 'Roma',
          area: 950,
          description: 'Terreno misto residenziale-commerciale in zona strategica',
          url: 'https://www.idealista.it/terreno-roma-opportunita-3',
          source: 'idealista.it',
          images: ['https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Terreno+3'],
          features: ['Misto', 'Residenziale', 'Commerciale'],
          contactInfo: {
            phone: '+39 06 9876543',
            email: 'vendita@idealista.it',
            agent: 'Idealista Roma'
          },
          timestamp: new Date(),
          aiScore: 92,
          pricePerSqm: 189.5
        }
      ],
      analysis: [
        {
          landId: '1',
          estimatedROI: 12.5,
          riskAssessment: 'Basso',
          marketTrend: 'Crescente',
          recommendation: 'Investimento consigliato'
        },
        {
          landId: '2',
          estimatedROI: 8.3,
          riskAssessment: 'Medio',
          marketTrend: 'Stabile',
          recommendation: 'Valutare attentamente'
        },
        {
          landId: '3',
          estimatedROI: 15.2,
          riskAssessment: 'Basso',
          marketTrend: 'Crescente',
          recommendation: 'Ottima opportunità'
        }
      ],
      emailSent: true,
      summary: {
        totalFound: 3,
        averagePrice: 183333,
        bestOpportunities: [],
        marketTrends: 'Mercato in crescita per la zona. Prezzi medi in aumento del 5% rispetto all\'anno scorso.',
        recommendations: [
          'Investire in terreni residenziali nella zona nord',
          'Considerare sviluppo misto per massimizzare ROI',
          'Valutare opportunità commerciali in zona est'
        ]
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