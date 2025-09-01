#!/usr/bin/env node

/**
 * Script di Test Manuale per il Flusso SAL
 * Esegue un test completo del workflow SAL in modalità interattiva
 *
 * Utilizzo: node scripts/test-sal-manual.js
 */

const readline = require('readline');
const axios = require('axios');

// Configurazione
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/sal`;

// Colori per console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.cyan}${step}${colors.reset}: ${message}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test data
const testData = {
  projectId: 'test-project-' + Date.now(),
  vendorId: 'test-vendor-' + Date.now(),
  vendorEmail: 'vendor@test.com',
  title: 'Test SAL Manuale - Lavori di Costruzione',
  description: 'Test manuale della funzionalità SAL',
  lines: [
    {
      description: 'Fondazioni',
      quantity: 100,
      unitPrice: 150,
      totalPrice: 15000,
    },
    {
      description: 'Struttura',
      quantity: 200,
      unitPrice: 200,
      totalPrice: 40000,
    },
  ],
  terms: 'Pagamento 30 giorni dalla firma',
  conditions: ['Certificazioni valide', 'Assicurazione RC'],
};

let currentSAL = null;

// Funzioni di test
async function testCreateSAL() {
  logStep('1. Creazione SAL', 'Creando nuovo SAL...');

  try {
    const response = await axios.post(`${API_BASE}/create`, testData);

    if (response.data.success) {
      currentSAL = response.data.sal;
      logSuccess(`SAL creato con ID: ${currentSAL.id}`);
      logInfo(`Stato: ${currentSAL.status}`);
      logInfo(`Importo totale: €${(currentSAL.totalAmount / 100).toFixed(2)}`);
      return true;
    } else {
      logError('Creazione SAL fallita');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    logError(`Errore creazione SAL: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
    return false;
  }
}

