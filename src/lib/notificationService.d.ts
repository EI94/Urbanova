import { Timestamp } from 'firebase/firestore';
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
    startTime: string;
    endTime: string;
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
  delay?: number;
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
export declare class NotificationService {
  private static instance;
  static getInstance(): NotificationService;
  createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<string>;
  updateNotification(notificationId: string, updates: Partial<Notification>): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  archiveNotification(notificationId: string): Promise<void>;
  getNotifications(
    userId: string,
    options?: {
      status?: Notification['status'];
      category?: Notification['category'];
      type?: Notification['type'];
      priority?: Notification['priority'];
      limit?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]>;
  getNotificationsRealtime(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void;
  createTemplate(
    template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string>;
  updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<void>;
  getTemplates(): Promise<NotificationTemplate[]>;
  updatePreference(preference: Omit<NotificationPreference, 'id' | 'lastUpdated'>): Promise<string>;
  getPreferences(userId: string): Promise<NotificationPreference[]>;
  createRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<void>;
  getActiveRules(): Promise<NotificationRule[]>;
  createChannel(
    channel: Omit<NotificationChannel, 'id' | 'lastUsed' | 'successRate' | 'errorCount'>
  ): Promise<string>;
  updateChannelStats(channelId: string, success: boolean): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }>;
  searchNotifications(userId: string, searchTerm: string): Promise<Notification[]>;
  cleanupExpiredNotifications(): Promise<number>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notificationService.d.ts.map
