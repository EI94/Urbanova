// 📊 METRICS - Telemetry per OS 2.0
// Winston/OpenTelemetry compatible

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Lazy loader per firebase - evita TDZ
let firebaseModulePromise: Promise<typeof import('../../lib/firebase')> | null = null;
const getFirebaseDb = async () => {
  if (!firebaseModulePromise) {
    firebaseModulePromise = import('../../lib/firebase');
  }
  const module = await firebaseModulePromise;
  return module.db;
};

/**
 * Metric types
 */
export type MetricType = 
  | 'intent_confidence'
  | 'plan_steps'
  | 'skill_latency_ms'
  | 'plan_total_ms'
  | 'first_success_rate'
  | 'ask_to_act_confirm_rate'
  | 'error_rate'
  | 'skill_usage'
  | 'skill_success_rate'
  | 'mode_usage'
  | 't_first_status_ms'      // ✨ Time to first plan_started event
  | 't_plan_complete_ms'     // ✨ Time to plan completion
  | 'steps_count'            // ✨ Total steps in plan
  | 'steps_failed_count'     // ✨ Failed steps count
  | 'live_stream_errors'     // ✨ SSE connection errors
  // Budget Suppliers specific metrics
  | 't_rfp_to_award_ms'      // ✨ Time from RFP creation to award (median)
  | 'items_with_valid_offer_pct' // ✨ Percentage of items with valid offers
  | 'delta_budget_vs_contract'   // ✨ Budget vs contract delta by category
  | 'bundle_vs_single_pct'       // ✨ Percentage of bundle contracts vs single
  | 'drift_alerts_count';        // ✨ Number of drift alerts

/**
 * Metric data point
 */
export interface MetricDataPoint {
  id?: string;
  
  // Metric identification
  type: MetricType;
  name: string;
  value: number;
  unit?: string; // 'ms', '%', 'count', etc.
  
  // Context
  skillId?: string;
  planId?: string;
  userId?: string;
  projectId?: string;
  osMode?: 'ask' | 'ask_to_act' | 'act';
  
  // Timestamp
  timestamp: Date;
  
  // Labels (for grouping/filtering)
  labels?: Record<string, string>;
  
  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated metric
 */
export interface AggregatedMetric {
  type: MetricType;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number; // Median
  p95: number;
  p99: number;
}

/**
 * Skill metrics
 */
export interface SkillMetrics {
  skillId: string;
  usageCount: number;
  usagePercentage: number;
  successCount: number;
  successRate: number;
  avgLatency: number;
  totalExecutions: number;
}

/**
 * OS Metrics summary (6 KPI principali)
 */
export interface OsMetricsSummary {
  // KPI 1: Confidence media
  avgConfidence: number;
  
  // KPI 2: Steps media per plan
  avgStepsPerPlan: number;
  
  // KPI 3: Latency media skill
  avgSkillLatency: number;
  
  // KPI 4: Total time media plan
  avgPlanTotalTime: number;
  
  // KPI 5: First-time success rate
  firstTimeSuccessRate: number;
  
  // KPI 6: Ask-to-Act confirm rate
  askToActConfirmRate: number;
  
  // KPI 7: Error rate
  errorRate: number;
  
  // Period
  periodStart: Date;
  periodEnd: Date;
  totalRequests: number;
}

/**
 * Budget Suppliers Metrics Summary
 */
export interface BudgetSuppliersMetricsSummary {
  // KPI 1: Time from RFP to Award (median)
  medianRfpToAwardTime: number;
  
  // KPI 2: Percentage of items with valid offers
  itemsWithValidOfferPercentage: number;
  
  // KPI 3: Budget vs Contract delta by category
  budgetVsContractDelta: {
    category: string;
    deltaPercentage: number;
    deltaAmount: number;
  }[];
  
  // KPI 4: Bundle vs Single contracts percentage
  bundleVsSinglePercentage: number;
  
  // KPI 5: Drift alerts count
  driftAlertsCount: number;
  
