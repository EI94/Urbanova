// Service per la gestione di Advanced API Gateway & Microservices Architecture
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
  APIGatewayConfig,
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
  ServiceDiscoveryType,
} from '@/types/apigateway';
import { TeamRole } from '@/types/team';

export class APIGatewayService {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private microservices: Map<string, Microservice> = new Map();
  private gateways: Map<string, APIGateway> = new Map();
  private serviceMeshes: Map<string, ServiceMesh> = new Map();
  private requests: Map<string, APIRequest> = new Map();
  private alerts: Map<string, ServiceAlert> = new Map();
  private deployments: Map<string, ServiceDeployment> = new Map();
  private config: APIGatewayConfig;

  constructor() {
    this.initializeConfig();
    this.initializeGateways();
    this.initializeMicroservices();
    this.initializeEndpoints();
    this.initializeServiceMesh();
    this.initializeAlerts();
    this.simulateAPIData();
    this.startDataGeneration();
  }

  // Inizializza configurazione
  private initializeConfig() {
    this.config = {
      gateway: {
        name: 'Urbanova API Gateway',
        version: '1.0.0',
        environment: 'production',
        host: '0.0.0.0',
        port: 8080,
        protocol: 'https',
        maxConnections: 10000,
        connectionTimeout: 30000,
        requestTimeout: 60000,
        keepAliveTimeout: 5000,
        enableCORS: true,
        enableCSRF: true,
        enableRateLimit: true,
        enableAuthentication: true,
      },
      defaultPolicies: {
        authentication: 'bearer_token',
        rateLimit: {
          requestsPerMinute: 1000,
          burstLimit: 2000,
        },
        caching: {
          defaultTtl: 300,
          enabled: true,
        },
        timeout: {
          request: 30000,
          response: 60000,
        },
      },
      monitoring: {
        metricsEnabled: true,
        loggingEnabled: true,
        tracingEnabled: true,
        logsRetentionDays: 30,
        metricsRetentionDays: 90,
        tracesRetentionDays: 7,
      },
      integrations: {
        serviceDiscovery: {
          type: 'kubernetes',
          config: {
            namespace: 'urbanova',
            labelSelector: 'app.urbanova.io/managed-by=gateway',
          },
        },
        messageQueue: {
          enabled: true,
          type: 'rabbitmq',
          config: {
            host: 'rabbitmq.urbanova.svc.cluster.local',
            port: 5672,
            vhost: '/urbanova',
          },
        },
        database: {
          type: 'postgresql',
          config: {
            host: 'postgres.urbanova.svc.cluster.local',
            port: 5432,
            database: 'urbanova_gateway',
          },
        },
      },
      features: {
        enableCircuitBreaker: true,
        enableRetry: true,
        enableLoadBalancing: true,
        enableHealthChecks: true,
        enableMetrics: true,
        enableTracing: true,
        enableCaching: true,
      },
    };
  }

  // Inizializza gateway predefiniti
  private initializeGateways() {
    const gateways: APIGateway[] = [
      {
        id: 'main-gateway',
        name: 'Urbanova Main Gateway',
        description: 'Primary API Gateway for Urbanova platform',
        host: 'api.urbanova.com',
        port: 443,
        protocol: 'https',
        domain: 'api.urbanova.com',
        ssl: {
          enabled: true,
          certificateId: 'urbanova-ssl-cert',
          tlsVersion: 'TLSv1.3',
          cipherSuites: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
          hsts: true,
        },
        globalAuth: {
          enabled: true,
          type: 'bearer_token',
          config: {
            issuer: 'https://auth.urbanova.com',
            audience: 'urbanova-api',
          },
          excludedPaths: ['/health', '/metrics', '/docs'],
        },
        globalRateLimit: {
          enabled: true,
          requestsPerMinute: 10000,
          burstLimit: 20000,
          keyGenerator: 'ip',
        },
        cors: {
          enabled: true,
          allowedOrigins: ['https://app.urbanova.com', 'https://dashboard.urbanova.com'],
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
          exposedHeaders: ['X-RateLimit-Remaining', 'X-Response-Time'],
          credentials: true,
          maxAge: 86400,
        },
        middleware: [
          {
            id: 'request-id',
            name: 'Request ID Generator',
            type: 'request',
            order: 1,
            config: { headerName: 'X-Request-ID' },
            enabled: true,
          },
          {
            id: 'auth',
            name: 'Authentication',
            type: 'request',
            order: 2,
            config: { skipPaths: ['/health', '/metrics'] },
            enabled: true,
          },
          {
            id: 'rate-limit',
            name: 'Rate Limiting',
            type: 'request',
            order: 3,
            config: { redis: 'redis://redis:6379' },
            enabled: true,
          },
          {
            id: 'response-time',
            name: 'Response Time Header',
            type: 'response',
            order: 1,
            config: { headerName: 'X-Response-Time' },
            enabled: true,
          },
        ],
        serviceDiscovery: {
          type: 'kubernetes',
          config: {
            namespace: 'urbanova',
            resyncPeriod: 30,
          },
          healthCheckInterval: 10,
          unhealthyThreshold: 3,
        },
        loadBalancing: {
          strategy: 'round_robin',
          healthCheckEnabled: true,
          sessionAffinity: false,
        },
        caching: {
          enabled: true,
          defaultTtl: 300,
          maxCacheSize: '1GB',
          compressionEnabled: true,
        },
        logging: {
          level: 'info',
          format: 'json',
          destinations: [
            {
              type: 'elasticsearch',
              config: {
                host: 'elasticsearch.logging.svc.cluster.local',
                index: 'urbanova-gateway-logs',
              },
            },
          ],
        },
        metrics: {
          enabled: true,
          collectors: ['prometheus', 'statsd'],
          exporters: [
            {
              type: 'prometheus',
              config: {
                endpoint: '/metrics',
                port: 9090,
              },
            },
          ],
        },
        security: {
          ddosProtection: true,
          requestSizeLimit: '10MB',
          headerSizeLimit: '8KB',
        },
        status: 'healthy',
        version: '1.2.3',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        performanceMetrics: {
          totalRequests: 2500000,
          successfulRequests: 2375000,
          failedRequests: 125000,
          averageResponseTime: 85,
          throughput: 1250,
          errorRate: 5.0,
          uptime: 99.9,
          cpuUsage: 45,
          memoryUsage: 62,
          networkIO: {
            inbound: 125000000,
            outbound: 890000000,
          },
          cacheHitRate: 78.5,
          cacheMissRate: 21.5,
          cacheEvictions: 1250,
        },
      },
    ];

    gateways.forEach(gateway => {
      this.gateways.set(gateway.id, gateway);
    });
  }

