'use client';

import React, { useState } from 'react';

import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  UsersIcon,
  FileTextIcon,
  StarIcon,
  BuildingIcon,
  EuroIcon,
  CodeIcon,
  ArrowRightIcon,
  EyeIcon,
  MessageCircleIcon,
} from '@/components/icons';
import { TeamRole, teamRoleManager } from '@/lib/teamRoleManager';

import { Badge } from './Badge';
import Button from './Button';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  requiredRole: TeamRole;
  requiredApprovals: number;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

interface Approval {
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
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowItem {
  id: string;
  type: 'favorite' | 'session' | 'comment' | 'analysis';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: Date;
  currentStep: string;
  steps: WorkflowStep[];
  approvals: Approval[];
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface WorkflowApprovalsProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approvalId: string, comments?: string) => void;
  onReject: (approvalId: string, comments: string) => void;
  onCompleteStep: (stepId: string) => void;
  onViewDetails: (itemId: string) => void;
}

export default function WorkflowApprovals({
  isOpen,
  onClose,
  onApprove,
  onReject,
  onCompleteStep,
  onViewDetails,
}: WorkflowApprovalsProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_review' | 'completed' | 'rejected'>(
    'pending'
  );
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
  const [approvalComments, setApprovalComments] = useState('');

  // Mock data per workflow items
  const [workflowItems] = useState<WorkflowItem[]>([
    {
      id: 'wf-1',
      type: 'favorite',
      title: 'Terreno Roma Centro - Approvazione Alta Priorità',
      description:
        'Terreno di 1500m² in zona espansione Roma Centro. Richiede approvazione per priorità alta.',
      submittedBy: 'Laura Bianchi',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      currentStep: 'financial_review',
      steps: [
        {
          id: 'step-1',
          name: 'Analisi Tecnica',
          description: 'Review architettonica e fattibilità tecnica',
          requiredRole: 'ARCHITECT',
          requiredApprovals: 1,
          isCompleted: true,
          completedBy: 'Giuseppe Verdi',
          completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          dependencies: [],
          status: 'completed',
        },
        {
          id: 'step-2',
          name: 'Analisi Finanziaria',
          description: 'Valutazione ROI e proiezioni finanziarie',
          requiredRole: 'FINANCIAL_ANALYST',
          requiredApprovals: 1,
          isCompleted: false,
          dependencies: ['step-1'],
          status: 'in_progress',
        },
        {
          id: 'step-3',
          name: 'Approvazione Finale',
          description: 'Approvazione finale del Project Manager',
          requiredRole: 'PROJECT_MANAGER',
          requiredApprovals: 1,
          isCompleted: false,
          dependencies: ['step-1', 'step-2'],
          status: 'pending',
        },
      ],
      approvals: [
        {
          id: 'app-1',
          stepId: 'step-2',
          requestedBy: 'Laura Bianchi',
          requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'pending',
          requiredRole: 'FINANCIAL_ANALYST',
          priority: 'high',
        },
      ],
      status: 'in_review',
      priority: 'high',
      tags: ['Roma', 'Centro Storico', 'Alta Priorità', 'ROI'],
    },
    {
      id: 'wf-2',
      type: 'session',
      title: 'Sessione Collaborativa Milano - Approvazione',
      description:
        'Nuova sessione di ricerca collaborativa per zona Milano. Richiede approvazione per budget.',
      submittedBy: 'Marco Rossi',
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      currentStep: 'budget_approval',
      steps: [
        {
          id: 'step-1',
          name: 'Review Budget',
          description: 'Analisi e approvazione budget sessione',
          requiredRole: 'FINANCIAL_ANALYST',
          requiredApprovals: 1,
          isCompleted: false,
          dependencies: [],
          status: 'in_progress',
        },
        {
          id: 'step-2',
          name: 'Approvazione PM',
          description: 'Approvazione finale del Project Manager',
          requiredRole: 'PROJECT_MANAGER',
          requiredApprovals: 1,
          isCompleted: false,
          dependencies: ['step-1'],
          status: 'pending',
        },
      ],
      approvals: [
        {
          id: 'app-2',
          stepId: 'step-1',
          requestedBy: 'Marco Rossi',
          requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'pending',
          requiredRole: 'FINANCIAL_ANALYST',
          priority: 'medium',
        },
      ],
      status: 'in_review',
      priority: 'medium',
      tags: ['Milano', 'Sessione', 'Budget', 'Collaborativa'],
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'favorite':
        return '⭐';
      case 'session':
        return '👥';
      case 'comment':
        return '💬';
      case 'analysis':
        return '📊';
      default:
        return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'favorite':
        return 'yellow';
      case 'session':
        return 'blue';
      case 'comment':
        return 'green';
      case 'analysis':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_review':
        return 'info';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'outline';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'pending':
        return '⏳';
      case 'blocked':
        return '🚫';
      default:
        return '⏳';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'outline';
    }
  };

  const filteredItems = workflowItems.filter(item => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'in_review') return item.status === 'in_review';
    if (activeTab === 'completed') return item.status === 'approved';
    if (activeTab === 'rejected') return item.status === 'rejected';
    return true;
  });

  const handleApprove = (approvalId: string) => {
    onApprove(approvalId, approvalComments);
    setApprovalComments('');
  };

  const handleReject = (approvalId: string) => {
    if (approvalComments.trim()) {
      onReject(approvalId, approvalComments);
      setApprovalComments('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6" />
                Workflow e Approvazioni
              </h2>
              <p className="text-green-100 mt-1">
                Gestisci workflow collaborativi e processi di approvazione del team
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:text-green-200 transition-colors">
              <span className="sr-only">Chiudi</span>
              <div className="w-8 h-8 flex items-center justify-center text-2xl">×</div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-4">
            {[
              {
                id: 'pending',
                name: 'In Attesa',
                icon: '⏳',
                count: workflowItems.filter(i => i.status === 'pending').length,
              },
              {
                id: 'in_review',
                name: 'In Revisione',
                icon: '🔍',
                count: workflowItems.filter(i => i.status === 'in_review').length,
              },
              {
                id: 'completed',
                name: 'Completati',
                icon: '✅',
                count: workflowItems.filter(i => i.status === 'approved').length,
              },
              {
                id: 'rejected',
                name: 'Rifiutati',
                icon: '❌',
                count: workflowItems.filter(i => i.status === 'rejected').length,
              },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={getTypeColor(item.type) as any}>
                        {getTypeIcon(item.type)} {item.type.toUpperCase()}
                      </Badge>
                      <Badge variant={getPriorityColor(item.priority)}>
                        Priorità {item.priority}
                      </Badge>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-3">{item.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📝 {item.submittedBy}</span>
                      <span>📅 {item.submittedAt.toLocaleDateString()}</span>
                      <span>📍 Step: {item.currentStep}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Dettagli
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onViewDetails(item.id)}>
                      <MessageCircleIcon className="h-4 w-4 mr-1" />
                      Gestisci
                    </Button>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Workflow Steps</h4>
                  <div className="space-y-3">
                    {item.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStepStatusIcon(step.status)}</span>
                          <Badge
                            variant={getStepStatusColor(step.status) as any}
                            className="text-xs"
                          >
                            {step.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{step.name}</span>
                            <span className="text-sm text-gray-500">
                              ({step.requiredRole.replace('_', ' ')})
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>

                        {step.isCompleted && (
                          <div className="text-right text-sm text-gray-500">
                            <p>Completato da {step.completedBy}</p>
                            <p>{step.completedAt?.toLocaleDateString()}</p>
                          </div>
                        )}

                        {idx < item.steps.length - 1 && (
                          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Approvals */}
                {item.approvals.filter(a => a.status === 'pending').length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-3">Approvazioni in Attesa</h4>
                    <div className="space-y-3">
                      {item.approvals
                        .filter(a => a.status === 'pending')
                        .map(approval => (
                          <div key={approval.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">Richiesto da {approval.requestedBy}</p>
                                <p className="text-sm text-gray-600">
                                  Ruolo richiesto: {approval.requiredRole.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Richiesto il {approval.requestedAt.toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={getPriorityColor(approval.priority)}>
                                {approval.priority}
                              </Badge>
                            </div>

                            <div className="flex gap-2">
                              <textarea
                                placeholder="Commenti per l'approvazione..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                rows={2}
                                value={approvalComments}
                                onChange={e => setApprovalComments(e.target.value)}
                              />
                            </div>

                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(approval.id)}
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Approva
                              </Button>
                              <Button
                                variant="error"
                                size="sm"
                                onClick={() => handleReject(approval.id)}
                                disabled={!approvalComments.trim()}
                              >
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                Rifiuta
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <CheckCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Nessun elemento{' '}
                {activeTab === 'pending'
                  ? 'in attesa'
                  : activeTab === 'in_review'
                    ? 'in revisione'
                    : activeTab === 'completed'
                      ? 'completato'
                      : 'rifiutato'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'pending'
                  ? 'Tutti i workflow sono stati processati'
                  : activeTab === 'in_review'
                    ? 'Nessun elemento richiede revisione'
                    : activeTab === 'completed'
                      ? 'Nessun workflow completato'
                      : 'Nessun elemento rifiutato'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
