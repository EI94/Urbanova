// Configurazione lingue supportate - Urbanova AI
import { LanguageConfig, SupportedLanguage } from '@/types/language';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR'
    }
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'USD'
    }
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR'
    }
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: 'EUR'
    }
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR'
    }
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR'
    }
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: 'RUB'
    }
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    dateFormat: 'yyyy-MM-dd',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'CNY'
    }
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'JPY'
    }
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    dateFormat: 'yyyy-MM-dd',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'KRW'
    }
  }
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'it';

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

// Funzione per ottenere la configurazione di una lingua
export function getLanguageConfig(language: SupportedLanguage): LanguageConfig {
  return SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

// Funzione per ottenere tutte le lingue supportate
export function getSupportedLanguages(): LanguageConfig[] {
  return Object.values(SUPPORTED_LANGUAGES);
}

// Funzione per rilevare la lingua del browser
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'it';
  const langCode = browserLang.split('-')[0] as SupportedLanguage;
  
  return SUPPORTED_LANGUAGES[langCode] ? langCode : DEFAULT_LANGUAGE;
}

// Funzione per salvare la lingua nelle impostazioni
export function saveLanguagePreference(language: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('urbanova-language', language);
    localStorage.setItem('urbanova-language-timestamp', Date.now().toString());
  } catch (error) {
    console.error('Errore nel salvataggio della lingua:', error);
  }
}

// Funzione per caricare la lingua dalle impostazioni
export function loadLanguagePreference(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  try {
    const savedLanguage = localStorage.getItem('urbanova-language') as SupportedLanguage;
    const timestamp = localStorage.getItem('urbanova-language-timestamp');
    
    // Verifica che la lingua sia ancora supportata
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }
  } catch (error) {
    console.error('Errore nel caricamento della lingua:', error);
  }
  
  return DEFAULT_LANGUAGE;
} 