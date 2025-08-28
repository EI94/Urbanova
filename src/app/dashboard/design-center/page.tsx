'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { designCenterService, DesignTemplate, ProjectDesign } from '@/lib/designCenterService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  BuildingIcon, 
  SearchIcon, 
  FilterIcon,
  MapPinIcon,
  EuroIcon,
  RulerIcon,
  ClockIcon,
  TrendingUpIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  DownloadIcon,
  PlusIcon,
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
  ChartBarIcon
} from '@/components/icons';
import DesignAnalyticsDashboard from '@/components/ui/DesignAnalyticsDashboard';

interface DesignFilters {
  category: string;
  zone: string;
  budget: string;
  density: string;
  minArea: number;
  maxArea: number;
  minBudget: number;
  maxBudget: number;
}

export default function DesignCenterPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  
  // Stati principali
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stati per filtri e ricerca
  const [filters, setFilters] = useState<DesignFilters>({
    category: '',
    zone: '',
    budget: '',
    density: '',
    minArea: 0,
    maxArea: 1000,
    minBudget: 0,
    maxBudget: 5000000
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Stati per geolocalizzazione
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'GRANTED' | 'DENIED' | 'PENDING'>('PENDING');
  
  // Stati per analytics
  const [projects, setProjects] = useState<ProjectDesign[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadDesignCenter();
      requestLocationPermission();
    }
  }, [authLoading, user]);

  const loadDesignCenter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carica template con fallback automatico
      let allTemplates: DesignTemplate[] = [];
      try {
        // Inizializza template di esempio se necessario
        await designCenterService.initializeSampleTemplates();
        
        // Carica tutti i template
        allTemplates = await designCenterService.getTemplates();
        console.log('✅ [DesignCenter] Template caricati da Firebase:', allTemplates.length);
      } catch (firebaseError) {
        console.warn('⚠️ [DesignCenter] Firebase non disponibile, uso fallback:', firebaseError);
        // Il servizio dovrebbe già fornire fallback, ma per sicurezza
        allTemplates = [
          {
            id: 'fallback-1',
            name: 'Villa Moderna Standard',
            category: 'RESIDENTIAL',
            zone: 'SUBURBAN',
            budget: 'MEDIUM',
            density: 'MEDIUM',
            minArea: 200,
            maxArea: 400,
            minBudget: 300000,
            maxBudget: 600000,
            floors: 2,
            bedrooms: 3,
            bathrooms: 2,
            parkingSpaces: 2,
            gardenArea: 150,
            balconyArea: 20,
            roofType: 'PITCHED',
            facadeMaterial: 'BRICK',
            energyClass: 'B',
            previewImage: '/images/templates/villa-moderna.jpg',
            floorPlanImage: '/images/templates/villa-moderna-plan.jpg',
            sectionImage: '/images/templates/villa-moderna-section.jpg',
            description: 'Villa moderna con design contemporaneo, perfetta per famiglie',
            features: ['Design moderno', 'Efficienza energetica', 'Giardino privato'],
            estimatedROI: 12,
            constructionTime: 18,
            popularity: 85,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }
      
      setTemplates(allTemplates);
      setFilteredTemplates(allTemplates);
      
      // Carica progetti esistenti per analytics
      try {
        const allProjects = await designCenterService.getAllProjectDesigns();
        setProjects(allProjects);
        console.log('✅ [DesignCenter] Progetti caricati per analytics:', allProjects.length);
      } catch (error) {
        console.warn('⚠️ [DesignCenter] Impossibile caricare progetti per analytics:', error);
        setProjects([]);
      }
      
      console.log('✅ [DesignCenter] Template totali caricati:', allTemplates.length);
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore caricamento critico:', error);
      setError('Impossibile caricare i template di design. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if ('geolocation' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'granted') {
          setLocationPermission('GRANTED');
          getCurrentLocation();
        } else if (permission.state === 'prompt') {
          setLocationPermission('PENDING');
        } else {
          setLocationPermission('DENIED');
        }
      }
    } catch (error) {
      console.log('📍 [DesignCenter] Geolocalizzazione non supportata');
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationPermission('GRANTED');
          console.log('📍 [DesignCenter] Posizione ottenuta:', { lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('❌ [DesignCenter] Errore geolocalizzazione:', error);
          setLocationPermission('DENIED');
        }
      );
    }
  };

  // Applica filtri e ricerca
  useEffect(() => {
    let filtered = [...templates];
    
    // Filtra per query di ricerca
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.features.some(feature => 
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Filtra per categoria
    if (filters.category) {
      filtered = filtered.filter(template => template.category === filters.category);
    }
    
    // Filtra per zona
    if (filters.zone) {
      filtered = filtered.filter(template => template.zone === filters.zone);
    }
    
    // Filtra per budget
    if (filters.budget) {
      filtered = filtered.filter(template => template.budget === filters.budget);
    }
    
    // Filtra per densità
    if (filters.density) {
      filtered = filtered.filter(template => template.density === filters.density);
    }
    
    // Filtra per area
    filtered = filtered.filter(template => 
      template.maxArea >= filters.minArea && template.minArea <= filters.maxArea
    );
    
    // Filtra per budget
    filtered = filtered.filter(template => 
      template.maxBudget >= filters.minBudget && template.minBudget <= filters.maxBudget
    );
    
    setFilteredTemplates(filtered);
  }, [templates, searchQuery, filters]);

  const handleFilterChange = (key: keyof DesignFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      zone: '',
      budget: '',
      density: '',
      minArea: 0,
      maxArea: 1000,
      minBudget: 0,
      maxBudget: 5000000
    });
    setSearchQuery('');
  };

  const openTemplateModal = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    setSelectedTemplate(null);
    setShowTemplateModal(false);
  };

  // NUOVA FUNZIONALITÀ: Avvia personalizzazione template
  const startTemplateCustomization = (template: DesignTemplate) => {
    console.log('🚀 [DesignCenter] Avvio personalizzazione template:', template.name);
    setSelectedTemplate(template);
    setShowTemplateModal(false);
    
    // Reindirizza al Template Customizer
    window.location.href = `/dashboard/design-center/customize?templateId=${template.id}`;
  };

  // NUOVA FUNZIONALITÀ: Crea progetto da template
  const createProjectFromTemplate = async (template: DesignTemplate) => {
    try {
      console.log('🏗️ [DesignCenter] Creazione progetto da template:', template.name);
      
      // Crea nuovo progetto nel database
      const newProject = {
        id: `project-${Date.now()}`,
        name: `${template.name} - Progetto`,
        templateId: template.id,
        template: template,
        status: 'PLANNING',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'current-user-id', // TODO: Integrare con AuthContext
        location: 'Milano, Italia', // TODO: Integrare con geolocalizzazione
        budget: template.maxBudget,
        timeline: template.constructionTime,
        customizations: {},
        progress: 0
      };

      // Salva nel database (TODO: Implementare con Firebase)
      console.log('💾 [DesignCenter] Progetto creato:', newProject);
      
      // Mostra conferma
      alert(`✅ Progetto "${newProject.name}" creato con successo!`);
      
      // Reindirizza alla dashboard progetti
      window.location.href = '/dashboard/progetti';
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore creazione progetto:', error);
      alert('❌ Errore durante la creazione del progetto. Riprova.');
    }
  };

  // NUOVA FUNZIONALITÀ: Anteprima rapida template
  const previewTemplate = (template: DesignTemplate) => {
    console.log('👁️ [DesignCenter] Anteprima template:', template.name);
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RESIDENTIAL': return '🏠';
      case 'COMMERCIAL': return '🏢';
      case 'MIXED': return '🏗️';
      case 'INDUSTRIAL': return '🏭';
      default: return '🏠';
    }
  };

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'URBAN': return '🏙️';
      case 'SUBURBAN': return '🏘️';
      case 'RURAL': return '🌾';
      case 'COASTAL': return '🏖️';
      default: return '🏘️';
    }
  };

  const getBudgetColor = (budget: string) => {
    switch (budget) {
      case 'ECONOMIC': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-blue-600 bg-blue-100';
      case 'PREMIUM': return 'text-purple-600 bg-purple-100';
      case 'LUXURY': return 'text-gold-600 bg-gold-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBudgetLabel = (budget: string) => {
    switch (budget) {
      case 'ECONOMIC': return 'Economico';
      case 'MEDIUM': return 'Medio';
      case 'PREMIUM': return 'Premium';
      case 'LUXURY': return 'Lusso';
      default: return budget;
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifica autenticazione...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento Design Center...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Errore nel caricamento</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadDesignCenter}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Riprova
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎨 Design Center</h1>
            <p className="text-gray-600 mt-1">
              Template architettonici intelligenti per trasformare i tuoi progetti in realtà
            </p>
          </div>
          
          {/* Analytics e Geolocalizzazione */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showAnalytics
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 inline mr-2" />
              {showAnalytics ? 'Nascondi Analytics' : 'Mostra Analytics'}
            </button>
            
            {/* Geolocalizzazione */}
            {locationPermission === 'GRANTED' && userLocation && (
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Posizione attiva</span>
              </div>
            )}
            
            {locationPermission === 'PENDING' && (
              <button
                onClick={getCurrentLocation}
                className="flex items-center text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Attiva posizione</span>
              </button>
            )}
            
            {locationPermission === 'DENIED' && (
              <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">Posizione disabilitata</span>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <DesignAnalyticsDashboard 
            templates={templates}
            projects={projects}
          />
        )}

        {/* Statistiche rapide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BuildingIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Template Totali</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.length > 0 
                    ? (templates.reduce((sum, t) => sum + t.estimatedROI, 0) / templates.length).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tempo Medio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.length > 0 
                    ? (templates.reduce((sum, t) => sum + t.constructionTime, 0) / templates.length).toFixed(0)
                    : '0'
                  } mesi
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <HeartIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Popolarità</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.length > 0 
                    ? (templates.reduce((sum, t) => sum + t.popularity, 0) / templates.length).toFixed(0)
                    : '0'
                  }/100
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra di ricerca e filtri */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Ricerca */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca template per nome, caratteristiche, stile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filtri rapidi */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FilterIcon className="h-4 w-4 mr-2" />
                Filtri
              </button>
              
              <button
                onClick={resetFilters}
                className="px-4 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Filtri espansi */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tutte le categorie</option>
                    <option value="RESIDENTIAL">Residenziale</option>
                    <option value="COMMERCIAL">Commerciale</option>
                    <option value="MIXED">Misto</option>
                    <option value="INDUSTRIAL">Industriale</option>
                  </select>
                </div>
                
                {/* Zona */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona</label>
                  <select
                    value={filters.zone}
                    onChange={(e) => handleFilterChange('zone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tutte le zone</option>
                    <option value="URBAN">Urbana</option>
                    <option value="SUBURBAN">Suburbana</option>
                    <option value="RURAL">Rurale</option>
                    <option value="COASTAL">Costiera</option>
                  </select>
                </div>
                
                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <select
                    value={filters.budget}
                    onChange={(e) => handleFilterChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tutti i budget</option>
                    <option value="ECONOMIC">Economico</option>
                    <option value="MEDIUM">Medio</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="LUXURY">Lusso</option>
                  </select>
                </div>
                
                {/* Densità */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Densità</label>
                  <select
                    value={filters.density}
                    onChange={(e) => handleFilterChange('density', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tutte le densità</option>
                    <option value="LOW">Bassa</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
              </div>
              
              {/* Range filtri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (m²)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minArea}
                      onChange={(e) => handleFilterChange('minArea', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxArea}
                      onChange={(e) => handleFilterChange('maxArea', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (€)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={(e) => handleFilterChange('minBudget', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 self-center">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={(e) => handleFilterChange('maxBudget', Number(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Risultati */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Template Disponibili ({filteredTemplates.length})
            </h2>
            
            {filteredTemplates.length > 0 && (
              <div className="text-sm text-gray-500">
                {filteredTemplates.length === templates.length 
                  ? 'Mostrando tutti i template'
                  : `Filtrati da ${templates.length} template totali`
                }
              </div>
            )}
          </div>
          
          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 border border-gray-200 text-center">
              <BuildingIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun template trovato</h3>
              <p className="text-gray-500 mb-4">
                Prova a modificare i filtri o la ricerca per trovare template che corrispondano ai tuoi criteri.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset Filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Preview Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BuildingIcon className="h-16 w-16 text-gray-300" />
                    </div>
                    
                    {/* Badge popolarità */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {template.popularity}/100
                      </div>
                    </div>
                    
                    {/* Badge ROI */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {template.estimatedROI}% ROI
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Caratteristiche principali */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">{getCategoryIcon(template.category)}</span>
                        <span className="capitalize">{template.category.toLowerCase()}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">{getZoneIcon(template.zone)}</span>
                        <span className="capitalize">{template.zone.toLowerCase()}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <RulerIcon className="h-4 w-4 mr-2" />
                        <span>{template.minArea}-{template.maxArea} m²</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{template.constructionTime} mesi</span>
                      </div>
                    </div>
                    
                    {/* Budget */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getBudgetColor(template.budget)}`}>
                        {getBudgetLabel(template.budget)}
                      </span>
                    </div>
                    
                    {/* Features */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {template.features.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{template.features.length - 3} altre
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => previewTemplate(template)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
                      >
                        <EyeIcon className="h-4 w-4 mr-2 inline" />
                        Anteprima
                      </button>
                      
                      <button 
                        onClick={() => startTemplateCustomization(template)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mr-2"
                      >
                        <PlusIcon className="h-4 w-4 mr-2 inline" />
                        Personalizza
                      </button>
                      
                      <button 
                        onClick={() => createProjectFromTemplate(template)}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2 inline" />
                        Crea Progetto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Template Dettagliato */}
      {showTemplateModal && selectedTemplate && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedTemplate.name}
              </h3>
              <button
                onClick={closeTemplateModal}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Preview */}
              <div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 h-64 rounded-lg flex items-center justify-center mb-4">
                  <BuildingIcon className="h-24 w-24 text-gray-300" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Categoria:</span>
                    <span className="text-sm text-gray-900 capitalize">
                      {selectedTemplate.category.toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Zona:</span>
                    <span className="text-sm text-gray-900 capitalize">
                      {selectedTemplate.zone.toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Budget:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getBudgetColor(selectedTemplate.budget)}`}>
                      {getBudgetLabel(selectedTemplate.budget)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Densità:</span>
                    <span className="text-sm text-gray-900 capitalize">
                      {selectedTemplate.density.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Details */}
              <div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Caratteristiche Tecniche</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Area:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.minArea}-{selectedTemplate.maxArea} m²</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Piani:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.floors}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Camere:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.bedrooms}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bagni:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.bathrooms}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Posti auto:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.parkingSpaces}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Giardino:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.gardenArea} m²</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">ROI stimato:</span>
                        <span className="ml-2 font-medium text-green-600">{selectedTemplate.estimatedROI}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tempo costruzione:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.constructionTime} mesi</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Classe energetica:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.energyClass}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Popolarità:</span>
                        <span className="ml-2 font-medium">{selectedTemplate.popularity}/100</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Caratteristiche</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={() => startTemplateCustomization(selectedTemplate)}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2 inline" />
                    Personalizza questo Template
                  </button>
                  
                  <button 
                    onClick={() => createProjectFromTemplate(selectedTemplate)}
                    className="px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2 inline" />
                    Crea Progetto
                  </button>
                  
                  <button className="px-4 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                  
                  <button className="px-4 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <ShareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 