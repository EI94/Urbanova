'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import {
  SettingsIcon,
  UsersIcon,
  ShieldIcon,
  BellIcon,
  UserIcon,
  LanguageIcon,
  SecurityIcon,
  SaveIcon as DatabaseIcon,
  CloudIcon,
  CodeIcon,
  LockIcon,
  ChartIcon,
  CogIcon,
  KeyIcon,
  GlobeIcon,
} from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Componenti UI
import UserProfilePanel from '@/components/ui/UserProfilePanel';

// Componenti Gestione Team
import AdvancedTeamManagement from '@/components/ui/AdvancedTeamManagement';
import WorkflowManagement from '@/components/ui/WorkflowManagement';
import RealtimeCollaboration from '@/components/ui/RealtimeCollaboration';
import SecurityCompliance from '@/components/ui/SecurityCompliance';
import MonitoringObservability from '@/components/ui/MonitoringObservability';
import AIMLCenter from '@/components/ui/AIMLCenter';
import Web3Center from '@/components/ui/Web3Center';
import APIGatewayCenter from '@/components/ui/APIGatewayCenter';
import DevOpsCenter from '@/components/ui/DevOpsCenter';
import LanguageSelector from '@/components/ui/LanguageSelector';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import SecurityCenter from '@/components/ui/SecurityCenter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import { NotificationStats } from '@/types/notifications';
import { UserProfile } from '@/types/userProfile';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
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
} from 'lucide-react';
import Link from 'next/link';

// Import icone

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component?: React.ReactNode;
  isActive: boolean;
}

