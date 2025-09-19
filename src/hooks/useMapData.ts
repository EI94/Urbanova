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
    // Rimuovo controllo state.loading per evitare loop infinito
    if (!forceRefresh) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // CHIRURGICO: Usa API route del server invece di chiamate dirette
      console.log('🗺️ [useMapData] Caricamento dati mappa tramite API server...');
      
      const searchParams = new URLSearchParams({
        type: 'comune',
        limit: '100',
        includeCoordinates: 'true',
        includeMetadata: 'true'
      });

      const response = await fetch(`/api/geographic/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Errore API');
      }

      // Converte dati in markers
      const comuniMarkers: MapMarker[] = apiResponse.data.results.map((result: any, index: number) => ({
        id: result.id || `marker-${index}`,
        position: [result.latitudine || 0, result.longitudine || 0],
        type: result.tipo || 'comune',
        nome: result.nome || 'Sconosciuto',
        provincia: result.provincia || 'Sconosciuta',
        regione: result.regione || 'Sconosciuta',
        popolazione: result.popolazione || 0,
        superficie: result.superficie || 0,
        metadata: result.metadata || {}
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
  }, [maxMarkers]);

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
      loadMapData(true); // Force refresh per caricamento iniziale
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
      // CHIRURGICO: Usa API route del server invece di chiamate dirette
      console.log('🔍 [useMapData] Ricerca markers tramite API server:', query);
      
      const searchParams = new URLSearchParams({
        q: query,
        type: 'comune',
        limit: (options.limit || 100).toString(),
        includeCoordinates: 'true',
        includeMetadata: 'true'
      });

      if (options.region) searchParams.append('region', options.region);
      if (options.province) searchParams.append('province', options.province);

      const response = await fetch(`/api/geographic/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Errore API');
      }

      return apiResponse.data.results.map((result: any, index: number) => ({
        id: result.id,
        position: [result.latitudine || 0, result.longitudine || 0],
        type: result.tipo,
        nome: result.nome,
        provincia: result.provincia,
        regione: result.regione,
        popolazione: result.popolazione,
        superficie: result.superficie,
        metadata: result.metadata
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
