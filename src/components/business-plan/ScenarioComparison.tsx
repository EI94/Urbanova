'use client';

/**
 * 📊 SCENARIO COMPARISON
 * 
 * Componente per confronto visivo di scenari Business Plan multipli
 * Con ranking, raccomandazioni e punti di equivalenza
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Award, AlertTriangle, Check, Info, ArrowRight, Zap } from 'lucide-react';
import type { BusinessPlanOutput, ScenarioComparison as ScenarioComparisonType } from '@/lib/businessPlanService';

interface ScenarioComparisonProps {
  comparison: ScenarioComparisonType;
  onSelectScenario?: (scenarioId: string) => void;
  selectedScenarioId?: string;
}

export default function ScenarioComparison({
  comparison,
  onSelectScenario,
  selectedScenarioId
}: ScenarioComparisonProps) {
  const [expandedMetrics, setExpandedMetrics] = useState(false);
  
  // Ottieni scenario migliore (rank 1)
  const bestScenario = comparison.scenarios.find(
    s => comparison.ranking.find(r => r.scenarioId === s.scenarioId)?.rank === 1
  )!;
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT', { 
      maximumFractionDigits: 0 
    }).format(Math.round(num));
  };
  
  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };
  
  const getPerformanceBadge = (rank: number) => {
    if (rank === 1) return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <Award className="w-4 h-4" />,
      label: 'Migliore'
    };
    if (rank === 2) return {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Buono'
    };
    return {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <TrendingDown className="w-4 h-4" />,
      label: `#${rank}`
    };
  };
  
  const getMetricDelta = (scenario: BusinessPlanOutput, metricName: 'npv' | 'irr' | 'margin') => {
    let scenarioValue: number;
    let bestValue: number;
    
    switch (metricName) {
      case 'npv':
        scenarioValue = scenario.metrics.npv;
        bestValue = bestScenario.metrics.npv;
        break;
      case 'irr':
        scenarioValue = scenario.metrics.irr;
        bestValue = bestScenario.metrics.irr;
        break;
      case 'margin':
        scenarioValue = scenario.summary.marginPercentage;
        bestValue = bestScenario.summary.marginPercentage;
        break;
    }
    
    const delta = scenarioValue - bestValue;
    const deltaPercent = bestValue !== 0 ? (delta / bestValue) * 100 : 0;
    
    return {
      value: scenarioValue,
      delta,
      deltaPercent,
      isPositive: delta >= 0,
      isBest: Math.abs(delta) < 0.01
    };
  };
  
  return (
    <div className="space-y-6">
      {/* Header con Migliore Scenario */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Award className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">Scenario Migliore</h3>
            </div>
            <h4 className="text-2xl font-bold text-green-800 mb-3">{bestScenario.scenarioName}</h4>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">VAN</div>
                <div className="text-lg font-bold text-green-600">
                  €{formatNumber(bestScenario.metrics.npv / 1000)}k
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">TIR</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatPercentage(bestScenario.metrics.irr)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Margine</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatPercentage(bestScenario.summary.marginPercentage)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">DSCR</div>
                <div className="text-lg font-bold text-orange-600">
                  {bestScenario.metrics.dscr.min.toFixed(2)}x
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Raccomandazioni */}
      {comparison.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">Raccomandazioni</h4>
              <ul className="space-y-2">
                {comparison.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start">
                    <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabella Confronto Scenari */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Confronto Dettagliato</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scenario
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAN (€)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TIR (%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margine (%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DSCR
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payback
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {comparison.ranking.map((rankItem) => {
                const scenario = comparison.scenarios.find(s => s.scenarioId === rankItem.scenarioId)!;
                const badge = getPerformanceBadge(rankItem.rank);
                const isSelected = selectedScenarioId === scenario.scenarioId;
                
                const npvDelta = getMetricDelta(scenario, 'npv');
                const irrDelta = getMetricDelta(scenario, 'irr');
                const marginDelta = getMetricDelta(scenario, 'margin');
                
                return (
                  <tr 
                    key={scenario.scenarioId}
                    className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {rankItem.rank === 1 && <Award className="w-5 h-5 text-green-500" />}
                        <div>
                          <div className="font-medium text-gray-900">{scenario.scenarioName}</div>
                          <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs border mt-1 ${badge.color}`}>
                            {badge.icon}
                            <span>{badge.label}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-2xl font-bold text-gray-900">
                        {rankItem.rank}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium text-gray-900">
                        €{formatNumber(scenario.metrics.npv)}
                      </div>
                      {!npvDelta.isBest && (
                        <div className={`text-xs ${npvDelta.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {npvDelta.isPositive ? '+' : ''}{formatNumber(npvDelta.delta)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium text-gray-900">
                        {formatPercentage(scenario.metrics.irr)}
                      </div>
                      {!irrDelta.isBest && (
                        <div className={`text-xs ${irrDelta.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {irrDelta.isPositive ? '+' : ''}{irrDelta.delta.toFixed(1)}pt
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium text-gray-900">
                        {formatPercentage(scenario.summary.marginPercentage)}
                      </div>
                      {!marginDelta.isBest && (
                        <div className={`text-xs ${marginDelta.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {marginDelta.isPositive ? '+' : ''}{marginDelta.delta.toFixed(1)}pt
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`font-medium ${scenario.metrics.dscr.min < 1.2 ? 'text-red-600' : 'text-gray-900'}`}>
                        {scenario.metrics.dscr.min.toFixed(2)}x
                      </div>
                      {scenario.metrics.dscr.min < 1.2 && (
                        <div className="text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Sotto soglia
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium text-gray-900">
                        {scenario.metrics.payback === 999 ? '∞' : `${scenario.metrics.payback.toFixed(1)}y`}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {onSelectScenario && (
                        <button
                          onClick={() => onSelectScenario(scenario.scenarioId)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? 'Selezionato' : 'Seleziona'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Punti di Equivalenza (Leve Chiave) */}
      {comparison.equivalencePoints.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start space-x-3 mb-4">
            <Zap className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-1">Leve di Negoziazione</h4>
              <p className="text-sm text-purple-700">Quanto serve per pareggiare lo scenario migliore</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {comparison.equivalencePoints.map((point, i) => {
              const fromScenario = comparison.scenarios.find(s => s.scenarioId === point.fromScenario);
              
              return (
                <div key={i} className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{fromScenario?.scenarioName}</span>
                        <ArrowRight className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-900">Pareggio</span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{point.explanation}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="bg-purple-100 rounded-lg px-3 py-1">
                          <span className="text-purple-600 font-medium">{point.lever}:</span>
                          <span className="text-purple-900 font-bold ml-1">
                            €{formatNumber(point.requiredValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Alert Scenari */}
      {comparison.scenarios.some(s => s.alerts.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900 mb-2">Alert e Warning</h4>
              <div className="space-y-3">
                {comparison.scenarios.map(scenario => (
                  scenario.alerts.length > 0 && (
                    <div key={scenario.scenarioId} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2">{scenario.scenarioName}</div>
                      <ul className="space-y-1">
                        {scenario.alerts.map((alert, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            {alert.type === 'ERROR' ? (
                              <AlertTriangle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-medium">{alert.message}</span>
                              <span className="text-gray-600"> - {alert.impact}</span>
                              {alert.recommendation && (
                                <div className="text-xs text-blue-600 mt-0.5">💡 {alert.recommendation}</div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Metriche Espanse (Opzionali) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedMetrics(!expandedMetrics)}
          className="w-full px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-900">Metriche Aggiuntive</span>
          <span className="text-sm text-gray-500">{expandedMetrics ? 'Nascondi' : 'Mostra'}</span>
        </button>
        
        {expandedMetrics && (
          <div className="p-6 space-y-4">
            {comparison.scenarios.map(scenario => (
              <div key={scenario.scenarioId} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">{scenario.scenarioName}</h5>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ricavi Totali</div>
                    <div className="font-medium text-gray-900">
                      €{formatNumber(scenario.summary.totalRevenue)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Costi Totali</div>
                    <div className="font-medium text-gray-900">
                      €{formatNumber(scenario.summary.totalCosts)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Utile Netto</div>
                    <div className="font-medium text-green-600">
                      €{formatNumber(scenario.summary.profit)}
                    </div>
                  </div>
                  
                  {scenario.metrics.ltv > 0 && (
                    <>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">LTV</div>
                        <div className="font-medium text-gray-900">
                          {formatPercentage(scenario.metrics.ltv)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-500 mb-1">LTC</div>
                        <div className="font-medium text-gray-900">
                          {formatPercentage(scenario.metrics.ltc)}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <div className="text-xs text-gray-500 mb-1">DSCR Medio</div>
                    <div className="font-medium text-gray-900">
                      {scenario.metrics.dscr.average.toFixed(2)}x
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

