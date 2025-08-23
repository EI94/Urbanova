'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { firebaseDebugService } from '@/lib/firebaseDebugService';
import FeasibilityReportGenerator from '@/components/ui/FeasibilityReportGenerator';
import { 
  CalculatorIcon, 
  BuildingIcon, 
  EuroIcon, 
  CalendarIcon,
  LocationIcon,

  ArrowLeftIcon,
  TrendingUpIcon,
  SearchIcon,
  AlertTriangleIcon
} from '@/components/icons';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function NewFeasibilityProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [marketDataLoading, setMarketDataLoading] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [insuranceFlags, setInsuranceFlags] = useState({
    constructionInsurance: false,
    financingInsurance: false
  });
  const [financingData, setFinancingData] = useState({
    loanAmount: 0,
    interestRate: 3.5,
    loanTermYears: 15
  });
  
  // Nuovo stato per gestire i costi di costruzione
  const [constructionCostMode, setConstructionCostMode] = useState<'perSqm' | 'total'>('total');
  const [constructionCostsPerSqm, setConstructionCostsPerSqm] = useState({
    excavation: 0,
    structures: 0,
    systems: 0,
    finishes: 0
  });

  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

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
        subtotal: 0
      },
      construction: {
        excavation: 0,
        structures: 0,
        systems: 0,
        finishes: 0,
        subtotal: 0
      },
      externalWorks: 0,
      concessionFees: 0,
      design: 0,
      bankCharges: 0,
      exchange: 0,
      insurance: 0,
      total: 0
    },
    revenues: {
      units: 2,
      averageArea: 144,
      pricePerSqm: 1700,
      revenuePerUnit: 0,
      totalSales: 0,
      otherRevenues: 0,
      total: 0
    },
    results: {
      profit: 0,
      margin: 0,
      roi: 0,
      paybackPeriod: 0
    },
    isTargetAchieved: false,
    createdBy: 'user123',
    notes: ''
  });

  const [calculatedCosts, setCalculatedCosts] = useState({
    land: {
      purchasePrice: 0,
      purchaseTaxes: 0,
      intermediationFees: 0,
      subtotal: 0
    },
    construction: {
      excavation: 0,
      structures: 0,
      systems: 0,
      finishes: 0,
      subtotal: 0
    },
    externalWorks: 0,
    concessionFees: 0,
    design: 0,
    bankCharges: 0,
    exchange: 0,
    insurance: 0,
    total: 0
  });
  
  const [calculatedRevenues, setCalculatedRevenues] = useState({
    units: 2,
    averageArea: 144,
    pricePerSqm: 1700,
    revenuePerUnit: 0,
    totalSales: 0,
    otherRevenues: 0,
    total: 0
  });
  
  const [calculatedResults, setCalculatedResults] = useState({
    profit: 0,
    margin: 0,
    roi: 0,
    paybackPeriod: 0
  });

  // Inizializza i calcoli al primo render
  useEffect(() => {
    recalculateAll();
  }, []);

  // Auto-save con debounce di 3 secondi
  useEffect(() => {
    // Cancella il timeout precedente se esiste
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Solo se ci sono nome e indirizzo (campi obbligatori)
    if (project.name && project.address && project.name.trim() && project.address.trim()) {
      const timeout = setTimeout(() => {
        autoSaveProject();
      }, 3000); // 3 secondi di debounce

      setAutoSaveTimeout(timeout);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [project, calculatedCosts, calculatedRevenues, calculatedResults]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
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
          if (!(updated.costs as any)[subSection]) (updated.costs as any)[subSection] = {};
          (updated.costs as any)[subSection][subField] = value;
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
    setTimeout(() => recalculateAll(), 100);
  };

  const handleFinancingChange = (field: string, value: any) => {
    setFinancingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Ricalcola automaticamente per aggiornare assicurazioni
    setTimeout(() => recalculateAll(), 100);
  };

  // Nuove funzioni per gestire i costi di costruzione
  const handleConstructionCostModeChange = (mode: 'perSqm' | 'total') => {
    setConstructionCostMode(mode);
    
    // Se si passa da perSqm a total, calcola i totali
    if (mode === 'total' && project.totalArea && project.totalArea > 0) {
      const totalCosts = {
        excavation: constructionCostsPerSqm.excavation * project.totalArea,
        structures: constructionCostsPerSqm.structures * project.totalArea,
        systems: constructionCostsPerSqm.systems * project.totalArea,
        finishes: constructionCostsPerSqm.finishes * project.totalArea
      };
      
      setProject(prev => ({
        ...prev,
        costs: {
          ...prev.costs,
          construction: {
            ...prev.costs?.construction,
            ...totalCosts
          }
        }
      }));
    }
    
    // Se si passa da total a perSqm, calcola i costi per mq
    if (mode === 'perSqm' && project.totalArea && project.totalArea > 0) {
      const costsPerSqm = {
        excavation: (project.costs?.construction?.excavation || 0) / project.totalArea,
        structures: (project.costs?.construction?.structures || 0) / project.totalArea,
        systems: (project.costs?.construction?.systems || 0) / project.totalArea,
        finishes: (project.costs?.construction?.finishes || 0) / project.totalArea
      };
      
      setConstructionCostsPerSqm(costsPerSqm);
    }
    
    setTimeout(() => recalculateAll(), 100);
  };

  const handleConstructionCostPerSqmChange = (field: string, value: number) => {
    setConstructionCostsPerSqm(prev => ({
      ...prev,
      [field]: value
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
            [field]: totalValue
          }
        }
      }));
    }
    
    setTimeout(() => recalculateAll(), 100);
  };

  const recalculateAll = () => {
    try {
      const costs = feasibilityService.calculateCosts(project);
      
      // Calcola assicurazioni se i flag sono attivi
      let insuranceCost = 0;
      if (insuranceFlags.constructionInsurance && costs.construction?.subtotal) {
        insuranceCost += (costs.construction.subtotal * 0.015); // 1.5% del costo costruzione
      }
      if (insuranceFlags.financingInsurance) {
        insuranceCost += (financingData.loanAmount * 0.01); // 1% dell'importo finanziato
      }
      costs.insurance = insuranceCost;
      
      const revenues = feasibilityService.calculateRevenues(project);
      const results = feasibilityService.calculateResults(costs, revenues, project.targetMargin || 30);
      
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
      toast.error('Inserisci prima l\'indirizzo del progetto');
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
          projectType: 'RESIDENZIALE'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMarketData(data);
        
        // Aggiorna automaticamente il prezzo al mq se disponibile
        if (data.suggestedPricePerSqm) {
          handleInputChange('revenues', 'pricePerSqm', data.suggestedPricePerSqm);
          toast.success(`✅ Prezzo suggerito: ${data.suggestedPricePerSqm}€/m²`);
        }
      } else {
        throw new Error('Errore nel recupero dati di mercato');
      }
    } catch (error) {
      console.error('Errore fetch market data:', error);
      toast.error('❌ Errore nel recupero dati di mercato');
    } finally {
      setMarketDataLoading(false);
    }
  };

  const autoSaveProject = async () => {
    // Non salvare se mancano i campi obbligatori
    if (!project.name || !project.address) {
      return;
    }

    setAutoSaving(true);
    try {
      console.log('💾 Salvataggio automatico in corso...');
      
      const finalProject = {
        ...project,
        costs: calculatedCosts,
        revenues: calculatedRevenues,
        results: calculatedResults,
        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30)
      } as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>;

      let projectId: string;
      try {
        projectId = await feasibilityService.createProject(finalProject);
        console.log('✅ Progetto salvato automaticamente:', projectId);
      } catch (standardError) {
        // Fallback con transazione
        try {
          projectId = await feasibilityService.createProjectWithTransaction(finalProject);
          console.log('✅ Progetto salvato automaticamente con transazione:', projectId);
        } catch (transactionError) {
          // Fallback finale con batch
          projectId = await feasibilityService.createProjectWithBatch(finalProject);
          console.log('✅ Progetto salvato automaticamente con batch:', projectId);
        }
      }
      
      setSavedProjectId(projectId);
      setLastSaved(new Date());
      
      // Toast discreta per il salvataggio automatico
      toast.success('💾 Progetto salvato automaticamente', { 
        duration: 2000,
        position: 'bottom-right' 
      });
      
    } catch (error: any) {
      console.error('❌ Errore salvataggio automatico:', error);
      // Non mostrare errori per il salvataggio automatico per non disturbare l'utente
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!project.name || !project.address) {
      toast.error('Compila i campi obbligatori');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Avvio salvataggio progetto fattibilità...');
      
      // Test connessione Firebase prima del salvataggio
      console.log('🔍 Test connessione Firebase...');
      const diagnostic = await firebaseDebugService.runFullDiagnostic();
      
      if (diagnostic.overall === 'failed') {
        console.error('❌ Problemi di connessione Firebase rilevati:', diagnostic);
        toast.error('❌ Problemi di connessione Firebase. Controlla la console per dettagli.');
        return;
      }
      
      const finalProject = {
        ...project,
        costs: calculatedCosts,
        revenues: calculatedRevenues,
        results: calculatedResults,
        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30)
      } as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>;

      console.log('📝 Dati progetto da salvare:', finalProject);
      
      // Prova prima con il metodo standard
      let projectId: string;
      try {
        projectId = await feasibilityService.createProject(finalProject);
        console.log('✅ Progetto creato con metodo standard:', projectId);
      } catch (standardError) {
        console.warn('⚠️ Metodo standard fallito, prova con transazione:', standardError);
        
        // Fallback: prova con transazione
        try {
          projectId = await feasibilityService.createProjectWithTransaction(finalProject);
          console.log('✅ Progetto creato con transazione:', projectId);
        } catch (transactionError) {
          console.error('❌ Anche la transazione è fallita:', transactionError);
          
          // Fallback finale: prova con batch
          try {
            projectId = await feasibilityService.createProjectWithBatch(finalProject);
            console.log('✅ Progetto creato con batch:', projectId);
          } catch (batchError) {
            console.error('❌ Tutti i metodi sono falliti:', batchError);
            throw batchError;
          }
        }
      }
      
      setSavedProjectId(projectId);
      toast.success('✅ Progetto creato con successo! Ora puoi generare il report.');
      setShowReportGenerator(true);
    } catch (error: any) {
      console.error('❌ Errore creazione progetto:', error);
      
      // Log dettagliato dell'errore
      firebaseDebugService.logFirebaseError(error, 'Creazione progetto fattibilità');
      
      // Messaggio di errore più specifico
      let errorMessage = '❌ Errore nella creazione del progetto';
      
      if (error.code === 'permission-denied') {
        errorMessage = '❌ Errore permessi: Verifica le regole di sicurezza Firestore';
      } else if (error.code === 'unavailable') {
        errorMessage = '❌ Errore connessione: Verifica la connessione internet e lo stato Firebase';
      } else if (error.code === 'unauthenticated') {
        errorMessage = '❌ Errore autenticazione: Effettua nuovamente il login';
      } else if (error.message) {
        errorMessage = `❌ Errore: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
    return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
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
            <Link href="/dashboard/feasibility-analysis">
              <button className="btn btn-ghost btn-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Indietro
              </button>
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">🏗️ Nuovo Progetto di Fattibilità</h1>
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
              <p className="text-gray-600 mt-1">
                Crea un nuovo studio di fattibilità immobiliare
              </p>
            </div>
          </div>
          <div className="flex space-x-2">


            <button 
              onClick={() => setShowReportGenerator(true)}
              disabled={!project.name || !project.address}
              className="btn btn-secondary"
            >
              📊 Genera Report
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
                    onChange={(e) => handleInputChange('basic', 'name', e.target.value)}
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
                      onChange={(e) => handleInputChange('basic', 'address', e.target.value)}
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
                    onChange={(e) => handleInputChange('basic', 'totalArea', handleNumberInput(e))}
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
                    onChange={(e) => handleInputChange('basic', 'status', e.target.value)}
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
                    onChange={(e) => handleInputChange('basic', 'duration', parseInt(e.target.value))}
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
                    onChange={(e) => handleInputChange('basic', 'targetMargin', handleNumberInput(e))}
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
                      <div className="text-lg font-bold">{formatCurrency(marketData.averagePrice)}/m²</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-medium">Variazione</div>
                      <div className={`text-lg font-bold ${marketData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {marketData.priceChange >= 0 ? '+' : ''}{marketData.priceChange}%
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
                        {marketData.similarProjects.slice(0, 3).map((project: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                            <div>
                              <div className="font-medium">{project.title}</div>
                              <div className="text-xs text-gray-600">{project.address}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{formatCurrency(project.pricePerSqm)}/m²</div>
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
                        onChange={(e) => handleInputChange('costs', 'land.purchasePrice', handleNumberInput(e))}
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
                        onChange={(e) => handleInputChange('costs', 'land.purchaseTaxes', handleNumberInput(e))}
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
                        onChange={(e) => handleInputChange('costs', 'land.intermediationFees', handleNumberInput(e))}
                        className="input input-bordered w-full"
                        placeholder="Inserisci importo"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-500">Subtotale: </span>
                    <span className="font-medium">{formatCurrency(calculatedCosts.land.subtotal)}</span>
                  </div>
                </div>

                {/* Costi Costruzione */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">2. Costruzione</h3>
                    
                    {/* Toggle per modalità costi */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Modalità:</span>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => handleConstructionCostModeChange('perSqm')}
                          className={`px-3 py-1 text-sm rounded-md transition-all ${
                            constructionCostMode === 'perSqm'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          €/mq
                        </button>
                        <button
                          onClick={() => handleConstructionCostModeChange('total')}
                          className={`px-3 py-1 text-sm rounded-md transition-all ${
                            constructionCostMode === 'total'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          Totale
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Avviso se mancano i mq */}
                  {constructionCostMode === 'perSqm' && (!project.totalArea || project.totalArea <= 0) && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangleIcon className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-800">
                          Inserisci la superficie totale nella sezione "Dati Base Progetto" per calcolare automaticamente i costi totali
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Informazioni calcolo */}
                  {constructionCostMode === 'perSqm' && project.totalArea && project.totalArea > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="h-4 w-4 text-blue-600 mr-2">✅</span>
                          <span className="text-sm text-blue-800">
                            Calcolo automatico: {project.totalArea} mq × costo per mq = totale
                          </span>
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          Totale: {formatCurrency(calculatedCosts.construction.subtotal)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">
                          Scavi e Fondazioni
                          {constructionCostMode === 'perSqm' && (
                            <span className="text-xs text-gray-500 ml-1">(€/mq)</span>
                          )}
                        </span>
                      </label>
                      {constructionCostMode === 'perSqm' ? (
                        <input
                          type="text"
                          value={constructionCostsPerSqm.excavation || ''}
                          onChange={(e) => handleConstructionCostPerSqmChange('excavation', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Es. 25"
                        />
                      ) : (
                        <input
                          type="text"
                          value={project.costs?.construction?.excavation || ''}
                          onChange={(e) => handleInputChange('costs', 'construction.excavation', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      )}
                      {constructionCostMode === 'perSqm' && project.totalArea && project.totalArea > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Totale: {formatCurrency(constructionCostsPerSqm.excavation * project.totalArea)}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">
                          Strutture
                          {constructionCostMode === 'perSqm' && (
                            <span className="text-xs text-gray-500 ml-1">(€/mq)</span>
                          )}
                        </span>
                      </label>
                      {constructionCostMode === 'perSqm' ? (
                        <input
                          type="text"
                          value={constructionCostsPerSqm.structures || ''}
                          onChange={(e) => handleConstructionCostPerSqmChange('structures', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Es. 180"
                        />
                      ) : (
                        <input
                          type="text"
                          value={project.costs?.construction?.structures || ''}
                          onChange={(e) => handleInputChange('costs', 'construction.structures', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      )}
                      {constructionCostMode === 'perSqm' && project.totalArea && project.totalArea > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Totale: {formatCurrency(constructionCostsPerSqm.structures * project.totalArea)}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">
                          Impianti
                          {constructionCostMode === 'perSqm' && (
                            <span className="text-xs text-gray-500 ml-1">(€/mq)</span>
                          )}
                        </span>
                      </label>
                      {constructionCostMode === 'perSqm' ? (
                        <input
                          type="text"
                          value={constructionCostsPerSqm.systems || ''}
                          onChange={(e) => handleConstructionCostPerSqmChange('systems', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Es. 120"
                        />
                      ) : (
                        <input
                          type="text"
                          value={project.costs?.construction?.systems || ''}
                          onChange={(e) => handleInputChange('costs', 'construction.systems', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      )}
                      {constructionCostMode === 'perSqm' && project.totalArea && project.totalArea > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Totale: {formatCurrency(constructionCostsPerSqm.systems * project.totalArea)}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">
                          Finiture
                          {constructionCostMode === 'perSqm' && (
                            <span className="text-xs text-gray-500 ml-1">(€/mq)</span>
                          )}
                        </span>
                      </label>
                      {constructionCostMode === 'perSqm' ? (
                        <input
                          type="text"
                          value={constructionCostsPerSqm.finishes || ''}
                          onChange={(e) => handleConstructionCostPerSqmChange('finishes', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Es. 150"
                        />
                      ) : (
                        <input
                          type="text"
                          value={project.costs?.construction?.finishes || ''}
                          onChange={(e) => handleInputChange('costs', 'construction.finishes', handleNumberInput(e))}
                          className="input input-bordered w-full"
                          placeholder="Inserisci importo"
                        />
                      )}
                      {constructionCostMode === 'perSqm' && project.totalArea && project.totalArea > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Totale: {formatCurrency(constructionCostsPerSqm.finishes * project.totalArea)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Riepilogo costi per mq */}
                  {constructionCostMode === 'perSqm' && project.totalArea && project.totalArea > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Scavi e Fondazioni</div>
                          <div className="font-medium">{constructionCostsPerSqm.excavation} €/mq</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Strutture</div>
                          <div className="font-medium">{constructionCostsPerSqm.structures} €/mq</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Impianti</div>
                          <div className="font-medium">{constructionCostsPerSqm.systems} €/mq</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Finiture</div>
                          <div className="font-medium">{constructionCostsPerSqm.finishes} €/mq</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Costo totale per mq:</span>
                          <span className="font-bold text-lg">
                            {constructionCostsPerSqm.excavation + constructionCostsPerSqm.structures + constructionCostsPerSqm.systems + constructionCostsPerSqm.finishes} €/mq
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-500">Subtotale: </span>
                    <span className="font-medium">{formatCurrency(calculatedCosts.construction.subtotal)}</span>
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
                          onChange={(e) => {
                            setInsuranceFlags(prev => ({
                              ...prev,
                              constructionInsurance: e.target.checked
                            }));
                            setTimeout(() => recalculateAll(), 100);
                          }}
                          className="checkbox checkbox-primary"
                        />
                        <div>
                          <div className="font-medium">Assicurazione Garanzie sui Lavori</div>
                          <div className="text-sm text-gray-600">1.5% del costo di costruzione</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(calculatedCosts.construction.subtotal * 0.015)}</div>
                        <div className="text-xs text-gray-500">Calcolato automaticamente</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insuranceFlags.financingInsurance}
                          onChange={(e) => {
                            setInsuranceFlags(prev => ({
                              ...prev,
                              financingInsurance: e.target.checked
                            }));
                            setTimeout(() => recalculateAll(), 100);
                          }}
                          className="checkbox checkbox-primary"
                        />
                        <div>
                          <div className="font-medium">Assicurazione sul Finanziamento</div>
                          <div className="text-sm text-gray-600">1% sull'importo finanziato (Legge 210)</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(financingData.loanAmount * 0.01)}</div>
                        <div className="text-xs text-gray-500">Calcolato automaticamente</div>
                      </div>
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
                        onChange={(e) => handleFinancingChange('loanAmount', handleNumberInput(e))}
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
                        onChange={(e) => handleFinancingChange('interestRate', handleNumberInput(e))}
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
                        onChange={(e) => handleFinancingChange('loanTermYears', handleNumberInput(e))}
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
                        onChange={(e) => handleInputChange('costs', 'externalWorks', handleNumberInput(e))}
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
                        onChange={(e) => handleInputChange('costs', 'concessionFees', handleNumberInput(e))}
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
                        onChange={(e) => handleInputChange('costs', 'design', handleNumberInput(e))}
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
                    value={project.revenues?.units || 2}
                    onChange={(e) => handleInputChange('revenues', 'units', parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    placeholder="2"
                  />
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Superficie Media (m²)</span>
                  </label>
                  <input
                    type="number"
                    value={project.revenues?.averageArea || 144}
                    onChange={(e) => handleInputChange('revenues', 'averageArea', parseInt(e.target.value))}
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
                    onChange={(e) => handleInputChange('revenues', 'pricePerSqm', handleNumberInput(e))}
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
                    onChange={(e) => handleInputChange('revenues', 'otherRevenues', handleNumberInput(e))}
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
                    <span className="label-text-alt text-gray-500">Queste note verranno elaborate dall'AI per migliorare l'analisi</span>
                  </label>
                  <textarea
                    value={project.notes || ''}
                    onChange={(e) => handleInputChange('basic', 'notes', e.target.value)}
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
                        <li>• <strong>Vincoli urbanistici:</strong> Zona, limiti di altezza, destinazione d'uso</li>
                        <li>• <strong>Opportunità di mercato:</strong> Trend della zona, domanda specifica</li>
                        <li>• <strong>Rischi:</strong> Problemi noti, limitazioni tecniche</li>
                        <li>• <strong>Strategie:</strong> Approccio commerciale, target di vendita</li>
                        <li>• <strong>Timing:</strong> Tempistiche di mercato, stagionalità</li>
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
                  <div className={`text-3xl font-bold ${getMarginColor(calculatedResults.margin, project.targetMargin || 30)}`}>
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
                  <span className="font-medium">{formatCurrency(calculatedCosts.land.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Costruzione:</span>
                  <span className="font-medium">{formatCurrency(calculatedCosts.construction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Opere Esterne:</span>
                  <span className="font-medium">{formatCurrency(calculatedCosts.externalWorks)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Oneri Concessori:</span>
                  <span className="font-medium">{formatCurrency(calculatedCosts.concessionFees)}</span>
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
                  <span className="font-medium">{formatCurrency(calculatedRevenues.pricePerSqm)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ricavo per Unità:</span>
                  <span className="font-medium">{formatCurrency(calculatedRevenues.revenuePerUnit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Altri Ricavi:</span>
                  <span className="font-medium">{formatCurrency(calculatedRevenues.otherRevenues)}</span>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      toast.error('Compila nome e indirizzo per abilitare la visualizzazione');
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
                      toast.success('Link copiato negli appunti! 📋');
                    } else {
                      toast.error('Compila nome e indirizzo per abilitare la condivisione');
                    }
                  }}
                  disabled={!project.name || !project.address}
                  className="btn btn-outline w-full"
                >
                  🔗 Condividi Link
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 text-center">
                {savedProjectId ? (
                  <span className="text-green-600">✅ Progetto salvato e pronto per la condivisione</span>
                ) : (
                  <span className="text-blue-600">💾 Salvataggio automatico attivo - Compila nome e indirizzo per iniziare</span>
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
                <h2 className="text-2xl font-bold text-gray-900">🎯 Genera Report di Fattibilità</h2>
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
                  riskLevel: calculatedResults.margin < 0 ? 'HIGH' : calculatedResults.margin < 15 ? 'MEDIUM' : 'LOW',
                  marketTrend: calculatedResults.margin > 20 ? 'POSITIVE' : calculatedResults.margin > 0 ? 'NEUTRAL' : 'NEGATIVE',
                  recommendations: [
                    calculatedResults.margin >= (project.targetMargin || 30) 
                      ? 'Progetto fattibile con margine target raggiunto'
                      : 'Progetto richiede ottimizzazione per raggiungere il margine target',
                    `ROI previsto: ${calculatedResults.roi.toFixed(1)}%`,
                    `Periodo di recupero: ${calculatedResults.paybackPeriod.toFixed(1)} mesi`,
                    calculatedResults.profit > 0 
                      ? 'Progetto redditizio con profitto positivo'
                      : 'Progetto in perdita - valutare strategie di ottimizzazione'
                  ],
                  notes: project.notes || '', // Note per l'analisi LLM
                  createdAt: new Date().toISOString()
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
    </DashboardLayout>
  );
} 