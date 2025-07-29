import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    // Test connessione Firebase
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Urbanova API - Sistema operativo',
      version: '2.0',
      timestamp: new Date().toISOString(),
      services: {
        firebase: 'connected',
        api: 'operational'
      },
      endpoints: {
        health: '/api/health - Stato sistema',
        webScraper: '/api/web-scraper - Web scraping terreni',
        landScraping: '/api/land-scraping - Ricerca automatizzata AI',
        cleanup: '/api/cleanup - Pulizia database'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Errore connessione database',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}