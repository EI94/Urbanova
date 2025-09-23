// Service per la gestione della Real-time Collaboration
import {
  CollaborationSession,
  CollaborationParticipant,
  RealtimeMessage,
  CursorPosition,
  DocumentChange,
  LiveComment,
  UserPresence,
  CollaborationMetrics,
  RealtimeConnection,
  CollaborationTemplate,
  RealtimeNotification,
  CollaborationFilter,
  RealtimeConfig,
  CollaborationType,
} from '@/types/realtime';
import { TeamRole } from '@/types/team';

export class RealtimeService {
  private sessions: Map<string, CollaborationSession> = new Map();
  private connections: Map<string, RealtimeConnection> = new Map();
  private messages: Map<string, RealtimeMessage[]> = new Map();
  private templates: Map<string, CollaborationTemplate> = new Map();
  private notifications: Map<string, RealtimeNotification> = new Map();
  private config: RealtimeConfig;

  constructor() {
    this.config = {
      heartbeatInterval: 30000, // 30 secondi
      cursorUpdateThrottle: 100, // 100ms
      maxRetries: 3,
      connectionTimeout: 60000, // 1 minuto
      maxConnectionsPerUser: 3,
      enablePresence: true,
      enableCursors: true,
      enableLiveComments: true,
      enableDocumentSync: true,
    };

    this.initializeDefaultTemplates();
    this.startHeartbeat();
  }

