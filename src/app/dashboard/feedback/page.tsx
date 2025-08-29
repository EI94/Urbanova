'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { feedbackService, Feedback } from '@/lib/feedbackService';
import { toast } from 'react-hot-toast';
import { 
  Bug, 
  Lightbulb, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  Filter,
  Search,
  Eye,
  MessageSquare,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface Feedback {
  id: string;
  type: 'bug' | 'improvement' | 'feature' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  screen?: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  userEmail?: string;
  attachmentUrl?: string;
  createdAt: any;
  updatedAt?: any;
  assignedTo?: string;
  resolvedAt?: any;
  resolution?: string;
  tags: string[];
}

const FeedbackDashboard: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadFeedbacks = async () => {
      try {
        setLoading(true);
        const feedbacksData = await feedbackService.getAllFeedback();
        setFeedbacks(feedbacksData);
      } catch (error) {
        console.error('Errore caricamento feedback:', error);
        toast('Errore caricamento feedback', { icon: '❌' });
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, [user]);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filterType !== 'all' && feedback.type !== filterType) return false;
    if (filterPriority !== 'all' && feedback.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && feedback.status !== filterStatus) return false;
    if (searchTerm && !feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !feedback.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const updateFeedbackStatus = async (feedbackId: string, status: Feedback['status']) => {
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, status);
      toast('Stato feedback aggiornato', { icon: '✅' });
      
      // Ricarica i feedback per aggiornare l'UI
      const feedbacksData = await feedbackService.getAllFeedback();
      setFeedbacks(feedbacksData);
    } catch (error) {
      console.error('Errore aggiornamento stato:', error);
      toast('Errore aggiornamento stato', { icon: '❌' });
    }
  };

  const getTypeIcon = (type: Feedback['type']) => {
    switch (type) {
      case 'bug': return <Bug className="w-5 h-5 text-red-600" />;
      case 'improvement': return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'feature': return <Star className="w-5 h-5 text-green-600" />;
      case 'other': return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Feedback['status']) => {
    switch (status) {
      case 'new': return 'Nuovo';
      case 'in_progress': return 'In Lavorazione';
      case 'resolved': return 'Risolto';
      case 'closed': return 'Chiuso';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'low': return 'Bassa';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Critica';
      default: return priority;
    }
  };

  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter(f => f.status === 'new').length,
    inProgress: feedbacks.filter(f => f.status === 'in_progress').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    bugs: feedbacks.filter(f => f.type === 'bug').length,
    improvements: feedbacks.filter(f => f.type === 'improvement').length,
    features: feedbacks.filter(f => f.type === 'feature').length,
    critical: feedbacks.filter(f => f.priority === 'critical').length
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard Feedback">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard Feedback">
      <div className="space-y-6">
        {/* Header e Statistiche */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard Feedback</h1>
              <p className="text-gray-600 mt-1">Gestisci e analizza tutti i feedback degli utenti</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              <span>{stats.total} feedback totali</span>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Nuovi</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{stats.new}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">In Lavorazione</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.inProgress}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Risolti</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">{stats.resolved}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Critici</span>
              </div>
              <div className="text-2xl font-bold text-red-900 mt-1">{stats.critical}</div>
            </div>
          </div>

          {/* Filtri */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtri:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti i tipi</option>
              <option value="bug">Bug</option>
              <option value="improvement">Miglioramenti</option>
              <option value="feature">Nuove funzionalità</option>
              <option value="other">Altro</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutte le priorità</option>
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Critica</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti gli stati</option>
              <option value="new">Nuovo</option>
              <option value="in_progress">In Lavorazione</option>
              <option value="resolved">Risolto</option>
              <option value="closed">Chiuso</option>
            </select>
          </div>

          {/* Ricerca */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca nei feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista Feedback */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Feedback ({filteredFeedbacks.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFeedbacks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nessun feedback trovato con i filtri selezionati</p>
              </div>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(feedback.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {feedback.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feedback.priority)}`}>
                            {getPriorityLabel(feedback.priority)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                            {getStatusLabel(feedback.status)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {feedback.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {feedback.screen && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {feedback.screen}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {feedback.createdAt?.toDate?.() ? 
                              feedback.createdAt.toDate().toLocaleDateString('it-IT') : 
                              new Date(feedback.createdAt).toLocaleDateString('it-IT')
                            }
                          </span>
                          {feedback.userEmail && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {feedback.userEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowDetails(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Visualizza dettagli"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {feedback.status === 'new' && (
                        <select
                          value={feedback.status}
                          onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value as Feedback['status'])}
                          className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="new">Nuovo</option>
                          <option value="in_progress">In Lavorazione</option>
                          <option value="resolved">Risolto</option>
                          <option value="closed">Chiuso</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Dettagli */}
      {showDetails && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedFeedback.type)}
                  <div>
                    <h2 className="text-xl font-bold">{selectedFeedback.title}</h2>
                    <p className="text-blue-100">Feedback #{selectedFeedback.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Dettagli</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{selectedFeedback.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priorità:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedFeedback.priority)}`}>
                        {getPriorityLabel(selectedFeedback.priority)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stato:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                        {getStatusLabel(selectedFeedback.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Schermata:</span>
                      <span className="font-medium">{selectedFeedback.screen || 'Non specificata'}</span>
                    </div>
                    {selectedFeedback.userEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email utente:</span>
                        <span className="font-medium">{selectedFeedback.userEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creato:</span>
                      <span className="font-medium">
                        {selectedFeedback.createdAt?.toDate?.() ? 
                          selectedFeedback.createdAt.toDate().toLocaleString('it-IT') : 
                          new Date(selectedFeedback.createdAt).toLocaleString('it-IT')
                        }
                      </span>
                    </div>
                    {selectedFeedback.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aggiornato:</span>
                        <span className="font-medium">
                          {selectedFeedback.updatedAt?.toDate?.() ? 
                            selectedFeedback.updatedAt.toDate().toLocaleString('it-IT') : 
                            new Date(selectedFeedback.updatedAt).toLocaleString('it-IT')
                          }
                        </span>
                      </div>
                    )}
                    {selectedFeedback.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risolto:</span>
                        <span className="font-medium">
                          {selectedFeedback.resolvedAt?.toDate?.() ? 
                            selectedFeedback.resolvedAt.toDate().toLocaleString('it-IT') : 
                            new Date(selectedFeedback.resolvedAt).toLocaleString('it-IT')
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Descrizione</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.description}</p>
                </div>
              </div>

              {selectedFeedback.attachmentUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📎 Allegato</h3>
                  <a
                    href={selectedFeedback.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Visualizza Allegato
                  </a>
                </div>
              )}

              {selectedFeedback.tags && selectedFeedback.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Tag</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeedback.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  ID: #{selectedFeedback.id}
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => updateFeedbackStatus(selectedFeedback.id, e.target.value as Feedback['status'])}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">Nuovo</option>
                    <option value="in_progress">In Lavorazione</option>
                    <option value="resolved">Risolto</option>
                    <option value="closed">Chiuso</option>
                  </select>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FeedbackDashboard;
