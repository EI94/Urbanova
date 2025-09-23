'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  Star,
  Clock,
  Users,
  MapPin,
  BarChart3,
  TrendingUp,
  FileText,
  CreditCard,
  Shield,
  Calendar,
  Target,
  Bot,
  Sparkles,
  Settings,
  CheckCircle,
} from 'lucide-react';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import DashboardLayout from '@/components/layout/DashboardLayout';

// ============================================================================
// TYPES
// ============================================================================

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  tags: string[];
  rating: number;
  downloads: number;
  createdAt: string;
  isPremium: boolean;
}

interface Project {
  id: string;
  name: string;
  template: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  progress: number;
  lastModified: string;
  thumbnail: string;
  location?: string;
  budget?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DesignCenterPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'projects' | 'analytics'>('templates');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data for templates
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Villa Moderna',
          category: 'residential',
          thumbnail: '/templates/villa-moderna.jpg',
          description: 'Design elegante per villa moderna con spazi aperti',
          tags: ['moderna', 'villa', 'lusso'],
          rating: 4.8,
          downloads: 1250,
          createdAt: '2024-01-15',
          isPremium: false,
        },
        {
          id: '2',
          name: 'Condominio Sostenibile',
          category: 'residential',
          thumbnail: '/templates/condominio-eco.jpg',
          description: 'Progetto eco-sostenibile per complesso residenziale',
          tags: ['sostenibile', 'condominio', 'eco'],
          rating: 4.9,
          downloads: 890,
          createdAt: '2024-01-10',
          isPremium: true,
        },
        {
          id: '3',
          name: 'Centro Commerciale',
          category: 'commercial',
          thumbnail: '/templates/centro-commerciale.jpg',
          description: 'Layout ottimizzato per centro commerciale moderno',
          tags: ['commerciale', 'retail', 'moderno'],
          rating: 4.6,
          downloads: 650,
          createdAt: '2024-01-05',
          isPremium: true,
        },
      ];

      // Mock data for projects
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Villa Moderna Roma',
          template: 'Villa Moderna',
          status: 'in_progress',
          progress: 75,
          lastModified: '2024-01-20',
          thumbnail: '/projects/villa-roma.jpg',
          location: 'Roma, Italia',
          budget: 450000,
        },
        {
          id: '2',
          name: 'Condominio Eco Milano',
          template: 'Condominio Sostenibile',
          status: 'completed',
          progress: 100,
          lastModified: '2024-01-18',
          thumbnail: '/projects/condominio-milano.jpg',
          location: 'Milano, Italia',
          budget: 1200000,
        },
        {
          id: '3',
          name: 'Centro Commerciale Napoli',
          template: 'Centro Commerciale',
          status: 'draft',
          progress: 25,
          lastModified: '2024-01-15',
          thumbnail: '/projects/centro-napoli.jpg',
          location: 'Napoli, Italia',
          budget: 2500000,
        },
      ];

      setTemplates(mockTemplates);
      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
                         template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Design Center">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Design Center">
      {/* Page Header */}
        <div className="mb-6 px-6">
          <div className="flex items-center space-x-4 mb-4">
          </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <p className="text-gray-600 text-lg">
            Crea e personalizza i tuoi progetti con i template professionali
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Template Gallery
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              I Miei Progetti
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca template o progetti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti</option>
            <option value="residential">Residenziale</option>
            <option value="commercial">Commerciale</option>
            <option value="industrial">Industriale</option>
            <option value="public">Pubblico</option>
          </select>
        </div>

        {/* Content */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Template Disponibili</h2>
              <span className="text-sm text-gray-500">{filteredTemplates.length} template</span>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                      <Building className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        {template.isPremium && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{template.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{template.downloads} download</span>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Usa Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          {template.isPremium && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {template.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{template.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">{template.downloads} download</span>
                          <span className="text-sm text-gray-500">{template.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                          Usa Template
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">I Miei Progetti</h2>
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nuovo Progetto</span>
              </button>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                      <Building className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status === 'completed' ? 'Completato' :
                           project.status === 'in_progress' ? 'In Corso' :
                           project.status === 'draft' ? 'Bozza' : 'Archiviato'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Template: {project.template}</p>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>Ultima modifica: {project.lastModified}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                          Modifica
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Share className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status === 'completed' ? 'Completato' :
                             project.status === 'in_progress' ? 'In Corso' :
                             project.status === 'draft' ? 'Bozza' : 'Archiviato'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Template: {project.template}</p>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Ultima modifica: {project.lastModified}</span>
                          {project.location && <span>📍 {project.location}</span>}
                          {project.budget && <span>💰 €{project.budget.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Share className="w-4 h-4" />
                        </button>
                        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                          Modifica
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Template Utilizzati</p>
                    <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Progetti Completati</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {projects.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Progetti in Corso</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {projects.filter(p => p.status === 'in_progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tempo Medio</p>
                    <p className="text-2xl font-semibold text-gray-900">15 giorni</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </DashboardLayout>
  );
}
