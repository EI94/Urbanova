import { prisma } from './database';
import { 
  Notification, 
  NotificationPreferences, 
  NotificationStats,
  NotificationType,
  NotificationPriority 
} from '@/types/notifications';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ========================================
  // OPERAZIONI CRUD NOTIFICHE
  // ========================================

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    data?: any;
    expiresAt?: Date;
    actions?: Array<{
      type: string;
      label: string;
      url?: string;
      data?: any;
    }>;
  }): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          priority: data.priority,
          title: data.title,
          message: data.message,
          data: data.data,
          expiresAt: data.expiresAt,
          actions: data.actions ? {
            create: data.actions
          } : undefined
        },
        include: {
          actions: true
        }
      });

      // Emetti evento per aggiornamenti real-time
      this.emitEvent('notification_created', { notification });

      return this.mapToNotificationType(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async getNotifications(userId: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
  } = {}): Promise<Notification[]> {
    try {
      const { limit = 50, offset = 0, unreadOnly = false, type, priority } = options;

      const where: any = { userId };
      
      if (unreadOnly) {
        where.isRead = false;
        where.isDismissed = false;
        where.OR = [
          { snoozedUntil: null },
          { snoozedUntil: { lt: new Date() } }
        ];
      }

      if (type) where.type = type;
      if (priority) where.priority = priority;

      const notifications = await prisma.notification.findMany({
        where,
        include: {
          actions: true
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      });

      return notifications.map(this.mapToNotificationType);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  async getNotificationById(id: string): Promise<Notification | null> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id },
        include: {
          actions: true
        }
      });

      return notification ? this.mapToNotificationType(notification) : null;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw new Error('Failed to fetch notification');
    }
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await prisma.notification.update({
        where: { 
          id,
          userId // Sicurezza: solo il proprietario può modificare
        },
        data: {
          isRead: true,
          readAt: new Date()
        },
        include: {
          actions: true
        }
      });

      this.emitEvent('notification_updated', { notification });
      return this.mapToNotificationType(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: { 
          userId,
          isRead: false,
          isDismissed: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      this.emitEvent('notifications_bulk_updated', { userId, count: result.count });
      return result.count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async markAsUnread(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await prisma.notification.update({
        where: { 
          id,
          userId
        },
        data: {
          isRead: false,
          readAt: null
        },
        include: {
          actions: true
        }
      });

      this.emitEvent('notification_updated', { notification });
      return this.mapToNotificationType(notification);
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw new Error('Failed to mark notification as unread');
    }
  }

  async dismissNotification(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await prisma.notification.update({
        where: { 
          id,
          userId
        },
        data: {
          isDismissed: true,
          dismissedAt: new Date()
        },
        include: {
          actions: true
        }
      });

      this.emitEvent('notification_updated', { notification });
      return this.mapToNotificationType(notification);
    } catch (error) {
      console.error('Error dismissing notification:', error);
      throw new Error('Failed to dismiss notification');
    }
  }

  async snoozeNotification(id: string, userId: string, until: Date): Promise<Notification> {
    try {
      const notification = await prisma.notification.update({
        where: { 
          id,
          userId
        },
        data: {
          snoozedUntil: until
        },
        include: {
          actions: true
        }
      });

      this.emitEvent('notification_updated', { notification });
      return this.mapToNotificationType(notification);
    } catch (error) {
      console.error('Error snoozing notification:', error);
      throw new Error('Failed to snooze notification');
    }
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: { 
          id,
          userId
        }
      });

      this.emitEvent('notification_deleted', { id, userId });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async deleteExpiredNotifications(): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      if (result.count > 0) {
        this.emitEvent('notifications_cleanup', { count: result.count });
      }

      return result.count;
    } catch (error) {
      console.error('Error deleting expired notifications:', error);
      throw new Error('Failed to delete expired notifications');
    }
  }

  // ========================================
  // STATISTICHE E ANALYTICS
  // ========================================

  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const [
        total,
        unread,
        dismissed,
        snoozed,
        byType,
        byPriority
      ] = await Promise.all([
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ 
          where: { 
            userId,
            isRead: false,
            isDismissed: false,
            OR: [
              { snoozedUntil: null },
              { snoozedUntil: { lt: new Date() } }
            ]
          }
        }),
        prisma.notification.count({ 
          where: { userId, isDismissed: true }
        }),
        prisma.notification.count({ 
          where: { 
            userId,
            snoozedUntil: { gt: new Date() }
          }
        }),
        prisma.notification.groupBy({
          by: ['type'],
          where: { userId },
          _count: { type: true }
        }),
        prisma.notification.groupBy({
          by: ['priority'],
          where: { userId },
          _count: { priority: true }
        })
      ]);

      const typeBreakdown = byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>);

      const priorityBreakdown = byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        unread,
        dismissed,
        snoozed,
        typeBreakdown,
        priorityBreakdown,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw new Error('Failed to fetch notification stats');
    }
  }

  // ========================================
  // PREFERENZE NOTIFICHE
  // ========================================

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId }
      });

      return preferences ? this.mapToPreferencesType(preferences) : null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw new Error('Failed to fetch notification preferences');
    }
  }

  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const updatedPreferences = await prisma.notificationPreferences.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences
        }
      });

      this.emitEvent('preferences_updated', { preferences: updatedPreferences });
      return this.mapToPreferencesType(updatedPreferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  // ========================================
  // NOTIFICHE DI SISTEMA E AUTOMATICHE
  // ========================================

  async createSystemNotification(data: {
    title: string;
    message: string;
    priority?: NotificationPriority;
    data?: any;
    userIds?: string[];
  }): Promise<void> {
    try {
      const { title, message, priority = 'MEDIUM', data: notificationData, userIds } = data;

      if (userIds && userIds.length > 0) {
        // Notifica specifica per utenti
        await prisma.notification.createMany({
          data: userIds.map(userId => ({
            userId,
            type: 'SYSTEM',
            priority,
            title,
            message,
            data: notificationData
          }))
        });
      } else {
        // Notifica per tutti gli utenti attivi
        const activeUsers = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true }
        });

        if (activeUsers.length > 0) {
          await prisma.notification.createMany({
            data: activeUsers.map(user => ({
              userId: user.id,
              type: 'SYSTEM',
              priority,
              title,
              message,
              data: notificationData
            }))
          });
        }
      }

      this.emitEvent('system_notification_created', { title, message, priority });
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw new Error('Failed to create system notification');
    }
  }

  async createProjectNotification(data: {
    projectId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    data?: any;
    excludeUserId?: string;
  }): Promise<void> {
    try {
      const { projectId, title, message, type, priority = 'MEDIUM', data: notificationData, excludeUserId } = data;

      // Trova tutti i membri del progetto
      const projectMembers = await prisma.projectMember.findMany({
        where: { 
          projectId,
          isActive: true,
          userId: excludeUserId ? { not: excludeUserId } : undefined
        },
        select: { userId: true }
      });

      if (projectMembers.length > 0) {
        await prisma.notification.createMany({
          data: projectMembers.map(member => ({
            userId: member.userId,
            type,
            priority,
            title,
            message,
            data: {
              ...notificationData,
              projectId,
              type: 'project'
            }
          }))
        });
      }

      this.emitEvent('project_notification_created', { projectId, title, message, type });
    } catch (error) {
      console.error('Error creating project notification:', error);
      throw new Error('Failed to create project notification');
    }
  }

  // ========================================
  // UTILITY E HELPERS
  // ========================================

  private mapToNotificationType(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      userId: dbNotification.userId,
      type: dbNotification.type,
      priority: dbNotification.priority,
      title: dbNotification.title,
      message: dbNotification.message,
      data: dbNotification.data,
      isRead: dbNotification.isRead,
      isDismissed: dbNotification.isDismissed,
      snoozedUntil: dbNotification.snoozedUntil,
      expiresAt: dbNotification.expiresAt,
      readAt: dbNotification.readAt,
      dismissedAt: dbNotification.dismissedAt,
      createdAt: dbNotification.createdAt,
      updatedAt: dbNotification.updatedAt,
      actions: dbNotification.actions?.map((action: any) => ({
        id: action.id,
        type: action.type,
        label: action.label,
        url: action.url,
        data: action.data,
        clickedAt: action.clickedAt
      })) || []
    };
  }

  private mapToPreferencesType(dbPreferences: any): NotificationPreferences {
    return {
      id: dbPreferences.id,
      userId: dbPreferences.userId,
      emailEnabled: dbPreferences.emailEnabled,
      pushEnabled: dbPreferences.pushEnabled,
      smsEnabled: dbPreferences.smsEnabled,
      inAppEnabled: dbPreferences.inAppEnabled,
      quietHoursEnabled: dbPreferences.quietHoursEnabled,
      quietHoursStart: dbPreferences.quietHoursStart,
      quietHoursEnd: dbPreferences.quietHoursEnd,
      timezone: dbPreferences.timezone,
      preferences: dbPreferences.preferences,
      createdAt: dbPreferences.createdAt,
      updatedAt: dbPreferences.updatedAt
    };
  }

  // ========================================
  // EVENTI REAL-TIME
  // ========================================

  private emitEvent(type: string, data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('urbanova-notification', {
        detail: { type, data }
      }));
    }
  }

  subscribe(callback: (event: CustomEvent) => void): () => void {
    if (typeof window !== 'undefined') {
      window.addEventListener('urbanova-notification', callback);
      return () => window.removeEventListener('urbanova-notification', callback);
    }
    return () => {};
  }

  // ========================================
  // MIGRAZIONE E COMPATIBILITÀ
  // ========================================

  async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const storageKey = `urbanova-notifications-${userId}`;
      const storedNotifications = localStorage.getItem(storageKey);

      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        
        for (const notification of notifications) {
          await this.createNotification({
            userId,
            type: notification.type,
            priority: notification.priority,
            title: notification.title,
            message: notification.message,
            data: notification.data
          });
        }

        // Rimuovi i dati dal localStorage dopo la migrazione
        localStorage.removeItem(storageKey);
        console.log(`✅ Migrated ${notifications.length} notifications for user ${userId}`);
      }
    } catch (error) {
      console.error('Error migrating notifications from localStorage:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
