'use client';

import React from 'react';
import { 
  StarIcon, 
  EyeIcon, 
  CalculatorIcon, 
  LocationIcon,
  EuroIcon,
  BuildingIcon,
  TrendingUpIcon,
  ShieldIcon,
  BrainIcon
} from '@/components/icons';

interface LandCardProps {
  land: any;
  isFavorite: boolean;
  onToggleFavorite: (landId: string) => void;
  onCreateFeasibility: (land: any) => void;
  onViewDetails: (url: string) => void;
}

export default function LandCard({
  land,
  isFavorite,
  onToggleFavorite,
  onCreateFeasibility,
  onViewDetails
}: LandCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'basso':
      case 'molto basso':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'medio':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'alto':
      case 'molto alto':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 15) return 'text-emerald-600';
    if (roi >= 10) return 'text-blue-600';
    if (roi >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group">
      {/* Header con badge e preferiti */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {land.title}
          </h3>
          <button
            onClick={() => onToggleFavorite(land.id)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' 
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
          >
            <StarIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Badge AI Score e Rischio */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAIScoreColor(land.aiScore)}`}>
            <BrainIcon className="inline h-3 w-3 mr-1" />
            AI Score: {land.aiScore}/100
          </span>
          {land.analysis?.riskAssessment && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(land.analysis.riskAssessment)}`}>
              <ShieldIcon className="inline h-3 w-3 mr-1" />
              {land.analysis.riskAssessment}
            </span>
          )}
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="p-4">
        {/* Metriche principali */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <EuroIcon className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Prezzo</p>
            <p className="font-bold text-gray-900 text-lg">{formatCurrency(land.price)}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <BuildingIcon className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Superficie</p>
            <p className="font-bold text-gray-900 text-lg">{land.area} m²</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUpIcon className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">€/m²</p>
            <p className="font-bold text-gray-900 text-lg">
              {formatCurrency(Math.round(land.price / land.area))}
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CalculatorIcon className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">ROI Stimato</p>
            <p className={`font-bold text-lg ${getROIColor(land.analysis?.estimatedROI || 0)}`}>
              {land.analysis?.estimatedROI ? `${land.analysis.estimatedROI}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Descrizione */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {land.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-4">
          {land.features.slice(0, 3).map((feature: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
              {feature}
            </span>
          ))}
          {land.features.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{land.features.length - 3}
            </span>
          )}
        </div>

        {/* Fonte */}
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
          <LocationIcon className="h-3 w-3" />
          <span>Fonte: {land.source}</span>
        </div>

        {/* Azioni */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(land.url)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <EyeIcon className="h-4 w-4" />
            Vedi Annuncio
          </button>
          
          <button
            onClick={() => onCreateFeasibility(land)}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Crea analisi di fattibilità"
          >
            <CalculatorIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 