async function testSendSAL() {
  if (!currentSAL) {
    logError("Nessun SAL disponibile per l'invio");
    return false;
  }

  logStep('2. Invio SAL', 'Inviando SAL al vendor...');

  try {
    const response = await axios.post(`${API_BASE}/send`, {
      salId: currentSAL.id,
      vendorEmail: testData.vendorEmail,
      message: 'Test invio SAL manuale',
    });

    if (response.data.success) {
      currentSAL = response.data.sal;
      logSuccess('SAL inviato al vendor');
      logInfo(`Stato: ${currentSAL.status}`);
      logInfo(`Data invio: ${new Date(currentSAL.sentAt).toLocaleString()}`);
      return true;
    } else {
      logError('Invio SAL fallito');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    logError(`Errore invio SAL: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
    return false;
  }
}

async function testVendorSign() {
  if (!currentSAL) {
    logError('Nessun SAL disponibile per la firma');
    return false;
  }

  logStep('3. Firma Vendor', 'Simulando firma del vendor...');

  try {
    const response = await axios.post(`${API_BASE}/sign`, {
      salId: currentSAL.id,
      signerId: testData.vendorId,
      signerName: 'Test Vendor',
      signerRole: 'VENDOR',
      signatureHash: 'vendor-signature-' + Date.now(),
    });

    if (response.data.success) {
      currentSAL = response.data.sal;
      logSuccess('Vendor ha firmato il SAL');
      logInfo(`Stato: ${currentSAL.status}`);
      logInfo(`Firme: ${currentSAL.signatures.length}`);
      return true;
    } else {
      logError('Firma vendor fallita');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    logError(`Errore firma vendor: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
    return false;
  }
}

async function testPMSign() {
  if (!currentSAL) {
    logError('Nessun SAL disponibile per la firma PM');
    return false;
  }

  logStep('4. Firma PM', 'Simulando firma del Project Manager...');

  try {
    const response = await axios.post(`${API_BASE}/sign`, {
      salId: currentSAL.id,
      signerId: 'test-pm-' + Date.now(),
      signerName: 'Test Project Manager',
      signerRole: 'PM',
      signatureHash: 'pm-signature-' + Date.now(),
    });

    if (response.data.success) {
      currentSAL = response.data.sal;
      logSuccess('PM ha firmato il SAL');
      logInfo(`Stato: ${currentSAL.status}`);
      logInfo(`Firme: ${currentSAL.signatures.length}`);
      return true;
    } else {
      logError('Firma PM fallita');
      console.log(error.response.data);
      return false;
    }
  } catch (error) {
    logError(`Errore firma PM: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
    return false;
  }
}

async function testPayment() {
  if (!currentSAL) {
    logError('Nessun SAL disponibile per il pagamento');
    return false;
  }

  logStep('5. Pagamento', 'Processando pagamento del SAL...');

  try {
    const response = await axios.post(`${API_BASE}/pay`, {
      salId: currentSAL.id,
    });

    if (response.data.success) {
      currentSAL = response.data.sal;
      logSuccess('Pagamento processato con successo');
      logInfo(`Stato: ${currentSAL.status}`);
      logInfo(`Payment Intent ID: ${currentSAL.payment?.stripePaymentIntentId}`);
      logInfo(`Receipt URL: ${currentSAL.payment?.receiptUrl}`);
      return true;
    } else {
      logError('Pagamento fallito');
      console.log(response.data);
      return false;
    }
  } catch (error) {
    logError(`Errore pagamento: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
    return false;
  }
}

async function testGetSAL() {
  if (!currentSAL) {
    logError('Nessun SAL disponibile per la verifica');
    return false;
  }

  logStep('6. Verifica Finale', 'Verificando stato finale del SAL...');

  try {
    // Simula chiamata per ottenere SAL aggiornato
    logInfo(`ID SAL: ${currentSAL.id}`);
    logInfo(`Stato finale: ${currentSAL.status}`);
    logInfo(`Importo totale: €${(currentSAL.totalAmount / 100).toFixed(2)}`);
    logInfo(`Numero firme: ${currentSAL.signatures?.length || 0}`);

    if (currentSAL.payment) {
      logInfo(`Pagamento completato: ${currentSAL.payment.stripePaymentIntentId}`);
      logInfo(`Ricevuta: ${currentSAL.payment.receiptUrl}`);
    }

    return true;
  } catch (error) {
    logError(`Errore verifica finale: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 Iniziando Test Manuale del Flusso SAL', 'bright');
  log('=' * 50, 'cyan');

  let allPassed = true;

  // Esegui tutti i test in sequenza
  const tests = [
    { name: 'Creazione SAL', fn: testCreateSAL },
    { name: 'Invio SAL', fn: testSendSAL },
    { name: 'Firma Vendor', fn: testVendorSign },
    { name: 'Firma PM', fn: testPMSign },
    { name: 'Pagamento', fn: testPayment },
    { name: 'Verifica Finale', fn: testGetSAL },
  ];

  for (const test of tests) {
    log(`\n${colors.magenta}Esecuzione: ${test.name}${colors.reset}`);

    try {
      const result = await test.fn();
      if (!result) {
        allPassed = false;
        logWarning(`Test ${test.name} fallito`);
        break;
      }
    } catch (error) {
      allPassed = false;
      logError(`Errore durante ${test.name}: ${error.message}`);
      break;
    }
  }

  // Risultato finale
  log('\n' + '=' * 50, 'cyan');
  if (allPassed) {
    log('🎉 TUTTI I TEST SONO PASSATI!', 'green');
    log('Il flusso SAL funziona correttamente', 'green');
  } else {
    log('💥 ALCUNI TEST SONO FALLITI', 'red');
    log('Controlla i log per i dettagli', 'red');
  }

  return allPassed;
}

// Funzione principale
async function main() {
  try {
    log('🧪 Test Manuale Flusso SAL - Urbanova', 'bright');
    log("Questo script testa l'intero workflow SAL", 'cyan');
    log(`URL Base: ${BASE_URL}`, 'blue');

    // Verifica connessione
    try {
      await axios.get(`${BASE_URL}/api/health`);
      logSuccess('Server raggiungibile');
    } catch (error) {
      logError('Server non raggiungibile. Assicurati che sia in esecuzione.');
      process.exit(1);
    }

    // Esegui test
    const success = await runAllTests();

    if (success) {
      log('\n📋 Riepilogo Test:', 'bright');
      log('✅ Creazione SAL', 'green');
      log('✅ Invio SAL', 'green');
      log('✅ Firma Vendor', 'green');
      log('✅ Firma PM', 'green');
      log('✅ Pagamento', 'green');
      log('✅ Verifica Finale', 'green');
    }
  } catch (error) {
    logError(`Errore generale: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Gestione interruzione
process.on('SIGINT', () => {
  log("\n\n⚠️  Test interrotto dall'utente", 'yellow');
  rl.close();
  process.exit(0);
});

// Esegui se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  testCreateSAL,
  testSendSAL,
  testVendorSign,
  testPMSign,
  testPayment,
  testGetSAL,
};
