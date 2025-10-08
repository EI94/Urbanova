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
  Timestamp,
  collection,
  onSnapshot } from 'firebase/firestore';

import { db } from './firebase.ts';
import { notificationPreferencesService } from './notificationPreferencesService';

// 🛡️ OS PROTECTION - Importa protezione CSS per firebase notification service
import '@/lib/osProtection';

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
      // Verifica che l'utente sia autenticato
      if (!data.userId) {
        throw new Error('User ID is required for creating notifications');
      }

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

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);

      const notification: Notification = {
        id: docRef.id,
        ...notificationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Notification;

      return notification;
    } catch (error) {
      console.error('❌ [NotificationService] Errore creazione notifica:', error);
      
      // Per debugging, lancia l'errore invece di restituire null
      throw error;
    }
  }

  /**
   * Crea una nuova notifica rispettando le preferenze utente
   */
  async createNotificationWithPreferences(data: {
    userId: string;
    type: Notification['type'];
    priority: Notification['priority'];
    title: string;
    message: string;
    data?: any;
    expiresAt?: Date;
    actions?: Notification['actions'];
  }): Promise<Notification | null> {
    try {
      console.log('📝 [FirebaseNotification] Creazione notifica con preferenze per utente:', data.userId);
      
      // Verifica se il tipo di notifica è abilitato
      const isTypeEnabled = await notificationPreferencesService.isNotificationTypeEnabled(
        data.userId, 
        data.type
      );
      
      if (!isTypeEnabled) {
        console.log('🚫 [FirebaseNotification] Tipo notifica disabilitato:', data.type);
        return null;
      }
      
      // Verifica se la priorità è sufficiente
      const isPrioritySufficient = await notificationPreferencesService.isPrioritySufficient(
        data.userId,
        data.type,
        data.priority
      );
      
      if (!isPrioritySufficient) {
        console.log('🚫 [FirebaseNotification] Priorità insufficiente:', data.priority);
        return null;
      }
      
      // Verifica se è in quiet hours
      const isQuietHours = await notificationPreferencesService.isQuietHours(data.userId);
      if (isQuietHours && data.priority !== 'URGENT') {
        console.log('🚫 [FirebaseNotification] In quiet hours, notifica non critica bloccata');
        return null;
      }
      
      // Crea la notifica
      return await this.createNotification(data);
      
    } catch (error) {
      console.error('❌ [FirebaseNotification] Errore creazione notifica con preferenze:', error);
      return null;
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
        collection(db, 'notifications'),
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
      console.error('❌ [NotificationService] Errore recupero notifiche:', error);
      
      // Per debugging, lancia l'errore invece di restituire array vuoto
      throw error;
    }
  }

  async markAsUnread(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: false,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw new Error('Failed to mark notification as unread');
    }
  }

  async getNotificationById(notificationId: string): Promise<Notification | null> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationSnap = await getDoc(notificationRef);

      if (!notificationSnap.exists()) {
        return null;
      }

      const data = notificationSnap.data();
      return {
        id: notificationSnap.id,
        userId: data.userId,
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        data: data.data,
        isRead: data.isRead || false,
        isArchived: data.isArchived || false,
        expiresAt: data.expiresAt?.toDate() || null,
        actions: data.actions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Notification;
    } catch (error) {
      console.error('Error getting notification by ID:', error);
      return null;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
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
      console.log('🔄 [FirebaseNotification] Caricamento statistiche notifiche per:', userId);
      
      // Total count
      const totalQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
      const totalSnapshot = await getDocs(totalQuery);
      const total = totalSnapshot.size;

      // Unread count
      const unreadQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const unreadSnapshot = await getDocs(unreadQuery);
      const unread = unreadSnapshot.size;

      // Read count
      const readQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', true)
      );
      const readSnapshot = await getDocs(readQuery);
      const read = readSnapshot.size;

      // Dismissed count
      const dismissedQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isDismissed', '==', true)
      );
      const dismissedSnapshot = await getDocs(dismissedQuery);
      const dismissed = dismissedSnapshot.size;

      // Count by type
      const typeQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
      const typeSnapshot = await getDocs(typeQuery);
      const byType: Record<string, number> = {};
      typeSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Count by priority
      const priorityQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
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
      console.error('❌ [FirebaseNotification] Errore caricamento statistiche:', error);
      
      // Se è un errore di permessi, restituisci statistiche vuote
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.warn('⚠️ [FirebaseNotification] Permessi insufficienti per caricare statistiche');
      }
      
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
  // NOTIFICHE REAL-TIME
  // ========================================

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
      try {
        const notifications: Notification[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          notifications.push({
            id: doc.id,
            userId: data.userId,
            type: data.type,
            priority: data.priority,
            title: data.title,
            message: data.message,
            data: data.data,
            isRead: data.isRead || false,
            isArchived: data.isArchived || false,
            expiresAt: data.expiresAt?.toDate() || null,
            actions: data.actions || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });
        callback(notifications);
      } catch (error) {
        console.error('❌ [FirebaseNotification] Errore onSnapshot:', error);
        // Non propagare l'errore per evitare loop infiniti
      }
    }, error => {
      console.error('❌ [FirebaseNotification] Errore listener notifiche:', error);
      // Non propagare l'errore per evitare loop infiniti
    });

    return unsubscribe;
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

  // ========================================
  // NOTIFICHE REALI PER EVENTI SPECIFICI
  // ========================================

  async createWorkspaceInviteNotification(
    userId: string, 
    workspaceName: string, 
    inviterName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'PROJECT',
      priority: 'HIGH',
      title: 'Invito al Workspace',
      message: `${inviterName} ti ha invitato a far parte del workspace "${workspaceName}"`,
      data: { 
        action: 'workspace_invite',
        workspaceName,
        inviterName
      },
      actions: [
        {
          type: 'accept',
          label: 'Accetta',
          url: '/dashboard/workspace/invites'
        },
        {
          type: 'decline',
          label: 'Rifiuta',
          url: '/dashboard/workspace/invites'
        }
      ]
    });
  }

  async createFileSharedNotification(
    userId: string,
    fileName: string,
    sharerName: string,
    projectName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'PROJECT',
      priority: 'MEDIUM',
      title: 'File Condiviso',
      message: `${sharerName} ha condiviso il file "${fileName}" nel progetto "${projectName}"`,
      data: { 
        action: 'file_shared',
        fileName,
        sharerName,
        projectName
      },
      actions: [
        {
          type: 'view',
          label: 'Visualizza File',
          url: '/dashboard/projects/files'
        }
      ]
    });
  }

  async createProjectUpdateNotification(
    userId: string,
    projectName: string,
    updateType: string,
    updaterName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'PROJECT',
      priority: 'MEDIUM',
      title: 'Progetto Aggiornato',
      message: `${updaterName} ha ${updateType} il progetto "${projectName}"`,
      data: { 
        action: 'project_update',
        projectName,
        updateType,
        updaterName
      },
      actions: [
        {
          type: 'view',
          label: 'Visualizza Progetto',
          url: '/dashboard/projects'
        }
      ]
    });
  }

  async createCollaborationRequestNotification(
    userId: string,
    projectName: string,
    requesterName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'PROJECT',
      priority: 'HIGH',
      title: 'Richiesta Collaborazione',
      message: `${requesterName} vuole collaborare al progetto "${projectName}"`,
      data: { 
        action: 'collaboration_request',
        projectName,
        requesterName
      },
      actions: [
        {
          type: 'accept',
          label: 'Accetta',
          url: '/dashboard/collaborations'
        },
        {
          type: 'decline',
          label: 'Rifiuta',
          url: '/dashboard/collaborations'
        }
      ]
    });
  }

  async createFeasibilityAnalysisCompleteNotification(
    userId: string,
    projectName: string,
    analysisId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'SUCCESS',
      priority: 'MEDIUM',
      title: 'Analisi di Fattibilità Completata',
      message: `L'analisi di fattibilità per "${projectName}" è stata completata`,
      data: { 
        action: 'feasibility_complete',
        projectName,
        analysisId
      },
      actions: [
        {
          type: 'view',
          label: 'Visualizza Risultati',
          url: `/dashboard/feasibility-analysis/${analysisId}`
        }
      ]
    });
  }

  async createBusinessPlanReadyNotification(
    userId: string,
    projectName: string,
    planId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'SUCCESS',
      priority: 'MEDIUM',
      title: 'Business Plan Pronto',
      message: `Il Business Plan per "${projectName}" è stato generato ed è pronto per la revisione`,
      data: { 
        action: 'business_plan_ready',
        projectName,
        planId
      },
      actions: [
        {
          type: 'view',
          label: 'Visualizza Business Plan',
          url: `/dashboard/business-plan/${planId}`
        }
      ]
    });
  }

  async createMarketIntelligenceUpdateNotification(
    userId: string,
    location: string,
    newOpportunities: number
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'INFO',
      priority: 'LOW',
      title: 'Nuove Opportunità di Mercato',
      message: `Trovate ${newOpportunities} nuove opportunità immobiliari a ${location}`,
      data: { 
        action: 'market_update',
        location,
        newOpportunities
      },
      actions: [
        {
          type: 'view',
          label: 'Visualizza Opportunità',
          url: '/dashboard/market-intelligence'
        }
      ]
    });
  }

  async createSystemMaintenanceNotification(
    userId: string,
    maintenanceType: string,
    scheduledTime: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'SYSTEM',
      priority: 'MEDIUM',
      title: 'Manutenzione Sistema',
      message: `Manutenzione ${maintenanceType} programmata per ${scheduledTime}`,
      data: { 
        action: 'system_maintenance',
        maintenanceType,
        scheduledTime
      }
    });
  }

  async createDeadlineReminderNotification(
    userId: string,
    taskName: string,
    deadline: string,
    projectName: string
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: 'ALERT',
      priority: 'HIGH',
      title: 'Scadenza Imminente',
      message: `La scadenza per "${taskName}" nel progetto "${projectName}" è il ${deadline}`,
      data: { 
        action: 'deadline_reminder',
        taskName,
        deadline,
        projectName
      },
      actions: [
        {
          type: 'view',
          label: 'Visualizza Task',
          url: '/dashboard/projects/tasks'
        }
      ]
    });
  }
}

export const firebaseNotificationService = FirebaseNotificationService.getInstance();
