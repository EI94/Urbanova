'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LandSearchCriteria, RealLandScrapingResult } from '@/types/land';
import { emailService, EmailConfig } from '@/lib/emailService';

import ProgressBar from '@/components/ui/ProgressBar';
import LandCard from '@/components/ui/LandCard';
import AdvancedFilters from '@/components/ui/AdvancedFilters';
import PerformanceStats from '@/components/ui/PerformanceStats';
import { 
  SearchIcon, 
  MailIcon, 
  BuildingIcon, 
  EuroIcon, 
  LocationIcon,
  CalendarIcon,
  TrendingUpIcon,
  AlertIcon,
  CheckCircleIcon,
  EditIcon,
  TrashIcon,
  SettingsIcon,
  BrainIcon,
  GlobeIcon,
  CalculatorIcon,
  ClockIcon,
  RepeatIcon,
  FilterIcon,
  MapIcon,
  StarIcon,
  EyeIcon,
  PlusIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
  TargetIcon,
  ShieldIcon,
  ZapIcon
} from '@/components/icons';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const [isClient, setIsClient] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Stati principali
  const [searchCriteria, setSearchCriteria] = useState<LandSearchCriteria>({
    location: '',
    minPrice: 0,
    maxPrice: 1000000,
    minArea: 500,
    maxArea: 10000,
    propertyType: 'residenziale'
  });
  
  const [email, setEmail] = useState('');
  const [searchProgress, setSearchProgress] = useState<SearchProgress>({
    phase: 'idle',
    currentSource: '',
    sourcesCompleted: [],
    sourcesTotal: ['immobiliare.it', 'bakeca.it', 'annunci.it', 'casa.it'],
    progress: 0,
    message: ''
  });
  
  const [searchResults, setSearchResults] = useState<RealLandScrapingResult | null>(null);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{
    id: string;
    criteria: LandSearchCriteria;
    email: string;
    date: Date;
    resultsCount: number;
    emailSent: boolean;
  }>>([]);
  
  // Stati per filtri avanzati
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    areaRange: [500, 10000],
    propertyTypes: ['residenziale'],
    hasPermits: false,
    minAIScore: 70,
    riskLevel: 'all',
    maxDistance: 50
  });
  
  // Stati per UI
  const [showMap, setShowMap] = useState(false);
  const [selectedView, setSelectedView] = useState<'cards' | 'list' | 'map'>('cards');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  
  // Stati per servizi
  const [servicesStatus, setServicesStatus] = useState<{
    email: boolean;
    webScraping: boolean;
    ai: boolean;
  } | null>(null);
  
  const [emailError, setEmailError] = useState<string | null>(null);

  const router = useRouter();

  // Controlla se siamo nel browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inizializzazione
  useEffect(() => {
    initializeServices();
    loadSearchHistory();
    loadFavorites();
  }, []);

  // Gestione stato connessione internet
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connessione internet ripristinata');
      setIsOnline(true);
      toast.success('Connessione internet ripristinata!');
      // Riprova a verificare i servizi
      setTimeout(() => {
        verifyServices();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('❌ Connessione internet persa');
      setIsOnline(false);
      toast.error('Connessione internet persa. Verifica la tua connessione.');
    };

    // Imposta lo stato iniziale
    setIsOnline(navigator.onLine);

    // Aggiungi event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
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

  const initializeServices = async () => {
    try {
      await loadEmailConfig();
      await verifyServices();
    } catch (error) {
      console.error('❌ Errore inizializzazione servizi:', error);
    }
  };

  const verifyServices = async () => {
    try {
      // Retry logic per gestire errori di rete
      let attempts = 0;
      const maxAttempts = 3;
      let lastError: any = null;

      while (attempts < maxAttempts) {
        try {
          console.log(`🔍 Tentativo ${attempts + 1}/${maxAttempts} - Health check...`);
          
          // Timeout di 10 secondi per evitare blocchi
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch('/api/health', {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Health check riuscito:', data);
            
            setServicesStatus({
              email: data.services?.email === 'configured' || false,
              webScraping: data.services?.webScraping === 'operational' || false,
              ai: data.services?.ai === 'configured' || false
            });
            return; // Successo, esci dal loop
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error: any) {
          lastError = error;
          attempts++;
          
          if (error.name === 'AbortError') {
            console.warn(`⏰ Timeout tentativo ${attempts}/${maxAttempts}`);
          } else if (error.message.includes('ERR_NETWORK_CHANGED') || 
                     error.message.includes('ERR_INTERNET_DISCONNECTED') ||
                     error.message.includes('Failed to fetch')) {
            console.warn(`🌐 Errore di rete tentativo ${attempts}/${maxAttempts}:`, error.message);
          } else {
            console.error(`❌ Errore tentativo ${attempts}/${maxAttempts}:`, error);
          }

          // Attendi prima del retry (backoff esponenziale)
          if (attempts < maxAttempts) {
            const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
            console.log(`⏳ Attendo ${delay}ms prima del prossimo tentativo...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // Tutti i tentativi falliti
      console.error('❌ Tutti i tentativi di health check falliti:', lastError);
      setServicesStatus({
        email: false,
        webScraping: false,
        ai: false
      });

      // Mostra errore all'utente
      toast.error('Problemi di connessione. Verifica la tua connessione internet e riprova.');

    } catch (error) {
      console.error('❌ Errore critico verifica servizi:', error);
      setServicesStatus({
        email: false,
        webScraping: false,
        ai: false
      });
    }
  };

  const loadEmailConfig = async () => {
    try {
      const config = await emailService.getEmailConfig();
      setEmailConfig(config);
      if (config?.email) {
        setEmail(config.email);
      }
    } catch (error) {
      console.error('❌ Errore caricamento configurazione email:', error);
    }
  };

  const loadSearchHistory = async () => {
    // Carica cronologia reale da localStorage o database
    try {
      if (typeof window !== 'undefined') {
        const savedHistory = localStorage.getItem('landScrapingHistory');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          // Converti le date da stringhe a oggetti Date
          const historyWithDates = history.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          }));
          setSearchHistory(historyWithDates);
        } else {
          setSearchHistory([]);
        }
      } else {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error('Errore caricamento cronologia:', error);
      setSearchHistory([]);
    }
  };

  const loadFavorites = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('landScrapingFavorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    }
  };

  const saveFavorites = (newFavorites: Set<string>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landScrapingFavorites', JSON.stringify([...newFavorites]));
    }
    setFavorites(newFavorites);
  };

  const toggleFavorite = (landId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(landId)) {
      newFavorites.delete(landId);
    } else {
      newFavorites.add(landId);
    }
    saveFavorites(newFavorites);
    toast.success(newFavorites.has(landId) ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti');
  };

  const applyFilters = useCallback(() => {
    if (!searchResults?.lands) return;

    let filtered = [...searchResults.lands];

    // Filtro prezzo
    filtered = filtered.filter(land => 
      land.price >= filters.priceRange[0] && land.price <= filters.priceRange[1]
    );

    // Filtro area
    filtered = filtered.filter(land => 
      land.area >= filters.areaRange[0] && land.area <= filters.areaRange[1]
    );

    // Filtro tipologia
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter(land => 
        filters.propertyTypes.some(type => 
          land.features.some(feature => 
            feature.toLowerCase().includes(type.toLowerCase())
          )
        )
      );
    }

    // Filtro permessi
    if (filters.hasPermits) {
      filtered = filtered.filter(land => 
        land.features.some(feature => 
          feature.toLowerCase().includes('permessi') || 
          feature.toLowerCase().includes('edificabile')
        )
      );
    }

    // Filtro AI Score
    filtered = filtered.filter(land => land.aiScore >= filters.minAIScore);

    // Filtro rischio
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(land => {
        const risk = land.analysis?.riskAssessment?.toLowerCase() || 'medium';
        return risk.includes(filters.riskLevel);
      });
    }

    setFilteredResults(filtered);
  }, [filters, searchResults]);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error('Inserisci un indirizzo email per ricevere i risultati');
      return;
    }

    if (!searchCriteria.location.trim()) {
      toast.error('Inserisci una località per la ricerca');
      return;
    }

    setSearchProgress({
      phase: 'searching',
      currentSource: '',
      sourcesCompleted: [],
      sourcesTotal: ['immobiliare.it', 'bakeca.it', 'annunci.it', 'casa.it'],
      progress: 0,
      message: 'Inizializzazione ricerca...'
    });

    try {
      // Simula progresso in tempo reale
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev.phase === 'complete' || prev.phase === 'error') {
            clearInterval(progressInterval);
            return prev;
          }

          const newProgress = Math.min(prev.progress + Math.random() * 15, 90);
          let newPhase = prev.phase;
          let newMessage = prev.message;
          let newCurrentSource = prev.currentSource;
          let newSourcesCompleted = [...prev.sourcesCompleted];

          if (newProgress > 30 && prev.phase === 'searching') {
            newPhase = 'analyzing';
            newMessage = 'Analisi AI in corso...';
          }

          if (newProgress > 60 && prev.phase === 'analyzing') {
            newPhase = 'filtering';
            newMessage = 'Filtraggio risultati...';
          }

          if (newProgress > 20 && newSourcesCompleted.length === 0) {
            newSourcesCompleted = ['immobiliare.it'];
            newCurrentSource = 'casa.it';
          } else if (newProgress > 40 && newSourcesCompleted.length === 1) {
            newSourcesCompleted = ['immobiliare.it', 'casa.it'];
            newCurrentSource = 'idealista.it';
          } else if (newProgress > 70 && newSourcesCompleted.length === 2) {
            newSourcesCompleted = ['immobiliare.it', 'casa.it', 'idealista.it'];
            newCurrentSource = '';
          }

          return {
            ...prev,
            phase: newPhase,
            progress: newProgress,
            message: newMessage,
            currentSource: newCurrentSource,
            sourcesCompleted: newSourcesCompleted
          };
        });
      }, 500);

      // Esegui ricerca tramite API route (server-side) con retry logic
      let searchAttempts = 0;
      const maxSearchAttempts = 3;
      let searchLastError: any = null;

      while (searchAttempts < maxSearchAttempts) {
        try {
          console.log(`🔍 Tentativo ricerca ${searchAttempts + 1}/${maxSearchAttempts}...`);
          
          // Timeout di 120 secondi per la ricerca
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000);

          const response = await fetch('/api/land-scraping', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: controller.signal,
            body: JSON.stringify({
              location: searchCriteria.location,
              criteria: {
                minPrice: searchCriteria.minPrice,
                maxPrice: searchCriteria.maxPrice,
                minArea: searchCriteria.minArea,
                maxArea: searchCriteria.maxArea,
                propertyType: searchCriteria.propertyType
              },
              aiAnalysis: true,
              email: email
            })
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Errore API: ${response.status} ${response.statusText}`);
          }

          const results = await response.json();
          
          if (!results.success) {
            throw new Error(results.error || 'Errore durante la ricerca');
          }
          
          clearInterval(progressInterval);
          
          const finalResults = results.data || results;
          console.log('📊 Risultati ricevuti:', {
            landsCount: finalResults.lands?.length || 0,
            emailSent: finalResults.emailSent,
            summary: finalResults.summary
          });
          
          setSearchResults(finalResults);
          
          // Applica filtri ai nuovi risultati
          setTimeout(() => {
            if (finalResults.lands) {
              let filtered = [...finalResults.lands];
              setFilteredResults(filtered);
              console.log('✅ Filtri applicati:', filtered.length, 'risultati');
            }
          }, 100);
          
          setSearchProgress({
            phase: 'complete',
            currentSource: '',
            sourcesCompleted: ['immobiliare.it', 'casa.it', 'idealista.it'],
            sourcesTotal: ['immobiliare.it', 'casa.it', 'idealista.it'],
            progress: 100,
            message: 'Ricerca completata!'
          });

          // Salva nella cronologia
          const historyEntry = {
            id: Date.now().toString(),
            criteria: searchCriteria,
            email,
            date: new Date(),
            resultsCount: results.data?.lands?.length || 0,
            emailSent: results.data?.emailSent || false
          };
          const newHistory = [historyEntry, ...searchHistory.slice(0, 9)];
          setSearchHistory(newHistory);
          
          // Salva in localStorage per persistenza
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('landScrapingHistory', JSON.stringify(newHistory));
            }
          } catch (error) {
            console.error('Errore salvataggio cronologia:', error);
          }

          const landsCount = results.data?.lands?.length || 0;
          const emailSent = results.data?.emailSent;
          const emailError = results.emailError;
          
          if (emailError) {
            setEmailError(emailError);
            toast.error(`⚠️ ${emailError}`);
            toast.success(`✅ Trovati ${landsCount} terreni! Email non inviata - configura RESEND_API_KEY`);
          } else {
            setEmailError(null);
            if (emailSent) {
              toast.success(`✅ Trovati ${landsCount} terreni! Email inviata con successo.`);
            } else {
              toast.success(`✅ Trovati ${landsCount} terreni!`);
            }
          }
          return; // Exit the retry loop on success
        } catch (error: any) {
          searchLastError = error;
          searchAttempts++;
          
          if (error.name === 'AbortError') {
            console.warn(`⏰ Timeout tentativo ricerca ${searchAttempts}/${maxSearchAttempts}`);
          } else if (error.message.includes('ERR_NETWORK_CHANGED') || 
                     error.message.includes('ERR_INTERNET_DISCONNECTED') ||
                     error.message.includes('Failed to fetch')) {
            console.warn(`🌐 Errore di rete tentativo ricerca ${searchAttempts}/${maxSearchAttempts}:`, error.message);
          } else {
            console.error(`❌ Errore tentativo ricerca ${searchAttempts}/${maxSearchAttempts}:`, error);
          }

          if (searchAttempts < maxSearchAttempts) {
            const delay = Math.min(1000 * Math.pow(2, searchAttempts - 1), 5000);
            console.log(`⏳ Attendo ${delay}ms prima del prossimo tentativo ricerca...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // Tutti i tentativi di ricerca falliti
      console.error('❌ Tutti i tentativi di ricerca falliti:', searchLastError);
      setSearchProgress({
        phase: 'error',
        currentSource: '',
        sourcesCompleted: [],
        sourcesTotal: ['immobiliare.it', 'casa.it', 'idealista.it'],
        progress: 0,
        message: `Errore: ${searchLastError instanceof Error ? searchLastError.message : 'Errore sconosciuto'}`
      });
      
      // Messaggio di errore più dettagliato
      const errorMessage = searchLastError instanceof Error 
        ? `❌ Errore: ${searchLastError.message}` 
        : '❌ Errore durante la ricerca. Riprova.';
      toast.error(errorMessage);

    } catch (error) {
      console.error('❌ Errore ricerca:', error);
      
      // Log dettagliato per debugging
      if (error instanceof Error) {
        console.error('Dettagli errore:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      setSearchProgress({
        phase: 'error',
        currentSource: '',
        sourcesCompleted: [],
        sourcesTotal: ['immobiliare.it', 'casa.it', 'idealista.it'],
        progress: 0,
        message: `Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
      });
      
      // Messaggio di errore più dettagliato
      const errorMessage = error instanceof Error 
        ? `❌ Errore: ${error.message}` 
        : '❌ Errore durante la ricerca. Riprova.';
      toast.error(errorMessage);
    }
  };

  const handleCreateFeasibilityProject = async (land: any) => {
    try {
      // Funzionalità temporaneamente disabilitata per evitare errori Firebase
      toast.success('✅ Funzionalità progetto di fattibilità temporaneamente non disponibile');
      console.log('📋 Progetto di fattibilità richiesto per:', land.title);
    } catch (error) {
      console.error('❌ Errore creazione progetto:', error);
      toast.error('❌ Funzionalità non disponibile al momento');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'basso':
      case 'molto basso':
        return 'text-emerald-600 bg-emerald-50';
      case 'medio':
        return 'text-yellow-600 bg-yellow-50';
      case 'alto':
      case 'molto alto':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getActiveFiltersCount = () => {
    if (!filters) return 0;
    
    let count = 0;
    if (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] < 1000000) count++;
    if (filters.areaRange?.[0] > 500 || filters.areaRange?.[1] < 10000) count++;
    if (filters.propertyTypes?.length !== 1 || filters.propertyTypes?.[0] !== 'residenziale') count++;
    if (filters.hasPermits) count++;
    if (filters.minAIScore > 70) count++;
    if (filters.riskLevel !== 'all') count++;
    return count;
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      areaRange: [500, 10000],
      propertyTypes: ['residenziale'],
      hasPermits: false,
      minAIScore: 70,
      riskLevel: 'all',
      maxDistance: 50
    });
  };

  // Non renderizzare nulla durante il prerendering
  if (!isClient) {
    return (
      <DashboardLayout title="AI Land Scraping">
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
    <DashboardLayout title="AI Land Scraping">
      <div className="space-y-6">
        {/* Header con stato servizi */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BrainIcon className="h-8 w-8 text-blue-600" />
              AI Land Scraping
            </h1>
            <p className="text-gray-600 mt-2">
              Scopri automaticamente le migliori opportunità di terreni e ricevi notifiche email
            </p>
          </div>
          
          {/* Stato servizi */}
          <div className="flex items-center gap-4">
            {/* Indicatore stato connessione */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {servicesStatus && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${servicesStatus.email ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">Email</span>
                <div className={`w-2 h-2 rounded-full ${servicesStatus.webScraping ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">Scraping</span>
                <div className={`w-2 h-2 rounded-full ${servicesStatus.ai ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">AI</span>
              </div>
            )}
          </div>
        </div>

        {/* Messaggio informativo sui dati reali */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ✅ Solo Dati Reali
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Il sistema ora estrae <strong>esclusivamente dati reali</strong> dagli annunci. 
                  Vengono mostrati solo terreni con prezzo e superficie verificati. 
                  Se non vengono trovati dati completi, l'annuncio non viene incluso nei risultati.
                </p>
              </div>
            </div>
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
                    Non hai una connessione internet attiva. Alcune funzionalità potrebbero non funzionare correttamente. 
                    Verifica la tua connessione e riprova.
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
          sourcesCompleted={searchProgress.sourcesCompleted}
          sourcesTotal={searchProgress.sourcesTotal}
        />

        {/* Criteri di ricerca principali */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Localizzazione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LocationIcon className="inline h-4 w-4 mr-1" />
                Localizzazione
              </label>
              <input
                type="text"
                value={searchCriteria.location}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
                placeholder="es. Milano, Roma, Torino..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={searchCriteria.minPrice || 0}
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  minPrice: parseInt(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Prezzo Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EuroIcon className="inline h-4 w-4 mr-1" />
                Prezzo Max (€)
              </label>
              <input
                type="number"
                value={searchCriteria.maxPrice || 1000000}
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  maxPrice: parseInt(e.target.value) || 1000000
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Area Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingIcon className="inline h-4 w-4 mr-1" />
                Area Min (m²)
              </label>
              <input
                type="number"
                value={searchCriteria.minArea || 500}
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  minArea: parseInt(e.target.value) || 500
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingIcon className="inline h-4 w-4 mr-1" />
                Area Max (m²)
              </label>
              <input
                type="number"
                value={searchCriteria.maxArea || 10000}
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  maxArea: parseInt(e.target.value) || 10000
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pierpaolo.laurito@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end gap-3">
              <button
                onClick={handleSearch}
                disabled={searchProgress.phase !== 'idle' || !isOnline}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={!isOnline ? 'Connessione internet richiesta per la ricerca' : ''}
              >
                <SearchIcon className="h-4 w-4" />
                {!isOnline ? 'Offline' : 
                 searchProgress.phase === 'idle' ? 'Avvia Ricerca' : 'Ricerca in corso...'}
              </button>
              

              
              <button
                onClick={() => setShowEmailSettings(true)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Risultati */}
        {searchResults && (
          <div className="space-y-4">
            {/* Header risultati */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Risultati ({filteredResults.length} terreni)
                </h2>
                <p className="text-sm text-gray-600">
                  Prezzo medio: {formatCurrency(
                    filteredResults.reduce((sum, land) => sum + land.price, 0) / filteredResults.length
                  )}
                </p>
              </div>
              
              {/* Controlli vista */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedView('cards')}
                  className={`p-2 rounded ${selectedView === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <BuildingIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedView('list')}
                  className={`p-2 rounded ${selectedView === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`p-2 rounded ${showMap ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <MapIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mappa (placeholder) */}
            {showMap && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Mappa interattiva in sviluppo</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risultati in card */}
            {selectedView === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((land) => (
                  <LandCard
                    key={land.id}
                    land={land}
                    isFavorite={favorites.has(land.id)}
                    onToggleFavorite={toggleFavorite}
                    onCreateFeasibility={handleCreateFeasibilityProject}
                    onViewDetails={(url) => window.open(url, '_blank')}
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAIScoreColor(land.aiScore)}`}>
                            AI Score: {land.aiScore}/100
                          </span>
                          {land.analysis?.riskAssessment && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(land.analysis.riskAssessment)}`}>
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
                            <span className="ml-1 font-medium">{formatCurrency(Math.round(land.price / land.area))}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">ROI:</span>
                            <span className="ml-1 font-medium">
                              {land.analysis?.estimatedROI ? `${land.analysis.estimatedROI}%` : 'N/A'}
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
                          <StarIcon className="h-5 w-5" />
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
          searchTime={searchProgress.phase === 'complete' ? 2.3 : undefined}
          resultsCount={filteredResults.length}
          cacheHit={false} // TODO: implementare tracking cache hit
          servicesStatus={servicesStatus}
        />

        {/* Notifiche Email */}
        {emailError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Configurazione Email Richiesta
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Per ricevere i risultati via email, configura Resend:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Vai su <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">https://resend.com</a></li>
                    <li>Crea un account e ottieni l'API key</li>
                    <li>Aggiungi <code className="bg-yellow-100 px-1 rounded">RESEND_API_KEY</code> nelle variabili ambiente</li>
                    <li>Verifica il dominio o usa <code className="bg-yellow-100 px-1 rounded">onboarding@resend.dev</code></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Storico ricerche */}
        {searchHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ricerche Recenti</h3>
            <div className="space-y-3">
              {searchHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{entry.criteria.location}</p>
                    <p className="text-sm text-gray-600">
                      {entry.resultsCount} risultati • {entry.date instanceof Date ? entry.date.toLocaleDateString('it-IT') : 'Data non disponibile'}
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
      </div>
    </DashboardLayout>
  );
}
