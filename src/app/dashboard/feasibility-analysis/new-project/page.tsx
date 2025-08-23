'use client';

import { useState, useEffect } from 'react';
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
  const [project, setProject] = useState<Partial<FeasibilityProject>>({
    name: '',
    address: '',
    status: 'PIANIFICAZIONE',
    startDate: new Date(),
    constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    duration: 18,
    targetMargin: 30,
    totalArea: 0,
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
    notes: ''
  });

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
  const [autoSaveExecuted, setAutoSaveExecuted] = useState(false);

  const [calculatedCosts, setCalculatedCosts] = useState<any>({
    land: { purchasePrice: 0, purchaseTaxes: 0, intermediationFees: 0, subtotal: 0 },
    construction: { excavation: 0, structures: 0, systems: 0, finishes: 0, subtotal: 0 },
    externalWorks: 0, concessionFees: 0, design: 0, bankCharges: 0, exchange: 0, insurance: 0, total: 0
  });

  const [calculatedRevenues, setCalculatedRevenues] = useState<any>({
    units: 0, averageArea: 0, pricePerSqm: 0, revenuePerUnit: 0, totalSales: 0, otherRevenues: 0, total: 0
  });

  const [calculatedResults, setCalculatedResults] = useState<any>({
    profit: 0, margin: 0, roi: 0, paybackPeriod: 0
  });

  // Inizializza i calcoli al primo render
  useEffect(() => {
    recalculateAll();
  }, []);

  // Reset del salvataggio automatico quando si crea un nuovo progetto
  const resetAutoSave = () => {
    setSavedProjectId(null);
    setAutoSaveExecuted(false);
    setLastSaved(null);
    setAutoSaving(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  };

  // Auto-save con debounce di 3 secondi - SOLO per cambiamenti essenziali
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    if (project.name && project.address && project.name.trim() && project.address.trim() && !savedProjectId && !autoSaveExecuted) {
      const timeout = setTimeout(() => {
        autoSaveProject();
      }, 3000);

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [project.name, project.address, savedProjectId]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, []);

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
        if (!updated.costs) updated.revenues = {} as any;
        (updated.revenues as any)[field] = value;
      }
      
      return updated;
    });

    setTimeout(() => recalculateAll(), 100);
  };

  const handleFinancingChange = (field: string, value: any) => {
    setFinancingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setTimeout(() => recalculateAll(), 100);
  };

  const handleConstructionCostModeChange = (mode: 'perSqm' | 'total') => {
    setConstructionCostMode(mode);
    
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
      console.log('🔄 Ricalcolo completo progetto...');
      
      // Calcola costi
      const costs = feasibilityService.calculateCosts(project);
      setCalculatedCosts(costs);
      
      // Calcola ricavi
      const revenues = feasibilityService.calculateRevenues(project);
      setCalculatedRevenues(revenues);
      
      // Calcola risultati
      const results = feasibilityService.calculateResults(costs, revenues, project.targetMargin || 30);
      setCalculatedResults(results);
      
      console.log('✅ Ricalcolo completato:', { costs, revenues, results });
    } catch (error) {
      console.error('❌ Errore ricalcolo:', error);
    }
  };

  const autoSaveProject = async () => {
    if (!project.name || !project.address || savedProjectId || autoSaveExecuted) {
      return;
    }

    setAutoSaving(true);
    try {
      console.log('💾 Auto-salvataggio progetto...');
      
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
        console.log('✅ Progetto auto-salvato:', projectId);
      } catch (standardError) {
        try {
          projectId = await feasibilityService.createProjectWithTransaction(finalProject);
          console.log('✅ Progetto auto-salvato con transazione:', projectId);
        } catch (transactionError) {
          projectId = await feasibilityService.createProjectWithBatch(finalProject);
          console.log('✅ Progetto auto-salvato con batch:', projectId);
        }
      }
      
      setSavedProjectId(projectId);
      setAutoSaveExecuted(true);
      setLastSaved(new Date());
      
      toast.success('✅ Progetto salvato automaticamente!');
      
    } catch (error: any) {
      console.error('❌ Errore auto-salvataggio:', error);
      toast.error('❌ Errore nel salvataggio automatico');
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
      
      const diagnostic = await firebaseDebugService.runFullDiagnostic();
      
      if (diagnostic.overall === 'failed') {
        console.error('❌ Problemi di connessione Firebase rilevati:', diagnostic);
        toast.error('❌ Problemi di connessione Firebase. Controlla la console per dettagli.');
        return;
      }
      
      console.log('✅ Connessione Firebase OK, procedo con salvataggio...');
      
      const finalProject = {
        ...project,
        costs: calculatedCosts,
        revenues: calculatedRevenues,
        results: calculatedResults,
        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30)
      } as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>;

      console.log('📝 Dati progetto da salvare:', finalProject);
      
      let projectId: string;
      try {
        projectId = await feasibilityService.createProject(finalProject);
        console.log('✅ Progetto creato con metodo standard:', projectId);
      } catch (standardError) {
        console.warn('⚠️ Metodo standard fallito, prova con transazione:', standardError);
        
        try {
          projectId = await feasibilityService.createProjectWithTransaction(finalProject);
          console.log('✅ Progetto creato con transazione:', projectId);
        } catch (transactionError) {
          console.error('❌ Anche la transazione è fallita:', transactionError);
          
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
      
      firebaseDebugService.logFirebaseError(error, 'Creazione progetto fattibilità');
      
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Studio di Fattibilità</h1>
            <p className="text-gray-600 mt-2">Crea un nuovo progetto immobiliare con analisi completa di costi, ricavi e fattibilità</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/feasibility-analysis">
              <button className="btn btn-ghost btn-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Indietro
              </button>
            </Link>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  Salvataggio...
                </>
              ) : (
                <>
                  💾 Salva Progetto
                </>
              )}
            </button>
          </div>
        </div>

        {/* Indicatori Auto-save */}
        {autoSaving && (
          <div className="alert alert-info">
            <div className="loading loading-spinner loading-sm"></div>
            <span>💾 Salvataggio automatico in corso...</span>
          </div>
        )}
        
        {lastSaved && (
          <div className="alert alert-success">
            <span>✅ Ultimo salvataggio: {lastSaved.toLocaleTimeString('it-IT')}</span>
          </div>
        )}

        {/* Dati Base Progetto */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BuildingIcon className="h-5 w-5 mr-2 text-blue-600" />
            Dati Base Progetto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Nome Progetto *</span>
              </label>
              <input
                type="text"
                value={project.name || ''}
                onChange={(e) => handleInputChange('basic', 'name', e.target.value)}
                className="input input-bordered w-full"
                placeholder="Nome del progetto"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Indirizzo *</span>
              </label>
              <input
                type="text"
                value={project.address || ''}
                onChange={(e) => handleInputChange('basic', 'address', e.target.value)}
                className="input input-bordered w-full"
                placeholder="Indirizzo del terreno"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Tipologia Immobile</span>
              </label>
              <select
                value={project.propertyType || 'RESIDENZIALE'}
                onChange={(e) => handleInputChange('basic', 'propertyType', e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="RESIDENZIALE">Residenziale</option>
                <option value="COMMERCIALE">Commerciale</option>
                <option value="INDUSTRIALE">Industriale</option>
                <option value="MISTO">Misto</option>
              </select>
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Superficie Totale (mq)</span>
              </label>
              <input
                type="number"
                value={project.totalArea || ''}
                onChange={(e) => handleInputChange('basic', 'totalArea', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="Superficie in metri quadri"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Durata Lavori (mesi)</span>
              </label>
              <input
                type="number"
                value={project.duration || ''}
                onChange={(e) => handleInputChange('basic', 'duration', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="Durata in mesi"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Margine Target (%)</span>
              </label>
              <input
                type="number"
                value={project.targetMargin || ''}
                onChange={(e) => handleInputChange('basic', 'targetMargin', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="Margine obiettivo"
              />
            </div>
          </div>
        </div>

        {/* Costi */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <EuroIcon className="h-5 w-5 mr-2 text-red-600" />
            Costi
          </h2>
          
          {/* Costi Terreno */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">1. Terreno</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Prezzo Acquisto</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.land?.purchasePrice || ''}
                  onChange={(e) => handleInputChange('costs', 'land.purchasePrice', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Imposte</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.land?.purchaseTaxes || ''}
                  onChange={(e) => handleInputChange('costs', 'land.purchaseTaxes', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Commissioni</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.land?.intermediationFees || ''}
                  onChange={(e) => handleInputChange('costs', 'land.intermediationFees', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
            </div>
            
            <div className="mt-4 text-right">
              <span className="text-lg font-semibold">
                Subtotale: {formatCurrency(calculatedCosts.land.subtotal)}
              </span>
            </div>
          </div>

          {/* Costi Costruzione */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">2. Costruzione</h3>
            
            {/* Modalità Costi */}
            <div className="mb-4">
              <label className="label">
                <span className="label-text">Modalità</span>
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleConstructionCostModeChange('perSqm')}
                  className={`btn btn-sm ${constructionCostMode === 'perSqm' ? 'btn-primary' : 'btn-outline'}`}
                >
                  €/mq
                </button>
                <button
                  onClick={() => handleConstructionCostModeChange('total')}
                  className={`btn btn-sm ${constructionCostMode === 'total' ? 'btn-primary' : 'btn-outline'}`}
                >
                  Totale
                </button>
              </div>
            </div>

            {/* Calcolo automatico */}
            {constructionCostMode === 'perSqm' && project.totalArea && project.totalArea > 0 && (
              <div className="alert alert-info mb-4">
                <span>✅ Calcolo automatico: {project.totalArea} mq × costo per mq = totale</span>
              </div>
            )}

            {/* Campi Costi */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-gray-500">Scavi e Fondazioni</label>
                <input
                  type="number"
                  value={constructionCostMode === 'perSqm' ? constructionCostsPerSqm.excavation : (project.costs?.construction?.excavation || '')}
                  onChange={(e) => constructionCostMode === 'perSqm' ? 
                    handleConstructionCostPerSqmChange('excavation', handleNumberInput(e)) : 
                    handleInputChange('costs', 'construction.excavation', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
                />
                {constructionCostMode === 'perSqm' && project.totalArea && (
                  <div className="text-sm text-gray-500 mt-1">
                    Totale: {formatCurrency((project.costs?.construction?.excavation || 0))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-gray-500">Strutture</label>
                <input
                  type="number"
                  value={constructionCostMode === 'perSqm' ? constructionCostsPerSqm.structures : (project.costs?.construction?.structures || '')}
                  onChange={(e) => constructionCostMode === 'perSqm' ? 
                    handleConstructionCostPerSqmChange('structures', handleNumberInput(e)) : 
                    handleInputChange('costs', 'construction.structures', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
                />
                {constructionCostMode === 'perSqm' && project.totalArea && (
                  <div className="text-sm text-gray-500 mt-1">
                    Totale: {formatCurrency((project.costs?.construction?.structures || 0))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-gray-500">Impianti</label>
                <input
                  type="number"
                  value={constructionCostMode === 'perSqm' ? constructionCostsPerSqm.systems : (project.costs?.construction?.systems || '')}
                  onChange={(e) => constructionCostMode === 'perSqm' ? 
                    handleConstructionCostPerSqmChange('systems', handleNumberInput(e)) : 
                    handleInputChange('costs', 'construction.systems', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
                />
                {constructionCostMode === 'perSqm' && project.totalArea && (
                  <div className="text-sm text-gray-500 mt-1">
                    Totale: {formatCurrency((project.costs?.construction?.systems || 0))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-gray-500">Finiture</label>
                <input
                  type="number"
                  value={constructionCostMode === 'perSqm' ? constructionCostsPerSqm.finishes : (project.costs?.construction?.finishes || '')}
                  onChange={(e) => constructionCostMode === 'perSqm' ? 
                    handleConstructionCostPerSqmChange('finishes', handleNumberInput(e)) : 
                    handleInputChange('costs', 'construction.finishes', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
                />
                {constructionCostMode === 'perSqm' && project.totalArea && (
                  <div className="text-sm text-gray-500 mt-1">
                    Totale: {formatCurrency((project.costs?.construction?.finishes || 0))}
                  </div>
                )}
              </div>
            </div>

            {/* Riepilogo costi per mq */}
            {constructionCostMode === 'perSqm' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Riepilogo costi per mq:</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Scavi e Fondazioni: {formatCurrency(constructionCostsPerSqm.excavation)}/mq</div>
                  <div>Strutture: {formatCurrency(constructionCostsPerSqm.structures)}/mq</div>
                  <div>Impianti: {formatCurrency(constructionCostsPerSqm.systems)}/mq</div>
                  <div>Finiture: {formatCurrency(constructionCostsPerSqm.finishes)}/mq</div>
                </div>
                <div className="mt-2 text-right">
                  <span className="font-semibold">
                    Costo totale per mq: {formatCurrency(
                      constructionCostsPerSqm.excavation + 
                      constructionCostsPerSqm.structures + 
                      constructionCostsPerSqm.systems + 
                      constructionCostsPerSqm.finishes
                    )}/mq
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-right">
              <span className="text-lg font-semibold">
                Subtotale: {formatCurrency(calculatedCosts.construction.subtotal)}
              </span>
            </div>
          </div>

          {/* Altri Costi */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">3. Altri Costi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Lavori Esterni</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.externalWorks || ''}
                  onChange={(e) => handleInputChange('costs', 'externalWorks', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Concessioni</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.concessionFees || ''}
                  onChange={(e) => handleInputChange('costs', 'concessionFees', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Progettazione</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.design || ''}
                  onChange={(e) => handleInputChange('costs', 'design', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Spese Bancarie</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.bankCharges || ''}
                  onChange={(e) => handleInputChange('costs', 'bankCharges', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Spese di Cambio</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.exchange || ''}
                  onChange={(e) => handleInputChange('costs', 'exchange', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Assicurazioni</span>
                </label>
                <input
                  type="number"
                  value={project.costs?.insurance || ''}
                  onChange={(e) => handleInputChange('costs', 'insurance', handleNumberInput(e))}
                  className="input input-bordered w-full"
                  placeholder="€"
                />
              </div>
            </div>
          </div>

          {/* Totale Costi */}
          <div className="text-right">
            <span className="text-2xl font-bold text-red-600">
              Totale Costi: {formatCurrency(calculatedCosts.total)}
            </span>
          </div>
        </div>

        {/* Ricavi */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
            Ricavi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Numero Unità</span>
              </label>
              <input
                type="number"
                value={project.revenues?.units || ''}
                onChange={(e) => handleInputChange('revenues', 'units', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="Numero di unità"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Superficie Media per Unità (mq)</span>
              </label>
              <input
                type="number"
                value={project.revenues?.averageArea || ''}
                onChange={(e) => handleInputChange('revenues', 'averageArea', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="Superficie media"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Prezzo per Metro Quadro</span>
              </label>
              <input
                type="number"
                value={project.revenues?.pricePerSqm || ''}
                onChange={(e) => handleInputChange('revenues', 'pricePerSqm', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="€/mq"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Altri Ricavi</span>
              </label>
              <input
                type="number"
                value={project.revenues?.otherRevenues || ''}
                onChange={(e) => handleInputChange('revenues', 'otherRevenues', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="€"
              />
            </div>
          </div>

          {/* Riepilogo Ricavi */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Ricavo per Unità</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(calculatedRevenues.revenuePerUnit)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Vendite Totali</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(calculatedRevenues.totalSales)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Ricavi Totali</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(calculatedRevenues.total)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risultati */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CalculatorIcon className="h-5 w-5 mr-2 text-blue-600" />
            Risultati
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculatedResults.profit)}
              </div>
              <div className="text-sm text-gray-600">Utile Netto</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className={`text-2xl font-bold ${getMarginColor(calculatedResults.margin, project.targetMargin || 30)}`}>
                {formatPercentage(calculatedResults.margin)}
              </div>
              <div className="text-sm text-gray-600">Marginalità</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {formatPercentage(calculatedResults.roi)}
              </div>
              <div className="text-sm text-gray-600">ROI</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {calculatedResults.paybackPeriod.toFixed(1)} anni
              </div>
              <div className="text-sm text-gray-600">Payback Period</div>
            </div>
          </div>

          {/* Target Achievement */}
          <div className="mt-6 text-center">
            <div className={`text-lg font-semibold ${calculatedResults.margin >= (project.targetMargin || 30) ? 'text-success' : 'text-warning'}`}>
              {calculatedResults.margin >= (project.targetMargin || 30) ? '🎯 Target Raggiunto!' : '⚠️ Target Non Raggiunto'}
            </div>
            <div className="text-sm text-gray-600">
              Target: {formatPercentage(project.targetMargin || 30)} | Attuale: {formatPercentage(calculatedResults.margin)}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 Note</h2>
          <textarea
            value={project.notes || ''}
            onChange={(e) => handleInputChange('basic', 'notes', e.target.value)}
            className="textarea textarea-bordered w-full h-32"
            placeholder="Inserisci note aggiuntive per il progetto..."
          />
        </div>

        {/* Generatore Report */}
        {showReportGenerator && savedProjectId && (
          <FeasibilityReportGenerator
            isOpen={showReportGenerator}
            onClose={() => setShowReportGenerator(false)}
            analysis={{
              id: savedProjectId,
              name: project.name || '',
              address: project.address || '',
              propertyType: project.propertyType || 'RESIDENZIALE',
              totalArea: project.totalArea || 0,
              costs: calculatedCosts,
              revenues: calculatedRevenues,
              results: calculatedResults,
              targetMargin: project.targetMargin || 30,
              notes: project.notes || '',
              createdAt: new Date().toISOString()
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
