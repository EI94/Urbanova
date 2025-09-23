'use client';

import React, { useState, useEffect } from 'react';
import { salMonitoringService } from '@/lib/salMonitoringService';
import { SALMetrics, SALPerformanceMetrics } from '@/lib/salMonitoringService';

interface DashboardMetrics {
  summary: {
    totalSALs: number;
    pendingSALs: number;
    completedSALs: number;
    totalAmount: number;
  };
  recentActivity: Array<{
    action: string;
    salId: string;
    user: string;
    timestamp: Date;
  }>;
  performance: {
    averageCreateTime: number;
    averageSignTime: number;
    averagePaymentTime: number;
  };
}

export default function SALMonitoringDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardMetrics, health] = await Promise.all([
        salMonitoringService.getDashboardMetrics(),
        salMonitoringService.checkSystemHealth(),
      ]);

      setMetrics(dashboardMetrics);
      setSystemHealth(health);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento dati');
      console.error('Errore caricamento dashboard SAL:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const report = await salMonitoringService.generateMetricsReport(timeRange);
      console.log('Report generato:', report);

      // Qui potresti scaricare o visualizzare il report
      alert(`Report ${timeRange} generato con successo!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore generazione report');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'unhealthy':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 text-xl mr-2">❌</div>
          <div>
            <h3 className="text-red-800 font-semibold">Errore Caricamento</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoraggio SAL</h1>
          <p className="text-gray-600">Monitoraggio e metriche del sistema SAL</p>
        </div>

        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as 'day' | 'week' | 'month')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Ultimo giorno</option>
            <option value="week">Ultima settimana</option>
            <option value="month">Ultimo mese</option>
          </select>

          <button
            onClick={generateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Genera Report
          </button>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stato Sistema</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(systemHealth.status)}`}
              >
                <span className="mr-2">{getHealthStatusIcon(systemHealth.status)}</span>
                {systemHealth.status?.toUpperCase() || 'UNKNOWN'}
              </div>
              <p className="text-sm text-gray-600 mt-1">Stato Generale</p>
            </div>

            {systemHealth.checks &&
              Object.entries(systemHealth.checks).map(([check, status]) => (
                <div key={check} className="text-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}
                  >
                    <span className="mr-2">{status ? '✅' : '❌'}</span>
                    {check.toUpperCase()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{status ? 'OK' : 'ERROR'}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Totali SAL</p>
                <p className="text-2xl font-semibold text-gray-900">{metrics.summary.totalSALs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Attesa</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.summary.pendingSALs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completati</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {metrics.summary.completedSALs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Importo Totale</p>
                <p className="text-2xl font-semibold text-gray-900">
                  €{(metrics.summary.totalAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metriche Performance</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {metrics.performance.averageCreateTime}ms
              </div>
              <p className="text-sm text-gray-600">Tempo Medio Creazione</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {metrics.performance.averageSignTime}ms
              </div>
              <p className="text-sm text-gray-600">Tempo Medio Firma</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.performance.averagePaymentTime}ms
              </div>
              <p className="text-sm text-gray-600">Tempo Medio Pagamento</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {metrics && metrics.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attività Recenti</h2>

          <div className="space-y-3">
            {metrics.recentActivity.slice(0, 10).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                  <span className="text-sm text-gray-600">SAL #{activity.salId}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">{activity.user}</span>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {metrics && metrics.recentActivity.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna Attività</h3>
          <p className="text-gray-600">
            Non ci sono ancora attività da mostrare per questo periodo.
          </p>
        </div>
      )}
    </div>
  );
}
