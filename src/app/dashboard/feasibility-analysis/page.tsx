'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFeasibilityProjects } from '../../../hooks/useFeasibilityProjects';
// Using simple SVG icons instead of lucide-react to avoid React error #130

// SVG Icon Components
const FileTextIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BuildingIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const EuroIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3c1.657 0 3-1.343 3-3s-1.343-3-3-3zm0 0V6m0 12v-2m-6-4h.01M6 16h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

const TrophyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const TargetIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ShieldIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CreditCardIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalculatorIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CompareIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

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
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5 text-white" />
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
              <PlusIcon className="w-4 h-4" />
              <span>Nuovo Progetto</span>
            </button>
          </div>
          </div>
        </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 min-h-screen shadow-sm">
          <div className="p-6">
            {/* Header Sidebar */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Analisi Fattibilità</h2>
                  <p className="text-xs text-gray-500">Valuta la fattibilità economica</p>
              </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <Link href="/dashboard/unified" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                  <BarChartIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                  <TrendingUpIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Market Intelligence</span>
              </Link>
              
              <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-4 py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg group">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileTextIcon className="w-4 h-4" />
                </div>
                <span className="font-semibold">Analisi Fattibilità</span>
              </Link>
              
              <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-purple-100 rounded-lg flex items-center justify-center transition-colors">
                  <BuildingIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Design Center</span>
              </Link>
              
              <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                  <TargetIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Business Plan</span>
              </Link>
              
              <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
                  <ShieldIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Permessi & Compliance</span>
              </Link>
              
              <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-cyan-100 rounded-lg flex items-center justify-center transition-colors">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Project Timeline AI</span>
              </Link>
              
              <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors">
                  <BuildingIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Progetti</span>
              </Link>
              
              <Link href="/dashboard/billing" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 rounded-xl transition-all duration-200 group">
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-yellow-100 rounded-lg flex items-center justify-center transition-colors">
                  <CreditCardIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Billing & Usage</span>
              </Link>
            </nav>

            {/* Footer Sidebar */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">Urbanova AI</p>
                <p className="text-xs text-gray-400">Smart City Platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
                <BuildingIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investimento Totale</p>
                  <p className="text-2xl font-bold text-gray-900">€{totalInvestment.toLocaleString()}</p>
              </div>
                <EuroIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rendimento Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{averageROI.toFixed(1)}%</p>
              </div>
                <TrendingUpIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{averageROI.toFixed(1)}%</p>
              </div>
                <TrophyIcon className="w-8 h-8 text-yellow-600" />
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
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                    <PlusIcon className="w-4 h-4 inline mr-2" />
                    Nuovo Progetto
                  </button>
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                      <PlusIcon className="w-4 h-4 inline mr-2" />
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
                <CalculatorIcon className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Nuova Analisi</h3>
                  <p className="text-sm text-gray-600">Crea una nuova analisi di fattibilità</p>
                </div>
                  </button>

                  <button
                onClick={() => alert('Funzionalità di confronto in arrivo!')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CompareIcon className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Confronta Progetti</h3>
                  <p className="text-sm text-gray-600">Confronta più progetti tra loro</p>
                </div>
                  </button>

                  <button
                onClick={() => alert('Funzionalità di report in arrivo!')}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChartIcon className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Report Completo</h3>
                  <p className="text-sm text-gray-600">Genera report dettagliato</p>
                </div>
              </button>
              </div>
                      </div>
                    </div>
                  </div>

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
      </div>
  );
}