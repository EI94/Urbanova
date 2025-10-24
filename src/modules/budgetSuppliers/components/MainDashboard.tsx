'use client';

/**
 * 🎯 MAIN DASHBOARD - JOHNNY IVE STYLE
 * 
 * Dashboard principale con flusso guidato
 * Design minimalista e intuitivo come Apple
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
  Building2
} from 'lucide-react';
import { OnboardingGuide } from './OnboardingGuide';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'planning';
  budget: number;
  progress: number;
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

export function MainDashboard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

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
      action: () => console.log('Import computo'),
      completed: completedActions.includes('import-computo')
    },
    {
      id: 'create-rfp',
      title: 'Crea RFP',
      description: 'Genera richieste per fornitori',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => console.log('Create RFP'),
      completed: completedActions.includes('create-rfp')
    },
    {
      id: 'compare-offers',
      title: 'Confronta Offerte',
      description: 'Analizza e confronta le offerte',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => console.log('Compare offers'),
      completed: completedActions.includes('compare-offers')
    },
    {
      id: 'award-contract',
      title: 'Aggiudica Contratto',
      description: 'Seleziona offerte vincenti',
      icon: <Euro className="w-6 h-6" />,
      color: 'bg-orange-500',
      action: () => console.log('Award contract'),
      completed: completedActions.includes('award-contract')
    },
    {
      id: 'track-progress',
      title: 'Monitora Progressi',
      description: 'Registra SAL e variazioni',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-500',
      action: () => console.log('Track progress'),
      completed: completedActions.includes('track-progress')
    }
  ];

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleActionComplete = (actionId: string) => {
    setCompletedActions([...completedActions, actionId]);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingGuide />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget & Fornitori</h1>
              <p className="text-gray-600 mt-1">Gestisci computi, fornitori e contratti</p>
            </div>
            <button
              onClick={() => setShowOnboarding(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guida Passo-Passo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Project Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Seleziona Progetto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
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
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Budget:</span>
                      <span className="font-medium">€{project.budget.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progresso:</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
        {selectedProject && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Azioni Rapide - {selectedProject.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  onClick={action.action}
                  className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                    action.completed
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                        {action.completed ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          action.icon
                        )}
                      </div>
                      {action.completed && (
                        <span className="text-green-600 text-sm font-medium">Completato</span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {action.description}
                    </p>
                    
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <span>Inizia</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Overview */}
        {selectedProject && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stato Attuale</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">€{selectedProject.budget.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Budget Totale</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{selectedProject.progress}%</div>
                <div className="text-sm text-gray-600">Progresso</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-sm text-gray-600">Fornitori Attivi</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">45</div>
                <div className="text-sm text-gray-600">Giorni Rimanenti</div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Hai bisogno di aiuto?</h3>
              <p className="text-blue-800 mb-3">
                Se non sai da dove iniziare, clicca su "Guida Passo-Passo" per una spiegazione dettagliata di ogni funzione.
              </p>
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Avvia la guida →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
