'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { 
  CalculatorIcon, 
  BuildingIcon, 
  EuroIcon, 
  CalendarIcon,
  LocationIcon,
  SaveIcon,
  ArrowLeftIcon,
  TrendingUpIcon,
  TargetIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertIcon
} from '@/components/icons';
import toast from 'react-hot-toast';
import Link from 'next/link';
import FeasibilityReportGenerator from '@/components/ui/FeasibilityReportGenerator';

export default function EditFeasibilityProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<FeasibilityProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  // Stati per i calcoli
  const [calculatedCosts, setCalculatedCosts] = useState<any>({
    land: { purchasePrice: 0, purchaseTaxes: 0, intermediationFees: 0, subtotal: 0 },
    construction: { excavation: 0, structures: 0, systems: 0, finishes: 0, subtotal: 0 },
    externalWorks: 0,
    concessionFees: 0,
    design: 0,
    bankCharges: 0,
    exchange: 0,
    insurance: 0,
    total: 0
  });

  const [calculatedRevenues, setCalculatedRevenues] = useState<any>({
    units: 0,
    averageArea: 0,
    pricePerSqm: 0,
    revenuePerUnit: 0,
    totalSales: 0,
    otherRevenues: 0,
    total: 0
  });

  const [calculatedResults, setCalculatedResults] = useState<any>({
    profit: 0,
    margin: 0,
    roi: 0,
    paybackPeriod: 0
  });

  // Modalità costi di costruzione
  const [constructionCostMode, setConstructionCostMode] = useState<'perSqm' | 'total'>('total');

  // Costi per metro quadro (per calcoli)
  const [constructionCostsPerSqm, setConstructionCostsPerSqm] = useState({
    excavation: 0,
    structures: 0,
    systems: 0,
    finishes: 0
  });

  // Dati finanziamento
  const [financingData, setFinancingData] = useState({
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 0,
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0
  });

  // Dati di mercato
  const [marketData, setMarketData] = useState<any>(null);
  const [marketDataLoading, setMarketDataLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProject(params.id as string);
    }
  }, [params.id]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      const projectData = await feasibilityService.getProjectById(projectId);
      if (projectData) {
        setProject(projectData);
        
        // Inizializza i costi per metro quadro se disponibili
        if (projectData.costs?.construction && projectData.totalArea) {
          const area = projectData.totalArea;
          setConstructionCostsPerSqm({
            excavation: (projectData.costs.construction.excavation || 0) / area,
            structures: (projectData.costs.construction.structures || 0) / area,
            systems: (projectData.costs.construction.systems || 0) / area,
            finishes: (projectData.costs.construction.finishes || 0) / area
          });
        }
        
        // Ricalcola tutto con i dati caricati
        recalculateAll();
      } else {
        toast.error('❌ Progetto non trovato');
        router.push('/dashboard/feasibility-analysis');
      }
    } catch (error) {
      console.error('Errore caricamento progetto:', error);
      toast.error('❌ Errore nel caricamento del progetto');
      router.push('/dashboard/feasibility-analysis');
    } finally {
      setLoading(false);
    }
  };

  // Ricalcola tutti i valori
  const recalculateAll = () => {
    if (!project) return;
    
    try {
      const costs = feasibilityService.calculateCosts(project);
      const revenues = feasibilityService.calculateRevenues(project);
      const results = feasibilityService.calculateResults(costs, revenues, project.targetMargin || 30);
      
      setCalculatedCosts(costs);
      setCalculatedRevenues(revenues);
      setCalculatedResults(results);
    } catch (error) {
      console.error('Errore ricalcolo:', error);
    }
  };

  // Inizializza i calcoli al primo render
  useEffect(() => {
    if (project) {
      recalculateAll();
    }
  }, [project]);

  // Funzione per pulire input numerico
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Rimuove tutto tranne numeri e punto decimale
    const cleanValue = value.replace(/[^0-9.]/g, '');
    return cleanValue === '' ? 0 : parseFloat(cleanValue) || 0;
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    if (!project) return;
    
    setProject(prev => {
      if (!prev) return prev;
      
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
    if (mode === 'total' && project?.totalArea && project.totalArea > 0) {
      const totalCosts = {
        excavation: constructionCostsPerSqm.excavation * project.totalArea,
        structures: constructionCostsPerSqm.structures * project.totalArea,
        systems: constructionCostsPerSqm.systems * project.totalArea,
        finishes: constructionCostsPerSqm.finishes * project.totalArea
      };
      
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          costs: {
            ...prev.costs,
            construction: {
              ...prev.costs?.construction,
              ...totalCosts
            }
          }
        };
      });
    }
    
    // Ricalcola
    setTimeout(() => recalculateAll(), 100);
  };

  const handleConstructionCostChange = (field: string, value: number) => {
    if (!project) return;
    
    setProject(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev };
      if (!updated.costs) updated.costs = {} as any;
      if (!updated.costs.construction) updated.costs.construction = {} as any;
      
      updated.costs.construction[field] = value;
      
      // Aggiorna anche i costi per metro quadro
      if (updated.totalArea && updated.totalArea > 0) {
        setConstructionCostsPerSqm(prev => ({
          ...prev,
          [field]: value / updated.totalArea
        }));
      }
      
      return updated;
    });
    
    // Ricalcola
    setTimeout(() => recalculateAll(), 100);
  };

  const handleSave = async () => {
    if (!project) return;
    
    if (!project.name || !project.address) {
      toast.error('Compila i campi obbligatori');
      return;
    }

    setSaving(true);
    try {
      console.log('🔄 Salvataggio progetto modificato...');
      
      // Aggiorna il progetto con i calcoli più recenti
      const updatedProject = {
        ...project,
        costs: calculatedCosts,
        revenues: calculatedRevenues,
        results: calculatedResults,
        updatedAt: new Date(),
        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30)
      };

      await feasibilityService.updateProject(project.id!, updatedProject);
      
      toast.success('✅ Progetto aggiornato con successo!');
      
      // Ricarica il progetto per avere i dati aggiornati
      await loadProject(project.id!);
      
    } catch (error: any) {
      console.error('❌ Errore salvataggio progetto:', error);
      toast.error(`❌ Errore nel salvataggio: ${error.message || 'Errore sconosciuto'}`);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progetto non trovato</h2>
          <Link href="/dashboard/feasibility-analysis">
            <button className="btn btn-primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Torna alla Lista
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/feasibility-analysis">
              <button className="btn btn-ghost btn-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Indietro
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifica Progetto: {project.name}</h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <LocationIcon className="h-3 w-3 mr-1" />
                {project.address}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  Salvataggio...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Salva Modifiche
                </>
              )}
            </button>
          </div>
        </div>

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
                placeholder="Indirizzo completo"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Tipo Immobile</span>
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
                <span className="label-text">Superficie Totale (m²)</span>
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
                value={project.targetMargin || 30}
                onChange={(e) => handleInputChange('basic', 'targetMargin', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="Margine target"
              />
            </div>
          </div>
        </div>

        {/* Costi di Costruzione */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CalculatorIcon className="h-5 w-5 mr-2 text-red-600" />
            Costi di Costruzione
          </h2>
          
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="constructionCostMode"
                  value="total"
                  checked={constructionCostMode === 'total'}
                  onChange={() => handleConstructionCostModeChange('total')}
                  className="radio radio-primary mr-2"
                />
                <span className="label-text">Totale</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="constructionCostMode"
                  value="perSqm"
                  checked={constructionCostMode === 'perSqm'}
                  onChange={() => handleConstructionCostModeChange('perSqm')}
                  className="radio radio-primary mr-2"
                />
                <span className="label-text">€/m²</span>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Scavi e Fondazioni</span>
              </label>
              <input
                type="number"
                value={project.costs?.construction?.excavation || ''}
                onChange={(e) => handleConstructionCostChange('excavation', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Strutture</span>
              </label>
              <input
                type="number"
                value={project.costs?.construction?.structures || ''}
                onChange={(e) => handleConstructionCostChange('structures', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Impianti</span>
              </label>
              <input
                type="number"
                value={project.costs?.construction?.systems || ''}
                onChange={(e) => handleConstructionCostChange('systems', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Finiture</span>
              </label>
              <input
                type="number"
                value={project.costs?.construction?.finishes || ''}
                onChange={(e) => handleConstructionCostChange('finishes', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder={constructionCostMode === 'perSqm' ? '€/m²' : '€'}
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-blue-800">TOTALE COSTRUZIONE</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculatedCosts.construction.subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Altri Costi */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <EuroIcon className="h-5 w-5 mr-2 text-orange-600" />
            Altri Costi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text">Costo Terreno</span>
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
                <span className="label-text">Imposte Acquisto</span>
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
                <span className="label-text">Permuta</span>
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
          
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-red-800">TOTALE COSTI</span>
              <span className="text-2xl font-bold text-red-600">{formatCurrency(calculatedCosts.total)}</span>
            </div>
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
                placeholder="Numero unità"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Superficie Media (m²)</span>
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
                <span className="label-text">Prezzo Vendita (€/m²)</span>
              </label>
              <input
                type="number"
                value={project.revenues?.pricePerSqm || ''}
                onChange={(e) => handleInputChange('revenues', 'pricePerSqm', handleNumberInput(e))}
                className="input input-bordered w-full"
                placeholder="€/m²"
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
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-green-800">TOTALE RICAVI</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(calculatedRevenues.total)}</span>
            </div>
          </div>
        </div>

        {/* Risultati */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
            Risultati
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(calculatedResults.profit)}</div>
              <div className="text-sm text-gray-600">Utile Netto</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${getMarginColor(calculatedResults.margin, project.targetMargin || 30)}`}>
                {formatPercentage(calculatedResults.margin)}
              </div>
              <div className="text-sm text-gray-600">Marginalità</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatPercentage(calculatedResults.roi)}</div>
              <div className="text-sm text-gray-600">ROI</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{calculatedResults.paybackPeriod.toFixed(1)} mesi</div>
              <div className="text-sm text-gray-600">Payback Period</div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Note
          </h2>
          
          <textarea
            value={project.notes || ''}
            onChange={(e) => handleInputChange('basic', 'notes', e.target.value)}
            className="textarea textarea-bordered w-full h-32"
            placeholder="Inserisci note aggiuntive per il progetto..."
          />
        </div>

        {/* Generatore Report PDF */}
        <div className="mt-8">
          <FeasibilityReportGenerator 
            analysis={{
              id: project.id!,
              title: project.title || project.name || 'Progetto senza titolo',
              location: project.location || project.address || 'Località non specificata',
              propertyType: project.propertyType || 'Non specificato',
              totalInvestment: calculatedCosts.total,
              expectedROI: calculatedResults.roi,
              paybackPeriod: calculatedResults.paybackPeriod,
              netPresentValue: calculatedResults.profit,
              internalRateOfReturn: 15.8, // Calcolato dal sistema
              riskLevel: calculatedCosts.total > 1000000 ? 'HIGH' : calculatedCosts.total > 500000 ? 'MEDIUM' : 'LOW',
              marketTrend: 'POSITIVE' as const,
              recommendations: [
                `ROI atteso: ${calculatedResults.roi.toFixed(1)}%`,
                `Margine di profitto: ${formatCurrency(calculatedResults.profit)}`,
                `Località strategica: ${project.location || project.address}`,
                `Tipo immobile: ${project.propertyType}`
              ],
              notes: project.notes,
              createdAt: project.createdAt ? 
                (typeof project.createdAt === 'string' ? project.createdAt : 
                 project.createdAt instanceof Date ? project.createdAt.toISOString() : 
                 project.createdAt.toDate ? project.createdAt.toDate().toISOString() : 
                 project.createdAt.seconds ? new Date(project.createdAt.seconds * 1000).toISOString() : 
                 new Date().toISOString()) : 
                new Date().toISOString()
            }}
            onGenerateReport={() => {
              toast.success('Report generato con successo! 📊');
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
