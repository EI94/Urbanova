'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { notificationService } from '@/lib/notificationService';
import { Notification, NotificationStats } from '@/types/notifications';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@/components/icons';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('unread');
  const panelRef = useRef<HTMLDivElement>(null);

  const userId = currentUser?.uid || 'demo-user';

  useEffect(() => {
    if (isOpen && currentUser) {
      loadNotifications();
      if (notifications.length === 0) {
        notificationService.createSampleNotifications(userId);
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((event) => {
      if (event.detail.type === 'notification_created' || 
          event.detail.type === 'notification_updated' ||
          event.detail.type === 'notification_deleted') {
        loadNotifications();
      }
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [allNotifs, unreadNotifs, notifStats] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getUnreadNotifications(userId),
        notificationService.getNotificationStats(userId),
      ]);
      
      setNotifications(allNotifs);
      setStats(notifStats);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId, userId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId, userId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDismissNotification = async (notificationId: string) => {
    try {
      await notificationService.dismissNotification(notificationId, userId);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'permit': return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'task': return <CheckIcon className="h-4 w-4 text-green-500" />;
      case 'system': return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
      case 'marketing': return <CheckCircleIcon className="h-4 w-4 text-purple-500" />;
      default: return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return t('priorities.critical', 'notifications');
      case 'high': return t('priorities.high', 'notifications');
      case 'medium': return t('priorities.medium', 'notifications');
      case 'low': return t('priorities.low', 'notifications');
      default: return priority;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'project': return t('types.project', 'notifications');
      case 'permit': return t('types.permit', 'notifications');
      case 'task': return t('types.task', 'notifications');
      case 'system': return t('types.system', 'notifications');
      case 'marketing': return t('types.marketing', 'notifications');
      default: return type;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ora';
    if (minutes < 60) return `${minutes}m fa`;
    if (hours < 24) return `${hours}h fa`;
    if (days < 7) return `${days}g fa`;
    return date.toLocaleDateString('it-IT');
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead && !n.isDismissed)
    : notifications.filter(n => !n.isDismissed);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      <div 
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('title', 'notifications')}</h2>
            {stats && stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'unread'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('unread', 'notifications')}
            {stats && stats.unread > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('all', 'notifications')}
            {stats && (
              <span className="ml-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.total}
              </span>
            )}
          </button>
        </div>

        {stats && stats.unread > 0 && (
          <div className="p-3 border-b bg-gray-50">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full py-2 px-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              {t('markAllAsRead', 'notifications')}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-500">{t('loading', 'notifications')}</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {activeTab === 'unread' 
                  ? t('noUnreadNotifications', 'notifications')
                  : t('noNotifications', 'notifications')
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(notification.type)}
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {getTypeText(notification.type)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                        {getPriorityText(notification.priority)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {!notification.isRead ? (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        >
                          {t('actions.view', 'notifications')}
                        </button>
                      ) : (
                        <button
                          onClick={() => notificationService.markAsUnread(notification.id, userId)}
                          className="text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                        >
                          {t('markAsUnread', 'notifications')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissNotification(notification.id)}
                        className="text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                      >
                        {t('actions.dismiss', 'notifications')}
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
