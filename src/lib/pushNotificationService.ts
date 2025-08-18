import { prisma } from './database';
import { notificationService } from './notificationService';

interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date;
}

interface PushMessage {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private webSocketConnections: Map<string, WebSocket> = new Map();

  private constructor() {}

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // ========================================
  // GESTIONE SOTTOSCRIZIONI PUSH
  // ========================================

  async subscribeUser(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      // Salva la sottoscrizione nel database
      await prisma.pushSubscription.upsert({
        where: { 
          userId_endpoint: {
            userId,
            endpoint: subscription.endpoint
          }
        },
        update: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          isActive: true,
          lastUsedAt: new Date()
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          isActive: true
        }
      });

      console.log(`✅ User ${userId} subscribed to push notifications`);
    } catch (error) {
      console.error('Error subscribing user to push notifications:', error);
      throw error;
    }
  }

  async unsubscribeUser(userId: string, endpoint: string): Promise<void> {
    try {
      await prisma.pushSubscription.updateMany({
        where: {
          userId,
          endpoint
        },
        data: {
          isActive: false,
          lastUsedAt: new Date()
        }
      });

      console.log(`✅ User ${userId} unsubscribed from push notifications`);
    } catch (error) {
      console.error('Error unsubscribing user from push notifications:', error);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: { lastUsedAt: 'desc' }
      });

      return subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.userId,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        isActive: sub.isActive,
        createdAt: sub.createdAt,
        lastUsedAt: sub.lastUsedAt
      }));
    } catch (error) {
      console.error('Error fetching user push subscriptions:', error);
      throw error;
    }
  }

  // ========================================
  // INVIO NOTIFICHE PUSH
  // ========================================

  async sendPushNotification(userId: string, message: PushMessage): Promise<void> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      
      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      // Invia a tutte le sottoscrizioni attive dell'utente
      const promises = subscriptions.map(subscription => 
        this.sendToSubscription(subscription, message)
      );

      await Promise.allSettled(promises);

      // Traccia l'invio
      await this.trackPushDelivery(userId, message, subscriptions.length);
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendPushNotificationToMultipleUsers(userIds: string[], message: PushMessage): Promise<void> {
    try {
      const promises = userIds.map(userId => 
        this.sendPushNotification(userId, message)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error sending push notification to multiple users:', error);
      throw error;
    }
  }

  async sendSystemPushNotification(message: PushMessage): Promise<void> {
    try {
      // Ottieni tutti gli utenti attivi con sottoscrizioni push
      const activeSubscriptions = await prisma.pushSubscription.findMany({
        where: { isActive: true },
        include: { user: true }
      });

      // Raggruppa per utente
      const userSubscriptions = new Map<string, PushSubscription[]>();
      activeSubscriptions.forEach(sub => {
        if (!userSubscriptions.has(sub.userId)) {
          userSubscriptions.set(sub.userId, []);
        }
        userSubscriptions.get(sub.userId)!.push(sub);
      });

      // Invia a ogni utente
      const promises = Array.from(userSubscriptions.keys()).map(userId =>
        this.sendPushNotification(userId, message)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error sending system push notification:', error);
      throw error;
    }
  }

  private async sendToSubscription(subscription: PushSubscription, message: PushMessage): Promise<void> {
    try {
      // In produzione, usa un servizio come Firebase Cloud Messaging o OneSignal
      // Per ora, simuliamo l'invio
      
      const payload = {
        title: message.title,
        body: message.body,
        icon: message.icon || '/favicon.ico',
        badge: message.badge || '/badge.png',
        image: message.image,
        tag: message.tag || 'urbanova-notification',
        data: message.data || {},
        actions: message.actions || [],
        requireInteraction: message.requireInteraction || false,
        silent: message.silent || false,
        timestamp: message.timestamp || Date.now()
      };

      // Simula l'invio della notifica push
      console.log(`📱 Sending push notification to ${subscription.endpoint}:`, payload);

      // Aggiorna timestamp ultimo utilizzo
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { lastUsedAt: new Date() }
      });

      // In produzione, qui invieresti realmente la notifica push
      // await this.sendToPushService(subscription, payload);

    } catch (error) {
      console.error('Error sending to subscription:', error);
      
      // Marca la sottoscrizione come inattiva se fallisce
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { isActive: false }
      });
    }
  }

  // ========================================
  // NOTIFICHE IN APP IN TEMPO REALE
  // ========================================

  async sendInAppNotification(userId: string, message: PushMessage): Promise<void> {
    try {
      // Crea notifica nel database
      await notificationService.createNotification({
        userId,
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: message.title,
        message: message.body,
        data: message.data
      });

      // Invia notifica in tempo reale via WebSocket se connesso
      this.sendWebSocketNotification(userId, {
        type: 'in_app_notification',
        data: message
      });

    } catch (error) {
      console.error('Error sending in-app notification:', error);
      throw error;
    }
  }

  // ========================================
  // WEBSOCKET PER NOTIFICHE REAL-TIME
  // ========================================

  connectWebSocket(userId: string, ws: WebSocket): void {
    // Chiudi connessione esistente se presente
    if (this.webSocketConnections.has(userId)) {
      this.webSocketConnections.get(userId)?.close();
    }

    this.webSocketConnections.set(userId, ws);

    ws.onopen = () => {
      console.log(`🔌 WebSocket connected for user ${userId}`);
      
      // Invia messaggio di conferma
      ws.send(JSON.stringify({
        type: 'connection_established',
        data: { userId, timestamp: Date.now() }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(userId, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log(`🔌 WebSocket disconnected for user ${userId}`);
      this.webSocketConnections.delete(userId);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
      this.webSocketConnections.delete(userId);
    };
  }

  private handleWebSocketMessage(userId: string, message: any): void {
    switch (message.type) {
      case 'ping':
        // Rispondi al ping
        this.sendWebSocketNotification(userId, {
          type: 'pong',
          data: { timestamp: Date.now() }
        });
        break;

      case 'notification_ack':
        // Conferma ricezione notifica
        this.acknowledgeNotification(userId, message.data.notificationId);
        break;

      case 'subscription_update':
        // Aggiorna preferenze notifiche
        this.updateNotificationPreferences(userId, message.data.preferences);
        break;

      default:
        console.log(`Unknown WebSocket message type: ${message.type}`);
    }
  }

  private sendWebSocketNotification(userId: string, notification: any): void {
    const ws = this.webSocketConnections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification));
    }
  }

  // ========================================
  // NOTIFICHE AUTOMATICHE E SCHEDULATE
  // ========================================

  async scheduleNotification(userId: string, message: PushMessage, sendAt: Date): Promise<string> {
    try {
      const scheduledNotification = await prisma.scheduledNotification.create({
        data: {
          userId,
          title: message.title,
          message: message.body,
          data: message.data,
          scheduledFor: sendAt,
          status: 'PENDING'
        }
      });

      // In produzione, usa un job scheduler come Bull o Agenda
      // Per ora, simuliamo la schedulazione
      setTimeout(async () => {
        await this.sendPushNotification(userId, message);
        await this.markScheduledNotificationSent(scheduledNotification.id);
      }, sendAt.getTime() - Date.now());

      return scheduledNotification.id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await prisma.scheduledNotification.update({
        where: { id: notificationId },
        data: { status: 'CANCELLED' }
      });
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
      throw error;
    }
  }

  // ========================================
  // ANALYTICS E TRACKING
  // ========================================

  private async trackPushDelivery(userId: string, message: PushMessage, subscriptionCount: number): Promise<void> {
    try {
      await prisma.pushNotificationDelivery.create({
        data: {
          userId,
          title: message.title,
          message: message.body,
          subscriptionCount,
          deliveredAt: new Date(),
          status: 'SENT'
        }
      });
    } catch (error) {
      console.error('Error tracking push delivery:', error);
    }
  }

  async getPushNotificationStats(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalSent: number;
    totalDelivered: number;
    deliveryRate: number;
    averageSubscriptions: number;
  }> {
    try {
      const startDate = this.getStartDate(period);

      const [totalSent, totalDelivered, averageSubscriptions] = await Promise.all([
        prisma.pushNotificationDelivery.count({
          where: {
            userId,
            deliveredAt: { gte: startDate }
          }
        }),
        prisma.pushNotificationDelivery.count({
          where: {
            userId,
            deliveredAt: { gte: startDate },
            status: 'DELIVERED'
          }
        }),
        prisma.pushSubscription.aggregate({
          where: {
            userId,
            isActive: true
          },
          _avg: {
            _count: true
          }
        })
      ]);

      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

      return {
        totalSent,
        totalDelivered,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        averageSubscriptions: Math.round(averageSubscriptions._avg._count || 0)
      };
    } catch (error) {
      console.error('Error fetching push notification stats:', error);
      throw error;
    }
  }

  // ========================================
  // UTILITY E HELPERS
  // ========================================

  private getStartDate(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.getFullYear(), now.getMonth(), diff);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  private async acknowledgeNotification(userId: string, notificationId: string): Promise<void> {
    try {
      await notificationService.markAsRead(notificationId, userId);
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  }

  private async updateNotificationPreferences(userId: string, preferences: any): Promise<void> {
    try {
      await notificationService.updateNotificationPreferences(userId, preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  private async markScheduledNotificationSent(notificationId: string): Promise<void> {
    try {
      await prisma.scheduledNotification.update({
        where: { id: notificationId },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error marking scheduled notification as sent:', error);
    }
  }

  // ========================================
  // SERVICE WORKER SUPPORT
  // ========================================

  async registerServiceWorker(userId: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        console.log(`✅ Service Worker registered for user ${userId}:`, registration);

        // Richiedi permessi per notifiche
        if ('Notification' in window && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          console.log(`Notification permission: ${permission}`);
        }
      }
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  }

  // ========================================
  // PULIZIA E MANUTENZIONE
  // ========================================

  async cleanupInactiveSubscriptions(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const result = await prisma.pushSubscription.updateMany({
        where: {
          lastUsedAt: { lt: thirtyDaysAgo },
          isActive: true
        },
        data: { isActive: false }
      });

      if (result.count > 0) {
        console.log(`🧹 Cleaned up ${result.count} inactive push subscriptions`);
      }

      return result.count;
    } catch (error) {
      console.error('Error cleaning up inactive subscriptions:', error);
      return 0;
    }
  }

  async cleanupOldDeliveryLogs(): Promise<number> {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const result = await prisma.pushNotificationDelivery.deleteMany({
        where: {
          deliveredAt: { lt: ninetyDaysAgo }
        }
      });

      if (result.count > 0) {
        console.log(`🧹 Cleaned up ${result.count} old delivery logs`);
      }

      return result.count;
    } catch (error) {
      console.error('Error cleaning up old delivery logs:', error);
      return 0;
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
