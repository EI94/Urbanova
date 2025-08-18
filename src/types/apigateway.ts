// Tipi per il sistema di Advanced API Gateway & Microservices Architecture

export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'maintenance' | 'offline' | 'starting' | 'stopping';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type AuthenticationType = 'none' | 'api_key' | 'bearer_token' | 'oauth2' | 'basic_auth' | 'jwt' | 'custom';

export type RateLimitType = 'requests_per_minute' | 'requests_per_hour' | 'requests_per_day' | 'concurrent_requests' | 'bandwidth';

export type LoadBalancingStrategy = 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash' | 'random' | 'health_based';

export type CacheStrategy = 'none' | 'memory' | 'redis' | 'cdn' | 'database' | 'hybrid';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type DeploymentStrategy = 'blue_green' | 'canary' | 'rolling' | 'recreate' | 'a_b_test';

export type ServiceType = 'api' | 'web' | 'worker' | 'database' | 'cache' | 'message_queue' | 'storage' | 'auth' | 'gateway';

export type HealthCheckType = 'http' | 'tcp' | 'grpc' | 'custom' | 'database' | 'dependency';

export type CircuitBreakerState = 'closed' | 'open' | 'half_open';

export type RetryStrategy = 'exponential_backoff' | 'linear_backoff' | 'fixed_delay' | 'immediate' | 'custom';

export type ServiceDiscoveryType = 'consul' | 'etcd' | 'zookeeper' | 'kubernetes' | 'dns' | 'static';

export interface APIEndpoint {
  id: string;
  path: string;
  method: RequestMethod;
  name: string;
  description: string;
  
  // Service routing
  serviceId: string;
  serviceName: string;
  targetUrl: string;
  
  // Authentication & Authorization
  authentication: {
    type: AuthenticationType;
    required: boolean;
    scopes?: string[];
    roles?: string[];
    customHeaders?: Record<string, string>;
  };
  
  // Rate limiting
  rateLimiting: {
    enabled: boolean;
    type: RateLimitType;
    limit: number;
    windowSize: number; // in seconds
    burstLimit?: number;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: 'ip' | 'user' | 'api_key' | 'custom';
  };
  
  // Caching
  caching: {
    enabled: boolean;
    strategy: CacheStrategy;
    ttl: number; // in seconds
    varyBy?: string[];
    conditions?: string[];
  };
  
  // Request/Response transformation
  transformation: {
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestBody?: string; // transformation script
    responseBody?: string; // transformation script
  };
  
  // Validation
  validation: {
    requestSchema?: any; // JSON Schema
    responseSchema?: any; // JSON Schema
    validateRequest: boolean;
    validateResponse: boolean;
  };
  
  // Monitoring & Analytics
  monitoring: {
    enabled: boolean;
    logRequests: boolean;
    logResponses: boolean;
    trackMetrics: boolean;
    customMetrics?: string[];
  };
  
  // Circuit breaker
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number; // in seconds
    state: CircuitBreakerState;
  };
  
  // Retry policy
  retryPolicy: {
    enabled: boolean;
    maxAttempts: number;
    strategy: RetryStrategy;
    backoffMultiplier?: number;
    maxDelay?: number; // in seconds
    retryableStatusCodes?: number[];
  };
  
  // Documentation
  documentation: {
    summary: string;
    description: string;
    tags: string[];
    examples: Array<{
      name: string;
      request: any;
      response: any;
    }>;
  };
  
  // Status & Metrics
  isActive: boolean;
  version: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  
  // Performance metrics
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    throughput: number; // requests per second
  };
}

export interface Microservice {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  
  // Deployment info
  version: string;
  environment: 'development' | 'staging' | 'production';
  namespace: string;
  
  // Network configuration
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc' | 'tcp' | 'udp';
  basePath?: string;
  
  // Health & Status
  status: ServiceStatus;
  healthCheck: {
    type: HealthCheckType;
    endpoint?: string;
    interval: number; // in seconds
    timeout: number; // in seconds
    retries: number;
    successThreshold: number;
    failureThreshold: number;
  };
  
  // Scaling configuration
  scaling: {
    minInstances: number;
    maxInstances: number;
    currentInstances: number;
    targetCPU: number; // percentage
    targetMemory: number; // percentage
    scaleUpCooldown: number; // in seconds
    scaleDownCooldown: number; // in seconds
  };
  
