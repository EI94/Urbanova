import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth } from './firebase';
import { useState, useEffect, useCallback } from 'react';

/**
 * Servizio per gestire le notifiche push mobile
 * Utilizza Firebase Cloud Messaging (FCM) per inviare notifiche ai dispositivi
 */

// Configurazione VAPID key (da configurare in Firebase Console)
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, string>;
  click_action?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  sound?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface DeviceToken {
  userId: string;
  token: string;
  deviceType: 'web' | 'android' | 'ios';
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
  };
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private messaging: any = null;
  private isSupported = false;

  private constructor() {
    // Verifica se il browser supporta le notifiche push
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      this.isSupported = true;
      try {
        this.messaging = getMessaging();
      } catch (error) {
        console.error('❌ [PushNotification] Errore inizializzazione messaging:', error);
        this.isSupported = false;
      }
    }
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Verifica se le notifiche push sono supportate
   */
  public isPushSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Richiede il permesso per le notifiche push
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifiche push non supportate');
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 [PushNotification] Permesso notifiche:', permission);
      return permission;
    } catch (error) {
      console.error('❌ [PushNotification] Errore richiesta permesso:', error);
      throw error;
    }
  }

  /**
   * Ottiene il token FCM per il dispositivo corrente
   */
  public async getToken(): Promise<string | null> {
    if (!this.isSupported || !this.messaging) {
      console.warn('⚠️ [PushNotification] Messaging non supportato');
      return null;
    }

    try {
      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        console.log('🔔 [PushNotification] Token FCM ottenuto:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.warn('⚠️ [PushNotification] Nessun token FCM disponibile');
        return null;
      }
    } catch (error) {
      console.error('❌ [PushNotification] Errore ottenimento token:', error);
      return null;
    }
  }

  /**
   * Registra il token del dispositivo per un utente
   */
  public async registerDeviceToken(userId: string, deviceInfo?: any): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        return false;
      }

      // Salva il token nel database
      const response = await fetch('/api/notifications/push/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          token,
          deviceType: 'web',
          deviceInfo: deviceInfo || {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        })
      });

      if (response.ok) {
        console.log('✅ [PushNotification] Token registrato per utente:', userId);
        return true;
      } else {
        console.error('❌ [PushNotification] Errore registrazione token:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ [PushNotification] Errore registrazione token:', error);
      return false;
    }
  }

  /**
   * Rimuove il token del dispositivo
   */
  public async unregisterDeviceToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        return true; // Nessun token da rimuovere
      }

      const response = await fetch('/api/notifications/push/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        console.log('✅ [PushNotification] Token rimosso');
        return true;
      } else {
        console.error('❌ [PushNotification] Errore rimozione token:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ [PushNotification] Errore rimozione token:', error);
      return false;
    }
  }

  /**
   * Configura il listener per i messaggi in arrivo
   */
  public setupMessageListener(callback: (payload: any) => void): void {
    if (!this.isSupported || !this.messaging) {
      console.warn('⚠️ [PushNotification] Messaging non supportato per listener');
      return;
    }

    try {
      onMessage(this.messaging, (payload) => {
        console.log('🔔 [PushNotification] Messaggio ricevuto:', payload);
        callback(payload);
      });
    } catch (error) {
      console.error('❌ [PushNotification] Errore setup listener:', error);
    }
  }

  /**
   * Gestisce il click su una notifica
   */
  public handleNotificationClick(notification: any): void {
    try {
      // Chiudi la notifica
      notification.close();

      // Naviga all'URL specificato
      if (notification.data && notification.data.url) {
        window.location.href = notification.data.url;
      } else if (notification.data && notification.data.action) {
        // Gestisci azioni specifiche
        this.handleNotificationAction(notification.data.action, notification.data);
      }
    } catch (error) {
      console.error('❌ [PushNotification] Errore gestione click notifica:', error);
    }
  }

  /**
   * Gestisce le azioni delle notifiche
   */
  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'view_project':
        window.location.href = `/dashboard/projects/${data.projectId}`;
        break;
      case 'view_analysis':
        window.location.href = `/dashboard/feasibility-analysis?projectId=${data.projectId}`;
        break;
      case 'view_business_plan':
        window.location.href = `/dashboard/business-plan?projectId=${data.projectId}`;
        break;
      case 'view_notifications':
        window.location.href = '/dashboard/notifications';
        break;
      default:
        console.log('🔔 [PushNotification] Azione non gestita:', action);
    }
  }

  /**
   * Ottiene il token di autenticazione Firebase
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('❌ [PushNotification] Errore ottenimento auth token:', error);
      return null;
    }
  }

  /**
   * Mostra una notifica locale (fallback)
   */
  public showLocalNotification(payload: PushNotificationPayload): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.warn('⚠️ [PushNotification] Notifiche locali non disponibili');
      return;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        image: payload.image,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        vibrate: payload.vibrate || [200, 100, 200],
        sound: payload.sound,
        data: payload.data
      });

      // Gestisce il click sulla notifica
      notification.onclick = () => {
        this.handleNotificationClick(notification);
      };

      // Auto-chiudi dopo 5 secondi
      setTimeout(() => {
        notification.close();
      }, 5000);

      console.log('🔔 [PushNotification] Notifica locale mostrata:', payload.title);
    } catch (error) {
      console.error('❌ [PushNotification] Errore notifica locale:', error);
    }
  }

  /**
   * Inizializza il servizio push per un utente
   */
  public async initializeForUser(userId: string): Promise<boolean> {
    try {
      // Verifica se le notifiche sono supportate
      if (!this.isPushSupported()) {
        console.log('ℹ️ [PushNotification] Notifiche push non supportate');
        return false;
      }

      // Richiedi permesso
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('ℹ️ [PushNotification] Permesso notifiche negato');
        return false;
      }

      // Registra il token
      const registered = await this.registerDeviceToken(userId);
      if (!registered) {
        console.error('❌ [PushNotification] Registrazione token fallita');
        return false;
      }

      // Configura il listener per i messaggi
      this.setupMessageListener((payload) => {
        console.log('🔔 [PushNotification] Messaggio ricevuto in foreground:', payload);
        
        // Mostra notifica locale se l'app è in foreground
        this.showLocalNotification({
          title: payload.notification?.title || 'Nuova notifica',
          body: payload.notification?.body || 'Hai ricevuto una nuova notifica',
          icon: payload.notification?.icon,
          data: payload.data
        });
      });

      console.log('✅ [PushNotification] Servizio inizializzato per utente:', userId);
      return true;
    } catch (error) {
      console.error('❌ [PushNotification] Errore inizializzazione:', error);
      return false;
    }
  }

  /**
   * Pulisce i token quando l'utente fa logout
   */
  public async cleanup(): Promise<void> {
    try {
      await this.unregisterDeviceToken();
      console.log('✅ [PushNotification] Cleanup completato');
    } catch (error) {
      console.error('❌ [PushNotification] Errore cleanup:', error);
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();

// Hook React per le notifiche push
export function usePushNotifications(userId?: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsSupported(pushNotificationService.isPushSupported());
    setPermission(Notification.permission);
  }, []);

  const initialize = useCallback(async () => {
    if (!userId) return false;
    
    const success = await pushNotificationService.initializeForUser(userId);
    setIsInitialized(success);
    setPermission(Notification.permission);
    return success;
  }, [userId]);

  const cleanup = useCallback(async () => {
    await pushNotificationService.cleanup();
    setIsInitialized(false);
  }, []);

  return {
    isSupported,
    permission,
    isInitialized,
    initialize,
    cleanup
  };
}
