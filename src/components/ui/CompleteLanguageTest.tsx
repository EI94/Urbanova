'use client';

import React, { useState, useEffect } from 'react';
import { useLanguageTest } from '@/hooks/useLanguageTest';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupportedLanguages } from '@/lib/languageConfig';
import { 
  PlayIcon, 
  StopIcon, 
  CheckIcon,
  XIcon,
  ClockIcon,
  ZapIcon,
  EyeIcon,
  SaveIcon,
  DownloadIcon,
  TrophyIcon
} from '@/components/icons';

interface CompleteTestResult {
  testSuite: string;
  status: 'pass' | 'fail' | 'warning';
  duration: number;
  details: any;
  timestamp: Date;
}

interface CompleteTestProps {
  onComplete?: (results: any) => void;
}

export default function CompleteLanguageTest({ onComplete }: CompleteTestProps) {
  const { currentLanguage } = useLanguage();
  const {
    isRunning,
    results: languageResults,
    currentTest,
    progress,
    stats: languageStats,
    runAllTests,
    testSingleLanguage,
    resetResults,
    exportResults,
    supportedLanguages
  } = useLanguageTest();

  const [isCompleteTestRunning, setIsCompleteTestRunning] = useState(false);
  const [completeResults, setCompleteResults] = useState<CompleteTestResult[]>([]);
  const [currentTestSuite, setCurrentTestSuite] = useState<string>('');
  const [completeProgress, setCompleteProgress] = useState(0);
  const [originalLanguage, setOriginalLanguage] = useState<string | null>(null);

  // Test suite per il sistema completo
  const testSuites = [
    {
      name: 'Test Base Traduzioni',
      description: 'Verifica traduzioni comuni e navigazione',
      test: async () => {
        setCurrentTestSuite('Test Base Traduzioni');
        const startTime = Date.now();
        
        await runAllTests();
        
        const duration = Date.now() - startTime;
        
        return {
          status: languageStats.successRate >= 90 ? 'pass' : 
                  languageStats.successRate >= 70 ? 'warning' : 'fail',
          duration,
          details: {
            successRate: languageStats.successRate,
            totalTests: languageStats.total,
            passedTests: languageStats.passed,
            failedTests: languageStats.failed
          }
        };
      }
    },
    {
      name: 'Test Persistenza',
      description: 'Verifica salvataggio e caricamento lingua',
      test: async () => {
        setCurrentTestSuite('Test Persistenza');
        const startTime = Date.now();
        
        // Simula test di persistenza
        const testLanguage = supportedLanguages.find(l => l.code !== currentLanguage)?.code || 'en';
        const originalLang = currentLanguage;
        
        // Cambia lingua
        await testSingleLanguage(testLanguage);
        
        // Verifica localStorage
        const savedLanguage = localStorage.getItem('urbanova-language');
        const savedTimestamp = localStorage.getItem('urbanova-language-timestamp');
        
        // Ripristina lingua originale
        await testSingleLanguage(originalLang);
        
        const duration = Date.now() - startTime;
        
        const isPersistent = savedLanguage === testLanguage && savedTimestamp;
        
        return {
          status: isPersistent ? 'pass' : 'fail',
          duration,
          details: {
            savedLanguage,
            savedTimestamp,
            isPersistent
          }
        };
      }
    },
    {
      name: 'Test Performance',
      description: 'Verifica velocità cambio lingua',
      test: async () => {
        setCurrentTestSuite('Test Performance');
        const startTime = Date.now();
        
        const performanceResults = [];
        
        // Test performance per ogni lingua
        for (const language of supportedLanguages.slice(0, 3)) { // Test solo prime 3 lingue
          const langStart = Date.now();
          await testSingleLanguage(language.code);
          const langDuration = Date.now() - langStart;
          performanceResults.push({
            language: language.code,
            duration: langDuration
          });
        }
        
        const duration = Date.now() - startTime;
        const averageDuration = performanceResults.reduce((sum, r) => sum + r.duration, 0) / performanceResults.length;
        
        return {
          status: averageDuration < 500 ? 'pass' : 
                  averageDuration < 1000 ? 'warning' : 'fail',
          duration,
          details: {
            averageDuration,
            performanceResults,
            threshold: 500
          }
        };
      }
    },
    {
      name: 'Test Integrità',
      description: 'Verifica integrità dati e configurazione',
      test: async () => {
        setCurrentTestSuite('Test Integrità');
        const startTime = Date.now();
        
        // Verifica configurazione lingua
        const configChecks = supportedLanguages.map(lang => ({
          language: lang.code,
          hasConfig: !!lang,
          hasFlag: !!lang.flag,
          hasName: !!lang.name,
          hasNativeName: !!lang.nativeName
        }));
        
        // Verifica localStorage
        const storageChecks = {
          hasLanguage: !!localStorage.getItem('urbanova-language'),
          hasTimestamp: !!localStorage.getItem('urbanova-language-timestamp'),
          validLanguage: supportedLanguages.some(l => l.code === localStorage.getItem('urbanova-language')),
          validTimestamp: !isNaN(parseInt(localStorage.getItem('urbanova-language-timestamp') || '0'))
        };
        
        const duration = Date.now() - startTime;
        
        const allConfigValid = configChecks.every(c => c.hasConfig && c.hasFlag && c.hasName && c.hasNativeName);
        const allStorageValid = storageChecks.hasLanguage && storageChecks.hasTimestamp && 
                               storageChecks.validLanguage && storageChecks.validTimestamp;
        
        return {
          status: allConfigValid && allStorageValid ? 'pass' : 'fail',
          duration,
          details: {
            configChecks,
            storageChecks,
            allConfigValid,
            allStorageValid
          }
        };
      }
    },
    {
      name: 'Test Stress',
      description: 'Test rapido cambio lingua multiplo',
      test: async () => {
        setCurrentTestSuite('Test Stress');
        const startTime = Date.now();
        
        const stressResults = [];
        const testLanguages = ['it', 'en', 'es'];
        
        for (let i = 0; i < 3; i++) {
          for (const lang of testLanguages) {
            const langStart = Date.now();
            await testSingleLanguage(lang);
            const langDuration = Date.now() - langStart;
            stressResults.push({
              iteration: i + 1,
              language: lang,
              duration: langDuration,
              success: langDuration < 1000
            });
          }
        }
        
        const duration = Date.now() - startTime;
        const successfulChanges = stressResults.filter(r => r.success).length;
        const successRate = (successfulChanges / stressResults.length) * 100;
        
        return {
          status: successRate >= 90 ? 'pass' : 
                  successRate >= 70 ? 'warning' : 'fail',
          duration,
          details: {
            successRate,
            totalChanges: stressResults.length,
            successfulChanges,
            stressResults
          }
        };
      }
    }
  ];

  // Esegui test completo
  const runCompleteTest = async () => {
    setIsCompleteTestRunning(true);
    setCompleteResults([]);
    setCompleteProgress(0);
    setOriginalLanguage(currentLanguage);
    
    console.log(`🏆 [CompleteLanguageTest] Avvio test completo sistema multilingua`);
    
    const allResults: CompleteTestResult[] = [];
    
    try {
      for (let i = 0; i < testSuites.length; i++) {
        const testSuite = testSuites[i];
        setCompleteProgress((i / testSuites.length) * 100);
        
        console.log(`🏆 [CompleteLanguageTest] Esecuzione: ${testSuite.name}`);
        
        try {
          const result = await testSuite.test();
          
          const completeResult: CompleteTestResult = {
            testSuite: testSuite.name,
            status: result.status,
            duration: result.duration,
            details: result.details,
            timestamp: new Date()
          };
          
          allResults.push(completeResult);
          setCompleteResults([...allResults]);
          
          console.log(`🏆 [CompleteLanguageTest] ${testSuite.name}: ${result.status} (${result.duration}ms)`);
          
          // Pausa tra i test suite
          if (i < testSuites.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          console.error(`❌ [CompleteLanguageTest] Errore ${testSuite.name}:`, error);
          
          const errorResult: CompleteTestResult = {
            testSuite: testSuite.name,
            status: 'fail',
            duration: 0,
            details: { error: error instanceof Error ? error.message : 'Errore sconosciuto' },
            timestamp: new Date()
          };
          
          allResults.push(errorResult);
          setCompleteResults([...allResults]);
        }
      }
      
      setCompleteProgress(100);
      
      // Calcola statistiche finali
      const totalTests = allResults.length;
      const passedTests = allResults.filter(r => r.status === 'pass').length;
      const failedTests = allResults.filter(r => r.status === 'fail').length;
      const warningTests = allResults.filter(r => r.status === 'warning').length;
      const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0);
      const successRate = (passedTests / totalTests) * 100;
      
      const finalStats = {
        totalTests,
        passedTests,
        failedTests,
        warningTests,
        successRate,
        totalDuration,
        averageDuration: totalDuration / totalTests,
        overallStatus: successRate >= 90 ? 'excellent' : 
                      successRate >= 70 ? 'good' : 
                      successRate >= 50 ? 'acceptable' : 'poor'
      };
      
      console.log(`🏆 [CompleteLanguageTest] Test completati:`, finalStats);
      
      // Callback di completamento
      if (onComplete) {
        onComplete({
          results: allResults,
          stats: finalStats
        });
      }
      
    } catch (error) {
      console.error('❌ [CompleteLanguageTest] Errore generale:', error);
    } finally {
      setIsCompleteTestRunning(false);
      setCurrentTestSuite('');
    }
  };

  // Calcola statistiche
  const stats = {
    total: completeResults.length,
    passed: completeResults.filter(r => r.status === 'pass').length,
    failed: completeResults.filter(r => r.status === 'fail').length,
    warning: completeResults.filter(r => r.status === 'warning').length,
    successRate: completeResults.length > 0 ? (completeResults.filter(r => r.status === 'pass').length / completeResults.length) * 100 : 0,
    totalDuration: completeResults.reduce((sum, r) => sum + r.duration, 0)
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-600" />
            🏆 Test Completo Sistema Multilingua
          </h3>
          <p className="text-sm text-gray-600">
            Esegue tutti i test per verificare il sistema completo
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {stats.total > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">
                {stats.passed}/{stats.total} test suite passate
              </div>
              <div className="text-xs text-gray-500">
                {stats.successRate.toFixed(1)}% successo • {stats.totalDuration}ms
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={runCompleteTest}
              disabled={isCompleteTestRunning}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm
                ${isCompleteTestRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
                }
                text-white
              `}
            >
              <PlayIcon className="h-4 w-4" />
              {isCompleteTestRunning ? 'Test in corso...' : 'Test Completo'}
            </button>
            
            {stats.total > 0 && (
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                <DownloadIcon className="h-4 w-4" />
                Esporta
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {isCompleteTestRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Test Completo</span>
            <span className="text-sm text-gray-500">{completeProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completeProgress}%` }}
            ></div>
          </div>
          {currentTestSuite && (
            <p className="text-sm text-gray-600 mt-2">
              {currentTestSuite}
            </p>
          )}
        </div>
      )}

      {/* Statistiche */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.total}</div>
            <div className="text-sm text-yellow-700">Test Suite</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-green-700">Passate</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-700">Fallite</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
            <div className="text-sm text-blue-700">Successo</div>
          </div>
        </div>
      )}

      {/* Lista test suite */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Test Suite Disponibili</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testSuites.map((suite, index) => {
            const result = completeResults.find(r => r.testSuite === suite.name);
            return (
              <div
                key={index}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${result 
                    ? result.status === 'pass' ? 'border-green-500 bg-green-50' :
                      result.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{suite.name}</span>
                  {result && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${result.status === 'pass' ? 'bg-green-100 text-green-800' :
                        result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    `}>
                      {result.status.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{suite.description}</p>
                {result && (
                  <p className="text-xs text-gray-500">
                    {result.duration}ms • {result.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Risultati dettagliati */}
      {completeResults.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <h4 className="font-medium mb-3">Risultati Dettagliati</h4>
          
          {completeResults.map((result, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border-l-4 flex items-center justify-between
                ${result.status === 'pass' ? 'border-green-500 bg-green-50' :
                  result.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-red-500 bg-red-50'
                }
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {result.status === 'pass' ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : result.status === 'warning' ? (
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <XIcon className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium text-sm">{result.testSuite}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {result.duration}ms • {Object.keys(result.details).length} dettagli
                </p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                {result.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaggio iniziale */}
      {completeResults.length === 0 && !isCompleteTestRunning && (
        <div className="text-center py-8 text-gray-500">
          <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nessun test completo eseguito</p>
          <p className="text-sm">Clicca "Test Completo" per verificare tutto il sistema</p>
        </div>
      )}
    </div>
  );
} 