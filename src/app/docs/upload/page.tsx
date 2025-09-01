'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { jwtService } from '@urbanova/agents/src/docHunter/jwt';

interface UploadPageProps {}

export default function UploadPage({}: UploadPageProps) {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    }
  }, [searchParams]);

  const validateToken = (tokenToValidate: string) => {
    try {
      const verification = jwtService.verifyUploadToken(tokenToValidate);
      setTokenValid(verification.isValid);

      if (verification.isValid && verification.payload) {
        setTokenInfo(verification.payload);
        setError('');
      } else {
        setError(verification.error || 'Token non valido');
      }
    } catch (err) {
      setTokenValid(false);
      setError('Errore nella validazione del token');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!tokenValid || !tokenInfo) {
      setError('Token non valido');
      return;
    }

    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setError('Solo file PDF e immagini sono supportati');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File troppo grande. Dimensione massima: 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // TODO: Implement actual file upload to GCS
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      setUploadSuccess(true);

      // TODO: Update document status in Firestore
      // TODO: Trigger OCR processing
    } catch (err) {
      setError("Errore durante l'upload del file");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link di Upload Non Valido</h1>
          <p className="text-gray-600">Questo link non contiene un token valido per l'upload.</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Token Scaduto o Non Valido</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Il link di upload è scaduto o non è più valido.'}
          </p>
          <p className="text-sm text-gray-500">Contattare il mittente per un nuovo link.</p>
        </div>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            Upload Completato con Successo!
          </h1>
          <p className="text-gray-600 mb-4">
            Il documento è stato caricato e sarà processato a breve.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
            <p>
              <strong>Progetto:</strong> {tokenInfo?.projectId}
            </p>
            <p>
              <strong>Tipo Documento:</strong> {tokenInfo?.kind}
            </p>
            <p>
              <strong>Scade il:</strong>{' '}
              {tokenInfo?.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleString('it-IT') : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Carica Documento</h1>
          <p className="text-gray-600">
            Utilizza il link sicuro per caricare il documento richiesto
          </p>
        </div>

        {/* Token Info */}
        {tokenInfo && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Informazioni Upload</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Progetto:</strong> {tokenInfo.projectId}
              </p>
              <p>
                <strong>Tipo:</strong> {tokenInfo.kind}
              </p>
              <p>
                <strong>Scade:</strong> {new Date(tokenInfo.expiresAt).toLocaleString('it-IT')}
              </p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-blue-600 font-medium">Caricamento in corso...</p>
                <p className="text-sm text-gray-500">Non chiudere questa pagina</p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-900">Trascina il file qui</p>
                  <p className="text-sm text-gray-500">oppure clicca per selezionare</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Seleziona File
                </label>
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="mt-6 text-sm text-gray-600">
            <h4 className="font-medium text-gray-900 mb-2">Requisiti File:</h4>
            <ul className="space-y-1">
              <li>• Formati supportati: PDF, JPG, JPEG, PNG</li>
              <li>• Dimensione massima: 10MB</li>
              <li>• Il file sarà processato automaticamente</li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Questo link è sicuro e scadrà automaticamente.</p>
          <p>Non condividere questo link con altri.</p>
        </div>
      </div>
    </div>
  );
}
