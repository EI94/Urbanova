'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Trash2,
  Share,
  BarChart3,
  TrendingUp,
  FileText,
  Shield,
  Bot,
  Sparkles,
  SettingsIcon,
  DashboardIcon,
  SearchIcon,
  FileTextIcon,
  BuildingIcon,
  TargetIcon,
  ShieldIcon,
  CalendarIcon,
  PlusIcon,
  MapIcon,
  EuroIcon,
  CheckCircleIcon,
  EditIcon,
  CalculatorIcon,
  ClockIcon,
  FilterIcon,
  EyeIcon,
} from '@/components/icons';
import {
  BarChart3 as BarChart3Lucide,
  FileText as FileTextLucide,
  Shield as ShieldLucide,
  Calendar as CalendarLucide,
  Plus as PlusLucide,
  Target as TargetLucide,
  Bot as BotLucide,
  Sparkles as SparklesLucide,
  MessageCircle as MessageCircleLucide,
  Eye,
  Edit,
  Download,
  Building,
  CreditCard,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

// ============================================================================
// TYPES
// ============================================================================

interface ProjectLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  budget: number;
  progress: number;
  startDate: string;
  endDate?: string;
  team: string[];
  tags: string[];
}

interface MapFilter {
  status: string[];
  budgetRange: [number, number];
  dateRange: [string, string];
  tags: string[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MappaProgettiPage() {
  const [projects, setProjects] = useState<ProjectLocation[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectLocation | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    loadData();
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedStatus]);

  useEffect(() => {
    if (mapLoaded && filteredProjects.length > 0) {
      updateMapMarkers();
    }
  }, [mapLoaded, filteredProjects]);

  const loadData = async () => {
    try {
      // Mock project data
      const mockProjects: ProjectLocation[] = [
        {
          id: '1',
          name: 'Villa Moderna Roma',
          address: 'Via Appia Antica, 123, Roma',
          coordinates: { lat: 41.9028, lng: 12.4964 },
          status: 'in_progress',
          budget: 850000,
          progress: 65,
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          team: ['Pierpaolo Laurito', 'Mario Rossi'],
          tags: ['residenziale', 'moderno', 'lusso'],
        },
        {
          id: '2',
          name: 'Condominio Sostenibile Milano',
          address: 'Corso Buenos Aires, 456, Milano',
          coordinates: { lat: 45.4642, lng: 9.1900 },
          status: 'planning',
          budget: 2500000,
          progress: 25,
          startDate: '2024-02-01',
          endDate: '2024-12-31',
          team: ['Giulia Bianchi', 'Luca Verdi'],
          tags: ['sostenibile', 'condominio', 'eco'],
        },
        {
          id: '3',
          name: 'Centro Commerciale Napoli',
          address: 'Via Chiaia, 789, Napoli',
          coordinates: { lat: 40.8518, lng: 14.2681 },
          status: 'completed',
          budget: 5200000,
          progress: 100,
          startDate: '2023-06-01',
          endDate: '2024-01-15',
          team: ['Anna Neri', 'Marco Blu'],
          tags: ['commerciale', 'retail', 'moderno'],
        },
        {
          id: '4',
          name: 'Residenze Torino',
          address: 'Via Po, 321, Torino',
          coordinates: { lat: 45.0703, lng: 7.6869 },
          status: 'on_hold',
          budget: 1800000,
          progress: 40,
          startDate: '2023-09-01',
          team: ['Sara Rossi', 'Paolo Bianchi'],
          tags: ['residenziale', 'torino', 'ristrutturazione'],
        },
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Errore nel caricamento dei progetti');
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleMaps = () => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    // Usa una chiave API temporanea per il test
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBvOkBw7cG6hY7v8x9z0a1b2c3d4e5f6g7h8';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeMap();
    };
    script.onerror = () => {
      console.warn('Google Maps non caricato. Usando mappa mock.');
      setMapLoaded(true);
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 41.9028, lng: 12.4964 }, // Centro Italia
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    googleMapRef.current = map;
    setMapLoaded(true);
  };

  const updateMapMarkers = () => {
    if (!googleMapRef.current) return;

    // Rimuovi marcatori esistenti
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Aggiungi nuovi marcatori
    filteredProjects.forEach(project => {
      const marker = new google.maps.Marker({
        position: project.coordinates,
        map: googleMapRef.current,
        title: project.name,
        icon: {
          url: getMarkerIcon(project.status),
          scaledSize: new google.maps.Size(32, 32),
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(project)
      });

      marker.addListener('click', () => {
        setSelectedProject(project);
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Centra la mappa sui progetti
    if (filteredProjects.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredProjects.forEach(project => {
        bounds.extend(project.coordinates);
      });
      googleMapRef.current.fitBounds(bounds);
    }
  };

  const getMarkerIcon = (status: string) => {
    const colors = {
      planning: '#3B82F6', // blue
      in_progress: '#10B981', // green
      completed: '#6B7280', // gray
      on_hold: '#F59E0B', // yellow
    };
    
    const color = colors[status as keyof typeof colors] || '#6B7280';
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M16 8l4 8-4 8-4-8z" fill="white"/>
      </svg>
    `)}`;
  };

  const createInfoWindowContent = (project: ProjectLocation) => {
    return `
      <div class="p-4 max-w-xs">
        <h3 class="font-semibold text-gray-900 mb-2">${project.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${project.address}</p>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Stato:</span>
            <span class="font-medium">${getStatusLabel(project.status)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Budget:</span>
            <span class="font-medium">${formatCurrency(project.budget)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Progresso:</span>
            <span class="font-medium">${project.progress}%</span>
          </div>
        </div>
        <div class="mt-3">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: ${project.progress}%"></div>
          </div>
        </div>
      </div>
    `;
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'text-blue-600 bg-blue-100',
      in_progress: 'text-green-600 bg-green-100',
      completed: 'text-gray-600 bg-gray-100',
      on_hold: 'text-yellow-600 bg-yellow-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'Pianificazione',
      in_progress: 'In Corso',
      completed: 'Completato',
      on_hold: 'In Pausa',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento mappa...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
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
    <DashboardLayout>
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-red-600" />
              Mappa Progetti
            </h1>
            <p className="text-gray-600 mt-2">
              Visualizza e gestisci i tuoi progetti sulla mappa interattiva
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span>Nuovo Progetto</span>
            </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca progetti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti gli Stati</option>
              <option value="planning">Pianificazione</option>
              <option value="in_progress">In Corso</option>
              <option value="completed">Completato</option>
              <option value="on_hold">In Pausa</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3Lucide className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-96 relative">
              {!mapLoaded ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Caricamento Google Maps...</p>
                  </div>
                </div>
              ) : typeof google !== 'undefined' && google.maps ? (
                <div ref={mapRef} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center">
                    <MapIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Mappa Interattiva</h3>
                    <p className="text-gray-600 mb-4">Visualizza i tuoi progetti sulla mappa</p>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      {filteredProjects.map(project => (
                        <div key={project.id} className="bg-white p-3 rounded-lg shadow-sm border">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${
                              project.status === 'planning' ? 'bg-blue-500' :
                              project.status === 'in_progress' ? 'bg-green-500' :
                              project.status === 'completed' ? 'bg-gray-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900">{project.name}</span>
                          </div>
                          <p className="text-xs text-gray-600">{project.address}</p>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{project.progress}% completato</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Pianificazione</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">In Corso</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completato</span>
              </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">In Pausa</span>
              </div>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredProjects.length} progetti visualizzati
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progetto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indirizzo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{formatDate(project.startDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(project.budget)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
              </div>
                          <span className="text-sm text-gray-900">{project.progress}%</span>
              </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                            <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Corso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <CalendarLucide className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completati</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <TargetLucide className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </div>
                    </div>
                  </div>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </DashboardLayout>
  );
}
