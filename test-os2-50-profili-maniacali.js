// 🧠 TEST MANIACALE OS2 - 50 PROFILI COMPLETI IN PRODUZIONE

const API_URL = 'http://localhost:3112/api/os2/chat';
const fs = require('fs');

// 50 PROFILI con conversazioni DEEP (10-15 msg ciascuno)
const PROFILI = [
  // BATCH 1: Profili Base (1-5)
  {
    name: "Marco - Sviluppatore Base",
    userId: "marco_dev_001",
    scenario: [
      "Ciao! Ho un terreno a Milano 500mq",
      "Fai analisi fattibilità per residenziale",
      "Quanto costa costruzione al mq?",
      "Crea business plan per questo progetto",
      "Mi serve sensitivity prezzo vendita +/-10%",
      "Mostra tutti i miei progetti",
      "Salva questo come Progetto Milano Centro",
      "Confronta con progetto simile a Roma",
      "Dovrei procedere secondo te?",
      "Grazie per l'aiuto!"
    ]
  },
  {
    name: "Sofia - Architetto Esigente",
    userId: "sofia_arch_002",
    sessionId: "sofia_session",
    scenario: [
      "Ho 3 terreni: Milano 800mq, Roma 600mq, Bologna 1000mq",
      "Analizza fattibilità per tutti e 3",
      "Quale ha il miglior ROI?",
      "Per Milano fai BP con 4 piani fuori terra",
      "E se aumento a 5 piani?",
      "Confronta Milano 4 piani vs 5 piani",
      "Fai sensitivity costi costruzione +/-15%",
      "Mostra breakdown dettagliato costi Milano",
      "Salva Milano come MilanoTower",
      "Ricordami le caratteristiche di MilanoTower",
      "Esporta report per banca",
      "Perfetto, procedo con Milano!"
    ]
  },
  {
    name: "Giovanni - Investitore Esperto",
    userId: "giovanni_inv_003",
    scenario: [
      "Progetto residenziale Roma, 3M budget",
      "Analizza fattibilità con leverage 60%",
      "Calcola BP con finanziamento bancario",
      "Mi serve DSCR e coverage ratios",
      "Fai sensitivity LTV 50%-70% step 5%",
      "Analizza impatto tassi interesse +2%",
      "Confronta unleveraged vs leveraged",
      "Waterfall distribution con 3 partner",
      "Quale scenario massimizza IRR?",
      "Salva come Roma Premium",
      "Dammi consigli strategici per negoziazione terreno"
    ]
  },
  {
    name: "Laura - Principiante Confusa",
    userId: "laura_newbie_004",
    scenario: [
      "Ciao, non so da dove iniziare",
      "Ho terreno, come funziona sviluppo immobiliare?",
      "Cosa significa fattibilità?",
      "Ok, fai analisi per terreno Torino 400mq",
      "Questo ROI è buono?",
      "Non capisco il business plan",
      "Spiegami meglio i costi",
      "E se non ho tutti i soldi?",
      "Come trovo finanziamenti?",
      "Grazie, ora è più chiaro!",
      "Salva questi dati per dopo",
      "Dovrei proprio fare questo progetto?"
    ]
  },
  {
    name: "Alessandro - Multitasker Caotico",
    userId: "alessandro_chaos_005",
    scenario: [
      "Analisi Napoli 700mq residenziale",
      "Aspetta, prima mostra progetti esistenti",
      "No torna indietro, fai Napoli",
      "Crea BP veloce",
      "Ma quanto tempo ci vuole a costruire?",
      "Ah dimenticavo, terreno è in zona sismica",
      "Rifai con maggiorazioni sismica 15%",
      "Sensitivity anche su tempi costruzione",
      "Confronta con progetto Firenze",
      "Quale conviene?",
      "Ok salva Napoli",
      "Ricordami domani di rivedere questi numeri"
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
          sessionId: profilo.sessionId || `${profilo.userId}_session`
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
  console.log(`📊 ANALISI BATCH`);
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
  console.log('🧠 URBANOVA OS 2.0 - TEST MANIACALE BATCH 1/10');
  console.log('█'.repeat(80));
  console.log('\nObiettivo: Valutare OS come collega AI perfetto');
  console.log('Batch 1: 5 profili base x 10 msg = 50 messaggi\n');
  
  const batch1 = await testBatch(PROFILI.slice(0, 5), 1);
  const analisi1 = analizzaBatch(batch1);
  
  console.log('\n⏸️  PAUSA PER ANALISI PATTERN BATCH 1...\n');
  
  // Salva risultati
  fs.writeFileSync(
    'test-os2-batch1-results.json',
    JSON.stringify({ batch: 1, results: batch1, analisi: analisi1 }, null, 2)
  );
  
  console.log('✅ Risultati Batch 1 salvati!\n');
  console.log('🔄 Analizza pattern e identifica miglioramenti...\n');
}

main().catch(console.error);