  // Period
  periodStart: Date;
  periodEnd: Date;
  totalRfps: number;
  totalContracts: number;
  totalItems: number;
}

/**
 * Budget Suppliers Sparkline Data
 */
export interface BudgetSuppliersSparklineData {
  metric: string;
  values: number[];
  timestamps: Date[];
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Metrics Service
 */
export class MetricsService {
  private collectionName = 'os2_metrics';
  private inMemoryMetrics: MetricDataPoint[] = [];
  
  /**
   * Emit metric
   */
  public async emit(metric: Omit<MetricDataPoint, 'id' | 'timestamp'>): Promise<void> {
    const dataPoint: MetricDataPoint = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };
    
    // Store in-memory per aggregazioni veloci
    this.inMemoryMetrics.push(dataPoint);
    
    // Log strutturato (Winston-compatible format)
    console.log(JSON.stringify({
      level: 'info',
      message: `[Metric] ${metric.type}`,
      metric: {
        type: metric.type,
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        skillId: metric.skillId,
        planId: metric.planId,
        osMode: metric.osMode,
      },
      timestamp: dataPoint.timestamp.toISOString(),
    }));
    
    // Persist to Firestore (async, non-blocking)
    try {
      const db = await getFirebaseDb();
      await addDoc(collection(db, this.collectionName), {
        ...dataPoint,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.warn('⚠️ [Metrics] Failed to persist metric:', error);
      // Non bloccare execution se metric persistence fallisce
    }
  }
  
  /**
   * Track plan execution
   */
  public async trackPlan(data: {
    planId: string;
    userId: string;
    projectId?: string;
    osMode: 'ask' | 'ask_to_act' | 'act';
    confidence: number;
    stepsCount: number;
    totalTimeMs: number;
    successfulSteps: number;
    failedSteps: number;
  }): Promise<void> {
    // Emit multiple metrics
    await Promise.all([
      // Confidence
      this.emit({
        type: 'intent_confidence',
        name: 'Intent Classification Confidence',
        value: data.confidence,
        unit: 'score',
        planId: data.planId,
        userId: data.userId,
        projectId: data.projectId,
        osMode: data.osMode,
      }),
      
      // Steps count
      this.emit({
        type: 'plan_steps',
        name: 'Plan Steps Count',
        value: data.stepsCount,
        unit: 'count',
        planId: data.planId,
        userId: data.userId,
        osMode: data.osMode,
      }),
      
      // Total time
      this.emit({
        type: 'plan_total_ms',
        name: 'Plan Total Execution Time',
        value: data.totalTimeMs,
        unit: 'ms',
        planId: data.planId,
        userId: data.userId,
        osMode: data.osMode,
      }),
      
      // Success rate
      this.emit({
        type: 'first_success_rate',
        name: 'First-time Success Rate',
        value: data.failedSteps === 0 ? 1 : 0,
        unit: 'boolean',
        planId: data.planId,
        userId: data.userId,
        osMode: data.osMode,
      }),
      
      // Error rate
      this.emit({
        type: 'error_rate',
        name: 'Error Rate',
        value: data.failedSteps / data.stepsCount,
        unit: 'percentage',
        planId: data.planId,
        userId: data.userId,
        osMode: data.osMode,
      }),
    ]);
  }
  
  /**
   * Track skill execution
   */
  public async trackSkill(data: {
    skillId: string;
    planId: string;
    userId: string;
    latencyMs: number;
    success: boolean;
    osMode: 'ask' | 'ask_to_act' | 'act';
  }): Promise<void> {
    await Promise.all([
      // Latency
      this.emit({
        type: 'skill_latency_ms',
        name: `Skill Latency: ${data.skillId}`,
        value: data.latencyMs,
        unit: 'ms',
        skillId: data.skillId,
        planId: data.planId,
        userId: data.userId,
        osMode: data.osMode,
      }),
      
      // Usage
      this.emit({
        type: 'skill_usage',
        name: `Skill Usage: ${data.skillId}`,
        value: 1,
        unit: 'count',
        skillId: data.skillId,
        planId: data.planId,
        userId: data.userId,
        osMode: data.osMode,
      }),
      
      // Success
      this.emit({
        type: 'skill_success_rate',
        name: `Skill Success: ${data.skillId}`,
        value: data.success ? 1 : 0,
        unit: 'boolean',
        skillId: data.skillId,
        planId: data.planId,
        userId: data.userId,
        osMode: data.osMode,
      }),
    ]);
  }
  
  /**
   * Track Ask-to-Act confirmation
   */
  public async trackConfirmation(data: {
    planId: string;
    userId: string;
    confirmed: boolean;
  }): Promise<void> {
    await this.emit({
      type: 'ask_to_act_confirm_rate',
      name: 'Ask-to-Act Confirmation',
      value: data.confirmed ? 1 : 0,
      unit: 'boolean',
      planId: data.planId,
      userId: data.userId,
      osMode: 'ask_to_act',
    });
  }
  
  /**
   * Track time to first status (plan_started event)
   */
  public async trackTimeToFirstStatus(data: {
    planId: string;
    userId: string;
    requestSentAt: number;
    firstStatusAt: number;
  }): Promise<void> {
    const timeToFirstStatus = data.firstStatusAt - data.requestSentAt;
    
    await this.emit({
      type: 't_first_status_ms',
      name: 'Time to First Status',
      value: timeToFirstStatus,
      unit: 'ms',
      planId: data.planId,
      userId: data.userId,
    });
  }
  
  /**
   * Track time to plan complete
   */
  public async trackTimeToPlanComplete(data: {
    planId: string;
    userId: string;
    requestSentAt: number;
    planCompletedAt: number;
  }): Promise<void> {
    const timeToPlanComplete = data.planCompletedAt - data.requestSentAt;
    
    await this.emit({
      type: 't_plan_complete_ms',
      name: 'Time to Plan Complete',
      value: timeToPlanComplete,
      unit: 'ms',
      planId: data.planId,
      userId: data.userId,
    });
  }
  
  /**
   * Track SSE stream error
   */
  public async trackSseError(data: {
    userId: string;
    sessionId: string;
    errorType: string;
    errorMessage?: string;
  }): Promise<void> {
    await this.emit({
      type: 'live_stream_errors',
      name: 'SSE Stream Error',
      value: 1,
      unit: 'count',
      userId: data.userId,
      labels: {
        errorType: data.errorType,
        sessionId: data.sessionId,
      },
      metadata: {
        errorMessage: data.errorMessage,
      },
    });
  }
  
  /**
   * Track Budget Suppliers RFP to Award time
   */
  public async trackRfpToAwardTime(data: {
    rfpId: string;
    projectId: string;
    userId: string;
    rfpCreatedAt: number;
    awardCompletedAt: number;
  }): Promise<void> {
    const timeToAward = data.awardCompletedAt - data.rfpCreatedAt;
    
    await this.emit({
      type: 't_rfp_to_award_ms',
      name: 'RFP to Award Time',
      value: timeToAward,
      unit: 'ms',
      projectId: data.projectId,
      userId: data.userId,
      labels: {
        rfpId: data.rfpId,
      },
    });
  }
  
  /**
   * Track items with valid offers percentage
   */
  public async trackItemsWithValidOffers(data: {
    projectId: string;
    userId: string;
    totalItems: number;
    itemsWithValidOffers: number;
  }): Promise<void> {
    const percentage = data.totalItems > 0 
      ? (data.itemsWithValidOffers / data.totalItems) * 100 
      : 0;
    
    await this.emit({
      type: 'items_with_valid_offer_pct',
      name: 'Items with Valid Offers Percentage',
      value: percentage,
      unit: 'percentage',
      projectId: data.projectId,
      userId: data.userId,
      labels: {
        totalItems: data.totalItems.toString(),
        itemsWithOffers: data.itemsWithValidOffers.toString(),
      },
    });
  }
  
  /**
   * Track budget vs contract delta by category
   */
  public async trackBudgetVsContractDelta(data: {
    projectId: string;
    userId: string;
    category: string;
    budgetAmount: number;
    contractAmount: number;
  }): Promise<void> {
    const deltaAmount = contractAmount - budgetAmount;
    const deltaPercentage = budgetAmount > 0 
      ? (deltaAmount / budgetAmount) * 100 
      : 0;
    
    await this.emit({
      type: 'delta_budget_vs_contract',
      name: 'Budget vs Contract Delta',
      value: deltaPercentage,
      unit: 'percentage',
      projectId: data.projectId,
      userId: data.userId,
      labels: {
        category: data.category,
      },
      metadata: {
        budgetAmount: data.budgetAmount,
        contractAmount: data.contractAmount,
        deltaAmount: deltaAmount,
      },
    });
  }
  
  /**
   * Track bundle vs single contracts percentage
   */
  public async trackBundleVsSinglePercentage(data: {
    projectId: string;
    userId: string;
    totalContracts: number;
    bundleContracts: number;
  }): Promise<void> {
    const percentage = data.totalContracts > 0 
      ? (data.bundleContracts / data.totalContracts) * 100 
      : 0;
    
    await this.emit({
      type: 'bundle_vs_single_pct',
      name: 'Bundle vs Single Contracts Percentage',
      value: percentage,
      unit: 'percentage',
      projectId: data.projectId,
      userId: data.userId,
      labels: {
        totalContracts: data.totalContracts.toString(),
        bundleContracts: data.bundleContracts.toString(),
      },
    });
  }
  
  /**
   * Track drift alerts count
   */
  public async trackDriftAlerts(data: {
    projectId: string;
    userId: string;
    alertType: 'budget' | 'schedule' | 'quality' | 'scope';
    severity: 'low' | 'medium' | 'high' | 'critical';
    itemId?: string;
    contractId?: string;
  }): Promise<void> {
    await this.emit({
      type: 'drift_alerts_count',
      name: 'Drift Alerts Count',
      value: 1,
      unit: 'count',
      projectId: data.projectId,
      userId: data.userId,
      labels: {
        alertType: data.alertType,
        severity: data.severity,
        itemId: data.itemId || '',
        contractId: data.contractId || '',
      },
    });
  }
  
  /**
   * Get aggregated metrics
   */
  public getAggregatedMetrics(type: MetricType): AggregatedMetric {
    const metrics = this.inMemoryMetrics.filter(m => m.type === type);
    
    if (metrics.length === 0) {
      return {
        type,
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }
    
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((acc, v) => acc + v, 0);
    
    return {
      type,
      count: values.length,
      sum,
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  }
  
  /**
   * Get skill metrics
   */
  public getSkillMetrics(): SkillMetrics[] {
    const skillMap = new Map<string, {
      usageCount: number;
      successCount: number;
      latencies: number[];
    }>();
    
    // Aggregate by skill
    this.inMemoryMetrics.forEach(m => {
      if (!m.skillId) return;
      
      const data = skillMap.get(m.skillId) || {
        usageCount: 0,
        successCount: 0,
        latencies: [],
      };
      
      if (m.type === 'skill_usage') {
        data.usageCount += m.value;
      }
      
      if (m.type === 'skill_success_rate' && m.value === 1) {
        data.successCount++;
      }
      
      if (m.type === 'skill_latency_ms') {
        data.latencies.push(m.value);
      }
      
      skillMap.set(m.skillId, data);
    });
    
    // Calculate percentages
    const totalUsage = Array.from(skillMap.values()).reduce((sum, s) => sum + s.usageCount, 0);
    
    return Array.from(skillMap.entries()).map(([skillId, data]) => ({
      skillId,
      usageCount: data.usageCount,
      usagePercentage: totalUsage > 0 ? (data.usageCount / totalUsage) * 100 : 0,
      successCount: data.successCount,
      successRate: data.usageCount > 0 ? (data.successCount / data.usageCount) * 100 : 0,
      avgLatency: data.latencies.length > 0 
        ? data.latencies.reduce((sum, l) => sum + l, 0) / data.latencies.length
        : 0,
      totalExecutions: data.usageCount,
    }));
  }
  
  /**
   * Get OS summary (6 KPI + nuove metriche)
   */
  public getOsSummary(): OsMetricsSummary {
    const confidenceMetrics = this.getAggregatedMetrics('intent_confidence');
    const stepsMetrics = this.getAggregatedMetrics('plan_steps');
    const skillLatencyMetrics = this.getAggregatedMetrics('skill_latency_ms');
    const planTimeMetrics = this.getAggregatedMetrics('plan_total_ms');
    const successMetrics = this.getAggregatedMetrics('first_success_rate');
    const confirmMetrics = this.getAggregatedMetrics('ask_to_act_confirm_rate');
    const errorMetrics = this.getAggregatedMetrics('error_rate');
    
    const timestamps = this.inMemoryMetrics.map(m => m.timestamp);
    
    return {
      avgConfidence: confidenceMetrics.avg,
      avgStepsPerPlan: stepsMetrics.avg,
      avgSkillLatency: skillLatencyMetrics.avg,
      avgPlanTotalTime: planTimeMetrics.avg,
      firstTimeSuccessRate: successMetrics.avg * 100,
      askToActConfirmRate: confirmMetrics.avg * 100,
      errorRate: errorMetrics.avg * 100,
      periodStart: timestamps.length > 0 
        ? new Date(Math.min(...timestamps.map(t => t.getTime())))
        : new Date(),
      periodEnd: timestamps.length > 0
        ? new Date(Math.max(...timestamps.map(t => t.getTime())))
        : new Date(),
      totalRequests: this.inMemoryMetrics.filter(m => m.type === 'plan_total_ms').length,
    };
  }
  
  /**
   * Get extended metrics (timing + errors)
   */
  public getExtendedMetrics() {
    const firstStatusMetrics = this.getAggregatedMetrics('t_first_status_ms');
    const planCompleteMetrics = this.getAggregatedMetrics('t_plan_complete_ms');
    const stepsCountMetrics = this.getAggregatedMetrics('steps_count');
    const stepsFailedMetrics = this.getAggregatedMetrics('steps_failed_count');
    const sseErrorsMetrics = this.getAggregatedMetrics('live_stream_errors');
    
    const totalPlans = this.inMemoryMetrics.filter(m => m.type === 't_plan_complete_ms').length;
    const totalSseErrors = sseErrorsMetrics.sum;
    
    return {
      // Timing
      timeToFirstStatus: {
        median: firstStatusMetrics.p50,
        p95: firstStatusMetrics.p95,
        avg: firstStatusMetrics.avg,
        min: firstStatusMetrics.min,
        max: firstStatusMetrics.max,
      },
      timeToPlanComplete: {
        median: planCompleteMetrics.p50,
        p95: planCompleteMetrics.p95,
        avg: planCompleteMetrics.avg,
        min: planCompleteMetrics.min,
        max: planCompleteMetrics.max,
      },
      
      // Steps
      avgStepsCount: stepsCountMetrics.avg,
      avgStepsFailedCount: stepsFailedMetrics.avg,
      
      // SSE Errors
      sseErrors: {
        total: totalSseErrors,
        percentage: totalPlans > 0 ? (totalSseErrors / totalPlans) * 100 : 0,
      },
    };
  }
  
  /**
   * Get Budget Suppliers metrics summary
   */
  public getBudgetSuppliersSummary(): BudgetSuppliersMetricsSummary {
    const rfpToAwardMetrics = this.getAggregatedMetrics('t_rfp_to_award_ms');
    const itemsWithOffersMetrics = this.getAggregatedMetrics('items_with_valid_offer_pct');
    const bundleVsSingleMetrics = this.getAggregatedMetrics('bundle_vs_single_pct');
    const driftAlertsMetrics = this.getAggregatedMetrics('drift_alerts_count');
    
    // Calculate budget vs contract delta by category
    const budgetVsContractMetrics = this.inMemoryMetrics
      .filter(m => m.type === 'delta_budget_vs_contract')
      .reduce((acc, m) => {
        const category = m.labels?.category || 'unknown';
        if (!acc[category]) {
          acc[category] = {
            category,
            deltaPercentage: 0,
            deltaAmount: 0,
            count: 0,
          };
        }
        acc[category].deltaPercentage += m.value;
        acc[category].deltaAmount += m.metadata?.deltaAmount || 0;
        acc[category].count++;
        return acc;
      }, {} as Record<string, { category: string; deltaPercentage: number; deltaAmount: number; count: number }>);
    
    const budgetVsContractDelta = Object.values(budgetVsContractMetrics).map(item => ({
      category: item.category,
      deltaPercentage: item.count > 0 ? item.deltaPercentage / item.count : 0,
      deltaAmount: item.count > 0 ? item.deltaAmount / item.count : 0,
    }));
    
    const timestamps = this.inMemoryMetrics.map(m => m.timestamp);
    
    return {
      medianRfpToAwardTime: rfpToAwardMetrics.p50,
      itemsWithValidOfferPercentage: itemsWithOffersMetrics.avg,
      budgetVsContractDelta,
      bundleVsSinglePercentage: bundleVsSingleMetrics.avg,
      driftAlertsCount: driftAlertsMetrics.sum,
      periodStart: timestamps.length > 0 
        ? new Date(Math.min(...timestamps.map(t => t.getTime())))
        : new Date(),
      periodEnd: timestamps.length > 0
        ? new Date(Math.max(...timestamps.map(t => t.getTime())))
        : new Date(),
      totalRfps: this.inMemoryMetrics.filter(m => m.type === 't_rfp_to_award_ms').length,
      totalContracts: this.inMemoryMetrics.filter(m => m.type === 'bundle_vs_single_pct').length,
      totalItems: this.inMemoryMetrics.filter(m => m.type === 'items_with_valid_offer_pct').length,
    };
  }
  
  /**
   * Get Budget Suppliers sparkline data for last 4 weeks
   */
  public getBudgetSuppliersSparklines(): BudgetSuppliersSparklineData[] {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentMetrics = this.inMemoryMetrics.filter(m => 
      m.timestamp >= fourWeeksAgo && 
      ['t_rfp_to_award_ms', 'items_with_valid_offer_pct', 'delta_budget_vs_contract', 'bundle_vs_single_pct', 'drift_alerts_count'].includes(m.type)
    );
    
    const sparklines: BudgetSuppliersSparklineData[] = [];
    
    // Group by metric type and week
    const metricTypes = ['t_rfp_to_award_ms', 'items_with_valid_offer_pct', 'delta_budget_vs_contract', 'bundle_vs_single_pct', 'drift_alerts_count'];
    
    metricTypes.forEach(metricType => {
      const metrics = recentMetrics.filter(m => m.type === metricType);
      
      if (metrics.length === 0) return;
      
      // Group by week
      const weeklyData = new Map<string, number[]>();
      
      metrics.forEach(m => {
        const weekStart = new Date(m.timestamp);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, []);
        }
        weeklyData.get(weekKey)!.push(m.value);
      });
      
      // Calculate weekly averages
      const weeklyAverages = Array.from(weeklyData.entries())
        .map(([week, values]) => ({
          week,
          average: values.reduce((sum, v) => sum + v, 0) / values.length,
          timestamp: new Date(week),
        }))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (weeklyAverages.length < 2) return;
      
      const values = weeklyAverages.map(w => w.average);
      const timestamps = weeklyAverages.map(w => w.timestamp);
      const currentValue = values[values.length - 1];
      const previousValue = values[values.length - 2];
      const changePercentage = previousValue !== 0 
        ? ((currentValue - previousValue) / previousValue) * 100 
        : 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (changePercentage > 5) trend = 'up';
      else if (changePercentage < -5) trend = 'down';
      
      sparklines.push({
        metric: metricType,
        values,
        timestamps,
        currentValue,
        previousValue,
        changePercentage,
        trend,
      });
    });
    
    return sparklines;
  }
  
  /**
   * Clear in-memory metrics (for testing)
   */
  public clearMetrics(): void {
    this.inMemoryMetrics = [];
  }
}

/**
 * Singleton Metrics Service
 */
let metricsInstance: MetricsService;

export function getMetrics(): MetricsService {
  if (!metricsInstance) {
    metricsInstance = new MetricsService();
  }
  return metricsInstance;
}

