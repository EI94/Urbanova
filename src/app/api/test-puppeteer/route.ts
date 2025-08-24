import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    console.log('🧪 TEST PUPPETEER IN PRODUZIONE...');
    
    // Test 1: Verifica se Puppeteer è installato
    console.log('✅ Puppeteer è installato');
    
    // Test 2: Prova a lanciare browser
    console.log('🔄 Tentativo lancio browser Puppeteer...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Browser lanciato con successo');
    
    // Test 3: Crea pagina
    const page = await browser.newPage();
    console.log('✅ Pagina creata con successo');
    
    // Test 4: Imposta contenuto HTML
    const testHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Puppeteer</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { background: blue; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧪 Test Puppeteer Urbanova</h1>
            <p>Se vedi questo, Puppeteer funziona!</p>
          </div>
          <div class="content">
            <h2>Test Completato</h2>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Status: ✅ FUNZIONANTE</p>
          </div>
        </body>
      </html>
    `;
    
    await page.setContent(testHTML, { waitUntil: 'networkidle0' });
    console.log('✅ HTML caricato con successo');
    
    // Test 5: Screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true
    });
    
    console.log('✅ Screenshot completato');
    
    // Chiudi browser
    await browser.close();
    console.log('✅ Browser chiuso con successo');
    
    return NextResponse.json({
      success: true,
      message: 'Puppeteer funziona perfettamente in produzione!',
      data: {
        timestamp: new Date().toISOString(),
        screenshotSize: screenshot.length,
        status: 'PUPPETEER FUNZIONANTE'
      }
    });
    
  } catch (error) {
    console.error('❌ ERRORE TEST PUPPETEER:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Puppeteer NON funziona in produzione',
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
      data: {
        timestamp: new Date().toISOString(),
        status: 'PUPPETEER NON FUNZIONANTE',
        note: 'Questo spiega perché il PDF è brutto - Puppeteer fallisce'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json();
    
    if (!html) {
      return NextResponse.json(
        { error: 'HTML richiesto per il test' },
        { status: 400 }
      );
    }
    
    console.log('🧪 TEST PUPPETEER CON HTML PERSONALIZZATO...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      quality: 100
    });
    
    await browser.close();
    
    return NextResponse.json({
      success: true,
      message: 'Screenshot completato con HTML personalizzato',
      data: {
        timestamp: new Date().toISOString(),
        screenshotSize: screenshot.length,
        status: 'SCREENSHOT COMPLETATO'
      }
    });
    
  } catch (error) {
    console.error('❌ ERRORE TEST PUPPETEER CON HTML:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Errore nel test con HTML personalizzato',
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}
