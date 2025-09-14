'use client';

import React, { Component, ReactNode } from 'react';
import { withAuthProtection } from '@/lib/authProtection';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AuthProtectedWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 [AuthProtectedWrapper] Errore auth intercettato:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 [AuthProtectedWrapper] Dettagli errore auth:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Se è un errore di destructuring auth, prova a recuperare
    if (error.message.includes('Cannot destructure property') && 
        error.message.includes('auth')) {
      console.warn('🛡️ [AuthProtectedWrapper] Errore auth destructuring rilevato, tentativo di recupero...');
      this.handleAuthError();
    }
  }

  private handleAuthError() {
    try {
      // Prova a forzare un re-render del componente
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
    } catch (error) {
      console.error('❌ [AuthProtectedWrapper] Errore nel recupero:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI per errori auth
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Problema temporaneo di autenticazione
              </p>
              <p className="text-xs text-yellow-600">
                Il componente si sta ripristinando automaticamente...
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthProtectedWrapper;
