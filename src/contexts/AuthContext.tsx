'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Lazy loader per firebaseAuthService - caricato solo quando necessario
let firebaseAuthServicePromise: Promise<typeof import('@/lib/firebaseAuthService')> | null = null;

const getFirebaseAuthService = async () => {
  if (!firebaseAuthServicePromise) {
    firebaseAuthServicePromise = import('@/lib/firebaseAuthService');
  }
  const module = await firebaseAuthServicePromise;
  return module.firebaseAuthService;
};

const getFirebaseUser = async () => {
  if (!firebaseAuthServicePromise) {
    firebaseAuthServicePromise = import('@/lib/firebaseAuthService');
  }
  const module = await firebaseAuthServicePromise;
  return module.User;
};

// Interfaccia per il contesto di autenticazione
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  role?: string;
  company?: string;
}

interface AuthContextType {
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

// Creazione del contesto con valori predefiniti
const AuthContext = createContext<AuthContextType | null>(null);
AuthContext.displayName = 'AuthContext';

// Hook personalizzato per utilizzare il contesto
export function useAuth() {
  try {
    // Verifica che React sia disponibile
    if (typeof useContext !== 'function') {
      console.error('❌ [useAuth] useContext non disponibile');
      return createFallbackAuth();
    }
    
    // Verifica che AuthContext sia definito
    if (!AuthContext) {
      console.error('❌ [useAuth] AuthContext non definito');
      return createFallbackAuth();
    }
    
    const context = useContext(AuthContext);
    
    // Se il contesto è null o undefined, restituisci un oggetto di fallback
    if (!context) {
      console.warn("⚠️ [useAuth] Contesto non disponibile, usando fallback sicuro");
      return createFallbackAuth();
    }
    
    // Verifica che il context sia un oggetto valido
    if (typeof context !== 'object') {
      console.error('❌ [useAuth] Context non è un oggetto:', typeof context);
      return createFallbackAuth();
    }
    
    // Assicurati che tutte le proprietà siano definite
    return {
      currentUser: context.currentUser || null,
      loading: context.loading || false,
      login: context.login || (async () => { throw new Error("Login function not available"); }),
      signup: context.signup || (async () => { throw new Error("Signup function not available"); }),
      logout: context.logout || (async () => { throw new Error("Logout function not available"); }),
      resetPassword: context.resetPassword || (async () => { throw new Error("Reset password function not available"); })
    };
  } catch (error) {
    console.error("❌ [useAuth] Errore critico nel hook:", error);
    return createFallbackAuth();
  }
}

// Funzione helper per creare oggetto auth di fallback
function createFallbackAuth() {
  return {
    currentUser: null,
    loading: false,
    login: async () => { throw new Error("Auth context error"); },
    signup: async () => { throw new Error("Auth context error"); },
    logout: async () => { throw new Error("Auth context error"); },
    resetPassword: async () => { throw new Error("Auth context error"); }
  };
}

// Props per il provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contesto
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Funzione per registrazione
  async function signup(
    email: string,
    password: string,
    displayName: string,
    firstName?: string,
    lastName?: string
  ) {
    try {
      const firebaseAuthService = await getFirebaseAuthService();
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

  // Funzione per login
  async function login(email: string, password: string) {
    try {
      const firebaseAuthService = await getFirebaseAuthService();
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

  // Funzione per logout
  async function logout() {
    try {
      const firebaseAuthService = await getFirebaseAuthService();
      await firebaseAuthService.logout();
      setCurrentUser(null);
    } catch (error: any) {
      console.error('Errore durante il logout:', error);
      throw error;
    }
  }

  // Funzione per reset password
  async function resetPassword(email: string) {
    try {
      const firebaseAuthService = await getFirebaseAuthService();
      await firebaseAuthService.resetPassword(email);
    } catch (error: any) {
      console.error('Errore durante il reset password:', error);
      throw error;
    }
  }

  // Effetto per controllare lo stato dell'autenticazione
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupAuth = async () => {
      try {
        const firebaseAuthService = await getFirebaseAuthService();
        const User = await getFirebaseUser();
        unsubscribe = await firebaseAuthService.onAuthStateChanged((user: any | null) => {
          setCurrentUser(user);
          setLoading(false);
        });
      } catch (error) {
        console.error('❌ [AuthProvider] Errore in onAuthStateChanged:', error);
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    currentUser: currentUser || null,
    loading: loading || false,
    signup: signup || (async () => { throw new Error("Signup not available"); }),
    login: login || (async () => { throw new Error("Login not available"); }),
    logout: logout || (async () => { throw new Error("Logout not available"); }),
    resetPassword: resetPassword || (async () => { throw new Error("Reset password not available"); }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
