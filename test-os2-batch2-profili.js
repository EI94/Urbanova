// 🧠 TEST MANIACALE OS2 - BATCH 2 (Profili 6-10)

const API_URL = 'http://localhost:3112/api/os2/chat';
const fs = require('fs');

// BATCH 2: Edge Cases & Profili Complessi (6-10)
const PROFILI = [
  {
    name: "Francesca - Multilingua",
    userId: "francesca_multi_006",
    scenario: [
      "Ciao! I have a land in Venice",
      "Fai feasibility analysis per hotel boutique",
      "What's the expected ROI?",
      "Crea business plan dettagliato",
      "¿Puedes hacer sensitivity en español?",
      "Mostra tutti i dati in italiano ora",
      "Salva come Venezia Luxury Hotel",
      "Ricordami i numeri di questo progetto",
      "Grazie mille!"
    ]
  },
  {
    name: "Roberto - Voice/Conversational User",
    userId: "roberto_voice_007",
    scenario: [
      "Ehi Urbanova, ho bisogno di un consiglio",
      "Ho due terreni: uno costa 2M, l'altro 1.5M",
      "Il primo è Milano centro, il secondo hinterland",
      "Quale mi consigli?",
      "Analizza entrambi e dimmi qual è meglio",
      "E se voglio massimizzare cash flow invece di ROI?",
      "Perfetto, fai BP per quello migliore",
      "Salva tutto come Progetto Strategico",
      "Domani rivediamo i numeri insieme"
    ]
  },
  {
    name: "Giulia - Divaga Sempre",
    userId: "giulia_digress_008",
    scenario: [
      "Analisi Genova 500mq",
      "A proposito, com'è il mercato ora?",
      "E i tassi di interesse cosa fanno?",
      "Vabbè, torniamo al progetto Genova",
      "Fai BP completo",
      "Ma tu cosa pensi del mercato luxury in Italia?",
      "Ok ok, sensitivity sul progetto Genova",
      "Dovrei fare anche analisi per co-living?",
      "No dimenticalo, salva Genova normale",
      "Ricordati che preferisco progetti sostenibili",
      "Quali erano i numeri di Genova?"
    ]
  },
  {
    name: "Matteo - Memoria Corta",
    userId: "matteo_memory_009",
    scenario: [
      "Analisi Palermo residenziale",
      "Di cosa stavamo parlando?",
      "Ah sì, Palermo. Crea BP",
      "Quali erano i numeri dell'analisi?",
      "Mostrami di nuovo tutto",
      "Ok fai sensitivity prezzo ±10%",
      "Ricordami come si chiama questo progetto",
      "Salva come Palermo Centro",
      "Come si chiamava già?",
      "Perfetto grazie!"
    ]
  },
  {
    name: "Chiara - Strategic Seeker",
    userId: "chiara_strategy_010",
    scenario: [
      "Ho budget 5M, zona Milano o Roma",
      "Quali opportunità vedi nel mercato attuale?",
      "Dovrei fare residenziale o commerciale?",
      "Analizza pro e contro per entrambi",
      "E se faccio mixed-use?",
      "Dammi lo scenario ottimale secondo te",
      "Crea BP per la tua raccomandazione migliore",
      "Quali sono i rischi principali?",
      "Come li mitigo?",
      "Salva strategia completa come Piano A",
      "Perfetto, grazie per l'analisi!"
    ]
  }
];

