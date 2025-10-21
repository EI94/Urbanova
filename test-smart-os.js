const axios = require('axios');

const API_URL = 'http://localhost:3112/api/os2/chat';
const USER_EMAIL = 'pierpaolo.laurito@gmail.com';

async function testSmartOS() {
  console.log('🚀 Test Urbanova OS 2.0 Smart System');
  console.log('=====================================');
  
  const testCases = [
    {
      name: 'Saluto semplice',
      message: 'Ciao',
      expectedSmart: true
    },
    {
      name: 'Richiesta Business Plan',
      message: 'Crea un business plan per un progetto residenziale',
      expectedSmart: true
    },
    {
      name: 'Richiesta Analisi Fattibilità',
      message: 'Analizza questo terreno a Roma',
      expectedSmart: true
    },
    {
      name: 'Richiesta Generale',
      message: 'Come posso aiutarti oggi?',
      expectedSmart: true
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Test: ${testCase.name}`);
    console.log(`📝 Messaggio: "${testCase.message}"`);
    
    try {
      const response = await axios.post(API_URL, {
        message: testCase.message,
        userId: 'test-user',
        userEmail: USER_EMAIL,
        sessionId: `test_${Date.now()}`,
      });
      
      const { success, response: responseText, smart, fallback, duration } = response.data;
      
      console.log(`✅ Successo: ${success}`);
      console.log(`🧠 Smart: ${smart}`);
      console.log(`🔄 Fallback: ${fallback}`);
      console.log(`⏱️ Durata: ${duration}ms`);
      console.log(`📄 Risposta: ${responseText ? responseText.substring(0, 100) + '...' : 'Nessuna risposta'}`);
      
      if (smart && !fallback) {
        console.log('✅ Test PASSATO: Sistema smart attivo');
      } else if (fallback) {
        console.log('⚠️ Test PARZIALE: Sistema smart fallback al tradizionale');
      } else {
        console.log('❌ Test FALLITO: Sistema smart non attivo');
      }
      
    } catch (error) {
      console.error(`❌ Errore test "${testCase.name}":`, error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
    }
    
    // Delay tra test
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 Test completati!');
}

testSmartOS().catch(console.error);
