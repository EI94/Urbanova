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
  TargetIcon,
  CalendarIcon,
  LocationIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  TrophyIcon
} from '@/components/icons';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function FeasibilityAnalysisPage() {
  const [projects, setProjects] = useState<FeasibilityProject[]>([]);
  const [ranking, setRanking] = useState<FeasibilityProject[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<FeasibilityProject | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [project1Id, setProject1Id] = useState('');
  const [project2Id, setProject2Id] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProjects, projectsRanking, stats] = await Promise.all([
        feasibilityService.getAllProjects(),
        feasibilityService.getProjectsRanking(),
        feasibilityService.getStatistics()
      ]);
      
      setProjects(allProjects);
      setRanking(projectsRanking);
      setStatistics(stats);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
      toast.error('❌ Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto?')) return;
    
    try {
      await feasibilityService.deleteProject(projectId);
      toast.success('✅ Progetto eliminato');
      loadData();
    } catch (error) {
      console.error('Errore eliminazione progetto:', error);
      toast.error('❌ Errore nell\'eliminazione del progetto');
    }
  };

  const handleCompareProjects = async () => {
    if (!project1Id || !project2Id) {
      toast.error('Seleziona due progetti da confrontare');
      return;
    }

    try {
      const comparison = await feasibilityService.compareProjects(project1Id, project2Id, 'user123');
      toast.success('✅ Confronto creato con successo');
      setShowComparison(false);
      setProject1Id('');
      setProject2Id('');
    } catch (error) {
      console.error('Errore confronto progetti:', error);
      toast.error('❌ Errore nella creazione del confronto');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">📊 Analisi di Fattibilità</h1>
            <p className="text-gray-600 mt-1">
              Gestisci e confronta i tuoi progetti immobiliari
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/dashboard/feasibility-analysis/new">
              <button className="btn btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuovo Progetto
              </button>
            </Link>
            <button 
              onClick={() => setShowComparison(true)}
              className="btn btn-outline"
            >
              <CompareIcon className="h-4 w-4 mr-2" />
              Confronta
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
              <div className="stat-title text-gray-500">Progetti Totali</div>
              <div className="stat-value text-2xl">{statistics.totalProjects}</div>
            </div>
            
            <div className="stat bg-white shadow-sm rounded-lg p-6">
              <div className="stat-figure text-success">
                <TrendingUpIcon className="h-6 w-6" />
              </div>
              <div className="stat-title text-gray-500">Marginalità Media</div>
              <div className="stat-value text-2xl">{formatPercentage(statistics.averageMargin)}</div>
            </div>
            
            <div className="stat bg-white shadow-sm rounded-lg p-6">
              <div className="stat-figure text-info">
                <EuroIcon className="h-6 w-6" />
              </div>
              <div className="stat-title text-gray-500">Investimento Totale</div>
              <div className="stat-value text-2xl">{formatCurrency(statistics.totalInvestment)}</div>
            </div>
            
            <div className="stat bg-white shadow-sm rounded-lg p-6">
              <div className="stat-figure text-warning">
                <TargetIcon className="h-6 w-6" />
              </div>
              <div className="stat-title text-gray-500">Su Target</div>
              <div className="stat-value text-2xl">{statistics.projectsOnTarget}/{statistics.totalProjects}</div>
            </div>
          </div>
        )}

        {/* Classifica Progetti */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-yellow-600" />
              Classifica per Marginalità
            </h2>
            <span className="text-sm text-gray-500">Dal più profittevole</span>
          </div>
          
          {ranking.length === 0 ? (
            <div className="text-center py-12">
              <CalculatorIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Nessun progetto di fattibilità
              </h3>
              <p className="text-gray-500 mb-4">
                Crea il tuo primo progetto di fattibilità per iniziare
              </p>
              <Link href="/dashboard/feasibility-analysis/new">
                <button className="btn btn-primary">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crea Primo Progetto
                </button>
              </Link>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Tutti i Progetti</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nessun progetto disponibile</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Progetto</th>
                    <th>Località</th>
                    <th>Stato</th>
                    <th>Costo Terreno</th>
                    <th>Marginalità</th>
                    <th>Target</th>
                    <th>Utile</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500">
                            {project.createdAt.toLocaleDateString('it-IT')}
                          </div>
                        </div>
                      </td>
                      <td>{project.address}</td>
                      <td>
                        <span className={`badge ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td>{formatCurrency(project.costs.land.purchasePrice)}</td>
                      <td>
                        <span className={`font-bold ${getMarginColor(project.results.margin, project.targetMargin)}`}>
                          {formatPercentage(project.results.margin)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-500">
                          {formatPercentage(project.targetMargin)}
                        </span>
                      </td>
                      <td>{formatCurrency(project.results.profit)}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/feasibility-analysis/${project.id}`}>
                            <button className="btn btn-ghost btn-sm">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </Link>
                          <Link href={`/dashboard/feasibility-analysis/${project.id}/edit`}>
                            <button className="btn btn-ghost btn-sm">
                              <EditIcon className="h-4 w-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDeleteProject(project.id!)}
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
              <h3 className="font-bold text-lg mb-4">🔍 Confronta Progetti</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Primo Progetto</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={project1Id}
                    onChange={(e) => setProject1Id(e.target.value)}
                  >
                    <option value="">Seleziona progetto...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({formatPercentage(project.results.margin)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Secondo Progetto</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    value={project2Id}
                    onChange={(e) => setProject2Id(e.target.value)}
                  >
                    <option value="">Seleziona progetto...</option>
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
                  Annulla
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleCompareProjects}
                  disabled={!project1Id || !project2Id}
                >
                  Confronta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 