// 🧪 TEST COMPLETO ICONA OS - Verifica funzionamento completo
// Test per verificare che l'icona OS si apra correttamente sia in locale che produzione

console.log('🧪 [TEST COMPLETO] Avvio test icona OS...');

// Funzione per testare l'icona OS
function testOsIcon() {
  console.log('🎯 [TEST] === INIZIO TEST ICONA OS ===');
  
  // Test 1: Verifica che l'icona sia presente nel DOM
  const osIcon = document.querySelector('button[title="Apri Urbanova OS (⌘J)"]');
  console.log('🎯 [TEST] Icona OS trovata:', !!osIcon);
  
  if (!osIcon) {
    console.log('❌ [TEST] Icona OS NON trovata - PROBLEMA CRITICO!');
    return false;
  }
  
  console.log('✅ [TEST] Icona OS presente nel DOM');
  
  // Test 2: Verifica che l'icona abbia il click handler
  const hasClickHandler = osIcon.onclick !== null || osIcon.getAttribute('onclick') !== null;
  console.log('🎯 [TEST] Click handler presente:', hasClickHandler);
  
  // Test 3: Simula click sull'icona
  console.log('🎯 [TEST] Simulazione click icona...');
  
  // Crea evento click
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  
  osIcon.dispatchEvent(clickEvent);
  
  // Test 4: Verifica che l'OS si apra
  setTimeout(() => {
    const osInterface = document.querySelector('.os-persistent-container');
    console.log('🎯 [TEST] OS Interface trovata:', !!osInterface);
    
    if (osInterface) {
      console.log('✅ [TEST] OS Interface aperta correttamente!');
      
      // Test 5: Verifica stato visivo
      const isVisible = osInterface.style.display !== 'none' && 
                       !osInterface.classList.contains('hidden') &&
                       osInterface.offsetHeight > 0;
      console.log('🎯 [TEST] OS Interface visibile:', isVisible);
      
      // Test 6: Verifica contenuto
      const hasContent = osInterface.querySelector('.os-persistent-header') !== null;
      console.log('🎯 [TEST] OS Interface ha contenuto:', hasContent);
      
      if (isVisible && hasContent) {
        console.log('✅ [TEST] OS Interface completamente funzionante!');
        
        // Test 7: Verifica Voice AI
        const voiceAI = osInterface.querySelector('.voice-mic-button');
        console.log('🎯 [TEST] Voice AI presente:', !!voiceAI);
        
        // Test 8: Verifica tabs
        const tabs = osInterface.querySelectorAll('[role="tab"]');
        console.log('🎯 [TEST] Tabs presenti:', tabs.length);
        
        console.log('🎯 [TEST] === TEST COMPLETATO CON SUCCESSO ===');
        return true;
      } else {
        console.log('❌ [TEST] OS Interface non completamente funzionante');
        return false;
      }
    } else {
      console.log('❌ [TEST] OS Interface NON trovata - PROBLEMA CRITICO!');
      return false;
    }
  }, 1000);
  
  return true;
}

// Funzione per testare keyboard shortcut
function testKeyboardShortcut() {
  console.log('🎯 [TEST] === TEST KEYBOARD SHORTCUT ===');
  
  // Simula ⌘J
  const keyEvent = new KeyboardEvent('keydown', {
    key: 'j',
    metaKey: true,
    bubbles: true,
    cancelable: true
  });
  
  document.dispatchEvent(keyEvent);
  
  setTimeout(() => {
    const osInterface = document.querySelector('.os-persistent-container');
    console.log('🎯 [TEST] OS aperto con ⌘J:', !!osInterface);
  }, 500);
}

// Funzione per testare console errors
function testConsoleErrors() {
  console.log('🎯 [TEST] === VERIFICA ERRORI CONSOLE ===');
  
  // Intercetta errori
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Ripristina dopo 2 secondi
  setTimeout(() => {
    console.error = originalError;
    console.log('🎯 [TEST] Errori intercettati:', errors.length);
    if (errors.length > 0) {
      console.log('❌ [TEST] Errori trovati:', errors);
    } else {
      console.log('✅ [TEST] Nessun errore trovato');
    }
  }, 2000);
}

// Esegui tutti i test
function runAllTests() {
  console.log('🧪 [TEST COMPLETO] === AVVIO TUTTI I TEST ===');
  
  // Test principale
  const iconTest = testOsIcon();
  
  // Test keyboard shortcut
  setTimeout(() => {
    testKeyboardShortcut();
  }, 2000);
  
  // Test errori
  testConsoleErrors();
  
  // Risultato finale
  setTimeout(() => {
    console.log('🧪 [TEST COMPLETO] === RISULTATO FINALE ===');
    console.log('🎯 [TEST] Icona OS:', iconTest ? '✅ FUNZIONA' : '❌ NON FUNZIONA');
    console.log('🎯 [TEST] Ambiente:', window.location.hostname === 'localhost' ? 'LOCALE' : 'PRODUZIONE');
    console.log('🎯 [TEST] URL:', window.location.href);
  }, 3000);
}

// Avvia test automaticamente
runAllTests();

// Esporta per uso manuale
window.testOsIcon = testOsIcon;
window.testKeyboardShortcut = testKeyboardShortcut;
window.runAllTests = runAllTests;

console.log('🧪 [TEST COMPLETO] Test caricato. Usa testOsIcon() per test manuale.');
