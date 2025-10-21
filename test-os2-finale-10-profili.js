// 🎯 TEST FINALE - 10 Profili Chiave per Valutare "Esperienza Collega"

const fs = require('fs');
const API_URL = 'http://localhost:3112/api/os2/chat';

const PROFILI_CHIAVE = [
  {
    id: 1,
    nome: 'Marco - Principiante',
    test: [
      { msg: "Ciao, sono nuovo nello sviluppo immobiliare", expect: "empathy" },
      { msg: "Ho terreno Roma 3000 mq", expect: "suggestion" },
      { msg: "Fammi analisi completa", expect: "tool_activation" },
      { msg: "E se costruissi 8 unità invece?", expect: "tool_activation" },
      { msg: "Trasforma in business plan", expect: "tool_activation" },
    ]
  },
  {
    id: 2,
    nome: 'Laura - Indecisa',
    test: [
      { msg: "Terreno Milano, non so se vendere o costruire", expect: "advice" },
      { msg: "Mostrami numeri sviluppo", expect: "tool_activation" },
      { msg: "Aspetta, e se affittassi?", expect: "context_switch" },
      { msg: "Confronta vendita vs affitto", expect: "tool_activation" },
    ]
  },
  {
    id: 3,
    nome: 'Giuseppe - Tecnico',
    test: [
      { msg: "Terreno Firenze 5000 mq, indice 0.8, 15 unità 80 mq", expect: "precision" },
      { msg: "Analizza con costruzione 1350 €/mq vendita 3200 €/mq", expect: "tool_activation" },
      { msg: "Terreno 400k è buon prezzo?", expect: "advice" },
      { msg: "Fai sensitivity prezzo terreno 350k-450k", expect: "tool_activation" },
    ]
  },
  {
    id: 4,
    nome: 'Sofia - Multi-Progetto',
    test: [
      { msg: "Gestisco 3 progetti: Roma 10u, Milano 5 negozi, Torino mixed", expect: "acknowledgment" },
      { msg: "Analisi progetto Roma", expect: "tool_activation" },
      { msg: "Passa a Milano", expect: "context_switch" },
      { msg: "Business plan Milano", expect: "tool_activation" },
      { msg: "Torna a Roma, quali erano i numeri?", expect: "memory" },
    ]
  },
  {
    id: 5,
    nome: 'Alessandro - Investor',
    test: [
      { msg: "Cerco progetti IRR >18% payback <4 anni", expect: "acknowledgment" },
      { msg: "Opportunità Bologna 8000 mq luxury 25 unità", expect: "suggestion" },
      { msg: "Analizza e dimmi se raggiunge criteri", expect: "tool_activation" },
      { msg: "Sensitivity su tutti i parametri", expect: "tool_activation" },
    ]
  },
  {
    id: 6,
    nome: 'Chiara - Minimale',
    test: [
      { msg: "terreno", expect: "clarification" },
      { msg: "milano", expect: "clarification" },
      { msg: "2000 mq", expect: "suggestion" },
      { msg: "analisi", expect: "tool_activation" },
    ]
  },
  {
    id: 7,
    nome: 'Roberto - Multilingual',
    test: [
      { msg: "Progetto Roma", expect: "acknowledgment" },
      { msg: "Can you help in English?", expect: "language_switch" },
      { msg: "Continua italiano", expect: "language_switch" },
      { msg: "Fai analisi", expect: "tool_activation" },
    ]
  },
  {
    id: 8,
    nome: 'Valentina - Emotiva',
    test: [
      { msg: "Questo progetto significa molto, terreno famiglia", expect: "empathy" },
      { msg: "Voglio qualcosa speciale ma sostenibile", expect: "empathy" },
      { msg: "Housing accessibile + profit, è possibile?", expect: "advice" },
      { msg: "Aiutami a bilanciare cuore e numeri", expect: "tool_activation" },
    ]
  },
  {
    id: 9,
    nome: 'Francesco - Speed',
    test: [
      { msg: "Veloce: Napoli 6000 mq analisi ora", expect: "tool_activation" },
      { msg: "Business plan subito", expect: "tool_activation" },
      { msg: "Sensitivity ora", expect: "tool_activation" },
    ]
  },
  {
    id: 10,
    nome: 'Giulia - Memory Test',
    test: [
      { msg: "Progetto Green Park Residence, Milano, 20 unità eco", expect: "acknowledgment" },
      { msg: "Come funziona Urbanova?", expect: "info" },
      { msg: "Torniamo al progetto, come si chiamava?", expect: "memory" },
      { msg: "Fai business plan per Green Park", expect: "tool_activation" },
    ]
  },
];

