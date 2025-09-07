'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

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
          endDate: '2024-01-15',
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
        {
          id: '4',
          title: 'Consegna Documentazione Tecnica',
          description: 'Consegna della documentazione tecnica completa',
          type: 'delivery',
          status: 'overdue',
          priority: 'high',
          startDate: '2024-01-30',
          endDate: '2024-01-30',
          assignedTo: ['Anna Neri'],
          projectId: '2',
          dependencies: [],
          progress: 0,
        },
        {
          id: '5',
          title: 'Collaudo Impianti Elettrici',
          description: 'Collaudo e test degli impianti elettrici',
          type: 'task',
          status: 'pending',
          priority: 'high',
          startDate: '2024-02-20',
          endDate: '2024-02-25',
          assignedTo: ['Marco Blu', 'Sara Rossi'],
          projectId: '1',
          dependencies: ['2'],
          progress: 0,
        },
      ];

      setProjects(mockProjects);
      setTimelineEvents(mockEvents);
    } catch (error) {
      console.error('Error loading timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      in_progress: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      overdue: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'In Attesa',
      in_progress: 'In Corso',
      completed: 'Completato',
      overdue: 'In Ritardo',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      milestone: 'text-purple-600 bg-purple-100',
      task: 'text-blue-600 bg-blue-100',
      meeting: 'text-green-600 bg-green-100',
      deadline: 'text-red-600 bg-red-100',
      delivery: 'text-orange-600 bg-orange-100',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      milestone: 'Milestone',
      task: 'Task',
      meeting: 'Riunione',
      deadline: 'Scadenza',
      delivery: 'Consegna',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
      critical: 'Critica',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const filteredEvents = timelineEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesProject = selectedProject === 'all' || event.projectId === selectedProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
          <div>
                  <h1 className="text-xl font-semibold text-gray-900">Project Timeline AI</h1>
                  <p className="text-sm text-gray-600">Gestisci timeline e scadenze dei progetti</p>
              </div>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Nuovo Evento</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <Link href="/dashboard/unified" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/dashboard/market-intelligence" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span>Market Intelligence</span>
              </Link>
              <Link href="/dashboard/feasibility-analysis" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Analisi Fattibilità</span>
              </Link>
              <Link href="/dashboard/design-center" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Building className="w-5 h-5" />
                <span>Design Center</span>
              </Link>
              <Link href="/dashboard/business-plan" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Target className="w-5 h-5" />
                <span>Business Plan</span>
              </Link>
              <Link href="/dashboard/permits-compliance" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Shield className="w-5 h-5" />
                <span>Permessi & Compliance</span>
              </Link>
              <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Project Timeline AI</span>
              </Link>
              <Link href="/dashboard/progetti" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Building className="w-5 h-5" />
                <span>Progetti</span>
              </Link>
              <Link href="/dashboard/billing" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <CreditCard className="w-5 h-5" />
                <span>Billing & Usage</span>
              </Link>
            </nav>
          </div>
          </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendario
            </button>
                  <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
                  </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cerca eventi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {filteredEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(event.type)}`}>
                        {getTypeLabel(event.type)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(event.priority)}`}>
                        {getPriorityLabel(event.priority)}
                      </span>
          </div>
        </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Inizio: {formatDate(event.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Fine: {formatDate(event.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Progresso: {event.progress}%
                    </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Assegnato a: {event.assignedTo.join(', ')}
                          </span>
                        </div>
                        </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${event.progress}%` }}
                            ></div>
                          </div>
                  
                  {event.dependencies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Dipendenze:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.dependencies.map(depId => {
                          const depEvent = timelineEvents.find(e => e.id === depId);
                          return depEvent ? (
                            <span key={depId} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {depEvent.title}
                            </span>
                          ) : null;
                        })}
                      </div>
          </div>
        )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Modifica
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                        Completa
                      </button>
                  </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                  </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Vista Calendario</p>
                  <p className="text-sm text-gray-500">Integrazione calendario in sviluppo</p>
                </div>
            </div>
          </div>
        )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Eventi Totali</h3>
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{timelineEvents.length}</div>
                <p className="text-sm text-gray-600">Eventi nella timeline</p>
                        </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">In Corso</h3>
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {timelineEvents.filter(e => e.status === 'in_progress').length}
                </div>
                <p className="text-sm text-gray-600">Eventi attualmente in corso</p>
                        </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Completati</h3>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {timelineEvents.filter(e => e.status === 'completed').length}
                </div>
                <p className="text-sm text-gray-600">Eventi completati</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">In Ritardo</h3>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {timelineEvents.filter(e => e.status === 'overdue').length}
                </div>
                <p className="text-sm text-gray-600">Eventi in ritardo</p>
                        </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Progresso Medio</h3>
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {Math.round(timelineEvents.reduce((sum, e) => sum + e.progress, 0) / timelineEvents.length)}%
                          </div>
                <p className="text-sm text-gray-600">Progresso medio degli eventi</p>
                        </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Progetti Attivi</h3>
                  <Building className="w-5 h-5 text-blue-600" />
                        </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {projects.filter(p => p.status === 'in_progress').length}
                </div>
                <p className="text-sm text-gray-600">Progetti in corso</p>
              </div>
            </div>
          )}
          </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
