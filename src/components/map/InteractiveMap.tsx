/**
 * Componente Mappa Interattiva per Urbanova
 * Integra Leaflet con ricerca geografica e filtri avanzati
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngBounds, LatLng } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { 
  Search, 
  Filter, 
  Layers, 
  MapPin, 
  Building, 
  Home, 
  Factory, 
  ShoppingBag,
  TreePine,
  Landmark,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Info
} from 'lucide-react';
import { GeographicSearch, GeographicSearchResult } from '@/components/ui/GeographicSearch';
import { cn } from '@/lib/utils';

// Fix per icone Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapMarker {
  id: string | number;
  position: [number, number];
  type: 'comune' | 'zona';
  nome: string;
  provincia: string;
  regione: string;
  popolazione?: number;
  superficie?: number;
  metadata?: any;
}

export interface MapFilters {
  showComuni: boolean;
  showZone: boolean;
  zoneTypes: string[];
  populationRange: [number, number];
  region: string;
  province: string;
}

export interface InteractiveMapProps {
  className?: string;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showLegend?: boolean;
  showControls?: boolean;
  markers?: MapMarker[];
  loading?: boolean;
}

// Componente per gestire eventi mappa
function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick?.(lat, lng);
    },
  });
  return null;
}

// Componente per controlli mappa
function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  onToggleLayers,
  showLayers,
  darkMode 
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleLayers: () => void;
  showLayers: boolean;
  darkMode: boolean;
}) {
  return (
    <div className="map-controls">
      <button
        onClick={onZoomIn}
        className="map-control-button"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="map-control-button"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={onReset}
        className="map-control-button"
        title="Reset View"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleLayers}
        className={cn("map-control-button", showLayers && "active")}
        title="Toggle Layers"
      >
        <Layers className="w-4 h-4" />
      </button>
    </div>
  );
}

// Componente per ricerca mappa
function MapSearch({ 
  onResultSelect, 
  onResultsChange,
  darkMode 
}: {
  onResultSelect: (result: GeographicSearchResult) => void;
  onResultsChange: (results: GeographicSearchResult[]) => void;
  darkMode: boolean;
}) {
  return (
    <div className="map-search-overlay">
      <GeographicSearch
        onResultSelect={onResultSelect}
        onResultsChange={onResultsChange}
        placeholder="Cerca comuni e zone..."
        showFilters={true}
        maxResults={10}
        includeCoordinates={true}
        includeMetadata={true}
      />
    </div>
  );
}

// Componente per filtri mappa
function MapFiltersPanel({ 
  filters, 
  onFiltersChange, 
  darkMode,
  isOpen,
  onToggle 
}: {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  darkMode: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="map-control-button"
        title="Filtri"
        style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000 }}
      >
        <Filter className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="map-search-overlay" style={{ bottom: '10px', top: 'auto', left: '10px' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filtri Mappa</h3>
        <button
          onClick={onToggle}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Tipo elementi */}
        <div>
          <label className="block text-sm font-medium mb-2">Elementi da mostrare</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showComuni}
                onChange={(e) => onFiltersChange({ ...filters, showComuni: e.target.checked })}
                className="mr-2"
              />
              <Building className="w-4 h-4 mr-2" />
              Comuni
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showZone}
                onChange={(e) => onFiltersChange({ ...filters, showZone: e.target.checked })}
                className="mr-2"
              />
              <MapPin className="w-4 h-4 mr-2" />
              Zone
            </label>
          </div>
        </div>

        {/* Tipi zona */}
        {filters.showZone && (
          <div>
            <label className="block text-sm font-medium mb-2">Tipi di zona</label>
            <div className="space-y-2">
              {[
                { key: 'quartiere', label: 'Quartieri', icon: Home },
                { key: 'frazione', label: 'Frazioni', icon: MapPin },
                { key: 'zona_industriale', label: 'Zone Industriali', icon: Factory },
                { key: 'zona_commerciale', label: 'Zone Commerciali', icon: ShoppingBag },
                { key: 'zona_residenziale', label: 'Zone Residenziali', icon: Home },
                { key: 'zona_agricola', label: 'Zone Agricole', icon: TreePine },
                { key: 'centro_storico', label: 'Centri Storici', icon: Landmark },
              ].map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.zoneTypes.includes(key)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.zoneTypes, key]
                        : filters.zoneTypes.filter(t => t !== key);
                      onFiltersChange({ ...filters, zoneTypes: newTypes });
                    }}
                    className="mr-2"
                  />
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Range popolazione */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Popolazione: {filters.populationRange[0].toLocaleString()} - {filters.populationRange[1].toLocaleString()}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={filters.populationRange[0]}
              onChange={(e) => onFiltersChange({
                ...filters,
                populationRange: [parseInt(e.target.value), filters.populationRange[1]]
              })}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="1000000"
              step="1000"
              value={filters.populationRange[1]}
              onChange={(e) => onFiltersChange({
                ...filters,
                populationRange: [filters.populationRange[0], parseInt(e.target.value)]
              })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente per legenda mappa
function MapLegend({ darkMode }: { darkMode: boolean }) {
  const legendItems = [
    { color: '#3b82f6', label: 'Comuni', icon: Building },
    { color: '#10b981', label: 'Quartieri', icon: Home },
    { color: '#f59e0b', label: 'Zone Industriali', icon: Factory },
    { color: '#ef4444', label: 'Zone Commerciali', icon: ShoppingBag },
    { color: '#8b5cf6', label: 'Zone Residenziali', icon: Home },
    { color: '#06b6d4', label: 'Zone Agricole', icon: TreePine },
    { color: '#84cc16', label: 'Centri Storici', icon: Landmark },
  ];

  return (
    <div className="map-legend">
      <h4>Legenda</h4>
      {legendItems.map((item, index) => (
        <div key={index} className="map-legend-item">
          <div 
            className="map-legend-color" 
            style={{ backgroundColor: item.color }}
          />
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Componente principale mappa
export function InteractiveMap({
  className,
  height = '500px',
  initialCenter = [41.9028, 12.4964], // Roma
  initialZoom = 6,
  onMarkerClick,
  onMapClick,
  showSearch = true,
  showFilters = true,
  showLegend = true,
  showControls = true,
  markers = [],
  loading = false
}: InteractiveMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [searchResults, setSearchResults] = useState<GeographicSearchResult[]>([]);
  const [filters, setFilters] = useState<MapFilters>({
    showComuni: true,
    showZone: true,
    zoneTypes: ['quartiere', 'frazione', 'zona_industriale', 'zona_commerciale', 'zona_residenziale'],
    populationRange: [0, 1000000],
    region: '',
    province: ''
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const mapRef = useRef<any>(null);

  // Rileva dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Filtra markers basato sui filtri
  const filteredMarkers = (markers || []).filter(marker => {
    if (!marker) return false; // Protezione aggiuntiva
    
    if (!filters.showComuni && marker.type === 'comune') return false;
    if (!filters.showZone && marker.type === 'zona') return false;
    
    if (marker.type === 'zona' && marker.metadata?.tipo_zona) {
      if (!filters.zoneTypes.includes(marker.metadata.tipo_zona)) return false;
    }
    
    if (marker.popolazione) {
      if (marker.popolazione < filters.populationRange[0] || marker.popolazione > filters.populationRange[1]) {
        return false;
      }
    }
    
    if (filters.region && marker.regione !== filters.region) return false;
    if (filters.province && marker.provincia !== filters.province) return false;
    
    return true;
  });

  // Gestisce selezione risultato ricerca
  const handleSearchResultSelect = useCallback((result: GeographicSearchResult) => {
    if (result.latitudine && result.longitudine) {
      const newCenter: [number, number] = [result.latitudine, result.longitudine];
      setMapCenter(newCenter);
      setMapZoom(12);
      
      if (mapRef.current) {
        mapRef.current.setView(newCenter, 12);
      }
    }
  }, []);

  // Controlli mappa
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleReset = useCallback(() => {
    setMapCenter(initialCenter);
    setMapZoom(initialZoom);
    if (mapRef.current) {
      mapRef.current.setView(initialCenter, initialZoom);
    }
  }, [initialCenter, initialZoom]);

  const handleToggleLayers = useCallback(() => {
    setShowLayers(!showLayers);
  }, [showLayers]);

  // Ottiene colore marker basato sul tipo
  const getMarkerColor = (marker: MapMarker): string => {
    if (marker.type === 'comune') return '#3b82f6';
    
    const zoneType = marker.metadata?.tipo_zona;
    switch (zoneType) {
      case 'quartiere': return '#10b981';
      case 'frazione': return '#10b981';
      case 'zona_industriale': return '#f59e0b';
      case 'zona_commerciale': return '#ef4444';
      case 'zona_residenziale': return '#8b5cf6';
      case 'zona_agricola': return '#06b6d4';
      case 'centro_storico': return '#84cc16';
      default: return '#6b7280';
    }
  };

  // Ottiene icona marker basata sul tipo
  const getMarkerIcon = (marker: MapMarker) => {
    const color = getMarkerColor(marker);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="6" fill="white"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41],
    });
  };

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {loading && (
        <div className="map-loading-overlay">
          <div className="map-loading-spinner" />
          <div className="map-loading-text">Caricamento mappa...</div>
        </div>
      )}
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          url={darkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={darkMode 
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        />
        
        <MapEvents onMapClick={onMapClick} />
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={0}
          spiderfyOnMaxZoom={false}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={false}
          disableClusteringAtZoom={1}
        >
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={getMarkerIcon(marker)}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-2">{marker.nome}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Tipo:</strong> {marker.type}</p>
                    <p><strong>Provincia:</strong> {marker.provincia}</p>
                    <p><strong>Regione:</strong> {marker.regione}</p>
                    {marker.popolazione && (
                      <p><strong>Popolazione:</strong> {marker.popolazione.toLocaleString()}</p>
                    )}
                    {marker.superficie && (
                      <p><strong>Superficie:</strong> {marker.superficie} km²</p>
                    )}
                    {marker.metadata?.tipo_zona && (
                      <p><strong>Tipo Zona:</strong> {marker.metadata.tipo_zona}</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Controlli mappa */}
      {showControls && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onToggleLayers={handleToggleLayers}
          showLayers={showLayers}
          darkMode={darkMode}
        />
      )}

      {/* Ricerca mappa */}
      {showSearch && (
        <MapSearch
          onResultSelect={handleSearchResultSelect}
          onResultsChange={setSearchResults}
          darkMode={darkMode}
        />
      )}

      {/* Filtri mappa */}
      {showFilters && (
        <MapFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          darkMode={darkMode}
          isOpen={showFiltersPanel}
          onToggle={() => setShowFiltersPanel(!showFiltersPanel)}
        />
      )}

      {/* Legenda mappa */}
      {showLegend && (
        <MapLegend darkMode={darkMode} />
      )}

      {/* Info panel */}
      <div className="map-info-panel">
        {(filteredMarkers || []).length} elementi visualizzati
        {(searchResults || []).length > 0 && ` • ${(searchResults || []).length} risultati ricerca`}
      </div>
    </div>
  );
}
