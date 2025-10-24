'use client';

/**
 * 💰 BUDGET & FORNITORI PAGE
 * 
 * Gestione budget e fornitori per progetti immobiliari
 */

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function BudgetSuppliersPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Budget & Fornitori</h1>
              <p className="text-gray-600">Gestione budget e fornitori per progetti immobiliari</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🏗️</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hello Urbanova — Budget & Fornitori
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Benvenuto nella sezione Budget & Fornitori. Qui potrai gestire i budget dei progetti 
              e coordinare i fornitori per ottimizzare i costi e la qualità.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
