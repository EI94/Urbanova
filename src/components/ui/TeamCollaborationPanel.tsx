'use client';

import React, { useState } from 'react';
import { UsersIcon, MessageCircleIcon, StarIcon, XIcon, PlusIcon } from '@/components/icons';
import { Badge } from './Badge';
import Button from './Button';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  currentActivity: string;
}

interface TeamComment {
  id: string;
  memberId: string;
  memberName: string;
  landId: string;
  comment: string;
  timestamp: Date;
  type: 'comment' | 'vote' | 'favorite';
}

interface TeamCollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSearchId?: string;
  onAddComment: (landId: string, comment: string) => void;
  onVote: (landId: string, vote: 'like' | 'dislike') => void;
  onAddToSharedFavorites: (landId: string) => void;
}

export default function TeamCollaborationPanel({
  isOpen,
  onClose,
  currentSearchId,
  onAddComment,
  onVote,
  onAddToSharedFavorites
}: TeamCollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'comments' | 'favorites' | 'activity'>('team');
  const [newComment, setNewComment] = useState('');
  const [selectedLandId, setSelectedLandId] = useState<string>('');

  // Mock data per team members
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Marco Rossi',
      avatar: '👨‍💼',
      isOnline: true,
      currentActivity: 'Analizzando terreni a Roma'
    },
    {
      id: '2',
      name: 'Laura Bianchi',
      avatar: '👩‍💼',
      isOnline: true,
      currentActivity: 'Valutando ROI progetti'
    },
    {
      id: '3',
      name: 'Giuseppe Verdi',
      avatar: '👨‍💼',
      isOnline: false,
      currentActivity: 'Ultima attività: Ricerca Milano'
    }
  ];

  // Mock data per commenti team
  const teamComments: TeamComment[] = [
    {
      id: '1',
      memberId: '1',
      memberName: 'Marco Rossi',
      landId: 'land-1',
      comment: 'Ottima posizione, prezzo interessante per la zona!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: 'comment'
    },
    {
      id: '2',
      memberId: '2',
      memberName: 'Laura Bianchi',
      landId: 'land-1',
      comment: 'Concordo, ROI stimato del 18%',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: 'comment'
    }
  ];

  const sharedFavorites = ['land-1', 'land-3', 'land-5'];

  const handleAddComment = () => {
    if (newComment.trim() && selectedLandId) {
      onAddComment(selectedLandId, newComment);
      setNewComment('');
      setSelectedLandId('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Team Collaboration
          </h3>
          <button onClick={onClose} className="text-white hover:text-blue-200">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        {currentSearchId && (
          <p className="text-blue-100 text-sm mt-1">Sessione: {currentSearchId}</p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 p-2">
          {[
            { id: 'team', name: 'Team', icon: '👥', count: teamMembers.length },
            { id: 'comments', name: 'Commenti', icon: '💬', count: teamComments.length },
            { id: 'favorites', name: 'Preferiti', icon: '⭐', count: sharedFavorites.length },
            { id: 'activity', name: 'Attività', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                {tab.count !== undefined && (
                  <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Membri Team Attivi</h4>
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{member.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                  <p className="text-sm text-gray-600">{member.currentActivity}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Commenti Team</h4>
              <Button variant="outline" size="sm" onClick={() => setSelectedLandId('land-new')}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Nuovo Commento
              </Button>
            </div>

            {/* Add Comment Form */}
            {selectedLandId === 'land-new' && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-900">Terreno ID:</span>
                  <input
                    type="text"
                    placeholder="Inserisci ID terreno"
                    className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded"
                    value={selectedLandId === 'land-new' ? '' : selectedLandId}
                    onChange={(e) => setSelectedLandId(e.target.value)}
                  />
                </div>
                <textarea
                  placeholder="Scrivi un commento..."
                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded resize-none"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || !selectedLandId}
                  >
                    Invia
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLandId('');
                      setNewComment('');
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {teamComments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">{comment.memberName}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.type === 'comment' ? '💬' : comment.type === 'vote' ? '👍' : '⭐'}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Terreno: {comment.landId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Preferiti Condivisi</h4>
            <div className="space-y-2">
              {sharedFavorites.map((landId) => (
                <div key={landId} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-gray-900">Terreno {landId}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onVote(landId, 'like')}>
                      👍
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onVote(landId, 'dislike')}>
                      👎
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-3">Attività Recenti</h4>
            <div className="space-y-3">
              {[
                { action: 'Nuova ricerca avviata', member: 'Marco Rossi', time: '2 min fa', icon: '🔍' },
                { action: 'Terreno aggiunto ai preferiti', member: 'Laura Bianchi', time: '5 min fa', icon: '⭐' },
                { action: 'Commento aggiunto', member: 'Marco Rossi', time: '8 min fa', icon: '💬' },
                { action: 'Voto positivo registrato', member: 'Giuseppe Verdi', time: '15 min fa', icon: '👍' }
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">da {activity.member}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
