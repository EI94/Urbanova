// 🎨 RESULT PREVIEW - Componente elegante per mostrare risultati analisi
// Design Johnny Ive - UX perfetta per risultati

import React from 'react';
import { X, TrendingUp, Building2, Euro, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface ResultPreviewProps {
  type: 'feasibility' | 'businessPlan' | 'sensitivity';
  data: any;
  onClose: () => void;
  onViewDetails: () => void;
}

export function ResultPreview({ type, data, onClose, onViewDetails }: ResultPreviewProps) {
  const getIcon = () => {
    switch (type) {
      case 'feasibility': return <Building2 className="w-6 h-6 text-blue-600" />;
      case 'businessPlan': return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'sensitivity': return <AlertCircle className="w-6 h-6 text-orange-600" />;
      default: return <CheckCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'feasibility': return 'Analisi Fattibilità';
      case 'businessPlan': return 'Business Plan';
      case 'sensitivity': return 'Analisi Sensibilità';
      default: return 'Risultato';
    }
  };

  const getStatusColor = (feasible: boolean) => {
    return feasible ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50';
  };

  const getStatusIcon = (feasible: boolean) => {
    return feasible ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
                <p className="text-sm text-gray-600">
                  {type === 'feasibility' ? data.location : data.projectName || 'Progetto'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {type === 'feasibility' && (
            <div className="space-y-6">
              {/* Risultati Chiave */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">ROI</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {data.roi ? `${data.roi.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Euro className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Margine</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {data.margin ? `€${(data.margin / 1000).toFixed(0)}k` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Fattibilità */}
              <div className={`p-4 rounded-xl ${getStatusColor(data.feasible)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(data.feasible)}
                  <span className="font-medium">Fattibilità</span>
                </div>
                <p className="text-lg">
                  {data.feasible ? '✅ Progetto fattibile' : '⚠️ Da valutare attentamente'}
                </p>
              </div>

              {/* Dettagli */}
              {data.summary && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-2">Sintesi</h3>
                  <p className="text-gray-700">{data.summary}</p>
                </div>
              )}
            </div>
          )}

          {type === 'businessPlan' && (
            <div className="space-y-6">
              {/* Indicatori Finanziari */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">ROI</span>
                  </div>
                  <p className="text-xl font-bold text-blue-900">
                    {data.roi ? `${data.roi.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Euro className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">NPV</span>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    {data.npv ? `€${(data.npv / 1000).toFixed(0)}k` : 'N/A'}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Payback</span>
                  </div>
                  <p className="text-xl font-bold text-purple-900">
                    {data.paybackPeriod ? `${data.paybackPeriod} anni` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Sintesi */}
              {data.summary && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-2">Sintesi</h3>
                  <p className="text-gray-700">{data.summary}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Vuoi vedere l'analisi dettagliata o modificare qualche parametro?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={onViewDetails}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Vai all'analisi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


