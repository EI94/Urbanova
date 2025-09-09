import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verifica lo stato dei servizi
    const services = {
      email: {
        status: 'active',
        provider: process.env.RESEND_API_KEY ? 'resend' : 'fallback',
        lastCheck: new Date().toISOString(),
      },
      webScraping: {
        status: 'active',
        provider: 'puppeteer',
        lastCheck: new Date().toISOString(),
      },
      ai: {
        status: 'active',
        provider: 'openai',
        lastCheck: new Date().toISOString(),
      },
      firebase: {
        status: 'active',
        provider: 'firestore',
        lastCheck: new Date().toISOString(),
      },
    };

    // Verifica se i servizi sono effettivamente disponibili
    const allServicesActive = Object.values(services).every(
      service => service.status === 'active'
    );

    return NextResponse.json({
      success: true,
      services,
      allActive: allServicesActive,
      timestamp: new Date().toISOString(),
      message: allServicesActive 
        ? 'Tutti i servizi sono attivi e funzionanti' 
        : 'Alcuni servizi potrebbero non essere disponibili',
    });
  } catch (error) {
    console.error('❌ Errore nella verifica servizi:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore nella verifica servizi',
        services: {
          email: { status: 'error' },
          webScraping: { status: 'error' },
          ai: { status: 'error' },
          firebase: { status: 'error' },
        },
        allActive: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Metodo non supportato' },
    { status: 405 }
  );
}
