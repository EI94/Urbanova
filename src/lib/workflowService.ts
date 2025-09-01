// Service per la gestione dei Workflow e Approvazioni
import { TeamRole, Permission } from '@/types/team';
import {
  WorkflowInstance,
  WorkflowTemplate,
  WorkflowStep,
  WorkflowApproval,
  WorkflowStatus,
  WorkflowType,
  ApprovalAction,
  WorkflowNotification,
  WorkflowMetrics,
  WorkflowFilter,
} from '@/types/workflow';

export class WorkflowService {
  private workflows: Map<string, WorkflowInstance> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();
  private notifications: Map<string, WorkflowNotification> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  // Inizializza template predefiniti
  private initializeDefaultTemplates() {
    // Template per approvazione terreno
    const landApprovalTemplate: WorkflowTemplate = {
      id: 'land-approval-v1',
      name: 'Approvazione Terreno',
      description: 'Workflow per approvazione acquisto o sviluppo terreno',
      type: 'land_approval',
      version: '1.0',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Analisi Tecnica',
          description: 'Valutazione fattibilità tecnica del terreno',
          order: 1,
          requiredRole: 'ARCHITECT',
          requiredPermissions: ['VIEW_ANALYTICS'],
          isOptional: false,
          estimatedDuration: 8,
          dependencies: [],
          status: 'pending',
        },
        {
          id: 'step-2',
          name: 'Analisi Finanziaria',
          description: 'Valutazione ROI e sostenibilità economica',
          order: 2,
          requiredRole: 'FINANCIAL_ANALYST',
          requiredPermissions: ['VIEW_ANALYTICS'],
          isOptional: false,
          estimatedDuration: 12,
          dependencies: ['step-1'],
          status: 'pending',
        },
        {
          id: 'step-3',
          name: 'Approvazione Finale',
          description: 'Decisione finale del Project Manager',
          order: 3,
          requiredRole: 'PROJECT_MANAGER',
          requiredPermissions: ['APPROVE_DECISIONS'],
          isOptional: false,
          estimatedDuration: 2,
          dependencies: ['step-1', 'step-2'],
          status: 'pending',
        },
      ],
      estimatedTotalDuration: 22,
      requiredRoles: ['ARCHITECT', 'FINANCIAL_ANALYST', 'PROJECT_MANAGER'],
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Template per decisione finanziaria
    const financialDecisionTemplate: WorkflowTemplate = {
      id: 'financial-decision-v1',
      name: 'Decisione Finanziaria',
      description: 'Workflow per decisioni finanziarie critiche',
      type: 'financial_decision',
      version: '1.0',
      isActive: true,
      steps: [
        {
          id: 'step-1',
          name: 'Analisi Dettagliata',
          description: 'Analisi finanziaria approfondita',
          order: 1,
          requiredRole: 'FINANCIAL_ANALYST',
          requiredPermissions: ['VIEW_ANALYTICS'],
          isOptional: false,
          estimatedDuration: 16,
          dependencies: [],
          status: 'pending',
        },
        {
          id: 'step-2',
          name: 'Review Team',
          description: 'Review da parte del team finanziario',
          order: 2,
          requiredRole: 'TEAM_MEMBER',
          requiredPermissions: ['VIEW_ANALYTICS'],
          isOptional: true,
          estimatedDuration: 4,
          dependencies: ['step-1'],
          status: 'pending',
        },
        {
          id: 'step-3',
          name: 'Approvazione PM',
          description: 'Approvazione del Project Manager',
          order: 3,
          requiredRole: 'PROJECT_MANAGER',
          requiredPermissions: ['APPROVE_DECISIONS'],
          isOptional: false,
          estimatedDuration: 2,
          dependencies: ['step-1'],
          status: 'pending',
        },
      ],
      estimatedTotalDuration: 22,
      requiredRoles: ['FINANCIAL_ANALYST', 'TEAM_MEMBER', 'PROJECT_MANAGER'],
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(landApprovalTemplate.id, landApprovalTemplate);
    this.templates.set(financialDecisionTemplate.id, financialDecisionTemplate);
  }

