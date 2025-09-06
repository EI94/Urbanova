import {doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  Timestamp } from 'firebase/firestore';

import { db } from './firebase';
import { safeCollection } from './firebaseUtils';

// Tipi per le notifiche
export interface Notification {
  id: string;
  userId: string;
  type: 'SYSTEM' | 'PROJECT' | 'TASK' | 'MESSAGE' | 'ALERT' | 'SUCCESS' | 'WARNING' | 'ERROR';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  isArchived?: boolean;
  expiresAt?: Date | null;
  actions?: Array<{
    type: string;
    label: string;
    url?: string;
    data?: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  dismissed: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

class FirebaseNotificationService {
  private static instance: FirebaseNotificationService;

  private constructor() {}

  public static getInstance(): FirebaseNotificationService {
    if (!FirebaseNotificationService.instance) {
      FirebaseNotificationService.instance = new FirebaseNotificationService();
    }
    return FirebaseNotificationService.instance;
  }

  // ========================================
  // OPERAZIONI CRUD NOTIFICHE
  // ========================================

  async createNotification(data: {
    userId: string;
    type: Notification['type'];
    priority: Notification['priority'];
    title: string;
    message: string;
    data?: any;
    expiresAt?: Date;
    actions?: Notification['actions'];
  }): Promise<Notification> {
    try {
      const notificationData = {
        userId: data.userId,
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        data: data.data || {},
        expiresAt: data.expiresAt || null,
        actions: data.actions || [],
        isRead: false,
        isArchived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(safeCollection('notifications'), notificationData);

      const notification: Notification = {
        id: docRef.id,
        ...notificationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Notification;

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async getNotifications(
    userId: string,
    options: {
      limit?: number;
      unreadOnly?: boolean;
      type?: Notification['type'];
      priority?: Notification['priority'];
    } = {}
  ): Promise<Notification[]> {
    try {
      const { limit = 50, unreadOnly = false, type, priority } = options;

      let q = query(
        safeCollection('notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (unreadOnly) {
        q = query(q, where('isRead', '==', false));
      }

      if (type) {
        q = query(q, where('type', '==', type));
      }

      if (priority) {
        q = query(q, where('priority', '==', priority));
      }

      if (limit > 0) {
        q = query(q, firestoreLimit(limit));
      }

      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || null,
        } as Notification);
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        safeCollection('notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);

      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          isRead: true,
          updatedAt: serverTimestamp(),
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async archiveNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isArchived: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw new Error('Failed to archive notification');
    }
  }

  // ========================================
  // STATISTICHE E CONTATORI
  // ========================================

  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      // Total count
      const totalQuery = query(safeCollection('notifications'), where('userId', '==', userId));
      const totalSnapshot = await getDocs(totalQuery);
      const total = totalSnapshot.size;

      // Unread count
      const unreadQuery = query(
        safeCollection('notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const unreadSnapshot = await getDocs(unreadQuery);
      const unread = unreadSnapshot.size;

      // Read count
      const readQuery = query(
        safeCollection('notifications'),
        where('userId', '==', userId),
        where('isRead', '==', true)
      );
      const readSnapshot = await getDocs(readQuery);
      const read = readSnapshot.size;

      // Dismissed count
      const dismissedQuery = query(
        safeCollection('notifications'),
        where('userId', '==', userId),
        where('isDismissed', '==', true)
      );
      const dismissedSnapshot = await getDocs(dismissedQuery);
      const dismissed = dismissedSnapshot.size;

      // Count by type
      const typeQuery = query(safeCollection('notifications'), where('userId', '==', userId));
      const typeSnapshot = await getDocs(typeQuery);
      const byType: Record<string, number> = {};
      typeSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Count by priority
      const priorityQuery = query(safeCollection('notifications'), where('userId', '==', userId));
      const prioritySnapshot = await getDocs(priorityQuery);
      const byPriority: Record<string, number> = {};
      prioritySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const priority = data.priority || 'unknown';
        byPriority[priority] = (byPriority[priority] || 0) + 1;
      });

      return {
        total,
        unread,
        read,
        dismissed,
        byType,
        byPriority,
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        total: 0,
        unread: 0,
        read: 0,
        dismissed: 0,
        byType: {},
        byPriority: {},
      };
    }
  }

  // ========================================
  // PREFERENZE NOTIFICHE
  // ========================================

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const prefRef = doc(db, 'notificationPreferences', userId);
      const prefSnap = await getDoc(prefRef);

      if (prefSnap.exists()) {
        const data = prefSnap.data();
        return {
          id: prefSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as NotificationPreferences;
      }

      return null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const prefRef = doc(db, 'notificationPreferences', userId);
      await updateDoc(prefRef, {
        ...preferences,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const defaultPreferences = {
        userId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        timezone: 'Europe/Rome',
        preferences: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const prefRef = doc(db, 'notificationPreferences', userId);
      await updateDoc(prefRef, defaultPreferences);

      return {
        id: userId,
        ...defaultPreferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as NotificationPreferences;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      throw new Error('Failed to create default preferences');
    }
  }

  // ========================================
  // NOTIFICHE DI SISTEMA
  // ========================================

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'SYSTEM',
      priority: 'MEDIUM',
      title,
      message,
      data,
    });
  }

  async createProjectNotification(
    userId: string,
    projectId: string,
    projectName: string,
    action: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'PROJECT',
      priority: 'MEDIUM',
      title: `Progetto: ${action}`,
      message: `${action} per il progetto "${projectName}"`,
      data: { projectId, projectName, action },
    });
  }

  async createTaskNotification(
    userId: string,
    taskId: string,
    taskName: string,
    action: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'TASK',
      priority: 'MEDIUM',
      title: `Task: ${action}`,
      message: `${action} per il task "${taskName}"`,
      data: { taskId, taskName, action },
    });
  }

  async createWelcomeNotification(userId: string): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'SYSTEM',
      priority: 'HIGH',
      title: 'Benvenuto in Urbanova!',
      message:
        'Il tuo account è stato creato con successo. Inizia a esplorare le funzionalità della piattaforma.',
      data: { action: 'welcome' },
    });
  }
}

export const firebaseNotificationService = FirebaseNotificationService.getInstance();
