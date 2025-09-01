import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc,
  getDocs,
  limit,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

// ===== INTERFACES =====
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  category: 'design' | 'collaboration' | 'approval' | 'system' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived';
  isActionable: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata: {
    designId?: string;
    projectId?: string;
    commentId?: string;
    versionId?: string;
    workflowId?: string;
    sessionId?: string;
    toolId?: string;
    fileId?: string;
    [key: string]: any;
  };
  expiresAt?: Timestamp;
  readAt?: Timestamp;
  archivedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags: string[];
  mentions: string[];
  isSilent: boolean;
  isPersistent: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: Notification['type'];
  category: Notification['category'];
  priority: Notification['priority'];
  isActionable: boolean;
  actionText?: string;
  metadata: Record<string, any>;
  tags: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  category: Notification['category'];
  type: Notification['type'];
  priority: Notification['priority'];
  isEnabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  lastUpdated: Timestamp;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  isActive: boolean;
  priority: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NotificationCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface NotificationAction {
  type: 'create_notification' | 'send_email' | 'send_push' | 'send_sms' | 'webhook';
  config: Record<string, any>;
  delay?: number; // in seconds
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'webhook';
  config: Record<string, any>;
  isActive: boolean;
  lastUsed: Timestamp;
  successRate: number;
  errorCount: number;
}

