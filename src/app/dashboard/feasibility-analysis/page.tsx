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
  GitCompare,
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
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FeasibilityAnalysisPage() {
  const { t, formatCurrency: fmtCurrency } = useLanguage();
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
          feasibilityService.getAllProjects(),
          feasibilityService.getProjectsRanking(),
        feasibilityService.getStatistics()
      ]);
      setProjects(allProjects);
      setRanking(projectsRanking);
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading feasibility data:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto?')) return;
    
    try {
      await feasibilityService.deleteProject(projectId);
      toast('Progetto eliminato con successo', { icon: '✅' });
      loadData();
    } catch (err) {
      console.error('Error deleting project:', err);
      toast('Errore nell\'eliminazione del progetto', { icon: '❌' });
    }
  };

  const handleRecalculateAll = async () => {
    setRecalculating(true);
    try {
      await feasibilityService.recalculateAllProjects();
      toast('Ricalcolo completato', { icon: '✅' });
      loadData();
    } catch (err) {
      console.error('Error recalculating projects:', err);
      toast('Errore nel ricalcolo', { icon: '❌' });
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
      <DashboardLayout title="Analisi Fattibilità">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analisi Fattibilità">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="text-red-600 text-xl">❌ {error}</div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Riprova
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analisi Fattibilità">
      <div className="space-y-6">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-gray-100 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Analisi Fattibilità
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">Valuta la fattibilità economica dei tuoi progetti</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard/feasibility-analysis/new"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Nuovo Progetto</span>
                </Link>
                <button
                  onClick={handleRecalculateAll}
                  disabled={recalculating}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  <Calculator className="w-5 h-5" />
                  <span className="font-medium">{recalculating ? 'Ricalcolando...' : 'Ricalcola Tutto'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Progetti Totali</p>
                  <p className="text-3xl font-bold text-blue-900">{statistics.totalProjects}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Investimento Totale</p>
                  <p className="text-3xl font-bold text-green-900">{fmtCurrency(statistics.totalInvestment)}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Euro className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Rendimento Medio</p>
                  <p className="text-3xl font-bold text-purple-900">{statistics.averageYield?.toFixed(2) || 0}%</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl border border-yellow-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">ROI Medio</p>
                  <p className="text-3xl font-bold text-yellow-900">{statistics.averageROI?.toFixed(1) || 0}%</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Projects List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Progetti di Fattibilità</h2>
                <p className="text-gray-600">Gestisci e monitora i tuoi progetti di analisi</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca progetti..."
                    className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors duration-200 w-80"
                  />
                </div>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Nessun progetto trovato</h3>
                <p className="text-gray-600 mb-8 text-lg">Inizia creando il tuo primo progetto di fattibilità per valutare la redditività dei tuoi investimenti.</p>
                <Link
                  href="/dashboard/feasibility-analysis/new"
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Crea Nuovo Progetto</span>
                </Link>
              </div>
            ) : (
            <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Building className="w-7 h-7 text-blue-600" />
                    </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600">{project.address}</p>
                        </div>
                  </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Euro className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Investimento</p>
                          <p className="font-medium text-gray-900">{fmtCurrency(project.costs.total)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Margine</p>
                          <p className="font-medium text-gray-900">{project.results.margin}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">ROI</p>
                          <p className="font-medium text-gray-900">{project.results.roi}%</p>
                        </div>
                    </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Payback</p>
                          <p className="font-medium text-gray-900">{Math.round(project.results.paybackPeriod / 12)} anni</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Creato il {formatDate(project.createdAt.toString())} • Aggiornato il {formatDate(project.updatedAt.toString())}
                      </div>

                    <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/feasibility-analysis/${project.id}`}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Visualizza"
                        >
                          <Eye className="w-5 h-5" />
                            </Link>
                        <Link
                          href={`/dashboard/feasibility-analysis/${project.id}/edit`}
                          className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Modifica"
                        >
                          <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProject(project.id!)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Elimina"
                        >
                          <Trash2 className="w-5 h-5" />
                            </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Modern Quick Actions */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Azioni Rapide</h2>
            <p className="text-gray-600">Accedi rapidamente alle funzionalità principali</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/feasibility-analysis/new"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Nuova Analisi</h3>
                  <p className="text-sm text-gray-600">Crea una nuova analisi di fattibilità</p>
                </div>
              </div>
            </Link>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <GitCompare className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Confronta Progetti</h3>
                  <p className="text-sm text-gray-600">Confronta più progetti tra loro</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleRecalculateAll}
              disabled={recalculating}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Ricalcola Tutto</h3>
                  <p className="text-sm text-gray-600">Ricalcola tutti i progetti</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget className="" />
    </DashboardLayout>
  );
}