'use client';

import { useState } from 'react';
import { BrainIcon, TrendingUpIcon, BuildingIcon } from '@/components/icons';

interface AdvancedMapViewProps {
  projectLocations: any[];
  onLocationSelect: (location: any) => void;
  onZoneAnalysis: (zone: string) => void;
}

export default function AdvancedMapView({ 
  projectLocations, 
  onLocationSelect, 
  onZoneAnalysis 
}: AdvancedMapViewProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleZoneClick = (zone: string) => {
    setSelectedZone(zone);
    onZoneAnalysis(zone);
  };

  return (
    <div className="space-y-6">
      {/* Controlli Mappa Avanzata */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Mappa Avanzata con AI</h3>
        </div>
      </div>

      {/* Container Mappa Avanzata */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
          <div className="absolute inset-0 p-6">
            {/* Zone Principali con AI Insights */}
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Zona Appio - Roma con AI */}
              <div 
                onClick={() => handleZoneClick('Appio')}
                className="bg-gradient-to-br from-green-200 to-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Appio</h4>
                  <TrendingUpIcon className="h-5 w-5 text-green-600" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <BuildingIcon className="h-4 w-4 text-blue-600" />
                    <span>3 progetti</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    <span>ROI: 12.5%</span>
                  </div>
                  
                  {/* AI Prediction Badge */}
                  <div className="mt-3 p-2 bg-green-100 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BrainIcon className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-800">AI: +12.5% trend</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zona Centro - Milano con AI */}
              <div 
                onClick={() => handleZoneClick('Centro')}
                className="bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Centro</h4>
                  <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <BuildingIcon className="h-4 w-4 text-blue-600" />
                    <span>2 progetti</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    <span>ROI: 18.5%</span>
                  </div>
                  
                  {/* AI Prediction Badge */}
                  <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BrainIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">AI: +18.5% trend</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zona Centro - Torino con AI */}
              <div 
                onClick={() => handleZoneClick('Centro')}
                className="bg-gradient-to-br from-gray-200 to-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Centro</h4>
                  <TrendingUpIcon className="h-5 w-5 text-gray-600" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <BuildingIcon className="h-4 w-4 text-blue-600" />
                    <span>1 progetto</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    <span>ROI: 12.8%</span>
                  </div>
                  
                  {/* AI Prediction Badge */}
                  <div className="mt-3 p-2 bg-purple-100 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BrainIcon className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800">AI: +12.8% trend</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legenda Avanzata */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Legenda AI</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <span>ROI > 15%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <span>ROI 10-15%</span>
                </div>
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                  <BrainIcon className="h-3 w-3 text-purple-600" />
                  <span className="text-purple-600">AI Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
