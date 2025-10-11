#!/usr/bin/env node

/**
 * 🧪 Test fix OS Business Plan
 * Verifica che l'OS risponda correttamente alle richieste Business Plan
 */

const BASE_URL = 'http://localhost:3112';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

async function testBusinessPlanOS() {
  console.log('\n🧪 TEST FIX OS BUSINESS PLAN');
  console.log('=' .repeat(60));
  
  // Test 1: Verifica server attivo
  log('🔍', 'Test 1: Verifica server attivo');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      log('✅', 'Server attivo e risponde', colors.green);
    } else {
      log('❌', 'Server non risponde correttamente', colors.red);
      return;
    }
  } catch (error) {
    log('❌', `Errore connessione server: ${error.message}`, colors.red);
    return;
  }
  
  // Test 2: Test endpoint chat OS
  log('🔍', 'Test 2: Test endpoint chat OS');
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Ciao, puoi aiutarmi con un business plan?',
        userId: 'test-user',
        userEmail: 'test@urbanova.it',
        context: 'business_plan'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅', `OS risponde correttamente (${data.response?.length || 0} caratteri)`, colors.green);
      
      if (data.response && data.response.length > 10) {
        log('✅', 'Risposta OS valida ricevuta', colors.green);
        console.log(`📝 Risposta: ${data.response.substring(0, 100)}...`);
      } else {
        log('⚠️', 'Risposta OS troppo breve o vuota', colors.yellow);
      }
    } else {
      log('❌', `Errore endpoint chat: ${response.status}`, colors.red);
    }
  } catch (error) {
    log('❌', `Errore test endpoint chat: ${error.message}`, colors.red);
  }
  
  // Test 3: Test richiesta Business Plan specifica
  log('🔍', 'Test 3: Test richiesta Business Plan specifica');
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Ciliegie: 4 case, 390k prezzo, 200k costo, terreno 220k cash. Calcola VAN e TIR.',
        userId: 'test-user',
        userEmail: 'test@urbanova.it',
        context: 'business_plan'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅', `OS elabora richiesta BP (${data.response?.length || 0} caratteri)`, colors.green);
      
      // Verifica se la risposta contiene termini Business Plan
      const responseText = data.response?.toLowerCase() || '';
      const bpTerms = ['van', 'tir', 'business plan', 'scenario', 'margine', 'calcolo'];
      const foundTerms = bpTerms.filter(term => responseText.includes(term));
      
      if (foundTerms.length > 0) {
        log('✅', `OS riconosce termini BP: ${foundTerms.join(', ')}`, colors.green);
      } else {
        log('⚠️', 'OS potrebbe non riconoscere richiesta BP', colors.yellow);
      }
      
      console.log(`📝 Risposta: ${data.response.substring(0, 200)}...`);
    } else {
      log('❌', `Errore richiesta BP: ${response.status}`, colors.red);
    }
  } catch (error) {
    log('❌', `Errore test richiesta BP: ${error.message}`, colors.red);
  }
  
  console.log('\n📋 RIEPILOGO FIX IMPLEMENTATO:');
  console.log('=' .repeat(60));
  
  log('✅', '1. Endpoint corretto: /api/chat invece di /api/feasibility-smart', colors.green);
  log('✅', '2. Parametri corretti: userId, userEmail, context, history', colors.green);
  log('✅', '3. Gestione risposta migliorata con error handling', colors.green);
  log('✅', '4. Logging per debugging aggiunto', colors.green);
  
  console.log('\n💡 ISTRUZIONI PER TEST MANUALE:');
  console.log('=' .repeat(60));
  
  log('🌐', '1. Vai a http://localhost:3112/dashboard/business-plan', colors.cyan);
  log('💬', '2. Clicca "Chat con OS"', colors.cyan);
  log('📝', '3. Scrivi: "Ciliegie: 4 case, 390k prezzo, 200k costo, terreno 220k cash"', colors.cyan);
  log('⏱️', '4. Invia e aspetta risposta (dovrebbe arrivare in 5-10 secondi)', colors.cyan);
  log('✅', '5. Verifica che l\'OS risponda con calcoli o richiesta di dettagli', colors.cyan);
  
  console.log('\n🎯 RISULTATO ATTESO:');
  console.log('=' .repeat(60));
  log('✅', 'OS risponde invece di rimanere muto', colors.green);
  log('✅', 'Risposta contiene termini Business Plan (VAN, TIR, etc.)', colors.green);
  log('✅', 'Nessun errore in console del browser', colors.green);
  
  console.log('\n');
}

if (require.main === module) {
  testBusinessPlanOS();
}

module.exports = { testBusinessPlanOS };

