// Test sui CASI CRITICI identificati

const API_URL = 'http://localhost:3112/api/os2/chat';

const CASI_CRITICI = [
  // Dai test - i più problematici
  {msg: "Quanto costa costruzione al mq?", expected: true},
  {msg: "Quale ha il miglior ROI?", expected: true},
  {msg: "Crea business plan per questo progetto", expected: true},
  {msg: "Calcola BP con finanziamento bancario", expected: true},
  {msg: "Mi serve DSCR e coverage ratios", expected: true},
  {msg: "Waterfall distribution con 3 partner", expected: true},
  {msg: "Questo ROI è buono?", expected: true},
  {msg: "Come trovo finanziamenti?", expected: true},
  {msg: "Quale conviene?", expected: true},
  {msg: "Ho 3 terreni: Milano, Roma, Bologna", expected: true},
  {msg: "E se non ho tutti i soldi?", expected: true},
  
  // Conversazionali (NO tool expected)
  {msg: "Grazie mille!", expected: false},
  {msg: "Come funziona Urbanova?", expected: false},
  {msg: "Cosa significa fattibilità?", expected: false},
];

async function test() {
  console.log('\n🔥 TEST TOOL ACTIVATION - CASI CRITICI\n');
  console.log('='.repeat(80));
  
  let correct = 0;
  let missed = 0;
  let unnecessary = 0;
  
  for (const caso of CASI_CRITICI) {
    const userId = `test-${Date.now()}`;
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: caso.msg, userId, sessionId: 'test'})
    }).then(r => r.json());
    
    const activated = (r.functionCalls && r.functionCalls.length > 0);
    
    if (caso.expected && activated) {
      console.log(`✅ "${caso.msg}"`);
      console.log(`   Tool: ${r.functionCalls[0].name}\n`);
      correct++;
    } else if (caso.expected && !activated) {
      console.log(`❌ MISSED: "${caso.msg}"`);
      console.log(`   Expected: tool, Got: conversational\n`);
      missed++;
    } else if (!caso.expected && activated) {
      console.log(`⚠️  UNNECESSARY: "${caso.msg}"`);
      console.log(`   Tool: ${r.functionCalls[0].name}\n`);
      unnecessary++;
    } else {
      console.log(`✅ "${caso.msg}" (conversational OK)\n`);
      correct++;
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('='.repeat(80));
  console.log(`\n📊 RISULTATI:\n`);
  console.log(`   ✅ Corretti: ${correct}/${CASI_CRITICI.length} (${(correct/CASI_CRITICI.length*100).toFixed(1)}%)`);
  console.log(`   ❌ Missed: ${missed}/${CASI_CRITICI.length}`);
  console.log(`   ⚠️  Unnecessary: ${unnecessary}/${CASI_CRITICI.length}`);
  
  const successRate = correct/CASI_CRITICI.length;
  
  if (successRate >= 0.95) {
    console.log('\n🎉 ECCELLENTE: Tool activation >95%!\n');
  } else if (successRate >= 0.85) {
    console.log('\n✅ OTTIMO: Tool activation >85%\n');
  } else if (successRate >= 0.75) {
    console.log('\n✅ BUONO: Tool activation >75%\n');
  } else {
    console.log('\n⚠️  DA MIGLIORARE: Tool activation <75%\n');
  }
}

test().catch(console.error);
