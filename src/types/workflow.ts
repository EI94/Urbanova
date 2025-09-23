// Tipi per il sistema di Workflow Management & Approvals

export type WorkflowStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type WorkflowType =
  | 'land_approval'
  | 'financial_decision'
  | 'technical_review'
  | 'team_decision'
  | 'project_approval';

export type ApprovalAction = 'approve' | 'reject' | 'request_changes' | 'delegate';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredRole: string;
  requiredPermissions: string[];
  isOptional: boolean;
  estimatedDuration: number; // in ore
  dependencies: string[]; // ID degli step precedenti
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignee?: string;
  completedAt?: Date;
  notes?: string;
}

export interface WorkflowApproval {
  id: string;
  workflowId: string;
  stepId: string;
  approverId: string;
  approverRole: string;
  action: ApprovalAction;
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  comments?: string;
  requestedChanges?: string[];
  delegatedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  reminderSent: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  version: string;
  isActive: boolean;
  steps: WorkflowStep[];
  estimatedTotalDuration: number;
  requiredRoles: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  description: string;
  type: WorkflowType;
  status: WorkflowStatus;
  currentStep: number;
  currentStepId: string;
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Dati specifici del workflow
  context: {
    landId?: string;
    projectId?: string;
    decisionType?: string;
    amount?: number;
    technicalDetails?: any;
  };

  // Partecipanti e responsabili
  initiator: string;
  participants: string[];
  assignees: Record<string, string>; // stepId -> userId

  // Timeline
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  deadline?: Date;

  // Steps e approvazioni
  steps: WorkflowStep[];
  approvals: WorkflowApproval[];

  // Metadata
  tags: string[];
  attachments: string[];
  notes: string;

  // Notifiche
  lastNotificationSent?: Date;
  nextReminderDate?: Date;
}

export interface WorkflowNotification {
  id: string;
  workflowId: string;
  userId: string;
  type:
    | 'approval_required'
    | 'workflow_started'
    | 'workflow_completed'
    | 'deadline_approaching'
    | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  expiresAt?: Date;
}

export interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  averageCompletionTime: number; // in ore
  approvalRate: number; // percentuale
  rejectionRate: number; // percentuale
  bottlenecks: string[]; // step che causano più ritardi
  topPerformers: Array<{
    userId: string;
    name: string;
    completedWorkflows: number;
    averageResponseTime: number;
  }>;
}

export interface WorkflowFilter {
  status?: WorkflowStatus[];
  type?: WorkflowType[];
  priority?: string[];
  assignee?: string;
  initiator?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}
