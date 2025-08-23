'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import { UserProfile } from '@/types/userProfile';
import { NotificationStats } from '@/types/notifications';
import LanguageSelector from '@/components/ui/LanguageSelector';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import UserProfilePanel from '@/components/ui/UserProfilePanel';
import { 
  DashboardIcon,
  SearchIcon,
  CalculatorIcon,
  PaletteIcon,
  CalendarIcon,
  BellIcon,
  UserIcon,
  LogoutIcon,
  SettingsIcon,
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
  PlusIcon,
  ProjectIcon,
  MapIcon
} from '@/components/icons';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);

  const userId = currentUser?.uid || 'demo-user';

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    // Sottoscrizione agli eventi per aggiornamenti in tempo reale
    // Rimuovo il listener per ora - Firebase ha real-time updates nativi
    // const unsubscribeNotifications = notificationService.subscribe((event) => {
    //   if (event.detail.type === 'notification_created' || 
    //       event.detail.type === 'notification_updated' ||
    //       event.detail.type === 'notification_deleted') {
    //     loadNotificationStats();
    //   }
    // });

    // Rimuovo il listener per ora - Firebase ha real-time updates nativi
    // const unsubscribeProfile = userProfileService.subscribe((event) => {
    //   if (event.detail.type === 'profile_updated' || 
    //       event.detail.type === 'avatar_updated') {
    //     loadUserProfile();
    //   }
    // });

    return () => {
      // unsubscribeNotifications();
      // unsubscribeProfile();
    };
  }, []);

  const loadUserData = async () => {
    try {
      const [profile, stats] = await Promise.all([
        firebaseUserProfileService.getUserProfile(userId),
        firebaseNotificationService.getNotificationStats(userId),
      ]);
      
      setUserProfile(profile);
      setNotificationStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await firebaseUserProfileService.getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadNotificationStats = async () => {
    try {
      const stats = await firebaseNotificationService.getNotificationStats(userId);
      setNotificationStats(stats);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const NavSection = ({ title, children, collapsed = false }: { title: string; children: React.ReactNode; collapsed?: boolean }) => (
    <div className="mb-1.5">
      {!collapsed && (
        <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-blue-300/80 font-medium">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );

  const NavItem = ({ href, icon, text, isActive, collapsed }: { 
    href: string; 
    icon: React.ReactNode; 
    text: string; 
    isActive: boolean; 
    collapsed: boolean;
  }) => (
    <Link
      href={href}
      className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive
          ? 'bg-blue-700 text-white'
          : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>
        {icon}
      </span>
      {!collapsed && <span>{text}</span>}
    </Link>
  );

  const navigation = {
    main: [
      { href: '/dashboard', icon: <DashboardIcon />, text: t('dashboard', 'navigation') },
    ],
    discovery: [
      { href: '/dashboard/market-intelligence', icon: <SearchIcon />, text: t('marketIntelligence', 'navigation') },
      { href: '/dashboard/feasibility-analysis', icon: <CalculatorIcon />, text: t('feasibilityAnalysis', 'navigation') },
      { href: '/dashboard/design-center', icon: <PaletteIcon />, text: t('designCenter', 'navigation') },
    ],
    planning: [
      { href: '/dashboard/business-plan', icon: <BusinessPlanIcon />, text: t('businessPlan', 'navigation') },
      { href: '/dashboard/permits-compliance', icon: <PermitIcon />, text: t('permitsCompliance', 'navigation') },
      { href: '/dashboard/project-timeline', icon: <CalendarIcon />, text: t('projectTimeline', 'navigation') },
    ],
    progetti: [
      { href: '/dashboard/progetti', icon: <BuildingIcon />, text: t('projects', 'navigation') },
      { href: '/dashboard/progetti/nuovo', icon: <NewProjectIcon />, text: t('newProject', 'navigation') },
      { href: '/dashboard/mappa', icon: <MapIcon />, text: t('projectMap', 'navigation') },
    ],
    gestioneProgetti: [
      { href: '/dashboard/project-management', icon: <ProjectIcon />, text: t('projectManagement', 'navigation') },
      { href: '/dashboard/project-management/documents', icon: <DocumentIcon />, text: t('documents', 'navigation') },
      { href: '/dashboard/project-management/meetings', icon: <MeetingIcon />, text: t('meetings', 'navigation') },
    ],
    marketing: [
      { href: '/dashboard/marketing', icon: <MarketingIcon />, text: t('marketing', 'navigation') },
      { href: '/dashboard/marketing/campaigns', icon: <CampaignIcon />, text: t('campaigns', 'navigation') },
      { href: '/dashboard/marketing/materials', icon: <DocumentIcon />, text: t('materials', 'navigation') },
    ],
    epc: [
      { href: '/dashboard/epc', icon: <ConstructionIcon />, text: t('epc', 'navigation') },
      { href: '/dashboard/epc/construction-site', icon: <ConstructionIcon />, text: t('constructionSite', 'navigation') },
      { href: '/dashboard/epc/technical-documents', icon: <DocumentIcon />, text: t('technicalDocuments', 'navigation') },
      { href: '/dashboard/epc/permits', icon: <PermitIcon />, text: t('permits', 'navigation') },
    ],
    businessPlan: [
      { href: '/dashboard/business-plan', icon: <BusinessPlanIcon />, text: t('businessPlan', 'navigation') },
    ],
    altro: [
      { href: '/dashboard/clienti', icon: <ClientIcon />, text: t('clients', 'navigation') },
      { href: '/dashboard/documenti', icon: <DocumentIcon />, text: t('documents', 'navigation') },
      { href: '/dashboard/notifiche', icon: <BellIcon />, text: t('notifications', 'navigation') },
      { href: '/dashboard/impostazioni', icon: <SettingsIcon />, text: t('settings', 'navigation') },
    ],
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-blue-800 text-white transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'w-16' : 'w-60'}
          lg:relative lg:translate-x-0 shadow-xl
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-3 bg-blue-900">
            <Link href="/dashboard" className="flex items-center space-x-2 flex-1 truncate">
              {!sidebarCollapsed && (
                <span className="text-xl font-semibold tracking-tight">Urbanova</span>
              )}
              {sidebarCollapsed && (
                <span className="text-xl font-semibold mx-auto">U</span>
              )}
            </Link>
            <div className="flex items-center">
              <button
                className="p-1 rounded-md text-blue-300 hover:text-white hover:bg-blue-700/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                className="p-1 rounded-md text-blue-300 hover:text-white hover:bg-blue-700/50 hidden lg:block ml-2"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={sidebarCollapsed
                      ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                      : "M11 19l-7-7 7-7M19 19l-7-7 7-7"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
            {/* Sezione principale */}
            <NavSection title={t('dashboard', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.main.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Sezione Discovery */}
            <NavSection title={t('discovery', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.discovery.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Sezione Planning & Compliance */}
            <NavSection title={t('planningCompliance', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.planning.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Sezione Progetti */}
            <NavSection title={t('projects', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.progetti.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Sezione Project Management */}
            <NavSection title={t('projectManagement', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.gestioneProgetti.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Sezione Marketing */}
            <NavSection title={t('marketingSales', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.marketing.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Sezione EPC */}
            <NavSection title={t('constructionEPC', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.epc.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Sezione Business Plan */}
            <NavSection title={t('businessPlan', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.businessPlan.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>

            {/* Altre sezioni */}
            <NavSection title={t('other', 'navigationSections')} collapsed={sidebarCollapsed}>
              {navigation.altro.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  text={item.text}
                  isActive={pathname === item.href}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </NavSection>
          </nav>

          {/* User Section */}
          <div className={`p-3 border-t border-blue-700/50 ${sidebarCollapsed ? 'text-center' : ''}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center mb-3">
                <div className="avatar">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                    <UserIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-2.5 overflow-hidden">
                  <p className="text-xs font-medium truncate">{currentUser?.displayName || t('user', 'common')}</p>
                  <p className="text-[11px] text-blue-300/80 truncate">{currentUser?.email}</p>
                </div>
              </div>
            )}

            {sidebarCollapsed && (
              <div className="mb-3 flex justify-center">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <UserIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center py-1.5 px-2.5 text-xs rounded-md bg-blue-700/60 hover:bg-blue-700 transition-colors
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? t('logout', 'common') : undefined}
            >
              <LogoutIcon className={`h-4 w-4 ${!sidebarCollapsed ? 'mr-1.5' : ''}`} />
              {!sidebarCollapsed && <span>{t('logout', 'common')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 h-14">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center space-x-4">
              <button
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">{title}</h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-slate-100 rounded-md px-3 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500/50">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={t('search', 'common')}
                  className="bg-transparent border-none outline-none text-sm text-slate-600 w-36 ml-2"
                />
              </div>

              {/* Language Selector */}
              <LanguageSelector variant="header" />

              {/* Notifications Button */}
              <button 
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative"
                onClick={() => setNotificationsOpen(true)}
              >
                <BellIcon className="w-5 h-5" />
                {notificationStats && notificationStats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationStats.unread > 9 ? '9+' : notificationStats.unread}
                  </span>
                )}
              </button>

              <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>

              {/* User Profile Button */}
              <div className="hidden sm:flex items-center">
                <button
                  onClick={() => setUserProfileOpen(true)}
                  className="flex items-center space-x-2 p-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden">
                    {userProfile?.avatar ? (
                      <img 
                        src={userProfile.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-800">
                      {userProfile?.displayName || currentUser?.displayName || t('user', 'common')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {userProfile?.role || 'Utente'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Mobile User Menu */}
              <div className="sm:hidden">
                <button
                  onClick={() => setUserProfileOpen(true)}
                  className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"
                >
                  {userProfile?.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* User Profile Panel */}
      <UserProfilePanel 
        isOpen={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
      />
    </div>
  );
} 