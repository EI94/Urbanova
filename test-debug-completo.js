// Test Debug Completo - Identifica dove si blocca il sistema
const axios = require('axios');
const cheerio = require('cheerio');

// Rotazione User-Agent per evitare blocchi
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Headers realistici per evitare blocchi
function getRealisticHeaders() {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  };
}

async function testDebugCompleto() {
  console.log('🔍 TEST DEBUG COMPLETO - Identifica dove si blocca');
  console.log('=' .repeat(60));
  
  // Test 1: Verifica connessione di base
  console.log('\n📡 1. Test connessione di base...');
  try {
    const response = await axios.get('https://www.immobiliare.it', {
      timeout: 10000,
      headers: getRealisticHeaders()
    });
    console.log('✅ Connessione base OK - Status:', response.status);
  } catch (error) {
    console.error('❌ Connessione base FALLITA:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Headers:', error.response.headers);
    }
    return;
  }
  
  // Test 2: Verifica URL di ricerca
  console.log('\n🔍 2. Test URL di ricerca...');
  const testUrl = 'https://www.immobiliare.it/vendita-terreni/milano/';
  
  try {
    const response = await axios.get(testUrl, {
      timeout: 15000,
      headers: getRealisticHeaders()
    });
    
    console.log('✅ URL di ricerca OK - Status:', response.status);
    console.log('📄 Dimensione risposta:', response.data.length, 'caratteri');
    
    const $ = cheerio.load(response.data);
    
    // Test 3: Verifica selettori
    console.log('\n🔍 3. Test selettori CSS...');
    const selectors = [
      '.styles_in-listingCard__aHT19',
      '.styles_in-listingCardProperty__C2t47',
      '.nd-mediaObject',
      '[class*="listingCard"]',
      '[class*="property"]',
      '.card',
      '.listing'
    ];
    
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
      console.log('❌ CRITICO: Nessun selettore funziona!');
      console.log('🔍 Analizzando struttura HTML...');
      
      // Cerca qualsiasi elemento che contenga "€"
      const priceElements = $('*:contains("€")');
      console.log(`  Elementi con "€": ${priceElements.length}`);
      
      // Cerca qualsiasi elemento che contenga "m²"
      const areaElements = $('*:contains("m²")');
      console.log(`  Elementi con "m²": ${areaElements.length}`);
      
      // Analizza le prime 10 classi più comuni
      const divs = $('div[class]');
      const classCounts = {};
      
      divs.each((index, element) => {
        if (index >= 100) return; // Limita per performance
        const className = $(element).attr('class');
        if (className) {
          const classes = className.split(' ');
          classes.forEach(cls => {
            if (cls.length > 3) {
              classCounts[cls] = (classCounts[cls] || 0) + 1;
            }
          });
        }
      });
      
      const sortedClasses = Object.entries(classCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15);
      
      console.log('  Classi più comuni:');
      sortedClasses.forEach(([className, count]) => {
        console.log(`    ${className}: ${count} volte`);
      });
      
      return;
    }
    
    console.log(`✅ Selettore funzionante: ${foundSelector}`);
    
    // Test 4: Estrazione dati
    console.log('\n🔍 4. Test estrazione dati...');
    let extractedCount = 0;
    
    foundElements.each((index, element) => {
      if (index >= 5) return; // Test solo i primi 5
      
      const $el = $(element);
      
      // Estrai prezzo
      const priceSelectors = [
        '.styles_in-listingCardPrice__earBq',
        '[class*="price"]',
        '[class*="Price"]',
        '.price',
        '.Price'
      ];
      
      let price = 0;
      for (const priceSelector of priceSelectors) {
        const priceEl = $el.find(priceSelector);
        if (priceEl.length > 0) {
          const priceText = priceEl.text().trim();
          console.log(`  Prezzo ${index + 1}: "${priceText}"`);
          
          const priceMatch = priceText.match(/€\s*([\d.,]+)/) || priceText.match(/([\d.,]+)\s*€/);
          if (priceMatch) {
            const cleanPrice = priceMatch[1].replace(/[^\d]/g, '');
            price = parseInt(cleanPrice);
            console.log(`    ✅ Prezzo estratto: €${price.toLocaleString()}`);
            break;
          }
        }
      }
      
      // Estrai area
      const areaSelectors = [
        '.styles_in-listingCardFeatureList__item__CKRyT',
        '[class*="area"]',
        '[class*="Area"]',
        '.area',
        '.Area'
      ];
      
      let area = 0;
      for (const areaSelector of areaSelectors) {
        const areaEls = $el.find(areaSelector);
        areaEls.each((areaIndex, areaElement) => {
          const areaText = $(areaElement).text().trim();
          console.log(`  Caratteristica ${index + 1}.${areaIndex + 1}: "${areaText}"`);
          
          const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)\s*m²/) || areaText.match(/(\d+(?:[.,]\d+)?)m²/);
          if (areaMatch) {
            const cleanArea = areaMatch[1].replace(/[^\d]/g, '');
            area = parseInt(cleanArea);
            console.log(`    ✅ Area estratta: ${area}m²`);
            return false; // Break
          }
        });
        if (area > 0) break;
      }
      
      // Estrai titolo
      const titleSelectors = [
        '[class*="Title"]',
        '[class*="title"]',
        'h1', 'h2', 'h3', 'h4',
        '.title', '.Title'
      ];
      
      let title = `Terreno ${index + 1}`;
      for (const titleSelector of titleSelectors) {
        const titleEl = $el.find(titleSelector).first();
        if (titleEl.length > 0) {
          title = titleEl.text().trim();
          console.log(`  Titolo ${index + 1}: "${title}"`);
          break;
        }
      }
      
      // Estrai link
      const linkEl = $el.find('a').first();
      const url = linkEl.length ? linkEl.attr('href') : '';
      
      if (price > 0 || area > 0) {
        extractedCount++;
        console.log(`✅ Terreno ${index + 1} estratto: ${title} - €${price.toLocaleString()} - ${area}m²`);
      } else {
        console.log(`❌ Terreno ${index + 1}: Dati insufficienti`);
      }
    });
    
    console.log(`\n📊 RISULTATO FINALE: ${extractedCount} terreni estratti con successo!`);
    
    if (extractedCount === 0) {
      console.log('\n🚨 PROBLEMA CRITICO: Nessun terreno estratto!');
      console.log('🔧 Possibili cause:');
      console.log('  - Selettori CSS cambiati');
      console.log('  - Struttura HTML modificata');
      console.log('  - Regex non funzionanti');
      console.log('  - Sito web bloccato');
    } else {
      console.log('\n✅ SUCCESSO: Estrazione funziona correttamente!');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Headers:', error.response.headers);
    }
  }
}

// Esegui il test
testDebugCompleto(); 