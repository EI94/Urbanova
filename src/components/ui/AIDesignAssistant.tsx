'use client';

import { useState } from 'react';

import {
  BrainIcon,
  TrendingUpIcon,
  LightbulbIcon,
  TargetIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  ZapIcon,
  MapPinIcon,
  ChartBarIcon,
} from '@/components/icons';

interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact: string;
  recommendations: string[];
  data?: any;
}

interface AIOptimization {
  id: string;
  zone: string;
  city: string;
  coordinates: any;
  recommendations: Array<{
    category: string;
    priority: string;
    description: string;
    impact: string;
    implementation: string;
  }>;
  constraints: any;
  opportunities: any;
}

interface AIDesignAssistantProps {
  insights: AIInsight[];
  optimization: AIOptimization | null;
  onZoneSelect: (zone: string) => void;
  onOptimize: () => void;
  loading: boolean;
  selectedZone: string;
}

export default function AIDesignAssistant({
  insights,
  optimization,
  onZoneSelect,
  onOptimize,
  loading,
  selectedZone,
}: AIDesignAssistantProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'optimization' | 'zones'>('insights');
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const zones = [
    { id: 'Appio', name: 'Appio', city: 'Roma', projects: 3, roi: '12.5%', trend: '+8.2%' },
    { id: 'Centro', name: 'Centro', city: 'Roma', projects: 2, roi: '18.5%', trend: '+15.3%' },
    { id: 'Eur', name: 'Eur', city: 'Roma', projects: 1, roi: '14.2%', trend: '+6.8%' },
    { id: 'Ostiense', name: 'Ostiense', city: 'Roma', projects: 2, roi: '16.8%', trend: '+12.1%' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'insights'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BrainIcon className="h-4 w-4 inline mr-2" />
          Insights AI
        </button>
        <button
          onClick={() => setActiveTab('optimization')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'optimization'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <TargetIcon className="h-4 w-4 inline mr-2" />
          Ottimizzazioni
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'zones'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <MapPinIcon className="h-4 w-4 inline mr-2" />
          Analisi Zone
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Insights AI Generati</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">AI Attiva</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Generazione insights AI...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map(insight => (
                  <div
                    key={insight.id}
                    onClick={() => setSelectedInsight(insight)}
                    className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-purple-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}
                      >
                        {insight.impact}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{insight.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BrainIcon className="h-4 w-4 text-purple-600" />
                        <span
                          className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}
                        >
                          {(insight.confidence * 100).toFixed(0)}% confidenza
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        {insight.recommendations.length} raccomandazioni
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ottimizzazioni AI</h3>
              <button
                onClick={onOptimize}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <ZapIcon className="h-4 w-4" />
                <span>Genera Ottimizzazioni</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Generazione ottimizzazioni...</span>
              </div>
            ) : optimization ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                      <span>Raccomandazioni AI</span>
                    </h4>

                    <div className="space-y-3">
                      {optimization.recommendations.map((rec, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {rec.description}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}
                            >
                              {rec.priority}
                            </span>
                          </div>

                          <div className="text-green-600 text-sm font-medium mb-1">
                            {rec.impact}
                          </div>
                          <div className="text-gray-600 text-xs">{rec.implementation}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Constraints & Opportunities */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
                        <span>Vincoli</span>
                      </h4>

                      <div className="space-y-2 text-sm">
                        {Object.entries(optimization.constraints).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700">{key}:</span>
                            <span className="font-medium text-gray-900">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <TrendingUpIcon className="h-5 w-5 text-blue-500" />
                        <span>Opportunità</span>
                      </h4>

                      <div className="space-y-2 text-sm">
                        {Object.entries(optimization.opportunities).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <TargetIcon className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-700">{key}:</span>
                            <span className="font-medium text-gray-900">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BrainIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Nessuna ottimizzazione disponibile
                </h4>
                <p className="text-gray-600 mb-4">
                  Clicca su "Genera Ottimizzazioni" per iniziare l'analisi AI
                </p>
              </div>
            )}
          </div>
        )}

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Analisi Zone</h3>
              <div className="text-sm text-gray-600">
                Seleziona una zona per analisi dettagliata
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map(zone => (
                <div
                  key={zone.id}
                  onClick={() => onZoneSelect(zone.id)}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all border-2 ${
                    selectedZone === zone.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                      <p className="text-sm text-gray-600">{zone.city}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{zone.roi}</div>
                      <div className="text-xs text-gray-500">ROI</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Progetti:</span>
                      <div className="font-medium text-gray-900">{zone.projects}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Trend:</span>
                      <div className="font-medium text-green-600">{zone.trend}</div>
                    </div>
                  </div>

                  {selectedZone === zone.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-purple-600">
                        <BrainIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Analisi AI attiva</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <BrainIcon className="h-6 w-6 text-purple-600" />
                  <span>{selectedInsight.title}</span>
                </h3>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Chiudi</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Descrizione</h4>
                  <p className="text-gray-600">{selectedInsight.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Confidenza AI:</span>
                    <div
                      className={`font-semibold ${getConfidenceColor(selectedInsight.confidence)}`}
                    >
                      {(selectedInsight.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Impatto:</span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${getImpactColor(selectedInsight.impact)}`}
                    >
                      {selectedInsight.impact}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Raccomandazioni</h4>
                  <div className="space-y-2">
                    {selectedInsight.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedInsight.data && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Dati Analisi</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(selectedInsight.data).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-600">{key}:</span>
                          <div className="font-medium text-gray-900">{value as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
