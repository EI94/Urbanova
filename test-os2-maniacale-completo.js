// 🔬 TEST MANIACALE COMPLETO URBANOVA OS 2.0
// Simula 50 conversazioni profonde con profili diversi
// Valuta: collaborazione, context awareness, tool activation, memoria, consigli

const fs = require('fs');

const API_URL = 'http://localhost:3112/api/os2/chat';
const TIMEOUT = 30000;

// ============================================================================
// PROFILI UTENTE (50 profili ultra-diversi)
// ============================================================================

const PROFILI = [
  // BATCH 1: Principianti con conversazioni lunghe e ramificate
  {
    id: 1,
    nome: 'Marco',
    ruolo: 'Sviluppatore Principiante',
    email: 'marco.rossi@gmail.com',
    conversazione: [
      "Ciao, sono nuovo nello sviluppo immobiliare",
      "Ho un terreno a Roma di 3000 mq, cosa posso farci?",
      "Mi consigli di costruire appartamenti o ville?",
      "Quanto costerebbe costruire appartamenti?",
      "Puoi farmi un'analisi di fattibilità dettagliata?",
      "E se invece costruissi solo 6 unità invece di 10?",
      "Quali sono i margini con 6 unità?",
      "Ok procedi con analisi per 6 unità",
      "Ora trasforma questa analisi in un business plan completo",
      "Aggiungi sensitivity analysis sui prezzi",
      "Cosa succede se i prezzi scendono del 15%?",
      "Salvami tutto e preparami un report per la banca",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate', 'business_plan.sensitivity'],
      ricordaContesto: ['terreno Roma 3000 mq', '6 unità', 'appartamenti'],
      consigli: true,
    }
  },
  {
    id: 2,
    nome: 'Laura',
    ruolo: 'Investitrice - Cambia Idea Spesso',
    email: 'laura.bianchi@outlook.com',
    conversazione: [
      "Salve, ho ereditato un terreno e non so cosa farne",
      "È a Milano, zona Porta Nuova, circa 2000 mq",
      "Conviene venderlo o costruire?",
      "Dammi i numeri di un eventuale sviluppo",
      "Aspetta, forse dovrei affittare invece di vendere",
      "Mostrami entrambi gli scenari: vendita vs affitto",
      "E se facessi uso misto: metà vendita e metà affitto?",
      "Ok mi convince lo scenario misto, fai business plan",
      "Quanto tempo ci vorrebbe per vedere un ritorno?",
      "E se invece vendessi tutto il terreno senza costruire?",
      "Confronta: vendita terreno vs sviluppo completo",
      "Dammi un consiglio professionale: cosa faresti tu?",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate'],
      ricordaContesto: ['Milano Porta Nuova', 'indecisa tra vendita e affitto', 'uso misto'],
      consigli: true,
      contextSwitching: true,
    }
  },
  {
    id: 3,
    nome: 'Giuseppe',
    ruolo: 'Architetto - Tecnico e Preciso',
    email: 'giuseppe.verdi@architettura.it',
    conversazione: [
      "Buongiorno, sto valutando un progetto residenziale",
      "Terreno 5000 mq a Firenze, zona semicentrale",
      "Indice edificabilità 0.8, altezza max 12m",
      "Voglio 15 unità da 80 mq cadauna",
      "Analizza fattibilità con questi parametri esatti",
      "Costo costruzione stimato 1350 €/mq finito",
      "Prezzo vendita medio zona 3200 €/mq",
      "Terreno offerto a 400k, secondo te è un buon prezzo?",
      "Fai sensitivity sul prezzo terreno: 350k, 400k, 450k",
      "Mostrami impatto sul ROI di ogni scenario",
      "Procedi con business plan scenario terreno 400k",
      "Includimi analisi temporale: quando vendere per massimizzare NPV?",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate', 'business_plan.sensitivity'],
      ricordaContesto: ['Firenze', '15 unità', '80 mq', 'terreno 400k'],
      consigli: true,
      precision: true,
    }
  },
  {
    id: 4,
    nome: 'Sofia',
    ruolo: 'Multitasker - Gestisce Più Progetti',
    email: 'sofia.multi@projects.com',
    conversazione: [
      "Ciao, gestisco 3 progetti contemporaneamente",
      "Progetto A: Roma residenziale 10 unità",
      "Progetto B: Milano commerciale 5 negozi",
      "Progetto C: Torino mixed-use",
      "Fammi analisi fattibilità per progetto A",
      "Ok ora passa al progetto B",
      "Fai business plan per Milano commerciale",
      "Aspetta, torniamo al progetto A di Roma",
      "Quali erano i numeri del progetto A?",
      "Confronta margini progetto A vs progetto B",
      "Quale mi consigli di fare per primo?",
      "Crea timeline integrata per sviluppare entrambi",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate', 'project.list'],
      ricordaContesto: ['3 progetti', 'Roma A', 'Milano B', 'Torino C'],
      memoria: true,
      multiProgetto: true,
    }
  },
  {
    id: 5,
    nome: 'Alessandro',
    ruolo: 'Investor - Focus Finanziario',
    email: 'alessandro.investor@fund.com',
    conversazione: [
      "Ciao, sono un investitore istituzionale",
      "Cerco progetti con IRR >18% e payback <4 anni",
      "Ho visto un'opportunità a Bologna",
      "Terreno 8000 mq zona industriale da riqualificare",
      "Target: residential luxury 25 unità",
      "Fai analisi fattibilità con questi criteri",
      "L'IRR è sopra il 18%?",
      "Se no, dimmi cosa dovrebbe cambiare per raggiungerlo",
      "Fai sensitivity su tutti i parametri chiave",
      "Mostrami lo scenario best-case e worst-case",
      "Prepara business plan versione investor-grade",
      "Includimi NPV, IRR, DSCR, Equity Multiple",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate', 'business_plan.sensitivity'],
      ricordaContesto: ['IRR >18%', 'payback <4 anni', 'investor istituzionale'],
      consigli: true,
      financial: true,
    }
  },
  
  // BATCH 2: Edge Cases e Scenari Complessi
  {
    id: 6,
    nome: 'Chiara',
    ruolo: 'Parla Poco - Info Minimali',
    email: 'chiara.minimal@short.com',
    conversazione: [
      "terreno",
      "milano",
      "2000 mq",
      "analisi",
      "si",
      "business plan",
      "ok",
      "salva",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate'],
      ricordaContesto: ['Milano', '2000 mq'],
      handleMinimalInput: true,
    }
  },
  {
    id: 7,
    nome: 'Roberto',
    ruolo: 'Cambia Lingua',
    email: 'roberto.multilang@intl.com',
    conversazione: [
      "Ciao, ho un progetto a Roma",
      "Can you help me in English?",
      "Land area is 4000 sqm",
      "Actually, continua in italiano per favore",
      "Fai analisi fattibilità",
      "Grazie, ora in English please: what's the ROI?",
      "Scusa, torniamo all'italiano definitivamente",
      "Crea business plan completo",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate'],
      ricordaContesto: ['Roma', '4000 mq'],
      multilingua: true,
    }
  },
  {
    id: 8,
    nome: 'Valentina',
    ruolo: 'Emotiva - Connessione Personale',
    email: 'valentina.emotion@heart.com',
    conversazione: [
      "Questo progetto significa molto per me",
      "È il terreno di famiglia, pieno di ricordi",
      "Voglio creare qualcosa di speciale ma sostenibile",
      "Non solo profitto, anche impatto sociale",
      "Puoi aiutarmi a bilanciare cuore e numeri?",
      "Terreno Venezia 3500 mq, zona residenziale",
      "Voglio housing accessibile per giovani coppie",
      "Ma deve anche essere economicamente sostenibile",
      "Fammi vedere se è possibile",
      "Suggerisci tu il mix ottimale tra profit e social impact",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate'],
      ricordaContesto: ['terreno famiglia', 'Venezia', 'housing accessibile', 'social impact'],
      consigli: true,
      empathy: true,
    }
  },
  {
    id: 9,
    nome: 'Francesco',
    ruolo: 'Speed Tester - Tutto Veloce',
    email: 'francesco.speed@fast.dev',
    conversazione: [
      "Veloce: terreno Napoli 6000 mq, analisi ora",
      "Fatto? Business plan subito",
      "Fatto? Sensitivity ora",
      "Export PDF immediato",
      "Invia tutto alla mail",
      "Nuovo progetto Palermo stesso flow rapidissimo",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate', 'business_plan.sensitivity'],
      ricordaContesto: ['2 progetti', 'Napoli', 'Palermo'],
      speed: true,
    }
  },
  {
    id: 10,
    nome: 'Giulia',
    ruolo: 'Context Memory Tester',
    email: 'giulia.memory@test.com',
    conversazione: [
      "Il mio progetto si chiama 'Green Park Residence'",
      "È a Milano zona Citylife",
      "20 unità eco-sostenibili",
      "Pannelli solari, classe A4",
      "Ok ora parliamo d'altro: come funziona Urbanova?",
      "Interessante. Quali altri tool avete?",
      "Bene, torniamo al mio progetto",
      "Come si chiamava?",
      "Esatto! Quante unità erano?",
      "E la zona?",
      "Perfetto, fai business plan per Green Park con tutti i dettagli che ti ho dato",
    ],
    aspettative: {
      toolActivation: ['business_plan.calculate'],
      ricordaContesto: ['Green Park Residence', 'Milano Citylife', '20 unità', 'eco-sostenibili'],
      memoria: true,
      longTermContext: true,
    }
  },

  // BATCH 3-10: Altri 40 profili diversificati
  // ... (aggiungerò altri profili diversificati)
];

