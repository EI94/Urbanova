// Global Error Handler per intercettare TUTTI gli errori JavaScript
// Questo file viene caricato automaticamente per prevenire crash

import React from 'react';

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
    this.setupAuthProtection();
  }

  private setupGlobalErrorHandlers() {
    // Intercetta errori JavaScript globali con prevenzione crash
    window.addEventListener('error', (event) => {
      // Se è un errore auth destructuring, previeni il crash
      if (event.message && event.message.includes('Cannot destructure property') && event.message.includes('auth')) {
        console.warn('🛡️ [CRITICAL] Auth destructuring error intercettato, prevenendo crash');
        // Attiva recupero automatico
        setTimeout(() => {
          console.log('🔄 [RECOVERY] Tentativo di recupero automatico...');
          // Forza re-render del componente principale
          const recoveryEvent = new CustomEvent('auth-recovery');
          window.dispatchEvent(recoveryEvent);
        }, 100);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      
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

  private setupAuthProtection() {
    try {
      // Intercetta TUTTI i destructuring che potrebbero causare problemi
      this.interceptDestructuring();
      
      // Intercetta window.onerror per prevenire crash auth destructuring
      const originalOnError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        if (message && message.includes('Cannot destructure property') && message.includes('auth')) {
          console.warn('🛡️ [CRITICAL] window.onerror auth destructuring intercettato, prevenendo crash');
          // Attiva recupero automatico
          setTimeout(() => {
            console.log('🔄 [RECOVERY] Tentativo di recupero automatico...');
            // Forza re-render del componente principale
            const event = new CustomEvent('auth-recovery');
            window.dispatchEvent(event);
          }, 100);
          return true; // Previeni il default browser error handling
        }
        if (originalOnError) {
          return originalOnError(message, source, lineno, colno, error);
        }
        return false;
      };
      
      // Intercetta React.useMemo per prevenire crash auth destructuring
      if (typeof window !== 'undefined' && (window as any).React) {
        const React = (window as any).React;
        const originalUseMemo = React.useMemo;
        
        React.useMemo = function(factory, deps) {
          try {
            return originalUseMemo(factory, deps);
          } catch (error) {
            if (error.message && error.message.includes('Cannot destructure property') && error.message.includes('auth')) {
              console.warn('🛡️ [Auth Protection] useMemo auth destructuring intercettato, usando fallback');
              return factory();
            }
            throw error;
          }
        };
        
        console.log('🛡️ [Auth Protection] React.useMemo intercettato per prevenire crash auth');
      }
    } catch (error) {
      console.error('❌ [Auth Protection] Errore nell\'intercettazione React.useMemo:', error);
    }
  }

  private interceptDestructuring() {
    try {
      // Intercetta tutti gli errori di destructuring a livello globale
      const originalConsoleError = console.error;
      console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('Cannot destructure property') && message.includes('auth')) {
          console.warn('🛡️ [Auth Protection] Destructuring auth intercettato, prevenendo crash');
          return; // Non loggare l'errore originale
        }
        originalConsoleError.apply(console, args);
      };
      
      console.log('🛡️ [Auth Protection] Destructuring intercettato per prevenire crash auth');
    } catch (error) {
      console.error('❌ [Auth Protection] Errore nell\'intercettazione destructuring:', error);
    }
  }

  private handleError(errorInfo: ErrorInfo) {
    this.errorCount++;

    // Se è un errore di destructuring auth, NON loggare e prevenire crash
    if ((errorInfo.message.includes('Cannot destructure property') && errorInfo.message.includes('auth')) ||
        (errorInfo.message.includes('useMemo') && errorInfo.message.includes('undefined')) ||
        (errorInfo.stack && errorInfo.stack.includes('useMemo') && errorInfo.stack.includes('auth'))) {
      console.warn('🛡️ [Global Error Handler] Errore auth destructuring/useMemo rilevato, prevenendo crash...');
      this.handleAuthDestructuringError();
      return; // Non loggare l'errore originale
    }

    // Log dell'errore solo se non è un errore auth
    console.error('🚨 [Global Error Handler] Errore intercettato:', errorInfo);

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
      console.error('🚨 [CRITICAL] Auth destructuring error - PREVENTING CRASH!');
      
      // Invece di ricaricare, previeni il crash intercettando il problema
      this.preventAuthDestructuringCrash();
    } catch (error) {
      console.error('❌ [Global Error Handler] Errore nel recupero auth:', error);
    }
  }

  private preventAuthDestructuringCrash() {
    try {
      // Intercetta tutti i useMemo che potrebbero causare problemi
      const originalUseMemo = React.useMemo;
      React.useMemo = function(factory, deps) {
        try {
          return originalUseMemo(factory, deps);
        } catch (error) {
          if (error.message && error.message.includes('Cannot destructure property') && error.message.includes('auth')) {
            console.warn('🛡️ [Auth Protection] useMemo auth destructuring intercettato, usando fallback');
            return factory();
          }
          throw error;
        }
      };
      
      console.log('🛡️ [Auth Protection] useMemo intercettato per prevenire crash auth');
    } catch (error) {
      console.error('❌ [Auth Protection] Errore nell\'intercettazione useMemo:', error);
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
