// Service per la gestione di Advanced Monitoring & Observability
import {
  MetricDefinition,
  MetricValue,
  MetricSeries,
  Alert,
  LogEntry,
  LogQuery,
  LogQueryResult,
  Trace,
  Span,
  ServiceMap,
  ServiceNode,
  ServiceConnection,
  Dashboard,
  DashboardWidget,
  MonitoringTarget,
  HealthCheck,
  SLI,
  SLO,
  Incident,
  MonitoringConfiguration,
  MonitoringStats,
  MetricType,
  AlertSeverity,
  AlertStatus,
  LogLevel,
  ServiceStatus,
  MonitoringInterval,
  TimeRange,
  AggregationType,
  ChartType,
  DashboardType,
  NotificationChannel,
  TraceStatus,
  SpanKind
} from '@/types/monitoring';
import { TeamRole } from '@/types/team';

export class MonitoringService {
  private metrics: Map<string, MetricDefinition> = new Map();
  private metricValues: Map<string, MetricValue[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private logs: LogEntry[] = [];
  private traces: Map<string, Trace> = new Map();
  private serviceMap: ServiceMap | null = null;
  private dashboards: Map<string, Dashboard> = new Map();
  private targets: Map<string, MonitoringTarget> = new Map();
  private healthChecks: Map<string, HealthCheck[]> = new Map();
  private slis: Map<string, SLI> = new Map();
  private slos: Map<string, SLO> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private configuration: MonitoringConfiguration;

  constructor() {
    this.initializeConfiguration();
    this.initializeMetrics();
    this.initializeDashboards();
    this.initializeTargets();
    this.initializeSLOs();
    this.simulateMonitoringData();
    this.startDataGeneration();
  }

  // Inizializza configurazione monitoring
  private initializeConfiguration() {
    this.configuration = {
      metricsCollection: {
        enabled: true,
        interval: '1m',
        retention: '30d',
        includedServices: ['urbanova-api', 'urbanova-frontend', 'urbanova-db'],
        excludedServices: [],
        samplingRate: 1.0
      },
      logging: {
        enabled: true,
        level: 'info',
        retention: '7d',
        enableStructuredLogging: true,
        customParsers: {},
        indexedFields: ['service', 'level', 'message', 'timestamp']
      },
      tracing: {
        enabled: true,
        samplingRate: 0.1,
        retention: '7d',
        enableServiceMap: true,
        enableDependencyAnalysis: true
      },
      alerting: {
        enabled: true,
        defaultChannels: ['email', 'slack'],
        rateLimiting: {
          enabled: true,
          maxAlertsPerMinute: 10
        },
        grouping: {
          enabled: true,
          groupBy: ['service', 'severity'],
          groupWait: '30s'
        }
      },
      storage: {
        type: 'prometheus',
        config: {
          url: 'http://prometheus:9090',
          retention: '30d'
        },
        retentionPolicies: [
          { metric: 'http_requests_total', retention: '90d' },
          { metric: 'memory_usage', retention: '30d', downsampling: '5m' }
        ]
      }
    };
  }

  // Inizializza metriche predefinite
  private initializeMetrics() {
    const metrics: MetricDefinition[] = [
      {
        id: 'http_requests_total',
        name: 'HTTP Requests Total',
        description: 'Total number of HTTP requests',
        type: 'counter',
        unit: 'requests',
        labels: ['method', 'status', 'endpoint'],
        help: 'Total HTTP requests processed by the application',
        aggregation: 'sum',
        interval: '1m',
        retention: '30d',
        thresholds: {
          warning: 1000,
          critical: 5000
        },
        category: 'Application',
        tags: ['http', 'requests', 'performance'],
        owner: 'platform-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'response_time_seconds',
        name: 'HTTP Response Time',
        description: 'HTTP request response time in seconds',
        type: 'histogram',
        unit: 'seconds',
        labels: ['method', 'endpoint'],
        help: 'Time taken to process HTTP requests',
        aggregation: 'avg',
        buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        interval: '1m',
        retention: '30d',
        thresholds: {
          warning: 1.0,
          critical: 5.0
        },
        category: 'Performance',
        tags: ['http', 'latency', 'performance'],
        owner: 'platform-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'memory_usage_bytes',
        name: 'Memory Usage',
        description: 'Memory usage in bytes',
        type: 'gauge',
        unit: 'bytes',
        labels: ['instance', 'service'],
        help: 'Current memory usage of the application',
        aggregation: 'avg',
        interval: '1m',
        retention: '30d',
        thresholds: {
          warning: 1073741824, // 1GB
          critical: 2147483648  // 2GB
        },
        category: 'Infrastructure',
        tags: ['memory', 'resource', 'infrastructure'],
        owner: 'platform-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'cpu_usage_percent',
        name: 'CPU Usage',
        description: 'CPU usage percentage',
        type: 'gauge',
        unit: 'percent',
        labels: ['instance', 'service'],
        help: 'Current CPU usage percentage',
        aggregation: 'avg',
        interval: '1m',
        retention: '30d',
        thresholds: {
          warning: 70,
          critical: 90
        },
        category: 'Infrastructure',
        tags: ['cpu', 'resource', 'infrastructure'],
        owner: 'platform-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'error_rate_percent',
        name: 'Error Rate',
        description: 'Percentage of requests resulting in errors',
        type: 'gauge',
        unit: 'percent',
        labels: ['service', 'endpoint'],
        help: 'Error rate as percentage of total requests',
        aggregation: 'avg',
        interval: '5m',
        retention: '30d',
        thresholds: {
          warning: 1,
          critical: 5
        },
        category: 'Reliability',
        tags: ['error', 'reliability', 'sli'],
        owner: 'platform-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    ];

    metrics.forEach(metric => {
      this.metrics.set(metric.id, metric);
    });
  }

  // Inizializza dashboard predefiniti
  private initializeDashboards() {
    const dashboards: Dashboard[] = [
      {
        id: 'overview-dashboard',
        name: 'System Overview',
        description: 'High-level overview of system health and performance',
        type: 'overview',
        layout: { columns: 4, rows: 3 },
        widgets: [
          {
            id: 'requests-widget',
            title: 'HTTP Requests/sec',
            type: 'metric',
            position: { x: 0, y: 0, width: 1, height: 1 },
            config: {
              metricId: 'http_requests_total',
              chartType: 'gauge',
              aggregation: 'rate',
              timeRange: '1h',
              unit: 'req/sec',
              thresholds: [
                { value: 100, color: 'green', operator: 'lt' },
                { value: 500, color: 'yellow', operator: 'lt' },
                { value: 1000, color: 'red', operator: 'gt' }
              ]
            },
            data: { value: 45.2 },
            lastUpdated: new Date(),
            isLoading: false,
            hasError: false
          },
          {
            id: 'response-time-widget',
            title: 'Average Response Time',
            type: 'chart',
            position: { x: 1, y: 0, width: 2, height: 1 },
            config: {
              metricId: 'response_time_seconds',
              chartType: 'line',
              aggregation: 'avg',
              timeRange: '6h',
              unit: 'ms',
              showLegend: true
            },
            data: {
              series: [{
                name: 'Response Time',
                data: Array.from({ length: 24 }, (_, i) => ({
                  timestamp: new Date(Date.now() - (23 - i) * 15 * 60 * 1000),
                  value: 200 + Math.random() * 100
                }))
              }]
            },
            lastUpdated: new Date(),
            isLoading: false,
            hasError: false
          },
          {
            id: 'error-rate-widget',
            title: 'Error Rate',
            type: 'metric',
            position: { x: 3, y: 0, width: 1, height: 1 },
            config: {
              metricId: 'error_rate_percent',
              chartType: 'gauge',
              aggregation: 'avg',
              timeRange: '1h',
              unit: '%',
              thresholds: [
                { value: 1, color: 'green', operator: 'lt' },
                { value: 3, color: 'yellow', operator: 'lt' },
                { value: 5, color: 'red', operator: 'gt' }
              ]
            },
            data: { value: 0.8 },
            lastUpdated: new Date(),
            isLoading: false,
            hasError: false
          },
          {
            id: 'memory-usage-widget',
            title: 'Memory Usage',
            type: 'chart',
            position: { x: 0, y: 1, width: 2, height: 1 },
            config: {
              metricId: 'memory_usage_bytes',
              chartType: 'area',
              aggregation: 'avg',
              timeRange: '6h',
              unit: 'MB',
              showGrid: true
            },
            data: {
              series: [{
                name: 'Memory Usage',
                data: Array.from({ length: 24 }, (_, i) => ({
                  timestamp: new Date(Date.now() - (23 - i) * 15 * 60 * 1000),
                  value: 512 + Math.random() * 256
                }))
              }]
            },
            lastUpdated: new Date(),
            isLoading: false,
            hasError: false
          },
          {
            id: 'cpu-usage-widget',
            title: 'CPU Usage',
            type: 'chart',
            position: { x: 2, y: 1, width: 2, height: 1 },
            config: {
              metricId: 'cpu_usage_percent',
              chartType: 'line',
              aggregation: 'avg',
              timeRange: '6h',
              unit: '%',
              showLegend: false
            },
            data: {
              series: [{
                name: 'CPU Usage',
                data: Array.from({ length: 24 }, (_, i) => ({
                  timestamp: new Date(Date.now() - (23 - i) * 15 * 60 * 1000),
                  value: 25 + Math.random() * 30
                }))
              }]
            },
            lastUpdated: new Date(),
            isLoading: false,
            hasError: false
          }
        ],
        timeRange: '6h',
        refreshInterval: '1m',
        autoRefresh: true,
        isPublic: false,
        sharedWith: ['platform-team'],
        variables: [],
        tags: ['overview', 'system', 'health'],
        owner: 'platform-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastViewed: new Date(),
        viewCount: 0
      },
      {
        id: 'application-dashboard',
        name: 'Application Performance',
        description: 'Detailed application performance metrics',
        type: 'application',
        layout: { columns: 3, rows: 4 },
        widgets: [
          {
            id: 'throughput-widget',
            title: 'Request Throughput',
            type: 'chart',
            position: { x: 0, y: 0, width: 3, height: 1 },
            config: {
              metricId: 'http_requests_total',
              chartType: 'bar',
              aggregation: 'rate',
              timeRange: '24h',
              unit: 'req/sec'
            },
            data: {},
            lastUpdated: new Date(),
            isLoading: false,
            hasError: false
          }
        ],
        timeRange: '24h',
        refreshInterval: '5m',
        autoRefresh: true,
        isPublic: false,
        sharedWith: ['development-team'],
        variables: [],
        tags: ['application', 'performance'],
        owner: 'development-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastViewed: new Date(),
        viewCount: 0
      }
    ];

    dashboards.forEach(dashboard => {
      this.dashboards.set(dashboard.id, dashboard);
    });
  }

  // Inizializza target di monitoring
  private initializeTargets() {
    const targets: MonitoringTarget[] = [
      {
        id: 'urbanova-api',
        name: 'Urbanova API',
        type: 'http',
        url: 'https://api.urbanova.com',
        path: '/health',
        method: 'GET',
        interval: '1m',
        timeout: 30,
        retries: 3,
        expectedStatus: 200,
        status: 'healthy',
        lastCheck: new Date(),
        nextCheck: new Date(Date.now() + 60000),
        uptime: 99.95,
        responseTime: 120,
        notifyOnFailure: true,
        notificationChannels: ['email', 'slack'],
        environment: 'production',
        team: 'platform-team',
        tags: ['api', 'critical'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'urbanova-frontend',
        name: 'Urbanova Frontend',
        type: 'http',
        url: 'https://urbanova.com',
        path: '/',
        method: 'GET',
        interval: '5m',
        timeout: 10,
        retries: 2,
        expectedStatus: 200,
        status: 'healthy',
        lastCheck: new Date(),
        nextCheck: new Date(Date.now() + 300000),
        uptime: 99.8,
        responseTime: 850,
        notifyOnFailure: true,
        notificationChannels: ['email'],
        environment: 'production',
        team: 'frontend-team',
        tags: ['frontend', 'user-facing'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'urbanova-db',
        name: 'Urbanova Database',
        type: 'tcp',
        host: 'db.urbanova.com',
        port: 5432,
        interval: '1m',
        timeout: 5,
        retries: 3,
        status: 'healthy',
        lastCheck: new Date(),
        nextCheck: new Date(Date.now() + 60000),
        uptime: 99.99,
        responseTime: 15,
        notifyOnFailure: true,
        notificationChannels: ['email', 'slack', 'pagerduty'],
        environment: 'production',
        team: 'database-team',
        tags: ['database', 'critical'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    targets.forEach(target => {
      this.targets.set(target.id, target);
    });
  }

  // Inizializza SLO predefiniti
  private initializeSLOs() {
    const slis: SLI[] = [
      {
        id: 'api-availability-sli',
        name: 'API Availability',
        description: 'Percentage of successful API requests',
        query: 'sum(rate(http_requests_total{status!~"5.."}[5m])) / sum(rate(http_requests_total[5m]))',
        goodEventsQuery: 'sum(rate(http_requests_total{status!~"5.."}[5m]))',
        totalEventsQuery: 'sum(rate(http_requests_total[5m]))',
        target: 99.9,
        windows: [
          { duration: '30d', target: 99.9 },
          { duration: '7d', target: 99.5 }
        ],
        currentValue: 99.95,
        status: 'meeting',
        errorBudget: {
          total: 0.1,
          consumed: 0.05,
          remaining: 0.05,
          burnRate: 0.01
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date()
      },
      {
        id: 'api-latency-sli',
        name: 'API Latency',
        description: 'Percentage of requests served within 500ms',
        query: 'sum(rate(http_request_duration_seconds_bucket{le="0.5"}[5m])) / sum(rate(http_request_duration_seconds_count[5m]))',
        goodEventsQuery: 'sum(rate(http_request_duration_seconds_bucket{le="0.5"}[5m]))',
        totalEventsQuery: 'sum(rate(http_request_duration_seconds_count[5m]))',
        target: 95.0,
        windows: [
          { duration: '30d', target: 95.0 },
          { duration: '7d', target: 90.0 }
        ],
        currentValue: 96.2,
        status: 'meeting',
        errorBudget: {
          total: 5.0,
          consumed: 3.8,
          remaining: 1.2,
          burnRate: 0.5
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCalculated: new Date()
      }
    ];

    const slos: SLO[] = [
      {
        id: 'api-service-slo',
        name: 'API Service SLO',
        description: 'Overall API service level objectives',
        slis: slis,
        objective: 99.5,
        timeWindow: '30d',
        currentCompliance: 99.6,
        status: 'healthy',
        errorBudget: {
          total: 0.5,
          consumed: 0.4,
          remaining: 0.1,
          burnRate: 0.02
        },
        alertRules: [
          { condition: 'error_budget_burn_rate > 5', threshold: 5, severity: 'critical' },
          { condition: 'error_budget_remaining < 0.1', threshold: 0.1, severity: 'warning' }
        ],
        service: 'urbanova-api',
        team: 'platform-team',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    slis.forEach(sli => {
      this.slis.set(sli.id, sli);
    });

    slos.forEach(slo => {
      this.slos.set(slo.id, slo);
    });
  }

  // Simula dati di monitoring per demo
  private simulateMonitoringData() {
    // Simula alert attivi
    const alerts: Alert[] = [
      {
        id: 'high-response-time-alert',
        name: 'High Response Time',
        description: 'API response time is above threshold',
        severity: 'warning',
        status: 'active',
        query: 'avg(http_request_duration_seconds) > 1',
        condition: 'avg > 1s',
        threshold: 1.0,
        duration: '5m',
        metricId: 'response_time_seconds',
        metricName: 'HTTP Response Time',
        currentValue: 1.2,
        previousValue: 0.8,
        triggeredAt: new Date(Date.now() - 15 * 60 * 1000),
        lastEvaluated: new Date(),
        notificationChannels: ['email', 'slack'],
        notificationsSent: [
          {
            channel: 'email',
            sentAt: new Date(Date.now() - 14 * 60 * 1000),
            status: 'delivered',
            recipient: 'platform-team@urbanova.com'
          }
        ],
        runbookUrl: 'https://runbooks.urbanova.com/high-response-time',
        labels: { service: 'urbanova-api', environment: 'production' },
        annotations: { summary: 'API response time is degraded' },
        relatedAlerts: []
      },
      {
        id: 'memory-usage-alert',
        name: 'High Memory Usage',
        description: 'Memory usage is approaching limits',
        severity: 'critical',
        status: 'active',
        query: 'memory_usage_bytes / memory_limit_bytes > 0.9',
        condition: 'usage > 90%',
        threshold: 0.9,
        duration: '2m',
        metricId: 'memory_usage_bytes',
        metricName: 'Memory Usage',
        currentValue: 0.92,
        previousValue: 0.85,
        triggeredAt: new Date(Date.now() - 5 * 60 * 1000),
        lastEvaluated: new Date(),
        notificationChannels: ['email', 'slack', 'pagerduty'],
        notificationsSent: [
          {
            channel: 'pagerduty',
            sentAt: new Date(Date.now() - 4 * 60 * 1000),
            status: 'delivered',
            recipient: 'on-call-engineer'
          }
        ],
        labels: { service: 'urbanova-api', instance: 'api-01' },
        annotations: { summary: 'Memory usage critical on api-01' },
        relatedAlerts: []
      }
    ];

    alerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });

    // Simula log entries
    const logLevels: LogLevel[] = ['info', 'warn', 'error'];
    const services = ['urbanova-api', 'urbanova-frontend', 'urbanova-worker'];
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      
      const logEntry: LogEntry = {
        id: `log-${i}`,
        timestamp,
        level,
        message: this.generateLogMessage(level, service),
        service,
        instance: `${service}-${Math.floor(Math.random() * 3) + 1}`,
        environment: 'production',
        fields: {
          userId: level === 'error' ? undefined : `user-${Math.floor(Math.random() * 1000)}`,
          requestId: `req-${Math.random().toString(36).substr(2, 9)}`
        },
        labels: { service, environment: 'production' },
        source: 'application',
        host: `host-${Math.floor(Math.random() * 5) + 1}`,
        parsed: true,
        parser: 'json',
        searchable: `${level} ${service}`,
        tags: [level, service]
      };
      
      this.logs.push(logEntry);
    }

    // Simula service map
    this.serviceMap = {
      services: [
        {
          id: 'urbanova-frontend',
          name: 'Frontend',
          type: 'service',
          status: 'healthy',
          version: '1.2.3',
          requestRate: 45.2,
          errorRate: 0.8,
          avgLatency: 120,
          instances: 3,
          environment: 'production',
          position: { x: 100, y: 100 },
          labels: { team: 'frontend' },
          annotations: {}
        },
        {
          id: 'urbanova-api',
          name: 'API Gateway',
          type: 'service',
          status: 'degraded',
          version: '2.1.0',
          requestRate: 120.5,
          errorRate: 1.2,
          avgLatency: 250,
          instances: 5,
          environment: 'production',
          position: { x: 300, y: 100 },
          labels: { team: 'backend' },
          annotations: {}
        },
        {
          id: 'urbanova-db',
          name: 'Database',
          type: 'database',
          status: 'healthy',
          version: '13.4',
          requestRate: 80.3,
          errorRate: 0.1,
          avgLatency: 15,
          instances: 2,
          environment: 'production',
          position: { x: 500, y: 100 },
          labels: { team: 'database' },
          annotations: {}
        }
      ],
      connections: [
        {
          id: 'frontend-to-api',
          sourceId: 'urbanova-frontend',
          targetId: 'urbanova-api',
          requestRate: 45.2,
          errorRate: 0.8,
          avgLatency: 120,
          protocol: 'http',
          isHealthy: true,
          lastSeen: new Date()
        },
        {
          id: 'api-to-db',
          sourceId: 'urbanova-api',
          targetId: 'urbanova-db',
          requestRate: 80.3,
          errorRate: 0.1,
          avgLatency: 15,
          protocol: 'tcp',
          isHealthy: true,
          lastSeen: new Date()
        }
      ],
      generatedAt: new Date(),
      timeRange: '1h',
      environment: 'production'
    };

    // Simula incidente attivo
    const incident: Incident = {
      id: 'incident-001',
      title: 'API Response Time Degradation',
      description: 'Users experiencing slow response times from the API',
      severity: 'warning',
      status: 'investigating',
      impact: {
        services: ['urbanova-api'],
        users: 150,
        revenue: 5000
      },
      detectedAt: new Date(Date.now() - 30 * 60 * 1000),
      commander: 'john.doe',
      responders: ['jane.smith', 'bob.wilson'],
      updates: [
        {
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          author: 'john.doe',
          message: 'Investigating high response times in API layer',
          isPublic: true
        },
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          author: 'jane.smith',
          message: 'Database queries appear normal, investigating application layer',
          isPublic: false
        }
      ],
      relatedAlerts: ['high-response-time-alert'],
      relatedTraces: [],
      labels: { service: 'urbanova-api' }
    };

    this.incidents.set(incident.id, incident);
  }

  // Genera messaggio di log realistico
  private generateLogMessage(level: LogLevel, service: string): string {
    const messages = {
      info: [
        'Request processed successfully',
        'User authentication completed',
        'Database connection established',
        'Cache hit for user data',
        'Background job completed'
      ],
      warn: [
        'Rate limit approaching for user',
        'Database connection pool nearly full',
        'Slow query detected',
        'Cache miss for frequently accessed data',
        'Deprecated API endpoint used'
      ],
      error: [
        'Database connection failed',
        'Authentication token expired',
        'Failed to process payment',
        'External API call timeout',
        'Validation error in user input'
      ]
    };

    const levelMessages = messages[level] || messages.info;
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  }

  // Avvia generazione dati in tempo reale
  private startDataGeneration() {
    // Simula aggiornamento metriche ogni minuto
    setInterval(() => {
      this.generateMetricValues();
      this.updateDashboardData();
    }, 60000);

    // Simula nuovi log ogni 10 secondi
    setInterval(() => {
      this.generateLogEntries(5);
    }, 10000);
  }

  // Genera valori metriche simulate
  private generateMetricValues() {
    const now = new Date();
    
    this.metrics.forEach((metric, metricId) => {
      if (!this.metricValues.has(metricId)) {
        this.metricValues.set(metricId, []);
      }
      
      const values = this.metricValues.get(metricId)!;
      
      // Genera valore basato sul tipo di metrica
      let value: number;
      switch (metric.type) {
        case 'counter':
          value = Math.floor(Math.random() * 100) + 50;
          break;
        case 'gauge':
          if (metricId === 'memory_usage_bytes') {
            value = 500000000 + Math.random() * 200000000; // 500MB-700MB
          } else if (metricId === 'cpu_usage_percent') {
            value = 20 + Math.random() * 40; // 20%-60%
          } else {
            value = Math.random() * 100;
          }
          break;
        case 'histogram':
          value = Math.random() * 2; // 0-2 seconds
          break;
        default:
          value = Math.random() * 100;
      }
      
      const metricValue: MetricValue = {
        metricId,
        timestamp: now,
        value,
        labels: { service: 'urbanova-api', environment: 'production' },
        source: 'application',
        instance: 'api-01',
        environment: 'production'
      };
      
      values.push(metricValue);
      
      // Mantieni solo gli ultimi 1000 valori
      if (values.length > 1000) {
        values.shift();
      }
    });
  }

  // Genera nuove log entries
  private generateLogEntries(count: number) {
    const logLevels: LogLevel[] = ['info', 'warn', 'error'];
    const services = ['urbanova-api', 'urbanova-frontend', 'urbanova-worker'];
    
    for (let i = 0; i < count; i++) {
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      
      const logEntry: LogEntry = {
        id: `log-${Date.now()}-${i}`,
        timestamp: new Date(),
        level,
        message: this.generateLogMessage(level, service),
        service,
        instance: `${service}-${Math.floor(Math.random() * 3) + 1}`,
        environment: 'production',
        fields: {
          userId: level === 'error' ? undefined : `user-${Math.floor(Math.random() * 1000)}`,
          requestId: `req-${Math.random().toString(36).substr(2, 9)}`
        },
        labels: { service, environment: 'production' },
        source: 'application',
        host: `host-${Math.floor(Math.random() * 5) + 1}`,
        parsed: true,
        parser: 'json',
        searchable: `${level} ${service}`,
        tags: [level, service]
      };
      
      this.logs.push(logEntry);
      
      // Mantieni solo gli ultimi 10000 log
      if (this.logs.length > 10000) {
        this.logs.shift();
      }
    }
  }

  // Aggiorna dati dashboard
  private updateDashboardData() {
    this.dashboards.forEach(dashboard => {
      dashboard.widgets.forEach(widget => {
        if (widget.config.metricId) {
          const values = this.metricValues.get(widget.config.metricId);
          if (values && values.length > 0) {
            const latestValue = values[values.length - 1];
            
            if (widget.type === 'metric') {
              widget.data = { value: latestValue.value };
            } else if (widget.type === 'chart') {
              // Genera serie temporale per il grafico
              const timeRange = widget.config.timeRange || '6h';
              const points = this.getTimeRangePoints(timeRange);
              
              widget.data = {
                series: [{
                  name: widget.title,
                  data: values.slice(-points).map(v => ({
                    timestamp: v.timestamp,
                    value: v.value
                  }))
                }]
              };
            }
            
            widget.lastUpdated = new Date();
          }
        }
      });
    });
  }

  // Ottieni numero di punti per time range
  private getTimeRangePoints(timeRange: TimeRange): number {
    const points = {
      '5m': 5,
      '15m': 15,
      '30m': 30,
      '1h': 60,
      '3h': 180,
      '6h': 360,
      '12h': 720,
      '24h': 1440,
      '7d': 10080,
      '30d': 43200
    };
    return points[timeRange] || 60;
  }

  // Crea un nuovo alert
  createAlert(
    name: string,
    description: string,
    metricId: string,
    condition: string,
    threshold: number,
    severity: AlertSeverity,
    duration: string = '5m'
  ): Alert {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      throw new Error(`Metric ${metricId} not found`);
    }

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      name,
      description,
      severity,
      status: 'pending',
      query: `${metric.name} ${condition} ${threshold}`,
      condition,
      threshold,
      duration,
      metricId,
      metricName: metric.name,
      currentValue: 0,
      triggeredAt: new Date(),
      lastEvaluated: new Date(),
      notificationChannels: this.configuration.alerting.defaultChannels,
      notificationsSent: [],
      labels: {},
      annotations: {},
      relatedAlerts: []
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  // Cerca nei log
  searchLogs(query: LogQuery): LogQueryResult {
    const startTime = Date.now();
    
    let filteredLogs = this.logs.filter(log => {
      // Filtro per time range
      const timeRangeMs = this.getTimeRangeMs(query.timeRange);
      if (log.timestamp.getTime() < Date.now() - timeRangeMs) {
        return false;
      }
      
      // Filtri
      if (query.services && !query.services.includes(log.service)) return false;
      if (query.levels && !query.levels.includes(log.level)) return false;
      if (query.environments && !query.environments.includes(log.environment)) return false;
      
      // Ricerca testuale
      if (query.query.trim()) {
        const searchText = query.query.toLowerCase();
        return log.message.toLowerCase().includes(searchText) ||
               log.service.toLowerCase().includes(searchText) ||
               log.level.toLowerCase().includes(searchText);
      }
      
      return true;
    });

    // Ordinamento
    filteredLogs.sort((a, b) => {
      const factor = query.orderDirection === 'asc' ? 1 : -1;
      switch (query.orderBy) {
        case 'timestamp':
          return factor * (a.timestamp.getTime() - b.timestamp.getTime());
        case 'level':
          return factor * a.level.localeCompare(b.level);
        case 'service':
          return factor * a.service.localeCompare(b.service);
        default:
          return factor * (a.timestamp.getTime() - b.timestamp.getTime());
      }
    });

    const totalCount = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(query.offset, query.offset + query.limit);

    // Genera statistiche
    const levelCounts: Record<LogLevel, number> = {
      trace: 0, debug: 0, info: 0, warn: 0, error: 0, fatal: 0
    };
    const serviceCounts: Record<string, number> = {};

    filteredLogs.forEach(log => {
      levelCounts[log.level]++;
      serviceCounts[log.service] = (serviceCounts[log.service] || 0) + 1;
    });

    const executionTime = Date.now() - startTime;

    return {
      query,
      entries: paginatedLogs,
      totalCount,
      executionTime,
      levelCounts,
      serviceCounts,
      suggestions: []
    };
  }

  // Converti time range in millisecondi
  private getTimeRangeMs(timeRange: TimeRange): number {
    const ranges = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '3h': 3 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return ranges[timeRange] || ranges['1h'];
  }

  // Genera statistiche monitoring
  generateMonitoringStats(): MonitoringStats {
    const activeAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'active');
    const resolvedAlerts = Array.from(this.alerts.values()).filter(a => a.status === 'resolved');
    
    const alertsBySeverity: Record<AlertSeverity, number> = {
      info: 0, warning: 0, error: 0, critical: 0
    };
    
    Array.from(this.alerts.values()).forEach(alert => {
      alertsBySeverity[alert.severity]++;
    });

    const healthySLOs = Array.from(this.slos.values()).filter(slo => slo.status === 'healthy');
    const atRiskSLOs = Array.from(this.slos.values()).filter(slo => slo.status === 'warning');
    const breachingSLOs = Array.from(this.slos.values()).filter(slo => slo.status === 'critical');

    return {
      system: {
        totalMetrics: this.metrics.size,
        activeAlerts: activeAlerts.length,
        servicesMonitored: this.targets.size,
        uptime: 99.95,
        queryLatency: 45,
        ingestionRate: 1500,
        storageUsage: 75
      },
      alerting: {
        totalAlerts: this.alerts.size,
        activeAlerts: activeAlerts.length,
        resolvedAlerts: resolvedAlerts.length,
        alertsBySeverity,
        meanTimeToResolve: 25, // minutes
        meanTimeToAcknowledge: 3 // minutes
      },
      sloCompliance: {
        totalSLOs: this.slos.size,
        healthySLOs: healthySLOs.length,
        atRiskSLOs: atRiskSLOs.length,
        breachingSLOs: breachingSLOs.length,
        totalErrorBudget: 100,
        consumedErrorBudget: 25
      },
      usage: {
        dashboardViews: 1250,
        queryExecutions: 8500,
        activeUsers: 15,
        topQueries: [
          { query: 'avg(cpu_usage)', executions: 450, avgLatency: 12 },
          { query: 'sum(http_requests_total)', executions: 380, avgLatency: 18 },
          { query: 'rate(errors[5m])', executions: 220, avgLatency: 25 }
        ]
      },
      generatedAt: new Date(),
      period: '24h'
    };
  }

  // Getter pubblici
  getMetrics(): MetricDefinition[] {
    return Array.from(this.metrics.values());
  }

  getMetricSeries(metricId: string, timeRange: TimeRange): MetricSeries | null {
    const metric = this.metrics.get(metricId);
    const values = this.metricValues.get(metricId);
    
    if (!metric || !values) return null;

    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoffTime = Date.now() - timeRangeMs;
    
    const filteredValues = values.filter(v => v.timestamp.getTime() >= cutoffTime);
    
    if (filteredValues.length === 0) return null;

    const seriesValues = filteredValues.map(v => ({
      timestamp: v.timestamp,
      value: v.value
    }));

    const valueNumbers = seriesValues.map(v => v.value);

    return {
      metricId,
      name: metric.name,
      labels: filteredValues[0]?.labels || {},
      values: seriesValues,
      min: Math.min(...valueNumbers),
      max: Math.max(...valueNumbers),
      avg: valueNumbers.reduce((a, b) => a + b, 0) / valueNumbers.length,
      sum: valueNumbers.reduce((a, b) => a + b, 0),
      count: valueNumbers.length,
      unit: metric.unit,
      aggregation: metric.aggregation
    };
  }

  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  getDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  getServiceMap(): ServiceMap | null {
    return this.serviceMap;
  }

  getTargets(): MonitoringTarget[] {
    return Array.from(this.targets.values());
  }

  getSLOs(): SLO[] {
    return Array.from(this.slos.values());
  }

  getIncidents(): Incident[] {
    return Array.from(this.incidents.values());
  }

  getConfiguration(): MonitoringConfiguration {
    return this.configuration;
  }

  // Aggiorna stato alert
  updateAlertStatus(alertId: string, status: AlertStatus): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = status;
    alert.lastEvaluated = new Date();

    if (status === 'acknowledged') {
      alert.acknowledgedAt = new Date();
    } else if (status === 'resolved') {
      alert.resolvedAt = new Date();
    }

    return true;
  }

  // Aggiorna stato incidente
  updateIncidentStatus(incidentId: string, status: 'investigating' | 'identified' | 'monitoring' | 'resolved'): boolean {
    const incident = this.incidents.get(incidentId);
    if (!incident) return false;

    incident.status = status;

    if (status === 'resolved') {
      incident.resolvedAt = new Date();
    }

    return true;
  }
}

// Istanza singleton del service
export const monitoringService = new MonitoringService();
