'use client';

import React, { useState, useEffect } from 'react';

import { apiGatewayService } from '@/lib/apiGatewayService';
import {
  APIEndpoint,
  Microservice,
  APIGateway,
  ServiceMesh,
  APIRequest,
  ServiceAlert,
  ServiceDeployment,
  APIAnalytics,
  ServiceTopology,
  APIGatewayStats,
  ServiceStatus,
  RequestMethod,
  AuthenticationType,
  RateLimitType,
  LoadBalancingStrategy,
  CacheStrategy,
  LogLevel,
  AlertSeverity,
  DeploymentStrategy,
  ServiceType,
  HealthCheckType,
  CircuitBreakerState,
  RetryStrategy,
} from '@/types/apigateway';
import { TeamRole } from '@/types/team';

import { Badge } from './Badge';

interface APIGatewayCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function APIGatewayCenter({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
}: APIGatewayCenterProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'endpoints'
    | 'services'
    | 'gateways'
    | 'requests'
    | 'deployments'
    | 'alerts'
    | 'analytics'
    | 'topology'
  >('overview');

  // Stati per i dati
  const [gatewayStats, setGatewayStats] = useState<APIGatewayStats | null>(null);
  const [analytics, setAnalytics] = useState<APIAnalytics | null>(null);
  const [topology, setTopology] = useState<ServiceTopology | null>(null);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [microservices, setMicroservices] = useState<Microservice[]>([]);
  const [gateways, setGateways] = useState<APIGateway[]>([]);
  const [serviceMeshes, setServiceMeshes] = useState<ServiceMesh[]>([]);
  const [requests, setRequests] = useState<APIRequest[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [deployments, setDeployments] = useState<ServiceDeployment[]>([]);

  // Stati per filtri e ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<RequestMethod | ''>('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | ''>('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverity | ''>('');

  // Stati per i modal
  const [showCreateEndpoint, setShowCreateEndpoint] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);
  const [showDeployService, setShowDeployService] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [selectedService, setSelectedService] = useState<Microservice | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<APIRequest | null>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<ServiceDeployment | null>(null);

  // Form states
  const [createEndpointForm, setCreateEndpointForm] = useState({
    path: '',
    method: 'GET' as RequestMethod,
    name: '',
    description: '',
    serviceId: '',
    targetUrl: '',
    authRequired: true,
    rateLimitEnabled: true,
    rateLimitRequests: 100,
    cachingEnabled: true,
    cacheTtl: 300,
  });

  const [createServiceForm, setCreateServiceForm] = useState({
    name: '',
    description: '',
    type: 'api' as ServiceType,
    host: '',
    port: 8080,
    protocol: 'http',
    minInstances: 1,
    maxInstances: 10,
  });

  const [deployServiceForm, setDeployServiceForm] = useState({
    serviceId: '',
    version: '',
    strategy: 'rolling' as DeploymentStrategy,
    replicas: 3,
  });

  const [createAlertForm, setCreateAlertForm] = useState({
    name: '',
    description: '',
    type: 'metric',
    severity: 'medium' as AlertSeverity,
    metric: 'error_rate',
    threshold: 5.0,
    services: [] as string[],
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
    setGatewayStats(apiGatewayService.generateAPIGatewayStats());
    setAnalytics(apiGatewayService.generateAPIAnalytics());
    setTopology(apiGatewayService.generateServiceTopology());
    setEndpoints(apiGatewayService.getEndpoints());
    setMicroservices(apiGatewayService.getMicroservices());
    setGateways(apiGatewayService.getGateways());
    setServiceMeshes(apiGatewayService.getServiceMeshes());
    setRequests(apiGatewayService.getRequests().slice(0, 100)); // Mostra solo le ultime 100
    setAlerts(apiGatewayService.getAlerts());
    setDeployments(apiGatewayService.getDeployments());
  };

  const handleCreateEndpoint = () => {
    try {
      const endpoint = apiGatewayService.createEndpoint({
        path: createEndpointForm.path,
        method: createEndpointForm.method,
        name: createEndpointForm.name,
        description: createEndpointForm.description,
        serviceId: createEndpointForm.serviceId,
        serviceName: microservices.find(s => s.id === createEndpointForm.serviceId)?.name || '',
        targetUrl: createEndpointForm.targetUrl,
        authentication: {
          type: createEndpointForm.authRequired ? 'bearer_token' : 'none',
          required: createEndpointForm.authRequired,
        },
        rateLimiting: {
          enabled: createEndpointForm.rateLimitEnabled,
          type: 'requests_per_minute',
          limit: createEndpointForm.rateLimitRequests,
          windowSize: 60,
          keyGenerator: 'user',
        },
        caching: {
          enabled: createEndpointForm.cachingEnabled,
          strategy: 'redis',
          ttl: createEndpointForm.cacheTtl,
        },
        transformation: {},
        validation: {
          validateRequest: true,
          validateResponse: true,
        },
        monitoring: {
          enabled: true,
          logRequests: true,
          logResponses: false,
          trackMetrics: true,
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 10,
          recoveryTimeout: 60,
          state: 'closed',
        },
        retryPolicy: {
          enabled: true,
          maxAttempts: 3,
          strategy: 'exponential_backoff',
        },
        documentation: {
          summary: createEndpointForm.description,
          description: createEndpointForm.description,
          tags: [],
          examples: [],
        },
        isActive: true,
        version: '1.0.0',
      });

      setEndpoints(prev => [endpoint, ...prev]);
      setCreateEndpointForm({
        path: '',
        method: 'GET',
        name: '',
        description: '',
        serviceId: '',
        targetUrl: '',
        authRequired: true,
        rateLimitEnabled: true,
        rateLimitRequests: 100,
        cachingEnabled: true,
        cacheTtl: 300,
      });
      setShowCreateEndpoint(false);
      console.log('Endpoint creato con successo!', endpoint);
    } catch (error) {
      console.error('Errore nella creazione endpoint:', error);
    }
  };

  const handleCreateService = () => {
    try {
      const service = apiGatewayService.createMicroservice({
        name: createServiceForm.name,
        description: createServiceForm.description,
        type: createServiceForm.type,
        version: '1.0.0',
        environment: 'production',
        namespace: 'urbanova',
        host: createServiceForm.host,
        port: createServiceForm.port,
        protocol: createServiceForm.protocol as any,
        status: 'healthy',
        healthCheck: {
          type: 'http',
          endpoint: '/health',
          interval: 30,
          timeout: 5,
          retries: 3,
          successThreshold: 1,
          failureThreshold: 3,
        },
        scaling: {
          minInstances: createServiceForm.minInstances,
          maxInstances: createServiceForm.maxInstances,
          currentInstances: createServiceForm.minInstances,
          targetCPU: 70,
          targetMemory: 80,
          scaleUpCooldown: 300,
          scaleDownCooldown: 600,
        },
        resources: {
          cpu: { requests: '100m', limits: '500m' },
          memory: { requests: '128Mi', limits: '512Mi' },
        },
        dependencies: [],
        environmentVariables: {},
        loadBalancing: {
          strategy: 'round_robin',
          stickySession: false,
        },
        security: {
          networkPolicies: [],
          serviceAccount: `${createServiceForm.name.toLowerCase()}-sa`,
        },
        observability: {
          metricsEnabled: true,
          tracingEnabled: true,
          loggingEnabled: true,
          customDashboards: [],
          alertRules: [],
        },
        endpoints: [],
      });

      setMicroservices(prev => [service, ...prev]);
      setCreateServiceForm({
        name: '',
        description: '',
        type: 'api',
        host: '',
        port: 8080,
        protocol: 'http',
        minInstances: 1,
        maxInstances: 10,
      });
      setShowCreateService(false);
      console.log('Servizio creato con successo!', service);
    } catch (error) {
      console.error('Errore nella creazione servizio:', error);
    }
  };

  const handleDeployService = () => {
    if (!deployServiceForm.serviceId || !deployServiceForm.version) return;

    try {
      const deployment = apiGatewayService.deployMicroservice(
        deployServiceForm.serviceId,
        deployServiceForm.version,
        deployServiceForm.strategy
      );

      if (deployment) {
        setDeployments(prev => [deployment, ...prev]);
        setDeployServiceForm({
          serviceId: '',
          version: '',
          strategy: 'rolling',
          replicas: 3,
        });
        setShowDeployService(false);
        console.log('Deployment avviato con successo!', deployment);
      }
    } catch (error) {
      console.error('Errore nel deployment:', error);
    }
  };

  const handleCreateAlert = () => {
    try {
      const alert = apiGatewayService.createAlert({
        name: createAlertForm.name,
        description: createAlertForm.description,
        type: createAlertForm.type as any,
        severity: createAlertForm.severity,
        conditions: [
          {
            metric: createAlertForm.metric,
            operator: 'gt',
            threshold: createAlertForm.threshold,
            duration: 300,
          },
        ],
        services: createAlertForm.services,
        notifications: [
          {
            type: 'email',
            config: { recipients: ['alerts@urbanova.com'] },
            enabled: true,
          },
        ],
        state: 'ok',
      });

      setAlerts(prev => [alert, ...prev]);
      setCreateAlertForm({
        name: '',
        description: '',
        type: 'metric',
        severity: 'medium',
        metric: 'error_rate',
        threshold: 5.0,
        services: [],
      });
      setShowCreateAlert(false);
      console.log('Alert creato con successo!', alert);
    } catch (error) {
      console.error('Errore nella creazione alert:', error);
    }
  };

  const handleScaleService = (serviceId: string, replicas: number) => {
    const success = apiGatewayService.scaleMicroservice(serviceId, replicas);
    if (success) {
      loadData(); // Ricarica dati per aggiornare UI
      console.log(`Servizio ${serviceId} scalato a ${replicas} repliche`);
    }
  };

  const getStatusColor = (status: ServiceStatus | string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      unhealthy: 'bg-red-100 text-red-800',
      maintenance: 'bg-blue-100 text-blue-800',
      offline: 'bg-gray-100 text-gray-800',
      starting: 'bg-purple-100 text-purple-800',
      stopping: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      rolling_back: 'bg-orange-100 text-orange-800',
      rolled_back: 'bg-purple-100 text-purple-800',
      ok: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMethodColor = (method: RequestMethod) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
      HEAD: 'bg-gray-100 text-gray-800',
      OPTIONS: 'bg-indigo-100 text-indigo-800',
    };
    return colors[method];
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity];
  };

  const getServiceTypeIcon = (type: ServiceType) => {
    const icons = {
      api: '🔗',
      web: '🌐',
      worker: '⚙️',
      database: '🗄️',
      cache: '💾',
      message_queue: '📬',
      storage: '📦',
      auth: '🔐',
      gateway: '🚪',
    };
    return icons[type] || '📋';
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

  const formatNumber = (num: number, decimals: number = 2) => {
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

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesQuery =
      searchQuery === '' ||
      endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === '' || endpoint.method === methodFilter;
    const matchesService = serviceFilter === '' || endpoint.serviceId === serviceFilter;

    return matchesQuery && matchesMethod && matchesService;
  });

  const filteredServices = microservices.filter(service => {
    const matchesQuery =
      searchQuery === '' ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === '' || service.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const filteredRequests = requests.filter(request => {
    const matchesQuery =
      searchQuery === '' ||
      request.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.clientIP.includes(searchQuery.toLowerCase()) ||
      request.userAgent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === '' || request.method === methodFilter;
    const matchesService = serviceFilter === '' || request.serviceId === serviceFilter;

    return matchesQuery && matchesMethod && matchesService;
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchesQuery =
      searchQuery === '' ||
      alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = alertSeverityFilter === '' || alert.severity === alertSeverityFilter;

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
              <span className="text-blue-600 text-lg">🔗</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                API Gateway & Microservices Center
              </h2>
              <p className="text-sm text-gray-500">
                Centro avanzato per gestione API Gateway e Microservizi
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Gateway Stats Overview */}
        {gatewayStats && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Endpoint Attivi</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {gatewayStats.overview.activeEndpoints}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🔗</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  su {gatewayStats.overview.totalEndpoints} totali
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Servizi Sani</p>
                    <p className="text-2xl font-bold text-green-900">
                      {gatewayStats.overview.healthyServices}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  su {gatewayStats.overview.totalServices} totali
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Throughput</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatNumber(gatewayStats.performance.throughput.current)}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">⚡</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  req/sec (peak: {formatNumber(gatewayStats.performance.throughput.peak)})
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Latenza P95</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {gatewayStats.performance.latency.p95}ms
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">⏱️</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  avg: {gatewayStats.performance.latency.p50}ms
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Error Rate</p>
                    <p className="text-2xl font-bold text-red-900">
                      {formatNumber(gatewayStats.performance.errors.rate)}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🚨</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {gatewayStats.performance.errors.total} errori
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">Cache Hit Rate</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {formatNumber(gatewayStats.caching.hitRate)}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600">💾</span>
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-1">
                  {gatewayStats.caching.totalHits} hits
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '🎯', count: 0 },
              { id: 'endpoints', label: 'Endpoints', icon: '🔗', count: endpoints.length },
              { id: 'services', label: 'Microservizi', icon: '⚙️', count: microservices.length },
              { id: 'gateways', label: 'Gateway', icon: '🚪', count: gateways.length },
              { id: 'requests', label: 'Richieste', icon: '📊', count: requests.length },
              { id: 'deployments', label: 'Deploy', icon: '🚀', count: deployments.length },
              { id: 'alerts', label: 'Alert', icon: '🚨', count: alerts.length },
              { id: 'analytics', label: 'Analytics', icon: '📈', count: 0 },
              { id: 'topology', label: 'Topology', icon: '🕸️', count: 0 },
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
          {activeTab === 'overview' && analytics && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Traffic Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Richieste Totali</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {analytics.overview.totalRequests.toLocaleString()}
                        </span>
                        <div className="text-sm text-green-600">
                          ✓ {analytics.overview.successfulRequests.toLocaleString()} successo
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Throughput Medio</span>
                      <span className="text-sm font-medium text-blue-600">
                        {formatNumber(analytics.overview.throughput)} req/sec
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tempo Risposta</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Avg: {formatNumber(analytics.overview.averageResponseTime)}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          P95: {formatNumber(analytics.overview.p95ResponseTime)}ms
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            analytics.overview.errorRate < 5
                              ? 'bg-green-500'
                              : analytics.overview.errorRate < 10
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm font-medium">
                          {formatNumber(analytics.overview.errorRate)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Endpoints */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Endpoints</h3>
                  <div className="space-y-3">
                    {analytics.traffic.topEndpoints.slice(0, 5).map((endpoint, index) => (
                      <div key={endpoint.endpointId} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {endpoint.path}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {endpoint.requests.toLocaleString()} req
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatNumber(endpoint.averageResponseTime)}ms avg
                            </span>
                            <span
                              className={`text-xs ${endpoint.errorRate < 5 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatNumber(endpoint.errorRate)}% err
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {analytics.performance.responseTimeDistribution.map(range => (
                    <div key={range.range} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">{range.range}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {range.count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{formatNumber(range.percentage)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Cache Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Autenticazione Fallita</span>
                      <span className="text-sm font-medium text-red-600">
                        {analytics.security.authenticationFailures}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rate Limit Superato</span>
                      <span className="text-sm font-medium text-orange-600">
                        {analytics.security.rateLimitExceeded}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Richieste Bloccate</span>
                      <span className="text-sm font-medium text-red-600">
                        {analytics.security.blockedRequests}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">IP Sospetti</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {analytics.security.suspiciousIPs.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hit Rate</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${analytics.cache.hitRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {formatNumber(analytics.cache.hitRate)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Hits</span>
                      <span className="text-sm font-medium text-blue-600">
                        {analytics.cache.totalHits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Misses</span>
                      <span className="text-sm font-medium text-gray-600">
                        {analytics.cache.totalMisses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Evictions</span>
                      <span className="text-sm font-medium text-orange-600">
                        {analytics.cache.evictions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca endpoints..."
                  />
                  <select
                    value={methodFilter}
                    onChange={e => setMethodFilter(e.target.value as RequestMethod | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i metodi</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                  <select
                    value={serviceFilter}
                    onChange={e => setServiceFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i servizi</option>
                    {microservices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCreateEndpoint(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Endpoint
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredEndpoints.map(endpoint => (
                  <div
                    key={endpoint.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getMethodColor(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                          <Badge
                            className={
                              endpoint.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {endpoint.isActive ? 'Attivo' : 'Inattivo'}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">{endpoint.path}</div>
                        <div className="text-sm text-gray-500 mb-4">{endpoint.description}</div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Servizio:</span>
                            <span className="ml-2 font-medium">{endpoint.serviceName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Richieste:</span>
                            <span className="ml-2 font-medium">
                              {endpoint.metrics.totalRequests.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Tempo Medio:</span>
                            <span className="ml-2 font-medium">
                              {formatNumber(endpoint.metrics.averageResponseTime)}ms
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Error Rate:</span>
                            <span
                              className={`ml-2 font-medium ${endpoint.metrics.errorRate < 5 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {formatNumber(endpoint.metrics.errorRate)}%
                            </span>
                          </div>
                        </div>

                        {/* Configuration badges */}
                        <div className="flex items-center space-x-2 mt-4">
                          {endpoint.authentication.required && (
                            <Badge className="bg-blue-100 text-blue-800">
                              🔐 Auth: {endpoint.authentication.type}
                            </Badge>
                          )}
                          {endpoint.rateLimiting.enabled && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              🚦 Rate Limit: {endpoint.rateLimiting.limit}/min
                            </Badge>
                          )}
                          {endpoint.caching.enabled && (
                            <Badge className="bg-green-100 text-green-800">
                              💾 Cache: {endpoint.caching.ttl}s
                            </Badge>
                          )}
                          {endpoint.circuitBreaker.enabled && (
                            <Badge className="bg-purple-100 text-purple-800">
                              ⚡ Circuit Breaker
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedEndpoint(endpoint)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          ✏️ Modifica
                        </button>
                        <button className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          🗑️ Elimina
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Creato: {formatDate(endpoint.createdAt)}</span>
                      <span>Ultima modifica: {formatDate(endpoint.updatedAt)}</span>
                      {endpoint.lastAccessedAt && (
                        <span>Ultimo accesso: {formatDate(endpoint.lastAccessedAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Microservizi</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca servizi..."
                  />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as ServiceStatus | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti gli stati</option>
                    <option value="healthy">Healthy</option>
                    <option value="degraded">Degraded</option>
                    <option value="unhealthy">Unhealthy</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <button
                    onClick={() => setShowCreateService(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Servizio
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getServiceTypeIcon(service.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.type}</p>
                          </div>
                          <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">{service.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Versione:</span>
                            <span className="ml-2 font-medium">{service.version}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Istanze:</span>
                            <span className="ml-2 font-medium">
                              {service.scaling.currentInstances}/{service.scaling.maxInstances}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Uptime:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {formatNumber(service.metrics.uptime)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Resp. Time:</span>
                            <span className="ml-2 font-medium">
                              {formatNumber(service.metrics.responseTime.average)}ms
                            </span>
                          </div>
                        </div>

                        {/* Resource Usage */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">CPU Usage</span>
                            <span className="font-medium">
                              {formatNumber(service.metrics.cpuUsage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                service.metrics.cpuUsage > 80
                                  ? 'bg-red-500'
                                  : service.metrics.cpuUsage > 60
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${service.metrics.cpuUsage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Memory Usage</span>
                            <span className="font-medium">
                              {formatNumber(service.metrics.memoryUsage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                service.metrics.memoryUsage > 80
                                  ? 'bg-red-500'
                                  : service.metrics.memoryUsage > 60
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${service.metrics.memoryUsage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedService(service)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        <button
                          onClick={() => {
                            setDeployServiceForm(prev => ({ ...prev, serviceId: service.id }));
                            setShowDeployService(true);
                          }}
                          className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          🚀 Deploy
                        </button>
                        <button
                          onClick={() =>
                            handleScaleService(service.id, service.scaling.currentInstances + 1)
                          }
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          📈 Scale Up
                        </button>
                        <button
                          onClick={() =>
                            handleScaleService(
                              service.id,
                              Math.max(
                                service.scaling.minInstances,
                                service.scaling.currentInstances - 1
                              )
                            )
                          }
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          📉 Scale Down
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span>Creato: {formatDate(service.createdAt)}</span>
                      <span>Ultimo deploy: {formatDate(service.lastDeployedAt)}</span>
                      <span>Health check: {formatDate(service.lastHealthCheckAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Richieste API</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca richieste..."
                  />
                  <select
                    value={methodFilter}
                    onChange={e => setMethodFilter(e.target.value as RequestMethod | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i metodi</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <select
                    value={serviceFilter}
                    onChange={e => setServiceFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i servizi</option>
                    {microservices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredRequests.map(request => (
                  <div
                    key={request.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getMethodColor(request.method)}>{request.method}</Badge>
                          <Badge className={getStatusColor(request.statusCode.toString())}>
                            {request.statusCode}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">{request.path}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Client IP:</span>
                            <span className="ml-2 font-medium">{request.clientIP}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Tempo:</span>
                            <span className="ml-2 font-medium">{request.responseTime}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Dimensione:</span>
                            <span className="ml-2 font-medium">
                              {formatBytes(request.responseSize)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Auth:</span>
                            <span
                              className={`ml-2 font-medium ${request.authentication.successful ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {request.authentication.successful ? '✓' : '✗'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cache:</span>
                            <span
                              className={`ml-2 font-medium ${request.cacheInfo?.hit ? 'text-green-600' : 'text-gray-600'}`}
                            >
                              {request.cacheInfo?.hit ? 'HIT' : 'MISS'}
                            </span>
                          </div>
                        </div>

                        {request.error && (
                          <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-800">
                            <strong>Errore:</strong> {request.error.message}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-sm text-gray-500 ml-4">
                        <div>{formatDate(request.timestamp)}</div>
                        {request.traceId && (
                          <div className="text-xs mt-1">
                            Trace: {request.traceId.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deployments' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Deployments</h3>
                <button
                  onClick={() => setShowDeployService(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🚀 Nuovo Deploy
                </button>
              </div>

              <div className="space-y-4">
                {deployments.map(deployment => (
                  <div
                    key={deployment.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">🚀</span>
                          <h4 className="font-medium text-gray-900">{deployment.serviceName}</h4>
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">v{deployment.version}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Strategia:</span>
                            <span className="ml-2 font-medium capitalize">
                              {deployment.strategy}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Repliche:</span>
                            <span className="ml-2 font-medium">{deployment.replicas}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Progresso:</span>
                            <span className="ml-2 font-medium">
                              {deployment.progress.completed}/{deployment.progress.total}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Durata:</span>
                            <span className="ml-2 font-medium">
                              {deployment.completedAt
                                ? formatDuration(
                                    (deployment.completedAt.getTime() -
                                      deployment.startedAt.getTime()) /
                                      1000
                                  )
                                : formatDuration(
                                    (Date.now() - deployment.startedAt.getTime()) / 1000
                                  )}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Progresso Deployment</span>
                            <span className="font-medium">{deployment.progress.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                deployment.status === 'completed'
                                  ? 'bg-green-500'
                                  : deployment.status === 'failed'
                                    ? 'bg-red-500'
                                    : deployment.status === 'in_progress'
                                      ? 'bg-blue-500'
                                      : 'bg-yellow-500'
                              }`}
                              style={{ width: `${deployment.progress.percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Recent Logs */}
                        {deployment.logs.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Log Recenti</h5>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {deployment.logs.slice(-3).map((log, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  <span className="text-gray-500">
                                    [{formatDate(log.timestamp)}]
                                  </span>
                                  <span
                                    className={`ml-2 ${
                                      log.level === 'error'
                                        ? 'text-red-600'
                                        : log.level === 'warn'
                                          ? 'text-yellow-600'
                                          : 'text-gray-700'
                                    }`}
                                  >
                                    {log.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedDeployment(deployment)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        {deployment.canRollback && deployment.status === 'completed' && (
                          <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                            ↩️ Rollback
                          </button>
                        )}
                        {deployment.status === 'in_progress' && (
                          <button className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                            ⏹️ Stop
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Avviato: {formatDate(deployment.startedAt)}</span>
                      <span>Da: {deployment.deployedBy}</span>
                      {deployment.completedAt && (
                        <span>Completato: {formatDate(deployment.completedAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Alert & Monitoring</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cerca alert..."
                  />
                  <select
                    value={alertSeverityFilter}
                    onChange={e => setAlertSeverityFilter(e.target.value as AlertSeverity | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutte le severità</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
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
                          <span className="text-lg">🚨</span>
                          <h4 className="font-medium text-gray-900">{alert.name}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.state)}>{alert.state}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{alert.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <span className="ml-2 font-medium capitalize">{alert.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Servizi:</span>
                            <span className="ml-2 font-medium">{alert.services.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Notifiche:</span>
                            <span className="ml-2 font-medium">
                              {alert.notifications.filter(n => n.enabled).length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Ultimo trigger:</span>
                            <span className="ml-2 font-medium">
                              {alert.lastTriggeredAt ? formatDate(alert.lastTriggeredAt) : 'Mai'}
                            </span>
                          </div>
                        </div>

                        {/* Conditions */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Condizioni</h5>
                          {alert.conditions.map((condition, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {condition.metric} {condition.operator} {condition.threshold} per{' '}
                              {condition.duration}s
                            </div>
                          ))}
                        </div>

                        {/* Notification channels */}
                        <div className="flex items-center space-x-2">
                          {alert.notifications.map((notification, index) => (
                            <Badge
                              key={index}
                              className={
                                notification.enabled
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {notification.type === 'email' && '📧'}
                              {notification.type === 'slack' && '💬'}
                              {notification.type === 'webhook' && '🔗'}
                              {notification.type === 'sms' && '📱'}
                              {notification.type === 'pagerduty' && '📟'}
                              {notification.type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          👁️ Dettagli
                        </button>
                        <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          ✏️ Modifica
                        </button>
                        {alert.state !== 'ok' && (
                          <button
                            onClick={() => apiGatewayService.updateAlertStatus(alert.id, 'ok')}
                            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ✓ Acknowledge
                          </button>
                        )}
                        <button className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          🗑️ Elimina
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Creato: {formatDate(alert.createdAt)}</span>
                      <span>Modificato: {formatDate(alert.updatedAt)}</span>
                      {alert.acknowledgedAt && (
                        <span>Acknowledged: {formatDate(alert.acknowledgedAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'topology' && topology && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Service Topology</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Topology Visualization */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Network Topology</h4>
                  <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
                    {/* Simplified topology visualization */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🕸️</div>
                        <div className="text-lg font-medium text-gray-700">Service Topology</div>
                        <div className="text-sm text-gray-500">
                          {topology.services.length} servizi, {topology.connections.length}{' '}
                          connessioni
                        </div>
                      </div>
                    </div>

                    {/* Service nodes */}
                    {topology.services.map((service, index) => (
                      <div
                        key={service.id}
                        className="absolute"
                        style={{
                          left: `${(index % 3) * 30 + 20}%`,
                          top: `${Math.floor(index / 3) * 25 + 20}%`,
                        }}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-medium text-xs ${
                            service.status === 'healthy'
                              ? 'bg-green-500'
                              : service.status === 'degraded'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        >
                          {getServiceTypeIcon(service.type)}
                        </div>
                        <div className="text-xs text-center mt-1 max-w-16 truncate">
                          {service.name.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Service Details</h4>
                  <div className="space-y-4">
                    {topology.services.map(service => (
                      <div key={service.id} className="border-b border-gray-100 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span>{getServiceTypeIcon(service.type)}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {service.name}
                            </span>
                          </div>
                          <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Version: {service.metadata.version}</div>
                          <div>Replicas: {service.metadata.replicas}</div>
                          <div>CPU: {formatNumber(service.metadata.cpu)}%</div>
                          <div>Memory: {formatNumber(service.metadata.memory)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connections & Dependencies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Service Connections</h4>
                  <div className="space-y-3">
                    {topology.connections.map(connection => (
                      <div
                        key={connection.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {topology.services.find(s => s.id === connection.source)?.name}→
                            {topology.services.find(s => s.id === connection.target)?.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {connection.type} • {formatNumber(connection.requestsPerSecond)} req/s •{' '}
                            {formatNumber(connection.averageLatency)}ms
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {connection.encrypted && <span className="text-green-600">🔐</span>}
                          <Badge className={getStatusColor(connection.health)}>
                            {connection.health}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">External Dependencies</h4>
                  <div className="space-y-3">
                    {topology.externalDependencies.map(dep => (
                      <div
                        key={dep.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{dep.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {dep.type} • {dep.connectedServices.length} servizi connessi
                          </div>
                        </div>
                        <Badge className={getStatusColor(dep.status)}>{dep.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Create Endpoint */}
        {showCreateEndpoint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Nuovo Endpoint</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                    <input
                      type="text"
                      value={createEndpointForm.path}
                      onChange={e =>
                        setCreateEndpointForm(prev => ({ ...prev, path: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="/api/v1/example"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metodo</label>
                    <select
                      value={createEndpointForm.method}
                      onChange={e =>
                        setCreateEndpointForm(prev => ({
                          ...prev,
                          method: e.target.value as RequestMethod,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={createEndpointForm.name}
                    onChange={e =>
                      setCreateEndpointForm(prev => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome dell'endpoint"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={createEndpointForm.description}
                    onChange={e =>
                      setCreateEndpointForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descrizione dell'endpoint"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servizio</label>
                    <select
                      value={createEndpointForm.serviceId}
                      onChange={e =>
                        setCreateEndpointForm(prev => ({ ...prev, serviceId: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleziona servizio</option>
                      {microservices.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target URL
                    </label>
                    <input
                      type="text"
                      value={createEndpointForm.targetUrl}
                      onChange={e =>
                        setCreateEndpointForm(prev => ({ ...prev, targetUrl: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="http://service:8080/api/endpoint"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createEndpointForm.authRequired}
                      onChange={e =>
                        setCreateEndpointForm(prev => ({ ...prev, authRequired: e.target.checked }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Autenticazione richiesta
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createEndpointForm.rateLimitEnabled}
                      onChange={e =>
                        setCreateEndpointForm(prev => ({
                          ...prev,
                          rateLimitEnabled: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Rate limiting abilitato
                    </label>
                  </div>

                  {createEndpointForm.rateLimitEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Richieste per minuto
                      </label>
                      <input
                        type="number"
                        value={createEndpointForm.rateLimitRequests}
                        onChange={e =>
                          setCreateEndpointForm(prev => ({
                            ...prev,
                            rateLimitRequests: parseInt(e.target.value),
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createEndpointForm.cachingEnabled}
                      onChange={e =>
                        setCreateEndpointForm(prev => ({
                          ...prev,
                          cachingEnabled: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Caching abilitato</label>
                  </div>

                  {createEndpointForm.cachingEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TTL Cache (secondi)
                      </label>
                      <input
                        type="number"
                        value={createEndpointForm.cacheTtl}
                        onChange={e =>
                          setCreateEndpointForm(prev => ({
                            ...prev,
                            cacheTtl: parseInt(e.target.value),
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateEndpoint(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateEndpoint}
                  disabled={
                    !createEndpointForm.name ||
                    !createEndpointForm.path ||
                    !createEndpointForm.serviceId
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Crea Endpoint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
