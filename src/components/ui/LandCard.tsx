'use client';

import React from 'react';
import { ScrapedLand } from '@/types/land';
import { 
  StarIcon, 
  EyeIcon, 
  CalculatorIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  EuroIcon,
  BuildingIcon,
  TrendingUpIcon,
  DocumentIcon
} from '@/components/icons';

interface LandCardProps {
  land: ScrapedLand;
  isFavorite: boolean;
  onToggleFavorite: (landId: string) => void;
  onCreateFeasibility: (land: ScrapedLand) => void;
  onViewDetails: (url: string) => void;
}

const LandCard: React.FC<LandCardProps> = ({
  land,
  isFavorite,
  onToggleFavorite,
  onCreateFeasibility,
  onViewDetails
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'basso':
      case 'molto basso':
        return 'text-emerald-600 bg-emerald-50';
      case 'medio':
        return 'text-yellow-600 bg-yellow-50';
      case 'alto':
      case 'molto alto':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Validazione dati reali
  const isDataValid = () => {
    return land.price > 0 && land.area > 0 && land.price < 100000000 && land.area < 100000;
  };

  const getPricePerSqm = () => {
    if (land.area > 0) {
      return Math.round(land.price / land.area);
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header con titolo e badge dati reali */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {land.title}
            </h3>
            <div className="flex items-center gap-2">
              {isDataValid() ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Dati Reali
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertTriangleIcon className="h-3 w-3 mr-1" />
                  Dati Incompleti
                </span>
              )}
              {land.aiScore && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAIScoreColor(land.aiScore)}`}>
                  AI Score: {land.aiScore}/100
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onToggleFavorite(land.id)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <StarIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Metriche principali - SOLO se dati validi */}
        {isDataValid() ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <EuroIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">Prezzo</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(land.price)}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <BuildingIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">Superficie</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {land.area} m²
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <TrendingUpIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">€/m²</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(getPricePerSqm())}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <DocumentIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">ROI Stimato</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {land.analysis?.estimatedROI ? `${land.analysis.estimatedROI}%` : 'N/A'}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Dati Incompleti</h4>
                <p className="text-sm text-red-700">
                  Prezzo o superficie non disponibili. Verificare l'annuncio originale.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Caratteristiche */}
        {land.features && land.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {land.features.map((feature, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Analisi AI se disponibile */}
        {land.analysis && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Analisi AI</span>
              {land.analysis.riskAssessment && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(land.analysis.riskAssessment)}`}>
                  {land.analysis.riskAssessment}
                </span>
              )}
            </div>
            <p className="text-sm text-blue-800">
              {land.analysis.recommendations?.[0] || 'Analisi disponibile'}
            </p>
          </div>
        )}

        {/* Fonte e timestamp */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center">
            <span className="mr-1">Fonte:</span>
            <span className="font-medium">{land.source}</span>
          </span>
          {land.timestamp && (
            <span>
              {new Date(land.timestamp).toLocaleDateString('it-IT')}
            </span>
          )}
        </div>

        {/* Azioni */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(land.url)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
            Vedi Annuncio
          </button>
          
          {isDataValid() && (
            <button
              onClick={() => onCreateFeasibility(land)}
              className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              title="Crea analisi di fattibilità"
            >
              <CalculatorIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandCard; 