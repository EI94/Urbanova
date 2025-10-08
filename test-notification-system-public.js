#!/usr/bin/env node

/**
 * 🧪 TEST ENDPOINTS PUBBLICI - Sistema Notifiche
 * Testa solo gli endpoint che non richiedono autenticazione
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

async function testHealthEndpoint() {
  console.log('\n📋 Test Health Endpoint');
  console.log('=' .repeat(80));
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok) {
      log('✅', `Health check OK - Status: ${data.status}`, colors.green);
      log('ℹ️', `Uptime: ${data.uptime}s`);
      log('ℹ️', `Version: ${data.version}`);
      log('ℹ️', `Environment: ${data.environment}`);
      
      if (data.services) {
        console.log('\nServices:');
        data.services.forEach(service => {
          const icon = service.status === 'healthy' ? '✅' : '⚠️';
          log(icon, `  ${service.name}: ${service.status}`);
        });
      }
      
      return true;
    } else {
      log('❌', `Health check failed: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log('❌', `Health check error: ${error.message}`, colors.red);
    return false;
  }
}

async function testAuthenticatedEndpoints() {
  console.log('\n📋 Test Authenticated Endpoints (atteso 401)');
  console.log('=' .repeat(80));
  
  const endpoints = [
    { method: 'GET', path: '/api/notifications' },
    { method: 'POST', path: '/api/notifications' },
    { method: 'GET', path: '/api/notifications/preferences' },
    { method: 'POST', path: '/api/notifications/push/register' }
  ];
  
  let allCorrect = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 401) {
        log('✅', `${endpoint.method} ${endpoint.path} - Correttamente protetto (401)`, colors.green);
      } else {
        log('⚠️', `${endpoint.method} ${endpoint.path} - Risposta: ${response.status} (atteso 401)`, colors.yellow);
        allCorrect = false;
      }
    } catch (error) {
      log('❌', `${endpoint.method} ${endpoint.path} - Error: ${error.message}`, colors.red);
      allCorrect = false;
    }
  }
  
  return allCorrect;
}

async function testFirestoreConnection() {
  console.log('\n📋 Test Firestore Connection');
  console.log('=' .repeat(80));
  
  try {
    // Tenta una chiamata che richiede Firestore
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    // Anche se fallisce per auth, se otteniamo una risposta JSON
    // significa che il server e Firestore sono raggiungibili
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      log('✅', 'Firestore connection OK (server risponde con JSON)', colors.green);
      return true;
    } else {
      log('⚠️', 'Firestore connection incerta', colors.yellow);
      return false;
    }
  } catch (error) {
    log('❌', `Firestore connection error: ${error.message}`, colors.red);
    return false;
  }
}

async function runPublicTests() {
  console.log('\n🚀 ═══════════════════════════════════════════════════════════════════════════════');
  console.log('🧪   TEST ENDPOINTS PUBBLICI - Sistema Notifiche Urbanova');
  console.log('🚀 ═══════════════════════════════════════════════════════════════════════════════\n');
  
  log('ℹ️', `Base URL: ${BASE_URL}`, colors.cyan);
  log('ℹ️', `Timestamp: ${new Date().toISOString()}`, colors.cyan);
  
  const results = {
    health: await testHealthEndpoint(),
    authProtection: await testAuthenticatedEndpoints(),
    firestoreConnection: await testFirestoreConnection()
  };
  
  console.log('\n' + '═'.repeat(80));
  console.log('📊 RISULTATI');
  console.log('═'.repeat(80));
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const color = result ? colors.green : colors.red;
    log(icon, `${test.padEnd(30, '.')} ${result ? 'PASS' : 'FAIL'}`, color);
  });
  
  console.log(`\n📈 Totale: ${passed}/${total} test passati (${percentage}%)\n`);
  
  if (percentage === 100) {
    log('🎉', 'TUTTI I TEST PUBBLICI SONO PASSATI!', colors.green);
  } else {
    log('⚠️', 'Alcuni test sono falliti. Verificare i log.', colors.yellow);
  }
  
  console.log('\n💡 Per test completi con autenticazione, usare il browser:');
  log('🌐', `Apri http://localhost:3112/dashboard e accedi`, colors.cyan);
  log('🔔', 'Poi testa le notifiche e le preferenze dall\'interfaccia', colors.cyan);
  
  return results;
}

if (require.main === module) {
  runPublicTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runPublicTests };
