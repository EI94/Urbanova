'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import AuthLayout from '@/components/AuthLayout';
import { MailIcon, LockIcon } from '@/components/icons';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const authContext = useAuth();
  const login = authContext?.login;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Inserisci email e password');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast('Accesso effettuato con successo!', { icon: '✅' });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Errore durante l\'accesso';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Utente non trovato';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password errata';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email non valida';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Troppi tentativi di accesso. Riprova più tardi';
      }

      setError(errorMessage);
      toast(errorMessage, { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Accedi a Urbanova"
      subtitle="Inserisci le tue credenziali per accedere alla piattaforma"
    >
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormInput
            label="Indirizzo Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="mario.rossi@azienda.it"
            icon={<MailIcon className="h-5 w-5 text-neutral-400" />}
            {...({} as any)}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<LockIcon className="h-5 w-5 text-neutral-400" />}
            {...({} as any)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Ricordami
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Password dimenticata?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Non hai un account?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Richiedi accesso
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
