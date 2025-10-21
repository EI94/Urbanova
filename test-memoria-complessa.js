// Test scenari complessi memoria RAG

const API_URL = 'http://localhost:3112/api/os2/chat';

const SCENARI = [
  {
    nome: 'Multi-Progetto con Switch',
    test: async (userId, sessionId) => {
      console.log('\n📋 SCENARIO 1: Multi-Progetto');
      
      await send(userId, sessionId, 'Progetto A Roma 10 unità budget 2M');
      await sleep(1000);
      await send(userId, sessionId, 'Progetto B Milano 15 negozi budget 3.5M');
      await sleep(1000);
      const r1 = await send(userId, sessionId, 'Torna al progetto Roma, quante unità erano?');
      
      return r1.includes('10');
    }
  },
  {
    nome: 'Digression Profonda poi Recall',
    test: async (userId, sessionId) => {
      console.log('\n📋 SCENARIO 2: Digression Profonda');
      
      await send(userId, sessionId, 'Torre Verde Napoli 25 unità luxury budget 5M');
      await sleep(1000);
      await send(userId, sessionId, 'Come funziona mercato immobiliare Italia?');
      await sleep(1000);
      await send(userId, sessionId, 'E i tassi interesse?');
      await sleep(1000);
      await send(userId, sessionId, 'Quali sono tendenze 2025?');
      await sleep(1000);
      const r1 = await send(userId, sessionId, 'Torniamo alla torre, qual era il budget?');
      
      return r1.includes('5M') || r1.includes('5 milioni');
    }
  },
  {
    nome: 'Parametri Tecnici Recall',
    test: async (userId, sessionId) => {
      console.log('\n📋 SCENARIO 3: Parametri Tecnici');
      
      await send(userId, sessionId, 'Firenze 5000 mq, indice 0.8, altezza max 18m, 15 unità 80 mq, costo costruzione 1350 €/mq, vendita 3200 €/mq, terreno 400k');
      await sleep(1000);
      await send(userId, sessionId, 'Facciamo altra cosa');
      await sleep(1000);
      const r1 = await send(userId, sessionId, 'Torna a Firenze, qual era il prezzo terreno e il costo costruzione?');
      
      return r1.includes('400') && r1.includes('1350');
    }
  },
  {
    nome: 'Long Session Memory',
    test: async (userId, sessionId) => {
      console.log('\n📋 SCENARIO 4: Long Session');
      
      await send(userId, sessionId, 'Palazzo Blu Bologna 12 unità budget 2.8M');
      await sleep(1000);
      
      // 10 messaggi di "rumore"
      for (let i = 0; i < 10; i++) {
        await send(userId, sessionId, `Messaggio rumore ${i+1}`);
        await sleep(500);
      }
      
      const r1 = await send(userId, sessionId, 'Ricordi il progetto Bologna? Nome e budget?');
      
      return r1.includes('Palazzo Blu') && (r1.includes('2.8M') || r1.includes('2.8 milioni'));
    }
  },
  {
    nome: 'Update Dati Progetto',
    test: async (userId, sessionId) => {
      console.log('\n📋 SCENARIO 5: Update Dati');
      
      await send(userId, sessionId, 'Villa Rosa Torino 8 unità budget 1.5M');
      await sleep(1000);
      await send(userId, sessionId, 'Cambio: 10 unità invece di 8');
      await sleep(1000);
      await send(userId, sessionId, 'Budget aumentato a 2M');
      await sleep(1000);
      const r1 = await send(userId, sessionId, 'Villa Rosa ora quante unità e budget?');
      
      return r1.includes('10') && (r1.includes('2M') || r1.includes('2 milioni'));
    }
  }
];

async function send(userId, sessionId, message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId, message })
  }).then(r => r.json());
  
  console.log(`   "${message.substring(0, 50)}" → "${response.response?.substring(0, 60)}..."`);
  return response.response || '';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n🧪 TEST MEMORIA COMPLESSA - 5 SCENARI\n');
  
  let passed = 0;
  
  for (const scenario of SCENARI) {
    const userId = `test-${Date.now()}`;
    const sessionId = `session-${Date.now()}`;
    
    try {
      const result = await scenario.test(userId, sessionId);
      console.log(`   ${result ? '✅ PASSED' : '❌ FAILED'}\n`);
      if (result) passed++;
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
    }
    
    await sleep(2000);
  }
  
  console.log(`\n📊 RISULTATI: ${passed}/${SCENARI.length} scenari passed (${(passed/SCENARI.length*100).toFixed(0)}%)\n`);
  
  if (passed === SCENARI.length) {
    console.log('🎉 MEMORIA RAG PERFETTAMENTE FUNZIONANTE!\n');
  } else {
    console.log(`⚠️  ${SCENARI.length - passed} scenari falliti, richiede ulteriore debug\n`);
  }
}

main().catch(console.error);
