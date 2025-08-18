'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from './Badge';
import { 
  CollaborationSession, 
  CollaborationParticipant, 
  CollaborationTemplate,
  CollaborationType
} from '@/types/realtime';
import { realtimeService } from '@/lib/realtimeService';
import { TeamRole } from '@/types/team';

interface RealtimeCollaborationProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function RealtimeCollaboration({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar
}: RealtimeCollaborationProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'templates' | 'live'>('sessions');
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [templates, setTemplates] = useState<CollaborationTemplate[]>([]);
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newSession, setNewSession] = useState({
    templateId: '',
    name: '',
    description: '',
    maxParticipants: 10
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const userSessions = realtimeService.getUserSessions(currentUserId);
    setSessions(userSessions);
    
    const availableTemplates = realtimeService.getAvailableTemplates();
    setTemplates(availableTemplates);
  };

  const handleCreateSession = () => {
    try {
      const creator: CollaborationParticipant = {
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        userRole: currentUserRole,
        joinedAt: new Date(),
        lastSeen: new Date(),
        isActive: true,
        presence: 'online',
        permissions: ['VIEW_ANALYTICS', 'ADD_COMMENTS'],
        contributions: { changesCount: 0, commentsCount: 0, timeSpent: 0 },
        currentActivity: 'Creazione sessione'
      };

      const session = realtimeService.createSession(
        newSession.templateId,
        newSession.name,
        newSession.description,
        creator,
        {},
        newSession.maxParticipants
      );

      setSessions(prev => [session, ...prev]);
      setShowCreateForm(false);
      setNewSession({ templateId: '', name: '', description: '', maxParticipants: 10 });
    } catch (error) {
      console.error('Errore creazione sessione:', error);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    try {
      const participant: CollaborationParticipant = {
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        userRole: currentUserRole,
        joinedAt: new Date(),
        lastSeen: new Date(),
        isActive: true,
        presence: 'online',
        permissions: ['VIEW_ANALYTICS', 'ADD_COMMENTS'],
        contributions: { changesCount: 0, commentsCount: 0, timeSpent: 0 },
        currentActivity: 'Unione sessione'
      };

      const updatedSession = realtimeService.joinSession(sessionId, participant);
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      setSelectedSession(updatedSession);
      setActiveTab('live');
    } catch (error) {
      console.error('Errore unione sessione:', error);
    }
  };

  const getTypeColor = (type: CollaborationType) => {
    switch (type) {
      case 'search': return 'bg-blue-100 text-blue-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      case 'presentation': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-orange-100 text-orange-800';
      case 'workflow': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: CollaborationType) => {
    switch (type) {
      case 'search': return '🔍';
      case 'analysis': return '📊';
      case 'presentation': return '📽️';
      case 'document': return '📄';
      case 'workflow': return '🔄';
      default: return '📋';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">⚡ Real-time Collaboration</h2>
              <p className="text-green-100">Collabora in tempo reale con il tuo team</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-green-200 transition-colors">
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'sessions', name: '🎯 Sessioni', count: sessions.length },
              { id: 'templates', name: '📝 Template', count: templates.length },
              { id: 'live', name: '⚡ Live', count: selectedSession ? 1 : 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Tab: Sessioni */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Le tue Sessioni</h3>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  ➕ Nuova Sessione
                </button>
              </div>

              <div className="grid gap-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{session.name}</h4>
                          <Badge className={getTypeColor(session.type)}>
                            {getTypeIcon(session.type)} {session.type}
                          </Badge>
                          <Badge className={
                            session.status === 'active' ? 'bg-green-100 text-green-800' :
                            session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {session.status === 'active' ? '🟢' : '🟡'} {session.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{session.description}</p>
                        <div className="text-sm text-gray-500">
                          👥 {session.participants.length}/{session.maxParticipants} partecipanti
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinSession(session.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        ▶️ Unisciti
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {sessions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna sessione trovata</h3>
                  <p className="text-gray-500">Crea la tua prima sessione collaborativa!</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Template */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Template Disponibili</h3>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <Badge className={getTypeColor(template.type)}>
                        {getTypeIcon(template.type)} {template.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    <div className="text-sm text-gray-500">
                      👥 Max {template.defaultMaxParticipants} partecipanti | 
                      ✨ {template.features.length} funzionalità
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Live Collaboration */}
          {activeTab === 'live' && selectedSession && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  ⚡ Sessione Live: {selectedSession.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    👥 {selectedSession.participants.length} partecipanti attivi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[400px]">
                    <h4 className="font-medium text-gray-900 mb-4">📋 Area Collaborativa</h4>
                    <p className="text-gray-600">
                      Tipo: {selectedSession.type} | 
                      Partecipanti: {selectedSession.participants.length} | 
                      Stato: {selectedSession.status}
                    </p>
                    <div className="mt-4 p-4 bg-white rounded border">
                      <p className="text-sm text-gray-700">
                        🎯 Questa è l'area dove puoi collaborare in tempo reale con il tuo team.
                        I cursori, commenti e modifiche sono sincronizzati istantaneamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">👥 Partecipanti Online</h4>
                    <div className="space-y-2">
                      {selectedSession.participants
                        .filter(p => p.isActive)
                        .map((participant) => (
                          <div key={participant.userId} className="flex items-center space-x-2">
                            <span className="text-lg">{participant.userAvatar}</span>
                            <span className="text-sm font-medium">{participant.userName}</span>
                            <span className="text-xs text-green-600">🟢 Online</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">💬 Commenti Live</h4>
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                      💡 I commenti live appariranno qui in tempo reale quando i partecipanti interagiscono.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Creazione Sessione */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crea Nuova Sessione</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select
                    value={newSession.templateId}
                    onChange={(e) => setNewSession(prev => ({ ...prev, templateId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleziona template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newSession.name}
                    onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nome della sessione"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Descrizione della sessione"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Partecipanti</label>
                  <input
                    type="number"
                    value={newSession.maxParticipants}
                    onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="2"
                    max="50"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={!newSession.templateId || !newSession.name}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crea Sessione
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
