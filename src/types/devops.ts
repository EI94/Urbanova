// Tipi per il sistema di Advanced DevOps & CI/CD Pipeline

export type PipelineStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped' | 'waiting' | 'manual';

export type DeploymentEnvironment = 'development' | 'staging' | 'production' | 'testing' | 'preview' | 'canary' | 'blue' | 'green';

export type BuildTrigger = 'push' | 'pull_request' | 'schedule' | 'manual' | 'webhook' | 'tag' | 'release' | 'api';

export type ArtifactType = 'docker' | 'npm' | 'jar' | 'zip' | 'tar' | 'binary' | 'helm' | 'terraform' | 'static';

export type TestType = 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'smoke' | 'regression' | 'acceptance';

export type SecurityScanType = 'sast' | 'dast' | 'dependency' | 'container' | 'infrastructure' | 'secrets' | 'compliance';

export type InfrastructureProvider = 'aws' | 'azure' | 'gcp' | 'kubernetes' | 'docker' | 'terraform' | 'ansible' | 'helm';

export type MonitoringTool = 'prometheus' | 'grafana' | 'datadog' | 'newrelic' | 'elastic' | 'splunk' | 'jaeger' | 'zipkin';

export type NotificationChannel = 'slack' | 'email' | 'teams' | 'discord' | 'webhook' | 'sms' | 'pagerduty' | 'jira';

export type GitProvider = 'github' | 'gitlab' | 'bitbucket' | 'azure_devops' | 'codecommit' | 'gitea' | 'custom';

export type QualityGate = 'coverage' | 'security' | 'performance' | 'complexity' | 'duplication' | 'maintainability' | 'reliability';

export type ReleaseStrategy = 'blue_green' | 'canary' | 'rolling' | 'recreate' | 'a_b_test' | 'feature_flag' | 'shadow';

export type ResourceType = 'cpu' | 'memory' | 'storage' | 'network' | 'gpu' | 'database' | 'cache' | 'queue';

