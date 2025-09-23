// Test Semplice Cancellazione - Urbanova
console.log('🧪 TEST SEMPLICE CANCELLAZIONE PROGETTI...');

// Test 1: Verifica connessione Firebase
console.log('\n1️⃣ TEST CONNESSIONE FIREBASE...');

fetch('https://www.urbanova.life/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Health OK:', data);
  })
  .catch(error => {
    console.log('❌ API Health KO:', error.message);
  });

// Test 2: Verifica se la pagina principale carica
console.log('\n2️⃣ TEST PAGINA PRINCIPALE...');

fetch('https://www.urbanova.life')
  .then(response => {
    console.log('✅ Pagina principale OK - Status:', response.status);
    return response.text();
  })
  .then(html => {
    if (html.includes('Analisi di Fattibilità')) {
      console.log('✅ Sezione Analisi di Fattibilità trovata nella pagina');
    } else if (html.includes('Accedi al tuo account')) {
      console.log('⚠️ Pagina di login rilevata - utente non autenticato');
    } else {
      console.log('❓ Contenuto pagina non riconosciuto');
    }
  })
  .catch(error => {
    console.log('❌ Pagina principale KO:', error.message);
  });

// Test 3: Verifica se ci sono problemi di CORS o autenticazione
console.log('\n3️⃣ TEST AUTENTICAZIONE...');

fetch('https://www.urbanova.life/api/feasibility-recalculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ test: 'auth' }),
})
  .then(response => {
    console.log('✅ API Auth OK - Status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('📄 Risposta API:', data.substring(0, 200));
  })
  .catch(error => {
    console.log('❌ API Auth KO:', error.message);
  });

console.log('\n🏁 TEST COMPLETATI - Controlla i risultati sopra');
