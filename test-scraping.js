// Test del sistema di scraping REALE
const { realWebScraper } = require('./src/lib/realWebScraper.ts');

async function testScraping() {
  console.log('🧪 Test del sistema di scraping REALE...');
  
  try {
    // Inizializza il browser
    await realWebScraper.initialize();
    console.log('✅ Browser inizializzato');
    
    // Test scraping
    const results = await realWebScraper.scrapeLands({
      location: 'Milano',
      minPrice: 100000,
      maxPrice: 500000
    });
    
    console.log(`📊 Risultati trovati: ${results.length}`);
    results.forEach((land, index) => {
      console.log(`${index + 1}. ${land.title} - €${land.price} - ${land.source}`);
    });
    
    // Chiudi il browser
    await realWebScraper.close();
    console.log('✅ Test completato');
    
  } catch (error) {
    console.error('❌ Errore nel test:', error);
  }
}

testScraping(); 