  // Resource limits
  resources: {
    cpu: {
      requests: string; // e.g., "100m"
      limits: string; // e.g., "500m"
    };
    memory: {
      requests: string; // e.g., "128Mi"
      limits: string; // e.g., "512Mi"
    };
    storage?: {
      requests: string;
      limits: string;
    };
  };
  
  // Dependencies
  dependencies: Array<{
    serviceId: string;
    serviceName: string;
    type: 'required' | 'optional';
    healthImpact: 'critical' | 'degraded' | 'none';
  }>;
  
  // Environment variables
  environmentVariables: Record<string, {
    value: string;
    encrypted: boolean;
    source?: 'config' | 'secret' | 'computed';
  }>;
  
  // Load balancing
  loadBalancing: {
    strategy: LoadBalancingStrategy;
    healthCheckPath?: string;
    stickySession: boolean;
    weights?: Record<string, number>;
  };
  
  // Security
  security: {
    networkPolicies: string[];
    serviceAccount?: string;
    securityContext?: {
      runAsUser?: number;
      runAsGroup?: number;
      fsGroup?: number;
    };
  };
  
  // Monitoring & Observability
  observability: {
    metricsEnabled: boolean;
    tracingEnabled: boolean;
    loggingEnabled: boolean;
    customDashboards: string[];
    alertRules: string[];
  };
  
  // API endpoints exposed by this service
  endpoints: string[]; // APIEndpoint IDs
  
  // Deployment history
  deployments: Array<{
    version: string;
    strategy: DeploymentStrategy;
    deployedAt: Date;
    deployedBy: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
    rollbackVersion?: string;
  }>;
  
  // Performance metrics
  metrics: {
    uptime: number; // percentage
    responseTime: {
      average: number;
      p50: number;
      p95: number;
      p99: number;
    };
    throughput: number; // requests per second
    errorRate: number; // percentage
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
    diskUsage?: number; // percentage
    networkIO: {
      inbound: number; // bytes per second
      outbound: number; // bytes per second
    };
  };
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastDeployedAt: Date;
  lastHealthCheckAt: Date;
}

export interface APIGateway {
  id: string;
  name: string;
  description: string;
  
  // Network configuration
  host: string;
  port: number;
  protocol: 'http' | 'https';
  domain?: string;
  
  // SSL/TLS configuration
  ssl: {
    enabled: boolean;
    certificateId?: string;
    tlsVersion: string;
    cipherSuites: string[];
    hsts: boolean;
  };
  
  // Global authentication
  globalAuth: {
    enabled: boolean;
    type: AuthenticationType;
    config: Record<string, any>;
    excludedPaths?: string[];
  };
  
  // Global rate limiting
  globalRateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
    keyGenerator: 'ip' | 'user' | 'api_key';
  };
  
  // CORS configuration
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: RequestMethod[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
    maxAge: number; // in seconds
  };
  
  // Request/Response middleware
  middleware: Array<{
    id: string;
    name: string;
    type: 'request' | 'response' | 'both';
    order: number;
    config: Record<string, any>;
    enabled: boolean;
  }>;
  
  // Service discovery
  serviceDiscovery: {
    type: ServiceDiscoveryType;
    config: Record<string, any>;
    healthCheckInterval: number;
    unhealthyThreshold: number;
  };
  
  // Load balancing
  loadBalancing: {
    strategy: LoadBalancingStrategy;
    healthCheckEnabled: boolean;
    sessionAffinity: boolean;
  };
  
  // Caching
  caching: {
    enabled: boolean;
    defaultTtl: number;
    maxCacheSize: string; // e.g., "1GB"
    compressionEnabled: boolean;
  };
  
  // Logging & Monitoring
  logging: {
    level: LogLevel;
    format: 'json' | 'text';
    destinations: Array<{
      type: 'file' | 'elasticsearch' | 'cloudwatch' | 'stdout';
      config: Record<string, any>;
    }>;
  };
  
  // Metrics collection
  metrics: {
    enabled: boolean;
    collectors: string[];
    exporters: Array<{
      type: 'prometheus' | 'datadog' | 'newrelic' | 'custom';
      config: Record<string, any>;
    }>;
  };
  
  // Security
  security: {
    ipWhitelist?: string[];
    ipBlacklist?: string[];
    ddosProtection: boolean;
    requestSizeLimit: string; // e.g., "10MB"
    headerSizeLimit: string; // e.g., "8KB"
  };
  
  // Status
  status: ServiceStatus;
  version: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastRestartedAt?: Date;
  
  // Performance metrics
  performanceMetrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
    
    // Resource usage
    cpuUsage: number;
    memoryUsage: number;
    networkIO: {
      inbound: number;
      outbound: number;
    };
    
    // Cache metrics
    cacheHitRate?: number;
    cacheMissRate?: number;
    cacheEvictions?: number;
  };
}

