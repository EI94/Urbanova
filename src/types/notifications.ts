export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'project' | 'permit' | 'task' | 'system' | 'marketing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  snoozedUntil?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  userId: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    project: boolean;
    permit: boolean;
    task: boolean;
    system: boolean;
    marketing: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  dismissed: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}
