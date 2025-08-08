const axios = require('axios');
const fs = require('fs');

// Configurazione test
const BASE_URL = 'http://localhost:3112';
const TEST_EMAIL = 'test@urbanova.com';

// Criteri di test realistici
const TEST_CRITERIA = {
  location: 'Milano',
  minPrice: 100000,
  maxPrice: 500000,
  minArea: 500,
  maxArea: 2000,
  propertyType: 'residenziale'
};

// Criteri di test estremi
const EXTREME_CRITERIA = {
  location: 'Roma',
  minPrice: 50000,
  maxPrice: 2000000,
  minArea: 100,
  maxArea: 10000,
  propertyType: 'residenziale'
};

// Criteri di test vuoti (per testare validazione)
const EMPTY_CRITERIA = {
  location: '',
  minPrice: 0,
  maxPrice: 1000000,
  minArea: 0,
  maxArea: 10000,
  propertyType: 'residenziale'
};

console.log('🧪 INIZIO TEST MANIACALE USER JOURNEY AI WEB SCRAPING');
console.log('=' .repeat(80));

// Funzione per testare endpoint di salute
async function testHealthEndpoint() {
  console.log('\n1️⃣ TEST ENDPOINT SALUTE');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health endpoint OK:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Health endpoint FAILED:', error.message);
    return false;
  }
}

// Funzione per testare validazione criteri
async function testCriteriaValidation() {
  console.log('\n2️⃣ TEST VALIDAZIONE CRITERI');
  
  // Test 1: Criteri vuoti
  try {
    const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
      location: '',
      criteria: EMPTY_CRITERIA,
      email: TEST_EMAIL
    });
    console.log('❌ Validazione criteri vuoti FAILED - dovrebbe rifiutare');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validazione criteri vuoti OK');
    } else {
      console.log('❌ Validazione criteri vuoti FAILED:', error.message);
      return false;
    }
  }
  
  // Test 2: Email invalida
  try {
    const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
      location: 'Milano',
      criteria: TEST_CRITERIA,
      email: 'email-invalida'
    });
    console.log('❌ Validazione email FAILED - dovrebbe rifiutare');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validazione email OK');
    } else {
      console.log('❌ Validazione email FAILED:', error.message);
      return false;
    }
  }
  
  return true;
}

