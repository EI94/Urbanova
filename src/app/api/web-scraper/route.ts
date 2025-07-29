import { NextRequest, NextResponse } from 'next/server';
import { realWebScraper, LandSearchCriteria } from '@/lib/realWebScraper';

export const maxDuration = 30; // Configurazione Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const criteria: LandSearchCriteria = body.criteria;

    console.log('🔍 API Web Scraper: Avvio scraping con criteri:', criteria);

    // Inizializza il web scraper
    await realWebScraper.initialize();

    // Esegui lo scraping
    const lands = await realWebScraper.scrapeLands(criteria);

    // Chiudi il browser
    await realWebScraper.close();

    console.log(`✅ API Web Scraper: Trovati ${lands.length} terreni`);

    return NextResponse.json({
      success: true,
      data: lands,
      count: lands.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Web Scraper: Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Scraper API - Urbanova',
    version: '2.0',
    endpoints: {
      POST: '/api/web-scraper - Esegue web scraping terreni'
    },
    timestamp: new Date().toISOString()
  });
}