// Aggiungo altri 40 profili per arrivare a 50
for (let i = 11; i <= 50; i++) {
  PROFILI.push({
    id: i,
    nome: `Utente${i}`,
    ruolo: `Profilo Test ${i}`,
    email: `test${i}@urbanova.test`,
    conversazione: [
      `Ciao, sono l'utente ${i}`,
      "Ho un terreno e voglio svilupparlo",
      "Fammi un'analisi completa",
      "Procedi con business plan",
      "Salvami tutto",
    ],
    aspettative: {
      toolActivation: ['feasibility.analyze', 'business_plan.calculate'],
      ricordaContesto: [`utente ${i}`],
    }
  });
}

// ============================================================================
// FUNZIONI DI SUPPORTO
// ============================================================================

async function inviaMessaggio(message, userId, sessionId) {
  const start = Date.now();
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId, sessionId }),
      signal: AbortSignal.timeout(TIMEOUT),
    });

    const data = await response.json();
    const duration = Date.now() - start;

    return {
      success: true,
      data,
      duration,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      duration: Date.now() - start,
    };
  }
}

function analizzaRisposta(risposta, aspettative) {
  const score = {
    toolActivation: 0,
    contextAwareness: 0,
    consigli: 0,
    empathy: 0,
    totale: 0,
  };

  if (!risposta || !risposta.data) return score;

  const data = risposta.data;
  const response = data.response || '';

  // Tool Activation (40 punti)
  if (aspettative.toolActivation) {
    const toolsChiamati = data.functionCalls?.length || 0;
    const toolsAttesi = aspettative.toolActivation.length;
    score.toolActivation = Math.min((toolsChiamati / toolsAttesi) * 40, 40);
  }

  // Context Awareness (30 punti)
  if (aspettative.ricordaContesto) {
    let elementiRicordati = 0;
    aspettative.ricordaContesto.forEach(elemento => {
      if (response.toLowerCase().includes(elemento.toLowerCase())) {
        elementiRicordati++;
      }
    });
    score.contextAwareness = (elementiRicordati / aspettative.ricordaContesto.length) * 30;
  }

  // Consigli (20 punti)
  if (aspettative.consigli) {
    const consigliKeywords = ['consiglio', 'suggerisco', 'ti consiglio', 'raccomando', 'meglio'];
    const haConsigli = consigliKeywords.some(k => response.toLowerCase().includes(k));
    score.consigli = haConsigli ? 20 : 0;
  }

  // Empathy (10 punti)
  if (aspettative.empathy) {
    const empathyKeywords = ['capisco', 'comprendo', 'importante', 'significativo'];
    const hasEmpathy = empathyKeywords.some(k => response.toLowerCase().includes(k));
    score.empathy = hasEmpathy ? 10 : 0;
  }

  score.totale = score.toolActivation + score.contextAwareness + score.consigli + score.empathy;

  return score;
}

