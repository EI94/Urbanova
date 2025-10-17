#!/usr/bin/env node

/**
 * 🔍 MARKET INTELLIGENCE DEBUG TEST
 * 
 * Test per identificare il problema "0 risultati" nonostante parametri larghissimi
 * per Roma e Frascati
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://urbanova.life';

async function testMarketIntelligence() {
  console.log('🔍 MARKET INTELLIGENCE DEBUG TEST');
  console.log('=====================================');
  
  const testCases = [
    {
      name: 'Roma - Parametri Larghissimi',
      location: 'Roma',
      criteria: {
        minPrice: 0,
        maxPrice: 0, // Nessun limite
        minArea: 0,
        maxArea: 0, // Nessun limite
        propertyType: 'residenziale'
      }
    },
    {
      name: 'Frascati - Parametri Larghissimi', 
      location: 'Frascati',
      criteria: {
        minPrice: 0,
        maxPrice: 0, // Nessun limite
        minArea: 0,
        maxArea: 0, // Nessun limite
        propertyType: 'residenziale'
      }
    },
    {
      name: 'Marino - Parametri Larghissimi',
      location: 'Marino',
      criteria: {
        minPrice: 0,
        maxPrice: 0, // Nessun limite
        minArea: 0,
        maxArea: 0, // Nessun limite
        propertyType: 'residenziale'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Test: ${testCase.name}`);
    console.log(`📍 Location: ${testCase.location}`);
    console.log(`💰 Price: ${testCase.criteria.minPrice} - ${testCase.criteria.maxPrice || 'No limit'}`);
    console.log(`📐 Area: ${testCase.criteria.minArea} - ${testCase.criteria.maxArea || 'No limit'}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${BASE_URL}/api/land-scraping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          location: testCase.location,
          criteria: testCase.criteria,
          aiAnalysis: true,
          email: 'pierpaolo.laurito@gmail.com'
        })
      });

      const duration = Date.now() - startTime;
      
      console.log(`⏱️  Durata: ${duration}ms`);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Errore Response: ${errorText}`);
        continue;
      }
      
      const results = await response.json();
      
      console.log(`✅ Success: ${results.success}`);
      
      if (results.data) {
        const lands = results.data.lands || [];
        console.log(`🏠 Terreni trovati: ${lands.length}`);
        
        if (lands.length > 0) {
          console.log(`📋 Primi 3 risultati:`);
          lands.slice(0, 3).forEach((land, index) => {
            console.log(`   ${index + 1}. ${land.title}`);
            console.log(`      💰 €${land.price?.toLocaleString() || 'N/A'}`);
            console.log(`      📐 ${land.area || 'N/A'}m²`);
            console.log(`      🔗 ${land.url || 'N/A'}`);
            console.log(`      📍 ${land.location || 'N/A'}`);
          });
        } else {
          console.log(`❌ PROBLEMA: 0 terreni trovati nonostante parametri larghissimi!`);
        }
      } else {
        console.log(`❌ PROBLEMA: Nessun data nei risultati!`);
        console.log(`📄 Response:`, JSON.stringify(results, null, 2));
      }
      
    } catch (error) {
      console.log(`❌ Errore: ${error.message}`);
      console.log(`🔍 Stack: ${error.stack}`);
    }
    
    // Pausa tra i test
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🏁 Test completato!');
}

// Esegui il test
testMarketIntelligence().catch(console.error);
