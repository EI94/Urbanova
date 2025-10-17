'use client';

import { MessageSquare, Bell, User, Users, Settings, X, Building2, BarChart3, FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { NotificationPreferencesComponent } from '@/components/ui/NotificationPreferences';
// Rimossi tutti i sistemi di protezione globale dopo fix chirurgico

import {
  DashboardIcon,
  SearchIcon,
  CalculatorIcon,
  PaletteIcon,
  CalendarIcon,
  LogoutIcon,
  BuildingIcon,
  NewProjectIcon,
  BusinessPlanIcon,
  PermitIcon,
  MarketingIcon,
  DocumentIcon,
  ConstructionIcon,
  MeetingIcon,
  CampaignIcon,
  ClientIcon,
  ProjectIcon,
  MapIcon,
} from '@/components/icons';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import LanguageSelector from '@/components/ui/LanguageSelector';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import UserProfilePanelFixed from '@/components/ui/UserProfilePanelFixed';
import WorkspaceManager from '@/components/workspace/WorkspaceManager';
import SettingsPanel from '@/components/ui/SettingsPanel';
import { useAuth } from '@/contexts/AuthContext';
import '@/lib/osProtection'; // OS Protection per dashboard
import { useLanguage } from '@/contexts/LanguageContext';
import { notificationTriggerService } from '@/lib/notificationTriggerService';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import { NotificationStats } from '@/types/notifications';
import { UserProfile } from '@/types/userProfile';
import AuthGuard from '@/components/AuthGuard';
import { OsPersistentInterface } from '@/app/components/os2/OsPersistentInterface';
import { useOsSidecar } from '@/hooks/os2/useOsSidecar';
// OS 2.0 sempre abilitato - feature flag rimosso
import { Bot, Sparkles } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideHeader?: boolean;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <DashboardLayoutContent children={children} title={title} />
    </AuthGuard>
  );
}

