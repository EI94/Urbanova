'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewFeasibilityProjectRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Reindirizza alla route principale per creare un nuovo progetto
    router.push('/dashboard/feasibility-analysis/new-project');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="loading loading-spinner loading-lg"></div>
      <span className="ml-2">Reindirizzamento...</span>
    </div>
  );
}
