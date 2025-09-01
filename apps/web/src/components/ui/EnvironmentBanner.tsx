'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Banner per mostrare le variabili d'ambiente opzionali mancanti
 * 
 * Questo componente:
 * - Si mostra solo in sviluppo/test
 * - Mostra un banner giallo per le variabili opzionali mancanti
 * - Non si mostra in produzione
 * - È dismissible dall'utente
 */
export function EnvironmentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Controlla se siamo in sviluppo
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Simula il controllo delle variabili opzionali mancanti
    // In un'implementazione reale, questo verrebbe dal package infra
    const checkMissingEnv = async () => {
      try {
        // TODO: Importa da @urbanova/infra quando disponibile
        // import { getMissingOptionalEnv } from '@urbanova/infra';
        
        // Per ora, simula il controllo
        const mockMissingVars = [
          'STRIPE_SECRET_KEY',
          'SENDGRID_API_KEY',
          'GMAIL_CLIENT_ID',
        ].filter(() => Math.random() > 0.5); // Simula alcune variabili mancanti
        
        if (mockMissingVars.length > 0) {
          setMissingVars(mockMissingVars);
          setIsVisible(true);
        }
      } catch (error) {
        console.warn('Errore nel controllo variabili d\'ambiente:', error);
      }
    };

    checkMissingEnv();
  }, []);

  // Non mostrare nulla se:
  // - Siamo in produzione
  // - Non ci sono variabili mancanti
  // - L'utente ha chiuso il banner
  if (!isVisible || missingVars.length === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Variabili d'ambiente opzionali mancanti
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Le seguenti variabili sono opzionali ma potrebbero essere necessarie per alcune funzionalità:
              </p>
              <div className="mt-2">
                <code className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {missingVars.join(', ')}
                </code>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href="/docs/environment-setup"
              className="text-xs text-yellow-700 hover:text-yellow-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentazione
            </a>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-yellow-600 hover:text-yellow-800 transition-colors"
              aria-label="Chiudi banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook per controllare le variabili d'ambiente mancanti
 * 
 * Questo hook può essere usato in altri componenti per:
 * - Controllare se ci sono variabili mancanti
 * - Mostrare warning specifici
 * - Abilitare/disabilitare funzionalità
 */
export function useEnvironmentCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnv = async () => {
      try {
        // TODO: Importa da @urbanova/infra quando disponibile
        // import { getMissingOptionalEnv } from '@urbanova/infra';
        
        // Simula il controllo
        const mockMissingVars = [
          'STRIPE_SECRET_KEY',
          'SENDGRID_API_KEY',
          'GMAIL_CLIENT_ID',
        ].filter(() => Math.random() > 0.3);
        
        setMissingVars(mockMissingVars);
      } catch (error) {
        console.warn('Errore nel controllo ambiente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnv();
  }, []);

  return {
    missingVars,
    isLoading,
    hasMissingVars: missingVars.length > 0,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  };
}