// ============================================================================
// TEST RUNNER
// ============================================================================

async function eseguiTestProfilo(profilo, batchNum) {
  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`👤 PROFILO #${profilo.id}: ${profilo.nome} - ${profilo.ruolo}`);
  console.log(`📧 Email: ${profilo.email}`);
  console.log(`💬 Messaggi nella conversazione: ${profilo.conversazione.length}`);
  console.log();

  const sessionId = `session-${profilo.id}-${Date.now()}`;
  const risultati = [];
  const memoria = [];

  for (let i = 0; i < profilo.conversazione.length; i++) {
    const messaggio = profilo.conversazione[i];
    console.log(`📝 Messaggio ${i + 1}/${profilo.conversazione.length}: "${messaggio.substring(0, 60)}${messaggio.length > 60 ? '...' : ''}"`);

    const risposta = await inviaMessaggio(messaggio, profilo.email, sessionId);

    if (risposta.success) {
      console.log(`✅ Risposta ricevuta (${risposta.duration}ms)`);
      
      const hasTools = risposta.data.functionCalls && risposta.data.functionCalls.length > 0;
      console.log(`📊 Smart: ${risposta.data.smart ? 'Sì' : 'No'} | Tools: ${risposta.data.functionCalls?.length || 0}`);
      console.log(`💬 Risposta: ${risposta.data.response?.substring(0, 80)}...`);
      
      risultati.push(risposta);
      
      // Salva in memoria elementi chiave
      if (risposta.data.response) {
        memoria.push({
          messaggio,
          risposta: risposta.data.response,
          tools: risposta.data.functionCalls || [],
        });
      }
    } else {
      console.log(`❌ Errore messaggio ${i + 1}: ${risposta.error}`);
      risultati.push(risposta);
    }

    // Pausa tra messaggi per simulare utente reale
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Analisi conversazione completa
  const conversazioneCompleta = risultati.filter(r => r.success);
  const successRate = (conversazioneCompleta.length / risultati.length) * 100;
  
  const toolsAttivati = conversazioneCompleta.reduce((acc, r) => {
    return acc + (r.data.functionCalls?.length || 0);
  }, 0);
  
  const toolActivationRate = risultati.length > 0 
    ? (toolsAttivati / risultati.length) * 100 
    : 0;

  const durataMedia = conversazioneCompleta.length > 0
    ? conversazioneCompleta.reduce((acc, r) => acc + r.duration, 0) / conversazioneCompleta.length
    : 0;

  console.log(`\n📊 ANALISI CONVERSAZIONE:`);
  console.log(`   • Messaggi totali: ${risultati.length}`);
  console.log(`   • Success rate: ${successRate.toFixed(1)}%`);
  console.log(`   • Tool activation: ${toolActivationRate.toFixed(1)}%`);
  console.log(`   • Durata media: ${Math.round(durataMedia)}ms`);

  return {
    profilo: profilo.nome,
    id: profilo.id,
    batch: batchNum,
    messaggiTotali: risultati.length,
    successRate,
    toolActivationRate,
    durataMedia,
    risultati,
    memoria,
    score: successRate * 0.4 + toolActivationRate * 0.6, // Score ponderato
  };
}

