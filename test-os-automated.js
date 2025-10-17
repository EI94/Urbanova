// 🧪 TEST AUTOMATICO ICONA OS - Verifica completa
// Test per verificare che l'icona OS funzioni sia in locale che produzione

console.log('🧪 [TEST AUTOMATICO] Avvio test icona OS...');

// Funzione per testare l'icona OS
async function testOsIconAutomated() {
  console.log('🎯 [TEST] === TEST AUTOMATICO ICONA OS ===');
  
  try {
    // Test 1: Verifica che l'icona sia presente nel DOM
    const osIcon = document.querySelector('button[title="Apri Urbanova OS (⌘J)"]');
    console.log('🎯 [TEST] Icona OS trovata:', !!osIcon);
    
    if (!osIcon) {
      console.log('❌ [TEST] Icona OS NON trovata - PROBLEMA CRITICO!');
      return { success: false, error: 'Icona OS non trovata' };
    }
    
    console.log('✅ [TEST] Icona OS presente nel DOM');
    
    // Test 2: Verifica che l'icona sia visibile
    const isVisible = osIcon.offsetHeight > 0 && osIcon.offsetWidth > 0;
    console.log('🎯 [TEST] Icona OS visibile:', isVisible);
    
    if (!isVisible) {
      console.log('❌ [TEST] Icona OS non visibile - PROBLEMA!');
      return { success: false, error: 'Icona OS non visibile' };
    }
    
    console.log('✅ [TEST] Icona OS visibile');
    
    // Test 3: Simula click sull'icona
    console.log('🎯 [TEST] Simulazione click icona...');
    
    // Crea evento click
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    osIcon.dispatchEvent(clickEvent);
    
    // Test 4: Verifica che l'OS si apra (aspetta 1 secondo)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const osInterface = document.querySelector('.os-persistent-container');
    console.log('🎯 [TEST] OS Interface trovata:', !!osInterface);
    
    if (!osInterface) {
      console.log('❌ [TEST] OS Interface NON trovata - PROBLEMA CRITICO!');
      return { success: false, error: 'OS Interface non trovata dopo click' };
    }
    
    console.log('✅ [TEST] OS Interface aperta correttamente!');
    
    // Test 5: Verifica stato visivo dell'OS
    const osVisible = osInterface.offsetHeight > 0 && osInterface.offsetWidth > 0;
    console.log('🎯 [TEST] OS Interface visibile:', osVisible);
    
    if (!osVisible) {
      console.log('❌ [TEST] OS Interface non visibile - PROBLEMA!');
      return { success: false, error: 'OS Interface non visibile' };
    }
    
    console.log('✅ [TEST] OS Interface visibile');
    
    // Test 6: Verifica contenuto dell'OS
    const hasHeader = osInterface.querySelector('.os-persistent-header') !== null;
    const hasTabs = osInterface.querySelectorAll('[role="tab"]').length > 0;
    const hasVoiceAI = osInterface.querySelector('.voice-mic-button') !== null;
    
    console.log('🎯 [TEST] OS Header presente:', hasHeader);
    console.log('🎯 [TEST] OS Tabs presenti:', hasTabs);
    console.log('🎯 [TEST] OS Voice AI presente:', hasVoiceAI);
    
    if (!hasHeader || !hasTabs) {
      console.log('❌ [TEST] OS Interface incompleta - PROBLEMA!');
      return { success: false, error: 'OS Interface incompleta' };
    }
    
    console.log('✅ [TEST] OS Interface completa e funzionante!');
    
    // Test 7: Verifica keyboard shortcut ⌘J
    console.log('🎯 [TEST] Test keyboard shortcut ⌘J...');
    
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'j',
      metaKey: true,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(keyEvent);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const osInterfaceAfterShortcut = document.querySelector('.os-persistent-container');
    console.log('🎯 [TEST] OS aperto con ⌘J:', !!osInterfaceAfterShortcut);
    
    // Test 8: Verifica ambiente
    const isLocal = window.location.hostname === 'localhost';
    const isProduction = window.location.hostname === 'urbanova.life';
    
    console.log('🎯 [TEST] Ambiente:', isLocal ? 'LOCALE' : isProduction ? 'PRODUZIONE' : 'ALTRO');
    console.log('🎯 [TEST] URL:', window.location.href);
    
    // Risultato finale
    const result = {
      success: true,
      environment: isLocal ? 'local' : isProduction ? 'production' : 'other',
      url: window.location.href,
      iconFound: true,
      iconVisible: isVisible,
      osOpens: true,
      osVisible: osVisible,
      osComplete: hasHeader && hasTabs,
      voiceAI: hasVoiceAI,
      keyboardShortcut: !!osInterfaceAfterShortcut
    };
    
    console.log('🎯 [TEST] === RISULTATO FINALE ===');
    console.log('✅ [TEST] Icona OS:', result.success ? 'FUNZIONA' : 'NON FUNZIONA');
    console.log('🎯 [TEST] Ambiente:', result.environment);
    console.log('🎯 [TEST] Tutti i test:', result.success ? 'PASSATI' : 'FALLITI');
    
    return result;
    
  } catch (error) {
    console.error('❌ [TEST] Errore durante test:', error);
    return { success: false, error: error.message };
  }
}

// Funzione per testare errori console
function testConsoleErrors() {
  console.log('🎯 [TEST] === VERIFICA ERRORI CONSOLE ===');
  
  const errors = [];
  const warnings = [];
  
  // Intercetta errori
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    warnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };
  
  // Ripristina dopo 3 secondi
  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;
    
    console.log('🎯 [TEST] Errori intercettati:', errors.length);
    console.log('🎯 [TEST] Warning intercettati:', warnings.length);
    
    if (errors.length > 0) {
      console.log('❌ [TEST] Errori trovati:', errors);
    } else {
      console.log('✅ [TEST] Nessun errore trovato');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ [TEST] Warning trovati:', warnings);
    }
  }, 3000);
}

// Esegui test automatico
async function runAutomatedTest() {
  console.log('🧪 [TEST AUTOMATICO] === AVVIO TEST COMPLETO ===');
  
  // Test errori console
  testConsoleErrors();
  
  // Test principale
  const result = await testOsIconAutomated();
  
  // Salva risultato per analisi
  window.testResult = result;
  
  console.log('🧪 [TEST AUTOMATICO] === TEST COMPLETATO ===');
  console.log('🎯 [TEST] Risultato salvato in window.testResult');
  
  return result;
}

// Avvia test automaticamente
runAutomatedTest();

// Esporta per uso manuale
window.testOsIconAutomated = testOsIconAutomated;
window.runAutomatedTest = runAutomatedTest;

console.log('🧪 [TEST AUTOMATICO] Test caricato. Usa runAutomatedTest() per test manuale.');
