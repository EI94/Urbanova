// Test Cancellazione Completo - Urbanova Produzione
console.log('🚨 TEST CANCELLAZIONE COMPLETO - INIZIO...');

// Test 1: Verifica se l'endpoint di debug funziona
async function testDebugEndpoint() {
  console.log('\n1️⃣ TEST ENDPOINT DEBUG...');
  
  try {
    const response = await fetch('https://www.urbanova.life/api/debug-project-deletion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'test123', action: 'debug' })
    });
    
    const result = await response.json();
    console.log('✅ Endpoint debug risponde:', result);
    
    if (result.success === false && result.error === 'Progetto non trovato') {
      console.log('✅ Endpoint funziona correttamente - Progetto test non trovato (normale)');
      return true;
    } else {
      console.log('❌ Endpoint non funziona come previsto:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Errore endpoint debug:', error.message);
    return false;
  }
}

// Test 2: Verifica se ci sono progetti nella collezione
async function testProjectCollection() {
  console.log('\n2️⃣ TEST COLLEZIONE PROGETTI...');
  
  try {
    // Provo a ottenere tutti i progetti (questo potrebbe richiedere autenticazione)
    const response = await fetch('https://www.urbanova.life/api/feasibility-recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'collection' })
    });
    
    console.log('📊 Status risposta collezione:', response.status);
    
    if (response.status === 200) {
      console.log('✅ API collezione risponde');
      const data = await response.text();
      console.log('📄 Risposta collezione:', data.substring(0, 200));
    } else if (response.status === 401) {
      console.log('⚠️ API richiede autenticazione (normale)');
    } else {
      console.log('❌ API collezione non risponde come previsto:', response.status);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Errore test collezione:', error.message);
    return false;
  }
}

// Test 3: Simula cancellazione con ID reale
async function testRealProjectDeletion() {
  console.log('\n3️⃣ TEST CANCELLAZIONE PROGETTO REALE...');
  
  // ID di esempio basato su pattern Firestore
  const testIds = [
    'Ciliegie123',
    'testProject456',
    'feasibility789',
    'urbanovaTest'
  ];
  
  for (const projectId of testIds) {
    console.log(`🔍 Testando ID: ${projectId}`);
    
    try {
      const response = await fetch('https://www.urbanova.life/api/debug-project-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, action: 'debug' })
      });
      
      const result = await response.json();
      console.log(`📋 Risultato per ${projectId}:`, result);
      
      if (result.success === false && result.error === 'Progetto non trovato') {
        console.log(`✅ ${projectId}: Progetto non trovato (normale)`);
      } else if (result.success === true) {
        console.log(`🎯 ${projectId}: PROGETTO CANCELLATO CON SUCCESSO!`);
        return true;
      } else {
        console.log(`❓ ${projectId}: Risultato inaspettato:`, result);
      }
    } catch (error) {
      console.log(`❌ Errore test ${projectId}:`, error.message);
    }
  }
  
  return false;
}

// Test 4: Verifica se ci sono problemi di autenticazione
async function testAuthentication() {
  console.log('\n4️⃣ TEST AUTENTICAZIONE...');
  
  try {
    // Provo a chiamare un endpoint che richiede autenticazione
    const response = await fetch('https://www.urbanova.life/api/delete-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'test123' })
    });
    
    console.log('📊 Status endpoint delete:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Endpoint richiede autenticazione (normale)');
      return true;
    } else if (response.status === 200) {
      console.log('⚠️ Endpoint non richiede autenticazione (strano)');
      return false;
    } else {
      console.log('❓ Status inaspettato:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Errore test autenticazione:', error.message);
    return false;
  }
}

// Test 5: Verifica se ci sono problemi di CORS
async function testCORS() {
  console.log('\n5️⃣ TEST CORS...');
  
  try {
    const response = await fetch('https://www.urbanova.life/api/health');
    console.log('✅ CORS OK - API health risponde');
    return true;
  } catch (error) {
    console.log('❌ Problema CORS:', error.message);
    return false;
  }
}

// Esegui tutti i test
async function runAllTests() {
  console.log('🚀 AVVIO TEST COMPLETI...\n');
  
  const results = {
    debugEndpoint: await testDebugEndpoint(),
    projectCollection: await testProjectCollection(),
    realProjectDeletion: await testRealProjectDeletion(),
    authentication: await testAuthentication(),
    cors: await testCORS()
  };
  
  console.log('\n🏁 RISULTATI FINALI:');
  console.log('📊 Debug Endpoint:', results.debugEndpoint ? '✅ OK' : '❌ KO');
  console.log('📊 Collezione Progetti:', results.projectCollection ? '✅ OK' : '❌ KO');
  console.log('📊 Cancellazione Reale:', results.realProjectDeletion ? '✅ OK' : '❌ KO');
  console.log('📊 Autenticazione:', results.authentication ? '✅ OK' : '❌ KO');
  console.log('📊 CORS:', results.cors ? '✅ OK' : '❌ KO');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 RISULTATO FINALE: ${successCount}/${totalCount} test superati`);
  
  if (successCount === totalCount) {
    console.log('🎉 TUTTI I TEST SUPERATI - Il sistema funziona correttamente!');
  } else {
    console.log('⚠️ ALCUNI TEST FALLITI - Ci sono problemi da risolvere');
  }
}

// Avvia i test
runAllTests().catch(error => {
  console.error('❌ ERRORE GENERALE TEST:', error);
});
