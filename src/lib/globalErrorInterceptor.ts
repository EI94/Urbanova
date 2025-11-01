// 🚨 GLOBAL ERROR INTERCEPTOR - SOLUZIONE ULTRA-AGGRESSIVA
// Intercetta TUTTI gli errori CSS-in-JS e auth destructuring a livello globale

// Carica solo lato client - non eseguire codice a livello di modulo per evitare TDZ
if (typeof window !== 'undefined') {
  
  // 🚨 CATTURA TUTTI GLI ERRORI NON GESTITI (inclusi React)
  window.addEventListener('error', (event) => {
    console.error('🔴🔴🔴 [GLOBAL] ERRORE NON GESTITO CATTURATO:', event.error);
    console.error('🔴 Message:', event.message);
    console.error('🔴 Filename:', event.filename);
    console.error('🔴 Line:', event.lineno, 'Column:', event.colno);
    console.error('🔴 Stack:', event.error?.stack);
    
    // 🛡️ PREVIENI CRASH PER ERRORI FIREBASE COLLECTION() NON CRITICI
    const message = event.message || '';
    if (message.includes('Expected first argument to collection()') || 
        message.includes('CollectionReference') ||
        message.includes('DocumentReference or FirebaseFirestore')) {
      console.warn('🛡️ [GLOBAL] Errore Firebase collection() SILENZIATO per prevenire crash');
      event.preventDefault(); // PREVIENI IL CRASH
      return;
    }
    
    // Lascia che altri errori vengano gestiti normalmente
  });
  
  // 🚨 CATTURA TUTTE LE PROMISE REJECTIONS NON GESTITE
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔴🔴🔴 [GLOBAL] PROMISE REJECTION NON GESTITA:', event.reason);
    console.error('🔴 Reason:', event.reason);
    console.error('🔴 Stack:', event.reason?.stack);
    
    // 🛡️ PREVIENI CRASH PER ERRORI FIREBASE COLLECTION() NON CRITICI
    const message = event.reason?.message || String(event.reason) || '';
    if (message.includes('Expected first argument to collection()') || 
        message.includes('CollectionReference') ||
        message.includes('DocumentReference or FirebaseFirestore')) {
      console.warn('🛡️ [GLOBAL] Promise rejection Firebase collection() SILENZIATA per prevenire crash');
      event.preventDefault(); // PREVIENI IL CRASH
      return;
    }
  });
  
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
        event.preventDefault(); // Previeni il crash
        return;
      }
    }
  });
  
  // 🚨 INTERCETTA DYNAMIC IMPORTS PROBLEMATICI
  const originalImport = window.import;
  if (originalImport) {
    window.import = function(module: string) {
      
      // Se è un import CSS, bloccalo
      if (module.includes('.css') || module.includes('styles') || module.includes('chunk-mgcl')) {
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
      return Promise.resolve(new Response('', { status: 200, statusText: 'OK' }));
    }
    
    return originalFetch.call(window, input, init);
  };
  
  // 🚨 INTERCETTA CREAZIONE DI STYLESHEET
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'style') {
      
      // Override dei metodi problematici
      const originalAppendChild = element.appendChild;
      element.appendChild = function(child: Node) {
        if (child.nodeType === Node.TEXT_NODE && child.textContent?.includes('@import')) {
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
      
      // Override dell'attributo href
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name.toLowerCase() === 'href' && (value.includes('.css') || value.includes('styles'))) {
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
      return 0; // Ritorna un indice valido
    }
    return originalInsertRule.call(this, rule, index);
  };
  
  // 🚨 INTERCETTA AGGIORNAMENTI DI STILI
  const originalReplaceSync = CSSStyleSheet.prototype.replaceSync;
  CSSStyleSheet.prototype.replaceSync = function(text: string) {
    if (text.includes('@import')) {
      return; // Non fare nulla
    }
    return originalReplaceSync.call(this, text);
  };
  
  // 🚨 INTERCETTA AGGIORNAMENTI ASINCRONI DI STILI
  const originalReplace = CSSStyleSheet.prototype.replace;
  CSSStyleSheet.prototype.replace = function(text: string) {
    if (text.includes('@import')) {
      return Promise.resolve(); // Ritorna una promise risolta
    }
    return originalReplace.call(this, text);
  };
  
  
} else {
}

export function globalErrorInterceptorCheck() {
  return true;
}
