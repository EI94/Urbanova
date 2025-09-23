// Protezione runtime globale per intercettare TUTTI i crash JavaScript
// Questo file viene caricato automaticamente per prevenire crash

interface CrashInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  componentStack?: string;
}

class RuntimeProtection {
  private static instance: RuntimeProtection;
  private crashCount = 0;
  private maxCrashes = 5; // Limite crash per sessione
  private isRecovering = false;

  static getInstance(): RuntimeProtection {
    if (!RuntimeProtection.instance) {
      RuntimeProtection.instance = new RuntimeProtection();
    }
    return RuntimeProtection.instance;
  }

  constructor() {
    this.setupRuntimeProtection();
  }

  private setupRuntimeProtection() {
    // Intercetta errori JavaScript globali
    window.addEventListener('error', (event) => {
      this.handleCrash({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Intercetta Promise rejection non gestite
    window.addEventListener('unhandledrejection', (event) => {
      this.handleCrash({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Intercetta errori React (se disponibili)
    this.setupReactProtection();

    // Intercetta errori di destructuring
    this.setupDestructuringProtection();
  }

  private setupReactProtection() {
    try {
      // Prova a intercettare errori React
      if (typeof window !== 'undefined' && (window as any).React) {
        const React = (window as any).React;
        
        // Intercetta errori di rendering
        const originalRender = React.render;
        if (originalRender) {
          React.render = (element: any, container: any) => {
            try {
              return originalRender(element, container);
            } catch (error) {
              this.handleCrash({
                message: `React Render Error: ${error.message}`,
                stack: error.stack,
                timestamp: new Date(),
                userAgent: navigator.userAgent,
                url: window.location.href
              });
              return null;
            }
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ [Runtime Protection] Impossibile impostare protezione React:', error);
    }
  }

  private setupDestructuringProtection() {
    try {
      // Intercetta errori di destructuring
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Cannot destructure property') && 
            message.includes('auth')) {
          this.handleAuthDestructuringCrash(message);
        }
        originalConsoleError.apply(console, args);
      };
    } catch (error) {
      console.warn('⚠️ [Runtime Protection] Impossibile impostare protezione destructuring:', error);
    }
  }

  private handleCrash(crashInfo: CrashInfo) {
    this.crashCount++;

    // Log del crash
    console.error('🚨 [Runtime Protection] Crash intercettato:', crashInfo);

    // Se è un crash di destructuring auth, prova a recuperare
    if (crashInfo.message.includes('Cannot destructure property') && 
        crashInfo.message.includes('auth')) {
      console.warn('🛡️ [Runtime Protection] Crash auth destructuring rilevato, tentativo di recupero...');
      this.handleAuthDestructuringCrash(crashInfo.message);
    }

    // Se superiamo il limite di crash, ricarica la pagina
    if (this.crashCount > this.maxCrashes) {
      console.error('🚨 [Runtime Protection] Troppi crash, ricaricamento pagina...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  private handleAuthDestructuringCrash(message: string) {
    if (this.isRecovering) {
      return; // Evita loop infiniti
    }

    this.isRecovering = true;

    try {
      console.warn('🛡️ [Runtime Protection] Tentativo di recupero da crash auth destructuring...');

      // Prova a forzare un re-render del componente problematico
      const event = new CustomEvent('auth-context-reset', {
        detail: { timestamp: Date.now(), message }
      });
      window.dispatchEvent(event);

      // Prova a ricaricare solo il contesto auth
      setTimeout(() => {
        const authElements = document.querySelectorAll('[data-auth-context]');
        authElements.forEach(element => {
          element.dispatchEvent(new Event('force-update'));
        });
      }, 100);

      // Prova a ricaricare i componenti React
      setTimeout(() => {
        const reactElements = document.querySelectorAll('[data-react-component]');
        reactElements.forEach(element => {
          element.dispatchEvent(new Event('force-render'));
        });
      }, 200);

      // Reset del flag di recupero
      setTimeout(() => {
        this.isRecovering = false;
      }, 1000);

    } catch (error) {
      console.error('❌ [Runtime Protection] Errore nel recupero:', error);
      this.isRecovering = false;
    }
  }

  // Metodo pubblico per registrare crash manualmente
  public logCrash(message: string, error?: Error) {
    this.handleCrash({
      message,
      stack: error?.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Reset del contatore crash
  public resetCrashCount() {
    this.crashCount = 0;
  }

  // Forza recupero da crash
  public forceRecovery() {
    this.handleAuthDestructuringCrash('Force recovery triggered');
  }
}

// Inizializza la protezione runtime
if (typeof window !== 'undefined') {
  RuntimeProtection.getInstance();
  console.log('🛡️ [Runtime Protection] Inizializzato');
}

export default RuntimeProtection;
