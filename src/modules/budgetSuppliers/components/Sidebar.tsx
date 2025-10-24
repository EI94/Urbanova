'use client';

/**
 * 📋 SIDEBAR
 * 
 * Sidebar con elenco Tipologie e filtri per categoria/stato/livello
 */

import React from 'react';
import { Building2, Filter, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Typology {
  id: string;
  name: string;
  itemsCount: number;
  finishLevel: 'basic' | 'standard' | 'premium';
}

interface Filters {
  category: string;
  status: string;
  level: string;
}

interface SidebarProps {
  selectedTypology: string | null;
  onTypologySelect: (typologyId: string | null) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const mockTypologies: Typology[] = [
  { id: 'all', name: 'Tutte le Tipologie', itemsCount: 45, finishLevel: 'standard' },
  { id: 'bilocale', name: 'Bilocale Standard', itemsCount: 18, finishLevel: 'standard' },
  { id: 'trilocale', name: 'Trilocale Premium', itemsCount: 15, finishLevel: 'premium' },
  { id: 'monolocale', name: 'Monolocale Basic', itemsCount: 12, finishLevel: 'basic' },
];

const categoryOptions = [
  { value: '', label: 'Tutte le categorie' },
  { value: 'OPERE', label: 'Opere' },
  { value: 'FORNITURE', label: 'Forniture' },
  { value: 'SICUREZZA', label: 'Sicurezza' },
  { value: 'CANTIERIZZAZIONE', label: 'Cantierizzazione' },
  { value: 'ESTERNE_ALTRO', label: 'Esterne & Altro' },
];

const statusOptions = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'draft', label: 'Bozza' },
  { value: 'rfp', label: 'RFP' },
  { value: 'awarded', label: 'Assegnato' },
  { value: 'contracted', label: 'Contrattato' },
  { value: 'in_progress', label: 'In corso' },
  { value: 'done', label: 'Completato' },
];

const levelOptions = [
  { value: '', label: 'Tutti i livelli' },
  { value: 'rough', label: 'Sommario' },
  { value: 'definitive', label: 'Definitivo' },
  { value: 'executive', label: 'Esecutivo' },
];

export function Sidebar({ selectedTypology, onTypologySelect, filters, onFiltersChange }: SidebarProps) {
  
  const getFinishLevelColor = (level: 'basic' | 'standard' | 'premium') => {
    switch (level) {
      case 'basic':
        return 'bg-gray-100 text-gray-700';
      case 'standard':
        return 'bg-blue-100 text-blue-700';
      case 'premium':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getFinishLevelLabel = (level: 'basic' | 'standard' | 'premium') => {
    switch (level) {
      case 'basic':
        return 'Basic';
      case 'standard':
        return 'Standard';
      case 'premium':
        return 'Premium';
      default:
        return 'Standard';
    }
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tipologie</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca tipologia..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Tipologie List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-2">
          {mockTypologies.map((typology) => (
            <button
              key={typology.id}
              onClick={() => onTypologySelect(typology.id === selectedTypology ? null : typology.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedTypology === typology.id
                  ? 'bg-blue-50 border border-blue-200 shadow-sm'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">
                  {typology.name}
                </span>
                <span className="text-xs text-gray-500">
                  {typology.itemsCount} items
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFinishLevelColor(typology.finishLevel)}`}>
                  {getFinishLevelLabel(typology.finishLevel)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filtri */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtri</h3>
        </div>

        <div className="space-y-4">
          
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stato
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Livello */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Livello
            </label>
            <select
              value={filters.level}
              onChange={(e) => onFiltersChange({ ...filters, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filtri */}
          <button
            onClick={() => onFiltersChange({ category: '', status: '', level: '' })}
            className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset Filtri
          </button>

        </div>
      </div>

    </div>
  );
}
