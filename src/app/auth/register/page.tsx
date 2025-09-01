'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import AuthLayout from '@/components/AuthLayout';
import { EmailIcon, LockIcon, UserIcon } from '@/components/icons';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import FormInput from '@/components/ui/FormInput';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    password: '',
    passwordConfirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione
    if (formData.password !== formData.passwordConfirm) {
      setError('Le password non coincidono');
      return;
    }

    if (formData.password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Registrazione con Firebase
      const displayName = `${formData.firstName} ${formData.lastName}`;
      await signup(
        formData.email,
        formData.password,
        displayName,
        formData.firstName,
        formData.lastName
      );

      // Mostra messaggio di successo
      toast(
        "Richiesta di accesso inviata con successo! Verrai contattato a breve per l'attivazione del tuo account.",
        { icon: '✅' }
      );

      // Reindirizza alla login
      router.push('/auth/login');
    } catch (error: any) {
      // Gestisci gli errori di Firebase
      let errorMessage = 'Si è verificato un errore durante la registrazione';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Questo indirizzo email è già in uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "L'indirizzo email non è valido";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La password è troppo debole';
      }

      setError(errorMessage);
      toast(errorMessage, { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Richiedi accesso"
      subtitle="Compila il modulo per richiedere l'accesso alla piattaforma"
    >
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Nome"
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Mario"
              icon={<UserIcon className="h-5 w-5 text-neutral-400" />}
            />

            <FormInput
              label="Cognome"
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Rossi"
            />
          </div>

          <FormInput
            label="Indirizzo Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="mario.rossi@azienda.it"
            icon={<EmailIcon className="h-5 w-5 text-neutral-400" />}
          />

          <FormInput
            label="Azienda"
            id="company"
            name="company"
            type="text"
            required
            value={formData.company}
            onChange={handleChange}
            placeholder="Nome della tua azienda"
          />

          <FormInput
            label="Ruolo"
            id="role"
            name="role"
            type="text"
            required
            value={formData.role}
            onChange={handleChange}
            placeholder="Es. Project Manager, Architetto, Imprenditore..."
          />

          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<LockIcon className="h-5 w-5 text-neutral-400" />}
          />

          <FormInput
            label="Conferma Password"
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<LockIcon className="h-5 w-5 text-neutral-400" />}
          />

          <div className="flex items-start py-2">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="checkbox checkbox-primary h-4 w-4"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-neutral-600">
                Accetto i{' '}
                <Link href="/terms" className="text-primary hover:text-primary-700">
                  Termini di servizio
                </Link>{' '}
                e la{' '}
                <Link href="/privacy" className="text-primary hover:text-primary-700">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          fullWidth
          variant="primary"
          size="lg"
          className="bg-blue-700 hover:bg-blue-800"
        >
          Invia richiesta di accesso
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-neutral-600">
            Hai già un account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-700 transition-colors"
            >
              Accedi
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
