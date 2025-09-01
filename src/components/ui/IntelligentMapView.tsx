'use client';

import { useState, useEffect, useRef } from 'react';

import {
  MapPinIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
  BuildingIcon,
  UsersIcon,
  CarIcon,
  BusIcon,
  TrainIcon,
  WifiIcon,
  DropletIcon,
  ZapIcon,
  LeafIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EuroIcon,
} from '@/components/icons';

interface IntelligentMapViewProps {
  projectLocations: any[];
  onLocationSelect: (location: any) => void;
  onZoneAnalysis: (zone: string) => void;
}

export default function IntelligentMapView({
  projectLocations,
  onLocationSelect,
  onZoneAnalysis,
}: IntelligentMapViewProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<
    'projects' | 'trends' | 'opportunities' | 'infrastructure'
  >('projects');
  const [zoomLevel, setZoomLevel] = useState(8);
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [zoneInsights, setZoneInsights] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Simula analisi di zona intelligente
  const getZoneInsights = (zone: string) => {
    const zoneProjects = projectLocations.filter(p => p.zone === zone);

    if (zoneProjects.length === 0) return null;

    const totalBudget = zoneProjects.reduce((sum, p) => sum + p.budget.estimated, 0);
    const avgROI = zoneProjects.reduce((sum, p) => sum + p.marketData.roi, 0) / zoneProjects.length;
    const projectTypes = [...new Set(zoneProjects.map(p => p.buildingType))];

    // Calcola densità progetti (simulata)
    const density = zoneProjects.length * (1 + Math.random() * 2);

    // Determina trend di mercato
    let marketTrend = 'STABLE';
    if (avgROI > 15) marketTrend = 'RISING';
    else if (avgROI < 8) marketTrend = 'DECLINING';

    // Identifica opportunità
    const opportunities = [];
    if (density < 3) opportunities.push('Bassa densità - Alto potenziale sviluppo');
    if (avgROI > 12) opportunities.push('ROI alto - Investimento redditizio');
    if (projectTypes.length < 3) opportunities.push('Segmenti underserved - Diversificazione');

    // Analizza rischi
    const risks = [];
    if (density > 8) risks.push('Alta densità - Possibile saturazione');
    if (avgROI < 8) risks.push('ROI basso - Attenzione ai costi');

    return {
      zone,
      metrics: {
        projectCount: zoneProjects.length,
        totalBudget,
        averageROI: avgROI,
        density,
        projectTypes,
      },
      marketTrend,
      opportunities,
      risks,
      recommendations: [
        'Analizza la concorrenza locale',
        'Valuta i costi di sviluppo',
        'Considera i tempi di mercato',
      ],
    };
  };

  const handleZoneClick = (zone: string) => {
    setSelectedZone(zone);
    const insights = getZoneInsights(zone);
    setZoneInsights(insights);
    setShowZoneDetails(true);
    onZoneAnalysis(zone);
  };

  const getZoneColor = (zone: string) => {
    const insights = getZoneInsights(zone);
    if (!insights) return 'bg-gray-200';

    if (insights.metrics.averageROI > 15) return 'bg-green-200';
    if (insights.metrics.averageROI > 10) return 'bg-blue-200';
    if (insights.metrics.averageROI > 5) return 'bg-yellow-200';
    return 'bg-red-200';
  };

  const getZoneIcon = (zone: string) => {
    const insights = getZoneInsights(zone);
    if (!insights) return <MapPinIcon className="h-4 w-4" />;

    if (insights.marketTrend === 'RISING')
      return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (insights.marketTrend === 'DECLINING')
      return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
    return <MinusIcon className="h-4 w-4 text-gray-600" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Controlli Mappa */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Mappa Intelligente</h3>

          {/* Selettore Modalità */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('projects')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'projects'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Progetti
            </button>
            <button
              onClick={() => setViewMode('trends')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'trends'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trend
            </button>
            <button
              onClick={() => setViewMode('opportunities')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'opportunities'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Opportunità
            </button>
            <button
              onClick={() => setViewMode('infrastructure')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'infrastructure'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Infrastrutture
            </button>
          </div>
        </div>

        {/* Controlli Zoom */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 w-8 text-center">{zoomLevel}x</span>
          <button
            onClick={() => setZoomLevel(Math.min(20, zoomLevel + 1))}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Container Mappa */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div
          ref={mapContainerRef}
          className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden"
        >
          {/* Simulazione Mappa Interattiva con Zone Intelligenti */}
          <div className="absolute inset-0 p-6">
            {/* Zone Principali */}
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Zona Appio - Roma */}
              <div
                onClick={() => handleZoneClick('Appio')}
                className={`${getZoneColor('Appio')} rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Appio</h4>
                  {getZoneIcon('Appio')}
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
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-4 w-4 text-purple-600" />
                    <span>Densità: 3.2/km²</span>
                  </div>
                </div>
              </div>

              {/* Zona Centro - Milano */}
              <div
                onClick={() => handleZoneClick('Centro')}
                className={`${getZoneColor('Centro')} rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Centro</h4>
                  {getZoneIcon('Centro')}
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
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-4 w-4 text-purple-600" />
                    <span>Densità: 4.1/km²</span>
                  </div>
                </div>
              </div>

              {/* Zona Centro - Torino */}
              <div
                onClick={() => handleZoneClick('Centro')}
                className={`${getZoneColor('Centro')} rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Centro</h4>
                  {getZoneIcon('Centro')}
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
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-4 w-4 text-purple-600" />
                    <span>Densità: 1.8/km²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicatori di Trend */}
            {viewMode === 'trends' && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <h4 className="font-medium text-gray-900 mb-3">Trend di Mercato</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Appio (Roma)</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">+9.4%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Centro (Milano)</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">+8.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Centro (Torino)</span>
                    <div className="flex items-center space-x-1">
                      <MinusIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">+2.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Indicatori di Opportunità */}
            {viewMode === 'opportunities' && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <h4 className="font-medium text-gray-900 mb-3">Opportunità Identificate</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Segmento Residenziale</p>
                      <p className="text-xs text-gray-600">Alta domanda, ROI 12.5%</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Uffici Moderni</p>
                      <p className="text-xs text-gray-600">Segmento underserved</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rigenerazione Urbana</p>
                      <p className="text-xs text-gray-600">Bassa densità progetti</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Indicatori di Infrastrutture */}
            {viewMode === 'infrastructure' && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <h4 className="font-medium text-gray-900 mb-3">Infrastrutture</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BusIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Trasporto</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <WifiIcon className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Internet</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">90%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DropletIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Acqua</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ZapIcon className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-600">Elettricità</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Legenda */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">Legenda</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <span>ROI &gt; 15%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <span>ROI 10-15%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>ROI 5-10%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-200 rounded"></div>
                  <span>ROI &lt; 5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dettagli Zona */}
      {showZoneDetails && zoneInsights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Analisi Zona: {zoneInsights.zone}</h3>
            <button
              onClick={() => setShowZoneDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Chiudi</span>×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metriche Principali */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Metriche Principali</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progetti</span>
                  <span className="font-medium">{zoneInsights.metrics.projectCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget Totale</span>
                  <span className="font-medium">
                    {formatCurrency(zoneInsights.metrics.totalBudget)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ROI Medio</span>
                  <span className="font-medium">{zoneInsights.metrics.averageROI.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Densità</span>
                  <span className="font-medium">{zoneInsights.metrics.density.toFixed(1)}/km²</span>
                </div>
              </div>
            </div>

            {/* Opportunità */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Opportunità</h4>
              <div className="space-y-2">
                {zoneInsights.opportunities.map((opp: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{opp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rischi */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Rischi</h4>
              <div className="space-y-2">
                {zoneInsights.risks.map((risk: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raccomandazioni */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Raccomandazioni</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {zoneInsights.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <ClockIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Azioni */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => onLocationSelect(zoneInsights)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2 inline" />
              Analizza Dettagli
            </button>
            <button
              onClick={() => onZoneAnalysis(zoneInsights.zone)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ChartBarIcon className="h-4 w-4 mr-2 inline" />
              Report Completo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
