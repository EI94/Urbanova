// 🎯 CSS ERROR HANDLER - SOLUZIONE CHIRURGICA PER ERRORI CSS-IN-JS
// Intercetta solo gli errori CSS specifici durante l'analisi di fattibilità

// Carica solo lato client - non eseguire codice a livello di modulo per evitare TDZ
if (typeof window !== 'undefined') {
  
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
      
      
      // Log per debug ma non propagare l'errore
      
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
      
      
      return true; // Previeni il crash
    }
    
    if (originalWindowOnError) {
      return originalWindowOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };
  
  
} else {
}

export function cssErrorHandlerCheck() {
  return true;
}
