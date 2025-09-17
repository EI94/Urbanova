// CHIRURGICO: Protezione ultra-sicura contro auth destructuring
// Questo file deve essere importato prima di qualsiasi componente che usa useAuth

console.log('🛡️ [AUTH PROTECTION] Inizializzazione protezione auth destructuring...');

// Intercetta errori di destructuring auth
if (typeof window !== 'undefined') {
  // Wrapper sicuro per useAuth
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    if (message.includes('Cannot destructure property') && message.includes('auth')) {
      console.error('🚨 [AUTH PROTECTION] ERRORE DESTRUCTURING AUTH INTERCETTATO:', {
        args,
        stack: new Error().stack
      });
      
      // Prova a identificare il componente che causa il problema
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('src/') && 
        !line.includes('authDestructuringProtection')
      );
      
      console.error('🎯 [AUTH PROTECTION] COMPONENTI SOSPETTI:', relevantLines);
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // Protezione aggiuntiva per React error boundary
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('Cannot destructure property') &&
        event.error.message.includes('auth')) {
      
      console.error('🚨 [AUTH PROTECTION] ERRORE WINDOW INTERCEPTATO:', {
        message: event.error.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error.stack
      });
      
      // Analizza lo stack trace per trovare il componente
      if (event.error.stack) {
        const stackLines = event.error.stack.split('\n');
        const componentLines = stackLines.filter(line => 
          line.includes('src/') && 
          (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js'))
        );
        
        console.error('🎯 [AUTH PROTECTION] FILE SOSPETTI:', componentLines);
      }
    }
  });
}

// Esporta una funzione di utilità per verificare auth object
export function safeAuthCheck(authObject: any): boolean {
  if (!authObject) {
    console.warn('⚠️ [AUTH PROTECTION] Auth object is null/undefined');
    return false;
  }
  
  if (typeof authObject !== 'object') {
    console.warn('⚠️ [AUTH PROTECTION] Auth object is not an object:', typeof authObject);
    return false;
  }
  
  return true;
}

// Esporta wrapper sicuro per destructuring
export function safeAuthDestructure(authObject: any): {
  currentUser: any;
  loading: boolean;
  login: Function;
  signup: Function;
  logout: Function;
  resetPassword: Function;
} {
  if (!safeAuthCheck(authObject)) {
    return {
      currentUser: null,
      loading: false,
      login: async () => { throw new Error("Auth not available"); },
      signup: async () => { throw new Error("Auth not available"); },
      logout: async () => { throw new Error("Auth not available"); },
      resetPassword: async () => { throw new Error("Auth not available"); }
    };
  }
  
  return {
    currentUser: authObject.currentUser || null,
    loading: authObject.loading || false,
    login: authObject.login || (async () => { throw new Error("Login not available"); }),
    signup: authObject.signup || (async () => { throw new Error("Signup not available"); }),
    logout: authObject.logout || (async () => { throw new Error("Logout not available"); }),
    resetPassword: authObject.resetPassword || (async () => { throw new Error("Reset password not available"); })
  };
}

console.log('✅ [AUTH PROTECTION] Protezione auth destructuring attiva');