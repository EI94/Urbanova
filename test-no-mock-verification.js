#!/usr/bin/env node

/**
 * 🧪 TEST MARKET INTELLIGENCE - VERIFICA RIMOZIONE MOCK
 * 
 * Test semplice per verificare che il codice non contenga più dati mock
 */

const fs = require('fs');
const path = require('path');

function testNoMockData() {
  console.log('🧪 TEST MARKET INTELLIGENCE - VERIFICA RIMOZIONE MOCK');
  console.log('=' .repeat(60));
  
  const cloudflareWorkerFile = path.join(__dirname, 'src/lib/cloudflareWorkerScraper.ts');
  
  if (!fs.existsSync(cloudflareWorkerFile)) {
    console.log('❌ File cloudflareWorkerScraper.ts non trovato');
    return false;
  }
  
  const content = fs.readFileSync(cloudflareWorkerFile, 'utf8');
  
  // Verifica che non ci siano più riferimenti a dati mock
  const mockPatterns = [
    'generateRealisticData',
    'example.com',
    'market-data',
    'generateSingleTerreno',
    'getPriceRangeForLocation',
    'getAreaRangeForLocation'
  ];
  
  let hasMockData = false;
  
  for (const pattern of mockPatterns) {
    if (content.includes(pattern)) {
      console.log(`❌ Trovato riferimento a dati mock: ${pattern}`);
      hasMockData = true;
    }
  }
  
  // Verifica che ci sia il messaggio di "nessun risultato reale"
  if (content.includes('Nessun risultato reale trovato')) {
    console.log('✅ Messaggio "nessun risultato reale" presente');
  } else {
    console.log('❌ Messaggio "nessun risultato reale" non trovato');
    hasMockData = true;
  }
  
  // Verifica che ci sia il return [] invece di dati mock
  if (content.includes('return [];')) {
    console.log('✅ Return array vuoto presente');
  } else {
    console.log('❌ Return array vuoto non trovato');
    hasMockData = true;
  }
  
  if (!hasMockData) {
    console.log('\n🎉 TUTTI I TEST SUPERATI!');
    console.log('✅ Nessun dato mock trovato nel codice');
    console.log('✅ Sistema configurato per restituire solo dati reali');
    return true;
  } else {
    console.log('\n❌ TEST FALLITI!');
    console.log('❌ Ancora presenti riferimenti a dati mock');
    return false;
  }
}

function main() {
  const success = testNoMockData();
  process.exit(success ? 0 : 1);
}

main();
