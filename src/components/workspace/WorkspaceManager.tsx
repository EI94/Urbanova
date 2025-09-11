'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Users, 
  Settings, 
  Mail, 
  Crown,
  Shield,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { Workspace, WorkspaceMember } from '@/types/workspace';

interface WorkspaceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  onWorkspaceCreated: (workspace: Workspace) => void;
  onMemberInvited: () => void;
}

export default function WorkspaceManager({
  isOpen,
  onClose,
  workspaces,
  onWorkspaceCreated,
  onMemberInvited
}: WorkspaceManagerProps) {
  const [activeTab, setActiveTab] = useState<'workspaces' | 'create' | 'invite'>('workspaces');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form per creare workspace
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    companyName: '',
    companyDomain: ''
  });

  // Form per invitare membri
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer',
    message: ''
  });

  // Carica membri quando cambia workspace
  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceMembers(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  const loadWorkspaceMembers = async (workspaceId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspace/${workspaceId}/members?userId=${localStorage.getItem('userId')}`);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Errore nel caricamento dei membri');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name || !createForm.companyName) {
      setError('Nome workspace e azienda sono obbligatori');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/workspace/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          ownerId: localStorage.getItem('userId'),
          ownerEmail: localStorage.getItem('userEmail')
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Workspace creato con successo!');
        setCreateForm({ name: '', description: '', companyName: '', companyDomain: '' });
        onWorkspaceCreated(data.workspace);
        setTimeout(() => {
          setActiveTab('workspaces');
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Errore nella creazione del workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorkspace || !inviteForm.email) {
      setError('Seleziona un workspace e inserisci un email');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/workspace/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.id,
          ...inviteForm,
          invitedBy: localStorage.getItem('userId')
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Invito inviato con successo!');
        setInviteForm({ email: '', role: 'member', message: '' });
        onMemberInvited();
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Errore nell\'invio dell\'invito');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'member': return <Users className="w-4 h-4 text-green-600" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'suspended': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestione Workspace</h2>
              <p className="text-sm text-gray-500">Collabora con i tuoi colleghi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('workspaces')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'workspaces'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I Miei Workspace
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Crea Workspace
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'invite'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Invita Membri
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Workspaces Tab */}
          {activeTab === 'workspaces' && (
            <div className="space-y-4">
              {workspaces.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Nessun workspace trovato</p>
                  <p className="text-sm text-gray-400">Crea il tuo primo workspace per iniziare a collaborare</p>
                </div>
              ) : (
                workspaces.map(workspace => (
                  <div
                    key={workspace.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedWorkspace?.id === workspace.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedWorkspace(workspace)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{workspace.name}</h3>
                        <p className="text-sm text-gray-500">{workspace.companyName}</p>
                        <p className="text-xs text-gray-400">
                          {workspace.subscription.usedSeats}/{workspace.subscription.seats} posti utilizzati
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          workspace.subscription.plan === 'free' 
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {workspace.subscription.plan.toUpperCase()}
                        </span>
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{workspace.subscription.usedSeats}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Create Workspace Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Workspace *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Progetti Milano"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Azienda *
                </label>
                <input
                  type="text"
                  value={createForm.companyName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. Urbanova S.r.l."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dominio Azienda
                </label>
                <input
                  type="text"
                  value={createForm.companyDomain}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, companyDomain: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. urbanova.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrizione del workspace..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Creando...' : 'Crea Workspace'}</span>
              </button>
            </form>
          )}

          {/* Invite Members Tab */}
          {activeTab === 'invite' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona Workspace
                </label>
                <select
                  value={selectedWorkspace?.id || ''}
                  onChange={(e) => {
                    const workspace = workspaces.find(w => w.id === e.target.value);
                    setSelectedWorkspace(workspace || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Scegli un workspace...</option>
                  {workspaces.map(workspace => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name} - {workspace.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWorkspace && (
                <>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Collega *
                      </label>
                      <input
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="collega@azienda.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ruolo
                      </label>
                      <select
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="member">Membro</option>
                        <option value="admin">Amministratore</option>
                        <option value="viewer">Visualizzatore</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Messaggio (opzionale)
                      </label>
                      <textarea
                        value={inviteForm.message}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Messaggio di benvenuto..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <Mail className="w-4 h-4" />
                      <span>{loading ? 'Invio...' : 'Invia Invito'}</span>
                    </button>
                  </form>

                  {/* Members List */}
                  {members.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Membri del Workspace</h3>
                      <div className="space-y-2">
                        {members.map(member => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getRoleIcon(member.role)}
                              <div>
                                <p className="font-medium text-gray-900">{member.email}</p>
                                <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(member.status)}
                              <span className="text-sm text-gray-500 capitalize">{member.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">{success}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
