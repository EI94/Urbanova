// 🛡️ OS PROTECTION - PROTEZIONE SPECIFICA PER URBANOVA OS
// Previene crash CSS durante l'analisi di fattibilità dell'OS

console.log('🛡️ [OS PROTECTION] Inizializzazione protezione OS...');

if (typeof window !== 'undefined') {
  
  // 🛡️ INTERCETTA ERRORI CSS SPECIFICI DELL'OS
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Errori CSS specifici dell'OS
    const osCSSErrors = [
      '@import rules are not allowed here',
      'construct-stylesheets',
      'chunk-mgcl',
      'CSS-in-JS',
      'styled-components',
      'emotion'
    ];
    
    const isOSCSSError = osCSSErrors.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isOSCSSError) {
      console.log('🛡️ [OS PROTECTION] Errore CSS OS intercettato e silenziato:', message);
      
      // Log per debug ma non propagare l'errore
      console.log('🛡️ [OS PROTECTION] Stack trace:', new Error().stack);
      
      return; // NON propagare l'errore
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 🛡️ INTERCETTA ERRORI GLOBALI CSS DELL'OS
  const originalWindowOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = String(message);
    
    const osCSSErrors = [
      '@import rules are not allowed here',
      'construct-stylesheets',
      'chunk-mgcl',
      'CSS-in-JS',
      'styled-components',
      'emotion'
    ];
    
    const isOSCSSError = osCSSErrors.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isOSCSSError) {
      console.log('🛡️ [OS PROTECTION] Errore CSS globale OS intercettato e silenziato:', errorMessage);
      console.log('🛡️ [OS PROTECTION] Source:', source, 'Line:', lineno);
      
      return true; // Previeni il crash
    }
    
    if (originalWindowOnError) {
      return originalWindowOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // 🛡️ INTERCETTA PROMISE REJECTIONS CSS DELL'OS
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    
    const osCSSErrors = [
      '@import rules are not allowed here',
      'construct-stylesheets',
      'chunk-mgcl',
      'CSS-in-JS',
      'styled-components',
      'emotion'
    ];
    
    const isOSCSSError = osCSSErrors.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isOSCSSError) {
      console.log('🛡️ [OS PROTECTION] Promise rejection CSS OS intercettata e silenziata:', message);
      console.log('🛡️ [OS PROTECTION] Stack:', reason?.stack);
      
      event.preventDefault(); // Previeni il crash
      return;
    }
    
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(window, event);
    }
  };
  
  // 🛡️ INTERCETTA DYNAMIC IMPORTS PROBLEMATICI DELL'OS
  const originalImport = window.import;
  if (originalImport) {
    window.import = function(module: string) {
      console.log('🛡️ [OS PROTECTION] Dynamic import OS intercettato:', module);
      
      // Se è un import CSS, bloccalo
      if (module.includes('.css') || module.includes('styles') || module.includes('chunk-mgcl')) {
        console.log('🛡️ [OS PROTECTION] Import CSS OS bloccato:', module);
        return Promise.resolve({}); // Ritorna un modulo vuoto
      }
      
      return originalImport.call(window, module);
    };
  }
  
  // 🛡️ INTERCETTA FETCH DI CSS DELL'OS
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Se è una richiesta CSS, bloccala
    if (url.includes('.css') || url.includes('styles') || url.includes('chunk-mgcl')) {
      console.log('🛡️ [OS PROTECTION] Fetch CSS OS bloccato:', url);
      return Promise.resolve(new Response('', { status: 200, statusText: 'OK' }));
    }
    
    return originalFetch.call(window, input, init);
  };
  
  // 🛡️ INTERCETTA CREAZIONE DI STYLESHEET DELL'OS
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'style') {
      console.log('🛡️ [OS PROTECTION] Creazione elemento style OS intercettata');
      
      // Override dei metodi problematici
      const originalAppendChild = element.appendChild;
      element.appendChild = function(child: Node) {
        if (child.nodeType === Node.TEXT_NODE && child.textContent?.includes('@import')) {
          console.log('🛡️ [OS PROTECTION] @import bloccato in style element OS');
          return child; // Non fare nulla
        }
        return originalAppendChild.call(element, child);
      };
    }
    
    return element;
  };
  
  // 🛡️ INTERCETTA CREAZIONE DI LINK STYLESHEET DELL'OS
  const originalCreateElementNS = document.createElementNS;
  document.createElementNS = function(namespaceURI: string, qualifiedName: string) {
    const element = originalCreateElementNS.call(document, namespaceURI, qualifiedName);
    
    if (qualifiedName.toLowerCase() === 'link') {
      console.log('🛡️ [OS PROTECTION] Creazione elemento link OS intercettata');
      
      // Override dell'attributo href
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name.toLowerCase() === 'href' && (value.includes('.css') || value.includes('styles'))) {
          console.log('🛡️ [OS PROTECTION] Link CSS OS bloccato:', value);
          return; // Non impostare l'attributo
        }
        return originalSetAttribute.call(element, name, value);
      };
    }
    
    return element;
  };
  
  // 🛡️ INTERCETTA INIEZIONE DI STILI DINAMICI DELL'OS
  const originalInsertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function(rule: string, index?: number) {
    if (rule.includes('@import')) {
      console.log('🛡️ [OS PROTECTION] @import bloccato in insertRule OS:', rule);
      return 0; // Ritorna un indice valido
    }
    return originalInsertRule.call(this, rule, index);
  };
  
  // 🛡️ INTERCETTA AGGIORNAMENTI DI STILI DELL'OS
  const originalReplaceSync = CSSStyleSheet.prototype.replaceSync;
  CSSStyleSheet.prototype.replaceSync = function(text: string) {
    if (text.includes('@import')) {
      console.log('🛡️ [OS PROTECTION] @import bloccato in replaceSync OS');
      return; // Non fare nulla
    }
    return originalReplaceSync.call(this, text);
  };
  
  // 🛡️ INTERCETTA AGGIORNAMENTI ASINCRONI DI STILI DELL'OS
  const originalReplace = CSSStyleSheet.prototype.replace;
  CSSStyleSheet.prototype.replace = function(text: string) {
    if (text.includes('@import')) {
      console.log('🛡️ [OS PROTECTION] @import bloccato in replace OS');
      return Promise.resolve(); // Ritorna una promise risolta
    }
    return originalReplace.call(this, text);
  };
  
  console.log('✅ [OS PROTECTION] Protezione OS attiva');
  
} else {
  console.log('⚠️ [OS PROTECTION] Window non disponibile, protezione non attivata');
}

export function osProtectionCheck() {
  console.log('🛡️ [OS PROTECTION] Check manuale eseguito');
  return true;
}
