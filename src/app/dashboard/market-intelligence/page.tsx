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

import { useLanguage } from '@/contexts/LanguageContext';
import { emailService, EmailConfig } from '@/lib/emailService';
import { LandSearchCriteria, RealLandScrapingResult } from '@/types/land';

// Gestione Team spostata nelle Impostazioni

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
    propertyTypes: ['residenziale'],
    hasPermits: false,
    minAIScore: 70,
    riskLevel: 'all',
    maxDistance: 50,
  });

  // Stati per UI
  const [showMap, setShowMap] = useState(false);
  const [selectedView, setSelectedView] = useState<'cards' | 'list' | 'map'>('cards');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);

  // Stati per ricerca automatica programmata
  const [showSearchScheduler, setShowSearchScheduler] = useState(false);
  const [scheduledSearches, setScheduledSearches] = useState<
    Array<{
      id: string;
      name: string;
      criteria: LandSearchCriteria;
      email: string;
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      time: string;
      isActive: boolean;
      lastRun?: Date;
      nextRun?: Date;
    }>
  >([]);

  // Stati per servizi
  const [servicesStatus, setServicesStatus] = useState<{
    email: boolean;
    webScraping: boolean;
    ai: boolean;
  } | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);

  // Stati per collaborazione team
  const [showTeamCollaboration, setShowTeamCollaboration] = useState(false);

  // Gestione Team spostata nelle Impostazioni

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
    loadScheduledSearches();
  }, []);

  // Gestione stato connessione internet
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connessione internet ripristinata');
      setIsOnline(true);
      toast('Connessione internet ripristinata!', { icon: '✅' });
      // Riprova a verificare i servizi
      setTimeout(() => {
        verifyServices();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('❌ Connessione internet persa');
      setIsOnline(false);
      toast('Connessione internet persa. Verifica la tua connessione.', { icon: '❌' });
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

  // Gestione Team spostata nelle Impostazioni

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
              Pragma: 'no-cache',
            },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Health check riuscito:', data);

            setServicesStatus({
              email: data.services?.email === 'configured' || false,
              webScraping: data.services?.webScraping === 'operational' || false,
              ai: data.services?.ai === 'configured' || false,
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
          } else if (
            error.message.includes('ERR_NETWORK_CHANGED') ||
            error.message.includes('ERR_INTERNET_DISCONNECTED') ||
            error.message.includes('Failed to fetch')
          ) {
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
        ai: false,
      });

      // Mostra errore all'utente
      toast('Problemi di connessione. Verifica la tua connessione internet e riprova.', {
        icon: '❌',
      });
    } catch (error) {
      console.error('❌ Errore critico verifica servizi:', error);
      setServicesStatus({
        email: false,
        webScraping: false,
        ai: false,
      });
    }
  };

  const loadEmailConfig = async () => {
    try {
      const config = await emailService.getEmailConfig(email);
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
            date: new Date(entry.date),
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

  const loadScheduledSearches = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('landScrapingScheduled');
      if (saved) {
        const searches = JSON.parse(saved);
        // Converti le date da stringhe a oggetti Date
        const searchesWithDates = searches.map((search: any) => ({
          ...search,
          lastRun: search.lastRun ? new Date(search.lastRun) : undefined,
          nextRun: search.nextRun ? new Date(search.nextRun) : undefined,
        }));
        setScheduledSearches(searchesWithDates);
      }
    }
  };

  const saveScheduledSearches = (searches: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landScrapingScheduled', JSON.stringify(searches));
    }
  };

  const addScheduledSearch = (scheduleData: {
    name: string;
    criteria: LandSearchCriteria;
    email: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    time: string;
  }) => {
    const newSearch = {
      ...scheduleData,
      id: Date.now().toString(),
      isActive: true,
      lastRun: undefined,
      nextRun: calculateNextRun(scheduleData.frequency, scheduleData.time),
    };

    const updatedSearches = [...scheduledSearches, newSearch];
    setScheduledSearches(updatedSearches as any);
    saveScheduledSearches(updatedSearches);
    toast(`Ricerca programmata "${scheduleData.name}" aggiunta con successo!`, { icon: '✅' });
  };

  const calculateNextRun = (frequency: string, time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const nextRun = new Date(now);
    nextRun.setHours(parseInt(hours as any), parseInt(minutes as any), 0, 0);

    // Se l'orario di oggi è già passato, calcola per il prossimo periodo
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
        default:
          nextRun.setDate(nextRun.getDate() + 1);
      }
    }

    return nextRun;
  };

  const toggleScheduledSearch = (id: string) => {
    const updatedSearches = scheduledSearches.map(search =>
      search.id === id ? { ...search, isActive: !search.isActive } : search
    );
    setScheduledSearches(updatedSearches);
    saveScheduledSearches(updatedSearches);
    toast('Stato ricerca programmata aggiornato!', { icon: '✅' });
  };

  const deleteScheduledSearch = (id: string) => {
    const updatedSearches = scheduledSearches.filter(search => search.id !== id);
    setScheduledSearches(updatedSearches);
    saveScheduledSearches(updatedSearches);
    toast('Ricerca programmata eliminata!', { icon: '✅' });
  };

  // Gestione Team spostata nelle Impostazioni

  const saveFavorites = (newFavorites: Set<string>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landScrapingFavorites', JSON.stringify(Array.from(newFavorites)));
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
    toast(newFavorites.has(landId) ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti', {
      icon: '✅',
    });
  };

  const applyFilters = useCallback(() => {
    if (!searchResults?.lands) return;

    let filtered = [...searchResults.lands];

    // Filtro prezzo
    filtered = filtered.filter(
      land => land.price >= filters.priceRange[0] && land.price <= filters.priceRange[1]
    );

    // Filtro area
    filtered = filtered.filter(
      land => land.area >= filters.areaRange[0] && land.area <= filters.areaRange[1]
    );

    // Filtro tipologia
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter(land =>
        filters.propertyTypes.some(type =>
          land.features.some(feature => feature.toLowerCase().includes(type.toLowerCase()))
        )
      );
    }

    // Filtro permessi
    if (filters.hasPermits) {
      filtered = filtered.filter(land =>
        land.features.some(
          feature =>
            feature.toLowerCase().includes('permessi') ||
            feature.toLowerCase().includes('edificabile')
        )
      );
    }

    // Filtro AI Score
    filtered = filtered.filter(land => (land.aiScore || 0) >= filters.minAIScore);

    // Filtro rischio
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(land => {
        const risk = (land as any).analysis?.riskAssessment?.toLowerCase() || 'medium';
        return risk.includes(filters.riskLevel);
      });
    }

    setFilteredResults(filtered);
  }, [filters, searchResults]);

  const handleSearch = async (criteria?: LandSearchCriteria, searchEmail?: string) => {
    const searchCriteriaToUse = criteria || searchCriteria;
    const emailToUse = searchEmail || email;

    if (!emailToUse.trim()) {
      toast('Inserisci un indirizzo email per ricevere i risultati', { icon: '⚠️' });
      return;
    }

    if (!searchCriteriaToUse.location.trim()) {
      toast('Inserisci una località per la ricerca', { icon: '⚠️' });
      return;
    }

    setSearchProgress({
      phase: 'searching',
      currentSource: '',
      sourcesCompleted: [],
      sourcesTotal: ['immobiliare.it', 'borsinoimmobiliare.it'],
      progress: 0,
      message: 'Inizializzazione ricerca...',
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

          if (newProgress > 15 && newSourcesCompleted.length === 0) {
            newSourcesCompleted = ['immobiliare.it'];
            newCurrentSource = 'borsinoimmobiliare.it';
          } else if (newProgress > 50 && newSourcesCompleted.length === 1) {
            newSourcesCompleted = ['immobiliare.it', 'borsinoimmobiliare.it'];
            newCurrentSource = 'completato';
          } else {
            newSourcesCompleted = ['immobiliare.it', 'borsinoimmobiliare.it'];
            newCurrentSource = 'completato';
          }

          return {
            ...prev,
            phase: newPhase,
            progress: newProgress,
            message: newMessage,
            currentSource: newCurrentSource,
            sourcesCompleted: newSourcesCompleted,
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
              Pragma: 'no-cache',
            },
            signal: controller.signal,
            body: JSON.stringify({
              location: searchCriteriaToUse.location,
              criteria: {
                minPrice: searchCriteriaToUse.minPrice,
                maxPrice: searchCriteriaToUse.maxPrice,
                minArea: searchCriteriaToUse.minArea,
                maxArea: searchCriteriaToUse.maxArea,
                propertyType: searchCriteriaToUse.propertyType,
              },
              aiAnalysis: true,
              email: emailToUse,
            }),
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
            summary: finalResults.summary,
          });

          setSearchResults(finalResults);

          // Applica filtri ai nuovi risultati
          setTimeout(() => {
            if (finalResults.lands) {
              const filtered = [...finalResults.lands];
              setFilteredResults(filtered);
              console.log('✅ Filtri applicati:', filtered.length, 'risultati');
            }
          }, 100);

          setSearchProgress({
            phase: 'complete',
            currentSource: '',
            sourcesCompleted: ['immobiliare.it', 'borsinoimmobiliare.it'],
            sourcesTotal: ['immobiliare.it', 'borsinoimmobiliare.it'],
            progress: 100,
            message: 'Ricerca completata!',
          });

          // Salva nella cronologia
          const historyEntry = {
            id: Date.now().toString(),
            criteria: searchCriteriaToUse,
            email: emailToUse,
            date: new Date(),
            resultsCount: results.data?.lands?.length || 0,
            emailSent: results.data?.emailSent || false,
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
            toast(`⚠️ ${emailError}`, { icon: '⚠️' });
            toast(
              `✅ Trovati ${landsCount} terreni! Email non inviata - configura RESEND_API_KEY`,
              { icon: '✅' }
            );
          } else {
            setEmailError(null);
            if (emailSent) {
              toast(`✅ Trovati ${landsCount} terreni! Email inviata con successo.`, {
                icon: '✅',
              });
            } else {
              toast(`✅ Trovati ${landsCount} terreni!`, { icon: '✅' });
            }
          }
          return; // Exit the retry loop on success
        } catch (error: any) {
          searchLastError = error;
          searchAttempts++;

          if (error.name === 'AbortError') {
            console.warn(`⏰ Timeout tentativo ricerca ${searchAttempts}/${maxSearchAttempts}`);
          } else if (
            error.message.includes('ERR_NETWORK_CHANGED') ||
            error.message.includes('ERR_INTERNET_DISCONNECTED') ||
            error.message.includes('Failed to fetch')
          ) {
            console.warn(
              `🌐 Errore di rete tentativo ricerca ${searchAttempts}/${maxSearchAttempts}:`,
              error.message
            );
          } else {
            console.error(
              `❌ Errore tentativo ricerca ${searchAttempts}/${maxSearchAttempts}:`,
              error
            );
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
        sourcesTotal: ['immobiliare.it', 'borsinoimmobiliare.it'],
        progress: 0,
        message: `Errore: ${searchLastError instanceof Error ? searchLastError.message : 'Errore sconosciuto'}`,
      });

      // Messaggio di errore più dettagliato
      const errorMessage =
        searchLastError instanceof Error
          ? `❌ Errore: ${searchLastError.message}`
          : '❌ Errore durante la ricerca. Riprova.';
      toast(errorMessage, { icon: '❌' });
    } catch (error) {
      console.error('❌ Errore ricerca:', error);

      // Log dettagliato per debugging
      if (error instanceof Error) {
        console.error('Dettagli errore:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }

      setSearchProgress({
        phase: 'error',
        currentSource: '',
        sourcesCompleted: [],
        sourcesTotal: ['immobiliare.it', 'borsinoimmobiliare.it'],
        progress: 0,
        message: `Errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
      });

      // Messaggio di errore più dettagliato
      const errorMessage =
        error instanceof Error
          ? `❌ Errore: ${error.message}`
          : '❌ Errore durante la ricerca. Riprova.';
      toast(errorMessage, { icon: '❌' });
    }
  };

  const handleCreateFeasibilityProject = async (land: any) => {
    try {
      // Funzionalità temporaneamente disabilitata per evitare errori Firebase
      toast('✅ Funzionalità progetto di fattibilità temporaneamente non disponibile', {
        icon: '✅',
      });
      console.log('📋 Progetto di fattibilità richiesto per:', land.title);
    } catch (error) {
      console.error('❌ Errore creazione progetto:', error);
      toast('❌ Funzionalità non disponibile al momento', { icon: '❌' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    if (filters.priceRange?.[0] > 0 || filters.priceRange?.[1] > 0) count++;
    if (filters.areaRange?.[0] > 0 || filters.areaRange?.[1] > 0) count++;
    if (filters.propertyTypes?.length !== 1 || filters.propertyTypes?.[0] !== 'residenziale')
      count++;
    if (filters.hasPermits) count++;
    if (filters.minAIScore > 70) count++;
    if (filters.riskLevel !== 'all') count++;
    return count;
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, 0], // 0 = nessun limite
      areaRange: [0, 0], // 0 = nessun limite
      propertyTypes: ['residenziale'],
      hasPermits: false,
      minAIScore: 70,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SearchIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Market Intelligence</h1>
                  <p className="text-sm text-gray-500">Scopri automaticamente le migliori opportunità di terreni</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.open('/dashboard/feedback', '_blank')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Invia Feedback"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DASHBOARD
                </h3>
                <Link
                  href="/dashboard/unified"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Overview
                </Link>
              </div>

              {/* Discovery */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DISCOVERY
                </h3>
                <button
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-100 text-blue-700"
                >
                  <SearchIcon className="w-4 h-4 mr-3" />
                  Market Intelligence
                </button>
                <Link
                  href="/dashboard/feasibility-analysis"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUpIcon className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  Design Center
                </Link>
              </div>

              {/* Planning & Compliance */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PLANNING/COMPLIANCE
                </h3>
                <Link
                  href="/dashboard/business-plan"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Business Plan
                </Link>
                <Link
                  href="/dashboard/permits-compliance"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </Link>
                <Link
                  href="/dashboard/project-timeline"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <CalendarIcon className="w-4 h-4 mr-3" />
                  Project Timeline AI
                </Link>
              </div>

              {/* Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PROGETTI
                </h3>
                <Link
                  href="/dashboard/progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BuildingIcon className="w-4 h-4 mr-3" />
                  Progetti
                </Link>
                <Link
                  href="/dashboard/progetti/nuovo"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <PlusIcon className="w-4 h-4 mr-3" />
                  Nuovo Progetto
                </Link>
                <Link
                  href="/dashboard/mappa-progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Mappa Progetti
                </Link>
              </div>

              {/* Gestione Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GESTIONE PROGETTI
                </h3>
                <Link
                  href="/dashboard/project-management"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BuildingIcon className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </Link>
                <Link
                  href="/dashboard/project-management/documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Documenti
                </Link>
                <Link
                  href="/dashboard/project-management/meetings"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <CalendarIcon className="w-4 h-4 mr-3" />
                  Riunioni
                </Link>
              </div>

              {/* Marketing/Sales */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  MARKETING/SALES
                </h3>
                <Link
                  href="/dashboard/marketing"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUpIcon className="w-4 h-4 mr-3" />
                  Marketing
                </Link>
                <Link
                  href="/dashboard/marketing/campaigns"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Campagne
                </Link>
                <Link
                  href="/dashboard/marketing/materials"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Materiali
                </Link>
              </div>

              {/* Construction/EPC */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CONSTRUCTION/EPC
                </h3>
                <Link
                  href="/dashboard/epc"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BuildingIcon className="w-4 h-4 mr-3" />
                  EPC
                </Link>
                <Link
                  href="/dashboard/epc/construction-site"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BuildingIcon className="w-4 h-4 mr-3" />
                  Construction Site
                </Link>
                <Link
                  href="/dashboard/epc/technical-documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Technical Documents
                </Link>
                <Link
                  href="/dashboard/epc/permits"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permits
                </Link>
              </div>

              {/* AI Assistant */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI ASSISTANT
                </h3>
                <Link
                  href="/dashboard/unified"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Bot className="w-4 h-4 mr-3" />
                  Urbanova OS
                </Link>
              </div>

              {/* Feedback */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SUPPORTO
                </h3>
                <Link
                  href="/dashboard/feedback"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Feedback
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
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

              {/* Gestione Avanzata Team spostata nelle Impostazioni */}
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

              {/* Gestione Team spostata nelle Impostazioni */}
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
                <div
                  className={`w-2 h-2 rounded-full ${servicesStatus.ai ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="text-gray-600">{t('ai', 'aiLandScraping')}</span>
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
          sourcesCompleted={searchProgress.sourcesCompleted}
          sourcesTotal={searchProgress.sourcesTotal}
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

                  setSearchCriteria(prev => {
                    const newMinPrice = value;
                    const currentMaxPrice = prev.maxPrice || 0;

                    // Se Prezzo Min supera Prezzo Max, aggiorna Prezzo Max automaticamente
                    if (newMinPrice > currentMaxPrice) {
                      const newMaxPrice = newMinPrice + 100000;
                      return {
                        ...prev,
                        minPrice: newMinPrice,
                        maxPrice: newMaxPrice,
                      };
                    }

                    return { ...prev, minPrice: newMinPrice };
                  });
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

                  setSearchCriteria(prev => {
                    const newMaxPrice = value;
                    const currentMinPrice = prev.minPrice || 0;

                    // Se Prezzo Max è minore di Prezzo Min, aggiorna Prezzo Min automaticamente
                    if (newMaxPrice > 0 && newMaxPrice <= currentMinPrice) {
                      const newMinPrice = Math.max(0, newMaxPrice - 100000);
                      return {
                        ...prev,
                        minPrice: newMinPrice,
                        maxPrice: newMaxPrice,
                      };
                    }

                    return { ...prev, maxPrice: newMaxPrice };
                  });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (searchCriteria.maxPrice || 0) > 0 &&
                  (searchCriteria.maxPrice || 0) <= (searchCriteria.minPrice || 0)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Nessun limite"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite massimo
              </p>
              {(searchCriteria.maxPrice || 0) > 0 &&
                (searchCriteria.maxPrice || 0) <= (searchCriteria.minPrice || 0) && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ Prezzo Max deve essere maggiore di Prezzo Min
                  </p>
                )}
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

                  setSearchCriteria(prev => {
                    const newMinArea = value;
                    const currentMaxArea = prev.maxArea || 0;

                    // Se Area Min supera Area Max, aggiorna Area Max automaticamente
                    if (newMinArea > currentMaxArea) {
                      const newMaxArea = newMinArea + 1000;
                      return {
                        ...prev,
                        minArea: newMinArea,
                        maxArea: newMaxArea,
                      };
                    }

                    return { ...prev, minArea: newMinArea };
                  });
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

                  setSearchCriteria(prev => {
                    const newMaxArea = value;
                    const currentMinArea = prev.minArea || 0;

                    // Se Area Max è minore di Area Min, aggiorna Area Min automaticamente
                    if (newMaxArea > 0 && newMaxArea <= currentMinArea) {
                      const newMinArea = Math.max(0, newMaxArea - 1000);
                      return {
                        ...prev,
                        minArea: newMinArea,
                        maxArea: newMaxArea,
                      };
                    }

                    return { ...prev, maxArea: newMaxArea };
                  });
                }}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  (searchCriteria.maxArea || 0) > 0 &&
                  (searchCriteria.maxArea || 0) <= (searchCriteria.minArea || 0)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Nessun limite"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lascia vuoto o inserisci 0 per nessun limite massimo
              </p>
              {(searchCriteria.maxArea || 0) > 0 &&
                (searchCriteria.maxArea || 0) <= (searchCriteria.minArea || 0) && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ Area Max deve essere maggiore di Area Min
                  </p>
                )}
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
          searchTime={searchProgress.phase === 'complete' ? 2.3 : undefined}
          resultsCount={filteredResults.length}
          cacheHit={false} // TODO: implementare tracking cache hit
          servicesStatus={servicesStatus || undefined}
          {...({} as any)}
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
              {scheduledSearches.slice(0, 3).map(search => (
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
              {searchHistory.slice(0, 5).map(entry => (
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
        </div>
      </div>
    </div>
  );
}
