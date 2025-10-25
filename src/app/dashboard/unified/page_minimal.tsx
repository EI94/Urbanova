'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function UnifiedDashboardPageMinimal() {
  return (
    <DashboardLayout title="Dashboard Unificata">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Unificata - Versione Minimale</h1>
        <p className="text-gray-600">
          Questa è una versione minimale per testare se il problema è negli import complessi.
        </p>
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-800">
            ✅ Se vedi questo messaggio, il problema NON è in DashboardLayout o negli import base.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
