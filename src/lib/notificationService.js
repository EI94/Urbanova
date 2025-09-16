'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.NotificationService = void 0;
const firestore_1 = require('firebase/firestore');
const firebase_1 = require('@/lib/firebase');
// ===== NOTIFICATION SERVICE =====
class NotificationService {
  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  // ===== NOTIFICATION MANAGEMENT =====
  async createNotification(notification) {
    try {
      const notificationData = {
        ...notification,
        status: 'unread',
        createdAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      };
      const docRef = await (0, firestore_1.addDoc)(
        (0, firestore_1.collection)(firebase_1.db, 'notifications'),
        notificationData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }
  async updateNotification(notificationId, updates) {
    try {
      const notificationRef = (0, firestore_1.doc)(firebase_1.db, 'notifications', notificationId);
      await (0, firestore_1.updateDoc)(notificationRef, {
        ...updates,
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      throw new Error('Failed to update notification');
    }
  }
  async deleteNotification(notificationId) {
    try {
      await (0, firestore_1.deleteDoc)(
        (0, firestore_1.doc)(firebase_1.db, 'notifications', notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }
  async markAsRead(notificationId) {
    try {
      const notificationRef = (0, firestore_1.doc)(firebase_1.db, 'notifications', notificationId);
      await (0, firestore_1.updateDoc)(notificationRef, {
        status: 'read',
        readAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }
  async markAllAsRead(userId) {
    try {
      const q = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notifications'),
        (0, firestore_1.where)('userId', '==', userId),
        (0, firestore_1.where)('status', '==', 'unread')
      );
      const snapshot = await (0, firestore_1.getDocs)(q);
      const batch = (0, firestore_1.writeBatch)(firebase_1.db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'read',
          readAt: (0, firestore_1.serverTimestamp)(),
          updatedAt: (0, firestore_1.serverTimestamp)(),
        });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }
  async archiveNotification(notificationId) {
    try {
      const notificationRef = (0, firestore_1.doc)(firebase_1.db, 'notifications', notificationId);
      await (0, firestore_1.updateDoc)(notificationRef, {
        status: 'archived',
        archivedAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw new Error('Failed to archive notification');
    }
  }
  async getNotifications(userId, options) {
    try {
      let q = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notifications'),
        (0, firestore_1.where)('userId', '==', userId)
      );
      if (options?.status) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('status', '==', options.status));
      }
      if (options?.category) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('category', '==', options.category));
      }
      if (options?.type) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('type', '==', options.type));
      }
      if (options?.priority) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('priority', '==', options.priority));
      }
      q = (0, firestore_1.query)(q, (0, firestore_1.orderBy)('createdAt', 'desc'));
      if (options?.limit) {
        q = (0, firestore_1.query)(q, (0, firestore_1.limit)(options.limit));
      }
      const snapshot = await (0, firestore_1.getDocs)(q);
      const notifications = [];
      snapshot.forEach(doc => {
        const notification = { id: doc.id, ...doc.data() };
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
  getNotificationsRealtime(userId, callback) {
    const q = (0, firestore_1.query)(
      (0, firestore_1.collection)(firebase_1.db, 'notifications'),
      (0, firestore_1.where)('userId', '==', userId),
      (0, firestore_1.orderBy)('createdAt', 'desc')
    );
    // CHIRURGICO: Disabilitato onSnapshot temporaneamente per evitare 400 error e loop infiniti
    // const unsubscribe = (0, firestore_1.onSnapshot)(q, snapshot => {
    //   const notifications = [];
    //   snapshot.forEach(doc => {
    //     notifications.push({ id: doc.id, ...doc.data() });
    //   });
    //   callback(notifications);
    // });
    
    // CHIRURGICO: Callback vuoto per evitare 400 error e loop infiniti
    const unsubscribe = () => {};
    return unsubscribe;
  }
  // ===== NOTIFICATION TEMPLATES =====
  async createTemplate(template) {
    try {
      const templateData = {
        ...template,
        createdAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      };
      const docRef = await (0, firestore_1.addDoc)(
        (0, firestore_1.collection)(firebase_1.db, 'notificationTemplates'),
        templateData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new Error('Failed to create notification template');
    }
  }
  async updateTemplate(templateId, updates) {
    try {
      const templateRef = (0, firestore_1.doc)(firebase_1.db, 'notificationTemplates', templateId);
      await (0, firestore_1.updateDoc)(templateRef, {
        ...updates,
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update notification template');
    }
  }
  async getTemplates() {
    try {
      const q = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notificationTemplates'),
        (0, firestore_1.where)('isActive', '==', true),
        (0, firestore_1.orderBy)('name')
      );
      const snapshot = await (0, firestore_1.getDocs)(q);
      const templates = [];
      snapshot.forEach(doc => {
        templates.push({ id: doc.id, ...doc.data() });
      });
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }
  // ===== NOTIFICATION PREFERENCES =====
  async updatePreference(preference) {
    try {
      const preferenceData = {
        ...preference,
        lastUpdated: (0, firestore_1.serverTimestamp)(),
      };
      // Check if preference already exists
      const existingQ = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notificationPreferences'),
        (0, firestore_1.where)('userId', '==', preference.userId),
        (0, firestore_1.where)('category', '==', preference.category),
        (0, firestore_1.where)('type', '==', preference.type),
        (0, firestore_1.where)('priority', '==', preference.priority)
      );
      const existingSnapshot = await (0, firestore_1.getDocs)(existingQ);
      if (!existingSnapshot.empty) {
        // Update existing preference
        const existingDoc = existingSnapshot.docs[0];
        await (0, firestore_1.updateDoc)(existingDoc.ref, preferenceData);
        return existingDoc.id;
      } else {
        // Create new preference
        const docRef = await (0, firestore_1.addDoc)(
          (0, firestore_1.collection)(firebase_1.db, 'notificationPreferences'),
          preferenceData
        );
        return docRef.id;
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      throw new Error('Failed to update notification preference');
    }
  }
  async getPreferences(userId) {
    try {
      const q = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notificationPreferences'),
        (0, firestore_1.where)('userId', '==', userId)
      );
      const snapshot = await (0, firestore_1.getDocs)(q);
      const preferences = [];
      snapshot.forEach(doc => {
        preferences.push({ id: doc.id, ...doc.data() });
      });
      return preferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return [];
    }
  }
  // ===== NOTIFICATION RULES =====
  async createRule(rule) {
    try {
      const ruleData = {
        ...rule,
        createdAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      };
      const docRef = await (0, firestore_1.addDoc)(
        (0, firestore_1.collection)(firebase_1.db, 'notificationRules'),
        ruleData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating rule:', error);
      throw new Error('Failed to create notification rule');
    }
  }
  async updateRule(ruleId, updates) {
    try {
      const ruleRef = (0, firestore_1.doc)(firebase_1.db, 'notificationRules', ruleId);
      await (0, firestore_1.updateDoc)(ruleRef, {
        ...updates,
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      throw new Error('Failed to update notification rule');
    }
  }
  async getActiveRules() {
    try {
      const q = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notificationRules'),
        (0, firestore_1.where)('isActive', '==', true),
        (0, firestore_1.orderBy)('priority', 'desc')
      );
      const snapshot = await (0, firestore_1.getDocs)(q);
      const rules = [];
      snapshot.forEach(doc => {
        rules.push({ id: doc.id, ...doc.data() });
      });
      return rules;
    } catch (error) {
      console.error('Error getting active rules:', error);
      return [];
    }
  }
  // ===== NOTIFICATION CHANNELS =====
  async createChannel(channel) {
    try {
      const channelData = {
        ...channel,
        lastUsed: (0, firestore_1.serverTimestamp)(),
        successRate: 100,
        errorCount: 0,
      };
      const docRef = await (0, firestore_1.addDoc)(
        (0, firestore_1.collection)(firebase_1.db, 'notificationChannels'),
        channelData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw new Error('Failed to create notification channel');
    }
  }
  async updateChannelStats(channelId, success) {
    try {
      const channelRef = (0, firestore_1.doc)(firebase_1.db, 'notificationChannels', channelId);
      const channelDoc = await (0, firestore_1.getDoc)(channelRef);
      if (!channelDoc.exists()) {
        throw new Error('Channel not found');
      }
      const channel = channelDoc.data();
      const totalAttempts = channel.successRate + channel.errorCount;
      const newSuccessRate = success ? channel.successRate + 1 : channel.successRate;
      const newErrorCount = success ? channel.errorCount : channel.errorCount + 1;
      const newSuccessRatePercentage =
        totalAttempts > 0 ? (newSuccessRate / (totalAttempts + 1)) * 100 : 100;
      await (0, firestore_1.updateDoc)(channelRef, {
        lastUsed: (0, firestore_1.serverTimestamp)(),
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
  async getUnreadCount(userId) {
    try {
      const q = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notifications'),
        (0, firestore_1.where)('userId', '==', userId),
        (0, firestore_1.where)('status', '==', 'unread')
      );
      const snapshot = await (0, firestore_1.getDocs)(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
  async getNotificationStats(userId) {
    try {
      const notifications = await this.getNotifications(userId);
      const stats = {
        total: notifications.length,
        unread: 0,
        read: 0,
        archived: 0,
        byCategory: {},
        byType: {},
        byPriority: {},
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
  async searchNotifications(userId, searchTerm) {
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
  async cleanupExpiredNotifications() {
    try {
      const now = firestore_1.Timestamp.now();
      const q = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, 'notifications'),
        (0, firestore_1.where)('expiresAt', '<', now)
      );
      const snapshot = await (0, firestore_1.getDocs)(q);
      const batch = (0, firestore_1.writeBatch)(firebase_1.db);
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
exports.NotificationService = NotificationService;
exports.default = NotificationService.getInstance();
//# sourceMappingURL=notificationService.js.map