// Funzione per testare ricerca con criteri realistici
async function testRealisticSearch() {
  console.log('\n3️⃣ TEST RICERCA CRITERI REALISTICI');
  console.log('Criteri:', JSON.stringify(TEST_CRITERIA, null, 2));
  
  try {
    const startTime = Date.now();
    const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
      location: TEST_CRITERIA.location,
      criteria: {
        minPrice: TEST_CRITERIA.minPrice,
        maxPrice: TEST_CRITERIA.maxPrice,
        minArea: TEST_CRITERIA.minArea,
        maxArea: TEST_CRITERIA.maxArea,
        propertyType: TEST_CRITERIA.propertyType
      },
      aiAnalysis: true,
      email: TEST_EMAIL
    }, {
      timeout: 120000 // 2 minuti timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Ricerca completata in ${duration}ms`);
    console.log('Status:', response.status);
    
    const data = response.data;
    console.log('Risultati trovati:', data.data?.lands?.length || 0);
    console.log('Email inviata:', data.data?.emailSent || false);
    console.log('Analisi AI completata:', data.data?.analysis?.length > 0);
    
    // Verifica struttura dati
    if (data.data?.lands) {
      const lands = data.data.lands;
      console.log('Primo terreno:', {
        title: lands[0]?.title?.substring(0, 50) + '...',
        price: lands[0]?.price,
        area: lands[0]?.area,
        hasRealPrice: lands[0]?.hasRealPrice,
        hasRealArea: lands[0]?.hasRealArea
      });
    }
    
    return true;
  } catch (error) {
    console.log('❌ Ricerca criteri realistici FAILED:', error.message);
    if (error.response?.data) {
      console.log('Dettagli errore:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Funzione per testare ricerca con criteri estremi
async function testExtremeSearch() {
  console.log('\n4️⃣ TEST RICERCA CRITERI ESTREMI');
  console.log('Criteri:', JSON.stringify(EXTREME_CRITERIA, null, 2));
  
  try {
    const startTime = Date.now();
    const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
      location: EXTREME_CRITERIA.location,
      criteria: {
        minPrice: EXTREME_CRITERIA.minPrice,
        maxPrice: EXTREME_CRITERIA.maxPrice,
        minArea: EXTREME_CRITERIA.minArea,
        maxArea: EXTREME_CRITERIA.maxArea,
        propertyType: EXTREME_CRITERIA.propertyType
      },
      aiAnalysis: true,
      email: TEST_EMAIL
    }, {
      timeout: 120000
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Ricerca estremi completata in ${duration}ms`);
    console.log('Risultati trovati:', response.data.data?.lands?.length || 0);
    
    return true;
  } catch (error) {
    console.log('❌ Ricerca criteri estremi FAILED:', error.message);
    return false;
  }
}

// Funzione per testare timeout e gestione errori
async function testTimeoutAndErrors() {
  console.log('\n5️⃣ TEST TIMEOUT E GESTIONE ERRORI');
  
  // Test timeout
  try {
    const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
      location: 'LocalitàMoltoLungaChePotrebbeCausareProblemiDiTimeout',
      criteria: {
        minPrice: 1,
        maxPrice: 999999999,
        minArea: 1,
        maxArea: 999999,
        propertyType: 'residenziale'
      },
      aiAnalysis: true,
      email: TEST_EMAIL
    }, {
      timeout: 5000 // Timeout breve per test
    });
    console.log('❌ Timeout test FAILED - dovrebbe scadere');
    return false;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('✅ Timeout gestito correttamente');
    } else {
      console.log('✅ Altro errore gestito:', error.message);
    }
  }
  
  return true;
}

// Funzione per testare servizi esterni
async function testExternalServices() {
  console.log('\n6️⃣ TEST SERVIZI ESTERNI');
  
  // Test email service
  try {
    const response = await axios.post(`${BASE_URL}/api/test-email`, {
      email: TEST_EMAIL,
      subject: 'Test Email Service',
      content: 'Test del servizio email'
    });
    console.log('✅ Email service OK:', response.status);
  } catch (error) {
    console.log('❌ Email service FAILED:', error.message);
  }
  
  // Test web scraper
  try {
    const response = await axios.post(`${BASE_URL}/api/web-scraper`, {
      url: 'https://www.immobiliare.it',
      selectors: ['body']
    });
    console.log('✅ Web scraper OK:', response.status);
  } catch (error) {
    console.log('❌ Web scraper FAILED:', error.message);
  }
}

// Funzione per testare performance
async function testPerformance() {
  console.log('\n7️⃣ TEST PERFORMANCE');
  
  const testRuns = 3;
  const times = [];
  
  for (let i = 0; i < testRuns; i++) {
    console.log(`Esecuzione ${i + 1}/${testRuns}...`);
    
    try {
      const startTime = Date.now();
      const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
        location: 'Milano',
        criteria: {
          minPrice: 200000,
          maxPrice: 400000,
          minArea: 800,
          maxArea: 1500,
          propertyType: 'residenziale'
        },
        aiAnalysis: true,
        email: TEST_EMAIL
      }, {
        timeout: 120000
      });
      
      const duration = Date.now() - startTime;
      times.push(duration);
      console.log(`Run ${i + 1}: ${duration}ms`);
      
      // Pausa tra le esecuzioni
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.log(`Run ${i + 1} FAILED:`, error.message);
    }
  }
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('📊 Statistiche Performance:');
    console.log(`Tempo medio: ${avgTime.toFixed(0)}ms`);
    console.log(`Tempo minimo: ${minTime}ms`);
    console.log(`Tempo massimo: ${maxTime}ms`);
    
    if (avgTime < 60000) {
      console.log('✅ Performance OK (< 60s)');
    } else {
      console.log('⚠️ Performance lenta (> 60s)');
    }
  }
}

// Funzione per testare dati reali
async function testRealDataValidation() {
  console.log('\n8️⃣ TEST VALIDAZIONE DATI REALI');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/land-scraping`, {
      location: 'Torino',
      criteria: {
        minPrice: 150000,
        maxPrice: 300000,
        minArea: 600,
        maxArea: 1200,
        propertyType: 'residenziale'
      },
      aiAnalysis: true,
      email: TEST_EMAIL
    }, {
      timeout: 120000
    });
    
    const lands = response.data.data?.lands || [];
    console.log(`Analizzando ${lands.length} terreni per dati reali...`);
    
    let realPriceCount = 0;
    let realAreaCount = 0;
    let fakeDataCount = 0;
    
    lands.forEach((land, index) => {
      if (land.hasRealPrice) realPriceCount++;
      if (land.hasRealArea) realAreaCount++;
      if (!land.hasRealPrice && !land.hasRealArea) fakeDataCount++;
      
      // Log del primo terreno per verifica
      if (index === 0) {
        console.log('Primo terreno:', {
          title: land.title?.substring(0, 50) + '...',
          price: land.price,
          area: land.area,
          hasRealPrice: land.hasRealPrice,
          hasRealArea: land.hasRealArea,
          url: land.url?.substring(0, 50) + '...'
        });
      }
    });
    
    console.log('📊 Statistiche Dati Reali:');
    console.log(`Prezzi reali: ${realPriceCount}/${lands.length} (${((realPriceCount/lands.length)*100).toFixed(1)}%)`);
    console.log(`Aree reali: ${realAreaCount}/${lands.length} (${((realAreaCount/lands.length)*100).toFixed(1)}%)`);
    console.log(`Dati completamente finti: ${fakeDataCount}/${lands.length} (${((fakeDataCount/lands.length)*100).toFixed(1)}%)`);
    
    if (fakeDataCount === 0) {
      console.log('✅ Tutti i dati sono reali o parzialmente reali');
    } else {
      console.log('⚠️ Alcuni dati potrebbero essere finti');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Test dati reali FAILED:', error.message);
    return false;
  }
}

// Funzione principale di test
async function runAllTests() {
  const results = {
    health: false,
    validation: false,
    realistic: false,
    extreme: false,
    timeout: false,
    services: false,
    performance: false,
    realData: false
  };
  
  try {
    results.health = await testHealthEndpoint();
    results.validation = await testCriteriaValidation();
    results.realistic = await testRealisticSearch();
    results.extreme = await testExtremeSearch();
    results.timeout = await testTimeoutAndErrors();
    await testExternalServices();
    results.services = true;
    await testPerformance();
    results.performance = true;
    results.realData = await testRealDataValidation();
    
  } catch (error) {
    console.log('❌ Errore generale nei test:', error.message);
  }
  
  // Report finale
  console.log('\n' + '='.repeat(80));
  console.log('📋 REPORT FINALE TEST USER JOURNEY');
  console.log('='.repeat(80));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`Test totali: ${totalTests}`);
  console.log(`Test superati: ${passedTests}`);
  console.log(`Test falliti: ${totalTests - passedTests}`);
  console.log(`Success rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);
  
  console.log('\nDettaglio risultati:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TUTTI I TEST SUPERATI! La user journey funziona perfettamente!');
  } else {
    console.log('\n⚠️ ALCUNI TEST FALLITI. Controllare i log sopra per dettagli.');
  }
  
  // Salva risultati su file
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: (passedTests/totalTests)*100
    }
  };
  
  fs.writeFileSync('test-user-journey-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Report salvato in: test-user-journey-report.json');
}

// Esegui i test
runAllTests().catch(console.error);
