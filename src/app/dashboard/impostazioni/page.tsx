'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  User,
  Bell,
  Shield,
  Key,
  Globe,
  Database,
  BarChart3,
  TrendingUp,
  FileText,
  CreditCard,
  Calendar,
  Target,
  Building,
  Bot,
  Sparkles,
} from 'lucide-react';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

// ============================================================================
// TYPES
// ============================================================================

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  lastLogin: string;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
    emailUpdates: boolean;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActivity: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImpostazioniPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'security' | 'notifications' | 'billing'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock user profile data
      const mockProfile: UserProfile = {
        id: '1',
        name: 'Pierpaolo Laurito',
        email: 'pierpaolo.laurito@gmail.com',
        role: 'admin',
        lastLogin: new Date().toISOString(),
        preferences: {
          language: 'it',
          theme: 'light',
          notifications: true,
          emailUpdates: true,
        },
      };

      // Mock team members data
      const mockTeam: TeamMember[] = [
        {
          id: '1',
          name: 'Pierpaolo Laurito',
          email: 'pierpaolo.laurito@gmail.com',
          role: 'Admin',
          status: 'active',
          joinedAt: '2024-01-01',
          lastActivity: '2024-01-20',
        },
        {
          id: '2',
          name: 'Mario Rossi',
          email: 'mario.rossi@example.com',
          role: 'Developer',
          status: 'active',
          joinedAt: '2024-01-15',
          lastActivity: '2024-01-19',
        },
        {
          id: '3',
          name: 'Giulia Bianchi',
          email: 'giulia.bianchi@example.com',
          role: 'Designer',
          status: 'pending',
          joinedAt: '2024-01-18',
          lastActivity: '2024-01-18',
        },
      ];

      setUserProfile(mockProfile);
      setTeamMembers(mockTeam);
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-gray-600 bg-gray-100',
      pending: 'text-yellow-600 bg-yellow-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Attivo',
      inactive: 'Inattivo',
      pending: 'In Attesa',
    };
    return labels[status as keyof typeof labels] || status;
  };

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
                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Impostazioni</h1>
                  <p className="text-sm text-gray-600">Gestisci il tuo account e le preferenze</p>
                </div>
              </div>
            </div>
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
              <Link href="/dashboard/project-timeline" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
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
              <Link href="/dashboard/impostazioni" className="flex items-center space-x-3 px-3 py-2 text-gray-600 bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
                <span>Impostazioni</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profilo
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'team'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'security'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sicurezza
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Notifiche
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'billing'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Fatturazione
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Profilo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                      value={userProfile?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                      value={userProfile?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ruolo</label>
                    <select
                      value={userProfile?.role || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">Utente</option>
                      <option value="viewer">Visualizzatore</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ultimo Accesso</label>
                  <input
                    type="text"
                      value={userProfile ? new Date(userProfile.lastLogin).toLocaleString('it-IT') : ''}
                    disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              <div className="mt-6">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Salva Modifiche
                </button>
              </div>
            </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferenze</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Lingua</h3>
                      <p className="text-sm text-gray-600">Seleziona la lingua dell'interfaccia</p>
                    </div>
                    <select
                      value={userProfile?.preferences.language || 'it'}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="it">Italiano</option>
                      <option value="en">English</option>
                    </select>
          </div>
                  <div className="flex items-center justify-between">
                <div>
                      <h3 className="font-medium text-gray-900">Tema</h3>
                      <p className="text-sm text-gray-600">Scegli il tema dell'interfaccia</p>
                    </div>
                    <select
                      value={userProfile?.preferences.theme || 'light'}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Chiaro</option>
                      <option value="dark">Scuro</option>
                    </select>
                  </div>
                </div>
              </div>
                  </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Membri del Team</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Invita Membro
                  </button>
                </div>

                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{member.role}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                            {getStatusLabel(member.status)}
                          </span>
                        </div>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
          <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sicurezza Account</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600">Ultima modifica: 15 giorni fa</p>
                </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Cambia Password
                </button>
              </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Autenticazione a Due Fattori</h3>
                      <p className="text-sm text-gray-600">Aggiungi un livello extra di sicurezza</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Attiva 2FA
                    </button>
                </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Sessioni Attive</h3>
                      <p className="text-sm text-gray-600">Gestisci i dispositivi connessi</p>
                  </div>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Visualizza Sessioni
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
          <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferenze Notifiche</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                <div>
                      <h3 className="font-medium text-gray-900">Notifiche Push</h3>
                      <p className="text-sm text-gray-600">Ricevi notifiche nel browser</p>
                </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={userProfile?.preferences.notifications} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                  <div className="flex items-center justify-between">
                <div>
                      <h3 className="font-medium text-gray-900">Email Updates</h3>
                      <p className="text-sm text-gray-600">Ricevi aggiornamenti via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={userProfile?.preferences.emailUpdates} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
          <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fatturazione</h2>
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                      <h3 className="font-medium text-gray-900">Piano Attuale</h3>
                      <p className="text-sm text-gray-600">Professional - €99/mese</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Gestisci Piano
                    </button>
                </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                      <h3 className="font-medium text-gray-900">Metodo di Pagamento</h3>
                      <p className="text-sm text-gray-600">**** **** **** 1234</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Modifica
                    </button>
                </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                      <h3 className="font-medium text-gray-900">Fatture</h3>
                      <p className="text-sm text-gray-600">Scarica le tue fatture</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Scarica Fatture
                    </button>
                  </div>
                </div>
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
