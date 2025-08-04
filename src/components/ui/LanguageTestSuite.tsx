'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupportedLanguages } from '@/lib/languageConfig';
import { SupportedLanguage } from '@/types/language';
import { 
  CheckIcon, 
  XIcon, 
  AlertTriangleIcon,
  PlayIcon,
  StopIcon,
  RefreshIcon
} from '@/components/icons';

interface TestResult {
  testName: string;
  language: SupportedLanguage;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number;
}

interface LanguageTestSuiteProps {
  autoRun?: boolean;
  onComplete?: (results: TestResult[]) => void;
}

export default function LanguageTestSuite({ 
  autoRun = false, 
  onComplete 
}: LanguageTestSuiteProps) {
  const { t, changeLanguage, formatDate, formatNumber, formatCurrency } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const supportedLanguages = getSupportedLanguages();

  // Test cases per ogni lingua
  const testCases = [
    {
      name: 'Traduzioni comuni',
      test: () => {
        const keys = ['dashboard', 'projects', 'settings', 'search', 'loading'];
        const failures = [];
        
        for (const key of keys) {
          const translation = t(key, 'common');
          if (translation === key) {
            failures.push(key);
          }
        }
        
        return {
          success: failures.length === 0,
          message: failures.length === 0 
            ? 'Tutte le traduzioni comuni funzionano' 
            : `Traduzioni mancanti: ${failures.join(', ')}`
        };
      }
    },
    {
      name: 'Traduzioni navigazione',
      test: () => {
        const keys = ['dashboard', 'landScraping', 'feasibilityAnalysis', 'businessPlan'];
        const failures = [];
        
        for (const key of keys) {
          const translation = t(key, 'navigation');
          if (translation === key) {
            failures.push(key);
          }
        }
        
        return {
          success: failures.length === 0,
          message: failures.length === 0 
            ? 'Tutte le traduzioni di navigazione funzionano' 
            : `Traduzioni mancanti: ${failures.join(', ')}`
        };
      }
    },
    {
      name: 'Formattazione data',
      test: () => {
        const testDate = new Date();
        const formatted = formatDate(testDate);
        
        return {
          success: formatted !== testDate.toString(),
          message: `Data formattata: ${formatted}`
        };
      }
    },
    {
      name: 'Formattazione numero',
      test: () => {
        const testNumber = 1234567.89;
        const formatted = formatNumber(testNumber);
        
        return {
          success: formatted !== testNumber.toString(),
          message: `Numero formattato: ${formatted}`
        };
      }
    },
    {
      name: 'Formattazione valuta',
      test: () => {
        const testAmount = 1500000;
        const formatted = formatCurrency(testAmount);
        
        return {
          success: formatted.includes('€') || formatted.includes('$') || formatted.includes('£'),
          message: `Valuta formattata: ${formatted}`
        };
      }
    },
    {
      name: 'Parametri traduzione',
      test: () => {
        const translation = t('welcome', 'common', { name: 'Test' });
        
        return {
          success: translation !== 'welcome',
          message: `Traduzione con parametri: ${translation}`
        };
      }
    }
  ];

  // Esegui test per una lingua specifica
  const runTestsForLanguage = async (language: SupportedLanguage): Promise<TestResult[]> => {
    const languageResults: TestResult[] = [];
    
    try {
      // Cambia lingua
      const startTime = Date.now();
      await changeLanguage(language);
      const changeTime = Date.now() - startTime;
      
      // Aggiungi test per il cambio lingua
      languageResults.push({
        testName: 'Cambio lingua',
        language,
        status: 'pass',
        message: `Lingua cambiata con successo in ${changeTime}ms`,
        duration: changeTime
      });
      
      // Attendi un momento per il rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Esegui tutti i test case
      for (const testCase of testCases) {
        const testStart = Date.now();
        setCurrentTest(`${language} - ${testCase.name}`);
        
        try {
          const result = testCase.test();
          const duration = Date.now() - testStart;
          
          languageResults.push({
            testName: testCase.name,
            language,
            status: result.success ? 'pass' : 'fail',
            message: result.message,
            duration
          });
        } catch (error) {
          const duration = Date.now() - testStart;
          languageResults.push({
            testName: testCase.name,
            language,
            status: 'fail',
            message: error instanceof Error ? error.message : 'Errore sconosciuto',
            duration
          });
        }
        
        // Piccola pausa tra i test
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
    } catch (error) {
      languageResults.push({
        testName: 'Cambio lingua',
        language,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Errore cambio lingua',
        duration: 0
      });
    }
    
    return languageResults;
  };

  // Esegui tutti i test
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    
    const allResults: TestResult[] = [];
    const totalLanguages = supportedLanguages.length;
    
    try {
      for (let i = 0; i < supportedLanguages.length; i++) {
        const language = supportedLanguages[i];
        setProgress((i / totalLanguages) * 100);
        
        console.log(`🧪 [LanguageTestSuite] Testando lingua: ${language.code}`);
        
        const languageResults = await runTestsForLanguage(language.code);
        allResults.push(...languageResults);
        
        // Aggiorna risultati in tempo reale
        setResults([...allResults]);
        
        // Pausa tra le lingue
        if (i < totalLanguages - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setProgress(100);
      
      // Calcola statistiche
      const totalTests = allResults.length;
      const passedTests = allResults.filter(r => r.status === 'pass').length;
      const failedTests = allResults.filter(r => r.status === 'fail').length;
      const warningTests = allResults.filter(r => r.status === 'warning').length;
      
      console.log(`📊 [LanguageTestSuite] Test completati:`, {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warnings: warningTests,
        successRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
      });
      
      // Callback di completamento
      if (onComplete) {
        onComplete(allResults);
      }
      
    } catch (error) {
      console.error('❌ [LanguageTestSuite] Errore durante i test:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // Auto-run se richiesto
  useEffect(() => {
    if (autoRun && !isRunning) {
      runAllTests();
    }
  }, [autoRun]);

  // Calcola statistiche
  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warning: results.filter(r => r.status === 'warning').length,
    successRate: results.length > 0 ? (results.filter(r => r.status === 'pass').length / results.length) * 100 : 0
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">🧪 Test Suite Multilingua</h3>
          <p className="text-sm text-gray-600">
            Test automatici per verificare il sistema di traduzione
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {stats.total > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">
                {stats.passed}/{stats.total} test passati
              </div>
              <div className="text-xs text-gray-500">
                {stats.successRate.toFixed(1)}% successo
              </div>
            </div>
          )}
          
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-colors
              ${isRunning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }
              text-white
            `}
          >
            {isRunning ? (
              <>
                <StopIcon className="h-4 w-4" />
                Ferma Test
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                Avvia Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {currentTest && (
            <p className="text-sm text-gray-600 mt-2">
              Testando: {currentTest}
            </p>
          )}
        </div>
      )}

      {/* Statistiche */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-green-700">Passati</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-700">Falliti</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            <div className="text-sm text-yellow-700">Warning</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
            <div className="text-sm text-blue-700">Successo</div>
          </div>
        </div>
      )}

      {/* Risultati dettagliati */}
      {results.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border-l-4 flex items-center justify-between
                ${result.status === 'pass' ? 'border-green-500 bg-green-50' :
                  result.status === 'fail' ? 'border-red-500 bg-red-50' :
                  'border-yellow-500 bg-yellow-50'
                }
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {result.status === 'pass' ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : result.status === 'fail' ? (
                    <XIcon className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="font-medium text-sm">
                    {result.language.toUpperCase()} - {result.testName}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                {result.duration}ms
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaggio iniziale */}
      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <RefreshIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nessun test eseguito</p>
          <p className="text-sm">Clicca "Avvia Test" per iniziare la verifica</p>
        </div>
      )}
    </div>
  );
} 