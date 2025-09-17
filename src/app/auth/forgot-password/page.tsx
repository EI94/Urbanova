'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../../contexts/UltraSafeAuthContext';

export default function ForgotPasswordPage() {
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [ForgotPasswordPage] Errore useAuth:', error);
    authContext = { resetPassword: null };
  }
  const resetPassword = authContext?.resetPassword;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Inserisci un indirizzo email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Invia email di reset password con Firebase
      await resetPassword(email);

      // Mostra messaggio di successo
      setSuccess(true);
      toast('Email di recupero inviata! Controlla la tua casella di posta', { icon: '✅' });
    } catch (error: any) {
      // Gestisci gli errori di Firebase
      let errorMessage = "Si è verificato un errore durante l'invio dell'email di recupero";

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Non è stato trovato alcun account con questo indirizzo email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "L'indirizzo email non è valido";
      }

      setError(errorMessage);
      toast(errorMessage, { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">Urbanova</h1>
          <h2 className="mt-2 text-center text-gray-600">Recupera la tua password</h2>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <p className="text-sm text-green-600">
                Abbiamo inviato un'email con le istruzioni per il recupero della password. Controlla
                la tua casella di posta.
              </p>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Torna alla pagina di accesso
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Inserisci l'indirizzo email associato al tuo account per ricevere un link di
                recupero password.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Invio in corso...' : 'Invia link di recupero'}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                href="/auth/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Torna alla pagina di accesso
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
