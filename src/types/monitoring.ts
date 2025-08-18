// Tipi per il sistema di Advanced Monitoring & Observability

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary' | 'timer';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AlertStatus = 'active' | 'pending' | 'resolved' | 'suppressed' | 'acknowledged';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export type MonitoringInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '6h' | '12h' | '24h';

export type TimeRange = '5m' | '15m' | '30m' | '1h' | '3h' | '6h' | '12h' | '24h' | '7d' | '30d';

export type AggregationType = 'avg' | 'sum' | 'min' | 'max' | 'count' | 'rate' | 'percentile';

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'gauge' | 'heatmap' | 'scatter' | 'candlestick';

export type DashboardType = 'overview' | 'infrastructure' | 'application' | 'business' | 'security' | 'custom';

export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty' | 'teams';

export type TraceStatus = 'ok' | 'error' | 'timeout' | 'cancelled';

export type SpanKind = 'server' | 'client' | 'producer' | 'consumer' | 'internal';

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  type: MetricType;
  
  // Configurazione metrica
  unit: string;
  labels: string[];
  help: string;
  
  // Aggregazione
  aggregation: AggregationType;
  buckets?: number[]; // per histogram
  quantiles?: number[]; // per summary
  
  // Raccolta dati
  interval: MonitoringInterval;
  retention: string; // es. "30d", "1y"
  
  // Soglie
  thresholds: {
    warning?: number;
    critical?: number;
  };
  
  // Metadati
  category: string;
  tags: string[];
  owner: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface MetricValue {
  metricId: string;
  timestamp: Date;
  value: number;
  labels: Record<string, string>;
  
  // Metadati aggiuntivi
  source: string;
  instance: string;
  environment: string;
}

export interface MetricSeries {
  metricId: string;
  name: string;
  labels: Record<string, string>;
  values: Array<{
    timestamp: Date;
    value: number;
  }>;
  
  // Statistiche
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
  
  // Metadati
  unit: string;
  aggregation: AggregationType;
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  
  // Configurazione alert
  query: string;
  condition: string;
  threshold: number;
  duration: string; // es. "5m"
  
  // Metrica associata
  metricId: string;
  metricName: string;
  
  // Valori correnti
  currentValue: number;
  previousValue?: number;
  
  // Timeline
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  lastEvaluated: Date;
  
  // Notifiche
  notificationChannels: NotificationChannel[];
  notificationsSent: Array<{
    channel: NotificationChannel;
    sentAt: Date;
    status: 'sent' | 'delivered' | 'failed';
    recipient: string;
  }>;
  
  // Azioni
  runbookUrl?: string;
  escalationPolicy?: string;
  
  // Metadati
  labels: Record<string, string>;
  annotations: Record<string, string>;
  
  // Correlazione
  relatedAlerts: string[];
  incidentId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  
  // Contesto
  service: string;
  instance: string;
  environment: string;
  
  // Struttura
  fields: Record<string, any>;
  labels: Record<string, string>;
  
  // Tracciabilità
  traceId?: string;
  spanId?: string;
  
  // Metadati
  source: string;
  host: string;
  userId?: string;
  requestId?: string;
  
  // Parsing
  parsed: boolean;
  parser: string;
  
  // Indici
  searchable: string;
  tags: string[];
}

export interface LogQuery {
  query: string;
  timeRange: TimeRange;
  
  // Filtri
  services?: string[];
  levels?: LogLevel[];
  environments?: string[];
  
  // Paginazione
  limit: number;
  offset: number;
  
  // Ordinamento
  orderBy: 'timestamp' | 'level' | 'service';
  orderDirection: 'asc' | 'desc';
  
  // Aggregazione
  aggregate?: {
    field: string;
    function: AggregationType;
    interval?: string;
  };
}

export interface LogQueryResult {
  query: LogQuery;
  entries: LogEntry[];
  totalCount: number;
  executionTime: number;
  
  // Aggregazioni
  aggregations?: Array<{
    timestamp: Date;
    value: number;
  }>;
  
  // Statistiche
  levelCounts: Record<LogLevel, number>;
  serviceCounts: Record<string, number>;
  
  // Suggerimenti
  suggestions: string[];
}

export interface Trace {
  id: string;
  traceId: string;
  operationName: string;
  
  // Timeline
  startTime: Date;
  endTime: Date;
  duration: number; // in microseconds
  
  // Stato
  status: TraceStatus;
  statusMessage?: string;
  
  // Servizio
  serviceName: string;
  serviceVersion: string;
  
  // Spans
  spans: Span[];
  rootSpan: Span;
  
  // Metadati
  tags: Record<string, string>;
  process: {
    serviceName: string;
    tags: Record<string, string>;
  };
  