export type ComplianceFramework = 'soc2' | 'iso27001' | 'gdpr' | 'hipaa' | 'pci_dss' | 'fedramp' | 'nist' | 'cis';

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  
  // Configuration
  repository: {
    provider: GitProvider;
    url: string;
    branch: string;
    path?: string;
    credentials?: string;
  };
  
  // Trigger configuration
  triggers: Array<{
    type: BuildTrigger;
    config: Record<string, any>;
    enabled: boolean;
    branches?: string[];
    paths?: string[];
    schedule?: string; // cron expression
  }>;
  
  // Variables and secrets
  variables: Record<string, {
    value: string;
    encrypted: boolean;
    environment?: DeploymentEnvironment[];
    description?: string;
  }>;
  
  // Stages definition
  stages: Array<{
    id: string;
    name: string;
    order: number;
    dependsOn?: string[];
    condition?: string;
    timeout?: number; // in minutes
    retryCount?: number;
    environment?: DeploymentEnvironment;
    
    // Jobs in this stage
    jobs: Array<{
      id: string;
      name: string;
      order: number;
      dependsOn?: string[];
      condition?: string;
      
      // Execution environment
      runner: {
        type: 'docker' | 'kubernetes' | 'vm' | 'self_hosted';
        image?: string;
        labels?: string[];
        resources?: {
          cpu: string;
          memory: string;
          storage?: string;
        };
      };
      
      // Steps in this job
      steps: Array<{
        id: string;
        name: string;
        order: number;
        type: 'script' | 'action' | 'plugin' | 'service';
        
        // Step configuration
        config: {
          command?: string;
          script?: string;
          action?: string;
          plugin?: string;
          service?: string;
          args?: Record<string, any>;
          env?: Record<string, string>;
          workingDirectory?: string;
          timeout?: number;
          continueOnError?: boolean;
        };
        
        // Artifacts
        artifacts?: Array<{
          type: ArtifactType;
          name: string;
          path: string;
          retention?: number; // days
          public?: boolean;
        }>;
        
        // Cache configuration
        cache?: Array<{
          key: string;
          paths: string[];
          restoreKeys?: string[];
        }>;
      }>;
    }>;
  }>;
  
  // Quality gates
  qualityGates: Array<{
    type: QualityGate;
    threshold: number;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
    blocking: boolean;
    stage?: string;
  }>;
  
  // Notifications
  notifications: Array<{
    channel: NotificationChannel;
    config: Record<string, any>;
    events: PipelineStatus[];
    enabled: boolean;
  }>;
  
  // Status and metadata
  status: PipelineStatus;
  enabled: boolean;
  version: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  
  // Statistics
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDuration: number; // in seconds
    successRate: number; // percentage
    lastRunAt?: Date;
    lastSuccessAt?: Date;
    lastFailureAt?: Date;
  };
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  pipelineName: string;
  
  // Run details
  number: number;
  status: PipelineStatus;
  
  // Trigger information
  trigger: {
    type: BuildTrigger;
    user?: string;
    commit?: {
      hash: string;
      message: string;
      author: string;
      timestamp: Date;
    };
    pullRequest?: {
      number: number;
      title: string;
      author: string;
      sourceBranch: string;
      targetBranch: string;
    };
    schedule?: string;
    manual?: {
      user: string;
      reason?: string;
      parameters?: Record<string, any>;
    };
  };
  
  // Environment and configuration
  environment: DeploymentEnvironment;
  branch: string;
  variables: Record<string, string>;
  
  // Execution details
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  
  // Stage executions
  stages: Array<{
    id: string;
    name: string;
    status: PipelineStatus;
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
    
    // Job executions
    jobs: Array<{
      id: string;
      name: string;
      status: PipelineStatus;
      startedAt?: Date;
      completedAt?: Date;
      duration?: number;
      runner?: string;
      
      // Step executions
      steps: Array<{
        id: string;
        name: string;
        status: PipelineStatus;
        startedAt?: Date;
        completedAt?: Date;
        duration?: number;
        exitCode?: number;
        
        // Logs and artifacts
        logs?: Array<{
          timestamp: Date;
          level: 'info' | 'warn' | 'error' | 'debug';
          message: string;
          source?: string;
        }>;
        
        artifacts?: Array<{
          name: string;
          type: ArtifactType;
          size: number;
          url: string;
          checksum?: string;
        }>;
        
        // Test results
        testResults?: Array<{
          type: TestType;
          passed: number;
          failed: number;
          skipped: number;
          total: number;
          duration: number;
          coverage?: number;
          reportUrl?: string;
        }>;
        
        // Security scan results
        securityResults?: Array<{
          type: SecurityScanType;
          vulnerabilities: {
            critical: number;
            high: number;
            medium: number;
            low: number;
            info: number;
          };
          reportUrl?: string;
        }>;
      }>;
    }>;
  }>;
  
  // Overall results
  testResults?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
  };
  
  securityResults?: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    passed: boolean;
  };
  
  qualityResults?: {
    gates: Array<{
      type: QualityGate;
      value: number;
      threshold: number;
      passed: boolean;
    }>;
    overallPassed: boolean;
  };
  
  // Artifacts produced
  artifacts: Array<{
    name: string;
    type: ArtifactType;
    version: string;
    size: number;
    url: string;
    checksum: string;
    createdAt: Date;
  }>;
  
  // Deployment information
  deployments?: Array<{
    environment: DeploymentEnvironment;
    version: string;
    status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled_back';
    startedAt?: Date;
    completedAt?: Date;
    url?: string;
    rollbackVersion?: string;
  }>;
}

export interface Environment {
  id: string;
  name: string;
  type: DeploymentEnvironment;
  description: string;
  
  // Configuration
  config: {
    url?: string;
    namespace?: string;
    cluster?: string;
    region?: string;
    provider: InfrastructureProvider;
  };
  
  // Access control
  protection: {
    requireApproval: boolean;
    approvers?: string[];
    requiredChecks?: string[];
    allowedBranches?: string[];
    deploymentWindow?: {
      days: string[];
      hours: string[];
      timezone: string;
    };
  };
  
