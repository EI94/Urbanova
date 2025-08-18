'use client';

import React, { useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import {
  BellIcon,
  BellSlashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  RefreshIcon,
  TrashIcon
} from '@/components/icons';

interface PushNotificationManagerProps {
  userId: string;
  className?: string;
}

export default function PushNotificationManager({ userId, className = '' }: PushNotificationManagerProps) {
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    canSubscribe,
    canUnsubscribe,
    canSendTest,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    sendTestNotification,
    updateServiceWorker,
    clearCache,
    clearError
  } = usePushNotifications(userId);

  // ========================================
  // GESTIONE AZIONI
  // ========================================

  const handleSubscribe = async () => {
    try {
      const success = await subscribeToPushNotifications();
      if (success) {
        toast.success(t('pushNotifications.subscribed', 'notifications'));
      } else {
        toast.error(t('pushNotifications.subscriptionFailed', 'notifications'));
      }
    } catch (error) {
      toast.error(t('pushNotifications.subscriptionError', 'notifications'));
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        toast.success(t('pushNotifications.unsubscribed', 'notifications'));
      } else {
        toast.error(t('pushNotifications.unsubscriptionFailed', 'notifications'));
      }
    } catch (error) {
      toast.error(t('pushNotifications.unsubscriptionError', 'notifications'));
    }
  };

  const handleSendTest = async () => {
    try {
      const success = await sendTestNotification();
      if (success) {
        toast.success(t('pushNotifications.testSent', 'notifications'));
      } else {
        toast.error(t('pushNotifications.testFailed', 'notifications'));
      }
    } catch (error) {
      toast.error(t('pushNotifications.testError', 'notifications'));
    }
  };

  const handleUpdateServiceWorker = async () => {
    try {
      await updateServiceWorker();
      toast.success(t('pushNotifications.serviceWorkerUpdated', 'notifications'));
    } catch (error) {
      toast.error(t('pushNotifications.serviceWorkerUpdateFailed', 'notifications'));
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      toast.success(t('pushNotifications.cacheCleared', 'notifications'));
    } catch (error) {
      toast.error(t('pushNotifications.cacheClearFailed', 'notifications'));
    }
  };

  // ========================================
  // RENDERIZZAZIONE STATI
  // ========================================

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              {t('pushNotifications.notSupported', 'notifications')}
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              {error || t('pushNotifications.browserNotSupported', 'notifications')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <XMarkIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {t('pushNotifications.permissionDenied', 'notifications')}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {t('pushNotifications.permissionDeniedDescription', 'notifications')}
            </p>
            <button
              onClick={() => requestPermission()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              {t('pushNotifications.retryPermission', 'notifications')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDERIZZAZIONE PRINCIPALE
  // ========================================

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BellIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('pushNotifications.title', 'notifications')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('pushNotifications.description', 'notifications')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isSubscribed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isSubscribed 
                ? t('pushNotifications.status.subscribed', 'notifications')
                : t('pushNotifications.status.notSubscribed', 'notifications')
              }
            </span>
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              title={t('pushNotifications.advancedSettings', 'notifications')}
            >
              <CogIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
                >
                  {t('common.dismiss', 'common')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="space-y-3">
          {canSubscribe && (
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <BellIcon className="h-4 w-4 mr-2" />
              {isLoading 
                ? t('pushNotifications.subscribing', 'notifications')
                : t('pushNotifications.enable', 'notifications')
              }
            </button>
          )}

          {canUnsubscribe && (
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <BellSlashIcon className="h-4 w-4 mr-2" />
              {isLoading 
                ? t('pushNotifications.unsubscribing', 'notifications')
                : t('pushNotifications.disable', 'notifications')
              }
            </button>
          )}

          {canSendTest && (
            <button
              onClick={handleSendTest}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              {t('pushNotifications.sendTest', 'notifications')}
            </button>
          )}
        </div>

        {/* Permission Status */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {t('pushNotifications.permissionStatus', 'notifications')}:
            </span>
            <span className={`font-medium ${
              permission === 'granted' ? 'text-green-600' :
              permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {permission === 'granted' && t('pushNotifications.permission.granted', 'notifications')}
              {permission === 'denied' && t('pushNotifications.permission.denied', 'notifications')}
              {permission === 'default' && t('pushNotifications.permission.default', 'notifications')}
            </span>
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {t('pushNotifications.advancedSettings', 'notifications')}
            </h4>
            
            <div className="space-y-3">
              <button
                onClick={handleUpdateServiceWorker}
                className="w-full flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                {t('pushNotifications.updateServiceWorker', 'notifications')}
              </button>
              
              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-center px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {t('pushNotifications.clearCache', 'notifications')}
              </button>
            </div>

            {/* Service Worker Info */}
            <div className="mt-3 p-2 bg-white rounded border text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>{t('pushNotifications.serviceWorkerStatus', 'notifications')}:</span>
                <span className="text-green-600 font-medium">
                  {t('pushNotifications.serviceWorker.active', 'notifications')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <InformationCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">
                {t('pushNotifications.help.title', 'notifications')}
              </p>
              <p className="text-xs">
                {t('pushNotifications.help.description', 'notifications')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
