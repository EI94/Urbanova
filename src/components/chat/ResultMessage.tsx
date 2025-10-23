// 🎨 RESULT MESSAGE - Componente per mostrare risultati nella chat
// Design Johnny Ive - Integrato perfettamente nella chat

import React from 'react';
import { TrendingUp, Building2, Euro, Calendar, CheckCircle, AlertCircle, Eye, Edit, Download, Save } from 'lucide-react';
import { ResultData } from '@/types/chat';

interface ResultMessageProps {
  resultData: ResultData;
  onActionClick: (action: any) => void;
}

export function ResultMessage({ resultData, onActionClick }: ResultMessageProps) {
  const getIcon = () => {
    switch (resultData.type) {
      case 'feasibility': return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'businessPlan': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'sensitivity': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'project': return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (resultData.type) {
      case 'feasibility': return 'Analisi Fattibilità';
      case 'businessPlan': return 'Business Plan';
      case 'sensitivity': return 'Analisi Sensibilità';
      case 'project': return 'Progetto';
      default: return 'Risultato';
    }
  };

  const getStatusColor = (feasible: boolean) => {
    return feasible ? 'text-green-600 bg-green-50 border-green-200' : 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getStatusIcon = (feasible: boolean) => {
    return feasible ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'view_details': return <Eye className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'export': return <Download className="w-4 h-4" />;
      case 'save': return <Save className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4 my-3">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        {getIcon()}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
          <p className="text-sm text-gray-600">
            {resultData.type === 'feasibility' ? resultData.data.location : 
             resultData.type === 'businessPlan' ? resultData.data.projectName : 
             'Progetto'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {resultData.type === 'feasibility' && (
          <>
            {/* Risultati Chiave */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">ROI</span>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {resultData.data.roi ? `${resultData.data.roi.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-xl border border-green-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Euro className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">Margine</span>
                </div>
                <p className="text-lg font-bold text-green-900">
                  {resultData.data.margin ? `€${(resultData.data.margin / 1000).toFixed(0)}k` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Fattibilità */}
            <div className={`p-3 rounded-xl border ${getStatusColor(resultData.data.feasible)}`}>
              <div className="flex items-center space-x-2 mb-1">
                {getStatusIcon(resultData.data.feasible)}
                <span className="font-medium text-sm">Fattibilità</span>
              </div>
              <p className="text-sm">
                {resultData.data.feasible ? '✅ Progetto fattibile' : '⚠️ Da valutare attentamente'}
              </p>
            </div>
          </>
        )}

        {resultData.type === 'businessPlan' && (
          <>
            {/* Indicatori Finanziari */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">ROI</span>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {resultData.data.roi ? `${resultData.data.roi.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-xl border border-green-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Euro className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-900">NPV</span>
                </div>
                <p className="text-lg font-bold text-green-900">
                  {resultData.data.npv ? `€${(resultData.data.npv / 1000).toFixed(0)}k` : 'N/A'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">Payback</span>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {resultData.data.paybackPeriod ? `${resultData.data.paybackPeriod} anni` : 'N/A'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Sintesi */}
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Sintesi</h4>
          <p className="text-gray-700 text-sm">{resultData.summary}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200">
        {resultData.actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action)}
            className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {getActionIcon(action.type)}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


