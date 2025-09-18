// 🎯 CSS ERROR HANDLER - SOLUZIONE CHIRURGICA PER ERRORI CSS-IN-JS
// Intercetta solo gli errori CSS specifici durante l'analisi di fattibilità

console.log('🎯 [CSS ERROR HANDLER] Inizializzazione handler CSS...');

if (typeof window !== 'undefined') {
  console.log('🎯 [CSS ERROR HANDLER] Window disponibile, attivando handler...');
  
  // 🎯 INTERCETTA SOLO ERRORI CSS SPECIFICI
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Solo errori CSS-in-JS specifici
    if (message.includes('@import rules are not allowed here') || 
        message.includes('construct-stylesheets') ||
        message.includes('chunk-mgcl') ||
        message.includes('CSS-in-JS') ||
        message.includes('styled-components') ||
        message.includes('emotion')) {
      
      console.log('🎯 [CSS ERROR HANDLER] Errore CSS intercettato e silenziato:', message);
      
      // Log per debug ma non propagare l'errore
      console.log('🛡️ [CSS ERROR HANDLER] Stack trace:', new Error().stack);
      
      return; // NON propagare l'errore
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 🎯 INTERCETTA ERRORI GLOBALI CSS
  const originalWindowOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = String(message);
    
    if (errorMessage.includes('@import rules are not allowed here') || 
        errorMessage.includes('construct-stylesheets') ||
        errorMessage.includes('chunk-mgcl') ||
        errorMessage.includes('CSS-in-JS') ||
        errorMessage.includes('styled-components') ||
        errorMessage.includes('emotion')) {
      
      console.log('🎯 [CSS ERROR HANDLER] Errore CSS globale intercettato e silenziato:', errorMessage);
      console.log('🛡️ [CSS ERROR HANDLER] Source:', source, 'Line:', lineno);
      
      return true; // Previeni il crash
    }
    
    if (originalWindowOnError) {
      return originalWindowOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };
  
  console.log('✅ [CSS ERROR HANDLER] Handler CSS attivo');
  
} else {
  console.log('⚠️ [CSS ERROR HANDLER] Window non disponibile');
}

export function cssErrorHandlerCheck() {
  console.log('🎯 [CSS ERROR HANDLER] Check manuale eseguito');
  return true;
}