  // Variables and secrets
  variables: Record<string, {
    value: string;
    encrypted: boolean;
    description?: string;
  }>;
  
  // Resource limits
  resources: {
    limits: Record<ResourceType, string>;
    requests: Record<ResourceType, string>;
    autoScaling?: {
      enabled: boolean;
      minReplicas: number;
      maxReplicas: number;
      targetCPU?: number;
      targetMemory?: number;
    };
  };
  
  // Monitoring and observability
  monitoring: {
    enabled: boolean;
    tools: MonitoringTool[];
    dashboards?: string[];
    alerts?: string[];
    healthCheckUrl?: string;
    metricsEndpoint?: string;
  };
  
  // Status
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  
  // Current deployment
  currentDeployment?: {
    version: string;
    deployedAt: Date;
    deployedBy: string;
    pipelineRunId: string;
    commit: string;
  };
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Statistics
  stats: {
    totalDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    averageDeploymentTime: number;
    lastDeploymentAt?: Date;
    uptime: number; // percentage
  };
}

export interface Infrastructure {
  id: string;
  name: string;
  description: string;
  
  // Provider configuration
  provider: InfrastructureProvider;
  region?: string;
  zone?: string;
  
  // Resource definition
  resources: Array<{
    id: string;
    type: string;
    name: string;
    config: Record<string, any>;
    dependencies?: string[];
    
    // State
    status: 'creating' | 'active' | 'updating' | 'deleting' | 'deleted' | 'error';
    lastModified: Date;
    
    // Cost information
    cost?: {
      hourly: number;
      monthly: number;
      currency: string;
    };
    
    // Tags
    tags: Record<string, string>;
  }>;
  
  // Infrastructure as Code
  iac: {
    tool: 'terraform' | 'cloudformation' | 'pulumi' | 'cdk' | 'helm';
    repository: string;
    path: string;
    version: string;
    
    // State management
    state: {
      backend: string;
      location: string;
      locked: boolean;
      lastUpdate: Date;
    };
  };
  
  // Security and compliance
  security: {
    compliance: ComplianceFramework[];
    scanResults?: {
      lastScan: Date;
      passed: boolean;
      issues: Array<{
        severity: 'critical' | 'high' | 'medium' | 'low';
        type: string;
        description: string;
        resource: string;
      }>;
    };
    
    // Network security
    networkPolicies?: string[];
    firewallRules?: string[];
    encryption?: {
      inTransit: boolean;
      atRest: boolean;
      keyManagement: string;
    };
  };
  
  // Monitoring
  monitoring: {
    enabled: boolean;
    tools: MonitoringTool[];
    metrics: Array<{
      name: string;
      value: number;
      unit: string;
      timestamp: Date;
    }>;
    alerts: Array<{
      name: string;
      condition: string;
      severity: 'info' | 'warning' | 'critical';
      enabled: boolean;
    }>;
  };
  
  // Cost tracking
  costs: {
    current: {
      hourly: number;
      daily: number;
      monthly: number;
      currency: string;
    };
    forecast: {
      monthly: number;
      quarterly: number;
      yearly: number;
    };
    budget?: {
      limit: number;
      alertThreshold: number;
      period: 'monthly' | 'quarterly' | 'yearly';
    };
  };
  
  // Status
  status: 'active' | 'inactive' | 'provisioning' | 'updating' | 'destroying' | 'error';
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastDeployedAt?: Date;
}

export interface Release {
  id: string;
  name: string;
  version: string;
  description?: string;
  
  // Release configuration
  strategy: ReleaseStrategy;
  
  // Source information
  source: {
    pipelineRunId: string;
    commit: string;
    branch: string;
    artifacts: string[];
  };
  
