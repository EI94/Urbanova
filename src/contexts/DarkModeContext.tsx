'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);

  // Carica il dark mode dal localStorage al mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('urbanova-dark-mode');
    if (savedDarkMode !== null) {
      setDarkModeState(JSON.parse(savedDarkMode));
    }
  }, []);

  // Applica il dark mode al document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkModeState(newDarkMode);
    localStorage.setItem('urbanova-dark-mode', JSON.stringify(newDarkMode));
  };

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    localStorage.setItem('urbanova-dark-mode', JSON.stringify(value));
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
