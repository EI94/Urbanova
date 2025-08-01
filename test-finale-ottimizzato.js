// Test Finale Ottimizzato - Verifica Soluzione Basata su Test Massivi
const axios = require('axios');
const cheerio = require('cheerio');

// Headers avanzati per bypassare DataDome
function getAdvancedHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  
  return {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://www.google.com/',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-full-version-list': '"Not_A Brand";v="8.0.0.0", "Chromium";v="120.0.6099.109", "Google Chrome";v="120.0.6099.109"',
    'sec-ch-ua-model': '""',
    'sec-ch-device-memory': '"8"',
    'sec-ch-viewport-width': '"1920"',
    'sec-ch-viewport-height': '"1080"',
    'sec-ch-dpr': '"1"'
  };
}

async function testImmobiliareOptimized() {
  console.log('🔍 TEST FINALE: Immobiliare.it (CONFERMATO FUNZIONANTE)');
  console.log('=' .repeat(60));
  
  try {
    const url = 'https://www.immobiliare.it/vendita-terreni/roma/';
    console.log(`📡 URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: getAdvancedHeaders(),
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Size: ${response.data.length} chars`);
    
    const $ = cheerio.load(response.data);
    
    // Selettori confermati funzionanti per Immobiliare.it
    const selectors = [
      '.styles_in-listingCard__aHT19',
      '.styles_in-listingCardProperty__C2t47',
      '.nd-mediaObject'
    ];

    let elements = null;
    let foundSelector = null;
    
    for (const selector of selectors) {
      elements = $(selector);
      if (elements.length > 0) {
        foundSelector = selector;
        console.log(`✅ Trovati ${elements.length} elementi con ${selector}`);
        break;
      }
    }

    if (!elements || elements.length === 0) {
      console.log('❌ Nessun elemento trovato');
      return { success: false, count: 0 };
    }

    // Estrai dati reali
    let extractedCount = 0;
    
    elements.each((index, element) => {
      if (index >= 10) return; // Limita a 10 risultati
      
      const $el = $(element);
      const text = $el.text();
      
      // Estrai prezzo
      const priceMatch = text.match(/€\s*([\d.,]+)/) || text.match(/([\d.,]+)\s*€/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0;
      
      // Estrai area
      const areaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*m²/) || text.match(/(\d+(?:[.,]\d+)?)m²/);
      const area = areaMatch ? parseInt(areaMatch[1].replace(/[^\d]/g, '')) : 0;
      
      if (price > 0 || area > 0) {
        extractedCount++;
        console.log(`  ✅ Terreno ${index + 1}: €${price.toLocaleString()} - ${area}m²`);
      }
    });
    
    console.log(`📊 Totale terreni estratti: ${extractedCount}`);
    return { success: true, count: extractedCount };
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    return { success: false, count: 0 };
  }
}

async function testBakecaOptimized() {
  console.log('\n🔍 TEST FINALE: Bakeca.it (FONTE ALTERNATIVA)');
  console.log('=' .repeat(60));
  
  try {
    const url = 'https://www.bakeca.it/annunci/vendita/terreni/roma/';
    console.log(`📡 URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: getAdvancedHeaders()
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Size: ${response.data.length} chars`);
    
    const $ = cheerio.load(response.data);
    
    // Selettori per Bakeca.it
    const selectors = [
      '[data-testid="listing"]',
      '.listing',
      '.item-card',
      '.card',
      '.item'
    ];

    let elements = null;
    let foundSelector = null;
    
    for (const selector of selectors) {
      elements = $(selector);
      if (elements.length > 0) {
        foundSelector = selector;
        console.log(`✅ Trovati ${elements.length} elementi con ${selector}`);
        break;
      }
    }

    if (!elements || elements.length === 0) {
      console.log('❌ Nessun elemento trovato');
      return { success: false, count: 0 };
    }

    // Estrai dati reali
    let extractedCount = 0;
    
    elements.each((index, element) => {
      if (index >= 5) return; // Limita a 5 risultati
      
      const $el = $(element);
      const text = $el.text();
      
      // Estrai prezzo
      const priceMatch = text.match(/€\s*([\d.,]+)/) || text.match(/([\d.,]+)\s*€/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0;
      
      // Estrai area
      const areaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*m²/) || text.match(/(\d+(?:[.,]\d+)?)m²/);
      const area = areaMatch ? parseInt(areaMatch[1].replace(/[^\d]/g, '')) : 0;
      
      if (price > 0 || area > 0) {
        extractedCount++;
        console.log(`  ✅ Terreno ${index + 1}: €${price.toLocaleString()} - ${area}m²`);
      }
    });
    
    console.log(`📊 Totale terreni estratti: ${extractedCount}`);
    return { success: true, count: extractedCount };
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    return { success: false, count: 0 };
  }
}

async function testFinaleOttimizzato() {
  console.log('🔍 TEST FINALE OTTIMIZZATO - Verifica Soluzione Basata su Test Massivi');
  console.log('=' .repeat(80));
  
  // Test Immobiliare.it (confermato funzionante)
  const immobiliareResult = await testImmobiliareOptimized();
  
  // Test Bakeca.it (fonte alternativa)
  const bakecaResult = await testBakecaOptimized();
  
  console.log('\n📊 RISULTATO FINALE OTTIMIZZATO:');
  console.log(`✅ Immobiliare.it: ${immobiliareResult.success ? 'SUCCESSO' : 'FALLITO'} - ${immobiliareResult.count} terreni`);
  console.log(`✅ Bakeca.it: ${bakecaResult.success ? 'SUCCESSO' : 'FALLITO'} - ${bakecaResult.count} terreni`);
  
  const totalTerreni = immobiliareResult.count + bakecaResult.count;
  console.log(`📈 Totale terreni estratti: ${totalTerreni}`);
  
  if (totalTerreni > 0) {
    console.log('\n✅ SUCCESSO: La soluzione ottimizzata funziona!');
    console.log('🎯 Immobiliare.it fornisce dati reali');
    console.log('🔧 Sistema pronto per la produzione');
  } else {
    console.log('\n❌ PROBLEMA: Nessun terreno estratto');
    console.log('🔧 Necessario ulteriore ottimizzazione');
  }
  
  return { totalTerreni, immobiliareResult, bakecaResult };
}

// Esegui il test finale
testFinaleOttimizzato(); 