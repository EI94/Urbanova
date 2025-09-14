// Protezione globale per TUTTI i possibili usi di useAuth
// Questo file intercetta e protegge ogni chiamata a useAuth

import React, { useContext, useMemo, useCallback } from 'react';

// Wrapper sicuro per useContext
export function safeUseContext<T>(context: React.Context<T | null>): T | null {
  try {
    const value = useContext(context);
    return value;
  } catch (error) {
    console.warn('⚠️ [Auth Protection] Errore useContext intercettato:', error);
    return null;
  }
}

// Hook useAuth ultra-protetto
export function useAuthProtected() {
  try {
    // Import diretto per evitare problemi di bundling
    const { AuthContext } = require('@/contexts/AuthContext');
    const context = safeUseContext(AuthContext);
    
    if (!context) {
      console.warn('⚠️ [Auth Protection] Contesto auth non disponibile, usando fallback');
      return {
        currentUser: null,
        loading: false,
        login: async () => { throw new Error("Auth context not available"); },
        signup: async () => { throw new Error("Auth context not available"); },
        logout: async () => { throw new Error("Auth context not available"); },
        resetPassword: async () => { throw new Error("Auth context not available"); }
      };
    }
    
    return {
      currentUser: context.currentUser || null,
      loading: context.loading || false,
      login: context.login || (async () => { throw new Error("Login function not available"); }),
      signup: context.signup || (async () => { throw new Error("Signup function not available"); }),
      logout: context.logout || (async () => { throw new Error("Logout function not available"); }),
      resetPassword: context.resetPassword || (async () => { throw new Error("Reset password function not available"); })
    };
  } catch (error) {
    console.error('❌ [Auth Protection] Errore critico useAuth:', error);
    return {
      currentUser: null,
      loading: false,
      login: async () => { throw new Error("Auth context error"); },
      signup: async () => { throw new Error("Auth context error"); },
      logout: async () => { throw new Error("Auth context error"); },
      resetPassword: async () => { throw new Error("Auth context error"); }
    };
  }
}

// Protezione per componenti che potrebbero essere caricati dinamicamente
export function withAuthProtection<T extends object>(Component: React.ComponentType<T>) {
  return function ProtectedComponent(props: T) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.error('❌ [Auth Protection] Errore componente protetto:', error);
      return React.createElement('div', {
        className: 'p-4 bg-red-50 border border-red-200 rounded-lg'
      }, React.createElement('p', {
        className: 'text-red-800'
      }, 'Errore nel caricamento del componente'));
    }
  };
}

// Intercettore per useMemo che potrebbe causare problemi
export function safeUseMemo<T>(factory: () => T, deps: React.DependencyList): T {
  try {
    return useMemo(factory, deps);
  } catch (error) {
    console.warn('⚠️ [Auth Protection] Errore useMemo intercettato:', error);
    return factory();
  }
}

// Intercettore per useCallback che potrebbe causare problemi
export function safeUseCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  try {
    return useCallback(callback, deps);
  } catch (error) {
    console.warn('⚠️ [Auth Protection] Errore useCallback intercettato:', error);
    return callback;
  }
}

export default {
  useAuthProtected,
  withAuthProtection,
  safeUseMemo,
  safeUseCallback,
  safeUseContext
};
