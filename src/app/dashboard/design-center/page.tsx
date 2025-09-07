'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DesignCenterPage() {
  const router = useRouter();

  useEffect(() => {
    // Reindirizza alla dashboard unificata
    router.replace('/dashboard/unified');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Reindirizzamento alla dashboard unificata...</p>
      </div>
    </div>
  );
}