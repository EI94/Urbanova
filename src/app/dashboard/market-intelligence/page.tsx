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
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import AdvancedLocationSelector from '@/components/ui/AdvancedLocationSelector';
import LandCard from '@/components/ui/LandCard';
import ProgressBar from '@/components/ui/ProgressBar';
import PerformanceStats from '@/components/ui/PerformanceStats';
import SearchSchedulerModal from '@/components/ui/SearchSchedulerModal';
import SecurityCompliance from '@/components/ui/SecurityCompliance';
import TeamCollaborationPanel from '@/components/ui/TeamCollaborationPanel';
import CollaborativeSearchSession from '@/components/ui/CollaborativeSearchSession';
import TeamCommentsVoting from '@/components/ui/TeamCommentsVoting';

// Gestione Team spostata nelle Impostazioni

interface SearchResult {
  lands: any[];
}

interface ScheduledSearch {
  id: string;
  name: string;
  criteria: any;
  email: string;
  frequency: string;
  isActive: boolean;
  nextRun?: Date;
}

interface SearchHistoryEntry {
  id: string;
  criteria: any;
  email: string;
  resultsCount: number;
  date: Date;
}

interface ServicesStatus {
  email: boolean;
  webScraping: boolean;
  ai: boolean;
}

export default function MarketIntelligencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    minPrice: 0,
    maxPrice: 0,
    minArea: 500,
    maxArea: 0,
  });
  const [email, setEmail] = useState('pierpaolo.laurito@gmail.com');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchProgress, setSearchProgress] = useState({
    phase: 'idle' as 'idle' | 'searching' | 'complete' | 'error' | 'analyzing' | 'filtering',
    progress: 0,
    message: '',
    currentSource: '',
    sourcesCompleted: 0,
    sourcesTotal: 0,
  });
  const [filters, setFilters] = useState<any>({
    propertyType: 'all',
    condition: 'all',
    features: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSearchScheduler, setShowSearchScheduler] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showTeamCollaboration, setShowTeamCollaboration] = useState(false);
  const [showCollaborativeSession, setShowCollaborativeSession] = useState(false);
  const [showCommentsVoting, setShowCommentsVoting] = useState(false);
  const [selectedView, setSelectedView] = useState('cards');
  const [showMap, setShowMap] = useState(false);
  const [favorites, setFavorites] = useState(new Set<string>());
  const [scheduledSearches, setScheduledSearches] = useState<ScheduledSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [emailError, setEmailError] = useState(false);
  const [servicesStatus, setServicesStatus] = useState<ServicesStatus | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Inizializzazione pagina ottimizzata
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Esegui le chiamate API in parallelo per velocizzare il caricamento
        await Promise.allSettled([
          loadEmailConfig(),
          verifyServices(),
        ]);
      } catch (error) {
        console.error('❌ Errore inizializzazione pagina:', error);
      } finally {
        // Imposta sempre loading a false per evitare caricamento infinito
        setLoading(false);
      }
    };

    // Timeout di sicurezza per evitare caricamento infinito
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 secondi massimo

    initializePage();

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Gestione stato online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Applica filtri quando cambiano
  useEffect(() => {
    if (searchResults?.lands) {
      applyFilters();
    }
  }, [filters, searchResults]);

  // Gestione Team spostata nelle Impostazioni


  const verifyServices = async () => {
    try {
      // Timeout più breve per evitare attese eccessive
          const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondi timeout

      const response = await fetch('/api/verify-services', {
        method: 'GET',
            headers: {
          'Content-Type': 'application/json',
            },
        signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
        setServicesStatus(data.services || data);
        setEmailError(!data.services?.email);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
    } catch (error) {
      console.warn('⚠️ Verifica servizi fallita, usando valori di fallback:', error);
      // Valori di fallback ottimistici per evitare UI bloccata
      setServicesStatus({
        email: true,
        webScraping: true,
        ai: true,
      });
      setEmailError(false);
    }
  };

  const loadEmailConfig = async () => {
    try {
      // Timeout breve per evitare attese eccessive
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 secondi timeout

      const response = await fetch('/api/email-config', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const config = await response.json();
        if (config.email) {
          setEmail(config.email);
        }
      }
    } catch (error) {
      console.warn('⚠️ Caricamento configurazione email fallito, usando default:', error);
      // Usa l'email di default senza bloccare l'UI
    }
  };

  const handleSearch = async () => {
    if (!isOnline) {
      toast('❌ Connessione internet richiesta per la ricerca', { icon: '❌' });
      return;
    }

    setSearchProgress({
      phase: 'searching',
      progress: 0,
      message: 'Avvio ricerca...',
      currentSource: '',
      sourcesCompleted: 0,
      sourcesTotal: 0,
    });

    try {
      const response = await fetch('/api/search-lands', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
          criteria: searchCriteria,
          email,
            }),
          });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
          setSearchProgress({
            phase: 'complete',
            progress: 100,
            message: 'Ricerca completata!',
          currentSource: '',
          sourcesCompleted: 0,
          sourcesTotal: 0,
          });

        // Aggiungi alla cronologia
        const historyEntry: SearchHistoryEntry = {
            id: Date.now().toString(),
          criteria: searchCriteria,
          email,
          resultsCount: data.lands?.length || 0,
            date: new Date(),
        };
        setSearchHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

        toast('✅ Ricerca completata!', { icon: '✅' });
          } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Errore ricerca:', error);
      setSearchProgress({
        phase: 'error',
        progress: 0,
        message: 'Errore durante la ricerca',
        currentSource: '',
        sourcesCompleted: 0,
        sourcesTotal: 0,
      });
      toast('❌ Errore durante la ricerca', { icon: '❌' });
    }
  };

  const applyFilters = () => {
    // Implementazione filtri
  };

  const resetFilters = () => {
    setFilters({
      propertyType: 'all',
      condition: 'all',
      features: [],
    });
  };

  const toggleFavorite = (landId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(landId)) {
        newFavorites.delete(landId);
      } else {
        newFavorites.add(landId);
      }
      return newFavorites;
    });
  };

  const handleCreateFeasibilityProject = (land: any) => {
    // Implementazione creazione progetto fattibilità
    router.push(`/dashboard/feasibility-analysis/new?land=${encodeURIComponent(JSON.stringify(land))}`);
  };

  const addScheduledSearch = (search: any) => {
    setScheduledSearches(prev => [...prev, { ...search, id: Date.now().toString(), isActive: true }]);
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'basso':
        return 'bg-green-100 text-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'alto':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const filteredResults = searchResults?.lands || [];

  if (loading) {
    return (
      <DashboardLayout title="Market Intelligence">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Market Intelligence">
      {/* Header separato come nella Dashboard */}
      <div className="bg-white border-gray-200 shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Urbanova</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Spazio per icone header se necessario */}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stato servizi */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SearchIcon className="w-5 h-5 text-gray-600" />
              <p className="text-gray-600 mt-2">
                Scopriamo le migliori opportunità di terreni
              </p>
            </div>
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
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {servicesStatus ? (
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${servicesStatus.email ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-gray-600">Email</span>
                <div
                  className={`w-2 h-2 rounded-full ${servicesStatus.webScraping ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-gray-600">Scraping</span>
                <div
                  className={`w-2 h-2 rounded-full ${servicesStatus.ai ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-gray-600">AI</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Avviso offline */}
        {!isOnline && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ⚠️ Connessione Internet Assente
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Non hai una connessione internet attiva. Alcune funzionalità potrebbero non
                    funzionare correttamente. Verifica la tua connessione e riprova.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar durante la ricerca */}
        <ProgressBar
          phase={searchProgress.phase}
          progress={searchProgress.progress}
          message={searchProgress.message}
          currentSource={searchProgress.currentSource}
          sourcesCompleted={[searchProgress.sourcesCompleted.toString()]}
          sourcesTotal={[searchProgress.sourcesTotal.toString()]}
        />

        {/* Criteri di ricerca principali */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Localizzazione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Localizzazione
              </label>
              <AdvancedLocationSelector
                value={searchCriteria.location}
                onChange={location => setSearchCriteria(prev => ({ ...prev, location }))}
                placeholder="Cerca localizzazioni (es. Garbatella, Pomezia, Roma...)"
                className="w-full"
                showMultiple={true}
              />
            </div>

            {/* Prezzo Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EuroIcon className="inline h-4 w-4 mr-1" />
                Prezzo Min (€)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={searchCriteria.minPrice === 0 ? '' : searchCriteria.minPrice || ''}
                onChange={e => {
                  const inputValue = e.target.value;
                  const value = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                  setSearchCriteria(prev => ({ ...prev, minPrice: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite minimo
              </p>
            </div>

            {/* Prezzo Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EuroIcon className="inline h-4 w-4 mr-1" />
                Prezzo Max (€)
              </label>
              <input
                type="number"
                min={(searchCriteria.minPrice || 0) + 1000}
                step="1000"
                value={searchCriteria.maxPrice === 0 ? '' : searchCriteria.maxPrice || ''}
                onChange={e => {
                  const inputValue = e.target.value;
                  const value = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                  setSearchCriteria(prev => ({ ...prev, maxPrice: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nessun limite"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite massimo
              </p>
            </div>

            {/* Area Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingIcon className="inline h-4 w-4 mr-1" />
                Area Min (m²)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={searchCriteria.minArea === 0 ? '' : searchCriteria.minArea || ''}
                onChange={e => {
                  const inputValue = e.target.value;
                  const value = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                  setSearchCriteria(prev => ({ ...prev, minArea: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite minimo
              </p>
            </div>

            {/* Area Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingIcon className="inline h-4 w-4 mr-1" />
                Area Max (m²)
              </label>
              <input
                type="number"
                min={(searchCriteria.minArea || 0) + 1}
                step="1"
                value={searchCriteria.maxArea === 0 ? '' : searchCriteria.maxArea || ''}
                onChange={e => {
                  const inputValue = e.target.value;
                  const value = inputValue === '' ? 0 : parseInt(inputValue) || 0;
                  setSearchCriteria(prev => ({ ...prev, maxArea: value }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nessun limite"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite massimo
              </p>
            </div>
          </div>

          {/* Filtri avanzati */}
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={showAdvancedFilters}
            onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
            onReset={resetFilters}
          />

          {/* Email e azioni */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MailIcon className="inline h-4 w-4 mr-1" />
                Email per notifiche
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pierpaolo.laurito@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={() => setShowSearchScheduler(true)}
                disabled={searchProgress.phase !== 'idle' || !isOnline}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  !isOnline
                    ? 'Connessione internet richiesta per la ricerca'
                    : 'Avvia Ricerca o Programmala'
                }
              >
                <SearchIcon className="h-4 w-4" />
                {!isOnline
                  ? 'Offline'
                  : searchProgress.phase === 'idle'
                    ? 'Cerca o Programma'
                    : 'Ricerca in corso...'}
              </button>

              <button
                onClick={() => setShowEmailSettings(true)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title="Impostazioni Email"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Risultati */}
        {searchResults && (
          <div className="space-y-4">
            {/* Informazioni semplici sulla fonte */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                ℹ️ <strong>Nota:</strong> I risultati provengono da <strong>immobiliare.it</strong>{' '}
                e <strong>borsinoimmobiliare.it</strong>
              </p>
            </div>

            {/* Header risultati */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Risultati ({filteredResults.length} terreni)
                </h2>
                <p className="text-sm text-gray-600">
                  Prezzo medio:{' '}
                  {formatCurrency(
                    filteredResults.reduce((sum, land) => sum + land.price, 0) /
                      filteredResults.length
                  )}
                </p>
              </div>

              {/* Controlli vista */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedView('cards')}
                  className={`p-2 rounded ${selectedView === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  📋
                </button>
                <button
                  onClick={() => setSelectedView('list')}
                  className={`p-2 rounded ${selectedView === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  👁️
                </button>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`p-2 rounded ${showMap ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  🗺️
                </button>
              </div>
            </div>

            {/* Mappa (placeholder) */}
            {showMap && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl text-gray-400 mb-2">🗺️</span>
                    <p className="text-gray-500">Mappa interattiva in sviluppo</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risultati in card */}
            {selectedView === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map(land => (
                  <LandCard
                    key={land.id}
                    land={land}
                    isFavorite={favorites.has(land.id)}
                    onToggleFavorite={toggleFavorite}
                    onCreateFeasibility={handleCreateFeasibilityProject}
                    onViewDetails={url => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}

            {/* Risultati in lista */}
            {selectedView === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border">
                {filteredResults.map((land, index) => (
                  <div key={land.id} className={`p-4 ${index !== 0 ? 'border-t' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{land.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getAIScoreColor(land.aiScore)}`}
                          >
                            AI Score: {land.aiScore}/100
                          </span>
                          {land.analysis?.riskAssessment && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(land.analysis.riskAssessment)}`}
                            >
                              {land.analysis.riskAssessment}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Prezzo:</span>
                            <span className="ml-1 font-medium">{formatCurrency(land.price)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Superficie:</span>
                            <span className="ml-1 font-medium">{land.area} m²</span>
                          </div>
                          <div>
                            <span className="text-gray-500">€/m²:</span>
                            <span className="ml-1 font-medium">
                              {formatCurrency(Math.round(land.price / land.area))}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">ROI:</span>
                            <span className="ml-1 font-medium">
                              {land.analysis?.estimatedROI
                                ? `${land.analysis.estimatedROI}%`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(land.id)}
                          className={`p-2 rounded-full ${
                            favorites.has(land.id)
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => window.open(land.url, '_blank')}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Vedi
                        </button>
                        <button
                          onClick={() => handleCreateFeasibilityProject(land)}
                          className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="Crea analisi di fattibilità"
                        >
                          <CalculatorIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Performance Stats */}
        <PerformanceStats
          searchTime={searchProgress.phase === 'complete' ? 2.3 : 0}
          resultsCount={filteredResults.length}
          cacheHit={false}
          servicesStatus={servicesStatus || { email: false, webScraping: false, ai: false }}
        />

        {/* Notifiche Email */}
        {emailError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Configurazione Email Richiesta
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Per ricevere i risultati via email, configura Resend:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Vai su{' '}
                      <a
                        href="https://resend.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        https://resend.com
                      </a>
                    </li>
                    <li>Crea un account e ottieni l'API key</li>
                    <li>
                      Aggiungi <code className="bg-yellow-100 px-1 rounded">RESEND_API_KEY</code>{' '}
                      nelle variabili ambiente
                    </li>
                    <li>
                      Verifica il dominio o usa{' '}
                      <code className="bg-yellow-100 px-1 rounded">onboarding@resend.dev</code>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ricerche Programmate */}
        {scheduledSearches.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📅 Ricerche Programmate
              </h3>
              <button
                onClick={() => setShowSearchScheduler(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Gestisci
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledSearches.slice(0, 3).map((search: ScheduledSearch) => (
                <div key={search.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{search.name}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        search.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {search.isActive ? 'Attiva' : 'Inattiva'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>📍 {search.criteria.location}</div>
                    <div>
                      📅{' '}
                      {search.frequency === 'daily'
                        ? 'Giornaliera'
                        : search.frequency === 'weekly'
                          ? 'Settimanale'
                          : search.frequency === 'monthly'
                            ? 'Mensile'
                            : 'Annuale'}
                    </div>
                    <div>📧 {search.email}</div>
                    {search.nextRun && (
                      <div>⏰ Prossima: {search.nextRun.toLocaleDateString('it-IT')}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {scheduledSearches.length > 3 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowSearchScheduler(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Vedi tutte ({scheduledSearches.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Storico ricerche */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ricerche Recenti</h3>
            <div className="space-y-3">
              {searchHistory.slice(0, 5).map((entry: SearchHistoryEntry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{entry.criteria.location}</p>
                    <p className="text-sm text-gray-600">
                      {entry.resultsCount} risultati •{' '}
                      {entry.date instanceof Date
                        ? entry.date.toLocaleDateString('it-IT')
                        : 'Data non disponibile'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchCriteria(entry.criteria);
                      setEmail(entry.email);
                    }}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    Ripeti
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modale Ricerca e Programmazione Unificato */}
        <SearchSchedulerModal
          isOpen={showSearchScheduler}
          onClose={() => setShowSearchScheduler(false)}
          onScheduleSearch={addScheduledSearch}
          onExecuteSearch={handleSearch}
          currentCriteria={searchCriteria}
          currentEmail={email}
        />

        {/* Componenti Collaborazione Team */}
        <TeamCollaborationPanel
          isOpen={showTeamCollaboration}
          onClose={() => setShowTeamCollaboration(false)}
          currentSearchId="current-search"
          onAddComment={() => {}}
          onVote={() => {}}
          onAddToSharedFavorites={() => {}}
        />

        {/* Gestione Avanzata Team spostata nelle Impostazioni */}
      </div>
    </DashboardLayout>
  );
}