'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { salService } from '@/lib/salService';
import { SAL, SALSignRequest } from '@urbanova/types';

export default function SALSignPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [sal, setSal] = useState<SAL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signatureData, setSignatureData] = useState({
    signerName: '',
    signerRole: 'VENDOR' as 'PM' | 'VENDOR',
  });

  useEffect(() => {
    if (token) {
      // Decodifica token per ottenere salId e role
      try {
        const decoded = Buffer.from(token, 'base64').toString();
        const [salId, role] = decoded.split(':');

        if (salId && role) {
          loadSAL(salId);
          setSignatureData(prev => ({ ...prev, signerRole: role as 'PM' | 'VENDOR' }));
        } else {
          setError('Token non valido');
          setLoading(false);
        }
      } catch (error) {
        setError('Token non valido');
        setLoading(false);
      }
    } else {
      setError('Token mancante');
      setLoading(false);
    }
  }, [token]);

  const loadSAL = async (salId: string) => {
    try {
      const salData = await salService.getSAL(salId);
      if (salData) {
        setSal(salData);
      } else {
        setError('SAL non trovato');
      }
    } catch (error) {
      setError('Errore nel caricamento del SAL');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!sal || !signatureData.signerName.trim()) {
      setError('Inserisci il nome del firmatario');
      return;
    }

    setSigning(true);
    setError(null);

    try {
      // Genera hash della firma (in produzione, usare libreria crittografica)
      const signatureHash = Buffer.from(
        `${sal.id}:${signatureData.signerName}:${Date.now()}`
      ).toString('base64');

      const signRequest: SALSignRequest = {
        salId: sal.id,
        signerId: `signer-${Date.now()}`,
        signerName: signatureData.signerName,
        signerRole: signatureData.signerRole,
        signatureHash,
      };

      const result = await salService.sign(signRequest);

      if (result.success) {
        // Ricarica SAL per mostrare lo stato aggiornato
        await loadSAL(sal.id);
        alert('SAL firmato con successo!');
      } else {
        setError(result.message || 'Errore durante la firma');
      }
    } catch (error) {
      setError('Errore durante la firma');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento SAL...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Errore</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Torna indietro
          </button>
        </div>
      </div>
    );
  }

  if (!sal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">SAL non trovato</h1>
          <p className="text-gray-600 mb-6">Il SAL richiesto non esiste o è stato rimosso.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Torna indietro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Firma SAL</h1>
          <p className="text-gray-600">Subcontractor Agreement Letter</p>
        </div>

        {/* SAL Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{sal.title}</h2>
              <p className="text-gray-600 mb-4">{sal.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Progetto:</span>
                  <span className="font-medium">{sal.projectId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium">{sal.vendorName || 'Non specificato'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Importo:</span>
                  <span className="font-medium text-green-600">
                    €{sal.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stato:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      sal.status === 'DRAFT'
                        ? 'bg-gray-100 text-gray-800'
                        : sal.status === 'SENT'
                          ? 'bg-blue-100 text-blue-800'
                          : sal.status === 'SIGNED_VENDOR'
                            ? 'bg-yellow-100 text-yellow-800'
                            : sal.status === 'SIGNED_PM'
                              ? 'bg-orange-100 text-orange-800'
                              : sal.status === 'READY_TO_PAY'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {sal.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Linee del SAL</h3>
              <div className="space-y-2">
                {sal.lines.map((line, index) => (
                  <div key={line.id} className="border-l-4 border-blue-500 pl-3">
                    <div className="font-medium">{line.description}</div>
                    <div className="text-sm text-gray-600">
                      {line.quantity} {line.unit} × €{line.unitPrice} = €{line.totalPrice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Signature Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Firma Digitale</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome del Firmatario
              </label>
              <input
                type="text"
                value={signatureData.signerName}
                onChange={e => setSignatureData(prev => ({ ...prev, signerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inserisci il tuo nome completo"
                disabled={signing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ruolo</label>
              <select
                value={signatureData.signerRole}
                onChange={e =>
                  setSignatureData(prev => ({
                    ...prev,
                    signerRole: e.target.value as 'PM' | 'VENDOR',
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={signing}
              >
                <option value="VENDOR">Vendor</option>
                <option value="PM">Project Manager</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="text-blue-600 text-xl mr-3">ℹ️</div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Informazioni sulla Firma</p>
                  <p>
                    La tua firma digitale sarà registrata con timestamp e hash crittografico per
                    garantire l'autenticità del documento.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSign}
              disabled={signing || !signatureData.signerName.trim()}
              className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                signing || !signatureData.signerName.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {signing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Firma in corso...
                </div>
              ) : (
                'Firma SAL'
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso SAL</h3>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Passo {sal.currentStep} di {sal.totalSteps}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((sal.currentStep / sal.totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(sal.currentStep / sal.totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>DRAFT</span>
              <span>SENT</span>
              <span>VENDOR</span>
              <span>PM</span>
              <span>READY</span>
              <span>PAID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
