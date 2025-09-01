'use client';

import React, { useState, useEffect } from 'react';

import { analyticsService } from '@/lib/analyticsService';
import {
  AnalyticsDashboard,
  AnalyticsReport,
  AnalyticsInsight,
  AnalyticsExport,
  AnalyticsPeriod,
  AnalyticsMetric,
  ReportFormat,
  PerformanceMetrics,
  TeamAnalytics,
  CollaborationAnalytics,
} from '@/types/analytics';
import { TeamRole } from '@/types/team';

import { Badge } from './Badge';
import Button from './Button';

interface AdvancedAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function AdvancedAnalytics({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
}: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'dashboards' | 'reports' | 'insights' | 'exports'>(
    'dashboards'
  );
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [exports, setExports] = useState<AnalyticsExport[]>([]);

  // Stati per la creazione
  const [showCreateDashboard, setShowCreateDashboard] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null);
  const [collaborationAnalytics, setCollaborationAnalytics] =
    useState<CollaborationAnalytics | null>(null);

  // Form states
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    type: 'team' as const,
    columns: 3,
    rows: 3,
  });

  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'performance' as const,
    metrics: ['performance'] as AnalyticsMetric[],
    period: 'month' as AnalyticsPeriod,
    format: 'pdf' as ReportFormat,
    includeCharts: true,
    includeTables: true,
    includeInsights: true,
  });

  const [exportConfig, setExportConfig] = useState({
    reportId: '',
    format: 'pdf' as ReportFormat,
    includeCharts: true,
    includeTables: true,
    includeInsights: true,
    compression: false,
    password: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      generateMetrics();
    }
  }, [isOpen]);

  const loadData = () => {
    setDashboards(analyticsService.getUserDashboards(currentUserRole));
    setReports(analyticsService.getUserReports(currentUserId));
    setInsights(analyticsService.getActiveInsights());
    setExports(analyticsService.getCompletedExports());
  };

  const generateMetrics = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    // Genera metriche di performance
    const perfMetrics = analyticsService.generatePerformanceMetrics(
      currentUserId,
      currentUserName,
      currentUserRole,
      currentUserAvatar,
      'month',
      startDate,
      endDate
    );
    setPerformanceMetrics(perfMetrics);

    // Genera analytics del team
    const teamAnalytics = analyticsService.generateTeamAnalytics(
      'team-1',
      'Team Urbanova',
      'month',
      startDate,
      endDate
    );
    setTeamAnalytics(teamAnalytics);

    // Genera analytics di collaborazione
    const collabAnalytics = analyticsService.generateCollaborationAnalytics(
      'month',
      startDate,
      endDate
    );
    setCollaborationAnalytics(collabAnalytics);
  };

  const handleCreateDashboard = () => {
    try {
      const dashboard = analyticsService.createDashboard(
        newDashboard.name,
        newDashboard.description,
        newDashboard.type,
        { columns: newDashboard.columns, rows: newDashboard.rows },
        {
          canView: [currentUserRole],
          canEdit: [currentUserRole],
          canShare: [currentUserRole],
          canExport: [currentUserRole],
        }
      );

      setDashboards(prev => [...prev, dashboard]);
      setNewDashboard({
        name: '',
        description: '',
        type: 'team',
        columns: 3,
        rows: 3,
      });
      setShowCreateDashboard(false);

      // Toast di successo (simulato)
      console.log('Dashboard creato con successo!');
    } catch (error) {
      console.error('Errore nella creazione del dashboard:', error);
    }
  };

  const handleCreateReport = () => {
    try {
      const report = analyticsService.generateReport(
        newReport.name,
        newReport.description,
        newReport.type,
        {
          metrics: newReport.metrics,
          period: newReport.period,
          filters: {},
          format: newReport.format,
          includeCharts: newReport.includeCharts,
          includeTables: newReport.includeTables,
          includeInsights: newReport.includeInsights,
        }
      );

      setReports(prev => [...prev, report]);
      setNewReport({
        name: '',
        description: '',
        type: 'performance',
        metrics: ['performance'],
        period: 'month',
        format: 'pdf',
        includeCharts: true,
        includeTables: true,
        includeInsights: true,
      });
      setShowCreateReport(false);

      console.log('Report in generazione...');
    } catch (error) {
      console.error('Errore nella creazione del report:', error);
    }
  };

  const handleExportReport = () => {
    if (!exportConfig.reportId) return;

    try {
      const exportData = analyticsService.exportAnalytics(
        exportConfig.reportId,
        exportConfig.format,
        {
          includeCharts: exportConfig.includeCharts,
          includeTables: exportConfig.includeTables,
          includeInsights: exportConfig.includeInsights,
          compression: exportConfig.compression,
          password: exportConfig.password || undefined,
        }
      );

      setExports(prev => [...prev, exportData]);
      setExportConfig({
        reportId: '',
        format: 'pdf',
        includeCharts: true,
        includeTables: true,
        includeInsights: true,
        compression: false,
        password: '',
      });
      setShowExportModal(false);

      console.log('Export avviato...');
    } catch (error) {
      console.error("Errore nell'export:", error);
    }
  };

  const handleAcknowledgeInsight = (insightId: string) => {
    analyticsService.acknowledgeInsight(insightId, currentUserId);
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const getMetricColor = (metric: AnalyticsMetric) => {
    const colors = {
      performance: 'bg-blue-100 text-blue-800',
      collaboration: 'bg-green-100 text-green-800',
      productivity: 'bg-purple-100 text-purple-800',
      engagement: 'bg-yellow-100 text-yellow-800',
      quality: 'bg-red-100 text-red-800',
      efficiency: 'bg-indigo-100 text-indigo-800',
    };
    return colors[metric] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      generating: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">📊</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Advanced Analytics & Reporting
              </h2>
              <p className="text-sm text-gray-500">
                Dashboard avanzati, report e insights per il team
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Metriche Rapide */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {performanceMetrics && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Performance</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {performanceMetrics.efficiencyScore}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📈</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {performanceMetrics.tasksCompleted}/{performanceMetrics.tasksTotal} task
                  completati
                </p>
              </div>
            )}

            {collaborationAnalytics && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Collaborazione</p>
                    <p className="text-2xl font-bold text-green-900">
                      {collaborationAnalytics.averageCollaborationScore}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">🤝</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {collaborationAnalytics.activeCollaborations} sessioni attive
                </p>
              </div>
            )}

            {teamAnalytics && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Team</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {teamAnalytics.averagePerformance}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">👥</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {teamAnalytics.activeMembers}/{teamAnalytics.totalMembers} membri attivi
                </p>
              </div>
            )}

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Insights</p>
                  <p className="text-2xl font-bold text-yellow-900">{insights.length}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">💡</span>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-1">Nuovi insights disponibili</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'dashboards', label: 'Dashboard', icon: '📊', count: dashboards.length },
              { id: 'reports', label: 'Report', icon: '📄', count: reports.length },
              { id: 'insights', label: 'Insights', icon: '💡', count: insights.length },
              { id: 'exports', label: 'Export', icon: '📤', count: exports.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800">{tab.count}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Dashboard Analytics</h3>
                <Button
                  onClick={() => setShowCreateDashboard(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  ➕ Crea Dashboard
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboards.map(dashboard => (
                  <div
                    key={dashboard.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{dashboard.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{dashboard.description}</p>
                      </div>
                      <Badge
                        className={`${dashboard.type === 'executive' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                      >
                        {dashboard.type}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Widget:</span>
                        <span className="font-medium">{dashboard.layout.widgets.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Visualizzazioni:</span>
                        <span className="font-medium">{dashboard.viewCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Ultimo aggiornamento:</span>
                        <span className="font-medium">{formatDate(dashboard.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors">
                        📊 Visualizza Dashboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Report Analytics</h3>
                <Button
                  onClick={() => setShowCreateReport(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  ➕ Genera Report
                </Button>
              </div>

              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          <Badge className={getMetricColor(report.type as AnalyticsMetric)}>
                            {report.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{report.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Formato:</span>
                            <span className="ml-2 font-medium">
                              {report.config.format.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Periodo:</span>
                            <span className="ml-2 font-medium">{report.config.period}</span>
                          </div>
                          {report.fileSize && (
                            <div>
                              <span className="text-gray-500">Dimensione:</span>
                              <span className="ml-2 font-medium">
                                {Math.round(report.fileSize / 1024)} KB
                              </span>
                            </div>
                          )}
                          {report.generatedAt && (
                            <div>
                              <span className="text-gray-500">Generato:</span>
                              <span className="ml-2 font-medium">
                                {formatDate(report.generatedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {report.status === 'completed' && report.downloadUrl && (
                          <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                            📥 Download
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setExportConfig(prev => ({ ...prev, reportId: report.id }));
                            setShowExportModal(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          📤 Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
                <div className="text-sm text-gray-500">
                  {insights.length} insights non riconosciuti
                </div>
              </div>

              <div className="space-y-4">
                {insights.map(insight => (
                  <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <Badge className={getMetricColor(insight.details.metric)}>
                            {insight.details.metric}
                          </Badge>
                          <Badge
                            className={
                              insight.details.impact === 'high'
                                ? 'bg-red-100 text-red-800'
                                : insight.details.impact === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }
                          >
                            {insight.details.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{insight.description}</p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Valore:</span>
                              <span className="ml-2 font-medium">{insight.details.value}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Soglia:</span>
                              <span className="ml-2 font-medium">{insight.details.threshold}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Direzione:</span>
                              <span className="ml-2 font-medium">
                                {insight.details.direction === 'increasing'
                                  ? '📈'
                                  : insight.details.direction === 'decreasing'
                                    ? '📉'
                                    : '➡️'}
                                {insight.details.direction}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Confidenza:</span>
                              <span className="ml-2 font-medium">
                                {insight.details.confidence}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900">Azioni Suggerite:</h5>
                          {insight.actions.map((action, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <h6 className="font-medium text-gray-800">{action.title}</h6>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getPriorityColor(action.priority)}>
                                    {action.priority}
                                  </Badge>
                                  <Badge
                                    className={`${action.effort === 'high' ? 'bg-red-100 text-red-800' : action.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                                  >
                                    {action.effort} effort
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                              <p className="text-xs text-gray-500">
                                <strong>Risultato atteso:</strong> {action.expectedOutcome}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => handleAcknowledgeInsight(insight.id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          ✅ Riconosci
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Export Analytics</h3>
                <Button
                  onClick={() => setShowExportModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  📤 Nuovo Export
                </Button>
              </div>

              <div className="space-y-4">
                {exports.map(exportData => (
                  <div
                    key={exportData.id}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            Export {exportData.format.toUpperCase()}
                          </h4>
                          <Badge className={getStatusColor(exportData.status)}>
                            {exportData.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Report ID:</span>
                            <span className="ml-2 font-medium">{exportData.reportId}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Formato:</span>
                            <span className="ml-2 font-medium">
                              {exportData.format.toUpperCase()}
                            </span>
                          </div>
                          {exportData.fileSize && (
                            <div>
                              <span className="text-gray-500">Dimensione:</span>
                              <span className="ml-2 font-medium">
                                {Math.round(exportData.fileSize / 1024)} KB
                              </span>
                            </div>
                          )}
                          {exportData.completedAt && (
                            <div>
                              <span className="text-gray-500">Completato:</span>
                              <span className="ml-2 font-medium">
                                {formatDate(exportData.completedAt)}
                              </span>
                            </div>
                          )}
                        </div>

                        {exportData.progress < 100 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-500">Progresso:</span>
                              <span className="font-medium">
                                {Math.round(exportData.progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${exportData.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {exportData.status === 'completed' && exportData.downloadUrl && (
                        <button className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                          📥 Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Creazione Dashboard */}
        {showCreateDashboard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Nuovo Dashboard</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newDashboard.name}
                    onChange={e => setNewDashboard(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nome del dashboard"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={newDashboard.description}
                    onChange={e =>
                      setNewDashboard(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                    placeholder="Descrizione del dashboard"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={newDashboard.type}
                      onChange={e =>
                        setNewDashboard(prev => ({ ...prev, type: e.target.value as any }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="team">Team</option>
                      <option value="project">Progetto</option>
                      <option value="individual">Individuale</option>
                      <option value="executive">Executive</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                    <select
                      value={`${newDashboard.columns}x${newDashboard.rows}`}
                      onChange={e => {
                        const [cols, rows] = e.target.value.split('x').map(Number);
                        setNewDashboard(prev => ({ ...prev, columns: cols, rows: rows }));
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="2x2">2x2</option>
                      <option value="3x3">3x3</option>
                      <option value="4x3">4x3</option>
                      <option value="4x4">4x4</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateDashboard(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <Button
                  onClick={handleCreateDashboard}
                  disabled={!newDashboard.name}
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  Crea Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Creazione Report */}
        {showCreateReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Genera Nuovo Report</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newReport.name}
                    onChange={e => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nome del report"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={e => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    rows={2}
                    placeholder="Descrizione del report"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={newReport.type}
                      onChange={e =>
                        setNewReport(prev => ({ ...prev, type: e.target.value as any }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="performance">Performance</option>
                      <option value="collaboration">Collaborazione</option>
                      <option value="productivity">Produttività</option>
                      <option value="engagement">Engagement</option>
                      <option value="quality">Qualità</option>
                      <option value="comprehensive">Completo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                    <select
                      value={newReport.period}
                      onChange={e =>
                        setNewReport(prev => ({
                          ...prev,
                          period: e.target.value as AnalyticsPeriod,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="day">Giornaliero</option>
                      <option value="week">Settimanale</option>
                      <option value="month">Mensile</option>
                      <option value="quarter">Trimestrale</option>
                      <option value="year">Annuale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                  <select
                    value={newReport.format}
                    onChange={e =>
                      setNewReport(prev => ({ ...prev, format: e.target.value as ReportFormat }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="html">HTML</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Includi</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newReport.includeCharts}
                        onChange={e =>
                          setNewReport(prev => ({ ...prev, includeCharts: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Grafici</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newReport.includeTables}
                        onChange={e =>
                          setNewReport(prev => ({ ...prev, includeTables: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Tabelle</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newReport.includeInsights}
                        onChange={e =>
                          setNewReport(prev => ({ ...prev, includeInsights: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">AI Insights</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateReport(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <Button
                  onClick={handleCreateReport}
                  disabled={!newReport.name}
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  Genera Report
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Export */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Report</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report</label>
                  <select
                    value={exportConfig.reportId}
                    onChange={e => setExportConfig(prev => ({ ...prev, reportId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Seleziona report</option>
                    {reports
                      .filter(r => r.status === 'completed')
                      .map(report => (
                        <option key={report.id} value={report.id}>
                          {report.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                  <select
                    value={exportConfig.format}
                    onChange={e =>
                      setExportConfig(prev => ({ ...prev, format: e.target.value as ReportFormat }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="html">HTML</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Opzioni</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeCharts}
                        onChange={e =>
                          setExportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Includi Grafici</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeTables}
                        onChange={e =>
                          setExportConfig(prev => ({ ...prev, includeTables: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Includi Tabelle</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeInsights}
                        onChange={e =>
                          setExportConfig(prev => ({ ...prev, includeInsights: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Includi Insights</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportConfig.compression}
                        onChange={e =>
                          setExportConfig(prev => ({ ...prev, compression: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Comprimi File</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (opzionale)
                  </label>
                  <input
                    type="password"
                    value={exportConfig.password}
                    onChange={e => setExportConfig(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Password per proteggere il file"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <Button
                  onClick={handleExportReport}
                  disabled={!exportConfig.reportId}
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  Avvia Export
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
