'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupportedLanguages } from '@/lib/languageConfig';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { 
  CheckIcon, 
  GlobeIcon, 
  SettingsIcon,
  RefreshIcon
} from '@/components/icons';
import LanguageTestSuite from '@/components/ui/LanguageTestSuite';
import HammerTest from '@/components/ui/HammerTest';
import PersistenceTest from '@/components/ui/PersistenceTest';
import SmoothnessTest from '@/components/ui/SmoothnessTest';
import CompleteLanguageTest from '@/components/ui/CompleteLanguageTest';

export default function TestLanguagePage() {
  const { 
    currentLanguage, 
    languageConfig, 
    t, 
    changeLanguage, 
    formatDate, 
    formatNumber, 
    formatCurrency,
    isRTL 
  } = useLanguage();
  
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    result: string;
    status: 'success' | 'error' | 'warning';
  }>>([]);

  const supportedLanguages = getSupportedLanguages();

  // Test completo del sistema multilingua
  const runLanguageTests = async () => {
    const results: Array<{
      test: string;
      result: string;
      status: 'success' | 'error' | 'warning';
    }> = [];

    try {
      // Test 1: Verifica lingua corrente
      results.push({
        test: 'Lingua corrente',
        result: `${languageConfig.flag} ${languageConfig.nativeName} (${currentLanguage})`,
        status: 'success'
      });

      // Test 2: Verifica traduzioni comuni
      const commonTests = [
        'dashboard',
        'projects',
        'settings',
        'search',
        'loading',
        'error',
        'success'
      ];

      for (const testKey of commonTests) {
        const translation = t(testKey, 'common');
        results.push({
          test: `Traduzione: ${testKey}`,
          result: translation,
          status: translation === testKey ? 'error' : 'success'
        });
      }

      // Test 3: Verifica traduzioni navigazione
      const navTests = [
        'dashboard',
        'landScraping',
        'feasibilityAnalysis',
        'businessPlan'
      ];

      for (const testKey of navTests) {
        const translation = t(testKey, 'navigation');
        results.push({
          test: `Navigazione: ${testKey}`,
          result: translation,
          status: translation === testKey ? 'error' : 'success'
        });
      }

      // Test 4: Verifica formattazione data
      const testDate = new Date();
      const formattedDate = formatDate(testDate);
      results.push({
        test: 'Formattazione data',
        result: formattedDate,
        status: 'success'
      });

      // Test 5: Verifica formattazione numero
      const testNumber = 1234567.89;
      const formattedNumber = formatNumber(testNumber);
      results.push({
        test: 'Formattazione numero',
        result: formattedNumber,
        status: 'success'
      });

      // Test 6: Verifica formattazione valuta
      const testAmount = 1500000;
      const formattedCurrency = formatCurrency(testAmount);
      results.push({
        test: 'Formattazione valuta',
        result: formattedCurrency,
        status: 'success'
      });

      // Test 7: Verifica direzione testo
      results.push({
        test: 'Direzione testo',
        result: isRTL ? 'RTL (Right-to-Left)' : 'LTR (Left-to-Right)',
        status: 'success'
      });

      // Test 8: Verifica configurazione lingua
      results.push({
        test: 'Configurazione lingua',
        result: `Formato data: ${languageConfig.dateFormat}, Valuta: ${languageConfig.numberFormat.currency}`,
        status: 'success'
      });

    } catch (error) {
      results.push({
        test: 'Errore generale',
        result: error instanceof Error ? error.message : 'Errore sconosciuto',
        status: 'error'
      });
    }

    setTestResults(results);
  };

  // Test cambio lingua
  const testLanguageChange = async (language: string) => {
    try {
      await changeLanguage(language as any);
      console.log(`✅ Lingua cambiata con successo a: ${language}`);
    } catch (error) {
      console.error(`❌ Errore cambio lingua a ${language}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌍 Test Sistema Multilingua
              </h1>
              <p className="text-gray-600 mt-2">
                Verifica completa del sistema di traduzione e cambio lingua
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector variant="settings" />
              
              <button
                onClick={runLanguageTests}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshIcon className="h-4 w-4" />
                Esegui Test
              </button>
            </div>
          </div>
        </div>

        {/* Stato corrente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <GlobeIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Lingua Corrente</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{languageConfig.flag}</span>
                <div>
                  <p className="font-medium">{languageConfig.nativeName}</p>
                  <p className="text-sm text-gray-500">{languageConfig.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Codice: <code className="bg-gray-100 px-1 rounded">{currentLanguage}</code>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">Configurazione</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Formato data:</strong> {languageConfig.dateFormat}</p>
              <p><strong>Valuta:</strong> {languageConfig.numberFormat.currency}</p>
              <p><strong>Direzione:</strong> {isRTL ? 'RTL' : 'LTR'}</p>
              <p><strong>Decimali:</strong> {languageConfig.numberFormat.decimal}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckIcon className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Test Rapidi</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => testLanguageChange('en')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                🇺🇸 Test English
              </button>
              <button
                onClick={() => testLanguageChange('es')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                🇪🇸 Test Español
              </button>
              <button
                onClick={() => testLanguageChange('it')}
                className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
              >
                🇮🇹 Test Italiano
              </button>
            </div>
          </div>
        </div>

        {/* Lingue supportate */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🌐 Lingue Supportate</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {supportedLanguages.map((lang) => (
              <div
                key={lang.code}
                className={`
                  p-3 rounded-lg border-2 transition-all cursor-pointer
                  ${currentLanguage === lang.code 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => testLanguageChange(lang.code)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="font-medium text-sm">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                  {currentLanguage === lang.code && (
                    <div className="mt-1">
                      <CheckIcon className="h-4 w-4 text-blue-600 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risultati test */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Risultati Test</h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-lg border-l-4
                    ${result.status === 'success' ? 'border-green-500 bg-green-50' :
                      result.status === 'error' ? 'border-red-500 bg-red-50' :
                      'border-yellow-500 bg-yellow-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{result.test}</p>
                      <p className="text-sm text-gray-600">{result.result}</p>
                    </div>
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${result.status === 'success' ? 'bg-green-100 text-green-800' :
                        result.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    `}>
                      {result.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Esempi traduzioni */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">📝 Esempi Traduzioni</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Comuni</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Dashboard:</strong> {t('dashboard', 'common')}</div>
                <div><strong>Progetti:</strong> {t('projects', 'common')}</div>
                <div><strong>Impostazioni:</strong> {t('settings', 'common')}</div>
                <div><strong>Cerca:</strong> {t('search', 'common')}</div>
                <div><strong>Caricamento:</strong> {t('loading', 'common')}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Navigazione</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Dashboard:</strong> {t('dashboard', 'navigation')}</div>
                <div><strong>AI Land Scraping:</strong> {t('landScraping', 'navigation')}</div>
                <div><strong>Analisi Fattibilità:</strong> {t('feasibilityAnalysis', 'navigation')}</div>
                <div><strong>Business Plan:</strong> {t('businessPlan', 'navigation')}</div>
                <div><strong>Marketing:</strong> {t('marketing', 'navigation')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Formattazione */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🔢 Formattazione</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">Data</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Oggi:</strong> {formatDate(new Date())}</div>
                <div><strong>Ieri:</strong> {formatDate(new Date(Date.now() - 86400000))}</div>
                <div><strong>Tra una settimana:</strong> {formatDate(new Date(Date.now() + 7 * 86400000))}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Numeri</h4>
              <div className="space-y-2 text-sm">
                <div><strong>1,234.56:</strong> {formatNumber(1234.56)}</div>
                <div><strong>1,000,000:</strong> {formatNumber(1000000)}</div>
                <div><strong>0.123:</strong> {formatNumber(0.123)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Valuta</h4>
              <div className="space-y-2 text-sm">
                <div><strong>€1,500:</strong> {formatCurrency(1500)}</div>
                <div><strong>€1,000,000:</strong> {formatCurrency(1000000)}</div>
                <div><strong>€50.99:</strong> {formatCurrency(50.99)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Suite Automatica */}
        <LanguageTestSuite 
          onComplete={(results) => {
            console.log('🎉 Test completati:', results);
          }}
        />

        {/* Hammer Test */}
        <HammerTest 
          iterations={5}
          delayBetweenTests={500}
          onComplete={(results) => {
            console.log('🔨 Hammer test completati:', results);
          }}
        />

        {/* Test Persistenza */}
        <PersistenceTest 
          onComplete={(results) => {
            console.log('💾 Test persistenza completati:', results);
          }}
        />

        {/* Test Smoothness */}
        <SmoothnessTest 
          onComplete={(results) => {
            console.log('🎯 Test smoothness completati:', results);
          }}
        />

        {/* Test Completo Sistema */}
        <CompleteLanguageTest 
          onComplete={(results) => {
            console.log('🏆 Test completo sistema completati:', results);
          }}
        />
      </div>
    </div>
  );
} 