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
  SearchIcon,
  RepeatIcon
} from '@/components/icons';

interface SearchSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleSearch: (scheduleData: {
    name: string;
    criteria: LandSearchCriteria;
    email: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    time: string;
  }) => void;
  onExecuteSearch: (criteria: LandSearchCriteria, email: string) => void;
  currentCriteria: LandSearchCriteria;
  currentEmail: string;
}

export default function SearchSchedulerModal({
  isOpen,
  onClose,
  onScheduleSearch,
  onExecuteSearch,
  currentCriteria,
  currentEmail
}: SearchSchedulerModalProps) {
  const [searchName, setSearchName] = useState('');
  const [email, setEmail] = useState(currentEmail);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [time, setTime] = useState('09:00');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleExecuteSearch = () => {
    if (!email.trim()) {
      alert('Inserisci un indirizzo email');
      return;
    }

    if (!currentCriteria.location.trim()) {
      alert('Inserisci una località per la ricerca');
      return;
    }

    onExecuteSearch(currentCriteria, email);
    onClose();
  };

  const handleScheduleSearch = () => {
    if (!searchName.trim()) {
      alert('Inserisci un nome per la ricerca programmata');
      return;
    }

    if (!email.trim()) {
      alert('Inserisci un indirizzo email');
      return;
    }

    if (!currentCriteria.location.trim()) {
      alert('Inserisci una località per la ricerca');
      return;
    }

    onScheduleSearch({
      name: searchName,
      criteria: currentCriteria,
      email,
      frequency,
      time
    });

    // Reset form
    setSearchName('');
    setEmail(currentEmail);
    setFrequency('weekly');
    setTime('09:00');
    onClose();
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Giornaliera';
      case 'weekly': return 'Settimanale';
      case 'monthly': return 'Mensile';
      case 'yearly': return 'Annuale';
      default: return freq;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <SearchIcon className="h-5 w-5 text-blue-600" />
              Ricerca Terreni
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
          {/* Criteri di Ricerca */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Criteri di Ricerca</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LocationIcon className="inline h-4 w-4 mr-1" />
                  Localizzazione
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {currentCriteria.location || 'Nessuna località selezionata'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EuroIcon className="inline h-4 w-4 mr-1" />
                  Fascia di Prezzo
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  €{currentCriteria.minPrice?.toLocaleString()} - €{currentCriteria.maxPrice?.toLocaleString()}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BuildingIcon className="inline h-4 w-4 mr-1" />
                  Superficie
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                  {currentCriteria.minArea}m² - {currentCriteria.maxArea}m²
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MailIcon className="inline h-4 w-4 mr-1" />
                  Email per notifiche
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Opzioni di Esecuzione */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Opzioni di Esecuzione</h3>
            
            <div className="space-y-4">
              {/* Esecuzione Immediata */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <SearchIcon className="h-4 w-4 text-green-600" />
                      Esecuzione Immediata
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Esegui la ricerca ora e ricevi i risultati via email
                    </p>
                  </div>
                  <button
                    onClick={handleExecuteSearch}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <SearchIcon className="h-4 w-4" />
                    Cerca Ora
                  </button>
                </div>
              </div>

              {/* Programmazione */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      Ricerca Programmata
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Programma ricerche automatiche con notifiche periodiche
                    </p>
                  </div>
                  <button
                    onClick={() => setIsScheduling(!isScheduling)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <RepeatIcon className="h-4 w-4" />
                    {isScheduling ? 'Nascondi' : 'Programma'}
                  </button>
                </div>

                {isScheduling && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Ricerca
                        </label>
                        <input
                          type="text"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          placeholder="es. Milano - Terreni Edificabili"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequenza
                        </label>
                        <select
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value as any)}
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
                          <ClockIcon className="inline h-4 w-4 mr-1" />
                          Orario Esecuzione
                        </label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prossima Esecuzione
                        </label>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                          {(() => {
                            const now = new Date();
                            const [hours, minutes] = time.split(':');
                            const nextRun = new Date(now);
                            nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                            
                            if (nextRun <= now) {
                              switch (frequency) {
                                case 'daily':
                                  nextRun.setDate(nextRun.getDate() + 1);
                                  break;
                                case 'weekly':
                                  nextRun.setDate(nextRun.getDate() + 7);
                                  break;
                                case 'monthly':
                                  nextRun.setMonth(nextRun.getMonth() + 1);
                                  break;
                                case 'yearly':
                                  nextRun.setFullYear(nextRun.getFullYear() + 1);
                                  break;
                              }
                            }
                            
                            return nextRun.toLocaleDateString('it-IT', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleScheduleSearch}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="h-4 w-4" />
                      Programma Ricerca {getFrequencyLabel(frequency)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 