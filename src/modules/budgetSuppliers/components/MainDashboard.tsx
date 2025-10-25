'use client';

/**
 * 🎯 MAIN DASHBOARD - JOHNNY IVE STYLE
 * 
 * Dashboard principale con flusso guidato
 * Design minimalista e intuitivo come Apple
 * INTEGRA TUTTI I COMPONENTI ESISTENTI
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Euro, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Building2,
  Upload,
  Award,
  FileCheck,
  TrendingDown,
  Settings,
  Eye
} from 'lucide-react';
import { OnboardingGuide } from './OnboardingGuide';
import { CompareOffers } from './CompareOffers';
import { AwardDialog } from './AwardDialog';
import { ContractEditor } from './ContractEditor';
import { SalRecorder } from './SalRecorder';
import { VariationsDialog } from './VariationsDialog';
import { DriftDashboard } from './DriftDashboard';
import { ActionsBar } from './ActionsBar';
import { ImportDialog } from './ImportDialog';
import { RfpCreateDrawer } from './RfpCreateDrawer';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'planning';
  budget: number;
  progress: number;
  contracts?: any[];
  rfps?: any[];
  offers?: any[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  completed?: boolean;
}

interface TabContent {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  badge?: number;
}

// Import types from existing components
import { ComparisonResult } from '../api/compare';
import { AwardBundle, Contract } from '../api/contract';
import { SalEntry, VariationEntry } from '../api/progress';

export function MainDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  
  // Stati per gestire i componenti esistenti
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [awardedBundles, setAwardedBundles] = useState<AwardBundle[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [salEntries, setSalEntries] = useState<SalEntry[]>([]);
  const [variations, setVariations] = useState<VariationEntry[]>([]);
  
  // Stati per dialog e drawer
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isRfpDrawerOpen, setIsRfpDrawerOpen] = useState(false);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [isContractEditorOpen, setIsContractEditorOpen] = useState(false);
  const [isVariationsDialogOpen, setIsVariationsDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Mock projects - in realtà verrebbero da Firebase
  const projects: Project[] = [
    {
      id: 'ciliegie',
      name: 'Residenza Ciliegie',
      status: 'active',
      budget: 1250000,
      progress: 65
    },
    {
      id: 'test-project',
      name: 'Progetto Test',
      status: 'planning',
      budget: 800000,
      progress: 25
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'import-computo',
      title: 'Importa Computo',
      description: 'Carica il tuo computo metrico',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => setIsImportDialogOpen(true),
      completed: completedActions.includes('import-computo')
    },
    {
      id: 'create-rfp',
      title: 'Crea RFP',
      description: 'Genera richieste per fornitori',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => setIsRfpDrawerOpen(true),
      completed: completedActions.includes('create-rfp')
    },
    {
      id: 'compare-offers',
      title: 'Confronta Offerte',
      description: 'Analizza e confronta le offerte',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => setActiveTab('offers'),
      completed: completedActions.includes('compare-offers')
    },
    {
      id: 'award-contract',
      title: 'Aggiudica Contratto',
      description: 'Seleziona offerte vincenti',
      icon: <Euro className="w-6 h-6" />,
      color: 'bg-orange-500',
      action: () => setIsAwardDialogOpen(true),
      completed: completedActions.includes('award-contract')
    },
    {
      id: 'track-progress',
      title: 'Monitora Progressi',
      description: 'Registra SAL e variazioni',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-500',
      action: () => setActiveTab('progress'),
      completed: completedActions.includes('track-progress')
    },
    {
      id: 'drift-analysis',
      title: 'Analisi Drift',
      description: 'Budget vs Contratti vs Consuntivi',
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'bg-red-500',
      action: () => setActiveTab('drift'),
      completed: completedActions.includes('drift-analysis')
    }
  ];

  // Callback functions per i componenti esistenti
  const handleComparisonComplete = (result: ComparisonResult) => {
    setComparisonResult(result);
    setCompletedActions(prev => [...prev, 'compare-offers']);
  };

  const handleAwardComplete = (bundles: AwardBundle[]) => {
    setAwardedBundles(bundles);
    setCompletedActions(prev => [...prev, 'award-contract']);
  };

  const handleContractCreated = (contract: Contract) => {
    setContracts(prev => [...prev, contract]);
    setIsContractEditorOpen(false);
  };

  const handleSalRecorded = (sal: SalEntry) => {
    setSalEntries(prev => [...prev, sal]);
  };

  const handleVariationRecorded = (variation: VariationEntry) => {
    setVariations(prev => [...prev, variation]);
  };

  const handleItemsImport = (items: any[]) => {
    console.log('📦 [MAIN] Items imported:', items.length);
    setCompletedActions(prev => [...prev, 'import-computo']);
  };

  const handleRfpCreated = (rfp: any) => {
    console.log('📋 [MAIN] RFP created:', rfp);
    setCompletedActions(prev => [...prev, 'create-rfp']);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('overview');
  };

  // Funzioni di utilità
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'completed': return 'Completato';
      case 'planning': return 'Pianificazione';
      default: return 'Sconosciuto';
    }
  };

  // Creazione delle schede dinamiche
  const createTabs = (): TabContent[] => {
    if (!selectedProject) return [];

    return [
      {
        id: 'overview',
        title: 'Panoramica',
        icon: <Eye className="w-4 h-4" />,
        component: (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Euro className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    €{selectedProject.budget.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Budget Totale</h3>
                <p className="text-xs text-gray-400">Budget approvato per il progetto</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{selectedProject.progress}%</span>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Progresso</h3>
                <p className="text-xs text-gray-400">Completamento del progetto</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{contracts.length}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Contratti</h3>
                <p className="text-xs text-gray-400">Contratti attivi</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      action.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                      {action.completed && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'offers',
        title: 'Confronto Offerte',
        icon: <BarChart3 className="w-4 h-4" />,
        badge: comparisonResult ? 1 : undefined,
        component: (
          <CompareOffers 
            onComparisonComplete={handleComparisonComplete}
          />
        )
      },
      {
        id: 'contracts',
        title: 'Contratti',
        icon: <FileCheck className="w-4 h-4" />,
        badge: contracts.length > 0 ? contracts.length : undefined,
        component: (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Contratti Attivi</h3>
              <button
                onClick={() => setIsContractEditorOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Nuovo Contratto
              </button>
            </div>
            
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun contratto</h3>
                <p className="text-gray-500 mb-4">Crea il tuo primo contratto per iniziare</p>
                <button
                  onClick={() => setIsContractEditorOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crea Contratto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {contracts.map((contract, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{contract.title}</h4>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Attivo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Valore:</span>
                        <span className="ml-2 font-medium">€{contract.totalValue?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fornitore:</span>
                        <span className="ml-2 font-medium">{contract.vendorName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      },
      {
        id: 'progress',
        title: 'Progressi',
        icon: <TrendingUp className="w-4 h-4" />,
        badge: salEntries.length > 0 ? salEntries.length : undefined,
        component: (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Registrazione SAL</h3>
              <button
                onClick={() => setSelectedContract(contracts[0] || null)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={contracts.length === 0}
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Registra SAL
              </button>
            </div>
            
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun contratto</h3>
                <p className="text-gray-500">Crea un contratto per iniziare a registrare i progressi</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {contracts.map((contract, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{contract.title}</h4>
                    <SalRecorder
                      contract={contract}
                      onSalRecorded={handleSalRecorded}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      },
      {
        id: 'drift',
        title: 'Drift Analysis',
        icon: <TrendingDown className="w-4 h-4" />,
        component: (
          <DriftDashboard 
            projectId={selectedProject.id}
            onRefresh={() => console.log('Refresh drift data')}
          />
        )
      }
    ];
  };

  const handleActionComplete = (actionId: string) => {
    setCompletedActions([...completedActions, actionId]);
  };

  const tabs = createTabs();
  const activeTabContent = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget & Fornitori</h1>
              <p className="text-gray-600 mt-2">
                {selectedProject 
                  ? `Gestisci ${selectedProject.name}` 
                  : 'Gestisci budget, fornitori e contratti'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedProject && (
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cambia Progetto
                </button>
              )}
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap className="w-4 h-4 mr-2 inline" />
                Guida Rapida
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!selectedProject ? (
          <>
            {/* Project Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Seleziona Progetto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className="bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md border-gray-200 hover:border-gray-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {project.name}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-medium">€{project.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progresso:</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <div
                    key={action.id}
                    onClick={action.action}
                    className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                      action.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {action.description}
                          </p>
                        </div>
                        {action.completed && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Panoramica Progressi</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Completate</h3>
                  <p className="text-gray-600">{completedActions.length}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">In Corso</h3>
                  <p className="text-gray-600">{quickActions.length - completedActions.length}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Pendenti</h3>
                  <p className="text-gray-600">{quickActions.length - completedActions.length}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Totale</h3>
                  <p className="text-gray-600">{quickActions.length}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Project Header */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                          {getStatusText(selectedProject.status)}
                        </span>
                        <span className="text-gray-500">Budget: €{selectedProject.budget.toLocaleString()}</span>
                        <span className="text-gray-500">Progresso: {selectedProject.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsImportDialogOpen(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2 inline" />
                      Importa
                    </button>
                    <button
                      onClick={() => setIsRfpDrawerOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Users className="w-4 h-4 mr-2 inline" />
                      Crea RFP
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.title}</span>
                      {tab.badge && (
                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                {activeTabContent?.component}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Onboarding Guide */}
      {showOnboarding && (
        <OnboardingGuide 
          onClose={() => setShowOnboarding(false)}
          onActionComplete={handleActionComplete}
        />
      )}

      {/* Dialogs and Drawers */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleItemsImport}
      />

      <RfpCreateDrawer
        isOpen={isRfpDrawerOpen}
        onClose={() => setIsRfpDrawerOpen(false)}
        onRfpCreated={handleRfpCreated}
      />

      {comparisonResult && (
        <AwardDialog
          isOpen={isAwardDialogOpen}
          onClose={() => setIsAwardDialogOpen(false)}
          comparison={comparisonResult}
          onAwardComplete={handleAwardComplete}
        />
      )}

      {isContractEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Editor Contratto</h2>
              <button
                onClick={() => setIsContractEditorOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <ContractEditor
                bundle={awardedBundles[0] || null}
                onContractCreated={handleContractCreated}
              />
            </div>
          </div>
        </div>
      )}

      {selectedContract && (
        <VariationsDialog
          isOpen={isVariationsDialogOpen}
          onClose={() => setIsVariationsDialogOpen(false)}
          contract={selectedContract}
          onVariationRecorded={handleVariationRecorded}
        />
      )}
    </div>
  );
}
