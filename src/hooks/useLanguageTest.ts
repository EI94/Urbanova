// Hook per test automatici del sistema multilingua - Urbanova AI
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupportedLanguages } from '@/lib/languageConfig';
import { SupportedLanguage } from '@/types/language';

interface TestResult {
  testName: string;
  language: SupportedLanguage;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number;
  timestamp: Date;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  warning: number;
  successRate: number;
  averageDuration: number;
}

export function useLanguageTest() {
  const { t, changeLanguage, formatDate, formatNumber, formatCurrency } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<TestStats>({
    total: 0,
    passed: 0,
    failed: 0,
    warning: 0,
    successRate: 0,
    averageDuration: 0
  });

  const supportedLanguages = getSupportedLanguages();

  // Test cases per ogni lingua
  const testCases = [
    {
      name: 'Traduzioni comuni',
      test: () => {
        const keys = ['dashboard', 'projects', 'settings', 'search', 'loading', 'error', 'success'];
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
        const keys = ['dashboard', 'landScraping', 'feasibilityAnalysis', 'businessPlan', 'marketing'];
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
          success: formatted !== testDate.toString() && formatted.length > 0,
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
          success: formatted !== testNumber.toString() && formatted.length > 0,
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
          success: formatted.includes('€') || formatted.includes('$') || formatted.includes('£') || formatted.includes('¥'),
          message: `Valuta formattata: ${formatted}`
        };
      }
    },
    {
      name: 'Parametri traduzione',
      test: () => {
        // Test con parametri (se disponibili)
        const translation = t('welcome', 'common', { name: 'Test' });
        
        return {
          success: translation !== 'welcome',
          message: `Traduzione con parametri: ${translation}`
        };
      }
    },
    {
      name: 'Fallback traduzioni',
      test: () => {
        // Test con chiave inesistente
        const translation = t('nonexistent_key_12345', 'common');
        
        return {
          success: translation === 'nonexistent_key_12345', // Dovrebbe restituire la chiave se non trovata
          message: `Fallback funziona: ${translation}`
        };
      }
    }
  ];

  // Esegui test per una lingua specifica
  const runTestsForLanguage = useCallback(async (language: SupportedLanguage): Promise<TestResult[]> => {
    const languageResults: TestResult[] = [];
    
    try {
      // Test cambio lingua
      const changeStart = Date.now();
      await changeLanguage(language);
      const changeTime = Date.now() - changeStart;
      
      languageResults.push({
        testName: 'Cambio lingua',
        language,
        status: 'pass',
        message: `Lingua cambiata con successo in ${changeTime}ms`,
        duration: changeTime,
        timestamp: new Date()
      });
      
      // Attendi per il rendering
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
            duration,
            timestamp: new Date()
          });
        } catch (error) {
          const duration = Date.now() - testStart;
          languageResults.push({
            testName: testCase.name,
            language,
            status: 'fail',
            message: error instanceof Error ? error.message : 'Errore sconosciuto',
            duration,
            timestamp: new Date()
          });
        }
        
        // Pausa tra i test
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
    } catch (error) {
      languageResults.push({
        testName: 'Cambio lingua',
        language,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Errore cambio lingua',
        duration: 0,
        timestamp: new Date()
      });
    }
    
    return languageResults;
  }, [t, changeLanguage, formatDate, formatNumber, formatCurrency]);

  // Esegui tutti i test
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    
    const allResults: TestResult[] = [];
    const totalLanguages = supportedLanguages.length;
    
    try {
      console.log(`🧪 [useLanguageTest] Avvio test per ${totalLanguages} lingue`);
      
      for (let i = 0; i < supportedLanguages.length; i++) {
        const language = supportedLanguages[i];
        setProgress((i / totalLanguages) * 100);
        
        console.log(`🧪 [useLanguageTest] Testando lingua: ${language.code}`);
        
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
      
      // Calcola statistiche finali
      const totalTests = allResults.length;
      const passedTests = allResults.filter(r => r.status === 'pass').length;
      const failedTests = allResults.filter(r => r.status === 'fail').length;
      const warningTests = allResults.filter(r => r.status === 'warning').length;
      const averageDuration = allResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;
      
      const finalStats: TestStats = {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warning: warningTests,
        successRate: (passedTests / totalTests) * 100,
        averageDuration
      };
      
      setStats(finalStats);
      
      console.log(`📊 [useLanguageTest] Test completati:`, finalStats);
      
    } catch (error) {
      console.error('❌ [useLanguageTest] Errore durante i test:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }, [supportedLanguages, runTestsForLanguage]);

  // Test rapido per una lingua specifica
  const testSingleLanguage = useCallback(async (language: SupportedLanguage) => {
    console.log(`🧪 [useLanguageTest] Test rapido per lingua: ${language}`);
    
    const results = await runTestsForLanguage(language);
    setResults(results);
    
    // Calcola statistiche
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'pass').length;
    const failedTests = results.filter(r => r.status === 'fail').length;
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    
    const singleStats: TestStats = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      warning: 0,
      successRate: (passedTests / totalTests) * 100,
      averageDuration
    };
    
    setStats(singleStats);
    
    return results;
  }, [runTestsForLanguage]);

  // Reset risultati
  const resetResults = useCallback(() => {
    setResults([]);
    setStats({
      total: 0,
      passed: 0,
      failed: 0,
      warning: 0,
      successRate: 0,
      averageDuration: 0
    });
  }, []);

  // Esporta risultati
  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats,
      results,
      summary: {
        totalLanguages: supportedLanguages.length,
        testedLanguages: [...new Set(results.map(r => r.language))],
        successRate: stats.successRate,
        averageDuration: stats.averageDuration
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `language-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [stats, results, supportedLanguages.length]);

  return {
    // Stato
    isRunning,
    results,
    currentTest,
    progress,
    stats,
    
    // Azioni
    runAllTests,
    testSingleLanguage,
    resetResults,
    exportResults,
    
    // Dati
    supportedLanguages,
    testCases
  };
} 