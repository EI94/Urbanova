'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import {
  SearchIcon,
  MailIcon,
  EuroIcon,
  CalendarIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  EditIcon,
  SettingsIcon,
  CalculatorIcon,
  ClockIcon,
  FilterIcon,
  MapIcon,
  EyeIcon,
  PlusIcon,
  BuildingIcon,
  TrashIcon,
} from '@/components/icons';
import {
  BarChart3,
  FileText,
  Shield,
  Calendar,
  Plus,
  Target,
  Bot,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import { GeographicSearch } from '@/components/ui/GeographicSearch';
import LandCard from '@/components/ui/LandCard';
import ProgressBar from '@/components/ui/ProgressBar';
import PerformanceStats from '@/components/ui/PerformanceStats';
import SearchSchedulerModal from '@/components/ui/SearchSchedulerModal';
import SecurityCompliance from '@/components/ui/SecurityCompliance';
import TeamCollaborationPanel from '@/components/ui/TeamCollaborationPanel';
import CollaborativeSearchSession from '@/components/ui/CollaborativeSearchSession';
import TeamCommentsVoting from '@/components/ui/TeamCommentsVoting';
import MarketIntelligenceMapModal from '@/components/ui/MarketIntelligenceMapModal';
import HelpTooltip from '@/components/ui/HelpTooltip';

import { useLanguage } from '@/contexts/LanguageContext';
import { emailService, EmailConfig } from '@/lib/emailService';
import { LandSearchCriteria, RealLandScrapingResult } from '@/types/land';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

interface SearchProgress {
  phase: 'idle' | 'searching' | 'analyzing' | 'filtering' | 'complete' | 'error';
  currentSource: string;
  sourcesCompleted: string[];
  sourcesTotal: string[];
  progress: number;
  message: string;
}

interface FilterState {
  priceRange: [number, number];
  areaRange: [number, number];
  propertyTypes: string[];
  hasPermits: boolean;
  minAIScore: number;
  riskLevel: 'all' | 'low' | 'medium' | 'high';
  maxDistance: number;
}

export default function LandScrapingPage() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Stati principali
  const [searchCriteria, setSearchCriteria] = useState<LandSearchCriteria>({
    location: '',
    minPrice: 0,
    maxPrice: 0, // 0 = nessun limite
    minArea: 0, // 0 = nessun limite
    maxArea: 0, // 0 = nessun limite
    propertyType: 'residenziale',
  });

  const [email, setEmail] = useState('');
  const [searchProgress, setSearchProgress] = useState<SearchProgress>({
    phase: 'idle',
    currentSource: '',
    sourcesCompleted: [],
    sourcesTotal: ['immobiliare.it', 'borsinoimmobiliare.it'],
    progress: 0,
    message: '',
  });

  const [searchResults, setSearchResults] = useState<RealLandScrapingResult | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<
    Array<{
      id: string;
      criteria: LandSearchCriteria;
      email: string;
      date: Date;
      resultsCount: number;
      emailSent: boolean;
    }>
  >([]);

  // Stati per filtri avanzati
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 0], // 0 = nessun limite
    areaRange: [0, 0], // 0 = nessun limite
    propertyTypes: ['tutti'], // CORREZIONE: Default a "tutte le destinazioni" per esperienza inclusiva
    hasPermits: false,
    minAIScore: 0, // CORREZIONE: Ridotto da 70 a 0 per mostrare tutti i risultati
    riskLevel: 'all',
    maxDistance: 50,
  });

  // Stati per UI
  const [showMap, setShowMap] = useState(false);
  const [selectedView, setSelectedView] = useState<'cards' | 'list' | 'map'>('cards');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [servicesStatus, setServicesStatus] = useState<{
    email: boolean;
    webScraping: boolean;
    aiAnalysis: boolean;
  } | null>(null);

  // Stati per modali
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showTeamCollaboration, setShowTeamCollaboration] = useState(false);
  const [showCollaborativeSession, setShowCollaborativeSession] = useState(false);
  const [showCommentsVoting, setShowCommentsVoting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Inizializzazione client-side
  useEffect(() => {
    setIsClient(true);
    
    // Carica email config
    loadEmailConfig();
    
    // Verifica stato servizi
    checkServicesStatus();
  }, []);

  const loadEmailConfig = async () => {
    try {
      // Simula caricamento email config
      setEmail('pierpaolo.laurito@gmail.com');
    } catch (error) {
      console.error('Errore caricamento email config:', error);
    }
  };

  const checkServicesStatus = async () => {
    try {
      const response = await fetch('/api/health');
          if (response.ok) {
            const data = await response.json();
        setServicesStatus(data.services || null);
      }
    } catch (error) {
      console.error('Errore verifica servizi:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchCriteria.location) {
      toast('❌ Inserisci una localizzazione');
      return;
    }

    if (!email) {
      toast('❌ Inserisci un indirizzo email');
      return;
    }

    setSearchProgress({
      phase: 'searching',
      currentSource: 'immobiliare.it',
      sourcesCompleted: [],
      sourcesTotal: ['immobiliare.it', 'borsinoimmobiliare.it'],
      progress: 0,
      message: 'Ricerca in corso...',
    });

    try {
          const response = await fetch('/api/land-scraping', {
            method: 'POST',
        headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
          criteria: searchCriteria,
          email,
          filters,
            }),
          });

          if (!response.ok) {
        throw new Error('Errore nella ricerca');
      }

      const data = await response.json();
      
      setSearchResults(data);
      setFilteredResults(data.results || []);

          setSearchProgress({
            phase: 'complete',
            currentSource: '',
        sourcesCompleted: data.sourcesCompleted || [],
        sourcesTotal: data.sourcesTotal || [],
            progress: 100,
        message: `Trovati ${data.results?.length || 0} risultati`,
      });

      // Aggiungi alla cronologia
      const searchId = Date.now().toString();
      setSearchHistory(prev => [{
        id: searchId,
        criteria: searchCriteria,
        email,
            date: new Date(),
        resultsCount: data.results?.length || 0,
        emailSent: data.emailSent || false,
      }, ...prev]);

      toast(`✅ Ricerca completata! Trovati ${data.results?.length || 0} risultati`);

    } catch (error) {
      console.error('Errore ricerca:', error);
      setSearchProgress({
        phase: 'error',
        currentSource: '',
        sourcesCompleted: [],
        sourcesTotal: [],
        progress: 0,
        message: 'Errore nella ricerca',
      });
      toast('❌ Errore nella ricerca');
    }
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 0],
      areaRange: [0, 0],
      propertyTypes: ['tutti'],
      hasPermits: false,
      minAIScore: 0,
      riskLevel: 'all',
      maxDistance: 50,
    });
  };

  // Non renderizzare nulla durante il prerendering
  if (!isClient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading', 'common')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header con stato servizi */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Market Intelligence
            </h1>
            <p className="text-gray-600 mt-2">
              Scopri automaticamente le migliori opportunità di terreni e ricevi notifiche email
            </p>
          </div>

          {/* Stato servizi */}
          <div className="flex items-center gap-4">
            {/* Pulsanti Collaborazione Team */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowTeamCollaboration(true)}
                className="px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
              >
                👥 Team
              </button>
            </div>

            {/* Indicatore stato connessione e ruolo */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? t('online', 'aiLandScraping') : 'Offline'}
                </span>
            </div>

            {servicesStatus ? (
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${servicesStatus.email ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-gray-600">{t('email', 'aiLandScraping')}</span>
                <div
                  className={`w-2 h-2 rounded-full ${servicesStatus.webScraping ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-gray-600">{t('scraping', 'aiLandScraping')}</span>
              </div>
            ) : null}
          </div>
        </div>
                </div>

        {/* Sezione di ricerca */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Localizzazione */}
            <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localizzazione
              </label>
                <input
                  type="text"
                  value={searchCriteria.location}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Cerca comuni italiani (es. Roma, Milano...)"
                />
                <div className="mt-2 flex items-center gap-2">
                  <select className="text-sm border rounded px-2 py-1">
                    <option>Tutti</option>
                  </select>
                  <select className="text-sm border rounded px-2 py-1">
                    <option>Tutte le regioni</option>
                  </select>
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <MapIcon className="w-4 h-4" />
                    Mappa ISTAT
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Seleziona direttamente dal menu sopra o usa la mappa per una ricerca geografica avanzata
                </p>
            </div>

              {/* Prezzo */}
              <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prezzo Min (€)
              </label>
              <input
                type="number"
                    value={searchCriteria.minPrice || ''}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded-lg px-3 py-2"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite minimo
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prezzo Max (€)
              </label>
              <input
                type="number"
                    value={searchCriteria.maxPrice || ''}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded-lg px-3 py-2"
                placeholder="Nessun limite"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite massimo
              </p>
                </div>
            </div>

              {/* Area */}
              <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area Min (m²)
              </label>
              <input
                type="number"
                    value={searchCriteria.minArea || ''}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, minArea: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded-lg px-3 py-2"
                placeholder="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite minimo
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area Max (m²)
              </label>
              <input
                type="number"
                    value={searchCriteria.maxArea || ''}
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, maxArea: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded-lg px-3 py-2"
                placeholder="Nessun limite"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite massimo
              </p>
            </div>
          </div>

              {/* Filtri Avanzati */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <FilterIcon className="w-4 h-4" />
                  Filtri Avanzati
                  {filters.propertyTypes.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {filters.propertyTypes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset
                </button>
              </div>

              {showAdvancedFilters && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipi di proprietà */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Tipi di Proprietà</label>
                      <div className="space-y-2">
                        {['tutti', 'residenziale', 'commerciale', 'industriale', 'agricolo', 'misto'].map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.propertyTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, propertyTypes: [...prev.propertyTypes, type] }));
                                } else {
                                  setFilters(prev => ({ ...prev, propertyTypes: prev.propertyTypes.filter(t => t !== type) }));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
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
                          onChange={(e) => setFilters(prev => ({ ...prev, hasPermits: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Solo terreni con permessi edificabilità
                        </span>
                      </label>
                    </div>

                    {/* AI Score */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        AI Score Minimo: {filters.minAIScore}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.minAIScore}
                        onChange={(e) => setFilters(prev => ({ ...prev, minAIScore: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Livello di Rischio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Livello di Rischio</label>
                      <select
                        value={filters.riskLevel}
                        onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value as 'all' | 'low' | 'medium' | 'high' }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="all">Tutti i livelli</option>
                        <option value="low">Basso</option>
                        <option value="medium">Medio</option>
                        <option value="high">Alto</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email e Azioni */}
            <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email per Notifiche
              </label>
                <div className="flex gap-2">
              <input
                type="email"
                value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2"
                placeholder="pierpaolo.laurito@gmail.com"
              />
              <button
                    onClick={() => setShowEmailSettings(true)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <SettingsIcon className="w-5 h-5" />
              </button>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={searchProgress.phase === 'searching'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {searchProgress.phase === 'searching' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Ricerca in corso...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-5 h-5" />
                    Cerca o Programma
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {searchProgress.phase === 'searching' && (
                <div className="space-y-2">
                  <ProgressBar
                    phase={searchProgress.phase}
                    progress={searchProgress.progress}
                    message={searchProgress.message}
                    currentSource={searchProgress.currentSource}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risultati */}
        {searchResults && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                Risultati ({filteredResults.length})
                </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedView('cards')}
                  className={`p-2 rounded ${selectedView === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedView('list')}
                  className={`p-2 rounded ${selectedView === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedView('map')}
                  className={`p-2 rounded ${selectedView === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <MapIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {selectedView === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((land, index) => (
                  <LandCard
                    key={index}
                    land={land}
                    isFavorite={favorites.has(land.id)}
                    onToggleFavorite={(id) => {
                      setFavorites(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(id)) {
                          newSet.delete(id);
                        } else {
                          newSet.add(id);
                        }
                        return newSet;
                      });
                    }}
                    onCreateFeasibility={(land) => {
                      console.log('Creazione analisi di fattibilità per:', land);
                    }}
                    onViewDetails={(land) => {
                      console.log('Visualizzazione dettagli per:', land);
                    }}
                  />
                ))}
              </div>
            )}

            {selectedView === 'list' && (
              <div className="space-y-2">
                {filteredResults.map((land, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                          <div>
                        <h3 className="font-medium text-gray-900">{land.title}</h3>
                        <p className="text-sm text-gray-600">{land.location}</p>
                          </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{land.price}</p>
                        <p className="text-sm text-gray-600">{land.area}</p>
                          </div>
                    </div>
                  </div>
                ))}
          </div>
        )}

            {selectedView === 'map' && (
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Mappa in costruzione...</p>
          </div>
        )}
          </div>
        )}

        {/* Performance Stats */}
        {searchResults && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiche Ricerca</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{filteredResults.length}</p>
                <p className="text-sm text-gray-600">Risultati Trovati</p>
                  </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{searchHistory.length}</p>
                <p className="text-sm text-gray-600">Ricerche Effettuate</p>
                  </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">100%</p>
                <p className="text-sm text-gray-600">Copertura Mercato</p>
                </div>
            </div>
          </div>
        )}

        {/* Modali */}
        {showMapModal && (
      <MarketIntelligenceMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={(location) => {
          setSearchCriteria(prev => ({ ...prev, location }));
          setShowMapModal(false);
        }}
      />
        )}
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
    </DashboardLayout>
  );
}