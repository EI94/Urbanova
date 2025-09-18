// 🛡️ PROTEZIONE GLOBALE CHIRURGICA PER AUTH DESTRUCTURING - PRODUCTION READY
// Questo file intercetta TUTTI i possibili pattern di destructuring auth che possono causare crash

console.log('🛡️ [GLOBAL AUTH] Inizializzazione protezione globale auth destructuring...');

if (typeof window !== 'undefined') {
  
  // 🛡️ INTERCETTA ERRORI DI DESTRUCTURING AUTH CON PATTERN MULTIPLI
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    // Pattern multipli per intercettare errori di destructuring
    const destructuringPatterns = [
      'Cannot destructure property',
      'Cannot read properties of undefined',
      'Cannot read property',
      'is not a function',
      'is undefined'
    ];
    
    const authPatterns = [
      'auth',
      'currentUser',
      'loading',
      'login',
      'signup',
      'logout',
      'useAuth'
    ];
    
    const hasDestructuringError = destructuringPatterns.some(pattern => message.includes(pattern));
    const hasAuthReference = authPatterns.some(pattern => message.includes(pattern));
    
    if (hasDestructuringError && hasAuthReference) {
      console.error('🚨 [GLOBAL AUTH] ERRORE AUTH DESTRUCTURING INTERCETTATO:', {
        message,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
        args
      });
      
      // Analizza lo stack per trovare il componente specifico
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      const componentLines = lines.filter(line => 
        line.includes('src/') && 
        (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js')) &&
        !line.includes('globalAuthProtection')
      );
      
      console.error('🎯 [GLOBAL AUTH] COMPONENTI SOSPETTI:', componentLines);
      
      // Estrai i nomi dei file specifici
      const fileMatches = componentLines.map(line => {
        const match = line.match(/src\/([^:]+)/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      console.error('📁 [GLOBAL AUTH] FILE SPECIFICI:', fileMatches);
      
      // Estrai i numeri di linea
      const lineMatches = componentLines.map(line => {
        const match = line.match(/:(\d+):/);
        return match ? `Linea ${match[1]}` : null;
      }).filter(Boolean);
      
      console.error('📍 [GLOBAL AUTH] LINEE SPECIFICHE:', lineMatches);
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
        'is undefined'
      ];
      
      const authPatterns = [
        'auth',
        'currentUser',
        'loading',
        'login',
        'signup',
        'logout',
        'useAuth'
      ];
      
      const hasDestructuringError = destructuringPatterns.some(pattern => message.includes(pattern));
      const hasAuthReference = authPatterns.some(pattern => message.includes(pattern));
      
      if (hasDestructuringError && hasAuthReference) {
        console.error('🚨 [GLOBAL AUTH] ERRORE WINDOW INTERCEPTATO:', {
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
          
          console.error('🎯 [GLOBAL AUTH] FILE SOSPETTI:', componentLines);
          
          // Estrai i nomi dei file specifici
          const fileMatches = componentLines.map(line => {
            const match = line.match(/src\/([^:]+)/);
            return match ? match[1] : null;
          }).filter(Boolean);
          
          console.error('📁 [GLOBAL AUTH] FILE SPECIFICI:', fileMatches);
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
        'is undefined'
      ];
      
      const authPatterns = [
        'auth',
        'currentUser',
        'loading',
        'login',
        'signup',
        'logout',
        'useAuth'
      ];
      
      const hasDestructuringError = destructuringPatterns.some(pattern => message.includes(pattern));
      const hasAuthReference = authPatterns.some(pattern => message.includes(pattern));
      
      if (hasDestructuringError && hasAuthReference) {
        console.error('🚨 [GLOBAL AUTH] PROMISE REJECTION INTERCEPTATA:', {
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
          
          console.error('🎯 [GLOBAL AUTH] FILE SOSPETTI:', componentLines);
        }
      }
    }
    
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };
}

console.log('✅ [GLOBAL AUTH] Protezione globale auth destructuring attiva');
