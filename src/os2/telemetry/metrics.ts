// 📊 METRICS - Telemetry per OS 2.0
// Winston/OpenTelemetry compatible

import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  | 'live_stream_errors';    // ✨ SSE connection errors

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