  // Target environments
  environments: Array<{
    environmentId: string;
    environmentName: string;
    order: number;
    
    // Deployment configuration
    config: {
      replicas?: number;
      resources?: Record<ResourceType, string>;
      variables?: Record<string, string>;
      healthCheck?: {
        path: string;
        timeout: number;
        retries: number;
      };
    };
    
    // Approval workflow
    approval?: {
      required: boolean;
      approvers: string[];
      approvedBy?: string;
      approvedAt?: Date;
      reason?: string;
    };
    
    // Deployment status
    status: 'pending' | 'approved' | 'deploying' | 'deployed' | 'failed' | 'rolled_back' | 'cancelled';
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
    
    // Rollback information
    rollback?: {
      available: boolean;
      previousVersion?: string;
      reason?: string;
      triggeredBy?: string;
      triggeredAt?: Date;
    };
    
    // Health and monitoring
    health: {
      status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
      checks: Array<{
        name: string;
        status: boolean;
        message?: string;
        lastCheck: Date;
      }>;
    };
    
    // Traffic management (for canary/blue-green)
    traffic?: {
      percentage: number;
      rules?: Array<{
        type: 'header' | 'cookie' | 'query' | 'ip';
        key: string;
        value: string;
      }>;
    };
  }>;
  
  // Feature flags
  featureFlags?: Array<{
    name: string;
    enabled: boolean;
    percentage?: number;
    rules?: Array<{
      condition: string;
      value: boolean;
    }>;
  }>;
  
  // Quality gates
  qualityGates: Array<{
    type: QualityGate;
    passed: boolean;
    value: number;
    threshold: number;
  }>;
  
  // Status
  status: 'draft' | 'pending' | 'in_progress' | 'deployed' | 'failed' | 'cancelled' | 'rolled_back';
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Release notes
  notes?: {
    features: string[];
    bugFixes: string[];
    breakingChanges: string[];
    knownIssues: string[];
    rollbackPlan?: string;
  };
  
  // Metrics and KPIs
  metrics?: {
    deploymentTime: number;
    leadTime: number;
    meanTimeToRecovery: number;
    changeFailureRate: number;
    deploymentFrequency: number;
  };
}

export interface DevOpsMetrics {
  // DORA Metrics
  dora: {
    deploymentFrequency: {
      value: number;
      unit: 'per_day' | 'per_week' | 'per_month';
      trend: 'up' | 'down' | 'stable';
      target?: number;
    };
    
    leadTime: {
      value: number; // in hours
      p50: number;
      p95: number;
      trend: 'up' | 'down' | 'stable';
      target?: number;
    };
    
    meanTimeToRecovery: {
      value: number; // in hours
      p50: number;
      p95: number;
      trend: 'up' | 'down' | 'stable';
      target?: number;
    };
    
    changeFailureRate: {
      value: number; // percentage
      trend: 'up' | 'down' | 'stable';
      target?: number;
    };
  };
  
  // Pipeline metrics
  pipelines: {
    totalRuns: number;
    successRate: number;
    averageDuration: number;
    failureReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
    
    // Performance over time
    trends: Array<{
      date: Date;
      runs: number;
      successRate: number;
      averageDuration: number;
    }>;
  };
  
  // Environment metrics
  environments: Array<{
    name: string;
    uptime: number;
    deployments: number;
    averageDeploymentTime: number;
    rollbacks: number;
    
    // Resource utilization
    resources: {
      cpu: { usage: number; limit: number };
      memory: { usage: number; limit: number };
      storage: { usage: number; limit: number };
    };
  }>;
  
  // Quality metrics
  quality: {
    testCoverage: number;
    codeQuality: number;
    securityScore: number;
    performanceScore: number;
    
    // Trends
    trends: Array<{
      date: Date;
      coverage: number;
      quality: number;
      security: number;
      performance: number;
    }>;
  };
  
  // Cost metrics
  costs: {
    infrastructure: {
      current: number;
      forecast: number;
      budget: number;
      currency: string;
    };
    
    ci_cd: {
      current: number;
      forecast: number;
      budget: number;
      currency: string;
    };
    
    // Cost per deployment
    costPerDeployment: number;
    costPerEnvironment: Array<{
      environment: string;
      cost: number;
    }>;
  };
  
