// Tipi per il sistema di Advanced AI & Machine Learning

export type ModelType = 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'recommendation' | 'nlp' | 'computer_vision' | 'time_series' | 'reinforcement_learning';

export type ModelStatus = 'training' | 'trained' | 'deployed' | 'failed' | 'deprecated' | 'testing';

export type DatasetType = 'structured' | 'unstructured' | 'time_series' | 'text' | 'image' | 'audio' | 'video' | 'mixed';

export type DatasetStatus = 'uploading' | 'processing' | 'ready' | 'error' | 'archived';

export type TrainingStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export type DeploymentStatus = 'deploying' | 'deployed' | 'failed' | 'updating' | 'stopped';

export type PredictionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ModelFramework = 'tensorflow' | 'pytorch' | 'scikit_learn' | 'xgboost' | 'lightgbm' | 'huggingface' | 'openai' | 'custom';

export type OptimizationMetric = 'accuracy' | 'precision' | 'recall' | 'f1_score' | 'auc_roc' | 'mse' | 'mae' | 'r2_score' | 'custom';

export type DataSplitStrategy = 'random' | 'stratified' | 'time_based' | 'group_based' | 'custom';

export type FeatureType = 'numerical' | 'categorical' | 'text' | 'datetime' | 'binary' | 'ordinal' | 'image' | 'audio';

export type AutoMLTask = 'classification' | 'regression' | 'forecasting' | 'anomaly_detection' | 'feature_engineering' | 'hyperparameter_tuning';

export type ExplainabilityMethod = 'lime' | 'shap' | 'permutation_importance' | 'partial_dependence' | 'feature_importance' | 'attention_maps';

export type ModelValidationType = 'holdout' | 'cross_validation' | 'time_series_split' | 'bootstrap' | 'custom';

export type AlertType = 'model_drift' | 'data_drift' | 'performance_degradation' | 'prediction_anomaly' | 'resource_usage' | 'training_failure';

export interface MLModel {
  id: string;
  name: string;
  description: string;
  type: ModelType;
  framework: ModelFramework;
  
  // Configurazione modello
  version: string;
  algorithm: string;
  hyperparameters: Record<string, any>;
  
  // Dataset
  datasetId: string;
  datasetName: string;
  features: FeatureDefinition[];
  targetVariable: string;
  
  // Training
  trainingConfig: TrainingConfiguration;
  trainingHistory: TrainingRun[];
  
  // Performance
  metrics: ModelMetrics;
  validationResults: ValidationResults;
  
  // Deployment
  deploymentConfig?: DeploymentConfiguration;
  endpoints: ModelEndpoint[];
  
  // Stato
  status: ModelStatus;
  deploymentStatus?: DeploymentStatus;
  
  // Monitoring
  monitoringEnabled: boolean;
  driftDetection: DriftDetectionConfig;
  
  // Metadata
  tags: string[];
  owner: string;
  team: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  trainedAt?: Date;
  deployedAt?: Date;
  lastPredictionAt?: Date;
}

export interface FeatureDefinition {
  name: string;
  type: FeatureType;
  description: string;
  
  // Preprocessing
  preprocessing: Array<{
    method: string;
    parameters: Record<string, any>;
  }>;
  
  // Statistics
  statistics: {
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    nullCount: number;
    uniqueCount: number;
    mostFrequent?: string;
  };
  
  // Importance
  importance: number;
  correlationWithTarget: number;
  
  // Validation
  isRequired: boolean;
  validationRules: Array<{
    rule: string;
    parameters: Record<string, any>;
  }>;
}

export interface TrainingConfiguration {
  // Data splitting
  splitStrategy: DataSplitStrategy;
  trainSize: number;
  validationSize: number;
  testSize: number;
  
  // Training parameters
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  
  // Optimization
  optimizer: string;
  lossFunction: string;
  optimizationMetric: OptimizationMetric;
  
