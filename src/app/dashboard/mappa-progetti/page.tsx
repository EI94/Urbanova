'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { projectMapService, ProjectLocation, MapFilter, MapCluster } from '@/lib/projectMapService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  MapPinIcon, 
  BuildingIcon, 
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  FilterIcon,
  SearchIcon,
  LocationMarkerIcon,
  GlobeIcon,
  TrendingUpIcon,
  CalendarIcon,
  EuroIcon,
  MapIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from '@/components/icons';

export default function MappaProgettiPage() {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Stati principali
  const [projectLocations, setProjectLocations] = useState<ProjectLocation[]>([]);
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stati per mappa
  const [mapViewport, setMapViewport] = useState({
    center: { lat: 41.9028, lng: 12.4964 }, // Roma
    zoom: 8
  });
  const [selectedLocation, setSelectedLocation] = useState<ProjectLocation | null>(null);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  
  // Stati per filtri
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<MapFilter>({});
  const [filteredLocations, setFilteredLocations] = useState<ProjectLocation[]>([]);
  
  // Stati per modali
  const [showNewLocationModal, setShowNewLocationModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Stati per nuovo progetto
  const [newLocationData, setNewLocationData] = useState({
    projectId: '',
    projectName: '',
    address: '',
    city: '',
    province: '',
    region: 'Lazio',
    postalCode: '',
    country: 'Italia',
    zone: '',
    neighborhood: '',
    urbanArea: 'URBAN' as const,
    zoning: 'RESIDENTIAL' as const,
    landUse: '',
    buildingType: 'VILLA' as const,
    projectStatus: 'PLANNING' as const,
    budget: {
      estimated: 0,
      currency: 'EUR'
    },
    area: {
      landArea: 0,
      buildingArea: 0,
      floors: 1
    },
    timeline: {
      startDate: new Date(),
      estimatedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    },
    marketData: {
      estimatedValue: 0,
      roi: 0,
      marketTrend: 'STABLE' as const,
      demandLevel: 'MEDIUM' as const
    },
    constraints: [] as string[],
    amenities: [] as string[],
    tags: [] as string[]
  });

  // Stati per progetti disponibili
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simula progetti disponibili (in produzione verrebbero da un servizio progetti)
      setAvailableProjects([
        { id: 'project-1', name: 'Villa Moderna Roma', status: 'IN_PROGRESS' },
        { id: 'project-2', name: 'Appartamento Centro Milano', status: 'PLANNING' },
        { id: 'project-3', name: 'Uffici Commerciali Torino', status: 'COMPLETED' }
      ]);
      
      // Inizializza posizioni progetto di esempio se non esistono
      await projectMapService.initializeSampleProjectLocations();
      
      // Inizializza intelligence territoriale
      try {
        await fetch('/api/map/intelligence/initialize', { method: 'POST' });
        console.log('✅ [MappaProgetti] Intelligence territoriale inizializzata');
      } catch (error) {
        console.warn('⚠️ [MappaProgetti] Errore inizializzazione intelligence:', error);
      }
      
      // Carica posizioni progetto
      const locations = await projectMapService.getAllProjectLocations();
      setProjectLocations(locations);
      setFilteredLocations(locations);
      
      // Crea cluster per la visualizzazione
      const mapClusters = await projectMapService.createMapClusters(locations, mapViewport.zoom);
      setClusters(mapClusters);
      
      console.log('✅ [MappaProgetti] Dati caricati:', {
        locations: locations.length,
        clusters: mapClusters.length
      });
      
    } catch (error) {
      console.error('❌ [MappaProgetti] Errore caricamento dati:', error);
      setError('Impossibile caricare i dati della mappa');
    } finally {
      setLoading(false);
    }
  };

  const createNewProjectLocation = async () => {
    try {
      if (!newLocationData.projectName || !newLocationData.address) {
        toast.error('❌ Compila tutti i campi obbligatori');
        return;
      }

      const locationId = await projectMapService.createProjectLocation(newLocationData);
      console.log('✅ [MappaProgetti] Nuova posizione progetto creata:', locationId);
      
      toast.success('✅ Posizione progetto creata con successo!');
      setShowNewLocationModal(false);
      
      // Reset form e ricarica dati
      setNewLocationData({
        projectId: '',
        projectName: '',
        address: '',
        city: '',
        province: '',
        region: 'Lazio',
        postalCode: '',
        country: 'Italia',
        zone: '',
        neighborhood: '',
        urbanArea: 'URBAN',
        zoning: 'RESIDENTIAL',
        landUse: '',
        buildingType: 'VILLA',
        projectStatus: 'PLANNING',
        budget: { estimated: 0, currency: 'EUR' },
        area: { landArea: 0, buildingArea: 0, floors: 1 },
        timeline: {
          startDate: new Date(),
          estimatedEndDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        },
        marketData: {
          estimatedValue: 0,
          roi: 0,
          marketTrend: 'STABLE',
          demandLevel: 'MEDIUM'
        },
        constraints: [],
        amenities: [],
        tags: []
      });
      
      await loadData();
      
    } catch (error) {
      console.error('❌ [MappaProgetti] Errore creazione posizione progetto:', error);
      toast.error('❌ Errore durante la creazione della posizione progetto');
    }
  };

  const applyFilters = async () => {
    try {
      console.log('🔍 [MappaProgetti] Applicazione filtri:', activeFilters);
      
      const filtered = await projectMapService.getProjectLocationsWithFilters(activeFilters);
      setFilteredLocations(filtered);
      
      // Ricrea cluster con progetti filtrati
      const mapClusters = await projectMapService.createMapClusters(filtered, mapViewport.zoom);
      setClusters(mapClusters);
      
      toast.success(`✅ Filtri applicati: ${filtered.length} progetti trovati`);
      
    } catch (error) {
      console.error('❌ [MappaProgetti] Errore applicazione filtri:', error);
      toast.error('❌ Errore durante l\'applicazione dei filtri');
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setFilteredLocations(projectLocations);
    setClusters([]);
    projectMapService.createMapClusters(projectLocations, mapViewport.zoom).then(setClusters);
    toast.success('✅ Filtri rimossi');
  };

  const handleLocationClick = (location: ProjectLocation) => {
    setSelectedLocation(location);
    setShowLocationDetails(true);
  };

  const handleClusterClick = (cluster: MapCluster) => {
    if (cluster.projects.length === 1) {
      handleLocationClick(cluster.projects[0]);
    } else {
      // Zoom in sul cluster
      setMapViewport(prev => ({
        ...prev,
        center: { lat: cluster.center.latitude, lng: cluster.center.longitude },
        zoom: Math.min(prev.zoom + 2, 18)
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBuildingTypeIcon = (type: string) => {
    switch (type) {
      case 'VILLA': return <BuildingIcon className="h-4 w-4" />;
      case 'APARTMENT': return <BuildingIcon className="h-4 w-4" />;
      case 'OFFICE': return <BuildingIcon className="h-4 w-4" />;
      case 'COMMERCIAL': return <BuildingIcon className="h-4 w-4" />;
      case 'INDUSTRIAL': return <BuildingIcon className="h-4 w-4" />;
      default: return <BuildingIcon className="h-4 w-4" />;
    }
  };

  const getUrbanAreaColor = (area: string) => {
    switch (area) {
      case 'URBAN': return 'bg-blue-100 text-blue-800';
      case 'SUBURBAN': return 'bg-green-100 text-green-800';
      case 'RURAL': return 'bg-yellow-100 text-yellow-800';
      case 'COASTAL': return 'bg-cyan-100 text-cyan-800';
      case 'MOUNTAIN': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <DashboardLayout title="Mappa Progetti">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento mappa progetti...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mappa Progetti">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600 text-xl">❌ {error}</div>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Riprova
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mappa Progetti">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mappa</h1>
            <p className="text-gray-600 mt-2">
              Visualizza progetti e opportunità su mappa interattiva
            </p>
          </div>
          
          {/* Azioni principali */}
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FilterIcon className="h-4 w-4 mr-2 inline" />
              Filtri
            </button>
            
            <button 
              onClick={() => setShowNewLocationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2 inline" />
              Nuovo Progetto
            </button>
          </div>
        </div>

        {/* Filtri */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtri Avanzati</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stato Progetto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stato Progetto</label>
                <select
                  multiple
                  value={activeFilters.projectStatus || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setActiveFilters(prev => ({ ...prev, projectStatus: selected }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PLANNING">Pianificazione</option>
                  <option value="IN_PROGRESS">In Corso</option>
                  <option value="COMPLETED">Completato</option>
                  <option value="ON_HOLD">In Pausa</option>
                  <option value="CANCELLED">Cancellato</option>
                </select>
              </div>

              {/* Tipo Edificio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Edificio</label>
                <select
                  multiple
                  value={activeFilters.buildingType || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setActiveFilters(prev => ({ ...prev, buildingType: selected }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VILLA">Villa</option>
                  <option value="APARTMENT">Appartamento</option>
                  <option value="OFFICE">Uffici</option>
                  <option value="COMMERCIAL">Commerciale</option>
                  <option value="INDUSTRIAL">Industriale</option>
                </select>
              </div>

              {/* Zona Urbana */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona Urbana</label>
                <select
                  multiple
                  value={activeFilters.urbanArea || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setActiveFilters(prev => ({ ...prev, urbanArea: selected }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="URBAN">Urbana</option>
                  <option value="SUBURBAN">Suburbana</option>
                  <option value="RURAL">Rurale</option>
                  <option value="COASTAL">Costiera</option>
                  <option value="MOUNTAIN">Montana</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (€)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeFilters.budgetRange?.min || ''}
                    onChange={(e) => setActiveFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, min: parseInt(e.target.value) || 0 }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeFilters.budgetRange?.max || ''}
                    onChange={(e) => setActiveFilters(prev => ({
                      ...prev,
                      budgetRange: { ...prev.budgetRange, max: parseInt(e.target.value) || 999999999 }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ROI Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ROI (%)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={activeFilters.roiRange?.min || ''}
                    onChange={(e) => setActiveFilters(prev => ({
                      ...prev,
                      roiRange: { ...prev.roiRange, min: parseInt(e.target.value) || 0 }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={activeFilters.roiRange?.max || ''}
                    onChange={(e) => setActiveFilters(prev => ({
                      ...prev,
                      roiRange: { ...prev.roiRange, max: parseInt(e.target.value) || 100 }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Città */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Città</label>
                <select
                  multiple
                  value={activeFilters.city || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setActiveFilters(prev => ({ ...prev, city: selected }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Roma">Roma</option>
                  <option value="Milano">Milano</option>
                  <option value="Torino">Torino</option>
                  <option value="Napoli">Napoli</option>
                  <option value="Firenze">Firenze</option>
                </select>
              </div>
            </div>

            {/* Azioni filtri */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Pulisci
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Applica Filtri
              </button>
            </div>
          </div>
        )}

        {/* Statistiche Progetti */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{filteredLocations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredLocations.length > 0 
                    ? Math.round(filteredLocations.reduce((sum, l) => sum + l.marketData.roi, 0) / filteredLocations.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <EuroIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Budget Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredLocations.reduce((sum, l) => sum + l.budget.estimated, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BuildingIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Corso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredLocations.filter(l => l.projectStatus === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mappa Interattiva */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Mappa Interattiva</h3>
            <p className="text-sm text-gray-600 mt-1">
              Visualizza {filteredLocations.length} progetti su mappa
            </p>
          </div>
          
          {/* Container Mappa */}
          <div 
            ref={mapContainerRef}
            className="h-96 bg-gray-100 relative overflow-hidden"
          >
            {/* Simulazione Mappa Interattiva */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <MapIcon className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Mappa Interattiva</h3>
                <p className="text-gray-500 mb-4">
                  {filteredLocations.length} progetti visualizzati
                </p>
                
                {/* Simulazione Marker */}
                <div className="flex justify-center space-x-4">
                  {filteredLocations.slice(0, 3).map((location, index) => (
                    <div
                      key={location.id}
                      onClick={() => handleLocationClick(location)}
                      className="cursor-pointer transform hover:scale-110 transition-transform"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 w-16 truncate">
                        {location.projectName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista Progetti */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Progetti ({filteredLocations.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progetto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localizzazione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            {getBuildingTypeIcon(location.buildingType)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{location.projectName}</div>
                          <div className="text-sm text-gray-500">{location.buildingType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{location.city}, {location.province}</div>
                        <div className="text-sm text-gray-500">{location.neighborhood}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(location.projectStatus)}`}>
                        {location.projectStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrbanAreaColor(location.urbanArea)}`}>
                        {location.urbanArea}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(location.budget.estimated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.marketData.roi}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleLocationClick(location)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modale Nuovo Progetto */}
        {showNewLocationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nuovo Progetto su Mappa</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Progetto</label>
                    <input
                      type="text"
                      value={newLocationData.projectName}
                      onChange={(e) => setNewLocationData(prev => ({ ...prev, projectName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                    <input
                      type="text"
                      value={newLocationData.address}
                      onChange={(e) => setNewLocationData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                      <input
                        type="text"
                        value={newLocationData.city}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                      <input
                        type="text"
                        value={newLocationData.province}
                        onChange={(e) => setNewLocationData(prev => ({ ...prev, province: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Edificio</label>
                    <select
                      value={newLocationData.buildingType}
                      onChange={(e) => setNewLocationData(prev => ({ ...prev, buildingType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="VILLA">Villa</option>
                      <option value="APARTMENT">Appartamento</option>
                      <option value="OFFICE">Uffici</option>
                      <option value="COMMERCIAL">Commerciale</option>
                      <option value="INDUSTRIAL">Industriale</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Stimato (€)</label>
                    <input
                      type="number"
                      value={newLocationData.budget.estimated}
                      onChange={(e) => setNewLocationData(prev => ({ 
                        ...prev, 
                        budget: { ...prev.budget, estimated: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewLocationModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={createNewProjectLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crea Progetto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Dettagli Progetto */}
        {showLocationDetails && selectedLocation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedLocation.projectName}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                    <p className="text-sm text-gray-900">{selectedLocation.address}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                      <p className="text-sm text-gray-900">{selectedLocation.city}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                      <p className="text-sm text-gray-900">{selectedLocation.province}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLocation.projectStatus)}`}>
                      {selectedLocation.projectStatus}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedLocation.budget.estimated)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ROI</label>
                    <p className="text-sm text-gray-900">{selectedLocation.marketData.roi}%</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area Terreno</label>
                    <p className="text-sm text-gray-900">{selectedLocation.area.landArea} m²</p>
                  </div>
                  
                  {selectedLocation.constraints.urbanPlanning.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vincoli</label>
                      <div className="space-y-1">
                        {selectedLocation.constraints.urbanPlanning.map((constraint, index) => (
                          <p key={index} className="text-sm text-gray-900">• {constraint}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedLocation.amenities.transport.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Servizi</label>
                      <div className="space-y-1">
                        {selectedLocation.amenities.transport.map((amenity, index) => (
                          <p key={index} className="text-sm text-gray-900">• {amenity}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowLocationDetails(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
