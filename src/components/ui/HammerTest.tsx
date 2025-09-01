'use client';

import React, { useState, useEffect } from 'react';

import {
  PlayIcon,
  StopIcon,
  RefreshIcon,
  DownloadIcon,
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  ZapIcon,
} from '@/components/icons';
import { useLanguageTest } from '@/hooks/useLanguageTest';

interface HammerTestProps {
  iterations?: number;
  delayBetweenTests?: number;
  autoStart?: boolean;
  onComplete?: (results: any) => void;
}

export default function HammerTest({
  iterations = 10,
  delayBetweenTests = 1000,
  autoStart = false,
  onComplete,
}: HammerTestProps) {
  const {
    isRunning,
    results,
    currentTest,
    progress,
    stats,
    runAllTests,
    testSingleLanguage,
    resetResults,
    exportResults,
    supportedLanguages,
  } = useLanguageTest();

  const [hammerResults, setHammerResults] = useState<
    Array<{
      iteration: number;
      timestamp: Date;
      results: any;
      success: boolean;
      duration: number;
    }>
  >([]);

  const [isHammerRunning, setIsHammerRunning] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [hammerProgress, setHammerProgress] = useState(0);

  // Hammer test - esegue test multipli in sequenza
  const runHammerTest = async () => {
    setIsHammerRunning(true);
    setHammerResults([]);
    setCurrentIteration(0);
    setHammerProgress(0);

    console.log(`🔨 [HammerTest] Avvio hammer test con ${iterations} iterazioni`);

    const hammerTestResults = [];

    try {
      for (let i = 0; i < iterations; i++) {
        setCurrentIteration(i + 1);
        setHammerProgress((i / iterations) * 100);

        console.log(`🔨 [HammerTest] Iterazione ${i + 1}/${iterations}`);

        const iterationStart = Date.now();

        // Esegui test per tutte le lingue
        const iterationResults = [];

        for (const language of supportedLanguages) {
          try {
            const languageResults = await testSingleLanguage(language.code);
            iterationResults.push({
              language: language.code,
              results: languageResults,
              success: languageResults.every(r => r.status === 'pass'),
            });
          } catch (error) {
            iterationResults.push({
              language: language.code,
              results: [],
              success: false,
              error: error instanceof Error ? error.message : 'Errore sconosciuto',
            });
          }
        }

        const iterationDuration = Date.now() - iterationStart;

        const iterationResult = {
          iteration: i + 1,
          timestamp: new Date(),
          results: iterationResults,
          success: iterationResults.every(r => r.success),
          duration: iterationDuration,
        };

        hammerTestResults.push(iterationResult);
        setHammerResults([...hammerTestResults]);

        console.log(`🔨 [HammerTest] Iterazione ${i + 1} completata in ${iterationDuration}ms`);

        // Pausa tra le iterazioni
        if (i < iterations - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenTests));
        }
      }

      setHammerProgress(100);

      // Calcola statistiche hammer test
      const totalIterations = hammerTestResults.length;
      const successfulIterations = hammerTestResults.filter(r => r.success).length;
      const totalDuration = hammerTestResults.reduce((sum, r) => sum + r.duration, 0);
      const averageDuration = totalDuration / totalIterations;
      const successRate = (successfulIterations / totalIterations) * 100;

      const hammerStats = {
        totalIterations,
        successfulIterations,
        failedIterations: totalIterations - successfulIterations,
        successRate,
        totalDuration,
        averageDuration,
        averageDurationPerLanguage: averageDuration / supportedLanguages.length,
      };

      console.log(`🔨 [HammerTest] Hammer test completato:`, hammerStats);

      // Callback di completamento
      if (onComplete) {
        onComplete({
          hammerResults,
          hammerStats,
          individualResults: results,
        });
      }
    } catch (error) {
      console.error('❌ [HammerTest] Errore durante hammer test:', error);
    } finally {
      setIsHammerRunning(false);
      setCurrentIteration(0);
    }
  };

  // Test di stress - cambio lingua rapido
  const runStressTest = async () => {
    setIsHammerRunning(true);
    setHammerResults([]);
    setCurrentIteration(0);
    setHammerProgress(0);

    console.log(`⚡ [HammerTest] Avvio stress test`);

    const stressResults = [];
    const stressIterations = iterations * 2; // Più iterazioni per stress test

    try {
      for (let i = 0; i < stressIterations; i++) {
        setCurrentIteration(i + 1);
        setHammerProgress((i / stressIterations) * 100);

        const iterationStart = Date.now();

        // Cambia lingua rapidamente
        const randomLanguage =
          supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)];

        try {
          const languageResults = await testSingleLanguage(randomLanguage.code);

          const iterationResult = {
            iteration: i + 1,
            timestamp: new Date(),
            language: randomLanguage.code,
            results: languageResults,
            success: languageResults.every(r => r.status === 'pass'),
            duration: Date.now() - iterationStart,
          };

          stressResults.push(iterationResult);
          setHammerResults([...stressResults]);
        } catch (error) {
          stressResults.push({
            iteration: i + 1,
            timestamp: new Date(),
            language: randomLanguage.code,
            results: [],
            success: false,
            duration: Date.now() - iterationStart,
            error: error instanceof Error ? error.message : 'Errore sconosciuto',
          });
        }

        // Pausa minima per stress test
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setHammerProgress(100);
      console.log(`⚡ [HammerTest] Stress test completato`);
    } catch (error) {
      console.error('❌ [HammerTest] Errore durante stress test:', error);
    } finally {
      setIsHammerRunning(false);
      setCurrentIteration(0);
    }
  };

  // Auto-start se richiesto
  useEffect(() => {
    if (autoStart && !isHammerRunning) {
      runHammerTest();
    }
  }, [autoStart]);

  // Calcola statistiche hammer test
  const hammerStats = {
    totalIterations: hammerResults.length,
    successfulIterations: hammerResults.filter(r => r.success).length,
    failedIterations: hammerResults.filter(r => !r.success).length,
    successRate:
      hammerResults.length > 0
        ? (hammerResults.filter(r => r.success).length / hammerResults.length) * 100
        : 0,
    averageDuration:
      hammerResults.length > 0
        ? hammerResults.reduce((sum, r) => sum + r.duration, 0) / hammerResults.length
        : 0,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ZapIcon className="h-5 w-5 text-yellow-600" />
            🔨 Hammer Test Multilingua
          </h3>
          <p className="text-sm text-gray-600">
            Test di stress e affidabilità del sistema multilingua
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hammerStats.totalIterations > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">
                {hammerStats.successfulIterations}/{hammerStats.totalIterations} iterazioni riuscite
              </div>
              <div className="text-xs text-gray-500">
                {hammerStats.successRate.toFixed(1)}% successo
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={runHammerTest}
              disabled={isHammerRunning}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm
                ${
                  isHammerRunning
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
                text-white
              `}
            >
              <PlayIcon className="h-4 w-4" />
              Hammer Test
            </button>

            <button
              onClick={runStressTest}
              disabled={isHammerRunning}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm
                ${
                  isHammerRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }
                text-white
              `}
            >
              <ZapIcon className="h-4 w-4" />
              Stress Test
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {isHammerRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Hammer Test Progresso</span>
            <span className="text-sm text-gray-500">
              {currentIteration}/{iterations} ({hammerProgress.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${hammerProgress}%` }}
            ></div>
          </div>
          {currentTest && <p className="text-sm text-gray-600 mt-2">Testando: {currentTest}</p>}
        </div>
      )}

      {/* Statistiche Hammer Test */}
      {hammerStats.totalIterations > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{hammerStats.totalIterations}</div>
            <div className="text-sm text-blue-700">Iterazioni</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {hammerStats.successfulIterations}
            </div>
            <div className="text-sm text-green-700">Riuscite</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{hammerStats.failedIterations}</div>
            <div className="text-sm text-red-700">Fallite</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {hammerStats.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-yellow-700">Successo</div>
          </div>
        </div>
      )}

      {/* Risultati Hammer Test */}
      {hammerResults.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Risultati Hammer Test</h4>
            <div className="flex gap-2">
              <button
                onClick={resetResults}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Reset
              </button>
              <button
                onClick={exportResults}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 rounded"
              >
                <DownloadIcon className="h-3 w-3" />
                Esporta
              </button>
            </div>
          </div>

          {hammerResults.map((result, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border-l-4 flex items-center justify-between
                ${result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {result.success ? (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <XIcon className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-medium text-sm">Iterazione {result.iteration}</span>
                  {result.language && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{result.language}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {result.timestamp.toLocaleTimeString()} - {result.duration}ms
                </p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                {result.success ? 'SUCCESS' : 'FAILED'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaggio iniziale */}
      {hammerResults.length === 0 && !isHammerRunning && (
        <div className="text-center py-8 text-gray-500">
          <ZapIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nessun hammer test eseguito</p>
          <p className="text-sm">Clicca "Hammer Test" per iniziare i test di stress</p>
        </div>
      )}
    </div>
  );
}
