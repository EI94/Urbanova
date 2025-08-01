// Test filtro criteri con dati reali
const axios = require('axios');
const cheerio = require('cheerio');

async function testFiltroCriteri() {
  console.log('🧪 TEST FILTRO CRITERI - TUTTO REALE');
  console.log('=' .repeat(60));
  
  const testUrl = 'https://www.immobiliare.it/vendita-terreni/milano/';
  
  try {
    console.log('📡 1. Estrazione dati reali...');
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
    
    const $ = cheerio.load(response.data);
    const elements = $('.styles_in-listingCard__aHT19');
    
    console.log(`✅ Trovati ${elements.length} elementi`);
    
    // Estrai terreni reali
    const terreni = [];
    elements.each((index, element) => {
      if (index >= 10) return; // Limita a 10
      
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
      
      if (price > 0 || area > 0) {
        terreni.push({
          id: `test_${index}`,
          title,
          price,
          area,
          location: 'Milano',
          description: title,
          url,
          source: 'immobiliare.it (TEST)',
          images: [],
          features: ['Edificabile'],
          contactInfo: {},
          timestamp: new Date(),
          hasRealPrice: price > 0,
          hasRealArea: area > 0
        });
      }
    });
    
    console.log(`📊 Terreni estratti: ${terreni.length}`);
    
    // Mostra i terreni estratti
    terreni.forEach((terreno, index) => {
      console.log(`\n🏠 Terreno ${index + 1}:`);
      console.log(`  Titolo: ${terreno.title}`);
      console.log(`  Prezzo: €${terreno.price.toLocaleString()}`);
      console.log(`  Area: ${terreno.area}m²`);
    });
    
    // Test filtri
    console.log('\n🔍 2. Test filtri...');
    
    // Test 1: Filtro prezzo
    console.log('\n💰 Test filtro prezzo (€200.000 - €1.000.000):');
    const filteredByPrice = terreni.filter(land => {
      const minPrice = 200000;
      const maxPrice = 1000000;
      return land.price >= minPrice && land.price <= maxPrice;
    });
    
    console.log(`  Terreni che passano il filtro prezzo: ${filteredByPrice.length}`);
    filteredByPrice.forEach((terreno, index) => {
      console.log(`    ${index + 1}. ${terreno.title} - €${terreno.price.toLocaleString()}`);
    });
    
    // Test 2: Filtro area
    console.log('\n📐 Test filtro area (500m² - 5000m²):');
    const filteredByArea = terreni.filter(land => {
      const minArea = 500;
      const maxArea = 5000;
      return land.area >= minArea && land.area <= maxArea;
    });
    
    console.log(`  Terreni che passano il filtro area: ${filteredByArea.length}`);
    filteredByArea.forEach((terreno, index) => {
      console.log(`    ${index + 1}. ${terreno.title} - ${terreno.area}m²`);
    });
    
    // Test 3: Filtro combinato
    console.log('\n🎯 Test filtro combinato (prezzo €200.000-€1.000.000 + area 500-5000m²):');
    const filteredCombined = terreni.filter(land => {
      const minPrice = 200000;
      const maxPrice = 1000000;
      const minArea = 500;
      const maxArea = 5000;
      return land.price >= minPrice && land.price <= maxPrice && 
             land.area >= minArea && land.area <= maxArea;
    });
    
    console.log(`  Terreni che passano entrambi i filtri: ${filteredCombined.length}`);
    filteredCombined.forEach((terreno, index) => {
      console.log(`    ${index + 1}. ${terreno.title} - €${terreno.price.toLocaleString()} - ${terreno.area}m²`);
    });
    
    // Test 4: Filtro molto ampio
    console.log('\n🌍 Test filtro molto ampio (prezzo €10.000-€10.000.000 + area 10-100.000m²):');
    const filteredWide = terreni.filter(land => {
      const minPrice = 10000;
      const maxPrice = 10000000;
      const minArea = 10;
      const maxArea = 100000;
      return land.price >= minPrice && land.price <= maxPrice && 
             land.area >= minArea && land.area <= maxArea;
    });
    
    console.log(`  Terreni che passano il filtro ampio: ${filteredWide.length}`);
    filteredWide.forEach((terreno, index) => {
      console.log(`    ${index + 1}. ${terreno.title} - €${terreno.price.toLocaleString()} - ${terreno.area}m²`);
    });
    
    console.log('\n🎉 RISULTATO FINALE:');
    console.log(`  - Terreni totali: ${terreni.length}`);
    console.log(`  - Con filtro ampio: ${filteredWide.length}`);
    console.log(`  - Con filtro combinato: ${filteredCombined.length}`);
    
    if (filteredWide.length === 0) {
      console.log('\n🚨 PROBLEMA: Nessun terreno passa nemmeno il filtro più ampio!');
      console.log('🔧 Possibili cause:');
      console.log('  - Dati estratti non validi');
      console.log('  - Logica di filtro errata');
      console.log('  - Range di filtri troppo restrittivi');
    } else {
      console.log('\n✅ SUCCESSO: Filtro funziona correttamente!');
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }
}

// Esegui il test
testFiltroCriteri(); 