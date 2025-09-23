// Tipi per il sistema multilingua - Urbanova AI

export type SupportedLanguage = 'it' | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
}

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface TranslationData {
  [namespace: string]: TranslationNamespace;
}

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  languageConfig: LanguageConfig;
  t: (key: string, namespace?: string, params?: Record<string, string | number>) => string;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  formatDate: (date: Date | string) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
}

export interface LanguageSettings {
  language: SupportedLanguage;
  autoDetect: boolean;
  fallbackLanguage: SupportedLanguage;
  persistLanguage: boolean;
}
