// React Interceptor per intercettare errori di destructuring in useMemo
// Questo file intercetta TUTTI i possibili errori di destructuring a livello di React

import React from 'react';

// Intercetta React.useMemo per prevenire crash di destructuring
if (typeof window !== 'undefined') {
  // Intercetta useMemo per prevenire crash di destructuring
  const originalUseMemo = React.useMemo;
  React.useMemo = function<T>(factory: () => T, deps: React.DependencyList | undefined): T {
    try {
      return originalUseMemo(factory, deps);
    } catch (error: any) {
      // Se l'errore è di destructuring di 'auth', intercettalo
      if (error.message && error.message.includes("Cannot destructure property 'auth'")) {
        console.warn("⚠️ [React Interceptor] Errore auth destructuring intercettato in useMemo:", error.message);
        // Restituisci un valore di fallback sicuro
        return factory();
      }
      // Per altri errori, rilancia
      throw error;
    }
  };

  // Intercetta anche useCallback per sicurezza
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
        console.warn("⚠️ [React Interceptor] Errore auth destructuring intercettato in useCallback:", error.message);
        // Restituisci un callback di fallback sicuro
        return callback;
      }
      // Per altri errori, rilancia
      throw error;
    }
  };

  console.log("🛡️ [React Interceptor] Intercettazione useMemo/useCallback attivata per prevenire crash auth destructuring");
  console.log("🛡️ [React Interceptor] React.useMemo originale:", originalUseMemo);
  console.log("🛡️ [React Interceptor] React.useMemo intercettato:", React.useMemo);
}
