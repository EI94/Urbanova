'use client';

/**
 * 🏦 BUSINESS PLAN FORM
 * 
 * Form intelligente per input rapido Business Plan (3-5 minuti)
 * Con defaults ragionevoli e validazione real-time
 */

import React, { useState, useEffect } from 'react';
import { Plus, X, AlertCircle, Info, TrendingUp, DollarSign, Calendar, Building } from 'lucide-react';
import type { BusinessPlanInput, LandScenario } from '@/lib/businessPlanService';

interface BusinessPlanFormProps {
  initialData?: Partial<BusinessPlanInput> | undefined;
  feasibilityProjectId?: string | undefined; // Se viene da Feasibility Analysis
  onSubmit: (data: BusinessPlanInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function BusinessPlanForm({
  initialData,
  feasibilityProjectId,
  onSubmit,
  onCancel,
  loading = false
}: BusinessPlanFormProps) {
  // State del form
  const [formData, setFormData] = useState<Partial<BusinessPlanInput>>({
    projectName: initialData?.projectName || '',
    location: initialData?.location || '',
    type: initialData?.type || 'RESIDENTIAL',
    totalUnits: initialData?.totalUnits || 0,
    
    // Ricavi (campi vuoti di default)
    averagePrice: initialData?.averagePrice || 0,
    salesCommission: initialData?.salesCommission || 0,
    discounts: initialData?.discounts || 0,
    
    // Costi diretti
    constructionCostPerUnit: initialData?.constructionCostPerUnit || 0,
    contingency: initialData?.contingency || 0,
    
    // Costi indiretti
    softCostPercentage: initialData?.softCostPercentage || 0,
    developmentCharges: initialData?.developmentCharges || 0,
    utilities: initialData?.utilities || 0,
    
    // Finanza
    discountRate: initialData?.discountRate || 0,
    
    // Tempi (vuoti di default)
    salesCalendar: initialData?.salesCalendar || [],
    constructionTimeline: initialData?.constructionTimeline || [],
    
    // Scenari terreno (vuoti di default)
    landScenarios: initialData?.landScenarios || [],
    
    // Target
    targetMargin: initialData?.targetMargin || 0,
    minimumDSCR: initialData?.minimumDSCR || 0
  });
  
  const [activeTab, setActiveTab] = useState<'base' | 'revenue' | 'costs' | 'land' | 'finance' | 'timing'>('base');
  const [landScenarios, setLandScenarios] = useState<LandScenario[]>(
    initialData?.landScenarios || []
  );
  
  const [showDebtConfig, setShowDebtConfig] = useState(false);
  const [debtConfig, setDebtConfig] = useState({
    ltvTarget: 70,
    interestRate: 6,
    fees: 2,
    gracePeriod: 12,
    amortizationMonths: 120
  });
  
  // Validazione e calcoli real-time
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [quickMetrics, setQuickMetrics] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    estimatedMargin: 0
  });
  
  // Calcola metriche quick ogni volta che cambiano i dati rilevanti
  useEffect(() => {
    const totalRevenue = (formData.totalUnits || 0) * (formData.averagePrice || 0);
    const revenueAfterCommission = totalRevenue * (1 - (formData.salesCommission || 0) / 100);
    
    const constructionCosts = (formData.totalUnits || 0) * (formData.constructionCostPerUnit || 0);
    const contingencyCosts = constructionCosts * ((formData.contingency || 0) / 100);
    const softCosts = constructionCosts * ((formData.softCostPercentage || 0) / 100);
    const otherCosts = (formData.developmentCharges || 0) + (formData.utilities || 0);
    
    // Costo terreno medio (usa S1 come reference)
    const landCost = landScenarios.find(s => s.id === 's1')?.upfrontPayment || 0;
    
    const totalCosts = constructionCosts + contingencyCosts + softCosts + otherCosts + landCost;
    const margin = ((revenueAfterCommission - totalCosts) / revenueAfterCommission) * 100;
    
    setQuickMetrics({
      totalRevenue: revenueAfterCommission,
      totalCosts,
      estimatedMargin: margin
    });
  }, [formData, landScenarios]);
  