  // Team productivity
  productivity: {
    commitsPerDay: number;
    pullRequestsPerDay: number;
    reviewTime: number; // in hours
    mergeTime: number; // in hours
    
    // Developer experience
    buildWaitTime: number;
    testWaitTime: number;
    deploymentWaitTime: number;
  };
  
  // Generated at
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month';
  };
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  
  // Classification
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'deployment' | 'infrastructure' | 'security' | 'performance' | 'data' | 'external';
  
  // Status
  status: 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'closed';
  
  // Impact
  impact: {
    environments: DeploymentEnvironment[];
    services: string[];
    users: number;
    revenue?: number;
    sla: boolean;
  };
  
  // Timeline
  detectedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // Response team
  assignee?: string;
  team: string[];
  
  // Root cause analysis
  rootCause?: {
    category: 'human_error' | 'system_failure' | 'process_failure' | 'external' | 'unknown';
    description: string;
    evidence: string[];
  };
  
  // Resolution
  resolution?: {
    description: string;
    actions: string[];
    preventionMeasures: string[];
    followUpTasks: string[];
  };
  
  // Communication
  communications: Array<{
    timestamp: Date;
    type: 'internal' | 'external' | 'status_page';
    message: string;
    author: string;
    channels: NotificationChannel[];
  }>;
  
  // Metrics
  metrics: {
    detectionTime: number; // minutes from occurrence to detection
    responseTime: number; // minutes from detection to acknowledgment
    resolutionTime?: number; // minutes from detection to resolution
    recoveryTime?: number; // minutes from resolution to full recovery
  };
  
  // Related items
  related: {
    pipelines: string[];
    deployments: string[];
    releases: string[];
    alerts: string[];
  };
  
  // Post-incident review
  postIncidentReview?: {
    scheduled: boolean;
    conductedAt?: Date;
    participants: string[];
    findings: string[];
    actionItems: Array<{
      description: string;
      assignee: string;
      dueDate: Date;
      status: 'open' | 'in_progress' | 'completed';
    }>;
  };
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DevOpsConfiguration {
  // General settings
  organization: {
    name: string;
    domain: string;
    timezone: string;
    workingHours: {
      start: string;
      end: string;
      days: string[];
    };
  };
  
  // Git integration
  git: {
    defaultProvider: GitProvider;
    providers: Array<{
      type: GitProvider;
      config: Record<string, any>;
      enabled: boolean;
    }>;
  };
  
  // CI/CD settings
  cicd: {
    defaultRunner: string;
    runners: Array<{
      name: string;
      type: 'docker' | 'kubernetes' | 'vm' | 'self_hosted';
      config: Record<string, any>;
      enabled: boolean;
    }>;
    
    // Default pipeline settings
    defaults: {
      timeout: number; // minutes
      retryCount: number;
      parallelism: number;
      artifactRetention: number; // days
      logRetention: number; // days
    };
  };
  
  // Infrastructure settings
  infrastructure: {
    defaultProvider: InfrastructureProvider;
    providers: Array<{
      type: InfrastructureProvider;
      config: Record<string, any>;
      enabled: boolean;
    }>;
    
    // Cost management
    costTracking: {
      enabled: boolean;
      currency: string;
      budgets: Array<{
        name: string;
        limit: number;
        period: 'monthly' | 'quarterly' | 'yearly';
        alerts: number[];
      }>;
    };
  };
  
  // Security settings
  security: {
    scanners: Array<{
      type: SecurityScanType;
      tool: string;
      config: Record<string, any>;
      enabled: boolean;
    }>;
    
    // Compliance
    compliance: {
      frameworks: ComplianceFramework[];
      auditing: {
        enabled: boolean;
        retention: number; // days
        exportFormat: 'json' | 'csv' | 'pdf';
      };
    };
    
    // Secret management
    secrets: {
      provider: 'vault' | 'aws_secrets' | 'azure_keyvault' | 'gcp_secrets' | 'kubernetes';
      config: Record<string, any>;
      rotation: {
        enabled: boolean;
        interval: number; // days
      };
    };
  };
  
  // Monitoring settings
  monitoring: {
    tools: Array<{
      type: MonitoringTool;
      config: Record<string, any>;
      enabled: boolean;
    }>;
    
    // Alerting
    alerting: {
      channels: Array<{
        type: NotificationChannel;
        config: Record<string, any>;
        enabled: boolean;
      }>;
      
      // Default alert rules
      rules: Array<{
        name: string;
        condition: string;
        severity: 'info' | 'warning' | 'critical';
        enabled: boolean;
      }>;
    };
  };
  
  // Quality gates
  qualityGates: {
    defaults: Array<{
      type: QualityGate;
      threshold: number;
      operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
      blocking: boolean;
    }>;
    
    // Override per environment
    overrides: Record<DeploymentEnvironment, Array<{
      type: QualityGate;
      threshold: number;
      operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
      blocking: boolean;
    }>>;
  };
  
  // Approval workflows
  approvals: {
    production: {
      required: boolean;
      approvers: string[];
      timeout: number; // hours
    };
    
    staging: {
      required: boolean;
      approvers: string[];
      timeout: number; // hours
    };
    
    // Emergency deployments
    emergency: {
      enabled: boolean;
      approvers: string[];
      postApprovalRequired: boolean;
    };
  };
  
  // Retention policies
  retention: {
    pipelineRuns: number; // days
    artifacts: number; // days
    logs: number; // days
    metrics: number; // days
    incidents: number; // days
  };
  
  // Feature flags
  features: {
    enableAdvancedSecurity: boolean;
    enableCostOptimization: boolean;
    enableMLOps: boolean;
    enableChaosEngineering: boolean;
    enableProgressiveDelivery: boolean;
  };
}