  // Errori
  hasErrors: boolean;
  errorCount: number;
  
  // Warnings
  hasWarnings: boolean;
  warningCount: number;
}

export interface Span {
  id: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  
  // Operazione
  operationName: string;
  kind: SpanKind;
  
  // Timeline
  startTime: Date;
  endTime: Date;
  duration: number; // in microseconds
  
  // Stato
  status: TraceStatus;
  statusMessage?: string;
  
  // Servizio
  serviceName: string;
  
  // Dati
  tags: Record<string, string>;
  logs: Array<{
    timestamp: Date;
    fields: Record<string, any>;
  }>;
  
  // Relazioni
  childSpans: Span[];
  
  // Errori
  hasError: boolean;
  errorMessage?: string;
  
  // References
  references: Array<{
    type: 'child_of' | 'follows_from';
    traceId: string;
    spanId: string;
  }>;
}

export interface ServiceMap {
  services: ServiceNode[];
  connections: ServiceConnection[];
  
  // Metadati
  generatedAt: Date;
  timeRange: TimeRange;
  environment: string;
}

export interface ServiceNode {
  id: string;
  name: string;
  type: 'service' | 'database' | 'cache' | 'queue' | 'external';
  
  // Stato
  status: ServiceStatus;
  version: string;
  
  // Metriche
  requestRate: number; // req/sec
  errorRate: number; // percentage
  avgLatency: number; // milliseconds
  
  // Deployment
  instances: number;
  environment: string;
  
  // Posizione (per visualizzazione)
  position: {
    x: number;
    y: number;
  };
  
