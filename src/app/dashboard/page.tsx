'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getProjectStats } from '@/lib/firestoreService';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BuildingIcon, 
  EuroIcon, 
  TrendingUpIcon, 
  CalendarIcon,
  AlertIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon
} from '@/components/icons';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  averageROI: number;
  projectsByType: {
    RESIDENZIALE: number;
    COMMERCIALE: number;
    MISTO: number;
    INDUSTRIALE: number;
  };
  projectsByStatus: {
    PIANIFICAZIONE: number;
    IN_CORSO: number;
    IN_ATTESA: number;
    COMPLETATO: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'MILESTONE_COMPLETED' | 'ALERT';
    message: string;
    timestamp: Date;
    projectId?: string;
  }>;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const projectStats = await getProjectStats();
        setStats(projectStats);
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-3">{t('loadingStats', 'dashboard')}</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="alert alert-error">
          <AlertIcon />
          <span>{t('errorLoadingStats', 'dashboard')}</span>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('title', 'dashboard')}</h1>
            <p className="text-gray-600 mt-1">{t('subtitle', 'dashboard')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{t('lastUpdate', 'common')}</p>
            <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Statistiche Principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BuildingIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('totalProjects', 'dashboard')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('activeProjects', 'dashboard')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <EuroIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('totalBudget', 'dashboard')}</p>
                                  <p className="text-2xl font-bold text-gray-900">
                    €{((stats.totalBudget || 0) / 1000000).toFixed(1)}M
                  </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('averageROI', 'dashboard')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageROI?.toFixed(1) || '0.0'}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grafici e Dettagli */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progetti per Tipo */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('projectsByType', 'dashboard')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('residential', 'dashboard')}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                      <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${stats.totalProjects > 0 ? (stats.projectsByType.RESIDENZIALE / stats.totalProjects) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.projectsByType.RESIDENZIALE || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('commercial', 'dashboard')}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                      <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${stats.totalProjects > 0 ? (stats.projectsByType.COMMERCIALE / stats.totalProjects) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.projectsByType.COMMERCIALE || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('mixed', 'dashboard')}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                      <div 
                    className="bg-yellow-600 h-2 rounded-full" 
                    style={{ width: `${stats.totalProjects > 0 ? (stats.projectsByType.MISTO / stats.totalProjects) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.projectsByType.MISTO || 0}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('industrial', 'dashboard')}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                      <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${stats.totalProjects > 0 ? (stats.projectsByType.INDUSTRIALE / stats.totalProjects) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.projectsByType.INDUSTRIALE || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progetti per Status */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('projectsByStatus', 'dashboard')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('planning', 'dashboard')}</span>
                </div>
                <span className="text-sm font-medium">{stats.projectsByStatus.PIANIFICAZIONE || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('inProgress', 'dashboard')}</span>
                </div>
                <span className="text-sm font-medium">{stats.projectsByStatus.IN_CORSO || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('onHold', 'dashboard')}</span>
                </div>
                <span className="text-sm font-medium">{stats.projectsByStatus.IN_ATTESA || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">{t('completed', 'dashboard')}</span>
                </div>
                <span className="text-sm font-medium">{stats.projectsByStatus.COMPLETATO || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attività Recenti */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentActivity', 'dashboard')}</h3>
          <div className="space-y-3">
            {(stats.recentActivity || []).slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activity.type === 'PROJECT_CREATED' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <BuildingIcon className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === 'PROJECT_UPDATED' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  {activity.type === 'MILESTONE_COMPLETED' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'ALERT' && (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertIcon className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions', 'dashboard')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/dashboard/progetti/nuovo" 
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BuildingIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-900">{t('newProject', 'dashboard')}</span>
            </Link>
            <Link 
              href="/dashboard/market-intelligence" 
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <TrendingUpIcon className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-900">{t('marketIntelligence', 'dashboard')}</span>
            </Link>
            <Link 
              href="/dashboard/feasibility-analysis" 
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <EuroIcon className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-900">{t('feasibilityAnalysis', 'dashboard')}</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 