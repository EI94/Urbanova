const fs = require('fs');

const batch1 = JSON.parse(fs.readFileSync('test-os2-batch1-results.json', 'utf8'));
const batch2 = JSON.parse(fs.readFileSync('test-os2-batch2-results.json', 'utf8'));

console.log('\n🔍 ANALISI MESSAGGI SENZA TOOL ACTIVATION\n');
console.log('='.repeat(80));

let noToolMessages = [];

[...batch1.results, ...batch2.results].forEach(profilo => {
  profilo.messaggi.forEach(msg => {
    if (!msg.error && !msg.toolActivated) {
      noToolMessages.push({
        profilo: profilo.profilo,
        msg: msg.input,
        response: msg.response?.substring(0, 100)
      });
    }
  });
});

console.log(`\n📊 ${noToolMessages.length} messaggi SENZA tool activation\n`);
console.log('Analizzo se sono GIUSTIFICATI o DOVEVANO attivare:\n');

// Categorie
let conversational = 0; // Saluti, grazie, domande teoriche
let shouldHaveActivated = 0; // DOVEVANO attivare ma non l'hanno fatto
let ambiguous = 0; // Casi limite

noToolMessages.forEach((m, i) => {
  const msgLower = m.msg.toLowerCase();
  
  // Categorizza
  let category = '';
  let shouldActivate = false;
  
  // Conversazionali chiari
  if (msgLower.match(/^(ciao|grazie|prego|perfetto|ok)/)) {
    category = '💬 Conversazionale';
    conversational++;
  }
  // Domande teoriche
  else if (msgLower.includes('come funziona') || 
           msgLower.includes('cosa significa') ||
           msgLower.includes('cos\'è') ||
           msgLower.includes('perché') ||
           msgLower.includes('quali opportunità') ||
           msgLower.includes('pro e contro') ||
           msgLower.includes('cosa pensi') ||
           msgLower.includes('dovrei')) {
    category = '❓ Domanda Teorica';
    conversational++;
  }
  // Recall/memoria
  else if (msgLower.includes('quali erano') ||
           msgLower.includes('ricordami') ||
           msgLower.includes('come si chiamava') ||
           msgLower.includes('di cosa stavamo')) {
    category = '🧠 Memoria/Recall';
    conversational++;
  }
  // Context switch
  else if (msgLower.includes('torniamo') ||
           msgLower.includes('dimenticalo') ||
           msgLower.includes('a proposito')) {
    category = '🔄 Context Switch';
    conversational++;
  }
  // DOVEVA attivare!
  else {
    category = '⚠️  DOVEVA ATTIVARE';
    shouldHaveActivated++;
    shouldActivate = true;
  }
  
  if (i < 30) { // Mostra primi 30
    console.log(`${i+1}. ${category}`);
    console.log(`   Msg: "${m.msg}"`);
    if (shouldActivate) {
      console.log(`   ⚠️  PROBLEMA: Questo doveva attivare un tool!`);
    }
    console.log('');
  }
});

console.log('='.repeat(80));
console.log(`\n📊 CATEGORIZZAZIONE:\n`);
console.log(`💬 Conversazionali/Teorici: ${conversational}/${noToolMessages.length} (${(conversational/noToolMessages.length*100).toFixed(1)}%)`);
console.log(`⚠️  DOVEVANO attivare: ${shouldHaveActivated}/${noToolMessages.length} (${(shouldHaveActivated/noToolMessages.length*100).toFixed(1)}%)`);

console.log(`\n🎯 TOOL ACTIVATION CORRETTO: ${52}/${52+shouldHaveActivated} (${(52/(52+shouldHaveActivated)*100).toFixed(1)}%)\n`);
