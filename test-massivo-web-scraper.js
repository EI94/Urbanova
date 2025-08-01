// Test massivo del Web Scraper - TUTTO REALE
const axios = require('axios');
const cheerio = require('cheerio');

async function testMassivoWebScraper() {
  console.log('🧪 TEST MASSIVO WEB SCRAPER - TUTTO REALE');
  console.log('=' .repeat(60));
  
  const testUrl = 'https://www.immobiliare.it/vendita-terreni/milano/';
  
  try {
    console.log('📡 1. Test connessione HTTP...');
    const response = await axios.get(testUrl, {
      timeout: 10000,
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
    
    console.log('\n🔍 2. Test selettori CSS Modules...');
    const selectors = [
      '.styles_in-listingCard__aHT19',
      '.styles_in-listingCardProperty__C2t47',
      '.nd-mediaObject'
    ];
    
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
      console.log('❌ CRITICO: Nessun elemento trovato con i selettori CSS Modules!');
      console.log('🔍 Analizzando struttura HTML...');
      
      // Cerca qualsiasi elemento che contenga "€"
      const priceElements = $('*:contains("€")');
      console.log(`  Elementi con "€": ${priceElements.length}`);
      
      // Cerca qualsiasi elemento che contenga "m²"
      const areaElements = $('*:contains("m²")');
      console.log(`  Elementi con "m²": ${areaElements.length}`);
      
      // Analizza le prime 5 classi più comuni
      const divs = $('div[class]');
      const classCounts = {};
      
      divs.each((index, element) => {
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
        .slice(0, 10);
      
      console.log('  Classi più comuni:');
      sortedClasses.forEach(([className, count]) => {
        console.log(`    ${className}: ${count} volte`);
      });
      
      return;
    }
    
    console.log(`✅ Elementi trovati con selettore: ${foundSelector}`);
    
    console.log('\n💰 3. Test estrazione prezzi...');
    let priceCount = 0;
    let validPriceCount = 0;
    
    foundElements.each((index, element) => {
      if (index >= 5) return; // Test solo i primi 5
      
      const $el = $(element);
      const priceEl = $el.find('.styles_in-listingCardPrice__earBq');
      
      if (priceEl.length > 0) {
        priceCount++;
        const priceText = priceEl.text().trim();
        console.log(`  Prezzo ${index + 1}: "${priceText}"`);
        
        // Test regex
        const priceMatch = priceText.match(/€\s*([\d.,]+)/) || priceText.match(/([\d.,]+)\s*€/);
        if (priceMatch) {
          const cleanPrice = priceMatch[1].replace(/[^\d]/g, '');
          const price = parseInt(cleanPrice);
          console.log(`    ✅ Prezzo estratto: €${price.toLocaleString()}`);
          validPriceCount++;
        } else {
          console.log(`    ❌ Prezzo non valido: "${priceText}"`);
        }
      } else {
        console.log(`  ❌ Nessun prezzo trovato per elemento ${index + 1}`);
      }
    });
    
    console.log(`\n📊 Risultati prezzi: ${priceCount} trovati, ${validPriceCount} validi`);
    
    console.log('\n📐 4. Test estrazione aree...');
    let areaCount = 0;
    let validAreaCount = 0;
    
    foundElements.each((index, element) => {
      if (index >= 5) return; // Test solo i primi 5
      
      const $el = $(element);
      const areaEls = $el.find('.styles_in-listingCardFeatureList__item__CKRyT');
      
      let areaFound = false;
      areaEls.each((areaIndex, areaElement) => {
        const areaText = $(areaElement).text().trim();
        console.log(`  Caratteristica ${index + 1}.${areaIndex + 1}: "${areaText}"`);
        
        // Test regex per area
        const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)\s*m²/) || areaText.match(/(\d+(?:[.,]\d+)?)m²/);
        if (areaMatch) {
          const cleanArea = areaMatch[1].replace(/[^\d]/g, '');
          const area = parseInt(cleanArea);
          console.log(`    ✅ Area estratta: ${area}m²`);
          areaFound = true;
          validAreaCount++;
          return false; // Break the loop
        }
      });
      
      if (areaFound) {
        areaCount++;
      } else {
        console.log(`  ❌ Nessuna area valida trovata per elemento ${index + 1}`);
      }
    });
    
    console.log(`\n📊 Risultati aree: ${areaCount} trovati, ${validAreaCount} validi`);
    
    console.log('\n🔗 5. Test estrazione link...');
    let linkCount = 0;
    
    foundElements.each((index, element) => {
      if (index >= 5) return; // Test solo i primi 5
      
      const $el = $(element);
      const linkEl = $el.find('a').first();
      
      if (linkEl.length) {
        const url = linkEl.attr('href');
        console.log(`  Link ${index + 1}: ${url}`);
        linkCount++;
      } else {
        console.log(`  ❌ Nessun link trovato per elemento ${index + 1}`);
      }
    });
    
    console.log(`\n📊 Risultati link: ${linkCount} trovati`);
    
    console.log('\n🎯 6. Test completo estrazione terreno...');
    let terrenoCount = 0;
    
    foundElements.each((index, element) => {
      if (index >= 3) return; // Test solo i primi 3
      
      const $el = $(element);
      
      // Estrai prezzo
      const priceEl = $el.find('.styles_in-listingCardPrice__earBq');
      let price = 0;
      if (priceEl.length > 0) {
        const priceText = priceEl.text().trim();
        const priceMatch = priceText.match(/€\s*([\d.,]+)/) || priceText.match(/([\d.,]+)\s*€/);
        if (priceMatch) {
          const cleanPrice = priceMatch[1].replace(/[^\d]/g, '');
          price = parseInt(cleanPrice);
        }
      }
      
      // Estrai area
      const areaEls = $el.find('.styles_in-listingCardFeatureList__item__CKRyT');
      let area = 0;
      areaEls.each((areaIndex, areaElement) => {
        const areaText = $(areaElement).text().trim();
        const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)\s*m²/) || areaText.match(/(\d+(?:[.,]\d+)?)m²/);
        if (areaMatch) {
          const cleanArea = areaMatch[1].replace(/[^\d]/g, '');
          area = parseInt(cleanArea);
          return false; // Break
        }
      });
      
      // Estrai titolo
      const titleEl = $el.find('[class*="Title"], h1, h2, h3, .title, [class*="title"]').first();
      const title = titleEl.length ? titleEl.text().trim() : `Terreno ${index + 1}`;
      
      // Estrai link
      const linkEl = $el.find('a').first();
      const url = linkEl.length ? linkEl.attr('href') : '';
      
      // Verifica se abbiamo dati sufficienti
      if (price > 0 || area > 0) {
        terrenoCount++;
        console.log(`\n🏠 Terreno ${index + 1}:`);
        console.log(`  Titolo: ${title}`);
        console.log(`  Prezzo: ${price > 0 ? `€${price.toLocaleString()}` : 'Non disponibile'}`);
        console.log(`  Area: ${area > 0 ? `${area}m²` : 'Non disponibile'}`);
        console.log(`  Link: ${url || 'Non disponibile'}`);
        console.log(`  ✅ VALIDO: ${price > 0 ? 'Prezzo' : ''}${price > 0 && area > 0 ? ' + ' : ''}${area > 0 ? 'Area' : ''}`);
      } else {
        console.log(`\n❌ Terreno ${index + 1}: Dati insufficienti`);
        console.log(`  Titolo: ${title}`);
        console.log(`  Prezzo: ${price > 0 ? `€${price.toLocaleString()}` : 'Non disponibile'}`);
        console.log(`  Area: ${area > 0 ? `${area}m²` : 'Non disponibile'}`);
      }
    });
    
    console.log(`\n🎉 RISULTATO FINALE: ${terrenoCount} terreni validi estratti!`);
    
    if (terrenoCount === 0) {
      console.log('\n🚨 PROBLEMA CRITICO: Nessun terreno valido estratto!');
      console.log('🔧 Possibili cause:');
      console.log('  - Selettori CSS cambiati');
      console.log('  - Regex non funzionanti');
      console.log('  - Struttura HTML modificata');
    } else {
      console.log('\n✅ SUCCESSO: Web scraper funziona correttamente!');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test massivo:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Headers:', error.response.headers);
    }
  }
}

// Esegui il test massivo
testMassivoWebScraper(); 