function DashboardLayoutContent({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { t } = useLanguage();
  const router = useRouter();
  
  // 🎯 OS 2.0 Hook per gestire stato del Sidecar
  const { isOpen, open, close } = useOsSidecar();
  
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [DashboardLayout] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const auth = (authContext && typeof authContext === 'object') ? authContext : { currentUser: null, loading: false };
  
  // CHIRURGICO: Protezione usePathname per evitare race condition con useAuth
  let pathname = '/dashboard';
  try {
    const pathnameResult = usePathname();
    pathname = pathnameResult || '/dashboard'; // CORREZIONE: Gestisce null
  } catch (error) {
    console.warn("⚠️ [DashboardLayout] Errore usePathname:", error);
  }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationPreferencesOpen, setNotificationPreferencesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationStats>({
    unread: 0,
    total: 0,
    read: 0,
    dismissed: 0,
    byType: {},
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  // Funzione per generare notifiche di test
  const generateTestNotifications = async () => {
    try {
      if (auth && typeof auth === 'object' && 'currentUser' in auth && auth.currentUser?.uid) {
        await notificationTriggerService.generateTestNotifications(auth.currentUser.uid);
        console.log('✅ Notifiche di test generate');
        // Ricarica le statistiche delle notifiche
        const notificationsData = await firebaseNotificationService.getNotificationStats(auth.currentUser.uid);
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('❌ Errore generazione notifiche test:', error);
    }
  };

  // 🔧 FIX NAVIGAZIONE: Intercettatore universale per tutti i click sui link
  useEffect(() => {
    console.log('🚀 [NAVIGATION INTERCEPTOR] Inizializzazione intercettatore navigazione, pathname:', pathname);
    
    const handleNavigationClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Cerca prima un link
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href) {
        console.log('🔍 [NAVIGATION INTERCEPTOR] Click rilevato su link:', link.href, 'pathname attuale:', pathname);
        
        // Controlla se siamo in una pagina di feasibility analysis
        if (pathname?.includes('/feasibility-analysis/')) {
          console.log('🔄 [NAVIGATION INTERCEPTOR] Rilevata pagina feasibility-analysis, forzando navigazione');
          
          // Preveni la navigazione normale
          event.preventDefault();
          event.stopPropagation();
          
          // Estrai il path di destinazione
          const url = new URL(link.href);
          const destinationPath = url.pathname;
          
          console.log('🎯 [NAVIGATION INTERCEPTOR] Navigazione forzata verso:', destinationPath);
          
          // Forza la navigazione
          try {
            router.push(destinationPath);
            console.log('✅ [NAVIGATION INTERCEPTOR] Router.push eseguito');
            
            // Fallback dopo 100ms
            setTimeout(() => {
              if (window.location.pathname === pathname) {
                console.log('⚠️ [NAVIGATION INTERCEPTOR] Router.push fallito, uso window.location');
                window.location.href = destinationPath;
              }
            }, 100);
          } catch (error) {
            console.error('❌ [NAVIGATION INTERCEPTOR] Errore router.push:', error);
            window.location.href = destinationPath;
          }
        }
      }
      
      // Gestisci anche i pulsanti "Indietro" e altri elementi di navigazione
      const button = target.closest('button') as HTMLButtonElement;
      if (button && button.textContent?.includes('Indietro')) {
        console.log('🔍 [NAVIGATION INTERCEPTOR] Click rilevato su pulsante Indietro, pathname attuale:', pathname);
        
        // Controlla se siamo in una pagina di feasibility analysis
        if (pathname?.includes('/feasibility-analysis/')) {
          console.log('🔄 [NAVIGATION INTERCEPTOR] Pulsante Indietro in pagina feasibility-analysis, forzando navigazione');
          
          // Preveni il comportamento normale del pulsante
          event.preventDefault();
          event.stopPropagation();
          
          // Naviga alla pagina principale delle analisi di fattibilità
          const destinationPath = '/dashboard/feasibility-analysis';
          
          console.log('🎯 [NAVIGATION INTERCEPTOR] Navigazione pulsante Indietro verso:', destinationPath);
          
          // Forza la navigazione
          try {
            router.push(destinationPath);
            console.log('✅ [NAVIGATION INTERCEPTOR] Router.push pulsante Indietro eseguito');
            
            // Fallback dopo 100ms
            setTimeout(() => {
              if (window.location.pathname === pathname) {
                console.log('⚠️ [NAVIGATION INTERCEPTOR] Router.push pulsante Indietro fallito, uso window.location');
                window.location.href = destinationPath;
              }
            }, 100);
          } catch (error) {
            console.error('❌ [NAVIGATION INTERCEPTOR] Errore router.push pulsante Indietro:', error);
            window.location.href = destinationPath;
          }
        }
      }
    };

    // Aggiungi l'intercettatore globale
    document.addEventListener('click', handleNavigationClick, true);
    
    return () => {
      console.log('🧹 [NAVIGATION INTERCEPTOR] Rimozione intercettatore');
      document.removeEventListener('click', handleNavigationClick, true);
    };
  }, [pathname, router]);

  // Carica notifiche e profilo utente solo se l'utente è autenticato
  useEffect(() => {
    const loadData = async () => {
      try {
        if (auth && typeof auth === 'object' && 'currentUser' in auth && auth.currentUser?.uid) {
          console.log('🔄 [DashboardLayout] Caricamento dati per utente:', auth.currentUser.uid);
          
          // Carica notifiche con gestione errori
          try {
            const notificationsData = await firebaseNotificationService.getNotificationStats(auth.currentUser?.uid || '');
            setNotifications(notificationsData);
            console.log('✅ [DashboardLayout] Notifiche caricate:', notificationsData);
          } catch (notificationError) {
            console.error('❌ [DashboardLayout] Errore caricamento notifiche:', notificationError);
            // Non bloccare il caricamento se le notifiche falliscono
            setNotifications({
              unread: 0, 
              total: 0, 
              read: 0, 
              dismissed: 0, 
              byType: {}, 
            });
          }
          
          // Carica profilo utente con gestione errori
          try {
            const profileData = await firebaseUserProfileService.getUserProfile(auth.currentUser?.uid || '');
            setUserProfile(profileData);
            console.log('✅ [DashboardLayout] Profilo caricato:', profileData);
          } catch (profileError) {
            console.error('❌ [DashboardLayout] Errore caricamento profilo:', profileError);
            // Non bloccare il caricamento se il profilo fallisce
            setUserProfile(null);
          }
          
          // Carica workspace dell'utente con gestione errori
          try {
            const { workspaceService } = await import('@/lib/workspaceService');
            const workspaceData = await workspaceService.getWorkspacesByUser(auth.currentUser?.uid || '');
            setWorkspaces(workspaceData);
            console.log('✅ [DashboardLayout] Workspace caricati:', workspaceData);
          } catch (workspaceError) {
            console.error('❌ [DashboardLayout] Errore caricamento workspace:', workspaceError);
            // Non bloccare il caricamento se i workspace falliscono
            setWorkspaces([]);
          }
          
          console.log('✅ [DashboardLayout] Caricamento dati completato');
        } else {
          console.log('⚠️ [DashboardLayout] Nessun utente autenticato, skip caricamento dati');
        }
      } catch (error) {
        console.error('❌ [DashboardLayout] Errore generale caricamento dati:', error);
        // Non bloccare l'app per errori di caricamento dati
      }
    };

    // Carica solo se l'utente è autenticato
    if (auth && typeof auth === 'object' && 'currentUser' in auth && auth.currentUser?.uid) {
      loadData();
    }
  }, [auth && typeof auth === 'object' && 'currentUser' in auth ? auth.currentUser?.uid : null]);

  const handleLogout = async () => {
    try {
      // CORREZIONE: Controlla se logout esiste prima di chiamarlo
      if (auth && typeof auth === 'object' && 'logout' in auth && typeof auth.logout === 'function') {
        await auth.logout();
      } else {
        console.warn('⚠️ [DashboardLayout] Logout non disponibile');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/unified';
    }
    // 🔧 FIX: Gestione migliorata per sottopagine
    if (href === '/dashboard/feasibility-analysis') {
      return pathname.startsWith('/dashboard/feasibility-analysis');
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex">
      {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen sidebar">
          {/* Sidebar Header - Apple Style */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center logo-container">
                <Building2 className="w-5 h-5 text-white logo-icon" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 logo-text">Urbanova</h1>
              </div>
            </div>
          </div>

          <div className="p-4">
            <nav className="space-y-2">
            {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sidebar-section-title">
                  DASHBOARD
                </h3>
                <Link
                  href="/dashboard"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 sidebar-item ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700 shadow-sm active'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    // 🔧 FIX: Forza navigazione anche se si è in una sottopagina
                    console.log('🔍 [DASHBOARD LAYOUT] Click su Dashboard, pathname attuale:', pathname);
                    if (pathname?.includes('/feasibility-analysis/') || pathname?.includes('/design-center/') || pathname?.includes('/business-plan/') || pathname?.includes('/progetti/')) {
                      e.preventDefault();
                      console.log('🔄 [DASHBOARD LAYOUT] Navigazione forzata da', pathname, 'a /dashboard');
                      try {
                        router.push('/dashboard');
                        setTimeout(() => {
                          if (window.location.pathname === pathname) {
                            console.log('⚠️ [DASHBOARD LAYOUT] Router.push fallito, uso window.location');
                            window.location.href = '/dashboard';
                          }
                        }, 100);
                      } catch (error) {
                        console.error('❌ [DASHBOARD LAYOUT] Errore navigazione:', error);
                        window.location.href = '/dashboard';
                      }
                    } else {
                      console.log('✅ [DASHBOARD LAYOUT] Navigazione normale per pathname:', pathname);
                    }
                  }}
                >
                  <DashboardIcon className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>
              </div>

              {/* Discovery */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DISCOVERY
                </h3>
                <Link
                  href="/dashboard/market-intelligence"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/market-intelligence')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <SearchIcon className="w-4 h-4 mr-3" />
                  Market Intelligence
                </Link>
                <Link
                  href="/dashboard/feasibility-analysis"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/feasibility-analysis')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    // 🔧 FIX: Forza navigazione anche se si è in una sottopagina di feasibility-analysis
                    console.log('🔍 [DASHBOARD LAYOUT] Click su Analisi Fattibilità, pathname attuale:', pathname);
                    if (pathname?.includes('/feasibility-analysis/')) {
                      e.preventDefault();
                      console.log('🔄 [DASHBOARD LAYOUT] Navigazione forzata da', pathname, 'a /dashboard/feasibility-analysis');
                      try {
                        // Usa router.push con fallback a window.location
                        router.push('/dashboard/feasibility-analysis');
                        // Fallback: se router.push fallisce, usa window.location dopo un breve delay
                        setTimeout(() => {
                          if (window.location.pathname === pathname) {
                            console.log('⚠️ [DASHBOARD LAYOUT] Router.push fallito, uso window.location');
                            window.location.href = '/dashboard/feasibility-analysis';
                          }
                        }, 100);
                      } catch (error) {
                        console.error('❌ [DASHBOARD LAYOUT] Errore navigazione:', error);
                        window.location.href = '/dashboard/feasibility-analysis';
                      }
                    } else {
                      console.log('✅ [DASHBOARD LAYOUT] Navigazione normale per pathname:', pathname);
                    }
                  }}
                >
                  <CalculatorIcon className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/design-center')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    // 🔧 FIX: Forza navigazione anche se si è in una sottopagina di design-center
                    console.log('🔍 [DASHBOARD LAYOUT] Click su Design Center, pathname attuale:', pathname);
                    if (pathname?.includes('/design-center/')) {
                      e.preventDefault();
                      console.log('🔄 [DASHBOARD LAYOUT] Navigazione forzata da', pathname, 'a /dashboard/design-center');
                      try {
                        router.push('/dashboard/design-center');
                        setTimeout(() => {
                          if (window.location.pathname === pathname) {
                            console.log('⚠️ [DASHBOARD LAYOUT] Router.push fallito, uso window.location');
                            window.location.href = '/dashboard/design-center';
                          }
                        }, 100);
                      } catch (error) {
                        console.error('❌ [DASHBOARD LAYOUT] Errore navigazione:', error);
                        window.location.href = '/dashboard/design-center';
                      }
                    } else {
                      console.log('✅ [DASHBOARD LAYOUT] Navigazione normale per pathname:', pathname);
                    }
                  }}
                >
                  <PaletteIcon className="w-4 h-4 mr-3" />
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
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/business-plan')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    // 🔧 FIX: Forza navigazione anche se si è in una sottopagina di business-plan
                    console.log('🔍 [DASHBOARD LAYOUT] Click su Business Plan, pathname attuale:', pathname);
                    if (pathname?.includes('/business-plan/')) {
                      e.preventDefault();
                      console.log('🔄 [DASHBOARD LAYOUT] Navigazione forzata da', pathname, 'a /dashboard/business-plan');
                      try {
                        router.push('/dashboard/business-plan');
                        setTimeout(() => {
                          if (window.location.pathname === pathname) {
                            console.log('⚠️ [DASHBOARD LAYOUT] Router.push fallito, uso window.location');
                            window.location.href = '/dashboard/business-plan';
                          }
                        }, 100);
                      } catch (error) {
                        console.error('❌ [DASHBOARD LAYOUT] Errore navigazione:', error);
                        window.location.href = '/dashboard/business-plan';
                      }
                    } else {
                      console.log('✅ [DASHBOARD LAYOUT] Navigazione normale per pathname:', pathname);
                    }
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Business Plan
                </Link>
                <Link
                  href="/dashboard/permits-compliance"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/permits-compliance')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </Link>
                <Link
                  href="/dashboard/project-timeline"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/project-timeline')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 mr-3" />
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
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/progetti')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    // 🔧 FIX: Forza navigazione anche se si è in una sottopagina
                    console.log('🔍 [DASHBOARD LAYOUT] Click su Progetti, pathname attuale:', pathname);
                    if (pathname?.includes('/feasibility-analysis/') || pathname?.includes('/design-center/') || pathname?.includes('/business-plan/') || pathname?.includes('/progetti/')) {
                      e.preventDefault();
                      console.log('🔄 [DASHBOARD LAYOUT] Navigazione forzata da', pathname, 'a /dashboard/progetti');
                      try {
                        router.push('/dashboard/progetti');
                        setTimeout(() => {
                          if (window.location.pathname === pathname) {
                            console.log('⚠️ [DASHBOARD LAYOUT] Router.push fallito, uso window.location');
                            window.location.href = '/dashboard/progetti';
                          }
                        }, 100);
                      } catch (error) {
                        console.error('❌ [DASHBOARD LAYOUT] Errore navigazione:', error);
                        window.location.href = '/dashboard/progetti';
                      }
                    } else {
                      console.log('✅ [DASHBOARD LAYOUT] Navigazione normale per pathname:', pathname);
                    }
                  }}
                >
                  <BuildingIcon className="w-4 h-4 mr-3" />
                  Progetti
                </Link>
                <Link
                  href="/dashboard/mappa-progetti"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/mappa-progetti')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4 mr-3" />
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
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/project-management')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ProjectIcon className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </Link>
                <Link
                  href="/dashboard/project-management/documents"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/project-management/documents')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <DocumentIcon className="w-4 h-4 mr-3" />
                  Documenti
                </Link>
                <Link
                  href="/dashboard/project-management/meetings"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/project-management/meetings')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <MeetingIcon className="w-4 h-4 mr-3" />
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
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard/marketing')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <MarketingIcon className="w-4 h-4 mr-3" />
                  Marketing
                </Link>
          </div>
            </nav>
        </div>
            </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header con icone */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Titolo per tutte le pagine */}
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Test Notifiche (solo sviluppo) */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={generateTestNotifications}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="Genera Notifiche di Test"
                  >
                    Test Notifiche
                  </button>
                )}

                {/* Notifiche */}
              <div className="flex items-center gap-2">
                <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 header-icon"
                    title="Notifiche"
                >
                  <Bell className="w-5 h-5" />
                    {notifications.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.unread > 9 ? '9+' : notifications.unread}
                    </span>
                  )}
                </button>

                <button
                    onClick={() => setNotificationPreferencesOpen(!notificationPreferencesOpen)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 header-icon"
                    title="Preferenze Notifiche"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

                {/* Profilo Utente */}
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 header-icon"
                  title="Profilo Utente"
                >
                  <User className="w-5 h-5" />
                </button>
                
                {/* Team */}
                <button
                  onClick={() => setTeamOpen(!teamOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 header-icon"
                  title="Team"
                >
                  <Users className="w-5 h-5" />
                </button>

                {/* Settings */}
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 header-icon"
                  title="Impostazioni"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {/* 🎯 OS 2.0 - Icona elegante nell'header */}
                <button
                  onClick={() => {
                    console.log('🎯 [OS2] Icona header clicked - Apertura Sidecar');
                    console.log('🎯 [OS2] Stato isOpen prima:', isOpen);
                    open(); // Apre il Sidecar tramite hook
                    console.log('🎯 [OS2] Funzione open() chiamata');
                  }}
                  className="p-2 text-blue-600 hover:text-blue-700 transition-all duration-200 rounded-lg hover:bg-blue-50 header-icon relative group"
                  title="Apri Urbanova OS (⌘J)"
                >
                  <Bot className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse" />
                  
                  {/* Tooltip elegante */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Urbanova OS 2.0
                  </div>
                </button>
              </div>
            </div>
          </header>
          
          {/* Content Area */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Pannelli Header */}
      {notificationsOpen && (
        <NotificationsPanel 
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
      )}

      {notificationPreferencesOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <NotificationPreferencesComponent
                userId={userProfile?.id || ''}
                onClose={() => setNotificationPreferencesOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      {profileOpen && (
        <UserProfilePanelFixed
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      )}
      
      {teamOpen && (
        <WorkspaceManager
          isOpen={teamOpen}
          onClose={() => setTeamOpen(false)}
          workspaces={workspaces}
          onWorkspaceCreated={(workspace) => {
            setWorkspaces(prev => [...prev, workspace]);
            setTeamOpen(false);
          }}
          onMemberInvited={() => {
            // Handle member invitation
            console.log('Member invited');
          }}
        />
      )}
      
      {settingsOpen && (
        <SettingsPanel 
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Feedback Widget */}
      <FeedbackWidget className="" />
      
      {/* 🆕 OS 2.0 Persistent Interface - Design Johnny Ive */}
      <OsPersistentInterface
        onMessageSend={async (message: string) => {
          try {
            console.log('🎯 [OS2] Invio messaggio:', message);
            
            const response = await fetch('/api/os2/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message,
                userId: (auth && typeof auth === 'object' && 'currentUser' in auth && auth.currentUser?.uid) ? auth.currentUser.uid : 'anonymous',
                userEmail: (auth && typeof auth === 'object' && 'currentUser' in auth && auth.currentUser?.email) ? auth.currentUser.email : '',
                sessionId: Date.now().toString(),
              }),
            });
            
            const result = await response.json();
            console.log('📥 [OS2] Response received:', result);
          } catch (error) {
            console.error('❌ [OS2] Error sending message:', error);
          }
        }}
        onSkillClick={(skillId) => {
          console.log('🎯 [OS2] Skill clicked:', skillId);
          // Navigate to skill tab
          const skillRoute = skillId.split('.')[0]; // e.g., "business_plan.run" → "business_plan"
          router.push(`/dashboard/${skillRoute}`);
        }}
        onProjectClick={(projectId) => {
          console.log('🏢 [OS2] Project clicked:', projectId);
          // Navigate to project
          router.push(`/dashboard/projects/${projectId}`);
        }}
        onQuickAction={(actionId) => {
          console.log('⚡ [OS2] Quick action:', actionId);
        }}
        onActionClick={(messageId, actionId) => {
          console.log('🎬 [OS2] Action clicked:', actionId, 'on message:', messageId);
        }}
      />
    </div>
  );
}