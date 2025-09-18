// 🛡️ PROTEZIONE UNIVERSALE CHIRURGICA PER AUTH DESTRUCTURING - PRODUCTION READY
// Questo file intercetta TUTTI i possibili pattern di destructuring auth che possono causare crash

console.log('🛡️ [UNIVERSAL AUTH] Inizializzazione protezione universale auth destructuring...');

if (typeof window !== 'undefined') {
  
  // 🛡️ INTERCETTA ERRORI DI DESTRUCTURING AUTH CON PATTERN UNIVERSALI
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Pattern universali per intercettare errori di destructuring
    const destructuringPatterns = [
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
    
    const hasDestructuringError = destructuringPatterns.some(pattern => message.includes(pattern));
    const hasAuthReference = authPatterns.some(pattern => message.includes(pattern));
    
    if (hasDestructuringError && hasAuthReference) {
      console.error('🚨 [UNIVERSAL AUTH] ERRORE AUTH DESTRUCTURING INTERCETTATO:', {
        message,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
        args: args.map(arg => typeof arg === 'string' ? arg : String(arg))
      });
      
      // Analizza lo stack per trovare il componente specifico
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      const componentLines = lines.filter(line => 
        line.includes('src/') && 
        (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js')) &&
        !line.includes('universalAuthProtection') &&
        !line.includes('globalAuthProtection') &&
        !line.includes('safeAuthDestructuring') &&
        !line.includes('authDestructuringProtection')
      );
      
      console.error('🎯 [UNIVERSAL AUTH] COMPONENTI SOSPETTI:', componentLines);
      
      // Estrai i nomi dei file specifici
      const fileMatches = componentLines.map(line => {
        const match = line.match(/src\/([^:]+)/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      console.error('📁 [UNIVERSAL AUTH] FILE SPECIFICI:', fileMatches);
      
      // Estrai i numeri di linea
      const lineMatches = componentLines.map(line => {
        const match = line.match(/:(\d+):/);
        return match ? `Linea ${match[1]}` : null;
      }).filter(Boolean);
      
      console.error('📍 [UNIVERSAL AUTH] LINEE SPECIFICHE:', lineMatches);
      
      // Estrai i nomi delle funzioni
      const functionMatches = componentLines.map(line => {
        const match = line.match(/at\s+(\w+)/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      console.error('🔧 [UNIVERSAL AUTH] FUNZIONI SOSPETTE:', functionMatches);
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 🛡️ INTERCETTA ERRORI WINDOW PER DESTRUCTURING AUTH
  const originalWindowError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string') {
      const destructuringPatterns = [
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
      
      const hasDestructuringError = destructuringPatterns.some(pattern => message.includes(pattern));
      const hasAuthReference = authPatterns.some(pattern => message.includes(pattern));
      
      if (hasDestructuringError && hasAuthReference) {
        console.error('🚨 [UNIVERSAL AUTH] ERRORE WINDOW INTERCEPTATO:', {
          message,
          source,
          lineno,
          colno,
          error: error?.stack || error,
          timestamp: new Date().toISOString()
        });
        
        // Analizza lo stack per trovare il componente
        if (error?.stack) {
          const stackLines = error.stack.split('\n');
          const componentLines = stackLines.filter(line => 
            line.includes('src/') && 
            (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js'))
          );
          
          console.error('🎯 [UNIVERSAL AUTH] FILE SOSPETTI:', componentLines);
          
          // Estrai i nomi dei file specifici
          const fileMatches = componentLines.map(line => {
            const match = line.match(/src\/([^:]+)/);
            return match ? match[1] : null;
          }).filter(Boolean);
          
          console.error('📁 [UNIVERSAL AUTH] FILE SPECIFICI:', fileMatches);
        }
      }
    }
    
    if (originalWindowError) {
      return originalWindowError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // 🛡️ INTERCETTA ERRORI UNHANDLED PROMISE REJECTIONS
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const message = event.reason?.message || event.reason?.toString() || '';
    
    if (typeof message === 'string') {
      const destructuringPatterns = [
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
      
      const hasDestructuringError = destructuringPatterns.some(pattern => message.includes(pattern));
      const hasAuthReference = authPatterns.some(pattern => message.includes(pattern));
      
      if (hasDestructuringError && hasAuthReference) {
        console.error('🚨 [UNIVERSAL AUTH] PROMISE REJECTION INTERCEPTATA:', {
          reason: event.reason,
          message,
          timestamp: new Date().toISOString(),
          stack: event.reason?.stack
        });
        
        // Analizza lo stack
        if (event.reason?.stack) {
          const stackLines = event.reason.stack.split('\n');
          const componentLines = stackLines.filter(line => 
            line.includes('src/') && 
            (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js'))
          );
          
          console.error('🎯 [UNIVERSAL AUTH] FILE SOSPETTI:', componentLines);
        }
      }
    }
    
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };
  
  // 🛡️ INTERCETTA ERRORI REACT ERROR BOUNDARY
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'error') {
      const wrappedListener = function(event: ErrorEvent) {
        if (event.error && event.error.message && 
            event.error.message.includes('Cannot destructure property') &&
            event.error.message.includes('auth')) {
          
          console.error('🚨 [UNIVERSAL AUTH] ERRORE REACT INTERCEPTATO:', {
            message: event.error.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error.stack,
            timestamp: new Date().toISOString()
          });
          
          // Analizza lo stack per trovare il file specifico
          if (event.error.stack) {
            const stackLines = event.error.stack.split('\n');
            const fileLines = stackLines.filter(line => 
              line.includes('src/') && 
              (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js'))
            );
            
            console.error('🎯 [UNIVERSAL AUTH] FILE SOSPETTI:', fileLines);
            
            // Estrai i nomi dei file specifici
            const fileMatches = fileLines.map(line => {
              const match = line.match(/src\/([^:]+)/);
              return match ? match[1] : null;
            }).filter(Boolean);
            
            console.error('📁 [UNIVERSAL AUTH] FILE SPECIFICI:', fileMatches);
          }
        }
        
        listener(event);
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
}

console.log('✅ [UNIVERSAL AUTH] Protezione universale auth destructuring attiva');