export interface DevOpsStats {
  // Overview
  overview: {
    totalPipelines: number;
    activePipelines: number;
    totalEnvironments: number;
    totalReleases: number;
    totalIncidents: number;
    
    // Current status
    runningPipelines: number;
    pendingDeployments: number;
    openIncidents: number;
    
    // Health indicators
    systemHealth: 'healthy' | 'degraded' | 'unhealthy';
    infrastructureHealth: 'healthy' | 'degraded' | 'unhealthy';
    securityHealth: 'healthy' | 'degraded' | 'unhealthy';
  };
  
  // Performance metrics
  performance: {
    pipelineSuccessRate: number;
    averageBuildTime: number;
    averageDeploymentTime: number;
    deploymentFrequency: number;
    
    // Trends (last 30 days)
    trends: {
      successRate: Array<{ date: Date; value: number }>;
      buildTime: Array<{ date: Date; value: number }>;
      deploymentTime: Array<{ date: Date; value: number }>;
      frequency: Array<{ date: Date; value: number }>;
    };
  };
  
  // Resource utilization
  resources: {
    compute: {
      cpu: { used: number; total: number; percentage: number };
      memory: { used: number; total: number; percentage: number };
      storage: { used: number; total: number; percentage: number };
    };
    
    network: {
      bandwidth: { used: number; total: number; percentage: number };
      connections: { active: number; total: number };
    };
    
    costs: {
      current: number;
      forecast: number;
      budget: number;
      currency: string;
    };
  };
  
  // Quality metrics
  quality: {
    overallScore: number;
    testCoverage: number;
    codeQuality: number;
    securityScore: number;
    
    // Quality trends
    trends: {
      coverage: Array<{ date: Date; value: number }>;
      quality: Array<{ date: Date; value: number }>;
      security: Array<{ date: Date; value: number }>;
    };
  };
  
  // Top performers/issues
  top: {
    pipelines: Array<{
      id: string;
      name: string;
      successRate: number;
      averageDuration: number;
      totalRuns: number;
    }>;
    
    environments: Array<{
      id: string;
      name: string;
      uptime: number;
      deployments: number;
      issues: number;
    }>;
    
    failures: Array<{
      pipeline: string;
      stage: string;
      reason: string;
      count: number;
      percentage: number;
    }>;
  };
  
  // Generated at
  generatedAt: Date;
  period: string;
}
