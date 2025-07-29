'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  TrendingUpIcon
} from '@/components/icons';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewFeasibilityProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Partial<FeasibilityProject>>({
    name: '',
    address: '',
    status: 'PIANIFICAZIONE',
    startDate: new Date(),
    constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    duration: 18,
    targetMargin: 30,
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

  const [calculatedCosts, setCalculatedCosts] = useState(project.costs);
  const [calculatedRevenues, setCalculatedRevenues] = useState(project.revenues);
  const [calculatedResults, setCalculatedResults] = useState(project.results);

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

  const recalculateAll = () => {
    const costs = feasibilityService.calculateCosts(project);
    const revenues = feasibilityService.calculateRevenues(project);
    const results = feasibilityService.calculateResults(costs, revenues, project.targetMargin || 30);

    setCalculatedCosts(costs);
    setCalculatedRevenues(revenues);
    setCalculatedResults(results);
  };

  const handleSave = async () => {
    if (!project.name || !project.address) {
      toast.error('Compila i campi obbligatori');
      return;
    }

    setLoading(true);
    try {
      const finalProject = {
        ...project,
        costs: calculatedCosts,
        revenues: calculatedRevenues,
        results: calculatedResults,
        isTargetAchieved: calculatedResults.margin >= (project.targetMargin || 30)
      } as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>;

      const projectId = await feasibilityService.createProject(finalProject);
      toast.success('✅ Progetto creato con successo!');
      router.push(`/dashboard/feasibility-analysis/${projectId}`);
    } catch (error) {
      console.error('Errore creazione progetto:', error);
      toast.error('❌ Errore nella creazione del progetto');
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/feasibility-analysis">
              <button className="btn btn-ghost btn-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Indietro
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏗️ Nuovo Progetto di Fattibilità</h1>
              <p className="text-gray-600 mt-1">
                Crea un nuovo studio di fattibilità immobiliare
              </p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="loading loading-spinner loading-sm mr-2"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Salva Progetto
              </>
            )}
          </button>
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
                  <input
                    type="text"
                    value={project.address || ''}
                    onChange={(e) => handleInputChange('basic', 'address', e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Es. Via Roma 123, Milano"
                  />
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
                  <input
                    type="number"
                    value={project.duration || 18}
                    onChange={(e) => handleInputChange('basic', 'duration', parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    placeholder="18"
                  />
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Marginalità Target (%)</span>
                  </label>
                  <input
                    type="number"
                    value={project.targetMargin || 30}
                    onChange={(e) => handleInputChange('basic', 'targetMargin', parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    placeholder="30"
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
                        type="number"
                        value={project.costs?.land?.purchasePrice || 0}
                        onChange={(e) => handleInputChange('costs', 'land.purchasePrice', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Imposte (9%)</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.land?.purchaseTaxes || 0}
                        onChange={(e) => handleInputChange('costs', 'land.purchaseTaxes', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Commissioni (3%)</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.land?.intermediationFees || 0}
                        onChange={(e) => handleInputChange('costs', 'land.intermediationFees', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
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
                  <h3 className="font-medium text-gray-900 mb-3">2. Costruzione</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Scavi e Fondazioni</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.construction?.excavation || 0}
                        onChange={(e) => handleInputChange('costs', 'construction.excavation', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Strutture</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.construction?.structures || 0}
                        onChange={(e) => handleInputChange('costs', 'construction.structures', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Impianti</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.construction?.systems || 0}
                        onChange={(e) => handleInputChange('costs', 'construction.systems', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Finiture</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.construction?.finishes || 0}
                        onChange={(e) => handleInputChange('costs', 'construction.finishes', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-500">Subtotale: </span>
                    <span className="font-medium">{formatCurrency(calculatedCosts.construction.subtotal)}</span>
                  </div>
                </div>

                {/* Altri Costi */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Altri Costi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Opere Esterne</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.externalWorks || 0}
                        onChange={(e) => handleInputChange('costs', 'externalWorks', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Oneri Concessori</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.concessionFees || 0}
                        onChange={(e) => handleInputChange('costs', 'concessionFees', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Progettazione</span>
                      </label>
                      <input
                        type="number"
                        value={project.costs?.design || 0}
                        onChange={(e) => handleInputChange('costs', 'design', parseInt(e.target.value))}
                        className="input input-bordered w-full"
                        placeholder="0"
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
                    type="number"
                    value={project.revenues?.pricePerSqm || 1700}
                    onChange={(e) => handleInputChange('revenues', 'pricePerSqm', parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    placeholder="1700"
                  />
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Altri Ricavi</span>
                  </label>
                  <input
                    type="number"
                    value={project.revenues?.otherRevenues || 0}
                    onChange={(e) => handleInputChange('revenues', 'otherRevenues', parseInt(e.target.value))}
                    className="input input-bordered w-full"
                    placeholder="0"
                  />
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 