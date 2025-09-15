'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [AuthGuard] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const currentUser = (authContext && typeof authContext === 'object' && 'currentUser' in authContext) ? authContext.currentUser : null;
  const loading = (authContext && typeof authContext === 'object' && 'loading' in authContext) ? authContext.loading : false;
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      // Reindirizza alla pagina di login se non autenticato
      router.push('/auth/login');
    }
  }, [currentUser, loading, router]);

  // Mostra loading mentre verifica l'autenticazione
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  // Se non autenticato, non mostrare nulla (il redirect è in corso)
  if (!currentUser) {
    return null;
  }

  // Se autenticato, mostra il contenuto
  return <>{children}</>;
}
