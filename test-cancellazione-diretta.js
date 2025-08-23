// Test Cancellazione Diretta - Urbanova
console.log('🚨 TEST CANCELLAZIONE DIRETTA - INIZIO...');

// Test 1: Verifica se l'endpoint di debug esiste
console.log('\n1️⃣ TEST ENDPOINT DEBUG...');

fetch('/api/debug-project-deletion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'connection' })
})
.then(response => {
  console.log('✅ Endpoint debug risponde - Status:', response.status);
  return response.text();
})
.catch(error => {
  console.log('❌ Endpoint debug non risponde:', error.message);
});

// Test 2: Verifica se ci sono progetti nella pagina
console.log('\n2️⃣ VERIFICA PROGETTI NELLA PAGINA...');

// Cerca tutti i progetti nella pagina
const projectElements = document.querySelectorAll('[data-project-id], .project-item, tr[data-id]');
console.log('🔍 Elementi progetto trovati:', projectElements.length);

if (projectElements.length > 0) {
  projectElements.forEach((el, index) => {
    console.log(`  Progetto ${index + 1}:`, {
      element: el,
      text: el.textContent?.substring(0, 100),
      attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ')
    });
  });
} else {
  console.log('⚠️ Nessun elemento progetto trovato con selettori standard');
  
  // Prova selettori alternativi
  const alternativeSelectors = [
    'tr', 'div[class*="project"]', 'div[class*="card"]', 
    '[class*="project"]', '[class*="item"]'
  ];
  
  alternativeSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`🔍 Selettore alternativo "${selector}":`, elements.length, 'elementi');
    }
  });
}

// Test 3: Verifica se ci sono pulsanti di eliminazione
console.log('\n3️⃣ VERIFICA PULSANTI ELIMINAZIONE...');

const deleteButtons = document.querySelectorAll('button[onclick*="delete"], button[onclick*="elimina"], .delete-btn, .btn-error');
console.log('🗑️ Pulsanti eliminazione trovati:', deleteButtons.length);

deleteButtons.forEach((btn, index) => {
  console.log(`  Pulsante ${index + 1}:`, {
    text: btn.textContent,
    onclick: btn.getAttribute('onclick'),
    className: btn.className
  });
});

// Test 4: Verifica se ci sono modali di conferma
console.log('\n4️⃣ VERIFICA MODALI DI CONFERMA...');

const modals = document.querySelectorAll('.modal, [class*="modal"], [class*="dialog"]');
console.log('📋 Modali trovati:', modals.length);

modals.forEach((modal, index) => {
  console.log(`  Modale ${index + 1}:`, {
    visible: modal.style.display !== 'none',
    className: modal.className,
    text: modal.textContent?.substring(0, 200)
  });
});

// Test 5: Verifica stato Firebase
console.log('\n5️⃣ VERIFICA STATO FIREBASE...');

// Prova a verificare se Firebase è disponibile
if (typeof firebase !== 'undefined') {
  console.log('✅ Firebase disponibile globalmente');
} else if (typeof window !== 'undefined' && window.firebase) {
  console.log('✅ Firebase disponibile in window.firebase');
} else {
  console.log('❌ Firebase non disponibile globalmente');
}

// Test 6: Verifica se ci sono errori JavaScript
console.log('\n6️⃣ VERIFICA ERRORI JAVASCRIPT...');

// Aggiungi listener per errori
window.addEventListener('error', (event) => {
  console.log('🚨 ERRORE JAVASCRIPT CATTURATO:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Test 7: Verifica se ci sono progetti duplicati
console.log('\n7️⃣ VERIFICA PROGETTI DUPLICATI...');

const projectNames = Array.from(document.querySelectorAll('*')).map(el => {
  const text = el.textContent || '';
  if (text.includes('Ciliegie') || text.includes('Progetto')) {
    return text.trim();
  }
  return null;
}).filter(Boolean);

const uniqueNames = [...new Set(projectNames)];
console.log('📊 Nomi progetto trovati:', uniqueNames);

// Test 8: Verifica se ci sono problemi di autenticazione
console.log('\n8️⃣ VERIFICA AUTENTICAZIONE...');

// Controlla se ci sono token o cookie di autenticazione
const cookies = document.cookie;
const hasAuthCookie = cookies.includes('auth') || cookies.includes('token') || cookies.includes('session');
console.log('🍪 Cookie autenticazione:', hasAuthCookie ? 'Trovati' : 'Non trovati');

// Test 9: Verifica se ci sono problemi di CORS
console.log('\n9️⃣ VERIFICA PROBLEMI CORS...');

// Prova una richiesta semplice
fetch('/api/health')
  .then(response => {
    console.log('✅ API Health OK - Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📄 Risposta API Health:', data);
  })
  .catch(error => {
    console.log('❌ API Health KO:', error.message);
  });

console.log('\n🏁 TEST COMPLETATI - Controlla i risultati sopra');
console.log('💡 SUGGERIMENTO: Prova a cliccare su "Elimina" su un progetto e guarda cosa succede nella console');
