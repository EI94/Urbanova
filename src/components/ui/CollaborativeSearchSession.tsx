'use client';

import React, { useState } from 'react';

import {
  UsersIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ShareIcon,
  LockIcon,
  UnlockIcon,
  EyeIcon,
  MessageCircleIcon,
} from '@/components/icons';

import { Badge } from './Badge';
import Button from './Button';

interface SearchSession {
  id: string;
  name: string;
  criteria: any;
  status: 'active' | 'paused' | 'completed' | 'shared';
  createdBy: string;
  createdAt: Date;
  participants: string[];
  isPublic: boolean;
  currentResults: number;
  maxResults: number;
}

interface CollaborativeSearchSessionProps {
  isOpen: boolean;
  onClose: () => void;
  currentSearchCriteria?: any;
  onCreateSession: (session: Omit<SearchSession, 'id' | 'createdAt' | 'currentResults'>) => void;
  onJoinSession: (sessionId: string) => void;
  onShareSession: (sessionId: string) => void;
}

export default function CollaborativeSearchSession({
  isOpen,
  onClose,
  currentSearchCriteria,
  onCreateSession,
  onJoinSession,
  onShareSession,
}: CollaborativeSearchSessionProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'create' | 'join' | 'history'>('active');
  const [newSessionName, setNewSessionName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [maxResults, setMaxResults] = useState(100);

  // Mock data per sessioni attive
  const activeSessions: SearchSession[] = [
    {
      id: 'session-1',
      name: 'Ricerca Roma Centro - Team A',
      criteria: { location: 'Roma Centro', maxPrice: 500000 },
      status: 'active',
      createdBy: 'Marco Rossi',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      participants: ['Marco Rossi', 'Laura Bianchi', 'Giuseppe Verdi'],
      isPublic: true,
      currentResults: 45,
      maxResults: 100,
    },
    {
      id: 'session-2',
      name: 'Analisi Milano Zona Espansione',
      criteria: { location: 'Milano', propertyType: 'residenziale' },
      status: 'paused',
      createdBy: 'Laura Bianchi',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      participants: ['Laura Bianchi', 'Marco Rossi'],
      isPublic: false,
      currentResults: 23,
      maxResults: 50,
    },
  ];

  const handleCreateSession = () => {
    if (newSessionName.trim() && currentSearchCriteria) {
      onCreateSession({
        name: newSessionName,
        criteria: currentSearchCriteria,
        status: 'active',
        createdBy: 'Current User',
        participants: ['Current User'],
        isPublic,
        maxResults,
      });
      setNewSessionName('');
      setActiveTab('active');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'info';
      case 'shared':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '▶️';
      case 'paused':
        return '⏸️';
      case 'completed':
        return '✅';
      case 'shared':
        return '📤';
      default:
        return '⏹️';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <UsersIcon className="h-6 w-6" />
                Sessioni di Ricerca Collaborative
              </h2>
              <p className="text-blue-100 mt-1">
                Lavora insieme al team per trovare le migliori opportunità immobiliari
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors">
              <span className="sr-only">Chiudi</span>
              <div className="w-8 h-8 flex items-center justify-center text-2xl">×</div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-4">
            {[
              { id: 'active', name: 'Sessioni Attive', icon: '▶️', count: activeSessions.length },
              { id: 'create', name: 'Crea Sessione', icon: '➕' },
              { id: 'join', name: 'Unisciti', icon: '🤝' },
              { id: 'history', name: 'Cronologia', icon: '📚' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <Badge variant="secondary" className="ml-1">
                      {tab.count}
                    </Badge>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Active Sessions Tab */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sessioni Attive</h3>
                <Badge variant="default" className="text-sm">
                  {activeSessions.filter(s => s.status === 'active').length} Attive
                </Badge>
              </div>

              <div className="grid gap-4">
                {activeSessions.map(session => (
                  <div
                    key={session.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{session.name}</h4>
                          <Badge variant={getStatusColor(session.status) as any}>
                            {getStatusIcon(session.status)} {session.status}
                          </Badge>
                          {session.isPublic ? (
                            <Badge variant="outline" className="text-green-600">
                              <UnlockIcon className="h-3 w-3 mr-1" />
                              Pubblica
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <LockIcon className="h-3 w-3 mr-1" />
                              Privata
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Creato da</p>
                            <p className="font-medium text-gray-900">{session.createdBy}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Partecipanti</p>
                            <p className="font-medium text-gray-900">
                              {session.participants.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Risultati</p>
                            <p className="font-medium text-gray-900">
                              {session.currentResults}/{session.maxResults}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Avviata</p>
                            <p className="font-medium text-gray-900">
                              {session.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Criteri di ricerca:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(session.criteria).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Partecipanti:</span>
                        <div className="flex -space-x-2">
                          {session.participants.slice(0, 3).map((participant, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium border-2 border-white"
                            >
                              {participant.charAt(0)}
                            </div>
                          ))}
                          {session.participants.length > 3 && (
                            <div className="w-8 h-8 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium border-2 border-white">
                              +{session.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {session.status === 'active' && (
                          <>
                            <Button variant="outline" size="sm">
                              <PauseIcon className="h-4 w-4 mr-1" />
                              Pausa
                            </Button>
                            <Button variant="outline" size="sm">
                              <StopIcon className="h-4 w-4 mr-1" />
                              Stop
                            </Button>
                          </>
                        )}
                        {session.status === 'paused' && (
                          <Button variant="primary" size="sm">
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Riprendi
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onJoinSession(session.id)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Visualizza
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onShareSession(session.id)}
                        >
                          <ShareIcon className="h-4 w-4 mr-1" />
                          Condividi
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Session Tab */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Crea Nuova Sessione Collaborativa
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Sessione
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Ricerca Roma Centro - Team A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newSessionName}
                    onChange={e => setNewSessionName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criteri di Ricerca Correnti
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    {currentSearchCriteria ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(currentSearchCriteria).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-sm font-medium text-gray-600">{key}:</span>
                            <span className="ml-2 text-sm text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Nessun criterio di ricerca attivo</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={e => setIsPublic(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                      Sessione pubblica (visibile a tutti i membri)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero Massimo Risultati
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={maxResults}
                    onChange={e => setMaxResults(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCreateSession}
                    disabled={!newSessionName.trim() || !currentSearchCriteria}
                    className="flex-1"
                  >
                    <UsersIcon className="h-5 w-5 mr-2" />
                    Crea Sessione Collaborativa
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setActiveTab('active')}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Join Session Tab */}
          {activeTab === 'join' && (
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Unisciti a una Sessione</h3>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <UsersIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-blue-900 mb-2">
                  Sessioni Pubbliche Disponibili
                </h4>
                <p className="text-blue-700 mb-4">
                  Le sessioni pubbliche sono visibili a tutti i membri del team. Clicca su
                  "Visualizza" per unirti a una sessione attiva.
                </p>

                <div className="text-left">
                  {activeSessions
                    .filter(s => s.isPublic)
                    .map(session => (
                      <div key={session.id} className="bg-white p-3 rounded border mb-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{session.name}</span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onJoinSession(session.id)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Unisciti
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cronologia Sessioni</h3>

              <div className="bg-gray-50 p-6 rounded-lg border">
                <MessageCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Nessuna Sessione Completata
                </h4>
                <p className="text-gray-600">
                  Le sessioni completate appariranno qui per riferimento futuro.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
