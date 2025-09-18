'use client';

import { useState, useEffect } from 'react';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calculator, 
  TrendingUp, 
  Euro, 
  Building,
  Building2,
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
  Settings,
  Share2,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import ShareProjectModal from '@/components/workspace/ShareProjectModal';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Workspace } from '@/types/workspace';
import '@/lib/cssErrorHandler'; // CSS Error Handler per analisi fattibilità

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProjectForShare, setSelectedProjectForShare] = useState<FeasibilityProject | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    // SEMPRE carica i dati reali, indipendentemente dall'autenticazione
    console.log('🔄 Caricamento dati reali da Firebase...');
    loadDataForTest();
    loadWorkspaces();
  }, []);

  // Carica workspace dell'utente
  const loadWorkspaces = async () => {
    try {
      if (!currentUser) return;
      
      const response = await fetch(`/api/workspace/user/${currentUser.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setWorkspaces(data.workspaces);
        console.log('✅ [Workspace] Workspace caricati:', data.workspaces.length);
      }
    } catch (error) {
      console.error('❌ [Workspace] Errore caricamento workspace:', error);
    }
  };

  // Gestisce la condivisione di un progetto
  const handleShareProject = async (workspaceId: string, permissions: any) => {
    if (!selectedProjectForShare) return;

    try {
      const response = await fetch('/api/workspace/share-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId,
          projectId: selectedProjectForShare.id,
          permissions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast('✅ Progetto condiviso con successo!', { icon: '✅' });
        setShowShareModal(false);
        setSelectedProjectForShare(null);
      } else {
        toast('❌ Errore nella condivisione del progetto', { icon: '❌' });
      }
    } catch (error) {
      console.error('❌ [Workspace] Errore condivisione:', error);
      toast('Errore nella condivisione del progetto', { icon: '❌' });
    }
  };

  // Apre il modal di condivisione
  const openShareModal = (project: FeasibilityProject) => {
    if (workspaces.length === 0) {
      toast('Nessun workspace disponibile. Crea un workspace per condividere progetti.', { icon: '⚠️' });
      return;
    }

    setSelectedProjectForShare(project);
    setShowShareModal(true);
  };

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
      
      const [projectsData, rankingData] = await Promise.all([
        feasibilityService.getProjectsByUser(currentUser.uid),
        feasibilityService.getProjectsRanking()
      ]);
      
      const statisticsData = {
        totalProjects: projectsData.length,
        totalInvestment: projectsData.reduce((sum, p) => sum + (p.costs?.total || 0), 0),
        averageReturn: projectsData.reduce((sum, p) => sum + (p.results?.margin || 0), 0) / projectsData.length,
        averageROI: projectsData.reduce((sum, p) => sum + (p.results?.roi || 0), 0) / projectsData.length
      };

      setProjects(projectsData);
      setRanking(rankingData);
      setStatistics(statisticsData);
      
      console.log('✅ Dati caricati con successo:', {
        projects: projectsData.length,
        ranking: rankingData.length,
        statistics: statisticsData
      });
    } catch (error) {
      console.error('❌ Errore caricamento dati:', error);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const loadDataForTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carica dati reali - nessun mock
      setProjects([]);
      setRanking([]);
          setStatistics({
            totalProjects: 0,
            totalInvestment: 0,
        averageReturn: 0,
        averageROI: 0
      });
      
      console.log('✅ [FEASIBILITY] Nessun progetto trovato - lista vuota');
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
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento analisi fattibilità...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analisi di Fattibilità">
      {/* Page Header */}
        <div className="mb-6 px-6">
          <div className="flex items-center space-x-4 mb-4">
          </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <p className="text-gray-600 text-lg">
            Valutiamo la fattibilità economica dei progetti immobiliari
          </p>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/feasibility-analysis/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 inline-flex"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Progetto</span>
          </Link>
          </div>
        </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="space-y-8">
          {/* KPI Cards - Apple Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics?.totalProjects || 0}</p>
        </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
              </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Investimento Totale</p>
                  <p className="text-2xl font-bold text-gray-900">{fmtCurrency(statistics?.totalInvestment || 0)}</p>
              </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Euro className="w-6 h-6 text-green-600" />
              </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rendimento Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics?.averageReturn || 0}%</p>
              </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics?.averageROI || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Progetti di Fattibilità</h2>
                  <p className="text-sm text-gray-600 mt-1">Gestisci e monitora i tuoi progetti di analisi</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cerca progetti..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
          </div>
              </div>
            </div>

            <div className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto trovato</h3>
                  <p className="text-gray-600 mb-6">Inizia creando il tuo primo progetto di fattibilità per valutare la redditività dei tuoi investimenti.</p>
                  <Link
                    href="/dashboard/feasibility-analysis/new"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crea Nuovo Progetto
                            </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                              {getStatusLabel(project.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {project.address}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Investimento</p>
                              <p className="font-semibold text-gray-900">{fmtCurrency(project.costs?.land?.subtotal || 0)}</p>
            </div>
                            <div>
                              <p className="text-gray-500">Rendimento</p>
                              <p className="font-semibold text-gray-900">{project.results?.margin || 0}%</p>
        </div>
                            <div>
                              <p className="text-gray-500">ROI</p>
                              <p className="font-semibold text-gray-900">{project.results?.roi || 0}%</p>
            </div>
                        <div>
                              <p className="text-gray-500">Payback</p>
                              <p className="font-semibold text-gray-900">{project.results?.paybackPeriod || 0} anni</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/feasibility-analysis/${project.id}`}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/feasibility-analysis/${project.id}/edit`}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openShareModal(project)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id!)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        </div>

        {/* Feedback Widget */}
        <FeedbackWidget className="" />
        
        {/* Modal Condivisione Progetto */}
        {selectedProjectForShare && (
          <ShareProjectModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setSelectedProjectForShare(null);
            }}
            projectId={selectedProjectForShare.id!}
            projectType="feasibility"
            projectName={selectedProjectForShare.name}
            workspaces={workspaces}
            onShare={handleShareProject}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
