'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFeasibilityProjects } from '../../../hooks/useFeasibilityProjects';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  FileText, 
  Building, 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Euro, 
  Trophy, 
  Target, 
  Shield, 
  Calendar, 
  CreditCard, 
  Search, 
  Calculator, 
  GitCompare
} from 'lucide-react';

export default function FeasibilityAnalysisPage() {
  const [isReady, setIsReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    type: 'residential',
    budget: '',
    description: ''
  });

  // Usa l'hook per caricare i progetti esistenti
  const { projects, loading, error, addProject } = useFeasibilityProjects();

  useEffect(() => {
    // Inizializzazione ultra-semplice
    const initializeComponent = async () => {
      try {
        // Aspetta che il DOM sia pronto
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsReady(true);
      } catch (err) {
        console.error('Error initializing component:', err);
        setIsReady(true);
      }
    };

    initializeComponent();
  }, []);

  const handleCreateProject = () => {
    if (newProject.name && newProject.location && newProject.budget) {
      const investment = parseFloat(newProject.budget) || 0;
      const revenue = investment * 1.5; // Stima del 50% di margine
      const roi = ((revenue - investment) / investment) * 100;
      const margin = ((revenue - investment) / revenue) * 100;

      addProject({
        name: newProject.name,
        location: newProject.location,
        type: newProject.type,
        status: 'draft',
        investment,
        revenue,
        roi,
        margin,
        description: newProject.description
      });

      setNewProject({ name: '', location: '', type: 'residential', budget: '', description: '' });
      setShowCreateModal(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvestment = projects.reduce((sum, project) => sum + project.investment, 0);
  const averageROI = projects.length > 0 ? projects.reduce((sum, project) => sum + project.roi, 0) / projects.length : 0;

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inizializzazione...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardLayout title="Analisi Fattibilità">
      <div className="space-y-6">
        {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 rounded-lg">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
          <div>
                      <h1 className="text-xl font-semibold text-gray-900">Analisi Fattibilità</h1>
                      <p className="text-sm text-gray-600">Valuta la fattibilità economica dei tuoi progetti</p>
                    </div>
                  </div>
          </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Progetto</span>
            </button>
          </div>
        </div>
          </div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investimento Totale</p>
                  <p className="text-2xl font-bold text-gray-900">€{totalInvestment.toLocaleString()}</p>
              </div>
                <Euro className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rendimento Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{averageROI.toFixed(1)}%</p>
              </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{averageROI.toFixed(1)}%</p>
              </div>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Progetti di Fattibilità</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cerca progetti..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
          </div>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Nuovo Progetto
                  </button>
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Nessun progetto trovato' : 'Nessun progetto trovato'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Prova a modificare i termini di ricerca.' : 'Inizia creando il tuo primo progetto di fattibilità.'}
                  </p>
                  {!searchTerm && (
                            <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Crea Nuovo Progetto
                            </button>
                  )}
            </div>
          ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600">{project.location}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">Tipo: {project.type}</span>
                            <span className="text-sm text-gray-500">Investimento: €{project.investment.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">Ricavi: €{project.revenue.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">ROI: {project.roi.toFixed(1)}%</span>
                            <span className="text-sm text-gray-500">Margine: {project.margin.toFixed(1)}%</span>
                          </div>
                          {project.description && (
                            <p className="text-xs text-gray-400 mt-1">{project.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            Visualizza
                            </button>
                          <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                            Analizza
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}
            </div>
        </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calculator className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Nuova Analisi</h3>
                  <p className="text-sm text-gray-600">Crea una nuova analisi di fattibilità</p>
                </div>
                  </button>

                  <button
                onClick={() => alert('Funzionalità di confronto in arrivo!')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GitCompare className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Confronta Progetti</h3>
                  <p className="text-sm text-gray-600">Confronta più progetti tra loro</p>
                </div>
                  </button>

                  <button
                onClick={() => alert('Funzionalità di report in arrivo!')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Report Completo</h3>
                  <p className="text-sm text-gray-600">Genera report dettagliato</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crea Nuovo Progetto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Progetto</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Es. Residenziale Milano Centro"
                />
              </div>
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Località</label>
                <input
                  type="text"
                  value={newProject.location}
                  onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Es. Milano, Italia"
                />
                      </div>
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Progetto</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="residential">Residenziale</option>
                  <option value="commercial">Commerciale</option>
                  <option value="industrial">Industriale</option>
                  <option value="mixed">Misto</option>
                </select>
                      </div>
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                <input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000000"
                />
                      </div>
                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrizione del progetto..."
                />
                      </div>
                    </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annulla
                </button>
                <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                Crea Progetto
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}