  // Validazione
  useEffect(() => {
    const errors: string[] = [];
    
    if (!formData.projectName) errors.push('Nome progetto richiesto');
    if (!formData.totalUnits || formData.totalUnits < 1) errors.push('Numero unità deve essere >= 1');
    
    // Validazioni solo se i dati sono stati inseriti
    if (formData.averagePrice && formData.averagePrice < 1000) errors.push('Prezzo medio troppo basso');
    if (formData.constructionCostPerUnit && formData.constructionCostPerUnit < 1000) errors.push('Costo costruzione troppo basso');
    
    // Verifica calendario vendite solo se ci sono dati
    if (formData.totalUnits > 0 && (formData.salesCalendar || []).length > 0) {
      const totalSalesUnits = (formData.salesCalendar || []).reduce((sum, s) => sum + s.units, 0);
      const unitsInPermuta = landScenarios.reduce((sum, s) => sum + (s.unitsInPermuta || 0), 0);
      
      // Le unità in permuta sono scambiate con terreno, non vendute
      // Quindi: unità vendute + unità in permuta = unità totali
      if (totalSalesUnits + unitsInPermuta !== formData.totalUnits) {
        errors.push(`Incongruenza unità: ${totalSalesUnits} vendute + ${unitsInPermuta} permuta ≠ ${formData.totalUnits} totali`);
      }
    }
    
    setValidationErrors(errors);
  }, [formData, landScenarios]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationErrors.length > 0) {
      alert('Correggi gli errori prima di procedere:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    // Costruisci input completo
    const input: BusinessPlanInput = {
      projectId: feasibilityProjectId,
      projectName: formData.projectName!,
      location: formData.location || 'Non specificata',
      type: formData.type!,
      totalUnits: formData.totalUnits!,
      
      averagePrice: formData.averagePrice!,
      salesCalendar: formData.salesCalendar!,
      salesCommission: formData.salesCommission || 3,
      discounts: formData.discounts,
      
      constructionCostPerUnit: formData.constructionCostPerUnit!,
      contingency: formData.contingency || 10,
      
      softCostPercentage: formData.softCostPercentage || 8,
      developmentCharges: formData.developmentCharges || 0,
      utilities: formData.utilities || 0,
      
      landScenarios: landScenarios,
      
      discountRate: formData.discountRate || 12,
      debt: showDebtConfig ? debtConfig : undefined,
      
      constructionTimeline: formData.constructionTimeline!,
      
      targetMargin: formData.targetMargin,
      minimumDSCR: formData.minimumDSCR
    };
    
    onSubmit(input);
  };
  
  const addLandScenario = () => {
    const newId = `s${landScenarios.length + 1}`;
    setLandScenarios([
      ...landScenarios,
      {
        id: newId,
        name: `S${landScenarios.length + 1}: Nuovo Scenario`,
        type: 'CASH',
        upfrontPayment: 200000
      }
    ]);
  };
  
  const removeLandScenario = (id: string) => {
    if (landScenarios.length <= 1) {
      alert('Almeno uno scenario è richiesto');
      return;
    }
    setLandScenarios(landScenarios.filter(s => s.id !== id));
  };
  
  const updateLandScenario = (id: string, updates: Partial<LandScenario>) => {
    setLandScenarios(landScenarios.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };
  
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header con Quick Metrics */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Business Plan</h2>
            <p className="text-sm text-gray-600 mt-1">Compila i dati in 3-5 minuti • Defaults intelligenti pre-configurati</p>
          </div>
          {quickMetrics.totalRevenue > 0 && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <div className="text-gray-500 text-xs">Ricavi</div>
                <div className="font-bold text-green-600">€{(quickMetrics.totalRevenue / 1000).toFixed(0)}k</div>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <div className="text-gray-500 text-xs">Costi</div>
                <div className="font-bold text-orange-600">€{(quickMetrics.totalCosts / 1000).toFixed(0)}k</div>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <div className="text-gray-500 text-xs">Margine Est.</div>
                <div className={`font-bold ${quickMetrics.estimatedMargin > 15 ? 'text-green-600' : quickMetrics.estimatedMargin > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {quickMetrics.estimatedMargin.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">Correggi questi errori:</p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex space-x-6 overflow-x-auto">
          {[
            { id: 'base', label: 'Base', icon: Building },
            { id: 'revenue', label: 'Ricavi', icon: TrendingUp },
            { id: 'costs', label: 'Costi', icon: DollarSign },
            { id: 'land', label: 'Scenari Terreno', icon: Building },
            { id: 'finance', label: 'Finanza', icon: DollarSign },
            { id: 'timing', label: 'Tempi', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* TAB: Base */}
        {activeTab === 'base' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Progetto *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Progetto Ciliegie"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Località
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Milano, Zona Centrale"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipologia Progetto *
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="RESIDENTIAL">Residenziale</option>
                  <option value="COMMERCIAL">Commerciale</option>
                  <option value="MIXED">Misto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero Unità *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalUnits}
                  onChange={e => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margine Target (%)
                  <Info className="w-4 h-4 inline ml-1 text-gray-400" title="Margine minimo desiderato" />
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.targetMargin}
                  onChange={e => setFormData({ ...formData, targetMargin: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 15% (solido per residenziale)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasso Sconto VAN (%)
                  <Info className="w-4 h-4 inline ml-1 text-gray-400" title="Tasso per attualizzare i flussi" />
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={formData.discountRate}
                  onChange={e => setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 12% (standard settore)</p>
              </div>
            </div>
          </div>
        )}
        
        {/* TAB: Ricavi */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prezzo Medio per Unità (€) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={formData.averagePrice}
                  onChange={e => setFormData({ ...formData, averagePrice: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Totale ricavi: €{((formData.totalUnits || 0) * (formData.averagePrice || 0) / 1000).toFixed(0)}k
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commissioni Vendita (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.salesCommission}
                  onChange={e => setFormData({ ...formData, salesCommission: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 3%</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sconti Medi (%)
                <Info className="w-4 h-4 inline ml-1 text-gray-400" title="Sconto medio previsto su listino" />
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={formData.discounts}
                onChange={e => setFormData({ ...formData, discounts: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Opzionale (0 = nessuno sconto)</p>
            </div>
            
            {/* Calendario Vendite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendario Vendite
              </label>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {(formData.salesCalendar || []).map((sale, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <select
                      value={sale.period}
                      onChange={e => {
                        const newCalendar = [...(formData.salesCalendar || [])];
                        newCalendar[index].period = e.target.value;
                        setFormData({ ...formData, salesCalendar: newCalendar });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="t0">t0 (Oggi)</option>
                      <option value="t1">t1 (+12 mesi)</option>
                      <option value="t2">t2 (+24 mesi)</option>
                      <option value="t3">t3 (+36 mesi)</option>
                    </select>
                    
                    <input
                      type="number"
                      min="0"
                      value={sale.units}
                      onChange={e => {
                        const newCalendar = [...(formData.salesCalendar || [])];
                        newCalendar[index].units = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, salesCalendar: newCalendar });
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="N° unità"
                    />
                    
                    <span className="text-sm text-gray-600">unità</span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newCalendar = (formData.salesCalendar || []).filter((_, i) => i !== index);
                        setFormData({ ...formData, salesCalendar: newCalendar });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      salesCalendar: [
                        ...(formData.salesCalendar || []),
                        { period: 't2', units: 0 }
                      ]
                    });
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Periodo</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Totale vendite pianificate: {(formData.salesCalendar || []).reduce((sum, s) => sum + s.units, 0)} unità
              </p>
            </div>
          </div>
        )}
        
        {/* TAB: Costi */}
        {activeTab === 'costs' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Costi Diretti (Hard Costs)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Costruzione per Unità (€) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.constructionCostPerUnit}
                    onChange={e => setFormData({ ...formData, constructionCostPerUnit: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Totale: €{((formData.totalUnits || 0) * (formData.constructionCostPerUnit || 0) / 1000).toFixed(0)}k
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contingenze (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="1"
                    value={formData.contingency}
                    onChange={e => setFormData({ ...formData, contingency: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 10% (prudente)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Costi Indiretti (Soft Costs)</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soft Costs (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={formData.softCostPercentage}
                    onChange={e => setFormData({ ...formData, softCostPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Progettazione, DL, sicurezza</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oneri (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.developmentCharges}
                    onChange={e => setFormData({ ...formData, developmentCharges: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Urbanizzazioni</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allacci (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.utilities}
                    onChange={e => setFormData({ ...formData, utilities: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Luce, gas, acqua</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* TAB: Scenari Terreno - CONTINUA NEL PROSSIMO FILE... */}
        {activeTab === 'land' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-purple-900">Scenari Terreno</h4>
                  <p className="text-sm text-purple-700 mt-1">Confronta alternative di acquisizione</p>
                </div>
                <button
                  type="button"
                  onClick={addLandScenario}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Scenario</span>
                </button>
              </div>
              
              {/* Lista Scenari */}
              <div className="space-y-4">
                {landScenarios.map((scenario, index) => (
                  <div key={scenario.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={scenario.name}
                        onChange={e => updateLandScenario(scenario.id, { name: e.target.value })}
                        className="font-medium text-gray-900 border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-0 px-0"
                      />
                      {landScenarios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLandScenario(scenario.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Tipo Scenario */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <select
                          value={scenario.type}
                          onChange={e => updateLandScenario(scenario.id, { 
                            type: e.target.value as any,
                            // Reset campi non applicabili
                            upfrontPayment: e.target.value === 'CASH' ? scenario.upfrontPayment : undefined,
                            unitsInPermuta: e.target.value === 'PERMUTA' ? scenario.unitsInPermuta : undefined,
                            deferredPayment: e.target.value === 'DEFERRED_PAYMENT' ? scenario.deferredPayment : undefined
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="CASH">Cash Upfront</option>
                          <option value="PERMUTA">Permuta</option>
                          <option value="DEFERRED_PAYMENT">Pagamento Differito</option>
                          <option value="MIXED">Misto</option>
                          <option value="EARN_OUT">Earn-Out</option>
                          <option value="OPTION">Opzione</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Campi specifici per tipo */}
                    {scenario.type === 'CASH' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo Cash (€)</label>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={scenario.upfrontPayment || 0}
                          onChange={e => updateLandScenario(scenario.id, { upfrontPayment: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                    
                    {scenario.type === 'PERMUTA' && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Unità in Permuta</label>
                          <input
                            type="number"
                            min="0"
                            value={scenario.unitsInPermuta || 0}
                            onChange={e => updateLandScenario(scenario.id, { unitsInPermuta: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contributo Cash (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={scenario.cashContribution || 0}
                            onChange={e => updateLandScenario(scenario.id, { cashContribution: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Periodo Contributo</label>
                          <select
                            value={scenario.cashContributionPeriod || 't1'}
                            onChange={e => updateLandScenario(scenario.id, { cashContributionPeriod: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="t0">t0 (Oggi)</option>
                            <option value="t1">t1 (+12m)</option>
                            <option value="t2">t2 (+24m)</option>
                            <option value="t3">t3 (+36m)</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {scenario.type === 'DEFERRED_PAYMENT' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Importo Differito (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={scenario.deferredPayment || 0}
                            onChange={e => updateLandScenario(scenario.id, { deferredPayment: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Periodo Pagamento</label>
                          <select
                            value={scenario.deferredPaymentPeriod || 't1'}
                            onChange={e => updateLandScenario(scenario.id, { deferredPaymentPeriod: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="t1">t1 (+12m)</option>
                            <option value="t2">t2 (+24m)</option>
                            <option value="t3">t3 (+36m)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* TAB: Finanza */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showDebtConfig}
                  onChange={e => setShowDebtConfig(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Includi Finanziamento Bancario</span>
              </label>
              
              {showDebtConfig && (
                <span className="text-xs text-gray-500">DSCR min: {formData.minimumDSCR || 1.2}x</span>
              )}
            </div>
            
            {showDebtConfig && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LTV Target (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="5"
                      value={debtConfig.ltvTarget}
                      onChange={e => setDebtConfig({ ...debtConfig, ltvTarget: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Loan-to-Value (% sul valore)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tasso Interesse (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={debtConfig.interestRate}
                      onChange={e => setDebtConfig({ ...debtConfig, interestRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fees (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.25"
                      value={debtConfig.fees}
                      onChange={e => setDebtConfig({ ...debtConfig, fees: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (mesi)</label>
                    <input
                      type="number"
                      min="0"
                      max="36"
                      value={debtConfig.gracePeriod}
                      onChange={e => setDebtConfig({ ...debtConfig, gracePeriod: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ammortamento (mesi)</label>
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="12"
                      value={debtConfig.amortizationMonths}
                      onChange={e => setDebtConfig({ ...debtConfig, amortizationMonths: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DSCR Minimo Accettabile
                <Info className="w-4 h-4 inline ml-1 text-gray-400" title="Debt Service Coverage Ratio minimo per bancabilità" />
              </label>
              <input
                type="number"
                min="1"
                max="3"
                step="0.1"
                value={formData.minimumDSCR}
                onChange={e => setFormData({ ...formData, minimumDSCR: parseFloat(e.target.value) || 1.2 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 1.2x (standard bancario)</p>
            </div>
          </div>
        )}
        
        {/* TAB: Tempi */}
        {activeTab === 'timing' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline Costruzione
              </label>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {(formData.constructionTimeline || []).map((phase, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={phase.phase}
                      onChange={e => {
                        const newTimeline = [...(formData.constructionTimeline || [])];
                        newTimeline[index].phase = e.target.value;
                        setFormData({ ...formData, constructionTimeline: newTimeline });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="es. Fondazioni"
                    />
                    
                    <select
                      value={phase.period}
                      onChange={e => {
                        const newTimeline = [...(formData.constructionTimeline || [])];
                        newTimeline[index].period = e.target.value;
                        setFormData({ ...formData, constructionTimeline: newTimeline });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="t0">t0</option>
                      <option value="t1">t1</option>
                      <option value="t2">t2</option>
                      <option value="t3">t3</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newTimeline = (formData.constructionTimeline || []).filter((_, i) => i !== index);
                        setFormData({ ...formData, constructionTimeline: newTimeline });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      constructionTimeline: [
                        ...(formData.constructionTimeline || []),
                        { phase: '', period: 't1' }
                      ]
                    });
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Fase</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer con Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          
          <button
            type="submit"
            disabled={loading || validationErrors.length > 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Calcolo in corso...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                <span>Calcola Business Plan ({landScenarios.length} scenari)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

