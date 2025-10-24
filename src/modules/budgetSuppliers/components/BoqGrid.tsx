'use client';

/**
 * 📊 BOQ GRID
 * 
 * Tabella con colonne fisse: Item | UM | Q.tà | Budget | Miglior Offerta | Contratto | Consuntivo | Δ vs Budget
 */

import React from 'react';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

interface BoqItem {
  id: string;
  code: string;
  description: string;
  category: string;
  uom: string;
  qty: number;
  budget: number;
  bestOffer: number;
  contract: number;
  actual: number;
  status: 'draft' | 'rfp' | 'awarded' | 'contracted' | 'in_progress' | 'done';
  level: 'rough' | 'definitive' | 'executive';
}

interface BoqGridProps {
  selectedTypology: string | null;
  filters: {
    category: string;
    status: string;
    level: string;
  };
}

const mockItems: BoqItem[] = [
  {
    id: '1',
    code: '001',
    description: 'Scavi e fondazioni in c.a.',
    category: 'OPERE',
    uom: 'mc',
    qty: 150,
    budget: 45000,
    bestOffer: 42000,
    contract: 43000,
    actual: 43500,
    status: 'in_progress',
    level: 'executive'
  },
  {
    id: '2',
    code: '002',
    description: 'Struttura portante in c.a.',
    category: 'OPERE',
    uom: 'mc',
    qty: 200,
    budget: 120000,
    bestOffer: 115000,
    contract: 118000,
    actual: 0,
    status: 'contracted',
    level: 'executive'
  },
  {
    id: '3',
    code: '003',
    description: 'Impianto elettrico civile',
    category: 'FORNITURE',
    uom: 'mq',
    qty: 1200,
    budget: 36000,
    bestOffer: 34000,
    contract: 0,
    actual: 0,
    status: 'awarded',
    level: 'definitive'
  },
  {
    id: '4',
    code: '004',
    description: 'Pavimenti in gres porcellanato',
    category: 'FORNITURE',
    uom: 'mq',
    qty: 800,
    budget: 24000,
    bestOffer: 22000,
    contract: 22500,
    actual: 0,
    status: 'contracted',
    level: 'executive'
  },
  {
    id: '5',
    code: '005',
    description: 'Sistema di sicurezza antincendio',
    category: 'SICUREZZA',
    uom: 'pz',
    qty: 1,
    budget: 15000,
    bestOffer: 0,
    contract: 0,
    actual: 0,
    status: 'draft',
    level: 'rough'
  },
];

export function BoqGrid({ selectedTypology, filters }: BoqGridProps) {
  
  const formatCurrency = (value: number) => {
    if (value === 0) return '-';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatQuantity = (qty: number, uom: string) => {
    return `${qty.toLocaleString('it-IT')} ${uom}`;
  };

  const calculateDelta = (actual: number, budget: number) => {
    if (budget === 0) return 0;
    return ((actual - budget) / budget) * 100;
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 5) return 'text-red-600 bg-red-50';
    if (delta < -5) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'rfp':
        return 'text-blue-600 bg-blue-100';
      case 'awarded':
        return 'text-yellow-600 bg-yellow-100';
      case 'contracted':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-purple-600 bg-purple-100';
      case 'done':
        return 'text-emerald-600 bg-emerald-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Bozza';
      case 'rfp':
        return 'RFP';
      case 'awarded':
        return 'Assegnato';
      case 'contracted':
        return 'Contrattato';
      case 'in_progress':
        return 'In corso';
      case 'done':
        return 'Completato';
      default:
        return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'rough':
        return 'text-gray-600 bg-gray-100';
      case 'definitive':
        return 'text-blue-600 bg-blue-100';
      case 'executive':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'rough':
        return 'Sommario';
      case 'definitive':
        return 'Definitivo';
      case 'executive':
        return 'Esecutivo';
      default:
        return level;
    }
  };

  // Filter items based on selected typology and filters
  const filteredItems = mockItems.filter(item => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.level && item.level !== filters.level) return false;
    return true;
  });

  return (
    <div className="h-full bg-white">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Computo Metrico</h2>
            <p className="text-sm text-gray-600">
              {filteredItems.length} items • {selectedTypology ? 'Tipologia selezionata' : 'Tutte le tipologie'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Ultimo aggiornamento: oggi</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto h-full">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UM
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Q.tà
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miglior Offerta
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contratto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consuntivo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Δ vs Budget
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const delta = calculateDelta(item.actual, item.budget);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  
                  {/* Item */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                          {getLevelLabel(item.level)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.category}
                      </div>
                    </div>
                  </td>

                  {/* UM */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.uom}
                  </td>

                  {/* Q.tà */}
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatQuantity(item.qty, item.uom)}
                  </td>

                  {/* Budget */}
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.budget)}
                  </td>

                  {/* Miglior Offerta */}
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.bestOffer)}
                  </td>

                  {/* Contratto */}
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.contract)}
                  </td>

                  {/* Consuntivo */}
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(item.actual)}
                  </td>

                  {/* Δ vs Budget */}
                  <td className="px-6 py-4 text-right">
                    {item.actual > 0 && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDeltaColor(delta)}`}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                      </span>
                    )}
                  </td>

                  {/* Azioni */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Totale {filteredItems.length} items
          </div>
          <div className="flex items-center space-x-6">
            <div>
              Budget: {formatCurrency(filteredItems.reduce((sum, item) => sum + item.budget, 0))}
            </div>
            <div>
              Contratti: {formatCurrency(filteredItems.reduce((sum, item) => sum + item.contract, 0))}
            </div>
            <div>
              Consuntivo: {formatCurrency(filteredItems.reduce((sum, item) => sum + item.actual, 0))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
