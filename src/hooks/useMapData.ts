/**
 * Hook per Gestione Dati Mappa
 * Gestisce caricamento, filtraggio e aggiornamento dati geografici
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapMarker } from '@/components/map/InteractiveMap';
import { istatApiService } from '@/lib/geographic/istatApiService';

export interface MapDataFilters {
  showComuni: boolean;
  showZone: boolean;
  zoneTypes: string[];
  populationRange: [number, number];
  region: string;
  province: string;
  searchQuery: string;
}

export interface MapDataState {
  markers: MapMarker[];
  filteredMarkers: MapMarker[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  filteredCount: number;
  lastUpdate: Date | null;
}

export interface UseMapDataOptions {
  autoLoad?: boolean;
  refreshInterval?: number;
  maxMarkers?: number;
  enableClustering?: boolean;
}

export function useMapData(options: UseMapDataOptions = {}) {
  const {
    autoLoad = true,
    refreshInterval = 300000, // 5 minuti
    maxMarkers = 10000,
    enableClustering = true
  } = options;

  const [state, setState] = useState<MapDataState>({
    markers: [],
    filteredMarkers: [],
    loading: false,
    error: null,
    totalCount: 0,
    filteredCount: 0,
    lastUpdate: null
  });

  const [filters, setFilters] = useState<MapDataFilters>({
    showComuni: true,
    showZone: true,
    zoneTypes: ['quartiere', 'frazione', 'zona_industriale', 'zona_commerciale', 'zona_residenziale'],
    populationRange: [0, 1000000],
    region: '',
    province: '',
    searchQuery: ''
  });

  // Carica dati geografici
  const loadMapData = useCallback(async (forceRefresh = false) => {
    if (state.loading && !forceRefresh) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // CHIRURGICO: Usa direttamente istatApiService invece di chiamate API che falliscono
      console.log('🗺️ [useMapData] Caricamento dati mappa tramite istatApiService...');
      
      // Carica comuni direttamente dal servizio locale
      const comuniResults = await istatApiService.searchComuni({
        query: '',
        limit: 100,
        includeCoordinates: true,
        includeMetadata: true
      });

      // Converte dati in markers
      const comuniMarkers: MapMarker[] = comuniResults.comuni.map((comune, index) => ({
        id: `${comune.codiceIstat}-${index}`,
        position: [comune.latitudine || 0, comune.longitudine || 0],
        type: 'comune' as const,
        nome: comune.nome,
        provincia: comune.provincia,
        regione: comune.regione,
        popolazione: comune.popolazione,
        superficie: comune.superficie,
        metadata: {
          codiceIstat: comune.codiceIstat,
          altitudine: comune.altitudine,
          zonaClimatica: comune.zonaClimatica,
          cap: comune.cap,
          prefisso: comune.prefisso
        }
      }));

      // Per ora non carichiamo zone (focus sui comuni)
      const zoneMarkers: MapMarker[] = [];

      const allMarkers = [...comuniMarkers, ...zoneMarkers].slice(0, maxMarkers);

      // Aggiorna stato con i dati caricati
      setState(prev => ({
        ...prev,
        markers: allMarkers,
        loading: false,
        totalCount: allMarkers.length,
        lastUpdate: new Date()
      }));

    } catch (error) {
      console.error('Errore caricamento dati mappa:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      }));
    }
  }, [state.loading, maxMarkers]);

  // Filtra markers basato sui filtri
  const filteredMarkers = useMemo(() => {
    return (state.markers || []).filter(marker => {
      // Filtro tipo elemento
      if (!filters.showComuni && marker.type === 'comune') return false;
      if (!filters.showZone && marker.type === 'zona') return false;

      // Filtro tipo zona
      if (marker.type === 'zona' && marker.metadata?.tipo_zona) {
        if (!filters.zoneTypes.includes(marker.metadata.tipo_zona)) return false;
      }

      // Filtro popolazione
      if (marker.popolazione) {
        if (marker.popolazione < filters.populationRange[0] || marker.popolazione > filters.populationRange[1]) {
          return false;
        }
      }

      // Filtro regione
      if (filters.region && marker.regione !== filters.region) return false;

      // Filtro provincia
      if (filters.province && marker.provincia !== filters.province) return false;

      // Filtro ricerca testuale
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchText = `${marker.nome} ${marker.provincia} ${marker.regione}`.toLowerCase();
        if (!searchText.includes(query)) return false;
      }

      return true;
    });
  }, [state.markers, filters]);

  // Aggiorna filteredMarkers quando cambiano i filtri
  useEffect(() => {
    setState(prev => ({
      ...prev,
      filteredMarkers,
      filteredCount: (filteredMarkers || []).length
    }));
  }, [filteredMarkers]);

  // Carica dati automaticamente
  useEffect(() => {
    if (autoLoad) {
      loadMapData();
    }
  }, [autoLoad, loadMapData]);

  // Refresh automatico
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        loadMapData(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, loadMapData]);

  // Funzioni di utilità
  const getMarkersByType = useCallback((type: 'comune' | 'zona') => {
    return (filteredMarkers || []).filter(marker => marker.type === type);
  }, [filteredMarkers]);

  const getMarkersByRegion = useCallback((region: string) => {
    return (filteredMarkers || []).filter(marker => marker.regione === region);
  }, [filteredMarkers]);

  const getMarkersByProvince = useCallback((province: string) => {
    return (filteredMarkers || []).filter(marker => marker.provincia === province);
  }, [filteredMarkers]);

  const getMarkersInBounds = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    return (filteredMarkers || []).filter(marker => {
      const [lat, lng] = marker.position;
      return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
    });
  }, [filteredMarkers]);

  const getStatistics = useCallback(() => {
    const comuni = getMarkersByType('comune');
    const zone = getMarkersByType('zona');
    
    const totalPopulation = (filteredMarkers || []).reduce((sum, marker) => sum + (marker.popolazione || 0), 0);
    const totalSurface = (filteredMarkers || []).reduce((sum, marker) => sum + (marker.superficie || 0), 0);
    
    const regionCounts = (filteredMarkers || []).reduce((acc, marker) => {
      acc[marker.regione] = (acc[marker.regione] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const provinceCounts = (filteredMarkers || []).reduce((acc, marker) => {
      acc[marker.provincia] = (acc[marker.provincia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const zoneTypeCounts = (zone || []).reduce((acc, marker) => {
      const type = marker.metadata?.tipo_zona || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: (filteredMarkers || []).length,
      comuni: (comuni || []).length,
      zone: (zone || []).length,
      totalPopulation,
      totalSurface,
      regionCounts,
      provinceCounts,
      zoneTypeCounts,
      averagePopulation: (filteredMarkers || []).length > 0 ? totalPopulation / (filteredMarkers || []).length : 0,
      averageSurface: (filteredMarkers || []).length > 0 ? totalSurface / (filteredMarkers || []).length : 0
    };
  }, [filteredMarkers, getMarkersByType]);

  // Aggiorna filtri
  const updateFilters = useCallback((newFilters: Partial<MapDataFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filtri
  const resetFilters = useCallback(() => {
    setFilters({
      showComuni: true,
      showZone: true,
      zoneTypes: ['quartiere', 'frazione', 'zona_industriale', 'zona_commerciale', 'zona_residenziale'],
      populationRange: [0, 1000000],
      region: '',
      province: '',
      searchQuery: ''
    });
  }, []);

  // Cerca markers
  const searchMarkers = useCallback(async (query: string, options: {
    type?: 'comune' | 'zona';
    region?: string;
    province?: string;
    limit?: number;
  } = {}) => {
    if (!query.trim()) return [];

    try {
      // CHIRURGICO: Usa direttamente istatApiService invece di chiamate API
      console.log('🔍 [useMapData] Ricerca markers tramite istatApiService:', query);
      
      const results = await istatApiService.searchComuni({
        query: query,
        limit: options.limit || 100,
        includeCoordinates: true,
        includeMetadata: true,
        regione: options.region,
        provincia: options.province
      });

      return results.comuni.map((comune, index) => ({
        id: `${comune.codiceIstat}-${index}`,
        position: [comune.latitudine || 0, comune.longitudine || 0],
        type: 'comune' as const,
        nome: comune.nome,
        provincia: comune.provincia,
        regione: comune.regione,
        popolazione: comune.popolazione,
        superficie: comune.superficie,
        metadata: {
          codiceIstat: comune.codiceIstat,
          altitudine: comune.altitudine,
          zonaClimatica: comune.zonaClimatica,
          cap: comune.cap,
          prefisso: comune.prefisso
        }
      }));
    } catch (error) {
      console.error('❌ [useMapData] Errore ricerca markers:', error);
      return [];
    }
  }, []);

  // Statistiche per compatibilità con componenti esistenti
  const stats = useMemo(() => {
    const statistics = getStatistics();
    return {
      totalComuni: statistics.comuni,
      totalZone: statistics.zone,
      totalRegioni: Object.keys(statistics.regionCounts || {}).length,
      totalProvince: Object.keys(statistics.provinceCounts || {}).length,
      totalPopulation: statistics.totalPopulation,
      totalSurface: statistics.totalSurface,
      averagePopulation: statistics.averagePopulation,
      averageSurface: statistics.averageSurface
    };
  }, [getStatistics]);

  return {
    // Stato
    ...state,
    filters,
    
    // Azioni
    loadMapData,
    updateFilters,
    resetFilters,
    searchMarkers,
    setFilters,
    
    // Funzioni di utilità
    getMarkersByType,
    getMarkersByRegion,
    getMarkersByProvince,
    getMarkersInBounds,
    getStatistics,
    
    // Computed
    isLoading: state.loading,
    hasError: !!state.error,
    isEmpty: (state.filteredMarkers || []).length === 0,
    hasData: (state.markers || []).length > 0,
    
    // Statistiche per compatibilità
    stats,
    
    // Alias per compatibilità con componenti esistenti
    geographicMarkers: state.filteredMarkers || []
  };
}
