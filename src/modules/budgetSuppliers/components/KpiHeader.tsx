'use client';

/**
 * 📊 KPI HEADER
 * 
 * Header con metriche chiave: Totale Budget, Best Offer, Contratti, Consuntivo + Δ%
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Euro } from 'lucide-react';

interface KpiMetric {
  label: string;
  value: number;
  delta?: number;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

const mockKpis: KpiMetric[] = [
  // Rimossi i dati mock per una UX più pulita
  // I KPI verranno popolati dinamicamente quando l'utente seleziona un progetto
];

export function KpiHeader() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDelta = (delta: number) => {
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
  };

  const getDeltaColor = (deltaType: 'positive' | 'negative' | 'neutral') => {
    switch (deltaType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      case 'neutral':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex items-center justify-between">
      
      {/* Titolo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Euro className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Gestione computo e fornitori</p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="flex items-center space-x-6">
        {mockKpis.map((kpi, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(kpi.value)}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {kpi.label}
            </div>
            {kpi.delta !== undefined && (
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getDeltaColor(kpi.deltaType!)}`}>
                {kpi.icon}
                <span>{formatDelta(kpi.delta)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
