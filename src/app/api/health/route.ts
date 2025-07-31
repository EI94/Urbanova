import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verifica servizi essenziali
    const services = {
      api: 'operational',
      webScraping: 'operational',
      email: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
      ai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
    };
    
    const isHealthy = services.email === 'configured' && services.ai === 'configured';
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      message: isHealthy ? 'Urbanova API - Sistema operativo' : 'Urbanova API - Servizi parzialmente operativi',
      version: '2.0',
      timestamp: new Date().toISOString(),
      services: services,
      endpoints: {
        health: '/api/health - Stato sistema',
        webScraper: '/api/web-scraper - Web scraping terreni',
        landScraping: '/api/land-scraping - Ricerca automatizzata AI',
        testEmail: '/api/test-email - Test email service',
        cleanup: '/api/cleanup - Pulizia database'
      },
      configuration: {
        resendConfigured: !!process.env.RESEND_API_KEY,
        openaiConfigured: !!process.env.OPENAI_API_KEY,
        resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
        openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Errore sistema',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString(),
      services: {
        api: 'error',
        webScraping: 'error',
        email: 'error',
        ai: 'error'
      }
    }, { status: 500 });
  }
}