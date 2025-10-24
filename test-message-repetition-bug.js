#!/usr/bin/env node

/**
 * Test per riprodurre il bug di ripetizione messaggio utente
 * e verificare che l'OS esegua l'analisi fattibilità
 */

const API_URL = 'http://localhost:3112/api/os2/chat';

async function testMessageRepetitionBug() {
  console.log('🧪 [TEST] Riproduzione bug: OS ripete messaggio utente\n');
  
  const testMessage = `Senti, io voglio che tu mi aiuti a fare un'analisi di fattibilità. Ho un terreno in via Ciliegie a Roma, 240 metri quadrati. Sono un terreno interessante. Io conto di vendere quelle quattro villette che penso di fare su quel terreno a 395.000 euro l'una. Il costo per realizzarle è di 250.000 euro l'una. Facciamo un costo totale, un ricavo totale sempre per singola villetta. Aiutami a fare un'analisi di fattibilità. Se ti servono altri dati, te li invio.`;
  
  try {
    console.log('📤 [TEST] Invio messaggio identico a quello dell\'utente...');
    console.log(`   Messaggio: "${testMessage.substring(0, 100)}..."`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        sessionId: 'pierpaolo.laurito@gmail.com-test-' + Date.now(),
        userId: 'pierpaolo.laurito@gmail.com',
        userEmail: 'pierpaolo.laurito@gmail.com'
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
    
    // Verifica se l'OS sta ripetendo il messaggio
    const responseText = result.response || '';
    const isRepeatingMessage = responseText === testMessage;
    
    // Verifica se l'OS ha eseguito l'analisi fattibilità
    const hasFeasibilityAnalysis = 
      responseText.includes('analisi') ||
      responseText.includes('fattibilità') ||
      responseText.includes('roi') ||
      responseText.includes('margine') ||
      responseText.includes('ciliegie') ||
      responseText.includes('roma');
    
    console.log('\n🔍 [TEST] Analisi risposta:');
    console.log(`   OS sta ripetendo il messaggio: ${isRepeatingMessage}`);
    console.log(`   OS ha eseguito analisi fattibilità: ${hasFeasibilityAnalysis}`);
    console.log(`   Risposta completa: ${result.response}`);
    
    if (isRepeatingMessage) {
      console.log('\n❌ [TEST] BUG CONFERMATO: OS sta ripetendo esattamente il messaggio dell\'utente!');
      return false;
    } else if (hasFeasibilityAnalysis) {
      console.log('\n✅ [TEST] SUCCESS: OS ha eseguito l\'analisi fattibilità correttamente!');
      return true;
    } else {
      console.log('\n⚠️ [TEST] WARNING: OS non ha eseguito l\'analisi fattibilità');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ [TEST] ERRORE:', error.message);
    return false;
  }
}

async function testTTSAPI() {
  console.log('\n🧪 [TEST] Verifica API TTS\n');
  
  try {
    console.log('📤 [TEST] Test API TTS...');
    
    const response = await fetch('http://localhost:3112/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Test sintesi vocale',
        voice: 'nova',
        speed: 1.0
      })
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   Success: ${result.success}`);
      console.log(`   Audio Length: ${result.audio?.length || 0} chars`);
      console.log('\n✅ [TEST] SUCCESS: API TTS funziona correttamente!');
      return true;
    } else {
      const error = await response.text();
      console.log(`   Error: ${error}`);
      console.log('\n❌ [TEST] FAILED: API TTS non funziona!');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ [TEST] ERRORE TTS:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 [TEST SUITE] Bug Analysis - Message Repetition\n');
  console.log('=' .repeat(60));
  
  const test1 = await testMessageRepetitionBug();
  const test2 = await testTTSAPI();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 [RISULTATI FINALI]:');
  console.log(`   Test 1 - Bug ripetizione messaggio: ${test1 ? '✅ FIXED' : '❌ BUG CONFERMATO'}`);
  console.log(`   Test 2 - API TTS: ${test2 ? '✅ WORKING' : '❌ BROKEN'}`);
  
  if (!test1) {
    console.log('\n🚨 [CRITICAL BUG] L\'OS sta ripetendo il messaggio dell\'utente invece di eseguire l\'analisi fattibilità!');
    console.log('   Questo è un bug critico che impedisce il funzionamento corretto del sistema.');
  } else {
    console.log('\n🎉 [SUCCESS] Il bug è stato risolto! L\'OS ora funziona correttamente.');
  }
}

// Esegui i test
runTests().catch(console.error);
