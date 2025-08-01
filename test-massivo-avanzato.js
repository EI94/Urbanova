// Test Massivo Avanzato - Verifica Strategie Anti-Bot
const axios = require('axios');
const cheerio = require('cheerio');

// Headers realistici
function getRealisticHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
  ];
  
  return {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
  };
}

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

async function testSourceAdvanced(source, url, selectors) {
  console.log(`\n🔍 TEST AVANZATO: ${source}`);
  console.log(`📡 URL: ${url}`);
  
  // Strategia multi-tentativo con headers diversi
  let response = null;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts && !response) {
    attempts++;
    console.log(`🔄 Tentativo ${attempts}/${maxAttempts} per ${source}...`);
    
    try {
      // Usa headers diversi per ogni tentativo
      const headers = attempts === 1 ? getRealisticHeaders() : getAdvancedHeaders();
      
      response = await axios.get(url, {
        timeout: 15000,
        headers: headers,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 403) {
        console.log(`🚫 Tentativo ${attempts}: 403 Forbidden, riprovo...`);
        response = null;
        await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
        continue;
      }
      
      if (response.status === 200) {
        console.log(`✅ ${source}: Accesso riuscito al tentativo ${attempts}`);
        break;
      }
      
    } catch (error) {
      console.log(`❌ Tentativo ${attempts} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
        console.log(`  Headers:`, error.response.headers);
      }
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
      }
    }
  }
  
  if (!response || response.status !== 200) {
    console.log(`❌ ${source}: Impossibile accedere dopo tutti i tentativi`);
    return { success: false, data: null, error: 'Accesso negato' };
  }
  
  console.log(`✅ Status: ${response.status}`);
  console.log(`📄 Size: ${response.data.length} chars`);
  
  const $ = cheerio.load(response.data);
  
  // Test selettori
  let foundElements = null;
  let foundSelector = null;
  
  for (const selector of selectors) {
    const elements = $(selector);
    console.log(`  ${selector}: ${elements.length} elementi`);
    if (elements.length > 0 && !foundElements) {
      foundElements = elements;
      foundSelector = selector;
    }
  }
  
  if (!foundElements) {
    console.log(`❌ ${source}: Nessun selettore funziona`);
    return { success: false, data: null, error: 'Nessun selettore funziona' };
  }
  
  console.log(`✅ ${source}: Trovati ${foundElements.length} elementi con ${foundSelector}`);
  
  // Test estrazione dati
  let extractedCount = 0;
  let extractedData = [];
  
  foundElements.each((index, element) => {
    if (index >= 5) return; // Test solo i primi 5
    
    const $el = $(element);
    
    // Estrai prezzo
    const priceText = $el.text();
    const priceMatch = priceText.match(/€\s*([\d.,]+)/) || priceText.match(/([\d.,]+)\s*€/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0;
    
    // Estrai area
    const areaMatch = priceText.match(/(\d+(?:[.,]\d+)?)\s*m²/) || priceText.match(/(\d+(?:[.,]\d+)?)m²/);
    const area = areaMatch ? parseInt(areaMatch[1].replace(/[^\d]/g, '')) : 0;
    
    if (price > 0 || area > 0) {
      extractedCount++;
      const data = {
        index: index + 1,
        price: price,
        area: area,
        text: priceText.substring(0, 100) + '...'
      };
      extractedData.push(data);
      console.log(`  ✅ ${source} - Item ${index + 1}: €${price.toLocaleString()} - ${area}m²`);
    }
  });
  
  console.log(`📊 ${source}: ${extractedCount} elementi con dati estratti`);
  
  return { 
    success: true, 
    data: {
      elementsFound: foundElements.length,
      elementsExtracted: extractedCount,
      selector: foundSelector,
      extractedData: extractedData
    }
  };
}

async function testAllSourcesAdvanced() {
  console.log('🔍 TEST MASSIVO AVANZATO - Verifica Strategie Anti-Bot');
  console.log('=' .repeat(80));
  
  const tests = [
    {
      source: 'Immobiliare.it',
      url: 'https://www.immobiliare.it/vendita-terreni/roma/',
      selectors: [
        '.styles_in-listingCard__aHT19',
        '.styles_in-listingCardProperty__C2t47',
        '.nd-mediaObject',
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.in-card',
        '.in-realEstateList__item',
        'article',
        '.card',
        '.item'
      ]
    },
    {
      source: 'Casa.it',
      url: 'https://www.casa.it/terreni/vendita/roma',
      selectors: [
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ]
    },
    {
      source: 'Idealista.it',
      url: 'https://www.idealista.it/terreni/vendita/roma',
      selectors: [
        '.item-info-container',
        '.item-detail',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ]
    },
    {
      source: 'BorsinoImmobiliare.it',
      url: 'https://www.borsinoimmobiliare.it/terreni/vendita/roma',
      selectors: [
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ]
    },
    {
      source: 'Subito.it',
      url: 'https://www.subito.it/immobili/terreni-e-aree-edificabili/roma/vendita/',
      selectors: [
        '[data-testid="item-card"]',
        '.item-card',
        '.listing-item',
        '.card',
        '.item',
        'article',
        '.announcement'
      ]
    },
    {
      source: 'Kijiji.it',
      url: 'https://www.kijiji.it/terreni/roma/vendita/',
      selectors: [
        '[data-testid="listing"]',
        '.listing',
        '.item-card',
        '.card',
        '.item'
      ]
    }
  ];
  
  let totalResults = 0;
  let successfulSources = 0;
  let failedSources = 0;
  const results = {};
  
  for (const test of tests) {
    const result = await testSourceAdvanced(test.source, test.url, test.selectors);
    results[test.source] = result;
    
    if (result.success) {
      successfulSources++;
      totalResults += result.data.elementsExtracted;
      console.log(`✅ ${test.source}: SUCCESSO - ${result.data.elementsExtracted} terreni estratti`);
    } else {
      failedSources++;
      console.log(`❌ ${test.source}: FALLITO - ${result.error}`);
    }
    
    // Delay tra i test
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`\n📊 RISULTATO FINALE MASSIVO:`);
  console.log(`✅ Fonti funzionanti: ${successfulSources}/${tests.length}`);
  console.log(`❌ Fonti fallite: ${failedSources}/${tests.length}`);
  console.log(`📈 Terreni estratti totali: ${totalResults}`);
  
  if (successfulSources === 0) {
    console.log('\n🚨 PROBLEMA CRITICO: Nessuna fonte funziona!');
    console.log('🔧 Tutte le strategie anti-bot sono fallite');
    console.log('💡 Necessario implementare soluzioni alternative');
  } else if (successfulSources < tests.length / 2) {
    console.log('\n⚠️ PROBLEMA PARZIALE: Solo alcune fonti funzionano');
    console.log('🔧 Necessario ottimizzare strategie anti-bot');
  } else {
    console.log('\n✅ SUCCESSO: La maggior parte delle fonti funziona!');
    console.log('🎯 Strategie anti-bot efficaci');
  }
  
  // Dettaglio risultati
  console.log('\n📋 DETTAGLIO RISULTATI:');
  Object.entries(results).forEach(([source, result]) => {
    const status = result.success ? '✅' : '❌';
    const info = result.success 
      ? `${result.data.elementsExtracted} terreni estratti`
      : result.error;
    console.log(`  ${status} ${source}: ${info}`);
  });
  
  return { totalResults, successfulSources, failedSources, results };
}

// Esegui il test massivo
testAllSourcesAdvanced(); 