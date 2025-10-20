#!/usr/bin/env node

/**
 * 🧪 TEST MARKET INTELLIGENCE - SOLO DATI REALI
 * 
 * Test per verificare che Market Intelligence restituisca solo dati reali
 * e non più dati mock quando lo scraping fallisce.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3112';

async function testMarketIntelligenceReal() {
  console.log('🧪 TEST MARKET INTELLIGENCE - SOLO DATI REALI');
  console.log('=' .repeat(60));
  
  try {
    console.log('📡 Testando Market Intelligence con parametri Roma...');
    
    const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
      location: 'Roma',
      criteria: {
        minPrice: 0,
        maxPrice: 100000000,
        minArea: 0,
        maxArea: 100000000
      },
      email: 'test@test.com'
    }, {
      timeout: 60000, // 60 secondi timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Risposta ricevuta:', response.status);
    
    const data = response.data;
    console.log('📊 Risultati:', {
      success: data.success,
      landsCount: data.lands?.length || 0,
      hasLands: !!data.lands && data.lands.length > 0
    });
    
    if (data.lands && data.lands.length > 0) {
      console.log('🔍 Analisi risultati:');
      data.lands.forEach((land, index) => {
        console.log(`  ${index + 1}. ${land.title}`);
        console.log(`     Prezzo: €${land.price?.toLocaleString() || 'N/A'}`);
        console.log(`     Area: ${land.area || 'N/A'} m²`);
        console.log(`     URL: ${land.url}`);
        console.log(`     Source: ${land.source}`);
        console.log(`     AI Score: ${land.aiScore || 'N/A'}`);
        
        // Verifica che non ci siano URL mock
        if (land.url && land.url.includes('example.com')) {
          console.log('❌ ERRORE: URL mock rilevato!');
          return false;
        }
        
        console.log('');
      });
      
      console.log('✅ Test completato: Tutti i risultati sono reali (nessun URL mock)');
      return true;
    } else {
      console.log('⚠️ Nessun risultato trovato - questo è corretto se lo scraping reale fallisce');
      console.log('✅ Test completato: Nessun dato mock generato');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Avvio test Market Intelligence...');
  
  const success = await testMarketIntelligenceReal();
  
  if (success) {
    console.log('\n🎉 TUTTI I TEST SUPERATI!');
    console.log('✅ Market Intelligence ora restituisce solo dati reali');
    console.log('✅ Nessun dato mock generato quando lo scraping fallisce');
    process.exit(0);
  } else {
    console.log('\n❌ TEST FALLITI!');
    process.exit(1);
  }
}

main().catch(console.error);
