'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CrownIcon, 
  CalculatorIcon, 
  BuildingIcon, 
  CodeIcon, 
  UserIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ShieldIcon,
  EyeIcon,
  SettingsIcon,
  ChartBarIcon,
  MailIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@/components/icons';
import { Badge } from './Badge';
import Button from './Button';
import { TeamRole, TeamMember, Permission, teamRoleManager, ROLE_PERMISSIONS } from '@/lib/teamRoleManager';

interface AdvancedTeamManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteMember: (email: string, role: TeamRole) => void;
  onUpdateMemberRole: (memberId: string, newRole: TeamRole) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdatePermissions: (memberId: string, permissions: Permission[]) => void;
}

export default function AdvancedTeamManagement({
  isOpen,
  onClose,
  onInviteMember,
  onUpdateMemberRole,
  onRemoveMember,
  onUpdatePermissions
}: AdvancedTeamManagementProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'invitations' | 'analytics' | 'settings'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('TEAM_MEMBER');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Mock data per membri team
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      userId: 'user-1',
      name: 'Marco Rossi',
      email: 'marco.rossi@urbanova.com',
      avatar: '👨‍💼',
      role: 'PROJECT_MANAGER',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'PROJECT_MANAGER')?.permissions || [],
      isOnline: true,
      lastSeen: new Date(),
      currentActivity: 'Gestione progetto Roma Centro',
      joinDate: new Date('2024-01-01'),
      isActive: true,
      performance: {
        commentsCount: 45,
        votesCount: 23,
        favoritesCount: 12,
        sessionsCreated: 8,
        sessionsJoined: 15,
        lastActivity: new Date()
      }
    },
    {
      id: '2',
      userId: 'user-2',
      name: 'Laura Bianchi',
      email: 'laura.bianchi@urbanova.com',
      avatar: '👩‍💼',
      role: 'FINANCIAL_ANALYST',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'FINANCIAL_ANALYST')?.permissions || [],
      isOnline: true,
      lastSeen: new Date(),
      currentActivity: 'Analisi ROI progetto Milano',
      joinDate: new Date('2024-01-15'),
      isActive: true,
      performance: {
        commentsCount: 38,
        votesCount: 19,
        favoritesCount: 8,
        sessionsCreated: 5,
        sessionsJoined: 12,
        lastActivity: new Date()
      }
    },
    {
      id: '3',
      userId: 'user-3',
      name: 'Giuseppe Verdi',
      email: 'giuseppe.verdi@urbanova.com',
      avatar: '👨‍💼',
      role: 'ARCHITECT',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'ARCHITECT')?.permissions || [],
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      currentActivity: 'Review progetto architettonico',
      joinDate: new Date('2024-02-01'),
      isActive: true,
      performance: {
        commentsCount: 29,
        votesCount: 15,
        favoritesCount: 6,
        sessionsCreated: 3,
        sessionsJoined: 8,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    },
    {
      id: '4',
      userId: 'user-4',
      name: 'Anna Neri',
      email: 'anna.neri@urbanova.com',
      avatar: '👩‍💼',
      role: 'DEVELOPER',
      permissions: ROLE_PERMISSIONS.find(r => r.role === 'DEVELOPER')?.permissions || [],
      isOnline: true,
      lastSeen: new Date(),
      currentActivity: 'Ottimizzazione performance sistema',
      joinDate: new Date('2024-02-15'),
      isActive: true,
      performance: {
        commentsCount: 12,
        votesCount: 8,
        favoritesCount: 3,
        sessionsCreated: 1,
        sessionsJoined: 6,
        lastActivity: new Date()
      }
    }
  ]);

  const [invitations] = useState([
    {
      id: 'inv-1',
      email: 'mario.rossi@urbanova.com',
      invitedBy: 'Marco Rossi',
      invitedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      role: 'TEAM_MEMBER',
      status: 'pending',
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    }
  ]);

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'PROJECT_MANAGER': return '👑';
      case 'FINANCIAL_ANALYST': return '💰';
      case 'ARCHITECT': return '🏗️';
      case 'DEVELOPER': return '💻';
      case 'TEAM_MEMBER': return '👤';
      default: return '👤';
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'PROJECT_MANAGER': return 'error';
      case 'FINANCIAL_ANALYST': return 'success';
      case 'ARCHITECT': return 'warning';
      case 'DEVELOPER': return 'info';
      case 'TEAM_MEMBER': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDescription = (role: TeamRole) => {
    const roleConfig = ROLE_PERMISSIONS.find(r => r.role === role);
    return roleConfig ? roleConfig.description : 'Ruolo non definito';
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim() && inviteRole) {
      onInviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('TEAM_MEMBER');
      setShowInviteForm(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleUpdateRole = (memberId: string, newRole: TeamRole) => {
    onUpdateMemberRole(memberId, newRole);
    setEditingMember(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShieldIcon className="h-6 w-6" />
                Gestione Team Avanzata
              </h2>
              <p className="text-blue-100 mt-1">
                Gestisci ruoli, permessi e performance del team con sistema granulare
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-4">
            {[
              { id: 'members', name: 'Membri Team', icon: '👥', count: teamMembers.length },
              { id: 'roles', name: 'Ruoli & Permessi', icon: '🛡️', count: ROLE_PERMISSIONS.length },
              { id: 'invitations', name: 'Inviti', icon: '📧', count: invitations.length },
              { id: 'analytics', name: 'Analytics', icon: '📊' },
              { id: 'settings', name: 'Impostazioni', icon: '⚙️' }
            ].map((tab) => (
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
                    <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Membri del Team</h3>
                <Button
                  variant="primary"
                  onClick={() => setShowInviteForm(true)}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Invita Membro
                </Button>
              </div>

              {/* Invite Form */}
              {showInviteForm && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3">Invita Nuovo Membro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="email"
                      placeholder="Email del nuovo membro"
                      className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                      className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ROLE_PERMISSIONS.map((role) => (
                        <option key={role.role} value={role.role}>
                          {getRoleIcon(role.role)} {role.role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={handleInviteMember}
                        disabled={!inviteEmail.trim()}
                        size="sm"
                      >
                        <MailIcon className="h-4 w-4 mr-1" />
                        Invia Invito
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteForm(false)}
                        size="sm"
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members Grid */}
              <div className="grid gap-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{member.avatar}</div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                            <Badge variant={getRoleColor(member.role)}>
                              {getRoleIcon(member.role)} {member.role.replace('_', ' ')}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          </div>
                          <p className="text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Membro dal {member.joinDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMember(member)}
                        >
                          <EditIcon className="h-4 w-4 mr-1" />
                          Modifica
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Rimuovi
                        </Button>
                      </div>
                    </div>

                    {/* Current Activity */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 mb-1">Attività Corrente:</p>
                      <p className="text-gray-900">{member.currentActivity}</p>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{member.performance.commentsCount}</p>
                        <p className="text-xs text-gray-500">Commenti</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{member.performance.votesCount}</p>
                        <p className="text-xs text-gray-500">Voti</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{member.performance.favoritesCount}</p>
                        <p className="text-xs text-gray-500">Preferiti</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{member.performance.sessionsCreated}</p>
                        <p className="text-xs text-gray-500">Sessioni Create</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{member.performance.sessionsJoined}</p>
                        <p className="text-xs text-gray-500">Sessioni Partecipate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-pink-600">
                          {Math.round((member.performance.commentsCount + member.performance.votesCount) / 2)}
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>

                    {/* Permissions Summary */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Permessi ({member.permissions.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {member.permissions.slice(0, 5).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {member.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.permissions.length - 5} altri
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Ruoli e Permessi del Team</h3>
              
              <div className="grid gap-6">
                {ROLE_PERMISSIONS.map((roleConfig) => (
                  <div key={roleConfig.role} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getRoleIcon(roleConfig.role)}</div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {roleConfig.role.replace('_', ' ')}
                          </h4>
                          <p className="text-gray-600">{roleConfig.description}</p>
                        </div>
                      </div>
                      <Badge variant={getRoleColor(roleConfig.role)}>
                        {roleConfig.permissions.length} permessi
                      </Badge>
                    </div>

                    {/* Capabilities */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Capacità:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {roleConfig.capabilities.map((capability, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            {capability}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Permessi ({roleConfig.permissions.length}):</h5>
                      <div className="flex flex-wrap gap-2">
                        {roleConfig.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Inviti in Sospeso</h3>
              
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <MailIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Nessun invito in sospeso</h4>
                  <p className="text-gray-500">Tutti gli inviti sono stati gestiti</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{invitation.email}</p>
                          <p className="text-sm text-gray-600">
                            Invitato da {invitation.invitedBy} • Ruolo: {invitation.role.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Invitato il {invitation.invitedAt.toLocaleDateString()} • 
                            Scade il {invitation.expiresAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="warning">In Attesa</Badge>
                          <Button variant="outline" size="sm">
                            <MailIcon className="h-4 w-4 mr-1" />
                            Rinvio
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Annulla
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analytics del Team</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <UsersIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Membri Totali</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Membri Attivi</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {teamMembers.filter(m => m.isOnline).length}
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Commenti Totali</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {teamMembers.reduce((sum, m) => sum + m.performance.commentsCount, 0)}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Ultima Attività</span>
                  </div>
                  <p className="text-sm font-bold text-purple-600">
                    {Math.min(...teamMembers.map(m => m.performance.lastActivity.getTime()))}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Performance per Ruolo</h4>
                <div className="space-y-4">
                  {ROLE_PERMISSIONS.map((roleConfig) => {
                    const roleMembers = teamMembers.filter(m => m.role === roleConfig.role);
                    if (roleMembers.length === 0) return null;
                    
                    const avgComments = Math.round(
                      roleMembers.reduce((sum, m) => sum + m.performance.commentsCount, 0) / roleMembers.length
                    );
                    
                    return (
                      <div key={roleConfig.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getRoleIcon(roleConfig.role)}</span>
                          <span className="font-medium">{roleConfig.role.replace('_', ' ')}</span>
                          <Badge variant="outline">{roleMembers.length} membri</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{avgComments}</p>
                          <p className="text-xs text-gray-500">Commenti medi</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Impostazioni Team</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Configurazione Workflow</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Richiedi approvazione per preferiti</p>
                      <p className="text-sm text-gray-600">I preferiti richiedono approvazione del Project Manager</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Richiedi approvazione per sessioni</p>
                      <p className="text-sm text-gray-600">Le sessioni collaborative richiedono approvazione</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Archivia sessioni automaticamente</p>
                      <p className="text-sm text-gray-600">Archivia sessioni completate dopo 30 giorni</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Notifiche</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifiche email</p>
                      <p className="text-sm text-gray-600">Ricevi notifiche via email per attività importanti</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifiche push</p>
                      <p className="text-sm text-gray-600">Ricevi notifiche push per aggiornamenti in tempo reale</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifiche menzioni</p>
                      <p className="text-sm text-gray-600">Ricevi notifiche quando vieni menzionato</p>
                    </div>
                    <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
