'use client';

import React, { useState, useEffect } from 'react';

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  AlertTriangleIcon as ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ChartBarIcon,
  BellIcon,
  FilterIcon,
  SortAscIcon,
  SortDescIcon,
} from '@/components/icons';
import { workflowService } from '@/lib/workflowService';
import { TeamRole } from '@/types/team';
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

import { Badge } from './Badge';
import Button from './Button';

interface WorkflowManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserRole: TeamRole;
}

export default function WorkflowManagement({
  isOpen,
  onClose,
  currentUserId,
  currentUserRole,
}: WorkflowManagementProps) {
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'approvals' | 'analytics'>(
    'workflows'
  );
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showWorkflowDetails, setShowWorkflowDetails] = useState(false);
  const [filters, setFilters] = useState<WorkflowFilter>({});
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form per creazione workflow
  const [newWorkflow, setNewWorkflow] = useState({
    templateId: '',
    name: '',
    description: '',
    priority: 'medium' as const,
    context: {},
  });

  // Form per approvazione
  const [approvalForm, setApprovalForm] = useState({
    action: 'approve' as ApprovalAction,
    comments: '',
    requestedChanges: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    // Carica workflow dell'utente
    const userWorkflows = workflowService.getUserWorkflows(currentUserId, filters);
    setWorkflows(userWorkflows);

    // Carica template disponibili
    const availableTemplates = workflowService.getAvailableTemplates();
    setTemplates(availableTemplates);

    // Carica notifiche
    const userNotifications = workflowService.getUserNotifications(currentUserId);
    setNotifications(userNotifications);

    // Carica metriche
    const workflowMetrics = workflowService.getWorkflowMetrics();
    setMetrics(workflowMetrics);
  };

  const handleCreateWorkflow = () => {
    try {
      const workflow = workflowService.createWorkflow(
        newWorkflow.templateId,
        newWorkflow.name,
        newWorkflow.description,
        currentUserId,
        newWorkflow.context,
        newWorkflow.priority
      );

      setWorkflows(prev => [workflow, ...prev]);
      setShowCreateForm(false);
      setNewWorkflow({
        templateId: '',
        name: '',
        description: '',
        priority: 'medium',
        context: {},
      });

      // Aggiorna metriche
      const updatedMetrics = workflowService.getWorkflowMetrics();
      setMetrics(updatedMetrics);
    } catch (error) {
      console.error('Errore creazione workflow:', error);
    }
  };

  const handleStartWorkflow = (workflowId: string) => {
    try {
      const updatedWorkflow = workflowService.startWorkflow(workflowId);
      setWorkflows(prev => prev.map(w => (w.id === workflowId ? updatedWorkflow : w)));

      // Aggiorna notifiche
      const userNotifications = workflowService.getUserNotifications(currentUserId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Errore avvio workflow:', error);
    }
  };

  const handleApproveStep = (workflowId: string, stepId: string) => {
    try {
      const updatedWorkflow = workflowService.approveStep(
        workflowId,
        stepId,
        currentUserId,
        approvalForm.action,
        approvalForm.comments,
        approvalForm.action === 'request_changes' ? approvalForm.requestedChanges : undefined
      );

      setWorkflows(prev => prev.map(w => (w.id === workflowId ? updatedWorkflow : w)));
      setApprovalForm({ action: 'approve', comments: '', requestedChanges: [] });

      // Aggiorna metriche
      const updatedMetrics = workflowService.getWorkflowMetrics();
      setMetrics(updatedMetrics);
    } catch (error) {
      console.error('Errore approvazione step:', error);
    }
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    workflowService.markNotificationAsRead(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'draft':
        return '📝';
      case 'pending_approval':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '🚫';
      default:
        return '📝';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🟠';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🔄 Workflow Management & Approvals</h2>
              <p className="text-purple-100">
                Gestisci workflow, approvazioni e processi collaborativi
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'workflows', name: '📋 Workflow', count: workflows.length },
              { id: 'templates', name: '📝 Template', count: templates.length },
              {
                id: 'approvals',
                name: '✅ Approvazioni',
                count: notifications.filter(n => n.type === 'approval_required').length,
              },
              { id: 'analytics', name: '📊 Analytics', count: 0 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Tab: Workflows */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              {/* Header con filtri e creazione */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">I tuoi Workflow</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={filters.status?.[0] || ''}
                      onChange={e =>
                        setFilters((prev: any) => ({
                          ...prev,
                          status: e.target.value ? [e.target.value] : undefined,
                        }))
                      }
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="">Tutti gli stati</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">In attesa</option>
                      <option value="approved">Approvato</option>
                      <option value="rejected">Rifiutato</option>
                      <option value="completed">Completato</option>
                    </select>
                    <select
                      value={filters.priority?.[0] || ''}
                      onChange={e =>
                        setFilters((prev: any) => ({
                          ...prev,
                          priority: e.target.value ? [e.target.value] : undefined,
                        }))
                      }
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="">Tutte le priorità</option>
                      <option value="low">Bassa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Critica</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <PlusIcon />
                  <span>Nuovo Workflow</span>
                </button>
              </div>

              {/* Lista Workflow */}
              <div className="grid gap-4">
                {workflows.map(workflow => (
                  <div
                    key={workflow.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setShowWorkflowDetails(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                          <Badge className={getStatusColor(workflow.status)}>
                            {getStatusIcon(workflow.status)} {workflow.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(workflow.priority)}>
                            {getPriorityIcon(workflow.priority)} {workflow.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{workflow.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {workflow.createdAt.toLocaleDateString()}</span>
                          <span>📊 {workflow.progress}% completato</span>
                          <span>👥 {workflow.participants.length} partecipanti</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {workflow.status === 'draft' && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleStartWorkflow(workflow.id);
                            }}
                            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
                            title="Avvia Workflow"
                          >
                            <PlayIcon />
                          </button>
                        )}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedWorkflow(workflow);
                            setShowWorkflowDetails(true);
                          }}
                          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                          title="Visualizza Dettagli"
                        >
                          <EyeIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {workflows.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nessun workflow trovato
                  </h3>
                  <p className="text-gray-500">
                    Crea il tuo primo workflow per iniziare a collaborare!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Templates */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Template Disponibili</h3>
              <div className="grid gap-4">
                {templates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {template.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>⏱️ {template.estimatedTotalDuration}h stimato</span>
                      <span>👥 {template.requiredRoles.length} ruoli richiesti</span>
                      <span>📝 v{template.version}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Approvazioni */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Approvazioni Richieste</h3>
              <div className="grid gap-4">
                {notifications
                  .filter(n => n.type === 'approval_required')
                  .map(notification => (
                    <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {getPriorityIcon(notification.priority)} {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          📅 {notification.createdAt.toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMarkNotificationAsRead(notification.id)}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                          >
                            Marca come letto
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {notifications.filter(n => n.type === 'approval_required').length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nessuna approvazione richiesta
                  </h3>
                  <p className="text-gray-500">Tutte le approvazioni sono state gestite!</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Analytics */}
          {activeTab === 'analytics' && metrics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Workflow</h3>

              {/* Metriche principali */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ChartBarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Totali</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metrics.totalWorkflows}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Attivi</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metrics.activeWorkflows}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Completati</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metrics.completedWorkflows}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BellIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Tasso Approvazione</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {metrics.approvalRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">🏆 Top Performers</h4>
                <div className="space-y-3">
                  {metrics.topPerformers.map((performer, index) => (
                    <div key={performer.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">#{index + 1}</span>
                        <span className="font-medium">{performer.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>✅ {performer.completedWorkflows} completati</span>
                        <span>⏱️ {performer.averageResponseTime.toFixed(1)}h media</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottlenecks */}
              {metrics.bottlenecks.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">⚠️ Bottlenecks Identificati</h4>
                  <div className="space-y-2">
                    {metrics.bottlenecks.map((bottleneck, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <span>🔴</span>
                        <span>{bottleneck}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Creazione Workflow */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crea Nuovo Workflow</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select
                    value={newWorkflow.templateId}
                    onChange={e =>
                      setNewWorkflow(prev => ({ ...prev, templateId: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleziona template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newWorkflow.name}
                    onChange={e => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Nome del workflow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={newWorkflow.description}
                    onChange={e =>
                      setNewWorkflow(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Descrizione del workflow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
                  <select
                    value={newWorkflow.priority}
                    onChange={e =>
                      setNewWorkflow(prev => ({ ...prev, priority: e.target.value as any }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Critica</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateWorkflow}
                  disabled={!newWorkflow.templateId || !newWorkflow.name}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crea Workflow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dettagli Workflow */}
        {showWorkflowDetails && selectedWorkflow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedWorkflow.name}</h3>
                <button
                  onClick={() => setShowWorkflowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Info generali */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Stato</p>
                    <Badge className={getStatusColor(selectedWorkflow.status)}>
                      {getStatusIcon(selectedWorkflow.status)}{' '}
                      {selectedWorkflow.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Priorità</p>
                    <Badge className={getPriorityColor(selectedWorkflow.priority)}>
                      {getPriorityIcon(selectedWorkflow.priority)} {selectedWorkflow.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Progresso</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedWorkflow.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{selectedWorkflow.progress}%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Creato il</p>
                    <p className="text-sm text-gray-900">
                      {selectedWorkflow.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📋 Steps del Workflow</h4>
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-medium text-gray-500">#{step.order}</span>
                            <div>
                              <h5 className="font-medium text-gray-900">{step.name}</h5>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                step.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : step.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }
                            >
                              {step.status === 'completed'
                                ? '✅'
                                : step.status === 'in_progress'
                                  ? '⏳'
                                  : '⏸️'}{' '}
                              {step.status}
                            </Badge>
                            {step.requiredRole && (
                              <Badge className="bg-blue-100 text-blue-800">
                                👤 {step.requiredRole}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Form approvazione per step corrente */}
                        {step.status === 'in_progress' && step.requiredRole === currentUserRole && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h6 className="font-medium text-gray-900 mb-2">
                              Richiesta approvazione
                            </h6>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Azione
                                </label>
                                <select
                                  value={approvalForm.action}
                                  onChange={e =>
                                    setApprovalForm(prev => ({
                                      ...prev,
                                      action: e.target.value as ApprovalAction,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                >
                                  <option value="approve">✅ Approva</option>
                                  <option value="reject">❌ Rifiuta</option>
                                  <option value="request_changes">🔄 Richiedi modifiche</option>
                                  <option value="delegate">👥 Delega</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Commenti
                                </label>
                                <textarea
                                  value={approvalForm.comments}
                                  onChange={e =>
                                    setApprovalForm(prev => ({ ...prev, comments: e.target.value }))
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                  rows={2}
                                  placeholder="Commenti o note..."
                                />
                              </div>

                              <button
                                onClick={() => handleApproveStep(selectedWorkflow.id, step.id)}
                                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                              >
                                Invia Decisione
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approvazioni */}
                {selectedWorkflow.approvals.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">✅ Storico Approvazioni</h4>
                    <div className="space-y-2">
                      {selectedWorkflow.approvals.map(approval => (
                        <div
                          key={approval.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {approval.action === 'approve'
                                ? '✅'
                                : approval.action === 'reject'
                                  ? '❌'
                                  : approval.action === 'request_changes'
                                    ? '🔄'
                                    : '👥'}{' '}
                              {approval.action}
                            </span>
                            <span className="text-sm text-gray-900">da {approval.approverId}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {approval.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
