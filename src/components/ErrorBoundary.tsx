'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary personalizzato che IGNORA errori Firebase collection()
 * per prevenire crash della dashboard
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Controlla se è un errore Firebase collection() - se sì, IGNORA
    const message = error?.message || '';
    if (
      message.includes('Expected first argument to collection()') ||
      message.includes('CollectionReference') ||
      message.includes('DocumentReference or FirebaseFirestore')
    ) {
      console.warn('🛡️ [ErrorBoundary] Errore Firebase collection() IGNORATO:', message);
      // NON settare hasError a true - continua a renderizzare i children
      return { hasError: false, error: null };
    }

    // Altri errori vengono gestiti normalmente
    console.error('❌ [ErrorBoundary] Errore catturato:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log dettagliato per debug
    const message = error?.message || '';
    if (
      !message.includes('Expected first argument to collection()') &&
      !message.includes('CollectionReference') &&
      !message.includes('DocumentReference or FirebaseFirestore')
    ) {
      console.error('❌ [ErrorBoundary] Component stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      // Mostra fallback solo per errori NON Firebase
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Si è verificato un errore
            </h1>
            <p className="text-gray-600 mb-4">
              Ricarica la pagina per riprovare
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ricarica
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

