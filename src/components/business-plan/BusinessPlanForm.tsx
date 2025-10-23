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
  Building2, Home, Store, Factory, MapPin, Clock, Percent, Euro,
  Upload, FileText, Download, Wrench, Hammer, Paintbrush, Cog, TreePine
} from 'lucide-react';
import type { BusinessPlanInput, LandScenario } from '@/lib/businessPlanService';

interface BusinessPlanFormProps {
  initialData?: Partial<BusinessPlanInput> | undefined;
  feasibilityProjectId?: string | undefined;
  onSubmit: (data: BusinessPlanInput) => void;
  onCancel?: () => void;
  loading?: boolean;
  onAutoSave?: (data: BusinessPlanInput) => Promise<void>;
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
  loading = false,
  onAutoSave
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isDraft, setIsDraft] = useState(false);
  const [hasBasicData, setHasBasicData] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [requiredFieldsInfo, setRequiredFieldsInfo] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [quickMetrics, setQuickMetrics] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    estimatedMargin: 0,
    landCostRange: { min: 0, max: 0 }
  });
  
  // ============================================================================
  // FILE UPLOAD FUNCTIONS
  // ============================================================================
  
  const handleFileUpload = async (file: File) => {
    setIsProcessingFile(true);
    setUploadedFile(file);
    
    try {
      // Simula l'elaborazione del file con AI
      console.log('🤖 Elaborazione file costi con AI...', file.name);
      
      // Qui implementeresti l'integrazione con l'AI per estrarre i costi
      // Per ora simuliamo con dati di esempio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simula l'estrazione dei costi dal file
      const extractedCosts = {
        constructionBreakdown: {
          structure: 400000,
          finishes: 200000,
          systems: 150000,
          external: 50000,
          permits: 30000,
          design: 40000,
          externalWorks: 80000
        },
        contingency: 5,
        softCosts: {
          percentage: 8,
          breakdown: {
            permits: 2,
            design: 3,
            legal: 1,
            marketing: 2
          }
        }
      };
      
      // Aggiorna il form con i costi estratti
      updateFormData('costConfig.constructionBreakdown', extractedCosts.constructionBreakdown);
      updateFormData('costConfig.contingency', extractedCosts.contingency);
      updateFormData('costConfig.softCosts', extractedCosts.softCosts);
      
      console.log('✅ Costi estratti dal file:', extractedCosts);
      
    } catch (error) {
      console.error('❌ Errore elaborazione file:', error);
    } finally {
      setIsProcessingFile(false);
    }
  };
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getFieldError = (fieldName: string): string | null => {
    return fieldErrors[fieldName]?.[0] || null;
  };
  
  const getFieldInfo = (fieldName: string): string | null => {
    const fieldMap: Record<string, string> = {
      'projectName': 'Nome progetto',
      'location': 'Località', 
      'totalUnits': 'Numero unità'
    };
    
    const fieldLabel = fieldMap[fieldName];
    return requiredFieldsInfo.includes(fieldLabel) ? `${fieldLabel} obbligatorio` : null;
  };
  
  const getFieldClassName = (fieldName: string, baseClassName: string): string => {
    const hasError = showValidation && !!getFieldError(fieldName);
    const hasInfo = !showValidation && !!getFieldInfo(fieldName);
    
    if (hasError) {
      return `${baseClassName} border-red-500 focus:ring-red-500 focus:border-red-500`;
    } else if (hasInfo) {
      return `${baseClassName} border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500`;
    }
    return baseClassName;
  };
  
  // ============================================================================
  // CALCOLI REAL-TIME AVANZATI
  // ============================================================================
  
  useEffect(() => {
    calculateQuickMetrics();
  }, [formData, landScenarios]);
  
  // Controlla campi obbligatori per informazioni (non errori)
  useEffect(() => {
    const requiredInfo: string[] = [];
    
    if (!formData.projectName?.trim()) {
      requiredInfo.push('Nome progetto');
    }
    if (!formData.location?.trim()) {
      requiredInfo.push('Località');
    }
    if (!formData.totalUnits || formData.totalUnits <= 0) {
      requiredInfo.push('Numero unità');
    }
    
    setRequiredFieldsInfo(requiredInfo);
    
    // Validazione completa solo se l'utente si avvicina al pulsante di calcolo
    if (showValidation) {
      validateForm();
    }
  }, [formData, landScenarios, showValidation]);
  
  // Controllo dati base per auto-salvataggio draft
  useEffect(() => {
    const hasBasic = !!(
      formData.projectName?.trim() && 
      formData.location?.trim() && 
      formData.totalUnits && 
      formData.totalUnits > 0
    );
    
    setHasBasicData(hasBasic);
    
    // Auto-salvataggio draft quando abbiamo dati base
    if (hasBasic && !isDraft && onAutoSave) {
      setIsDraft(true);
      console.log('📝 Auto-salvataggio draft attivato');
      
      // Chiama l'auto-salvataggio dopo un breve delay per evitare troppe chiamate
      const timeoutId = setTimeout(async () => {
        try {
          await onAutoSave(formData);
          console.log('✅ Draft salvato automaticamente');
        } catch (error) {
          console.error('❌ Errore auto-salvataggio:', error);
        }
      }, 2000); // 2 secondi di delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.projectName, formData.location, formData.totalUnits, isDraft, onAutoSave]);
  
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
  
  const validateForm = (): { isValid: boolean; errors: string[]; fieldErrors: Record<string, string[]> } => {
    const errors: string[] = [];
    const fieldErrors: Record<string, string[]> = {};
    
    // Validazione base
    if (!formData.projectName?.trim()) {
      errors.push('Nome progetto obbligatorio');
      fieldErrors.projectName = ['Nome progetto obbligatorio'];
    }
    if (!formData.location?.trim()) {
      errors.push('Località obbligatoria');
      fieldErrors.location = ['Località obbligatoria'];
    }
    if (!formData.totalUnits || formData.totalUnits <= 0) {
      errors.push('Numero unità deve essere maggiore di 0');
      fieldErrors.totalUnits = ['Numero unità deve essere maggiore di 0'];
    }
    
    // Validazione ricavi
    if (!formData.revenueConfig?.method) {
      errors.push('Seleziona metodo di input ricavi');
      fieldErrors.revenueMethod = ['Seleziona metodo di input ricavi'];
    } else {
      if (formData.revenueConfig.method === 'PER_UNIT' && (!formData.revenueConfig?.averagePrice || formData.revenueConfig.averagePrice <= 0)) {
        errors.push('Prezzo medio per unità obbligatorio');
        fieldErrors.averagePrice = ['Prezzo medio per unità obbligatorio'];
      }
      if (formData.revenueConfig.method === 'PER_SQM' && (!formData.revenueConfig?.pricePerSqm || formData.revenueConfig.pricePerSqm <= 0)) {
        errors.push('Prezzo per mq obbligatorio');
        fieldErrors.pricePerSqm = ['Prezzo per mq obbligatorio'];
      }
      if (formData.revenueConfig.method === 'PER_SQM' && (!formData.revenueConfig?.averageUnitSize || formData.revenueConfig.averageUnitSize <= 0)) {
        errors.push('Superficie media per unità obbligatoria');
        fieldErrors.averageUnitSize = ['Superficie media per unità obbligatoria'];
      }
      if (formData.revenueConfig.method === 'TOTAL' && (!formData.revenueConfig?.totalRevenue || formData.revenueConfig.totalRevenue <= 0)) {
        errors.push('Ricavi totali obbligatori');
        fieldErrors.totalRevenue = ['Ricavi totali obbligatori'];
      }
    }
    
    // Validazione costi
    if (!formData.costConfig?.constructionMethod) {
      errors.push('Seleziona metodo di input costi');
      fieldErrors.costMethod = ['Seleziona metodo di input costi'];
    } else {
      if (formData.costConfig.constructionMethod === 'PER_UNIT' && (!formData.costConfig?.constructionCostPerUnit || formData.costConfig.constructionCostPerUnit <= 0)) {
        errors.push('Costo costruzione per unità obbligatorio');
        fieldErrors.constructionCostPerUnit = ['Costo costruzione per unità obbligatorio'];
      }
      if (formData.costConfig.constructionMethod === 'PER_SQM' && (!formData.costConfig?.constructionCostPerSqm || formData.costConfig.constructionCostPerSqm <= 0)) {
        errors.push('Costo costruzione per mq obbligatorio');
        fieldErrors.constructionCostPerSqm = ['Costo costruzione per mq obbligatorio'];
      }
      if (formData.costConfig.constructionMethod === 'TOTAL' && (!formData.costConfig?.totalConstructionCost || formData.costConfig.totalConstructionCost <= 0)) {
        errors.push('Costo totale costruzione obbligatorio');
        fieldErrors.totalConstructionCost = ['Costo totale costruzione obbligatorio'];
      }
    }
    
    // Validazione scenari terreno
    if (landScenarios.length === 0) {
      errors.push('Almeno uno scenario terreno obbligatorio');
      fieldErrors.landScenarios = ['Almeno uno scenario terreno obbligatorio'];
    } else {
      landScenarios.forEach((scenario, index) => {
        if (scenario.type === 'CASH' && (!scenario.upfrontPayment || scenario.upfrontPayment <= 0)) {
          errors.push(`Scenario ${index + 1}: Pagamento anticipato obbligatorio`);
          fieldErrors[`landScenario_${index}`] = ['Pagamento anticipato obbligatorio'];
        }
        if (scenario.type === 'PERMUTA' && (!scenario.permuta?.unitsToGive || scenario.permuta.unitsToGive <= 0)) {
          errors.push(`Scenario ${index + 1}: Numero unità da dare obbligatorio`);
          fieldErrors[`landScenario_${index}`] = ['Numero unità da dare obbligatorio'];
        }
      });
    }
    
    // Validazione finanza
    if (formData.financeConfig?.debt?.enabled) {
      if (!formData.financeConfig.debt.amount || formData.financeConfig.debt.amount <= 0) {
        errors.push('Importo finanziamento obbligatorio se abilitato');
        fieldErrors.debtAmount = ['Importo finanziamento obbligatorio'];
      }
      if (!formData.financeConfig.debt.interestRate || formData.financeConfig.debt.interestRate <= 0) {
        errors.push('Tasso interesse obbligatorio');
        fieldErrors.interestRate = ['Tasso interesse obbligatorio'];
      }
    }
    
    setValidationErrors(errors);
    setFieldErrors(fieldErrors);
    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  };
  
  // ============================================================================
  // HANDLERS AVANZATI
  // ============================================================================
  
  const handleSubmit = () => {
    const validation = validateForm();
    if (!validation.isValid) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Plan</h2>
            <p className="text-gray-600">Configurazione completa per analisi finanziaria</p>
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
                  className={getFieldClassName('projectName', 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
                  placeholder="es. Residenza del Sole"
                />
                {getFieldError('projectName') && showValidation && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('projectName')}</p>
                )}
                {getFieldInfo('projectName') && !showValidation && (
                  <p className="mt-1 text-sm text-yellow-600">{getFieldInfo('projectName')}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Località *
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className={getFieldClassName('location', 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
                  placeholder="es. Milano, Via Roma 123"
                />
                {getFieldError('location') && showValidation && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('location')}</p>
                )}
                {getFieldInfo('location') && !showValidation && (
                  <p className="mt-1 text-sm text-yellow-600">{getFieldInfo('location')}</p>
                )}
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
                  className={getFieldClassName('totalUnits', 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
                  placeholder="es. 4"
                />
                {getFieldError('totalUnits') && showValidation && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('totalUnits')}</p>
                )}
                {getFieldInfo('totalUnits') && !showValidation && (
                  <p className="mt-1 text-sm text-yellow-600">{getFieldInfo('totalUnits')}</p>
                )}
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
        
        {/* TAB COSTI */}
        {activeTab === 'costs' && (
          <SectionCard
            title="Configurazione Costi Avanzata"
            icon={<Calculator className="w-5 h-5 text-blue-600" />}
            helpText="Scegli il metodo di input costi più adatto al tuo progetto"
          >
            <div className="space-y-6">
              
              {/* Upload File Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Upload File Costi</h3>
                  <HelpTooltip text="Carica un file Excel/PDF con i costi del progetto. L'AI estrarrà automaticamente i dati e popolerà il form." />
              </div>
              
                <div className="flex items-center space-x-4">
                    <input
                    type="file"
                    accept=".xlsx,.xls,.pdf,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="cost-file-upload"
                    disabled={isProcessingFile}
                  />
                  <label
                    htmlFor="cost-file-upload"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                      isProcessingFile 
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      {isProcessingFile ? 'Elaborazione...' : 'Carica File Costi'}
                    </span>
                  </label>
                  
                  {uploadedFile && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{uploadedFile.name}</span>
                    <button
                        onClick={() => setUploadedFile(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                      )}
            </div>
                    
                {isProcessingFile && (
                  <div className="mt-4 flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">L'AI sta elaborando il file...</span>
          </div>
        )}
                </div>
                
              {/* Metodo input costi */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Metodo di Input Costi
                  </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'PER_UNIT', label: 'Per Unità', icon: <Home className="w-4 h-4" />, desc: 'Costo medio per unità' },
                    { id: 'PER_SQM', label: 'Per mq', icon: <Building2 className="w-4 h-4" />, desc: 'Costo per metro quadro' },
                    { id: 'DETAILED', label: 'Dettagliato', icon: <Calculator className="w-4 h-4" />, desc: 'Breakdown completo' },
                    { id: 'TOTAL', label: 'Totale', icon: <Euro className="w-4 h-4" />, desc: 'Valore totale costi' }
                  ].map(method => (
                <button
                      key={method.id}
                      onClick={() => updateFormData('costConfig.constructionMethod', method.id as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.costConfig?.constructionMethod === method.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {method.icon}
                        <span className="font-medium">{method.label}</span>
                        <span className="text-xs text-center">{method.desc}</span>
                </div>
                </button>
                  ))}
              </div>
            </div>
            
              {/* Input condizionali basati sul metodo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
                {/* Per Unità */}
                {formData.costConfig?.constructionMethod === 'PER_UNIT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo Costruzione per Unità (€)
                  </label>
                  <input
                    type="number"
                      value={formData.costConfig?.constructionCostPerUnit || ''}
                      onChange={(e) => updateFormData('costConfig.constructionCostPerUnit', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. 200000"
                        />
                </div>
                    )}
                
                {/* Per mq */}
                {formData.costConfig?.constructionMethod === 'PER_SQM' && (
                  <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo Costruzione per mq (€)
                  </label>
                  <input
                    type="number"
                        value={formData.costConfig?.constructionCostPerSqm || ''}
                        onChange={(e) => updateFormData('costConfig.constructionCostPerSqm', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 1500"
                          />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                        Superficie Media per Unità (mq)
                  </label>
                  <input
                    type="number"
                        value={formData.costConfig?.averageUnitSize || ''}
                        onChange={(e) => updateFormData('costConfig.averageUnitSize', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. 100"
                          />
                </div>
                  </>
                )}
                
                {/* Totale */}
                {formData.costConfig?.constructionMethod === 'TOTAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo Totale Costruzione (€)
                  </label>
                  <input
                    type="number"
                      value={formData.costConfig?.totalConstructionCost || ''}
                      onChange={(e) => updateFormData('costConfig.totalConstructionCost', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. 800000"
                    />
                </div>
        )}
        
                {/* Breakdown dettagliato completo */}
                {formData.costConfig?.constructionMethod === 'DETAILED' && (
                  <div className="col-span-2">
                    <div className="space-y-6">
                      
                      {/* Modalità Costi Costruzione */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Hammer className="w-5 h-5 text-orange-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Costi di Costruzione</h4>
                          <HelpTooltip text="Scegli come identificare i costi di costruzione" />
                        </div>
                        
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Modalità
                          </label>
                          <div className="flex space-x-2">
                            {[
                              { id: 'TOTAL', label: 'A corpo totale', desc: 'Valore totale costi costruzione' },
                              { id: 'PER_SQM', label: 'A corpo per mq', desc: 'Costo per metro quadro' },
                              { id: 'DETAILED', label: 'In dettaglio', desc: 'Breakdown completo per categoria' }
                            ].map(mode => (
                              <button
                                key={mode.id}
                                onClick={() => updateFormData('costConfig.constructionMode', mode.id as any)}
                                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                                  formData.costConfig?.constructionMode === mode.id
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                              >
                                {mode.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Input basato sulla modalità selezionata */}
                        {formData.costConfig?.constructionMode === 'TOTAL' && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Costo Totale Costruzione (€)
                            </label>
                            <input
                              type="number"
                              value={formData.costConfig?.totalConstructionCost || ''}
                              onChange={(e) => updateFormData('costConfig.totalConstructionCost', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="es. 1115000"
                            />
                          </div>
                        )}
                        
                        {formData.costConfig?.constructionMode === 'PER_SQM' && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Costo per mq (€)
                              </label>
                              <input
                                type="number"
                                value={formData.costConfig?.constructionCostPerSqm || ''}
                                onChange={(e) => updateFormData('costConfig.constructionCostPerSqm', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="es. 1500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Superficie Totale (mq)
                              </label>
                              <input
                                type="number"
                                value={formData.costConfig?.totalArea || ''}
                                onChange={(e) => updateFormData('costConfig.totalArea', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="es. 743"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Breakdown dettagliato per categoria */}
                      {formData.costConfig?.constructionMode === 'DETAILED' && (
                        <div>
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-3">
                              <Info className="w-4 h-4 inline mr-1" />
                              Inserisci i costi specifici per ogni categoria di costruzione
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Scavi e Fondazioni</label>
                              <input
                                type="number"
                                value={formData.costConfig?.constructionBreakdown?.excavation || ''}
                                onChange={(e) => updateFormData('costConfig.constructionBreakdown.excavation', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="es. 111500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Strutture</label>
                              <input
                                type="number"
                                value={formData.costConfig?.constructionBreakdown?.structure || ''}
                                onChange={(e) => updateFormData('costConfig.constructionBreakdown.structure', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="es. 446000"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Impianti</label>
                              <input
                                type="number"
                                value={formData.costConfig?.constructionBreakdown?.systems || ''}
                                onChange={(e) => updateFormData('costConfig.constructionBreakdown.systems', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="es. 223000"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Finiture</label>
                              <input
                                type="number"
                                value={formData.costConfig?.constructionBreakdown?.finishes || ''}
                                onChange={(e) => updateFormData('costConfig.constructionBreakdown.finishes', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="es. 334500"
                              />
                            </div>
                          </div>
                          
                          {/* Subtotale */}
                          <div className="mt-4 flex justify-end">
                            <div className="bg-gray-50 px-4 py-2 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">
                                Subtotale: {(
                                  (formData.costConfig?.constructionBreakdown?.excavation || 0) +
                                  (formData.costConfig?.constructionBreakdown?.structure || 0) +
                                  (formData.costConfig?.constructionBreakdown?.systems || 0) +
                                  (formData.costConfig?.constructionBreakdown?.finishes || 0)
                                ).toLocaleString('it-IT')} €
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    
                      {/* Costi Aggiuntivi */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <Wrench className="w-5 h-5 text-purple-600" />
                          <h4 className="text-lg font-semibold text-gray-900">Costi Aggiuntivi</h4>
                  </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                            <label className="block text-sm text-gray-600 mb-1">Oneri Concessori</label>
                        <input
                          type="number"
                              value={formData.costConfig?.constructionBreakdown?.permits || ''}
                              onChange={(e) => updateFormData('costConfig.constructionBreakdown.permits', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="es. 30000"
                        />
                      </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Progettazione</label>
                          <input
                            type="number"
                              value={formData.costConfig?.constructionBreakdown?.design || ''}
                              onChange={(e) => updateFormData('costConfig.constructionBreakdown.design', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="es. 40000"
                          />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Opere Esterne</label>
                          <input
                            type="number"
                              value={formData.costConfig?.constructionBreakdown?.externalWorks || ''}
                              onChange={(e) => updateFormData('costConfig.constructionBreakdown.externalWorks', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="es. 80000"
                          />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Altri Costi</label>
                          <input
                            type="number"
                              value={formData.costConfig?.constructionBreakdown?.other || ''}
                              onChange={(e) => updateFormData('costConfig.constructionBreakdown.other', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="es. 20000"
                          />
                        </div>
                        </div>
                      </div>
            </div>
          </div>
        )}
        
                {/* Contingenze */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contingenze (%)
              </label>
                <input
                type="number"
                    value={formData.costConfig?.contingency || ''}
                    onChange={(e) => updateFormData('costConfig.contingency', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="es. 10"
                  />
            </div>
        
              {/* Costi indiretti dettagliati */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Cog className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Costi Indiretti</h4>
            </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Percentuale Totale (%)
                    </label>
                    <input
                      type="number"
                      value={formData.costConfig?.softCosts?.percentage || ''}
                      onChange={(e) => updateFormData('costConfig.softCosts.percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. 8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Breakdown Costi Indiretti (%)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Permessi</label>
                    <input
                      type="number"
                          value={formData.costConfig?.softCosts?.breakdown?.permits || ''}
                          onChange={(e) => updateFormData('costConfig.softCosts.breakdown.permits', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="2"
                    />
                  </div>
                  <div>
                        <label className="block text-xs text-gray-600 mb-1">Progettazione</label>
                    <input
                      type="number"
                          value={formData.costConfig?.softCosts?.breakdown?.design || ''}
                          onChange={(e) => updateFormData('costConfig.softCosts.breakdown.design', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="3"
                    />
                  </div>
                  <div>
                        <label className="block text-xs text-gray-600 mb-1">Legali</label>
                    <input
                      type="number"
                          value={formData.costConfig?.softCosts?.breakdown?.legal || ''}
                          onChange={(e) => updateFormData('costConfig.softCosts.breakdown.legal', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="1"
                    />
                  </div>
                  <div>
                        <label className="block text-xs text-gray-600 mb-1">Marketing</label>
                    <input
                      type="number"
                          value={formData.costConfig?.softCosts?.breakdown?.marketing || ''}
                          onChange={(e) => updateFormData('costConfig.softCosts.breakdown.marketing', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="2"
                    />
                  </div>
                </div>
              </div>
            </div>
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
          {showValidation && validationErrors.length > 0 && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{validationErrors.length} errori da correggere</span>
              </div>
              <div className="text-xs text-red-500 max-w-md">
                {validationErrors.slice(0, 3).join(' • ')}
                {validationErrors.length > 3 && ` • +${validationErrors.length - 3} altri`}
              </div>
            </div>
          )}
          
          {!showValidation && requiredFieldsInfo.length > 0 && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-yellow-600">
                <Info className="w-5 h-5" />
                <span className="text-sm font-medium">Informazioni obbligatorie per generare il Business Plan</span>
              </div>
              <div className="text-xs text-yellow-500 max-w-md">
                {requiredFieldsInfo.slice(0, 3).join(' • ')}
                {requiredFieldsInfo.length > 3 && ` • +${requiredFieldsInfo.length - 3} altri`}
                <br />
                <span className="text-gray-500">Le altre vengono stimate dal sistema operativo OS se non completate</span>
              </div>
            </div>
          )}
          
          {isDraft && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm">Bozza salvata automaticamente</span>
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
            onClick={() => {
              setShowValidation(true);
              handleSubmit();
            }}
            onMouseEnter={() => setShowValidation(true)}
            disabled={loading || (showValidation && validationErrors.length > 0)}
            className={`px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
              (showValidation && validationErrors.length > 0)
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Calcolando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>
                  {showValidation && validationErrors.length > 0 
                    ? 'Completa i dati richiesti' 
                    : requiredFieldsInfo.length > 0 
                      ? 'Completa i dati richiesti' 
                      : 'Calcola Business Plan'
                  }
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}