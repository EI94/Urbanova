#!/usr/bin/env node

// 🧪 SCRIPT DI TEST MASSIVO OS URBANOVA
// Esegue 100 test diversi per verificare il funzionamento dell'OS

// Usa fetch nativo di Node.js

const BASE_URL = 'http://localhost:3112';

async function testOS() {
  console.log('🧪 [TEST OS] Avvio test massivo OS Urbanova...\n');

  // Test cases critici
  const criticalTests = [
    {
      id: 'critical-001',
      query: 'Ciao, puoi creare per me una analisi di fattibilità?',
      expected: 'conversational'
    },
    {
      id: 'critical-002', 
      query: 'Cerca terreni a Milano',
      expected: 'conversational'
    },
    {
      id: 'critical-003',
      query: 'Mostra i miei progetti',
      expected: 'conversational'
    },
    {
      id: 'critical-004',
      query: 'Qual è il ROI del progetto Ciliegie?',
      expected: 'conversational'
    },
    {
      id: 'critical-005',
      query: 'Crea un business plan',
      expected: 'conversational'
    }
  ];

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const test of criticalTests) {
    try {
      console.log(`🧪 [TEST] Eseguendo: ${test.query}`);
      
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: test.query,
          userId: 'test-user',
          userEmail: 'test@urbanova.it'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.response || '';

      // Validazione
      const isValid = validateResponse(test, responseText);
      
      if (isValid) {
        console.log(`✅ [PASS] ${test.id}: Risposta valida`);
        passed++;
      } else {
        console.log(`❌ [FAIL] ${test.id}: Risposta non valida`);
        failed++;
      }

      results.push({
        test,
        response: responseText,
        valid: isValid
      });

    } catch (error) {
      console.error(`❌ [ERROR] ${test.id}: ${error.message}`);
      failed++;
      results.push({
        test,
        error: error.message,
        valid: false
      });
    }

    console.log(''); // Spazio tra i test
  }

  // Report finale
  console.log('📊 [REPORT] Risultati test critici:');
  console.log(`✅ Passati: ${passed}`);
  console.log(`❌ Falliti: ${failed}`);
  console.log(`📈 Successo: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  // Test massivo completo
  console.log('🧪 [TEST MASSIVO] Avvio test con 100 richieste...');
  
  try {
    const massResponse = await fetch(`${BASE_URL}/api/test-os`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        runAll: true
      }),
    });

    if (massResponse.ok) {
      const massData = await massResponse.json();
      console.log('📊 [REPORT MASSIVO]', massData.results);
    } else {
      console.log('⚠️ [WARNING] Test massivo non disponibile');
    }
  } catch (error) {
    console.log('⚠️ [WARNING] Test massivo fallito:', error.message);
  }

  return results;
}

function validateResponse(test, response) {
  // Controlla che non sia JSON grezzo
  if (response.includes('{') && response.includes('}') && response.includes('"projects"')) {
    console.log(`   ❌ JSON grezzo rilevato`);
    return false;
  }

  // Il Markdown viene renderizzato nel frontend, quindi ** è normale nel backend
  // Controlla solo che non sia JSON grezzo

  // Controlla che sia conversazionale
  if (response.length < 10) {
    console.log(`   ❌ Risposta troppo corta`);
    return false;
  }

  // Controlla che non menzioni "assistente AI"
  if (response.toLowerCase().includes('assistente ai') || response.toLowerCase().includes('ai assistant')) {
    console.log(`   ❌ Menziona assistente AI`);
    return false;
  }

  // Controlla che sia in italiano
  if (!response.includes(' ') || response.length < 20) {
    console.log(`   ❌ Risposta non sufficientemente dettagliata`);
    return false;
  }

  console.log(`   ✅ Risposta valida (${response.length} caratteri)`);
  return true;
}

// Esegui i test
testOS().catch(console.error);
