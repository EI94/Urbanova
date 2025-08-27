'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  EuroIcon,
  MapPinIcon,
  BuildingIcon,
  StarIcon,
  CheckCircleIcon,
  InfoIcon,
  ShieldIcon,
  CalendarIcon,
  UserIcon
} from '@/components/icons';
import { DesignTemplate, ProjectDesign } from '@/lib/designCenterService';

interface DesignAnalyticsDashboardProps {
  templates: DesignTemplate[];
  projects: ProjectDesign[];
}

interface AnalyticsMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageROI: number;
  totalInvestment: number;
  averageTimeline: number;
  topPerformingTemplate: string;
  mostPopularCategory: string;
  averageBudget: number;
  successRate: number;
}

interface ProjectPerformance {
  id: string;
  name: string;
  template: string;
  roi: number;
  budget: number;
  timeline: number;
  status: string;
  category: string;
}

export default function DesignAnalyticsDashboard({ templates, projects }: DesignAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageROI: 0,
    totalInvestment: 0,
    averageTimeline: 0,
    topPerformingTemplate: '',
    mostPopularCategory: '',
    averageBudget: 0,
    successRate: 0
  });

  const [topPerformers, setTopPerformers] = useState<ProjectPerformance[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ [key: string]: number }>({});
  const [timelineTrends, setTimelineTrends] = useState<{ month: string; projects: number; avgROI: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateAnalytics();
  }, [templates, projects]);

  const calculateAnalytics = () => {
    setLoading(true);

    // Simula calcoli complessi
    setTimeout(() => {
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
      const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
      
      const totalInvestment = projects.reduce((sum, p) => sum + (p.budget?.total || 0), 0);
      const averageBudget = totalProjects > 0 ? totalInvestment / totalProjects : 0;
      
      const rois = projects.map(p => p.estimatedROI || 15).filter(roi => roi > 0);
      const averageROI = rois.length > 0 ? rois.reduce((sum, roi) => sum + roi, 0) / rois.length : 0;
      
      const timelines = projects.map(p => p.timeline?.totalWeeks || 20).filter(t => t > 0);
      const averageTimeline = timelines.length > 0 ? timelines.reduce((sum, t) => sum + t, 0) / timelines.length : 0;
      
      const successRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
      
      // Top performing template
      const templatePerformance = templates.map(template => {
        const templateProjects = projects.filter(p => p.templateId === template.id);
        const avgROI = templateProjects.length > 0 
          ? templateProjects.reduce((sum, p) => sum + (p.estimatedROI || 15), 0) / templateProjects.length
          : 0;
        return { template: template.name, avgROI, count: templateProjects.length };
      });
      
      const topTemplate = templatePerformance
        .filter(t => t.count > 0)
        .sort((a, b) => b.avgROI - a.avgROI)[0];
      
      // Most popular category
      const categories = projects.reduce((acc, p) => {
        const category = p.category || 'residenziale';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      const mostPopularCategory = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'residenziale';
      
      // Top performing projects
      const projectPerformance: ProjectPerformance[] = projects
        .map(p => ({
          id: p.id,
          name: p.name,
          template: templates.find(t => t.id === p.templateId)?.name || 'Template Sconosciuto',
          roi: p.estimatedROI || 15,
          budget: p.budget?.total || 0,
          timeline: p.timeline?.totalWeeks || 20,
          status: p.status,
          category: p.category || 'residenziale'
        }))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5);
      
      // Category breakdown
      const breakdown = projects.reduce((acc, p) => {
        const category = p.category || 'residenziale';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      // Timeline trends (simulato)
      const trends = [
        { month: 'Gen', projects: Math.floor(Math.random() * 10) + 5, avgROI: 18.5 },
        { month: 'Feb', projects: Math.floor(Math.random() * 10) + 8, avgROI: 19.2 },
        { month: 'Mar', projects: Math.floor(Math.random() * 10) + 12, avgROI: 20.1 },
        { month: 'Apr', projects: Math.floor(Math.random() * 10) + 15, avgROI: 21.3 },
        { month: 'Mag', projects: Math.floor(Math.random() * 10) + 18, avgROI: 22.7 },
        { month: 'Giu', projects: Math.floor(Math.random() * 10) + 20, avgROI: 23.5 }
      ];
      
      setMetrics({
        totalProjects,
        activeProjects,
        completedProjects,
        averageROI,
        totalInvestment,
        averageTimeline,
        topPerformingTemplate: topTemplate?.template || '',
        mostPopularCategory,
        averageBudget,
        successRate
      });
      
      setTopPerformers(projectPerformance);
      setCategoryBreakdown(breakdown);
      setTimelineTrends(trends);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PLANNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ON_HOLD': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completato';
      case 'IN_PROGRESS': return 'In Corso';
      case 'PLANNING': return 'Pianificazione';
      case 'ON_HOLD': return 'In Attesa';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residenziale': return <BuildingIcon className="h-4 w-4" />;
      case 'commerciale': return <StoreIcon className="h-4 w-4" />;
      case 'industriale': return <FactoryIcon className="h-4 w-4" />;
      case 'uffici': return <OfficeIcon className="h-4 w-4" />;
      default: return <BuildingIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calcolando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Design Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Metriche complete e performance dei tuoi progetti di design
            </p>
          </div>
          
          <button
            onClick={calculateAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChartBarIcon className="h-4 w-4 inline mr-2" />
            Aggiorna
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Progetti Totali</p>
                <p className="text-2xl font-bold text-blue-900">{metrics.totalProjects}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <BuildingIcon className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">ROI Medio</p>
                <p className="text-2xl font-bold text-green-900">{metrics.averageROI.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <TrendingUpIcon className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Investimento Totale</p>
                <p className="text-2xl font-bold text-purple-900">€{metrics.totalInvestment.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <EuroIcon className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Tasso di Successo</p>
                <p className="text-2xl font-bold text-orange-900">{metrics.successRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Timeline Media</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.averageTimeline.toFixed(1)} settimane</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <StarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Template Top</p>
                <p className="text-lg font-semibold text-gray-900">{metrics.topPerformingTemplate}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categoria Popolare</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{metrics.mostPopularCategory}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Projects */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
            Top 5 Progetti per ROI
          </h3>
          
          <div className="space-y-3">
            {topPerformers.map((project, index) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.template}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-green-600">+{project.roi.toFixed(1)}% ROI</div>
                  <div className="text-sm text-gray-600">€{project.budget.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
            Distribuzione per Categoria
          </h3>
          
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([category, count]) => {
              const percentage = (count / metrics.totalProjects) * 100;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Trends */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
          Trend Temporali - Progetti e ROI
        </h3>
        
        <div className="grid grid-cols-6 gap-4">
          {timelineTrends.map((trend, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-t from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
                <div className="text-lg font-bold text-green-600 mb-1">{trend.projects}</div>
                <div className="text-sm text-green-700 mb-2">Progetti</div>
                <div className="text-xs text-gray-600">ROI: {trend.avgROI.toFixed(1)}%</div>
              </div>
              <div className="text-sm font-medium text-gray-700 mt-2">{trend.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Status Overview */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
          Panoramica Status Progetti
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{metrics.completedProjects}</div>
            <div className="text-green-700 font-medium">Completati</div>
            <div className="text-sm text-green-600">
              {metrics.totalProjects > 0 ? ((metrics.completedProjects / metrics.totalProjects) * 100).toFixed(1) : 0}%
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{metrics.activeProjects}</div>
            <div className="text-blue-700 font-medium">In Corso</div>
            <div className="text-sm text-blue-600">
              {metrics.totalProjects > 0 ? ((metrics.activeProjects / metrics.totalProjects) * 100).toFixed(1) : 0}%
            </div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {metrics.totalProjects - metrics.completedProjects - metrics.activeProjects}
            </div>
            <div className="text-yellow-700 font-medium">Pianificazione</div>
            <div className="text-sm text-yellow-600">
              {metrics.totalProjects > 0 ? (((metrics.totalProjects - metrics.completedProjects - metrics.activeProjects) / metrics.totalProjects) * 100).toFixed(1) : 0}%
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 mb-1">{metrics.totalProjects}</div>
            <div className="text-gray-700 font-medium">Totale</div>
            <div className="text-sm text-gray-600">100%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon components per categorie non presenti nelle icone esistenti
const StoreIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const FactoryIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const OfficeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