  // Crea un nuovo workflow
  createWorkflow(
    templateId: string,
    name: string,
    description: string,
    initiator: string,
    context: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): WorkflowInstance {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} non trovato`);
    }

    const workflowId = `workflow-${Date.now()}`;
    const workflow: WorkflowInstance = {
      id: workflowId,
      templateId,
      name,
      description,
      type: template.type,
      status: 'draft',
      currentStep: 0,
      currentStepId: template.steps[0]?.id || '',
      progress: 0,
      priority,
      context,
      initiator,
      participants: [initiator],
      assignees: {},
      createdAt: new Date(),
      steps: template.steps.map(step => ({ ...step, status: 'pending' })),
      approvals: [],
      tags: [],
      attachments: [],
      notes: '',
      lastNotificationSent: new Date(),
      nextReminderDate: new Date(),
    };

    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  // Avvia un workflow
  startWorkflow(workflowId: string): WorkflowInstance {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} non trovato`);
    }

    if (workflow.status !== 'draft') {
      throw new Error('Workflow può essere avviato solo se in stato draft');
    }

    workflow.status = 'pending_approval';
    workflow.startedAt = new Date();
    workflow.currentStep = 1;
    workflow.currentStepId = workflow.steps[0]?.id || '';
    workflow.progress = 0;

    // Crea notifiche per i partecipanti
    this.createNotificationsForWorkflow(workflow);

    return workflow;
  }

  // Crea notifiche per un workflow
  private createNotificationsForWorkflow(workflow: WorkflowInstance) {
    const currentStep = workflow.steps.find(s => s.id === workflow.currentStepId);
    if (!currentStep) return;

    const notification: WorkflowNotification = {
      id: `notification-${Date.now()}`,
      workflowId: workflow.id,
      userId: currentStep.assignee || workflow.initiator,
      type: 'approval_required',
      title: `Approvazione richiesta: ${workflow.name}`,
      message: `È richiesta la tua approvazione per il workflow "${workflow.name}" - Step: ${currentStep.name}`,
      priority: workflow.priority,
      isRead: false,
      createdAt: new Date(),
      actionUrl: `/dashboard/workflows/${workflow.id}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
    };

    this.notifications.set(notification.id, notification);
  }

  // Approva uno step
  approveStep(
    workflowId: string,
    stepId: string,
    approverId: string,
    action: ApprovalAction,
    comments?: string,
    requestedChanges?: string[]
  ): WorkflowInstance {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} non trovato`);
    }

    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} non trovato nel workflow`);
    }

    // Crea l'approvazione
    const approval: WorkflowApproval = {
      id: `approval-${Date.now()}`,
      workflowId,
      stepId,
      approverId,
      approverRole: 'TEAM_MEMBER', // TODO: ottenere ruolo reale
      action,
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'delegated',
      comments: comments || '',
      requestedChanges: requestedChanges || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: workflow.priority,
      reminderSent: false,
    };

    workflow.approvals.push(approval);

    // Aggiorna lo step
    if (action === 'approve') {
      step.status = 'completed';
      step.completedAt = new Date();
      step.assignee = approverId;

      // Passa al prossimo step
      this.moveToNextStep(workflow);
    } else if (action === 'reject') {
      workflow.status = 'rejected';
      step.status = 'in_progress';
    } else if (action === 'request_changes') {
      step.status = 'in_progress';
      step.notes = comments || '';
    }

    return workflow;
  }

  // Passa al prossimo step
  private moveToNextStep(workflow: WorkflowInstance) {
    const currentStepIndex = workflow.steps.findIndex(s => s.id === workflow.currentStepId);
    const nextStep = workflow.steps[currentStepIndex + 1];

    if (nextStep) {
      workflow.currentStep = currentStepIndex + 2;
      workflow.currentStepId = nextStep.id;
      workflow.progress = Math.round(((currentStepIndex + 1) / workflow.steps.length) * 100);

      // Aggiorna lo step corrente
      nextStep.status = 'in_progress';

      // Crea notifiche per il nuovo step
      this.createNotificationsForWorkflow(workflow);
    } else {
      // Workflow completato
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      workflow.progress = 100;

      // Notifica completamento
      this.createCompletionNotification(workflow);
    }
  }

  // Crea notifica di completamento
  private createCompletionNotification(workflow: WorkflowInstance) {
    const notification: WorkflowNotification = {
      id: `notification-${Date.now()}`,
      workflowId: workflow.id,
      userId: workflow.initiator,
      type: 'workflow_completed',
      title: `Workflow completato: ${workflow.name}`,
      message: `Il workflow "${workflow.name}" è stato completato con successo!`,
      priority: 'low',
      isRead: false,
      createdAt: new Date(),
      actionUrl: `/dashboard/workflows/${workflow.id}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
    };

    this.notifications.set(notification.id, notification);
  }

  // Ottieni workflow per utente
  getUserWorkflows(userId: string, filter?: WorkflowFilter): WorkflowInstance[] {
    let workflows = Array.from(this.workflows.values()).filter(
      w => w.participants.includes(userId) || w.initiator === userId
    );

    if (filter) {
      if (filter.status?.length) {
        workflows = workflows.filter(w => filter.status!.includes(w.status));
      }
      if (filter.type?.length) {
        workflows = workflows.filter(w => filter.type!.includes(w.type));
      }
      if (filter.priority?.length) {
        workflows = workflows.filter(w => filter.priority!.includes(w.priority));
      }
      if (filter.assignee) {
        workflows = workflows.filter(w => Object.values(w.assignees).includes(filter.assignee!));
      }
      if (filter.initiator) {
        workflows = workflows.filter(w => w.initiator === filter.initiator);
      }
    }

    return workflows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Ottieni notifiche per utente
  getUserNotifications(userId: string): WorkflowNotification[] {
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

  // Ottieni metriche workflow
  getWorkflowMetrics(): WorkflowMetrics {
    const workflows = Array.from(this.workflows.values());
    const completedWorkflows = workflows.filter(w => w.status === 'completed');

    const totalCompletionTime = completedWorkflows.reduce((total, w) => {
      if (w.startedAt && w.completedAt) {
        return total + (w.completedAt.getTime() - w.startedAt.getTime());
      }
      return total;
    }, 0);

    const averageCompletionTime =
      completedWorkflows.length > 0
        ? totalCompletionTime / completedWorkflows.length / (1000 * 60 * 60) // converti in ore
        : 0;

    const totalApprovals = workflows.reduce((total, w) => total + w.approvals.length, 0);
    const approvedApprovals = workflows.reduce(
      (total, w) => total + w.approvals.filter(a => a.status === 'approved').length,
      0
    );

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'pending_approval').length,
      completedWorkflows: completedWorkflows.length,
      averageCompletionTime,
      approvalRate: totalApprovals > 0 ? (approvedApprovals / totalApprovals) * 100 : 0,
      rejectionRate:
        totalApprovals > 0 ? ((totalApprovals - approvedApprovals) / totalApprovals) * 100 : 0,
      bottlenecks: this.identifyBottlenecks(workflows),
      topPerformers: this.identifyTopPerformers(workflows),
    };
  }

  // Identifica bottleneck nei workflow
  private identifyBottlenecks(workflows: WorkflowInstance[]): string[] {
    const stepDelays: Record<string, number> = {};

    workflows.forEach(workflow => {
      workflow.steps.forEach(step => {
        if (step.status === 'in_progress' && step.estimatedDuration) {
          const stepKey = `${workflow.type}-${step.name}`;
          stepDelays[stepKey] = (stepDelays[stepKey] || 0) + step.estimatedDuration;
        }
      });
    });

    return Object.entries(stepDelays)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([step]) => step);
  }

  // Identifica top performers
  private identifyTopPerformers(workflows: WorkflowInstance[]): Array<{
    userId: string;
    name: string;
    completedWorkflows: number;
    averageResponseTime: number;
  }> {
    const userStats: Record<string, { completed: number; responseTime: number; count: number }> =
      {};

    workflows.forEach(workflow => {
      workflow.approvals.forEach(approval => {
        if (approval.status === 'approved' && approval.completedAt) {
          const responseTime = approval.completedAt.getTime() - approval.createdAt.getTime();
          const userKey = approval.approverId;

          if (!userStats[userKey]) {
            userStats[userKey] = { completed: 0, responseTime: 0, count: 0 };
          }

          userStats[userKey].completed++;
          userStats[userKey].responseTime += responseTime;
          userStats[userKey].count++;
        }
      });
    });

    return Object.entries(userStats)
      .map(([userId, stats]) => ({
        userId,
        name: `User ${userId}`, // TODO: ottenere nome reale
        completedWorkflows: stats.completed,
        averageResponseTime:
          stats.count > 0 ? stats.responseTime / stats.count / (1000 * 60 * 60) : 0,
      }))
      .sort((a, b) => b.completedWorkflows - a.completedWorkflows)
      .slice(0, 5);
  }

  // Ottieni template disponibili
  getAvailableTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  // Ottieni workflow per ID
  getWorkflowById(workflowId: string): WorkflowInstance | undefined {
    return this.workflows.get(workflowId);
  }

  // Aggiorna workflow
  updateWorkflow(workflowId: string, updates: Partial<WorkflowInstance>): WorkflowInstance {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} non trovato`);
    }

    const updatedWorkflow = { ...workflow, ...updates, updatedAt: new Date() };
    this.workflows.set(workflowId, updatedWorkflow);
    return updatedWorkflow;
  }

  // Elimina workflow
  deleteWorkflow(workflowId: string): boolean {
    return this.workflows.delete(workflowId);
  }
}

// Istanza singleton del service
export const workflowService = new WorkflowService();
