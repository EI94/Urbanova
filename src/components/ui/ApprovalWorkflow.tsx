'use client';

import {
  CheckCircle,
  Clock,
  User,
  Users,
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  Calendar,
  FileText,
  Send,
  XCircle,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Filter,
  Search,
  Play,
  Pause,
  Square,
  RotateCcw,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { useAuth } from '@/contexts/AuthContext';
import '@/lib/osProtection'; // OS Protection per approval workflow
import collaborationService, {
  ApprovalWorkflow as WorkflowType,
  ApprovalStep,
} from '@/lib/collaborationService';

interface ApprovalWorkflowProps {
  designId: string;
  onWorkflowCreate?: (workflow: WorkflowType) => void;
  onWorkflowUpdate?: (workflow: WorkflowType) => void;
  onWorkflowComplete?: (workflow: WorkflowType) => void;
}

interface WorkflowFormData {
  workflowName: string;
  steps: Omit<ApprovalStep, 'id' | 'stepNumber' | 'status'>[];
}

interface StepFormData {
  stepName: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  required: boolean;
  deadline?: string;
}

export default function ApprovalWorkflow({
  designId,
  onWorkflowCreate,
  onWorkflowUpdate,
  onWorkflowComplete,
}: ApprovalWorkflowProps) {
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [ApprovalWorkflow] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const user = (authContext && typeof authContext === 'object' && 'currentUser' in authContext) ? authContext.currentUser : null;
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [workflowForm, setWorkflowForm] = useState<WorkflowFormData>({
    workflowName: '',
    steps: [],
  });
  const [showStepForm, setShowStepForm] = useState(false);
  const [stepForm, setStepForm] = useState<StepFormData>({
    stepName: '',
    approverId: '',
    approverName: '',
    approverRole: '',
    required: true,
    deadline: '',
  });
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<WorkflowType['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!designId || !user) return;

    // For now, we'll use a mock workflow since the service doesn't have getWorkflowsRealtime yet
    // In a real implementation, you would subscribe to workflow updates
    loadMockWorkflows();
  }, [designId, user]);

  const loadMockWorkflows = () => {
    // Mock data for demonstration
    const mockWorkflows: WorkflowType[] = [
      {
        id: '1',
        designId,
        workflowName: 'Approvazione Design Finale',
        steps: [
          {
            id: '1-1',
            stepNumber: 1,
            stepName: 'Revisione Architettonica',
            approverId: 'arch1',
            approverName: 'Marco Rossi',
            approverRole: 'Architetto Senior',
            status: 'approved',
            required: true,
            completedAt: new Date(Date.now() - 86400000) as any, // 1 day ago
          },
          {
            id: '1-2',
            stepNumber: 2,
            stepName: 'Approvazione Cliente',
            approverId: 'client1',
            approverName: 'Giulia Bianchi',
            approverRole: 'Project Manager',
            status: 'pending',
            required: true,
            deadline: new Date(Date.now() + 172800000) as any, // 2 days from now
          },
          {
            id: '1-3',
            stepNumber: 3,
            stepName: 'Controllo Tecnico',
            approverId: 'tech1',
            approverName: 'Luca Verdi',
            approverRole: 'Ingegnere Strutturale',
            status: 'pending',
            required: true,
          },
        ],
        currentStep: 2,
        status: 'active',
        createdAt: new Date(Date.now() - 172800000) as any,
        updatedAt: new Date() as any,
        totalSteps: 3,
        completedSteps: 1,
      },
      {
        id: '2',
        designId,
        workflowName: 'Validazione Compliance',
        steps: [
          {
            id: '2-1',
            stepNumber: 1,
            stepName: 'Controllo Normative',
            approverId: 'legal1',
            approverName: 'Anna Neri',
            approverRole: 'Consulente Legale',
            status: 'approved',
            required: true,
            completedAt: new Date(Date.now() - 43200000) as any, // 12 hours ago
          },
          {
            id: '2-2',
            stepNumber: 2,
            stepName: 'Approvazione Comune',
            approverId: 'municipal1',
            approverName: 'Ufficio Tecnico',
            approverRole: 'Funzionario',
            status: 'pending',
            required: true,
            deadline: new Date(Date.now() + 259200000) as any, // 3 days from now
          },
        ],
        currentStep: 2,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000) as any,
        updatedAt: new Date() as any,
        totalSteps: 2,
        completedSteps: 1,
      },
    ];

    setWorkflows(mockWorkflows);
  };

  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !workflowForm.workflowName.trim() || workflowForm.steps.length === 0) return;

    setIsLoading(true);
    try {
      const workflowData = {
        designId,
        workflowName: workflowForm.workflowName.trim(),
        steps: workflowForm.steps.map((step, index) => ({
          ...step,
          id: `step-${Date.now()}-${index}`,
          stepNumber: index + 1,
          status: 'pending' as const,
        })),
      };

      // In a real implementation, you would call the service
      // const workflowId = await collaborationService.createWorkflow(workflowData);

      // For now, create a mock workflow
      const mockWorkflow: WorkflowType = {
        id: `workflow-${Date.now()}`,
        ...workflowData,
        currentStep: 1,
        status: 'active',
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        totalSteps: workflowData.steps.length,
        completedSteps: 0,
      };

      setWorkflows(prev => [mockWorkflow, ...prev]);

      // Reset form
      setWorkflowForm({
        workflowName: '',
        steps: [],
      });

      setShowWorkflowForm(false);
      toast('Workflow creato con successo', { icon: '✅' });

      if (onWorkflowCreate) {
        onWorkflowCreate(mockWorkflow);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast('Errore nella creazione del workflow', { icon: '❌' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepForm.stepName.trim() || !stepForm.approverName.trim()) return;

    const newStep: Omit<ApprovalStep, 'id' | 'stepNumber' | 'status'> = {
      stepName: stepForm.stepName.trim(),
      approverId: stepForm.approverId || `approver-${Date.now()}`,
      approverName: stepForm.approverName.trim(),
      approverRole: stepForm.approverRole.trim(),
      required: stepForm.required,
      deadline: stepForm.deadline ? (new Date(stepForm.deadline) as any) : undefined,
    };

    if (editingStepIndex !== null) {
      // Edit existing step
      setWorkflowForm(prev => ({
        ...prev,
        steps: prev.steps.map((step, index) => (index === editingStepIndex ? newStep : step)),
      }));
      setEditingStepIndex(null);
    } else {
      // Add new step
      setWorkflowForm(prev => ({
        ...prev,
        steps: [...prev.steps, newStep],
      }));
    }

    // Reset step form
    setStepForm({
      stepName: '',
      approverId: '',
      approverName: '',
      approverRole: '',
      required: true,
      deadline: '',
    });

    setShowStepForm(false);
  };

  const removeStep = (index: number) => {
    setWorkflowForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const editStep = (index: number) => {
    const step = workflowForm.steps[index];
    if (!step) return;
    
    setStepForm({
      stepName: step.stepName,
      approverId: step.approverId,
      approverName: step.approverName,
      approverRole: step.approverRole,
      required: step.required,
      deadline: step.deadline ? new Date(step.deadline.toMillis()).toISOString().split('T')[0] : '',
    } as any);
    setEditingStepIndex(index);
    setShowStepForm(true);
  };

  const handleStepApproval = async (
    workflowId: string,
    stepNumber: number,
    approved: boolean,
    comments?: string
  ) => {
    if (!user) return;

    try {
      // In a real implementation, you would call the service
      // await collaborationService.updateWorkflowStep(workflowId, stepNumber, {
      //   status: approved ? 'approved' : 'rejected',
      //   completedAt: new Date(),
      //   comments
      // });

      // For now, update the local state
      setWorkflows((prev: any) =>
        prev.map((workflow: any) => {
          if (workflow.id === workflowId) {
            const updatedSteps = workflow.steps.map((step: any) =>
              step.stepNumber === stepNumber
                ? {
                    ...step,
                    status: approved ? 'approved' : 'rejected',
                    completedAt: new Date() as any,
                    comments,
                  }
                : step
            );

            const completedSteps = updatedSteps.filter(
              (step: any) => step.status === 'approved' || step.status === 'skipped'
            ).length;

            const currentStep =
              completedSteps < workflow.totalSteps ? completedSteps + 1 : workflow.totalSteps;
            const status = completedSteps === workflow.totalSteps ? 'completed' : 'active';

            return {
              ...workflow,
              steps: updatedSteps,
              completedSteps,
              currentStep,
              status,
              updatedAt: new Date() as any,
              ...(status === 'completed' && { completedAt: new Date() as any }),
            };
          }
          return workflow;
        })
      );

      (toast as any).success(approved ? 'Step approvato' : 'Step rifiutato');

      if (onWorkflowUpdate) {
        const updatedWorkflow = workflows.find(w => w.id === workflowId);
        if (updatedWorkflow) {
          onWorkflowUpdate(updatedWorkflow);
        }
      }
    } catch (error) {
      console.error('Error updating workflow step:', error);
      (toast as any).error("Errore nell'aggiornamento dello step");
    }
  };

  const toggleWorkflowExpansion = (workflowId: string) => {
    setExpandedWorkflows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
      }
      return newSet;
    });
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filterStatus !== 'all' && workflow.status !== filterStatus) return false;
    if (searchTerm && !workflow.workflowName.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  const getStatusColor = (status: WorkflowType['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusColor = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status: ApprovalStep['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'skipped':
        return <Square className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const isStepOverdue = (step: ApprovalStep) => {
    if (!step.deadline || step.status !== 'pending') return false;
    return new Date() > step.deadline.toDate();
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Accedi per gestire i workflow di approvazione</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Workflow di Approvazione</h3>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{workflows.length} workflow</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Attivi',
              count: workflows.filter(w => w.status === 'active').length,
              color: 'bg-blue-100 text-blue-600',
            },
            {
              label: 'Completati',
              count: workflows.filter(w => w.status === 'completed').length,
              color: 'bg-green-100 text-green-600',
            },
            {
              label: 'In Attesa',
              count: workflows
                .filter(w => w.status === 'active')
                .reduce((acc, w) => acc + w.steps.filter(s => s.status === 'pending').length, 0),
              color: 'bg-yellow-100 text-yellow-600',
            },
            {
              label: 'Scaduti',
              count: workflows
                .filter(w => w.status === 'active')
                .reduce((acc, w) => acc + w.steps.filter(s => isStepOverdue(s)).length, 0),
              color: 'bg-red-100 text-red-600',
            },
          ].map(stat => (
            <div key={stat.label} className={`text-center p-3 rounded-lg ${stat.color}`}>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="completed">Completati</option>
              <option value="cancelled">Cancellati</option>
            </select>

            <input
              type="text"
              placeholder="Cerca workflow..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
            />
          </div>

          <button
            onClick={() => setShowWorkflowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Workflow
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {showWorkflowForm && (
          <div className="mb-6 bg-gray-50 p-6 rounded-lg border">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Crea Nuovo Workflow</h4>

            <form onSubmit={handleWorkflowSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Workflow *
                </label>
                <input
                  type="text"
                  value={workflowForm.workflowName}
                  onChange={e =>
                    setWorkflowForm(prev => ({ ...prev, workflowName: e.target.value }))
                  }
                  placeholder="es. Approvazione Design Finale"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Step di Approvazione *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStepForm(true)}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Aggiungi Step
                  </button>
                </div>

                {workflowForm.steps.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nessuno step configurato</p>
                    <p className="text-sm text-gray-500">
                      Aggiungi almeno uno step per creare il workflow
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workflowForm.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{step.stepName}</div>
                            <div className="text-sm text-gray-500">
                              {step.approverName} • {step.approverRole}
                              {step.required && <span className="ml-2 text-red-600">*</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => editStep(index)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowWorkflowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !workflowForm.workflowName.trim() ||
                    workflowForm.steps.length === 0
                  }
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creazione...' : 'Crea Workflow'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step Form Modal */}
        {showStepForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                {editingStepIndex !== null ? 'Modifica Step' : 'Aggiungi Step'}
              </h4>

              <form onSubmit={handleStepSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Step *
                  </label>
                  <input
                    type="text"
                    value={stepForm.stepName}
                    onChange={e => setStepForm(prev => ({ ...prev, stepName: e.target.value }))}
                    placeholder="es. Approvazione Cliente"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Approvatore *
                  </label>
                  <input
                    type="text"
                    value={stepForm.approverName}
                    onChange={e => setStepForm(prev => ({ ...prev, approverName: e.target.value }))}
                    placeholder="es. Marco Rossi"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruolo Approvatore
                  </label>
                  <input
                    type="text"
                    value={stepForm.approverRole}
                    onChange={e => setStepForm(prev => ({ ...prev, approverRole: e.target.value }))}
                    placeholder="es. Project Manager"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scadenza</label>
                    <input
                      type="date"
                      value={stepForm.deadline}
                      onChange={e => setStepForm(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={stepForm.required}
                      onChange={e => setStepForm(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="required" className="text-sm text-gray-700">
                      Obbligatorio
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStepForm(false);
                      setEditingStepIndex(null);
                      setStepForm({
                        stepName: '',
                        approverId: '',
                        approverName: '',
                        approverRole: '',
                        required: true,
                        deadline: '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingStepIndex !== null ? 'Aggiorna' : 'Aggiungi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Workflows List */}
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nessun workflow trovato</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkflows.map(workflow => (
              <div key={workflow.id} className="border rounded-lg overflow-hidden">
                {/* Workflow Header */}
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleWorkflowExpansion(workflow.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {expandedWorkflows.has(workflow.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                      </button>

                      <div>
                        <h5 className="font-medium text-gray-900">{workflow.workflowName}</h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}
                          >
                            {workflow.status}
                          </span>
                          <span>
                            Step {workflow.currentStep} di {workflow.totalSteps}
                          </span>
                          <span>{workflow.completedSteps} completati</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleWorkflowExpansion(workflow.id)}
                        className="p-2 text-gray-600 hover:text-gray-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progresso</span>
                      <span>
                        {Math.round((workflow.completedSteps / workflow.totalSteps) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(workflow.completedSteps / workflow.totalSteps) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Workflow Steps */}
                {expandedWorkflows.has(workflow.id) && (
                  <div className="p-4">
                    <div className="space-y-3">
                      {workflow.steps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`border rounded-lg p-3 ${
                            step.status === 'approved'
                              ? 'bg-green-50 border-green-200'
                              : step.status === 'rejected'
                                ? 'bg-red-50 border-red-200'
                                : isStepOverdue(step)
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  step.status === 'approved'
                                    ? 'bg-green-100'
                                    : step.status === 'rejected'
                                      ? 'bg-red-100'
                                      : isStepOverdue(step)
                                        ? 'bg-red-100'
                                        : 'bg-yellow-100'
                                }`}
                              >
                                {getStepStatusIcon(step.status)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{step.stepName}</div>
                                <div className="text-sm text-gray-500">
                                  {step.approverName} • {step.approverRole}
                                  {step.required && <span className="ml-1 text-red-600">*</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStepStatusColor(step.status)}`}
                              >
                                {step.status}
                              </span>

                              {step.deadline && (
                                <div
                                  className={`flex items-center space-x-1 text-xs ${
                                    isStepOverdue(step) ? 'text-red-600' : 'text-gray-500'
                                  }`}
                                >
                                  <Calendar className="w-3 h-3" />
                                  <span>{step.deadline.toDate().toLocaleDateString()}</span>
                                  {isStepOverdue(step) && <AlertCircle className="w-3 h-3" />}
                                </div>
                              )}
                            </div>
                          </div>

                          {step.status === 'pending' &&
                            workflow.currentStep === step.stepNumber && (
                              <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                                <button
                                  onClick={() =>
                                    handleStepApproval(workflow.id, step.stepNumber, true)
                                  }
                                  className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approva
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Motivo del rifiuto:');
                                    if (reason) {
                                      handleStepApproval(
                                        workflow.id,
                                        step.stepNumber,
                                        false,
                                        reason
                                      );
                                    }
                                  }}
                                  className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rifiuta
                                </button>
                              </div>
                            )}

                          {step.comments && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                              <strong>Commenti:</strong> {step.comments}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