  // Metadati
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface ServiceConnection {
  id: string;
  sourceId: string;
  targetId: string;
  
  // Metriche
  requestRate: number;
  errorRate: number;
  avgLatency: number;
  
  // Protocollo
  protocol: string; // http, grpc, tcp, etc.
  
  // Stato
  isHealthy: boolean;
  lastSeen: Date;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: DashboardType;
  
  // Layout
  layout: {
    columns: number;
    rows: number;
  };
  
  // Widgets
  widgets: DashboardWidget[];
  
  // Configurazione
  timeRange: TimeRange;
  refreshInterval: MonitoringInterval;
  autoRefresh: boolean;
  
  // Condivisione
  isPublic: boolean;
  sharedWith: string[];
  
  // Variabili
  variables: Array<{
    name: string;
    type: 'query' | 'constant' | 'datasource';
    value: string;
    options?: string[];
  }>;
  
  // Metadati
  tags: string[];
  owner: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastViewed: Date;
  viewCount: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'text' | 'alert_list' | 'log_panel' | 'service_map';
  
  // Posizione
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Configurazione
  config: {
    query?: string;
    metricId?: string;
    chartType?: ChartType;
    aggregation?: AggregationType;
    timeRange?: TimeRange;
    
    // Visualizzazione
    showLegend?: boolean;
    showGrid?: boolean;
    colorScheme?: string;
    
    // Soglie
    thresholds?: Array<{
      value: number;
      color: string;
      operator: 'gt' | 'lt' | 'eq';
    }>;
    
    // Formattazione
    unit?: string;
    decimals?: number;
    format?: string;
  };
  
  // Dati
  data: any;
  lastUpdated: Date;
  
  // Stati
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface MonitoringTarget {
  id: string;
  name: string;
  type: 'http' | 'tcp' | 'ping' | 'dns' | 'ssl' | 'database' | 'service';
  
  // Configurazione
  url?: string;
  host?: string;
  port?: number;
  path?: string;
  method?: string;
  
  // Credenziali
  auth?: {
    type: 'basic' | 'bearer' | 'api_key';
    credentials: Record<string, string>;
  };
  
  // Configurazione check
  interval: MonitoringInterval;
  timeout: number; // seconds
  retries: number;
  
  // Validazione
  expectedStatus?: number;
  expectedContent?: string;
  
  // Stato
  status: ServiceStatus;
  lastCheck: Date;
  nextCheck: Date;
  uptime: number; // percentage
  
  // Metriche
  responseTime: number; // milliseconds
  
  // Notifiche
  notifyOnFailure: boolean;
  notificationChannels: NotificationChannel[];
  
  // Metadati
  environment: string;
  team: string;
  tags: string[];
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthCheck {
  id: string;
  targetId: string;
  
  // Risultato
  status: ServiceStatus;
  responseTime: number;
  statusCode?: number;
  
  // Dettagli
  message: string;
  details: Record<string, any>;
  
  // Errori
  error?: string;
  errorType?: string;
  
  // Timeline
  timestamp: Date;
  duration: number;
}

export interface SLI {
  id: string;
  name: string;
  description: string;
  
  // Configurazione
  query: string;
  goodEventsQuery: string;
  totalEventsQuery: string;
  
  // Target
  target: number; // percentage (e.g., 99.9)
  
  // Finestre temporali
  windows: Array<{
    duration: string; // e.g., "30d"
    target: number;
  }>;
  
  // Stato corrente
  currentValue: number;
  status: 'meeting' | 'at_risk' | 'breaching';
  
  // Error budget
  errorBudget: {
    total: number;
    consumed: number;
    remaining: number;
    burnRate: number;
  };
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastCalculated: Date;
}

export interface SLO {
  id: string;
  name: string;
  description: string;
  
  // SLIs associati
  slis: SLI[];
  
  // Configurazione
  objective: number; // percentage
  timeWindow: string; // e.g., "30d"
  
  // Stato
  currentCompliance: number;
  status: 'healthy' | 'warning' | 'critical';
  
  // Error budget
  errorBudget: {
    total: number;
    consumed: number;
    remaining: number;
    burnRate: number;
    exhaustionDate?: Date;
  };
  
  // Alerting
  alertRules: Array<{
    condition: string;
    threshold: number;
    severity: AlertSeverity;
  }>;
  
  // Metadati
  service: string;
  team: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  
  // Stato
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  
  // Impatto
  impact: {
    services: string[];
    users: number;
    revenue?: number;
  };
  
  // Timeline
  detectedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Team
  commander: string;
  responders: string[];
  
  // Comunicazione
  updates: Array<{
    timestamp: Date;
    author: string;
    message: string;
    isPublic: boolean;
  }>;
  
  // Root cause
  rootCause?: string;
  resolution?: string;
  
  // Post-mortem
  postMortem?: {
    completed: boolean;
    url?: string;
    actionItems: Array<{
      description: string;
      assignee: string;
      dueDate: Date;
      status: 'open' | 'in_progress' | 'completed';
    }>;
  };
  
  // Correlazione
  relatedAlerts: string[];
  relatedTraces: string[];
  
  // Metadati
  labels: Record<string, string>;
}

export interface MonitoringConfiguration {
  // Raccolta metriche
  metricsCollection: {
    enabled: boolean;
    interval: MonitoringInterval;
    retention: string;
    
    // Filtri
    includedServices: string[];
    excludedServices: string[];
    
    // Sampling
    samplingRate: number; // 0-1
  };
  
  // Logging
  logging: {
    enabled: boolean;
    level: LogLevel;
    retention: string;
    
    // Parsing
    enableStructuredLogging: boolean;
    customParsers: Record<string, string>;
    
    // Indexing
    indexedFields: string[];
  };
  
  // Tracing
  tracing: {
    enabled: boolean;
    samplingRate: number;
    retention: string;
    
    // Configurazione
    enableServiceMap: boolean;
    enableDependencyAnalysis: boolean;
  };
  
  // Alerting
  alerting: {
    enabled: boolean;
    defaultChannels: NotificationChannel[];
    
    // Rate limiting
    rateLimiting: {
      enabled: boolean;
      maxAlertsPerMinute: number;
    };
    
    // Grouping
    grouping: {
      enabled: boolean;
      groupBy: string[];
      groupWait: string;
    };
  };
  
  // Storage
  storage: {
    type: 'local' | 'prometheus' | 'influxdb' | 'elasticsearch';
    config: Record<string, any>;
    
    // Retention policies
    retentionPolicies: Array<{
      metric: string;
      retention: string;
      downsampling?: string;
    }>;
  };
}

export interface MonitoringStats {
  // Metriche sistema
  system: {
    totalMetrics: number;
    activeAlerts: number;
    servicesMonitored: number;
    uptime: number;
    
    // Performance
    queryLatency: number;
    ingestionRate: number;
    storageUsage: number;
  };
  
  // Alerting
  alerting: {
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;
    
    // Breakdown per severità
    alertsBySeverity: Record<AlertSeverity, number>;
    
    // MTTR
    meanTimeToResolve: number;
    meanTimeToAcknowledge: number;
  };
  
  // SLO/SLI
  sloCompliance: {
    totalSLOs: number;
    healthySLOs: number;
    atRiskSLOs: number;
    breachingSLOs: number;
    
    // Error budget
    totalErrorBudget: number;
    consumedErrorBudget: number;
  };
  
  // Utilizzo
  usage: {
    dashboardViews: number;
    queryExecutions: number;
    activeUsers: number;
    
    // Top queries
    topQueries: Array<{
      query: string;
      executions: number;
      avgLatency: number;
    }>;
  };
  
  // Timeline
  generatedAt: Date;
  period: TimeRange;
}
