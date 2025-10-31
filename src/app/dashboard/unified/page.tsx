'use client';

/**
 * Wrapper minimo per UnifiedDashboardPage
 * Carica la pagina principale solo dopo il mount completo per evitare TDZ
 * 
 * Questo wrapper minimizza qualsiasi esecuzione di codice a livello di modulo
 */
console.log(`🔍 [TDZ DEBUG] unified/page.tsx MODULO IMPORTATO - timestamp: ${Date.now()}, typeof window: ${typeof window}, stack:`, new Error().stack?.split('\n').slice(1, 5).join('\n'));

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Building2 } from 'lucide-react';

console.log(`🔍 [TDZ DEBUG] unified/page.tsx - Imports completati, timestamp: ${Date.now()}`);

// Dynamic import dell'intera pagina - caricata solo dopo mount
const UnifiedDashboardPageContent = dynamic(
  () => import('./page-content').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white shadow-lg mb-4 animate-pulse">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Urbanova</h1>
          <p className="text-slate-500 mt-2">Caricamento...</p>
        </div>
      </div>
    )
  }
);

export default function UnifiedDashboardPage() {
  console.log(`🔍 [TDZ DEBUG] UnifiedDashboardPage RENDER - timestamp: ${Date.now()}, typeof window: ${typeof window}`);
  // Il dynamic import di Next.js gestisce già il loading, 
  // non serve altro ritardo - massima performance
  return <UnifiedDashboardPageContent />;
}
