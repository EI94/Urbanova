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
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
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

    // Esegui la ricerca automatizzata con timeout e retry
    console.log('🔍 Avvio ricerca automatizzata con criteri:', searchCriteria);
    let results;
    let emailError = null;
    
    try {
      // Timeout di 60 secondi per evitare errori di rete
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Ricerca troppo lunga')), 60000);
      });
      
      const searchPromise = realLandScrapingAgent.runAutomatedSearch(searchCriteria, email);
      
      results = await Promise.race([searchPromise, timeoutPromise]);
      
      console.log('✅ Ricerca completata:', {
        landsFound: results.lands?.length || 0,
        emailSent: results.emailSent,
        summary: results.summary
      });
    } catch (error) {
      console.error('❌ Errore durante la ricerca:', error);
      
      // Se l'errore è relativo all'email, salva i risultati ma segna l'errore email
      if (error instanceof Error && error.message.includes('RESEND_API_KEY')) {
        emailError = 'Email non inviata: RESEND_API_KEY non configurata';
        // Continua con i risultati anche se l'email fallisce
        results = {
          lands: [],
          analysis: [],
          emailSent: false,
          summary: {
            totalFound: 0,
            averagePrice: 0,
            bestOpportunities: [],
            marketTrends: 'Non disponibile',
            recommendations: ['Configura RESEND_API_KEY per ricevere email']
          }
        };
      } else if (error instanceof Error && error.message.includes('Timeout')) {
        // Gestione timeout
        results = {
          lands: [],
          analysis: [],
          emailSent: false,
          summary: {
            totalFound: 0,
            averagePrice: 0,
            bestOpportunities: [],
            marketTrends: 'Non disponibile',
            recommendations: ['Timeout: Riprova la ricerca tra qualche minuto']
          }
        };
        emailError = 'Timeout: Ricerca interrotta per problemi di rete';
      } else {
        // Altri errori di rete
        results = {
          lands: [],
          analysis: [],
          emailSent: false,
          summary: {
            totalFound: 0,
            averagePrice: 0,
            bestOpportunities: [],
            marketTrends: 'Non disponibile',
            recommendations: ['Errore di rete: Riprova più tardi']
          }
        };
        emailError = `Errore di rete: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`;
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      location,
      email,
      timestamp: new Date().toISOString(),
      emailError: emailError
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('❌ API Land Scraping Agent: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante la ricerca dei terreni',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Land Scraping Agent API - Utilizza POST per la ricerca automatizzata',
    endpoints: {
      POST: '/api/land-scraping - Esegue ricerca automatizzata dei terreni'
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}