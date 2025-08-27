'use client';

import { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  TrendingUpIcon, 
  ShieldCheckIcon,
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  GlobeIcon,
  BuildingIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon
} from '@/components/icons';
import { GeoLocation } from '@/lib/designCenterService';
import { externalAPIService, MarketData, RegulatoryData, GeospatialData, DemographicData } from '@/lib/externalAPIService';

interface TerrainAnalysisAdvancedProps {
  location: GeoLocation;
  onAnalysisComplete: (analysis: any) => void;
}

interface TerrainAnalysis {
  marketData: MarketData;
  regulatoryData: RegulatoryData;
  geospatialData: GeospatialData;
  demographicData: DemographicData;
  analysis: {
    suitability: 'LOW' | 'MEDIUM' | 'HIGH';
    risks: string[];
    opportunities: string[];
    recommendations: string[];
  };
}

export default function TerrainAnalysisAdvanced({ location, onAnalysisComplete }: TerrainAnalysisAdvancedProps) {
  const [analysis, setAnalysis] = useState<TerrainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'market' | 'regulatory' | 'geospatial' | 'demographics'>('overview');

  useEffect(() => {
    if (location.address) {
      performTerrainAnalysis();
    }
  }, [location.address]);

  const performTerrainAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [TerrainAnalysis] Avvio analisi terreno per:', location.address);
      
      const terrainAnalysis = await externalAPIService.performTerrainAnalysis(location);
      setAnalysis(terrainAnalysis);
      
      // Notifica completamento
      onAnalysisComplete(terrainAnalysis);
      
      console.log('✅ [TerrainAnalysis] Analisi terreno completata');
      
    } catch (error) {
      console.error('❌ [TerrainAnalysis] Errore analisi terreno:', error);
      setError(`Analisi terreno fallita: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'HIGH': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case 'HIGH': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'MEDIUM': return <AlertIcon className="h-5 w-5 text-yellow-600" />;
      case 'LOW': return <AlertIcon className="h-5 w-5 text-red-600" />;
      default: return <InfoIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskLevelColor = (risk: string) => {
    if (risk.includes('alto') || risk.includes('HIGH')) return 'text-red-600';
    if (risk.includes('medio') || risk.includes('MEDIUM')) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analizzando il terreno con dati reali...</p>
          <p className="text-sm text-gray-500 mt-2">Recupero dati da fonti ufficiali in corso</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Errore nell'Analisi Terreno</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={performTerrainAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Riprova Analisi
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <InfoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analisi Terreno Non Disponibile</h3>
          <p className="text-gray-600">Inserisci un indirizzo valido per avviare l'analisi del terreno</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <GlobeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">🗺️ Analisi Avanzata Terreno</h2>
              <p className="text-blue-100 text-sm">Dati reali da fonti ufficiali e API esterne</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getSuitabilityColor(analysis.analysis.suitability)}`}>
              {getSuitabilityIcon(analysis.analysis.suitability)}
              <span className="ml-2">
                {analysis.analysis.suitability === 'HIGH' ? 'Alta Fattibilità' :
                 analysis.analysis.suitability === 'MEDIUM' ? 'Fattibilità Media' : 'Bassa Fattibilità'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 inline mr-2" />
            Panoramica
          </button>
          
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'market'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUpIcon className="h-4 w-4 inline mr-2" />
            Mercato
          </button>
          
          <button
            onClick={() => setActiveTab('regulatory')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'regulatory'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
            Normative
          </button>
          
          <button
            onClick={() => setActiveTab('geospatial')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'geospatial'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MapPinIcon className="h-4 w-4 inline mr-2" />
            Geospaziali
          </button>
          
          <button
            onClick={() => setActiveTab('demographics')}
            className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'demographics'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UsersIcon className="h-4 w-4 inline mr-2" />
            Demografia
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tab: Panoramica */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Fattibilità</p>
                    <p className="text-2xl font-bold text-green-900 capitalize">{analysis.analysis.suitability}</p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-lg">
                    {getSuitabilityIcon(analysis.analysis.suitability)}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Prezzo Medio</p>
                    <p className="text-2xl font-bold text-blue-900">€{analysis.marketData.averagePrice.toLocaleString()}/m²</p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-lg">
                    <TrendingUpIcon className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Rischio Alluvione</p>
                    <p className="text-2xl font-bold text-purple-900 capitalize">{analysis.geospatialData.floodRisk}</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-lg">
                    <AlertIcon className="h-6 w-6 text-purple-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Zona Sismica</p>
                    <p className="text-2xl font-bold text-orange-900">{analysis.geospatialData.seismicZone}</p>
                  </div>
                  <div className="p-3 bg-orange-200 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-orange-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risks and Opportunities */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertIcon className="h-5 w-5 mr-2 text-red-600" />
                  Rischi Identificati ({analysis.analysis.risks.length})
                </h3>
                
                {analysis.analysis.risks.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.analysis.risks.map((risk, index) => (
                      <li key={index} className={`text-sm ${getRiskLevelColor(risk)} flex items-start`}>
                        <AlertIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600 text-sm">✅ Nessun rischio significativo identificato</p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-green-600" />
                  Opportunità ({analysis.analysis.opportunities.length})
                </h3>
                
                {analysis.analysis.opportunities.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.analysis.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-start">
                        <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Nessuna opportunità significativa identificata</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <InfoIcon className="h-5 w-5 mr-2" />
                Raccomandazioni AI
              </h3>
              
              <ul className="space-y-2">
                {analysis.analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Sources */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">📊 Fonti Dati Utilizzate</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Mercato:</span>
                  <span className="ml-2 text-gray-600">{analysis.marketData.dataSource}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Geospaziali:</span>
                  <span className="ml-2 text-gray-600">{analysis.geospatialData.dataSource}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Normative:</span>
                  <span className="ml-2 text-gray-600">{analysis.regulatoryData.dataSource}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Demografia:</span>
                  <span className="ml-2 text-gray-600">ISTAT</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Ultimo aggiornamento: {analysis.marketData.lastUpdated.toLocaleDateString('it-IT')}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mercato */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">📊 Analisi Mercato Immobiliare</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Metriche Chiave</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prezzo medio:</span>
                    <span className="font-medium">€{analysis.marketData.averagePrice.toLocaleString()}/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend prezzi:</span>
                    <span className={`font-medium ${analysis.marketData.priceTrend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.marketData.priceTrend}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livello domanda:</span>
                    <span className="font-medium capitalize">{analysis.marketData.demandLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livello offerta:</span>
                    <span className="font-medium capitalize">{analysis.marketData.supplyLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stabilità mercato:</span>
                    <span className="font-medium capitalize">{analysis.marketData.marketStability}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Analisi Trend</h4>
                
                <div className="space-y-3">
                  {analysis.marketData.priceTrend.startsWith('+') ? (
                    <div className="text-green-600 text-sm">
                      ✅ Mercato in crescita - Opportunità di valorizzazione
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm">
                      ⚠️ Mercato in calo - Attenzione ai prezzi
                    </div>
                  )}
                  
                  {analysis.marketData.demandLevel === 'HIGH' && (
                    <div className="text-green-600 text-sm">
                      ✅ Alta domanda - Mercato favorevole per la vendita
                    </div>
                  )}
                  
                  {analysis.marketData.supplyLevel === 'LOW' && (
                    <div className="text-green-600 text-sm">
                      ✅ Bassa offerta - Possibilità di prezzi premium
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Normative */}
        {activeTab === 'regulatory' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">📋 Analisi Normativa e Compliance</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Building Codes */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Regolamenti Edilizi</h4>
                
                <div className="space-y-3">
                  {analysis.regulatoryData.buildingCodes.map((code, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-3">
                      <div className="font-medium text-sm">{code.code}</div>
                      <div className="text-xs text-gray-600">{code.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: <span className={`${code.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                          {code.status === 'ACTIVE' ? 'Attivo' : 'Non Attivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zoning Regulations */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Regolamenti di Zonizzazione</h4>
                
                <div className="space-y-3">
                  {analysis.regulatoryData.zoningRegulations.map((regulation, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-3">
                      <div className="font-medium text-sm">{regulation.zone}</div>
                      <div className="text-xs text-gray-600">
                        Altezza max: {regulation.maxHeight}m | Copertura max: {regulation.maxCoverage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Distanza confini: {regulation.minSetback}m
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental Requirements */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Requisiti Ambientali</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.regulatoryData.environmentalRequirements.map((req, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-sm">{req.requirement}</div>
                    <div className="text-xs text-gray-600 mt-1">{req.description}</div>
                    <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                      req.compliance === 'MANDATORY' ? 'bg-red-100 text-red-800' :
                      req.compliance === 'RECOMMENDED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {req.compliance === 'MANDATORY' ? 'Obbligatorio' :
                       req.compliance === 'RECOMMENDED' ? 'Raccomandato' : 'Opzionale'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Geospaziali */}
        {activeTab === 'geospatial' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">🗺️ Analisi Geospaziale e Topografica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Caratteristiche Terreno</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinate:</span>
                    <span className="font-medium text-sm">
                      {analysis.geospatialData.coordinates.lat.toFixed(6)}, {analysis.geospatialData.coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Elevazione:</span>
                    <span className="font-medium">{analysis.geospatialData.elevation}m s.l.m.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pendenza:</span>
                    <span className="font-medium">{analysis.geospatialData.slope}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo suolo:</span>
                    <span className="font-medium capitalize">{analysis.geospatialData.soilType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Falda acquifera:</span>
                    <span className="font-medium">{analysis.geospatialData.waterTable}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuratezza:</span>
                    <span className="font-medium">{analysis.geospatialData.accuracy}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Valutazione Rischio</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rischio alluvione:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analysis.geospatialData.floodRisk === 'HIGH' ? 'bg-red-100 text-red-800' :
                      analysis.geospatialData.floodRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {analysis.geospatialData.floodRisk === 'HIGH' ? 'Alto' :
                       analysis.geospatialData.floodRisk === 'MEDIUM' ? 'Medio' : 'Basso'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Zona sismica:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {analysis.geospatialData.seismicZone}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Implicazioni Progettuali:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {analysis.geospatialData.floodRisk === 'HIGH' && (
                      <li>• Fondazioni speciali richieste</li>
                    )}
                    {analysis.geospatialData.seismicZone === 'Zona 1' && (
                      <li>• Struttura antisismica obbligatoria</li>
                    )}
                    {analysis.geospatialData.slope > 15 && (
                      <li>• Analisi stabilità pendio necessaria</li>
                    )}
                    {analysis.geospatialData.waterTable < 3 && (
                      <li>• Impermeabilizzazione fondazioni</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Demografia */}
        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">👥 Analisi Demografica e Socioeconomica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Dati Demografici</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Popolazione:</span>
                    <span className="font-medium">{analysis.demographicData.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Densità:</span>
                    <span className="font-medium">{analysis.demographicData.density} ab/km²</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <h5 className="font-medium text-gray-900 mb-2">Distribuzione Età</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Under 18:</span>
                        <span className="font-medium">{analysis.demographicData.ageDistribution.under18}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">18-65:</span>
                        <span className="font-medium">{analysis.demographicData.ageDistribution.age18to65}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Over 65:</span>
                        <span className="font-medium">{analysis.demographicData.ageDistribution.over65}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Profilo Socioeconomico</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Livello reddito:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analysis.demographicData.incomeLevel === 'HIGH' ? 'bg-green-100 text-green-800' :
                      analysis.demographicData.incomeLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysis.demographicData.incomeLevel === 'HIGH' ? 'Alto' :
                       analysis.demographicData.incomeLevel === 'MEDIUM' ? 'Medio' : 'Basso'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Livello istruzione:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analysis.demographicData.educationLevel === 'HIGH' ? 'bg-green-100 text-green-800' :
                      analysis.demographicData.educationLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysis.demographicData.educationLevel === 'HIGH' ? 'Alto' :
                       analysis.demographicData.educationLevel === 'MEDIUM' ? 'Medio' : 'Basso'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Implicazioni di Mercato:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {analysis.demographicData.incomeLevel === 'HIGH' && (
                      <li>• Mercato premium - Prezzi elevati</li>
                    )}
                    {analysis.demographicData.population > 100000 && (
                      <li>• Centro urbano - Alta accessibilità</li>
                    )}
                    {analysis.demographicData.ageDistribution.age18to65 > 60 && (
                      <li>• Popolazione attiva - Alta domanda</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
