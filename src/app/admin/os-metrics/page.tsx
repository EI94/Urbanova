'use client';

// 📊 ADMIN - OS METRICS DASHBOARD
// 6 KPI principali + skill breakdown

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Target,
  AlertTriangle,
  BarChart3,
  Activity,
} from 'lucide-react';
import { OsMetricsSummary, SkillMetrics } from '@/os2/telemetry/metrics';

export default function OsMetricsPage() {
  const [summary, setSummary] = useState<OsMetricsSummary | null>(null);
  const [skillMetrics, setSkillMetrics] = useState<SkillMetrics[]>([]);
  const [extendedMetrics, setExtendedMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await fetch('/api/admin/os-metrics');
        const data = await response.json();
        
        setSummary(data.summary);
        setSkillMetrics(data.skills);
        setExtendedMetrics(data.extended);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
    
    // Refresh ogni 30s
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OS Metrics</h1>
              <p className="text-sm text-gray-500 mt-1">
                Urbanova OS 2.0 Performance Dashboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-600">
                {summary?.totalRequests || 0} richieste
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* 6 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* KPI 1: Avg Confidence */}
          <KpiCard
            icon={<Target className="w-6 h-6" />}
            label="Confidence Media"
            value={summary?.avgConfidence ? `${(summary.avgConfidence * 100).toFixed(1)}%` : '-'}
            trend={summary?.avgConfidence && summary.avgConfidence >= 0.7 ? 'up' : 'down'}
            color="blue"
          />
          
          {/* KPI 2: Avg Steps */}
          <KpiCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Steps Media per Plan"
            value={summary?.avgStepsPerPlan ? summary.avgStepsPerPlan.toFixed(1) : '-'}
            color="purple"
          />
          
          {/* KPI 3: Avg Skill Latency */}
          <KpiCard
            icon={<Zap className="w-6 h-6" />}
            label="Latency Media Skill"
            value={summary?.avgSkillLatency ? `${summary.avgSkillLatency.toFixed(0)}ms` : '-'}
            trend={summary?.avgSkillLatency && summary.avgSkillLatency < 2000 ? 'up' : 'down'}
            color="yellow"
          />
          
          {/* KPI 4: Avg Plan Total Time */}
          <KpiCard
            icon={<Clock className="w-6 h-6" />}
            label="Tempo Totale Plan"
            value={summary?.avgPlanTotalTime ? `${(summary.avgPlanTotalTime / 1000).toFixed(1)}s` : '-'}
            color="indigo"
          />
          
          {/* KPI 5: First-time Success Rate */}
          <KpiCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Success Rate (First-time)"
            value={summary?.firstTimeSuccessRate ? `${summary.firstTimeSuccessRate.toFixed(1)}%` : '-'}
            trend={summary?.firstTimeSuccessRate && summary.firstTimeSuccessRate >= 80 ? 'up' : 'down'}
            color="green"
          />
          
          {/* KPI 6: Error Rate */}
          <KpiCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Error Rate"
            value={summary?.errorRate ? `${summary.errorRate.toFixed(1)}%` : '-'}
            trend={summary?.errorRate && summary.errorRate < 5 ? 'up' : 'down'}
            color="red"
          />
        </div>
        
        {/* Extended Metrics - Timing */}
        {extendedMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time to First Status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Time to First Status</h3>
                <p className="text-xs text-gray-500 mt-0.5">Latenza piano → primo evento</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <MetricValue
                    label="Mediana"
                    value={`${extendedMetrics.timeToFirstStatus?.median?.toFixed(0) || 0}ms`}
                    color="blue"
                  />
                  <MetricValue
                    label="P95"
                    value={`${extendedMetrics.timeToFirstStatus?.p95?.toFixed(0) || 0}ms`}
                    color="purple"
                  />
                  <MetricValue
                    label="Max"
                    value={`${extendedMetrics.timeToFirstStatus?.max?.toFixed(0) || 0}ms`}
                    color="red"
                  />
                </div>
                
                {/* Sparkline (placeholder) */}
                <div className="h-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-end justify-around px-2 pb-2">
                  {[40, 60, 45, 70, 55, 65, 50, 75, 60, 80].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Time to Plan Complete */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Time to Plan Complete</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tempo esecuzione totale</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <MetricValue
                    label="Mediana"
                    value={`${((extendedMetrics.timeToPlanComplete?.median || 0) / 1000).toFixed(1)}s`}
                    color="green"
                  />
                  <MetricValue
                    label="P95"
                    value={`${((extendedMetrics.timeToPlanComplete?.p95 || 0) / 1000).toFixed(1)}s`}
                    color="yellow"
                  />
                  <MetricValue
                    label="Max"
                    value={`${((extendedMetrics.timeToPlanComplete?.max || 0) / 1000).toFixed(1)}s`}
                    color="red"
                  />
                </div>
                
                {/* Sparkline (placeholder) */}
                <div className="h-16 bg-gradient-to-r from-green-50 to-green-100 rounded-lg flex items-end justify-around px-2 pb-2">
                  {[50, 65, 55, 70, 60, 75, 65, 80, 70, 85].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 bg-green-600 rounded-t transition-all hover:bg-green-700"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SSE Errors */}
        {extendedMetrics?.sseErrors && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">SSE Stream Health</h3>
              <p className="text-xs text-gray-500 mt-0.5">Errori connessione real-time</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <MetricValue
                  label="Errori Totali"
                  value={extendedMetrics.sseErrors.total.toString()}
                  color="red"
                />
                <MetricValue
                  label="Error Rate"
                  value={`${extendedMetrics.sseErrors.percentage.toFixed(2)}%`}
                  color={extendedMetrics.sseErrors.percentage < 1 ? 'green' : 'red'}
                />
                <MetricValue
                  label="Health"
                  value={extendedMetrics.sseErrors.percentage < 1 ? '🟢 Healthy' : '🟡 Degraded'}
                  color={extendedMetrics.sseErrors.percentage < 1 ? 'green' : 'yellow'}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Skill Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Skill Performance</h2>
            <p className="text-sm text-gray-500 mt-0.5">Breakdown per skill</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Skill</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Usage %</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Success %</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Avg Latency</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Exec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {skillMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      Nessun dato disponibile
                    </td>
                  </tr>
                ) : (
                  skillMetrics.map((skill) => (
                    <tr key={skill.skillId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {skill.skillId}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">
                        {skill.usagePercentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={
                          skill.successRate >= 90 
                            ? 'text-green-600 font-semibold' 
                            : skill.successRate >= 70
                            ? 'text-yellow-600 font-semibold'
                            : 'text-red-600 font-semibold'
                        }>
                          {skill.successRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">
                        {skill.avgLatency.toFixed(0)}ms
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">
                        {skill.totalExecutions}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: 'up' | 'down';
  color: 'blue' | 'purple' | 'yellow' | 'indigo' | 'green' | 'red';
}

interface MetricValueProps {
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'yellow' | 'indigo' | 'green' | 'red';
}

function MetricValue({ label, value, color }: MetricValueProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    red: 'text-red-600',
  };
  
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}

function KpiCard({ icon, label, value, trend, color }: KpiCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
            {icon}
          </div>
          {trend && (
            <TrendingUp className={`w-5 h-5 ${trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
          )}
        </div>
        
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

