'use client';

// 🔍 DEBUG TDZ: Log immediato per capire quando questo file viene valutato
console.log(`🔍 [TDZ DEBUG] DarkModeContext.tsx MODULO IMPORTATO - timestamp: ${Date.now()}, typeof window: ${typeof window}, stack:`, new Error().stack?.split('\n').slice(1, 5).join('\n'));

import React, { createContext, useContext, useState, useEffect } from 'react';

console.log(`🔍 [TDZ DEBUG] DarkModeContext.tsx - React importato, timestamp: ${Date.now()}`);

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
