'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { firebaseAuthService, User } from '@/lib/firebaseAuthService';

// CHIRURGICO: Interfaccia per il contesto di autenticazione ultra-sicura
interface UltraSafeAuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    displayName: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// CHIRURGICO: Creazione del contesto con valori predefiniti SEMPRE VALIDI
const UltraSafeAuthContext = createContext<UltraSafeAuthContextType>({
  currentUser: null,
  loading: false,
  signup: async () => { throw new Error("Auth context not available"); },
  login: async () => { throw new Error("Auth context not available"); },
  logout: async () => { throw new Error("Auth context not available"); },
  resetPassword: async () => { throw new Error("Auth context not available"); }
});

UltraSafeAuthContext.displayName = 'UltraSafeAuthContext';

// CHIRURGICO: Hook ultra-sicuro che NON PUÒ MAI FALLIRE
export function useUltraSafeAuth(): UltraSafeAuthContextType {
  console.log('🛡️ [useUltraSafeAuth] Hook chiamato...');
  
  try {
    const context = useContext(UltraSafeAuthContext);
    
    // VERIFICA ULTRA-SICURA - Se il context è undefined, usa il fallback
    if (!context || typeof context !== 'object') {
      console.warn('⚠️ [useUltraSafeAuth] Context non valido, usando fallback');
      return createUltraSafeFallback();
    }
    
    // VERIFICA OGNI PROPRIETÀ INDIVIDUALMENTE
    const safeContext: UltraSafeAuthContextType = {
      currentUser: (context.currentUser !== undefined && context.currentUser !== null) ? context.currentUser : null,
      loading: (typeof context.loading === 'boolean') ? context.loading : false,
      signup: (typeof context.signup === 'function') ? context.signup : async () => { throw new Error("Signup not available"); },
      login: (typeof context.login === 'function') ? context.login : async () => { throw new Error("Login not available"); },
      logout: (typeof context.logout === 'function') ? context.logout : async () => { throw new Error("Logout not available"); },
      resetPassword: (typeof context.resetPassword === 'function') ? context.resetPassword : async () => { throw new Error("Reset password not available"); }
    };
    
    console.log('✅ [useUltraSafeAuth] Context validato con successo');
    return safeContext;
  } catch (error) {
    console.error("❌ [useUltraSafeAuth] Errore critico:", error);
    return createUltraSafeFallback();
  }
}

// CHIRURGICO: Fallback che NON PUÒ MAI ESSERE undefined
function createUltraSafeFallback(): UltraSafeAuthContextType {
  console.log('🆘 [useUltraSafeAuth] Creando fallback ultra-sicuro...');
  return {
    currentUser: null,
    loading: false,
    signup: async () => { throw new Error("Auth context error"); },
    login: async () => { throw new Error("Auth context error"); },
    logout: async () => { throw new Error("Auth context error"); },
    resetPassword: async () => { throw new Error("Auth context error"); }
  };
}

// Props per il provider
interface UltraSafeAuthProviderProps {
  children: ReactNode;
}

// CHIRURGICO: Provider ultra-sicuro
export function UltraSafeAuthProvider({ children }: UltraSafeAuthProviderProps) {
  console.log('🛡️ [UltraSafeAuthProvider] Inizializzazione...');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Funzioni auth con protezioni ultra-sicure
  async function signup(
    email: string,
    password: string,
    displayName: string,
    firstName?: string,
    lastName?: string
  ) {
    try {
      const result = await firebaseAuthService.signup(
        email,
        password,
        displayName,
        firstName,
        lastName
      );

      if (result.success) {
        setCurrentUser(result.user);
      } else {
        throw new Error(result.error || 'Errore durante la registrazione');
      }
    } catch (error: any) {
      console.error('Errore durante la registrazione:', error);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      const result = await firebaseAuthService.login(email, password);

      if (result.success) {
        setCurrentUser(result.user);
      } else {
        throw new Error(result.error || 'Errore durante il login');
      }
    } catch (error: any) {
      console.error('Errore durante il login:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await firebaseAuthService.logout();
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Errore durante il logout:', error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      await firebaseAuthService.resetPassword(email);
    } catch (error: any) {
      console.error('Errore durante il reset password:', error);
      throw error;
    }
  }

  // Effetto per controllare lo stato dell'autenticazione
  useEffect(() => {
    console.log('🛡️ [UltraSafeAuthProvider] useEffect onAuthStateChanged...');
    
    try {
      const unsubscribe = firebaseAuthService.onAuthStateChanged((user: User | null) => {
        console.log('🛡️ [UltraSafeAuthProvider] onAuthStateChanged:', user ? 'User logged in' : 'User logged out');
        setCurrentUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ [UltraSafeAuthProvider] Errore in onAuthStateChanged:', error);
      setLoading(false);
      return () => {}; // unsubscribe function vuota
    }
  }, []);

  // CHIRURGICO: Value object che NON PUÒ MAI essere undefined
  const value: UltraSafeAuthContextType = {
    currentUser: currentUser || null,
    loading: loading || false,
    signup: signup || (async () => { throw new Error("Signup not available"); }),
    login: login || (async () => { throw new Error("Login not available"); }),
    logout: logout || (async () => { throw new Error("Logout not available"); }),
    resetPassword: resetPassword || (async () => { throw new Error("Reset password not available"); }),
  };

  console.log('🛡️ [UltraSafeAuthProvider] Rendering provider con value:', { 
    currentUser: value.currentUser ? 'User present' : 'No user', 
    loading: value.loading 
  });

  return <UltraSafeAuthContext.Provider value={value}>{children}</UltraSafeAuthContext.Provider>;
}

// CHIRURGICO: Hook wrapper per compatibilità con useAuth esistente
export function useAuth(): UltraSafeAuthContextType {
  return useUltraSafeAuth();
}