export default function ImpostazioniPage() {
  const { t } = useLanguage();
  const { currentUser } = (useAuth() as any);
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Stati per i modali
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdvancedTeamManagement, setShowAdvancedTeamManagement] = useState(false);
  const [showWorkflowManagement, setShowWorkflowManagement] = useState(false);
  const [showRealtimeCollaboration, setShowRealtimeCollaboration] = useState(false);
  const [showSecurityCompliance, setShowSecurityCompliance] = useState(false);
  const [showMonitoringObservability, setShowMonitoringObservability] = useState(false);
  const [showAIMLCenter, setShowAIMLCenter] = useState(false);
  const [showWeb3Center, setShowWeb3Center] = useState(false);
  const [showAPIGatewayCenter, setShowAPIGatewayCenter] = useState(false);
  const [showDevOpsCenter, setShowDevOpsCenter] = useState(false);
  const [showSecurityCenter, setShowSecurityCenter] = useState(false);

  // Sezioni impostazioni
  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profilo Utente',
      description: 'Gestisci i tuoi dati personali e preferenze',
      icon: <UserIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'team',
      title: 'Gestione Team Avanzata',
      description: 'Gestisci ruoli, permessi e performance del team',
      icon: <UsersIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'security',
      title: 'Sicurezza & Compliance',
      description: 'Configura sicurezza, privacy e conformità',
      icon: <ShieldIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'notifications',
      title: 'Notifiche & Comunicazioni',
      description: 'Gestisci notifiche e preferenze comunicazioni',
      icon: <BellIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'language',
      title: 'Lingua & Localizzazione',
      description: 'Configura lingua e impostazioni regionali',
      icon: <LanguageIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'workflow',
      title: 'Workflow & Approvazioni',
      description: 'Gestisci processi e flussi di approvazione',
      icon: <CogIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'collaboration',
      title: 'Collaborazione Real-time',
      description: 'Strumenti di collaborazione avanzati',
      icon: <UsersIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Observability',
      description: 'Monitoraggio sistema e metriche performance',
      icon: <ChartIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'ai-ml',
      title: 'AI & Machine Learning',
      description: 'Configurazione modelli AI e ML',
      icon: <CodeIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'web3',
      title: 'Web3 & Blockchain',
      description: 'Integrazioni blockchain e Web3',
      icon: <GlobeIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'api-gateway',
      title: 'API Gateway & Microservices',
      description: 'Gestione API e architettura microservizi',
      icon: <KeyIcon className="h-5 w-5" />,
      isActive: true,
    },
    {
      id: 'devops',
      title: 'DevOps & CI/CD',
      description: 'Pipeline CI/CD e automazione deployment',
      icon: <CloudIcon className="h-5 w-5" />,
      isActive: true,
    },
  ];

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profile, stats] = await Promise.all([
        firebaseUserProfileService.getUserProfile(currentUser?.uid || ''),
        firebaseNotificationService.getNotificationStats(currentUser?.uid || ''),
      ]);

      setUserProfile(profile);
      setNotificationStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast('Errore nel caricamento dati utente', { icon: '❌' });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Personali</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={userProfile?.firstName || ''}
                    onChange={e =>
                      setUserProfile(prev => (prev ? { ...prev, firstName: e.target.value } : null))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inserisci il tuo nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                  <input
                    type="text"
                    value={userProfile?.lastName || ''}
                    onChange={e =>
                      setUserProfile(prev => (prev ? { ...prev, lastName: e.target.value } : null))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Inserisci il tuo cognome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userProfile?.email || currentUser?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ruolo</label>
                  <input
                    type="text"
                    value={userProfile?.role || 'Utente'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Salva Modifiche
                </button>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gestione Team Avanzata</h3>
                  <p className="text-sm text-gray-600">
                    Gestisci ruoli, permessi e performance del team
                  </p>
                </div>
                <button
                  onClick={() => setShowAdvancedTeamManagement(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Gestisci Team
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Membri Team</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">4</p>
                  <p className="text-sm text-blue-700">Attivi</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ShieldIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Ruoli</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">5</p>
                  <p className="text-sm text-green-700">Configurati</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ChartIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">Performance</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">92%</p>
                  <p className="text-sm text-purple-700">Media Team</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sicurezza & Compliance</h3>
                  <p className="text-sm text-gray-600">Configura sicurezza, privacy e conformità</p>
                </div>
                <button
                  onClick={() => setShowSecurityCompliance(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Configura Sicurezza
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <LockIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium">Autenticazione a Due Fattori</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Attiva
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ShieldIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium">Crittografia Dati</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    AES-256
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <SecurityIcon className="h-5 w-5 text-yellow-600 mr-3" />
                    <span className="font-medium">Audit Log</span>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Attivo
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notifiche & Comunicazioni</h3>
                  <p className="text-sm text-gray-600">
                    Gestisci notifiche e preferenze comunicazioni
                  </p>
                </div>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Configura Notifiche
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notifiche Push</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Progetti</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Permessi</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Marketing</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notifiche Email</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Report Settimanali</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Aggiornamenti Progetti</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Newsletter</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lingua & Localizzazione</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lingua Principale
                  </label>
                  <LanguageSelector variant="settings" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Orario
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Europe/Rome">Europe/Rome (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato Data
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sezione in Sviluppo</h3>
            <p className="text-gray-600">
              Questa sezione è in fase di sviluppo e sarà disponibile prossimamente.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Impostazioni">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento impostazioni...</p>
          </div>
        </div>
      </DashboardLayout>
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
                  <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Impostazioni</h1>
                  <p className="text-sm text-gray-500">Gestisci le impostazioni del tuo account e del team</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.open('/dashboard/feedback', '_blank')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Invia Feedback"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DASHBOARD
                </h3>
                <Link
                  href="/dashboard/unified"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Overview
                </Link>
              </div>

              {/* Discovery */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DISCOVERY
                </h3>
                <Link
                  href="/dashboard/market-intelligence"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Search className="w-4 h-4 mr-3" />
                  Market Intelligence
                </Link>
                <Link
                  href="/dashboard/feasibility-analysis"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  Design Center
                </Link>
              </div>

              {/* Planning & Compliance */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PLANNING/COMPLIANCE
                </h3>
                <Link
                  href="/dashboard/business-plan"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Business Plan
                </Link>
                <Link
                  href="/dashboard/permits-compliance"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </Link>
                <Link
                  href="/dashboard/project-timeline"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Project Timeline AI
                </Link>
              </div>

              {/* Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PROGETTI
                </h3>
                <Link
                  href="/dashboard/progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Progetti
                </Link>
                <Link
                  href="/dashboard/progetti/nuovo"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Nuovo Progetto
                </Link>
                <Link
                  href="/dashboard/mappa-progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Mappa Progetti
                </Link>
              </div>

              {/* Gestione Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GESTIONE PROGETTI
                </h3>
                <Link
                  href="/dashboard/project-management"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </Link>
                <Link
                  href="/dashboard/project-management/documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Documenti
                </Link>
                <Link
                  href="/dashboard/project-management/meetings"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Riunioni
                </Link>
              </div>

              {/* Marketing/Sales */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  MARKETING/SALES
                </h3>
                <Link
                  href="/dashboard/marketing"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Marketing
                </Link>
                <Link
                  href="/dashboard/marketing/campaigns"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Campagne
                </Link>
                <Link
                  href="/dashboard/marketing/materials"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Materiali
                </Link>
              </div>

              {/* Construction/EPC */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CONSTRUCTION/EPC
                </h3>
                <Link
                  href="/dashboard/epc"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  EPC
                </Link>
                <Link
                  href="/dashboard/epc/construction-site"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Construction Site
                </Link>
                <Link
                  href="/dashboard/epc/technical-documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Technical Documents
                </Link>
                <Link
                  href="/dashboard/epc/permits"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permits
                </Link>
              </div>

              {/* AI Assistant */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI ASSISTANT
                </h3>
                <Link
                  href="/dashboard/unified"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Bot className="w-4 h-4 mr-3" />
                  Urbanova OS
                </Link>
              </div>

              {/* Feedback */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SUPPORTO
                </h3>
                <Link
                  href="/dashboard/feedback"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Feedback
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex gap-6">
            {/* Sidebar Impostazioni */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni</h3>
            <nav className="space-y-1">
              {settingsSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    {section.icon}
                    <span className="ml-3">{section.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenuto Principale */}
        <div className="flex-1">{renderSectionContent()}</div>
      </div>

      {/* Modali */}
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      <UserProfilePanel isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />

      <AdvancedTeamManagement
        isOpen={showAdvancedTeamManagement}
        onClose={() => setShowAdvancedTeamManagement(false)}
        onInviteMember={(email, role) => {
          toast(`Membro invitato con ruolo ${role}`, { icon: '👥' });
        }}
        onUpdateMemberRole={(memberId, newRole) => {
          toast('Ruolo aggiornato', { icon: '🔄' });
        }}
        onRemoveMember={memberId => {
          toast('Membro rimosso dal team', { icon: '👋' });
        }}
        onUpdatePermissions={(memberId, permissions) => {
          toast('Permessi aggiornati', { icon: '🔐' });
        }}
      />

      <WorkflowManagement
        isOpen={showWorkflowManagement}
        onClose={() => setShowWorkflowManagement(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserRole="PROJECT_MANAGER"
      />

      <RealtimeCollaboration
        isOpen={showRealtimeCollaboration}
        onClose={() => setShowRealtimeCollaboration(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
        {...({} as any)}
      />

      <SecurityCompliance
        isOpen={showSecurityCompliance}
        onClose={() => setShowSecurityCompliance(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
      />

      <MonitoringObservability
        isOpen={showMonitoringObservability}
        onClose={() => setShowMonitoringObservability(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
      />

      <AIMLCenter
        isOpen={showAIMLCenter}
        onClose={() => setShowAIMLCenter(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
      />

      <Web3Center
        isOpen={showWeb3Center}
        onClose={() => setShowWeb3Center(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
      />

      <APIGatewayCenter
        isOpen={showAPIGatewayCenter}
        onClose={() => setShowAPIGatewayCenter(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
      />

      <DevOpsCenter
        isOpen={showDevOpsCenter}
        onClose={() => setShowDevOpsCenter(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
      />

      <SecurityCenter
        isOpen={showSecurityCenter}
        onClose={() => setShowSecurityCenter(false)}
        currentUserId={currentUser?.uid || ''}
        currentUserName={userProfile?.displayName || 'Utente'}
        currentUserRole="PROJECT_MANAGER"
        currentUserAvatar="👨‍💻"
      />
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
