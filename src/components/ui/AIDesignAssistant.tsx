'use client';

import { useState, useEffect } from 'react';
import { 
  BrainIcon, 
  TrendingUpIcon, 
  LightBulbIcon,
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
  SparklesIcon,
  TargetIcon,
  ClockIcon,
  EuroIcon,
  ChartBarIcon,
  RocketIcon,
  ShieldCheckIcon,
  StarIcon
} from '@/components/icons';
import { 
  AIDesignSuggestion, 
  DesignOptimization, 
 
MarketAnalysis 
} from '@/lib/aiDesignService';
import { DesignTemplate, DesignCustomization, GeoLocation, BudgetBreakdown } from '@/lib/designCenterService';

interface AIDesignAssistantProps {
  template: DesignTemplate;
  customization: DesignCustomization;
  location: GeoLocation;
  budget: BudgetBreakdown;
  onOptimize: (optimization: DesignOptimization) => void;
}

export default function AIDesignAssistant({ 
  template, 
  customization, 
  location, 
  budget, 
  onOptimize 
}: AIDesignAssistantProps) {
  const [suggestions, setSuggestions] = useState<AIDesignSuggestion[]>([]);
  const [optimization, setOptimization] = useState<DesignOptimization | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'optimization' | 'market'>('suggestions');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  // Simula il caricamento dei suggerimenti AI
  useEffect(() => {
    loadAISuggestions();
  }, [template, customization, location, budget]);

  const loadAISuggestions = async () => {
    setLoading(true);
    
    // Simula delay per effetto realistico
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Suggerimenti di esempio per demo
    const demoSuggestions: AIDesignSuggestion[] = [
      {
        id: 'roi-001',
        title: 'Ottimizzazione Area Edificabile',
        reasoning: `L'area edificabile (${customization.area}m²) è solo il ${((customization.area / (customization.area + customization.gardenArea + customization.balconyArea)) * 100).toFixed(1)}% del totale. Aumentare l'area edificabile può migliorare significativamente il ROI.`,
        benefits: [
          'Maggiore superficie vendibile',
          'ROI potenziale +15-25%',
          'Migliore utilizzo del terreno'
        ],
        implementation: 'Ridurre area giardino e aumentare area edificabile',
        priority: 'HIGH',
        category: 'ROI',
        estimatedImpact: {
          roi: 20,
          cost: 50000,
          time: 2,
          marketValue: 15
        },
        confidence: 85
      },
      {
        id: 'sustainability-001',
        title: 'Sistema Fotovoltaico Integrato',
        reasoning: 'I pannelli solari possono ridurre significativamente i costi energetici e aumentare il valore della proprietà, specialmente in zone soleggiate.',
        benefits: [
          'Riduzione bolletta elettrica 60-80%',
          'Valore di mercato +10-15%',
          'Incentivi fiscali disponibili',
          'ROI potenziale +12-18%'
        ],
        implementation: 'Installazione sistema fotovoltaico 6-8kW con accumulo batterie',
        priority: 'HIGH',
        category: 'SUSTAINABILITY',
        estimatedImpact: {
          roi: 15,
          cost: 45000,
          time: 4,
          marketValue: 12
        },
        confidence: 88
      },
      {
        id: 'efficiency-001',
        title: 'Sistema Domotico Intelligente',
        reasoning: 'Un sistema domotico può ottimizzare i consumi energetici, migliorare la sicurezza e aumentare significativamente il valore della proprietà.',
        benefits: [
          'Ottimizzazione consumi energetici 20-30%',
          'Sicurezza e comfort migliorati',
          'Valore di mercato +15-25%',
          'ROI potenziale +18-25%'
        ],
        implementation: 'Sistema domotico integrato con controllo illuminazione, climatizzazione e sicurezza',
        priority: 'HIGH',
        category: 'EFFICIENCY',
        estimatedImpact: {
          roi: 22,
          cost: 55000,
          time: 5,
          marketValue: 20
        },
        confidence: 85
      },
      {
        id: 'aesthetics-001',
        title: 'Facciata Premium Mista',
        reasoning: 'Una facciata mista con materiali premium può distinguere la proprietà nel mercato e aumentare significativamente il valore percepito.',
        benefits: [
          'Distinzione nel mercato',
          'Valore di mercato +15-25%',
          'Appeal estetico superiore',
          'ROI potenziale +18-28%'
        ],
        implementation: 'Facciata mista con pietra naturale, legno termotrattato e acciaio',
        priority: 'HIGH',
        category: 'AESTHETICS',
        estimatedImpact: {
          roi: 23,
          cost: 65000,
          time: 6,
          marketValue: 20
        },
        confidence: 88
      }
    ];
    
    setSuggestions(demoSuggestions);
    setLoading(false);
  };

  const handleSuggestionToggle = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId);
    } else {
      newSelected.add(suggestionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleOptimizeDesign = async () => {
    if (selectedSuggestions.size === 0) return;
    
    setLoading(true);
    
    // Simula delay per effetto realistico
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedSuggestionObjects = suggestions.filter(s => selectedSuggestions.has(s.id));
    const totalCostIncrease = selectedSuggestionObjects.reduce((sum, s) => sum + s.estimatedImpact.cost, 0);
    const totalROIImprovement = selectedSuggestionObjects.reduce((sum, s) => sum + s.estimatedImpact.roi, 0);
    const totalTimeIncrease = selectedSuggestionObjects.reduce((sum, s) => sum + s.estimatedImpact.time, 0);
    
    const originalROI = 15; // ROI base
    const optimizedROI = originalROI + totalROIImprovement;
    const paybackPeriod = (totalCostIncrease / (totalROIImprovement / 12)) * 12; // mesi
    
    const optimization: DesignOptimization = {
      originalROI,
      optimizedROI,
      improvements: selectedSuggestionObjects,
      totalCostIncrease,
      totalTimeIncrease,
      paybackPeriod: Math.min(paybackPeriod, 60), // Max 60 mesi
      riskLevel: totalCostIncrease > 100000 ? 'HIGH' : totalCostIncrease > 50000 ? 'MEDIUM' : 'LOW'
    };
    
    setOptimization(optimization);
    setActiveTab('optimization');
    setLoading(false);
  };

  const handleMarketAnalysis = async () => {
    setLoading(true);
    
    // Simula delay per effetto realistico
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const analysis: MarketAnalysis = {
      trends: [
        'Mercato premium in forte crescita (+15-20% annuo)',
        'Richiesta crescente per progetti sostenibili',
        'Valorizzazione progetti con certificazioni green',
        'Preferenza per spazi aperti e flessibili',
        'Richiesta crescente per domotica integrata'
      ],
      opportunities: [
        'Certificazione energetica premium per mercato high-end',
        'Eligibilità per incentivi fiscali e green financing',
        'Giardino privato per famiglie premium',
        'Progetto esclusivo in zona a bassa densità'
      ],
      risks: [
        'Possibili variazioni normative urbanistiche',
        'Flessibilità dei tassi di interesse',
        'Cambiamenti nelle preferenze di mercato'
      ],
      recommendations: [
        'Priorizzare certificazioni green e materiali sostenibili',
        'Integrare sistemi domotici avanzati per appeal premium',
        'Sfruttare incentivi fiscali per migliorare la redditività'
      ],
      marketScore: 78,
      competitorAnalysis: {
        strengths: [
          'Progetti esistenti con caratteristiche consolidate',
          'Brand recognition nel mercato locale'
        ],
        weaknesses: [
          'Progetti spesso non aggiornati alle nuove tendenze',
          'Mancanza di certificazioni green e sostenibilità'
        ],
        opportunities: [
          'Differenziazione con progetti innovativi e sostenibili',
          'Certificazioni green per accesso a mercati premium'
        ]
      }
    };
    
    setMarketAnalysis(analysis);
    setActiveTab('market');
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ROI': return <TrendingUpIcon className="h-4 w-4" />;
              case 'SUSTAINABILITY': return <InfoIcon className="h-4 w-4" />;
      case 'EFFICIENCY': return <InfoIcon className="h-4 w-4" />;
      case 'AESTHETICS': return <StarIcon className="h-4 w-4" />;
      case 'FUNCTIONALITY': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <InfoIcon className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <BrainIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">🤖 AI Design Assistant</h2>
              <p className="text-blue-100 text-sm">Suggerimenti intelligenti per massimizzare il ROI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
              <span className="text-white text-sm font-medium">
                {selectedSuggestions.size} selezionati
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
                            <InfoIcon className="h-4 w-4 inline mr-2" />
            Suggerimenti AI
          </button>
          
          <button
            onClick={() => setActiveTab('optimization')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'optimization'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
                            <CheckCircleIcon className="h-4 w-4 inline mr-2" />
            Ottimizzazione ROI
          </button>
          
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'market'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 inline mr-2" />
            Analisi Mercato
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tab: Suggerimenti AI */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  💡 Suggerimenti Intelligenti per {template.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  L'AI ha analizzato il tuo progetto e suggerisce questi miglioramenti per massimizzare il ROI
                </p>
              </div>
              
              <button
                onClick={handleOptimizeDesign}
                disabled={selectedSuggestions.size === 0 || loading}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedSuggestions.size === 0 || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ottimizzando...
                  </div>
                ) : (
                  <>
                    <RocketIcon className="h-4 w-4 inline mr-2" />
                    Ottimizza Design ({selectedSuggestions.size})
                  </>
                )}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">L'AI sta analizzando il tuo progetto...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      selectedSuggestions.has(suggestion.id)
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSuggestionToggle(suggestion.id)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedSuggestions.has(suggestion.id)}
                          onChange={() => handleSuggestionToggle(suggestion.id)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(suggestion.category)}
                            <h4 className="text-lg font-semibold text-gray-900">
                              {suggestion.title}
                            </h4>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </span>
                            <span className="text-sm text-gray-500">
                              {suggestion.confidence}% confidenza
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{suggestion.reasoning}</p>
                        
                        {/* Benefits */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">✅ Benefici:</h5>
                          <ul className="space-y-1">
                            {suggestion.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Implementation */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">🔧 Implementazione:</h5>
                          <p className="text-sm text-gray-600">{suggestion.implementation}</p>
                        </div>
                        
                        {/* Impact Metrics */}
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <div className="text-green-600 font-semibold">+{suggestion.estimatedImpact.roi}%</div>
                            <div className="text-green-700">ROI</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-blue-600 font-semibold">€{suggestion.estimatedImpact.cost.toLocaleString()}</div>
                            <div className="text-blue-700">Costo</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <div className="text-purple-600 font-semibold">+{suggestion.estimatedImpact.time} sett</div>
                            <div className="text-purple-700">Tempo</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded-lg">
                            <div className="text-orange-600 font-semibold">+{suggestion.estimatedImpact.marketValue}%</div>
                            <div className="text-orange-700">Valore</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Ottimizzazione ROI */}
        {activeTab === 'optimization' && optimization && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎯 Ottimizzazione ROI Completata!
              </h3>
              <p className="text-gray-600">
                Ecco come l'AI ha ottimizzato il tuo design per massimizzare il ritorno sull'investimento
              </p>
            </div>

            {/* ROI Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {optimization.originalROI}%
                  </div>
                  <div className="text-green-700 font-medium">ROI Originale</div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-4xl text-gray-400">→</div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {optimization.optimizedROI}%
                  </div>
                  <div className="text-blue-700 font-medium">ROI Ottimizzato</div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                  +{(optimization.optimizedROI - optimization.originalROI).toFixed(1)}% Miglioramento ROI
                </div>
              </div>
            </div>

            {/* Optimization Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">💰 Investimento Aggiuntivo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costo totale:</span>
                    <span className="font-medium">€{optimization.totalCostIncrease.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo aggiuntivo:</span>
                    <span className="font-medium">{optimization.totalTimeIncrease} settimane</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payback period:</span>
                    <span className="font-medium">{optimization.paybackPeriod.toFixed(1)} mesi</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">⚠️ Livello di Rischio</h4>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(optimization.riskLevel)}`}>
                    {optimization.riskLevel}
                  </span>
                  <span className="text-sm text-gray-600">
                    {optimization.riskLevel === 'LOW' && 'Rischio basso - Investimento sicuro'}
                    {optimization.riskLevel === 'MEDIUM' && 'Rischio medio - Valutare attentamente'}
                    {optimization.riskLevel === 'HIGH' && 'Rischio alto - Richiede attenzione'}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Improvements */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                🚀 Miglioramenti Selezionati ({optimization.improvements.length})
              </h4>
              <div className="space-y-3">
                {optimization.improvements.map((improvement) => (
                  <div key={improvement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getCategoryIcon(improvement.category)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{improvement.title}</div>
                        <div className="text-sm text-gray-600">+{improvement.estimatedImpact.roi}% ROI</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">€{improvement.estimatedImpact.cost.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{improvement.estimatedImpact.time} sett</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => onOptimize(optimization)}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                Applica Ottimizzazioni
              </button>
              
              <button
                onClick={() => setActiveTab('suggestions')}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                ← Modifica Selezione
              </button>
            </div>
          </div>
        )}

        {/* Tab: Analisi Mercato */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  📊 Analisi Mercato per {template.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  Analisi completa del mercato, trend e opportunità per il tuo progetto
                </p>
              </div>
              
              <button
                onClick={handleMarketAnalysis}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Analizzando...' : 'Aggiorna Analisi'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analisi mercato in corso...</p>
              </div>
            ) : marketAnalysis ? (
              <div className="space-y-6">
                {/* Market Score */}
                <div className="text-center">
                  <div className="inline-block p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {marketAnalysis.marketScore}/100
                    </div>
                    <div className="text-blue-700 font-medium">Punteggio Mercato</div>
                  </div>
                </div>

                {/* Market Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trends */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <TrendingUpIcon className="h-4 w-4 mr-2" />
                      Trend di Mercato
                    </h4>
                    <ul className="space-y-2">
                      {marketAnalysis.trends.map((trend, index) => (
                        <li key={index} className="text-sm text-green-700 flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <InfoIcon className="h-4 w-4 mr-2" />
                      Opportunità
                    </h4>
                    <ul className="space-y-2">
                      {marketAnalysis.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <AlertIcon className="h-4 w-4 mr-2" />
                      Rischi
                    </h4>
                    <ul className="space-y-2">
                      {marketAnalysis.risks.map((risk, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Raccomandazioni
                    </h4>
                    <ul className="space-y-2">
                      {marketAnalysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-purple-700 flex items-start">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Competitor Analysis */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">🏆 Analisi Competitor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">Punti di Forza</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {marketAnalysis.competitorAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-red-700 mb-2">Debolezze</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {marketAnalysis.competitorAnalysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <AlertIcon className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Opportunità</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {marketAnalysis.competitorAnalysis.opportunities.map((opportunity, index) => (
                          <li key={index} className="flex items-start">
                            <InfoIcon className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analisi Mercato Non Disponibile</h3>
                <p className="text-gray-500 mb-4">
                  Clicca su "Aggiorna Analisi" per generare un'analisi completa del mercato
                </p>
                <button
                  onClick={handleMarketAnalysis}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Genera Analisi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon component per Leaf (non presente nelle icone esistenti)
const LeafIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);