export interface ServiceMesh {
  id: string;
  name: string;
  description: string;
  
  // Mesh configuration
  services: string[]; // Microservice IDs
  
  // Traffic management
  trafficPolicies: Array<{
    id: string;
    name: string;
    sourceService: string;
    destinationService: string;
    rules: Array<{
      match: {
        headers?: Record<string, string>;
        method?: RequestMethod;
        path?: string;
      };
      route: {
        destination: string;
        weight?: number;
        timeout?: number;
        retries?: {
          attempts: number;
          perTryTimeout: number;
        };
      };
    }>;
  }>;
  
  // Security policies
  securityPolicies: Array<{
    id: string;
    name: string;
    type: 'authorization' | 'authentication' | 'network';
    rules: Array<{
      action: 'allow' | 'deny';
      source?: string;
      destination?: string;
      conditions?: Record<string, any>;
    }>;
  }>;
  
  // Observability
  observability: {
    distributedTracing: {
      enabled: boolean;
      samplingRate: number; // percentage
      jaegerEndpoint?: string;
      zipkinEndpoint?: string;
    };
    metricsCollection: {
      enabled: boolean;
      prometheusEndpoint?: string;
      customMetrics: string[];
    };
    logging: {
      enabled: boolean;
      level: LogLevel;
      accessLogs: boolean;
    };
  };
  
  // mTLS configuration
  mtls: {
    enabled: boolean;
    mode: 'strict' | 'permissive';
    certificateAuthority: string;
    certificateLifetime: number; // in hours
  };
  
  // Circuit breaker configuration
  circuitBreaker: {
    enabled: boolean;
    defaultFailureThreshold: number;
    defaultRecoveryTime: number;
    customRules: Array<{
      service: string;
      failureThreshold: number;
      recoveryTime: number;
    }>;
  };
  
  // Status
  status: ServiceStatus;
  version: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
}

export interface APIRequest {
  id: string;
  
  // Request details
  method: RequestMethod;
  path: string;
  fullUrl: string;
  
  // Headers
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: any;
  
  // Client information
  clientIP: string;
  userAgent: string;
  userId?: string;
  apiKey?: string;
  
  // Routing
  endpointId: string;
  serviceId: string;
  gatewayId: string;
  
  // Timing
  timestamp: Date;
  responseTime: number; // in milliseconds
  
  // Response details
  statusCode: number;
  responseSize: number; // in bytes
  responseHeaders: Record<string, string>;
  
  // Error information
  error?: {
    message: string;
    code: string;
    stack?: string;
  };
  
  // Tracing
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  
  // Security
  authentication: {
    type: AuthenticationType;
    successful: boolean;
    userId?: string;
    scopes?: string[];
  };
  
  // Rate limiting
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    resetTime: Date;
    exceeded: boolean;
  };
  
  // Cache information
  cacheInfo?: {
    hit: boolean;
    key: string;
    ttl?: number;
  };
  
  // Retry information
  retryInfo?: {
    attempt: number;
    maxAttempts: number;
    nextRetryAt?: Date;
  };
  
  // Circuit breaker
  circuitBreakerInfo?: {
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureAt?: Date;
  };
}

export interface ServiceAlert {
  id: string;
  name: string;
  description: string;
  
  // Alert configuration
  type: 'metric' | 'log' | 'health_check' | 'custom';
  severity: AlertSeverity;
  
  // Conditions
  conditions: Array<{
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    threshold: number;
    duration: number; // in seconds
  }>;
  
  // Targets
  services: string[]; // Microservice IDs
  endpoints?: string[]; // APIEndpoint IDs
  
  // Notification
  notifications: Array<{
    type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
    config: Record<string, any>;
    enabled: boolean;
  }>;
  
  // State
  state: 'ok' | 'warning' | 'critical' | 'unknown';
  lastTriggeredAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  
  // History
  history: Array<{
    timestamp: Date;
    state: 'triggered' | 'resolved' | 'acknowledged';
    value?: number;
    message?: string;
  }>;
}

