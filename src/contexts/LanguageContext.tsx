'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import {
  getLanguageConfig,
  detectBrowserLanguage,
  saveLanguagePreference,
  loadLanguagePreference,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
} from '@/lib/languageConfig';

// Importa le traduzioni - lazy loading per evitare TDZ
import { LanguageContextType, SupportedLanguage, LanguageSettings } from '@/types/language';

// Cache delle traduzioni - caricata solo quando necessario
let translationsCache: Record<string, any> | null = null;

const loadTranslations = async () => {
  if (!translationsCache && typeof window !== 'undefined') {
    try {
      const [it, en, es] = await Promise.all([
        import('@/translations/it'),
        import('@/translations/en'),
        import('@/translations/es'),
      ]);
      
      translationsCache = {
        it: it.it || it.default || {},
        en: en.en || en.default || {},
        es: es.es || es.default || {},
        // Fallback temporanei
        fr: it.it || it.default || {},
        de: it.it || it.default || {},
        pt: it.it || it.default || {},
        ru: it.it || it.default || {},
        zh: it.it || it.default || {},
        ja: it.it || it.default || {},
        ko: it.it || it.default || {},
      };
    } catch (error) {
      console.error('❌ [LanguageContext] Errore caricamento traduzioni:', error);
      // Fallback vuoto
      translationsCache = {
        it: {},
        en: {},
        es: {},
        fr: {},
        de: {},
        pt: {},
        ru: {},
        zh: {},
        ja: {},
        ko: {},
      };
    }
  }
  return translationsCache || {};
};

// Funzione helper per ottenere traduzioni
const getTranslations = () => {
  if (!translationsCache) {
    // Caricamento sincrono se già disponibile (SSR fallback)
    try {
      const it = require('@/translations/it');
      const en = require('@/translations/en');
      const es = require('@/translations/es');
      translationsCache = {
        it: it.it || it.default || {},
        en: en.en || en.default || {},
        es: es.es || es.default || {},
        fr: it.it || it.default || {},
        de: it.it || it.default || {},
        pt: it.it || it.default || {},
        ru: it.it || it.default || {},
        zh: it.it || it.default || {},
        ja: it.it || it.default || {},
        ko: it.it || it.default || {},
      };
    } catch (error) {
      translationsCache = {
        it: {},
        en: {},
        es: {},
        fr: {},
        de: {},
        pt: {},
        ru: {},
        zh: {},
        ja: {},
        ko: {},
      };
    }
  }
  return translationsCache;
};

const translations = getTranslations();

// Funzione per ottenere traduzione nidificata
function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj);
}

// Funzione per sostituire parametri nelle traduzioni
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

// Creazione del context
const LanguageContext = createContext<LanguageContextType | null>(null);

// Hook personalizzato
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage deve essere utilizzato all'interno di un LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inizializzazione
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // 1. Prova a caricare la lingua salvata
        const savedLanguage = loadLanguagePreference();

        // 2. Se non c'è lingua salvata, rileva dal browser
        const detectedLanguage = savedLanguage || detectBrowserLanguage();

        // 3. Verifica che la lingua sia supportata
        const finalLanguage = translations[detectedLanguage] ? detectedLanguage : DEFAULT_LANGUAGE;

        setCurrentLanguage(finalLanguage);
        setIsInitialized(true);

        console.log(`🌍 [LanguageProvider] Lingua inizializzata: ${finalLanguage}`);
      } catch (error) {
        console.error('❌ [LanguageProvider] Errore inizializzazione lingua:', error);
        setCurrentLanguage(DEFAULT_LANGUAGE);
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, []);

  // Funzione per cambiare lingua
  const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
    try {
      console.log(`🔄 [LanguageProvider] Cambio lingua da ${currentLanguage} a ${language}`);

      // Verifica che la lingua sia supportata
      if (!translations[language]) {
        console.warn(`⚠️ [LanguageProvider] Lingua ${language} non supportata, uso fallback`);
        language = FALLBACK_LANGUAGE;
      }

      // Aggiorna lo stato
      setCurrentLanguage(language);

      // Salva la preferenza
      saveLanguagePreference(language);

      // Aggiorna l'attributo lang del documento
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
        document.documentElement.dir = getLanguageConfig(language).direction;

        // Aggiorna anche il title e meta tags se necessario
        const titleElement = document.querySelector('title');
        if (titleElement) {
          titleElement.textContent = `Urbanova - ${getLanguageConfig(language).nativeName}`;
        }
      }

      console.log(`✅ [LanguageProvider] Lingua cambiata con successo: ${language}`);
    } catch (error) {
      console.error('❌ [LanguageProvider] Errore cambio lingua:', error);
      throw error;
    }
  };

  // Funzione di traduzione
  const t = (key: string, namespace?: string, params?: Record<string, string | number>): string => {
    try {
      const translationData = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];

      // Costruisci il percorso completo
      const fullPath = namespace ? `${namespace}.${key}` : key;

      // Ottieni la traduzione
      let translation = getNestedTranslation(translationData, fullPath);

      // Se non trovata, prova con il namespace 'common'
      if (translation === fullPath && namespace && namespace !== 'common') {
        translation = getNestedTranslation(translationData, `common.${key}`);
      }

      // Se ancora non trovata, usa la chiave come fallback
      if (translation === fullPath || translation === `common.${key}`) {
        console.warn(
          `⚠️ [LanguageProvider] Traduzione mancante: ${fullPath} per lingua ${currentLanguage}`
        );
        translation = key;
      }

      // Sostituisci i parametri
      return replaceParams(translation, params);
    } catch (error) {
      console.error('❌ [LanguageProvider] Errore traduzione:', error);
      return key;
    }
  };

  // Funzioni di formattazione
  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const config = getLanguageConfig(currentLanguage);

      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
    } catch (error) {
      console.error('❌ [LanguageProvider] Errore formattazione data:', error);
      return date.toString();
    }
  };

  const formatNumber = (number: number): string => {
    try {
      const config = getLanguageConfig(currentLanguage);

      return new Intl.NumberFormat(currentLanguage, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(number);
    } catch (error) {
      console.error('❌ [LanguageProvider] Errore formattazione numero:', error);
      return number.toString();
    }
  };

  const formatCurrency = (amount: number): string => {
    try {
      const config = getLanguageConfig(currentLanguage);

      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency: config.numberFormat.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      console.error('❌ [LanguageProvider] Errore formattazione valuta:', error);
      return `${amount} €`;
    }
  };

  // Configurazione lingua corrente
  const languageConfig = getLanguageConfig(currentLanguage);
  const isRTL = languageConfig.direction === 'rtl';

  const value: LanguageContextType = {
    currentLanguage,
    languageConfig,
    t,
    changeLanguage,
    isRTL,
    formatDate,
    formatNumber,
    formatCurrency,
  };

  // Non renderizzare finché non è inizializzato
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento lingua...</p>
        </div>
      </div>
    );
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
