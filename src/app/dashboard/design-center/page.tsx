'use client';

import React, { useState, useEffect } from 'react';
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
  
  const [designTemplates, setDesignTemplates] = useState<DesignTemplate[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AIDesignSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    // Carica template da Firestore (da implementare)
    const loadTemplates = async () => {
      try {
        // TODO: Implementare caricamento da Firestore
        // const data = await getDesignTemplates();
        // setDesignTemplates(data);
        
        // Per ora, array vuoto
        setDesignTemplates([]);
      } catch (error) {
        console.error('Errore nel caricamento dei template:', error);
        setDesignTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    
    loadTemplates();
  }, []);

  const generateAISuggestions = async () => {
    setLoading(true);
    
    try {
      // TODO: Implementare generazione AI reale
      // const suggestions = await generateDesignSuggestions(designParams);
      // setAiSuggestions(suggestions);
      
      // Per ora, array vuoto
      setAiSuggestions([]);
    } catch (error) {
      console.error('Errore nella generazione dei suggerimenti AI:', error);
      setAiSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDesignParams(prev => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value
    }));
  };

  const handlePriorityChange = (priority: string) => {
    setDesignParams(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-error';
      case 'MEDIUM': return 'text-warning';
      case 'LOW': return 'text-success';
      default: return 'text-neutral';
    }
  };

  const getCategoryIcon = (category: string) => {
    return <BuildingIcon className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Design Center</h1>
          <p className="text-neutral-600 mt-1">
            Template architettonici e suggerimenti AI per i tuoi progetti
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed">
          <button 
            className={`tab ${activeTab === 'templates' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Template
          </button>
          <button 
            className={`tab ${activeTab === 'ai-designer' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('ai-designer')}
          >
            AI Designer
          </button>
          <button 
            className={`tab ${activeTab === 'suggestions' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Suggerimenti
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {templatesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : designTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 mb-4">
                  <BuildingIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-neutral-700 mb-2">
                  Nessun template disponibile
                </h3>
                <p className="text-neutral-500">
                  I template architettonici saranno disponibili presto
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designTemplates.map((template) => (
                  <div key={template.id} className="card bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="card-body p-5">
                      <h3 className="card-title text-lg font-semibold text-neutral-900">
                        {template.name}
                      </h3>
                      <p className="text-neutral-600 text-sm mb-3">{template.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge badge-outline">{template.category}</span>
                        <span className="badge badge-outline">{template.style}</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Efficienza:</span>
                          <span className="font-medium">{template.efficiency}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Sostenibilità:</span>
                          <span className="font-medium">{template.sustainability}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Costo/m²:</span>
                          <span className="font-medium">{formatCurrency(template.estimatedCostPerSqm)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <h4 className="font-medium text-neutral-900 text-sm">Caratteristiche:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="badge badge-sm badge-outline">
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 3 && (
                            <span className="badge badge-sm badge-outline">
                              +{template.features.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="card-actions justify-end">
                        <Button variant="outline" size="sm">
                          Dettagli
                        </Button>
                        <Button variant="primary" size="sm">
                          Seleziona
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Designer Tab */}
        {activeTab === 'ai-designer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parameters Form */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Parametri Progetto</h2>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Tipo Progetto</span>
                  </label>
                  <select
                    name="projectType"
                    value={designParams.projectType}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="RESIDENZIALE">Residenziale</option>
                    <option value="COMMERCIALE">Commerciale</option>
                    <option value="MISTO">Misto</option>
                    <option value="INDUSTRIALE">Industriale</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Superficie (m²)</span>
                    </label>
                    <input
                      type="number"
                      name="totalArea"
                      value={designParams.totalArea}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="1000"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Piani</span>
                    </label>
                    <input
                      type="number"
                      name="floors"
                      value={designParams.floors}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="3"
                    />
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Budget (€)</span>
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={designParams.budget}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="1500000"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Stile</span>
                  </label>
                  <select
                    name="style"
                    value={designParams.style}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="MODERNO">Moderno</option>
                    <option value="CLASSICO">Classico</option>
                    <option value="INDUSTRIALE">Industriale</option>
                    <option value="MINIMALISTA">Minimalista</option>
                    <option value="SOSTENIBILE">Sostenibile</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Priorità</span>
                  </label>
                  <div className="space-y-2">
                    {['Efficienza Energetica', 'Sostenibilità', 'Funzionalità', 'Estetica', 'Costi'].map((priority) => (
                      <label key={priority} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={designParams.priorities.includes(priority)}
                          onChange={() => handlePriorityChange(priority)}
                        />
                        <span className="text-sm">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Località</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={designParams.location}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Milano, Lombardia"
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Utenti Target</span>
                  </label>
                  <input
                    type="text"
                    name="targetUsers"
                    value={designParams.targetUsers}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Famiglie, giovani professionisti..."
                  />
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                  onClick={generateAISuggestions}
                  disabled={!designParams.location || !designParams.targetUsers}
                >
                  {loading ? 'Generando...' : 'Genera Suggerimenti AI'}
                </Button>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Suggerimenti AI</h2>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : aiSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-neutral-400 mb-4">
                    <BuildingIcon className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">
                    Nessun suggerimento generato
                  </h3>
                  <p className="text-neutral-500">
                    Compila i parametri e genera suggerimenti AI personalizzati
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="card bg-base-100 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="card-title text-base font-semibold text-neutral-900">
                            {suggestion.title}
                          </h3>
                          <span className={`badge ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm text-neutral-600 mb-3">{suggestion.reasoning}</p>
                        
                        <div className="space-y-2 mb-3">
                          <h4 className="font-medium text-neutral-900 text-sm">Benefici:</h4>
                          <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                            {suggestion.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-neutral-900 text-sm">Implementazione:</h4>
                          <p className="text-sm text-neutral-600">{suggestion.implementation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <BuildingIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              Suggerimenti salvati
            </h3>
            <p className="text-neutral-500">
              I tuoi suggerimenti AI salvati appariranno qui
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 