async function testProfilo(profilo, batchNum) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST: ${profilo.name} (Batch ${batchNum})`);
  console.log(`${'='.repeat(80)}\n`);
  
  const results = {
    profilo: profilo.name,
    userId: profilo.userId,
    messaggi: [],
    stats: {
      toolActivations: 0,
      avgResponseTime: 0,
      memoryRecalls: 0,
      errors: 0
    }
  };
  
  let conversationHistory = [];
  
  for (let i = 0; i < profilo.scenario.length; i++) {
    const msg = profilo.scenario[i];
    console.log(`\n👤 ${profilo.name}: "${msg}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          userId: profilo.userId,
          sessionId: `${profilo.userId}_session`,
          conversationHistory
        })
      });
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      // Log risposta
      const respPreview = data.response?.substring(0, 150) || 'NO RESPONSE';
      console.log(`🤖 OS: ${respPreview}...`);
      
      // Check tool activation
      const toolActivated = data.functionCalls && data.functionCalls.length > 0;
      if (toolActivated) {
        console.log(`🔧 Tools: ${data.functionCalls.map(f => f.name).join(', ')}`);
        results.stats.toolActivations++;
      }
      
      console.log(`⏱️  ${responseTime}ms`);
      
      results.messaggi.push({
        input: msg,
        response: data.response,
        toolActivated,
        tools: toolActivated ? data.functionCalls.map(f => f.name) : [],
        responseTime
      });
      
      results.stats.avgResponseTime += responseTime;
      
      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: msg },
        { role: 'assistant', content: data.response }
      );
      
      // Keep only last 6 messages (3 exchanges)
      if (conversationHistory.length > 6) {
        conversationHistory = conversationHistory.slice(-6);
      }
      
      // Pausa tra messaggi
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (err) {
      console.log(`❌ ERRORE: ${err.message}`);
      results.stats.errors++;
      results.messaggi.push({
        input: msg,
        error: err.message
      });
    }
  }
  
  results.stats.avgResponseTime /= profilo.scenario.length;
  
  return results;
}

async function testBatch(profiliBatch, batchNum) {
  console.log(`\n\n${'█'.repeat(80)}`);
  console.log(`🚀 BATCH ${batchNum}: Testing ${profiliBatch.length} profili`);
  console.log(`${'█'.repeat(80)}\n`);
  
  const batchResults = [];
  
  for (const profilo of profiliBatch) {
    const result = await testProfilo(profilo, batchNum);
    batchResults.push(result);
    
    // Pausa tra profili
    await new Promise(r => setTimeout(r, 3000));
  }
  
  return batchResults;
}

function analizzaBatch(results) {
  console.log(`\n\n${'═'.repeat(80)}`);
  console.log(`📊 ANALISI BATCH 2`);
  console.log(`${'═'.repeat(80)}\n`);
  
  let totalTool = 0;
  let totalTime = 0;
  let totalErrors = 0;
  let totalMsgs = 0;
  
  results.forEach(r => {
    totalTool += r.stats.toolActivations;
    totalTime += r.stats.avgResponseTime;
    totalErrors += r.stats.errors;
    totalMsgs += r.messaggi.length;
  });
  
  console.log(`Profili testati: ${results.length}`);
  console.log(`Messaggi totali: ${totalMsgs}`);
  console.log(`Tool activations: ${totalTool}/${totalMsgs} (${(totalTool/totalMsgs*100).toFixed(1)}%)`);
  console.log(`Tempo medio: ${(totalTime/results.length).toFixed(0)}ms`);
  console.log(`Errori: ${totalErrors}`);
  
  return {
    toolActivationRate: totalTool/totalMsgs,
    avgTime: totalTime/results.length,
    errorRate: totalErrors/totalMsgs
  };
}

async function main() {
  console.log('\n\n');
  console.log('█'.repeat(80));
  console.log('🧠 URBANOVA OS 2.0 - TEST MANIACALE BATCH 2/10');
  console.log('█'.repeat(80));
  console.log('\nBatch 2: 5 profili edge case × ~10 msg = ~50 messaggi\n');
  
  const batch2 = await testBatch(PROFILI, 2);
  const analisi2 = analizzaBatch(batch2);
  
  console.log('\n⏸️  PAUSA PER ANALISI PATTERN BATCH 2...\n');
  
  // Salva risultati
  fs.writeFileSync(
    'test-os2-batch2-results.json',
    JSON.stringify({ batch: 2, results: batch2, analisi: analisi2 }, null, 2)
  );
  
  console.log('✅ Risultati Batch 2 salvati!\n');
  console.log('🔄 Analizza pattern e identifica miglioramenti...\n');
}

main().catch(console.error);

