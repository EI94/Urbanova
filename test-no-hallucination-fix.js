#!/usr/bin/env node

/**
 * Test per verificare che l'OS NON allucini più analisi fattibilità finta
 * e che esegua realmente l'analisi quando l'utente fornisce dati completi
 */

const API_URL = 'http://localhost:3112/api/os2/chat';

async function testRealFeasibilityAnalysis() {
  console.log('🧪 [TEST] Verifica che OS esegua analisi REALE invece di allucinare\n');
  
  const testMessage = `Voglio che mi aiuti a fare un analisi di fattibilità del progetto Ciliegie 30 a Roma. E' un progetto incredibile: 240 mq edificabili. Stimiamo di fare 4 villette da 112 mq ciascuna. Ti dico che conto di vendere ogni villetta a 390k e realizzare a 250k ogni villetta.`;
  
  try {
    console.log('📤 [TEST] Invio messaggio con dati completi...');
    console.log(`   Messaggio: "${testMessage.substring(0, 100)}..."`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        sessionId: 'test-real-analysis-' + Date.now(),
        userId: 'test-user',
        userEmail: 'test@example.com'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('\n📥 [TEST] Risposta ricevuta:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Response Length: ${result.response?.length || 0} chars`);
    console.log(`   Reasoning: ${result.reasoning}`);
    
    // Verifica che NON contenga dati finti
    const responseText = result.response?.toLowerCase() || '';
    const hasFakeData = 
      responseText.includes('roi: n/a') ||
      responseText.includes('margine: n/a') ||
      responseText.includes('undefined') ||
      responseText.includes('nan');
    
    // Verifica che contenga dati reali
    const hasRealData = 
      responseText.includes('roi:') && !responseText.includes('n/a') ||
      responseText.includes('margine:') && !responseText.includes('n/a') ||
      responseText.includes('fattibilità:') ||
      responseText.includes('analisi per terreno');
    
    console.log('\n🔍 [TEST] Analisi risposta:');
    console.log(`   Contiene dati finti (N/A, undefined): ${hasFakeData}`);
    console.log(`   Contiene dati reali: ${hasRealData}`);
    console.log(`   Risposta completa: ${result.response}`);
    
    if (!hasFakeData && hasRealData) {
      console.log('\n✅ [TEST] SUCCESS: OS ha eseguito analisi REALE senza allucinare!');
      return true;
    } else if (hasFakeData) {
      console.log('\n❌ [TEST] FAILED: OS sta ancora allucinando dati finti!');
      return false;
    } else {
      console.log('\n⚠️ [TEST] WARNING: OS non ha eseguito analisi fattibilità');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ [TEST] ERRORE:', error.message);
    return false;
  }
}

async function testGenericRequest() {
  console.log('\n🧪 [TEST] Verifica comportamento con richiesta generica\n');
  
  const genericMessage = "Puoi aiutarmi con l'analisi di fattibilità?";
  
  try {
    console.log('📤 [TEST] Invio richiesta generica...');
    console.log(`   Messaggio: "${genericMessage}"`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: genericMessage,
        sessionId: 'test-generic-' + Date.now(),
        userId: 'test-user',
        userEmail: 'test@example.com'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('\n📥 [TEST] Risposta ricevuta:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Response: ${result.response}`);
    
    // Verifica che sia una risposta collaborativa (non tool activation)
    const responseText = result.response?.toLowerCase() || '';
    const isCollaborative = 
      responseText.includes('posso aiutarti') ||
      responseText.includes('dimmi') ||
      responseText.includes('informazioni') ||
      responseText.includes('parametri') ||
      responseText.includes('per fare');
    
    console.log('\n🔍 [TEST] Analisi risposta:');
    console.log(`   È risposta collaborativa: ${isCollaborative}`);
    
    if (isCollaborative) {
      console.log('\n✅ [TEST] SUCCESS: OS ha risposto collaborativamente per richiesta generica!');
      return true;
    } else {
      console.log('\n⚠️ [TEST] WARNING: OS potrebbe aver attivato tool per richiesta generica');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ [TEST] ERRORE:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 [TEST SUITE] Test Fix Critico - No More Hallucination\n');
  console.log('=' .repeat(60));
  
  const test1 = await testRealFeasibilityAnalysis();
  const test2 = await testGenericRequest();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 [RISULTATI FINALI]:');
  console.log(`   Test 1 - Analisi reale (no hallucination): ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Test 2 - Richiesta generica: ${test2 ? '✅ PASS' : '⚠️ WARN'}`);
  
  if (test1) {
    console.log('\n🎉 [SUCCESS] Il fix critico funziona! L\'OS ora esegue analisi REALE invece di allucinare dati finti.');
    console.log('   Gli utenti possono finalmente fidarsi dei risultati di Urbanova!');
  } else {
    console.log('\n❌ [FAILED] Il fix non funziona. L\'OS sta ancora allucinando dati finti.');
    console.log('   Questo è un problema critico per la fiducia degli utenti!');
  }
}

// Esegui i test
runTests().catch(console.error);
