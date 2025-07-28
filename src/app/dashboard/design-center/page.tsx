'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BuildingIcon } from '@/components/icons';
import Button from '@/components/ui/Button';

interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  style: string;
  efficiency: number;
  sustainability: number;
  thumbnailUrl?: string;
  features: string[];
  typicalUse: string;
  sqmRange: [number, number];
  estimatedCostPerSqm: number;
}

interface AIDesignSuggestion {
  id: string;
  title: string;
  reasoning: string;
  benefits: string[];
  implementation: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'LAYOUT' | 'SUSTAINABILITY' | 'EFFICIENCY' | 'AESTHETICS' | 'FUNCTIONALITY';
}

interface DesignParameters {
  projectType: 'RESIDENZIALE' | 'COMMERCIALE' | 'MISTO' | 'INDUSTRIALE';
  totalArea: number;
  floors: number;
  budget: number;
  style: 'MODERNO' | 'CLASSICO' | 'INDUSTRIALE' | 'MINIMALISTA' | 'SOSTENIBILE';
  priorities: string[];
  location: string;
  targetUsers: string;
}

export default function DesignCenterPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'ai-designer' | 'suggestions'>('templates');
  const [designParams, setDesignParams] = useState<DesignParameters>({
    projectType: 'RESIDENZIALE',
    totalArea: 1000,
    floors: 3,
    budget: 1500000,
    style: 'MODERNO',
    priorities: [],
    location: '',
    targetUsers: ''
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<AIDesignSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const designTemplates: DesignTemplate[] = [
    {
      id: 'res-modern-1',
      name: 'Villa Moderna Sostenibile',
      category: 'Residenziale',
      description: 'Design contemporaneo con focus su efficienza energetica e materiali sostenibili',
      style: 'Moderno',
      efficiency: 95,
      sustainability: 90,
      features: ['Pannelli solari', 'Isolamento avanzato', 'Domotica', 'Giardino pensile'],
      typicalUse: 'Abitazione familiare di lusso',
      sqmRange: [250, 400],
      estimatedCostPerSqm: 2200
    },
    {
      id: 'com-office-1',
      name: 'Ufficio Smart & Flexible',
      category: 'Commerciale', 
      description: 'Spazi modulari per lavoro ibrido con tecnologie integrate',
      style: 'Moderno',
      efficiency: 85,
      sustainability: 75,
      features: ['Pareti mobili', 'Sistema AVV', 'Illuminazione LED', 'Aria filtrata'],
      typicalUse: 'Uffici aziendali moderni',
      sqmRange: [500, 2000],
      estimatedCostPerSqm: 1800
    },
    {
      id: 'mix-complex-1',
      name: 'Complesso Misto Urban',
      category: 'Misto',
      description: 'Integrazione residenziale-commerciale con spazi comuni',
      style: 'Contemporaneo',
      efficiency: 80,
      sustainability: 85,
      features: ['Spazi coworking', 'Retail ground floor', 'Roof garden', 'Parcheggi'],
      typicalUse: 'Sviluppo urbano integrato',
      sqmRange: [1000, 5000],
      estimatedCostPerSqm: 2000
    }
  ];

  const generateAISuggestions = async () => {
    setLoading(true);
    
    // Simula analisi AI
    setTimeout(() => {
      const mockSuggestions: AIDesignSuggestion[] = [
        {
          id: '1',
          title: 'Ottimizzazione Layout per Massima Funzionalità',
          reasoning: `Basandosi su ${designParams.totalArea}m² e ${designParams.floors} piani, l'AI suggerisce una disposizione aperta per massimizzare la luce naturale e i flussi.`,
          benefits: ['Aumento del 15% dello spazio utilizzabile', 'Migliore illuminazione naturale', 'Flussi di movimento ottimizzati'],
          implementation: 'Posizionare le zone comuni al centro, servizi ai bordi, eliminare corridoi non necessari',
          priority: 'HIGH',
          category: 'LAYOUT'
        },
        {
          id: '2',
          title: 'Integrazione Tecnologie Smart per Efficienza',
          reasoning: 'Il budget di €' + designParams.budget.toLocaleString() + ' permette l\'integrazione di sistemi intelligenti per ridurre i costi operativi.',
          benefits: ['Riduzione 30% consumi energetici', 'Controllo remoto e automazione', 'Aumento valore immobile del 12%'],
          implementation: 'Sensori IoT, termostati smart, illuminazione adattiva, sistema gestione energetica',
          priority: 'HIGH',
          category: 'EFFICIENCY'
        },
        {
          id: '3',
          title: 'Materiali Sostenibili per Certificazione LEED',
          reasoning: 'Lo stile "' + designParams.style + '" si presta perfettamente a materiali eco-friendly che garantiscono certificazioni ambientali.',
          benefits: ['Certificazione LEED/BREEAM', 'Incentivi fiscali', 'Appeal marketing green'],
          implementation: 'Legno certificato FSC, isolanti naturali, vernici a basso VOC, sistemi raccolta acqua piovana',
          priority: 'MEDIUM',
          category: 'SUSTAINABILITY'
        },
        {
          id: '4',
          title: 'Design Biofilo per Benessere Abitativo',
          reasoning: 'L\'integrazione della natura negli spazi interni migliora significativamente la qualità della vita degli occupanti.',
          benefits: ['Miglioramento 25% benessere psicologico', 'Purificazione aria naturale', 'Riduzione stress'],
          implementation: 'Pareti verdi interne, lucernari, giardini interni, materiali naturali visibili',
          priority: 'MEDIUM',
          category: 'FUNCTIONALITY'
        }
      ];
      
      setAiSuggestions(mockSuggestions);
      setLoading(false);
    }, 2500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    return '🎨'; // Per ora uso emoji, poi si possono aggiungere icone specifiche
  };

  return (
    <DashboardLayout title="Design Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro Progettazione Intelligente</h1>
            <p className="text-gray-600">AI-powered design suggestions e template library</p>
          </div>
          <BuildingIcon className="h-8 w-8 text-blue-600" />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'templates', name: 'Template Library', icon: '📐' },
              { id: 'ai-designer', name: 'AI Designer', icon: '🤖' },
              { id: 'suggestions', name: 'Suggerimenti AI', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Template Architettonici</h3>
              <Button variant="outline">
                Filtra per Categoria
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {template.category}
                      </span>
                      <span className="text-sm text-gray-500">{template.style}</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Efficienza:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${template.efficiency}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-700">{template.efficiency}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sostenibilità:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${template.sustainability}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-700">{template.sustainability}%</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-500">Metratura:</span>
                        <span className="text-gray-700 ml-2">
                          {template.sqmRange[0]}-{template.sqmRange[1]} m²
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-500">Costo stimato:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          €{template.estimatedCostPerSqm}/m²
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-gray-500 mb-2">Caratteristiche:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature) => (
                          <span key={feature} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {feature}
                          </span>
                        ))}
                        {template.features.length > 3 && (
                          <span className="text-xs text-gray-400">+{template.features.length - 3}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button variant="primary" size="sm" fullWidth>
                        Usa Template
                      </Button>
                      <Button variant="outline" size="sm">
                        Dettagli
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai-designer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parameters Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Parametri Progetto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={designParams.projectType}
                    onChange={(e) => setDesignParams(prev => ({...prev, projectType: e.target.value as any}))}
                  >
                    <option value="RESIDENZIALE">Residenziale</option>
                    <option value="COMMERCIALE">Commerciale</option>
                    <option value="MISTO">Misto</option>
                    <option value="INDUSTRIALE">Industriale</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={designParams.totalArea}
                      onChange={(e) => setDesignParams(prev => ({...prev, totalArea: Number(e.target.value)}))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Piani</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={designParams.floors}
                      onChange={(e) => setDesignParams(prev => ({...prev, floors: Number(e.target.value)}))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={designParams.budget}
                    onChange={(e) => setDesignParams(prev => ({...prev, budget: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stile Architettonico</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={designParams.style}
                    onChange={(e) => setDesignParams(prev => ({...prev, style: e.target.value as any}))}
                  >
                    <option value="MODERNO">Moderno</option>
                    <option value="CLASSICO">Classico</option>
                    <option value="INDUSTRIALE">Industriale</option>
                    <option value="MINIMALISTA">Minimalista</option>
                    <option value="SOSTENIBILE">Sostenibile</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Località</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={designParams.location}
                    onChange={(e) => setDesignParams(prev => ({...prev, location: e.target.value}))}
                    placeholder="Es. Milano centro"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Utenti</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={designParams.targetUsers}
                    onChange={(e) => setDesignParams(prev => ({...prev, targetUsers: e.target.value}))}
                    placeholder="Es. Giovani professionisti"
                  />
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={loading}
                  onClick={generateAISuggestions}
                  className="mt-6"
                >
                  {loading ? 'AI sta progettando...' : 'Genera Suggerimenti AI'}
                </Button>
              </div>
            </div>

            {/* AI Analysis Results */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Analisi AI Design</h3>
              
              {!loading && aiSuggestions.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">🎨</div>
                    <p>Configura i parametri e genera suggerimenti AI</p>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">L'AI sta analizzando il progetto...</p>
                  </div>
                </div>
              )}
              
              {!loading && aiSuggestions.length > 0 && (
                <div className="text-center py-8 text-green-600">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="font-semibold">Analisi completata!</p>
                  <p className="text-sm text-gray-600">Vai alla tab "Suggerimenti AI" per vedere i risultati</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            {aiSuggestions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">💡</div>
                <p>Nessun suggerimento disponibile</p>
                <p className="text-sm">Vai alla tab "AI Designer" per generare suggerimenti</p>
              </div>
            )}

            {aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCategoryIcon(suggestion.category)}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                      <span className="text-xs text-gray-500">{suggestion.category}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{suggestion.reasoning}</p>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Benefici:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {suggestion.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Implementazione:</h5>
                  <p className="text-sm text-gray-600">{suggestion.implementation}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">
                    Applica al Progetto
                  </Button>
                  <Button variant="outline" size="sm">
                    Maggiori Dettagli
                  </Button>
                  <Button variant="ghost" size="sm">
                    Salva per Dopo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 