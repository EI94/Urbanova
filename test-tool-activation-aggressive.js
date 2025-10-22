// Test specifico tool activation con prompt aggressivo

const API_URL = 'http://localhost:3112/api/os2/chat';

const CASI_CRITICI = [
  {msg: "Fai analisi fattibilità terreno Roma", expected: true, tool: "feasibility.analyze"},
  {msg: "Mi serve sensitivity per banca", expected: true, tool: "sensitivity"},
  {msg: "Confronta 3 opzioni", expected: true, tool: "feasibility/sensitivity"},
  {msg: "Analizza impatto costi +10%", expected: true, tool: "sensitivity"},
  {msg: "Crea business plan", expected: true, tool: "business_plan"},
  {msg: "Mostra i miei progetti", expected: true, tool: "project.list"},
  {msg: "Come funziona Urbanova?", expected: false, tool: "none"},
  {msg: "Dovrei fare progetto A o B?", expected: false, tool: "none"},
  {msg: "Grazie per l'aiuto", expected: false, tool: "none"},
];

async function test() {
  console.log('\n🔥 TEST TOOL ACTIVATION AGGRESSIVO\n');
  console.log('═'.repeat(80));
  
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
      console.log(`✅ "${caso.msg.substring(0, 50)}"`);
      console.log(`   Tool: ${r.functionCalls[0].name} (atteso: ${caso.tool})\n`);
      correct++;
    } else if (caso.expected && !activated) {
      console.log(`❌ MISSED: "${caso.msg.substring(0, 50)}"`);
      console.log(`   Tool atteso: ${caso.tool}, Attivato: NESSUNO\n`);
      missed++;
    } else if (!caso.expected && activated) {
      console.log(`⚠️  UNNECESSARY: "${caso.msg.substring(0, 50)}"`);
      console.log(`   Tool: ${r.functionCalls[0].name} (non necessario)\n`);
      unnecessary++;
    } else {
      console.log(`✅ "${caso.msg.substring(0, 50)}" (conversational OK)\n`);
      correct++;
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('═'.repeat(80));
  console.log(`\n📊 RISULTATI:\n`);
  console.log(`   ✅ Corretti: ${correct}/${CASI_CRITICI.length}`);
  console.log(`   ❌ Missed: ${missed}/${CASI_CRITICI.length}`);
  console.log(`   ⚠️  Unnecessary: ${unnecessary}/${CASI_CRITICI.length}`);
  console.log(`\n   📈 Accuracy: ${(correct/CASI_CRITICI.length*100).toFixed(1)}%\n`);
  
  if (correct/CASI_CRITICI.length >= 0.9) {
    console.log('🎉 ECCELLENTE: Tool activation >90%!\n');
  } else if (correct/CASI_CRITICI.length >= 0.75) {
    console.log('✅ BUONO: Tool activation >75%\n');
  } else {
    console.log('⚠️  DA MIGLIORARE: Tool activation <75%\n');
  }
}

test().catch(console.error);
