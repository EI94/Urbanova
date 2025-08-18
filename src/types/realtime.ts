// Tipi per il sistema di Real-time Collaboration

export type CollaborationType = 'document' | 'search' | 'analysis' | 'workflow' | 'presentation';

export type UserPresence = 'online' | 'away' | 'busy' | 'offline';

export type CursorPosition = {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  timestamp: Date;
};

export type DocumentChange = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  type: 'insert' | 'delete' | 'update' | 'format';
  position: number;
  content?: string;
  oldContent?: string;
  timestamp: Date;
  metadata?: {
    field?: string;
    property?: string;
    value?: any;
  };
};

export type LiveComment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  content: string;
  position?: {
    x: number;
    y: number;
    field?: string;
  };
  timestamp: Date;
  replies: LiveComment[];
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  reactions: {
    [emoji: string]: string[]; // emoji -> array di userId
  };
};

export type CollaborationSession = {
  id: string;
  name: string;
  description: string;
  type: CollaborationType;
  status: 'active' | 'paused' | 'completed' | 'archived';
  
  // Partecipanti
  participants: CollaborationParticipant[];
  maxParticipants: number;
  
  // Contenuto condiviso
  sharedContent: {
    documentId?: string;
    searchCriteria?: any;
    analysisData?: any;
    workflowId?: string;
  };
  
  // Timeline
  createdAt: Date;
  startedAt: Date;
  lastActivity: Date;
  endedAt?: Date;
  
  // Impostazioni
  isPublic: boolean;
  allowAnonymous: boolean;
  requireApproval: boolean;
  
  // Permessi
  permissions: {
    canEdit: string[];
    canComment: string[];
    canInvite: string[];
    canManage: string[];
  };
  
  // Metadata
  tags: string[];
  attachments: string[];
  notes: string;
};

export interface CollaborationParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  joinedAt: Date;
  lastSeen: Date;
  isActive: boolean;
  currentActivity: string;
  
  // Presenza e cursore
  presence: UserPresence;
  cursorPosition?: CursorPosition;
  
  // Permessi specifici
  permissions: string[];
  
  // Performance
  contributions: {
    changesCount: number;
    commentsCount: number;
    timeSpent: number; // in minuti
  };
}

export interface RealtimeMessage {
  id: string;
  sessionId: string;
  type: 'cursor_move' | 'document_change' | 'comment' | 'presence_update' | 'user_joined' | 'user_left' | 'session_update';
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  timestamp: Date;
  data: any;
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    expiresAt?: Date;
    retryCount?: number;
  };
}

export interface CollaborationMetrics {
  sessionId: string;
  totalParticipants: number;
  activeParticipants: number;
  totalChanges: number;
  totalComments: number;
  averageResponseTime: number; // in millisecondi
  collaborationScore: number; // 0-100
  topContributors: Array<{
    userId: string;
    userName: string;
    contributions: number;
    responseTime: number;
  }>;
  bottlenecks: string[];
  peakActivityTime: Date;
}

export interface RealtimeConnection {
  id: string;
  userId: string;
  sessionId: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  isActive: boolean;
  userAgent: string;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
}

export interface CollaborationTemplate {
  id: string;
  name: string;
  description: string;
  type: CollaborationType;
  defaultPermissions: string[];
  defaultMaxParticipants: number;
  features: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealtimeNotification {
  id: string;
  userId: string;
  sessionId: string;
  type: 'user_joined' | 'user_left' | 'document_changed' | 'comment_added' | 'cursor_moved' | 'presence_changed';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  expiresAt?: Date;
}

export interface CollaborationFilter {
  type?: CollaborationType[];
  status?: string[];
  participants?: string[];
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  isPublic?: boolean;
}

export interface RealtimeConfig {
  heartbeatInterval: number; // in millisecondi
  cursorUpdateThrottle: number; // in millisecondi
  maxRetries: number;
  connectionTimeout: number; // in millisecondi
  maxConnectionsPerUser: number;
  enablePresence: boolean;
  enableCursors: boolean;
  enableLiveComments: boolean;
  enableDocumentSync: boolean;
}
