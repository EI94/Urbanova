'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  FileText,
  Shield,
  Calendar,
  Plus,
  Target,
  Bot,
  Sparkles,
  MessageCircle,
  Search,
  TrendingUp,
  Building,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Share,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed' | 'industrial';
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  budget: number;
  spent: number;
  progress: number;
  startDate: string;
  endDate: string;
  location: string;
  team: string[];
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'plan' | 'report' | 'permit' | 'invoice';
  status: 'draft' | 'review' | 'approved' | 'signed';
  createdAt: string;
  updatedAt: string;
  size: string;
  format: string;
  description: string;
  projectId: string;
}

interface Meeting {
  id: string;
  title: string;
  type: 'team' | 'client' | 'stakeholder' | 'review';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  time: string;
  duration: number;
  participants: string[];
  agenda: string[];
  projectId: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectManagementPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'documents' | 'meetings'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Mock data
  React.useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Progetto Aurora Residenziale',
        type: 'residential',
        status: 'in_progress',
        budget: 2500000,
        spent: 1800000,
        progress: 72,
        startDate: '2023-06-01',
        endDate: '2024-12-31',
        location: 'Roma, Quartiere Aurelio',
        team: ['Mario Rossi', 'Giulia Bianchi', 'Luca Verdi'],
        description: 'Complesso residenziale di 50 unità abitative',
        priority: 'high',
      },
      {
        id: '2',
        name: 'Skyline Tower Commerciale',
        type: 'commercial',
        status: 'planning',
        budget: 5000000,
        spent: 500000,
        progress: 15,
        startDate: '2024-01-01',
        endDate: '2026-06-30',
        location: 'Milano, Porta Nuova',
        team: ['Anna Neri', 'Paolo Blu', 'Sara Rosa'],
        description: 'Torre commerciale di 30 piani',
        priority: 'critical',
      },
      {
        id: '3',
        name: 'Green Park Misto',
        type: 'mixed',
        status: 'completed',
        budget: 1800000,
        spent: 1800000,
        progress: 100,
        startDate: '2022-03-01',
        endDate: '2023-11-30',
        location: 'Torino, Corso Francia',
        team: ['Marco Gialli', 'Elena Viola'],
        description: 'Complesso misto residenziale e commerciale',
        priority: 'medium',
      },
    ];

    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Contratto Appalto Aurora',
        type: 'contract',
        status: 'signed',
        createdAt: '2023-05-15',
        updatedAt: '2023-05-20',
        size: '2.5 MB',
        format: 'PDF',
        description: 'Contratto di appalto per il progetto Aurora',
        projectId: '1',
      },
      {
        id: '2',
        name: 'Planimetrie Skyline',
        type: 'plan',
        status: 'approved',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15',
        size: '15.2 MB',
        format: 'DWG',
        description: 'Planimetrie architettoniche del progetto Skyline',
        projectId: '2',
      },
      {
        id: '3',
        name: 'Report Progresso Aurora',
        type: 'report',
        status: 'review',
        createdAt: '2024-01-25',
        updatedAt: '2024-01-25',
        size: '1.8 MB',
        format: 'PDF',
        description: 'Report mensile di progresso del progetto Aurora',
        projectId: '1',
      },
    ];

    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Review Settimanale Aurora',
        type: 'team',
        status: 'scheduled',
        date: '2024-02-05',
        time: '10:00',
        duration: 60,
        participants: ['Mario Rossi', 'Giulia Bianchi', 'Luca Verdi'],
        agenda: ['Progresso lavori', 'Problemi tecnici', 'Prossimi step'],
        projectId: '1',
      },
      {
        id: '2',
        title: 'Presentazione Skyline al Cliente',
        type: 'client',
        status: 'scheduled',
        date: '2024-02-08',
        time: '14:30',
        duration: 90,
        participants: ['Anna Neri', 'Paolo Blu', 'Cliente XYZ'],
        agenda: ['Presentazione progetto', 'Budget e timeline', 'Q&A'],
        projectId: '2',
      },
      {
        id: '3',
        title: 'Meeting Stakeholder Green Park',
        type: 'stakeholder',
        status: 'completed',
        date: '2024-01-30',
        time: '16:00',
        duration: 120,
        participants: ['Marco Gialli', 'Elena Viola', 'Comune Torino'],
        agenda: ['Consegna progetto', 'Documentazione finale', 'Chiusura'],
        projectId: '3',
      },
    ];

    setProjects(mockProjects);
    setDocuments(mockDocuments);
    setMeetings(mockMeetings);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'text-blue-600 bg-blue-100',
      in_progress: 'text-green-600 bg-green-100',
      completed: 'text-gray-600 bg-gray-100',
      on_hold: 'text-yellow-600 bg-yellow-100',
      draft: 'text-gray-600 bg-gray-100',
      review: 'text-orange-600 bg-orange-100',
      approved: 'text-green-600 bg-green-100',
      signed: 'text-blue-600 bg-blue-100',
      scheduled: 'text-blue-600 bg-blue-100',
      cancelled: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'In Pianificazione',
      in_progress: 'In Corso',
      completed: 'Completato',
      on_hold: 'In Pausa',
      draft: 'Bozza',
      review: 'In Revisione',
      approved: 'Approvato',
      signed: 'Firmato',
      scheduled: 'Programmato',
      cancelled: 'Cancellato',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      residential: 'Residenziale',
      commercial: 'Commerciale',
      mixed: 'Misto',
      industrial: 'Industriale',
      contract: 'Contratto',
      plan: 'Planimetria',
      report: 'Report',
      permit: 'Permesso',
      invoice: 'Fattura',
      team: 'Team',
      client: 'Cliente',
      stakeholder: 'Stakeholder',
      review: 'Review',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT').format(num);
  };

  return (
    <DashboardLayout title="Gestione Progetti">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="w-8 h-8 text-purple-600" />
                Gestione Progetti
              </h1>
              <p className="text-gray-600 mt-2">
                Gestisci documenti, riunioni e timeline dei tuoi progetti
              </p>
            </div>
            <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Progetto
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Progetti
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'documents'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Documenti
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'meetings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Riunioni
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Building className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(project.type)}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="font-medium">{formatCurrency(project.budget)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Speso</p>
                          <p className="font-medium">{formatCurrency(project.spent)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Inizio</p>
                          <p className="font-medium">{formatDate(project.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fine</p>
                          <p className="font-medium">{formatDate(project.endDate)}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Progresso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {getPriorityLabel(project.priority)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Team: {project.team.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Share className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(document.type)}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{document.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Formato</p>
                          <p className="font-medium">{document.format}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Dimensione</p>
                          <p className="font-medium">{document.size}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Creato</p>
                          <p className="font-medium">{formatDate(document.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aggiornato</p>
                          <p className="font-medium">{formatDate(document.updatedAt)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {getStatusLabel(document.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(meeting.type)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Data</p>
                          <p className="font-medium">{formatDate(meeting.date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ora</p>
                          <p className="font-medium">{meeting.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Durata</p>
                          <p className="font-medium">{meeting.duration} min</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Partecipanti</p>
                          <p className="font-medium">{meeting.participants.length}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Agenda:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {meeting.agenda.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                          {getStatusLabel(meeting.status)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Partecipanti: {meeting.participants.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FeedbackWidget />
    </DashboardLayout>
  );
}