export interface ServiceDeployment {
  id: string;
  serviceId: string;
  serviceName: string;
  
  // Deployment details
  version: string;
  strategy: DeploymentStrategy;
  
  // Configuration
  replicas: number;
  image: string;
  tag: string;
  
  // Environment
  environment: 'development' | 'staging' | 'production';
  namespace: string;
  
  // Resources
  resources: {
    cpu: string;
    memory: string;
    storage?: string;
  };
  
  // Health checks
  healthChecks: Array<{
    type: HealthCheckType;
    path?: string;
    port?: number;
    interval: number;
    timeout: number;
    successThreshold: number;
    failureThreshold: number;
  }>;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolling_back' | 'rolled_back';
  
  // Progress tracking
  progress: {
    total: number;
    completed: number;
    failed: number;
    percentage: number;
  };
  
  // Timeline
  startedAt: Date;
  completedAt?: Date;
  deployedBy: string;
  
  // Rollback information
  canRollback: boolean;
  rollbackVersion?: string;
  rollbackReason?: string;
  
  // Logs and events
  logs: Array<{
    timestamp: Date;
    level: LogLevel;
    message: string;
    source: string;
  }>;
  
  // Metrics during deployment
  deploymentMetrics: {
    duration: number; // in seconds
    successRate: number;
    errorCount: number;
    rollbackCount: number;
  };
}

export interface APIAnalytics {
  // Time range
  timeRange: {
    start: Date;
    end: Date;
    granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
  };
  
  // Overall metrics
  overview: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
    uniqueClients: number;
  };
  
  // Traffic patterns
  traffic: {
    requestsOverTime: Array<{
      timestamp: Date;
      requests: number;
      errors: number;
    }>;
    
    topEndpoints: Array<{
      endpointId: string;
      path: string;
      requests: number;
      averageResponseTime: number;
      errorRate: number;
    }>;
    
    topClients: Array<{
      clientIP: string;
      userAgent: string;
      requests: number;
      errorRate: number;
    }>;
  };
  
  // Performance metrics
  performance: {
    responseTimeDistribution: Array<{
      range: string; // e.g., "0-100ms"
      count: number;
      percentage: number;
    }>;
    
    slowestEndpoints: Array<{
      endpointId: string;
      path: string;
      averageResponseTime: number;
      p95ResponseTime: number;
      requests: number;
    }>;
    
    servicePerformance: Array<{
      serviceId: string;
      serviceName: string;
      averageResponseTime: number;
      throughput: number;
      errorRate: number;
    }>;
  };
  
  // Error analysis
  errors: {
    errorsByStatusCode: Array<{
      statusCode: number;
      count: number;
      percentage: number;
    }>;
    
    errorsByService: Array<{
      serviceId: string;
      serviceName: string;
      errorCount: number;
      errorRate: number;
    }>;
    
    topErrors: Array<{
      message: string;
      count: number;
      firstOccurrence: Date;
      lastOccurrence: Date;
      affectedEndpoints: string[];
    }>;
  };
  
  // Security insights
  security: {
    authenticationFailures: number;
    rateLimitExceeded: number;
    suspiciousIPs: string[];
    blockedRequests: number;
    
    attackPatterns: Array<{
      type: string;
      count: number;
      severity: AlertSeverity;
      description: string;
    }>;
  };
  
  // Cache performance
  cache: {
    hitRate: number;
    missRate: number;
    totalHits: number;
    totalMisses: number;
    evictions: number;
    
    topCachedEndpoints: Array<{
      endpointId: string;
      path: string;
      hitRate: number;
      hits: number;
      misses: number;
    }>;
  };
  
  // Geographic distribution
  geography?: {
    requestsByCountry: Array<{
      country: string;
      requests: number;
      percentage: number;
    }>;
    
    responseTimeByRegion: Array<{
      region: string;
      averageResponseTime: number;
      requests: number;
    }>;
  };
  
  // Generated at
  generatedAt: Date;
}

export interface ServiceTopology {
  // Services in the topology
  services: Array<{
    id: string;
    name: string;
    type: ServiceType;
    status: ServiceStatus;
    position: {
      x: number;
      y: number;
    };
    metadata: {
      version: string;
      replicas: number;
      cpu: number;
      memory: number;
    };
  }>;
  