  // Early stopping
  earlyStoppingEnabled: boolean;
  patience?: number;
  minDelta?: number;
  
  // Regularization
  regularization: {
    l1: number;
    l2: number;
    dropout?: number;
  };
  
  // Cross-validation
  crossValidation: {
    enabled: boolean;
    folds: number;
    strategy: ModelValidationType;
  };
  
  // AutoML
  autoMLEnabled: boolean;
  autoMLConfig?: AutoMLConfiguration;
  
  // Resources
  computeResources: {
    cpu: number;
    memory: string;
    gpu?: string;
    maxTrainingTime: number; // in minutes
  };
}

export interface AutoMLConfiguration {
  task: AutoMLTask;
  timeLimit: number; // in minutes
  
  // Search space
  algorithms: string[];
  hyperparameterRanges: Record<string, any>;
  
  // Feature engineering
  featureEngineering: {
    enabled: boolean;
    maxFeatures: number;
    polynomialFeatures: boolean;
    featureSelection: boolean;
  };
  
  // Ensemble
  ensembleEnabled: boolean;
  ensembleMethods: string[];
  
  // Early stopping
  earlyStoppingRounds: number;
  
  // Evaluation
  evaluationMetric: OptimizationMetric;
  crossValidationFolds: number;
}

export interface TrainingRun {
  id: string;
  modelId: string;
  
  // Configuration
  configuration: TrainingConfiguration;
  
  // Status
  status: TrainingStatus;
  
  // Progress
  progress: number; // 0-100
  currentEpoch?: number;
  totalEpochs?: number;
  
  // Metrics
  metrics: {
    training: Record<string, number[]>;
    validation: Record<string, number[]>;
    test?: Record<string, number>;
  };
  
  // Resources
  resourceUsage: {
    cpuUsage: number[];
    memoryUsage: number[];
    gpuUsage?: number[];
    trainingTime: number; // in seconds
  };
  
  // Logs
  logs: TrainingLog[];
  
  // Results
  finalMetrics?: Record<string, number>;
  bestEpoch?: number;
  
  // Timeline
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  
  // Error handling
  errorMessage?: string;
  errorDetails?: string;
}

export interface TrainingLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  epoch?: number;
  step?: number;
  metrics?: Record<string, number>;
}

export interface ModelMetrics {
  // Classification
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  aucRoc?: number;
  confusionMatrix?: number[][];
  
  // Regression
  mse?: number;
  mae?: number;
  r2Score?: number;
  mape?: number;
  
  // Clustering
  silhouetteScore?: number;
  calinskiHarabaszScore?: number;
  daviesBouldinScore?: number;
  
  // Custom metrics
  customMetrics: Record<string, number>;
  
  // Business metrics
  businessMetrics: {
    costSavings?: number;
    revenueImpact?: number;
    timeToDecision?: number;
    userSatisfaction?: number;
  };
  
  // Fairness metrics
  fairnessMetrics?: {
    demographicParity: number;
    equalizedOdds: number;
    calibration: number;
  };
}

export interface ValidationResults {
  validationType: ModelValidationType;
  
  // Cross-validation results
  cvScores?: number[];
  cvMean?: number;
  cvStd?: number;
  
  // Holdout results
  holdoutScore?: number;
  
  // Feature importance
  featureImportance: Array<{
    feature: string;
    importance: number;
    rank: number;
  }>;
  
  // Learning curves
  learningCurves: {
    trainSizes: number[];
    trainScores: number[];
    validationScores: number[];
  };
  
  // Validation curves
  validationCurves?: {
    paramName: string;
    paramRange: number[];
    trainScores: number[];
    validationScores: number[];
  };
  
  // Residual analysis (for regression)
  residualAnalysis?: {
    residuals: number[];
    predicted: number[];
    actual: number[];
    normalityTest: {
      statistic: number;
      pValue: number;
    };
  };
}

