// 🛡️ PROTEZIONE SICURA PER AUTH DESTRUCTURING - PRODUCTION READY
// Questo file intercetta solo gli errori di destructuring senza modificare il sistema auth

console.log('🛡️ [SAFE AUTH] Inizializzazione protezione destructuring...');

if (typeof window !== 'undefined') {
  
  // 🛡️ INTERCETTA SOLO ERRORI DI DESTRUCTURING AUTH
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    if (message.includes('Cannot destructure property') && message.includes('auth')) {
      console.error('🚨 [SAFE AUTH] ERRORE DESTRUCTURING AUTH INTERCETTATO:', {
        message,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
      
      // Analizza lo stack per trovare il componente specifico
      const stack = new Error().stack || '';
      const lines = stack.split('\n');
      const componentLines = lines.filter(line => 
        line.includes('src/') && 
        (line.includes('.tsx') || line.includes('.ts') || line.includes('.jsx') || line.includes('.js'))
      );
      
      console.error('🎯 [SAFE AUTH] COMPONENTI SOSPETTI:', componentLines);
      
      // Estrai i nomi dei file specifici
      const fileMatches = componentLines.map(line => {
        const match = line.match(/src\/([^:]+)/);
        return match ? match[1] : null;
      }).filter(Boolean);
      
      console.error('📁 [SAFE AUTH] FILE SPECIFICI:', fileMatches);
      
      // NON PREVENIRE L'ERRORE - VOGLIAMO VEDERE IL CRASH COMPLETO PER DEBUGGING
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // 🛡️ INTERCETTA ERRORI WINDOW PER DESTRUCTURING AUTH
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'error') {
      const wrappedListener = function(event: ErrorEvent) {
        if (event.error && event.error.message && 
            event.error.message.includes('Cannot destructure property') &&
            event.error.message.includes('auth')) {
          
          console.error('🚨 [SAFE AUTH] ERRORE WINDOW INTERCEPTATO:', {
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
            
            console.error('🎯 [SAFE AUTH] FILE SOSPETTI:', fileLines);
            
            // Estrai i nomi dei file specifici
            const fileMatches = fileLines.map(line => {
              const match = line.match(/src\/([^:]+)/);
              return match ? match[1] : null;
            }).filter(Boolean);
            
            console.error('📁 [SAFE AUTH] FILE SPECIFICI:', fileMatches);
          }
        }
        
        listener(event);
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
}

console.log('✅ [SAFE AUTH] Protezione destructuring attiva');
