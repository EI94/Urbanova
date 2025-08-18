// Tipi per il sistema di ruoli e permessi team

export type TeamRole = 'PROJECT_MANAGER' | 'FINANCIAL_ANALYST' | 'ARCHITECT' | 'DEVELOPER' | 'TEAM_MEMBER';

export type Permission = 
  // Gestione Sessioni
  | 'CREATE_SESSIONS'
  | 'JOIN_SESSIONS'
  | 'MANAGE_SESSIONS'
  | 'DELETE_SESSIONS'
  
  // Gestione Commenti
  | 'ADD_COMMENTS'
  | 'EDIT_COMMENTS'
  | 'DELETE_COMMENTS'
  | 'MODERATE_COMMENTS'
  
  // Gestione Preferiti
  | 'ADD_TO_FAVORITES'
  | 'REMOVE_FROM_FAVORITES'
  | 'UPDATE_PRIORITY'
  | 'UPDATE_STATUS'
  
  // Gestione Team
  | 'INVITE_MEMBERS'
  | 'REMOVE_MEMBERS'
  | 'ASSIGN_ROLES'
  | 'MANAGE_PERMISSIONS'
  
  // Analytics e Reporting
  | 'VIEW_ANALYTICS'
  | 'EXPORT_REPORTS'
  | 'VIEW_TEAM_PERFORMANCE'
  
  // Approvazioni
  | 'APPROVE_DECISIONS'
  | 'REJECT_DECISIONS'
  | 'OVERRIDE_DECISIONS';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: TeamRole;
  permissions: Permission[];
  isOnline: boolean;
  lastSeen: Date;
  currentActivity: string;
  joinDate: Date;
  isActive: boolean;
  performance: {
    commentsCount: number;
    votesCount: number;
    favoritesCount: number;
    sessionsCreated: number;
    sessionsJoined: number;
    lastActivity: Date;
  };
}

export interface RolePermissions {
  role: TeamRole;
  permissions: Permission[];
  description: string;
  capabilities: string[];
}

export interface TeamSession {
  id: string;
  name: string;
  description: string;
  criteria: any;
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdBy: string;
  createdAt: Date;
  participants: TeamSessionParticipant[];
  isPublic: boolean;
  currentResults: number;
  maxResults: number;
  permissions: {
    canJoin: TeamRole[];
    canEdit: TeamRole[];
    canDelete: TeamRole[];
    canManage: TeamRole[];
  };
  workflow: {
    currentStep: string;
    steps: WorkflowStep[];
    approvals: Approval[];
  };
}

export interface TeamSessionParticipant {
  memberId: string;
  role: TeamRole;
  joinedAt: Date;
  permissions: Permission[];
  contributions: {
    comments: number;
    votes: number;
    favorites: number;
    analysis: number;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  requiredRole: TeamRole;
  requiredApprovals: number;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  dependencies: string[];
}

export interface Approval {
  id: string;
  stepId: string;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  requiredRole: TeamRole;
}

export interface TeamComment {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: TeamRole;
  memberAvatar: string;
  landId: string;
  comment: string;
  timestamp: Date;
  type: 'comment' | 'vote' | 'favorite' | 'analysis' | 'technical' | 'financial';
  likes: number;
  dislikes: number;
  replies: TeamComment[];
  isEdited: boolean;
  tags: string[];
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canModerate: boolean;
  };
  moderation: {
    isFlagged: boolean;
    flaggedBy?: string;
    flaggedAt?: Date;
    flagReason?: string;
    isHidden: boolean;
    moderatedBy?: string;
    moderatedAt?: Date;
  };
}

export interface SharedFavorite {
  id: string;
  landId: string;
  landTitle: string;
  landLocation: string;
  landPrice: number;
  landArea: number;
  addedBy: string;
  addedAt: Date;
  teamVotes: TeamVote[];
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'analyzing' | 'rejected' | 'approved';
  permissions: {
    canUpdatePriority: TeamRole[];
    canUpdateStatus: TeamRole[];
    canRemove: TeamRole[];
  };
  workflow: {
    currentStep: string;
    requiredApprovals: Approval[];
    isApproved: boolean;
  };
}

export interface TeamVote {
  memberId: string;
  memberName: string;
  memberRole: TeamRole;
  vote: 'like' | 'dislike' | 'neutral';
  comment?: string;
  timestamp: Date;
  weight: number; // Peso del voto basato sul ruolo
}

export interface TeamAnalytics {
  teamId: string;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  metrics: {
    totalMembers: number;
    activeMembers: number;
    totalSessions: number;
    activeSessions: number;
    totalComments: number;
    totalVotes: number;
    totalFavorites: number;
    averageResponseTime: number;
    collaborationScore: number;
  };
  memberPerformance: {
    memberId: string;
    name: string;
    role: TeamRole;
    contributions: number;
    engagement: number;
    quality: number;
    lastActivity: Date;
  }[];
  sessionMetrics: {
    sessionId: string;
    name: string;
    participants: number;
    comments: number;
    votes: number;
    duration: number;
    completionRate: number;
  }[];
}

export interface TeamInvitation {
  id: string;
  email: string;
  invitedBy: string;
  invitedAt: Date;
  role: TeamRole;
  permissions: Permission[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: string;
}

export interface TeamSettings {
  teamId: string;
  name: string;
  description: string;
  isPublic: boolean;
  allowInvitations: boolean;
  requireApproval: boolean;
  defaultPermissions: Permission[];
  workflowSettings: {
    requireApprovalForFavorites: boolean;
    requireApprovalForSessions: boolean;
    autoArchiveSessions: boolean;
    archiveAfterDays: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    mentionNotifications: boolean;
    approvalNotifications: boolean;
  };
}
