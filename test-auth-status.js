// Test script per verificare lo stato di autenticazione
const fetch = require('node-fetch');

async function testAuthStatus() {
  try {
    console.log('🔄 Test stato autenticazione...');
    
    // Test 1: Verifica se l'app è accessibile
    const response = await fetch('http://localhost:3112/dashboard/feasibility-analysis');
    console.log(`✅ App accessibile: ${response.status}`);
    
    if (response.status === 200) {
      const html = await response.text();
      
      // Cerca indicatori di autenticazione
      if (html.includes('Utente non autenticato')) {
        console.log('❌ Utente non autenticato');
      } else if (html.includes('loading')) {
        console.log('⏳ Pagina in caricamento');
      } else if (html.includes('progetti')) {
        console.log('✅ Pagina caricata con progetti');
      } else {
        console.log('ℹ️ Pagina caricata ma stato sconosciuto');
      }
      
      // Cerca riferimenti a "Ciliegie"
      if (html.includes('Ciliegie')) {
        console.log('🍒 Trovato riferimento a "Ciliegie" nella pagina!');
      } else {
        console.log('❌ Nessun riferimento a "Ciliegie" trovato');
      }
    }
    
  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }
}

testAuthStatus();
