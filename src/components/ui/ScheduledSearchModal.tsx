'use client';

import { useState } from 'react';
import { LandSearchCriteria } from '@/types/land';
import { 
  XIcon, 
  CalendarIcon, 
  ClockIcon, 
  MailIcon,
  LocationIcon,
  EuroIcon,
  BuildingIcon,
  CheckIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon
} from '@/components/icons';

interface ScheduledSearch {
  id: string;
  name: string;
  criteria: LandSearchCriteria;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

interface ScheduledSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledSearches: ScheduledSearch[];
  onAddScheduledSearch: (search: Omit<ScheduledSearch, 'id' | 'isActive' | 'lastRun' | 'nextRun'>) => void;
  onToggleScheduledSearch: (id: string) => void;
  onDeleteScheduledSearch: (id: string) => void;
  currentCriteria: LandSearchCriteria;
  currentEmail: string;
}

export default function ScheduledSearchModal({
  isOpen,
  onClose,
  scheduledSearches,
  onAddScheduledSearch,
  onToggleScheduledSearch,
  onDeleteScheduledSearch,
  currentCriteria,
  currentEmail
}: ScheduledSearchModalProps) {
  const [newSearchName, setNewSearchName] = useState('');
  const [newSearchFrequency, setNewSearchFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [newSearchEmail, setNewSearchEmail] = useState(currentEmail);

  const handleAddScheduledSearch = () => {
    if (!newSearchName.trim()) {
      alert('Inserisci un nome per la ricerca programmata');
      return;
    }

    if (!newSearchEmail.trim()) {
      alert('Inserisci un indirizzo email');
      return;
    }

    onAddScheduledSearch({
      name: newSearchName,
      criteria: currentCriteria,
      email: newSearchEmail,
      frequency: newSearchFrequency
    });

    // Reset form
    setNewSearchName('');
    setNewSearchFrequency('weekly');
    setNewSearchEmail(currentEmail);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Mai';
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Giornaliera';
      case 'weekly': return 'Settimanale';
      case 'monthly': return 'Mensile';
      case 'yearly': return 'Annuale';
      default: return frequency;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Ricerche Programmate
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Aggiungi nuova ricerca programmata */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Aggiungi Nuova Ricerca Programmata</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Ricerca
                </label>
                <input
                  type="text"
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="es. Milano - Terreni Edificabili"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequenza
                </label>
                <select
                  value={newSearchFrequency}
                  onChange={(e) => setNewSearchFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Giornaliera</option>
                  <option value="weekly">Settimanale</option>
                  <option value="monthly">Mensile</option>
                  <option value="yearly">Annuale</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email per notifiche
                </label>
                <input
                  type="email"
                  value={newSearchEmail}
                  onChange={(e) => setNewSearchEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Criteri Attuali
                </label>
                <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                  <div className="flex items-center gap-1 mb-1">
                    <LocationIcon className="h-3 w-3" />
                    {currentCriteria.location || 'Nessuna località'}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <EuroIcon className="h-3 w-3" />
                    €{currentCriteria.minPrice?.toLocaleString()} - €{currentCriteria.maxPrice?.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <BuildingIcon className="h-3 w-3" />
                    {currentCriteria.minArea}m² - {currentCriteria.maxArea}m²
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleAddScheduledSearch}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckIcon className="h-4 w-4" />
              Aggiungi Ricerca Programmata
            </button>
          </div>

          {/* Lista ricerche programmate */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ricerche Programmate Attive</h3>
            
            {scheduledSearches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nessuna ricerca programmata</p>
                <p className="text-sm">Aggiungi la tua prima ricerca programmata sopra</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledSearches.map((search) => (
                  <div key={search.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{search.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          search.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {search.isActive ? 'Attiva' : 'Inattiva'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleScheduledSearch(search.id)}
                          className={`p-2 rounded-md transition-colors ${
                            search.isActive 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={search.isActive ? 'Pausa' : 'Attiva'}
                        >
                          {search.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={() => onDeleteScheduledSearch(search.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Elimina"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Frequenza:</span>
                        <span className="ml-2 font-medium">{getFrequencyLabel(search.frequency)}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{search.email}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Località:</span>
                        <span className="ml-2 font-medium">{search.criteria.location}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Ultima esecuzione:</span>
                        <span className="ml-2 font-medium">{formatDate(search.lastRun)}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Prossima esecuzione:</span>
                        <span className="ml-2 font-medium">{formatDate(search.nextRun)}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-500">Prezzo:</span>
                        <span className="ml-2 font-medium">
                          €{search.criteria.minPrice?.toLocaleString()} - €{search.criteria.maxPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 