'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupportedLanguages } from '@/lib/languageConfig';
import { SupportedLanguage } from '@/types/language';
import { 
  CheckIcon, 
  XIcon, 
  PlayIcon,
  StopIcon,
  ClockIcon,
  ZapIcon,
  EyeIcon
} from '@/components/icons';

interface SmoothnessTestProps {
  onComplete?: (results: any) => void;
}

interface SmoothnessResult {
  language: SupportedLanguage;
  duration: number;
  smoothness: 'excellent' | 'good' | 'acceptable' | 'poor';
  visualGlitches: number;
  performanceScore: number;
  timestamp: Date;
}

export default function SmoothnessTest({ onComplete }: SmoothnessTestProps) {
  const { changeLanguage } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SmoothnessResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isObserving, setIsObserving] = useState(false);
  const [visualGlitches, setVisualGlitches] = useState(0);
  
  const observerRef = useRef<MutationObserver | null>(null);
  const supportedLanguages = getSupportedLanguages();

  // Osserva cambiamenti DOM per rilevare glitch visivi
  const startVisualObservation = () => {
    setIsObserving(true);
    setVisualGlitches(0);
    
    observerRef.current = new MutationObserver((mutations) => {
      let glitchCount = 0;
      
      mutations.forEach((mutation) => {
        // Conta cambiamenti rapidi che potrebbero essere glitch
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          glitchCount++;
        }
        
        // Conta cambiamenti di attributi rapidi
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          glitchCount++;
        }
      });
      
      if (glitchCount > 0) {
        setVisualGlitches(prev => prev + glitchCount);
      }
    });
    
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  };

  const stopVisualObservation = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setIsObserving(false);
  };

  // Calcola score di performance
  const calculatePerformanceScore = (duration: number, glitches: number): number => {
    // Score basato su durata (più veloce = migliore)
    const durationScore = Math.max(0, 100 - (duration / 10));
    
    // Penalità per glitch visivi
    const glitchPenalty = glitches * 5;
    
    return Math.max(0, Math.min(100, durationScore - glitchPenalty));
  };

  // Determina livello di smoothness
  const getSmoothnessLevel = (score: number): 'excellent' | 'good' | 'acceptable' | 'poor' => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'acceptable';
    return 'poor';
  };

  // Test smoothness per una lingua
  const testLanguageSmoothness = async (language: SupportedLanguage): Promise<SmoothnessResult> => {
    setCurrentTest(`Testando smoothness: ${language}`);
    
    // Inizia osservazione visiva
    startVisualObservation();
    
    // Attendi un momento per stabilizzare
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reset contatore glitch
    setVisualGlitches(0);
    
    // Misura tempo di cambio lingua
    const startTime = performance.now();
    
    try {
      await changeLanguage(language);
      
      // Attendi per completare il rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Ferma osservazione
      stopVisualObservation();
      
      // Calcola metriche
      const finalGlitches = visualGlitches;
      const performanceScore = calculatePerformanceScore(duration, finalGlitches);
      const smoothness = getSmoothnessLevel(performanceScore);
      
      const result: SmoothnessResult = {
        language,
        duration,
        smoothness,
        visualGlitches: finalGlitches,
        performanceScore,
        timestamp: new Date()
      };
      
      console.log(`🎯 [SmoothnessTest] ${language}: ${duration.toFixed(1)}ms, ${finalGlitches} glitch, score: ${performanceScore.toFixed(1)}`);
      
      return result;
      
    } catch (error) {
      stopVisualObservation();
      throw error;
    }
  };

  // Esegui test smoothness completo
  const runSmoothnessTest = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    
    console.log(`🎯 [SmoothnessTest] Avvio test smoothness`);
    
    const smoothnessResults: SmoothnessResult[] = [];
    
    try {
      for (let i = 0; i < supportedLanguages.length; i++) {
        const language = supportedLanguages[i];
        setProgress((i / supportedLanguages.length) * 100);
        
        try {
          const result = await testLanguageSmoothness(language.code);
          smoothnessResults.push(result);
          setResults([...smoothnessResults]);
          
          // Pausa tra i test
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          console.error(`❌ [SmoothnessTest] Errore test ${language.code}:`, error);
          
          // Aggiungi risultato di errore
          const errorResult: SmoothnessResult = {
            language: language.code,
            duration: 0,
            smoothness: 'poor',
            visualGlitches: 0,
            performanceScore: 0,
            timestamp: new Date()
          };
          
          smoothnessResults.push(errorResult);
          setResults([...smoothnessResults]);
        }
      }
      
      setProgress(100);
      
      // Calcola statistiche
      const totalTests = smoothnessResults.length;
      const successfulTests = smoothnessResults.filter(r => r.performanceScore > 0).length;
      const averageDuration = smoothnessResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;
      const averageScore = smoothnessResults.reduce((sum, r) => sum + r.performanceScore, 0) / totalTests;
      const totalGlitches = smoothnessResults.reduce((sum, r) => sum + r.visualGlitches, 0);
      
      const stats = {
        totalTests,
        successfulTests,
        averageDuration,
        averageScore,
        totalGlitches,
        smoothnessDistribution: {
          excellent: smoothnessResults.filter(r => r.smoothness === 'excellent').length,
          good: smoothnessResults.filter(r => r.smoothness === 'good').length,
          acceptable: smoothnessResults.filter(r => r.smoothness === 'acceptable').length,
          poor: smoothnessResults.filter(r => r.smoothness === 'poor').length
        }
      };
      
      console.log(`🎯 [SmoothnessTest] Test completati:`, stats);
      
      // Callback di completamento
      if (onComplete) {
        onComplete({
          results: smoothnessResults,
          stats
        });
      }
      
    } catch (error) {
      console.error('❌ [SmoothnessTest] Errore generale:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      stopVisualObservation();
    }
  };

  // Test rapido per una lingua specifica
  const testSingleLanguageSmoothness = async (language: SupportedLanguage) => {
    try {
      const result = await testLanguageSmoothness(language);
      setResults([result]);
      return result;
    } catch (error) {
      console.error(`❌ [SmoothnessTest] Errore test singolo ${language}:`, error);
      throw error;
    }
  };

  // Calcola statistiche
  const stats = {
    total: results.length,
    excellent: results.filter(r => r.smoothness === 'excellent').length,
    good: results.filter(r => r.smoothness === 'good').length,
    acceptable: results.filter(r => r.smoothness === 'acceptable').length,
    poor: results.filter(r => r.smoothness === 'poor').length,
    averageDuration: results.length > 0 ? results.reduce((sum, r) => sum + r.duration, 0) / results.length : 0,
    averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.performanceScore, 0) / results.length : 0,
    totalGlitches: results.reduce((sum, r) => sum + r.visualGlitches, 0)
  };

  // Cleanup observer
  useEffect(() => {
    return () => {
      stopVisualObservation();
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <EyeIcon className="h-5 w-5 text-purple-600" />
            🎯 Test Smoothness Cambio Lingua
          </h3>
          <p className="text-sm text-gray-600">
            Verifica la fluidità e performance del cambio lingua
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {stats.total > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">
                {stats.averageScore.toFixed(1)}/100 score medio
              </div>
              <div className="text-xs text-gray-500">
                {stats.averageDuration.toFixed(1)}ms media
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={runSmoothnessTest}
              disabled={isRunning}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm
                ${isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
                }
                text-white
              `}
            >
              <PlayIcon className="h-4 w-4" />
              {isRunning ? 'Test in corso...' : 'Test Smoothness'}
            </button>
            
            {isObserving && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                <EyeIcon className="h-3 w-3" />
                Osservando
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Test</span>
            <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {currentTest && (
            <p className="text-sm text-gray-600 mt-2">
              {currentTest}
            </p>
          )}
        </div>
      )}

      {/* Statistiche */}
      {stats.total > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.averageScore.toFixed(1)}</div>
            <div className="text-sm text-purple-700">Score Medio</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.averageDuration.toFixed(1)}ms</div>
            <div className="text-sm text-blue-700">Durata Media</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.excellent + stats.good}</div>
            <div className="text-sm text-green-700">Fluidi</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.totalGlitches}</div>
            <div className="text-sm text-red-700">Glitch Totali</div>
          </div>
        </div>
      )}

      {/* Distribuzione smoothness */}
      {stats.total > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Distribuzione Smoothness</h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{stats.excellent}</div>
              <div className="text-xs text-green-700">Eccellente</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{stats.good}</div>
              <div className="text-xs text-blue-700">Buono</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">{stats.acceptable}</div>
              <div className="text-xs text-yellow-700">Accettabile</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{stats.poor}</div>
              <div className="text-xs text-red-700">Scarso</div>
            </div>
          </div>
        </div>
      )}

      {/* Risultati dettagliati */}
      {results.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <h4 className="font-medium mb-3">Risultati Dettagliati</h4>
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg border-l-4 flex items-center justify-between
                ${result.smoothness === 'excellent' ? 'border-green-500 bg-green-50' :
                  result.smoothness === 'good' ? 'border-blue-500 bg-blue-50' :
                  result.smoothness === 'acceptable' ? 'border-yellow-500 bg-yellow-50' :
                  'border-red-500 bg-red-50'
                }
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{result.language.toUpperCase()}</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${result.smoothness === 'excellent' ? 'bg-green-100 text-green-800' :
                      result.smoothness === 'good' ? 'bg-blue-100 text-blue-800' :
                      result.smoothness === 'acceptable' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  `}>
                    {result.smoothness.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {result.duration.toFixed(1)}ms • {result.visualGlitches} glitch • Score: {result.performanceScore.toFixed(1)}
                </p>
              </div>
              <div className="text-xs text-gray-500 ml-4">
                {result.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test rapido per lingue specifiche */}
      <div className="mt-6">
        <h4 className="font-medium mb-3">Test Rapido</h4>
        <div className="flex flex-wrap gap-2">
          {supportedLanguages.slice(0, 3).map((lang) => (
            <button
              key={lang.code}
              onClick={() => testSingleLanguageSmoothness(lang.code)}
              disabled={isRunning}
              className={`
                px-3 py-1 rounded-md text-sm transition-colors
                ${isRunning 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Messaggio iniziale */}
      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <EyeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nessun test smoothness eseguito</p>
          <p className="text-sm">Clicca "Test Smoothness" per verificare la fluidità</p>
        </div>
      )}
    </div>
  );
} 