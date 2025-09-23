'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  FileText,
  CreditCard,
  Shield,
  Target,
  Building,
  Bot,
  Sparkles,
  Settings,
} from 'lucide-react';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import DashboardLayout from '@/components/layout/DashboardLayout';

// ============================================================================
// TYPES
// ============================================================================

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'task' | 'meeting' | 'deadline' | 'delivery';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  assignedTo: string[];
  projectId: string;
  dependencies: string[];
  progress: number;
}

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  progress: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectTimelinePage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'calendar' | 'analytics'>('timeline');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock projects data
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Villa Moderna Roma',
          status: 'in_progress',
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          progress: 65,
        },
        {
          id: '2',
          name: 'Condominio Sostenibile Milano',
          status: 'planning',
          startDate: '2024-02-01',
          endDate: '2024-12-31',
          progress: 25,
        },
        {
          id: '3',
          name: 'Centro Commerciale Napoli',
          status: 'completed',
          startDate: '2023-06-01',
          endDate: '2023-12-15',
          progress: 100,
        },
      ];

      // Mock timeline events data
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          title: 'Approvazione Progetto Definitivo',
          description: 'Approvazione del progetto definitivo da parte del cliente',
          type: 'milestone',
          status: 'completed',
          priority: 'high',
          startDate: '2024-01-20',
          endDate: '2024-01-20',
          assignedTo: ['Pierpaolo Laurito', 'Mario Rossi'],
          projectId: '1',
          dependencies: [],
          progress: 100,
        },
        {
          id: '2',
          title: 'Inizio Lavori di Fondazione',
          description: 'Avvio dei lavori di scavo e fondazione',
          type: 'task',
          status: 'in_progress',
          priority: 'critical',
          startDate: '2024-01-25',
          endDate: '2024-02-15',
          assignedTo: ['Giulia Bianchi', 'Luca Verdi'],
          projectId: '1',
          dependencies: ['1'],
          progress: 60,
        },
        {
          id: '3',
          title: 'Riunione Team Progetto',
          description: 'Riunione settimanale per aggiornamento stato lavori',
          type: 'meeting',
          status: 'pending',
          priority: 'medium',
          startDate: '2024-02-05',
          endDate: '2024-02-05',
          assignedTo: ['Pierpaolo Laurito', 'Mario Rossi', 'Giulia Bianchi'],
          projectId: '1',
          dependencies: [],
          progress: 0,
        },
      ];

      setProjects(mockProjects);
      setTimelineEvents(mockEvents);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = timelineEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
                         event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesProject = selectedProject === 'all' || event.projectId === selectedProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'delivery': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Project Timeline AI">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Project Timeline AI">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendario
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

          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuovo Evento</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca eventi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli Stati</option>
            <option value="pending">In Attesa</option>
            <option value="in_progress">In Corso</option>
            <option value="completed">Completato</option>
            <option value="overdue">In Ritardo</option>
          </select>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i Progetti</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Timeline Progetti</h2>
              <span className="text-sm text-gray-500">{filteredEvents.length} eventi</span>
            </div>

            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                          {event.status === 'completed' ? 'Completato' :
                           event.status === 'in_progress' ? 'In Corso' :
                           event.status === 'pending' ? 'In Attesa' : 'In Ritardo'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(event.type)}`}>
                          {event.type === 'milestone' ? 'Milestone' :
                           event.type === 'task' ? 'Task' :
                           event.type === 'meeting' ? 'Riunione' :
                           event.type === 'deadline' ? 'Scadenza' : 'Consegna'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(event.priority)}`}>
                          {event.priority === 'critical' ? 'Critica' :
                           event.priority === 'high' ? 'Alta' :
                           event.priority === 'medium' ? 'Media' : 'Bassa'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Inizio</p>
                          <p className="text-sm font-medium text-gray-900">{event.startDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Fine</p>
                          <p className="text-sm font-medium text-gray-900">{event.endDate}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span>{event.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${event.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Assegnato a</p>
                            <div className="flex items-center space-x-2">
                              {event.assignedTo.map((person, index) => (
                                <span key={index} className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                  {person}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Share className="w-4 h-4" />
                          </button>
                          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Modifica
                          </button>
                          <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            Completa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Vista Calendario</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center text-gray-500 py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Vista calendario in sviluppo...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Eventi Totali</p>
                    <p className="text-2xl font-semibold text-gray-900">{timelineEvents.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completati</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {timelineEvents.filter(e => e.status === 'completed').length}
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
                    <p className="text-sm text-gray-600">In Corso</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {timelineEvents.filter(e => e.status === 'in_progress').length}
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
                    <p className="text-sm text-gray-600">In Ritardo</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {timelineEvents.filter(e => e.status === 'overdue').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
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