  // Inizializza template predefiniti
  private initializeDefaultTemplates() {
    // Template per collaborazione su ricerca terreni
    const landSearchTemplate: CollaborationTemplate = {
      id: 'land-search-collab-v1',
      name: 'Collaborazione Ricerca Terreni',
      description: 'Sessione collaborativa per ricerca e analisi terreni',
      type: 'search',
      defaultPermissions: ['VIEW_ANALYTICS', 'ADD_COMMENTS'],
      defaultMaxParticipants: 10,
      features: ['live_search', 'shared_filters', 'real_time_comments', 'collaborative_analysis'],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Template per collaborazione su analisi
    const analysisTemplate: CollaborationTemplate = {
      id: 'analysis-collab-v1',
      name: 'Collaborazione Analisi',
      description: 'Sessione collaborativa per analisi e report',
      type: 'analysis',
      defaultPermissions: ['VIEW_ANALYTICS', 'ADD_COMMENTS', 'EDIT_COMMENTS'],
      defaultMaxParticipants: 8,
      features: ['shared_documents', 'live_editing', 'version_control', 'collaborative_charts'],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Template per presentazioni collaborative
    const presentationTemplate: CollaborationTemplate = {
      id: 'presentation-collab-v1',
      name: 'Presentazione Collaborativa',
      description: 'Sessione per presentazioni e meeting interattivi',
      type: 'presentation',
      defaultPermissions: ['VIEW_ANALYTICS', 'ADD_COMMENTS'],
      defaultMaxParticipants: 20,
      features: [
        'live_presentation',
        'audience_interaction',
        'real_time_polls',
        'collaborative_notes',
      ],
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(landSearchTemplate.id, landSearchTemplate);
    this.templates.set(analysisTemplate.id, analysisTemplate);
    this.templates.set(presentationTemplate.id, presentationTemplate);
  }

  // Crea una nuova sessione collaborativa
  createSession(
    templateId: string,
    name: string,
    description: string,
    creator: CollaborationParticipant,
    sharedContent?: any,
    maxParticipants?: number
  ): CollaborationSession {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trovato`);
    }

    const sessionId = `session-${Date.now()}`;
    const session: CollaborationSession = {
      id: sessionId,
      name,
      description,
      type: template.type,
      status: 'active',
      participants: [creator],
      maxParticipants: maxParticipants || template.defaultMaxParticipants,
      sharedContent: sharedContent || {},
      createdAt: new Date(),
      startedAt: new Date(),
      lastActivity: new Date(),
      isPublic: false,
      allowAnonymous: false,
      requireApproval: false,
      permissions: {
        canEdit: [creator.userId],
        canComment: template.defaultPermissions.includes('ADD_COMMENTS') ? [creator.userId] : [],
        canInvite: [creator.userId],
        canManage: [creator.userId],
      },
      tags: [],
      attachments: [],
      notes: '',
    };

    this.sessions.set(sessionId, session);
    this.messages.set(sessionId, []);

    // Crea notifica di creazione sessione
    this.createNotification(
      sessionId,
      creator.userId,
      'session_created',
      'Sessione creata',
      `La sessione "${name}" è stata creata`
    );

    return session;
  }

  // Unisce un utente a una sessione
  joinSession(sessionId: string, participant: CollaborationParticipant): CollaborationSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Sessione ${sessionId} non trovata`);
    }

    if (session.status !== 'active') {
      throw new Error('Sessione non attiva');
    }

    if (session.participants.length >= session.maxParticipants) {
      throw new Error('Sessione al completo');
    }

    // Verifica se l'utente è già presente
    const existingParticipant = session.participants.find(p => p.userId === participant.userId);
    if (existingParticipant) {
      existingParticipant.lastSeen = new Date();
      existingParticipant.isActive = true;
      existingParticipant.presence = 'online';
    } else {
      session.participants.push({
        ...participant,
        joinedAt: new Date(),
        lastSeen: new Date(),
        isActive: true,
        presence: 'online',
        contributions: {
          changesCount: 0,
          commentsCount: 0,
          timeSpent: 0,
        },
      });
    }

    session.lastActivity = new Date();

    // Crea messaggio di join
    this.createMessage(sessionId, {
      type: 'user_joined',
      userId: participant.userId,
      userName: participant.userName,
      userAvatar: participant.userAvatar,
      userRole: participant.userRole,
      data: { participant },
    });

    // Crea notifica per altri partecipanti
    session.participants
      .filter(p => p.userId !== participant.userId)
      .forEach(p => {
        this.createNotification(
          sessionId,
          p.userId,
          'user_joined',
          'Nuovo partecipante',
          `${participant.userName} si è unito alla sessione`
        );
      });

    return session;
  }

  // Lascia una sessione
  leaveSession(sessionId: string, userId: string): CollaborationSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Sessione ${sessionId} non trovata`);
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isActive = false;
      participant.presence = 'offline';
      participant.lastSeen = new Date();

      // Calcola tempo speso
      const timeSpent = Math.round(
        (participant.lastSeen.getTime() - participant.joinedAt.getTime()) / (1000 * 60)
      );
      participant.contributions.timeSpent += timeSpent;
    }

    // Crea messaggio di leave
    this.createMessage(sessionId, {
      type: 'user_left',
      userId,
      userName: participant?.userName || 'Unknown',
      userAvatar: participant?.userAvatar || '👤',
      userRole: participant?.userRole || 'TEAM_MEMBER',
      data: { participant },
    });

    // Crea notifica per altri partecipanti
    session.participants
      .filter(p => p.userId !== userId && p.isActive)
      .forEach(p => {
        this.createNotification(
          sessionId,
          p.userId,
          'user_left',
          'Partecipante uscito',
          `${participant?.userName || 'Un utente'} ha lasciato la sessione`
        );
      });

    return session;
  }

  // Aggiorna posizione cursore
  updateCursor(sessionId: string, userId: string, x: number, y: number): CursorPosition {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Sessione ${sessionId} non trovata`);
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('Utente non presente nella sessione');
    }

    const cursorPosition: CursorPosition = {
      x,
      y,
      userId,
      userName: participant.userName,
      userAvatar: participant.userAvatar,
      userRole: participant.userRole,
      timestamp: new Date(),
    };

    participant.cursorPosition = cursorPosition;
    session.lastActivity = new Date();

    // Crea messaggio di movimento cursore
    this.createMessage(sessionId, {
      type: 'cursor_move',
      userId,
      userName: participant.userName,
      userAvatar: participant.userAvatar,
      userRole: participant.userRole,
      data: { cursorPosition },
    });

    return cursorPosition;
  }

  // Aggiunge un commento live
  addLiveComment(
    sessionId: string,
    userId: string,
    content: string,
    position?: { x: number; y: number; field?: string }
  ): LiveComment {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Sessione ${sessionId} non trovata`);
    }

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('Utente non presente nella sessione');
    }

    const commentData: Partial<LiveComment> = {
      id: `comment-${Date.now()}`,
      userId,
      userName: participant.userName,
      userAvatar: participant.userAvatar,
      userRole: participant.userRole,
      content,
      timestamp: new Date(),
      replies: [],
      isResolved: false,
      reactions: {},
    };

    if (position) {
      commentData.position = position;
    }

    const comment: LiveComment = commentData as LiveComment;

    // Aggiorna contatori partecipante
    participant.contributions.commentsCount++;
    session.lastActivity = new Date();

    // Crea messaggio di commento
    this.createMessage(sessionId, {
      type: 'comment',
      userId,
      userName: participant.userName,
      userAvatar: participant.userAvatar,
      userRole: participant.userRole,
      data: { comment },
    });

    // Crea notifica per altri partecipanti
    session.participants
      .filter(p => p.userId !== userId && p.isActive)
      .forEach(p => {
        this.createNotification(
          sessionId,
          p.userId,
          'comment_added',
          'Nuovo commento',
          `${participant.userName} ha aggiunto un commento`
        );
      });

    return comment;
  }

  // Aggiorna presenza utente
  updatePresence(sessionId: string, userId: string, presence: UserPresence): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.presence = presence;
      participant.lastSeen = new Date();
      session.lastActivity = new Date();

      // Crea messaggio di aggiornamento presenza
      this.createMessage(sessionId, {
        type: 'presence_update',
        userId,
        userName: participant.userName,
        userAvatar: participant.userAvatar,
        userRole: participant.userRole,
        data: { presence },
      });
    }
  }

  // Crea un messaggio nella sessione
  private createMessage(sessionId: string, messageData: Partial<RealtimeMessage>): RealtimeMessage {
    const message: RealtimeMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      type: messageData.type!,
      userId: messageData.userId!,
      userName: messageData.userName!,
      userAvatar: messageData.userAvatar!,
      userRole: messageData.userRole!,
      timestamp: new Date(),
      data: messageData.data || {},
      metadata: {
        priority: 'low',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ore
        retryCount: 0,
      },
    };

    const sessionMessages = this.messages.get(sessionId) || [];
    sessionMessages.push(message);
    this.messages.set(sessionId, sessionMessages);

    return message;
  }

  // Crea una notifica
  private createNotification(
    sessionId: string,
    userId: string,
    type: string,
    title: string,
    message: string
  ): RealtimeNotification {
    const notification: RealtimeNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId,
      type: type as any,
      title,
      message,
      priority: 'low',
      isRead: false,
      createdAt: new Date(),
      actionUrl: `/dashboard/collaboration/${sessionId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
    };

    this.notifications.set(notification.id, notification);
    return notification;
  }

  // Ottieni messaggi di una sessione
  getSessionMessages(sessionId: string, limit: number = 100): RealtimeMessage[] {
    const sessionMessages = this.messages.get(sessionId) || [];
    return sessionMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Ottieni sessioni per utente
  getUserSessions(userId: string, filter?: CollaborationFilter): CollaborationSession[] {
    let sessions = Array.from(this.sessions.values()).filter(s =>
      s.participants.some(p => p.userId === userId)
    );

    if (filter) {
      if (filter.type?.length) {
        sessions = sessions.filter(s => filter.type!.includes(s.type));
      }
      if (filter.status?.length) {
        sessions = sessions.filter(s => filter.status!.includes(s.status));
      }
      if (filter.isPublic !== undefined) {
        sessions = sessions.filter(s => s.isPublic === filter.isPublic);
      }
    }

    return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  // Ottieni notifiche per utente
  getUserNotifications(userId: string): RealtimeNotification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Marca notifica come letta
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
  }

  // Ottieni metriche di collaborazione
  getCollaborationMetrics(sessionId: string): CollaborationMetrics | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const messages = this.messages.get(sessionId) || [];
    const activeParticipants = session.participants.filter(p => p.isActive).length;

    // Calcola tempo di risposta medio
    const responseTimes: number[] = [];
    const userMessages = new Map<string, RealtimeMessage[]>();

    messages.forEach(msg => {
      if (!userMessages.has(msg.userId)) {
        userMessages.set(msg.userId, []);
      }
      userMessages.get(msg.userId)!.push(msg);
    });

    userMessages.forEach((userMsgs, userId) => {
      if (userMsgs.length > 1) {
        for (let i = 1; i < userMsgs.length; i++) {
          const currentMsg = userMsgs[i];
          const previousMsg = userMsgs[i - 1];
          if (currentMsg && previousMsg) {
            const responseTime =
              currentMsg.timestamp.getTime() - previousMsg.timestamp.getTime();
            responseTimes.push(responseTime);
          }
        }
      }
    });

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    // Calcola score collaborazione (0-100)
    const totalContributions = session.participants.reduce(
      (total, p) => total + p.contributions.changesCount + p.contributions.commentsCount,
      0
    );
    const collaborationScore = Math.min(
      100,
      Math.round((totalContributions / session.participants.length) * 10)
    );

    // Top contributors
    const topContributors = session.participants
      .map(p => ({
        userId: p.userId,
        userName: p.userName,
        contributions: p.contributions.changesCount + p.contributions.commentsCount,
        responseTime: averageResponseTime,
      }))
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 5);

    return {
      sessionId,
      totalParticipants: session.participants.length,
      activeParticipants,
      totalChanges: session.participants.reduce(
        (total, p) => total + p.contributions.changesCount,
        0
      ),
      totalComments: session.participants.reduce(
        (total, p) => total + p.contributions.commentsCount,
        0
      ),
      averageResponseTime,
      collaborationScore,
      topContributors,
      bottlenecks: this.identifyBottlenecks(sessionId),
      peakActivityTime: this.findPeakActivityTime(sessionId),
    };
  }

  // Identifica bottleneck
  private identifyBottlenecks(sessionId: string): string[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const bottlenecks: string[] = [];

    // Verifica partecipanti inattivi
    const inactiveParticipants = session.participants.filter(p => !p.isActive).length;
    if (inactiveParticipants > session.participants.length * 0.3) {
      bottlenecks.push('Molti partecipanti inattivi');
    }

    // Verifica partecipanti con poche contribuzioni
    const lowContributors = session.participants.filter(
      p => p.contributions.changesCount + p.contributions.commentsCount < 2
    ).length;
    if (lowContributors > session.participants.length * 0.5) {
      bottlenecks.push('Bassa partecipazione del team');
    }

    return bottlenecks;
  }

  // Trova picco attività
  private findPeakActivityTime(sessionId: string): Date {
    const messages = this.messages.get(sessionId) || [];
    if (messages.length === 0) return new Date();

    // Raggruppa messaggi per ora del giorno
    const hourlyActivity = new Array(24).fill(0);
    messages.forEach(msg => {
      const hour = msg.timestamp.getHours();
      hourlyActivity[hour]++;
    });

    const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
    const peakTime = new Date();
    peakTime.setHours(peakHour, 0, 0, 0);

    return peakTime;
  }

  // Avvia heartbeat per mantenere connessioni attive
  private startHeartbeat() {
    setInterval(() => {
      const now = new Date();

      // Verifica connessioni scadute
      this.connections.forEach((connection, connectionId) => {
        if (now.getTime() - connection.lastHeartbeat.getTime() > this.config.connectionTimeout) {
          connection.isActive = false;

          // Aggiorna presenza utente
          if (connection.sessionId) {
            this.updatePresence(connection.sessionId, connection.userId, 'offline');
          }
        }
      });

      // Verifica sessioni inattive
      this.sessions.forEach((session, sessionId) => {
        const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
        if (timeSinceLastActivity > 30 * 60 * 1000) {
          // 30 minuti
          // Aggiorna partecipanti inattivi
          session.participants.forEach(p => {
            if (p.isActive && timeSinceLastActivity > 15 * 60 * 1000) {
              // 15 minuti
              p.presence = 'away';
            }
          });
        }
      });
    }, this.config.heartbeatInterval);
  }

  // Ottieni template disponibili
  getAvailableTemplates(): CollaborationTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  // Ottieni sessione per ID
  getSessionById(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Aggiorna sessione
  updateSession(sessionId: string, updates: Partial<CollaborationSession>): CollaborationSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Sessione ${sessionId} non trovata`);
    }

    const updatedSession = { ...session, ...updates, lastActivity: new Date() };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  // Elimina sessione
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.messages.delete(sessionId);
      // Rimuovi connessioni associate
      this.connections.forEach((connection, connectionId) => {
        if (connection.sessionId === sessionId) {
          this.connections.delete(connectionId);
        }
      });
    }
    return deleted;
  }

  // Ottieni configurazione
  getConfig(): RealtimeConfig {
    return { ...this.config };
  }

  // Aggiorna configurazione
  updateConfig(newConfig: Partial<RealtimeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Istanza singleton del service
export const realtimeService = new RealtimeService();
