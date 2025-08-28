'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';


import { 
  CalculatorIcon, 
  TrendingUpIcon, 
  EuroIcon, 
  BuildingIcon,
  PlusIcon,
  ChartBarIcon,
  CompareIcon,
  CheckCircleIcon,
  CalendarIcon,
  LocationIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  TrophyIcon
} from '@/components/icons';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function FeasibilityAnalysisPage() {
  const { t, formatCurrency: fmtCurrency } = useLanguage();
  const { currentUser: user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<FeasibilityProject[]>([]);
  const [ranking, setRanking] = useState<FeasibilityProject[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<FeasibilityProject | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [comparisonMode, setComparisonMode] = useState<'basic' | 'advanced' | 'financial'>('basic');
  const [deletionInProgress, setDeletionInProgress] = useState<Set<string>>(new Set());



  useEffect(() => {
    // Aspetta che l'autenticazione sia pronta
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async (forceRefresh = false) => {
    if (authLoading) {
      return;
    }
    
    if (!user) {
      setError('Utente non autenticato. Effettua il login per continuare.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Forza il refresh dei dati se richiesto
      const timestamp = forceRefresh ? Date.now() : 0;
      
      if (forceRefresh) {
        
        // Forza refresh completo bypassando cache
        const [allProjects, projectsRanking, stats] = await Promise.all([
          feasibilityService.getAllProjects(),
          feasibilityService.getProjectsRanking(),
          feasibilityService.getStatistics()
        ]);
        
        // Forza aggiornamento stato
        setProjects([]); // Pulisci prima
        setTimeout(() => {
          setProjects(allProjects || []);
          setRanking(projectsRanking || []);
          setStatistics(stats || {});
        }, 50);
        
      } else {
        // Caricamento normale
        const [allProjects, projectsRanking, stats] = await Promise.all([
          feasibilityService.getAllProjects(),
          feasibilityService.getProjectsRanking(),
          feasibilityService.getStatistics()
        ]);
        
        setProjects(allProjects || []);
        setRanking(projectsRanking || []);
        setStatistics(stats || {});
      }
      
    } catch (error) {
      console.error('❌ Errore caricamento dati:', error);
      setError('Errore nel caricamento dei dati. Riprova più tardi.');
      toast(`❌ Errore nel caricamento dei dati`, { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) {
      toast('❌ ID progetto non valido', { icon: '❌' });
      return;
    }

    if (!user) {
      toast('❌ Utente non autenticato', { icon: '❌' });
      return;
    }

    // BLOCCAGGIO ELIMINAZIONI SIMULTANEE
    if (deletionInProgress.has(projectId)) {
      toast('⏳ Eliminazione già in corso per questo progetto', { icon: '⏳' });
      return;
    }

    if (!confirm('Sei sicuro di voler eliminare questo progetto? L\'operazione non può essere annullata.')) {
      return;
    }

    // BLOCCA ELIMINAZIONE
    setDeletionInProgress(prev => new Set(prev).add(projectId));

    try {
      toast('🗑️ Eliminazione progetto in corso...', { icon: '⏳' });
      
      // 1. ELIMINAZIONE PROGETTO
      const deletionResult = await feasibilityService.deleteProject(projectId);
      
      if (deletionResult) {
        // 2. AGGIORNA IMMEDIATAMENTE TUTTE LE LISTE
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        setRanking(prevRanking => prevRanking.filter(p => p.id !== projectId));
        
        // 3. RICALCOLA STATISTICHE
        const remainingProjects = projects.filter(p => p.id !== projectId);
        if (remainingProjects.length > 0) {
          const totalProjects = remainingProjects.length;
          const avgMargin = remainingProjects.reduce((sum, p) => sum + (p.results?.margin || 0), 0) / totalProjects;
          const totalInvestment = remainingProjects.reduce((sum, p) => sum + (p.costs?.land?.purchasePrice || 0), 0);
          const onTarget = remainingProjects.filter(p => (p.results?.margin || 0) >= (p.targetMargin || 0)).length;
          
          setStatistics({
            totalProjects,
            averageMargin: avgMargin,
            totalInvestment,
            onTarget
          });
        } else {
          setStatistics({
            totalProjects: 0,
            averageMargin: 0,
            totalInvestment: 0,
            onTarget: 0
          });
        }
        
        toast(`✅ ${deletionResult.message}`, { icon: '✅' });
        
        // 4. FORZA REFRESH COMPLETO DOPO 1 SECONDO
        setTimeout(() => {
          loadData(true);
        }, 1000);
        
      } else {
        throw new Error(`Eliminazione fallita: ${deletionResult.message}`);
      }
      
    } catch (error) {
      toast(`❌ Errore eliminazione: ${error}`, { icon: '❌' });
      
      // 5. FORZA REFRESH PER VERIFICARE STATO REALE
      setTimeout(() => {
        loadData(true);
      }, 2000);
    } finally {
      // RIMUOVI BLOCCAGGIO
      setDeletionInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const handleCompareProjects = async () => {
    if (selectedProjects.length < 2) {
      toast('⚠️ Seleziona almeno 2 progetti da confrontare', { icon: '⚠️' });
      return;
    }

    try {
      // Genera confronto intelligente
      const projectsToCompare = projects.filter(p => selectedProjects.includes(p.id));
      const comparison = generateSmartComparison(projectsToCompare);
      
      setComparisonData(comparison);
      toast('✅ Confronto generato con successo!', { icon: '✅' });
      
    } catch (error) {
      toast(`❌ Errore generazione confronto: ${error}`, { icon: '❌' });
    }
  };

  const generateSmartComparison = (projects: FeasibilityProject[]) => {
    if (projects.length < 2) return null;

    const comparison = {
      summary: {
        totalProjects: projects.length,
        totalInvestment: projects.reduce((sum, p) => sum + (p.costs?.land?.purchasePrice || 0), 0),
        averageMargin: projects.reduce((sum, p) => sum + (p.results?.margin || 0), 0) / projects.length,
        bestPerformer: projects.reduce((best, current) => 
          (current.results?.margin || 0) > (best.results?.margin || 0) ? current : best
        ),
        worstPerformer: projects.reduce((worst, current) => 
          (current.results?.margin || 0) < (worst.results?.margin || 0) ? current : worst
        )
      },
      detailed: projects.map(project => ({
        id: project.id,
        name: project.name,
        location: project.location,
        investment: project.costs?.land?.purchasePrice || 0,
        revenue: project.results?.revenue || 0,
        profit: project.results?.profit || 0,
        margin: project.results?.margin || 0,
        roi: project.results?.roi || 0,
        status: project.status,
        risk: calculateProjectRisk(project),
        potential: calculateProjectPotential(project)
      })),
      insights: generateInsights(projects)
    };

    return comparison;
  };

  const calculateProjectRisk = (project: FeasibilityProject) => {
    const margin = project.results?.margin || 0;
    const roi = project.results?.roi || 0;
    const investment = project.costs?.land?.purchasePrice || 0;
    
    let riskScore = 0;
    
    if (margin < 20) riskScore += 3;
    else if (margin < 30) riskScore += 2;
    else if (margin < 40) riskScore += 1;
    
    if (roi < 15) riskScore += 2;
    else if (roi < 25) riskScore += 1;
    
    if (investment > 1000000) riskScore += 1;
    
    if (riskScore <= 2) return 'Basso';
    if (riskScore <= 4) return 'Medio';
    return 'Alto';
  };

  const calculateProjectPotential = (project: FeasibilityProject) => {
    const margin = project.results?.margin || 0;
    const roi = project.results?.roi || 0;
    const location = project.location || '';
    
    let potentialScore = 0;
    
    if (margin > 40) potentialScore += 3;
    else if (margin > 30) potentialScore += 2;
    else if (margin > 20) potentialScore += 1;
    
    if (roi > 25) potentialScore += 3;
    else if (roi > 20) potentialScore += 2;
    else if (roi > 15) potentialScore += 1;
    
    if (location.includes('Roma') || location.includes('Milano')) potentialScore += 2;
    else if (location.includes('Torino') || location.includes('Napoli')) potentialScore += 1;
    
    if (potentialScore >= 6) return 'Eccellente';
    if (potentialScore >= 4) return 'Buono';
    if (potentialScore >= 2) return 'Discreto';
    return 'Limitato';
  };

  const generateInsights = (projects: FeasibilityProject[]) => {
    const insights = [];
    
    // Analisi ROI
    const avgRoi = projects.reduce((sum, p) => sum + (p.results?.roi || 0), 0) / projects.length;
    if (avgRoi > 25) insights.push('🎯 ROI medio eccellente - Portfolio molto profittevole');
    else if (avgRoi > 20) insights.push('📈 ROI medio buono - Portfolio solido');
    else insights.push('⚠️ ROI medio basso - Necessario ottimizzazione');
    
    // Analisi diversificazione
    const locations = [...new Set(projects.map(p => p.location))];
    if (locations.length > 2) insights.push('🌍 Buona diversificazione geografica');
    else insights.push('📍 Concentrazione geografica - Considera diversificazione');
    
    // Analisi margini
    const highMarginProjects = projects.filter(p => (p.results?.margin || 0) > 35);
    if (highMarginProjects.length > projects.length / 2) insights.push('💎 Portfolio con margini elevati');
    else insights.push('📊 Portfolio con margini variabili');
    
    return insights;
  };

  const formatCurrency = (value: number) => {
    try {
      return fmtCurrency(value || 0);
    } catch (error) {
      return `€${(value || 0).toLocaleString()}`;
    }
  };

  const formatPercentage = (value: number) => {
    try {
      return `${(value || 0).toFixed(1)}%`;
    } catch (error) {
      return '0.0%';
    }
  };

  const getMarginColor = (margin: number, targetMargin: number) => {
    if (margin >= targetMargin) return 'text-success';
    if (margin >= targetMargin * 0.8) return 'text-warning';
    return 'text-error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PIANIFICAZIONE': return 'bg-blue-100 text-blue-800';
      case 'IN_CORSO': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETATO': return 'bg-green-100 text-green-800';
      case 'SOSPESO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <p className="text-gray-600">Verifica autenticazione...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600 text-xl">❌ {error}</div>
          <button 
            onClick={() => loadData()}
            className="btn btn-primary"
          >
            🔄 Riprova
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title', 'feasibility')}</h1>
            <p className="text-gray-600 mt-1">{t('subtitle', 'feasibility')}</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/feasibility-analysis/new">
              <button className="btn btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('newProject', 'feasibility')}
              </button>
            </Link>
            <button 
              onClick={() => setShowComparison(true)}
              className="btn btn-outline"
            >
              <CompareIcon className="h-4 w-4 mr-2" />
              {t('compare', 'feasibility')}
            </button>
            

          </div>
        </div>

        {/* Statistiche */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat bg-white shadow-sm rounded-lg p-6">
              <div className="stat-figure text-primary">
                <BuildingIcon className="h-6 w-6" />
              </div>
              <div className="stat-title text-gray-500">{t('stats.totalProjects', 'feasibility')}</div>
              <div className="stat-value text-2xl">{statistics.totalProjects}</div>
            </div>
            
            <div className="stat bg-white shadow-sm rounded-lg p-6">
              <div className="stat-figure text-success">
                <TrendingUpIcon className="h-6 w-6" />
              </div>
              <div className="stat-title text-gray-500">{t('stats.averageMargin', 'feasibility')}</div>
              <div className="stat-value text-2xl">{formatPercentage(statistics.averageMargin)}</div>
            </div>
            
            <div className="stat bg-white shadow-sm rounded-lg p-6">
              <div className="stat-figure text-info">
                <EuroIcon className="h-6 w-6" />
              </div>
              <div className="stat-title text-gray-500">{t('stats.totalInvestment', 'feasibility')}</div>
              <div className="stat-value text-2xl">{formatCurrency(statistics.totalInvestment)}</div>
            </div>
            
            <div className="stat bg-white shadow-sm rounded-lg p-6">
              <div className="stat-figure text-warning">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div className="stat-title text-gray-500">{t('stats.onTarget', 'feasibility')}</div>
              <div className="stat-value text-2xl">{statistics.projectsOnTarget}/{statistics.totalProjects}</div>
            </div>
          </div>
        )}

        {/* Classifica Progetti */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-yellow-600" />
              {t('rankingTitle', 'feasibility')}
            </h2>
            <span className="text-sm text-gray-500">{t('stats.fromMostProfitable', 'feasibility')}</span>
          </div>
          
          {ranking.length === 0 ? (
            <div className="text-center py-12">
              <CalculatorIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">{t('emptyRankingTitle', 'feasibility')}</h3>
              <p className="text-gray-500 mb-4">{t('emptyRankingSubtitle', 'feasibility')}</p>
              <div className="flex justify-center">
                <Link href="/dashboard/feasibility-analysis/new">
                  <button className="btn btn-primary">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('createFirstProject', 'feasibility')}
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {ranking.slice(0, 5).map((project, index) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <LocationIcon className="h-3 w-3 mr-1" />
                        {project.address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className={`font-bold text-lg ${getMarginColor(project.results.margin, project.targetMargin)}`}>
                        {formatPercentage(project.results.margin)}
                      </div>
                      <div className="text-xs text-gray-500">Marginalità</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(project.costs.land.purchasePrice)}
                      </div>
                      <div className="text-xs text-gray-500">Costo Terreno</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(project.results.profit)}
                      </div>
                      <div className="text-xs text-gray-500">Utile</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <div className="dropdown dropdown-end">
                        <button className="btn btn-ghost btn-sm">
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <Link href={`/dashboard/feasibility-analysis/${project.id}`}>
                              <EyeIcon className="h-4 w-4" />
                              Visualizza
                            </Link>
                          </li>
                          <li>
                            <Link href={`/dashboard/feasibility-analysis/${project.id}/edit`}>
                              <EditIcon className="h-4 w-4" />
                              Modifica
                            </Link>
                          </li>
                          <li>
                            <button 
                              onClick={() => handleDeleteProject(project.id!)}
                              disabled={deletionInProgress.has(project.id!)}
                              className={deletionInProgress.has(project.id!) ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              <TrashIcon className="h-4 w-4" />
                              {deletionInProgress.has(project.id!) ? 'Eliminazione...' : 'Elimina'}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista Completa Progetti */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 {t('allProjects', 'feasibility')}</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('noProjects', 'feasibility')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>{t('table.project', 'feasibility')}</th>
                    <th>{t('table.location', 'feasibility')}</th>
                    <th>{t('table.status', 'feasibility')}</th>
                    <th>{t('table.landCost', 'feasibility')}</th>
                    <th>{t('table.margin', 'feasibility')}</th>
                    <th>{t('table.target', 'feasibility')}</th>
                    <th>{t('table.profit', 'feasibility')}</th>
                    <th>{t('table.actions', 'feasibility')}</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500">
                            {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>{project?.address || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getStatusColor(project?.status || 'PIANIFICAZIONE')}`}>
                          {project?.status || 'PIANIFICAZIONE'}
                        </span>
                      </td>
                      <td>{formatCurrency(project?.costs?.land?.purchasePrice || 0)}</td>
                      <td>
                        <span className={`font-bold ${getMarginColor(project?.results?.margin || 0, project?.targetMargin || 0)}`}>
                          {formatPercentage(project?.results?.margin || 0)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-500">
                          {formatPercentage(project?.targetMargin || 0)}
                        </span>
                      </td>
                      <td>{formatCurrency(project?.results?.profit || 0)}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/feasibility-analysis/${project?.id || 'unknown'}`}>
                            <button className="btn btn-ghost btn-sm">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/dashboard/feasibility-analysis/${project?.id || 'unknown'}/edit`}>
                            <button className="btn btn-ghost btn-sm">
                              <EditIcon className="h-4 w-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => project?.id && handleDeleteProject(project.id)}
                            disabled={project?.id ? deletionInProgress.has(project.id) : false}
                            className={`btn btn-ghost btn-sm ${project?.id && deletionInProgress.has(project.id) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                            {project?.id && deletionInProgress.has(project.id) ? '⏳' : ''}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Confronto Intelligente */}
        {showComparison && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-xl mb-6">🔍 Confronto Intelligente Progetti</h3>
              
              {/* Selezione Progetti */}
              <div className="mb-6">
                <label className="label">
                  <span className="label-text font-medium">Seleziona progetti da confrontare (minimo 2):</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {projects.map((project) => (
                    <label key={project.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedProjects.includes(project.id || '')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjects(prev => [...prev, project.id || '']);
                          } else {
                            setSelectedProjects(prev => prev.filter(id => id !== project.id));
                          }
                        }}
                      />
                      <span className="text-sm">
                        {project.name} ({formatPercentage(project.results?.margin || 0)})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modalità Confronto */}
              <div className="mb-6">
                <label className="label">
                  <span className="label-text font-medium">Modalità confronto:</span>
                </label>
                <div className="flex space-x-2">
                  <button
                    className={`btn btn-sm ${comparisonMode === 'basic' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setComparisonMode('basic')}
                  >
                    📊 Base
                  </button>
                  <button
                    className={`btn btn-sm ${comparisonMode === 'advanced' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setComparisonMode('advanced')}
                  >
                    🎯 Avanzato
                  </button>
                  <button
                    className={`btn btn-sm ${comparisonMode === 'financial' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setComparisonMode('financial')}
                  >
                    💰 Finanziario
                  </button>
                </div>
              </div>

              {/* Risultati Confronto */}
              {comparisonData && (
                <div className="mb-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">📈 Riepilogo Confronto</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Progetti:</span>
                        <p className="text-blue-800">{comparisonData.summary.totalProjects}</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Investimento Totale:</span>
                        <p className="text-blue-800">{formatCurrency(comparisonData.summary.totalInvestment)}</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Margine Medio:</span>
                        <p className="text-blue-800">{formatPercentage(comparisonData.summary.averageMargin)}</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Miglior Performer:</span>
                        <p className="text-blue-800">{comparisonData.summary.bestPerformer?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tabella Dettagliata */}
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Progetto</th>
                          <th>Investimento</th>
                          <th>Margine</th>
                          <th>ROI</th>
                          <th>Rischio</th>
                          <th>Potenziale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.detailed.map((project) => (
                          <tr key={project.id}>
                            <td className="font-medium">{project.name}</td>
                            <td>{formatCurrency(project.investment)}</td>
                            <td className={getMarginColor(project.margin, 30)}>
                              {formatPercentage(project.margin)}
                            </td>
                            <td>{formatPercentage(project.roi)}</td>
                            <td>
                              <span className={`badge ${
                                project.risk === 'Basso' ? 'badge-success' :
                                project.risk === 'Medio' ? 'badge-warning' : 'badge-error'
                              }`}>
                                {project.risk}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                project.potential === 'Eccellente' ? 'badge-success' :
                                project.potential === 'Buono' ? 'badge-primary' :
                                project.potential === 'Discreto' ? 'badge-warning' : 'badge-error'
                              }`}>
                                {project.potential}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Insights Intelligenti */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">💡 Insights Intelligenti</h4>
                    <ul className="space-y-2">
                      {comparisonData.insights.map((insight, index) => (
                        <li key={index} className="text-green-800 text-sm flex items-start">
                          <span className="mr-2">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Azioni */}
              <div className="modal-action">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setShowComparison(false);
                    setSelectedProjects([]);
                    setComparisonData(null);
                  }}
                >
                  Chiudi
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleCompareProjects}
                  disabled={selectedProjects.length < 2}
                >
                  🔍 Genera Confronto
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </DashboardLayout>
  );
} 