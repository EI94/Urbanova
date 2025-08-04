'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { 
  HomeIcon, 
  DashboardIcon, 
  ProjectIcon, 
  UserIcon, 
  SettingsIcon, 
  LogoutIcon, 
  AlertIcon,
  LocationIcon,
  BuildingIcon,
  MarketingIcon,
  DocumentIcon,
  BusinessPlanIcon,
  ClientIcon,
  ConstructionIcon,
  MeetingIcon,
  CampaignIcon,
  PermitIcon,
  NewProjectIcon,
  SearchIcon,
  CalculatorIcon,
  PaletteIcon,
  CalendarIcon
} from '@/components/icons';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const NavItem = ({ href, icon, text, isActive, onClick, collapsed = false }: NavItemProps) => (
  <Link
    href={href}
    className={`
      flex items-center py-2 px-3 rounded-md transition-all duration-200 text-sm
      ${isActive 
        ? 'bg-blue-600/90 text-white font-medium shadow-sm'
        : 'text-neutral-100 hover:bg-blue-700/40 hover:text-white'
      }
      ${collapsed ? 'justify-center' : ''}
    `}
    onClick={onClick}
    title={collapsed ? text : undefined}
  >
    <span className="text-[18px]">{icon}</span>
    {!collapsed && <span className="ml-2.5 truncate">{text}</span>}
  </Link>
);

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
}

const NavSection = ({ title, children, collapsed = false }: NavSectionProps) => (
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

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Errore durante il logout', error);
    }
  };

  const navigation = {
    main: [
      { href: '/dashboard', icon: <DashboardIcon />, text: t('dashboard', 'navigation') },
    ],
    intelligence: [
      { href: '/dashboard/market-intelligence', icon: <SearchIcon />, text: t('marketIntelligence', 'navigation') },
      { href: '/dashboard/land-scraping', icon: <SearchIcon />, text: t('landScraping', 'navigation') },
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
      { href: '/dashboard/mappa', icon: <LocationIcon />, text: t('projectMap', 'navigation') },
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
      { href: '/dashboard/notifiche', icon: <AlertIcon />, text: t('notifications', 'navigation') },
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
            <NavSection title="Dashboard" collapsed={sidebarCollapsed}>
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
            
            {/* Sezione Intelligence & Discovery */}
            <NavSection title="Intelligence & Discovery" collapsed={sidebarCollapsed}>
              {navigation.intelligence.map((item) => (
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
            <NavSection title="Planning & Compliance" collapsed={sidebarCollapsed}>
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
            <NavSection title="Progetti" collapsed={sidebarCollapsed}>
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
            <NavSection title="Gestione Progetti" collapsed={sidebarCollapsed}>
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
            <NavSection title="Marketing e Vendite" collapsed={sidebarCollapsed}>
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
            <NavSection title="Costruzione (EPC)" collapsed={sidebarCollapsed}>
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
            <NavSection title="Business Plan" collapsed={sidebarCollapsed}>
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
            <NavSection title="Altro" collapsed={sidebarCollapsed}>
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
                  <p className="text-xs font-medium truncate">{currentUser?.displayName || 'Utente'}</p>
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
              title={sidebarCollapsed ? "Esci" : undefined}
            >
              <LogoutIcon className={`h-4 w-4 ${!sidebarCollapsed ? 'mr-1.5' : ''}`} />
              {!sidebarCollapsed && <span>Esci</span>}
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
              
              <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative">
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>
              
              <div className="hidden sm:flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium text-slate-800">{currentUser?.displayName || t('user', 'common')}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-5 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 