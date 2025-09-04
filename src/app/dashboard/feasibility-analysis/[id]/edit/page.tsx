'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { feasibilityService } from '@/lib/feasibilityService';

export default function EditFeasibilityProjectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const loadAndRedirect = async () => {
      try {
        if (!params?.id) {
          toast('❌ ID progetto non valido', { icon: '❌' });
          router.push('/dashboard/feasibility-analysis');
          return;
        }

        // Carica il progetto per verificare che esista
        const project = await feasibilityService.getProjectById(params?.id as string);

        if (!project) {
          toast('❌ Progetto non trovato', { icon: '❌' });
          router.push('/dashboard/feasibility-analysis');
          return;
        }

        // Reindirizza alla pagina di creazione con i dati del progetto
        // I dati verranno caricati automaticamente nella pagina di creazione
        router.push(`/dashboard/feasibility-analysis/new?edit=${params?.id}`);
      } catch (error) {
        console.error('❌ Errore caricamento progetto per edit:', error);
        toast('❌ Errore nel caricamento del progetto', { icon: '❌' });
        router.push('/dashboard/feasibility-analysis');
      }
    };

    loadAndRedirect();
  }, [params?.id, router]);

  // Mostra un loader mentre reindirizza
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Caricamento progetto per la modifica...</p>
      </div>
    </div>
  );
}
