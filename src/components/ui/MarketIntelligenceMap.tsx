/**
 * Market Intelligence Map Component
 * Mappa interattiva per ricerca terreni con database ISTAT completo
 * Design minimale stile Apple
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Filter, X, ChevronDown, Map, List, Grid, Eye, Heart, Share, Download } from 'lucide-react';
import { InteractiveMap, MapMarker } from '@/components/map/InteractiveMap';
import { useMapData } from '@/hooks/useMapData';
import { GeographicSearch, GeographicSearchResult } from '@/components/ui/GeographicSearch';
import { terrainSearchService, TerrainSearchCriteria, TerrainSearchResult } from '@/lib/terrainSearchService';

interface TerrainData {
  id: string;
  comune: string;
  provincia: string;
  regione: string;
  lat: number;
  lng: number;
  price: number;
  area: number;
  type: 'residenziale' | 'commerciale' | 'industriale' | 'agricolo';
  status: 'disponibile' | 'venduto' | 'riservato';
  features: string[];
  images: string[];
  description: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  aiScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  opportunities: string[];
}

interface MarketIntelligenceMapProps {
  onTerrainSelect: (terrain: TerrainData) => void;
  onLocationSelect: (location: GeographicSearchResult) => void;
  className?: string;
}

export default function MarketIntelligenceMap({
  onTerrainSelect,
  onLocationSelect,
  className = ''
}: MarketIntelligenceMapProps) {
  // Stati principali
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'grid'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainData | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Stati per filtri
  const [filters, setFilters] = useState({
    priceRange: [0, 10000000],
    areaRange: [0, 100000],
    type: 'all' as 'all' | 'residenziale' | 'commerciale' | 'industriale' | 'agricolo',
    status: 'all' as 'all' | 'disponibile' | 'venduto' | 'riservato',
    aiScore: 0,
    riskLevel: 'all' as 'all' | 'low' | 'medium' | 'high',
    region: '',
    province: ''
  });

  // Stati per ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeographicSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Hook per dati mappa
  const { 
    geographicMarkers, 
    loading: mapLoading, 
    error: mapError,
    filters: mapFilters,
    setFilters: setMapFilters,
    stats: mapStats
  } = useMapData();

  // Stati per dati terreni
  const [terrainData, setTerrainData] = useState<TerrainData[]>([]);
  const [terrainStats, setTerrainStats] = useState<TerrainSearchResult['stats'] | null>(null);
  const [isLoadingTerrains, setIsLoadingTerrains] = useState(false);
  const [terrainError, setTerrainError] = useState<string | null>(null);

  // Filtra terreni basato sui filtri
  const filteredTerrain = terrainData.filter(terrain => {
    if (filters.priceRange[0] > 0 && terrain.price < filters.priceRange[0]) return false;
    if (filters.priceRange[1] > 0 && terrain.price > filters.priceRange[1]) return false;
    if (filters.areaRange[0] > 0 && terrain.area < filters.areaRange[0]) return false;
    if (filters.areaRange[1] > 0 && terrain.area > filters.areaRange[1]) return false;
    if (filters.type !== 'all' && terrain.type !== filters.type) return false;
    if (filters.status !== 'all' && terrain.status !== filters.status) return false;
    if (filters.aiScore > 0 && terrain.aiScore < filters.aiScore) return false;
    if (filters.riskLevel !== 'all' && terrain.riskLevel !== filters.riskLevel) return false;
    if (filters.region && terrain.regione !== filters.region) return false;
    if (filters.province && terrain.provincia !== filters.province) return false;
    return true;
  });

  // Converte terreni in marker per la mappa
  const terrainMarkers: MapMarker[] = filteredTerrain.map(terrain => ({
    id: terrain.id,
    lat: terrain.lat,
    lng: terrain.lng,
    nome: terrain.comune,
    provincia: terrain.provincia,
    regione: terrain.regione,
    tipo: 'terreno',
    metadata: {
      ...terrain,
      status: terrain.status,
      aiScore: terrain.aiScore,
      riskLevel: terrain.riskLevel
    }
  }));

  // Combina marker geografici e terreni
  const allMarkers = [...geographicMarkers, ...terrainMarkers];

  // Gestione ricerca
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simula ricerca API
      const results = await new Promise<GeographicSearchResult[]>((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              nome: 'Roma',
              provincia: 'Roma',
              regione: 'Lazio',
              tipo: 'comune',
              popolazione: 2873000,
              superficie: 1285.31,
              latitudine: 41.9028,
              longitudine: 12.4964
            },
            {
              id: '2',
              nome: 'Milano',
              provincia: 'Milano',
              regione: 'Lombardia',
              tipo: 'comune',
              popolazione: 1396000,
              superficie: 181.76,
              latitudine: 45.4642,
              longitudine: 9.1900
            }
          ]);
        }, 500);
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Errore ricerca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Gestione selezione terreno
  const handleTerrainSelect = (terrain: TerrainData) => {
    setSelectedTerrain(terrain);
    onTerrainSelect(terrain);
  };

  // Gestione toggle favorite
  const toggleFavorite = (terrainId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(terrainId)) {
      newFavorites.delete(terrainId);
    } else {
      newFavorites.add(terrainId);
    }
    setFavorites(newFavorites);
  };

  // Gestione reset filtri
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 10000000],
      areaRange: [0, 100000],
      type: 'all',
      status: 'all',
      aiScore: 0,
      riskLevel: 'all',
      region: '',
      province: ''
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Market Intelligence
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Trova terreni in tutta Italia con AI avanzata
            </p>
          </div>
          
          {/* Controlli vista */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Map className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra di ricerca e filtri */}
        <div className="flex items-center space-x-4 mt-6">
          {/* Ricerca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca comune, provincia o regione..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Risultati ricerca */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      onLocationSelect(result);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {result.nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.provincia}, {result.regione}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filtri */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Pannello filtri */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prezzo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prezzo (€)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value) || 0]
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Area (m²)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.areaRange[0] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      areaRange: [parseInt(e.target.value) || 0, prev.areaRange[1]]
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.areaRange[1] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      areaRange: [prev.areaRange[0], parseInt(e.target.value) || 0]
                    }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    type: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tutti i tipi</option>
                  <option value="residenziale">Residenziale</option>
                  <option value="commerciale">Commerciale</option>
                  <option value="industriale">Industriale</option>
                  <option value="agricolo">Agricolo</option>
                </select>
              </div>
            </div>

            {/* Reset filtri */}
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Reset filtri
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenuto principale */}
      <div className="p-6">
        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredTerrain.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Terreni trovati
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredTerrain.filter(t => t.status === 'disponibile').length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Disponibili
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(filteredTerrain.reduce((sum, t) => sum + t.aiScore, 0) / filteredTerrain.length) || 0}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              AI Score medio
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              €{Math.round(filteredTerrain.reduce((sum, t) => sum + t.price, 0) / filteredTerrain.length).toLocaleString() || 0}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Prezzo medio
            </div>
          </div>
        </div>

        {/* Vista mappa */}
        {viewMode === 'map' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <InteractiveMap
              height="600px"
              initialCenter={[41.9028, 12.4964]}
              initialZoom={6}
              markers={allMarkers}
              loading={mapLoading}
              showSearch={false}
              showFilters={false}
              showLegend={true}
              showControls={true}
              onMarkerClick={(marker) => {
                if (marker.metadata?.status) {
                  // È un terreno
                  const terrain = terrainData.find(t => t.id === marker.id);
                  if (terrain) {
                    handleTerrainSelect(terrain);
                  }
                } else {
                  // È un elemento geografico
                  onLocationSelect({
                    id: marker.id,
                    nome: marker.nome,
                    provincia: marker.provincia,
                    regione: marker.regione,
                    tipo: marker.tipo as 'comune' | 'zona',
                    popolazione: marker.metadata?.popolazione,
                    superficie: marker.metadata?.superficie,
                    latitudine: marker.lat,
                    longitudine: marker.lng
                  });
                }
              }}
              onMapClick={(lat, lng) => {
                console.log('Mappa cliccata:', { lat, lng });
              }}
            />
          </div>
        )}

        {/* Vista lista */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredTerrain.map((terrain) => (
              <div
                key={terrain.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTerrainSelect(terrain)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {terrain.comune}, {terrain.provincia}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        terrain.status === 'disponibile'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : terrain.status === 'venduto'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {terrain.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {terrain.description}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>€{terrain.price.toLocaleString()}</span>
                      <span>{terrain.area.toLocaleString()} m²</span>
                      <span className="capitalize">{terrain.type}</span>
                      <span>AI Score: {terrain.aiScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(terrain.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites.has(terrain.id)
                          ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTerrainSelect(terrain);
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista griglia */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTerrain.map((terrain) => (
              <div
                key={terrain.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTerrainSelect(terrain)}
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {terrain.comune}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      terrain.status === 'disponibile'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : terrain.status === 'venduto'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {terrain.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {terrain.provincia}, {terrain.regione}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Prezzo</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        €{terrain.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Area</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {terrain.area.toLocaleString()} m²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">AI Score</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {terrain.aiScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nessun risultato */}
        {filteredTerrain.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nessun terreno trovato
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Prova a modificare i filtri di ricerca
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset filtri
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
