'use client';

import React from 'react';

import {
  StarIcon,
  EyeIcon,
  CalculatorIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  EuroIcon,
  BuildingIcon,
  TrendingUpIcon,
  DocumentIcon,
  LocationIcon,
} from '@/components/icons';
import { ScrapedLand } from '@/types/land';

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
  onViewDetails,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatArea = (value: number) => {
    return `${value.toLocaleString()} m²`;
  };

  // Determina se i dati sono reali o mancanti
  const hasRealPrice = land.hasRealPrice !== false && land.price > 0;
  const hasRealArea = land.hasRealArea !== false && land.area > 0;
  const isDataComplete = hasRealPrice && hasRealArea;
  const hasAnyRealData = hasRealPrice || hasRealArea;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      {/* Header con badge di veridicità */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{land.title}</h3>
          <button
            onClick={() => onToggleFavorite(land.id)}
            className="text-gray-400 hover:text-yellow-500 transition-colors"
          >
            <StarIcon className={`h-5 w-5 ${isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
          </button>
        </div>

        {/* Badge di veridicità dati */}
        <div className="flex gap-2 mb-3">
          {isDataComplete ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Dati Reali
            </span>
          ) : hasAnyRealData ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <AlertTriangleIcon className="h-3 w-3 mr-1" />
              Dati Parziali
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangleIcon className="h-3 w-3 mr-1" />
              Dati Mancanti
            </span>
          )}

          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {land.source}
          </span>
        </div>

        {/* Prezzo e Area */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <EuroIcon className="h-4 w-4 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Prezzo</p>
              <p className="font-semibold text-gray-900">
                {hasRealPrice ? formatCurrency(land.price) : 'Non disponibile'}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <BuildingIcon className="h-4 w-4 text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Area</p>
              <p className="font-semibold text-gray-900">
                {hasRealArea ? formatArea(land.area) : 'Non disponibile'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <LocationIcon className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600">{land.location}</span>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{land.description}</p>

        {/* Features */}
        {land.features && land.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {land.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Azioni */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(land.url)}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Visualizza
          </button>

          {/* Pulsante fattibilità solo se abbiamo dati sufficienti */}
          {hasAnyRealData && (
            <button
              onClick={() => onCreateFeasibility(land)}
              className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              <CalculatorIcon className="h-4 w-4 mr-2" />
              Analisi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandCard;