async function testProfilo(profilo) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n👤 ${profilo.nome}\n`);
  
  const sessionId = `test-${profilo.id}-${Date.now()}`;
  const risultati = [];
  
  for (let i = 0; i < profilo.test.length; i++) {
    const test = profilo.test[i];
    console.log(`\n📝 ${i + 1}/${profilo.test.length}: "${test.msg}"`);
    console.log(`   Aspetto: ${test.expect}`);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.msg,
          userId: `user-${profilo.id}`,
          sessionId,
        }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await response.json();
      
      // Valuta risposta
      const evaluation = {
        success: data.success,
        toolActivated: (data.functionCalls?.length || 0) > 0,
        smart: data.smart,
        responseLength: data.response?.length || 0,
        duration: data.duration,
      };

      console.log(`   ✅ Tool: ${evaluation.toolActivated ? '✓' : '✗'} | Smart: ${evaluation.smart ? '✓' : '✗'} | ${evaluation.duration}ms`);
      console.log(`   💬 "${data.response?.substring(0, 100)}..."`);
      
      risultati.push({ test, data, evaluation });
    } catch (error) {
      console.log(`   ❌ Errore: ${error.message}`);
      risultati.push({ test, error: error.message });
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Score profilo
  const score = risultati.reduce((acc, r) => {
    if (!r.evaluation) return acc;
    let points = 0;
    if (r.evaluation.success) points += 20;
    if (r.evaluation.toolActivated && r.test.expect === 'tool_activation') points += 30;
    if (r.evaluation.smart) points += 10;
    return acc + points;
  }, 0);
  
  const maxScore = profilo.test.length * 60;
  const percentage = (score / maxScore) * 100;
  
  console.log(`\n📊 SCORE: ${score}/${maxScore} (${percentage.toFixed(1)}%)`);
  
  return { profilo: profilo.nome, score, percentage, risultati };
}

async function main() {
  console.log('🎯 TEST FINALE - 10 PROFILI CHIAVE\n');
  console.log(`Endpoint: ${API_URL}\n`);
  console.log(`${'='.repeat(80)}\n`);
  
  const risultatiGlobali = [];
  
  for (const profilo of PROFILI_CHIAVE) {
    const risultato = await testProfilo(profilo);
    risultatiGlobali.push(risultato);
  }
  
  // Summary
  console.log(`\n\n${'='.repeat(80)}`);
  console.log('\n🏆 RISULTATI FINALI\n');
  console.log(`${'='.repeat(80)}\n`);
  
  risultatiGlobali.forEach(r => {
    const status = r.percentage >= 80 ? '✅' : r.percentage >= 60 ? '⚠️' : '❌';
    console.log(`${status} ${r.profilo.padEnd(30)} ${r.percentage.toFixed(1)}%`);
  });
  
  const mediaGlobale = risultatiGlobali.reduce((acc, r) => acc + r.percentage, 0) / risultatiGlobali.length;
  console.log(`\n📊 MEDIA GLOBALE: ${mediaGlobale.toFixed(1)}%\n`);
  
  fs.writeFileSync('test-finale-10-profili.json', JSON.stringify(risultatiGlobali, null, 2));
  console.log('✅ Risultati salvati in test-finale-10-profili.json\n');
}

main().catch(console.error);

