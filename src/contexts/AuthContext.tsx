'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Rimosso le importazioni di Firebase non necessarie per il mock

// Interfaccia per l'utente
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Interfaccia per il contesto di autenticazione
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Creazione del contesto con valori predefiniti
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizzato per utilizzare il contesto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
}

// Props per il provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contesto
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Per ora utilizziamo funzioni mock per simulare l'autenticazione
  // In un'implementazione reale, qui utilizzeresti Firebase, NextAuth o altra soluzione
  async function signup(email: string, password: string, displayName: string) {
    // Simulazione registrazione
    console.log('Registrazione con:', email, password, displayName);
    // Simuliamo un utente creato
    setCurrentUser({
      uid: Math.random().toString(36).substring(2),
      email,
      displayName
    });
    // In una vera implementazione qui chiameresti createUserWithEmailAndPassword di Firebase
    return Promise.resolve();
  }

  async function login(email: string, password: string) {
    // Simulazione login
    console.log('Login con:', email, password);
    // Simuliamo un utente autenticato
    setCurrentUser({
      uid: Math.random().toString(36).substring(2),
      email,
      displayName: 'Utente di prova'
    });
    // In una vera implementazione qui chiameresti signInWithEmailAndPassword di Firebase
    return Promise.resolve();
  }

  async function logout() {
    // Simulazione logout
    console.log('Logout');
    setCurrentUser(null);
    // In una vera implementazione qui chiameresti signOut di Firebase
    return Promise.resolve();
  }

  async function resetPassword(email: string) {
    // Simulazione reset password
    console.log('Reset password per:', email);
    // In una vera implementazione qui chiameresti sendPasswordResetEmail di Firebase
    return Promise.resolve();
  }

  // Effetto per controllare lo stato dell'autenticazione al montaggio del componente
  useEffect(() => {
    // Simuliamo il caricamento iniziale
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
    // In una vera implementazione qui utilizzeresti onAuthStateChanged di Firebase
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 