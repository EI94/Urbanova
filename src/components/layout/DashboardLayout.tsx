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
        if (auth.user?.uid) {
          const [notificationsData, profileData] = await Promise.all([
            firebaseNotificationService.getNotificationStats(auth.user.uid),
            firebaseUserProfileService.getUserProfile(auth.user.uid),
          ]);
          setNotifications(notificationsData);
          setUserProfile(profileData);
        }
    } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [auth.user?.uid]);

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BuildingIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Urbanova Dashboard</h1>
                  <p className="text-sm text-gray-500">Design Center & Project Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <SettingsIcon className="w-5 h-5" />
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
                  href="/dashboard"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <SearchIcon className="w-4 h-4 mr-3" />
                  Market Intelligence
                </Link>
                <Link
                  href="/dashboard/feasibility-analysis"
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/dashboard/feasibility-analysis')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CalculatorIcon className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BusinessPlanIcon className="w-4 h-4 mr-3" />
                  Business Plan
                </Link>
                <Link
                  href="/dashboard/permits-compliance"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <PermitIcon className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </Link>
                <Link
                  href="/dashboard/project-timeline"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BuildingIcon className="w-4 h-4 mr-3" />
                  Progetti
                </Link>
                <Link
                  href="/dashboard/mappa-progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <ProjectIcon className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </Link>
                <Link
                  href="/dashboard/project-management/documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <DocumentIcon className="w-4 h-4 mr-3" />
                  Documenti
                </Link>
                <Link
                  href="/dashboard/project-management/meetings"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
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