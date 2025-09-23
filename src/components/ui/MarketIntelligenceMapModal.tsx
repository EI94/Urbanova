/**
 * Market Intelligence Map Modal
 * Modal per integrare la mappa ISTAT nella Market Intelligence senza modificare le logiche esistenti
 */

'use client';

import React, { useState } from 'react';
import { X, MapPin, Search, Filter } from 'lucide-react';
import { InteractiveMap, MapMarker } from '@/components/map/InteractiveMap';
import { useMapData } from '@/hooks/useMapData';
import { GeographicSearchResult } from '@/components/ui/GeographicSearch';

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

  // DEBUG: Log dei marker caricati
  console.log('🔍 [MarketIntelligenceMapModal] Marker caricati:', geographicMarkers?.length || 0);
  if (geographicMarkers && geographicMarkers.length > 0) {
    console.log('🔍 [MarketIntelligenceMapModal] Primi 3 marker:', geographicMarkers.slice(0, 3));
  }

  if (!isOpen) return null;

  const handleMarkerClick = (marker: MapMarker) => {
    console.log('🔍 [MarketIntelligenceMapModal] Marker cliccato:', marker);
    
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
    
    console.log('🔍 [MarketIntelligenceMapModal] Location creata:', location);
    setSelectedLocation(location);
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
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Barra di ricerca SEMPLIFICATA */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Cerca comuni italiani (es. Roma, Milano, Gallarate...)"
                className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                onChange={(e) => {
                  const query = e.target.value;
                  if (query.trim()) {
                    // Ricerca immediata e selezione automatica
                    fetch(`/api/geographic/search?q=${encodeURIComponent(query)}&type=comune&limit=1`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.success && data.data.results.length > 0) {
                          const result = data.data.results[0];
                          const location: GeographicSearchResult = {
                            id: result.id,
                            nome: result.nome,
                            provincia: result.provincia,
                            regione: result.regione,
                            tipo: result.tipo,
                            popolazione: result.popolazione,
                            superficie: result.superficie,
                            latitudine: result.latitudine,
                            longitudine: result.longitudine
                          };
                          setSelectedLocation(location);
                          console.log('🔍 [MarketIntelligenceMapModal] Comune selezionato:', location);
                        }
                      })
                      .catch(err => console.error('Errore ricerca:', err));
                  } else {
                    setSelectedLocation(null);
                  }
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Digita il nome di un comune per selezionarlo automaticamente
            </p>
          </div>

          {/* Istruzioni SEMPLIFICATE */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
              ✅ Come utilizzare la mappa
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• <strong>Digita il nome di un comune</strong> nella barra sopra per selezionarlo</li>
              <li>• <strong>La mappa si centrerà</strong> automaticamente sulla localizzazione</li>
              <li>• <strong>Clicca "Seleziona Luogo e Continua"</strong> per confermare</li>
            </ul>
            {!selectedLocation && (
              <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Digita il nome di un comune nella barra sopra per selezionarlo
                </p>
              </div>
            )}
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
                  console.log('🔍 [MarketIntelligenceMapModal] Mappa cliccata:', { lat, lng });
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
              className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {selectedLocation ? '✅ Seleziona Luogo e Continua' : '⚠️ Seleziona un Comune dalla Mappa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
