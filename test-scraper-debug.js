// Test Debug Scraper - Verifica ogni fonte individualmente
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

async function testScraper(source, url, selectors) {
  console.log(`\n🔍 TESTING: ${source}`);
  console.log(`📡 URL: ${url}`);
  
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: getRealisticHeaders()
    });
    
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
      return 0;
    }
    
    console.log(`✅ ${source}: Trovati ${foundElements.length} elementi con ${foundSelector}`);
    
    // Test estrazione dati
    let extractedCount = 0;
    
    foundElements.each((index, element) => {
      if (index >= 3) return; // Test solo i primi 3
      
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
        console.log(`  ✅ ${source} - Item ${index + 1}: €${price.toLocaleString()} - ${area}m²`);
      }
    });
    
    console.log(`📊 ${source}: ${extractedCount} elementi con dati estratti`);
    return extractedCount;
    
  } catch (error) {
    console.error(`❌ ${source}: Errore - ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
    }
    return 0;
  }
}

async function testAllScrapers() {
  console.log('🔍 TEST COMPLETO SCRAPER - Verifica ogni fonte');
  console.log('=' .repeat(60));
  
  const tests = [
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
    }
  ];
  
  let totalResults = 0;
  
  for (const test of tests) {
    const results = await testScraper(test.source, test.url, test.selectors);
    totalResults += results;
    
    // Delay tra i test
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 RISULTATO FINALE: ${totalResults} terreni estratti totali`);
  
  if (totalResults === 0) {
    console.log('\n🚨 PROBLEMA CRITICO: Nessun terreno estratto da nessuna fonte!');
    console.log('🔧 Possibili cause:');
    console.log('  - Tutti i siti hanno cambiato struttura');
    console.log('  - Selettori CSS non aggiornati');
    console.log('  - Blocchi anti-bot su tutte le fonti');
    console.log('  - Problemi di rete');
  } else {
    console.log('\n✅ SUCCESSO: Alcune fonti funzionano!');
  }
}

// Esegui il test
testAllScrapers(); 