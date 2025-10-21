// Test Sofia - Multi-Progetto (il caso che falliva prima)

const API_URL = 'http://localhost:3112/api/os2/chat';

async function testSofia() {
  console.log('\n👤 TEST SOFIA - MULTI-PROGETTO\n');
  
  const userId = 'sofia-test';
  const sessionId = `session-${Date.now()}`;
  
  const send = async (msg) => {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, userId, sessionId })
    }).then(r => r.json());
    console.log(`"${msg.substring(0, 50)}" → "${r.response.substring(0, 70)}..."`);
    await new Promise(r => setTimeout(r, 1500));
    return r.response;
  };
  
  await send('Gestisco 3 progetti: Roma 10u, Milano 5 negozi, Torino mixed');
  await send('Analisi progetto Roma');
  const roma = await send('Passa a Milano');
  const milano = await send('Business plan Milano');
  const recall = await send('Torna a Roma, quali erano i numeri?');
  
  console.log(`\n📊 Memory Recall: ${recall.includes('10') || recall.includes('Roma') ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Risposta: "${recall.substring(0, 100)}..."\n`);
}

testSofia().catch(console.error);
