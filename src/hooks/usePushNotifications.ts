import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/lib/pushNotificationService';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const usePushNotifications = (userId?: string) => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // ========================================
  // INIZIALIZZAZIONE E CONTROLLI
  // ========================================

  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Verifica supporto notifiche
        if (!('Notification' in window)) {
          setState(prev => ({
            ...prev,
            isSupported: false,
            error: 'Le notifiche non sono supportate da questo browser',
            isLoading: false
          }));
          return;
        }

        // Verifica supporto Service Worker
        if (!('serviceWorker' in navigator)) {
          setState(prev => ({
            ...prev,
            isSupported: false,
            error: 'I Service Worker non sono supportati da questo browser',
            isLoading: false
          }));
          return;
        }

        // Verifica supporto Push API
        if (!('PushManager' in window)) {
          setState(prev => ({
            ...prev,
            isSupported: false,
            error: 'Le notifiche push non sono supportate da questo browser',
            isLoading: false
          }));
          return;
        }

        // Registra Service Worker
        const swRegistration = await navigator.serviceWorker.register('/sw.js');
        setRegistration(swRegistration);

        // Verifica permessi
        const permission = Notification.permission;
        
        // Verifica se già sottoscritto
        const existingSubscription = await swRegistration.pushManager.getSubscription();
        const isSubscribed = !!existingSubscription;

        setState(prev => ({
          ...prev,
          isSupported: true,
          permission,
          isSubscribed,
          isLoading: false
        }));

        console.log('✅ Push notifications initialized:', {
          isSupported: true,
          permission,
          isSubscribed
        });

      } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
        setState(prev => ({
          ...prev,
          error: `Errore nell'inizializzazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
          isLoading: false
        }));
      }
    };

    initializePushNotifications();
  }, []);

  // ========================================
  // RICHIESTA PERMESSI
  // ========================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!state.isSupported) {
        throw new Error('Le notifiche push non sono supportate');
      }

      const permission = await Notification.requestPermission();
      
      setState(prev => ({ ...prev, permission, isLoading: false }));

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }

    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setState(prev => ({
        ...prev,
        error: `Errore nella richiesta permessi: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        isLoading: false
      }));
      return false;
    }
  }, [state.isSupported]);

  // ========================================
  // SOTTOSCRIZIONE NOTIFICHE PUSH
  // ========================================

  const subscribeToPushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      if (!userId) {
        throw new Error('User ID richiesto per la sottoscrizione');
      }

      if (!registration) {
        throw new Error('Service Worker non registrato');
      }

      if (state.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Genera chiavi VAPID (in produzione, usa chiavi reali)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa1H-82WwT4k6y3E9MXEIK3JPFqN9pvpkIrd1aQNHX2bF0KW8JVBFf5Ln9rcN8';
      
      // Converti chiave VAPID
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Sottoscrivi alle notifiche push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Estrai dati sottoscrizione
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      };

      // Salva sottoscrizione nel database
      await pushNotificationService.subscribeUser(userId, {
        id: '',
        userId,
        ...subscriptionData,
        isActive: true,
        createdAt: new Date(),
        lastUsedAt: new Date()
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }));

      console.log('✅ Successfully subscribed to push notifications');
      return true;

    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      setState(prev => ({
        ...prev,
        error: `Errore nella sottoscrizione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        isLoading: false
      }));
      return false;
    }
  }, [userId, registration, state.permission, requestPermission]);

  // ========================================
  // DISSOTTOSCRIZIONE NOTIFICHE PUSH
  // ========================================

  const unsubscribeFromPushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      if (!registration) {
        throw new Error('Service Worker non registrato');
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Ottieni sottoscrizione esistente
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Annulla sottoscrizione
        await subscription.unsubscribe();
        
        // Rimuovi dal database
        if (userId) {
          await pushNotificationService.unsubscribeUser(userId, subscription.endpoint);
        }
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }));

      console.log('✅ Successfully unsubscribed from push notifications');
      return true;

    } catch (error) {
      console.error('❌ Error unsubscribing from push notifications:', error);
      setState(prev => ({
        ...prev,
        error: `Errore nella dissottoscrizione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        isLoading: false
      }));
      return false;
    }
  }, [registration, userId]);

  // ========================================
  // INVIO NOTIFICHE DI TEST
  // ========================================

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.isSubscribed) {
        throw new Error('Non sei sottoscritto alle notifiche push');
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Invia notifica di test
      await pushNotificationService.sendPushNotification(userId!, {
        title: 'Test Notifica Push',
        body: 'Questa è una notifica di test da Urbanova AI! 🎉',
        icon: '/favicon.ico',
        tag: 'test-notification',
        data: {
          type: 'test',
          timestamp: Date.now()
        },
        actions: [
          {
            action: 'view',
            title: 'Visualizza',
            icon: '/icons/eye.png'
          },
          {
            action: 'dismiss',
            title: 'Ignora',
            icon: '/icons/x.png'
          }
        ]
      });

      setState(prev => ({ ...prev, isLoading: false }));
      console.log('✅ Test notification sent successfully');
      return true;

    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      setState(prev => ({
        ...prev,
        error: `Errore nell'invio notifica test: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        isLoading: false
      }));
      return false;
    }
  }, [state.isSubscribed, userId]);

  // ========================================
  // GESTIONE SERVICE WORKER
  // ========================================

  const updateServiceWorker = useCallback(async (): Promise<void> => {
    try {
      if (!registration) return;

      // Controlla aggiornamenti
      await registration.update();
      
      // Forza aggiornamento se disponibile
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      console.log('✅ Service Worker updated');
    } catch (error) {
      console.error('❌ Error updating Service Worker:', error);
    }
  }, [registration]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      if (!registration) return;

      // Invia messaggio al Service Worker per pulire la cache
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('✅ Cache cleared successfully');
        }
      };

      registration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );

    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }, [registration]);

  // ========================================
  // UTILITY E HELPERS
  // ========================================

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // ========================================
  // RESET ERRORI
  // ========================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ========================================
  // STATO COMPUTATO
  // ========================================

  const canSubscribe = state.isSupported && state.permission === 'granted' && !state.isSubscribed;
  const canUnsubscribe = state.isSupported && state.isSubscribed;
  const canSendTest = state.isSupported && state.isSubscribed && !state.isLoading;

  return {
    // Stato
    ...state,
    
    // Azioni
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    sendTestNotification,
    updateServiceWorker,
    clearCache,
    clearError,
    
    // Computed
    canSubscribe,
    canUnsubscribe,
    canSendTest,
    
    // Service Worker
    registration
  };
};