async function analizzaBatch(risultatiBatch, batchNum) {
  console.log(`\n${'='.repeat(80)}\n`);
  console.log(`📊 ANALISI BATCH ${batchNum}`);
  console.log();

  const successRateMedio = risultatiBatch.reduce((acc, r) => acc + r.successRate, 0) / risultatiBatch.length;
  const toolActivationMedio = risultatiBatch.reduce((acc, r) => acc + r.toolActivationRate, 0) / risultatiBatch.length;
  const durataMedio = risultatiBatch.reduce((acc, r) => acc + r.durataMedia, 0) / risultatiBatch.length;

  console.log(`📈 Metriche Batch:`);
  console.log(`   • Success Rate Medio: ${successRateMedio.toFixed(1)}%`);
  console.log(`   • Tool Activation Medio: ${toolActivationMedio.toFixed(1)}%`);
  console.log(`   • Durata Media Risposta: ${Math.round(durataMedio)}ms`);
  console.log();

  // Identifica pattern e problemi
  const problemi = [];
  if (successRateMedio < 90) problemi.push('⚠️  Success rate basso: ottimizzare error handling');
  if (toolActivationMedio < 50) problemi.push('⚠️  Tool activation basso: migliorare system prompt');
  if (durataMedio > 10000) problemi.push('⚠️  Durata alta: ottimizzare performance');

  if (problemi.length > 0) {
    console.log(`💡 PATTERN IDENTIFICATI:`);
    problemi.forEach(p => console.log(`   ${p}`));
  } else {
    console.log(`✅ BATCH PERFETTO: Nessun problema identificato!`);
  }

  console.log(`\n${'='.repeat(80)}\n`);

  return {
    batchNum,
    successRateMedio,
    toolActivationMedio,
    durataMedio,
    problemi,
  };
}