  // Inizializza microservizi predefiniti
  private initializeMicroservices() {
    const microservices: Microservice[] = [
      {
        id: 'land-scraping-service',
        name: 'Land Scraping Service',
        description: 'Microservice for real estate data scraping and processing',
        type: 'api',
        version: '2.1.0',
        environment: 'production',
        namespace: 'urbanova',
        host: 'land-scraping.urbanova.svc.cluster.local',
        port: 8080,
        protocol: 'http',
        basePath: '/api/v2',
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
          minInstances: 2,
          maxInstances: 10,
          currentInstances: 4,
          targetCPU: 70,
          targetMemory: 80,
          scaleUpCooldown: 300,
          scaleDownCooldown: 600,
        },
        resources: {
          cpu: {
            requests: '200m',
            limits: '1000m',
          },
          memory: {
            requests: '256Mi',
            limits: '1Gi',
          },
        },
        dependencies: [
          {
            serviceId: 'database-service',
            serviceName: 'PostgreSQL Database',
            type: 'required',
            healthImpact: 'critical',
          },
          {
            serviceId: 'redis-cache',
            serviceName: 'Redis Cache',
            type: 'optional',
            healthImpact: 'degraded',
          },
        ],
        environmentVariables: {
          DATABASE_URL: {
            value: 'postgresql://user:pass@postgres:5432/urbanova',
            encrypted: true,
            source: 'secret',
          },
          REDIS_URL: {
            value: 'redis://redis:6379',
            encrypted: false,
            source: 'config',
          },
          LOG_LEVEL: {
            value: 'info',
            encrypted: false,
            source: 'config',
          },
        },
        loadBalancing: {
          strategy: 'round_robin',
          healthCheckPath: '/health',
          stickySession: false,
        },
        security: {
          networkPolicies: ['allow-ingress-gateway', 'allow-database'],
          serviceAccount: 'land-scraping-sa',
        },
        observability: {
          metricsEnabled: true,
          tracingEnabled: true,
          loggingEnabled: true,
          customDashboards: ['land-scraping-performance', 'data-quality'],
          alertRules: ['high-error-rate', 'low-success-rate'],
        },
        endpoints: ['search-properties', 'get-property-details', 'scrape-listings'],
        deployments: [
          {
            version: '2.1.0',
            strategy: 'rolling',
            deployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            deployedBy: 'ci-cd-system',
            status: 'completed',
          },
        ],
        metrics: {
          uptime: 99.8,
          responseTime: {
            average: 125,
            p50: 95,
            p95: 280,
            p99: 450,
          },
          throughput: 450,
          errorRate: 1.2,
          memoryUsage: 68,
          cpuUsage: 42,
          networkIO: {
            inbound: 25000000,
            outbound: 45000000,
          },
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        lastDeployedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastHealthCheckAt: new Date(Date.now() - 30 * 1000),
      },
      {
        id: 'user-management-service',
        name: 'User Management Service',
        description: 'Handles user authentication, authorization and profile management',
        type: 'api',
        version: '1.8.2',
        environment: 'production',
        namespace: 'urbanova',
        host: 'user-mgmt.urbanova.svc.cluster.local',
        port: 8080,
        protocol: 'http',
        basePath: '/api/v1',
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
          minInstances: 3,
          maxInstances: 15,
          currentInstances: 6,
          targetCPU: 60,
          targetMemory: 70,
          scaleUpCooldown: 180,
          scaleDownCooldown: 300,
        },
        resources: {
          cpu: {
            requests: '150m',
            limits: '800m',
          },
          memory: {
            requests: '128Mi',
            limits: '512Mi',
          },
        },
        dependencies: [
          {
            serviceId: 'database-service',
            serviceName: 'PostgreSQL Database',
            type: 'required',
            healthImpact: 'critical',
          },
          {
            serviceId: 'auth-service',
            serviceName: 'Authentication Service',
            type: 'required',
            healthImpact: 'critical',
          },
        ],
        environmentVariables: {
          JWT_SECRET: {
            value: 'super-secret-jwt-key',
            encrypted: true,
            source: 'secret',
          },
          SESSION_TIMEOUT: {
            value: '3600',
            encrypted: false,
            source: 'config',
          },
        },
        loadBalancing: {
          strategy: 'least_connections',
          healthCheckPath: '/health',
          stickySession: true,
        },
        security: {
          networkPolicies: ['allow-ingress-gateway', 'allow-auth-service'],
          serviceAccount: 'user-mgmt-sa',
        },
        observability: {
          metricsEnabled: true,
          tracingEnabled: true,
          loggingEnabled: true,
          customDashboards: ['user-activity', 'auth-metrics'],
          alertRules: ['auth-failures', 'session-anomalies'],
        },
        endpoints: ['user-login', 'user-register', 'user-profile', 'user-permissions'],
        deployments: [
          {
            version: '1.8.2',
            strategy: 'blue_green',
            deployedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            deployedBy: 'devops-team',
            status: 'completed',
          },
        ],
        metrics: {
          uptime: 99.95,
          responseTime: {
            average: 78,
            p50: 65,
            p95: 180,
            p99: 320,
          },
          throughput: 890,
          errorRate: 0.8,
          memoryUsage: 58,
          cpuUsage: 35,
          networkIO: {
            inbound: 18000000,
            outbound: 25000000,
          },
        },
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        lastDeployedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastHealthCheckAt: new Date(Date.now() - 25 * 1000),
      },
      {
        id: 'notification-service',
        name: 'Notification Service',
        description: 'Handles email, SMS and push notifications',
        type: 'worker',
        version: '1.3.1',
        environment: 'production',
        namespace: 'urbanova',
        host: 'notifications.urbanova.svc.cluster.local',
        port: 8080,
        protocol: 'http',
        status: 'healthy',
        healthCheck: {
          type: 'http',
          endpoint: '/health',
          interval: 45,
          timeout: 10,
          retries: 2,
          successThreshold: 1,
          failureThreshold: 2,
        },
        scaling: {
          minInstances: 2,
          maxInstances: 8,
          currentInstances: 3,
          targetCPU: 50,
          targetMemory: 60,
          scaleUpCooldown: 240,
          scaleDownCooldown: 480,
        },
        resources: {
          cpu: {
            requests: '100m',
            limits: '500m',
          },
          memory: {
            requests: '64Mi',
            limits: '256Mi',
          },
        },
        dependencies: [
          {
            serviceId: 'message-queue',
            serviceName: 'RabbitMQ',
            type: 'required',
            healthImpact: 'critical',
          },
          {
            serviceId: 'email-service',
            serviceName: 'SMTP Service',
            type: 'required',
            healthImpact: 'degraded',
          },
        ],
        environmentVariables: {
          SMTP_HOST: {
            value: 'smtp.urbanova.com',
            encrypted: false,
            source: 'config',
          },
          SMTP_PASSWORD: {
            value: 'encrypted-smtp-password',
            encrypted: true,
            source: 'secret',
          },
        },
        loadBalancing: {
          strategy: 'random',
          healthCheckPath: '/health',
          stickySession: false,
        },
        security: {
          networkPolicies: ['allow-message-queue'],
          serviceAccount: 'notification-sa',
        },
        observability: {
          metricsEnabled: true,
          tracingEnabled: false,
          loggingEnabled: true,
          customDashboards: ['notification-delivery'],
          alertRules: ['delivery-failures'],
        },
        endpoints: ['send-email', 'send-sms', 'send-push'],
        deployments: [
          {
            version: '1.3.1',
            strategy: 'rolling',
            deployedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            deployedBy: 'automated-deployment',
            status: 'completed',
          },
        ],
        metrics: {
          uptime: 99.7,
          responseTime: {
            average: 45,
            p50: 32,
            p95: 120,
            p99: 250,
          },
          throughput: 234,
          errorRate: 2.1,
          memoryUsage: 42,
          cpuUsage: 28,
          networkIO: {
            inbound: 5000000,
            outbound: 12000000,
          },
        },
        createdAt: new Date('2023-11-15'),
        updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        lastDeployedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastHealthCheckAt: new Date(Date.now() - 40 * 1000),
      },
    ];

