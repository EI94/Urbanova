'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calculator,
  TrendingUp,
  Euro,
  Building,
  Plus,
  BarChart3,
  Compare,
  CheckCircle,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Trophy,
  Target,
  Shield,
  Bot,
  Sparkles,
  CreditCard,
  Search,
} from 'lucide-react';
// import FeedbackWidget from '@/components/ui/FeedbackWidget';

// ============================================================================
// TYPES
// ============================================================================

interface FeasibilityProject {
  id: string;
  name: string;
  location: string;
  propertyType: string;
  totalInvestment: number;
  monthlyRent: number;
  annualYield: number;
  roi: number;
  paybackPeriod: number;
  status: 'draft' | 'in-progress' | 'completed' | 'cancelled';
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  totalProjects: number;
  totalInvestment: number;
  averageYield: number;
  averageROI: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockProjects: FeasibilityProject[] = [
  {
    id: '1',
    name: 'Residenziale Milano Centro',
    location: 'Milano, MI',
    propertyType: 'Appartamento',
    totalInvestment: 450000,
    monthlyRent: 2800,
    annualYield: 7.5,
    roi: 12.3,
    paybackPeriod: 8.2,
    status: 'completed',
    riskLevel: 'low',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Uffici Roma EUR',
    location: 'Roma, RM',
    propertyType: 'Ufficio',
    totalInvestment: 1200000,
    monthlyRent: 8500,
    annualYield: 8.5,
    roi: 15.2,
    paybackPeriod: 6.6,
    status: 'in-progress',
    riskLevel: 'medium',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
  },
];

const mockStatistics: Statistics = {
  totalProjects: 2,
  totalInvestment: 1650000,
  averageYield: 8.0,
  averageROI: 13.75,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FeasibilityAnalysisPage() {
  const [projects, setProjects] = useState<FeasibilityProject[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<FeasibilityProject | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjects(mockProjects);
      setStatistics(mockStatistics);
    } catch (err) {
      setError('Errore nel caricamento dei dati');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      'in-progress': 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Bozza',
      'in-progress': 'In Corso',
      completed: 'Completato',
      cancelled: 'Annullato',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100',
    };
    return colors[risk as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getRiskLabel = (risk: string) => {
    const labels = {
      low: 'Basso',
      medium: 'Medio',
      high: 'Alto',
    };
    return labels[risk as keyof typeof labels] || risk;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.propertyType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-red-600 text-xl">❌ {error}</div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Riprova
        </button>
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Analisi Fattibilità</h1>
                  <p className="text-sm text-gray-600">Valuta la fattibilità economica dei tuoi progetti</p>
                </div>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Nuova Analisi</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <Link href="/dashboard/unified" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span>Market Intelligence</span>
              </Link>
              <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Analisi Fattibilità</span>
              </Link>
              <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Building className="w-5 h-5" />
                <span>Design Center</span>
              </Link>
              <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Target className="w-5 h-5" />
                <span>Business Plan</span>
              </Link>
              <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Shield className="w-5 h-5" />
                <span>Permessi & Compliance</span>
              </Link>
              <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Project Timeline AI</span>
              </Link>
              <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Building className="w-5 h-5" />
                <span>Progetti</span>
              </Link>
              <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <CreditCard className="w-5 h-5" />
                <span>Billing & Usage</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalProjects}</p>
                  </div>
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Investimento Totale</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalInvestment)}</p>
                  </div>
                  <Euro className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rendimento Medio</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.averageYield.toFixed(2)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.averageROI.toFixed(1)}%</p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
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
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tutti gli stati</option>
                <option value="draft">Bozza</option>
                <option value="in-progress">In Corso</option>
                <option value="completed">Completato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progetti di Fattibilità</h2>
              
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto trovato</h3>
                  <p className="text-gray-600 mb-4">Non ci sono progetti che corrispondono ai filtri selezionati.</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Crea Nuovo Progetto
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.location} • {project.propertyType}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(project.riskLevel)}`}>
                            {getRiskLabel(project.riskLevel)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Euro className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Investimento</p>
                            <p className="font-medium text-gray-900">{formatCurrency(project.totalInvestment)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Rendimento Annuo</p>
                            <p className="font-medium text-gray-900">{project.annualYield}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">ROI</p>
                            <p className="font-medium text-gray-900">{project.roi}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Payback</p>
                            <p className="font-medium text-gray-900">{project.paybackPeriod} anni</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Creato il {formatDate(project.createdAt)} • Aggiornato il {formatDate(project.updatedAt)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
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
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calculator className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Nuova Analisi</h3>
                  <p className="text-sm text-gray-600">Crea una nuova analisi di fattibilità</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Compare className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Confronta Progetti</h3>
                  <p className="text-sm text-gray-600">Confronta più progetti tra loro</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Report Completo</h3>
                  <p className="text-sm text-gray-600">Genera report dettagliato</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Widget - Temporaneamente disabilitato per debug */}
      {/* <FeedbackWidget className="" /> */}
    </div>
  );
}