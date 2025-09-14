'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const authContext = useAuth();
  const currentUser = authContext?.currentUser || null;
  const loading = authContext?.loading || false;
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      // Se l'utente non è autenticato e il caricamento è terminato, reindirizza alla pagina di login
      router.push('/auth/login');
    }
  }, [currentUser, loading, router]);

  // Mostra un indicatore di caricamento mentre si verifica l'autenticazione
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Se l'utente è autenticato, mostra il contenuto della pagina
  return currentUser ? <>{children}</> : null;
}
