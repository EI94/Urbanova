'use client';

import { useState, useEffect } from 'react';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { 
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
  FileText,
  Target,
  Shield,
  CreditCard,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

export default function FeasibilityAnalysisPage() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key: string) => key);
  const fmtCurrency = languageContext?.formatCurrency || ((amount: number) => `€${amount.toLocaleString('it-IT')}`);
  const [projects, setProjects] = useState<FeasibilityProject[]>([]);
  const [ranking, setRanking] = useState<FeasibilityProject[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<FeasibilityProject | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [project1Id, setProject1Id] = useState('');
  const [project2Id, setProject2Id] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
      loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
        const [allProjects, projectsRanking, stats] = await Promise.all([
        feasibilityService.getAllProjects().catch(() => []),
        feasibilityService.getProjectsRanking().catch(() => []),
        feasibilityService.getStatistics().catch(() => null)
      ]);
      setProjects(Array.isArray(allProjects) ? allProjects : []);
      setRanking(Array.isArray(projectsRanking) ? projectsRanking : []);
      setStatistics(stats || null);
    } catch (err) {
      console.error('Error loading feasibility data:', err);
      setError('Errore nel caricamento dei dati');
      // Fallback data
      setProjects([]);
      setRanking([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto?')) return;
    
    try {
      await feasibilityService.deleteProject(projectId);
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success('Progetto eliminato con successo');
      }
      loadData();
    } catch (err) {
      console.error('Error deleting project:', err);
      if (typeof toast !== 'undefined' && toast.error) {
        toast.error('Errore nell\'eliminazione del progetto');
      }
    }
  };

  const handleRecalculateAll = async () => {
    setRecalculating(true);
    try {
      await feasibilityService.recalculateAllProjects();
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success('Ricalcolo completato');
      }
      loadData();
    } catch (err) {
      console.error('Error recalculating projects:', err);
      if (typeof toast !== 'undefined' && toast.error) {
        toast.error('Errore nel ricalcolo');
      }
    } finally {
      setRecalculating(false);
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
      rejected: 'Rifiutato',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
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
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <nav className="space-y-2">
                <Link href="/dashboard/unified" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <BarChart3 className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <TrendingUp className="w-5 h-5" />
                  <span>Market Intelligence</span>
                </Link>
                <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg transition-colors" passHref>
                  <FileText className="w-5 h-5" />
                  <span>Analisi Fattibilità</span>
                </Link>
                <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Building className="w-5 h-5" />
                  <span>Design Center</span>
                </Link>
                <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Target className="w-5 h-5" />
                  <span>Business Plan</span>
                </Link>
                <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Shield className="w-5 h-5" />
                  <span>Permessi & Compliance</span>
                </Link>
                <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Calendar className="w-5 h-5" />
                  <span>Project Timeline AI</span>
                </Link>
                <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Building className="w-5 h-5" />
                  <span>Progetti</span>
                </Link>
                <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <CreditCard className="w-5 h-5" />
                  <span>Billing & Usage</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-center justify-center min-h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <nav className="space-y-2">
                <Link href="/dashboard/unified" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <BarChart3 className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <TrendingUp className="w-5 h-5" />
                  <span>Market Intelligence</span>
                </Link>
                <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg transition-colors" passHref>
                  <FileText className="w-5 h-5" />
                  <span>Analisi Fattibilità</span>
                </Link>
                <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Building className="w-5 h-5" />
                  <span>Design Center</span>
                </Link>
                <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Target className="w-5 h-5" />
                  <span>Business Plan</span>
                </Link>
                <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Shield className="w-5 h-5" />
                  <span>Permessi & Compliance</span>
                </Link>
                <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Calendar className="w-5 h-5" />
                  <span>Project Timeline AI</span>
                </Link>
                <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <Building className="w-5 h-5" />
                  <span>Progetti</span>
                </Link>
                <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                  <CreditCard className="w-5 h-5" />
                  <span>Billing & Usage</span>
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="text-red-600 text-xl">❌ {error}</div>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
            🔄 Riprova
          </button>
            </div>
          </div>
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
          <div>
                  <h1 className="text-xl font-semibold text-gray-900">Analisi Fattibilità</h1>
                  <p className="text-sm text-gray-600">Valuta la fattibilità economica dei tuoi progetti</p>
                </div>
              </div>
          </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard/feasibility-analysis/new"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                passHref
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Progetto</span>
              </Link>
              <button
                onClick={handleRecalculateAll}
                disabled={recalculating}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Calculator className="w-4 h-4" />
                <span>{recalculating ? 'Ricalcolando...' : 'Ricalcola Tutto'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <Link href="/dashboard/unified" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                <TrendingUp className="w-5 h-5" />
                <span>Market Intelligence</span>
              </Link>
              <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg transition-colors" passHref>
                <FileText className="w-5 h-5" />
                <span>Analisi Fattibilità</span>
              </Link>
              <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                <Building className="w-5 h-5" />
                <span>Design Center</span>
              </Link>
              <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                <Target className="w-5 h-5" />
                <span>Business Plan</span>
              </Link>
              <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                <Shield className="w-5 h-5" />
                <span>Permessi & Compliance</span>
              </Link>
              <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                <Calendar className="w-5 h-5" />
                <span>Project Timeline AI</span>
              </Link>
              <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
                <Building className="w-5 h-5" />
                <span>Progetti</span>
              </Link>
              <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" passHref>
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
                    <p className="text-2xl font-bold text-gray-900">{fmtCurrency(statistics.totalInvestment)}</p>
              </div>
                  <Euro className="w-8 h-8 text-green-600" />
              </div>
            </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rendimento Medio</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.averageYield?.toFixed(2) || 0}%</p>
              </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.averageROI?.toFixed(1) || 0}%</p>
            </div>
                  <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

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
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
          </div>
              </div>
              
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto trovato</h3>
                  <p className="text-gray-600 mb-4">Inizia creando il tuo primo progetto di fattibilità.</p>
                  <Link
                    href="/dashboard/feasibility-analysis/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    passHref
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Crea Nuovo Progetto
                  </Link>
            </div>
          ) : (
            <div className="space-y-4">
                  {projects.map((project) => (
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
                            <p className="font-medium text-gray-900">{fmtCurrency(project.totalInvestment)}</p>
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
                          Creato il {formatDate(project.createdAt)} • Aggiornato il {formatDate(project.lastModified)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/feasibility-analysis/${project.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Visualizza"
                            passHref
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/feasibility-analysis/${project.id}/edit`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifica"
                            passHref
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
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
              <Link
                href="/dashboard/feasibility-analysis/new"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                passHref
              >
                <Calculator className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Nuova Analisi</h3>
                  <p className="text-sm text-gray-600">Crea una nuova analisi di fattibilità</p>
                </div>
              </Link>

                <button
                onClick={() => setShowComparison(!showComparison)}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Compare className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Confronta Progetti</h3>
                  <p className="text-sm text-gray-600">Confronta più progetti tra loro</p>
                </div>
                </button>

                <button
                onClick={handleRecalculateAll}
                disabled={recalculating}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Ricalcola Tutto</h3>
                  <p className="text-sm text-gray-600">Ricalcola tutti i progetti</p>
                </div>
                </button>
              </div>
            </div>
          </div>
      </div>
      
      {/* Feedback Widget */}
      {typeof window !== 'undefined' && <FeedbackWidget className="" />}
    </div>
  );
}