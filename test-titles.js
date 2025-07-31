// Test per trovare i selettori dei titoli
const axios = require('axios');
const cheerio = require('cheerio');

async function testTitles() {
  console.log('🧪 Test per trovare i selettori dei titoli...');
  
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
    
    // Test selettori per titoli
    const titleSelectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '.title', '.Title',
      '[class*="title"]', '[class*="Title"]',
      '.styles_in-listingCardProperty__C2t47 h1',
      '.styles_in-listingCardProperty__C2t47 h2',
      '.styles_in-listingCardProperty__C2t47 h3',
      '.nd-mediaObject h1',
      '.nd-mediaObject h2',
      '.nd-mediaObject h3'
    ];
    
    const elements = $('.styles_in-listingCard__aHT19');
    console.log(`Trovati ${elements.length} elementi annuncio`);
    
    // Test sui primi 3 elementi
    elements.each((index, element) => {
      if (index >= 3) return;
      
      console.log(`\n🏠 Elemento ${index + 1}:`);
      const $el = $(element);
      
      for (const selector of titleSelectors) {
        const titleEl = $el.find(selector);
        if (titleEl.length > 0) {
          const titleText = titleEl.text().trim();
          if (titleText.length > 10 && titleText.length < 200) {
            console.log(`  ✅ Titolo trovato con ${selector}: "${titleText}"`);
            break;
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }
}

// Esegui il test
testTitles(); 