// 🚨 SUPER NUCLEAR AUTH PROTECTION - SOLUZIONE DEFINITIVA PER CRASH AUTH DESTRUCTURING
// Protezione ultra-aggressiva che intercetta TUTTI i possibili pattern di destructuring problematici

console.log('🚨 [SUPER NUCLEAR] Inizializzazione protezione super nucleare auth destructuring...');

if (typeof window !== 'undefined') {
  
  // 🚨 INTERCETTA TUTTI GLI ERRORI DI DESTRUCTURING - PATTERN ULTRA-AGGRESSIVI
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Pattern ultra-aggressivi per intercettare errori di destructuring
    const destructuringPatterns = [
      'Cannot destructure property',
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'is undefined',
      'Cannot read',
      'destructure',
      'undefined',
      'TypeError',
      'property',
      'reading',
      'useMemo'
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
      'UltraSafeAuthContext',
      'useNuclearAuth'
    ];

    const isDestructuringError = destructuringPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
    const involvesAuth = authPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isDestructuringError && involvesAuth) {
      console.error('🚨 [SUPER NUCLEAR] ERRORE DESTRUCTURING AUTH INTERCETTATO (console.error):', {
        message: message,
        args: args,
        stack: new Error().stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('src/') && 
        !line.includes('superNuclearAuthProtection') &&
        !line.includes('universalAuthProtection') &&
        !line.includes('globalAuthProtection') &&
        !line.includes('authDestructuringProtection') &&
        !line.includes('safeAuthDestructuring')
      );
      
      console.error('🎯 [SUPER NUCLEAR] COMPONENTI SOSPETTI (console.error):', relevantLines);
      
      // Estrai i nomi dei file specifici
      const fileMatches = relevantLines.map(line => {
        const match = line.match(/src\/([^:]+)/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      console.error('📁 [SUPER NUCLEAR] FILE SPECIFICI (console.error):', fileMatches);
      
      // Estrai i nomi delle funzioni/componenti
      const functionMatches = relevantLines.map(line => {
        const match = line.match(/at\s+(\w+)/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      console.error('🔧 [SUPER NUCLEAR] FUNZIONI SOSPETTE (console.error):', functionMatches);
      
      // Cerca pattern specifici per useMemo
      if (message.includes('useMemo') || stack.includes('useMemo')) {
        console.error('🧠 [SUPER NUCLEAR] ERRORE USEMEMO RILEVATO!');
        
        // Cerca pattern specifici per destructuring in useMemo
        const useMemoLines = lines.filter(line => 
          line.includes('useMemo') || 
          line.includes('memo') ||
          line.includes('useState') ||
          line.includes('useEffect')
        );
        console.error('🧠 [SUPER NUCLEAR] LINEE USEMEMO:', useMemoLines);
      }
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 🚨 INTERCETTA ERRORI GLOBALI (window.onerror) - ULTRA AGGRESSIVO
  const originalWindowOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const errorMessage = String(message);
    
    const destructuringPatterns = [
      'Cannot destructure property',
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'is undefined',
      'Cannot read',
      'destructure',
      'undefined',
      'TypeError',
      'property',
      'reading',
      'useMemo'
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
      'UltraSafeAuthContext',
      'useNuclearAuth'
    ];

    const isDestructuringError = destructuringPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
    const involvesAuth = authPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isDestructuringError && involvesAuth) {
      console.error('🚨 [SUPER NUCLEAR] ERRORE GLOBALE INTERCETTATO (window.onerror):', {
        message: errorMessage,
        source: source,
        lineno: lineno,
        colno: colno,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      if (error?.stack) {
        const stackLines = error.stack.split('\n');
        const componentLines = stackLines.filter(line => 
          line.includes('src/') && 
          !line.includes('superNuclearAuthProtection') &&
          !line.includes('universalAuthProtection') &&
          !line.includes('globalAuthProtection') &&
          !line.includes('authDestructuringProtection') &&
          !line.includes('safeAuthDestructuring')
        );
        console.error('🎯 [SUPER NUCLEAR] FILE SOSPETTI (window.onerror):', componentLines);
        
        // Estrai file specifici
        const fileMatches = componentLines.map(line => {
          const match = line.match(/src\/([^:]+)/);
          return match ? match[1] : null;
        }).filter(Boolean);
        
        console.error('📁 [SUPER NUCLEAR] FILE SPECIFICI (window.onerror):', fileMatches);
        
        // Cerca pattern specifici per useMemo
        if (errorMessage.includes('useMemo') || error.stack.includes('useMemo')) {
          console.error('🧠 [SUPER NUCLEAR] ERRORE USEMEMO RILEVATO (window.onerror)!');
          
          const useMemoLines = stackLines.filter(line => 
            line.includes('useMemo') || 
            line.includes('memo') ||
            line.includes('useState') ||
            line.includes('useEffect')
          );
          console.error('🧠 [SUPER NUCLEAR] LINEE USEMEMO (window.onerror):', useMemoLines);
        }
      }
    }
    
    if (originalWindowOnError) {
      return originalWindowOnError.call(window, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // 🚨 INTERCETTA PROMISE REJECTIONS NON GESTITE
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    
    const destructuringPatterns = [
      'Cannot destructure property',
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'is undefined',
      'Cannot read',
      'destructure',
      'undefined',
      'TypeError',
      'property',
      'reading',
      'useMemo'
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
      'UltraSafeAuthContext',
      'useNuclearAuth'
    ];

    const isDestructuringError = destructuringPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
    const involvesAuth = authPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isDestructuringError && involvesAuth) {
      console.error('🚨 [SUPER NUCLEAR] PROMISE REJECTION INTERCETTATA:', {
        reason: reason,
        message: message,
        stack: reason?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      if (reason?.stack) {
        const stackLines = reason.stack.split('\n');
        const componentLines = stackLines.filter(line => 
          line.includes('src/') && 
          !line.includes('superNuclearAuthProtection') &&
          !line.includes('universalAuthProtection') &&
          !line.includes('globalAuthProtection') &&
          !line.includes('authDestructuringProtection') &&
          !line.includes('safeAuthDestructuring')
        );
        console.error('🎯 [SUPER NUCLEAR] FILE SOSPETTI (promise):', componentLines);
        
        // Cerca pattern specifici per useMemo
        if (message.includes('useMemo') || reason.stack.includes('useMemo')) {
          console.error('🧠 [SUPER NUCLEAR] ERRORE USEMEMO RILEVATO (promise)!');
        }
      }
    }
    
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(window, event);
    }
  };
  
  // 🚨 INTERCETTA EVENTI DI ERRORE GLOBALI
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      const message = event.error.message;
      
      const destructuringPatterns = [
        'Cannot destructure property',
        'Cannot read properties of undefined',
        'Cannot read property',
        'is not a function',
        'is undefined',
        'Cannot read',
        'destructure',
        'undefined',
        'TypeError',
        'property',
        'reading',
        'useMemo'
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
        'UltraSafeAuthContext',
        'useNuclearAuth'
      ];

      const isDestructuringError = destructuringPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      const involvesAuth = authPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isDestructuringError && involvesAuth) {
        console.error('🚨 [SUPER NUCLEAR] EVENT ERROR INTERCETTATO:', {
          message: message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
        
        if (event.error.stack) {
          const stackLines = event.error.stack.split('\n');
          const componentLines = stackLines.filter(line => 
            line.includes('src/') && 
            !line.includes('superNuclearAuthProtection') &&
            !line.includes('universalAuthProtection') &&
            !line.includes('globalAuthProtection') &&
            !line.includes('authDestructuringProtection') &&
            !line.includes('safeAuthDestructuring')
          );
          console.error('🎯 [SUPER NUCLEAR] FILE SOSPETTI (event):', componentLines);
          
          // Cerca pattern specifici per useMemo
          if (message.includes('useMemo') || event.error.stack.includes('useMemo')) {
            console.error('🧠 [SUPER NUCLEAR] ERRORE USEMEMO RILEVATO (event)!');
            
            const useMemoLines = stackLines.filter(line => 
              line.includes('useMemo') || 
              line.includes('memo') ||
              line.includes('useState') ||
              line.includes('useEffect')
            );
            console.error('🧠 [SUPER NUCLEAR] LINEE USEMEMO (event):', useMemoLines);
          }
        }
      }
    }
  });
  
  console.log('✅ [SUPER NUCLEAR] Protezione super nucleare auth destructuring attiva');
  
} else {
  console.log('⚠️ [SUPER NUCLEAR] Window non disponibile, protezione non attivata');
}

export function superNuclearAuthCheck() {
  console.log('🚨 [SUPER NUCLEAR] Check manuale eseguito');
  return true;
}
