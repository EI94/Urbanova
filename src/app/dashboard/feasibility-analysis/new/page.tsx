'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import {
  CalculatorIcon,
  BuildingIcon,
  EuroIcon,
  CalendarIcon,
  LocationIcon,
  ArrowLeftIcon,
  TrendingUpIcon,
  SearchIcon,
  AlertTriangleIcon,
} from '@/components/icons';

// Import QuestionMarkIcon separatamente per evitare conflitti
const QuestionMarkIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeasibilityReportGenerator from '@/components/ui/FeasibilityReportGenerator';
import ProjectReminderModal from '@/components/ui/ProjectReminderModal';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { firebaseDebugService } from '@/lib/firebaseDebugService';
import { projectManagerService } from '@/lib/projectManagerService';
import { useAuth } from '@/contexts/AuthContext';

export default function NewFeasibilityProjectPage() {
  const router = useRouter();
  
  // Protezione per useAuth
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [NewFeasibilityProjectPage] Errore useAuth:', error);
    authContext = { currentUser: null };
  }
  const { currentUser } = authContext;
  const [loading, setLoading] = useState(false);
  const [marketDataLoading, setMarketDataLoading] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [insuranceFlags, setInsuranceFlags] = useState({
    constructionInsurance: false,
    financingInsurance: false,
  });
  const [financingData, setFinancingData] = useState({
    loanAmount: 0,
    interestRate: 3.5,
    loanTermYears: 15,
  });

  // Stato per la percentuale di acconto per il calcolo Assicurazione sul Finanziamento (Legge 210)
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20); // Default 20%

  // Nuovo stato per gestire i costi di costruzione
  const [constructionCostMode, setConstructionCostMode] = useState<'lumpSumTotal' | 'lumpSumPerSqm' | 'detailed'>('detailed');
  const [constructionCostsPerSqm, setConstructionCostsPerSqm] = useState({
    excavation: 0,
    structures: 0,
    systems: 0,
    finishes: 0,
  });
  const [lumpSumCosts, setLumpSumCosts] = useState({
    total: 0,
    perSqm: 0,
  });

  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [recalculateTimeout, setRecalculateTimeout] = useState<NodeJS.Timeout | null>(null);

  // Helper function per gestire i timeout in modo sicuro
  const safeSetTimeout = (callback: () => void, delay: number) => {
    // Pulisce il timeout precedente se esiste
    if (recalculateTimeout) {
      clearTimeout(recalculateTimeout);
    }
    
    // Imposta il nuovo timeout
    const timeout = setTimeout(callback, delay);
    setRecalculateTimeout(timeout);
    return timeout;
  };

  const [project, setProject] = useState<Partial<FeasibilityProject>>({
    name: '',
    address: '',
    status: 'PIANIFICAZIONE',
    startDate: new Date(),
    constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    duration: 18,
    targetMargin: 30,
    totalArea: 0, // Nuovo campo per i mq totali
    costs: {
      land: {
        purchasePrice: 0,
        purchaseTaxes: 0,
        intermediationFees: 0,
        subtotal: 0,
      },
      construction: {
        excavation: 0,
        structures: 0,
        systems: 0,
        finishes: 0,
        subtotal: 0,
      },
      externalWorks: 0,
      concessionFees: 0,
      design: 0,
      bankCharges: 0,
      exchange: 0,
      insurance: 0,
      total: 0,
    },
    revenues: {
      units: 0,
      averageArea: 0,
      pricePerSqm: 0,
      revenuePerUnit: 0,
      totalSales: 0,
      otherRevenues: 0,
      total: 0,
    },
    results: {
      profit: 0,
      margin: 0,
      roi: 0,
      paybackPeriod: 0,
    },
    isTargetAchieved: false,
    createdBy: currentUser?.uid || 'anonymous',
    notes: '',
  });

  const [calculatedCosts, setCalculatedCosts] = useState({
    land: {
      purchasePrice: 0,
      purchaseTaxes: 0,
      intermediationFees: 0,
      subtotal: 0,
    },
    construction: {
      excavation: 0,
      structures: 0,
      systems: 0,
      finishes: 0,
      subtotal: 0,
    },
    externalWorks: 0,
    concessionFees: 0,
    design: 0,
    bankCharges: 0,
    exchange: 0,
    insurance: 0,
    total: 0,
  });

  const [calculatedRevenues, setCalculatedRevenues] = useState({
    units: 0,
    averageArea: 0,
    pricePerSqm: 0,
    revenuePerUnit: 0,
    totalSales: 0,
    otherRevenues: 0,
    total: 0,
  });

  const [calculatedResults, setCalculatedResults] = useState({
    profit: 0,
    margin: 0,
    roi: 0,
    paybackPeriod: 0,
  });

  // Ricalcola automaticamente quando cambiano i dati del progetto
  useEffect(() => {
    if (project && Object.keys(project).length > 0) {
      recalculateAll();
    }

    // Cleanup function
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [project, calculatedCosts, calculatedRevenues, calculatedResults]);

  // Salvataggio automatico periodico
  useEffect(() => {
    if (project.name && project.address && !loading) {
      // Salva automaticamente ogni 30 secondi se ci sono modifiche
      const timeout = setTimeout(() => {
        autoSaveProject();
      }, 30000);

      setAutoSaveTimeout(timeout);

      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
    
    return undefined;
  }, [project.name, project.address, calculatedCosts, calculatedRevenues, calculatedResults, loading]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Pulisce timeout solo al unmount del componente
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        setAutoSaveTimeout(null);
      }
      if (recalculateTimeout) {
        clearTimeout(recalculateTimeout);
        setRecalculateTimeout(null);
      }
    };
  }, []);

  // Aggiorna createdBy quando l'utente cambia
  useEffect(() => {
    if (currentUser?.uid) {
      setProject(prev => ({
        ...prev,
        createdBy: currentUser.uid
      }));
    }
  }, [currentUser]);

  // Gestisce la modalità edit
  useEffect(() => {
    const checkEditMode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit');

      if (editId) {
        setIsEditMode(true);
        setEditProjectId(editId);
        setSavedProjectId(editId); // FORZO L'IMPOSTAZIONE PER FAR FUNZIONARE I BOTTONI

        try {
          // Carica il progetto esistente
          const existingProject = await feasibilityService.getProjectById(editId);
          if (existingProject) {
            setProject(existingProject);
            setSavedProjectId(editId); // RICONFERMO L'ID
            toast('✅ Progetto caricato per la modifica');
          }
        } catch (error) {
          console.error('❌ Errore caricamento progetto per edit:', error);
          toast('❌ Errore nel caricamento del progetto');
        }
      }
    };

    checkEditMode();
  }, []);

  // Funzione per pulire input numerico
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Rimuove tutto tranne numeri e punto decimale
    const cleanValue = value.replace(/[^0-9.]/g, '');
    return cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setProject(prev => {
      const updated = { ...prev };

      if (section === 'basic') {
        (updated as any)[field] = value;
      } else if (section === 'costs') {
        if (!updated.costs) updated.costs = {} as any;
        if (field.includes('.')) {
          const [subSection, subField] = field.split('.');
          if (subSection && subField) {
            if (!(updated.costs as any)[subSection]) (updated.costs as any)[subSection] = {};
            (updated.costs as any)[subSection][subField] = value;
          }
        } else {
          (updated.costs as any)[field] = value;
        }
      } else if (section === 'revenues') {
        if (!updated.revenues) updated.revenues = {} as any;
        (updated.revenues as any)[field] = value;
      }

      return updated;
    });

    // Ricalcola automaticamente
    safeSetTimeout(() => recalculateAll(), 100);
  };

  const handleFinancingChange = (field: string, value: any) => {
    setFinancingData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Ricalcola automaticamente per aggiornare assicurazioni
    safeSetTimeout(() => recalculateAll(), 100);
  };

  // Nuove funzioni per gestire i costi di costruzione
  const handleConstructionCostModeChange = (mode: 'lumpSumTotal' | 'lumpSumPerSqm' | 'detailed') => {
    setConstructionCostMode(mode);

    // Se si passa da modalità dettagliata a a corpo, calcola i totali
    if (mode === 'lumpSumTotal' && project.totalArea && project.totalArea > 0) {
      const totalCosts = {
        excavation: project.costs?.construction?.excavation || 0,
        structures: project.costs?.construction?.structures || 0,
        systems: project.costs?.construction?.systems || 0,
        finishes: project.costs?.construction?.finishes || 0,
      };
      const total = totalCosts.excavation + totalCosts.structures + totalCosts.systems + totalCosts.finishes;
      setLumpSumCosts(prev => ({ ...prev, total }));
    } else if (mode === 'lumpSumPerSqm' && project.totalArea && project.totalArea > 0) {
      const totalCosts = {
        excavation: project.costs?.construction?.excavation || 0,
        structures: project.costs?.construction?.structures || 0,
        systems: project.costs?.construction?.systems || 0,
        finishes: project.costs?.construction?.finishes || 0,
      };
      const total = totalCosts.excavation + totalCosts.structures + totalCosts.systems + totalCosts.finishes;
      const perSqm = total / project.totalArea;
      setLumpSumCosts(prev => ({ ...prev, perSqm }));
    }

    // Ricalcola automaticamente
    safeSetTimeout(() => recalculateAll(), 100);
  };

  // Funzioni per gestire i costi a corpo
  const handleLumpSumCostChange = (type: 'total' | 'perSqm', value: string) => {
    const numValue = parseFloat(value) || 0;
    setLumpSumCosts(prev => ({ ...prev, [type]: numValue }));

    // Aggiorna i costi di costruzione nel progetto
    if (type === 'total') {
      setProject(prev => ({
        ...prev,
        costs: {
          ...prev.costs,
          construction: {
            ...prev.costs?.construction,
            excavation: numValue * 0.1, // 10% per scavi
            structures: numValue * 0.5,  // 50% per strutture
            systems: numValue * 0.25,    // 25% per impianti
            finishes: numValue * 0.15,   // 15% per finiture
          },
        },
      } as Partial<FeasibilityProject>));
    } else if (type === 'perSqm' && project.totalArea && project.totalArea > 0) {
      const total = numValue * project.totalArea;
      setProject(prev => ({
        ...prev,
        costs: {
          ...prev.costs,
          construction: {
            ...prev.costs?.construction,
            excavation: total * 0.1,
            structures: total * 0.5,
            systems: total * 0.25,
            finishes: total * 0.15,
          },
        },
      } as Partial<FeasibilityProject>));
    }

    // Ricalcola automaticamente
    safeSetTimeout(() => recalculateAll(), 100);
  };

  const handleConstructionCostPerSqmChange = (field: string, value: number) => {
    setConstructionCostsPerSqm(prev => ({
      ...prev,
      [field]: value,
    }));

    // Calcola automaticamente il totale se i mq sono definiti
    if (project.totalArea && project.totalArea > 0) {
      const totalValue = value * project.totalArea;

      setProject(prev => ({
        ...prev,
        costs: {
          ...prev.costs,
          construction: {
            ...prev.costs?.construction,
            [field]: totalValue,
          },
        },
      } as Partial<FeasibilityProject>));
    }

    safeSetTimeout(() => recalculateAll(), 100);
  };

  const recalculateAll = () => {
    try {
      // Mappa constructionCostMode ai valori accettati da calculateCosts
      const costMode = constructionCostMode === 'lumpSumPerSqm' ? 'perSqm' : 'total';
      const costs = feasibilityService.calculateCosts(project, costMode);

      // Calcola assicurazioni se i flag sono attivi
      let insuranceCost = 0;
      if (insuranceFlags.constructionInsurance && costs.construction?.subtotal) {
        insuranceCost += costs.construction.subtotal * 0.015; // 1.5% del costo costruzione
      }
      if (insuranceFlags.financingInsurance) {
        // Legge 210: 1% sugli acconti ricevuti dai clienti
        // Calcoliamo l'1% della percentuale di acconto sui ricavi totali
        const revenues = feasibilityService.calculateRevenues(project);
        const downPaymentAmount = (revenues.total * downPaymentPercentage) / 100;
        insuranceCost += downPaymentAmount * 0.01; // 1% degli acconti stimati
      }
      costs.insurance = insuranceCost;

      const revenues = feasibilityService.calculateRevenues(project);
      const results = feasibilityService.calculateResults(
        costs,
        revenues,
        project.targetMargin || 30
      );

      setCalculatedCosts(costs);
      setCalculatedRevenues(revenues);
      setCalculatedResults(results);
    } catch (error) {
      console.error('Errore durante il ricalcolo:', error);
      // In caso di errore, mantieni i valori di default
    }
  };

  // Funzione per ottenere dati di mercato dal borsino immobiliare
  const fetchMarketData = async () => {
    if (!project.address) {
      toast("Inserisci prima l'indirizzo del progetto", { icon: '❌' });
      return;
    }

    setMarketDataLoading(true);
    try {
      const response = await fetch('/api/market-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: project.address,
          projectType: 'RESIDENZIALE',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMarketData(data);

        // Aggiorna automaticamente il prezzo al mq se disponibile
        if (data.suggestedPricePerSqm) {
          handleInputChange('revenues', 'pricePerSqm', data.suggestedPricePerSqm);
          toast(`✅ Prezzo suggerito: ${data.suggestedPricePerSqm}€/m²`, { icon: '✅' });
        }
      } else {
        throw new Error('Errore nel recupero dati di mercato');
      }
    } catch (error) {
      console.error('Errore fetch market data:', error);
              toast('❌ Errore nel recupero dati di mercato', { icon: '❌' });
    } finally {
      setMarketDataLoading(false);
    }
  };

  const autoSaveProject = async () => {
    // Non salvare se mancano i campi obbligatori
    if (!project.name || !project.address) {
      console.log('⚠️ [AUTO SAVE] Salvataggio saltato - campi obbligatori mancanti:', {
        name: project.name,
        address: project.address
      });
      return;
    }

    // Non salvare se è già in corso un salvataggio manuale
    if (loading) {
      console.log('⚠️ [AUTO SAVE] Salvataggio saltato - salvataggio manuale in corso');
      return;
    }

    setAutoSaving(true);
    try {
      console.log('🧠 [AUTO SAVE] Salvataggio automatico progetto fattibilità in corso...');
      console.log('🧠 [AUTO SAVE] Dati progetto:', {
        name: project.name,
        address: project.address,
        totalArea: project.totalArea,
        createdBy: currentUser?.uid || 'anonymous',
        hasCosts: !!calculatedCosts,
        hasRevenues: !!calculatedRevenues,
        hasResults: !!calculatedResults
      });

      const finalProject = {
        ...project,
        costs: calculatedCosts,
        revenues: calculatedRevenues,
        results: calculatedResults,
        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30),
        createdBy: currentUser?.uid || 'anonymous'
      } as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>;

      // Se il progetto è già stato salvato, aggiorna
      if (savedProjectId) {
        console.log('🔄 [AUTO SAVE] Aggiornamento progetto esistente:', savedProjectId);
        await feasibilityService.updateProject(savedProjectId, finalProject);
        setLastSaved(new Date());
        console.log('✅ [AUTO SAVE] Progetto aggiornato automaticamente:', savedProjectId);
      } else {
        console.log('🆕 [AUTO SAVE] Creazione nuovo progetto...');
        // Crea nuovo progetto usando il nuovo endpoint API dedicato
        const response = await fetch('/api/feasibility-projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...finalProject,
            createdBy: currentUser?.uid || 'anonymous'
          }),
        });

        console.log('🔍 [AUTO SAVE] Risposta endpoint:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (response.ok) {
          const result = await response.json();
          console.log('🔍 [AUTO SAVE] Risposta endpoint:', result);
          
          if (result.success && result.projectId) {
            setSavedProjectId(result.projectId);
            setLastSaved(new Date());
            console.log('✅ [AUTO SAVE] Nuovo progetto salvato automaticamente:', result.projectId);
          } else {
            console.error('❌ [AUTO SAVE] Endpoint restituisce success: false o projectId mancante:', result);
            throw new Error('Endpoint non ha restituito projectId valido');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ [AUTO SAVE] Errore HTTP:', response.status, response.statusText, errorText);
          throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
        }
      }

    } catch (error: any) {
      console.error('❌ [AUTO SAVE] Errore salvataggio automatico:', error);
      console.error('❌ [AUTO SAVE] Stack trace:', error.stack);
      // Non mostrare errori per il salvataggio automatico per non disturbare l'utente
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!project.name || !project.address) {
      toast('Compila i campi obbligatori', { icon: '❌' });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 [HANDLE SAVE] Avvio salvataggio progetto fattibilità...');
      console.log('🔄 [HANDLE SAVE] CurrentUser:', {
        uid: currentUser?.uid,
        email: currentUser?.email,
        isAuthenticated: !!currentUser
      });
      console.log('🔄 [HANDLE SAVE] Project data:', {
        name: project.name,
        address: project.address,
        createdBy: project.createdBy,
        totalArea: project.totalArea,
        hasCosts: !!calculatedCosts,
        hasRevenues: !!calculatedRevenues,
        hasResults: !!calculatedResults
      });

      const finalProject = {
        ...project,
        costs: calculatedCosts,
        revenues: calculatedRevenues,
        results: calculatedResults,
        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30),
        // Assicurati che createdBy sia impostato correttamente
        createdBy: currentUser?.uid || project.createdBy || 'anonymous'
      } as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>;

      console.log('📝 [HANDLE SAVE] Dati progetto da salvare:', {
        name: finalProject.name,
        address: finalProject.address,
        createdBy: finalProject.createdBy,
        hasCosts: !!finalProject.costs,
        hasRevenues: !!finalProject.revenues,
        costsTotal: finalProject.costs?.total,
        revenuesTotal: finalProject.revenues?.total,
        resultsMargin: finalProject.results?.margin
      });

      // Usa l'endpoint API dedicato per il salvataggio
      console.log('🔄 [HANDLE SAVE] Salvataggio via API endpoint...');
      
      const response = await fetch('/api/feasibility-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalProject),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.projectId) {
        throw new Error(result.error || 'Errore nel salvataggio del progetto');
      }
      
      const projectId = result.projectId;
      console.log('✅ [HANDLE SAVE] Progetto creato via API:', projectId);

      setSavedProjectId(projectId);
      toast('✅ Progetto creato con successo! Ora puoi generare il report.', { icon: '✅' });
      
      // Attendi un momento per assicurarsi che il salvataggio sia completato
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostra il report generator
      setShowReportGenerator(true);
    } catch (error: any) {
      console.error('❌ [HANDLE SAVE] Errore creazione progetto:', error);
      console.error('❌ [HANDLE SAVE] Stack trace:', error.stack);

      // Messaggio di errore più specifico
      let errorMessage = '❌ Errore nella creazione del progetto';

      if (error.code === 'permission-denied') {
        errorMessage = '❌ Errore permessi: Verifica le regole di sicurezza Firestore';
      } else if (error.code === 'unavailable') {
        errorMessage =
          '❌ Errore connessione: Verifica la connessione internet e lo stato Firebase';
      } else if (error.code === 'unauthenticated') {
        errorMessage = '❌ Errore autenticazione: Effettua nuovamente il login';
      } else if (error.message) {
        errorMessage = `❌ Errore: ${error.message}`;
      }

      toast(errorMessage, { icon: '❌' });
    } finally {
      setLoading(false);
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMarginColor = (margin: number, targetMargin: number) => {
    if (margin >= targetMargin) return 'text-success';
    if (margin >= targetMargin * 0.8) return 'text-warning';
    return 'text-error';
  };

  const calculateMonthlyPayment = () => {
    const P = financingData.loanAmount;
    const r = financingData.interestRate / 100 / 12; // Tasso mensile
    const n = financingData.loanTermYears * 12; // Numero di pagamenti

    if (r === 0) return P / n; // Pagamento rateale se tasso 0
    return (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  };

  const calculateTotalInterest = () => {
    const monthlyPayment = calculateMonthlyPayment();
    const totalPayments = monthlyPayment * financingData.loanTermYears * 12;
    return totalPayments - financingData.loanAmount;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (loading || autoSaving) {
                    toast('⏳ Attendere il completamento del salvataggio...', { icon: '⏳' });
                    return;
                  }
                  // Naviga direttamente alla pagina principale invece di usare router.back()
                  router.push('/dashboard/feasibility-analysis');
                }}
                disabled={loading || autoSaving}
                className="btn btn-ghost btn-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Indietro
              </button>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  🏗️ Nuovo Progetto di Fattibilità
                </h1>
                {autoSaving && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="loading loading-spinner loading-sm"></div>
                    <span>Salvataggio...</span>
                  </div>
                )}
                {lastSaved && !autoSaving && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <span>✅</span>
                    <span>Salvato {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-1">Crea un nuovo studio di fattibilità immobiliare</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={async () => {
                if (!project.name || !project.address) {
                  toast('Compila nome e indirizzo prima di salvare', { icon: '❌' });
                  return;
                }

                setLoading(true);
                try {
                  // Salva il progetto se non è già stato salvato
                  if (!savedProjectId) {
                    const finalProject = {
                      ...project,
                      costs: calculatedCosts,
                      revenues: calculatedRevenues,
                      results: calculatedResults,
                      isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30),
                      createdBy: currentUser?.uid || 'anonymous'
                    } as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>;

                    // Usa l'endpoint API invece del servizio diretto
                    const response = await fetch('/api/feasibility-smart', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        ...finalProject,
                        createdBy: currentUser?.uid || 'anonymous'
                      }),
                    });

                    if (!response.ok) {
                      console.error('❌ [SALVA E ESCI] Errore HTTP:', response.status, response.statusText);
                      throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log('🔍 [SALVA E ESCI] Risposta endpoint:', result);
                    
                    if (!result.success) {
                      console.error('❌ [SALVA E ESCI] Endpoint restituisce success: false:', result.error);
                      throw new Error(result.error || 'Errore nel salvataggio del progetto');
                    }

                    if (!result.projectId) {
                      console.error('❌ [SALVA E ESCI] Endpoint non restituisce projectId');
                      throw new Error('ID progetto non ricevuto dal server');
                    }

                    setSavedProjectId(result.projectId);
                    console.log('✅ [SALVA E ESCI] Progetto salvato con ID:', result.projectId);
                  }

                  toast('✅ Progetto salvato con successo!', { icon: '✅' });
                  
                  // Reindirizza alla pagina analisi di fattibilità
                  router.push('/dashboard/feasibility-analysis');
                } catch (error: any) {
                  console.error('❌ Errore nel salvataggio:', error);
                  toast('❌ Errore nel salvataggio del progetto', { icon: '❌' });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !project.name || !project.address}
              className="btn btn-primary btn-sm"
            >
              {loading ? (
                <>
                  <div className="loading loading-spinner loading-xs mr-2"></div>
                  Salvataggio...
                </>
              ) : (
                '💾 Salva e Esci'
              )}
            </button>
            <button
              onClick={() => setShowReportGenerator(true)}
              disabled={!project.name || !project.address}
              className="btn btn-secondary"
            >
              📊 Genera Report
            </button>
            <button
              onClick={async () => {
                console.log('🔍 [DEBUG] Test salvataggio debug...');
                try {
                  const response = await fetch('/api/feasibility-debug', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      action: 'test-real-save',
                      projectData: {
                        name: project.name || 'Test Debug',
                        address: project.address || 'Via Test Debug 123',
                        status: project.status || 'PIANIFICAZIONE',
                        totalArea: project.totalArea || 100,
                        targetMargin: project.targetMargin || 25,
                        createdBy: currentUser?.uid || 'debug-user',
                        costs: calculatedCosts,
                        revenues: calculatedRevenues,
                        results: calculatedResults,
                        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30),
                        notes: 'Test debug salvataggio'
                      }
                    }),
                  });
                  
                  const result = await response.json();
                  console.log('🔍 [DEBUG] Risultato test:', result);
                  
                  if (result.success && result.result.success) {
                    toast('✅ Test debug salvataggio riuscito!', { icon: '✅' });
                  } else {
                    toast('❌ Test debug salvataggio fallito!', { icon: '❌' });
                  }
                } catch (error) {
                  console.error('❌ [DEBUG] Errore test:', error);
                  toast('❌ Errore test debug!', { icon: '❌' });
                }
              }}
              className="btn btn-outline btn-sm"
              title="Test debug salvataggio"
            >
              🔍 Debug
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dati Base */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingIcon className="h-5 w-5 mr-2 text-blue-600" />
                Dati Base Progetto
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Nome Progetto *</span>
                  </label>
                  <input
                    type="text"
                    value={project.name || ''}
                    onChange={e => handleInputChange('basic', 'name', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Es. Residenza Milano Centro"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Indirizzo *</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={project.address || ''}
                      onChange={e => handleInputChange('basic', 'address', e.target.value)}
                      className="input input-bordered flex-1"
                      placeholder="Es. Via Roma 123, Milano"
                    />
                    <button
                      onClick={fetchMarketData}
                      disabled={marketDataLoading || !project.address}
                      className="btn btn-outline btn-sm"
                      title="Ottieni dati di mercato"
                    >
                      {marketDataLoading ? (
                        <div className="loading loading-spinner loading-xs"></div>
                      ) : (
                        <SearchIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Superficie Totale (mq) *</span>
                  </label>
                  <input
                    type="text"
                    value={project.totalArea || ''}
                    onChange={e => handleInputChange('basic', 'totalArea', handleNumberInput(e))}
                    className="input input-bordered w-full"
                    placeholder="Es. 500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Superficie totale del progetto in metri quadri
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Stato Progetto</span>
                  </label>
                  <select
                    value={project.status || 'PIANIFICAZIONE'}
                    onChange={e => handleInputChange('basic', 'status', e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="PIANIFICAZIONE">Pianificazione</option>
                    <option value="IN_CORSO">In Corso</option>
                    <option value="COMPLETATO">Completato</option>
                    <option value="SOSPESO">Sospeso</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Durata (mesi)</span>
                  </label>
                  <select
                    value={project.duration || 18}
                    onChange={e => handleInputChange('basic', 'duration', parseInt(e.target.value))}
                    className="select select-bordered w-full"
                  >
                    <option value={12}>12 mesi</option>
                    <option value={18}>18 mesi</option>
                    <option value={24}>24 mesi</option>
                    <option value={30}>30 mesi</option>
                    <option value={36}>36 mesi</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Marginalità Target (%)</span>
                  </label>
                  <input
                    type="text"
                    value={project.targetMargin || ''}
                    onChange={e => handleInputChange('basic', 'targetMargin', handleNumberInput(e))}
                    className="input input-bordered w-full"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Dati di Mercato */}
              {marketData && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                    <TrendingUpIcon className="h-4 w-4 mr-2" />
                    Dati di Mercato - {marketData.location}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-blue-600 font-medium">Prezzo Medio</div>
                      <div className="text-lg font-bold">
                        {formatCurrency(marketData.averagePrice)}/m²
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Variazione</div>
                      <div
                        className={`text-lg font-bold ${marketData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {marketData.priceChange >= 0 ? '+' : ''}
                        {marketData.priceChange}%
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Tempo Vendita</div>
                      <div className="text-lg font-bold">{marketData.sellingTime} mesi</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Domanda</div>
                      <div className="text-lg font-bold">{marketData.demandLevel}</div>
                    </div>
                  </div>

                  {marketData.similarProjects && marketData.similarProjects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-blue-900 mb-2">Progetti Simili nella Zona</h4>
                      <div className="space-y-2">
                        {marketData.similarProjects
                          .slice(0, 3)
                          .map((project: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-white rounded"
                            >
                              <div>
                                <div className="font-medium">{project.title}</div>
                                <div className="text-xs text-gray-600">{project.address}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">
                                  {formatCurrency(project.pricePerSqm)}/m²
                                </div>
                                <div className="text-xs text-gray-600">{project.area}m²</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Costi */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <EuroIcon className="h-5 w-5 mr-2 text-red-600" />
                Costi
              </h2>

              <div className="space-y-6">
                {/* Costi Terreno */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">1. Terreno</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Prezzo Acquisto</span>
                      </label>
                      <input
                        type="text"
                        value={project.costs?.land?.purchasePrice || ''}
                        onChange={e =>
                          handleInputChange('costs', 'land.purchasePrice', handleNumberInput(e))
                        }
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Imposte</span>
                      </label>
                      <input
                        type="text"
                        value={project.costs?.land?.purchaseTaxes || ''}
                        onChange={e =>
                          handleInputChange('costs', 'land.purchaseTaxes', handleNumberInput(e))
                        }
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Commissioni</span>
                      </label>
                      <input
                        type="text"
                        value={project.costs?.land?.intermediationFees || ''}
                        onChange={e =>
                          handleInputChange(
                            'costs',
                            'land.intermediationFees',
                            handleNumberInput(e)
                          )
                        }
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-500">Subtotale: </span>
                    <span className="font-medium">
                      {formatCurrency(calculatedCosts.land.subtotal)}
                    </span>
                  </div>
                </div>

                {/* Costi Costruzione */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">2. Costruzione</h3>

                    {/* Toggle per modalità costi */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Modalità:</span>
                      <div className="relative group">
                        <QuestionMarkIcon className="h-4 w-4 text-gray-400 hover:text-blue-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          <div className="text-center">
                            <div className="font-semibold mb-1">Modalità Costi Costruzione</div>
                            <div className="text-left space-y-1">
                              <div><strong>A corpo totale:</strong> Prezzo fisso totale</div>
                              <div><strong>A corpo per mq:</strong> Prezzo fisso per mq</div>
                              <div><strong>In dettaglio:</strong> Costi specifici per categoria</div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => handleConstructionCostModeChange('lumpSumTotal')}
                          className={`px-3 py-1 text-sm rounded-md transition-all ${
                            constructionCostMode === 'lumpSumTotal'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          A corpo totale
                        </button>
                        <button
                          onClick={() => handleConstructionCostModeChange('lumpSumPerSqm')}
                          className={`px-3 py-1 text-sm rounded-md transition-all ${
                            constructionCostMode === 'lumpSumPerSqm'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          A corpo per mq
                        </button>
                        <button
                          onClick={() => handleConstructionCostModeChange('detailed')}
                          className={`px-3 py-1 text-sm rounded-md transition-all ${
                            constructionCostMode === 'detailed'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          In dettaglio
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Avviso se mancano i mq per modalità per mq */}
                  {constructionCostMode === 'lumpSumPerSqm' &&
                    (!project.totalArea || project.totalArea <= 0) && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangleIcon className="h-4 w-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">
                            Inserisci la superficie totale nella sezione "Dati Base Progetto" per
                            calcolare automaticamente i costi totali
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Informazioni calcolo per modalità per mq */}
                  {constructionCostMode === 'lumpSumPerSqm' &&
                    project.totalArea &&
                    project.totalArea > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="h-4 w-4 text-blue-600 mr-2">✅</span>
                            <span className="text-sm text-blue-800">
                              Calcolo automatico: {project.totalArea} mq × {formatCurrency(lumpSumCosts.perSqm)}/mq = {formatCurrency(lumpSumCosts.perSqm * project.totalArea)}
                            </span>
                          </div>
                          <div className="text-sm text-blue-600 font-medium">
                            Totale: {formatCurrency(calculatedCosts.construction.subtotal)}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Informazioni per modalità a corpo totale */}
                  {constructionCostMode === 'lumpSumTotal' && lumpSumCosts.total > 0 && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="h-4 w-4 text-green-600 mr-2">💰</span>
                          <span className="text-sm text-green-800">
                            Costo fisso totale: {formatCurrency(lumpSumCosts.total)}
                          </span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Distribuzione automatica per categoria
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campi per modalità a corpo */}
                  {(constructionCostMode === 'lumpSumTotal' || constructionCostMode === 'lumpSumPerSqm') && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {constructionCostMode === 'lumpSumTotal' ? 'Costo Totale a Corpo' : 'Costo per mq a Corpo'}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {constructionCostMode === 'lumpSumTotal' ? 'Importo fisso totale' : 'Importo fisso per mq'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={constructionCostMode === 'lumpSumTotal' ? lumpSumCosts.total || '' : lumpSumCosts.perSqm || ''}
                            onChange={e => handleLumpSumCostChange(
                              constructionCostMode === 'lumpSumTotal' ? 'total' : 'perSqm',
                              handleNumberInput(e).toString()
                            )}
                            className="input input-bordered w-full text-lg font-medium"
                            placeholder={constructionCostMode === 'lumpSumTotal' ? 'Es. 180000' : 'Es. 1800'}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          {constructionCostMode === 'lumpSumTotal' ? '€' : '€/mq'}
                        </div>
                      </div>
                      {constructionCostMode === 'lumpSumPerSqm' && project.totalArea && project.totalArea > 0 && (
                        <div className="mt-2 text-sm text-blue-600">
                          Totale: {formatCurrency(lumpSumCosts.perSqm * project.totalArea)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Campi dettagliati per modalità in dettaglio */}
                  {constructionCostMode === 'detailed' && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-3">
                        💡 Inserisci i costi specifici per ogni categoria di costruzione
                      </div>
                    </div>
                  )}

                  {/* Campi dettagliati - mostrati solo in modalità detailed */}
                  {constructionCostMode === 'detailed' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="label">
                          <span className="label-text">Scavi e Fondazioni</span>
                        </label>
                        <input
                          type="text"
                          value={project.costs?.construction?.excavation || ''}
                          onChange={e =>
                            handleInputChange(
                              'costs',
                              'construction.excavation',
                              handleNumberInput(e)
                            )
                          }
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Strutture</span>
                        </label>
                        <input
                          type="text"
                          value={project.costs?.construction?.structures || ''}
                          onChange={e =>
                            handleInputChange(
                              'costs',
                              'construction.structures',
                              handleNumberInput(e)
                            )
                          }
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Impianti</span>
                        </label>
                        <input
                          type="text"
                          value={project.costs?.construction?.systems || ''}
                          onChange={e =>
                            handleInputChange('costs', 'construction.systems', handleNumberInput(e))
                          }
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text">Finiture</span>
                        </label>
                        <input
                          type="text"
                          value={project.costs?.construction?.finishes || ''}
                          onChange={e =>
                            handleInputChange(
                              'costs',
                              'construction.finishes',
                              handleNumberInput(e)
                            )
                          }
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      </div>
                    </div>
                  )}


                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-500">Subtotale: </span>
                    <span className="font-medium">
                      {formatCurrency(calculatedCosts.construction.subtotal)}
                    </span>
                  </div>
                </div>

                {/* Assicurazioni */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">3. Assicurazioni</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insuranceFlags.constructionInsurance}
                          onChange={e => {
                            setInsuranceFlags(prev => ({
                              ...prev,
                              constructionInsurance: e.target.checked,
                            }));
                            safeSetTimeout(() => recalculateAll(), 100);
                          }}
                          className="checkbox checkbox-primary"
                        />
                        <div>
                          <div className="font-medium">Assicurazione Garanzie sui Lavori</div>
                          <div className="text-sm text-gray-600">1.5% del costo di costruzione</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {formatCurrency(calculatedCosts.construction.subtotal * 0.015)}
                        </div>
                        <div className="text-xs text-gray-500">Calcolato automaticamente</div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={insuranceFlags.financingInsurance}
                            onChange={e => {
                              setInsuranceFlags(prev => ({
                                ...prev,
                                financingInsurance: e.target.checked,
                              }));
                              safeSetTimeout(() => recalculateAll(), 100);
                            }}
                            className="checkbox checkbox-primary"
                          />
                          <div>
                            <div className="font-medium flex items-center">
                              Assicurazione sul Finanziamento
                              <div className="relative group ml-2">
                                <QuestionMarkIcon className="h-4 w-4 text-gray-400 hover:text-blue-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                  <div className="text-center">
                                    <div className="font-semibold mb-1">Legge 210/2004</div>
                                    <div className="text-left space-y-1">
                                      <div><strong>Protezione acquirenti:</strong> Immobili in costruzione</div>
                                      <div><strong>Calcolo:</strong> 1% sugli acconti ricevuti</div>
                                      <div><strong>Scopo:</strong> Garanzia per i clienti</div>
                                    </div>
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              1% sugli acconti ricevuti dai clienti (Legge 210)
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {insuranceFlags.financingInsurance ? formatCurrency(calculatedCosts.insurance - (insuranceFlags.constructionInsurance ? calculatedCosts.construction?.subtotal * 0.015 : 0)) : formatCurrency(0)}
                          </div>
                          <div className="text-xs text-gray-500">Calcolato automaticamente</div>
                        </div>
                      </div>
                      
                      {insuranceFlags.financingInsurance && (
                        <div className="ml-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-blue-900">
                              Percentuale Acconto Stimata
                            </label>
                            <div className="text-xs text-blue-600">
                              Stima per il calcolo Legge 210
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={downPaymentPercentage}
                              onChange={e => {
                                setDownPaymentPercentage(parseInt(e.target.value));
                                safeSetTimeout(() => recalculateAll(), 100);
                              }}
                              className="flex-1 range range-primary range-sm"
                            />
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={downPaymentPercentage}
                                onChange={e => {
                                  const value = parseInt(e.target.value) || 20;
                                  setDownPaymentPercentage(Math.min(50, Math.max(5, value)));
                                  safeSetTimeout(() => recalculateAll(), 100);
                                }}
                                className="w-16 input input-bordered input-sm text-center"
                              />
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-blue-700">
                            💡 Urbanova calcola l'1% di questa percentuale sui ricavi totali
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strategia di Finanziamento */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="h-4 w-4 mr-2 text-blue-600">🏦</span>
                    Strategia di Finanziamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Importo Prestito (€)</span>
                      </label>
                      <input
                        type="text"
                        value={financingData.loanAmount || ''}
                        onChange={e => handleFinancingChange('loanAmount', handleNumberInput(e))}
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Tasso di Interesse (%)</span>
                      </label>
                      <input
                        type="text"
                        value={financingData.interestRate || ''}
                        onChange={e => handleFinancingChange('interestRate', handleNumberInput(e))}
                        className="input input-bordered w-full"
                        placeholder="Inserisci tasso"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Durata (anni)</span>
                      </label>
                      <input
                        type="text"
                        value={financingData.loanTermYears || ''}
                        onChange={e => handleFinancingChange('loanTermYears', handleNumberInput(e))}
                        className="input input-bordered w-full"
                        placeholder="Inserisci anni"
                      />
                    </div>
                  </div>

                  {/* Calcolo Rate Mensili */}
                  {financingData.loanAmount > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">Calcolo Rate:</div>
                        <div className="text-blue-600">
                          Rata mensile: {formatCurrency(calculateMonthlyPayment())}
                        </div>
                        <div className="text-blue-600">
                          Totale interessi: {formatCurrency(calculateTotalInterest())}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Altri Costi */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">5. Altri Costi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Opere Esterne</span>
                      </label>
                      <input
                        type="text"
                        value={project.costs?.externalWorks || ''}
                        onChange={e =>
                          handleInputChange('costs', 'externalWorks', handleNumberInput(e))
                        }
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Oneri Concessori</span>
                      </label>
                      <input
                        type="text"
                        value={project.costs?.concessionFees || ''}
                        onChange={e =>
                          handleInputChange('costs', 'concessionFees', handleNumberInput(e))
                        }
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Progettazione</span>
                      </label>
                      <input
                        type="text"
                        value={project.costs?.design || ''}
                        onChange={e => handleInputChange('costs', 'design', handleNumberInput(e))}
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ricavi */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
                Ricavi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Numero Unità</span>
                  </label>
                  <input
                    type="number"
                    value={project.revenues?.units || ''}
                    onChange={e => handleInputChange('revenues', 'units', parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    placeholder="Inserisci numero unità"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Superficie Media (m²)</span>
                  </label>
                  <input
                    type="number"
                    value={project.revenues?.averageArea || ''}
                    onChange={e =>
                      handleInputChange('revenues', 'averageArea', parseInt(e.target.value))
                    }
                    className="input input-bordered w-full"
                    placeholder="144"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Prezzo Vendita (€/m²)</span>
                  </label>
                  <input
                    type="text"
                    value={project.revenues?.pricePerSqm || ''}
                    onChange={e =>
                      handleInputChange('revenues', 'pricePerSqm', handleNumberInput(e))
                    }
                    className="input input-bordered w-full"
                    placeholder="Inserisci prezzo"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Altri Ricavi</span>
                  </label>
                  <input
                    type="text"
                    value={project.revenues?.otherRevenues || ''}
                    onChange={e =>
                      handleInputChange('revenues', 'otherRevenues', handleNumberInput(e))
                    }
                    className="input input-bordered w-full"
                    placeholder="Inserisci importo"
                  />
                </div>
              </div>
            </div>

            {/* Campo Note per Analisi LLM */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SearchIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Note e Considerazioni per l'Analisi
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Note Progetto</span>
                  </label>
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">
                      Queste note verranno elaborate dall'AI per migliorare l'analisi
                    </span>
                  </div>
                  <textarea
                    value={project.notes || ''}
                    onChange={e => handleInputChange('basic', 'notes', e.target.value)}
                    className="textarea textarea-bordered w-full h-32"
                    placeholder="Inserisci note, considerazioni, vincoli, opportunità o qualsiasi informazione rilevante per l'analisi di fattibilità. L'AI utilizzerà queste informazioni per generare un report più accurato e personalizzato..."
                  />
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-start">
                    <SearchIcon className="h-4 w-4 text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                    <div className="text-sm text-indigo-800">
                      <div className="font-medium mb-1">💡 Suggerimenti per le Note:</div>
                      <ul className="space-y-1 text-xs">
                        <li>
                          • <strong>Vincoli urbanistici:</strong> Zona, limiti di altezza,
                          destinazione d'uso
                        </li>
                        <li>
                          • <strong>Opportunità di mercato:</strong> Trend della zona, domanda
                          specifica
                        </li>
                        <li>
                          • <strong>Rischi:</strong> Problemi noti, limitazioni tecniche
                        </li>
                        <li>
                          • <strong>Strategie:</strong> Approccio commerciale, target di vendita
                        </li>
                        <li>
                          • <strong>Timing:</strong> Tempistiche di mercato, stagionalità
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risultati in Tempo Reale */}
          <div className="space-y-6">
            {/* Summary Risultati */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CalculatorIcon className="h-5 w-5 mr-2 text-purple-600" />
                Risultati
              </h2>

              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div
                    className={`text-3xl font-bold ${getMarginColor(calculatedResults.margin, project.targetMargin || 30)}`}
                  >
                    {formatPercentage(calculatedResults.margin)}
                  </div>
                  <div className="text-sm text-gray-600">Marginalità</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Target: {formatPercentage(project.targetMargin || 30)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculatedResults.profit)}
                    </div>
                    <div className="text-xs text-gray-600">Utile</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {formatPercentage(calculatedResults.roi)}
                    </div>
                    <div className="text-xs text-gray-600">ROI</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {calculatedResults.paybackPeriod.toFixed(1)} mesi
                  </div>
                  <div className="text-xs text-gray-600">Payback Period</div>
                </div>
              </div>
            </div>

            {/* Riepilogo Costi */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Riepilogo Costi</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Terreno:</span>
                  <span className="font-medium">
                    {formatCurrency(calculatedCosts.land.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Costruzione:</span>
                  <span className="font-medium">
                    {formatCurrency(calculatedCosts.construction.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Opere Esterne:</span>
                  <span className="font-medium">
                    {formatCurrency(calculatedCosts.externalWorks)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Oneri Concessori:</span>
                  <span className="font-medium">
                    {formatCurrency(calculatedCosts.concessionFees)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progettazione:</span>
                  <span className="font-medium">{formatCurrency(calculatedCosts.design)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assicurazioni:</span>
                  <span className="font-medium">{formatCurrency(calculatedCosts.insurance)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTALE COSTI:</span>
                  <span className="text-red-600">{formatCurrency(calculatedCosts.total)}</span>
                </div>
              </div>
            </div>

            {/* Riepilogo Ricavi */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Riepilogo Ricavi</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unità:</span>
                  <span className="font-medium">{calculatedRevenues.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Superficie Media:</span>
                  <span className="font-medium">{calculatedRevenues.averageArea} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prezzo/m²:</span>
                  <span className="font-medium">
                    {formatCurrency(calculatedRevenues.pricePerSqm)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ricavo per Unità:</span>
                  <span className="font-medium">
                    {formatCurrency(calculatedRevenues.revenuePerUnit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Altri Ricavi:</span>
                  <span className="font-medium">
                    {formatCurrency(calculatedRevenues.otherRevenues)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTALE RICAVI:</span>
                  <span className="text-green-600">{formatCurrency(calculatedRevenues.total)}</span>
                </div>
              </div>
            </div>

            {/* Azioni Rapide */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                🚀 Azioni Rapide
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowReportGenerator(true)}
                  disabled={!project.name || !project.address}
                  className="btn btn-primary w-full"
                >
                  📊 Genera Report
                </button>

                <button
                  onClick={() => {
                    if (savedProjectId) {
                      router.push(`/dashboard/feasibility-analysis/${savedProjectId}`);
                    } else {
                      toast('Compila nome e indirizzo per abilitare la visualizzazione', { icon: '❌' });
                    }
                  }}
                  disabled={!project.name || !project.address}
                  className="btn btn-secondary w-full"
                >
                  👁️ Visualizza Progetto
                </button>

                <button
                  onClick={() => {
                    if (savedProjectId) {
                      // Condividi link diretto
                      const url = `${window.location.origin}/dashboard/feasibility-analysis/${savedProjectId}`;
                      navigator.clipboard.writeText(url);
                      toast('Link copiato negli appunti! 📋', { icon: '✅' });
                    } else {
                      toast('Compila nome e indirizzo per abilitare la condivisione', { icon: '❌' });
                    }
                  }}
                  disabled={!project.name || !project.address}
                  className="btn btn-outline w-full"
                >
                  🔗 Condividi Link
                </button>

                <button
                  onClick={() => setShowReminderModal(true)}
                  disabled={!project.name || !project.address}
                  className="btn btn-accent w-full"
                >
                  ⏰ Crea Reminder
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600 text-center">
                {savedProjectId ? (
                  <span className="text-green-600">
                    ✅ Progetto salvato e pronto per la condivisione
                  </span>
                ) : (
                  <span className="text-blue-600">
                    💾 Salvataggio automatico attivo - Compila nome e indirizzo per iniziare
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generatore Report - Mostrato quando richiesto */}
      {showReportGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  🎯 Genera Report di Fattibilità
                </h2>
                <button
                  onClick={() => setShowReportGenerator(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <FeasibilityReportGenerator
                analysis={{
                  id: savedProjectId || 'draft-project',
                  title: project.name || 'Studio di Fattibilità',
                  location: project.address || 'Località non specificata',
                  propertyType: 'Progetto Immobiliare',
                  totalInvestment: calculatedCosts.total,
                  expectedROI: calculatedResults.roi,
                  paybackPeriod: calculatedResults.paybackPeriod,
                  netPresentValue: calculatedResults.profit,
                  internalRateOfReturn: calculatedResults.roi,
                  riskLevel:
                    calculatedResults.margin < 0
                      ? 'HIGH'
                      : calculatedResults.margin < 15
                        ? 'MEDIUM'
                        : 'LOW',
                  marketTrend:
                    calculatedResults.margin > 20
                      ? 'POSITIVE'
                      : calculatedResults.margin > 0
                        ? 'NEUTRAL'
                        : 'NEGATIVE',
                  recommendations: [
                    calculatedResults.margin >= (project.targetMargin || 30)
                      ? 'Progetto fattibile con margine target raggiunto'
                      : 'Progetto richiede ottimizzazione per raggiungere il margine target',
                    `ROI previsto: ${calculatedResults.roi.toFixed(1)}%`,
                    `Periodo di recupero: ${calculatedResults.paybackPeriod.toFixed(1)} mesi`,
                    calculatedResults.profit > 0
                      ? 'Progetto redditizio con profitto positivo'
                      : 'Progetto in perdita - valutare strategie di ottimizzazione',
                  ],
                  notes: project.notes || '', // Note per l'analisi LLM
                  createdAt: new Date().toISOString(),
                }}
                onGenerateReport={() => {
                  setShowReportGenerator(false);
                  if (savedProjectId) {
                    router.push(`/dashboard/feasibility-analysis/${savedProjectId}`);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modale Reminder */}
      {showReminderModal && (
        <ProjectReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          projectId={savedProjectId || 'draft-project'}
          projectName={project.name || 'Studio di Fattibilità'}
        />
      )}
    </DashboardLayout>
  );
}
