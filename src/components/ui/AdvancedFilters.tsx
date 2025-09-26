'use client';

import React from 'react';

import { FilterIcon, RefreshIcon, ChevronUpIcon, ChevronDownIcon } from '@/components/icons';

interface FilterState {
  priceRange: [number, number];
  areaRange: [number, number];
  propertyTypes: string[];
  hasPermits: boolean;
  minAIScore: number;
  riskLevel: 'all' | 'low' | 'medium' | 'high';
  maxDistance: number;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
  onReset,
}: AdvancedFiltersProps) {
  const getActiveFiltersCount = () => {
    if (!filters) return 0;

    let count = 0;
    if (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 1000000) count++;
    if (filters.areaRange?.[0] > 500 || filters.areaRange?.[1] < 10000) count++;
    if (filters.propertyTypes?.length !== 1 || filters.propertyTypes?.[0] !== 'tutti')
      count++;
    if (filters.hasPermits) count++;
    if (filters.minAIScore > 70) count++;
    if (filters.riskLevel !== 'all') count++;
    return count;
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const propertyTypeOptions = [
    { value: 'tutti', label: 'Tutte le destinazioni' },
    { value: 'residenziale', label: 'Residenziale' },
    { value: 'commerciale', label: 'Commerciale' },
    { value: 'industriale', label: 'Industriale' },
    { value: 'agricolo', label: 'Agricolo' },
    { value: 'misto', label: 'Misto' },
  ];

  const riskLevelOptions = [
    { value: 'all', label: 'Tutti i livelli' },
    { value: 'low', label: 'Basso' },
    { value: 'medium', label: 'Medio' },
    { value: 'high', label: 'Alto' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header filtri */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FilterIcon className="h-4 w-4" />
          Filtri Avanzati
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
          {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </button>
      </div>

      {/* Contenuto filtri */}
      {isOpen && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Range Prezzo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Range Prezzo (€)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceRange?.[0] || 0}
                    onChange={e =>
                      updateFilter('priceRange', [
                        parseInt(e.target.value) || 0,
                        filters.priceRange?.[1] || 1000000,
                      ])
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500 self-center">-</span>
                  <input
                    type="number"
                    value={filters.priceRange?.[1] || 1000000}
                    onChange={e =>
                      updateFilter('priceRange', [
                        filters.priceRange?.[0] || 0,
                        parseInt(e.target.value) || 1000000,
                      ])
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Max"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {filters.priceRange[0].toLocaleString()} -{' '}
                  {filters.priceRange[1].toLocaleString()} €
                </div>
              </div>
            </div>

            {/* Range Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Range Superficie (m²)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.areaRange?.[0] || 500}
                    onChange={e =>
                      updateFilter('areaRange', [
                        parseInt(e.target.value) || 500,
                        filters.areaRange?.[1] || 10000,
                      ])
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500 self-center">-</span>
                  <input
                    type="number"
                    value={filters.areaRange?.[1] || 10000}
                    onChange={e =>
                      updateFilter('areaRange', [
                        filters.areaRange?.[0] || 500,
                        parseInt(e.target.value) || 10000,
                      ])
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Max"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {filters.areaRange?.[0] || 500} - {filters.areaRange?.[1] || 10000} m²
                </div>
              </div>
            </div>

            {/* Tipologia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Destinazione d'Uso
              </label>
              <div className="space-y-2">
                {propertyTypeOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        option.value === 'tutti' 
                          ? filters.propertyTypes?.includes('tutti') || false
                          : filters.propertyTypes?.includes(option.value) || false
                      }
                      onChange={e => {
                        if (option.value === 'tutti') {
                          // Se selezioni "Tutte", deseleziona tutto il resto
                          if (e.target.checked) {
                            updateFilter('propertyTypes', ['tutti']);
                          } else {
                            updateFilter('propertyTypes', []);
                          }
                        } else {
                          // Se selezioni una destinazione specifica, rimuovi "tutti"
                          const currentTypes = filters.propertyTypes || [];
                          const filteredTypes = currentTypes.filter(t => t !== 'tutti');
                          
                          if (e.target.checked) {
                            updateFilter('propertyTypes', [...filteredTypes, option.value]);
                          } else {
                            updateFilter('propertyTypes', filteredTypes.filter(t => t !== option.value));
                          }
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Permessi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Permessi</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasPermits}
                  onChange={e => updateFilter('hasPermits', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Solo terreni con permessi edificabilità
                </span>
              </label>
            </div>

            {/* AI Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                AI Score Minimo: {filters.minAIScore}
                <div className="relative group">
                  <button
                    type="button"
                    className="w-4 h-4 bg-gray-400 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-500 transition-colors"
                    title="Clicca per informazioni"
                  >
                    ?
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="text-center">
                      <strong>AI Score:</strong> Valutazione automatica della qualità del terreno basata su fattori come ubicazione, servizi, potenziale di sviluppo e rischio. Score più alto = terreno più promettente.
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minAIScore}
                onChange={e => updateFilter('minAIScore', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Rischio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Livello di Rischio
              </label>
              <select
                value={filters.riskLevel}
                onChange={e => updateFilter('riskLevel', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {riskLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset filtri */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshIcon className="h-4 w-4" />
              Reset Filtri
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
