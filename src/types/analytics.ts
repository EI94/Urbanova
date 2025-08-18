// Tipi per il sistema di Advanced Analytics & Reporting

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export type AnalyticsMetric = 'performance' | 'collaboration' | 'productivity' | 'engagement' | 'quality' | 'efficiency';

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'area' | 'heatmap';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';

export type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed' | 'archived';

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  period?: AnalyticsPeriod;
  metrics?: AnalyticsMetric[];
  teamMembers?: string[];
  projects?: string[];
  departments?: string[];
  customFilters?: Record<string, any>;
}

export interface PerformanceMetrics {
  userId: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  
  // Metriche di performance
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number; // percentuale
  
  // Metriche temporali
  averageTaskDuration: number; // in ore
  totalTimeSpent: number; // in ore
  efficiencyScore: number; // 0-100
  
  // Metriche di qualità
  qualityScore: number; // 0-100
  errorRate: number; // percentuale
  reviewScore: number; // 0-100
  
  // Metriche di collaborazione
  collaborationScore: number; // 0-100
  teamInteractions: number;
  knowledgeShared: number;
  
  // Timeline
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface TeamAnalytics {
  teamId: string;
  teamName: string;
  
  // Metriche aggregate del team
  totalMembers: number;
  activeMembers: number;
  averagePerformance: number;
  averageCollaboration: number;
  
  // Distribuzione performance
  performanceDistribution: {
    excellent: number; // 90-100
    good: number;     // 70-89
    average: number;  // 50-69
    belowAverage: number; // 30-49
    poor: number;     // 0-29
  };
  
  // Trend temporali
  performanceTrend: Array<{
    date: Date;
    averageScore: number;
    memberCount: number;
  }>;
  
  // Top performers
  topPerformers: Array<{
    userId: string;
    userName: string;
    performanceScore: number;
    improvement: number; // percentuale rispetto al periodo precedente
  }>;
  
  // Aree di miglioramento
  improvementAreas: Array<{
    metric: string;
    currentScore: number;
    targetScore: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  
  // Timeline
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  projectType: string;
  
  // Metriche di progetto
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  onTimeDelivery: boolean;
  
  // Metriche temporali
  plannedDuration: number; // in giorni
  actualDuration: number; // in giorni
  timeVariance: number; // percentuale
  
  // Metriche di budget
  plannedBudget: number;
  actualBudget: number;
  budgetVariance: number; // percentuale
  
  // Metriche di qualità
  qualityScore: number;
  customerSatisfaction: number;
  defectRate: number;
  
  // Metriche di team
  teamSize: number;
  teamEfficiency: number;
  collaborationIndex: number;
  
  // Timeline
  startDate: Date;
  endDate: Date;
  milestones: Array<{
    name: string;
    plannedDate: Date;
    actualDate?: Date;
    status: 'pending' | 'completed' | 'delayed';
  }>;
  
  lastUpdated: Date;
}

export interface CollaborationAnalytics {
  // Metriche di collaborazione generale
  totalCollaborations: number;
  activeCollaborations: number;
  averageCollaborationScore: number;
  
  // Pattern di collaborazione
  collaborationPatterns: {
    synchronous: number; // tempo reale
    asynchronous: number; // differito
    crossTeam: number; // tra team diversi
    external: number; // con partner esterni
  };
  
  // Metriche di engagement
  averageResponseTime: number; // in minuti
  participationRate: number; // percentuale
  knowledgeSharingIndex: number; // 0-100
  
  // Network analysis
  collaborationNetwork: Array<{
    userId: string;
    userName: string;
    connections: number;
    influence: number; // 0-100
    centrality: number; // 0-100
  }>;
  
  // Trend temporali
  collaborationTrend: Array<{
    date: Date;
    activeSessions: number;
    averageScore: number;
    participantCount: number;
  }>;
  
  // Timeline
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface ProductivityAnalytics {
  // Metriche di produttività generale
  overallProductivity: number; // 0-100
  productivityTrend: number; // percentuale rispetto al periodo precedente
  
  // Breakdown per area
  productivityByArea: {
    development: number;
    design: number;
    analysis: number;
    management: number;
    testing: number;
  };
  
  // Metriche di efficienza
  efficiencyMetrics: {
    timeToComplete: number; // in ore
    resourceUtilization: number; // percentuale
    wasteReduction: number; // percentuale
    processOptimization: number; // 0-100
  };
  
  // KPI principali
  keyPerformanceIndicators: {
    throughput: number; // task completati per giorno
    cycleTime: number; // tempo medio per completare un task
    leadTime: number; // tempo totale dall'inizio alla fine
    valueStreamMapping: number; // 0-100
  };
  
  // Benchmarking
  benchmarking: {
    industryAverage: number;
    competitorScore: number;
    internalTarget: number;
    gap: number;
  };
  
  // Timeline
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface EngagementAnalytics {
  // Metriche di engagement generale
  overallEngagement: number; // 0-100
  engagementTrend: number; // percentuale rispetto al periodo precedente
  
  // Fattori di engagement
  engagementFactors: {
    recognition: number; // 0-100
    growth: number; // 0-100
    purpose: number; // 0-100
    relationships: number; // 0-100
    autonomy: number; // 0-100
  };
  
  // Metriche di partecipazione
  participationMetrics: {
    meetingAttendance: number; // percentuale
    contributionRate: number; // percentuale
    initiativeTaking: number; // 0-100
    feedbackProvision: number; // 0-100
  };
  
  // Sentiment analysis
  sentimentAnalysis: {
    positive: number; // percentuale
    neutral: number; // percentuale
    negative: number; // percentuale
    overallSentiment: number; // -100 a +100
  };
  
  // Employee satisfaction
  satisfactionMetrics: {
    jobSatisfaction: number; // 0-100
    teamSatisfaction: number; // 0-100
    companySatisfaction: number; // 0-100
    retentionLikelihood: number; // 0-100
  };
  
  // Timeline
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface QualityAnalytics {
  // Metriche di qualità generale
  overallQuality: number; // 0-100
  qualityTrend: number; // percentuale rispetto al periodo precedente
  
  // Metriche di errore
  errorMetrics: {
    totalErrors: number;
    criticalErrors: number;
    errorRate: number; // percentuale
    errorResolutionTime: number; // in ore
  };
  
  // Metriche di review
  reviewMetrics: {
    reviewCoverage: number; // percentuale
    reviewEfficiency: number; // 0-100
    feedbackQuality: number; // 0-100
    iterationCount: number; // media per task
  };
  
  // Metriche di conformità
  complianceMetrics: {
    standardsCompliance: number; // percentuale
    regulatoryCompliance: number; // percentuale
    auditScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Customer feedback
  customerMetrics: {
    satisfactionScore: number; // 0-100
    complaintRate: number; // percentuale
    recommendationScore: number; // 0-100
    retentionRate: number; // percentuale
  };
  
  // Timeline
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  type: 'team' | 'project' | 'individual' | 'executive' | 'custom';
  
  // Configurazione dashboard
  layout: {
    columns: number;
    rows: number;
    widgets: AnalyticsWidget[];
  };
  
  // Filtri applicati
  filters: AnalyticsFilter;
  
  // Permessi
  permissions: {
    canView: string[];
    canEdit: string[];
    canShare: string[];
    canExport: string[];
  };
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  lastViewed: Date;
  viewCount: number;
}

export interface AnalyticsWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'progress' | 'kpi';
  title: string;
  description: string;
  
  // Configurazione widget
  config: {
    chartType?: ChartType;
    dataSource: string;
    refreshInterval: number; // in secondi
    size: 'small' | 'medium' | 'large';
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  
  // Dati del widget
  data: any;
  lastUpdated: Date;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'collaboration' | 'productivity' | 'engagement' | 'quality' | 'comprehensive';
  
  // Configurazione report
  config: {
    metrics: AnalyticsMetric[];
    period: AnalyticsPeriod;
    filters: AnalyticsFilter;
    format: ReportFormat;
    includeCharts: boolean;
    includeTables: boolean;
    includeInsights: boolean;
  };
  
  // Contenuto del report
  content: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    charts: Array<{
      type: ChartType;
      data: any;
      title: string;
      description: string;
    }>;
    tables: Array<{
      title: string;
      data: any[];
      columns: string[];
    }>;
    insights: Array<{
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      actionability: 'high' | 'medium' | 'low';
    }>;
  };
  
  // Metadati
  status: ReportStatus;
  generatedAt?: Date;
  generatedBy?: string;
  fileSize?: number;
  downloadUrl?: string;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'recommendation';
  
  // Dettagli insight
  details: {
    metric: AnalyticsMetric;
    value: number;
    threshold: number;
    direction: 'increasing' | 'decreasing' | 'stable';
    confidence: number; // 0-100
    impact: 'high' | 'medium' | 'low';
  };
  
  // Azioni suggerite
  actions: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    expectedOutcome: string;
  }>;
  
  // Timeline
  detectedAt: Date;
  lastUpdated: Date;
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface AnalyticsExport {
  id: string;
  reportId: string;
  format: ReportFormat;
  
  // Configurazione export
  config: {
    includeCharts: boolean;
    includeTables: boolean;
    includeInsights: boolean;
    compression: boolean;
    password?: string;
  };
  
  // Stato export
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  errorMessage?: string;
  
  // File generato
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: Date;
  
  // Timeline
  requestedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  requestedBy: string;
}

export interface AnalyticsSchedule {
  id: string;
  name: string;
  description: string;
  
  // Configurazione schedulazione
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    interval: number; // ogni X giorni/settimane/mesi
    startDate: Date;
    endDate?: Date;
    timeOfDay: string; // HH:MM
    timezone: string;
    dayOfWeek?: number; // 0-6 (domenica-sabato)
    dayOfMonth?: number; // 1-31
  };
  
  // Report da generare
  reports: Array<{
    reportId: string;
    format: ReportFormat;
    recipients: string[];
  }>;
  
  // Stato
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  type: 'threshold' | 'trend' | 'anomaly' | 'schedule';
  
  // Condizioni alert
  conditions: {
    metric: AnalyticsMetric;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
    value: number;
    duration: number; // in minuti
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  
  // Azioni alert
  actions: Array<{
    type: 'email' | 'notification' | 'webhook' | 'sms';
    config: Record<string, any>;
  }>;
  
  // Stato
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
