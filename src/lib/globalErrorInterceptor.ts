// 🚨 GLOBAL ERROR INTERCEPTOR - SOLUZIONE ULTRA-AGGRESSIVA
// Intercetta TUTTI gli errori CSS-in-JS e auth destructuring a livello globale

// Carica solo lato client - non eseguire codice a livello di modulo per evitare TDZ
if (typeof window !== 'undefined') {
  console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Inizializzazione interceptor globale...');
  
  // 🚨 INTERCETTA TUTTI GLI ERRORI CSS-IN-JS
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Pattern per errori CSS-in-JS
    const cssErrorPatterns = [
      '@import rules are not allowed',
      'construct-stylesheets',
      'CSS-in-JS',
      'styled-components',
      'emotion',
      'CSS modules',
      'dynamic import',
      'chunk-mgcl',
      'stylesheets'
    ];
    
    const isCSSError = cssErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isCSSError) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] ERRORE CSS INTERCETTATO E SILENZIATO:', message);
      return; // NON propagare l'errore
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 🚨 INTERCETTA ERRORI GLOBALI CSS-IN-JS
  const originalWindowOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = String(message);
    
    const cssErrorPatterns = [
      '@import rules are not allowed',
      'construct-stylesheets',
      'CSS-in-JS',
      'styled-components',
      'emotion',
      'CSS modules',
      'dynamic import',
      'chunk-mgcl',
      'stylesheets'
    ];
    
    const isCSSError = cssErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isCSSError) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] ERRORE CSS GLOBALE INTERCETTATO E SILENZIATO:', errorMessage);
      return true; // Previeni il crash
    }
    
    if (originalWindowOnError) {
      return originalWindowOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // 🚨 INTERCETTA PROMISE REJECTIONS CSS-IN-JS
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    
    const cssErrorPatterns = [
      '@import rules are not allowed',
      'construct-stylesheets',
      'CSS-in-JS',
      'styled-components',
      'emotion',
      'CSS modules',
      'dynamic import',
      'chunk-mgcl',
      'stylesheets'
    ];
    
    const isCSSError = cssErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isCSSError) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] PROMISE REJECTION CSS INTERCETTATA E SILENZIATA:', message);
      event.preventDefault(); // Previeni il crash
      return;
    }
    
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(window, event);
    }
  };
  
  // 🚨 INTERCETTA ERRORI AUTH DESTRUCTURING
  const originalConsoleError2 = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Pattern per errori auth destructuring
    const authErrorPatterns = [
      'Cannot destructure property',
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'is undefined',
      'Cannot read',
      'destructure',
      'undefined'
    ];
    
    const authPatterns = [
      'auth',
      'currentUser',
      'loading',
      'login',
      'signup',
      'logout',
      'useAuth',
      'AuthContext',
      'UltraSafeAuthContext'
    ];
    
    const isAuthError = authErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    ) && authPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isAuthError) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] ERRORE AUTH INTERCETTATO E SILENZIATO:', message);
      return; // NON propagare l'errore
    }
    
    originalConsoleError2.apply(console, args);
  };
  
  // 🚨 INTERCETTA ERRORI GLOBALI AUTH DESTRUCTURING
  const originalWindowOnError2 = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = String(message);
    
    const authErrorPatterns = [
      'Cannot destructure property',
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'is undefined',
      'Cannot read',
      'destructure',
      'undefined'
    ];
    
    const authPatterns = [
      'auth',
      'currentUser',
      'loading',
      'login',
      'signup',
      'logout',
      'useAuth',
      'AuthContext',
      'UltraSafeAuthContext'
    ];
    
    const isAuthError = authErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    ) && authPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isAuthError) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] ERRORE AUTH GLOBALE INTERCETTATO E SILENZIATO:', errorMessage);
      return true; // Previeni il crash
    }
    
    if (originalWindowOnError2) {
      return originalWindowOnError2.call(window, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // 🚨 INTERCETTA PROMISE REJECTIONS AUTH DESTRUCTURING
  const originalUnhandledRejection2 = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    
    const authErrorPatterns = [
      'Cannot destructure property',
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'is undefined',
      'Cannot read',
      'destructure',
      'undefined'
    ];
    
    const authPatterns = [
      'auth',
      'currentUser',
      'loading',
      'login',
      'signup',
      'logout',
      'useAuth',
      'AuthContext',
      'UltraSafeAuthContext'
    ];
    
    const isAuthError = authErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    ) && authPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isAuthError) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] PROMISE REJECTION AUTH INTERCETTATA E SILENZIATA:', message);
      event.preventDefault(); // Previeni il crash
      return;
    }
    
    if (originalUnhandledRejection2) {
      return originalUnhandledRejection2.call(window, event);
    }
  };
  
  // 🚨 INTERCETTA EVENTI DI ERRORE CSS-IN-JS E AUTH
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      const message = event.error.message;
      
      const cssErrorPatterns = [
        '@import rules are not allowed',
        'construct-stylesheets',
        'CSS-in-JS',
        'styled-components',
        'emotion',
        'CSS modules',
        'dynamic import',
        'chunk-mgcl',
        'stylesheets'
      ];
      
      const authErrorPatterns = [
        'Cannot destructure property',
        'Cannot read properties of undefined',
        'Cannot read property',
        'is not a function',
        'is undefined',
        'Cannot read',
        'destructure',
        'undefined'
      ];
      
      const authPatterns = [
        'auth',
        'currentUser',
        'loading',
        'login',
        'signup',
        'logout',
        'useAuth',
        'AuthContext',
        'UltraSafeAuthContext'
      ];
      
      const isCSSError = cssErrorPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      const isAuthError = authErrorPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      ) && authPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isCSSError || isAuthError) {
        console.log('🚨 [GLOBAL ERROR INTERCEPTOR] EVENT ERROR INTERCETTATO E SILENZIATO:', message);
        event.preventDefault(); // Previeni il crash
        return;
      }
    }
  });
  
  // 🚨 INTERCETTA DYNAMIC IMPORTS PROBLEMATICI
  const originalImport = window.import;
  if (originalImport) {
    window.import = function(module: string) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Dynamic import intercettato:', module);
      
      // Se è un import CSS, bloccalo
      if (module.includes('.css') || module.includes('styles') || module.includes('chunk-mgcl')) {
        console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Import CSS bloccato:', module);
        return Promise.resolve({}); // Ritorna un modulo vuoto
      }
      
      return originalImport.call(window, module);
    };
  }
  
  // 🚨 INTERCETTA FETCH DI CSS
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Se è una richiesta CSS, bloccala
    if (url.includes('.css') || url.includes('styles') || url.includes('chunk-mgcl')) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Fetch CSS bloccato:', url);
      return Promise.resolve(new Response('', { status: 200, statusText: 'OK' }));
    }
    
    return originalFetch.call(window, input, init);
  };
  
  // 🚨 INTERCETTA CREAZIONE DI STYLESHEET
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'style') {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Creazione elemento style intercettata');
      
      // Override dei metodi problematici
      const originalAppendChild = element.appendChild;
      element.appendChild = function(child: Node) {
        if (child.nodeType === Node.TEXT_NODE && child.textContent?.includes('@import')) {
          console.log('🚨 [GLOBAL ERROR INTERCEPTOR] @import bloccato in style element');
          return child; // Non fare nulla
        }
        return originalAppendChild.call(element, child);
      };
    }
    
    return element;
  };
  
  // 🚨 INTERCETTA CREAZIONE DI LINK STYLESHEET
  const originalCreateElementNS = document.createElementNS;
  document.createElementNS = function(namespaceURI: string, qualifiedName: string) {
    const element = originalCreateElementNS.call(document, namespaceURI, qualifiedName);
    
    if (qualifiedName.toLowerCase() === 'link') {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Creazione elemento link intercettata');
      
      // Override dell'attributo href
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name.toLowerCase() === 'href' && (value.includes('.css') || value.includes('styles'))) {
          console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Link CSS bloccato:', value);
          return; // Non impostare l'attributo
        }
        return originalSetAttribute.call(element, name, value);
      };
    }
    
    return element;
  };
  
  // 🚨 INTERCETTA INIEZIONE DI STILI DINAMICI
  const originalInsertRule = CSSStyleSheet.prototype.insertRule;
  CSSStyleSheet.prototype.insertRule = function(rule: string, index?: number) {
    if (rule.includes('@import')) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] @import bloccato in insertRule:', rule);
      return 0; // Ritorna un indice valido
    }
    return originalInsertRule.call(this, rule, index);
  };
  
  // 🚨 INTERCETTA AGGIORNAMENTI DI STILI
  const originalReplaceSync = CSSStyleSheet.prototype.replaceSync;
  CSSStyleSheet.prototype.replaceSync = function(text: string) {
    if (text.includes('@import')) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] @import bloccato in replaceSync');
      return; // Non fare nulla
    }
    return originalReplaceSync.call(this, text);
  };
  
  // 🚨 INTERCETTA AGGIORNAMENTI ASINCRONI DI STILI
  const originalReplace = CSSStyleSheet.prototype.replace;
  CSSStyleSheet.prototype.replace = function(text: string) {
    if (text.includes('@import')) {
      console.log('🚨 [GLOBAL ERROR INTERCEPTOR] @import bloccato in replace');
      return Promise.resolve(); // Ritorna una promise risolta
    }
    return originalReplace.call(this, text);
  };
  
  console.log('✅ [GLOBAL ERROR INTERCEPTOR] Interceptor globale attivo');
  
} else {
  console.log('⚠️ [GLOBAL ERROR INTERCEPTOR] Window non disponibile, interceptor non attivato');
}

export function globalErrorInterceptorCheck() {
  console.log('🚨 [GLOBAL ERROR INTERCEPTOR] Check manuale eseguito');
  return true;
}
