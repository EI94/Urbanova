'use client';

/**
 * 🌐 PUBLIC OFFER PAGE
 * 
 * Pagina pubblica per inserimento offerte fornitori (token-based)
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OfferEntry } from '@/modules/budgetSuppliers/components/OfferEntry';
import { OfferService, TokenValidation } from '@/modules/budgetSuppliers/api/offer';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';

export default function PublicOfferPage() {
  const params = useParams();
  const [tokenValidation, setTokenValidation] = useState<TokenValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rfpId = params?.rfpId as string;
  const token = params?.token as string;

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 [PUBLIC] Validazione token:', token);
      
      const validation = await OfferService.validateToken(token);
      setTokenValidation(validation);
      
      if (!validation.isValid) {
        setError(validation.error || 'Token non valido');
      }
      
    } catch (error: any) {
      console.error('❌ [PUBLIC] Errore validazione token:', error);
      setError('Errore di validazione del token');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferSubmitted = (offer: any) => {
    console.log('✅ [PUBLIC] Offerta inviata:', offer);
    // Qui potresti mostrare un messaggio di successo o reindirizzare
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifica Token...</h2>
          <p className="text-gray-600">Validazione del link in corso</p>
        </div>
      </div>
    );
  }

  if (error || !tokenValidation?.isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Accesso Negato</h2>
          </div>
          
          <div className="space-y-3 text-gray-700">
            <p>{error || 'Token non valido o scaduto'}</p>
            
            {tokenValidation?.isExpired && (
              <div className="flex items-center space-x-2 text-red-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Il link è scaduto</span>
              </div>
            )}
            
            {tokenValidation?.error === 'Token già utilizzato' && (
              <div className="flex items-center space-x-2 text-orange-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Offerta già inviata</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Per assistenza contatta il team Urbanova</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Security Header */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Portale Fornitore Sicuro
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Connessione protetta • Token: {token.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <OfferEntry 
        token={token} 
        onOfferSubmitted={handleOfferSubmitted}
      />
      
      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Powered by <span className="font-semibold text-blue-600">Urbanova</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              © 2024 Urbanova. Tutti i diritti riservati.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