// ===== NOTIFICATION SERVICE =====
export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ===== NOTIFICATION MANAGEMENT =====
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<string> {
    try {
      const notificationData = {
        ...notification,
        status: 'unread',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async updateNotification(notificationId: string, updates: Partial<Notification>): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      throw new Error('Failed to update notification');
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

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'read',
        readAt: serverTimestamp(),
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
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('status', '==', 'unread')
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'read',
          readAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async archiveNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'archived',
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw new Error('Failed to archive notification');
    }
  }

  async getNotifications(
    userId: string,
    options?: {
      status?: Notification['status'];
      category?: Notification['category'];
      type?: Notification['type'];
      priority?: Notification['priority'];
      limit?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    try {
      let q = query(collection(db, 'notifications'), where('userId', '==', userId));

      if (options?.status) {
        q = query(q, where('status', '==', options.status));
      }

      if (options?.category) {
        q = query(q, where('category', '==', options.category));
      }

      if (options?.type) {
        q = query(q, where('type', '==', options.type));
      }

      if (options?.priority) {
        q = query(q, where('priority', '==', options.priority));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];

      snapshot.forEach(doc => {
        const notification = { id: doc.id, ...doc.data() } as Notification;

        // Filter by unread if requested
        if (options?.unreadOnly && notification.status !== 'unread') {
          return;
        }

        notifications.push(notification);
      });

      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  getNotificationsRealtime(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const notifications: Notification[] = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification);
      });
      callback(notifications);
    });

    return unsubscribe;
  }

  // ===== NOTIFICATION TEMPLATES =====
  async createTemplate(
    template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const templateData = {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'notificationTemplates'), templateData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create notification template');
    }
  }

  async updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<void> {
    try {
      const templateRef = doc(db, 'notificationTemplates', templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update notification template');
    }
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const q = query(
        collection(db, 'notificationTemplates'),
        where('isActive', '==', true),
        orderBy('name')
      );

      const snapshot = await getDocs(q);
      const templates: NotificationTemplate[] = [];
      snapshot.forEach(doc => {
        templates.push({ id: doc.id, ...doc.data() } as NotificationTemplate);
      });
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  // ===== NOTIFICATION PREFERENCES =====
  async updatePreference(
    preference: Omit<NotificationPreference, 'id' | 'lastUpdated'>
  ): Promise<string> {
    try {
      const preferenceData = {
        ...preference,
        lastUpdated: serverTimestamp(),
      };

      // Check if preference already exists
      const existingQ = query(
        collection(db, 'notificationPreferences'),
        where('userId', '==', preference.userId),
        where('category', '==', preference.category),
        where('type', '==', preference.type),
        where('priority', '==', preference.priority)
      );

      const existingSnapshot = await getDocs(existingQ);

      if (!existingSnapshot.empty) {
        // Update existing preference
        const existingDoc = existingSnapshot.docs[0];
        await updateDoc(existingDoc.ref, preferenceData);
        return existingDoc.id;
      } else {
        // Create new preference
        const docRef = await addDoc(collection(db, 'notificationPreferences'), preferenceData);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      throw new Error('Failed to update notification preference');
    }
  }

  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const q = query(collection(db, 'notificationPreferences'), where('userId', '==', userId));

      const snapshot = await getDocs(q);
      const preferences: NotificationPreference[] = [];
      snapshot.forEach(doc => {
        preferences.push({ id: doc.id, ...doc.data() } as NotificationPreference);
      });
      return preferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return [];
    }
  }

  // ===== NOTIFICATION RULES =====
  async createRule(
    rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const ruleData = {
        ...rule,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'notificationRules'), ruleData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating rule:', error);
      throw new Error('Failed to create notification rule');
    }
  }

  async updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<void> {
    try {
      const ruleRef = doc(db, 'notificationRules', ruleId);
      await updateDoc(ruleRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      throw new Error('Failed to update notification rule');
    }
  }

  async getActiveRules(): Promise<NotificationRule[]> {
    try {
      const q = query(
        collection(db, 'notificationRules'),
        where('isActive', '==', true),
        orderBy('priority', 'desc')
      );

      const snapshot = await getDocs(q);
      const rules: NotificationRule[] = [];
      snapshot.forEach(doc => {
        rules.push({ id: doc.id, ...doc.data() } as NotificationRule);
      });
      return rules;
    } catch (error) {
      console.error('Error getting active rules:', error);
      return [];
    }
  }

  // ===== NOTIFICATION CHANNELS =====
  async createChannel(
    channel: Omit<NotificationChannel, 'id' | 'lastUsed' | 'successRate' | 'errorCount'>
  ): Promise<string> {
    try {
      const channelData = {
        ...channel,
        lastUsed: serverTimestamp(),
        successRate: 100,
        errorCount: 0,
      };

      const docRef = await addDoc(collection(db, 'notificationChannels'), channelData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw new Error('Failed to create notification channel');
    }
  }

  async updateChannelStats(channelId: string, success: boolean): Promise<void> {
    try {
      const channelRef = doc(db, 'notificationChannels', channelId);
      const channelDoc = await getDoc(channelRef);

      if (!channelDoc.exists()) {
        throw new Error('Channel not found');
      }

      const channel = channelDoc.data() as NotificationChannel;
      const totalAttempts = channel.successRate + channel.errorCount;
      const newSuccessRate = success ? channel.successRate + 1 : channel.successRate;
      const newErrorCount = success ? channel.errorCount : channel.errorCount + 1;
      const newSuccessRatePercentage =
        totalAttempts > 0 ? (newSuccessRate / (totalAttempts + 1)) * 100 : 100;

      await updateDoc(channelRef, {
        lastUsed: serverTimestamp(),
        successRate: newSuccessRate,
        errorCount: newErrorCount,
        successRate: newSuccessRatePercentage,
      });
    } catch (error) {
      console.error('Error updating channel stats:', error);
      throw new Error('Failed to update channel stats');
    }
  }

  // ===== UTILITY METHODS =====
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('status', '==', 'unread')
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const notifications = await this.getNotifications(userId);

      const stats = {
        total: notifications.length,
        unread: 0,
        read: 0,
        archived: 0,
        byCategory: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      };

      notifications.forEach(notification => {
        // Count by status
        stats[notification.status]++;

        // Count by category
        stats.byCategory[notification.category] =
          (stats.byCategory[notification.category] || 0) + 1;

        // Count by type
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;

        // Count by priority
        stats.byPriority[notification.priority] =
          (stats.byPriority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
        byCategory: {},
        byType: {},
        byPriority: {},
      };
    }
  }

  async searchNotifications(userId: string, searchTerm: string): Promise<Notification[]> {
    try {
      const notifications = await this.getNotifications(userId);

      return notifications.filter(
        notification =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching notifications:', error);
      return [];
    }
  }

  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const now = Timestamp.now();
      const q = query(collection(db, 'notifications'), where('expiresAt', '<', now));

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return snapshot.size;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }
}

export default NotificationService.getInstance();
