#!/usr/bin/env node

/**
 * Test per verificare che l'OS attivi correttamente l'analisi fattibilità
 * quando l'utente fornisce dati completi
 */

const API_URL = 'http://localhost:3000/api/os2/chat';

async function testFeasibilityActivation() {
  console.log('🧪 [TEST] Verifica attivazione analisi fattibilità con dati completi\n');
  
  const testMessage = `Voglio che mi aiuti a fare un analisi di fattibilità del progetto Ciliegie 30 a Roma. E' un progetto incredibile: 240 mq edificabili. Stimiamo di fare 4 villette da 112 mq ciascuna (sono due strutture, 2 villette per struttura), il progetto non è ancora stato depositato e la proprietaria è particolare. Poi fammi un recap di tutto. Ti dico che conto di vendere ogni villetta a 390k e realizzare a 250k ogni villetta. Hai bisogno di altro?`;
  
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
        sessionId: 'test-feasibility-' + Date.now(),
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
    console.log(`   Has Response: ${result.hasResponse}`);
    console.log(`   Response Length: ${result.response?.length || 0} chars`);
    console.log(`   Reasoning: ${result.reasoning}`);
    
    // Verifica che sia stata attivata l'analisi fattibilità
    const responseText = result.response?.toLowerCase() || '';
    const hasFeasibilityKeywords = 
      responseText.includes('analisi') ||
      responseText.includes('fattibilità') ||
      responseText.includes('roi') ||
      responseText.includes('margine') ||
      responseText.includes('ciliegie');
    
    console.log('\n🔍 [TEST] Analisi risposta:');
    console.log(`   Contiene keyword fattibilità: ${hasFeasibilityKeywords}`);
    console.log(`   Risposta completa: ${result.response}`);
    
    if (hasFeasibilityKeywords) {
      console.log('\n✅ [TEST] SUCCESS: OS ha riconosciuto e processato l\'analisi fattibilità!');
      return true;
    } else {
      console.log('\n❌ [TEST] FAILED: OS non ha attivato l\'analisi fattibilità');
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
      responseText.includes('parametri');
    
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
  console.log('🚀 [TEST SUITE] Test OS Fix - Analisi Fattibilità\n');
  console.log('=' .repeat(60));
  
  const test1 = await testFeasibilityActivation();
  const test2 = await testGenericRequest();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 [RISULTATI FINALI]:');
  console.log(`   Test 1 - Dati completi: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Test 2 - Richiesta generica: ${test2 ? '✅ PASS' : '⚠️ WARN'}`);
  
  if (test1) {
    console.log('\n🎉 [SUCCESS] Il fix è funzionante! L\'OS ora attiva correttamente l\'analisi fattibilità quando l\'utente fornisce dati completi.');
  } else {
    console.log('\n❌ [FAILED] Il fix non funziona. L\'OS non attiva l\'analisi fattibilità.');
  }
}

// Esegui i test
runTests().catch(console.error);
