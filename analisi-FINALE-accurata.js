const fs = require('fs');

const batch1 = JSON.parse(fs.readFileSync('test-os2-batch1-results.json', 'utf8'));
const batch2 = JSON.parse(fs.readFileSync('test-os2-batch2-results.json', 'utf8'));

console.log('\n🎯 ANALISI FINALE ACCURATA - CLASSIFICAZIONE MANIACALE\n');
console.log('='.repeat(80));

// Classificazione MANIACALE di ogni singolo messaggio
const classifications = {
  // DOVREBBERO attivare tool
  actionRequired: [],
  
  // Conversazionali puri (NO tool expected)
  conversational: [],
  
  // Recall/Memoria (NO tool se memoria disponibile)
  memoryRecall: [],
  
  // Domande teoriche (NO tool expected)
  theoretical: [],
  
  // Ambigui (dipende dal contesto)
  ambiguous: []
};

function classify(msg, profilo) {
  if (msg.error) return;
  
  const msgLower = msg.input.toLowerCase();
  const activated = msg.toolActivated;
  
  // Classificazione precisa
  let category = null;
  
  // Conversazionali PURI
  if (msgLower.match(/^(ciao|grazie|prego|perfetto|ok|ottimo)/)) {
    category = 'conversational';
  }
  // Domande teoriche/educative
  else if (msgLower.includes('come funziona') ||
           msgLower.includes('cosa significa') ||
           msgLower.includes('cos\'è') ||
           msgLower.includes('perché')) {
    category = 'theoretical';
  }
  // "Dovrei fare X?" - Advisory, NON richiede tool
  else if (msgLower.match(/\bdovrei\b/) && !msgLower.includes('analisi')) {
    category = 'conversational';
  }
  // Recall/Memoria
  else if (msgLower.includes('quali erano') ||
           msgLower.includes('ricordami') ||
           msgLower.includes('come si chiamava') ||
           msgLower.includes('di cosa stavamo')) {
    category = 'memoryRecall';
  }
  // Context switch
  else if (msgLower.includes('torniamo') ||
           msgLower.includes('dimenticalo') ||
           msgLower.includes('a proposito')) {
    category = 'conversational';
  }
  // Opinioni/"Questo X è buono?"
  else if (msgLower.match(/questo .* (è|e') (buon|ottim)/)) {
    category = 'conversational'; // Richiede opinione, non calcolo
  }
  // AZIONI ESPLICITE - DEVONO attivare
  else if (msgLower.match(/\b(fai|fa'|fare|analisi|analizza|crea|calcola|mostra|salva|confronta|sensitivity)\b/)) {
    category = 'actionRequired';
  }
  // RICHIESTE DATI - DEVONO attivare
  else if (msgLower.includes('mi serve') ||
           msgLower.includes('ho bisogno') ||
           msgLower.includes('quanto cost') ||
           msgLower.includes('quale') && (msgLower.includes('roi') || msgLower.includes('conviene')) ||
           msgLower.match(/\b(dscr|irr|npv|waterfall)\b/)) {
    category = 'actionRequired';
  }
  // CONTESTO IMPLICITO - DOVREBBERO attivare
  else if (msgLower.match(/ho \d+ terren/) ||
           msgLower.includes('budget') && msgLower.match(/\d+m/)) {
    category = 'actionRequired';
  }
  // Tutto il resto
  else {
    category = 'ambiguous';
  }
  
  classifications[category].push({
    msg: msg.input,
    activated,
    profilo: profilo.profilo
  });
}

// Classifica tutti
[...batch1.results, ...batch2.results].forEach(profilo => {
  profilo.messaggi.forEach(msg => classify(msg, profilo));
});

// Report
console.log('\n📊 CLASSIFICAZIONE:\n');
Object.entries(classifications).forEach(([cat, msgs]) => {
  console.log(`${cat}: ${msgs.length} messaggi`);
});

console.log('\n='.repeat(80));
console.log('\n🎯 TOOL ACTIVATION ACCURACY:\n');

const actionRequired = classifications.actionRequired.length;
const actionActivated = classifications.actionRequired.filter(m => m.activated).length;
const actionMissed = actionRequired - actionActivated;

console.log(`Action Required: ${actionRequired} messaggi`);
console.log(`Tool Attivati: ${actionActivated}/${actionRequired} (${(actionActivated/actionRequired*100).toFixed(1)}%)`);
console.log(`Tool Missed: ${actionMissed}/${actionRequired} (${(actionMissed/actionRequired*100).toFixed(1)}%)`);

console.log('\n❌ MISSED DETAILS:\n');
classifications.actionRequired.filter(m => !m.activated).slice(0, 15).forEach((m, i) => {
  console.log(`${i+1}. "${m.msg}" [${m.profilo}]`);
});

// Tool activation rate GLOBALE corretto
const totalMsgs = batch1.results.concat(batch2.results).reduce((sum, p) => sum + p.messaggi.filter(m => !m.error).length, 0);
const totalActivated = batch1.results.concat(batch2.results).reduce((sum, p) => sum + p.stats.toolActivations, 0);

console.log('\n='.repeat(80));
console.log(`\n🎯 TOOL ACTIVATION RATE GLOBALE:\n`);
console.log(`Totale messaggi: ${totalMsgs}`);
console.log(`Tool attivati: ${totalActivated}/${totalMsgs} (${(totalActivated/totalMsgs*100).toFixed(1)}%)`);
console.log(`\n💡 MA considerando solo "actionRequired" messages:`);
console.log(`   Accuracy: ${actionActivated}/${actionRequired} (${(actionActivated/actionRequired*100).toFixed(1)}%)`);

