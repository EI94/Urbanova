'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Users, 
  Eye, 
  EyeOff, 
  Send, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Tag,
  AtSign,
  Paperclip,
  Clock,
  User,
  AlertCircle,
  Star,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import collaborationService, { 
  DesignComment, 
  DesignVersion, 
  ApprovalWorkflow,
  CollaborationSession 
} from '@/lib/collaborationService';

interface RealTimeCollaborationProps {
  designId: string;
  onCommentAdd?: (comment: DesignComment) => void;
  onVersionChange?: (version: DesignVersion) => void;
  onWorkflowUpdate?: (workflow: ApprovalWorkflow) => void;
}

interface CommentFormData {
  content: string;
  type: DesignComment['type'];
  priority: DesignComment['priority'];
  tags: string[];
  mentions: string[];
}

export default function RealTimeCollaboration({ 
  designId, 
  onCommentAdd, 
  onVersionChange, 
  onWorkflowUpdate 
}: RealTimeCollaborationProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'comments' | 'versions' | 'workflow' | 'sessions'>('comments');
  const [comments, setComments] = useState<DesignComment[]>([]);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [commentForm, setCommentForm] = useState<CommentFormData>({
    content: '',
    type: 'comment',
    priority: 'medium',
    tags: [],
    mentions: []
  });
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [filterType, setFilterType] = useState<DesignComment['type'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<DesignComment['priority'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalComments: 0,
    pendingComments: 0,
    totalVersions: 0,
    activeWorkflows: 0,
    activeSessions: 0
  });

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const unsubscribeRefs = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!designId || !user) return;

    // Subscribe to real-time updates
    const unsubscribeComments = collaborationService.getCommentsRealtime(designId, setComments);
    const unsubscribeVersions = collaborationService.getVersionsRealtime(designId, setVersions);
    const unsubscribeWorkflows = collaborationService.getWorkflowRealtime(designId, (workflow) => {
      if (workflow) {
        setWorkflows(prev => {
          const existing = prev.find(w => w.id === workflow.id);
          if (existing) {
            return prev.map(w => w.id === workflow.id ? workflow : w);
          } else {
            return [...prev, workflow];
          }
        });
      }
    });
    const unsubscribeSessions = collaborationService.getSessionsRealtime(designId, setSessions);

    unsubscribeRefs.current = [unsubscribeComments, unsubscribeVersions, unsubscribeWorkflows, unsubscribeSessions];

    // Load initial stats
    loadCollaborationStats();

    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    };
  }, [designId, user]);

  const loadCollaborationStats = async () => {
    try {
      const statsData = await collaborationService.getDesignCollaborationStats(designId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading collaboration stats:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentForm.content.trim()) return;

    setIsLoading(true);
    try {
      const commentData = {
        designId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Unknown User',
        userAvatar: user.photoURL,
        content: commentForm.content.trim(),
        type: commentForm.type,
        priority: commentForm.priority,
        tags: commentForm.tags,
        mentions: commentForm.mentions,
        status: 'pending' as const
      };

      const commentId = await collaborationService.addComment(commentData);
      
      // Reset form
      setCommentForm({
        content: '',
        type: 'comment',
        priority: 'medium',
        tags: [],
        mentions: []
      });
      
      setShowCommentForm(false);
      toast('Commento aggiunto con successo', { icon: '✅' });
      
      if (onCommentAdd) {
        const newComment = { ...commentData, id: commentId } as DesignComment;
        onCommentAdd(newComment);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast('Errore nell\'aggiunta del commento', { icon: '❌' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentEdit = async (commentId: string, content: string) => {
    if (!user) return;

    try {
      await collaborationService.updateComment(commentId, { content });
      setEditingComment(null);
      toast('Commento aggiornato', { icon: '✅' });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast('Errore nell\'aggiornamento del commento', { icon: '❌' });
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!user) return;

    try {
      await collaborationService.deleteComment(commentId);
      toast('Commento eliminato', { icon: '✅' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast('Errore nell\'eliminazione del commento', { icon: '❌' });
    }
  };

  const handleCommentResolve = async (commentId: string) => {
    if (!user) return;

    try {
      await collaborationService.resolveComment(commentId, user.uid);
      toast('Commento risolto', { icon: '✅' });
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast('Errore nella risoluzione del commento', { icon: '❌' });
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!commentForm.tags.includes(newTag)) {
        setCommentForm(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCommentForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredComments = comments.filter(comment => {
    if (filterType !== 'all' && comment.type !== filterType) return false;
    if (filterPriority !== 'all' && comment.priority !== filterPriority) return false;
    if (searchTerm && !comment.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority: DesignComment['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: DesignComment['type']) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      case 'approval': return <CheckCircle className="w-4 h-4" />;
      case 'rejection': return <XCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: DesignComment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Accedi per partecipare alla collaborazione</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Collaborazione in Tempo Reale</h3>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{stats.activeSessions} sessioni attive</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalComments}</div>
            <div className="text-xs text-blue-600">Commenti</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingComments}</div>
            <div className="text-xs text-yellow-600">In Attesa</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalVersions}</div>
            <div className="text-xs text-green-600">Versioni</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.activeWorkflows}</div>
            <div className="text-xs text-purple-600">Workflow</div>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{stats.activeSessions}</div>
            <div className="text-xs text-indigo-600">Sessioni</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'comments', label: 'Commenti', count: comments.length },
            { id: 'versions', label: 'Versioni', count: versions.length },
            { id: 'workflow', label: 'Workflow', count: workflows.length },
            { id: 'sessions', label: 'Sessioni', count: sessions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'comments' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tutti i tipi</option>
                  <option value="comment">Commenti</option>
                  <option value="review">Revisioni</option>
                  <option value="approval">Approvazioni</option>
                  <option value="rejection">Rifiuti</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tutte le priorità</option>
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Critica</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Cerca commenti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
                />
              </div>
            </div>

            {/* Add Comment Button */}
            {!showCommentForm && (
              <button
                onClick={() => setShowCommentForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Aggiungi Commento
              </button>
            )}

            {/* Comment Form */}
            {showCommentForm && (
              <form onSubmit={handleCommentSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <textarea
                    ref={commentInputRef}
                    value={commentForm.content}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Scrivi il tuo commento..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <select
                      value={commentForm.type}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="comment">Commento</option>
                      <option value="review">Revisione</option>
                      <option value="approval">Approvazione</option>
                      <option value="rejection">Rifiuto</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={commentForm.priority}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="low">Bassa Priorità</option>
                      <option value="medium">Media Priorità</option>
                      <option value="high">Alta Priorità</option>
                      <option value="critical">Priorità Critica</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tag
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {commentForm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Premi Enter per aggiungere un tag..."
                    onKeyDown={handleTagInput}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCommentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !commentForm.content.trim()}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Invio...' : 'Invia Commento'}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {filteredComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nessun commento trovato</p>
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`border rounded-lg p-4 ${
                      comment.status === 'resolved' ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          {comment.userAvatar ? (
                            <img
                              src={comment.userAvatar}
                              alt={comment.userName}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{comment.userName}</div>
                          <div className="text-sm text-gray-500">
                            {comment.createdAt?.toDate().toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(comment.priority)}`}>
                          {comment.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                          {comment.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(comment.type)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      {editingComment === comment.id ? (
                        <div className="space-y-3">
                          <textarea
                            defaultValue={comment.content}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingComment(null)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Annulla
                            </button>
                            <button
                              onClick={() => {
                                const textarea = document.querySelector(`textarea[data-comment-id="${comment.id}"]`) as HTMLTextAreaElement;
                                if (textarea) {
                                  handleCommentEdit(comment.id, textarea.value);
                                }
                              }}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Salva
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700">{comment.content}</p>
                      )}
                    </div>

                    {/* Tags and Mentions */}
                    {(comment.tags.length > 0 || comment.mentions.length > 0) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {comment.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {comment.mentions.map((mention) => (
                          <span
                            key={mention}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            <AtSign className="w-3 h-3 mr-1" />
                            {mention}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {comment.status === 'pending' && (
                          <button
                            onClick={() => handleCommentResolve(comment.id)}
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Risolvi
                          </button>
                        )}
                      </div>

                      {comment.userId === user.uid && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingComment(comment.id)}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Modifica
                          </button>
                          <button
                            onClick={() => handleCommentDelete(comment.id)}
                            className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Elimina
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestione Versioni</h3>
            <p className="text-gray-600">Funzionalità in sviluppo per la gestione avanzata delle versioni</p>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow di Approvazione</h3>
            <p className="text-gray-600">Funzionalità in sviluppo per i flussi di lavoro</p>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sessioni di Collaborazione</h3>
            <p className="text-gray-600">Funzionalità in sviluppo per le sessioni collaborative</p>
          </div>
        )}
      </div>
    </div>
  );
}
