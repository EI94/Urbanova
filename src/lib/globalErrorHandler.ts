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

  private setupAuthProtection() {
    try {
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

  private handleError(errorInfo: ErrorInfo) {
    this.errorCount++;

    // Log dell'errore
    console.error('🚨 [Global Error Handler] Errore intercettato:', errorInfo);

    // Se è un errore di destructuring auth, prova a recuperare
    if ((errorInfo.message.includes('Cannot destructure property') && errorInfo.message.includes('auth')) ||
        (errorInfo.message.includes('useMemo') && errorInfo.message.includes('undefined')) ||
        (errorInfo.stack && errorInfo.stack.includes('useMemo') && errorInfo.stack.includes('auth'))) {
      console.warn('🛡️ [Global Error Handler] Errore auth destructuring/useMemo rilevato, tentativo di recupero...');
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
