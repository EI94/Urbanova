// Global Error Handler per intercettare TUTTI gli errori JavaScript
// Questo file viene caricato automaticamente per prevenire crash

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorCount = 0;
  private maxErrors = 10; // Limite errori per sessione

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Intercetta errori JavaScript globali
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Intercetta Promise rejection non gestite
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Intercetta errori React (se disponibili)
    if (typeof window !== 'undefined' && (window as any).React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const originalOnError = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactDebugCurrentFrame.getCurrentStack;
      (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactDebugCurrentFrame.getCurrentStack = function() {
        try {
          return originalOnError();
        } catch (error) {
          GlobalErrorHandler.getInstance().handleError({
            message: `React Error: ${error.message}`,
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

  private handleError(errorInfo: ErrorInfo) {
    this.errorCount++;

    // Log dell'errore
    console.error('🚨 [Global Error Handler] Errore intercettato:', errorInfo);

    // Se è un errore di destructuring auth, prova a recuperare
    if (errorInfo.message.includes('Cannot destructure property') && 
        errorInfo.message.includes('auth')) {
      console.warn('🛡️ [Global Error Handler] Errore auth destructuring rilevato, tentativo di recupero...');
      this.handleAuthDestructuringError();
    }

    // Se superiamo il limite di errori, ricarica la pagina
    if (this.errorCount > this.maxErrors) {
      console.error('🚨 [Global Error Handler] Troppi errori, ricaricamento pagina...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  private handleAuthDestructuringError() {
    try {
      // Prova a forzare un re-render del componente problematico
      const event = new CustomEvent('auth-context-reset', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(event);
      
      // Prova a ricaricare solo il contesto auth
      setTimeout(() => {
        const authElements = document.querySelectorAll('[data-auth-context]');
        authElements.forEach(element => {
          element.dispatchEvent(new Event('force-update'));
        });
      }, 100);
    } catch (error) {
      console.error('❌ [Global Error Handler] Errore nel recupero auth:', error);
    }
  }

  // Metodo pubblico per registrare errori manualmente
  public logError(message: string, error?: Error) {
    this.handleError({
      message,
      stack: error?.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Reset del contatore errori
  public resetErrorCount() {
    this.errorCount = 0;
  }
}

// Inizializza il global error handler
if (typeof window !== 'undefined') {
  GlobalErrorHandler.getInstance();
  console.log('🛡️ [Global Error Handler] Inizializzato');
}

export default GlobalErrorHandler;