export interface DeploymentConfiguration {
  // Environment
  environment: 'development' | 'staging' | 'production';
  
  // Scaling
  replicas: number;
  autoScaling: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization: number;
    targetMemoryUtilization: number;
  };
  
  // Resources
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  
  // Traffic routing
  trafficRouting: {
    strategy: 'blue_green' | 'canary' | 'rolling' | 'immediate';
    canaryPercentage?: number;
    rolloutDuration?: number; // in minutes
  };
  
  // Health checks
  healthCheck: {
    enabled: boolean;
    path: string;
    intervalSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
  };
  
  // Security
  security: {
    authentication: boolean;
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
    };
    encryption: boolean;
  };
  
  // Monitoring
  monitoring: {
    enabled: boolean;
    metricsCollection: boolean;
    logging: boolean;
    alerting: boolean;
  };
}

export interface ModelEndpoint {
  id: string;
  modelId: string;
  
  // Configuration
  url: string;
  version: string;
  environment: string;
  
  // Status
  status: DeploymentStatus;
  health: 'healthy' | 'unhealthy' | 'unknown';
  
  // Performance
  metrics: {
    requestsPerSecond: number;
    averageLatency: number;
    errorRate: number;
    uptime: number;
  };
  
  // Scaling
  currentReplicas: number;
  targetReplicas: number;
  
  // Traffic
  trafficPercentage: number;
  
  // Timeline
  deployedAt: Date;
  lastHealthCheck: Date;
  
  // Configuration
  deploymentConfig: DeploymentConfiguration;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  type: DatasetType;
  
  // Source
  source: {
    type: 'upload' | 'database' | 'api' | 's3' | 'url' | 'streaming';
    location: string;
    credentials?: Record<string, string>;
  };
  
  // Schema
  schema: {
    columns: DatasetColumn[];
    rowCount: number;
    size: number; // in bytes
    format: string;
  };
  
  // Quality
  quality: {
    completeness: number; // 0-100
    validity: number; // 0-100
    consistency: number; // 0-100
    accuracy: number; // 0-100
    duplicates: number;
    outliers: number;
  };
  
  // Processing
  preprocessing: Array<{
    step: string;
    parameters: Record<string, any>;
    appliedAt: Date;
  }>;
  
  // Versioning
  version: string;
  parentDatasetId?: string;
  
  // Status
  status: DatasetStatus;
  
  // Statistics
  statistics: DatasetStatistics;
  
  // Metadata
  tags: string[];
  owner: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface DatasetColumn {
  name: string;
  type: FeatureType;
  nullable: boolean;
  
  // Statistics
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  
  // Numerical columns
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  quartiles?: number[];
  
  // Categorical columns
  categories?: Array<{
    value: string;
    count: number;
    percentage: number;
  }>;
  
  // Text columns
  avgLength?: number;
  maxLength?: number;
  
  // Quality issues
  outliers?: number[];
  anomalies?: number[];
}

export interface DatasetStatistics {
  // Overview
  totalRows: number;
  totalColumns: number;
  memoryUsage: number;
  
  // Data types
  numericalColumns: number;
  categoricalColumns: number;
  textColumns: number;
  datetimeColumns: number;
  
  // Quality
  missingValues: number;
  missingPercentage: number;
  duplicateRows: number;
  duplicatePercentage: number;
  
  // Correlations
  correlationMatrix?: number[][];
  strongCorrelations: Array<{
    feature1: string;
    feature2: string;
    correlation: number;
  }>;
  
  // Target variable analysis
  targetDistribution?: Record<string, number>;
  classBalance?: number;
}

export interface Prediction {
  id: string;
  modelId: string;
  endpointId: string;
  
  // Input
  input: Record<string, any>;
  inputHash: string;
  
  // Output
  prediction: any;
  confidence?: number;
  probabilities?: Record<string, number>;
  
  // Explanation
  explanation?: ModelExplanation;
  
