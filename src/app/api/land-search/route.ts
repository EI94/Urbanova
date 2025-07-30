import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      emailSent: false,
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

    // Invia email con i risultati
    let emailSent = false;
    try {
      const emailHtml = generateEmailHTML(mockResults, location || 'Roma');
      
      await resend.emails.send({
        from: 'Urbanova AI <noreply@urbanova.life>',
        to: email,
        subject: `🏗️ Trovati ${mockResults.lands.length} terreni a ${location || 'Roma'} - Urbanova AI`,
        html: emailHtml
      });
      
      emailSent = true;
      console.log('✅ Email inviata con successo a:', email);
    } catch (emailError) {
      console.error('❌ Errore invio email:', emailError);
      emailSent = false;
    }

    // Aggiorna il risultato con lo stato dell'email
    mockResults.emailSent = emailSent;

    return NextResponse.json({
      success: true,
      data: mockResults,
      location,
      email,
      emailSent,
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

function generateEmailHTML(results: any, location: string): string {
  const lands = results.lands;
  const summary = results.summary;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Risultati Ricerca Terreni - Urbanova AI</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .land-card { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .land-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .land-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
        .land-detail { background: #f1f5f9; padding: 8px; border-radius: 4px; }
        .land-detail strong { color: #1e40af; }
        .land-link { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .summary { background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .ai-score { background: #fef3c7; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 Urbanova AI</h1>
          <p>Risultati Ricerca Terreni - ${location}</p>
        </div>
        
        <div class="content">
          <div class="summary">
            <h2>📊 Riepilogo Ricerca</h2>
            <p><strong>${lands.length} terreni</strong> trovati a ${location}</p>
            <p><strong>Prezzo medio:</strong> €${summary.averagePrice.toLocaleString()}</p>
            <p><strong>Trend di mercato:</strong> ${summary.marketTrends}</p>
          </div>
          
          <h2>🏗️ Opportunità Trovate</h2>
          
          ${lands.map((land: any, index: number) => `
            <div class="land-card">
              <div class="land-title">
                ${land.title}
                <span class="ai-score">AI Score: ${land.aiScore}/100</span>
              </div>
              
              <div class="land-details">
                <div class="land-detail">
                  <strong>Prezzo:</strong> €${land.price.toLocaleString()}
                </div>
                <div class="land-detail">
                  <strong>Superficie:</strong> ${land.area} m²
                </div>
                <div class="land-detail">
                  <strong>€/m²:</strong> €${land.pricePerSqm.toLocaleString()}
                </div>
                <div class="land-detail">
                  <strong>Fonte:</strong> ${land.source}
                </div>
              </div>
              
              <p><strong>Descrizione:</strong> ${land.description}</p>
              
              ${land.contactInfo.phone ? `<p><strong>📞 Contatto:</strong> ${land.contactInfo.phone}</p>` : ''}
              ${land.contactInfo.email ? `<p><strong>✉️ Email:</strong> ${land.contactInfo.email}</p>` : ''}
              
              <a href="${land.url}" class="land-link" target="_blank">
                🔗 Vedi Annuncio Originale
              </a>
            </div>
          `).join('')}
          
          <div class="summary">
            <h3>💡 Raccomandazioni AI</h3>
            <ul>
              ${summary.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Questo report è stato generato automaticamente da Urbanova AI</p>
          <p>Per assistenza: support@urbanova.life</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function GET() {
  return NextResponse.json({
    message: 'Land Search API - Utilizza POST per la ricerca',
    endpoints: {
      POST: '/api/land-search - Esegue ricerca terreni'
    }
  });
} 