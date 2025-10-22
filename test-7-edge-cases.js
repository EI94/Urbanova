// Test SPECIFICO sui 7 edge case

const API_URL = 'http://localhost:3112/api/os2/chat';

async function testEdgeCase(scenario, name) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST EDGE CASE: ${name}`);
  console.log('='.repeat(80));
  
  let conversationHistory = [];
  let toolsActivated = 0;
  
  for (let i = 0; i < scenario.length; i++) {
    const msg = scenario[i];
    console.log(`\n👤 User: "${msg.message}"`);
    
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        message: msg.message,
        userId: `edge_${Date.now()}`,
        sessionId: `edge_session_${name}`,
        conversationHistory
      })
    }).then(r => r.json());
    
    const activated = r.functionCalls && r.functionCalls.length > 0;
    
    if (activated) {
      console.log(`✅ Tool: ${r.functionCalls.map(f => f.name).join(', ')}`);
      toolsActivated++;
    } else {
      console.log(`💬 Conversational: ${r.response?.substring(0, 100)}...`);
    }
    
    // Check success
    const expected = msg.expectTool;
    const success = expected ? activated : !activated;
    
    if (!success) {
      console.log(`❌ FAIL: Expected ${expected ? 'tool' : 'conversational'}, got ${activated ? 'tool' : 'conversational'}`);
    }
    
    conversationHistory.push(
      {role: 'user', content: msg.message},
      {role: 'assistant', content: r.response}
    );
    
    // Keep only last 6
    if (conversationHistory.length > 6) {
      conversationHistory = conversationHistory.slice(-6);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  return toolsActivated;
}

async function main() {
  console.log('\n🎯 TEST 7 EDGE CASES CON CONTEXT-AWARENESS\n');
  
  const scenarios = [
    {
      name: "Comparative Query",
      scenario: [
        {message: "Analisi Milano 500mq", expectTool: true},
        {message: "Analisi Roma 600mq", expectTool: true},
        {message: "Quale ha il miglior ROI?", expectTool: true}
      ]
    },
    {
      name: "Pronome Vago",
      scenario: [
        {message: "Fai analisi Torino 400mq", expectTool: true},
        {message: "Salva questi dati per dopo", expectTool: true}
      ]
    },
    {
      name: "Context Switch",
      scenario: [
        {message: "Analisi Napoli 300mq", expectTool: true},
        {message: "Mostra progetti", expectTool: true},
        {message: "No torna indietro, fai Napoli", expectTool: true}
      ]
    },
    {
      name: "Quale Conviene",
      scenario: [
        {message: "Confronta Firenze vs Bologna", expectTool: true},
        {message: "Quale conviene?", expectTool: true}
      ]
    },
    {
      name: "BP senza parametri",
      scenario: [
        {message: "Crea business plan dettagliato", expectTool: true},
        {message: "Fai BP completo", expectTool: true}
      ]
    },
    {
      name: "Analisi Comparativa",
      scenario: [
        {message: "Ho terreno Milano vs Roma", expectTool: true},
        {message: "Analizza pro e contro per entrambi", expectTool: true}
      ]
    }
  ];
  
  let totalTests = 0;
  let totalTools = 0;
  
  for (const scenario of scenarios) {
    const tools = await testEdgeCase(scenario.scenario, scenario.name);
    totalTests += scenario.scenario.length;
    totalTools += tools;
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 RISULTATI FINALI:\n`);
  console.log(`Tool Activations: ${totalTools}/${totalTests} (${(totalTools/totalTests*100).toFixed(1)}%)`);
  console.log(`\nTarget: 100% sui 7 edge case critici`);
  console.log(`Actual: ${(totalTools/totalTests*100).toFixed(1)}%\n`);
}

main().catch(console.error);


