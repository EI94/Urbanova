'use client';

import { useState, useEffect } from 'react';

import {
  MapIcon,
  TargetIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  RulerIcon,
  BuildingIcon,
  TreeIcon,
  CarIcon,
  BusIcon,
  TrainIcon,
  WifiIcon,
  DropletIcon,
  ZapIcon,
  LeafIcon,
} from '@/components/icons';

interface TerrainAnalysisAdvancedProps {
  userLocation: { lat: number; lng: number } | null;
  onLocationUpdate: (location: { lat: number; lng: number } | null) => void;
  onZoneAnalysis: (zone: string) => void;
}

interface TerrainData {
  elevation: number;
  slope: number;
  soilType: string;
  seismicZone: string;
  floodRisk: string;
  landslideRisk: string;
  groundwater: number;
  vegetation: string;
  accessibility: {
    roads: string;
    publicTransport: string;
    parking: string;
  };
  infrastructure: {
    electricity: string;
    water: string;
    sewage: string;
    internet: string;
  };
  environmental: {
    airQuality: string;
    noiseLevel: string;
    greenCoverage: string;
    protectedAreas: string[];
  };
  urbanPlanning: {
    zoning: string;
    maxHeight: string;
    maxCoverage: string;
    minDistance: string;
    parkingRequired: string;
  };
}

