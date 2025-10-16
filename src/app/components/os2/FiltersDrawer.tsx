'use client';

// 🎨 FILTERS DRAWER - Filtraggio messaggi OS 2.0
// Project, Skill, Status, Period + Solo azioni

import React from 'react';
import { X, Filter, Check, Building2, Zap, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidecarFilters, MessageStatus } from '@/hooks/os2/useOsSidecar';

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SidecarFilters;
  onChange: (filters: Partial<SidecarFilters>) => void;
  onClear: () => void;
  
  // Options data
  projects?: Array<{ id: string; name: string }>;
  skills?: Array<{ id: string; name: string; icon: React.ReactNode }>;
}

const STATUS_OPTIONS: Array<{ value: MessageStatus; label: string; color: string }> = [
  { value: 'draft', label: 'Bozza', color: 'gray' },
  { value: 'awaiting_confirm', label: 'In Attesa', color: 'amber' },
  { value: 'running', label: 'In Esecuzione', color: 'blue' },
  { value: 'done', label: 'Completato', color: 'green' },
  { value: 'error', label: 'Errore', color: 'red' },
];

export function FiltersDrawer({
  isOpen,
  onClose,
  filters,
  onChange,
  onClear,
  projects = [],
  skills = [],
}: FiltersDrawerProps) {
  if (!isOpen) return null;
  
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== false);
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className={cn(
        'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtri</h2>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                Attivi
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Pulisci
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Chiudi filtri"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-73px)] p-4 space-y-6">
          {/* Project Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Building2 className="w-4 h-4" />
              Progetto
            </label>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onChange({ 
                    projectId: filters.projectId === project.id ? undefined : project.id 
                  })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm',
                    filters.projectId === project.id
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                  )}
                >
                  <span className="font-medium">{project.name}</span>
                  {filters.projectId === project.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Nessun progetto disponibile
                </p>
              )}
            </div>
          </div>
          
          {/* Skill Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Zap className="w-4 h-4" />
              Skill
            </label>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => onChange({ 
                    skillId: filters.skillId === skill.id ? undefined : skill.id 
                  })}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border transition-all',
                    filters.skillId === skill.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className={filters.skillId === skill.id ? 'text-blue-600' : 'text-gray-500'}>
                    {skill.icon}
                  </span>
                  <span className={cn(
                    'text-xs font-medium text-center',
                    filters.skillId === skill.id ? 'text-blue-900' : 'text-gray-700'
                  )}>
                    {skill.name}
                  </span>
                  {filters.skillId === skill.id && (
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Clock className="w-4 h-4" />
              Stato
            </label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ 
                    status: filters.status === option.value ? undefined : option.value 
                  })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm',
                    filters.status === option.value
                      ? `bg-${option.color}-50 border-${option.color}-200 text-${option.color}-900`
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  {filters.status === option.value && (
                    <Check className={`w-4 h-4 text-${option.color}-600`} />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-4 h-4" />
              Periodo
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Da</label>
                <input
                  type="date"
                  value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onChange({ 
                    dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">A</label>
                <input
                  type="date"
                  value={filters.dateTo?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onChange({ 
                    dateTo: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Solo Azioni Toggle */}
          <div>
            <label className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Solo messaggi con azioni</span>
              <button
                onClick={() => onChange({ onlyActions: !filters.onlyActions })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  filters.onlyActions ? 'bg-blue-600' : 'bg-gray-200'
                )}
                role="switch"
                aria-checked={filters.onlyActions}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    filters.onlyActions ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