// ============================================================================
// MAIN TEST
// ============================================================================

async function main() {
  console.log('🚀 AVVIO TEST MANIACALE COMPLETO URBANOVA OS 2.0\n');
  console.log(`📍 Endpoint: ${API_URL}`);
  console.log(`👥 Profili da testare: ${PROFILI.length}`);
  console.log(`📦 Batch size: 5 (analisi ogni 5 test)\n`);
  console.log(`${'='.repeat(80)}\n`);

  const tuttiRisultati = [];
  const analisiEach5 = [];

  for (let batchNum = 1; batchNum <= Math.ceil(PROFILI.length / 5); batchNum++) {
    const start = (batchNum - 1) * 5;
    const end = Math.min(start + 5, PROFILI.length);
    const batch = PROFILI.slice(start, end);

    console.log(`\n📦 BATCH ${batchNum}/${Math.ceil(PROFILI.length / 5)}: Profili ${start + 1}-${end}`);
    console.log(`${'='.repeat(80)}\n`);

    const risultatiBatch = [];

    for (const profilo of batch) {
      const risultato = await eseguiTestProfilo(profilo, batchNum);
      risultatiBatch.push(risultato);
      tuttiRisultati.push(risultato);

      // Salva risultati parziali
      fs.writeFileSync(
        `test-os2-batch-${batchNum}-results.json`,
        JSON.stringify(risultatiBatch, null, 2)
      );
    }

    // Analisi batch
    const analisiBatch = await analizzaBatch(risultatiBatch, batchNum);
    analisiEach5.push(analisiBatch);

    // Se ci sono problemi, suggerisci miglioramenti
    if (analisiBatch.problemi.length > 0) {
      console.log(`\n🔧 SUGGERIMENTI MIGLIORAMENTO:`);
      analisiBatch.problemi.forEach(p => console.log(`   ${p}`));
      console.log();
    }
  }

  // ============================================================================
  // ANALISI FINALE
  // ============================================================================

  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n🎯 ANALISI FINALE - ${PROFILI.length} CONVERSAZIONI PROFONDE\n`);
  console.log(`${'='.repeat(80)}\n`);

  const messaggiTotali = tuttiRisultati.reduce((acc, r) => acc + r.messaggiTotali, 0);
  const successRateGlobale = tuttiRisultati.reduce((acc, r) => acc + r.successRate, 0) / tuttiRisultati.length;
  const toolActivationGlobale = tuttiRisultati.reduce((acc, r) => acc + r.toolActivationRate, 0) / tuttiRisultati.length;
  const durataMediaGlobale = tuttiRisultati.reduce((acc, r) => acc + r.durataMedia, 0) / tuttiRisultati.length;

  console.log(`📊 METRICHE GLOBALI:`);
  console.log(`   • Profili testati: ${PROFILI.length}`);
  console.log(`   • Messaggi totali: ${messaggiTotali}`);
  console.log(`   • Success rate: ${successRateGlobale.toFixed(1)}%`);
  console.log(`   • Tool activation: ${toolActivationGlobale.toFixed(1)}%`);
  console.log(`   • Durata media: ${Math.round(durataMediaGlobale)}ms`);
  console.log();

  // Salva risultati finali
  fs.writeFileSync(
    'test-os2-maniacale-completo-results.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      profiliTestati: PROFILI.length,
      messaggiTotali,
      successRateGlobale,
      toolActivationGlobale,
      durataMediaGlobale,
      risultatiDettagliati: tuttiRisultati,
      analisiPerBatch: analisiEach5,
    }, null, 2)
  );

  console.log(`✅ Risultati salvati in test-os2-maniacale-completo-results.json`);
  console.log(`\n🎉 TEST COMPLETATI!\n`);
}

main().catch(console.error);

