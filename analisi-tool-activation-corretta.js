const fs = require('fs');

// Carica risultati
const results = JSON.parse(fs.readFileSync('test-os2-50-profili-COMPLETE.json', 'utf8'));

console.log('\n🔍 ANALISI TOOL ACTIVATION CORRETTA\n');
console.log('═'.repeat(80));

let totalMessages = 0;
let shouldActivateTool = 0;  // Messaggi che DOVREBBERO attivare tool
let toolActivated = 0;       // Tool effettivamente attivati
let correctActivation = 0;   // Attivati quando dovevano
let missedActivation = 0;    // NON attivati quando dovevano
let unnecessaryActivation = 0; // Attivati quando NON dovevano

// Keyword che indicano richiesta di AZIONE (dovrebbero attivare tool)
const actionKeywords = [
  'analisi', 'analizza', 'fai', 'calcola', 'crea', 'genera',
  'business plan', 'bp', 'sensitivity', 'confronta', 'mostra progetti',
  'lista progetti', 'salva', 'esporta', 'invia', 'prepara'
];

// Keyword che NON dovrebbero attivare tool (conversazione/info)
const conversationalKeywords = [
  'come funziona', 'spiegami', 'cos\'è', 'perché', 'quando',
  'dovrei', 'consigli', 'cosa pensi', 'come va', 'ciao', 'grazie'
];

results.conversazioni.forEach(conv => {
  conv.messaggi.forEach(msg => {
    if (msg.error) return; // Skip errori
    
    totalMessages++;
    const msgLower = msg.input.toLowerCase();
    
    // Determina se DOVREBBE attivare tool
    const isActionRequest = actionKeywords.some(kw => msgLower.includes(kw));
    const isConversational = conversationalKeywords.some(kw => msgLower.includes(kw));
    const isToolExpected = isActionRequest && !isConversational;
    
    if (isToolExpected) shouldActivateTool++;
    
    // Verifica se tool attivato
    const wasActivated = msg.toolActivation === true;
    if (wasActivated) toolActivated++;
    
    // Categorizza
    if (isToolExpected && wasActivated) {
      correctActivation++;
    } else if (isToolExpected && !wasActivated) {
      missedActivation++;
      if (missedActivation <= 5) {
        console.log(`❌ MISSED: "${msg.input.substring(0, 60)}"`);
      }
    } else if (!isToolExpected && wasActivated) {
      unnecessaryActivation++;
    }
  });
});

console.log('\n📊 RISULTATI:\n');
console.log(`Messaggi totali: ${totalMessages}`);
console.log(`Messaggi che DOVREBBERO attivare tool: ${shouldActivateTool} (${(shouldActivateTool/totalMessages*100).toFixed(1)}%)`);
console.log(`Messaggi conversazionali (NO tool): ${totalMessages - shouldActivateTool} (${((totalMessages-shouldActivateTool)/totalMessages*100).toFixed(1)}%)`);
console.log('');
console.log(`Tool effettivamente attivati: ${toolActivated}`);
console.log('');
console.log(`✅ CORRECT Activation: ${correctActivation} / ${shouldActivateTool} (${(correctActivation/shouldActivateTool*100).toFixed(1)}%)`);
console.log(`❌ MISSED Activation: ${missedActivation} / ${shouldActivateTool} (${(missedActivation/shouldActivateTool*100).toFixed(1)}%)`);
console.log(`⚠️  UNNECESSARY Activation: ${unnecessaryActivation}`);
console.log('');
console.log('═'.repeat(80));
console.log('\n📈 TOOL ACTIVATION CORRETTA:\n');
console.log(`   ${correctActivation} corretti / ${shouldActivateTool} attesi = ${(correctActivation/shouldActivateTool*100).toFixed(1)}%`);
console.log('');

if (correctActivation/shouldActivateTool < 0.8) {
  console.log('⚠️  CRITICO: Tool activation sotto 80%!\n');
} else {
  console.log('✅ OTTIMO: Tool activation sopra 80%!\n');
}
