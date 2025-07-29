import { NextRequest, NextResponse } from 'next/server';
import { realWebScraper } from '@/lib/realWebScraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, minPrice, maxPrice, minArea, maxArea, propertyType } = body;

    // Inizializza lo scraper
    await realWebScraper.initialize();

    // Esegui lo scraping
    const results = await realWebScraper.scrapeLands({
      location: location || 'Italia',
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      propertyType
    });

    // Chiudi il browser
    await realWebScraper.close();

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error) {
    console.error('Errore API web scraper:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante lo scraping',
      message: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Scraper API - Utilizza POST per eseguire lo scraping',
    endpoints: {
      POST: '/api/web-scraper - Esegue lo scraping dei terreni'
    }
  });
}