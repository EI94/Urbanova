// 🛡️ PROTEZIONE GLOBALE CONTRO DESTRUCTURING AUTH
// Intercetta e gestisce l'errore "Cannot destructure property 'auth' of 'e' as it is undefined"

class AuthDestructuringProtection {
  private static instance: AuthDestructuringProtection;
  private isActive = false;

  private constructor() {}

  static getInstance(): AuthDestructuringProtection {
    if (!AuthDestructuringProtection.instance) {
      AuthDestructuringProtection.instance = new AuthDestructuringProtection();
    }
    return AuthDestructuringProtection.instance;
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;

    console.log('🛡️ [Auth Destructuring Protection] Attivato');

    // Intercetta errori globali
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    // Intercetta errori React (se disponibile)
    if (typeof window !== 'undefined' && (window as any).__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
      const originalCaptureException = (window as any).__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.captureException;
      (window as any).__REACT_ERROR_OVERLAY_GLOBAL_HOOK__.captureException = (error: Error) => {
        this.handleReactError(error);
        if (originalCaptureException) {
          originalCaptureException(error);
        }
      };
    }
  }

  private handleGlobalError(event: ErrorEvent) {
    const error = event.error;
    const message = event.message || error?.message || '';

    if (this.isAuthDestructuringError(message)) {
      console.error('🚨 [Auth Destructuring Protection] ERRORE INTERCETTATO:', message);
      console.error('🚨 [Auth Destructuring Protection] Stack:', error?.stack);
      console.error('🚨 [Auth Destructuring Protection] Filename:', event.filename);
      console.error('🚨 [Auth Destructuring Protection] Line:', event.lineno);
      console.error('🚨 [Auth Destructuring Protection] Column:', event.colno);

      // Prova a identificare il componente problematico
      this.identifyProblematicComponent(error?.stack);

      // Previeni il crash dell'app
      event.preventDefault();
      event.stopPropagation();

      // Mostra notifica all'utente
      this.showUserNotification();

      return false;
    }
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason;
    const message = error?.message || String(error);

    if (this.isAuthDestructuringError(message)) {
      console.error('🚨 [Auth Destructuring Protection] PROMISE REJECTION INTERCETTATA:', message);
      console.error('🚨 [Auth Destructuring Protection] Reason:', event.reason);

      // Previeni il crash dell'app
      event.preventDefault();

      // Mostra notifica all'utente
      this.showUserNotification();
    }
  }

  private handleReactError(error: Error) {
    const message = error.message || '';

    if (this.isAuthDestructuringError(message)) {
      console.error('🚨 [Auth Destructuring Protection] REACT ERROR INTERCETTATO:', message);
      console.error('🚨 [Auth Destructuring Protection] Stack:', error.stack);

      // Prova a identificare il componente problematico
      this.identifyProblematicComponent(error.stack);

      // Mostra notifica all'utente
      this.showUserNotification();
    }
  }

  private isAuthDestructuringError(message: string): boolean {
    return message.includes('Cannot destructure property') && 
           message.includes('auth') && 
           message.includes('undefined');
  }

  private identifyProblematicComponent(stack?: string) {
    if (!stack) return;

    console.log('🔍 [Auth Destructuring Protection] Analizzando stack trace...');

    // Cerca pattern di componenti React
    const reactComponentPattern = /at\s+(\w+)\s+\(/g;
    const matches = [...stack.matchAll(reactComponentPattern)];

    if (matches.length > 0) {
      console.log('🔍 [Auth Destructuring Protection] Componenti sospetti:', matches.map(m => m[1]));
    }

    // Cerca file sospetti
    const filePattern = /at\s+.*\/([\w-]+\.(?:tsx?|jsx?))/g;
    const fileMatches = [...stack.matchAll(filePattern)];

    if (fileMatches.length > 0) {
      console.log('🔍 [Auth Destructuring Protection] File sospetti:', fileMatches.map(m => m[1]));
    }
  }

  private showUserNotification() {
    // Mostra una notifica discreta all'utente
    if (typeof window !== 'undefined' && window.document) {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #991b1b;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `;
      notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">⚠️ Errore temporaneo rilevato</div>
        <div style="font-size: 12px;">L'applicazione continua a funzionare normalmente. Se il problema persiste, ricarica la pagina.</div>
      `;

      document.body.appendChild(notification);

      // Rimuovi la notifica dopo 5 secondi
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 5000);
    }
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    console.log('🛡️ [Auth Destructuring Protection] Disattivato');

    window.removeEventListener('error', this.handleGlobalError.bind(this));
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }
}

// Esporta l'istanza singleton
export const authDestructuringProtection = AuthDestructuringProtection.getInstance();

// Auto-attivazione in produzione
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  authDestructuringProtection.activate();
}
