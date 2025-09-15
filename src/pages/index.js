import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const authContext = useAuth();
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  const currentUser = (authContext && typeof authContext === 'object' && 'currentUser' in authContext) ? authContext.currentUser : null;
  const loading = (authContext && typeof authContext === 'object' && 'loading' in authContext) ? authContext.loading : false;

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [currentUser, loading, router]);

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white shadow-lg mb-4">
          <svg
            className="h-8 w-8"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Urbanova</h1>
        <p className="text-slate-500 mt-2">Reindirizzamento in corso...</p>
        <div className="mt-4">
          <div className="w-16 h-1.5 bg-blue-600 rounded-full mx-auto relative overflow-hidden">
            <div className="w-16 h-1.5 bg-blue-300 absolute inset-0 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
