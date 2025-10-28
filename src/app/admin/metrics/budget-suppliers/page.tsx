/**
 * 📊 BUDGET SUPPLIERS ADMIN METRICS DASHBOARD
 * 
 * Dashboard admin per metriche Budget & Suppliers con sparkline
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  DollarSign, 
  Package, 
  AlertTriangle,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Activity
} from 'lucide-react';

// Mock data per demo
const mockMetrics = {
  medianRfpToAwardTime: 7.2, // days
  itemsWithValidOfferPercentage: 87.5,
  budgetVsContractDelta: [
    { category: 'Strutture', deltaPercentage: -5.2, deltaAmount: -15000 },
    { category: 'Impianti', deltaPercentage: 3.1, deltaAmount: 8000 },
    { category: 'Finiture', deltaPercentage: -2.8, deltaAmount: -5000 },
    { category: 'Esterni', deltaPercentage: 1.5, deltaAmount: 2000 }
  ],
  bundleVsSinglePercentage: 68.3,
  driftAlertsCount: 12,
  periodStart: new Date('2024-01-01'),
  periodEnd: new Date('2024-01-31'),
  totalRfps: 45,
  totalContracts: 32,
  totalItems: 156
};

const mockSparklines = [
  {
    metric: 't_rfp_to_award_ms',
    values: [8.5, 7.8, 7.2, 6.9],
    timestamps: [
      new Date('2024-01-07'),
      new Date('2024-01-14'),
      new Date('2024-01-21'),
      new Date('2024-01-28')
    ],
    currentValue: 6.9,
    previousValue: 7.2,
    changePercentage: -4.2,
    trend: 'down' as const
  },
  {
    metric: 'items_with_valid_offer_pct',
    values: [82.1, 84.3, 86.7, 87.5],
    timestamps: [
      new Date('2024-01-07'),
      new Date('2024-01-14'),
      new Date('2024-01-21'),
      new Date('2024-01-28')
    ],
    currentValue: 87.5,
    previousValue: 86.7,
    changePercentage: 0.9,
    trend: 'up' as const
  },
  {
    metric: 'delta_budget_vs_contract',
    values: [-2.1, -3.5, -4.8, -5.2],
    timestamps: [
      new Date('2024-01-07'),
      new Date('2024-01-14'),
      new Date('2024-01-21'),
      new Date('2024-01-28')
    ],
    currentValue: -5.2,
    previousValue: -4.8,
    changePercentage: -8.3,
    trend: 'down' as const
  },
  {
    metric: 'bundle_vs_single_pct',
    values: [62.1, 64.8, 66.5, 68.3],
    timestamps: [
      new Date('2024-01-07'),
      new Date('2024-01-14'),
      new Date('2024-01-21'),
      new Date('2024-01-28')
    ],
    currentValue: 68.3,
    previousValue: 66.5,
    changePercentage: 2.7,
    trend: 'up' as const
  },
  {
    metric: 'drift_alerts_count',
    values: [18, 15, 13, 12],
    timestamps: [
      new Date('2024-01-07'),
      new Date('2024-01-14'),
      new Date('2024-01-21'),
      new Date('2024-01-28')
    ],
    currentValue: 12,
    previousValue: 13,
    changePercentage: -7.7,
    trend: 'down' as const
  }
];

// Sparkline component
const Sparkline: React.FC<{
  data: typeof mockSparklines[0];
  title: string;
  icon: React.ReactNode;
  color: string;
  formatValue: (value: number) => string;
}> = ({ data, title, icon, color, formatValue }) => {
  const maxValue = Math.max(...data.values);
  const minValue = Math.min(...data.values);
  const range = maxValue - minValue;
  
  const points = data.values.map((value, index) => {
    const x = (index / (data.values.length - 1)) * 100;
    const y = range > 0 ? 100 - ((value - minValue) / range) * 100 : 50;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatValue(data.currentValue)}
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${
          data.trend === 'up' ? 'text-green-600' : 
          data.trend === 'down' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {data.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
           data.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
           <Activity className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {Math.abs(data.changePercentage).toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="h-16 w-full">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke={data.trend === 'up' ? '#10B981' : data.trend === 'down' ? '#EF4444' : '#6B7280'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="100"
            cy={range > 0 ? 100 - ((data.currentValue - minValue) / range) * 100 : 50}
            r="2"
            fill={data.trend === 'up' ? '#10B981' : data.trend === 'down' ? '#EF4444' : '#6B7280'}
          />
        </svg>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Ultime 4 settimane
      </div>
    </div>
  );
};

// Budget vs Contract Delta component
const BudgetVsContractDelta: React.FC<{
  data: typeof mockMetrics.budgetVsContractDelta;
}> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-100">
          <DollarSign className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">Delta Budget vs Contratto</h3>
          <p className="text-lg font-semibold text-gray-900">Per Categoria</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                item.deltaPercentage > 0 ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">{item.category}</span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-semibold ${
                item.deltaPercentage > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {item.deltaPercentage > 0 ? '+' : ''}{item.deltaPercentage.toFixed(1)}%
              </div>
              <div className={`text-xs ${
                item.deltaAmount > 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {item.deltaAmount > 0 ? '+' : ''}€{Math.abs(item.deltaAmount).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Summary stats component
const SummaryStats: React.FC<{
  metrics: typeof mockMetrics;
}> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">RFP Totali</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalRfps}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-100">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Contratti</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalContracts}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Items Totali</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalItems}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BudgetSuppliersMetricsPage() {
  const [metrics, setMetrics] = useState(mockMetrics);
  const [sparklines, setSparklines] = useState(mockSparklines);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('4w'); // 4 weeks
  
  useEffect(() => {
    // Simulate loading metrics
    setLoading(true);
    setTimeout(() => {
      setMetrics(mockMetrics);
      setSparklines(mockSparklines);
      setLoading(false);
    }, 1000);
  }, [period]);
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget & Suppliers Metrics</h1>
            <p className="text-gray-600 mt-2">
              Metriche e indicatori per il modulo Budget & Suppliers
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1w">Ultima settimana</option>
                <option value="4w">Ultime 4 settimane</option>
                <option value="12w">Ultime 12 settimane</option>
                <option value="1y">Ultimo anno</option>
              </select>
            </div>
            
            <button 
              onClick={() => setLoading(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Aggiorna</span>
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <SummaryStats metrics={metrics} />
        
        {/* Main KPI Cards with Sparklines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Sparkline
            data={sparklines[0]}
            title="Tempo RFP → Award"
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            color="bg-blue-100"
            formatValue={(value) => `${value.toFixed(1)} giorni`}
          />
          
          <Sparkline
            data={sparklines[1]}
            title="Items con Offerta Valida"
            icon={<Target className="w-5 h-5 text-green-600" />}
            color="bg-green-100"
            formatValue={(value) => `${value.toFixed(1)}%`}
          />
          
          <Sparkline
            data={sparklines[2]}
            title="Delta Budget vs Contratto"
            icon={<DollarSign className="w-5 h-5 text-red-600" />}
            color="bg-red-100"
            formatValue={(value) => `${value.toFixed(1)}%`}
          />
          
          <Sparkline
            data={sparklines[3]}
            title="Bundle vs Singoli"
            icon={<Package className="w-5 h-5 text-purple-600" />}
            color="bg-purple-100"
            formatValue={(value) => `${value.toFixed(1)}%`}
          />
          
          <Sparkline
            data={sparklines[4]}
            title="Drift Alerts"
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
            color="bg-orange-100"
            formatValue={(value) => `${value.toFixed(0)}`}
          />
        </div>
        
        {/* Budget vs Contract Delta Detail */}
        <BudgetVsContractDelta data={metrics.budgetVsContractDelta} />
        
        {/* Period Info */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Periodo di Analisi</h3>
              <p className="text-gray-900">
                {metrics.periodStart.toLocaleDateString('it-IT')} - {metrics.periodEnd.toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 flex items-center space-x-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-700">Caricamento metriche...</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