  // Connections between services
  connections: Array<{
    id: string;
    source: string; // service ID
    target: string; // service ID
    type: 'http' | 'grpc' | 'message_queue' | 'database' | 'cache';
    protocol: string;
    
    // Traffic metrics
    requestsPerSecond: number;
    averageLatency: number;
    errorRate: number;
    
    // Connection health
    health: 'healthy' | 'degraded' | 'unhealthy';
    
    // Security
    encrypted: boolean;
    authenticated: boolean;
  }>;
  
  // External dependencies
  externalDependencies: Array<{
    id: string;
    name: string;
    type: 'database' | 'cache' | 'message_queue' | 'external_api' | 'storage';
    url: string;
    status: ServiceStatus;
    connectedServices: string[];
  }>;
  
  // Generated at
  generatedAt: Date;
  
  // Metadata
  metadata: {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    totalConnections: number;
    criticalPath?: string[]; // service IDs in critical path
  };
}

export interface APIGatewayConfig {
  // Gateway settings
  gateway: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    
    // Network
    host: string;
    port: number;
    protocol: 'http' | 'https';
    
    // Performance
    maxConnections: number;
    connectionTimeout: number;
    requestTimeout: number;
    keepAliveTimeout: number;
    
    // Security
    enableCORS: boolean;
    enableCSRF: boolean;
    enableRateLimit: boolean;
    enableAuthentication: boolean;
  };
  
  // Default policies
  defaultPolicies: {
    authentication: AuthenticationType;
    rateLimit: {
      requestsPerMinute: number;
      burstLimit: number;
    };
    caching: {
      defaultTtl: number;
      enabled: boolean;
    };
    timeout: {
      request: number;
      response: number;
    };
  };
  
  // Monitoring
  monitoring: {
    metricsEnabled: boolean;
    loggingEnabled: boolean;
    tracingEnabled: boolean;
    
    // Retention policies
    logsRetentionDays: number;
    metricsRetentionDays: number;
    tracesRetentionDays: number;
  };
  
  // Integration settings
  integrations: {
    serviceDiscovery: {
      type: ServiceDiscoveryType;
      config: Record<string, any>;
    };
    
    messageQueue: {
      enabled: boolean;
      type: 'rabbitmq' | 'kafka' | 'redis' | 'aws_sqs';
      config: Record<string, any>;
    };
    
    database: {
      type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
      config: Record<string, any>;
    };
  };
  
  // Feature flags
  features: {
    enableCircuitBreaker: boolean;
    enableRetry: boolean;
    enableLoadBalancing: boolean;
    enableHealthChecks: boolean;
    enableMetrics: boolean;
    enableTracing: boolean;
    enableCaching: boolean;
  };
}

export interface APIGatewayStats {
  // General statistics
  overview: {
    totalEndpoints: number;
    activeEndpoints: number;
    totalServices: number;
    healthyServices: number;
    totalRequests: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  
  // Performance metrics
  performance: {
    throughput: {
      current: number;
      peak: number;
      average: number;
    };
    
    latency: {
      p50: number;
      p95: number;
      p99: number;
      max: number;
    };
    
    errors: {
      total: number;
      rate: number;
      byStatusCode: Record<number, number>;
    };
  };
  
  // Resource usage
  resources: {
    cpu: {
      current: number;
      average: number;
      peak: number;
    };
    
    memory: {
      current: number;
      average: number;
      peak: number;
    };
    
    network: {
      inbound: number;
      outbound: number;
    };
  };
  
  // Service health
  serviceHealth: Array<{
    serviceId: string;
    serviceName: string;
    status: ServiceStatus;
    responseTime: number;
    errorRate: number;
    uptime: number;
  }>;
  
  // Rate limiting
  rateLimiting: {
    totalRequests: number;
    blockedRequests: number;
    blockRate: number;
    topBlockedIPs: Array<{
      ip: string;
      blockedRequests: number;
    }>;
  };
  
  // Caching
  caching: {
    hitRate: number;
    missRate: number;
    totalHits: number;
    totalMisses: number;
    cacheSize: number;
    evictions: number;
  };
  
  // Security
  security: {
    authenticationFailures: number;
    authorizationFailures: number;
    suspiciousActivities: number;
    blockedIPs: number;
  };
  
  // Generated at
  generatedAt: Date;
  period: string;
}
