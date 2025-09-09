'use client';

import { useState, useEffect } from 'react';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { useAuth } from '@/contexts/AuthContext';
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
  Search,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

export default function FeasibilityAnalysisPage() {
  const { t, formatCurrency: fmtCurrency } = useLanguage();
  const { currentUser, loading: authLoading } = useAuth();
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
    if (!authLoading) {
      if (currentUser) {
        console.log('✅ Utente autenticato, caricamento dati normali');
        loadData();
      } else {
        console.log('⚠️ Utente non autenticato, caricamento dati di test');
        loadDataForTest();
      }
    }
  }, [authLoading, currentUser]);

  const loadData = async () => {
    if (!currentUser) {
      setError('Utente non autenticato');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Caricamento progetti per utente:', currentUser.email);
      
      const [projectsData, rankingData, statisticsData] = await Promise.all([
        feasibilityService.getProjectsByUser(currentUser.uid),
        feasibilityService.getProjectsRanking(),
        feasibilityService.getStatistics()
      ]);
      
      console.log('✅ Progetti caricati:', projectsData.length);
      setProjects(projectsData);
      setRanking(rankingData);
      setStatistics(statisticsData);
    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  // Funzione per test senza autenticazione
  const loadDataForTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [TEST] Tentativo caricamento progetti...');
      
      // Prova a caricare i dati reali
      const [projectsData, rankingData, statisticsData] = await Promise.all([
        feasibilityService.getAllProjects(),
        feasibilityService.getProjectsRanking(),
        feasibilityService.getStatistics()
      ]);
      
      console.log('✅ [TEST] Progetti caricati:', projectsData.length);
      
      // Filtra progetti per pierpaolo.laurito@gmail.com
      const userProjects = projectsData.filter(project => 
        project.createdBy === 'pierpaolo.laurito@gmail.com'
      );
      
      console.log('👤 [TEST] Progetti per pierpaolo.laurito@gmail.com:', userProjects.length);
      
      // Cerca specificamente "Ciliegie"
      const ciliegieProject = projectsData.find(project => 
        project.name && project.name.toLowerCase().includes('ciliegie')
      );
      
      if (ciliegieProject) {
        console.log('🍒 [TEST] TROVATO PROGETTO CILIEGIE!', ciliegieProject);
        toast('🍒 Progetto Ciliegie trovato!', { icon: '✅' });
      } else {
        console.log('❌ [TEST] Progetto Ciliegie non trovato');
        toast('❌ Progetto Ciliegie non trovato', { icon: '❌' });
      }
      
      setProjects(userProjects);
      setRanking(rankingData);
      setStatistics(statisticsData);
    } catch (err) {
      console.error('❌ [TEST] Errore caricamento dati:', err);
      
      // Se Firebase non è configurato, mostra dati mock
      console.log('⚠️ [TEST] Firebase non configurato, usando dati mock');
      
      const mockProjects: FeasibilityProject[] = [
        {
          id: 'mock-1',
          name: 'Progetto Ciliegie',
          address: 'Via Roma, 123 - Roma EUR',
          createdBy: 'pierpaolo.laurito@gmail.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          costs: {
            total: 500000,
            land: 200000,
            construction: 250000,
            permits: 30000,
            other: 20000
          },
          results: {
            margin: 15.5,
            roi: 12.3,
            payback: 8.1
          }
        }
      ];
      
      setProjects(mockProjects);
      setRanking(mockProjects);
      setStatistics({
        totalProjects: 1,
        totalInvestment: 500000,
        averageYield: 15.5,
        averageROI: 12.3
      });
      
      toast('⚠️ Usando dati mock - Firebase non configurato', { icon: '⚠️' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto?')) return;
    
    try {
      await feasibilityService.deleteProject(projectId);
      await loadData();
      toast('Progetto eliminato con successo', { icon: '✅' });
    } catch (err) {
      console.error('Error deleting project:', err);
      toast('Errore nell\'eliminazione del progetto', { icon: '❌' });
    }
  };

  const handleRecalculateAll = async () => {
    setRecalculating(true);
    try {
      await feasibilityService.recalculateAllProjects();
      await loadData();
      toast('Ricalcolo completato con successo', { icon: '✅' });
    } catch (err) {
      console.error('Error recalculating:', err);
      toast('Errore nel ricalcolo', { icon: '❌' });
    } finally {
      setRecalculating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'text-gray-600 bg-gray-100',
      in_progress: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Bozza',
      in_progress: 'In Corso',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento analisi fattibilità...</p>
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
            onClick={loadData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
          <div>
                  <h1 className="text-xl font-semibold text-gray-900">Urbanova Dashboard</h1>
                  <p className="text-sm text-gray-500">Design Center & Project Management</p>
                </div>
              </div>
          </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
            </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DASHBOARD
                </h3>
                <Link
                  href="/dashboard"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>
              </div>

              {/* Discovery */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DISCOVERY
                </h3>
                <Link
                  href="/dashboard/market-intelligence"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Search className="w-4 h-4 mr-3" />
                  Market Intelligence
                </Link>
                <Link
                  href="/dashboard/feasibility-analysis"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-100 text-blue-700"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Design Center
                </Link>
              </div>

              {/* Planning & Compliance */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PLANNING/COMPLIANCE
                </h3>
                <Link
                  href="/dashboard/business-plan"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Business Plan
                </Link>
                <Link
                  href="/dashboard/permits-compliance"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </Link>
                <Link
                  href="/dashboard/project-timeline"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Project Timeline AI
                </Link>
            </div>

              {/* Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PROGETTI
                </h3>
                <Link
                  href="/dashboard/progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building className="w-4 h-4 mr-3" />
                  Progetti
                </Link>
                <Link
                  href="/dashboard/progetti/nuovo"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Nuovo Progetto
                </Link>
                <Link
                  href="/dashboard/mappa-progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Mappa Progetti
                </Link>
              </div>

              {/* Gestione Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GESTIONE PROGETTI
                </h3>
                <Link
                  href="/dashboard/project-management"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </Link>
                <Link
                  href="/dashboard/project-management/documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Documenti
                </Link>
                <Link
                  href="/dashboard/project-management/meetings"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Riunioni
                </Link>
            </div>

              {/* Marketing/Sales */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  MARKETING/SALES
                </h3>
                <Link
                  href="/dashboard/marketing"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Marketing
                </Link>
              </div>
            </nav>
          </div>
          </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Content Area */}
          <div className="flex-1 p-6">
            <div className="space-y-8">
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
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Investimento</p>
                                <p className="font-semibold text-gray-900">{fmtCurrency(project.costs.total)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Margine</p>
                                <p className="font-semibold text-gray-900">{project.results.margin?.toFixed(1) || 0}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">ROI</p>
                                <p className="font-semibold text-gray-900">{project.results.roi?.toFixed(1) || 0}%</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Payback</p>
                                <p className="font-semibold text-gray-900">{project.results.paybackPeriod?.toFixed(1) || 0} anni</p>
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
          </div>
        </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget className="" />
    </div>
  );
}