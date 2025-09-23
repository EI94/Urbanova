// Tipi per il sistema di workspace collaborativo
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  companyName: string;
  companyDomain?: string;
  ownerId: string; // ID dell'utente che ha creato il workspace
  createdAt: Date;
  updatedAt: Date;
  settings: {
    allowGuestAccess: boolean;
    requireApprovalForJoins: boolean;
    maxMembers: number;
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    seats: number;
    usedSeats: number;
    expiresAt?: Date;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: Date;
  invitedBy: string;
  permissions: {
    canCreateProjects: boolean;
    canEditProjects: boolean;
    canDeleteProjects: boolean;
    canInviteMembers: boolean;
    canManageSettings: boolean;
  };
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface SharedProject {
  id: string;
  projectId: string; // ID del progetto originale
  projectType: 'feasibility' | 'business-plan' | 'market-intelligence' | 'design';
  workspaceId: string;
  sharedBy: string;
  sharedAt: Date;
  permissions: {
    canView: string[]; // Array di user IDs
    canEdit: string[]; // Array di user IDs
    canDelete: string[]; // Array di user IDs
  };
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
}

export interface ProjectCollaboration {
  id: string;
  projectId: string;
  workspaceId: string;
  collaboratorId: string;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canComment: boolean;
  };
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface CollaborationActivity {
  id: string;
  projectId: string;
  workspaceId: string;
  userId: string;
  action: 'created' | 'modified' | 'shared' | 'commented' | 'viewed';
  description: string;
  metadata?: any;
  timestamp: Date;
}

// Tipi per le notifiche
export interface WorkspaceNotification {
  id: string;
  workspaceId: string;
  userId: string;
  type: 'invitation' | 'project_shared' | 'project_modified' | 'member_joined' | 'comment_added';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

// Tipi per le API
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  companyName: string;
  companyDomain?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

export interface ShareProjectRequest {
  projectId: string;
  projectType: 'feasibility' | 'business-plan' | 'market-intelligence' | 'design';
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
}

export interface UpdateProjectPermissionsRequest {
  projectId: string;
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
}
