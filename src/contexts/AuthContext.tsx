'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { firebaseAuthService, User } from '@/lib/firebaseAuthService';

// Interfaccia per il contesto di autenticazione
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

// Hook personalizzato per utilizzare il contesto - VERSIONE ULTRA-ROBUSTA CON PROTEZIONE AGGIUNTIVA
export function useAuth() {
  try {
    // Controllo diretto del contesto
    const context = useContext(AuthContext);
    
    // Se il contesto è null o undefined, restituisci un oggetto di fallback
    if (!context) {
      console.warn("⚠️ [useAuth] Contesto non disponibile, usando fallback sicuro");
      return {
        currentUser: null,
        loading: false,
        login: async () => { throw new Error("Auth context not available"); },
        signup: async () => { throw new Error("Auth context not available"); },
        logout: async () => { throw new Error("Auth context not available"); },
        resetPassword: async () => { throw new Error("Auth context not available"); }
      };
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
    // Restituisci sempre un oggetto valido, mai undefined
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
      await firebaseAuthService.resetPassword(email);
    } catch (error: any) {
      console.error('Errore durante il reset password:', error);
      throw error;
    }
  }

  // Effetto per controllare lo stato dell'autenticazione
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged((user: User | null) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
