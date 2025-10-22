const fs = require('fs');

// Carica risultati
const batch1 = JSON.parse(fs.readFileSync('test-os2-batch1-results.json', 'utf8'));
const batch2 = JSON.parse(fs.readFileSync('test-os2-batch2-results.json', 'utf8'));

console.log('\n🔍 ANALISI MANIACALE TOOL ACTIVATION\n');
console.log('='.repeat(80));

// Keyword che DOVREBBERO attivare tool
const actionKeywords = [
  'analisi', 'analizza', 'analizzare',
  'fai', 'fa', 'fare',
  'crea', 'creare', 'genera',
  'calcola', 'calcolare',
  'mostra', 'elenca', 'lista',
  'salva', 'salvare',
  'sensitivity', 'sensibilità',
  'confronta', 'compara',
  'esporta', 'export',
  'invia', 'send'
];

// Keyword conversazionali (NO tool expected)
const conversationalKeywords = [
  'ciao', 'grazie', 'prego',
  'come funziona', 'cos\'è', 'cosa significa',
  'perché', 'come mai',
  'dovrei', 'consigli', 'cosa pensi',
  'quali opportunità', 'pro e contro'
];

let totalMsgs = 0;
let shouldActivate = 0;
let activated = 0;
let missed = 0;
let missedDetails = [];

function analyzeMessage(msg, profilo) {
  if (msg.error) return;
  
  totalMsgs++;
  const msgLower = msg.input.toLowerCase();
  
  // Determina se DOVREBBE attivare
  const hasActionKeyword = actionKeywords.some(kw => msgLower.includes(kw));
  const hasConversational = conversationalKeywords.some(kw => msgLower.includes(kw));
  const isExpected = hasActionKeyword && !hasConversational;
  
  if (isExpected) shouldActivate++;
  
  const wasActivated = msg.toolActivated;
  if (wasActivated) activated++;
  
  // MISSED: doveva attivare ma non l'ha fatto
  if (isExpected && !wasActivated) {
    missed++;
    missedDetails.push({
      profilo: profilo.profilo,
      msg: msg.input,
      hasActionKeyword,
      detectedKeywords: actionKeywords.filter(kw => msgLower.includes(kw))
    });
  }
}

// Analizza tutti i messaggi
[...batch1.results, ...batch2.results].forEach(profilo => {
  profilo.messaggi.forEach(msg => analyzeMessage(msg, profilo));
});

console.log(`\n📊 RISULTATI GLOBALI:\n`);
console.log(`Messaggi totali: ${totalMsgs}`);
console.log(`Messaggi che DOVREBBERO attivare tool: ${shouldActivate} (${(shouldActivate/totalMsgs*100).toFixed(1)}%)`);
console.log(`Tool effettivamente attivati: ${activated} (${(activated/totalMsgs*100).toFixed(1)}%)`);
console.log(`MISSED (doveva attivare): ${missed} (${(missed/shouldActivate*100).toFixed(1)}% miss rate)`);
console.log(`\n🎯 ACCURACY: ${(activated/shouldActivate*100).toFixed(1)}% sui messaggi che dovevano attivare\n`);

console.log('='.repeat(80));
console.log('\n❌ MESSAGGI MISSED (primi 20):\n');

missedDetails.slice(0, 20).forEach((m, i) => {
  console.log(`${i+1}. [${m.profilo}]`);
  console.log(`   Msg: "${m.msg}"`);
  console.log(`   Keywords: ${m.detectedKeywords.join(', ')}`);
  console.log('');
});

// Analisi per categoria di keyword
console.log('='.repeat(80));
console.log('\n📊 ANALISI PER KEYWORD:\n');

const keywordMisses = {};
missedDetails.forEach(m => {
  m.detectedKeywords.forEach(kw => {
    keywordMisses[kw] = (keywordMisses[kw] || 0) + 1;
  });
});

Object.entries(keywordMisses)
  .sort((a, b) => b[1] - a[1])
  .forEach(([kw, count]) => {
    console.log(`"${kw}": ${count} missed`);
  });

// Salva report dettagliato
fs.writeFileSync('tool-activation-missed-report.json', JSON.stringify({
  summary: {
    totalMsgs,
    shouldActivate,
    activated,
    missed,
    accuracy: (activated/shouldActivate*100).toFixed(1)
  },
  missedDetails
}, null, 2));

console.log('\n✅ Report salvato: tool-activation-missed-report.json\n');
