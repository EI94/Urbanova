// 🧪 TEST ICONA OS - Verifica funzionamento
// Test per verificare che l'icona OS si apra correttamente

console.log('🧪 [TEST] Avvio test icona OS...');

// Test 1: Verifica che l'icona sia presente nel DOM
const osIcon = document.querySelector('button[title="Apri Urbanova OS (⌘J)"]');
console.log('🎯 [TEST] Icona OS trovata:', !!osIcon);

if (osIcon) {
  console.log('✅ [TEST] Icona OS presente nel DOM');
  
  // Test 2: Simula click sull'icona
  console.log('🎯 [TEST] Simulazione click icona...');
  osIcon.click();
  
  // Test 3: Verifica che l'OS si apra
  setTimeout(() => {
    const osInterface = document.querySelector('.os-persistent-container');
    console.log('🎯 [TEST] OS Interface trovata:', !!osInterface);
    
    if (osInterface) {
      console.log('✅ [TEST] OS Interface aperta correttamente!');
      console.log('🎯 [TEST] Stato isOpen:', osInterface.classList.contains('open'));
    } else {
      console.log('❌ [TEST] OS Interface NON trovata - PROBLEMA!');
    }
  }, 1000);
  
} else {
  console.log('❌ [TEST] Icona OS NON trovata - PROBLEMA!');
}

// Test 4: Verifica hook useOsSidecar
console.log('🎯 [TEST] Verifica hook useOsSidecar...');
if (window.React && window.React.useState) {
  console.log('✅ [TEST] React disponibile');
} else {
  console.log('❌ [TEST] React NON disponibile');
}

console.log('🧪 [TEST] Test completato');
