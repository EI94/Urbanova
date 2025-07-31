// Test dei nuovi selettori CSS reali
const axios = require('axios');
const cheerio = require('cheerio');

async function testNewSelectors() {
  console.log('🧪 Test dei nuovi selettori CSS reali...');
  
  const testUrl = 'https://www.immobiliare.it/vendita-terreni/milano/';
  
  try {
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
    
    const $ = cheerio.load(response.data);
    
    // Test selettori CSS Modules reali
    const selectors = [
      '.styles_in-listingCard__aHT19',
      '.styles_in-listingCardProperty__C2t47',
      '.nd-mediaObject'
    ];
    
    console.log('🔍 Testando selettori CSS Modules...');
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
      console.log('❌ Nessun elemento trovato con i selettori CSS Modules');
      return;
    }
    
    console.log(`✅ Elementi trovati con selettore: ${foundSelector}`);
    
    // Test estrazione dati dai primi 3 elementi
    foundElements.each((index, element) => {
      if (index >= 3) return; // Test solo i primi 3
      
      console.log(`\n🏠 Testando elemento ${index + 1}:`);
      const $el = $(element);
      
      // Test estrazione prezzo con selettore CSS Modules
      const priceEl = $el.find('.styles_in-listingCardPrice__earBq');
      if (priceEl.length > 0) {
        const priceText = priceEl.text().trim();
        console.log(`  💰 Prezzo trovato: "${priceText}"`);
        
        // Test regex migliorata
        const priceMatch = priceText.match(/€\s*([\d.,]+)/) || priceText.match(/([\d.,]+)\s*€/);
        if (priceMatch) {
          const cleanPrice = priceMatch[1].replace(/[^\d]/g, '');
          const price = parseInt(cleanPrice);
          console.log(`  ✅ Prezzo estratto: €${price.toLocaleString()}`);
        } else {
          console.log(`  ❌ Prezzo non valido: "${priceText}"`);
        }
      } else {
        console.log(`  ❌ Nessun elemento prezzo trovato`);
      }
      
      // Test estrazione area con selettore CSS Modules
      const areaEls = $el.find('.styles_in-listingCardFeatureList__item__CKRyT');
      let areaFound = false;
      
      areaEls.each((areaIndex, areaElement) => {
        const areaText = $(areaElement).text().trim();
        console.log(`  📐 Caratteristica ${areaIndex + 1}: "${areaText}"`);
        
        // Test regex per area
        const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)\s*m²/) || areaText.match(/(\d+(?:[.,]\d+)?)m²/);
        if (areaMatch) {
          const cleanArea = areaMatch[1].replace(/[^\d]/g, '');
          const area = parseInt(cleanArea);
          console.log(`  ✅ Area estratta: ${area}m²`);
          areaFound = true;
          return false; // Break the loop
        }
      });
      
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
  }
}

// Esegui il test
testNewSelectors(); 