  // Status
  status: PredictionStatus;
  
  // Performance
  latency: number; // in milliseconds
  
  // Context
  userId?: string;
  sessionId?: string;
  requestId?: string;
  
  // Timeline
  requestedAt: Date;
  completedAt?: Date;
  
  // Error handling
  errorMessage?: string;
  
  // Feedback
  feedback?: {
    actualValue?: any;
    userRating?: number;
    comments?: string;
    providedAt: Date;
  };
}

export interface ModelExplanation {
  method: ExplainabilityMethod;
  
  // Feature importance
  featureImportance?: Array<{
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
  }>;
  
  // LIME explanation
  limeExplanation?: {
    features: Array<{
      feature: string;
      value: any;
      weight: number;
    }>;
    score: number;
  };
  
  // SHAP values
  shapValues?: {
    values: number[];
    baseValue: number;
    expectedValue: number;
  };
  
  // Text explanations
  textExplanation?: string;
  
  // Visual explanations
  visualExplanations?: Array<{
    type: 'heatmap' | 'attention' | 'gradient';
    data: any;
  }>;
}

export interface DriftDetectionConfig {
  enabled: boolean;
  
  // Data drift
  dataDrift: {
    enabled: boolean;
    method: 'ks_test' | 'chi2_test' | 'psi' | 'wasserstein' | 'custom';
    threshold: number;
    windowSize: number;
  };
  
  // Concept drift
  conceptDrift: {
    enabled: boolean;
    method: 'ddm' | 'eddm' | 'adwin' | 'page_hinkley' | 'custom';
    threshold: number;
  };
  
  // Performance drift
  performanceDrift: {
    enabled: boolean;
    metric: OptimizationMetric;
    threshold: number;
    windowSize: number;
  };
  
  // Monitoring frequency
  checkFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
  
  // Actions
  alerting: {
    enabled: boolean;
    channels: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  
  // Automatic retraining
  autoRetraining: {
    enabled: boolean;
    triggerThreshold: number;
    maxRetrainingFrequency: string; // e.g., "weekly", "monthly"
  };
}

export interface DriftDetectionResult {
  id: string;
  modelId: string;
  
  // Detection details
  detectionType: 'data_drift' | 'concept_drift' | 'performance_drift';
  method: string;
  
  // Results
  driftDetected: boolean;
  driftScore: number;
  threshold: number;
  
  // Affected features
  affectedFeatures?: Array<{
    feature: string;
    driftScore: number;
    pValue?: number;
  }>;
  
  // Statistics
  referenceStatistics: Record<string, number>;
  currentStatistics: Record<string, number>;
  
  // Timeline
  detectedAt: Date;
  referenceWindow: {
    start: Date;
    end: Date;
  };
  comparisonWindow: {
    start: Date;
    end: Date;
  };
  
  // Actions taken
  actionsTaken: Array<{
    action: string;
    takenAt: Date;
    result: string;
  }>;
}

export interface MLAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Context
  modelId?: string;
  endpointId?: string;
  datasetId?: string;
  
  // Details
  title: string;
  description: string;
  details: Record<string, any>;
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  
  // Metrics
  triggerValue: number;
  threshold: number;
  
  // Timeline
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Actions
  suggestedActions: string[];
  actionsTaken: Array<{
    action: string;
    takenBy: string;
    takenAt: Date;
    result?: string;
  }>;
  
  // Notifications
  notificationsSent: Array<{
    channel: string;
    recipient: string;
    sentAt: Date;
    status: 'sent' | 'delivered' | 'failed';
  }>;
}

export interface MLExperiment {
  id: string;
  name: string;
  description: string;
  
  // Hypothesis
  hypothesis: string;
  objectives: string[];
  
  // Configuration
  baselineModelId?: string;
  variants: ExperimentVariant[];
  
  // Design
  trafficSplit: Record<string, number>; // variant_id -> percentage
  duration: number; // in days
  sampleSize: number;
  