    microservices.forEach(service => {
      this.microservices.set(service.id, service);
    });
  }

  // Inizializza endpoint predefiniti
  private initializeEndpoints() {
    const endpoints: APIEndpoint[] = [
      {
        id: 'search-properties',
        path: '/api/v2/properties/search',
        method: 'GET',
        name: 'Search Properties',
        description: 'Search real estate properties with advanced filters',
        serviceId: 'land-scraping-service',
        serviceName: 'Land Scraping Service',
        targetUrl: 'http://land-scraping.urbanova.svc.cluster.local:8080/api/v2/properties/search',
        authentication: {
          type: 'bearer_token',
          required: true,
          scopes: ['read:properties'],
          roles: ['user', 'admin'],
        },
        rateLimiting: {
          enabled: true,
          type: 'requests_per_minute',
          limit: 100,
          windowSize: 60,
          burstLimit: 150,
          keyGenerator: 'user',
        },
        caching: {
          enabled: true,
          strategy: 'redis',
          ttl: 300,
          varyBy: ['query', 'location', 'filters'],
        },
        transformation: {
          requestHeaders: {
            'X-Service': 'land-scraping',
          },
          responseHeaders: {
            'X-Cache-Status': 'HIT',
          },
        },
        validation: {
          validateRequest: true,
          validateResponse: true,
        },
        monitoring: {
          enabled: true,
          logRequests: true,
          logResponses: false,
          trackMetrics: true,
          customMetrics: ['search_queries', 'result_count'],
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
          backoffMultiplier: 2,
          maxDelay: 30,
          retryableStatusCodes: [500, 502, 503, 504],
        },
        documentation: {
          summary: 'Search for real estate properties',
          description:
            'Allows searching for properties with various filters like location, price range, property type, etc.',
          tags: ['properties', 'search'],
          examples: [
            {
              name: 'Basic search',
              request: {
                location: 'Milan',
                minPrice: 200000,
                maxPrice: 500000,
              },
              response: {
                results: [],
                totalCount: 0,
                page: 1,
              },
            },
          ],
        },
        isActive: true,
        version: '2.1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastAccessedAt: new Date(Date.now() - 5 * 60 * 1000),
        metrics: {
          totalRequests: 125000,
          successfulRequests: 118750,
          failedRequests: 6250,
          averageResponseTime: 145,
          p95ResponseTime: 320,
          p99ResponseTime: 580,
          errorRate: 5.0,
          throughput: 125,
        },
      },
      {
        id: 'user-login',
        path: '/api/v1/auth/login',
        method: 'POST',
        name: 'User Login',
        description: 'Authenticate user and return JWT token',
        serviceId: 'user-management-service',
        serviceName: 'User Management Service',
        targetUrl: 'http://user-mgmt.urbanova.svc.cluster.local:8080/api/v1/auth/login',
        authentication: {
          type: 'none',
          required: false,
        },
        rateLimiting: {
          enabled: true,
          type: 'requests_per_minute',
          limit: 20,
          windowSize: 60,
          burstLimit: 30,
          keyGenerator: 'ip',
        },
        caching: {
          enabled: false,
          strategy: 'none',
          ttl: 0,
        },
        transformation: {
          requestHeaders: {
            'X-Login-Attempt': 'true',
          },
        },
        validation: {
          validateRequest: true,
          validateResponse: true,
        },
        monitoring: {
          enabled: true,
          logRequests: true,
          logResponses: false,
          trackMetrics: true,
          customMetrics: ['login_attempts', 'failed_logins'],
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 20,
          recoveryTimeout: 120,
          state: 'closed',
        },
        retryPolicy: {
          enabled: false,
          maxAttempts: 1,
          strategy: 'immediate',
        },
        documentation: {
          summary: 'User authentication endpoint',
          description:
            'Authenticates user credentials and returns a JWT token for subsequent API calls',
          tags: ['auth', 'login'],
          examples: [
            {
              name: 'Successful login',
              request: {
                email: 'user@example.com',
                password: 'password123',
              },
              response: {
                token: 'jwt-token-here',
                user: {
                  id: '123',
                  email: 'user@example.com',
                },
              },
            },
          ],
        },
        isActive: true,
        version: '1.8.2',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        lastAccessedAt: new Date(Date.now() - 2 * 60 * 1000),
        metrics: {
          totalRequests: 89000,
          successfulRequests: 79560,
          failedRequests: 9440,
          averageResponseTime: 95,
          p95ResponseTime: 220,
          p99ResponseTime: 380,
          errorRate: 10.6,
          throughput: 89,
        },
      },
      {
        id: 'send-notification',
        path: '/api/v1/notifications/send',
        method: 'POST',
        name: 'Send Notification',
        description: 'Send email, SMS or push notification',
        serviceId: 'notification-service',
        serviceName: 'Notification Service',
        targetUrl: 'http://notifications.urbanova.svc.cluster.local:8080/api/v1/notifications/send',
        authentication: {
          type: 'api_key',
          required: true,
          scopes: ['write:notifications'],
        },
        rateLimiting: {
          enabled: true,
          type: 'requests_per_minute',
          limit: 1000,
          windowSize: 60,
          burstLimit: 1500,
          keyGenerator: 'api_key',
        },
        caching: {
          enabled: false,
          strategy: 'none',
          ttl: 0,
        },
        transformation: {},
        validation: {
          validateRequest: true,
          validateResponse: false,
        },
        monitoring: {
          enabled: true,
          logRequests: true,
          logResponses: true,
          trackMetrics: true,
          customMetrics: ['notifications_sent', 'delivery_rate'],
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 15,
          recoveryTimeout: 90,
          state: 'closed',
        },
        retryPolicy: {
          enabled: true,
          maxAttempts: 5,
          strategy: 'exponential_backoff',
          backoffMultiplier: 1.5,
          maxDelay: 60,
          retryableStatusCodes: [500, 502, 503],
        },
        documentation: {
          summary: 'Send notifications to users',
          description:
            'Sends various types of notifications including email, SMS and push notifications',
          tags: ['notifications', 'messaging'],
          examples: [
            {
              name: 'Send email notification',
              request: {
                type: 'email',
                recipient: 'user@example.com',
                subject: 'Welcome to Urbanova',
                body: 'Welcome message here',
              },
              response: {
                id: 'notification-123',
                status: 'sent',
              },
            },
          ],
        },
        isActive: true,
        version: '1.3.1',
        createdAt: new Date('2023-11-15'),
        updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        lastAccessedAt: new Date(Date.now() - 15 * 60 * 1000),
        metrics: {
          totalRequests: 45000,
          successfulRequests: 44100,
          failedRequests: 900,
          averageResponseTime: 65,
          p95ResponseTime: 150,
          p99ResponseTime: 280,
          errorRate: 2.0,
          throughput: 45,
        },
      },
    ];

    endpoints.forEach(endpoint => {
      this.endpoints.set(endpoint.id, endpoint);
    });
  }

  // Inizializza service mesh
  private initializeServiceMesh() {
    const serviceMesh: ServiceMesh = {
      id: 'urbanova-mesh',
      name: 'Urbanova Service Mesh',
      description: 'Service mesh for Urbanova microservices communication',
      services: ['land-scraping-service', 'user-management-service', 'notification-service'],
      trafficPolicies: [
        {
          id: 'canary-deployment',
          name: 'Canary Deployment Policy',
          sourceService: 'main-gateway',
          destinationService: 'land-scraping-service',
          rules: [
            {
              match: {
                headers: { 'x-canary': 'true' },
              },
              route: {
                destination: 'land-scraping-service-canary',
                weight: 10,
                timeout: 30000,
              },
            },
            {
              match: {},
              route: {
                destination: 'land-scraping-service',
                weight: 90,
                timeout: 30000,
              },
            },
          ],
        },
      ],
      securityPolicies: [
        {
          id: 'default-deny',
          name: 'Default Deny Policy',
          type: 'authorization',
          rules: [
            {
              action: 'deny',
              conditions: { 'source.namespace': 'external' },
            },
            {
              action: 'allow',
              source: 'urbanova/*',
              destination: 'urbanova/*',
            },
          ],
        },
      ],
      observability: {
        distributedTracing: {
          enabled: true,
          samplingRate: 10,
          jaegerEndpoint: 'http://jaeger-collector:14268/api/traces',
        },
        metricsCollection: {
          enabled: true,
          prometheusEndpoint: 'http://prometheus:9090',
          customMetrics: ['request_duration', 'request_size', 'response_size'],
        },
        logging: {
          enabled: true,
          level: 'info',
          accessLogs: true,
        },
      },
      mtls: {
        enabled: true,
        mode: 'strict',
        certificateAuthority: 'urbanova-ca',
        certificateLifetime: 24,
      },
      circuitBreaker: {
        enabled: true,
        defaultFailureThreshold: 10,
        defaultRecoveryTime: 30,
        customRules: [
          {
            service: 'user-management-service',
            failureThreshold: 5,
            recoveryTime: 60,
          },
        ],
      },
      status: 'healthy',
      version: '1.0.0',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    };

    this.serviceMeshes.set(serviceMesh.id, serviceMesh);
  }

  // Inizializza alert predefiniti
  private initializeAlerts() {
    const alerts: ServiceAlert[] = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate Alert',
        description: 'Triggers when error rate exceeds threshold',
        type: 'metric',
        severity: 'high',
        conditions: [
          {
            metric: 'error_rate',
            operator: 'gt',
            threshold: 5.0,
            duration: 300,
          },
        ],
        services: ['land-scraping-service', 'user-management-service'],
        notifications: [
          {
            type: 'email',
            config: {
              recipients: ['devops@urbanova.com', 'alerts@urbanova.com'],
            },
            enabled: true,
          },
          {
            type: 'slack',
            config: {
              channel: '#alerts',
              webhook: 'https://hooks.slack.com/services/...',
            },
            enabled: true,
          },
        ],
        state: 'ok',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        history: [],
      },
      {
        id: 'service-down',
        name: 'Service Down Alert',
        description: 'Triggers when service becomes unhealthy',
        type: 'health_check',
        severity: 'critical',
        conditions: [
          {
            metric: 'health_status',
            operator: 'eq',
            threshold: 0,
            duration: 60,
          },
        ],
        services: ['land-scraping-service', 'user-management-service', 'notification-service'],
        notifications: [
          {
            type: 'pagerduty',
            config: {
              serviceKey: 'urbanova-service-key',
            },
            enabled: true,
          },
        ],
        state: 'ok',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        history: [],
      },
    ];

    alerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });
  }

  // Simula dati API per demo
  private simulateAPIData() {
    // Simula richieste API
    this.generateRequests(100);

    // Simula deployment
    const deployment: ServiceDeployment = {
      id: 'deploy-001',
      serviceId: 'land-scraping-service',
      serviceName: 'Land Scraping Service',
      version: '2.1.1',
      strategy: 'rolling',
      replicas: 4,
      image: 'urbanova/land-scraping',
      tag: 'v2.1.1',
      environment: 'production',
      namespace: 'urbanova',
      resources: {
        cpu: '500m',
        memory: '1Gi',
      },
      healthChecks: [
        {
          type: 'http',
          path: '/health',
          port: 8080,
          interval: 30,
          timeout: 5,
          successThreshold: 1,
          failureThreshold: 3,
        },
      ],
      status: 'in_progress',
      progress: {
        total: 4,
        completed: 2,
        failed: 0,
        percentage: 50,
      },
      startedAt: new Date(Date.now() - 5 * 60 * 1000),
      deployedBy: 'ci-cd-pipeline',
      canRollback: true,
      rollbackVersion: '2.1.0',
      logs: [
        {
          timestamp: new Date(Date.now() - 4 * 60 * 1000),
          level: 'info',
          message: 'Starting deployment of version 2.1.1',
          source: 'deployment-controller',
        },
        {
          timestamp: new Date(Date.now() - 3 * 60 * 1000),
          level: 'info',
          message: 'Scaling up new pods',
          source: 'deployment-controller',
        },
        {
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          level: 'info',
          message: '2/4 pods ready',
          source: 'deployment-controller',
        },
      ],
      deploymentMetrics: {
        duration: 300,
        successRate: 98.5,
        errorCount: 2,
        rollbackCount: 0,
      },
    };

    this.deployments.set(deployment.id, deployment);
  }

  // Genera richieste simulate
  private generateRequests(count: number) {
    const endpoints = Array.from(this.endpoints.values());
    const methods: RequestMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
    const statusCodes = [200, 201, 400, 401, 403, 404, 500, 502, 503];

    for (let i = 0; i < count; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const isError = Math.random() < 0.1; // 10% error rate

      const request: APIRequest = {
        id: `req-${Date.now()}-${i}`,
        method: endpoint.method,
        path: endpoint.path,
        fullUrl: `https://api.urbanova.com${endpoint.path}?query=example`,
        headers: {
          'User-Agent': 'Urbanova-Client/1.0',
          Authorization: 'Bearer jwt-token-here',
          'Content-Type': 'application/json',
        },
        queryParams: {
          query: 'example',
          limit: '10',
        },
        clientIP: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Urbanova-Client/1.0',
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        endpointId: endpoint.id,
        serviceId: endpoint.serviceId,
        gatewayId: 'main-gateway',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        responseTime: Math.floor(Math.random() * 500) + 50,
        statusCode: isError
          ? statusCodes[Math.floor(Math.random() * 3) + 6]
          : statusCodes[Math.floor(Math.random() * 2)],
        responseSize: Math.floor(Math.random() * 10000) + 1000,
        responseHeaders: {
          'Content-Type': 'application/json',
          'X-Response-Time': `${Math.floor(Math.random() * 500) + 50}ms`,
        },
        authentication: {
          type: endpoint.authentication.type,
          successful: !isError || Math.random() > 0.5,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          scopes: endpoint.authentication.scopes,
        },
        rateLimitInfo: {
          limit: endpoint.rateLimiting.limit,
          remaining: Math.floor(Math.random() * endpoint.rateLimiting.limit),
          resetTime: new Date(Date.now() + 60 * 1000),
          exceeded: Math.random() < 0.02,
        },
        cacheInfo: {
          hit: Math.random() < 0.7,
          key: `cache-${endpoint.id}-${Math.random().toString(36).substr(2, 9)}`,
          ttl: endpoint.caching.ttl,
        },
        circuitBreakerInfo: {
          state: endpoint.circuitBreaker.state,
          failureCount: Math.floor(Math.random() * 5),
          lastFailureAt: isError
            ? new Date(Date.now() - Math.random() * 60 * 60 * 1000)
            : undefined,
        },
      };

      if (isError) {
        request.error = {
          message: 'Internal Server Error',
          code: 'INTERNAL_ERROR',
          stack: 'Error stack trace here...',
        };
      }

      this.requests.set(request.id, request);
    }
  }

  // Avvia generazione dati in tempo reale
  private startDataGeneration() {
    // Simula nuove richieste ogni 5 secondi
    setInterval(() => {
      this.generateRequests(5);
      this.updateServiceMetrics();
    }, 5000);

    // Aggiorna metriche servizi ogni 30 secondi
    setInterval(() => {
      this.updateServiceHealth();
    }, 30000);

    // Simula deployment ogni 10 minuti
    setInterval(() => {
      this.simulateDeployment();
    }, 600000);
  }

  // Aggiorna metriche servizi
  private updateServiceMetrics() {
    this.microservices.forEach(service => {
      // Simula variazioni nelle metriche
      service.metrics.cpuUsage += (Math.random() - 0.5) * 10;
      service.metrics.cpuUsage = Math.max(0, Math.min(100, service.metrics.cpuUsage));

      service.metrics.memoryUsage += (Math.random() - 0.5) * 5;
      service.metrics.memoryUsage = Math.max(0, Math.min(100, service.metrics.memoryUsage));

      service.metrics.responseTime.average += (Math.random() - 0.5) * 20;
      service.metrics.responseTime.average = Math.max(10, service.metrics.responseTime.average);

      service.metrics.errorRate += (Math.random() - 0.5) * 2;
      service.metrics.errorRate = Math.max(0, Math.min(50, service.metrics.errorRate));

      service.lastHealthCheckAt = new Date();
    });
  }

  // Aggiorna stato salute servizi
  private updateServiceHealth() {
    this.microservices.forEach(service => {
      // Simula cambio stato occasionale
      if (Math.random() < 0.05) {
        // 5% chance
        const statuses: ServiceStatus[] = ['healthy', 'degraded', 'unhealthy'];
        service.status = statuses[Math.floor(Math.random() * statuses.length)];
      }
    });
  }

  // Simula deployment
  private simulateDeployment() {
    const services = Array.from(this.microservices.values());
    const service = services[Math.floor(Math.random() * services.length)];

    const deployment: ServiceDeployment = {
      id: `deploy-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      version: `${service.version}.${Math.floor(Math.random() * 10)}`,
      strategy: ['rolling', 'blue_green', 'canary'][
        Math.floor(Math.random() * 3)
      ] as DeploymentStrategy,
      replicas: service.scaling.currentInstances,
      image: `urbanova/${service.name.toLowerCase().replace(/\s+/g, '-')}`,
      tag: `v${service.version}`,
      environment: service.environment,
      namespace: service.namespace,
      resources: {
        cpu: service.resources.cpu.limits,
        memory: service.resources.memory.limits,
      },
      healthChecks: [service.healthCheck],
      status: 'pending',
      progress: {
        total: service.scaling.currentInstances,
        completed: 0,
        failed: 0,
        percentage: 0,
      },
      startedAt: new Date(),
      deployedBy: 'automated-system',
      canRollback: true,
      rollbackVersion: service.version,
      logs: [
        {
          timestamp: new Date(),
          level: 'info',
          message: `Starting deployment of ${service.name} version ${service.version}`,
          source: 'deployment-controller',
        },
      ],
      deploymentMetrics: {
        duration: 0,
        successRate: 100,
        errorCount: 0,
        rollbackCount: 0,
      },
    };

    this.deployments.set(deployment.id, deployment);
  }

  // API pubbliche del service

  // Crea endpoint
  createEndpoint(
    endpoint: Omit<APIEndpoint, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>
  ): APIEndpoint {
    const newEndpoint: APIEndpoint = {
      ...endpoint,
      id: `endpoint-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        throughput: 0,
      },
    };

    this.endpoints.set(newEndpoint.id, newEndpoint);
    return newEndpoint;
  }

  // Aggiorna endpoint
  updateEndpoint(id: string, updates: Partial<APIEndpoint>): APIEndpoint | null {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return null;

    const updatedEndpoint = {
      ...endpoint,
      ...updates,
      updatedAt: new Date(),
    };

    this.endpoints.set(id, updatedEndpoint);
    return updatedEndpoint;
  }

  // Elimina endpoint
  deleteEndpoint(id: string): boolean {
    return this.endpoints.delete(id);
  }

  // Crea microservizio
  createMicroservice(
    service: Omit<Microservice, 'id' | 'createdAt' | 'updatedAt' | 'metrics' | 'deployments'>
  ): Microservice {
    const newService: Microservice = {
      ...service,
      id: `service-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastDeployedAt: new Date(),
      lastHealthCheckAt: new Date(),
      metrics: {
        uptime: 100,
        responseTime: {
          average: 100,
          p50: 80,
          p95: 200,
          p99: 400,
        },
        throughput: 0,
        errorRate: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkIO: {
          inbound: 0,
          outbound: 0,
        },
      },
      deployments: [],
    };

    this.microservices.set(newService.id, newService);
    return newService;
  }

  // Aggiorna microservizio
  updateMicroservice(id: string, updates: Partial<Microservice>): Microservice | null {
    const service = this.microservices.get(id);
    if (!service) return null;

    const updatedService = {
      ...service,
      ...updates,
      updatedAt: new Date(),
    };

    this.microservices.set(id, updatedService);
    return updatedService;
  }

  // Deploy microservizio
  deployMicroservice(
    serviceId: string,
    version: string,
    strategy: DeploymentStrategy = 'rolling'
  ): ServiceDeployment | null {
    const service = this.microservices.get(serviceId);
    if (!service) return null;

    const deployment: ServiceDeployment = {
      id: `deploy-${Date.now()}`,
      serviceId,
      serviceName: service.name,
      version,
      strategy,
      replicas: service.scaling.currentInstances,
      image: `urbanova/${service.name.toLowerCase().replace(/\s+/g, '-')}`,
      tag: `v${version}`,
      environment: service.environment,
      namespace: service.namespace,
      resources: {
        cpu: service.resources.cpu.limits,
        memory: service.resources.memory.limits,
      },
      healthChecks: [service.healthCheck],
      status: 'pending',
      progress: {
        total: service.scaling.currentInstances,
        completed: 0,
        failed: 0,
        percentage: 0,
      },
      startedAt: new Date(),
      deployedBy: 'manual-deployment',
      canRollback: true,
      rollbackVersion: service.version,
      logs: [
        {
          timestamp: new Date(),
          level: 'info',
          message: `Starting deployment of ${service.name} version ${version}`,
          source: 'deployment-controller',
        },
      ],
      deploymentMetrics: {
        duration: 0,
        successRate: 100,
        errorCount: 0,
        rollbackCount: 0,
      },
    };

    this.deployments.set(deployment.id, deployment);

    // Simula progresso deployment
    setTimeout(() => {
      deployment.status = 'in_progress';
      deployment.progress.percentage = 25;
      deployment.progress.completed = Math.floor(deployment.progress.total * 0.25);
    }, 2000);

    setTimeout(() => {
      deployment.status = 'completed';
      deployment.progress.percentage = 100;
      deployment.progress.completed = deployment.progress.total;
      deployment.completedAt = new Date();

      // Aggiorna versione servizio
      service.version = version;
      service.lastDeployedAt = new Date();
    }, 10000);

    return deployment;
  }

  // Scala microservizio
  scaleMicroservice(serviceId: string, replicas: number): boolean {
    const service = this.microservices.get(serviceId);
    if (!service) return false;

    service.scaling.currentInstances = Math.max(
      service.scaling.minInstances,
      Math.min(service.scaling.maxInstances, replicas)
    );
    service.updatedAt = new Date();

    return true;
  }

  // Crea alert
  createAlert(
    alert: Omit<ServiceAlert, 'id' | 'createdAt' | 'updatedAt' | 'history'>
  ): ServiceAlert {
    const newAlert: ServiceAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [],
    };

    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  // Aggiorna stato alert
  updateAlertStatus(id: string, state: 'ok' | 'warning' | 'critical' | 'unknown'): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    alert.state = state;
    alert.updatedAt = new Date();

    if (state !== 'ok') {
      alert.lastTriggeredAt = new Date();
    }

    alert.history.push({
      timestamp: new Date(),
      state: state === 'ok' ? 'resolved' : 'triggered',
      message: `Alert state changed to ${state}`,
    });

    return true;
  }

  // Genera analytics
  generateAPIAnalytics(timeRange?: { start: Date; end: Date }): APIAnalytics {
    const requests = Array.from(this.requests.values());
    const filteredRequests = timeRange
      ? requests.filter(r => r.timestamp >= timeRange.start && r.timestamp <= timeRange.end)
      : requests;

    const totalRequests = filteredRequests.length;
    const successfulRequests = filteredRequests.filter(r => r.statusCode < 400).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime =
      filteredRequests.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests || 0;

    return {
      timeRange: timeRange || {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
        granularity: 'hour',
      },
      overview: {
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        p95ResponseTime: this.calculatePercentile(
          filteredRequests.map(r => r.responseTime),
          95
        ),
        p99ResponseTime: this.calculatePercentile(
          filteredRequests.map(r => r.responseTime),
          99
        ),
        throughput: totalRequests / (24 * 60 * 60), // requests per second over 24h
        errorRate: (failedRequests / totalRequests) * 100 || 0,
        uniqueClients: new Set(filteredRequests.map(r => r.clientIP)).size,
      },
      traffic: {
        requestsOverTime: this.groupRequestsByTime(filteredRequests),
        topEndpoints: this.getTopEndpoints(filteredRequests),
        topClients: this.getTopClients(filteredRequests),
      },
      performance: {
        responseTimeDistribution: this.getResponseTimeDistribution(filteredRequests),
        slowestEndpoints: this.getSlowestEndpoints(filteredRequests),
        servicePerformance: this.getServicePerformance(filteredRequests),
      },
      errors: {
        errorsByStatusCode: this.getErrorsByStatusCode(filteredRequests),
        errorsByService: this.getErrorsByService(filteredRequests),
        topErrors: this.getTopErrors(filteredRequests),
      },
      security: {
        authenticationFailures: filteredRequests.filter(r => !r.authentication.successful).length,
        rateLimitExceeded: filteredRequests.filter(r => r.rateLimitInfo?.exceeded).length,
        suspiciousIPs: this.getSuspiciousIPs(filteredRequests),
        blockedRequests: filteredRequests.filter(r => r.statusCode === 429).length,
        attackPatterns: [],
      },
      cache: {
        hitRate: (filteredRequests.filter(r => r.cacheInfo?.hit).length / totalRequests) * 100 || 0,
        missRate:
          (filteredRequests.filter(r => r.cacheInfo && !r.cacheInfo.hit).length / totalRequests) *
            100 || 0,
        totalHits: filteredRequests.filter(r => r.cacheInfo?.hit).length,
        totalMisses: filteredRequests.filter(r => r.cacheInfo && !r.cacheInfo.hit).length,
        evictions: Math.floor(Math.random() * 100),
        topCachedEndpoints: this.getTopCachedEndpoints(filteredRequests),
      },
      generatedAt: new Date(),
    };
  }

  // Genera topologia servizi
  generateServiceTopology(): ServiceTopology {
    const services = Array.from(this.microservices.values());

    return {
      services: services.map((service, index) => ({
        id: service.id,
        name: service.name,
        type: service.type,
        status: service.status,
        position: {
          x: (index % 3) * 200 + 100,
          y: Math.floor(index / 3) * 150 + 100,
        },
        metadata: {
          version: service.version,
          replicas: service.scaling.currentInstances,
          cpu: service.metrics.cpuUsage,
          memory: service.metrics.memoryUsage,
        },
      })),
      connections: this.generateServiceConnections(),
      externalDependencies: [
        {
          id: 'postgres-db',
          name: 'PostgreSQL Database',
          type: 'database',
          url: 'postgres://postgres:5432/urbanova',
          status: 'healthy',
          connectedServices: ['land-scraping-service', 'user-management-service'],
        },
        {
          id: 'redis-cache',
          name: 'Redis Cache',
          type: 'cache',
          url: 'redis://redis:6379',
          status: 'healthy',
          connectedServices: ['land-scraping-service'],
        },
      ],
      generatedAt: new Date(),
      metadata: {
        totalServices: services.length,
        healthyServices: services.filter(s => s.status === 'healthy').length,
        unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
        totalConnections: services.length * 2, // Simplified
        criticalPath: ['main-gateway', 'land-scraping-service', 'postgres-db'],
      },
    };
  }

  // Genera statistiche gateway
  generateAPIGatewayStats(): APIGatewayStats {
    const requests = Array.from(this.requests.values());
    const services = Array.from(this.microservices.values());
    const endpoints = Array.from(this.endpoints.values());

    return {
      overview: {
        totalEndpoints: endpoints.length,
        activeEndpoints: endpoints.filter(e => e.isActive).length,
        totalServices: services.length,
        healthyServices: services.filter(s => s.status === 'healthy').length,
        totalRequests: requests.length,
        requestsPerSecond: requests.length / (24 * 60 * 60),
        averageResponseTime:
          requests.reduce((sum, r) => sum + r.responseTime, 0) / requests.length || 0,
        errorRate: (requests.filter(r => r.statusCode >= 400).length / requests.length) * 100 || 0,
        uptime: 99.9,
      },
      performance: {
        throughput: {
          current: 1250,
          peak: 2500,
          average: 1100,
        },
        latency: {
          p50: 85,
          p95: 250,
          p99: 450,
          max: 2000,
        },
        errors: {
          total: requests.filter(r => r.statusCode >= 400).length,
          rate: (requests.filter(r => r.statusCode >= 400).length / requests.length) * 100 || 0,
          byStatusCode: this.getErrorsByStatusCode(requests).reduce(
            (acc, item) => {
              acc[item.statusCode] = item.count;
              return acc;
            },
            {} as Record<number, number>
          ),
        },
      },
      resources: {
        cpu: {
          current: 45,
          average: 42,
          peak: 78,
        },
        memory: {
          current: 62,
          average: 58,
          peak: 85,
        },
        network: {
          inbound: 125000000,
          outbound: 890000000,
        },
      },
      serviceHealth: services.map(service => ({
        serviceId: service.id,
        serviceName: service.name,
        status: service.status,
        responseTime: service.metrics.responseTime.average,
        errorRate: service.metrics.errorRate,
        uptime: service.metrics.uptime,
      })),
      rateLimiting: {
        totalRequests: requests.length,
        blockedRequests: requests.filter(r => r.statusCode === 429).length,
        blockRate: (requests.filter(r => r.statusCode === 429).length / requests.length) * 100 || 0,
        topBlockedIPs: this.getTopBlockedIPs(requests),
      },
      caching: {
        hitRate: (requests.filter(r => r.cacheInfo?.hit).length / requests.length) * 100 || 0,
        missRate:
          (requests.filter(r => r.cacheInfo && !r.cacheInfo.hit).length / requests.length) * 100 ||
          0,
        totalHits: requests.filter(r => r.cacheInfo?.hit).length,
        totalMisses: requests.filter(r => r.cacheInfo && !r.cacheInfo.hit).length,
        cacheSize: 1024 * 1024 * 512, // 512MB
        evictions: Math.floor(Math.random() * 1000),
      },
      security: {
        authenticationFailures: requests.filter(r => !r.authentication.successful).length,
        authorizationFailures: requests.filter(r => r.statusCode === 403).length,
        suspiciousActivities: Math.floor(Math.random() * 50),
        blockedIPs: Math.floor(Math.random() * 25),
      },
      generatedAt: new Date(),
      period: '24h',
    };
  }

  // Metodi helper per analytics
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private groupRequestsByTime(requests: APIRequest[]) {
    // Simplified grouping by hour
    const groups: Record<string, { requests: number; errors: number }> = {};

    requests.forEach(request => {
      const hour = new Date(request.timestamp).toISOString().slice(0, 13);
      if (!groups[hour]) {
        groups[hour] = { requests: 0, errors: 0 };
      }
      groups[hour].requests++;
      if (request.statusCode >= 400) {
        groups[hour].errors++;
      }
    });

    return Object.entries(groups).map(([hour, data]) => ({
      timestamp: new Date(hour),
      requests: data.requests,
      errors: data.errors,
    }));
  }

  private getTopEndpoints(requests: APIRequest[]) {
    const endpointStats: Record<string, { requests: number; totalTime: number; errors: number }> =
      {};

    requests.forEach(request => {
      if (!endpointStats[request.endpointId]) {
        endpointStats[request.endpointId] = { requests: 0, totalTime: 0, errors: 0 };
      }
      endpointStats[request.endpointId].requests++;
      endpointStats[request.endpointId].totalTime += request.responseTime;
      if (request.statusCode >= 400) {
        endpointStats[request.endpointId].errors++;
      }
    });

    return Object.entries(endpointStats)
      .map(([endpointId, stats]) => ({
        endpointId,
        path: this.endpoints.get(endpointId)?.path || 'Unknown',
        requests: stats.requests,
        averageResponseTime: stats.totalTime / stats.requests,
        errorRate: (stats.errors / stats.requests) * 100,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
  }

  private getTopClients(requests: APIRequest[]) {
    const clientStats: Record<string, { requests: number; errors: number; userAgent: string }> = {};

    requests.forEach(request => {
      if (!clientStats[request.clientIP]) {
        clientStats[request.clientIP] = { requests: 0, errors: 0, userAgent: request.userAgent };
      }
      clientStats[request.clientIP].requests++;
      if (request.statusCode >= 400) {
        clientStats[request.clientIP].errors++;
      }
    });

    return Object.entries(clientStats)
      .map(([clientIP, stats]) => ({
        clientIP,
        userAgent: stats.userAgent,
        requests: stats.requests,
        errorRate: (stats.errors / stats.requests) * 100,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);
  }

  private getResponseTimeDistribution(requests: APIRequest[]) {
    const ranges = [
      { range: '0-50ms', min: 0, max: 50 },
      { range: '50-100ms', min: 50, max: 100 },
      { range: '100-200ms', min: 100, max: 200 },
      { range: '200-500ms', min: 200, max: 500 },
      { range: '500ms+', min: 500, max: Infinity },
    ];

    return ranges.map(range => {
      const count = requests.filter(
        r => r.responseTime >= range.min && r.responseTime < range.max
      ).length;
      return {
        range: range.range,
        count,
        percentage: (count / requests.length) * 100 || 0,
      };
    });
  }

  private getSlowestEndpoints(requests: APIRequest[]) {
    const endpointStats: Record<string, { totalTime: number; requests: number; times: number[] }> =
      {};

    requests.forEach(request => {
      if (!endpointStats[request.endpointId]) {
        endpointStats[request.endpointId] = { totalTime: 0, requests: 0, times: [] };
      }
      endpointStats[request.endpointId].totalTime += request.responseTime;
      endpointStats[request.endpointId].requests++;
      endpointStats[request.endpointId].times.push(request.responseTime);
    });

    return Object.entries(endpointStats)
      .map(([endpointId, stats]) => ({
        endpointId,
        path: this.endpoints.get(endpointId)?.path || 'Unknown',
        averageResponseTime: stats.totalTime / stats.requests,
        p95ResponseTime: this.calculatePercentile(stats.times, 95),
        requests: stats.requests,
      }))
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, 10);
  }

  private getServicePerformance(requests: APIRequest[]) {
    const serviceStats: Record<string, { totalTime: number; requests: number; errors: number }> =
      {};

    requests.forEach(request => {
      if (!serviceStats[request.serviceId]) {
        serviceStats[request.serviceId] = { totalTime: 0, requests: 0, errors: 0 };
      }
      serviceStats[request.serviceId].totalTime += request.responseTime;
      serviceStats[request.serviceId].requests++;
      if (request.statusCode >= 400) {
        serviceStats[request.serviceId].errors++;
      }
    });

    return Object.entries(serviceStats).map(([serviceId, stats]) => ({
      serviceId,
      serviceName: this.microservices.get(serviceId)?.name || 'Unknown',
      averageResponseTime: stats.totalTime / stats.requests,
      throughput: stats.requests / (24 * 60 * 60), // per second over 24h
      errorRate: (stats.errors / stats.requests) * 100,
    }));
  }

  private getErrorsByStatusCode(requests: APIRequest[]) {
    const statusCodes: Record<number, number> = {};

    requests
      .filter(r => r.statusCode >= 400)
      .forEach(request => {
        statusCodes[request.statusCode] = (statusCodes[request.statusCode] || 0) + 1;
      });

    const total = Object.values(statusCodes).reduce((sum, count) => sum + count, 0);

    return Object.entries(statusCodes)
      .map(([statusCode, count]) => ({
        statusCode: parseInt(statusCode),
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private getErrorsByService(requests: APIRequest[]) {
    const serviceStats: Record<string, { total: number; errors: number }> = {};

    requests.forEach(request => {
      if (!serviceStats[request.serviceId]) {
        serviceStats[request.serviceId] = { total: 0, errors: 0 };
      }
      serviceStats[request.serviceId].total++;
      if (request.statusCode >= 400) {
        serviceStats[request.serviceId].errors++;
      }
    });

    return Object.entries(serviceStats)
      .map(([serviceId, stats]) => ({
        serviceId,
        serviceName: this.microservices.get(serviceId)?.name || 'Unknown',
        errorCount: stats.errors,
        errorRate: (stats.errors / stats.total) * 100,
      }))
      .sort((a, b) => b.errorRate - a.errorRate);
  }

  private getTopErrors(requests: APIRequest[]) {
    const errorMessages: Record<
      string,
      { count: number; first: Date; last: Date; endpoints: Set<string> }
    > = {};

    requests
      .filter(r => r.error)
      .forEach(request => {
        const message = request.error!.message;
        if (!errorMessages[message]) {
          errorMessages[message] = {
            count: 0,
            first: request.timestamp,
            last: request.timestamp,
            endpoints: new Set(),
          };
        }
        errorMessages[message].count++;
        errorMessages[message].endpoints.add(request.endpointId);
        if (request.timestamp < errorMessages[message].first) {
          errorMessages[message].first = request.timestamp;
        }
        if (request.timestamp > errorMessages[message].last) {
          errorMessages[message].last = request.timestamp;
        }
      });

    return Object.entries(errorMessages)
      .map(([message, stats]) => ({
        message,
        count: stats.count,
        firstOccurrence: stats.first,
        lastOccurrence: stats.last,
        affectedEndpoints: Array.from(stats.endpoints),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getSuspiciousIPs(requests: APIRequest[]): string[] {
    const ipStats: Record<string, { requests: number; errors: number; rateLimitHits: number }> = {};

    requests.forEach(request => {
      if (!ipStats[request.clientIP]) {
        ipStats[request.clientIP] = { requests: 0, errors: 0, rateLimitHits: 0 };
      }
      ipStats[request.clientIP].requests++;
      if (request.statusCode >= 400) {
        ipStats[request.clientIP].errors++;
      }
      if (request.rateLimitInfo?.exceeded) {
        ipStats[request.clientIP].rateLimitHits++;
      }
    });

    return Object.entries(ipStats)
      .filter(
        ([ip, stats]) =>
          stats.errors > 50 || // High error count
          stats.rateLimitHits > 10 || // Frequent rate limiting
          stats.errors / stats.requests > 0.5 // High error rate
      )
      .map(([ip]) => ip)
      .slice(0, 10);
  }

  private getTopCachedEndpoints(requests: APIRequest[]) {
    const endpointStats: Record<string, { hits: number; misses: number }> = {};

    requests
      .filter(r => r.cacheInfo)
      .forEach(request => {
        if (!endpointStats[request.endpointId]) {
          endpointStats[request.endpointId] = { hits: 0, misses: 0 };
        }
        if (request.cacheInfo!.hit) {
          endpointStats[request.endpointId].hits++;
        } else {
          endpointStats[request.endpointId].misses++;
        }
      });

    return Object.entries(endpointStats)
      .map(([endpointId, stats]) => ({
        endpointId,
        path: this.endpoints.get(endpointId)?.path || 'Unknown',
        hitRate: (stats.hits / (stats.hits + stats.misses)) * 100,
        hits: stats.hits,
        misses: stats.misses,
      }))
      .sort((a, b) => b.hitRate - a.hitRate)
      .slice(0, 10);
  }

  private getTopBlockedIPs(requests: APIRequest[]) {
    const ipStats: Record<string, number> = {};

    requests
      .filter(r => r.statusCode === 429)
      .forEach(request => {
        ipStats[request.clientIP] = (ipStats[request.clientIP] || 0) + 1;
      });

    return Object.entries(ipStats)
      .map(([ip, blockedRequests]) => ({ ip, blockedRequests }))
      .sort((a, b) => b.blockedRequests - a.blockedRequests)
      .slice(0, 5);
  }

  private generateServiceConnections() {
    // Simplified service connections
    return [
      {
        id: 'gateway-to-land-scraping',
        source: 'main-gateway',
        target: 'land-scraping-service',
        type: 'http' as const,
        protocol: 'HTTP/1.1',
        requestsPerSecond: 125,
        averageLatency: 85,
        errorRate: 1.2,
        health: 'healthy' as const,
        encrypted: true,
        authenticated: true,
      },
      {
        id: 'gateway-to-user-mgmt',
        source: 'main-gateway',
        target: 'user-management-service',
        type: 'http' as const,
        protocol: 'HTTP/1.1',
        requestsPerSecond: 89,
        averageLatency: 65,
        errorRate: 0.8,
        health: 'healthy' as const,
        encrypted: true,
        authenticated: true,
      },
      {
        id: 'user-mgmt-to-notifications',
        source: 'user-management-service',
        target: 'notification-service',
        type: 'message_queue' as const,
        protocol: 'AMQP',
        requestsPerSecond: 45,
        averageLatency: 25,
        errorRate: 2.1,
        health: 'healthy' as const,
        encrypted: false,
        authenticated: true,
      },
    ];
  }

  // Getter pubblici
  getEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  getEndpoint(id: string): APIEndpoint | undefined {
    return this.endpoints.get(id);
  }

  getMicroservices(): Microservice[] {
    return Array.from(this.microservices.values());
  }

  getMicroservice(id: string): Microservice | undefined {
    return this.microservices.get(id);
  }

  getGateways(): APIGateway[] {
    return Array.from(this.gateways.values());
  }

  getGateway(id: string): APIGateway | undefined {
    return this.gateways.get(id);
  }

  getServiceMeshes(): ServiceMesh[] {
    return Array.from(this.serviceMeshes.values());
  }

  getServiceMesh(id: string): ServiceMesh | undefined {
    return this.serviceMeshes.get(id);
  }

  getRequests(): APIRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getAlerts(): ServiceAlert[] {
    return Array.from(this.alerts.values());
  }

  getAlert(id: string): ServiceAlert | undefined {
    return this.alerts.get(id);
  }

  getDeployments(): ServiceDeployment[] {
    return Array.from(this.deployments.values()).sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
    );
  }

  getDeployment(id: string): ServiceDeployment | undefined {
    return this.deployments.get(id);
  }

  getConfig(): APIGatewayConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<APIGatewayConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Ricerca requests
  searchRequests(
    query: string,
    filters?: {
      method?: RequestMethod;
      statusCode?: number;
      serviceId?: string;
      endpointId?: string;
      clientIP?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): APIRequest[] {
    let results = Array.from(this.requests.values());

    // Filtro per query testuale
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(
        req =>
          req.path.toLowerCase().includes(searchTerm) ||
          req.clientIP.includes(searchTerm) ||
          req.userAgent.toLowerCase().includes(searchTerm) ||
          req.userId?.includes(searchTerm)
      );
    }

    // Filtri aggiuntivi
    if (filters?.method) {
      results = results.filter(req => req.method === filters.method);
    }
    if (filters?.statusCode) {
      results = results.filter(req => req.statusCode === filters.statusCode);
    }
    if (filters?.serviceId) {
      results = results.filter(req => req.serviceId === filters.serviceId);
    }
    if (filters?.endpointId) {
      results = results.filter(req => req.endpointId === filters.endpointId);
    }
    if (filters?.clientIP) {
      results = results.filter(req => req.clientIP === filters.clientIP);
    }
    if (filters?.dateFrom) {
      results = results.filter(req => req.timestamp >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      results = results.filter(req => req.timestamp <= filters.dateTo!);
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Istanza singleton del service
export const apiGatewayService = new APIGatewayService();
