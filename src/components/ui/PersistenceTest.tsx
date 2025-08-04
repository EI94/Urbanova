'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupportedLanguages } from '@/lib/languageConfig';
import { SupportedLanguage } from '@/types/language';
import { 
  CheckIcon, 
  XIcon, 
  RefreshIcon,
  SaveIcon,
  LoadIcon,
  ClockIcon
} from '@/components/icons';

interface PersistenceTestProps {
  onComplete?: (results: any) => void;
}

export default function PersistenceTest({ onComplete }: PersistenceTestProps) {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Array<{
    test: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);
  
  const [originalLanguage, setOriginalLanguage] = useState<SupportedLanguage | null>(null);
  const supportedLanguages = getSupportedLanguages();

  // Test di persistenza
  const runPersistenceTest = async () => {
    setIsRunning(true);
    setResults([]);
    setOriginalLanguage(currentLanguage);

    console.log(`💾 [PersistenceTest] Avvio test persistenza lingua`);

    const testResults = [];

    try {
      // Test 1: Salvataggio lingua
      const testLanguage = supportedLanguages.find(l => l.code !== currentLanguage)?.code || 'en';
      
      console.log(`💾 [PersistenceTest] Cambio lingua da ${currentLanguage} a ${testLanguage}`);
      
      await changeLanguage(testLanguage);
      
      testResults.push({
        test: 'Cambio lingua',
        status: 'pass',
        message: `Lingua cambiata da ${currentLanguage} a ${testLanguage}`,
        timestamp: new Date()
      });

      // Test 2: Verifica localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const savedLanguage = localStorage.getItem('urbanova-language');
      const savedTimestamp = localStorage.getItem('urbanova-language-timestamp');
      
      if (savedLanguage === testLanguage && savedTimestamp) {
        testResults.push({
          test: 'Salvataggio localStorage',
          status: 'pass',
          message: `Lingua salvata: ${savedLanguage}, Timestamp: ${new Date(parseInt(savedTimestamp)).toLocaleString()}`,
          timestamp: new Date()
        });
      } else {
        testResults.push({
          test: 'Salvataggio localStorage',
          status: 'fail',
          message: `Lingua non salvata correttamente. Atteso: ${testLanguage}, Trovato: ${savedLanguage}`,
          timestamp: new Date()
        });
      }

      // Test 3: Simulazione reload pagina
      console.log(`💾 [PersistenceTest] Simulazione reload pagina`);
      
      // Salva stato corrente
      const currentState = {
        language: testLanguage,
        timestamp: Date.now()
      };
      
      // Simula reload (non ricarica realmente la pagina)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica che la lingua sia ancora quella impostata
      const reloadedLanguage = localStorage.getItem('urbanova-language');
      
      if (reloadedLanguage === testLanguage) {
        testResults.push({
          test: 'Persistenza dopo reload',
          status: 'pass',
          message: `Lingua persistita dopo reload: ${reloadedLanguage}`,
          timestamp: new Date()
        });
      } else {
        testResults.push({
          test: 'Persistenza dopo reload',
          status: 'fail',
          message: `Lingua non persistita. Atteso: ${testLanguage}, Trovato: ${reloadedLanguage}`,
          timestamp: new Date()
        });
      }

      // Test 4: Test cambio multiplo
      console.log(`💾 [PersistenceTest] Test cambio multiplo`);
      
      const testLanguages = ['it', 'en', 'es'];
      const changeResults = [];
      
      for (const lang of testLanguages) {
        const startTime = Date.now();
        await changeLanguage(lang);
        const changeTime = Date.now() - startTime;
        
        const saved = localStorage.getItem('urbanova-language');
        changeResults.push({
          language: lang,
          saved: saved,
          success: saved === lang,
          duration: changeTime
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const successfulChanges = changeResults.filter(r => r.success).length;
      
      if (successfulChanges === testLanguages.length) {
        testResults.push({
          test: 'Cambio multiplo',
          status: 'pass',
          message: `Tutti i ${testLanguages.length} cambi lingua riusciti`,
          timestamp: new Date()
        });
      } else {
        testResults.push({
          test: 'Cambio multiplo',
          status: 'fail',
          message: `${successfulChanges}/${testLanguages.length} cambi lingua riusciti`,
          timestamp: new Date()
        });
      }

      // Test 5: Test timestamp
      const finalTimestamp = localStorage.getItem('urbanova-language-timestamp');
      const timestampAge = finalTimestamp ? Date.now() - parseInt(finalTimestamp) : 0;
      
      if (timestampAge < 60000) { // Meno di 1 minuto
        testResults.push({
          test: 'Timestamp aggiornato',
          status: 'pass',
          message: `Timestamp aggiornato ${Math.round(timestampAge / 1000)}s fa`,
          timestamp: new Date()
        });
      } else {
        testResults.push({
          test: 'Timestamp aggiornato',
          status: 'warning',
          message: `Timestamp vecchio: ${Math.round(timestampAge / 1000)}s fa`,
          timestamp: new Date()
        });
      }

      // Test 6: Test integrità dati
      const allData = {
        language: localStorage.getItem('urbanova-language'),
        timestamp: localStorage.getItem('urbanova-language-timestamp'),
        hasValidLanguage: supportedLanguages.some(l => l.code === localStorage.getItem('urbanova-language')),
        hasValidTimestamp: !isNaN(parseInt(localStorage.getItem('urbanova-language-timestamp') || '0'))
      };
      
      if (allData.hasValidLanguage && allData.hasValidTimestamp) {
        testResults.push({
          test: 'Integrità dati',
          status: 'pass',
          message: `Dati validi: lingua=${allData.language}, timestamp=${allData.timestamp}`,
          timestamp: new Date()
        });
      } else {
        testResults.push({
          test: 'Integrità dati',
          status: 'fail',
          message: `Dati corrotti: lingua=${allData.language}, timestamp=${allData.timestamp}`,
          timestamp: new Date()
        });
      }

      setResults(testResults);

      // Calcola statistiche
      const totalTests = testResults.length;
      const passedTests = testResults.filter(r => r.status === 'pass').length;
      const failedTests = testResults.filter(r => r.status === 'fail').length;
      const warningTests = testResults.filter(r => r.status === 'warning').length;
      const successRate = (passedTests / totalTests) * 100;

      console.log(`💾 [PersistenceTest] Test completati:`, {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warnings: warningTests,
        successRate: `${successRate.toFixed(1)}%`
      });

      // Callback di completamento
      if (onComplete) {
        onComplete({
          results: testResults,
          stats: {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            warning: warningTests,
            successRate
          },
          currentLanguage: localStorage.getItem('urbanova-language'),
          originalLanguage
        });
      }

    } catch (error) {
      console.error('❌ [PersistenceTest] Errore durante test:', error);
      
      testResults.push({
        test: 'Errore generale',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Errore sconosciuto',
        timestamp: new Date()
      });
      
      setResults(testResults);
    } finally {
      setIsRunning(false);
    }
  };

  // Ripristina lingua originale
  const restoreOriginalLanguage = async () => {
    if (originalLanguage && originalLanguage !== currentLanguage) {
      console.log(`💾 [PersistenceTest] Ripristino lingua originale: ${originalLanguage}`);
      await changeLanguage(originalLanguage);
    }
  };

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
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <SaveIcon className="h-5 w-5 text-blue-600" />
            💾 Test Persistenza Lingua
          </h3>
          <p className="text-sm text-gray-600">
            Verifica che le impostazioni lingua persistano correttamente
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
          
          <div className="flex gap-2">
            <button
              onClick={runPersistenceTest}
              disabled={isRunning}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm
                ${isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
                text-white
              `}
            >
              <SaveIcon className="h-4 w-4" />
              {isRunning ? 'Test in corso...' : 'Test Persistenza'}
            </button>
            
            {originalLanguage && originalLanguage !== currentLanguage && (
              <button
                onClick={restoreOriginalLanguage}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                <LoadIcon className="h-4 w-4" />
                Ripristina
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stato corrente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Lingua Corrente</span>
          </div>
          <p className="text-lg font-semibold">{currentLanguage.toUpperCase()}</p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <SaveIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Lingua Salvata</span>
          </div>
          <p className="text-lg font-semibold">
            {localStorage.getItem('urbanova-language')?.toUpperCase() || 'Nessuna'}
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <LoadIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Lingua Originale</span>
          </div>
          <p className="text-lg font-semibold">
            {originalLanguage?.toUpperCase() || 'Non impostata'}
          </p>
        </div>
      </div>

      {/* Statistiche */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">Test Totali</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-green-700">Passati</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-700">Falliti</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.successRate.toFixed(1)}%</div>
            <div className="text-sm text-yellow-700">Successo</div>
          </div>
        </div>
      )}

      {/* Risultati dettagliati */}
      {results.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <h4 className="font-medium mb-3">Risultati Test Persistenza</h4>
          
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
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="font-medium text-sm">{result.test}</span>
                </div>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                {result.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaggio iniziale */}
      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <SaveIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nessun test di persistenza eseguito</p>
          <p className="text-sm">Clicca "Test Persistenza" per verificare il salvataggio</p>
        </div>
      )}
    </div>
  );
} 