  // Status
  status: 'draft' | 'running' | 'completed' | 'cancelled' | 'paused';
  
  // Results
  results?: ExperimentResults;
  
  // Statistical analysis
  statisticalSignificance?: {
    pValue: number;
    confidenceLevel: number;
    powerAnalysis: number;
  };
  
  // Timeline
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Metadata
  owner: string;
  tags: string[];
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  
  // Configuration
  modelId: string;
  configuration: Record<string, any>;
  
  // Metrics
  metrics: Record<string, number>;
  
  // Traffic allocation
  trafficPercentage: number;
  
  // Status
  isControl: boolean;
  isWinner?: boolean;
}

export interface ExperimentResults {
  // Primary metrics
  primaryMetric: string;
  results: Record<string, {
    value: number;
    confidence_interval: [number, number];
    improvement: number; // percentage vs control
    statistical_significance: boolean;
  }>;
  
  // Secondary metrics
  secondaryMetrics: Record<string, {
    value: number;
    improvement: number;
  }>;
  
  // Winner
  winningVariant?: string;
  recommendation: string;
  
  // Analysis
  analysis: {
    summary: string;
    insights: string[];
    recommendations: string[];
    risks: string[];
  };
}

export interface AutoMLPipeline {
  id: string;
  name: string;
  description: string;
  
  // Configuration
  task: AutoMLTask;
  datasetId: string;
  targetColumn: string;
  
  // Search configuration
  searchConfig: {
    timeLimit: number; // in minutes
    maxTrials: number;
    algorithms: string[];
    hyperparameterBudget: number;
  };
  
  // Feature engineering
  featureEngineering: {
    enabled: boolean;
    strategies: string[];
    maxFeatures: number;
  };
  
  // Model selection
  modelSelection: {
    strategy: 'best_single' | 'ensemble' | 'stacking';
    ensembleSize?: number;
  };
  
  // Status
  status: 'configured' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  
  // Results
  trials: AutoMLTrial[];
  bestModel?: string;
  leaderboard: Array<{
    modelId: string;
    score: number;
    rank: number;
  }>;
  
  // Timeline
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
  
  // Resources
  resourceUsage: {
    cpuHours: number;
    memoryGBHours: number;
    gpuHours?: number;
    cost: number;
  };
}

export interface AutoMLTrial {
  id: string;
  pipelineId: string;
  
  // Configuration
  algorithm: string;
  hyperparameters: Record<string, any>;
  featureEngineering: string[];
  
  // Results
  score: number;
  metrics: Record<string, number>;
  
  // Status
  status: TrainingStatus;
  
  // Performance
  trainingTime: number; // in seconds
  evaluationTime: number; // in seconds
  
  // Model
  modelId?: string;
  
  // Timeline
  startedAt: Date;
  completedAt?: Date;
  
  // Error handling
  errorMessage?: string;
}

export interface MLWorkflow {
  id: string;
  name: string;
  description: string;
  
  // Configuration
  steps: WorkflowStep[];
  schedule?: {
    enabled: boolean;
    cron: string;
    timezone: string;
  };
  
  // Triggers
  triggers: Array<{
    type: 'manual' | 'schedule' | 'data_change' | 'model_drift' | 'performance_threshold';
    configuration: Record<string, any>;
  }>;
  
  // Status
  status: 'active' | 'paused' | 'disabled';
  
  // Execution history
  executions: WorkflowExecution[];
  
  // Metadata
  owner: string;
  tags: string[];
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'data_ingestion' | 'data_preprocessing' | 'feature_engineering' | 'model_training' | 'model_evaluation' | 'model_deployment' | 'monitoring' | 'custom';
  
  // Configuration
  configuration: Record<string, any>;
  
  // Dependencies
  dependsOn: string[];
  
  // Resources
  resources: {
    cpu?: string;
    memory?: string;
    gpu?: string;
    timeout?: number; // in minutes
  };
  
