// Test diretto del Web Scraper - VERSIONE AGGIORNATA
const axios = require('axios');
const cheerio = require('cheerio');

async function testWebScraper() {
  console.log('🧪 Test diretto del Web Scraper - VERSIONE AGGIORNATA...');
  
  const testUrl = 'https://www.immobiliare.it/vendita-terreni/milano/';
  
  try {
    console.log('📡 Testando connessione a:', testUrl);
    
    const response = await axios.get(testUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('✅ Connessione riuscita! Status:', response.status);
    console.log('📄 Dimensione risposta:', response.data.length, 'caratteri');
    
    const $ = cheerio.load(response.data);
    
    // Test selettori AGGIORNATI
    const selectors = [
      '.listing-item',
      '.announcement-card',
      '[data-testid="listing-item"]',
      '.in-card',
      '.in-realEstateList__item--featured',
      'article[data-testid="listing-item"]',
      '.in-realEstateList__item--standard',
      '.in-realEstateList__item',
      'article',
      '.card',
      '.item',
      '.listing',
      '.announcement'
    ];
    
    console.log('🔍 Testando selettori AGGIORNATI...');
    let foundElements = null;
    let foundSelector = null;
    
    for (const selector of selectors) {
      const elements = $(selector);
      console.log(`  ${selector}: ${elements.length} elementi trovati`);
      if (elements.length > 0 && !foundElements) {
        foundElements = elements;
        foundSelector = selector;
      }
    }
    
    if (!foundElements) {
      console.log('❌ Nessun elemento trovato con i selettori aggiornati');
      return;
    }
    
    console.log(`✅ Elementi trovati con selettore: ${foundSelector}`);
    
    // Test estrazione dati dai primi 3 elementi
    foundElements.each((index, element) => {
      if (index >= 3) return; // Test solo i primi 3
      
      console.log(`\n🏠 Testando elemento ${index + 1}:`);
      const $el = $(element);
      
      // Test estrazione prezzo
      const priceSelectors = [
        'span:contains("€")',
        'div:contains("€")',
        'p:contains("€")',
        '.price',
        '.Price',
        '[class*="price"]',
        '[class*="Price"]'
      ];
      
      let priceFound = false;
      for (const selector of priceSelectors) {
        const priceEl = $el.find(selector);
        if (priceEl.length > 0) {
          const priceText = priceEl.text().trim();
          console.log(`  💰 Prezzo trovato: "${priceText}"`);
          
          // Test regex migliorata
          const priceMatch = priceText.match(/€\s*([\d.,]+)/) || priceText.match(/([\d.,]+)\s*€/);
          if (priceMatch) {
            const cleanPrice = priceMatch[1].replace(/[^\d]/g, '');
            const price = parseInt(cleanPrice);
            console.log(`  ✅ Prezzo estratto: €${price.toLocaleString()}`);
            priceFound = true;
            break;
          }
        }
      }
      
      if (!priceFound) {
        console.log(`  ❌ Nessun prezzo valido trovato`);
      }
      
      // Test estrazione area
      const areaSelectors = [
        'span:contains("m²")',
        'div:contains("m²")',
        'p:contains("m²")',
        '.area',
        '.surface',
        '[class*="area"]',
        '[class*="surface"]'
      ];
      
      let areaFound = false;
      for (const selector of areaSelectors) {
        const areaEl = $el.find(selector);
        if (areaEl.length > 0) {
          const areaText = areaEl.text().trim();
          console.log(`  📐 Area trovata: "${areaText}"`);
          
          // Test regex migliorata
          const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)\s*m²/) || areaText.match(/(\d+(?:[.,]\d+)?)m²/);
          if (areaMatch) {
            const cleanArea = areaMatch[1].replace(/[^\d]/g, '');
            const area = parseInt(cleanArea);
            console.log(`  ✅ Area estratta: ${area}m²`);
            areaFound = true;
            break;
          }
        }
      }
      
      if (!areaFound) {
        console.log(`  ❌ Nessuna area valida trovata`);
      }
      
      // Test link
      const linkEl = $el.find('a').first();
      if (linkEl.length) {
        const url = linkEl.attr('href');
        console.log(`  🔗 Link trovato: ${url}`);
      } else {
        console.log(`  ❌ Nessun link trovato`);
      }
    });
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Headers:', error.response.headers);
    }
  }
}

// Esegui il test
testWebScraper(); 