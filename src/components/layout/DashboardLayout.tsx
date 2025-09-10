'use client';

import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

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
  ProjectIcon,
  MapIcon,
} from '@/components/icons';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import LanguageSelector from '@/components/ui/LanguageSelector';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import UserProfilePanel from '@/components/ui/UserProfilePanel';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import { NotificationStats } from '@/types/notifications';
import { UserProfile } from '@/types/userProfile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const { t } = useLanguage();
  const auth = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationStats>({
    unread: 0,
    total: 0,
    read: 0,
    dismissed: 0,
    byType: {},
    byPriority: {},
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Carica notifiche e profilo utente
  useEffect(() => {
    const loadData = async () => {
      try {
        if (auth.currentUser?.uid) {
          const [notificationsData, profileData] = await Promise.all([
            firebaseNotificationService.getNotificationStats(auth.currentUser.uid),
            firebaseUserProfileService.getUserProfile(auth.currentUser.uid),
          ]);
          setNotifications(notificationsData);
          setUserProfile(profileData);
        }
    } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [auth.currentUser?.uid]);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/unified';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          {/* Sidebar Header - Apple Style */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <BuildingIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Urbanova</h1>
                <p className="text-xs text-gray-500 font-medium">Design Center</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <nav className="space-y-2">
            {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DASHBOARD
                </h3>
                <Link
                  href="/dashboard"
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
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
                >
                  <BusinessPlanIcon className="w-4 h-4 mr-3" />
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
                  <PermitIcon className="w-4 h-4 mr-3" />
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
        <div className="flex-1 flex">
          {/* Content Area */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Feedback Widget */}
      <FeedbackWidget className="" />
    </div>
  );
}