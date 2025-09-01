'use client';

import React, { useState, useEffect } from 'react';

import { monitoringService } from '@/lib/monitoringService';
import {
  MetricDefinition,
  MetricSeries,
  Alert,
  LogEntry,
  LogQuery,
  LogQueryResult,
  ServiceMap,
  ServiceNode,
  Dashboard,
  MonitoringTarget,
  SLO,
  Incident,
  MonitoringStats,
  AlertSeverity,
  AlertStatus,
  LogLevel,
  ServiceStatus,
  TimeRange,
  ChartType,
} from '@/types/monitoring';
import { TeamRole } from '@/types/team';

import { Badge } from './Badge';

interface MonitoringObservabilityProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function MonitoringObservability({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
}: MonitoringObservabilityProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'metrics' | 'alerts' | 'logs' | 'traces' | 'slo' | 'infrastructure'
  >('overview');

  // Stati per i dati
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serviceMap, setServiceMap] = useState<ServiceMap | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [targets, setTargets] = useState<MonitoringTarget[]>([]);
  const [slos, setSlos] = useState<SLO[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Stati per le query e filtri
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1h');
  const [logQuery, setLogQuery] = useState('');
  const [logLevel, setLogLevel] = useState<LogLevel | ''>('');
  const [logService, setLogService] = useState('');
  const [alertFilter, setAlertFilter] = useState<AlertSeverity | ''>('');
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Stati per i modal
  const [showMetricDetails, setShowMetricDetails] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedLogEntry, setSelectedLogEntry] = useState<LogEntry | null>(null);

  // Form states
  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    metricId: '',
    condition: '>',
    threshold: 0,
    severity: 'warning' as AlertSeverity,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Refresh data ogni 30 secondi
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadData = () => {
    setMonitoringStats(monitoringService.generateMonitoringStats());
    setMetrics(monitoringService.getMetrics());
    setAlerts(monitoringService.getAlerts());
    setServiceMap(monitoringService.getServiceMap());
    setDashboards(monitoringService.getDashboards());
    setTargets(monitoringService.getTargets());
    setSlos(monitoringService.getSLOs());
    setIncidents(monitoringService.getIncidents());

    // Carica log con query di default
    const defaultLogQuery: LogQuery = {
      query: logQuery,
      timeRange: selectedTimeRange,
      services: logService ? [logService] : undefined,
      levels: logLevel ? [logLevel] : undefined,
      limit: 50,
      offset: 0,
      orderBy: 'timestamp',
      orderDirection: 'desc',
    };

    const logResult = monitoringService.searchLogs(defaultLogQuery);
    setLogs(logResult.entries);
  };

  const handleCreateAlert = () => {
    try {
      const alert = monitoringService.createAlert(
        newAlert.name,
        newAlert.description,
        newAlert.metricId,
        newAlert.condition,
        newAlert.threshold,
        newAlert.severity
      );

      setAlerts(prev => [...prev, alert]);
      setNewAlert({
        name: '',
        description: '',
        metricId: '',
        condition: '>',
        threshold: 0,
        severity: 'warning',
      });
      setShowCreateAlert(false);

      console.log('Alert creato con successo!');
    } catch (error) {
      console.error("Errore nella creazione dell'alert:", error);
    }
  };

  const handleUpdateAlertStatus = (alertId: string, status: AlertStatus) => {
    const success = monitoringService.updateAlertStatus(alertId, status);
    if (success) {
      loadData();
      console.log('Status alert aggiornato con successo!');
    }
  };

  const handleLogSearch = () => {
    const query: LogQuery = {
      query: logQuery,
      timeRange: selectedTimeRange,
      services: logService ? [logService] : undefined,
      levels: logLevel ? [logLevel] : undefined,
      limit: 100,
      offset: 0,
      orderBy: 'timestamp',
      orderDirection: 'desc',
    };

    const result = monitoringService.searchLogs(query);
    setLogs(result.entries);
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: AlertStatus | ServiceStatus) => {
    const colors = {
      active: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      suppressed: 'bg-gray-100 text-gray-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      unhealthy: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLogLevelColor = (level: LogLevel) => {
    const colors = {
      trace: 'bg-gray-100 text-gray-600',
      debug: 'bg-blue-100 text-blue-600',
      info: 'bg-green-100 text-green-600',
      warn: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600',
      fatal: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const filteredAlerts = alerts.filter(alert => {
    return alertFilter === '' || alert.severity === alertFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">📊</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Monitoring & Observability</h2>
              <p className="text-sm text-gray-500">
                Sistema completo di monitoring e osservabilità
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Quick Stats */}
        {monitoringStats && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">System Uptime</p>
                    <p className="text-2xl font-bold text-green-900">
                      {monitoringStats.system.uptime}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">🟢</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Metriche</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {monitoringStats.system.totalMetrics}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📈</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">attive</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Alert Attivi</p>
                    <p className="text-2xl font-bold text-red-900">
                      {monitoringStats.alerting.activeAlerts}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🚨</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  su {monitoringStats.alerting.totalAlerts} totali
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Servizi</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {monitoringStats.system.servicesMonitored}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">🔧</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">monitorati</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">SLO Compliance</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {monitoringStats.sloCompliance.healthySLOs}/
                      {monitoringStats.sloCompliance.totalSLOs}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">🎯</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  {Math.round(
                    (monitoringStats.sloCompliance.healthySLOs /
                      monitoringStats.sloCompliance.totalSLOs) *
                      100
                  )}
                  % healthy
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">Query Latency</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {monitoringStats.system.queryLatency}ms
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600">⚡</span>
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-1">avg response</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊', count: 0 },
              { id: 'metrics', label: 'Metriche', icon: '📈', count: metrics.length },
              {
                id: 'alerts',
                label: 'Alert',
                icon: '🚨',
                count: alerts.filter(a => a.status === 'active').length,
              },
              { id: 'logs', label: 'Log', icon: '📝', count: logs.length },
              { id: 'traces', label: 'Traces', icon: '🔍', count: 0 },
              { id: 'slo', label: 'SLO/SLI', icon: '🎯', count: slos.length },
              { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️', count: targets.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">{tab.count}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && monitoringStats && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* System Health */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${monitoringStats.system.uptime}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {monitoringStats.system.uptime}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Query Latency</span>
                      <span className="text-sm font-medium text-gray-900">
                        {monitoringStats.system.queryLatency}ms
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ingestion Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        {monitoringStats.system.ingestionRate}/sec
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage Usage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${monitoringStats.system.storageUsage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {monitoringStats.system.storageUsage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Summary</h3>
                  <div className="space-y-3">
                    {Object.entries(monitoringStats.alerting.alertsBySeverity).map(
                      ([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(severity as AlertSeverity)}>
                              {severity}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">MTTR:</span>
                        <span className="ml-2 font-medium">
                          {monitoringStats.alerting.meanTimeToResolve}min
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">MTTA:</span>
                        <span className="ml-2 font-medium">
                          {monitoringStats.alerting.meanTimeToAcknowledge}min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Map */}
              {serviceMap && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Service Map</h3>
                  <div className="relative bg-gray-50 rounded-lg p-8 min-h-64">
                    {serviceMap.services.map(service => (
                      <div
                        key={service.id}
                        className="absolute bg-white border-2 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          left: `${service.position.x}px`,
                          top: `${service.position.y}px`,
                          borderColor:
                            service.status === 'healthy'
                              ? '#10B981'
                              : service.status === 'degraded'
                                ? '#F59E0B'
                                : '#EF4444',
                        }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">
                            {service.type === 'service'
                              ? '⚙️'
                              : service.type === 'database'
                                ? '🗄️'
                                : '🔧'}
                          </span>
                          <h4 className="font-medium text-sm">{service.name}</h4>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>RPS: {service.requestRate}</div>
                          <div>Error: {service.errorRate}%</div>
                          <div>Latency: {service.avgLatency}ms</div>
                        </div>
                        <Badge className={getStatusColor(service.status)} size="sm">
                          {service.status}
                        </Badge>
                      </div>
                    ))}

                    {/* Connections */}
                    <svg className="absolute inset-0 pointer-events-none">
                      {serviceMap.connections.map(conn => {
                        const source = serviceMap.services.find(s => s.id === conn.sourceId);
                        const target = serviceMap.services.find(s => s.id === conn.targetId);
                        if (!source || !target) return null;

                        return (
                          <line
                            key={conn.id}
                            x1={source.position.x + 50}
                            y1={source.position.y + 40}
                            x2={target.position.x + 50}
                            y2={target.position.y + 40}
                            stroke={conn.isHealthy ? '#10B981' : '#EF4444'}
                            strokeWidth="2"
                            strokeDasharray={conn.isHealthy ? '0' : '5,5'}
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* Top Queries */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Query più Frequenti</h3>
                <div className="space-y-3">
                  {monitoringStats.usage.topQueries.map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <code className="text-sm text-gray-800 font-mono">{query.query}</code>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{query.executions} exec</span>
                        <span>{query.avgLatency}ms avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Metriche di Sistema</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedTimeRange}
                    onChange={e => setSelectedTimeRange(e.target.value as TimeRange)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="5m">Ultimi 5 minuti</option>
                    <option value="15m">Ultimi 15 minuti</option>
                    <option value="1h">Ultima ora</option>
                    <option value="6h">Ultime 6 ore</option>
                    <option value="24h">Ultime 24 ore</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {metrics.map(metric => (
                  <div
                    key={metric.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedMetric(metric);
                      setShowMetricDetails(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className="bg-blue-100 text-blue-800">{metric.type}</Badge>
                        <Badge
                          className={
                            metric.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {metric.isActive ? 'Attiva' : 'Inattiva'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Categoria:</span>
                        <span className="font-medium">{metric.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Unità:</span>
                        <span className="font-medium">{metric.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Intervallo:</span>
                        <span className="font-medium">{metric.interval}</span>
                      </div>
                      {metric.thresholds.warning && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Soglia Warning:</span>
                          <span className="font-medium text-yellow-600">
                            {metric.thresholds.warning}
                          </span>
                        </div>
                      )}
                      {metric.thresholds.critical && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Soglia Critical:</span>
                          <span className="font-medium text-red-600">
                            {metric.thresholds.critical}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {metric.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} className="bg-gray-100 text-gray-600 text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {metric.tags.length > 3 && (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">
                            +{metric.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Alert di Monitoring</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={alertFilter}
                    onChange={e => setAlertFilter(e.target.value as AlertSeverity | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutte le severità</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button
                    onClick={() => setShowCreateAlert(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Alert
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{alert.name}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Metrica:</span>
                            <span className="ml-2 font-medium">{alert.metricName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Condizione:</span>
                            <span className="ml-2 font-medium">
                              {alert.condition} {alert.threshold}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Valore corrente:</span>
                            <span className="ml-2 font-medium">
                              {alert.currentValue?.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Durata:</span>
                            <span className="ml-2 font-medium">{alert.duration}</span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-500">
                          <span>Attivato: {formatDate(alert.triggeredAt)}</span>
                          {alert.acknowledgedAt && (
                            <span className="ml-4">
                              Riconosciuto: {formatDate(alert.acknowledgedAt)}
                            </span>
                          )}
                          {alert.resolvedAt && (
                            <span className="ml-4">Risolto: {formatDate(alert.resolvedAt)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleUpdateAlertStatus(alert.id, 'acknowledged')}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              ✅ Riconosci
                            </button>
                            <button
                              onClick={() => handleUpdateAlertStatus(alert.id, 'resolved')}
                              className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              🔧 Risolvi
                            </button>
                          </>
                        )}
                        {alert.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateAlertStatus(alert.id, 'active')}
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            🚨 Attiva
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowAlertDetails(true);
                          }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={logQuery}
                      onChange={e => setLogQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cerca nei log..."
                    />
                  </div>
                  <select
                    value={logLevel}
                    onChange={e => setLogLevel(e.target.value as LogLevel | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i livelli</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                    <option value="fatal">Fatal</option>
                  </select>
                  <select
                    value={logService}
                    onChange={e => setLogService(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i servizi</option>
                    <option value="urbanova-api">API</option>
                    <option value="urbanova-frontend">Frontend</option>
                    <option value="urbanova-worker">Worker</option>
                  </select>
                  <button
                    onClick={handleLogSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    🔍 Cerca
                  </button>
                </div>
              </div>

              <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-y-auto max-h-96">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-4 py-1 hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setSelectedLogEntry(log);
                      setShowLogDetails(true);
                    }}
                  >
                    <span className="text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                        log.level === 'error'
                          ? 'bg-red-900 text-red-200'
                          : log.level === 'warn'
                            ? 'bg-yellow-900 text-yellow-200'
                            : log.level === 'info'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-blue-400 text-xs whitespace-nowrap">[{log.service}]</span>
                    <span className="text-white flex-1 truncate">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'slo' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Service Level Objectives</h3>

              <div className="space-y-6">
                {slos.map(slo => (
                  <div key={slo.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{slo.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{slo.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          className={
                            slo.status === 'healthy'
                              ? 'bg-green-100 text-green-800'
                              : slo.status === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {slo.status}
                        </Badge>
                        <span className="text-lg font-bold text-gray-900">
                          {slo.currentCompliance}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Obiettivo</h5>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${slo.currentCompliance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{slo.objective}%</span>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Error Budget</h5>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Totale:</span>
                            <span className="font-medium">{slo.errorBudget.total}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Consumato:</span>
                            <span className="font-medium text-red-600">
                              {slo.errorBudget.consumed}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Rimanente:</span>
                            <span className="font-medium text-green-600">
                              {slo.errorBudget.remaining}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">SLI Associati</h5>
                        <div className="space-y-1">
                          {slo.slis.map(sli => (
                            <div key={sli.id} className="text-sm">
                              <span className="text-gray-600">{sli.name}:</span>
                              <span className="ml-2 font-medium">{sli.currentValue}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Servizio: {slo.service}</span>
                        <span>Team: {slo.team}</span>
                        <span>Finestra: {slo.timeWindow}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Infrastructure Monitoring</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {targets.map(target => (
                  <div key={target.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{target.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {target.type === 'http' ? target.url : `${target.host}:${target.port}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getStatusColor(target.status)}>{target.status}</Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          {target.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Uptime:</span>
                        <span className="ml-2 font-medium">{target.uptime}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Response Time:</span>
                        <span className="ml-2 font-medium">{target.responseTime}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Intervallo:</span>
                        <span className="ml-2 font-medium">{target.interval}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Timeout:</span>
                        <span className="ml-2 font-medium">{target.timeout}s</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Ultimo check:</span>
                        <span className="font-medium">{formatDate(target.lastCheck)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Prossimo check:</span>
                        <span className="font-medium">{formatDate(target.nextCheck)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Ambiente: {target.environment}</span>
                        <span className="text-gray-500">Team: {target.team}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Creazione Alert */}
        {showCreateAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Nuovo Alert</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newAlert.name}
                    onChange={e => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome dell'alert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={newAlert.description}
                    onChange={e => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrizione dell'alert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metrica</label>
                  <select
                    value={newAlert.metricId}
                    onChange={e => setNewAlert(prev => ({ ...prev, metricId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleziona metrica</option>
                    {metrics.map(metric => (
                      <option key={metric.id} value={metric.id}>
                        {metric.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condizione
                    </label>
                    <select
                      value={newAlert.condition}
                      onChange={e => setNewAlert(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value=">">Maggiore di</option>
                      <option value="<">Minore di</option>
                      <option value="=">Uguale a</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soglia</label>
                    <input
                      type="number"
                      value={newAlert.threshold}
                      onChange={e =>
                        setNewAlert(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severità</label>
                    <select
                      value={newAlert.severity}
                      onChange={e =>
                        setNewAlert(prev => ({
                          ...prev,
                          severity: e.target.value as AlertSeverity,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateAlert(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateAlert}
                  disabled={!newAlert.name || !newAlert.metricId}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Crea Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dettagli Log */}
        {showLogDetails && selectedLogEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Dettagli Log Entry</h3>
                <button
                  onClick={() => {
                    setShowLogDetails(false);
                    setSelectedLogEntry(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedLogEntry.timestamp)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Level</label>
                      <Badge className={getLogLevelColor(selectedLogEntry.level)}>
                        {selectedLogEntry.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLogEntry.service}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instance</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLogEntry.instance}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-900 font-mono">{selectedLogEntry.message}</p>
                    </div>
                  </div>

                  {Object.keys(selectedLogEntry.fields).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fields</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <pre className="text-xs text-gray-900">
                          {JSON.stringify(selectedLogEntry.fields, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
