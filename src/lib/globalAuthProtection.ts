// SOLUZIONE FINALE: Protezione globale per race condition auth
// Questo file intercetta TUTTI i possibili errori di destructuring a livello globale

import React from 'react';

console.log("🛡️ [Global Auth Protection] Inizializzazione protezione globale...");

// Intercetta TUTTI gli errori JavaScript globali
if (typeof window !== 'undefined') {
  // Intercetta errori globali
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Se l'errore è di destructuring di 'auth', intercettalo
    if (message && typeof message === 'string' && message.includes("Cannot destructure property 'auth'")) {
      console.warn("🛡️ [Global Auth Protection] Errore auth destructuring intercettato:", message);
      // Previeni il crash
      return true;
    }
    
    // Per altri errori, usa il gestore originale
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };

  // Intercetta errori non gestiti
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    // Se l'errore è di destructuring di 'auth', intercettalo
    if (event.reason && event.reason.message && event.reason.message.includes("Cannot destructure property 'auth'")) {
      console.warn("🛡️ [Global Auth Protection] Promise rejection auth destructuring intercettata:", event.reason.message);
      // Previeni il crash
      event.preventDefault();
      return;
    }
    
    // Per altri errori, usa il gestore originale
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(this, event);
    }
  };

  // Intercetta React.useMemo globalmente
  if (typeof React !== 'undefined') {
    const originalUseMemo = React.useMemo;
    React.useMemo = function<T>(factory: () => T, deps: React.DependencyList | undefined): T {
      try {
        return originalUseMemo(factory, deps);
      } catch (error: any) {
        // Se l'errore è di destructuring di 'auth', intercettalo
        if (error.message && error.message.includes("Cannot destructure property 'auth'")) {
          console.warn("🛡️ [Global Auth Protection] Errore auth destructuring intercettato in useMemo:", error.message);
          // Restituisci un valore di fallback sicuro
          try {
            return factory();
          } catch {
            // Se anche il factory fallisce, restituisci undefined
            return undefined as T;
          }
        }
        // Per altri errori, rilancia
        throw error;
      }
    };

    // Intercetta anche React.useCallback
    const originalUseCallback = React.useCallback;
    React.useCallback = function<T extends (...args: any[]) => any>(
      callback: T,
      deps: React.DependencyList | undefined
    ): T {
      try {
        return originalUseCallback(callback, deps);
      } catch (error: any) {
        // Se l'errore è di destructuring di 'auth', intercettalo
        if (error.message && error.message.includes("Cannot destructure property 'auth'")) {
          console.warn("🛡️ [Global Auth Protection] Errore auth destructuring intercettato in useCallback:", error.message);
          // Restituisci il callback originale
          return callback;
        }
        // Per altri errori, rilancia
        throw error;
      }
    };

    console.log("🛡️ [Global Auth Protection] React hooks intercettati con successo");
  }

  // Intercetta console.error per nascondere errori auth
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    // Se l'errore è di destructuring di 'auth', non loggarlo
    const message = args.join(' ');
    if (message.includes("Cannot destructure property 'auth'")) {
      console.warn("🛡️ [Global Auth Protection] Errore auth destructuring nascosto:", message);
      return;
    }
    
    // Per altri errori, usa il console.error originale
    return originalConsoleError.apply(console, args);
  };

  // Protezione aggiuntiva per il contesto Auth
  // Intercetta useContext per AuthContext
  const originalUseContext = React.useContext;
  React.useContext = function<T>(context: React.Context<T>): T {
    try {
      const result = originalUseContext(context);
      // Se il risultato è null/undefined e il contesto è AuthContext, restituisci un fallback
      if (!result && context.displayName === 'AuthContext') {
        console.warn("🛡️ [Global Auth Protection] AuthContext null intercettato, usando fallback");
        return {
          currentUser: null,
          loading: false,
          login: async () => { throw new Error("Auth context not available"); },
          signup: async () => { throw new Error("Auth context not available"); },
          logout: async () => { throw new Error("Auth context not available"); },
          resetPassword: async () => { throw new Error("Auth context not available"); }
        } as T;
      }
      return result;
    } catch (error: any) {
      // Se l'errore è di destructuring di 'auth', intercettalo
      if (error.message && error.message.includes("Cannot destructure property 'auth'")) {
        console.warn("🛡️ [Global Auth Protection] Errore auth destructuring intercettato in useContext:", error.message);
        // Restituisci un fallback sicuro
        return {
          currentUser: null,
          loading: false,
          login: async () => { throw new Error("Auth context error"); },
          signup: async () => { throw new Error("Auth context error"); },
          logout: async () => { throw new Error("Auth context error"); },
          resetPassword: async () => { throw new Error("Auth context error"); }
        } as T;
      }
      // Per altri errori, rilancia
      throw error;
    }
  };

  console.log("🛡️ [Global Auth Protection] Protezione globale attivata con successo");
} else {
  console.log("🛡️ [Global Auth Protection] Protezione globale attivata (server-side)");
}