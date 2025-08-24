'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';
import { projectManagerService } from '@/lib/projectManagerService';
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
  const [project1Id, setProject1Id] = useState('');
  const [project2Id, setProject2Id] = useState('');

  // DEBUG: Log completo dello stato di autenticazione
  useEffect(() => {
    console.log('🔍 DEBUG AUTH - Stato completo:', {
      user: user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null,
      authLoading,
      loading,
      error
    });
  }, [user, authLoading, loading, error]);

  useEffect(() => {
    // Aspetta che l'autenticazione sia pronta
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, user]);

  const loadData = async (forceRefresh = false) => {
    if (authLoading) {
      console.log('⏳ Autenticazione in corso - Attendo...');
      return;
    }
    
    if (!user) {
      console.log('❌ Utente non autenticato - Caricamento bloccato');
      setError('Utente non autenticato. Effettua il login per continuare.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Caricamento dati progetti...', forceRefresh ? '(FORCE REFRESH)' : '');
      console.log('👤 Utente autenticato:', user.uid);
      
      // Forza il refresh dei dati se richiesto
      const timestamp = forceRefresh ? Date.now() : 0;
      
      if (forceRefresh) {
        console.log('🔥 FORCE REFRESH ATTIVATO - Bypassa cache...');
        
        // Forza refresh completo bypassando cache
        const [allProjects, projectsRanking, stats] = await Promise.all([
          feasibilityService.getAllProjects(),
          feasibilityService.getProjectsRanking(),
          feasibilityService.getStatistics()
        ]);
        
        console.log('📊 Progetti caricati (FORCE REFRESH):', allProjects?.length || 0);
        
        // DEBUG: Log dettagliato dei progetti per verificare lo stato
        if (allProjects && allProjects.length > 0) {
          console.log('🔍 DEBUG - Dettagli progetti caricati (FORCE REFRESH):');
          allProjects.forEach((project, index) => {
            console.log(`  Progetto ${index + 1}:`, {
              id: project.id,
              name: project.name,
              address: project.address,
              status: project.status,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt
            });
          });
        } else {
          console.log('🔍 DEBUG - Nessun progetto trovato (FORCE REFRESH)');
        }
        
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
        
        console.log('📊 Progetti caricati (normale):', allProjects?.length || 0);
        
        // DEBUG: Log dettagliato dei progetti per verificare lo stato
        if (allProjects && allProjects.length > 0) {
          console.log('🔍 DEBUG - Dettagli progetti caricati (normale):');
          allProjects.forEach((project, index) => {
            console.log(`  Progetto ${index + 1}:`, {
              id: project.id,
              name: project.name,
              address: project.address,
              status: project.status,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt
            });
          });
        } else {
          console.log('🔍 DEBUG - Nessun progetto trovato (normale)');
        }
        
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

    try {
      console.log('🗑️ ELIMINAZIONE SERVIZIO - Inizio...', projectId);
      console.log('👤 Utente autenticato:', user.uid);
      
      // 1. ELIMINAZIONE TRAMITE SERVIZIO FIRESTORE
      await feasibilityService.deleteProject(projectId);
      
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
      
      toast('✅ Progetto eliminato definitivamente!', { icon: '✅' });
      
    } catch (error) {
      console.error('❌ Errore eliminazione servizio:', error);
      toast(`❌ Errore eliminazione: ${error}`, { icon: '❌' });
    }
  };

  const handleCompareProjects = async () => {
    if (!project1Id || !project2Id) {
      toast(t('selectTwo', 'feasibility.toasts'), { icon: '⚠️' });
      return;
    }

    try {
      const comparison = await feasibilityService.compareProjects(project1Id, project2Id, 'user123');
      toast(`✅ ${t('compareCreated', 'feasibility.toasts')}`, { icon: '✅' });
      setShowComparison(false);
      setProject1Id('');
      setProject2Id('');
    } catch (error) {
      console.error('Errore confronto progetti:', error);
      toast(`❌ ${t('compareError', 'feasibility.toasts')}` as string, { icon: '❌' });
    }
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
            <h1 className="text-3xl font-bold text-gray-900">📊 {t('title', 'feasibility')}</h1>
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
            
            <button 
              onClick={async () => {
                if (!user) {
                  toast('❌ Utente non autenticato', { icon: '❌' });
                  return;
                }
                
                try {
                  console.log('🧪 TEST FIRESTORE RULES...');
                  console.log('👤 Utente autenticato:', user.uid);
                  const { db } = await import('@/lib/firebase');
                  const { collection, getDocs, doc, deleteDoc } = await import('firebase/firestore');
                  
                  // Test 1: Lettura
                  const testCollection = collection(db, 'feasibilityProjects');
                  const snapshot = await getDocs(testCollection);
                  console.log('✅ LETTURA OK - Progetti trovati:', snapshot.size);
                  
                  // Test 2: Eliminazione (se ci sono progetti)
                  if (snapshot.size > 0) {
                    const testProject = snapshot.docs[0];
                    console.log('🧪 Test eliminazione progetto:', testProject.id);
                    
                    try {
                      await deleteDoc(testProject.ref);
                      console.log('✅ ELIMINAZIONE TEST OK - Progetto eliminato');
                      
                      // Ripristina il progetto per non perderlo
                      const { addDoc } = await import('firebase/firestore');
                      await addDoc(testCollection, testProject.data());
                      console.log('✅ RIPRISTINO OK - Progetto ripristinato');
                      
                    } catch (deleteError) {
                      console.log('❌ ELIMINAZIONE TEST KO:', deleteError);
                    }
                  }
                  
                  toast('🧪 Test Firestore completato - Controlla console', { icon: '🧪' });
                } catch (error) {
                  console.error('❌ Test Firestore fallito:', error);
                  toast(`❌ Test KO: ${error}`, { icon: '❌' });
                }
              }}
              className="btn btn-warning"
            >
              🧪 Test Firestore
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
                            <button onClick={() => handleDeleteProject(project.id!)}>
                              <TrashIcon className="h-4 w-4" />
                              Elimina
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
                            className="btn btn-ghost btn-sm text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
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

        {/* Modal Confronto */}
        {showComparison && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">🔍 {t('compareProjects', 'feasibility.modal')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">{t('firstProject', 'feasibility.modal')}</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={project1Id}
                    onChange={(e) => setProject1Id(e.target.value)}
                  >
                    <option value="">{t('selectProject', 'feasibility.modal')}</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({formatPercentage(project.results.margin)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">{t('secondProject', 'feasibility.modal')}</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={project2Id}
                    onChange={(e) => setProject2Id(e.target.value)}
                  >
                    <option value="">{t('selectProject', 'feasibility.modal')}</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({formatPercentage(project.results.margin)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-action">
                <button 
                  className="btn"
                  onClick={() => setShowComparison(false)}
                >
                  {t('cancel', 'common')}
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleCompareProjects}
                  disabled={!project1Id || !project2Id}
                >
                  {t('compare', 'feasibility')}
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </DashboardLayout>
  );
} 