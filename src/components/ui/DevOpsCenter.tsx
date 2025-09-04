'use client';

import React, { useState, useEffect } from 'react';

import { devopsService } from '@/lib/devopsService';
import {
  Pipeline,
  PipelineRun,
  Environment,
  Infrastructure,
  Release,
  DevOpsMetrics,
  Incident,
  DevOpsConfiguration,
  DevOpsStats,
  PipelineStatus,
  DeploymentEnvironment,
  BuildTrigger,
  ArtifactType,
  TestType,
  SecurityScanType,
  InfrastructureProvider,
  MonitoringTool,
  NotificationChannel,
  GitProvider,
  QualityGate,
  ReleaseStrategy,
  ResourceType,
  ComplianceFramework,
} from '@/types/devops';
import { TeamRole } from '@/types/team';

import { Badge } from './Badge';

interface DevOpsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function DevOpsCenter({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
}: DevOpsCenterProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'pipelines'
    | 'environments'
    | 'infrastructure'
    | 'releases'
    | 'incidents'
    | 'metrics'
    | 'configuration'
  >('overview');

  // Stati per i dati
  const [devopsStats, setDevopsStats] = useState<DevOpsStats | null>(null);
  const [devopsMetrics, setDevopsMetrics] = useState<DevOpsMetrics | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [infrastructures, setInfrastructures] = useState<Infrastructure[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [configuration, setConfiguration] = useState<DevOpsConfiguration | null>(null);

  // Stati per filtri e ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | ''>('');
  const [environmentFilter, setEnvironmentFilter] = useState<DeploymentEnvironment | ''>('');
  const [triggerFilter, setTriggerFilter] = useState<BuildTrigger | ''>('');
  const [severityFilter, setSeverityFilter] = useState<'low' | 'medium' | 'high' | 'critical' | ''>(
    ''
  );

  // Stati per i modal
  const [showCreatePipeline, setShowCreatePipeline] = useState(false);
  const [showCreateEnvironment, setShowCreateEnvironment] = useState(false);
  const [showCreateRelease, setShowCreateRelease] = useState(false);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [selectedPipelineRun, setSelectedPipelineRun] = useState<PipelineRun | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Form states
  const [createPipelineForm, setCreatePipelineForm] = useState({
    name: '',
    description: '',
    repositoryUrl: '',
    branch: 'main',
    triggers: ['push'] as BuildTrigger[],
    enabled: true,
  });

  const [createEnvironmentForm, setCreateEnvironmentForm] = useState({
    name: '',
    type: 'development' as DeploymentEnvironment,
    description: '',
    url: '',
    namespace: '',
    requireApproval: false,
  });

  const [createReleaseForm, setCreateReleaseForm] = useState({
    name: '',
    version: '',
    description: '',
    strategy: 'rolling' as ReleaseStrategy,
    pipelineRunId: '',
    environments: [] as string[],
  });

  const [createIncidentForm, setCreateIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: 'deployment' as
      | 'deployment'
      | 'infrastructure'
      | 'security'
      | 'performance'
      | 'data'
      | 'external',
    environments: [] as DeploymentEnvironment[],
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Refresh data ogni 30 secondi
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isOpen]);

  const loadData = () => {
    setDevopsStats(devopsService.generateDevOpsStats());
    setDevopsMetrics(devopsService.generateDevOpsMetrics());
    setPipelines(devopsService.getPipelines());
    setPipelineRuns(devopsService.getPipelineRuns().slice(0, 50)); // Mostra solo le ultime 50
    setEnvironments(devopsService.getEnvironments());
    setInfrastructures(devopsService.getInfrastructures());
    setReleases(devopsService.getReleases());
    setIncidents(devopsService.getIncidents());
    setConfiguration(devopsService.getConfiguration());
  };

  const handleCreatePipeline = () => {
    try {
      const pipeline = devopsService.createPipeline({
        name: createPipelineForm.name,
        description: createPipelineForm.description,
        repository: {
          provider: 'github',
          url: createPipelineForm.repositoryUrl,
          branch: createPipelineForm.branch,
        },
        triggers: createPipelineForm.triggers.map(trigger => ({
          type: trigger,
          config: {},
          enabled: true,
        })),
        variables: {},
        stages: [
          {
            id: 'build',
            name: 'Build',
            order: 1,
            jobs: [
              {
                id: 'compile',
                name: 'Compile & Test',
                order: 1,
                runner: {
                  type: 'docker',
                  image: 'node:18-alpine',
                },
                steps: [
                  {
                    id: 'checkout',
                    name: 'Checkout Code',
                    order: 1,
                    type: 'action',
                    config: {
                      action: 'actions/checkout@v3',
                    },
                  },
                ],
              },
            ],
          },
        ],
        qualityGates: [
          {
            type: 'coverage',
            threshold: 80,
            operator: 'gte',
            blocking: true,
          },
        ],
        notifications: [],
        status: 'pending',
        enabled: createPipelineForm.enabled,
        version: '1.0.0',
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });

      setPipelines(prev => [pipeline, ...prev]);
      setCreatePipelineForm({
        name: '',
        description: '',
        repositoryUrl: '',
        branch: 'main',
        triggers: ['push'],
        enabled: true,
      });
      setShowCreatePipeline(false);
      console.log('Pipeline creata con successo!', pipeline);
    } catch (error) {
      console.error('Errore nella creazione pipeline:', error);
    }
  };

  const handleRunPipeline = (pipelineId: string) => {
    const run = devopsService.runPipeline(pipelineId, {
      type: 'manual',
      manual: {
        user: currentUserName,
        reason: 'Manual execution from DevOps Center',
      },
    });

    if (run) {
      setPipelineRuns(prev => [run, ...prev]);
      console.log('Pipeline eseguita con successo!', run);
    }
  };

  const handleCreateEnvironment = () => {
    try {
      const environment = devopsService.createEnvironment({
        name: createEnvironmentForm.name,
        type: createEnvironmentForm.type,
        description: createEnvironmentForm.description,
        config: {
          url: createEnvironmentForm.url,
          namespace: createEnvironmentForm.namespace,
          provider: 'kubernetes',
        },
        protection: {
          requireApproval: createEnvironmentForm.requireApproval,
        },
        variables: {},
        resources: {
          limits: {
            cpu: '2',
            memory: '4Gi',
            storage: '20Gi',
            network: '1Gbps',
            gpu: '0',
            database: '1',
            cache: '1',
            queue: '1',
          },
          requests: {
            cpu: '0.5',
            memory: '1Gi',
            storage: '10Gi',
            network: '100Mbps',
            gpu: '0',
            database: '1',
            cache: '1',
            queue: '1',
          },
        },
        monitoring: {
          enabled: true,
          tools: ['prometheus'],
        },
        status: 'active',
        health: 'healthy',
        createdBy: currentUserId,
      });

      setEnvironments(prev => [environment, ...prev]);
      setCreateEnvironmentForm({
        name: '',
        type: 'development',
        description: '',
        url: '',
        namespace: '',
        requireApproval: false,
      });
      setShowCreateEnvironment(false);
      console.log('Ambiente creato con successo!', environment);
    } catch (error) {
      console.error('Errore nella creazione ambiente:', error);
    }
  };

  const handleCreateRelease = () => {
    try {
      const release = devopsService.createRelease({
        name: createReleaseForm.name,
        version: createReleaseForm.version,
        description: createReleaseForm.description,
        strategy: createReleaseForm.strategy,
        source: {
          pipelineRunId: createReleaseForm.pipelineRunId || 'run-manual',
          commit: 'manual-release',
          branch: 'main',
          artifacts: [],
        },
        environments: createReleaseForm.environments.map((envId, index) => ({
          environmentId: envId,
          environmentName: environments.find(e => e.id === envId)?.name || envId,
          order: index + 1,
          config: {},
          status: 'pending',
          health: {
            status: 'unknown',
            checks: [],
          },
        })),
        qualityGates: [
          {
            type: 'coverage',
            passed: true,
            value: 85,
            threshold: 80,
          },
        ],
        status: 'draft',
        createdBy: currentUserId,
      });

      setReleases(prev => [release, ...prev]);
      setCreateReleaseForm({
        name: '',
        version: '',
        description: '',
        strategy: 'rolling',
        pipelineRunId: '',
        environments: [],
      });
      setShowCreateRelease(false);
      console.log('Release creata con successo!', release);
    } catch (error) {
      console.error('Errore nella creazione release:', error);
    }
  };

  const handleCreateIncident = () => {
    try {
      const incident = devopsService.createIncident({
        title: createIncidentForm.title,
        description: createIncidentForm.description,
        severity: createIncidentForm.severity,
        priority: createIncidentForm.severity as any,
        category: createIncidentForm.category,
        status: 'open',
        impact: {
          environments: createIncidentForm.environments,
          services: [],
          users: 0,
          sla: false,
        },
        detectedAt: new Date(),
        team: [currentUserId],
        communications: [],
        related: {
          pipelines: [],
          deployments: [],
          releases: [],
          alerts: [],
        },
        createdBy: currentUserId,
      });

      setIncidents(prev => [incident, ...prev]);
      setCreateIncidentForm({
        title: '',
        description: '',
        severity: 'medium',
        category: 'deployment',
        environments: [],
      });
      setShowCreateIncident(false);
      console.log('Incident creato con successo!', incident);
    } catch (error) {
      console.error('Errore nella creazione incident:', error);
    }
  };

  const handleApproveDeployment = (releaseId: string, environmentId: string) => {
    const success = devopsService.approveDeployment(releaseId, environmentId, currentUserId);
    if (success) {
      loadData(); // Ricarica dati per aggiornare UI
      console.log(`Deployment approvato per release ${releaseId} in ambiente ${environmentId}`);
    }
  };

  const handleUpdateIncidentStatus = (incidentId: string, status: Incident['status']) => {
    const success = devopsService.updateIncidentStatus(incidentId, status);
    if (success) {
      loadData(); // Ricarica dati per aggiornare UI
      console.log(`Incident ${incidentId} aggiornato a stato ${status}`);
    }
  };

  const getStatusColor = (
    status:
      | PipelineStatus
      | Environment['status']
      | Infrastructure['status']
      | Release['status']
      | Incident['status']
      | string
  ) => {
    const colors = {
      // Pipeline statuses
      pending: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      skipped: 'bg-gray-100 text-gray-600',
      waiting: 'bg-orange-100 text-orange-800',
      manual: 'bg-purple-100 text-purple-800',

      // Environment/Infrastructure statuses
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      deprecated: 'bg-red-100 text-red-800',
      provisioning: 'bg-blue-100 text-blue-800',
      updating: 'bg-blue-100 text-blue-800',
      destroying: 'bg-red-100 text-red-800',
      error: 'bg-red-100 text-red-800',

      // Health statuses
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      unhealthy: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800',

      // Release statuses
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      deployed: 'bg-green-100 text-green-800',
      rolled_back: 'bg-orange-100 text-orange-800',

      // Incident statuses
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      identified: 'bg-blue-100 text-blue-800',
      monitoring: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity];
  };

  const getTriggerIcon = (trigger: BuildTrigger) => {
    const icons = {
      push: '📤',
      pull_request: '🔀',
      schedule: '⏰',
      manual: '👤',
      webhook: '🔗',
      tag: '🏷️',
      release: '🚀',
      api: '🔌',
    };
    return icons[trigger] || '📋';
  };

  const getEnvironmentIcon = (type: DeploymentEnvironment) => {
    const icons = {
      development: '🛠️',
      staging: '🎭',
      production: '🏭',
      testing: '🧪',
      preview: '👁️',
      canary: '🐤',
      blue: '🔵',
      green: '🟢',
    };
    return icons[type] || '🌍';
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

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toLocaleString('it-IT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesQuery =
      searchQuery === '' ||
      pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipeline.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesQuery;
  });

  const filteredPipelineRuns = pipelineRuns.filter(run => {
    const matchesQuery =
      searchQuery === '' ||
      run.pipelineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.trigger.commit?.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === '' || run.status === statusFilter;
    const matchesEnvironment = environmentFilter === '' || run.environment === environmentFilter;
    const matchesTrigger = triggerFilter === '' || run.trigger.type === triggerFilter;

    return matchesQuery && matchesStatus && matchesEnvironment && matchesTrigger;
  });

  const filteredEnvironments = environments.filter(env => {
    const matchesQuery =
      searchQuery === '' ||
      env.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      env.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesQuery;
  });

  const filteredReleases = releases.filter(release => {
    const matchesQuery =
      searchQuery === '' ||
      release.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (release.description &&
        release.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesQuery;
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesQuery =
      searchQuery === '' ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === '' || incident.severity === severityFilter;

    return matchesQuery && matchesSeverity;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">🚀</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                DevOps & CI/CD Pipeline Center
              </h2>
              <p className="text-sm text-gray-500">
                Centro avanzato per gestione DevOps, CI/CD e Infrastructure
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* DevOps Stats Overview */}
        {devopsStats && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Pipeline Attive</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {devopsStats.overview.activePipelines}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🔄</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  su {devopsStats.overview.totalPipelines} totali
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Success Rate</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatNumber(devopsStats.performance.pipelineSuccessRate)}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">pipeline builds</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Deploy Frequency</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatNumber(devopsStats.performance.deploymentFrequency)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">🚀</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">per day</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Build Time</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {formatDuration(devopsStats.performance.averageBuildTime)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">⏱️</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">average</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Open Incidents</p>
                    <p className="text-2xl font-bold text-red-900">
                      {devopsStats.overview.openIncidents}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🚨</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-1">need attention</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">System Health</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {devopsStats.overview.systemHealth === 'healthy'
                        ? '💚'
                        : devopsStats.overview.systemHealth === 'degraded'
                          ? '💛'
                          : '❤️'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600">🏥</span>
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-1">{devopsStats.overview.systemHealth}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '🎯', count: 0 },
              { id: 'pipelines', label: 'Pipeline', icon: '🔄', count: pipelines.length },
              { id: 'environments', label: 'Ambienti', icon: '🌍', count: environments.length },
              {
                id: 'infrastructure',
                label: 'Infrastruttura',
                icon: '🏗️',
                count: infrastructures.length,
              },
              { id: 'releases', label: 'Release', icon: '🚀', count: releases.length },
              { id: 'incidents', label: 'Incident', icon: '🚨', count: incidents.length },
              { id: 'metrics', label: 'Metriche', icon: '📊', count: 0 },
              { id: 'configuration', label: 'Config', icon: '⚙️', count: 0 },
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
          {activeTab === 'overview' && devopsMetrics && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* DORA Metrics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">DORA Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deployment Frequency</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {devopsMetrics.dora.deploymentFrequency.value}
                        </span>
                        <div className="text-sm text-blue-600">
                          {devopsMetrics.dora.deploymentFrequency.unit.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lead Time</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {devopsMetrics.dora.leadTime.value}h avg
                        </div>
                        <div className="text-xs text-gray-500">
                          P95: {devopsMetrics.dora.leadTime.p95}h
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MTTR</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {devopsMetrics.dora.meanTimeToRecovery.value}h avg
                        </div>
                        <div className="text-xs text-gray-500">
                          P95: {devopsMetrics.dora.meanTimeToRecovery.p95}h
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Change Failure Rate</span>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            devopsMetrics.dora.changeFailureRate.value < 15
                              ? 'bg-green-500'
                              : devopsMetrics.dora.changeFailureRate.value < 25
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm font-medium">
                          {devopsMetrics.dora.changeFailureRate.value}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pipeline Performance */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Runs</span>
                      <span className="text-lg font-bold text-gray-900">
                        {devopsMetrics.pipelines.totalRuns.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${devopsMetrics.pipelines.successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {formatNumber(devopsMetrics.pipelines.successRate)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Duration</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatDuration(devopsMetrics.pipelines.averageDuration)}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Top Failure Reasons</div>
                      <div className="space-y-1">
                        {devopsMetrics.pipelines.failureReasons.slice(0, 3).map((reason, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{reason.reason}</span>
                            <span className="text-red-600">{reason.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Environment Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {devopsMetrics.environments.map(env => (
                    <div key={env.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{env.name}</h4>
                        <div
                          className={`w-3 h-3 rounded-full ${env.uptime > 99 ? 'bg-green-500' : env.uptime > 95 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        ></div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uptime</span>
                          <span className="font-medium">{formatNumber(env.uptime)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deployments</span>
                          <span className="font-medium">{env.deployments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Deploy Time</span>
                          <span className="font-medium">
                            {formatDuration(env.averageDeploymentTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality & Cost Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Test Coverage</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${devopsMetrics.quality.testCoverage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {formatNumber(devopsMetrics.quality.testCoverage)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Code Quality</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatNumber(devopsMetrics.quality.codeQuality)}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Security Score</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatNumber(devopsMetrics.quality.securityScore)}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatNumber(devopsMetrics.quality.performanceScore)}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Infrastructure</span>
                      <span className="text-sm font-medium text-blue-600">
                        €{devopsMetrics.costs.infrastructure.current.toLocaleString()}/mese
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CI/CD</span>
                      <span className="text-sm font-medium text-purple-600">
                        €{devopsMetrics.costs.ci_cd.current.toLocaleString()}/mese
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost per Deploy</span>
                      <span className="text-sm font-medium text-orange-600">
                        €{formatNumber(devopsMetrics.costs.costPerDeployment)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total Budget</span>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            €
                            {(
                              devopsMetrics.costs.infrastructure.current +
                              devopsMetrics.costs.ci_cd.current
                            ).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            di €
                            {(
                              devopsMetrics.costs.infrastructure.budget +
                              devopsMetrics.costs.ci_cd.budget
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">CI/CD Pipeline</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca pipeline..."
                  />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as PipelineStatus | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti gli stati</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="running">Running</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select
                    value={triggerFilter}
                    onChange={e => setTriggerFilter(e.target.value as BuildTrigger | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i trigger</option>
                    <option value="push">Push</option>
                    <option value="pull_request">Pull Request</option>
                    <option value="schedule">Schedule</option>
                    <option value="manual">Manual</option>
                  </select>
                  <button
                    onClick={() => setShowCreatePipeline(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuova Pipeline
                  </button>
                </div>
              </div>

              {/* Pipeline List */}
              <div className="space-y-4 mb-8">
                {filteredPipelines.map(pipeline => (
                  <div
                    key={pipeline.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{pipeline.name}</h4>
                          <Badge className={getStatusColor(pipeline.status)}>
                            {pipeline.status}
                          </Badge>
                          <Badge
                            className={
                              pipeline.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {pipeline.enabled ? 'Abilitata' : 'Disabilitata'}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{pipeline.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Repository:</span>
                            <span className="ml-2 font-medium">
                              {pipeline.repository.url.split('/').pop()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Branch:</span>
                            <span className="ml-2 font-medium">{pipeline.repository.branch}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Runs:</span>
                            <span className="ml-2 font-medium">{pipeline.stats.totalRuns}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Success Rate:</span>
                            <span
                              className={`ml-2 font-medium ${pipeline.stats.successRate > 90 ? 'text-green-600' : pipeline.stats.successRate > 70 ? 'text-yellow-600' : 'text-red-600'}`}
                            >
                              {formatNumber(pipeline.stats.successRate)}%
                            </span>
                          </div>
                        </div>

                        {/* Trigger badges */}
                        <div className="flex items-center space-x-2 mt-4">
                          {pipeline.triggers
                            .filter(t => t.enabled)
                            .map((trigger, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800">
                                {getTriggerIcon(trigger.type)} {trigger.type}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleRunPipeline(pipeline.id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          disabled={!pipeline.enabled}
                        >
                          ▶️ Esegui
                        </button>
                        <button
                          onClick={() => setSelectedPipeline(pipeline)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          ✏️ Modifica
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Creata: {formatDate(pipeline.createdAt)}</span>
                      <span>Ultima modifica: {formatDate(pipeline.updatedAt)}</span>
                      {pipeline.stats.lastRunAt && (
                        <span>Ultima esecuzione: {formatDate(pipeline.stats.lastRunAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Pipeline Runs */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Esecuzioni Recenti</h4>
                <div className="space-y-3">
                  {filteredPipelineRuns.slice(0, 10).map(run => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setSelectedPipelineRun(run)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{run.number} - {run.pipelineName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTriggerIcon(run.trigger.type)} {run.trigger.type} • {run.branch}
                            {run.trigger.commit && (
                              <span> • {run.trigger.commit.message.slice(0, 50)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-sm">
                        <div className="text-gray-900">
                          {run.duration ? formatDuration(run.duration) : 'In corso...'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {run.startedAt && formatDate(run.startedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'environments' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Ambienti di Deployment</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca ambienti..."
                  />
                  <button
                    onClick={() => setShowCreateEnvironment(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Ambiente
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEnvironments.map(environment => (
                  <div
                    key={environment.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getEnvironmentIcon(environment.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{environment.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{environment.type}</p>
                          </div>
                          <Badge className={getStatusColor(environment.status)}>
                            {environment.status}
                          </Badge>
                          <Badge className={getStatusColor(environment.health)}>
                            {environment.health}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">{environment.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">URL:</span>
                            <span className="ml-2 font-medium text-blue-600">
                              {environment.config.url || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Namespace:</span>
                            <span className="ml-2 font-medium">
                              {environment.config.namespace || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Deployments:</span>
                            <span className="ml-2 font-medium">
                              {environment.stats.totalDeployments}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Uptime:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {formatNumber(environment.stats.uptime)}%
                            </span>
                          </div>
                        </div>

                        {/* Current Deployment */}
                        {environment.currentDeployment && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <div className="text-sm font-medium text-blue-900 mb-1">
                              Deployment Corrente
                            </div>
                            <div className="text-sm text-blue-700">
                              v{environment.currentDeployment.version} • Deployed{' '}
                              {formatDate(environment.currentDeployment.deployedAt)} • by{' '}
                              {environment.currentDeployment.deployedBy}
                            </div>
                          </div>
                        )}

                        {/* Protection Rules */}
                        {environment.protection.requireApproval && (
                          <div className="flex items-center space-x-2 mb-4">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              🔒 Approval Required
                            </Badge>
                            {environment.protection.allowedBranches && (
                              <Badge className="bg-purple-100 text-purple-800">
                                🌿 Branch Protection
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedEnvironment(environment)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          🚀 Deploy
                        </button>
                        <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          ✏️ Modifica
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span>Creato: {formatDate(environment.createdAt)}</span>
                      <span>
                        Ultimo deploy:{' '}
                        {environment.stats.lastDeploymentAt
                          ? formatDate(environment.stats.lastDeploymentAt)
                          : 'Mai'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'releases' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Release Management</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca release..."
                  />
                  <button
                    onClick={() => setShowCreateRelease(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuova Release
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {filteredReleases.map(release => (
                  <div
                    key={release.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">🚀</span>
                          <h4 className="font-medium text-gray-900">{release.name}</h4>
                          <Badge className="bg-blue-100 text-blue-800">v{release.version}</Badge>
                          <Badge className={getStatusColor(release.status)}>{release.status}</Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            {release.strategy.replace('_', ' ')}
                          </Badge>
                        </div>

                        {release.description && (
                          <p className="text-sm text-gray-600 mb-4">{release.description}</p>
                        )}

                        {/* Environment Deployments */}
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Deployment Status
                          </div>
                          <div className="space-y-2">
                            {release.environments.map(env => (
                              <div
                                key={env.environmentId}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <div className="flex items-center space-x-3">
                                  <span>
                                    {getEnvironmentIcon(
                                      environments.find(e => e.id === env.environmentId)?.type ||
                                        'development'
                                    )}
                                  </span>
                                  <span className="text-sm font-medium">{env.environmentName}</span>
                                  <Badge className={getStatusColor(env.status)}>{env.status}</Badge>
                                  {env.health && (
                                    <Badge className={getStatusColor(env.health.status)}>
                                      {env.health.status}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  {env.approval?.required && env.status === 'pending' && (
                                    <button
                                      onClick={() =>
                                        handleApproveDeployment(release.id, env.environmentId)
                                      }
                                      className="bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                                    >
                                      ✓ Approva
                                    </button>
                                  )}
                                  {env.rollback?.available && (
                                    <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium transition-colors">
                                      ↩️ Rollback
                                    </button>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {env.completedAt
                                      ? formatDate(env.completedAt)
                                      : env.startedAt
                                        ? 'In corso...'
                                        : 'In attesa'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quality Gates */}
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Quality Gates
                          </div>
                          <div className="flex items-center space-x-2">
                            {release.qualityGates.map((gate, index) => (
                              <Badge
                                key={index}
                                className={
                                  gate.passed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              >
                                {gate.passed ? '✓' : '✗'} {gate.type}: {gate.value}
                                {gate.type === 'coverage' ? '%' : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Release Notes */}
                        {release.notes && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-900 mb-2">
                              Release Notes
                            </div>
                            {release.notes.features.length > 0 && (
                              <div className="mb-2">
                                <div className="text-xs font-medium text-blue-800">Features:</div>
                                <ul className="text-xs text-blue-700 list-disc list-inside">
                                  {release.notes.features.slice(0, 2).map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {release.notes.bugFixes.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-blue-800">Bug Fixes:</div>
                                <ul className="text-xs text-blue-700 list-disc list-inside">
                                  {release.notes.bugFixes.slice(0, 2).map((fix, index) => (
                                    <li key={index}>{fix}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedRelease(release)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        {release.status === 'draft' && (
                          <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                            🚀 Deploy
                          </button>
                        )}
                        <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          ✏️ Modifica
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Creata: {formatDate(release.createdAt)}</span>
                      <span>Da: {release.createdBy}</span>
                      {release.startedAt && <span>Iniziata: {formatDate(release.startedAt)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Incident Management</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca incident..."
                  />
                  <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutte le severità</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button
                    onClick={() => setShowCreateIncident(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Incident
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredIncidents.map(incident => (
                  <div
                    key={incident.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">🚨</span>
                          <h4 className="font-medium text-gray-900">{incident.title}</h4>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{incident.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Categoria:</span>
                            <span className="ml-2 font-medium capitalize">{incident.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Ambienti:</span>
                            <span className="ml-2 font-medium">
                              {incident.impact.environments.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Servizi:</span>
                            <span className="ml-2 font-medium">
                              {incident.impact.services.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Utenti:</span>
                            <span className="ml-2 font-medium">
                              {incident.impact.users.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Timeline</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rilevato:</span>
                              <span className="font-medium">{formatDate(incident.detectedAt)}</span>
                            </div>
                            {incident.acknowledgedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Preso in carico:</span>
                                <span className="font-medium">
                                  {formatDate(incident.acknowledgedAt)}
                                </span>
                              </div>
                            )}
                            {incident.resolvedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Risolto:</span>
                                <span className="font-medium">
                                  {formatDate(incident.resolvedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center space-x-4 text-sm">
                          <div>
                            <span className="text-gray-500">Detection Time:</span>
                            <span className="ml-2 font-medium">
                              {incident.metrics.detectionTime}m
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Response Time:</span>
                            <span className="ml-2 font-medium">
                              {incident.metrics.responseTime}m
                            </span>
                          </div>
                          {incident.metrics.resolutionTime && (
                            <div>
                              <span className="text-gray-500">Resolution Time:</span>
                              <span className="ml-2 font-medium">
                                {incident.metrics.resolutionTime}m
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedIncident(incident)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        {incident.status === 'open' && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident.id, 'investigating')}
                            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            🔍 Investiga
                          </button>
                        )}
                        {incident.status === 'investigating' && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident.id, 'resolved')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ✅ Risolvi
                          </button>
                        )}
                        <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          ✏️ Modifica
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Creato: {formatDate(incident.createdAt)}</span>
                      <span>Assegnato a: {incident.assignee || 'Non assegnato'}</span>
                      <span>Team: {incident.team.length} membri</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Create Pipeline */}
        {showCreatePipeline && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Nuova Pipeline</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Pipeline
                  </label>
                  <input
                    type="text"
                    value={createPipelineForm.name}
                    onChange={e =>
                      setCreatePipelineForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome della pipeline"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={createPipelineForm.description}
                    onChange={e =>
                      setCreatePipelineForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrizione della pipeline"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Repository URL
                    </label>
                    <input
                      type="url"
                      value={createPipelineForm.repositoryUrl}
                      onChange={e =>
                        setCreatePipelineForm(prev => ({ ...prev, repositoryUrl: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://github.com/user/repo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input
                      type="text"
                      value={createPipelineForm.branch}
                      onChange={e =>
                        setCreatePipelineForm(prev => ({ ...prev, branch: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="main"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                  <div className="space-y-2">
                    {(['push', 'pull_request', 'schedule', 'manual'] as BuildTrigger[]).map(
                      trigger => (
                        <label key={trigger} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={createPipelineForm.triggers.includes(trigger)}
                            onChange={e => {
                              if (e.target.checked) {
                                setCreatePipelineForm(prev => ({
                                  ...prev,
                                  triggers: [...prev.triggers, trigger],
                                }));
                              } else {
                                setCreatePipelineForm(prev => ({
                                  ...prev,
                                  triggers: prev.triggers.filter(t => t !== trigger),
                                }));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {trigger.replace('_', ' ')}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createPipelineForm.enabled}
                    onChange={e =>
                      setCreatePipelineForm(prev => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Pipeline abilitata</label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreatePipeline(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreatePipeline}
                  disabled={!createPipelineForm.name || !createPipelineForm.repositoryUrl}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Crea Pipeline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
