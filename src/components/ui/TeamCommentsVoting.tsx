'use client';

import React, { useState } from 'react';
import { 
  MessageCircleIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon,
  StarIcon,
  UserIcon,
  ClockIcon,
  ReplyIcon,
  FlagIcon
} from '@/components/icons';
import { Badge } from './Badge';
import Button from './Button';

interface TeamComment {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  landId: string;
  comment: string;
  timestamp: Date;
  type: 'comment' | 'vote' | 'favorite' | 'analysis';
  likes: number;
  dislikes: number;
  replies: TeamComment[];
  isEdited: boolean;
  tags: string[];
}

interface TeamCommentsVotingProps {
  landId: string;
  landTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (comment: Omit<TeamComment, 'id' | 'timestamp' | 'likes' | 'dislikes' | 'replies' | 'isEdited'>) => void;
  onVote: (commentId: string, vote: 'like' | 'dislike') => void;
  onReply: (commentId: string, reply: string) => void;
  onAddToFavorites: (landId: string) => void;
}

export default function TeamCommentsVoting({
  landId,
  landTitle,
  isOpen,
  onClose,
  onAddComment,
  onVote,
  onReply,
  onAddToFavorites
}: TeamCommentsVotingProps) {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'vote' | 'favorite' | 'analysis'>('comment');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock data per commenti esistenti
  const [comments] = useState<TeamComment[]>([
    {
      id: '1',
      memberId: '1',
      memberName: 'Marco Rossi',
      memberAvatar: '👨‍💼',
      landId: landId,
      comment: 'Ottima posizione! Prezzo interessante per la zona. ROI stimato del 18%',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'analysis',
      likes: 3,
      dislikes: 0,
      replies: [],
      isEdited: false,
      tags: ['ROI', 'Posizione', 'Prezzo']
    },
    {
      id: '2',
      memberId: '2',
      memberName: 'Laura Bianchi',
      memberAvatar: '👩‍💼',
      landId: landId,
      comment: 'Concordo con Marco. La zona è in forte sviluppo',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      type: 'comment',
      likes: 2,
      dislikes: 0,
      replies: [
        {
          id: '2-1',
          memberId: '3',
          memberName: 'Giuseppe Verdi',
          memberAvatar: '👨‍💼',
          landId: landId,
          comment: 'Verificare i piani urbanistici della zona',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'comment',
          likes: 1,
          dislikes: 0,
          replies: [],
          isEdited: false,
          tags: ['Urbanistica']
        }
      ],
      isEdited: false,
      tags: ['Sviluppo']
    },
    {
      id: '3',
      memberId: '3',
      memberName: 'Giuseppe Verdi',
      memberAvatar: '👨‍💼',
      landId: landId,
      comment: 'Voto positivo per questo terreno',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'vote',
      likes: 4,
      dislikes: 1,
      replies: [],
      isEdited: false,
      tags: ['Voto']
    }
  ]);

  const availableTags = [
    'ROI', 'Posizione', 'Prezzo', 'Sviluppo', 'Urbanistica', 'Accessibilità', 
    'Servizi', 'Trasporti', 'Scuole', 'Ospedali', 'Centri Commerciali',
    'Parcheggi', 'Giardini', 'Sicurezza', 'Rumore', 'Inquinamento'
  ];

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({
        memberId: 'current-user',
        memberName: 'Current User',
        memberAvatar: '👤',
        landId,
        comment: newComment,
        type: commentType,
        tags: selectedTags
      });
      setNewComment('');
      setSelectedTags([]);
      setCommentType('comment');
    }
  };

  const handleReply = (commentId: string) => {
    if (replyText.trim()) {
      onReply(commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'vote': return '👍';
      case 'favorite': return '⭐';
      case 'analysis': return '📊';
      default: return '💬';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'comment': return 'blue';
      case 'vote': return 'green';
      case 'favorite': return 'yellow';
      case 'analysis': return 'purple';
      default: return 'blue';
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
                <MessageCircleIcon className="h-6 w-6" />
                Team Comments & Voting
              </h2>
              <p className="text-blue-100 mt-1">
                {landTitle} - Collabora con il team per valutare questa opportunità
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <span className="sr-only">Chiudi</span>
              <div className="w-8 h-8 flex items-center justify-center text-2xl">×</div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Comment Section */}
          <div className="bg-gray-50 p-6 rounded-lg border mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aggiungi Commento o Analisi</h3>
            
            <div className="space-y-4">
              {/* Comment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo di Contributo</label>
                <div className="flex gap-2">
                  {[
                    { id: 'comment', label: 'Commento', icon: '💬' },
                    { id: 'analysis', label: 'Analisi', icon: '📊' },
                    { id: 'vote', label: 'Voto', icon: '👍' },
                    { id: 'favorite', label: 'Preferito', icon: '⭐' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCommentType(type.id as any)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        commentType === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {commentType === 'comment' ? 'Commento' : 
                   commentType === 'analysis' ? 'Analisi' : 
                   commentType === 'vote' ? 'Voto' : 'Preferito'}
                </label>
                <textarea
                  placeholder={
                    commentType === 'comment' ? 'Scrivi un commento...' :
                    commentType === 'analysis' ? 'Fornisci un\'analisi dettagliata...' :
                    commentType === 'vote' ? 'Spiega il motivo del tuo voto...' :
                    'Spiega perché questo terreno ti piace...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>

              {/* Tags Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Rilevanti</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex-1"
                >
                  <MessageCircleIcon className="h-4 w-4 mr-2" />
                  Aggiungi {commentType === 'comment' ? 'Commento' : 
                           commentType === 'analysis' ? 'Analisi' : 
                           commentType === 'vote' ? 'Voto' : 'Preferito'}
                </Button>
                
                {commentType === 'favorite' && (
                  <Button
                    variant="outline"
                    onClick={() => onAddToFavorites(landId)}
                    className="flex-1"
                  >
                    <StarIcon className="h-4 w-4 mr-2" />
                    Aggiungi ai Preferiti
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Commenti e Analisi del Team</h3>
            
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{comment.memberAvatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{comment.memberName}</span>
                        <Badge variant={getTypeColor(comment.type) as any}>
                          {getTypeIcon(comment.type)} {comment.type}
                        </Badge>
                        {comment.isEdited && (
                          <Badge variant="outline" className="text-xs">Modificato</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        {comment.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVote(comment.id, 'like')}
                      className="flex items-center gap-1"
                    >
                      <ThumbsUpIcon className="h-4 w-4" />
                      {comment.likes}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVote(comment.id, 'dislike')}
                      className="flex items-center gap-1"
                    >
                      <ThumbsDownIcon className="h-4 w-4" />
                      {comment.dislikes}
                    </Button>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-4">
                  <p className="text-gray-700 mb-3">{comment.comment}</p>
                  
                  {/* Tags */}
                  {comment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {comment.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <ReplyIcon className="h-4 w-4 mr-1" />
                    Rispondi
                  </Button>
                  <Button variant="outline" size="sm">
                    <FlagIcon className="h-4 w-4 mr-1" />
                    Segnala
                  </Button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ReplyIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Rispondi a {comment.memberName}</span>
                    </div>
                    <textarea
                      placeholder="Scrivi una risposta..."
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                      >
                        Invia Risposta
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-8 mt-4 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-300">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-lg">{reply.memberAvatar}</div>
                          <span className="font-medium text-gray-900">{reply.memberName}</span>
                          <span className="text-sm text-gray-500">
                            {reply.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{reply.comment}</p>
                        {reply.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {reply.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