  // Retry policy
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // in seconds
    backoffMultiplier: number;
  };
  
  // Outputs
  outputs: Record<string, string>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  
  // Status
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Steps
  stepExecutions: Array<{
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    outputs?: Record<string, any>;
    errorMessage?: string;
  }>;
  
  // Timeline
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  
  // Trigger
  triggeredBy: string;
  triggerType: string;
  
  // Resources
  resourceUsage: {
    totalCpuTime: number;
    totalMemoryUsage: number;
    totalCost: number;
  };
  
  // Logs
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warning' | 'error';
    message: string;
    stepId?: string;
  }>;
}

export interface MLDashboard {
  id: string;
  name: string;
  description: string;
  type: 'overview' | 'model_performance' | 'data_quality' | 'operations' | 'business' | 'custom';
  
  // Layout
  layout: {
    columns: number;
    widgets: MLWidget[];
  };
  
  // Filters
  filters: Array<{
    name: string;
    type: 'select' | 'date_range' | 'text' | 'number_range';
    options?: string[];
    defaultValue?: any;
  }>;
  
  // Refresh
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  
  // Access control
  visibility: 'private' | 'team' | 'organization';
  sharedWith: string[];
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date;
  
  // Metadata
  owner: string;
  tags: string[];
}

export interface MLWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'model_list' | 'alert_list' | 'prediction_distribution' | 'feature_importance' | 'drift_monitor';
  
  // Layout
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  // Configuration
  title: string;
  description?: string;
  config: Record<string, any>;
  
  // Data
  dataSource: string;
  query?: string;
  
  // Visualization
  chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge';
  
  // Status
  isLoading: boolean;
  lastUpdated?: Date;
  error?: string;
}

export interface MLResourceUsage {
  // Compute resources
  cpu: {
    current: number;
    average: number;
    peak: number;
    unit: 'cores';
  };
  
  memory: {
    current: number;
    average: number;
    peak: number;
    unit: 'GB';
  };
  
  gpu?: {
    current: number;
    average: number;
    peak: number;
    unit: 'GPU-hours';
  };
  
  // Storage
  storage: {
    datasets: number;
    models: number;
    artifacts: number;
    total: number;
    unit: 'GB';
  };
  
  // Network
  network: {
    ingress: number;
    egress: number;
    unit: 'GB';
  };
  
  // Costs
  costs: {
    compute: number;
    storage: number;
    network: number;
    total: number;
    currency: 'USD';
    period: 'monthly';
  };
  
  // Timeline
  period: {
    start: Date;
    end: Date;
  };
}

export interface MLStats {
  // Models
  models: {
    total: number;
    byStatus: Record<ModelStatus, number>;
    byType: Record<ModelType, number>;
    deployed: number;
    training: number;
  };
  
  // Datasets
  datasets: {
    total: number;
    totalSize: number; // in GB
    byType: Record<DatasetType, number>;
    byStatus: Record<DatasetStatus, number>;
  };
  
  // Predictions
  predictions: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    averageLatency: number; // in ms
    errorRate: number; // percentage
  };
  
  // Training
  training: {
    activeJobs: number;
    completedToday: number;
    averageTrainingTime: number; // in minutes
    successRate: number; // percentage
  };
  
  // Experiments
  experiments: {
    active: number;
    completed: number;
    successfulOptimizations: number;
  };
  
  // Alerts
  alerts: {
    active: number;
    byType: Record<AlertType, number>;
    bySeverity: Record<'low' | 'medium' | 'high' | 'critical', number>;
  };
  
  // Resource usage
  resourceUsage: MLResourceUsage;
  
  // Performance
  performance: {
    systemUptime: number; // percentage
    averageResponseTime: number; // in ms
    throughput: number; // predictions per second
  };
  
  // Timeline
  generatedAt: Date;
  period: string;
}
