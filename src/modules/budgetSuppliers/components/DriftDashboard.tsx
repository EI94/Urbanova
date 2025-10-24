'use client';

/**
 * 📊 DRIFT DASHBOARD
 * 
 * Dashboard per visualizzazione scostamenti Budget vs Contratto vs Consuntivo
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  BarChart3,
  PieChart,
  Target,
  DollarSign,
  Percent,
  Eye,
  Download,
  RefreshCw,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { ProgressService, DriftMetrics, ProgressSummary, ProgressAlert } from '../api/progress';

interface DriftDashboardProps {
  projectId: string;
  onRefresh?: () => void;
}

export function DriftDashboard({ projectId, onRefresh }: DriftDashboardProps) {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    loadDriftData();
  }, [projectId]);

  const loadDriftData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const driftSummary = await ProgressService.generateDriftDashboard(projectId);
      setSummary(driftSummary);
      
    } catch (error: any) {
      console.error('❌ [DRIFT] Errore caricamento dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDriftData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'yellow': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'red': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-red-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-green-600" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDriftColor = (driftPercentage: number): string => {
    if (Math.abs(driftPercentage) > 10) return 'text-red-600';
    if (Math.abs(driftPercentage) > 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDriftBackgroundColor = (driftPercentage: number): string => {
    if (Math.abs(driftPercentage) > 10) return 'bg-red-50 border-red-200';
    if (Math.abs(driftPercentage) > 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportReport = async () => {
    try {
      const blob = await ProgressService.exportProgressReport(projectId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drift-report-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('❌ [DRIFT] Errore esportazione:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Caricamento dashboard scostamenti...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-600 font-medium">Errore caricamento dashboard</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600">Nessun dato disponibile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Scostamenti</h2>
          <p className="text-gray-600 mt-1">
            Analisi Budget vs Contratto vs Consuntivo
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{viewMode === 'overview' ? 'Dettagliato' : 'Panoramica'}</span>
          </button>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Esporta</span>
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Aggiorna</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Budget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Totale</p>
              <p className="text-2xl font-bold text-gray-900">
                €{summary.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Contract */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contratto Totale</p>
              <p className="text-2xl font-bold text-gray-900">
                €{summary.totalContract.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Consuntivo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consuntivo Totale</p>
              <p className="text-2xl font-bold text-gray-900">
                €{summary.totalConsuntivo.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Drift Percentage */}
        <div className={`rounded-lg shadow-sm border p-6 ${getDriftBackgroundColor(summary.driftPercentage)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scostamento</p>
              <p className={`text-2xl font-bold ${getDriftColor(summary.driftPercentage)}`}>
                {summary.driftPercentage > 0 ? '+' : ''}{summary.driftPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Alerts */}
      {summary.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Alert e Suggerimenti</span>
          </h3>
          
          <div className="space-y-3">
            {summary.alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{alert.message}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.suggestion}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Categoria: {alert.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scostamenti per Categoria</h3>
        
        <div className="space-y-4">
          {summary.categories.map((category) => (
            <div key={category.category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-gray-900">{category.category}</h4>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                    {getStatusIcon(category.status)}
                    <span className="ml-1 capitalize">{category.status}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(category.trend)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getDriftColor(category.driftPercentage)}`}>
                    {category.driftPercentage > 0 ? '+' : ''}{category.driftPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {category.driftAmount > 0 ? '+' : ''}€{category.driftAmount.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Budget</div>
                  <div className="font-medium text-blue-600">
                    €{category.budget.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Migliore Offerta</div>
                  <div className="font-medium text-green-600">
                    €{category.bestOffer.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Contratto</div>
                  <div className="font-medium text-purple-600">
                    €{category.contract.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Consuntivo</div>
                  <div className="font-medium text-orange-600">
                    €{category.consuntivo.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {viewMode === 'detailed' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Varianti</div>
                      <div className="font-medium text-red-600">
                        €{category.variations.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Completamento</div>
                      <div className="font-medium text-gray-900">
                        {category.contract > 0 ? ((category.consuntivo / category.contract) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso Completamento</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Completamento Generale</span>
            <span className="text-sm font-bold text-gray-900">
              {summary.completionPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(summary.completionPercentage, 100)}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm text-center">
            <div>
              <div className="text-gray-600">Budget</div>
              <div className="font-semibold text-blue-600">
                €{summary.totalBudget.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Contratto</div>
              <div className="font-semibold text-purple-600">
                €{summary.totalContract.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Consuntivo</div>
              <div className="font-semibold text-green-600">
                €{summary.totalConsuntivo.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
