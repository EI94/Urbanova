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
import FeedbackWidget from '@/components/ui/FeedbackWidget';

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
  netPresentValue: number;
  internalRateOfReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'draft' | 'analyzed' | 'approved' | 'rejected';
  createdAt: string;
  lastModified: string;
  description?: string;
  marketAnalysis?: {
    averagePrice: number;
    pricePerSqm: number;
    marketTrend: 'rising' | 'stable' | 'declining';
    demandLevel: 'high' | 'medium' | 'low';
  };
}

interface ProjectStatistics {
  totalProjects: number;
  totalInvestment: number;
  averageYield: number;
  averageROI: number;
  approvedProjects: number;
  rejectedProjects: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FeasibilityAnalysisPage() {
  const [projects, setProjects] = useState<FeasibilityProject[]>([]);
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null);
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
      // Mock projects data
      const mockProjects: FeasibilityProject[] = [
        {
          id: '1',
          name: 'Villa Moderna Roma',
          location: 'Roma, RM',
          propertyType: 'Villa',
          totalInvestment: 850000,
          monthlyRent: 3500,
          annualYield: 4.94,
          roi: 12.5,
          paybackPeriod: 8.0,
          netPresentValue: 125000,
          internalRateOfReturn: 8.2,
          riskLevel: 'medium',
          status: 'analyzed',
          createdAt: '2024-01-15',
          lastModified: '2024-01-20',
          description: 'Villa moderna con giardino e piscina',
          marketAnalysis: {
            averagePrice: 4200,
            pricePerSqm: 3500,
            marketTrend: 'rising',
            demandLevel: 'high',
          },
        },
        {
          id: '2',
          name: 'Appartamento Milano Centro',
          location: 'Milano, MI',
          propertyType: 'Appartamento',
          totalInvestment: 450000,
          monthlyRent: 2200,
          annualYield: 5.87,
          roi: 15.2,
          paybackPeriod: 6.6,
          netPresentValue: 85000,
          internalRateOfReturn: 9.8,
          riskLevel: 'low',
          status: 'approved',
          createdAt: '2024-01-10',
          lastModified: '2024-01-18',
          description: 'Appartamento in zona centrale con terrazza',
          marketAnalysis: {
            averagePrice: 6800,
            pricePerSqm: 5500,
            marketTrend: 'rising',
            demandLevel: 'high',
          },
        },
        {
          id: '3',
          name: 'Uffici Napoli',
          location: 'Napoli, NA',
          propertyType: 'Uffici',
          totalInvestment: 1200000,
          monthlyRent: 4800,
          annualYield: 4.80,
          roi: 11.8,
          paybackPeriod: 8.5,
          netPresentValue: 95000,
          internalRateOfReturn: 7.5,
          riskLevel: 'high',
          status: 'draft',
          createdAt: '2024-01-05',
          lastModified: '2024-01-15',
          description: 'Spazi uffici in zona business',
          marketAnalysis: {
            averagePrice: 2800,
            pricePerSqm: 2200,
            marketTrend: 'stable',
            demandLevel: 'medium',
          },
        },
      ];

      // Calculate statistics
      const stats: ProjectStatistics = {
        totalProjects: mockProjects.length,
        totalInvestment: mockProjects.reduce((sum, p) => sum + p.totalInvestment, 0),
        averageYield: mockProjects.reduce((sum, p) => sum + p.annualYield, 0) / mockProjects.length,
        averageROI: mockProjects.reduce((sum, p) => sum + p.roi, 0) / mockProjects.length,
        approvedProjects: mockProjects.filter(p => p.status === 'approved').length,
        rejectedProjects: mockProjects.filter(p => p.status === 'rejected').length,
      };

      setProjects(mockProjects);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading feasibility data:', error);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      analyzed: 'text-blue-600 bg-blue-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Bozza',
      analyzed: 'Analizzato',
      approved: 'Approvato',
      rejected: 'Rigettato',
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
                <option value="all">Tutti gli Stati</option>
                <option value="draft">Bozza</option>
                <option value="analyzed">Analizzato</option>
                <option value="approved">Approvato</option>
                <option value="rejected">Rigettato</option>
              </select>
            </div>
          </div>

          {/* Projects List */}
            <div className="space-y-4">
            {filteredProjects.map(project => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.location} • {project.propertyType}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(project.riskLevel)}`}>
                      Rischio {getRiskLabel(project.riskLevel)}
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
                
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4">{project.description}</p>
          )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Creato: {formatDate(project.createdAt)}</span>
                    <span>Modificato: {formatDate(project.lastModified)}</span>
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

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
