import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test web scraper semplice...');
    
    const testUrls = [
      'https://www.subito.it/immobili/terreni-e-aree-edificabili/roma/vendita/',
      'https://www.kijiji.it/terreni/roma/',
      'https://www.bakeca.it/immobili/terreni/roma/'
    ];

    const results = [];

    for (const url of testUrls) {
      try {
        console.log(`🔍 Testando ${url}...`);
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: 10000
        });

        if (response.status === 200) {
          const $ = cheerio.load(response.data);
          const title = $('title').text() || 'Nessun titolo';
          
          results.push({
            url,
            status: 'success',
            title: title.substring(0, 100),
            contentLength: response.data.length
          });
          
          console.log(`✅ ${url} - OK`);
        } else {
          results.push({
            url,
            status: 'error',
            error: `Status: ${response.status}`
          });
          
          console.log(`❌ ${url} - Status: ${response.status}`);
        }
        
      } catch (error) {
        results.push({
          url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
        
        console.log(`❌ ${url} - ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      }
      
      // Delay tra le richieste
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }
    });
    
  } catch (error) {
    console.error('❌ Errore test semplice:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
