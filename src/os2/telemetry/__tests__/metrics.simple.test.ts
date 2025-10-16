// 🧪 SIMPLE TEST - Metrics Logic
// Test semplificato senza Firebase

/**
 * Simple Metrics Service (in-memory only)
 */
class SimpleMetricsService {
  private metrics: Array<{
    type: string;
    value: number;
    skillId?: string;
    osMode?: string;
  }> = [];
  
  async emit(metric: any): Promise<void> {
    this.metrics.push(metric);
  }
  
  async trackPlan(data: any): Promise<void> {
    await this.emit({ type: 'intent_confidence', value: data.confidence });
    await this.emit({ type: 'plan_steps', value: data.stepsCount });
    await this.emit({ type: 'plan_total_ms', value: data.totalTimeMs });
    await this.emit({ type: 'first_success_rate', value: data.failedSteps === 0 ? 1 : 0 });
    await this.emit({ type: 'error_rate', value: data.failedSteps / data.stepsCount });
  }
  
  async trackSkill(data: any): Promise<void> {
    await this.emit({ type: 'skill_latency_ms', value: data.latencyMs, skillId: data.skillId });
    await this.emit({ type: 'skill_usage', value: 1, skillId: data.skillId });
    await this.emit({ type: 'skill_success_rate', value: data.success ? 1 : 0, skillId: data.skillId });
  }
  
  getAggregatedMetrics(type: string) {
    const filtered = this.metrics.filter(m => m.type === type);
    const values = filtered.map(m => m.value);
    
    if (values.length === 0) {
      return { count: 0, avg: 0, sum: 0, min: 0, max: 0 };
    }
    
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: values.length,
      avg: sum / values.length,
      sum,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
  
  getSkillMetrics() {
    const skillMap = new Map<string, {
      usage: number;
      success: number;
      latencies: number[];
    }>();
    
    this.metrics.forEach(m => {
      if (!m.skillId) return;
      
      const data = skillMap.get(m.skillId) || { usage: 0, success: 0, latencies: [] };
      
      if (m.type === 'skill_usage') data.usage += m.value;
      if (m.type === 'skill_success_rate' && m.value === 1) data.success++;
      if (m.type === 'skill_latency_ms') data.latencies.push(m.value);
      
      skillMap.set(m.skillId, data);
    });
    
    const totalUsage = Array.from(skillMap.values()).reduce((sum, s) => sum + s.usage, 0);
    
    return Array.from(skillMap.entries()).map(([skillId, data]) => ({
      skillId,
      usageCount: data.usage,
      usagePercentage: totalUsage > 0 ? (data.usage / totalUsage) * 100 : 0,
      successCount: data.success,
      successRate: data.usage > 0 ? (data.success / data.usage) * 100 : 0,
      avgLatency: data.latencies.length > 0 
        ? data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length
        : 0,
    }));
  }
  
  clearMetrics() {
    this.metrics = [];
  }
}

describe('Metrics Service - Logic Tests', () => {
  let metrics: SimpleMetricsService;
  
  beforeEach(() => {
    metrics = new SimpleMetricsService();
  });
  
  describe('Metric Emission', () => {
    it('dovrebbe emettere metrics', async () => {
      await metrics.emit({
        type: 'intent_confidence',
        value: 0.85,
      });
      
      const agg = metrics.getAggregatedMetrics('intent_confidence');
      expect(agg.avg).toBe(0.85);
      
      console.log('✅ Metrics emesse correttamente');
    });
  });
  
  describe('trackPlan', () => {
    it('dovrebbe emettere tutte le metriche plan', async () => {
      await metrics.trackPlan({
        planId: 'plan_001',
        userId: 'user123',
        osMode: 'ask',
        confidence: 0.9,
        stepsCount: 3,
        totalTimeMs: 5000,
        successfulSteps: 3,
        failedSteps: 0,
      });
      
      expect(metrics.getAggregatedMetrics('intent_confidence').avg).toBe(0.9);
      expect(metrics.getAggregatedMetrics('plan_steps').avg).toBe(3);
      expect(metrics.getAggregatedMetrics('plan_total_ms').avg).toBe(5000);
      expect(metrics.getAggregatedMetrics('first_success_rate').avg).toBe(1);
      
      console.log('✅ trackPlan emette tutte le metriche');
    });
  });
  
  describe('trackSkill', () => {
    it('dovrebbe calcolare usage percentage', async () => {
      // 3x BP
      await metrics.trackSkill({ skillId: 'business_plan.run', latencyMs: 1000, success: true, osMode: 'ask', planId: 'p1', userId: 'u1' });
      await metrics.trackSkill({ skillId: 'business_plan.run', latencyMs: 1000, success: true, osMode: 'ask', planId: 'p2', userId: 'u1' });
      await metrics.trackSkill({ skillId: 'business_plan.run', latencyMs: 1000, success: true, osMode: 'ask', planId: 'p3', userId: 'u1' });
      
      // 1x RDO
      await metrics.trackSkill({ skillId: 'rdo.create', latencyMs: 2000, success: true, osMode: 'act', planId: 'p4', userId: 'u1' });
      
      const skillMetrics = metrics.getSkillMetrics();
      
      const bp = skillMetrics.find(s => s.skillId === 'business_plan.run');
      const rdo = skillMetrics.find(s => s.skillId === 'rdo.create');
      
      expect(bp?.usagePercentage).toBe(75); // 3/4
      expect(rdo?.usagePercentage).toBe(25); // 1/4
      
      console.log('✅ Usage percentage calcolato');
    });
    
    it('dovrebbe calcolare success rate', async () => {
      await metrics.trackSkill({ skillId: 'test.skill', latencyMs: 1000, success: true, osMode: 'ask', planId: 'p1', userId: 'u1' });
      await metrics.trackSkill({ skillId: 'test.skill', latencyMs: 1000, success: false, osMode: 'ask', planId: 'p2', userId: 'u1' });
      await metrics.trackSkill({ skillId: 'test.skill', latencyMs: 1000, success: true, osMode: 'ask', planId: 'p3', userId: 'u1' });
      
      const skillMetrics = metrics.getSkillMetrics();
      const testSkill = skillMetrics.find(s => s.skillId === 'test.skill');
      
      // 2 success / 3 total = 66.67%
      expect(testSkill?.successRate).toBeCloseTo(66.67, 1);
      
      console.log('✅ Success rate calcolato');
    });
    
    it('dovrebbe calcolare avg latency', async () => {
      await metrics.trackSkill({ skillId: 'test.skill', latencyMs: 1000, success: true, osMode: 'ask', planId: 'p1', userId: 'u1' });
      await metrics.trackSkill({ skillId: 'test.skill', latencyMs: 2000, success: true, osMode: 'ask', planId: 'p2', userId: 'u1' });
      await metrics.trackSkill({ skillId: 'test.skill', latencyMs: 3000, success: true, osMode: 'ask', planId: 'p3', userId: 'u1' });
      
      const skillMetrics = metrics.getSkillMetrics();
      const testSkill = skillMetrics.find(s => s.skillId === 'test.skill');
      
      // (1000 + 2000 + 3000) / 3 = 2000
      expect(testSkill?.avgLatency).toBe(2000);
      
      console.log('✅ Avg latency calcolato');
    });
  });
});