export default function TerrainAnalysisAdvanced({
  userLocation,
  onLocationUpdate,
  onZoneAnalysis,
}: TerrainAnalysisAdvancedProps) {
  const [terrainData, setTerrainData] = useState<TerrainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'technical' | 'environmental' | 'planning'
  >('overview');
  const [selectedZone, setSelectedZone] = useState<string>('');

  const zones = [
    { id: 'Appio', name: 'Appio', city: 'Roma', risk: 'LOW', opportunities: 'HIGH' },
    { id: 'Centro', name: 'Centro', city: 'Roma', risk: 'MEDIUM', opportunities: 'VERY_HIGH' },
    { id: 'Eur', name: 'Eur', city: 'Roma', risk: 'LOW', opportunities: 'HIGH' },
    { id: 'Ostiense', name: 'Ostiense', city: 'Roma', risk: 'MEDIUM', opportunities: 'HIGH' },
  ];

  useEffect(() => {
    if (userLocation) {
      analyzeTerrain(userLocation);
    }
  }, [userLocation]);

  const analyzeTerrain = async (location: { lat: number; lng: number }) => {
    setLoading(true);

    try {
      // Simula analisi terreno realistica
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTerrainData: TerrainData = {
        elevation: 45 + Math.random() * 20,
        slope: Math.random() * 5,
        soilType: 'Argilla limosa compatta',
        seismicZone: 'Zona 2 - Sismicità media',
        floodRisk: 'Rischio basso',
        landslideRisk: 'Rischio molto basso',
        groundwater: 8 + Math.random() * 4,
        vegetation: 'Vegetazione urbana mista',
        accessibility: {
          roads: 'Strade principali a 200m',
          publicTransport: 'Metro A a 500m, bus a 100m',
          parking: 'Parcheggi pubblici a 300m',
        },
        infrastructure: {
          electricity: 'Rete elettrica disponibile',
          water: 'Acquedotto a 150m',
          sewage: 'Fognatura a 200m',
          internet: 'Fibra ottica disponibile',
        },
        environmental: {
          airQuality: 'Buona (AQI: 45)',
          noiseLevel: 'Moderato (55 dB)',
          greenCoverage: '25% area verde',
          protectedAreas: ['Parco Appia Antica'],
        },
        urbanPlanning: {
          zoning: 'Residenziale R2',
          maxHeight: '15m (4 piani)',
          maxCoverage: '60% del lotto',
          minDistance: '10m dal confine',
          parkingRequired: '1 posto per unità abitativa',
        },
      };

      setTerrainData(mockTerrainData);
    } catch (error) {
      console.error('❌ [TerrainAnalysis] Errore analisi terreno:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'VERY_HIGH':
        return 'text-green-600 bg-green-100';
      case 'HIGH':
        return 'text-blue-600 bg-blue-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleZoneSelect = (zone: string) => {
    setSelectedZone(zone);
    onZoneAnalysis(zone);
  };

  const requestLocation = async () => {
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });

        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        onLocationUpdate(newLocation);
      }
    } catch (error) {
      console.warn('⚠️ [TerrainAnalysis] Errore geolocalizzazione:', error);
    }
  };

  if (!userLocation) {
    return (
      <div className="text-center py-12">
        <MapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Posizione non disponibile</h3>
        <p className="text-gray-600 mb-4">Attiva la geolocalizzazione per analizzare il terreno</p>
        <button
          onClick={requestLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Attiva Posizione
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con coordinate */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Posizione Attuale</h3>
            <p className="text-sm text-gray-600">
              Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600">Posizione attiva</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <MapIcon className="h-4 w-4 inline mr-2" />
          Panoramica
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'technical'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <RulerIcon className="h-4 w-4 inline mr-2" />
          Tecnico
        </button>
        <button
          onClick={() => setActiveTab('environmental')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'environmental'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <LeafIcon className="h-4 w-4 inline mr-2" />
          Ambientale
        </button>
        <button
          onClick={() => setActiveTab('planning')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'planning'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BuildingIcon className="h-4 w-4 inline mr-2" />
          Urbanistica
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Analisi terreno in corso...</span>
          </div>
        ) : terrainData ? (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TargetIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Caratteristiche Fisiche</h4>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quota:</span>
                        <span className="font-medium">
                          {terrainData.elevation.toFixed(1)}m s.l.m.
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pendenza:</span>
                        <span className="font-medium">{terrainData.slope.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terreno:</span>
                        <span className="font-medium">{terrainData.soilType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Rischi</h4>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sismico:</span>
                        <span className="font-medium">{terrainData.seismicZone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alluvione:</span>
                        <span className="font-medium">{terrainData.floodRisk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frana:</span>
                        <span className="font-medium">{terrainData.landslideRisk}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUpIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Opportunità</h4>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Acqua:</span>
                        <span className="font-medium">{terrainData.groundwater.toFixed(1)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vegetazione:</span>
                        <span className="font-medium">{terrainData.vegetation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trasporti:</span>
                        <span className="font-medium">Eccellente</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zone Analysis */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Analisi Zone Vicine</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {zones.map(zone => (
                      <div
                        key={zone.id}
                        onClick={() => handleZoneSelect(zone.id)}
                        className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all ${
                          selectedZone === zone.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{zone.name}</h5>
                            <p className="text-sm text-gray-600">{zone.city}</p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(zone.risk)}`}
                            >
                              {zone.risk}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Opportunità:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getOpportunityColor(zone.opportunities)}`}
                          >
                            {zone.opportunities}
                          </span>
                        </div>

                        {selectedZone === zone.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-green-600">
                              <TargetIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Analisi attiva</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Technical Tab */}
            {activeTab === 'technical' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <RulerIcon className="h-5 w-5 text-blue-600" />
                      <span>Caratteristiche Tecniche</span>
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Geologia</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tipo terreno:</span>
                            <span className="font-medium">{terrainData.soilType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quota:</span>
                            <span className="font-medium">
                              {terrainData.elevation.toFixed(1)}m s.l.m.
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pendenza:</span>
                            <span className="font-medium">{terrainData.slope.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Falda:</span>
                            <span className="font-medium">
                              {terrainData.groundwater.toFixed(1)}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Rischi Naturali</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Zona sismica:</span>
                            <span className="font-medium">{terrainData.seismicZone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rischio alluvione:</span>
                            <span className="font-medium">{terrainData.floodRisk}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rischio frana:</span>
                            <span className="font-medium">{terrainData.landslideRisk}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <CarIcon className="h-5 w-5 text-green-600" />
                      <span>Accessibilità</span>
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Trasporti</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <CarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{terrainData.accessibility.roads}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BusIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {terrainData.accessibility.publicTransport}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {terrainData.accessibility.parking}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Infrastrutture</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <ZapIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {terrainData.infrastructure.electricity}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DropletIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {terrainData.infrastructure.water}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <WifiIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {terrainData.infrastructure.internet}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Tab */}
            {activeTab === 'environmental' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <LeafIcon className="h-5 w-5 text-green-600" />
                      <span>Qualità Ambientale</span>
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Condizioni Attuali</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Qualità aria:</span>
                            <span className="font-medium">
                              {terrainData.environmental.airQuality}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Livello rumore:</span>
                            <span className="font-medium">
                              {terrainData.environmental.noiseLevel}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Copertura verde:</span>
                            <span className="font-medium">
                              {terrainData.environmental.greenCoverage}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Aree Protette</h5>
                        <div className="space-y-2 text-sm">
                          {terrainData.environmental.protectedAreas.map((area, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <TreeIcon className="h-4 w-4 text-green-500" />
                              <span className="text-gray-700">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                      <span>Opportunità Ambientali</span>
                    </h4>

                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-800 mb-2">Sostenibilità</h5>
                        <ul className="space-y-1 text-sm text-green-700">
                          <li>• Installazione pannelli solari</li>
                          <li>• Sistema di raccolta acqua piovana</li>
                          <li>• Giardino verticale per isolamento</li>
                          <li>• Materiali eco-sostenibili</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800 mb-2">Certificazioni</h5>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li>• Classe energetica A+</li>
                          <li>• Certificazione LEED</li>
                          <li>• CasaClima Gold</li>
                          <li>• Protocollo ITACA</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Planning Tab */}
            {activeTab === 'planning' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <BuildingIcon className="h-5 w-5 text-purple-600" />
                      <span>Vincoli Urbanistici</span>
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Zonizzazione</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Zona:</span>
                            <span className="font-medium">{terrainData.urbanPlanning.zoning}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Altezza max:</span>
                            <span className="font-medium">
                              {terrainData.urbanPlanning.maxHeight}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Copertura max:</span>
                            <span className="font-medium">
                              {terrainData.urbanPlanning.maxCoverage}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distanza confine:</span>
                            <span className="font-medium">
                              {terrainData.urbanPlanning.minDistance}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Requisiti</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Posti auto:</span>
                            <span className="font-medium">
                              {terrainData.urbanPlanning.parkingRequired}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5 text-orange-600" />
                      <span>Processo Autorizzativo</span>
                    </h4>

                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h5 className="font-medium text-yellow-800 mb-2">
                          Autorizzazioni Richieste
                        </h5>
                        <ul className="space-y-1 text-sm text-yellow-700">
                          <li>• Permesso di costruire</li>
                          <li>• Autorizzazione paesaggistica</li>
                          <li>• Conformità urbanistica</li>
                          <li>• Verifica sismica</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800 mb-2">Tempi Stimati</h5>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li>• Permesso costruire: 3-6 mesi</li>
                          <li>• Autorizzazione paesaggistica: 2-4 mesi</li>
                          <li>• Verifiche tecniche: 1-2 mesi</li>
                          <li>• Totale: 6-12 mesi</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <AlertTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Analisi non disponibile</h4>
            <p className="text-gray-600 mb-4">
              Impossibile analizzare il terreno per questa posizione
            </p>
            <button
              onClick={() => analyzeTerrain(userLocation)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Riprova Analisi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
