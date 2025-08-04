'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupportedLanguages } from '@/lib/languageConfig';
import { SupportedLanguage } from '@/types/language';
import { 
  GlobeIcon, 
  CheckIcon, 
  ChevronDownIcon,
  SettingsIcon
} from '@/components/icons';

interface LanguageSelectorProps {
  variant?: 'header' | 'sidebar' | 'settings';
  className?: string;
}

export default function LanguageSelector({ 
  variant = 'header', 
  className = '' 
}: LanguageSelectorProps) {
  const { currentLanguage, languageConfig, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supportedLanguages = getSupportedLanguages();

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestione cambio lingua
  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (language === currentLanguage || isChanging) return;

    try {
      setIsChanging(true);
      setIsOpen(false);
      
      console.log(`🔄 [LanguageSelector] Cambio lingua a: ${language}`);
      
      await changeLanguage(language);
      
      // Forza re-render della pagina per aggiornare tutti i contenuti
      window.location.reload();
      
    } catch (error) {
      console.error('❌ [LanguageSelector] Errore cambio lingua:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Stili varianti
  const getVariantStyles = () => {
    switch (variant) {
      case 'header':
        return 'bg-white border border-gray-200 hover:bg-gray-50';
      case 'sidebar':
        return 'bg-blue-700/50 hover:bg-blue-700/70 text-white';
      case 'settings':
        return 'bg-gray-100 hover:bg-gray-200';
      default:
        return 'bg-white border border-gray-200 hover:bg-gray-50';
    }
  };

  const getDropdownStyles = () => {
    switch (variant) {
      case 'header':
        return 'bg-white border border-gray-200 shadow-lg';
      case 'sidebar':
        return 'bg-blue-800 border border-blue-700 shadow-lg';
      case 'settings':
        return 'bg-white border border-gray-200 shadow-lg';
      default:
        return 'bg-white border border-gray-200 shadow-lg';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'sidebar':
        return 'text-white';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Pulsante principale */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200
          ${getVariantStyles()}
          ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={t('language', 'common')}
      >
        <GlobeIcon className="h-4 w-4" />
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {languageConfig.flag} {languageConfig.nativeName}
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${getTextColor()} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-1 w-64 rounded-md shadow-lg z-50
          ${getDropdownStyles()}
          ${variant === 'sidebar' ? 'text-white' : 'text-gray-700'}
        `}>
          <div className="py-1">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium">
                {t('language', 'common')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t('selectLanguage', 'common')}
              </p>
            </div>

            {/* Lista lingue */}
            <div className="max-h-60 overflow-y-auto">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isChanging}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm
                    transition-colors duration-150
                    ${variant === 'sidebar' 
                      ? 'hover:bg-blue-700/50 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                    ${currentLanguage === lang.code 
                      ? variant === 'sidebar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-50 text-blue-700'
                      : ''
                    }
                    ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className={`text-xs ${variant === 'sidebar' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {lang.name}
                      </div>
                    </div>
                  </div>
                  
                  {currentLanguage === lang.code && (
                    <CheckIcon className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer con impostazioni */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Apri modal impostazioni lingua
                }}
                className={`
                  w-full flex items-center justify-center gap-2 px-3 py-2 text-sm
                  rounded-md transition-colors duration-150
                  ${variant === 'sidebar' 
                    ? 'hover:bg-blue-700/50 text-blue-200' 
                    : 'hover:bg-gray-100 text-gray-600'
                  }
                `}
              >
                <SettingsIcon className="h-4 w-4" />
                {t('languageSettings', 'common')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay per chiudere */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 