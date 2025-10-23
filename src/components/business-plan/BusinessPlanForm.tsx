'use client';

/**
 * 🏦 BUSINESS PLAN FORM AVANZATO - VERSIONE EVOLUTA
 * 
 * Form intelligente per input rapido Business Plan con:
 * - Opzioni multiple per ricavi (totale, per unità, dettaglio, per mq)
 * - Costi dettagliati con breakdown completo
 * - Scenari terreno smart con logica avanzata
 * - Finanza con ammortamenti multipli (francese, italiano, bullet)
 * - Help tooltips e validazione real-time
 * - Integrazione OS per function calling
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, X, AlertCircle, Info, TrendingUp, DollarSign, Calendar, Building,
  HelpCircle, Calculator, Target, Landmark, Zap, ChevronDown, ChevronRight,
  Building2, Home, Store, Factory, MapPin, Clock, Percent, Euro
} from 'lucide-react';
import type { BusinessPlanInput, LandScenario } from '@/lib/businessPlanService';

interface BusinessPlanFormProps {
  initialData?: Partial<BusinessPlanInput> | undefined;
  feasibilityProjectId?: string | undefined;
  onSubmit: (data: BusinessPlanInput) => void;
  onCancel?: () => void;
  loading?: boolean;
}

// ============================================================================
// COMPONENTI HELPER
// ============================================================================

interface HelpTooltipProps {
  content: string;
  children: React.ReactNode;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
        <HelpCircle className="w-4 h-4 text-gray-400 ml-1 inline" />
      </div>
      
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  helpText?: string;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, helpText, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {helpText && (
        <HelpTooltip content={helpText}>
          <div></div>
        </HelpTooltip>
      )}
    </div>
    {children}
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPALE
// ============================================================================

export default function BusinessPlanForm({
  initialData,
  feasibilityProjectId,
  onSubmit,
  onCancel,
  loading = false
}: BusinessPlanFormProps) {
  
  // ============================================================================
  // STATE MANAGEMENT AVANZATO
  // ============================================================================
  
  const [formData, setFormData] = useState<Partial<BusinessPlanInput>>({
    projectName: initialData?.projectName || '',
    location: initialData?.location || '',
    type: initialData?.type || 'RESIDENTIAL',
    totalUnits: initialData?.totalUnits || 0,
    
    // Configurazione ricavi avanzata
    revenueConfig: {
      method: 'PER_UNIT',
      averagePrice: 0,
      salesCalendar: [],
      salesCommission: 3,
      discounts: 0,
      priceEscalation: 0,
      ...initialData?.revenueConfig
    },
    
    // Configurazione costi avanzata
    costConfig: {
      constructionMethod: 'PER_UNIT',
      constructionCostPerUnit: 0,
      contingency: 10,
      softCosts: {
        percentage: 15
      },
      developmentCharges: {
        method: 'PER_SQM',
        perSqm: 0
      },
      ...initialData?.costConfig
    },
    
    // Scenari terreno
    landScenarios: initialData?.landScenarios || [],
    
    // Configurazione finanza avanzata
    financeConfig: {
      discountRate: 12,
      debt: {
        enabled: false,
        amount: 0,
        interestRate: 6,
        term: 20,
        ltv: 70,
        dscr: 1.2,
        fees: 2,
        amortizationType: 'FRENCH'
      },
      ...initialData?.financeConfig
    },
    
    // Configurazione timing
    timingConfig: {
      constructionTimeline: [],
      permitDelay: 0,
      ...initialData?.timingConfig
    },
    
    // Target avanzati
    targets: {
      margin: 20,
      minimumDSCR: 1.2,
      targetIRR: 15,
      targetNPV: 0,
      paybackPeriod: 3,
      ...initialData?.targets
    }
  });
  
  const [activeTab, setActiveTab] = useState<'base' | 'revenue' | 'costs' | 'land' | 'finance' | 'timing' | 'targets'>('base');
  const [landScenarios, setLandScenarios] = useState<LandScenario[]>(formData.landScenarios || []);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [quickMetrics, setQuickMetrics] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    estimatedMargin: 0,
    landCostRange: { min: 0, max: 0 }
  });
  
  // ============================================================================
  // CALCOLI REAL-TIME AVANZATI
  // ============================================================================
  
  useEffect(() => {
    calculateQuickMetrics();
  }, [formData, landScenarios]);
  
  const calculateQuickMetrics = () => {
    try {
      // Calcolo ricavi
      let totalRevenue = 0;
      if (formData.revenueConfig?.method === 'TOTAL' && formData.revenueConfig?.totalRevenue) {
        totalRevenue = formData.revenueConfig.totalRevenue;
      } else if (formData.revenueConfig?.method === 'PER_UNIT' && formData.revenueConfig?.averagePrice) {
        totalRevenue = (formData.totalUnits || 0) * formData.revenueConfig.averagePrice;
      } else if (formData.revenueConfig?.method === 'PER_SQM' && formData.revenueConfig?.pricePerSqm && formData.revenueConfig?.averageUnitSize) {
        totalRevenue = (formData.totalUnits || 0) * formData.revenueConfig.pricePerSqm * formData.revenueConfig.averageUnitSize;
      }
      
      // Calcolo costi
      let totalCosts = 0;
      if (formData.costConfig?.constructionMethod === 'PER_UNIT' && formData.costConfig?.constructionCostPerUnit) {
        const constructionCosts = (formData.totalUnits || 0) * formData.costConfig.constructionCostPerUnit;
        const contingencyCosts = constructionCosts * ((formData.costConfig?.contingency || 0) / 100);
        const softCosts = constructionCosts * ((formData.costConfig?.softCosts?.percentage || 0) / 100);
        totalCosts = constructionCosts + contingencyCosts + softCosts;
      }
      
      // Calcolo range costi terreno
      const landCosts = landScenarios.map(s => {
        if (s.type === 'CASH' && s.upfrontPayment) return s.upfrontPayment;
        if (s.type === 'PERMUTA' && s.permuta) {
          return (s.permuta.unitsToGive * s.permuta.unitValue) + (s.permuta.cashContribution || 0);
        }
        return 0;
      });
      
      const landCostRange = {
        min: Math.min(...landCosts.filter(c => c > 0)),
        max: Math.max(...landCosts.filter(c => c > 0))
      };
      
      const estimatedMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts - landCostRange.min) / totalRevenue) * 100 : 0;
      
      setQuickMetrics({
        totalRevenue,
        totalCosts,
        estimatedMargin,
        landCostRange
      });
      
    } catch (error) {
      console.error('Errore calcolo metriche:', error);
    }
  };
  
  // ============================================================================
  // VALIDAZIONE AVANZATA
  // ============================================================================
  
  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    // Validazione base
    if (!formData.projectName?.trim()) errors.push('Nome progetto obbligatorio');
    if (!formData.location?.trim()) errors.push('Località obbligatoria');
    if (!formData.totalUnits || formData.totalUnits <= 0) errors.push('Numero unità deve essere > 0');
    
    // Validazione ricavi
    if (formData.revenueConfig?.method === 'PER_UNIT' && (!formData.revenueConfig?.averagePrice || formData.revenueConfig.averagePrice <= 0)) {
      errors.push('Prezzo medio per unità obbligatorio');
    }
    
    // Validazione costi
    if (formData.costConfig?.constructionMethod === 'PER_UNIT' && (!formData.costConfig?.constructionCostPerUnit || formData.costConfig.constructionCostPerUnit <= 0)) {
      errors.push('Costo costruzione per unità obbligatorio');
    }
    
    // Validazione scenari terreno
    if (landScenarios.length === 0) {
      errors.push('Almeno uno scenario terreno obbligatorio');
    }
    
    // Validazione finanza
    if (formData.financeConfig?.debt?.enabled) {
      if (!formData.financeConfig.debt.amount || formData.financeConfig.debt.amount <= 0) {
        errors.push('Importo finanziamento obbligatorio se abilitato');
      }
      if (!formData.financeConfig.debt.interestRate || formData.financeConfig.debt.interestRate <= 0) {
        errors.push('Tasso interesse obbligatorio');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  // ============================================================================
  // HANDLERS AVANZATI
  // ============================================================================
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const completeData: BusinessPlanInput = {
      projectName: formData.projectName!,
      location: formData.location!,
      type: formData.type!,
      totalUnits: formData.totalUnits!,
      revenueConfig: formData.revenueConfig!,
      costConfig: formData.costConfig!,
      landScenarios: landScenarios,
      financeConfig: formData.financeConfig!,
      timingConfig: formData.timingConfig!,
      targets: formData.targets!,
      sourceFeasibilityId: feasibilityProjectId
    };
    
    onSubmit(completeData);
  };
  
  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };
  
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderTabButton = (id: string, label: string, icon: React.ReactNode, count?: number) => (
    <button
      key={id}
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span className={`px-2 py-1 rounded-full text-xs ${
          activeTab === id ? 'bg-blue-500' : 'bg-gray-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
  
  // ============================================================================
  // RENDER PRINCIPALE
  // ============================================================================
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header con metriche quick */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Plan Avanzato</h2>
            <p className="text-gray-600">Configurazione completa per analisi finanziaria professionale</p>
          </div>
          
          {/* Metriche quick */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                €{quickMetrics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Ricavi Totali</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                €{quickMetrics.totalCosts.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Costi Costruzione</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {quickMetrics.estimatedMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Margine Stimato</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs avanzati */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
        <div className="flex space-x-2 overflow-x-auto">
          {renderTabButton('base', 'Progetto', <Building className="w-4 h-4" />)}
          {renderTabButton('revenue', 'Ricavi', <DollarSign className="w-4 h-4" />)}
          {renderTabButton('costs', 'Costi', <Calculator className="w-4 h-4" />)}
          {renderTabButton('land', 'Terreno', <MapPin className="w-4 h-4" />, landScenarios.length)}
          {renderTabButton('finance', 'Finanza', <Landmark className="w-4 h-4" />)}
          {renderTabButton('timing', 'Timing', <Clock className="w-4 h-4" />)}
          {renderTabButton('targets', 'Target', <Target className="w-4 h-4" />)}
        </div>
      </div>
      
      {/* Contenuto tabs */}
      <div className="space-y-6">
        
        {/* TAB BASE */}
        {activeTab === 'base' && (
          <SectionCard
            title="Informazioni Progetto"
            icon={<Building className="w-5 h-5 text-blue-600" />}
            helpText="Dati base del progetto immobiliare"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Progetto *
                </label>
                <input
                  type="text"
                  value={formData.projectName || ''}
                  onChange={(e) => updateFormData('projectName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Residenza del Sole"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Località *
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Milano, Via Roma 123"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Progetto *
                </label>
                <select
                  value={formData.type || 'RESIDENTIAL'}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData.totalUnits || ''}
                  onChange={(e) => updateFormData('totalUnits', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. 4"
                />
              </div>
            </div>
          </SectionCard>
        )}
        
        {/* TAB RICAVI */}
        {activeTab === 'revenue' && (
          <SectionCard
            title="Configurazione Ricavi Avanzata"
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            helpText="Scegli il metodo di input ricavi più adatto al tuo progetto"
          >
            <div className="space-y-6">
              
              {/* Metodo input ricavi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Metodo di Input Ricavi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'TOTAL', label: 'Totale', icon: <Euro className="w-4 h-4" />, desc: 'Valore totale ricavi' },
                    { id: 'PER_UNIT', label: 'Per Unità', icon: <Home className="w-4 h-4" />, desc: 'Prezzo medio per unità' },
                    { id: 'PER_SQM', label: 'Per mq', icon: <Building2 className="w-4 h-4" />, desc: 'Prezzo per metro quadro' },
                    { id: 'DETAILED', label: 'Dettagliato', icon: <Calculator className="w-4 h-4" />, desc: 'Mix unità dettagliato' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => updateFormData('revenueConfig.method', method.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.revenueConfig?.method === method.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {method.icon}
                        <span className="font-medium">{method.label}</span>
                      </div>
                      <div className="text-xs text-gray-500">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Input specifico per metodo */}
              {formData.revenueConfig?.method === 'TOTAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valore Totale Ricavi (€)
                    </label>
                    <input
                      type="number"
                      value={formData.revenueConfig?.totalRevenue || ''}
                      onChange={(e) => updateFormData('revenueConfig.totalRevenue', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="es. 1,680,000"
                    />
                  </div>
                </div>
              )}
              
              {formData.revenueConfig?.method === 'PER_UNIT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prezzo Medio per Unità (€)
                    </label>
                    <input
                      type="number"
                      value={formData.revenueConfig?.averagePrice || ''}
                      onChange={(e) => updateFormData('revenueConfig.averagePrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="es. 420,000"
                    />
                  </div>
                </div>
              )}
              
              {formData.revenueConfig?.method === 'PER_SQM' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prezzo per mq (€/mq)
                    </label>
                    <input
                      type="number"
                      value={formData.revenueConfig?.pricePerSqm || ''}
                      onChange={(e) => updateFormData('revenueConfig.pricePerSqm', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="es. 3,500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Superficie Media per Unità (mq)
                    </label>
                    <input
                      type="number"
                      value={formData.revenueConfig?.averageUnitSize || ''}
                      onChange={(e) => updateFormData('revenueConfig.averageUnitSize', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="es. 120"
                    />
                  </div>
                </div>
              )}
              
              {/* Parametri aggiuntivi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commissione Vendita (%)
                  </label>
                  <input
                    type="number"
                    value={formData.revenueConfig?.salesCommission || ''}
                    onChange={(e) => updateFormData('revenueConfig.salesCommission', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="es. 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sconti Medi (%)
                  </label>
                  <input
                    type="number"
                    value={formData.revenueConfig?.discounts || ''}
                    onChange={(e) => updateFormData('revenueConfig.discounts', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="es. 2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incremento Prezzi (%)
                  </label>
                  <input
                    type="number"
                    value={formData.revenueConfig?.priceEscalation || ''}
                    onChange={(e) => updateFormData('revenueConfig.priceEscalation', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="es. 1"
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        )}
        
        {/* Altri tabs continueranno... */}
        
      </div>
      
      {/* Footer con azioni */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-4">
          {validationErrors.length > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{validationErrors.length} errori da correggere</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={loading || validationErrors.length > 0}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Calcolando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Calcola Business Plan</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}