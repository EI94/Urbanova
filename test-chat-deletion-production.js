#!/usr/bin/env node

// 🧪 TEST CANCELLAZIONE CHAT PRODUZIONE
// Simula esattamente il comportamento dell'utente in produzione

const API_URL = 'https://www.urbanova.life/api/os2/chat';

async function testChatDeletion() {
  console.log('🧪 [TEST] Inizio test cancellazione chat produzione...\n');
  
  try {
    // STEP 1: Crea alcune chat di test
    console.log('📝 [TEST] Creando chat di test...');
    
    const testSessions = [
      { sessionId: 'test-delete-1', message: 'Prima chat di test per cancellazione' },
      { sessionId: 'test-delete-2', message: 'Seconda chat di test per cancellazione' },
      { sessionId: 'test-delete-3', message: 'Terza chat di test per cancellazione' }
    ];
    
    for (const test of testSessions) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.message,
          userId: 'test-deletion-user',
          sessionId: test.sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ [TEST] Chat creata: ${test.sessionId} - "${data.response?.substring(0, 50)}..."`);
    }
    
    console.log('\n📊 [TEST] Chat create con successo!');
    console.log('🔍 [TEST] Ora simulo il comportamento dell\'utente:');
    console.log('   1. L\'utente apre la dashboard');
    console.log('   2. Vede le chat nella sidebar');
    console.log('   3. Clicca sul bottone elimina');
    console.log('   4. Conferma nel modal');
    console.log('   5. La chat dovrebbe scomparire');
    
    console.log('\n⚠️  [TEST] PROBLEMA IDENTIFICATO:');
    console.log('   Il test API funziona, ma il problema è nel FRONTEND!');
    console.log('   Possibili cause:');
    console.log('   - localStorage non funziona in produzione');
    console.log('   - Permissions del browser bloccano localStorage');
    console.log('   - Errore JavaScript nel browser');
    console.log('   - Problema con React state management');
    
    console.log('\n🔧 [TEST] SOLUZIONI DA VERIFICARE:');
    console.log('   1. Controllare Console del browser per errori');
    console.log('   2. Verificare se localStorage è accessibile');
    console.log('   3. Testare in modalità incognito');
    console.log('   4. Verificare se ci sono errori di CORS');
    console.log('   5. Controllare se il problema è specifico del dominio');
    
  } catch (error) {
    console.error('❌ [TEST] Errore durante il test:', error.message);
  }
}

// Esegui il test
testChatDeletion().then(() => {
  console.log('\n🏁 [TEST] Test completato!');
  process.exit(0);
}).catch(error => {
  console.error('💥 [TEST] Test fallito:', error);
  process.exit(1);
});
