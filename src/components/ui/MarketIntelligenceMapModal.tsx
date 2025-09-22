/**
 * Market Intelligence Map Modal
 * Modal per integrare la mappa ISTAT nella Market Intelligence senza modificare le logiche esistenti
 */

'use client';

import React, { useState } from 'react';
import { X, MapPin, Search, Filter } from 'lucide-react';
import { InteractiveMap, MapMarker } from '@/components/map/InteractiveMap';
import { useMapData } from '@/hooks/useMapData';
import { GeographicSearchResult, GeographicSearch } from '@/components/ui/GeographicSearch';

interface MarketIntelligenceMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}

export default function MarketIntelligenceMapModal({
  isOpen,
  onClose,
  onLocationSelect
}: MarketIntelligenceMapModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<GeographicSearchResult | null>(null);
  
  // Hook per dati mappa ISTAT
  const { 
    geographicMarkers, 
    loading: mapLoading, 
    error: mapError,
    filters: mapFilters,
    setFilters: setMapFilters,
    stats: mapStats
  } = useMapData();

  if (!isOpen) return null;

  const handleMarkerClick = (marker: MapMarker) => {
    const location: GeographicSearchResult = {
      id: marker.id,
      nome: marker.nome,
      provincia: marker.provincia,
      regione: marker.regione,
      tipo: marker.tipo as 'comune' | 'zona',
      popolazione: marker.metadata?.popolazione,
      superficie: marker.metadata?.superficie,
      latitudine: marker.lat,
      longitudine: marker.lng
    };
    
    setSelectedLocation(location);
  };

  const handleSearchResultClick = (result: GeographicSearchResult) => {
    setSelectedLocation(result);
  };

  const handleConfirmSelection = () => {
    if (selectedLocation) {
      // Formatta la localizzazione per il sistema esistente
      const locationString = `${selectedLocation.nome}, ${selectedLocation.provincia}, ${selectedLocation.regione}`;
      onLocationSelect(locationString);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🗺️ Mappa ISTAT - Selezione Localizzazione
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Cerca e seleziona comuni e zone italiane dal database ISTAT completo
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenuto */}
        <div className="p-6">
          {/* Barra di ricerca */}
          <div className="mb-6">
            <GeographicSearch
              onResultSelect={handleSearchResultClick}
              placeholder="Cerca comuni italiani (es. Gallarate, Roma, Milano...)"
              showFilters={true}
              maxResults={10}
            />
          </div>

          {/* Mappa */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            {mapLoading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Caricamento mappa...</p>
                </div>
              </div>
            ) : mapError ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 dark:text-red-400 mb-2">Errore caricamento mappa</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{mapError}</p>
                </div>
              </div>
            ) : (
              <InteractiveMap
                height="500px"
                initialCenter={[41.9028, 12.4964]}
                initialZoom={6}
                markers={geographicMarkers || []}
                loading={mapLoading}
                showSearch={true}
                showFilters={true}
                showLegend={true}
                showControls={true}
                onMarkerClick={handleMarkerClick}
                onMapClick={(lat, lng) => {
                  console.log('Mappa cliccata:', { lat, lng });
                }}
              />
            )}
          </div>

          {/* Selezione corrente */}
          {selectedLocation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
                📍 Localizzazione Selezionata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Comune</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedLocation.nome}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Provincia</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedLocation.provincia}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Regione</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedLocation.regione}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Tipo</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                    {selectedLocation.tipo}
                  </div>
                </div>
                {selectedLocation.popolazione && (
                  <div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Popolazione</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedLocation.popolazione.toLocaleString()}
                    </div>
                  </div>
                )}
                {selectedLocation.superficie && (
                  <div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Superficie</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedLocation.superficie.toLocaleString()} km²
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Istruzioni */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💡 Come utilizzare la mappa
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <strong>Clicca su un marker</strong> per selezionare un comune o una zona</li>
              <li>• <strong>Usa la barra di ricerca</strong> per trovare rapidamente una località</li>
              <li>• <strong>Applica i filtri</strong> per restringere la ricerca per regione, provincia o tipo</li>
              <li>• <strong>Zoomma e naviga</strong> sulla mappa per esplorare diverse zone</li>
              <li>• <strong>Conferma la selezione</strong> per utilizzare la localizzazione nella ricerca terreni</li>
            </ul>
            {!selectedLocation && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  ⚠️ Clicca su un marker arancione sulla mappa per selezionare un comune
                </p>
              </div>
            )}
          </div>

          {/* Azioni */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedLocation}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {selectedLocation ? 'Conferma Selezione' : 'Seleziona un Comune'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
